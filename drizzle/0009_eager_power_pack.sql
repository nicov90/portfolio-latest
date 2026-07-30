ALTER TABLE "page_visits" ADD COLUMN "visit_id" varchar(36);--> statement-breakpoint
ALTER TABLE "page_visits" ADD COLUMN "duration_seconds" integer;--> statement-breakpoint
CREATE INDEX "page_visits_visit_id_idx" ON "page_visits" USING btree ("visit_id");--> statement-breakpoint
ALTER TABLE "page_visits" ADD CONSTRAINT "page_visits_visit_id_unique" UNIQUE("visit_id");