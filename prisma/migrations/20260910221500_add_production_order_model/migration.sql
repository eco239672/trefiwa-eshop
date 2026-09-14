-- This migration is additive and preserves every existing Order row.
-- Existing orders receive their original id as a public order number and a
-- legacy-only idempotency key. New checkout writes every new field.

ALTER TABLE "Order"
  ADD COLUMN "orderNumber" TEXT,
  ADD COLUMN "subtotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN "discount" DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN "shippingPrice" DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN "total" DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN "currency" VARCHAR(3) NOT NULL DEFAULT 'EUR',
  ADD COLUMN "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
  ADD COLUMN "paymentMethod" TEXT NOT NULL DEFAULT 'BANK_TRANSFER',
  ADD COLUMN "paymentProvider" TEXT,
  ADD COLUMN "externalPaymentId" TEXT,
  ADD COLUMN "guestAccessToken" TEXT,
  ADD COLUMN "idempotencyKey" TEXT,
  ADD COLUMN "requestFingerprint" TEXT,
  ADD COLUMN "discountCode" TEXT,
  ADD COLUMN "customerEmail" TEXT,
  ADD COLUMN "customerPhone" TEXT,
  ADD COLUMN "customerFirstName" TEXT,
  ADD COLUMN "customerLastName" TEXT,
  ADD COLUMN "shippingCountry" TEXT,
  ADD COLUMN "shippingStreet" TEXT,
  ADD COLUMN "shippingCity" TEXT,
  ADD COLUMN "shippingZip" TEXT,
  ADD COLUMN "shippingMethod" TEXT,
  ADD COLUMN "shippingMethodName" TEXT,
  ADD COLUMN "pickupPointId" TEXT,
  ADD COLUMN "pickupPointData" JSONB,
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "paidAt" TIMESTAMP(3),
  ADD COLUMN "cancelledAt" TIMESTAMP(3);

UPDATE "Order"
SET
  "orderNumber" = "id",
  "idempotencyKey" = 'legacy:' || "id",
  "requestFingerprint" = 'legacy:' || "id",
  "total" = "totalPrice"
WHERE "orderNumber" IS NULL;

ALTER TABLE "Order"
  ALTER COLUMN "orderNumber" SET NOT NULL,
  ALTER COLUMN "idempotencyKey" SET NOT NULL,
  ALTER COLUMN "requestFingerprint" SET NOT NULL;

CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");
CREATE UNIQUE INDEX "Order_idempotencyKey_key" ON "Order"("idempotencyKey");
CREATE UNIQUE INDEX "Order_guestAccessToken_key" ON "Order"("guestAccessToken");

CREATE TABLE "OrderItem" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "variantId" TEXT NOT NULL,
  "productName" TEXT NOT NULL,
  "variantWeight" TEXT NOT NULL,
  "sku" TEXT,
  "quantity" INTEGER NOT NULL,
  "unitPrice" DECIMAL(12,2) NOT NULL,
  "totalPrice" DECIMAL(12,2) NOT NULL,
  CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "OrderItem"
  ADD CONSTRAINT "OrderItem_orderId_fkey"
  FOREIGN KEY ("orderId") REFERENCES "Order"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");
CREATE INDEX "OrderItem_variantId_idx" ON "OrderItem"("variantId");
