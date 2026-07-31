import { and, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../db';
import { projects, projectTranslations } from '../../../../db/schema';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const projectId = Number(id);
    if (!Number.isFinite(projectId)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const [project] = await db.select().from(projects).where(eq(projects.id, projectId));
    if (!project) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const trRows = await db.select().from(projectTranslations).where(eq(projectTranslations.projectId, projectId));
    const translations: Record<string, any> = {};
    for (const tr of trRows) {
      translations[tr.locale] = { title: tr.title ?? undefined, description: (tr as any).description ?? undefined };
    }

    return NextResponse.json({ ...project, translations });
  } catch (error: any) {
    console.error('Project GET error:', error);
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const projectId = Number(id);
    if (!Number.isFinite(projectId)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const body = await request.json();
    const { project, translations } = body || {};
    if (!project) {
      return NextResponse.json({ error: 'Missing project' }, { status: 400 });
    }

    const now = new Date();
    const payload: any = { updatedAt: now };
    if (project.title !== undefined) payload.title = String(project.title);
    if (project.description !== undefined) payload.description = project.description ? String(project.description) : null;
    if (project.tech !== undefined) payload.tech = Array.isArray(project.tech) ? project.tech.map(String) : [];
    if (project.images !== undefined) payload.images = Array.isArray(project.images) ? project.images.map(String) : [];
    if (project.mediaPrefix !== undefined) payload.mediaPrefix = project.mediaPrefix ? String(project.mediaPrefix) : null;
    if (project.demoUrl !== undefined) payload.demoUrl = project.demoUrl ? String(project.demoUrl) : null;
    if (project.githubUrl !== undefined) payload.githubUrl = project.githubUrl ? String(project.githubUrl) : null;
    if (project.videoUrl !== undefined) payload.videoUrl = project.videoUrl ? String(project.videoUrl) : null;
    if (project.featured !== undefined) payload.featured = Boolean(project.featured);
    if (project.sortOrder !== undefined) payload.sortOrder = Number(project.sortOrder);

    const updated = await db.update(projects).set(payload).where(eq(projects.id, projectId)).returning();
    if (!updated[0]) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (translations && typeof translations === 'object') {
      for (const locale of Object.keys(translations)) {
        const tr = translations[locale] || {};
        const localeLower = locale.toLowerCase();
        // A PATCH is often partial — merge onto the existing row instead of blindly nulling
        // out fields the caller didn't mention (that previously wiped translated titles
        // whenever only a description update was sent).
        const [existing] = await db
          .select()
          .from(projectTranslations)
          .where(and(eq(projectTranslations.projectId, projectId), eq(projectTranslations.locale, localeLower)));

        const merged = {
          title: tr.title !== undefined ? (tr.title || null) : (existing?.title ?? null),
          description: tr.description !== undefined ? (tr.description || null) : (existing?.description ?? null),
        };

        await db
          .insert(projectTranslations)
          .values({
            projectId,
            locale: localeLower,
            ...merged,
            createdAt: now,
            updatedAt: now,
          })
          .onConflictDoUpdate({
            target: [projectTranslations.projectId, projectTranslations.locale],
            set: { ...merged, updatedAt: now },
          });
      }
    }

    return NextResponse.json(updated[0]);
  } catch (error: any) {
    console.error('Project PATCH error:', error);
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const projectId = Number(id);
    if (!Number.isFinite(projectId)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const deleted = await db.delete(projects).where(eq(projects.id, projectId)).returning();
    if (!deleted[0]) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Project DELETE error:', error);
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}
