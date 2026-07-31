import { and, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../db';
import { certificateTranslations, certificates } from '../../../../db/schema';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const certificateId = Number(id);
    if (!Number.isFinite(certificateId)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const [certificate] = await db.select().from(certificates).where(eq(certificates.id, certificateId));
    if (!certificate) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const trRows = await db.select().from(certificateTranslations).where(eq(certificateTranslations.certificateId, certificateId));
    const translations: Record<string, any> = {};
    for (const tr of trRows) {
      translations[tr.locale] = {
        title: tr.title ?? undefined,
        subtitle: (tr as any).subtitle ?? undefined,
        description: (tr as any).description ?? undefined,
      };
    }

    return NextResponse.json({ ...certificate, translations });
  } catch (error: any) {
    console.error('Certificate GET error:', error);
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const certificateId = Number(id);
    if (!Number.isFinite(certificateId)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const body = await request.json();
    const { certificate, translations } = body || {};
    if (!certificate) {
      return NextResponse.json({ error: 'Missing certificate' }, { status: 400 });
    }

    const now = new Date();
    const payload: any = { updatedAt: now };
    if (certificate.title !== undefined) payload.title = String(certificate.title);
    if (certificate.subtitle !== undefined) payload.subtitle = certificate.subtitle ? String(certificate.subtitle) : null;
    if (certificate.description !== undefined) payload.description = certificate.description ? String(certificate.description) : null;
    if (certificate.issuer !== undefined) payload.issuer = certificate.issuer ? String(certificate.issuer) : null;
    if (certificate.imageUrl !== undefined) payload.imageUrl = certificate.imageUrl ? String(certificate.imageUrl) : null;
    if (certificate.mediaPrefix !== undefined) payload.mediaPrefix = certificate.mediaPrefix ? String(certificate.mediaPrefix) : null;
    if (certificate.verifyUrl !== undefined) payload.verifyUrl = certificate.verifyUrl ? String(certificate.verifyUrl) : null;
    if (certificate.downloadUrl !== undefined) payload.downloadUrl = certificate.downloadUrl ? String(certificate.downloadUrl) : null;
    if (certificate.sortOrder !== undefined) payload.sortOrder = Number(certificate.sortOrder);

    const updated = await db.update(certificates).set(payload).where(eq(certificates.id, certificateId)).returning();
    if (!updated[0]) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (translations && typeof translations === 'object') {
      for (const locale of Object.keys(translations)) {
        const tr = translations[locale] || {};
        const localeLower = locale.toLowerCase();
        // A PATCH is often partial (e.g. only `description`) — merge onto the existing row
        // instead of blindly nulling out fields the caller didn't mention.
        const [existing] = await db
          .select()
          .from(certificateTranslations)
          .where(and(eq(certificateTranslations.certificateId, certificateId), eq(certificateTranslations.locale, localeLower)));

        const merged = {
          title: tr.title !== undefined ? (tr.title || null) : (existing?.title ?? null),
          subtitle: tr.subtitle !== undefined ? (tr.subtitle || null) : (existing?.subtitle ?? null),
          description: tr.description !== undefined ? (tr.description || null) : (existing?.description ?? null),
        };

        await db
          .insert(certificateTranslations)
          .values({
            certificateId,
            locale: localeLower,
            ...merged,
            createdAt: now,
            updatedAt: now,
          })
          .onConflictDoUpdate({
            target: [certificateTranslations.certificateId, certificateTranslations.locale],
            set: { ...merged, updatedAt: now },
          });
      }
    }

    return NextResponse.json(updated[0]);
  } catch (error: any) {
    console.error('Certificate PATCH error:', error);
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const certificateId = Number(id);
    if (!Number.isFinite(certificateId)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const deleted = await db.delete(certificates).where(eq(certificates.id, certificateId)).returning();
    if (!deleted[0]) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Certificate DELETE error:', error);
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}
