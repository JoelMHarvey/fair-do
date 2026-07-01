-- Migration: credential automation
-- Adds DBS Update Service consent fields to Teacher, and a new CredentialDocument
-- table that stores certificate upload URLs and Claude Vision extraction results.

-- DBS Update Service consent + automated check state
ALTER TABLE "Teacher"
  ADD COLUMN IF NOT EXISTS "dbsUpdateConsent"   BOOLEAN   NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS "dbsUpdateConsentAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "dbsCheckStatus"     TEXT,
  ADD COLUMN IF NOT EXISTS "dbsLastCheckedAt"   TIMESTAMP(3);

-- Uploaded credential documents with AI-extracted fields
CREATE TABLE IF NOT EXISTS "CredentialDocument" (
  "id"              TEXT         NOT NULL,
  "teacherId"       TEXT         NOT NULL,
  "url"             TEXT         NOT NULL,
  "fileName"        TEXT,
  "uploadedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "extractedAt"     TIMESTAMP(3),
  "extractedName"   TEXT,
  "extractedBody"   TEXT,
  "extractedRef"    TEXT,
  "extractedExpiry" TIMESTAMP(3),
  "confidenceScore" DOUBLE PRECISION,
  "flags"           TEXT[]       NOT NULL DEFAULT ARRAY[]::TEXT[],

  CONSTRAINT "CredentialDocument_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "CredentialDocument_teacherId_idx"
  ON "CredentialDocument"("teacherId");

ALTER TABLE "CredentialDocument"
  DROP CONSTRAINT IF EXISTS "CredentialDocument_teacherId_fkey",
  ADD CONSTRAINT "CredentialDocument_teacherId_fkey"
    FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
