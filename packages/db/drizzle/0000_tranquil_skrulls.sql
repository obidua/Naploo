CREATE TYPE "public"."booking_status" AS ENUM('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show');--> statement-breakpoint
CREATE TYPE "public"."booking_type" AS ENUM('hourly', 'daily');--> statement-breakpoint
CREATE TYPE "public"."delivery_option" AS ENUM('doorstep', 'leaseback');--> statement-breakpoint
CREATE TYPE "public"."investment_status" AS ENUM('pending', 'active', 'completed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."investor_status" AS ENUM('pending', 'kyc_pending', 'approved', 'active', 'suspended', 'blocked');--> statement-breakpoint
CREATE TYPE "public"."kyc_status" AS ENUM('not_submitted', 'pending', 'verified', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."partner_status" AS ENUM('pending', 'approved', 'active', 'suspended', 'terminated');--> statement-breakpoint
CREATE TYPE "public"."partner_type" AS ENUM('hotel', 'homestay');--> statement-breakpoint
CREATE TYPE "public"."partnership_model" AS ENUM('without_investment', 'with_investment');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('razorpay', 'upi', 'card', 'netbanking', 'wallet', 'cash');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded');--> statement-breakpoint
CREATE TYPE "public"."payout_status" AS ENUM('pending', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."pod_ownership" AS ENUM('naploo', 'investor', 'partner');--> statement-breakpoint
CREATE TYPE "public"."pod_status" AS ENUM('available', 'occupied', 'maintenance', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."pod_type" AS ENUM('single', 'double');--> statement-breakpoint
CREATE TYPE "public"."referral_type" AS ENUM('hotel', 'homestay', 'space', 'investor', 'customer', 'associate');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('customer', 'investor', 'partner', 'associate', 'admin', 'super_admin');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('pending', 'active', 'suspended', 'blocked');--> statement-breakpoint
CREATE TABLE "associates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"parent_id" uuid,
	"level1_id" uuid,
	"level2_id" uuid,
	"level3_id" uuid,
	"level4_id" uuid,
	"level5_id" uuid,
	"total_referrals" integer DEFAULT 0,
	"total_earnings" numeric(15, 2) DEFAULT '0',
	"pending_payout" numeric(15, 2) DEFAULT '0',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "associates_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_number" varchar(20) NOT NULL,
	"user_id" uuid NOT NULL,
	"pod_id" uuid NOT NULL,
	"booking_type" "booking_type" DEFAULT 'hourly' NOT NULL,
	"check_in" timestamp NOT NULL,
	"check_out" timestamp NOT NULL,
	"actual_check_in" timestamp,
	"actual_check_out" timestamp,
	"hours" integer NOT NULL,
	"hourly_rate" numeric(10, 2) NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"discount" numeric(10, 2) DEFAULT '0',
	"gst" numeric(10, 2) NOT NULL,
	"total" numeric(10, 2) NOT NULL,
	"owner_share" numeric(10, 2) NOT NULL,
	"naploo_share" numeric(10, 2) NOT NULL,
	"partner_commission" numeric(10, 2) DEFAULT '0',
	"coupon_code" varchar(20),
	"coupon_discount" numeric(10, 2) DEFAULT '0',
	"status" "booking_status" DEFAULT 'pending' NOT NULL,
	"cancelled_at" timestamp,
	"cancel_reason" text,
	"special_requests" text,
	"admin_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "bookings_booking_number_unique" UNIQUE("booking_number")
);
--> statement-breakpoint
CREATE TABLE "commission_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"referral_type" "referral_type" NOT NULL,
	"level1_percent" numeric(5, 2) NOT NULL,
	"level2_percent" numeric(5, 2) NOT NULL,
	"level3_percent" numeric(5, 2) NOT NULL,
	"level4_percent" numeric(5, 2) NOT NULL,
	"level5_percent" numeric(5, 2) NOT NULL,
	"one_time_bonus" numeric(10, 2) DEFAULT '0',
	"is_active" boolean DEFAULT true,
	"updated_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "investment_earnings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"investment_id" uuid NOT NULL,
	"booking_id" uuid NOT NULL,
	"booking_amount" numeric(10, 2) NOT NULL,
	"investor_share" numeric(10, 2) NOT NULL,
	"cumulative_earnings" numeric(15, 2) NOT NULL,
	"is_paid_out" boolean DEFAULT false,
	"paid_out_at" timestamp,
	"payout_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "investments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"investor_id" uuid NOT NULL,
	"pod_set_id" uuid,
	"invoice_number" varchar(50) NOT NULL,
	"pod_set_count" integer DEFAULT 1 NOT NULL,
	"price_per_set" numeric(10, 2) DEFAULT '500000' NOT NULL,
	"gst_amount" numeric(10, 2) NOT NULL,
	"total_amount" numeric(15, 2) NOT NULL,
	"delivery_option" "delivery_option" DEFAULT 'leaseback' NOT NULL,
	"guarantee_amount" numeric(15, 2) NOT NULL,
	"earned_so_far" numeric(15, 2) DEFAULT '0',
	"guarantee_reached" boolean DEFAULT false,
	"guarantee_reached_at" timestamp,
	"status" "investment_status" DEFAULT 'pending' NOT NULL,
	"contract_start_date" timestamp,
	"contract_end_date" timestamp,
	"scrap_policy_applied" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "investments_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "investors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"status" "investor_status" DEFAULT 'pending' NOT NULL,
	"approved_at" timestamp,
	"approved_by" uuid,
	"total_invested" numeric(15, 2) DEFAULT '0',
	"total_earned" numeric(15, 2) DEFAULT '0',
	"total_pod_sets" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "investors_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "otps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phone" varchar(20) NOT NULL,
	"otp" varchar(6) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"business_name" varchar(255) NOT NULL,
	"business_type" "partner_type" NOT NULL,
	"partnership_model" "partnership_model" NOT NULL,
	"gst_number" varchar(15),
	"pan_number" varchar(10),
	"address" text NOT NULL,
	"city" varchar(100) NOT NULL,
	"state" varchar(100) NOT NULL,
	"pincode" varchar(10) NOT NULL,
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"contact_person" varchar(100),
	"contact_phone" varchar(20),
	"contact_email" varchar(255),
	"commission_percent" numeric(5, 2) DEFAULT '10',
	"agreement_start_date" timestamp,
	"agreement_end_date" timestamp,
	"agreement_document" text,
	"status" "partner_status" DEFAULT 'pending' NOT NULL,
	"verified_at" timestamp,
	"verified_by" uuid,
	"description" text,
	"amenities" text,
	"images" text,
	"rating" numeric(2, 1) DEFAULT '0',
	"total_reviews" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"booking_id" uuid,
	"amount" numeric(15, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'INR' NOT NULL,
	"razorpay_order_id" varchar(100),
	"razorpay_payment_id" varchar(100),
	"razorpay_signature" text,
	"payment_method" "payment_method",
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"failure_reason" text,
	"refunded_amount" numeric(15, 2) DEFAULT '0',
	"refund_reason" text,
	"refunded_at" timestamp,
	"metadata" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"payout_type" varchar(50) NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"tds_deducted" numeric(10, 2) DEFAULT '0',
	"net_amount" numeric(15, 2) NOT NULL,
	"bank_account_number" varchar(20),
	"bank_ifsc" varchar(11),
	"bank_name" varchar(100),
	"transfer_id" varchar(100),
	"transfer_mode" varchar(50),
	"status" "payout_status" DEFAULT 'pending' NOT NULL,
	"processed_at" timestamp,
	"failure_reason" text,
	"period_start" timestamp,
	"period_end" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pod_sets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"partner_id" uuid NOT NULL,
	"owner_id" uuid,
	"ownership" "pod_ownership" DEFAULT 'naploo' NOT NULL,
	"floor" integer DEFAULT 1,
	"section" varchar(50),
	"set_number" varchar(20) NOT NULL,
	"hourly_rate" numeric(10, 2) DEFAULT '150' NOT NULL,
	"is_active" boolean DEFAULT true,
	"installed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pod_set_id" uuid NOT NULL,
	"pod_number" varchar(20) NOT NULL,
	"position" varchar(10) NOT NULL,
	"pod_type" "pod_type" DEFAULT 'single' NOT NULL,
	"status" "pod_status" DEFAULT 'available' NOT NULL,
	"has_ac" boolean DEFAULT true,
	"has_tv" boolean DEFAULT true,
	"has_charger" boolean DEFAULT true,
	"has_light" boolean DEFAULT true,
	"has_ventilation" boolean DEFAULT true,
	"last_maintenance_at" timestamp,
	"next_maintenance_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referral_earnings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"referral_id" uuid NOT NULL,
	"associate_id" uuid NOT NULL,
	"source_type" varchar(50) NOT NULL,
	"source_id" uuid NOT NULL,
	"source_amount" numeric(15, 2) NOT NULL,
	"level" integer NOT NULL,
	"commission_percent" numeric(5, 2) NOT NULL,
	"earned_amount" numeric(10, 2) NOT NULL,
	"is_paid_out" boolean DEFAULT false,
	"paid_out_at" timestamp,
	"payout_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referrals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"associate_id" uuid NOT NULL,
	"referral_type" "referral_type" NOT NULL,
	"referred_user_id" uuid,
	"referred_partner_id" uuid,
	"level" integer NOT NULL,
	"commission_percent" numeric(5, 2) NOT NULL,
	"total_earned" numeric(15, 2) DEFAULT '0',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255),
	"phone" varchar(20) NOT NULL,
	"password_hash" text,
	"first_name" varchar(100),
	"last_name" varchar(100),
	"avatar" text,
	"role" "user_role" DEFAULT 'customer' NOT NULL,
	"status" "user_status" DEFAULT 'pending' NOT NULL,
	"kyc_status" "kyc_status" DEFAULT 'not_submitted' NOT NULL,
	"pan_number" varchar(10),
	"aadhar_number" varchar(12),
	"bank_account_number" varchar(20),
	"bank_ifsc" varchar(11),
	"bank_name" varchar(100),
	"address" text,
	"city" varchar(100),
	"state" varchar(100),
	"pincode" varchar(10),
	"referral_code" varchar(20),
	"referred_by" uuid,
	"google_id" varchar(255),
	"email_verified" boolean DEFAULT false,
	"phone_verified" boolean DEFAULT false,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_phone_unique" UNIQUE("phone"),
	CONSTRAINT "users_referral_code_unique" UNIQUE("referral_code")
);
--> statement-breakpoint
CREATE TABLE "wallet_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wallet_id" uuid NOT NULL,
	"type" varchar(20) NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"balance_after" numeric(15, 2) NOT NULL,
	"reference_type" varchar(50),
	"reference_id" uuid,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wallets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"balance" numeric(15, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "wallets_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "associates" ADD CONSTRAINT "associates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_pod_id_pods_id_fk" FOREIGN KEY ("pod_id") REFERENCES "public"."pods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commission_config" ADD CONSTRAINT "commission_config_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investment_earnings" ADD CONSTRAINT "investment_earnings_investment_id_investments_id_fk" FOREIGN KEY ("investment_id") REFERENCES "public"."investments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investments" ADD CONSTRAINT "investments_investor_id_investors_id_fk" FOREIGN KEY ("investor_id") REFERENCES "public"."investors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investments" ADD CONSTRAINT "investments_pod_set_id_pod_sets_id_fk" FOREIGN KEY ("pod_set_id") REFERENCES "public"."pod_sets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investors" ADD CONSTRAINT "investors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investors" ADD CONSTRAINT "investors_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partners" ADD CONSTRAINT "partners_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partners" ADD CONSTRAINT "partners_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pod_sets" ADD CONSTRAINT "pod_sets_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pod_sets" ADD CONSTRAINT "pod_sets_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pods" ADD CONSTRAINT "pods_pod_set_id_pod_sets_id_fk" FOREIGN KEY ("pod_set_id") REFERENCES "public"."pod_sets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_earnings" ADD CONSTRAINT "referral_earnings_referral_id_referrals_id_fk" FOREIGN KEY ("referral_id") REFERENCES "public"."referrals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_earnings" ADD CONSTRAINT "referral_earnings_associate_id_associates_id_fk" FOREIGN KEY ("associate_id") REFERENCES "public"."associates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_associate_id_associates_id_fk" FOREIGN KEY ("associate_id") REFERENCES "public"."associates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referred_user_id_users_id_fk" FOREIGN KEY ("referred_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;