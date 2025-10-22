import { boolean, integer, pgTable, serial, text, timestamp, uniqueIndex, varchar } from 'drizzle-orm/pg-core';

export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  tech: text('tech').array(),
  images: text('images').array(),
  demoUrl: varchar('demo_url', { length: 512 }),
  githubUrl: varchar('github_url', { length: 512 }),
  videoUrl: varchar('video_url', { length: 512 }),
  featured: boolean('featured').notNull().default(false),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export const projectTranslations = pgTable('project_translations', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  locale: varchar('locale', { length: 8 }).notNull(),
  title: varchar('title', { length: 255 }),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  projectLocaleUnique: uniqueIndex('project_translations_project_locale_idx').on(t.projectId, t.locale)
}));

export type ProjectTranslation = typeof projectTranslations.$inferSelect;
