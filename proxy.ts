import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, verifySessionToken } from './lib/auth';

const PROTECTED_PREFIXES = ['/api/projects', '/api/certificates', '/api/experience', '/api/upload', '/api/site-content'];
const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtectedPath = PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (isProtectedPath && MUTATING_METHODS.has(request.method)) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const valid = await verifySessionToken(token);
    if (!valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/projects/:path*', '/api/certificates/:path*', '/api/experience/:path*', '/api/upload/:path*', '/api/site-content/:path*'],
};
