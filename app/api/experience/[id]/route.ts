import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../db';
import { experienceItemTranslations, experienceItems } from '../../../../db/schema';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const itemId = Number(id);
    if (!Number.isFinite(itemId)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const [item] = await db.select().from(experienceItems).where(eq(experienceItems.id, itemId));
    if (!item) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const trRows = await db.select().from(experienceItemTranslations).where(eq(experienceItemTranslations.experienceItemId, itemId));
    const translations: Record<string, any> = {};
    for (const tr of trRows) {
      translations[tr.locale] = {
        position: tr.position ?? undefined,
        company: tr.company ?? undefined,
        duration: tr.duration ?? undefined,
        location: tr.location ?? undefined,
        description: tr.description ?? undefined,
        achievements: tr.achievements ?? undefined,
        technologies: tr.technologies ?? undefined,
      };
    }

    return NextResponse.json({ ...item, translations });
  } catch (error: any) {
    console.error('Experience item GET error:', error);
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const itemId = Number(id);
    if (!Number.isFinite(itemId)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const body = await request.json();
    const { item, translations } = body || {};
    const now = new Date();

    if (item && typeof item === 'object') {
      const payload: any = { updatedAt: now };
      if (item.position !== undefined) payload.position = String(item.position);
      if (item.company !== undefined) payload.company = String(item.company);
      if (item.duration !== undefined) payload.duration = item.duration ? String(item.duration) : null;
      if (item.location !== undefined) payload.location = item.location ? String(item.location) : null;
      if (item.description !== undefined) payload.description = item.description ? String(item.description) : null;
      if (item.achievements !== undefined) payload.achievements = Array.isArray(item.achievements) ? item.achievements.map(String) : [];
      if (item.technologies !== undefined) payload.technologies = Array.isArray(item.technologies) ? item.technologies.map(String) : [];
      if (item.sortOrder !== undefined) payload.sortOrder = Number(item.sortOrder);

      const updated = await db.update(experienceItems).set(payload).where(eq(experienceItems.id, itemId)).returning();
      if (!updated[0]) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
    }

    if (translations && typeof translations === 'object') {
      for (const locale of Object.keys(translations)) {
        const tr = translations[locale] || {};
        const set: any = { updatedAt: now };
        if (tr.position !== undefined) set.position = tr.position;
        if (tr.company !== undefined) set.company = tr.company;
        if (tr.duration !== undefined) set.duration = tr.duration;
        if (tr.location !== undefined) set.location = tr.location;
        if (tr.description !== undefined) set.description = tr.description;
        if (tr.achievements !== undefined) set.achievements = tr.achievements;
        if (tr.technologies !== undefined) set.technologies = tr.technologies;

        await db
          .insert(experienceItemTranslations)
          .values({
            experienceItemId: itemId,
            locale: locale.toLowerCase(),
            position: tr.position ?? null,
            company: tr.company ?? null,
            duration: tr.duration ?? null,
            location: tr.location ?? null,
            description: tr.description ?? null,
            achievements: tr.achievements ?? null,
            technologies: tr.technologies ?? null,
            createdAt: now,
            updatedAt: now,
          })
          .onConflictDoUpdate({
            target: [experienceItemTranslations.experienceItemId, experienceItemTranslations.locale],
            set,
          });
      }
    }

    const [result] = await db.select().from(experienceItems).where(eq(experienceItems.id, itemId));
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Experience item PATCH error:', error);
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const itemId = Number(id);
    if (!Number.isFinite(itemId)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const all = await db.select({ id: experienceItems.id }).from(experienceItems);
    if (all.length <= 1) {
      return NextResponse.json({ error: 'No se puede eliminar la última experiencia' }, { status: 400 });
    }

    const deleted = await db.delete(experienceItems).where(eq(experienceItems.id, itemId)).returning();
    if (!deleted[0]) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Experience item DELETE error:', error);
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}
