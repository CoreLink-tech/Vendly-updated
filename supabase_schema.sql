-- ============================================
-- VENDLY SCHEMA - Run in Supabase SQL Editor
-- Wipes existing data and rebuilds from scratch
-- ============================================

-- Drop all existing tables (cascade handles foreign keys)
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS ambassador_referrals CASCADE;
DROP TABLE IF EXISTS ambassadors CASCADE;
DROP TABLE IF EXISTS withdrawals CASCADE;
DROP TABLE IF EXISTS referrals CASCADE;
DROP TABLE IF EXISTS activation_codes CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS vendors CASCADE;
DROP TABLE IF EXISTS "user" CASCADE;
DROP TABLE IF EXISTS session CASCADE;
DROP TABLE IF EXISTS account CASCADE;
DROP TABLE IF EXISTS verification CASCADE;

-- ============================================
-- AUTH TABLES (better-auth compatible)
-- ============================================

CREATE TABLE "user" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  "emailVerified" BOOLEAN NOT NULL DEFAULT false,
  image TEXT,
  role TEXT NOT NULL DEFAULT 'vendor',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE session (
  id TEXT PRIMARY KEY,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  token TEXT NOT NULL UNIQUE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE TABLE account (
  id TEXT PRIMARY KEY,
  "accountId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  "accessToken" TEXT,
  "refreshToken" TEXT,
  "idToken" TEXT,
  "accessTokenExpiresAt" TIMESTAMPTZ,
  "refreshTokenExpiresAt" TIMESTAMPTZ,
  scope TEXT,
  password TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE verification (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- VENDORS
-- ============================================

CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  "businessName" TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  logo TEXT,
  location TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  slug TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | active | suspended
  "referredBy" TEXT, -- slug of referring vendor
  "primaryColor" TEXT NOT NULL DEFAULT '#22c55e',
  "backgroundColor" TEXT NOT NULL DEFAULT '#0d0d0d',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vendors_user ON vendors("userId");
CREATE INDEX idx_vendors_slug ON vendors(slug);
CREATE INDEX idx_vendors_status ON vendors(status);

-- ============================================
-- PRODUCTS
-- ============================================

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "vendorId" UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC(12,2) NOT NULL,
  category TEXT NOT NULL DEFAULT '',
  stock INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active', -- active | inactive
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_vendor ON products("vendorId");

CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "productId" UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_product_images_product ON product_images("productId");

-- ============================================
-- ORDERS
-- ============================================

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "vendorId" UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  "orderNumber" TEXT NOT NULL UNIQUE,
  "customerName" TEXT NOT NULL,
  "customerPhone" TEXT NOT NULL,
  "customerAddress" TEXT NOT NULL,
  "customerLocation" TEXT NOT NULL DEFAULT '',
  "paymentMethod" TEXT NOT NULL DEFAULT 'full_payment', -- full_payment | payment_on_delivery
  "paymentStatus" TEXT NOT NULL DEFAULT 'pending', -- pending | paid | failed
  status TEXT NOT NULL DEFAULT 'new', -- new | confirmed | processing | shipped | delivered | cancelled
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  "deliveryFee" NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  notes TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_vendor ON orders("vendorId");
CREATE INDEX idx_orders_status ON orders(status);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "orderId" UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  "productId" UUID REFERENCES products(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  price NUMERIC(12,2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  total NUMERIC(12,2) NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items("orderId");

-- ============================================
-- SUBSCRIPTIONS
-- ============================================

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "vendorId" UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'monthly', -- monthly | yearly
  status TEXT NOT NULL DEFAULT 'active', -- active | expired | cancelled
  "startDate" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "endDate" TIMESTAMPTZ NOT NULL,
  "activationCode" TEXT,
  "activatedBy" TEXT REFERENCES "user"(id) ON DELETE SET NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_vendor ON subscriptions("vendorId");

-- ============================================
-- ACTIVATION CODES
-- ============================================

CREATE TABLE activation_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  plan TEXT NOT NULL DEFAULT 'monthly', -- monthly | yearly
  status TEXT NOT NULL DEFAULT 'unused', -- unused | used
  "usedBy" UUID REFERENCES vendors(id) ON DELETE SET NULL,
  "usedAt" TIMESTAMPTZ,
  "createdBy" TEXT REFERENCES "user"(id) ON DELETE SET NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activation_codes_code ON activation_codes(code);
CREATE INDEX idx_activation_codes_status ON activation_codes(status);

-- ============================================
-- REFERRALS (vendor-to-vendor)
-- ============================================

CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "referrerId" UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  "referredVendorId" UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | completed
  commission NUMERIC(12,2) NOT NULL DEFAULT 0,
  plan TEXT NOT NULL DEFAULT 'monthly',
  "paidAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE("referrerId", "referredVendorId")
);

CREATE INDEX idx_referrals_referrer ON referrals("referrerId");

-- ============================================
-- AMBASSADORS
-- ============================================

CREATE TABLE ambassadors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "vendorId" UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  "fullName" TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  "businessName" TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | approved | rejected
  "ambassadorCode" TEXT UNIQUE,
  "reviewedBy" TEXT REFERENCES "user"(id) ON DELETE SET NULL,
  "reviewedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ambassadors_vendor ON ambassadors("vendorId");

CREATE TABLE ambassador_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "ambassadorId" UUID NOT NULL REFERENCES ambassadors(id) ON DELETE CASCADE,
  "referredVendorId" UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  commission NUMERIC(12,2) NOT NULL DEFAULT 0,
  plan TEXT NOT NULL DEFAULT 'monthly',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE("ambassadorId", "referredVendorId")
);

CREATE INDEX idx_amb_referrals_ambassador ON ambassador_referrals("ambassadorId");

-- ============================================
-- WITHDRAWALS
-- ============================================

CREATE TABLE withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "vendorId" UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  "bankName" TEXT NOT NULL,
  "accountNumber" TEXT NOT NULL,
  "accountName" TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'referral', -- referral | ambassador
  status TEXT NOT NULL DEFAULT 'pending', -- pending | completed | rejected
  "processedBy" TEXT REFERENCES "user"(id) ON DELETE SET NULL,
  "processedAt" TIMESTAMPTZ,
  notes TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_withdrawals_vendor ON withdrawals("vendorId");
CREATE INDEX idx_withdrawals_status ON withdrawals(status);

-- ============================================
-- REPORTS (buyer complaints, auto-purged after 3 days)
-- ============================================

CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "vendorId" UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  "customerName" TEXT NOT NULL,
  "customerPhone" TEXT NOT NULL,
  message TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reports_vendor ON reports("vendorId");
CREATE INDEX idx_reports_created ON reports("createdAt");

