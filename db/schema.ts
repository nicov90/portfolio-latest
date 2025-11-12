import { boolean, integer, pgTable, serial, text, timestamp, uniqueIndex, varchar } from 'drizzle-orm/pg-core';

export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  tech: text('tech').array(),
  images: text('images').array(),
  // Optional media prefix to dynamically fetch images/videos from Cloudinary
  mediaPrefix: varchar('media_prefix', { length: 255 }),
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

// Certificates
export const certificates = pgTable('certificates', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  subtitle: varchar('subtitle', { length: 255 }), // text shown under title: date, level, etc.
  description: text('description'),
  issuer: varchar('issuer', { length: 255 }),
  imageUrl: varchar('image_url', { length: 512 }),
  // Optional media prefix to fetch image dynamically from Cloudinary
  mediaPrefix: varchar('media_prefix', { length: 255 }),
  verifyUrl: varchar('verify_url', { length: 512 }),
  downloadUrl: varchar('download_url', { length: 512 }),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type Certificate = typeof certificates.$inferSelect;
export type NewCertificate = typeof certificates.$inferInsert;

// Certificate translations
export const certificateTranslations = pgTable('certificate_translations', {
  id: serial('id').primaryKey(),
  certificateId: integer('certificate_id').notNull().references(() => certificates.id, { onDelete: 'cascade' }),
  locale: varchar('locale', { length: 8 }).notNull(),
  title: varchar('title', { length: 255 }),
  subtitle: varchar('subtitle', { length: 255 }),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  certificateLocaleUnique: uniqueIndex('certificate_translations_certificate_locale_idx').on(t.certificateId, t.locale)
}));

export type CertificateTranslation = typeof certificateTranslations.$inferSelect;
