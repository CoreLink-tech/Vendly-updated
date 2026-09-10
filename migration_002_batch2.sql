-- ============================================
-- BATCH 2: discount pricing, hero banner, reviews & ratings
-- ============================================

-- Part A — discount / compare-at pricing
-- NULL = no discount shown. A value only counts as an active discount
-- when compareAtPrice > price; that's enforced at the API layer, not
-- here, so a vendor can save a compareAtPrice ahead of finalizing price.
ALTER TABLE products ADD COLUMN IF NOT EXISTS "compareAtPrice" NUMERIC(12,2);

-- Part B — hero / cover banner
-- NULL = no banner, storefront header renders exactly as it does today.
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS "bannerImage" TEXT;

-- Part C — reviews & ratings
-- Gated by order number instead of login, since storefront customers
-- don't have accounts. One review per (order, product) pair.
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "productId" UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  "vendorId" UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  "orderId" UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  "customerName" TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'published', -- published | hidden
  "ipAddress" TEXT, -- for the report/route.ts-style IP rate limit on submission
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE ("orderId", "productId")
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews("productId");
CREATE INDEX IF NOT EXISTS idx_reviews_vendor ON reviews("vendorId");
