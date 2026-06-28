-- Migration: 0001_rename_tables_and_add_preferences
-- Renames AntiSwear* tables to Automod*, renames enum value,
-- and adds dashboardPreference column to User.

-- 1. Rename BlockWordAction enum value
ALTER TYPE "BlockWordAction" RENAME VALUE 'CENSOR_MESSAGE' TO 'CENSOR_WORD';

-- 2. Rename tables
ALTER TABLE "AntiSwearRule" RENAME TO "AutomodRule";
ALTER TABLE "AntiSwearPattern" RENAME TO "AutomodPattern";
ALTER TABLE "AntiSwearWhitelist" RENAME TO "AutomodWhitelist";

-- 3. Rename unique constraints on AutomodRule
ALTER TABLE "AutomodRule" RENAME CONSTRAINT "uq_antiswearrule_hub_name" TO "uq_automodrule_hub_name";
ALTER TABLE "AutomodRule" RENAME CONSTRAINT "uq_antiswearrule_server_name" TO "uq_automodrule_server_name";
ALTER TABLE "AutomodRule" RENAME CONSTRAINT "check_antiswearrule_target" TO "check_automodrule_target";

-- 4. Rename foreign key constraints on AutomodRule
ALTER TABLE "AutomodRule" RENAME CONSTRAINT "AntiSwearRule_createdBy_fkey" TO "AutomodRule_createdBy_fkey";
ALTER TABLE "AutomodRule" RENAME CONSTRAINT "AntiSwearRule_hubId_fkey" TO "AutomodRule_hubId_fkey";
ALTER TABLE "AutomodRule" RENAME CONSTRAINT "AntiSwearRule_serverId_fkey" TO "AutomodRule_serverId_fkey";

-- 5. Rename foreign key on AutomodPattern referencing AutomodRule
ALTER TABLE "AutomodPattern" RENAME CONSTRAINT "AntiSwearPattern_ruleId_fkey" TO "AutomodPattern_ruleId_fkey";

-- 6. Rename foreign keys on AutomodWhitelist
ALTER TABLE "AutomodWhitelist" RENAME CONSTRAINT "AntiSwearWhitelist_ruleId_fkey" TO "AutomodWhitelist_ruleId_fkey";
ALTER TABLE "AutomodWhitelist" RENAME CONSTRAINT "AntiSwearWhitelist_createdBy_fkey" TO "AutomodWhitelist_createdBy_fkey";

-- 7. Add dashboardPreference column to User
ALTER TABLE "User" ADD COLUMN "dashboardPreference" jsonb;
