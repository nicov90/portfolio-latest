/*
  Sync projects from i18n translations into Neon DB using Drizzle.
  - Creates the projects table if it doesn't exist
  - Upserts by title (create if missing, update if exists)
*/
import { neon } from '@neondatabase/serverless';
import 'dotenv/config';
import { eq } from 'drizzle-orm';
import enTranslations from '../app/locales/en/common.json';
import { db } from '../db';
import { projects } from '../db/schema';

type SeedProject = {
  title: string;
  description?: string | null;
  tech?: string[] | null;
  images?: string[] | null;
  demoUrl?: string | null;
  githubUrl?: string | null;
  videoUrl?: string | null;
  featured?: boolean;
  sortOrder?: number;
};

async function ensureTable() {
  const sql = neon(process.env.DATABASE_URL!);
  // Create table if not exists with matching schema
  await sql`
    CREATE TABLE IF NOT EXISTS projects (
      id serial PRIMARY KEY,
      title varchar(255) NOT NULL,
      description text,
      tech text[] DEFAULT NULL,
      images text[] DEFAULT NULL,
      demo_url varchar(512),
      github_url varchar(512),
      video_url varchar(512),
      featured boolean NOT NULL DEFAULT false,
      sort_order integer DEFAULT 0,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
  `;
}

function getSeedFromTranslations(): SeedProject[] {
  const items = (enTranslations as any)?.projects?.items as any[] | undefined;
  if (!Array.isArray(items)) return [];
  return items.map((p, idx) => ({
    title: p?.title ?? `Project ${idx + 1}`,
    description: p?.description ?? null,
    tech: [],
    images: [],
    demoUrl: null,
    githubUrl: null,
    videoUrl: null,
    featured: false,
    sortOrder: idx,
  }));
}

async function upsertProjects(seed: SeedProject[]) {
  for (const sp of seed) {
    const existing = await db.select().from(projects).where(eq(projects.title, sp.title)).limit(1);
    if (existing.length > 0) {
      await db
        .update(projects)
        .set({
          description: sp.description ?? null,
          tech: sp.tech ?? null,
          images: sp.images ?? null,
          demoUrl: sp.demoUrl ?? null,
          githubUrl: sp.githubUrl ?? null,
          videoUrl: sp.videoUrl ?? null,
          featured: Boolean(sp.featured),
          sortOrder: sp.sortOrder ?? 0,
          updatedAt: new Date(),
        })
        .where(eq(projects.title, sp.title));
      console.log(`Updated: ${sp.title}`);
    } else {
      await db.insert(projects).values({
        title: sp.title,
        description: sp.description ?? null,
        tech: sp.tech ?? null,
        images: sp.images ?? null,
        demoUrl: sp.demoUrl ?? null,
        githubUrl: sp.githubUrl ?? null,
        videoUrl: sp.videoUrl ?? null,
        featured: Boolean(sp.featured),
        sortOrder: sp.sortOrder ?? 0,
      });
      console.log(`Inserted: ${sp.title}`);
    }
  }
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not defined');
  await ensureTable();
  const seed = getSeedFromTranslations();
  if (seed.length === 0) {
    console.warn('No seed projects found from translations. Nothing to sync.');
    return;
  }
  await upsertProjects(seed);
  console.log('Projects sync completed.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
