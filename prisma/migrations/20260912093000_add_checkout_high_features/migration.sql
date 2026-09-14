-- Additive HIGH-phase checkout and abuse-protection changes. No existing data is removed.

ALTER TABLE "DiscountCode"
  ADD COLUMN "type" TEXT NOT NULL DEFAULT 'FIXED_AMOUNT',
  ADD COLUMN "validFrom" TIMESTAMP(3),
  ADD COLUMN "validUntil" TIMESTAMP(3),
  ADD COLUMN "minimumOrderAmount" DECIMAL(12,2),
  ADD COLUMN "usageLimit" INTEGER,
  ADD COLUMN "usageCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "DiscountCode"
  ADD CONSTRAINT "DiscountCode_type_check" CHECK ("type" IN ('FIXED_AMOUNT', 'PERCENTAGE')),
  ADD CONSTRAINT "DiscountCode_usageLimit_check" CHECK ("usageLimit" IS NULL OR "usageLimit" >= 0),
  ADD CONSTRAINT "DiscountCode_usageCount_check" CHECK ("usageCount" >= 0),
  ADD CONSTRAINT "DiscountCode_minimumOrderAmount_check" CHECK ("minimumOrderAmount" IS NULL OR "minimumOrderAmount" >= 0),
  ADD CONSTRAINT "DiscountCode_discountValue_check" CHECK ("discountValue" > 0);

ALTER TABLE "Order"
  ADD COLUMN "pickupPointCarrier" TEXT,
  ADD COLUMN "pickupPointName" TEXT,
  ADD COLUMN "pickupPointAddress" TEXT;

CREATE INDEX "Order_userId_createdAt_idx" ON "Order"("userId", "createdAt");

CREATE TABLE "RateLimitWindow" (
  "key" TEXT NOT NULL,
  "scope" TEXT NOT NULL,
  "subjectHash" TEXT NOT NULL,
  "windowStart" TIMESTAMP(3) NOT NULL,
  "count" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RateLimitWindow_pkey" PRIMARY KEY ("key")
);

CREATE INDEX "RateLimitWindow_scope_subjectHash_windowStart_idx"
  ON "RateLimitWindow"("scope", "subjectHash", "windowStart");
