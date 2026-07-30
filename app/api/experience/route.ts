import { asc, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../db';
import { experienceItemTranslations, experienceItems } from '../../../db/schema';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = (searchParams.get('lang') || 'en').toLowerCase();
    const allLocales = ['1', 'true', 'yes'].includes((searchParams.get('allLocales') || '').toLowerCase());

    const baseRows = await db
      .select()
      .from(experienceItems)
      .orderBy(asc(experienceItems.sortOrder), asc(experienceItems.createdAt));

    if (!allLocales && (lang === 'en' || baseRows.length === 0)) {
      return NextResponse.json(baseRows);
    }

    if (allLocales) {
      const allTr = await db.select().from(experienceItemTranslations);
      const byItemId: Record<number, Record<string, any>> = {};
      for (const tr of allTr) {
        const iid = tr.experienceItemId as number;
        if (!byItemId[iid]) byItemId[iid] = {};
        byItemId[iid][tr.locale] = {
          position: tr.position ?? undefined,
          company: tr.company ?? undefined,
          duration: tr.duration ?? undefined,
          location: tr.location ?? undefined,
          description: tr.description ?? undefined,
          achievements: tr.achievements ?? undefined,
          technologies: tr.technologies ?? undefined,
        };
      }
      const enriched = baseRows.map((b) => ({ ...b, translations: byItemId[b.id] || {} }));
      return NextResponse.json(enriched);
    } else {
      const translations = await db
        .select()
        .from(experienceItemTranslations)
        .where(eq(experienceItemTranslations.locale, lang));
      const byItemId = new Map<number, (typeof translations)[number]>();
      for (const tr of translations) byItemId.set(tr.experienceItemId, tr);
      const merged = baseRows.map((b) => {
        const tr = byItemId.get(b.id);
        if (!tr) return b;
        return {
          ...b,
          position: tr.position ?? b.position,
          company: tr.company ?? b.company,
          duration: tr.duration ?? b.duration,
          location: tr.location ?? b.location,
          description: tr.description ?? b.description,
          achievements: tr.achievements ?? b.achievements,
          technologies: tr.technologies ?? b.technologies,
        };
      });
      return NextResponse.json(merged);
    }
  } catch (error: any) {
    console.error('Experience GET error:', error);
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { item, translations } = body || {};

    if (!item || !item.position || !item.company) {
      return NextResponse.json({ error: 'Missing item.position or item.company' }, { status: 400 });
    }

    const now = new Date();
    const existing = await db.select({ sortOrder: experienceItems.sortOrder }).from(experienceItems);
    const maxSort = existing.reduce((max, r) => Math.max(max, r.sortOrder ?? 0), 0);

    const payload = {
      position: String(item.position),
      company: String(item.company),
      duration: item.duration ? String(item.duration) : null,
      location: item.location ? String(item.location) : null,
      description: item.description ? String(item.description) : null,
      achievements: Array.isArray(item.achievements) ? item.achievements.map(String) : [],
      technologies: Array.isArray(item.technologies) ? item.technologies.map(String) : [],
      sortOrder: item.sortOrder != null ? Number(item.sortOrder) : maxSort + 1,
      createdAt: now,
      updatedAt: now,
    } as any;

    const inserted = await db.insert(experienceItems).values(payload).returning();
    const created = inserted[0];
    if (!created) {
      return NextResponse.json({ error: 'Failed to create experience item' }, { status: 500 });
    }

    if (translations && typeof translations === 'object') {
      const trValues: any[] = [];
      for (const locale of Object.keys(translations)) {
        const tr = translations[locale] || {};
        trValues.push({
          experienceItemId: created.id,
          locale: locale.toLowerCase(),
          position: tr.position ?? null,
          company: tr.company ?? null,
          duration: tr.duration ?? null,
          location: tr.location ?? null,
          description: tr.description ?? null,
          achievements: Array.isArray(tr.achievements) ? tr.achievements : null,
          technologies: Array.isArray(tr.technologies) ? tr.technologies : null,
          createdAt: now,
          updatedAt: now,
        });
      }
      if (trValues.length > 0) {
        await db.insert(experienceItemTranslations).values(trValues).onConflictDoNothing();
      }
    }

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    console.error('Experience POST error:', error);
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}
