CREATE TABLE "certificate_translations" (
	"id" serial PRIMARY KEY NOT NULL,
	"certificate_id" integer NOT NULL,
	"locale" varchar(8) NOT NULL,
	"title" varchar(255),
	"subtitle" varchar(255),
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "certificate_translations" ADD CONSTRAINT "certificate_translations_certificate_id_certificates_id_fk" FOREIGN KEY ("certificate_id") REFERENCES "public"."certificates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "certificate_translations_certificate_locale_idx" ON "certificate_translations" USING btree ("certificate_id","locale");