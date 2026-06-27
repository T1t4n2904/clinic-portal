/*
  Warnings:

  - You are about to drop the column `code` on the `OtpCode` table. All the data in the column will be lost.
  - Added the required column `otpHash` to the `OtpCode` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `OtpCode` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_OtpCode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phone" TEXT NOT NULL,
    "otpHash" TEXT NOT NULL,
    "purpose" TEXT NOT NULL DEFAULT 'PHONE_VERIFICATION',
    "expiresAt" DATETIME NOT NULL,
    "usedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    CONSTRAINT "OtpCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_OtpCode" ("createdAt", "expiresAt", "id", "purpose", "usedAt", "userId") SELECT "createdAt", "expiresAt", "id", "purpose", "usedAt", "userId" FROM "OtpCode";
DROP TABLE "OtpCode";
ALTER TABLE "new_OtpCode" RENAME TO "OtpCode";
CREATE INDEX "OtpCode_userId_idx" ON "OtpCode"("userId");
CREATE INDEX "OtpCode_phone_idx" ON "OtpCode"("phone");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
