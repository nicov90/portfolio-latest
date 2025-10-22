CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"long_description" text,
	"tech" text[],
	"images" text[],
	"demo_url" varchar(512),
	"github_url" varchar(512),
	"video_url" varchar(512),
	"featured" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
