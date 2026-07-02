-- DropForeignKey
ALTER TABLE "Broadcast" DROP CONSTRAINT "Broadcast_teacherId_fkey";

-- AlterTable
ALTER TABLE "Broadcast" ADD COLUMN     "mailGroupId" TEXT,
ADD COLUMN     "organisationId" TEXT,
ADD COLUMN     "sentByClerkId" TEXT,
ALTER COLUMN "teacherId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Organisation" ADD COLUMN     "accentColor" TEXT,
ADD COLUMN     "brandColor" TEXT,
ADD COLUMN     "brandLogoUrl" TEXT,
ADD COLUMN     "customDomain" TEXT,
ADD COLUMN     "footerLine" TEXT,
ADD COLUMN     "plan" TEXT NOT NULL DEFAULT 'school',
ADD COLUMN     "settings" JSONB,
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "welcomeMessage" TEXT;

-- CreateTable
CREATE TABLE "OrgMembership" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ADMIN',
    "invitedEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrgMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YearGroup" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "YearGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "House" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,

    CONSTRAINT "House_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchoolClass" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'form',
    "yearGroupId" TEXT,
    "subjectId" TEXT,

    CONSTRAINT "SchoolClass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrgSubject" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "marketplaceKey" TEXT,
    "examBoard" TEXT,

    CONSTRAINT "OrgSubject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentOrgProfile" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "yearGroupId" TEXT,
    "houseId" TEXT,
    "classIds" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "StudentOrgProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffContact" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "department" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "photoUrl" TEXT,
    "isDSL" BOOLEAN NOT NULL DEFAULT false,
    "isTutoringCoordinator" BOOLEAN NOT NULL DEFAULT false,
    "visibility" TEXT NOT NULL DEFAULT 'parents',
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "StaffContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MailGroup" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rule" JSONB,

    CONSTRAINT "MailGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MailGroupMember" (
    "id" TEXT NOT NULL,
    "mailGroupId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MailGroupMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrgCalendar" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "icsToken" TEXT NOT NULL,

    CONSTRAINT "OrgCalendar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrgCalendarEvent" (
    "id" TEXT NOT NULL,
    "calendarId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "allDay" BOOLEAN NOT NULL DEFAULT true,
    "kind" TEXT NOT NULL DEFAULT 'event',

    CONSTRAINT "OrgCalendarEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrgMembership_userId_idx" ON "OrgMembership"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OrgMembership_organisationId_userId_key" ON "OrgMembership"("organisationId", "userId");

-- CreateIndex
CREATE INDEX "YearGroup_organisationId_idx" ON "YearGroup"("organisationId");

-- CreateIndex
CREATE UNIQUE INDEX "YearGroup_organisationId_name_key" ON "YearGroup"("organisationId", "name");

-- CreateIndex
CREATE INDEX "House_organisationId_idx" ON "House"("organisationId");

-- CreateIndex
CREATE UNIQUE INDEX "House_organisationId_name_key" ON "House"("organisationId", "name");

-- CreateIndex
CREATE INDEX "SchoolClass_organisationId_idx" ON "SchoolClass"("organisationId");

-- CreateIndex
CREATE UNIQUE INDEX "SchoolClass_organisationId_name_key" ON "SchoolClass"("organisationId", "name");

-- CreateIndex
CREATE INDEX "OrgSubject_organisationId_idx" ON "OrgSubject"("organisationId");

-- CreateIndex
CREATE UNIQUE INDEX "OrgSubject_organisationId_name_key" ON "OrgSubject"("organisationId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "StudentOrgProfile_studentId_key" ON "StudentOrgProfile"("studentId");

-- CreateIndex
CREATE INDEX "StudentOrgProfile_organisationId_idx" ON "StudentOrgProfile"("organisationId");

-- CreateIndex
CREATE INDEX "StudentOrgProfile_organisationId_yearGroupId_idx" ON "StudentOrgProfile"("organisationId", "yearGroupId");

-- CreateIndex
CREATE INDEX "StaffContact_organisationId_idx" ON "StaffContact"("organisationId");

-- CreateIndex
CREATE INDEX "MailGroup_organisationId_idx" ON "MailGroup"("organisationId");

-- CreateIndex
CREATE UNIQUE INDEX "MailGroup_organisationId_name_key" ON "MailGroup"("organisationId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "MailGroupMember_mailGroupId_email_key" ON "MailGroupMember"("mailGroupId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "OrgCalendar_icsToken_key" ON "OrgCalendar"("icsToken");

-- CreateIndex
CREATE INDEX "OrgCalendar_organisationId_idx" ON "OrgCalendar"("organisationId");

-- CreateIndex
CREATE UNIQUE INDEX "OrgCalendar_organisationId_name_key" ON "OrgCalendar"("organisationId", "name");

-- CreateIndex
CREATE INDEX "OrgCalendarEvent_calendarId_startsAt_idx" ON "OrgCalendarEvent"("calendarId", "startsAt");

-- CreateIndex
CREATE INDEX "Broadcast_organisationId_idx" ON "Broadcast"("organisationId");

-- CreateIndex
CREATE UNIQUE INDEX "Organisation_slug_key" ON "Organisation"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Organisation_customDomain_key" ON "Organisation"("customDomain");

-- AddForeignKey
ALTER TABLE "OrgMembership" ADD CONSTRAINT "OrgMembership_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YearGroup" ADD CONSTRAINT "YearGroup_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "House" ADD CONSTRAINT "House_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolClass" ADD CONSTRAINT "SchoolClass_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolClass" ADD CONSTRAINT "SchoolClass_yearGroupId_fkey" FOREIGN KEY ("yearGroupId") REFERENCES "YearGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolClass" ADD CONSTRAINT "SchoolClass_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "OrgSubject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgSubject" ADD CONSTRAINT "OrgSubject_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentOrgProfile" ADD CONSTRAINT "StudentOrgProfile_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentOrgProfile" ADD CONSTRAINT "StudentOrgProfile_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentOrgProfile" ADD CONSTRAINT "StudentOrgProfile_yearGroupId_fkey" FOREIGN KEY ("yearGroupId") REFERENCES "YearGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentOrgProfile" ADD CONSTRAINT "StudentOrgProfile_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffContact" ADD CONSTRAINT "StaffContact_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MailGroup" ADD CONSTRAINT "MailGroup_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MailGroupMember" ADD CONSTRAINT "MailGroupMember_mailGroupId_fkey" FOREIGN KEY ("mailGroupId") REFERENCES "MailGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgCalendar" ADD CONSTRAINT "OrgCalendar_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgCalendarEvent" ADD CONSTRAINT "OrgCalendarEvent_calendarId_fkey" FOREIGN KEY ("calendarId") REFERENCES "OrgCalendar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Broadcast" ADD CONSTRAINT "Broadcast_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Broadcast" ADD CONSTRAINT "Broadcast_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

