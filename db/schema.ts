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

// Generic key-value overrides for otherwise-hardcoded i18n content (About, Experience, Skills, WhatIBring, etc.)
// `key` mirrors the dot-path used by the i18n `t()` function relative to `section`, e.g. section="about", key="title".
export const siteContent = pgTable('site_content', {
  id: serial('id').primaryKey(),
  section: varchar('section', { length: 64 }).notNull(),
  key: varchar('key', { length: 255 }).notNull(),
  locale: varchar('locale', { length: 8 }).notNull().default('en'),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  siteContentSectionKeyLocaleUnique: uniqueIndex('site_content_section_key_locale_idx').on(t.section, t.key, t.locale),
}));

export type SiteContent = typeof siteContent.$inferSelect;

// Experience timeline items (structural CRUD: add/remove cards), with per-locale text overrides
export const experienceItems = pgTable('experience_items', {
  id: serial('id').primaryKey(),
  position: varchar('position', { length: 255 }).notNull(),
  company: varchar('company', { length: 255 }).notNull(),
  duration: varchar('duration', { length: 255 }),
  location: varchar('location', { length: 255 }),
  description: text('description'),
  achievements: text('achievements').array(),
  technologies: text('technologies').array(),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type ExperienceItem = typeof experienceItems.$inferSelect;
export type NewExperienceItem = typeof experienceItems.$inferInsert;

export const experienceItemTranslations = pgTable('experience_item_translations', {
  id: serial('id').primaryKey(),
  experienceItemId: integer('experience_item_id').notNull().references(() => experienceItems.id, { onDelete: 'cascade' }),
  locale: varchar('locale', { length: 8 }).notNull(),
  position: varchar('position', { length: 255 }),
  company: varchar('company', { length: 255 }),
  duration: varchar('duration', { length: 255 }),
  location: varchar('location', { length: 255 }),
  description: text('description'),
  achievements: text('achievements').array(),
  technologies: text('technologies').array(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  experienceItemLocaleUnique: uniqueIndex('experience_item_translations_item_locale_idx').on(t.experienceItemId, t.locale),
}));

export type ExperienceItemTranslation = typeof experienceItemTranslations.$inferSelect;
