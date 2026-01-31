-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "public"."Portfolio" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "url" TEXT,
    "imageUrl" TEXT,
    "projectType" TEXT NOT NULL DEFAULT 'personal',
    "technologies" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Portfolio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Article" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "description" TEXT,
    "tags" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "refresh_token_expires_in" INTEGER,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "bio" TEXT,
    "grade" TEXT,
    "contact" TEXT,
    "githubUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "public"."Skill" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT,
    "logoUrl" TEXT,
    "aliases" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserSkill" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "yearsOfExp" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DiscordMember" (
    "id" TEXT NOT NULL,
    "discordId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "discriminator" TEXT,
    "displayName" TEXT,
    "avatar" TEXT,
    "joinedAt" TIMESTAMP(3),
    "userId" TEXT,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "syncStatus" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiscordMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GuildSync" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "guildName" TEXT,
    "lastSyncedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "totalMembers" INTEGER,
    "syncedMembers" INTEGER,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuildSync_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Project" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'project',
    "recruitmentStatus" TEXT NOT NULL DEFAULT 'open',
    "maxMembers" INTEGER,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "organizerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProjectRequiredSkill" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "minLevel" INTEGER NOT NULL DEFAULT 1,
    "priority" TEXT NOT NULL DEFAULT 'required',

    CONSTRAINT "ProjectRequiredSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProjectApplication" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "message" TEXT,
    "response" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProjectMember" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserTag" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HackathonInfo" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "theme" TEXT,
    "prizes" TEXT,
    "judgingCriteria" TEXT,
    "status" TEXT NOT NULL DEFAULT 'registration',
    "submissionDeadline" TIMESTAMP(3),
    "judgingStartDate" TIMESTAMP(3),
    "resultsDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HackathonInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HackathonSubmission" (
    "id" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "demoUrl" TEXT,
    "repositoryUrl" TEXT,
    "presentationUrl" TEXT,
    "videoUrl" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HackathonSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HackathonEvaluation" (
    "id" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "judgeName" TEXT NOT NULL,
    "judgeEmail" TEXT,
    "scores" TEXT NOT NULL,
    "comment" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HackathonEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HackathonParticipation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "teamId" TEXT,
    "role" TEXT NOT NULL DEFAULT 'participant',
    "participatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ranking" INTEGER,
    "awards" TEXT,
    "submissionId" TEXT,
    "feedback" TEXT,
    "rating" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HackathonParticipation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Portfolio_createdById_idx" ON "public"."Portfolio"("createdById");

-- CreateIndex
CREATE INDEX "Portfolio_projectType_idx" ON "public"."Portfolio"("projectType");

-- CreateIndex
CREATE INDEX "Portfolio_isPublic_idx" ON "public"."Portfolio"("isPublic");

-- CreateIndex
CREATE INDEX "Article_createdById_idx" ON "public"."Article"("createdById");

-- CreateIndex
CREATE INDEX "Article_platform_idx" ON "public"."Article"("platform");

-- CreateIndex
CREATE INDEX "Article_publishedAt_idx" ON "public"."Article"("publishedAt");

-- CreateIndex
CREATE INDEX "Article_isPublic_idx" ON "public"."Article"("isPublic");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "public"."Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "public"."Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "public"."VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "public"."VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_name_key" ON "public"."Skill"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_slug_key" ON "public"."Skill"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "UserSkill_userId_skillId_key" ON "public"."UserSkill"("userId", "skillId");

-- CreateIndex
CREATE INDEX "DiscordMember_guildId_idx" ON "public"."DiscordMember"("guildId");

-- CreateIndex
CREATE INDEX "DiscordMember_userId_idx" ON "public"."DiscordMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DiscordMember_discordId_guildId_key" ON "public"."DiscordMember"("discordId", "guildId");

-- CreateIndex
CREATE UNIQUE INDEX "GuildSync_guildId_key" ON "public"."GuildSync"("guildId");

-- CreateIndex
CREATE INDEX "Project_organizerId_idx" ON "public"."Project"("organizerId");

-- CreateIndex
CREATE INDEX "Project_recruitmentStatus_idx" ON "public"."Project"("recruitmentStatus");

-- CreateIndex
CREATE INDEX "Project_type_idx" ON "public"."Project"("type");

-- CreateIndex
CREATE INDEX "ProjectRequiredSkill_projectId_idx" ON "public"."ProjectRequiredSkill"("projectId");

-- CreateIndex
CREATE INDEX "ProjectRequiredSkill_skillId_idx" ON "public"."ProjectRequiredSkill"("skillId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectRequiredSkill_projectId_skillId_key" ON "public"."ProjectRequiredSkill"("projectId", "skillId");

-- CreateIndex
CREATE INDEX "ProjectApplication_projectId_idx" ON "public"."ProjectApplication"("projectId");

-- CreateIndex
CREATE INDEX "ProjectApplication_applicantId_idx" ON "public"."ProjectApplication"("applicantId");

-- CreateIndex
CREATE INDEX "ProjectApplication_status_idx" ON "public"."ProjectApplication"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectApplication_projectId_applicantId_key" ON "public"."ProjectApplication"("projectId", "applicantId");

-- CreateIndex
CREATE INDEX "ProjectMember_projectId_idx" ON "public"."ProjectMember"("projectId");

-- CreateIndex
CREATE INDEX "ProjectMember_userId_idx" ON "public"."ProjectMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectMember_projectId_userId_key" ON "public"."ProjectMember"("projectId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "public"."Tag"("name");

-- CreateIndex
CREATE INDEX "UserTag_userId_idx" ON "public"."UserTag"("userId");

-- CreateIndex
CREATE INDEX "UserTag_tagId_idx" ON "public"."UserTag"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "UserTag_userId_tagId_key" ON "public"."UserTag"("userId", "tagId");

-- CreateIndex
CREATE UNIQUE INDEX "HackathonInfo_projectId_key" ON "public"."HackathonInfo"("projectId");

-- CreateIndex
CREATE INDEX "HackathonInfo_projectId_idx" ON "public"."HackathonInfo"("projectId");

-- CreateIndex
CREATE INDEX "HackathonInfo_status_idx" ON "public"."HackathonInfo"("status");

-- CreateIndex
CREATE INDEX "HackathonSubmission_hackathonId_idx" ON "public"."HackathonSubmission"("hackathonId");

-- CreateIndex
CREATE INDEX "HackathonSubmission_teamId_idx" ON "public"."HackathonSubmission"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "HackathonSubmission_hackathonId_teamId_key" ON "public"."HackathonSubmission"("hackathonId", "teamId");

-- CreateIndex
CREATE INDEX "HackathonEvaluation_hackathonId_idx" ON "public"."HackathonEvaluation"("hackathonId");

-- CreateIndex
CREATE INDEX "HackathonEvaluation_submissionId_idx" ON "public"."HackathonEvaluation"("submissionId");

-- CreateIndex
CREATE UNIQUE INDEX "HackathonEvaluation_hackathonId_submissionId_judgeEmail_key" ON "public"."HackathonEvaluation"("hackathonId", "submissionId", "judgeEmail");

-- CreateIndex
CREATE INDEX "HackathonParticipation_userId_idx" ON "public"."HackathonParticipation"("userId");

-- CreateIndex
CREATE INDEX "HackathonParticipation_hackathonId_idx" ON "public"."HackathonParticipation"("hackathonId");

-- CreateIndex
CREATE INDEX "HackathonParticipation_teamId_idx" ON "public"."HackathonParticipation"("teamId");

-- CreateIndex
CREATE INDEX "HackathonParticipation_role_idx" ON "public"."HackathonParticipation"("role");

-- CreateIndex
CREATE UNIQUE INDEX "HackathonParticipation_userId_hackathonId_key" ON "public"."HackathonParticipation"("userId", "hackathonId");

-- AddForeignKey
ALTER TABLE "public"."Portfolio" ADD CONSTRAINT "Portfolio_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Article" ADD CONSTRAINT "Article_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserSkill" ADD CONSTRAINT "UserSkill_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserSkill" ADD CONSTRAINT "UserSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "public"."Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DiscordMember" ADD CONSTRAINT "DiscordMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DiscordMember" ADD CONSTRAINT "DiscordMember_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "public"."GuildSync"("guildId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Project" ADD CONSTRAINT "Project_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProjectRequiredSkill" ADD CONSTRAINT "ProjectRequiredSkill_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProjectRequiredSkill" ADD CONSTRAINT "ProjectRequiredSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "public"."Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProjectApplication" ADD CONSTRAINT "ProjectApplication_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProjectApplication" ADD CONSTRAINT "ProjectApplication_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProjectMember" ADD CONSTRAINT "ProjectMember_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProjectMember" ADD CONSTRAINT "ProjectMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserTag" ADD CONSTRAINT "UserTag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserTag" ADD CONSTRAINT "UserTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "public"."Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HackathonInfo" ADD CONSTRAINT "HackathonInfo_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HackathonSubmission" ADD CONSTRAINT "HackathonSubmission_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "public"."HackathonInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HackathonSubmission" ADD CONSTRAINT "HackathonSubmission_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HackathonEvaluation" ADD CONSTRAINT "HackathonEvaluation_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "public"."HackathonInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HackathonEvaluation" ADD CONSTRAINT "HackathonEvaluation_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "public"."HackathonSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HackathonParticipation" ADD CONSTRAINT "HackathonParticipation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HackathonParticipation" ADD CONSTRAINT "HackathonParticipation_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HackathonParticipation" ADD CONSTRAINT "HackathonParticipation_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HackathonParticipation" ADD CONSTRAINT "HackathonParticipation_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "public"."HackathonSubmission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

