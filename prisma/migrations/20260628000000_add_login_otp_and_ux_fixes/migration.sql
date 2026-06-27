-- CreateEnum
CREATE TYPE "OtpPurpose" AS ENUM ('PHONE_VERIFICATION', 'PASSWORD_RESET', 'LOGIN_VERIFY');

-- AlterTable
ALTER TABLE "OtpCode" ALTER COLUMN "purpose" DROP DEFAULT;
ALTER TABLE "OtpCode"
  ALTER COLUMN "purpose" TYPE "OtpPurpose"
  USING ("purpose"::"OtpPurpose");
ALTER TABLE "OtpCode" ALTER COLUMN "purpose" SET DEFAULT 'PHONE_VERIFICATION';

-- CreateIndex
CREATE INDEX "OtpCode_purpose_idx" ON "OtpCode"("purpose");

-- CreateIndex
CREATE INDEX "OtpCode_userId_purpose_consumed_idx" ON "OtpCode"("userId", "purpose", "consumed");
