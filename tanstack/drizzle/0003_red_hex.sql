CREATE TABLE "doa_hadith_match" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"doa_slug" varchar(255) NOT NULL,
	"sort_order" integer NOT NULL,
	"matched_reference" varchar(255),
	"book" varchar(255),
	"chapter_number" integer,
	"chapter_title_arabic" text,
	"chapter_title_english" text,
	"arabic_text" text,
	"english_text" text,
	"grade" varchar(255),
	"reference_url" text,
	"in_book_reference" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "doa_hadith_match_slug_sort_order_unique" UNIQUE("doa_slug","sort_order")
);
--> statement-breakpoint
ALTER TABLE "doa_hadith_match" ADD CONSTRAINT "doa_hadith_match_doa_slug_doa_slug_fk" FOREIGN KEY ("doa_slug") REFERENCES "public"."doa"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "doa_hadith_match_doa_slug_idx" ON "doa_hadith_match" USING btree ("doa_slug");--> statement-breakpoint
CREATE INDEX "doa_hadith_match_sort_order_idx" ON "doa_hadith_match" USING btree ("doa_slug","sort_order");