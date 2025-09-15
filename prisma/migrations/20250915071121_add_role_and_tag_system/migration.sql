-- Add role field to User table
ALTER TABLE User ADD COLUMN role TEXT DEFAULT 'MEMBER';

-- Create Tag table
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL UNIQUE,
    "color" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create UserTag junction table
CREATE TABLE "UserTag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserTag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create unique constraint for UserTag
CREATE UNIQUE INDEX "UserTag_userId_tagId_key" ON "UserTag"("userId", "tagId");

-- Create indexes for UserTag
CREATE INDEX "UserTag_userId_idx" ON "UserTag"("userId");
CREATE INDEX "UserTag_tagId_idx" ON "UserTag"("tagId");

-- Update existing users to have MEMBER role (default is already set, but making it explicit)
UPDATE User SET role = 'MEMBER' WHERE role IS NULL OR role = '';