import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../db';
import { pageVisits } from '../../../db/schema';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_DURATION_SECONDS = 24 * 60 * 60; // guard against a tab left open for days reporting garbage

// Called by real visitors' browsers (via sendBeacon) to report how long they stayed — no admin
// auth here, this is visitor-facing. `visitId` only exists for qualifying visits (see
// app/page.tsx), so there's nothing to abuse into recording localhost/admin traffic.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const visitId = typeof body?.visitId === 'string' ? body.visitId : '';
    const durationSeconds = Number(body?.durationSeconds);

    if (!UUID_RE.test(visitId)) {
      return NextResponse.json({ error: 'Invalid visitId' }, { status: 400 });
    }
    if (!Number.isFinite(durationSeconds) || durationSeconds < 0 || durationSeconds > MAX_DURATION_SECONDS) {
      return NextResponse.json({ error: 'Invalid durationSeconds' }, { status: 400 });
    }

    await db
      .update(pageVisits)
      .set({ durationSeconds: Math.round(durationSeconds) })
      .where(eq(pageVisits.visitId, visitId));

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Track-duration POST error:', error);
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}
