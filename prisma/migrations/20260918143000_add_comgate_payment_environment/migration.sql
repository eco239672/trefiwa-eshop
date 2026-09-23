-- Additive payment-environment snapshot. Existing orders and bank transfers
-- remain untouched; a new card transaction writes TEST or LIVE only after a
-- successful provider creation and never relies on a later global env change.
ALTER TABLE "Order" ADD COLUMN "paymentEnvironment" TEXT;
