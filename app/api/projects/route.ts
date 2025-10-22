import { and, asc, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../db';
import { projects, projectTranslations } from '../../../db/schema';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = (searchParams.get('lang') || 'en').toLowerCase();
    const allLocales = ['1', 'true', 'yes'].includes((searchParams.get('allLocales') || '').toLowerCase());

    const baseRows = await db
      .select()
      .from(projects)
      .orderBy(asc(projects.sortOrder), asc(projects.createdAt));

    if (!allLocales && (lang === 'en' || baseRows.length === 0)) {
      return NextResponse.json(baseRows);
    }

  if (allLocales) {
      // Return base projects plus a translations map per project for all locales
      const allTr = await db
        .select()
        .from(projectTranslations);

      const byProjectId: Record<number, Record<string, any>> = {};
      for (const tr of allTr) {
        const pid = tr.projectId as number;
        if (!byProjectId[pid]) byProjectId[pid] = {};
        byProjectId[pid][tr.locale] = {
          title: tr.title ?? undefined,
          description: (tr as any).description ?? undefined,
        };
      }

      const enriched = baseRows.map((b) => ({
        ...b,
        translations: byProjectId[b.id] || {},
      }));

      return NextResponse.json(enriched);
    } else {
      // Single-locale merge (existing behavior)
      const translations = await db
        .select()
        .from(projectTranslations)
        .where(and(eq(projectTranslations.locale, lang)));

      const byProjectId = new Map<number, (typeof translations)[number]>();
      for (const tr of translations) byProjectId.set(tr.projectId, tr);

      const merged = baseRows.map((b) => {
        const tr = byProjectId.get(b.id);
        if (!tr) return b;
        return {
          ...b,
          title: tr.title ?? b.title,
          description: (tr as any).description ?? b.description,
        };
      });

      return NextResponse.json(merged);
    }
  } catch (error: any) {
    console.error('Projects GET error:', error);
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { project, translations } = body || {};

    if (!project || !project.title) {
      return NextResponse.json({ error: 'Missing project.title' }, { status: 400 });
    }

    const now = new Date();
    const payload = {
      title: String(project.title),
      description: project.description ? String(project.description) : null,
      tech: Array.isArray(project.tech) ? project.tech.map(String) : [],
      images: Array.isArray(project.images) ? project.images.map(String) : [],
      demoUrl: project.demoUrl ? String(project.demoUrl) : null,
      githubUrl: project.githubUrl ? String(project.githubUrl) : null,
      videoUrl: project.videoUrl ? String(project.videoUrl) : null,
      featured: Boolean(project.featured ?? false),
      sortOrder: project.sortOrder != null ? Number(project.sortOrder) : 0,
      createdAt: now,
      updatedAt: now,
    } as any;

    const inserted = await db.insert(projects).values(payload).returning();
    const created = inserted[0];

    if (!created) {
      return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
    }

    if (translations && typeof translations === 'object') {
      const trValues: any[] = [];
      for (const locale of Object.keys(translations)) {
        const tr = translations[locale] || {};
        trValues.push({
          projectId: created.id,
          locale: locale.toLowerCase(),
          title: tr.title ?? null,
          description: tr.description ?? null,
          createdAt: now,
          updatedAt: now,
        });
      }
      if (trValues.length > 0) {
        await db.insert(projectTranslations).values(trValues).onConflictDoNothing();
      }
    }

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    console.error('Projects POST error:', error);
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}
