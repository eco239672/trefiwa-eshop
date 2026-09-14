-- Baseline of the schema that already existed in Neon before Prisma Migrate
-- was introduced. This migration is recorded with `migrate resolve --applied`
-- and must never be executed against this existing production database.
CREATE TABLE "User" (
    "id" TEXT NOT NULL, "name" TEXT NOT NULL, "email" TEXT NOT NULL,
    "password" TEXT, "company" TEXT, "phone" TEXT, "street" TEXT,
    "city" TEXT, "zip" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL, "points" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Address" (
    "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "name" TEXT NOT NULL,
    "street" TEXT NOT NULL, "city" TEXT NOT NULL, "zip" TEXT NOT NULL,
    "phone" TEXT, "isDefault" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Category" ("id" TEXT NOT NULL, "name" TEXT NOT NULL, CONSTRAINT "Category_pkey" PRIMARY KEY ("id"));
CREATE TABLE "SubCategory" ("id" TEXT NOT NULL, "name" TEXT NOT NULL, "categoryId" TEXT NOT NULL, CONSTRAINT "SubCategory_pkey" PRIMARY KEY ("id"));
CREATE TABLE "Product" ("id" TEXT NOT NULL, "name" TEXT NOT NULL, "description" TEXT, "imageUrl" TEXT, "subCategoryId" TEXT, CONSTRAINT "Product_pkey" PRIMARY KEY ("id"));
CREATE TABLE "ProductVariant" ("id" TEXT NOT NULL, "productId" TEXT NOT NULL, "weight" TEXT NOT NULL, "price" DECIMAL(65,30) NOT NULL, "oldPrice" DECIMAL(65,30), "stock" INTEGER NOT NULL DEFAULT 1, CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id"));
CREATE TABLE "Order" ("id" TEXT NOT NULL, "userId" TEXT, "totalPrice" DECIMAL(10,2) NOT NULL, "status" TEXT NOT NULL DEFAULT 'PENDING', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Order_pkey" PRIMARY KEY ("id"));
CREATE TABLE "DiscountCode" ("id" TEXT NOT NULL, "code" TEXT NOT NULL, "discountValue" DECIMAL(10,2) NOT NULL, "isActive" BOOLEAN NOT NULL DEFAULT true, CONSTRAINT "DiscountCode_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");
CREATE UNIQUE INDEX "DiscountCode_code_key" ON "DiscountCode"("code");
ALTER TABLE "Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SubCategory" ADD CONSTRAINT "SubCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Product" ADD CONSTRAINT "Product_subCategoryId_fkey" FOREIGN KEY ("subCategoryId") REFERENCES "SubCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
