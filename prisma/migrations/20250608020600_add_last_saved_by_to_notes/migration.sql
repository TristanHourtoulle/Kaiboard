/*
  Warnings:

  - Added the required column `lastSavedBy` to the `MeetingNotes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable: Add column with default value first, then update existing records
ALTER TABLE "MeetingNotes" ADD COLUMN "lastSavedBy" TEXT;

-- Update existing records to set lastSavedBy to the same as createdBy
UPDATE "MeetingNotes" SET "lastSavedBy" = "createdBy" WHERE "lastSavedBy" IS NULL;

-- Make the column required
ALTER TABLE "MeetingNotes" ALTER COLUMN "lastSavedBy" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "MeetingNotes" ADD CONSTRAINT "MeetingNotes_lastSavedBy_fkey" FOREIGN KEY ("lastSavedBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
