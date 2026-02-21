-- DropIndex
DROP INDEX "Customer_storeId_email_idx";

-- CreateIndex
CREATE INDEX "Customer_email_storeId_idx" ON "Customer"("email", "storeId");
