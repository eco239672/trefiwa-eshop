-- Additive LOW-phase commerce foundation. Existing product, variant and order
-- records are retained. The pre-existing Order_userId_createdAt_idx is preserved.

CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'ADMIN');
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'PUBLISHED', 'REJECTED');

ALTER TABLE "User"
  ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER';

CREATE TABLE "WishlistItem" (
  "userId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WishlistItem_pkey" PRIMARY KEY ("userId", "productId")
);

CREATE TABLE "Review" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "rating" INTEGER NOT NULL,
  "content" TEXT NOT NULL,
  "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
  "verifiedPurchase" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Review_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Review_rating_check" CHECK ("rating" BETWEEN 1 AND 5)
);

CREATE TABLE "StockAdjustment" (
  "id" TEXT NOT NULL,
  "variantId" TEXT NOT NULL,
  "adminUserId" TEXT NOT NULL,
  "delta" INTEGER NOT NULL,
  "previousStock" INTEGER NOT NULL,
  "newStock" INTEGER NOT NULL,
  "reason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StockAdjustment_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "StockAdjustment_previousStock_check" CHECK ("previousStock" >= 0),
  CONSTRAINT "StockAdjustment_newStock_check" CHECK ("newStock" >= 0)
);

CREATE TABLE "EmailDelivery" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "recipient" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "providerMessageId" TEXT,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "lastError" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EmailDelivery_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "EmailDelivery_attempts_check" CHECK ("attempts" >= 0)
);

CREATE INDEX "WishlistItem_productId_idx" ON "WishlistItem"("productId");
CREATE INDEX "Review_productId_status_createdAt_idx" ON "Review"("productId", "status", "createdAt");
CREATE UNIQUE INDEX "Review_userId_productId_key" ON "Review"("userId", "productId");
CREATE INDEX "StockAdjustment_variantId_createdAt_idx" ON "StockAdjustment"("variantId", "createdAt");
CREATE INDEX "StockAdjustment_adminUserId_createdAt_idx" ON "StockAdjustment"("adminUserId", "createdAt");
CREATE INDEX "EmailDelivery_status_updatedAt_idx" ON "EmailDelivery"("status", "updatedAt");
CREATE UNIQUE INDEX "EmailDelivery_orderId_type_key" ON "EmailDelivery"("orderId", "type");

ALTER TABLE "WishlistItem"
  ADD CONSTRAINT "WishlistItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "WishlistItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Review"
  ADD CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "StockAdjustment"
  ADD CONSTRAINT "StockAdjustment_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "StockAdjustment_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "EmailDelivery"
  ADD CONSTRAINT "EmailDelivery_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
