/*
  Warnings:

  - Added the required column `password` to the `Customer` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Customer_storeId_idx";

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "password" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Customer_storeId_email_idx" ON "Customer"("storeId", "email");
