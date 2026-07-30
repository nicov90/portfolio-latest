import { and, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../db';
import { siteContent } from '../../../db/schema';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = (searchParams.get('locale') || 'en').toLowerCase();

    const rows = await db
      .select()
      .from(siteContent)
      .where(eq(siteContent.locale, locale));

    const map: Record<string, string> = {};
    for (const row of rows) {
      map[`${row.section}.${row.key}`] = row.value;
    }

    return NextResponse.json(map);
  } catch (error: any) {
    console.error('Site content GET error:', error);
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const section = typeof body?.section === 'string' ? body.section : '';
    const key = typeof body?.key === 'string' ? body.key : '';
    const locale = typeof body?.locale === 'string' ? body.locale.toLowerCase() : 'en';
    const value = typeof body?.value === 'string' ? body.value : '';

    if (!section || !key) {
      return NextResponse.json({ error: 'Missing section or key' }, { status: 400 });
    }

    const now = new Date();
    await db
      .insert(siteContent)
      .values({ section, key, locale, value, updatedAt: now })
      .onConflictDoUpdate({
        target: [siteContent.section, siteContent.key, siteContent.locale],
        set: { value, updatedAt: now },
      });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Site content PUT error:', error);
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section') || '';
    const key = searchParams.get('key') || '';
    const locale = (searchParams.get('locale') || 'en').toLowerCase();

    if (!section || !key) {
      return NextResponse.json({ error: 'Missing section or key' }, { status: 400 });
    }

    await db
      .delete(siteContent)
      .where(and(eq(siteContent.section, section), eq(siteContent.key, key), eq(siteContent.locale, locale)));

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Site content DELETE error:', error);
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}
