/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the column `commonName` on the `Locale` table. All the data in the column will be lost.
  - You are about to drop the column `countryCode` on the `Locale` table. All the data in the column will be lost.
  - You are about to drop the column `formalName` on the `Locale` table. All the data in the column will be lost.
  - You are about to drop the column `languageCode` on the `Locale` table. All the data in the column will be lost.
  - You are about to drop the column `nativeName` on the `Locale` table. All the data in the column will be lost.
  - You are about to drop the column `cardId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `currencyCode` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `originalDescription` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `originalId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `Transaction` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(9,2)`.
  - You are about to drop the column `createdAt` on the `TransactionTag` table. All the data in the column will be lost.
  - You are about to drop the column `transactionId` on the `TransactionTag` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `TransactionTag` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `TransactionTag` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `fullName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `colorScheme` on the `UserSettings` table. All the data in the column will be lost.
  - You are about to drop the column `localeId` on the `UserSettings` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `UserSettings` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[original_id]` on the table `Card` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[card_number]` on the table `Card` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[original_id]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `TransactionTag` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `UserSettings` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `card_number` to the `Card` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_tracking_time` to the `Card` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Card` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Card` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `bank` on the `Card` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `formal_name` to the `Locale` table without a default value. This is not possible if the table is not empty.
  - Added the required column `language_code` to the `Locale` table without a default value. This is not possible if the table is not empty.
  - Added the required column `native_name` to the `Locale` table without a default value. This is not possible if the table is not empty.
  - Added the required column `card_id` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currency_code` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `original_id` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `full_name` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `UserSettings` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AvailableBank" AS ENUM ('Monobank', 'PKO');

-- DropForeignKey
ALTER TABLE "Card" DROP CONSTRAINT "Card_userId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_cardId_fkey";

-- DropForeignKey
ALTER TABLE "TransactionTag" DROP CONSTRAINT "TransactionTag_transactionId_fkey";

-- DropForeignKey
ALTER TABLE "TransactionTag" DROP CONSTRAINT "TransactionTag_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserSettings" DROP CONSTRAINT "UserSettings_localeId_fkey";

-- DropForeignKey
ALTER TABLE "UserSettings" DROP CONSTRAINT "UserSettings_userId_fkey";

-- DropIndex
DROP INDEX "UserSettings_userId_key";

-- AlterTable
ALTER TABLE "Card" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "card_number" TEXT NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "original_id" TEXT,
ADD COLUMN     "start_tracking_time" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" UUID NOT NULL,
DROP COLUMN "bank",
ADD COLUMN     "bank" "AvailableBank" NOT NULL;

-- AlterTable
ALTER TABLE "Locale" DROP COLUMN "commonName",
DROP COLUMN "countryCode",
DROP COLUMN "formalName",
DROP COLUMN "languageCode",
DROP COLUMN "nativeName",
ADD COLUMN     "common_name" TEXT,
ADD COLUMN     "country_code" TEXT,
ADD COLUMN     "formal_name" TEXT NOT NULL,
ADD COLUMN     "language_code" TEXT NOT NULL,
ADD COLUMN     "native_name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "cardId",
DROP COLUMN "createdAt",
DROP COLUMN "currencyCode",
DROP COLUMN "originalDescription",
DROP COLUMN "originalId",
ADD COLUMN     "card_id" UUID NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "currency_code" INTEGER NOT NULL,
ADD COLUMN     "original_description" TEXT,
ADD COLUMN     "original_id" TEXT NOT NULL,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(9,2);

-- AlterTable
ALTER TABLE "TransactionTag" DROP COLUMN "createdAt",
DROP COLUMN "transactionId",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "createdAt",
DROP COLUMN "fullName",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "full_name" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "password" DROP NOT NULL;

-- AlterTable
ALTER TABLE "UserSettings" DROP COLUMN "colorScheme",
DROP COLUMN "localeId",
DROP COLUMN "userId",
ADD COLUMN     "color_scheme" "ColorScheme" NOT NULL DEFAULT 'System',
ADD COLUMN     "locale_id" VARCHAR(15),
ADD COLUMN     "user_id" UUID NOT NULL;

-- CreateTable
CREATE TABLE "MonobankDetails" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "token" TEXT NOT NULL,
    "is_token_valid" BOOLEAN NOT NULL DEFAULT true,
    "card_id" UUID NOT NULL,

    CONSTRAINT "MonobankDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PKODetails" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "token" TEXT NOT NULL,
    "card_id" UUID NOT NULL,

    CONSTRAINT "PKODetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransactionTagsOfTransaction" (
    "transaction_id" UUID NOT NULL,
    "tag_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransactionTagsOfTransaction_pkey" PRIMARY KEY ("transaction_id","tag_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MonobankDetails_card_id_key" ON "MonobankDetails"("card_id");

-- CreateIndex
CREATE UNIQUE INDEX "PKODetails_card_id_key" ON "PKODetails"("card_id");

-- CreateIndex
CREATE UNIQUE INDEX "Card_original_id_key" ON "Card"("original_id");

-- CreateIndex
CREATE UNIQUE INDEX "Card_card_number_key" ON "Card"("card_number");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_original_id_key" ON "Transaction"("original_id");

-- CreateIndex
CREATE UNIQUE INDEX "TransactionTag_name_key" ON "TransactionTag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_user_id_key" ON "UserSettings"("user_id");

-- AddForeignKey
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_locale_id_fkey" FOREIGN KEY ("locale_id") REFERENCES "Locale"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonobankDetails" ADD CONSTRAINT "MonobankDetails_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PKODetails" ADD CONSTRAINT "PKODetails_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionTagsOfTransaction" ADD CONSTRAINT "TransactionTagsOfTransaction_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionTagsOfTransaction" ADD CONSTRAINT "TransactionTagsOfTransaction_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "TransactionTag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
