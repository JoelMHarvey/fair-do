-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."Region" AS ENUM ('UK', 'US');

-- CreateEnum
CREATE TYPE "public"."SessionStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "public"."TherapistStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('CLIENT', 'THERAPIST', 'ADMIN');

-- CreateTable
CREATE TABLE "public"."AlertState" (
    "key" TEXT NOT NULL,
    "firing" BOOLEAN NOT NULL DEFAULT false,
    "lastFiredAt" TIMESTAMP(3),
    "lastValue" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlertState_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "public"."Availability" (
    "id" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Europe/London',

    CONSTRAINT "Availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Broadcast" (
    "id" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "recipientCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Broadcast_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Client" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "questionnaire" JSONB,
    "consentGiven" BOOLEAN NOT NULL DEFAULT false,
    "consentDate" TIMESTAMP(3),
    "consentVersion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "creditBalancePence" INTEGER NOT NULL DEFAULT 0,
    "organisationId" TEXT,
    "referralCode" TEXT,
    "referredByCode" TEXT,
    "country" "public"."Region" NOT NULL DEFAULT 'UK',
    "usState" TEXT,
    "contactEmail" TEXT,
    "phone" TEXT,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ClientDocument" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ClientForm" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "fields" JSONB NOT NULL,
    "token" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "responses" JSONB,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ClientForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ClientInvite" (
    "id" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "token" TEXT NOT NULL,
    "customRatePence" INTEGER,
    "note" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "acceptedClientId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),

    CONSTRAINT "ClientInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Complaint" (
    "id" TEXT NOT NULL,
    "reporterClerkId" TEXT NOT NULL,
    "therapistId" TEXT,
    "sessionId" TEXT,
    "category" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Complaint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CredentialCheck" (
    "id" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "checkedByClerkId" TEXT NOT NULL,
    "registrationBody" TEXT NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CredentialCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CronRun" (
    "name" TEXT NOT NULL,
    "lastRunAt" TIMESTAMP(3) NOT NULL,
    "ok" BOOLEAN NOT NULL DEFAULT true,
    "durationMs" INTEGER,
    "detail" TEXT,

    CONSTRAINT "CronRun_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "public"."FxRate" (
    "base" TEXT NOT NULL DEFAULT 'GBP',
    "rates" JSONB NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FxRate_pkey" PRIMARY KEY ("base")
);

-- CreateTable
CREATE TABLE "public"."GiftVoucher" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "amountPence" INTEGER NOT NULL,
    "purchaserEmail" TEXT NOT NULL,
    "recipientEmail" TEXT,
    "message" TEXT,
    "stripePaymentIntentId" TEXT,
    "redeemed" BOOLEAN NOT NULL DEFAULT false,
    "redeemedByClientId" TEXT,
    "redeemedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GiftVoucher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."InboxMessage" (
    "id" TEXT NOT NULL,
    "mailbox" TEXT NOT NULL,
    "messageId" TEXT,
    "fromEmail" TEXT NOT NULL,
    "fromRole" TEXT,
    "subject" TEXT,
    "bodyPreview" TEXT NOT NULL,
    "category" TEXT,
    "severity" TEXT,
    "confidence" DOUBLE PRECISION,
    "draftReply" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "sentAt" TIMESTAMP(3),
    "escalatedAt" TIMESTAMP(3),
    "handledBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InboxMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Match" (
    "id" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "customRatePence" INTEGER,
    "invitedAt" TIMESTAMP(3),
    "source" TEXT NOT NULL DEFAULT 'marketplace',
    "notes" TEXT,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Message" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "senderClerkId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "fileUrl" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MessageThread" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MessageThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NativeDevice" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NativeDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Organisation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactName" TEXT,
    "seatsTotal" INTEGER NOT NULL DEFAULT 0,
    "creditPoolPence" INTEGER NOT NULL DEFAULT 0,
    "domain" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "discountExpiry" TIMESTAMP(3),
    "discountPercent" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Organisation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OutcomeScore" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "measure" TEXT NOT NULL,
    "measureName" TEXT,
    "score" INTEGER NOT NULL,
    "takenOn" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OutcomeScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Package" (
    "id" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "clientId" TEXT,
    "name" TEXT NOT NULL,
    "sessionsTotal" INTEGER NOT NULL,
    "sessionsUsed" INTEGER NOT NULL DEFAULT 0,
    "pricePence" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Package_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Payment" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "sessionId" TEXT,
    "stripePaymentIntentId" TEXT NOT NULL,
    "stripeChargeId" TEXT,
    "amountTotalPence" INTEGER NOT NULL,
    "platformFeePence" INTEGER NOT NULL,
    "therapistPayoutPence" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'gbp',
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "transferred" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PendingSelfBooking" (
    "id" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "note" TEXT,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PendingSelfBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProcessedStripeEvent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProcessedStripeEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PushSubscription" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Referral" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "referrerClientId" TEXT NOT NULL,
    "refereeClientId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "rewardPence" INTEGER NOT NULL DEFAULT 1000,
    "refereeDiscountPence" INTEGER NOT NULL DEFAULT 1000,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rewardedAt" TIMESTAMP(3),

    CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Review" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Session" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "durationMins" INTEGER NOT NULL DEFAULT 50,
    "status" "public"."SessionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "dailyRoomName" TEXT,
    "dailyRoomUrl" TEXT,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isGroup" BOOLEAN NOT NULL DEFAULT false,
    "isIntroRate" BOOLEAN NOT NULL DEFAULT false,
    "reminderSentAt" TIMESTAMP(3),
    "callEndedAt" TIMESTAMP(3),
    "callStartedAt" TIMESTAMP(3),
    "joinCount" INTEGER NOT NULL DEFAULT 0,
    "clientJoinedAt" TIMESTAMP(3),
    "noShowResolved" BOOLEAN NOT NULL DEFAULT false,
    "therapistJoinedAt" TIMESTAMP(3),
    "guestToken" TEXT,
    "slotKey" TEXT,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SessionParticipant" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "paidPence" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SessionParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Setting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "public"."Subscription" (
    "id" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "tier" TEXT NOT NULL DEFAULT 'starter',
    "status" TEXT NOT NULL DEFAULT 'inactive',
    "commissionBps" INTEGER NOT NULL DEFAULT 200,
    "addOns" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "currentPeriodEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SupervisionLog" (
    "id" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "supervisorName" TEXT,
    "durationMins" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupervisionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Therapist" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "profileImageUrl" TEXT,
    "registrationBody" TEXT NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "registrationExpiry" TIMESTAMP(3) NOT NULL,
    "credentialVerified" BOOLEAN NOT NULL DEFAULT false,
    "credentialDocUrl" TEXT,
    "stripeAccountId" TEXT,
    "stripeOnboarded" BOOLEAN NOT NULL DEFAULT false,
    "status" "public"."TherapistStatus" NOT NULL DEFAULT 'PENDING',
    "sessionRatePence" INTEGER NOT NULL,
    "availableForNew" BOOLEAN NOT NULL DEFAULT true,
    "specialisms" TEXT[],
    "approachTags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "credentialCheckId" TEXT,
    "credentialCheckStatus" TEXT,
    "groupMaxSize" INTEGER NOT NULL DEFAULT 1,
    "groupRatePence" INTEGER,
    "introRatePence" INTEGER,
    "introVideoUrl" TEXT,
    "linkedinUrl" TEXT,
    "psychologyTodayUrl" TEXT,
    "tagline" TEXT,
    "websiteUrl" TEXT,
    "referralCode" TEXT,
    "referredByCode" TEXT,
    "isFoundingMember" BOOLEAN NOT NULL DEFAULT false,
    "photoBaseUrl" TEXT,
    "photoStyle" TEXT,
    "country" "public"."Region" NOT NULL DEFAULT 'UK',
    "licenseState" TEXT,
    "languages" TEXT[] DEFAULT ARRAY['English']::TEXT[],
    "practiceName" TEXT,
    "practiceSlug" TEXT,
    "calendarToken" TEXT,
    "agreementAcceptedAt" TIMESTAMP(3),
    "agreementVersion" TEXT,
    "dpaAcceptedAt" TIMESTAMP(3),
    "insuranceConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "insuranceExpiry" TIMESTAMP(3),
    "insuranceProvider" TEXT,
    "phone" TEXT,
    "professionalTitle" TEXT,
    "credentialSuspended" BOOLEAN NOT NULL DEFAULT false,
    "insReminderStage" INTEGER,
    "regReminderStage" INTEGER,
    "brandColor" TEXT,
    "brandEnabled" BOOLEAN NOT NULL DEFAULT false,
    "brandFooterLine" TEXT,
    "brandLogoUrl" TEXT,
    "replyToEmail" TEXT,

    CONSTRAINT "Therapist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TherapistReferral" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "referrerTherapistId" TEXT NOT NULL,
    "refereeTherapistId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "bonusPence" INTEGER NOT NULL DEFAULT 2500,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rewardedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "TherapistReferral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "country" "public"."Region" NOT NULL DEFAULT 'UK',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Availability_therapistId_idx" ON "public"."Availability"("therapistId" ASC);

-- CreateIndex
CREATE INDEX "Broadcast_therapistId_idx" ON "public"."Broadcast"("therapistId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Client_referralCode_key" ON "public"."Client"("referralCode" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Client_userId_key" ON "public"."Client"("userId" ASC);

-- CreateIndex
CREATE INDEX "ClientDocument_matchId_idx" ON "public"."ClientDocument"("matchId" ASC);

-- CreateIndex
CREATE INDEX "ClientForm_matchId_idx" ON "public"."ClientForm"("matchId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "ClientForm_token_key" ON "public"."ClientForm"("token" ASC);

-- CreateIndex
CREATE INDEX "ClientInvite_email_idx" ON "public"."ClientInvite"("email" ASC);

-- CreateIndex
CREATE INDEX "ClientInvite_therapistId_idx" ON "public"."ClientInvite"("therapistId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "ClientInvite_token_key" ON "public"."ClientInvite"("token" ASC);

-- CreateIndex
CREATE INDEX "Complaint_status_idx" ON "public"."Complaint"("status" ASC);

-- CreateIndex
CREATE INDEX "CredentialCheck_therapistId_idx" ON "public"."CredentialCheck"("therapistId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "GiftVoucher_code_key" ON "public"."GiftVoucher"("code" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "GiftVoucher_stripePaymentIntentId_key" ON "public"."GiftVoucher"("stripePaymentIntentId" ASC);

-- CreateIndex
CREATE INDEX "InboxMessage_mailbox_idx" ON "public"."InboxMessage"("mailbox" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "InboxMessage_messageId_key" ON "public"."InboxMessage"("messageId" ASC);

-- CreateIndex
CREATE INDEX "InboxMessage_status_idx" ON "public"."InboxMessage"("status" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Match_therapistId_clientId_key" ON "public"."Match"("therapistId" ASC, "clientId" ASC);

-- CreateIndex
CREATE INDEX "Message_threadId_createdAt_idx" ON "public"."Message"("threadId" ASC, "createdAt" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "MessageThread_matchId_key" ON "public"."MessageThread"("matchId" ASC);

-- CreateIndex
CREATE INDEX "NativeDevice_clerkId_idx" ON "public"."NativeDevice"("clerkId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "NativeDevice_token_key" ON "public"."NativeDevice"("token" ASC);

-- CreateIndex
CREATE INDEX "OutcomeScore_matchId_idx" ON "public"."OutcomeScore"("matchId" ASC);

-- CreateIndex
CREATE INDEX "Package_clientId_idx" ON "public"."Package"("clientId" ASC);

-- CreateIndex
CREATE INDEX "Package_therapistId_idx" ON "public"."Package"("therapistId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_sessionId_key" ON "public"."Payment"("sessionId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_stripePaymentIntentId_key" ON "public"."Payment"("stripePaymentIntentId" ASC);

-- CreateIndex
CREATE INDEX "PendingSelfBooking_therapistId_idx" ON "public"."PendingSelfBooking"("therapistId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "PendingSelfBooking_token_key" ON "public"."PendingSelfBooking"("token" ASC);

-- CreateIndex
CREATE INDEX "PushSubscription_clerkId_idx" ON "public"."PushSubscription"("clerkId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "PushSubscription_endpoint_key" ON "public"."PushSubscription"("endpoint" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Referral_refereeClientId_key" ON "public"."Referral"("refereeClientId" ASC);

-- CreateIndex
CREATE INDEX "Referral_referrerClientId_idx" ON "public"."Referral"("referrerClientId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Review_sessionId_key" ON "public"."Review"("sessionId" ASC);

-- CreateIndex
CREATE INDEX "Review_therapistId_idx" ON "public"."Review"("therapistId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Session_dailyRoomName_key" ON "public"."Session"("dailyRoomName" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Session_guestToken_key" ON "public"."Session"("guestToken" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Session_slotKey_key" ON "public"."Session"("slotKey" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "SessionParticipant_sessionId_clientId_key" ON "public"."SessionParticipant"("sessionId" ASC, "clientId" ASC);

-- CreateIndex
CREATE INDEX "SessionParticipant_sessionId_idx" ON "public"."SessionParticipant"("sessionId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON "public"."Subscription"("stripeSubscriptionId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_therapistId_key" ON "public"."Subscription"("therapistId" ASC);

-- CreateIndex
CREATE INDEX "SupervisionLog_therapistId_idx" ON "public"."SupervisionLog"("therapistId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Therapist_calendarToken_key" ON "public"."Therapist"("calendarToken" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Therapist_practiceSlug_key" ON "public"."Therapist"("practiceSlug" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Therapist_referralCode_key" ON "public"."Therapist"("referralCode" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Therapist_stripeAccountId_key" ON "public"."Therapist"("stripeAccountId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Therapist_userId_key" ON "public"."Therapist"("userId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "TherapistReferral_refereeTherapistId_key" ON "public"."TherapistReferral"("refereeTherapistId" ASC);

-- CreateIndex
CREATE INDEX "TherapistReferral_referrerTherapistId_idx" ON "public"."TherapistReferral"("referrerTherapistId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "public"."User"("clerkId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email" ASC);

-- AddForeignKey
ALTER TABLE "public"."Availability" ADD CONSTRAINT "Availability_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "public"."Therapist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Broadcast" ADD CONSTRAINT "Broadcast_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "public"."Therapist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Client" ADD CONSTRAINT "Client_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "public"."Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Client" ADD CONSTRAINT "Client_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClientDocument" ADD CONSTRAINT "ClientDocument_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "public"."Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClientForm" ADD CONSTRAINT "ClientForm_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "public"."Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClientInvite" ADD CONSTRAINT "ClientInvite_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "public"."Therapist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Complaint" ADD CONSTRAINT "Complaint_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "public"."Therapist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CredentialCheck" ADD CONSTRAINT "CredentialCheck_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "public"."Therapist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Match" ADD CONSTRAINT "Match_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Match" ADD CONSTRAINT "Match_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "public"."Therapist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "public"."MessageThread"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MessageThread" ADD CONSTRAINT "MessageThread_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MessageThread" ADD CONSTRAINT "MessageThread_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "public"."Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MessageThread" ADD CONSTRAINT "MessageThread_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "public"."Therapist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OutcomeScore" ADD CONSTRAINT "OutcomeScore_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "public"."Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Package" ADD CONSTRAINT "Package_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Package" ADD CONSTRAINT "Package_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "public"."Therapist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Referral" ADD CONSTRAINT "Referral_refereeClientId_fkey" FOREIGN KEY ("refereeClientId") REFERENCES "public"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Referral" ADD CONSTRAINT "Referral_referrerClientId_fkey" FOREIGN KEY ("referrerClientId") REFERENCES "public"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "public"."Therapist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Session" ADD CONSTRAINT "Session_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Session" ADD CONSTRAINT "Session_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "public"."Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Session" ADD CONSTRAINT "Session_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "public"."Therapist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SessionParticipant" ADD CONSTRAINT "SessionParticipant_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SessionParticipant" ADD CONSTRAINT "SessionParticipant_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Subscription" ADD CONSTRAINT "Subscription_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "public"."Therapist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SupervisionLog" ADD CONSTRAINT "SupervisionLog_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "public"."Therapist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Therapist" ADD CONSTRAINT "Therapist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TherapistReferral" ADD CONSTRAINT "TherapistReferral_refereeTherapistId_fkey" FOREIGN KEY ("refereeTherapistId") REFERENCES "public"."Therapist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TherapistReferral" ADD CONSTRAINT "TherapistReferral_referrerTherapistId_fkey" FOREIGN KEY ("referrerTherapistId") REFERENCES "public"."Therapist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

