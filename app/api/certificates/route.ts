import { and, asc, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../db';
import { certificates, certificateTranslations } from '../../../db/schema';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = (searchParams.get('lang') || 'en').toLowerCase();
    const allLocales = ['1', 'true', 'yes'].includes((searchParams.get('allLocales') || '').toLowerCase());

    const baseRows = await db
      .select()
      .from(certificates)
      .orderBy(asc(certificates.sortOrder), asc(certificates.createdAt));

    if (!allLocales && (lang === 'en' || baseRows.length === 0)) {
      return NextResponse.json(baseRows);
    }

    if (allLocales) {
      const allTr = await db
        .select()
        .from(certificateTranslations);

      const byCertId: Record<number, Record<string, any>> = {};
      for (const tr of allTr) {
        const cid = tr.certificateId as number;
        if (!byCertId[cid]) byCertId[cid] = {};
        byCertId[cid][tr.locale] = {
          title: tr.title ?? undefined,
          subtitle: (tr as any).subtitle ?? undefined,
          description: (tr as any).description ?? undefined,
        };
      }

      const enriched = baseRows.map((b) => ({
        ...b,
        translations: byCertId[b.id] || {},
      }));

      return NextResponse.json(enriched);
    } else {
      const translations = await db
        .select()
        .from(certificateTranslations)
        .where(and(eq(certificateTranslations.locale, lang)));

      const byCertId = new Map<number, (typeof translations)[number]>();
      for (const tr of translations) byCertId.set(tr.certificateId, tr);

      const merged = baseRows.map((b) => {
        const tr = byCertId.get(b.id);
        if (!tr) return b;
        return {
          ...b,
          title: tr.title ?? b.title,
          subtitle: (tr as any).subtitle ?? b.subtitle,
          description: (tr as any).description ?? b.description,
        };
      });

      return NextResponse.json(merged);
    }
  } catch (error: any) {
    console.error('Certificates GET error:', error);
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { certificate, translations } = body || {};

    if (!certificate || !certificate.title) {
      return NextResponse.json({ error: 'Missing certificate.title' }, { status: 400 });
    }

    const now = new Date();
    let sortOrder = certificate.sortOrder != null ? Number(certificate.sortOrder) : null;
    if (sortOrder === null) {
      const existing = await db.select({ sortOrder: certificates.sortOrder }).from(certificates);
      sortOrder = existing.reduce((max, r) => Math.max(max, r.sortOrder ?? 0), 0) + 1;
    }
    const payload = {
      title: String(certificate.title),
      subtitle: certificate.subtitle ? String(certificate.subtitle) : null,
      description: certificate.description ? String(certificate.description) : null,
      issuer: certificate.issuer ? String(certificate.issuer) : null,
      imageUrl: certificate.imageUrl ? String(certificate.imageUrl) : null,
      mediaPrefix: certificate.mediaPrefix ? String(certificate.mediaPrefix) : null,
      verifyUrl: certificate.verifyUrl ? String(certificate.verifyUrl) : null,
      downloadUrl: certificate.downloadUrl ? String(certificate.downloadUrl) : null,
      sortOrder,
      createdAt: now,
      updatedAt: now,
    } as any;

    const inserted = await db.insert(certificates).values(payload).returning();
    const created = inserted[0];

    if (!created) {
      return NextResponse.json({ error: 'Failed to create certificate' }, { status: 500 });
    }

    if (translations && typeof translations === 'object') {
      const trValues: any[] = [];
      for (const locale of Object.keys(translations)) {
        const tr = translations[locale] || {};
        trValues.push({
          certificateId: created.id,
          locale: locale.toLowerCase(),
          title: tr.title ?? null,
          subtitle: tr.subtitle ?? null,
          description: tr.description ?? null,
          createdAt: now,
          updatedAt: now,
        });
      }
      if (trValues.length > 0) {
        await db.insert(certificateTranslations).values(trValues).onConflictDoNothing();
      }
    }

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    console.error('Certificates POST error:', error);
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}
