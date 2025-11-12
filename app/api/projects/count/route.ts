import { NextResponse } from 'next/server';
import { db } from '../../../../db';
import { projects } from '../../../../db/schema';

export async function GET() {
  try {
    // Simpler and portable count without dialect-specific helpers
    const rows = await db.select({ id: projects.id }).from(projects);
    return NextResponse.json({ count: rows.length });
  } catch (error: any) {
    console.error('Projects COUNT error:', error);
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}
