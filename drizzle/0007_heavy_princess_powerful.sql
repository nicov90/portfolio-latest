CREATE TABLE "experience_item_translations" (
	"id" serial PRIMARY KEY NOT NULL,
	"experience_item_id" integer NOT NULL,
	"locale" varchar(8) NOT NULL,
	"position" varchar(255),
	"company" varchar(255),
	"duration" varchar(255),
	"location" varchar(255),
	"description" text,
	"achievements" text[],
	"technologies" text[],
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "experience_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"position" varchar(255) NOT NULL,
	"company" varchar(255) NOT NULL,
	"duration" varchar(255),
	"location" varchar(255),
	"description" text,
	"achievements" text[],
	"technologies" text[],
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "experience_item_translations" ADD CONSTRAINT "experience_item_translations_experience_item_id_experience_items_id_fk" FOREIGN KEY ("experience_item_id") REFERENCES "public"."experience_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "experience_item_translations_item_locale_idx" ON "experience_item_translations" USING btree ("experience_item_id","locale");