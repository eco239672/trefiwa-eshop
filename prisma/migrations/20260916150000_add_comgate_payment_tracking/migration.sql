-- Additive Comgate payment-attempt metadata. Existing bank-transfer orders keep
-- their current values; nullable columns require no backfill and no data rewrite.
ALTER TABLE "Order"
  ADD COLUMN "externalPaymentStatus" TEXT,
  ADD COLUMN "paymentFailureCode" TEXT,
  ADD COLUMN "paymentAttemptId" TEXT,
  ADD COLUMN "paymentRedirectUrl" TEXT,
  ADD COLUMN "paymentCreatedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "Order_externalPaymentId_key" ON "Order"("externalPaymentId");
CREATE UNIQUE INDEX "Order_paymentAttemptId_key" ON "Order"("paymentAttemptId");
