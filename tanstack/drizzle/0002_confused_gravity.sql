CREATE TABLE "subscription_event" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"subscription_id" varchar(50) NOT NULL,
	"event" varchar(50) NOT NULL,
	"previous_status" varchar(20),
	"new_status" varchar(20),
	"razorpay_event_id" varchar(100),
	"razorpay_payment_id" varchar(100),
	"payload" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_subscription" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"razorpay_subscription_id" varchar(100) NOT NULL,
	"razorpay_customer_id" varchar(100),
	"razorpay_plan_id" varchar(100),
	"status" varchar(20) NOT NULL,
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"cancelled_at" timestamp,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"short_url" varchar(255),
	"razorpay_data" jsonb,
	"is_admin_granted" boolean DEFAULT false NOT NULL,
	"admin_granted_by" text,
	"admin_granted_at" timestamp,
	"admin_grant_note" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_subscription_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "user_subscription_razorpay_subscription_id_unique" UNIQUE("razorpay_subscription_id")
);
--> statement-breakpoint
ALTER TABLE "user_profile" ADD COLUMN "premium_arabic_font" varchar(20) DEFAULT 'simpo';--> statement-breakpoint
ALTER TABLE "user_profile" ADD COLUMN "premium_translation_font" varchar(20) DEFAULT 'roboto';--> statement-breakpoint
ALTER TABLE "user_profile" ADD COLUMN "premium_background_color" varchar(7) DEFAULT '#ffffff';--> statement-breakpoint
ALTER TABLE "user_profile" ADD COLUMN "premium_text_color" varchar(7) DEFAULT '#1a1a1a';--> statement-breakpoint
ALTER TABLE "user_profile" ADD COLUMN "premium_translation_color" varchar(7) DEFAULT '#666666';--> statement-breakpoint
ALTER TABLE "user_profile" ADD COLUMN "premium_custom_watermark" varchar(50);--> statement-breakpoint
ALTER TABLE "user_profile" ADD COLUMN "premium_hide_branding" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user_profile" ADD COLUMN "premium_preferred_pattern" varchar(30);--> statement-breakpoint
ALTER TABLE "subscription_event" ADD CONSTRAINT "subscription_event_subscription_id_user_subscription_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."user_subscription"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_subscription" ADD CONSTRAINT "user_subscription_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_subscription" ADD CONSTRAINT "user_subscription_admin_granted_by_user_id_fk" FOREIGN KEY ("admin_granted_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "subscription_event_subscription_id_idx" ON "subscription_event" USING btree ("subscription_id");--> statement-breakpoint
CREATE INDEX "subscription_event_created_at_idx" ON "subscription_event" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "user_subscription_user_id_idx" ON "user_subscription" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_subscription_status_idx" ON "user_subscription" USING btree ("status");--> statement-breakpoint
CREATE INDEX "user_subscription_razorpay_id_idx" ON "user_subscription" USING btree ("razorpay_subscription_id");--> statement-breakpoint
CREATE INDEX "user_subscription_admin_granted_idx" ON "user_subscription" USING btree ("is_admin_granted");