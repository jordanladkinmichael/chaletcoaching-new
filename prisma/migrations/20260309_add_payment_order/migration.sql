-- CardServ payment lifecycle persistence
CREATE TABLE "PaymentOrder" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "provider" TEXT NOT NULL DEFAULT 'cardserv',
  "packageId" TEXT NOT NULL,
  "packageName" TEXT NOT NULL,
  "currency" TEXT NOT NULL,
  "amountNet" DOUBLE PRECISION NOT NULL,
  "vatAmount" DOUBLE PRECISION NOT NULL,
  "amountGross" DOUBLE PRECISION NOT NULL,
  "tokens" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "orderMerchantId" TEXT NOT NULL,
  "orderSystemId" TEXT,
  "redirectUrl" TEXT,
  "failureReason" TEXT,
  "transactionId" TEXT,
  "rawSale" TEXT,
  "rawStatus" TEXT,
  "rawWebhook" TEXT,
  "rawResult" TEXT,
  "finalizedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "PaymentOrder_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PaymentOrder_orderMerchantId_key" ON "PaymentOrder"("orderMerchantId");
CREATE UNIQUE INDEX "PaymentOrder_transactionId_key" ON "PaymentOrder"("transactionId");
CREATE INDEX "PaymentOrder_userId_createdAt_idx" ON "PaymentOrder"("userId", "createdAt");
CREATE INDEX "PaymentOrder_status_idx" ON "PaymentOrder"("status");

ALTER TABLE "PaymentOrder"
ADD CONSTRAINT "PaymentOrder_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

