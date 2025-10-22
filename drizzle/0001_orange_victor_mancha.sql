CREATE TABLE "project_translations" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"locale" varchar(8) NOT NULL,
	"title" varchar(255),
	"description" text,
	"long_description" text,
	"tech" text[],
	"images" text[],
	"demo_url" varchar(512),
	"github_url" varchar(512),
	"video_url" varchar(512),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "project_translations" ADD CONSTRAINT "project_translations_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "project_translations_project_locale_idx" ON "project_translations" USING btree ("project_id","locale");