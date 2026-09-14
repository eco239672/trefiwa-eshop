-- Normalize existing local asset URLs that were saved with trailing whitespace.
-- This is non-destructive: it only trims whitespace, keeps all rows, and is
-- versioned so every environment receives the same data correction.
UPDATE "Product"
SET "imageUrl" = BTRIM("imageUrl")
WHERE "imageUrl" IS NOT NULL
  AND "imageUrl" <> BTRIM("imageUrl");
