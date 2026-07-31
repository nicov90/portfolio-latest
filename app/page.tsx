import geoip from 'geoip-lite';
import { cookies, headers } from 'next/headers';
import { after } from 'next/server';
import { db } from '../db';
import { pageVisits } from '../db/schema';
import { SESSION_COOKIE_NAME, verifySessionToken } from '../lib/auth';
import AppClient from './AppClient';
import type { SupportedLang } from './hooks/usePreferredLanguage';

// Spanish-speaking Latin American countries (ISO 3166-1 alpha-2). Brazil is geographically part
// of Latin America but is Portuguese-speaking, which this portfolio doesn't localize for, so it's
// deliberately left out and falls through to English.
const LATAM_SPANISH_COUNTRIES = new Set([
  'AR', 'BO', 'CL', 'CO', 'CR', 'CU', 'DO', 'EC', 'SV', 'GT', 'HN', 'MX', 'NI', 'PA', 'PY', 'PE', 'PR', 'UY', 'VE',
]);

function resolveDefaultLanguage(countryCode: string | null): SupportedLang {
  if (!countryCode) return 'en';
  if (countryCode === 'JP') return 'ja';
  if (LATAM_SPANISH_COUNTRIES.has(countryCode)) return 'es';
  return 'en';
}

function getClientIp(h: Awaited<ReturnType<typeof headers>>): string | null {
  // The domain is proxied through Cloudflare in front of Vercel, so the connection Vercel/Next
  // actually sees is Cloudflare's own edge node, not the visitor — `x-forwarded-for`'s first entry
  // ends up being that edge IP rather than the real client. Cloudflare sets `cf-connecting-ip`
  // specifically to carry the true original IP through that hop, so it has to win when present.
  const cfIp = h.get('cf-connecting-ip');
  if (cfIp) return cfIp.trim();
  const forwardedFor = h.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  const realIp = h.get('x-real-ip');
  if (realIp) return realIp.trim();
  return null;
}

// Loopback only (127.0.0.1 / ::1 / IPv4-mapped variants) — this is specifically "me testing
// locally", not a general private-network filter, which could plausibly still be a real visitor
// behind some NAT setups.
function isLoopback(ip: string): boolean {
  return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1' || ip.startsWith('::ffff:127.');
}

// Search-engine crawlers, uptime/monitoring pings, scrapers, and generic HTTP-library user agents
// (curl, python-requests, etc.) — none of these are "someone found the site", and left unfiltered
// they inflate the visit count and, since a lot of them run from scattered datacenter IPs, make
// the country breakdown look far more global than the real audience. A missing/empty UA is
// treated as a bot too: real browsers always send one.
const BOT_USER_AGENT_PATTERN = /bot|crawl|spider|slurp|scrapy|headless|phantom|selenium|puppeteer|playwright|curl|wget|python-requests|python-urllib|go-http-client|node-fetch|axios|libwww|monitor|pingdom|uptime|statuscake|semrush|ahrefs|mj12|dotbot|petalbot|bytespider|ccbot|gptbot|claudebot|facebookexternalhit|whatsapp|telegrambot|discordbot|preview/i;

function isLikelyBot(userAgent: string | null): boolean {
  if (!userAgent) return true;
  return BOT_USER_AGENT_PATTERN.test(userAgent);
}

export default async function Page() {
  const h = await headers();
  const ip = getClientIp(h);

  // Cloudflare resolves geo from the *real* client IP it terminated the connection from, so it
  // wins over Vercel's own header — Vercel only ever sees Cloudflare's edge IP as the connecting
  // client (see getClientIp above), so `x-vercel-ip-country` ends up describing wherever that
  // Cloudflare edge node is, not the visitor. Fall back to a local lookup on other hosts (or
  // during local dev, where neither header is present).
  const vercelCountry = h.get('x-vercel-ip-country');
  const cfCountry = h.get('cf-ipcountry');
  const country = cfCountry || vercelCountry || geoip.lookup(ip ?? '')?.country || null;

  const defaultLanguage = resolveDefaultLanguage(country);

  console.log(`[geo] ip=${ip ?? 'unknown'} country=${country ?? 'unknown'} -> defaultLanguage=${defaultLanguage}`);

  // Visitor counting: real external visitors only. Excludes my own local testing (loopback), my
  // own logged-in admin sessions (that's traffic from me, not "people who found the site"), and
  // known bots/crawlers/scrapers.
  const cookieStore = await cookies();
  const isAdminSession = await verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  const userAgent = h.get('user-agent');
  const shouldRecordVisit =
    Boolean(ip) && !isLoopback(ip as string) && !isAdminSession && !isLikelyBot(userAgent);

  // Generated up front (not inside `after`) so it can be handed to the client for time-on-site
  // reporting even though the row itself is inserted after the response is sent.
  const visitId = shouldRecordVisit ? crypto.randomUUID() : null;

  if (shouldRecordVisit && visitId) {
    // Scheduled to run after the response is sent — recording a visit should never add latency
    // to an actual visitor's page load.
    after(async () => {
      try {
        await db.insert(pageVisits).values({ visitId, ip: ip as string, country });
      } catch (err) {
        console.error('[stats] failed to record visit:', err);
      }
    });
  }

  return <AppClient defaultLanguage={defaultLanguage} visitId={visitId} />;
}
