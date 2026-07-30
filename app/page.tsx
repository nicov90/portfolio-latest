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

export default async function Page() {
  const h = await headers();
  const ip = getClientIp(h);

  // Vercel populates this at the edge automatically — prefer it when present since it's more
  // accurate than a bundled GeoIP database, and fall back to a local lookup on other hosts (or
  // during local dev, where it'll simply be unavailable).
  const vercelCountry = h.get('x-vercel-ip-country');
  const country = vercelCountry || geoip.lookup(ip ?? '')?.country || null;

  const defaultLanguage = resolveDefaultLanguage(country);

  console.log(`[geo] ip=${ip ?? 'unknown'} country=${country ?? 'unknown'} -> defaultLanguage=${defaultLanguage}`);

  // Visitor counting: real external visitors only. Excludes my own local testing (loopback) and
  // my own logged-in admin sessions (that's traffic from me, not "people who found the site").
  const cookieStore = await cookies();
  const isAdminSession = await verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  const shouldRecordVisit = Boolean(ip) && !isLoopback(ip as string) && !isAdminSession;

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
