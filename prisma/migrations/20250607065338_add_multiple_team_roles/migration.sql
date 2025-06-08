/*
  Warnings:

  - You are about to drop the column `customRoleId` on the `TeamMember` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "TeamMember" DROP CONSTRAINT "TeamMember_customRoleId_fkey";

-- AlterTable
ALTER TABLE "TeamMember" DROP COLUMN "customRoleId";

-- CreateTable
CREATE TABLE "TeamMemberCustomRole" (
    "id" TEXT NOT NULL,
    "teamMemberId" TEXT NOT NULL,
    "teamRoleId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamMemberCustomRole_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeamMemberCustomRole_teamMemberId_teamRoleId_key" ON "TeamMemberCustomRole"("teamMemberId", "teamRoleId");

-- AddForeignKey
ALTER TABLE "TeamMemberCustomRole" ADD CONSTRAINT "TeamMemberCustomRole_teamMemberId_fkey" FOREIGN KEY ("teamMemberId") REFERENCES "TeamMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMemberCustomRole" ADD CONSTRAINT "TeamMemberCustomRole_teamRoleId_fkey" FOREIGN KEY ("teamRoleId") REFERENCES "TeamRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;
