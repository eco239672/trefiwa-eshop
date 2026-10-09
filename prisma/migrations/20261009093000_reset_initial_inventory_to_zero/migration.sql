-- Stock tracking starts empty: inventory must be added deliberately in admin.
UPDATE "ProductVariant" SET "stock" = 0;

ALTER TABLE "ProductVariant" ALTER COLUMN "stock" SET DEFAULT 0;
