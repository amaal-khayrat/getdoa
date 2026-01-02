CREATE TABLE "user_profile" (
	"user_id" text PRIMARY KEY NOT NULL,
	"display_name" varchar(100),
	"bio" text,
	"profile_visibility" varchar(20) DEFAULT 'public' NOT NULL,
	"show_avatar" boolean DEFAULT true NOT NULL,
	"show_full_name" boolean DEFAULT true NOT NULL,
	"show_favorites" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "doa_list" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"show_translations" boolean DEFAULT true NOT NULL,
	"translation_layout" varchar(20) DEFAULT 'grouped' NOT NULL,
	"language" varchar(5) DEFAULT 'en' NOT NULL,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"visibility" varchar(20) DEFAULT 'private' NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"export_count" integer DEFAULT 0 NOT NULL,
	"favorite_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"published_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "doa_list_item" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"list_id" varchar(50) NOT NULL,
	"doa_slug" varchar(255) NOT NULL,
	"order" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "doa_list_item_list_doa_unique" UNIQUE("list_id","doa_slug")
);
--> statement-breakpoint
CREATE TABLE "export_log" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"list_id" varchar(50) NOT NULL,
	"user_id" text,
	"exported_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" varchar(50),
	"user_agent" varchar(500)
);
--> statement-breakpoint
CREATE TABLE "favorite_list" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"list_id" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "favorite_list_user_list_unique" UNIQUE("user_id","list_id")
);
--> statement-breakpoint
CREATE TABLE "saved_doa" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"doa_slug" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "saved_doa_user_slug_unique" UNIQUE("user_id","doa_slug")
);
--> statement-breakpoint
CREATE TABLE "doa" (
	"slug" varchar(255) PRIMARY KEY NOT NULL,
	"name_my" varchar(500) NOT NULL,
	"name_en" varchar(500) NOT NULL,
	"content" text NOT NULL,
	"reference_my" varchar(500),
	"reference_en" varchar(500),
	"meaning_my" text,
	"meaning_en" text,
	"category_names" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"description_my" text,
	"description_en" text,
	"context_my" text,
	"context_en" text,
	"content_hash" varchar(64) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "doa_image_generation" (
	"user_id" text PRIMARY KEY NOT NULL,
	"generations_today" integer DEFAULT 0 NOT NULL,
	"last_generated_at" timestamp with time zone,
	"total_generations" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referral" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"referrer_id" text NOT NULL,
	"referred_user_id" text NOT NULL,
	"code_used" varchar(20) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "referral_referred_user_id_unique" UNIQUE("referred_user_id"),
	CONSTRAINT "referral_referred_user_unique" UNIQUE("referred_user_id")
);
--> statement-breakpoint
CREATE TABLE "referral_code" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"code" varchar(20) NOT NULL,
	"leaderboard_visible" boolean DEFAULT true NOT NULL,
	"display_preference" varchar(20) DEFAULT 'censored' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "referral_code_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "referral_code_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "user_list_bonus" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"bonus_type" varchar(30) NOT NULL,
	"amount" integer NOT NULL,
	"source_id" varchar(100),
	"description" varchar(255),
	"expires_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doa_list" ADD CONSTRAINT "doa_list_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doa_list_item" ADD CONSTRAINT "doa_list_item_list_id_doa_list_id_fk" FOREIGN KEY ("list_id") REFERENCES "public"."doa_list"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doa_list_item" ADD CONSTRAINT "doa_list_item_doa_slug_doa_slug_fk" FOREIGN KEY ("doa_slug") REFERENCES "public"."doa"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "export_log" ADD CONSTRAINT "export_log_list_id_doa_list_id_fk" FOREIGN KEY ("list_id") REFERENCES "public"."doa_list"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "export_log" ADD CONSTRAINT "export_log_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorite_list" ADD CONSTRAINT "favorite_list_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorite_list" ADD CONSTRAINT "favorite_list_list_id_doa_list_id_fk" FOREIGN KEY ("list_id") REFERENCES "public"."doa_list"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_doa" ADD CONSTRAINT "saved_doa_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doa_image_generation" ADD CONSTRAINT "doa_image_generation_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral" ADD CONSTRAINT "referral_referrer_id_user_id_fk" FOREIGN KEY ("referrer_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral" ADD CONSTRAINT "referral_referred_user_id_user_id_fk" FOREIGN KEY ("referred_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_code" ADD CONSTRAINT "referral_code_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_list_bonus" ADD CONSTRAINT "user_list_bonus_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_profile_visibility_idx" ON "user_profile" USING btree ("profile_visibility");--> statement-breakpoint
CREATE INDEX "doa_list_user_id_idx" ON "doa_list" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "doa_list_status_idx" ON "doa_list" USING btree ("status");--> statement-breakpoint
CREATE INDEX "doa_list_visibility_idx" ON "doa_list" USING btree ("visibility");--> statement-breakpoint
CREATE INDEX "doa_list_created_at_idx" ON "doa_list" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "doa_list_public_published_idx" ON "doa_list" USING btree ("status","visibility","created_at");--> statement-breakpoint
CREATE INDEX "doa_list_item_list_id_idx" ON "doa_list_item" USING btree ("list_id");--> statement-breakpoint
CREATE INDEX "doa_list_item_doa_slug_idx" ON "doa_list_item" USING btree ("doa_slug");--> statement-breakpoint
CREATE INDEX "doa_list_item_order_idx" ON "doa_list_item" USING btree ("list_id","order");--> statement-breakpoint
CREATE INDEX "export_log_list_id_idx" ON "export_log" USING btree ("list_id");--> statement-breakpoint
CREATE INDEX "export_log_user_id_idx" ON "export_log" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "export_log_exported_at_idx" ON "export_log" USING btree ("exported_at");--> statement-breakpoint
CREATE INDEX "favorite_list_user_id_idx" ON "favorite_list" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "favorite_list_list_id_idx" ON "favorite_list" USING btree ("list_id");--> statement-breakpoint
CREATE INDEX "saved_doa_user_id_idx" ON "saved_doa" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "doa_name_my_idx" ON "doa" USING btree ("name_my");--> statement-breakpoint
CREATE INDEX "doa_name_en_idx" ON "doa" USING btree ("name_en");--> statement-breakpoint
CREATE INDEX "doa_category_names_idx" ON "doa" USING gin ("category_names");--> statement-breakpoint
CREATE INDEX "doa_content_hash_idx" ON "doa" USING btree ("content_hash");--> statement-breakpoint
CREATE INDEX "doa_image_gen_last_at_idx" ON "doa_image_generation" USING btree ("last_generated_at");--> statement-breakpoint
CREATE INDEX "referral_referrer_id_idx" ON "referral" USING btree ("referrer_id");--> statement-breakpoint
CREATE INDEX "referral_referred_user_id_idx" ON "referral" USING btree ("referred_user_id");--> statement-breakpoint
CREATE INDEX "referral_code_user_id_idx" ON "referral_code" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "referral_code_code_idx" ON "referral_code" USING btree ("code");--> statement-breakpoint
CREATE INDEX "user_list_bonus_user_id_idx" ON "user_list_bonus" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_list_bonus_type_idx" ON "user_list_bonus" USING btree ("bonus_type");--> statement-breakpoint
CREATE INDEX "user_list_bonus_active_idx" ON "user_list_bonus" USING btree ("user_id","is_active");--> statement-breakpoint
CREATE INDEX "user_list_bonus_expires_idx" ON "user_list_bonus" USING btree ("expires_at");