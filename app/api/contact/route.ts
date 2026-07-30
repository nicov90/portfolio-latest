import { NextRequest, NextResponse } from 'next/server';
import { BrevoService } from '../../../lib/brevoService';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_LENGTHS = { name: 100, email: 254, subject: 150, message: 5000 } as const;

// In-memory per-IP limiter: resets whenever this serverless instance recycles, so it won't stop a
// distributed flood, but it does stop the common case (one script/bot hammering the endpoint from
// a single warm instance) without pulling in an external store just for a low-traffic contact form.
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const requestLog = new Map<string, number[]>();

function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return 'unknown';
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (requestLog.get(ip) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  timestamps.push(now);
  requestLog.set(ip, timestamps);
  return timestamps.length > RATE_LIMIT_MAX_REQUESTS;
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    if (isRateLimited(ip)) {
      return NextResponse.json({ success: false, error: 'Too many requests, please try again later' }, { status: 429 });
    }

    const body = await req.json();
    const { name, email, subject, message, website } = body || {};

    // Honeypot: a real visitor never sees or fills this field (kept off-screen in the form), so
    // any request with it filled in is a bot blindly populating every input it finds.
    if (typeof website === 'string' && website.trim() !== '') {
      return NextResponse.json({ success: true });
    }

    if (
      typeof name !== 'string' || typeof email !== 'string' ||
      typeof subject !== 'string' || typeof message !== 'string' ||
      !name.trim() || !email.trim() || !subject.trim() || !message.trim()
    ) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json({ success: false, error: 'Invalid email address' }, { status: 400 });
    }

    if (
      name.length > MAX_LENGTHS.name || email.length > MAX_LENGTHS.email ||
      subject.length > MAX_LENGTHS.subject || message.length > MAX_LENGTHS.message
    ) {
      return NextResponse.json({ success: false, error: 'One or more fields exceed the maximum length' }, { status: 400 });
    }

    await BrevoService.sendContactEmail({
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Contact API error:', error);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
