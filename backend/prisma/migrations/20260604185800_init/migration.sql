-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "FunnelStage" AS ENUM ('PROFILE_REVIEW', 'VERIFIED', 'ACTIVE_SEARCH', 'POTENTIAL_MATCH_FOUND', 'INTRODUCTION_SENT', 'FIRST_CALL_SCHEDULED', 'DATING', 'RELATIONSHIP', 'ENGAGED', 'MARRIED');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('NEVER_MARRIED', 'DIVORCED', 'WIDOWED', 'AWAITING_DIVORCE');

-- CreateEnum
CREATE TYPE "DietPreference" AS ENUM ('VEGETARIAN', 'NON_VEGETARIAN', 'VEGAN', 'EGGETARIAN', 'JAIN');

-- CreateEnum
CREATE TYPE "Frequency" AS ENUM ('NEVER', 'OCCASIONALLY', 'SOCIALLY', 'REGULARLY');

-- CreateEnum
CREATE TYPE "FamilyType" AS ENUM ('NUCLEAR', 'JOINT');

-- CreateEnum
CREATE TYPE "ManglikStatus" AS ENUM ('YES', 'NO', 'PARTIAL', 'DONT_KNOW');

-- CreateEnum
CREATE TYPE "WantKids" AS ENUM ('YES', 'NO', 'MAYBE', 'OPEN');

-- CreateEnum
CREATE TYPE "NoteCategory" AS ENUM ('GENERAL', 'PREFERENCE', 'CONCERN', 'CALL_LOG', 'FAMILY', 'FEEDBACK', 'STRATEGY');

-- CreateEnum
CREATE TYPE "TimelineEventType" AS ENUM ('PROFILE_CREATED', 'VERIFICATION', 'STAGE_CHANGE', 'NOTE_ADDED', 'MATCH_GENERATED', 'INTRODUCTION_SENT', 'FEEDBACK_RECEIVED', 'CALL_SCHEDULED', 'STATUS_UPDATE');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('NEW', 'WAITING_REVIEW', 'SENT', 'AWAITING_FEEDBACK', 'ACCEPTED', 'REJECTED', 'ON_HOLD');

-- CreateEnum
CREATE TYPE "FeedbackResponse" AS ENUM ('INTERESTED', 'NOT_INTERESTED', 'NEED_MORE_TIME', 'DATE_SCHEDULED', 'FOLLOW_UP_NEEDED');

-- CreateEnum
CREATE TYPE "FeedbackReason" AS ENUM ('LOCATION_MISMATCH', 'LIFESTYLE_MISMATCH', 'TIMING', 'FAMILY_CONCERNS', 'NO_CHEMISTRY', 'OTHER');

-- CreateTable
CREATE TABLE "Matchmaker" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Matchmaker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'India',
    "city" TEXT NOT NULL,
    "height" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "undergraduateCollege" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "income" INTEGER NOT NULL,
    "currentCompany" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "maritalStatus" "MaritalStatus" NOT NULL DEFAULT 'NEVER_MARRIED',
    "languagesKnown" TEXT[],
    "siblings" INTEGER NOT NULL DEFAULT 0,
    "religion" TEXT NOT NULL,
    "caste" TEXT,
    "wantKids" "WantKids" NOT NULL DEFAULT 'OPEN',
    "openToRelocate" BOOLEAN NOT NULL DEFAULT false,
    "openToPets" BOOLEAN NOT NULL DEFAULT false,
    "motherTongue" TEXT NOT NULL,
    "dietPreference" "DietPreference" NOT NULL DEFAULT 'VEGETARIAN',
    "smokingPreference" "Frequency" NOT NULL DEFAULT 'NEVER',
    "drinkingPreference" "Frequency" NOT NULL DEFAULT 'NEVER',
    "familyType" "FamilyType" NOT NULL DEFAULT 'NUCLEAR',
    "manglik" "ManglikStatus" NOT NULL DEFAULT 'DONT_KNOW',
    "educationPreference" TEXT,
    "partnerAgePreferenceMin" INTEGER,
    "partnerAgePreferenceMax" INTEGER,
    "preferredCities" TEXT[],
    "relationshipGoals" TEXT NOT NULL,
    "familyExpectations" TEXT,
    "lifestylePreferences" TEXT[],
    "coreValues" TEXT[],
    "nonNegotiables" TEXT[],
    "currentStage" "FunnelStage" NOT NULL DEFAULT 'PROFILE_REVIEW',
    "assignedMatchmakerId" TEXT,
    "lastInteractionDate" TIMESTAMP(3),
    "matchActivityScore" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "category" "NoteCategory" NOT NULL DEFAULT 'GENERAL',
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimelineEvent" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "type" "TimelineEventType" NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TimelineEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "breakdown" JSONB NOT NULL,
    "strengths" TEXT[],
    "concerns" TEXT[],
    "status" "MatchStatus" NOT NULL DEFAULT 'NEW',
    "aiExplanation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchFeedback" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "response" "FeedbackResponse" NOT NULL,
    "reason" "FeedbackReason",
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Matchmaker_email_key" ON "Matchmaker"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- CreateIndex
CREATE INDEX "Customer_gender_idx" ON "Customer"("gender");

-- CreateIndex
CREATE INDEX "Customer_currentStage_idx" ON "Customer"("currentStage");

-- CreateIndex
CREATE INDEX "Customer_city_idx" ON "Customer"("city");

-- CreateIndex
CREATE INDEX "Customer_religion_idx" ON "Customer"("religion");

-- CreateIndex
CREATE INDEX "Customer_assignedMatchmakerId_idx" ON "Customer"("assignedMatchmakerId");

-- CreateIndex
CREATE INDEX "Customer_gender_currentStage_idx" ON "Customer"("gender", "currentStage");

-- CreateIndex
CREATE INDEX "Note_customerId_createdAt_idx" ON "Note"("customerId", "createdAt");

-- CreateIndex
CREATE INDEX "TimelineEvent_customerId_createdAt_idx" ON "TimelineEvent"("customerId", "createdAt");

-- CreateIndex
CREATE INDEX "Match_customerId_overallScore_idx" ON "Match"("customerId", "overallScore");

-- CreateIndex
CREATE INDEX "Match_status_idx" ON "Match"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Match_customerId_candidateId_key" ON "Match"("customerId", "candidateId");

-- CreateIndex
CREATE INDEX "MatchFeedback_matchId_idx" ON "MatchFeedback"("matchId");

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_assignedMatchmakerId_fkey" FOREIGN KEY ("assignedMatchmakerId") REFERENCES "Matchmaker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Matchmaker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineEvent" ADD CONSTRAINT "TimelineEvent_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchFeedback" ADD CONSTRAINT "MatchFeedback_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;
