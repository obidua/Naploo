CREATE TABLE IF NOT EXISTS "refunds" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "booking_id" uuid REFERENCES "bookings"("id"),
  "payment_id" uuid REFERENCES "payments"("id"),
  "amount" numeric(15, 2) NOT NULL,
  "reason" text,
  "status" varchar(40) DEFAULT 'requested' NOT NULL,
  "requested_by" uuid REFERENCES "users"("id"),
  "processed_by" uuid REFERENCES "users"("id"),
  "gateway_refund_id" varchar(120),
  "notes" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);