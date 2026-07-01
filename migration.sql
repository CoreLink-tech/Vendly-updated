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

-- ============================================
-- MIGRATION 2: storefront colors, customer reports
-- ============================================

ALTER TABLE vendors
  ADD COLUMN IF NOT EXISTS "primaryColor"    TEXT NOT NULL DEFAULT '#22c55e',
  ADD COLUMN IF NOT EXISTS "backgroundColor" TEXT NOT NULL DEFAULT '#0d0d0d';

-- Buyer-submitted reports/complaints for a vendor's store.
-- Rows are auto-purged 3 days after creation (see /api/vendor/reports).
CREATE TABLE IF NOT EXISTS reports (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "vendorId"     UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  "customerName" TEXT NOT NULL,
  "customerPhone" TEXT NOT NULL,
  message        TEXT NOT NULL,
  "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_vendor ON reports("vendorId");
CREATE INDEX IF NOT EXISTS idx_reports_created ON reports("createdAt");

-- ============================================
-- MIGRATION 3: fix mixed-case vendor slugs
-- ============================================
-- Slug lookups are case-sensitive, but some vendors ended up with a
-- mixed-case slug (e.g. "Onomefeyoungsarah") from before the app enforced
-- lowercase on save. Any buyer typing/sharing the link in normal lowercase
-- got "Store not found" even though the vendor was active. Lowercase
-- everything now; app code enforces lowercase on all future writes.
DO $$
DECLARE
  r RECORD;
  new_slug TEXT;
  suffix INT;
BEGIN
  FOR r IN SELECT id, slug FROM vendors WHERE slug <> lower(slug) LOOP
    new_slug := lower(r.slug);
    suffix := 1;
    -- Guard against collisions if a lowercase version is already taken
    WHILE EXISTS (SELECT 1 FROM vendors WHERE slug = new_slug AND id <> r.id) LOOP
      suffix := suffix + 1;
      new_slug := lower(r.slug) || suffix::text;
    END LOOP;
    UPDATE vendors SET slug = new_slug WHERE id = r.id;
  END LOOP;
END $$;
