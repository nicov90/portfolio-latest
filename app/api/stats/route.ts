import { and, gte, lte, sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../db';
import { pageVisits } from '../../../db/schema';
import { SESSION_COOKIE_NAME, verifySessionToken } from '../../../lib/auth';

// Visitor stats are sensitive (IP-derived data) and read-only elsewhere in the app is public, so
// this route checks the session itself rather than relying on middleware, which only guards
// mutating methods on other prefixes.
export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const isAdmin = await verifySessionToken(token);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');
    const from = fromParam ? new Date(fromParam) : null;
    const to = toParam ? new Date(toParam) : null;

    const conditions = [];
    if (from && !isNaN(from.getTime())) conditions.push(gte(pageVisits.createdAt, from));
    if (to && !isNaN(to.getTime())) conditions.push(lte(pageVisits.createdAt, to));
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const uniqueIpCount = sql<number>`count(distinct ${pageVisits.ip})`;
    // avg() ignores NULLs by default in Postgres, so visits that never reported a duration
    // (e.g. the tab was killed before any beacon fired) don't drag the average toward zero.
    const avgDuration = sql<number | null>`avg(${pageVisits.durationSeconds})`;

    const totalQuery = db.select({ count: uniqueIpCount, avgDuration }).from(pageVisits);
    const [totalRow] = whereClause ? await totalQuery.where(whereClause) : await totalQuery;

    const byCountryQuery = db
      .select({ country: pageVisits.country, count: uniqueIpCount, avgDuration })
      .from(pageVisits);
    const byCountryRows = whereClause
      ? await byCountryQuery.where(whereClause).groupBy(pageVisits.country).orderBy(sql`count(distinct ${pageVisits.ip}) desc`)
      : await byCountryQuery.groupBy(pageVisits.country).orderBy(sql`count(distinct ${pageVisits.ip}) desc`);

    const toAvgSeconds = (v: number | string | null | undefined) =>
      v === null || v === undefined ? null : Math.round(Number(v));

    return NextResponse.json({
      totalUniqueIps: Number(totalRow?.count ?? 0),
      avgDurationSeconds: toAvgSeconds(totalRow?.avgDuration),
      byCountry: byCountryRows.map((r) => ({
        country: r.country ?? 'unknown',
        uniqueIps: Number(r.count),
        avgDurationSeconds: toAvgSeconds(r.avgDuration),
      })),
      range: { from: fromParam, to: toParam },
    });
  } catch (error: any) {
    console.error('Stats GET error:', error);
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}
