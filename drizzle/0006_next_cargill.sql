CREATE TABLE "site_content" (
	"id" serial PRIMARY KEY NOT NULL,
	"section" varchar(64) NOT NULL,
	"key" varchar(255) NOT NULL,
	"locale" varchar(8) DEFAULT 'en' NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "site_content_section_key_locale_idx" ON "site_content" USING btree ("section","key","locale");