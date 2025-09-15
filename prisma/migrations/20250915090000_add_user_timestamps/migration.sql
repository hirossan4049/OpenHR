-- Add createdAt and updatedAt to User table (SQLite)
-- Prisma will manage @updatedAt updates in the client; DB default is for initial value

PRAGMA foreign_keys=OFF;

-- SQLite cannot add columns with non-constant defaults.
-- 1) Add nullable columns
ALTER TABLE "User" ADD COLUMN "createdAt" DATETIME;
ALTER TABLE "User" ADD COLUMN "updatedAt" DATETIME;

-- 2) Backfill existing rows
UPDATE "User" SET "createdAt" = COALESCE("createdAt", CURRENT_TIMESTAMP);
UPDATE "User" SET "updatedAt" = COALESCE("updatedAt", CURRENT_TIMESTAMP);

PRAGMA foreign_keys=ON;
