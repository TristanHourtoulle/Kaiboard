-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'SUPER_ADMIN';

-- AlterTable
ALTER TABLE "Meeting" ALTER COLUMN "teamId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastActiveAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "RequestLog" (
    "id" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "statusCode" INTEGER,
    "responseTime" INTEGER,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "userId" TEXT,
    "requestBody" TEXT,
    "queryParams" TEXT,
    "headers" TEXT,
    "errorMessage" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RequestLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RequestLog_timestamp_idx" ON "RequestLog"("timestamp");

-- CreateIndex
CREATE INDEX "RequestLog_userId_idx" ON "RequestLog"("userId");

-- CreateIndex
CREATE INDEX "RequestLog_method_idx" ON "RequestLog"("method");

-- CreateIndex
CREATE INDEX "RequestLog_statusCode_idx" ON "RequestLog"("statusCode");

-- CreateIndex
CREATE INDEX "RequestLog_path_idx" ON "RequestLog"("path");

-- AddForeignKey
ALTER TABLE "RequestLog" ADD CONSTRAINT "RequestLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
