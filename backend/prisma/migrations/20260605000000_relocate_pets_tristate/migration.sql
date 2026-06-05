-- Tri-state preference for relocation / pets (Yes / No / Maybe).
-- The previous boolean columns are dropped and recreated as the new enum.
-- (Dev data is reseeded, so the data loss here is intentional.)

-- CreateEnum
CREATE TYPE "OpenPreference" AS ENUM ('YES', 'NO', 'MAYBE');

-- AlterTable: openToRelocate boolean -> OpenPreference
ALTER TABLE "Customer" DROP COLUMN "openToRelocate";
ALTER TABLE "Customer" ADD COLUMN "openToRelocate" "OpenPreference" NOT NULL DEFAULT 'MAYBE';

-- AlterTable: openToPets boolean -> OpenPreference
ALTER TABLE "Customer" DROP COLUMN "openToPets";
ALTER TABLE "Customer" ADD COLUMN "openToPets" "OpenPreference" NOT NULL DEFAULT 'MAYBE';
