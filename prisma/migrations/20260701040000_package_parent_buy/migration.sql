-- AlterTable
ALTER TABLE "Package" ADD COLUMN     "buyableByParent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "paidAt" TIMESTAMP(3);
