-- CreateSkillMasterFields
-- Add skill master management fields to existing Skill table

-- Add new columns to Skill table
ALTER TABLE "Skill" ADD COLUMN "slug" TEXT;
ALTER TABLE "Skill" ADD COLUMN "logoUrl" TEXT;
ALTER TABLE "Skill" ADD COLUMN "aliases" TEXT;
ALTER TABLE "Skill" ADD COLUMN "verified" BOOLEAN NOT NULL DEFAULT false;

-- Update existing skills with slug values
UPDATE "Skill" SET "slug" = LOWER(REPLACE(REPLACE("name", '.', ''), ' ', '-')) WHERE "slug" IS NULL;

-- Make slug NOT NULL and UNIQUE after updating existing records
UPDATE "Skill" SET "slug" = "id" WHERE "slug" IS NULL OR "slug" = '';
CREATE UNIQUE INDEX "Skill_slug_key" ON "Skill"("slug");

-- Create partial index for better performance on searches
CREATE INDEX "Skill_verified_name_idx" ON "Skill"("verified", "name");
CREATE INDEX "Skill_category_idx" ON "Skill"("category") WHERE "category" IS NOT NULL;