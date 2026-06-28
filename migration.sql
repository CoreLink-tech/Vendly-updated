-- VENDLY MIGRATION: vendor settings, payment confirmation, logistics routes
-- Run in Supabase SQL Editor

ALTER TABLE vendors
  ADD COLUMN IF NOT EXISTS "logisticsEnabled" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "payLaterEnabled"  BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "bankName"         TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "accountNumber"    TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "accountName"      TEXT NOT NULL DEFAULT '';

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS "payerBankName"       TEXT,
  ADD COLUMN IF NOT EXISTS "paymentConfirmedAt"  TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS logistics_routes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "fromState" TEXT NOT NULL,
  "toState"   TEXT NOT NULL,
  price       NUMERIC(12,2) NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE("fromState", "toState")
);

CREATE INDEX IF NOT EXISTS idx_logistics_routes_from ON logistics_routes("fromState");
