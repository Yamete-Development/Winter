-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."AppealStatus" AS ENUM('PENDING', 'ACCEPTED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."ApprovalStatus" AS ENUM('PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."Badges" AS ENUM('VOTER', 'SUPPORTER', 'TRANSLATOR', 'DEVELOPER', 'STAFF', 'BETA_TESTER', 'HUB_OWNER', 'HUB_MANAGER', 'HUB_MODERATOR', 'TOP_CHATTER');--> statement-breakpoint
CREATE TYPE "public"."BlacklistType" AS ENUM('PERMANENT', 'TEMPORARY');--> statement-breakpoint
CREATE TYPE "public"."BlockWordAction" AS ENUM('BLOCK_MESSAGE', 'CENSOR_MESSAGE', 'SEND_ALERT', 'WARN', 'MUTE', 'BAN', 'BLACKLIST');--> statement-breakpoint
CREATE TYPE "public"."GiftType" AS ENUM('FREE', 'DISCOUNT');--> statement-breakpoint
CREATE TYPE "public"."HubActivityLevel" AS ENUM('LOW', 'MEDIUM', 'HIGH');--> statement-breakpoint
CREATE TYPE "public"."HubVisibility" AS ENUM('PUBLIC', 'PRIVATE', 'UNLISTED');--> statement-breakpoint
CREATE TYPE "public"."InfractionStatus" AS ENUM('ACTIVE', 'REVOKED', 'APPEALED');--> statement-breakpoint
CREATE TYPE "public"."InfractionType" AS ENUM('BAN', 'BLACKLIST', 'MUTE', 'WARNING');--> statement-breakpoint
CREATE TYPE "public"."KeyStatus" AS ENUM('ACTIVE', 'EXPIRED', 'REVOKED', 'PENDING');--> statement-breakpoint
CREATE TYPE "public"."LobbyInfractionType" AS ENUM('WARNING');--> statement-breakpoint
CREATE TYPE "public"."LobbyReportActionType" AS ENUM('WARNED', 'GLOBAL_BLACKLISTED', 'RESOLVED', 'DISMISSED');--> statement-breakpoint
CREATE TYPE "public"."LobbyStatus" AS ENUM('OPEN', 'CLOSED');--> statement-breakpoint
CREATE TYPE "public"."MessageStatus" AS ENUM('PENDING', 'ACTIVE', 'DELETED');--> statement-breakpoint
CREATE TYPE "public"."PatternMatchType" AS ENUM('EXACT', 'PREFIX', 'SUFFIX', 'WILDCARD');--> statement-breakpoint
CREATE TYPE "public"."PremiumTier" AS ENUM('CORE', 'PLUS', 'PRO');--> statement-breakpoint
CREATE TYPE "public"."ReportStatus" AS ENUM('PENDING', 'RESOLVED', 'IGNORED');--> statement-breakpoint
CREATE TYPE "public"."Role" AS ENUM('MODERATOR', 'MANAGER');--> statement-breakpoint
CREATE TYPE "public"."SubscriptionStatus" AS ENUM('ACTIVE', 'PAST_DUE', 'CANCELLED', 'PENDING');--> statement-breakpoint
CREATE TABLE "Connection" (
	"id" text PRIMARY KEY NOT NULL,
	"channelId" text NOT NULL,
	"invite" text,
	"webhookURL" text NOT NULL,
	"serverId" text NOT NULL,
	"hubId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"lastActive" timestamp DEFAULT now() NOT NULL,
	"parentId" text,
	"webhookSecondaryURL" text,
	"connected" boolean DEFAULT true NOT NULL,
	"pausedByBot" boolean DEFAULT false NOT NULL,
	CONSTRAINT "Connection_channelId_key" UNIQUE("channelId"),
	CONSTRAINT "Connection_channelId_serverId_key" UNIQUE("channelId","serverId"),
	CONSTRAINT "Connection_hubId_serverId_key" UNIQUE("serverId","hubId")
);
--> statement-breakpoint
CREATE TABLE "Broadcast" (
	"id" text PRIMARY KEY NOT NULL,
	"messageId" text NOT NULL,
	"guildId" text NOT NULL,
	"channelId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Message" (
	"id" text PRIMARY KEY NOT NULL,
	"hubId" text NOT NULL,
	"content" varchar(4000) NOT NULL,
	"imageUrl" varchar,
	"channelId" text NOT NULL,
	"guildId" text NOT NULL,
	"authorId" text NOT NULL,
	"referredMessageId" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"status" "MessageStatus" DEFAULT 'ACTIVE' NOT NULL,
	"deletionQueuedAt" timestamp,
	"retentionUntil" timestamp
);
--> statement-breakpoint
CREATE TABLE "DevAlerts" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"imageUrl" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"thumbnailUrl" text
);
--> statement-breakpoint
CREATE TABLE "BlockWord" (
	"id" text PRIMARY KEY NOT NULL,
	"hubId" text,
	"name" text NOT NULL,
	"createdBy" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"words" text NOT NULL,
	"actions" "BlockWordAction""[] NOT NULL,
	"serverId" text,
	CONSTRAINT "uq_blockword_hub_name" UNIQUE("hubId","name"),
	CONSTRAINT "uq_blockword_server_name" UNIQUE("name","serverId"),
	CONSTRAINT "check_blockword_target" CHECK ((("hubId" IS NOT NULL) AND ("serverId" IS NULL)) OR (("hubId" IS NULL) AND ("serverId" IS NOT NULL)))
);
--> statement-breakpoint
CREATE TABLE "AutoModEscalationRule" (
	"id" text PRIMARY KEY NOT NULL,
	"hubId" text,
	"serverId" text,
	"triggerThreshold" integer NOT NULL,
	"triggerWindowMinutes" integer NOT NULL,
	"action" "BlockWordAction" NOT NULL,
	"createdBy" text NOT NULL,
	"actionDurationMinutes" integer,
	"enabled" boolean DEFAULT false NOT NULL,
	"includeManual" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "check_escalationrule_target" CHECK ((("hubId" IS NOT NULL) AND ("serverId" IS NULL)) OR (("hubId" IS NULL) AND ("serverId" IS NOT NULL)))
);
--> statement-breakpoint
CREATE TABLE "User" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"image" text,
	"lastMessageAt" timestamp DEFAULT now(),
	"inboxLastReadDate" timestamp DEFAULT now(),
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	"activityLevel" "HubActivityLevel",
	"email" text,
	"emailVerified" boolean,
	"showBadges" boolean DEFAULT true NOT NULL,
	"mentionOnReply" boolean DEFAULT true NOT NULL,
	"showNsfwHubs" boolean DEFAULT false NOT NULL,
	"locale" text,
	"lastVoted" timestamp,
	"badges" "Badges""[] DEFAULT '{""}' NOT NULL,
	"voteRemindersEnabled" boolean DEFAULT true NOT NULL,
	"lastVoteReminderSent" timestamp,
	"customerId" text
);
--> statement-breakpoint
CREATE TABLE "AntiSwearRule" (
	"id" text PRIMARY KEY NOT NULL,
	"hubId" text,
	"name" text NOT NULL,
	"createdBy" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"muteDurationMinutes" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"actions" "BlockWordAction""[] DEFAULT '{""}' NOT NULL,
	"serverId" text,
	CONSTRAINT "uq_antiswearrule_hub_name" UNIQUE("hubId","name"),
	CONSTRAINT "uq_antiswearrule_server_name" UNIQUE("name","serverId"),
	CONSTRAINT "check_antiswearrule_target" CHECK ((("hubId" IS NOT NULL) AND ("serverId" IS NULL)) OR (("hubId" IS NULL) AND ("serverId" IS NOT NULL)))
);
--> statement-breakpoint
CREATE TABLE "NsfwOverride" (
	"id" text PRIMARY KEY NOT NULL,
	"createdById" text NOT NULL,
	"xxh3" varchar(64),
	"phash" varchar(255),
	"isSafe" boolean DEFAULT true NOT NULL,
	"hubId" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "NsfwReviewQueue" (
	"id" text PRIMARY KEY NOT NULL,
	"authorId" text NOT NULL,
	"url" text NOT NULL,
	"score" double precision NOT NULL,
	"messageId" text,
	"xxh3" varchar(64),
	"phash" varchar(255),
	"hubId" text,
	"status" varchar(20) DEFAULT 'PENDING' NOT NULL,
	"handledById" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "AntiSwearPattern" (
	"id" text PRIMARY KEY NOT NULL,
	"ruleId" text NOT NULL,
	"pattern" text NOT NULL,
	"matchType" "PatternMatchType" DEFAULT 'EXACT' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Hub" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" varchar(1024) NOT NULL,
	"ownerId" text NOT NULL,
	"iconUrl" varchar(512) NOT NULL,
	"shortDescription" varchar(100),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastActive" timestamp DEFAULT now() NOT NULL,
	"lastNameChange" timestamp DEFAULT now(),
	"bannerUrl" text,
	"welcomeMessage" text,
	"language" text,
	"region" text,
	"customBadges" jsonb,
	"settings" integer DEFAULT 0 NOT NULL,
	"appealCooldownHours" integer DEFAULT 168 NOT NULL,
	"weeklyMessageCount" integer DEFAULT 0 NOT NULL,
	"locked" boolean DEFAULT false NOT NULL,
	"nsfw" boolean DEFAULT false NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"partnered" boolean DEFAULT false NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"rules" text[] NOT NULL,
	"activityLevel" "HubActivityLevel" DEFAULT 'LOW' NOT NULL,
	"averageRating" double precision DEFAULT 0,
	"visibility" "HubVisibility" DEFAULT 'PUBLIC' NOT NULL,
	"connectionCount" integer DEFAULT 0 NOT NULL,
	"upvoteCount" integer DEFAULT 0 NOT NULL,
	"reviewCount" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "Hub_name_key" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "AntiSwearWhitelist" (
	"id" text PRIMARY KEY NOT NULL,
	"ruleId" text NOT NULL,
	"word" text NOT NULL,
	"createdBy" text NOT NULL,
	"reason" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "AntiSwearWhitelist_ruleId_word_key" UNIQUE("ruleId","word")
);
--> statement-breakpoint
CREATE TABLE "Appeal" (
	"infractionId" text NOT NULL,
	"userId" text NOT NULL,
	"reason" varchar(1000) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"status" "AppealStatus" DEFAULT 'PENDING' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Infraction" (
	"id" text PRIMARY KEY NOT NULL,
	"hubId" text NOT NULL,
	"moderatorId" text NOT NULL,
	"reason" varchar(500) NOT NULL,
	"expiresAt" timestamp,
	"userId" text,
	"serverId" text,
	"serverName" text,
	"type" "InfractionType" NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"status" "InfractionStatus" DEFAULT 'ACTIVE' NOT NULL,
	"notified" boolean DEFAULT false NOT NULL,
	"evidenceMessageId" text,
	"evidenceContent" text,
	"evidenceImageUrl" text,
	"evidenceAuthorId" text,
	"evidenceAuthorName" text,
	"evidenceChannelId" text,
	"evidenceGuildId" text,
	"evidenceGuildName" text,
	"evidenceCreatedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "Blacklist" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"moderatorId" text NOT NULL,
	"reason" text NOT NULL,
	"expiresAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now(),
	"type" "BlacklistType" DEFAULT 'PERMANENT' NOT NULL,
	"lobbyReportId" text,
	"hubReportId" text,
	"deletedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "HubActivityMetrics" (
	"id" text PRIMARY KEY NOT NULL,
	"hubId" text NOT NULL,
	"lastUpdated" timestamp DEFAULT now() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"messagesLast24h" integer DEFAULT 0 NOT NULL,
	"activeUsersLast24h" integer DEFAULT 0 NOT NULL,
	"newConnectionsLast24h" integer DEFAULT 0 NOT NULL,
	"messagesLast7d" integer DEFAULT 0 NOT NULL,
	"activeUsersLast7d" integer DEFAULT 0 NOT NULL,
	"newConnectionsLast7d" integer DEFAULT 0 NOT NULL,
	"memberGrowthRate" double precision DEFAULT 0 NOT NULL,
	"engagementRate" double precision DEFAULT 0 NOT NULL,
	"trendingScore" double precision DEFAULT 0 NOT NULL,
	CONSTRAINT "HubActivityMetrics_hubId_key" UNIQUE("hubId")
);
--> statement-breakpoint
CREATE TABLE "GlobalReport" (
	"id" text PRIMARY KEY NOT NULL,
	"reporterId" text NOT NULL,
	"reportedUserId" text NOT NULL,
	"reportedServerId" text NOT NULL,
	"messageId" text,
	"reason" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"handledBy" text,
	"status" "ReportStatus" DEFAULT 'PENDING' NOT NULL,
	"handledAt" timestamp,
	"reportMessageId" text,
	"reportChannelId" text,
	"actionTaken" text
);
--> statement-breakpoint
CREATE TABLE "HubInvite" (
	"hubId" text NOT NULL,
	"expires" timestamp,
	"code" text PRIMARY KEY NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"maxUses" integer DEFAULT 0 NOT NULL,
	"uses" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "HubAnnouncement" (
	"id" text PRIMARY KEY NOT NULL,
	"hubId" text NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"frequencyMs" bigint NOT NULL,
	"previousAnnouncement" timestamp,
	"nextAnnouncement" timestamp,
	"imageUrl" text,
	"thumbnailUrl" text
);
--> statement-breakpoint
CREATE TABLE "HubLogConfig" (
	"id" text PRIMARY KEY NOT NULL,
	"hubId" text NOT NULL,
	"modLogsChannelId" text,
	"modLogsRoleId" text,
	"joinLeavesChannelId" text,
	"joinLeavesRoleId" text,
	"appealsChannelId" text,
	"appealsRoleId" text,
	"reportsChannelId" text,
	"reportsRoleId" text,
	"networkAlertsChannelId" text,
	"networkAlertsRoleId" text,
	"messageModerationChannelId" text,
	"messageModerationRoleId" text,
	CONSTRAINT "HubLogConfig_hubId_key" UNIQUE("hubId")
);
--> statement-breakpoint
CREATE TABLE "HubMessageReaction" (
	"id" varchar PRIMARY KEY NOT NULL,
	"messageId" text NOT NULL,
	"emoji" varchar(64) NOT NULL,
	"users" text[] NOT NULL,
	CONSTRAINT "HubMessageReaction_messageId_emoji_key" UNIQUE("messageId","emoji")
);
--> statement-breakpoint
CREATE TABLE "HubModerator" (
	"id" text PRIMARY KEY NOT NULL,
	"hubId" text NOT NULL,
	"userId" text NOT NULL,
	"role" "Role" NOT NULL,
	CONSTRAINT "HubModerator_hubId_userId_key" UNIQUE("hubId","userId")
);
--> statement-breakpoint
CREATE TABLE "HubReport" (
	"id" text PRIMARY KEY NOT NULL,
	"hubId" text NOT NULL,
	"reporterId" text NOT NULL,
	"reportedUserId" text NOT NULL,
	"reportedServerId" text NOT NULL,
	"messageId" text,
	"reason" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"handledBy" text,
	"status" "ReportStatus" DEFAULT 'PENDING' NOT NULL,
	"handledAt" timestamp,
	"reportMessageId" text,
	"reportChannelId" text,
	"actionTaken" text
);
--> statement-breakpoint
CREATE TABLE "HubReview" (
	"id" text PRIMARY KEY NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"rating" integer NOT NULL,
	"text" text NOT NULL,
	"hubId" text NOT NULL,
	"userId" text NOT NULL,
	CONSTRAINT "HubReview_hubId_userId_key" UNIQUE("hubId","userId")
);
--> statement-breakpoint
CREATE TABLE "HubRulesAcceptance" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"hubId" text NOT NULL,
	"acceptedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "HubRulesAcceptance_userId_hubId_key" UNIQUE("userId","hubId")
);
--> statement-breakpoint
CREATE TABLE "HubUpvote" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"hubId" text NOT NULL,
	CONSTRAINT "HubUpvote_hubId_userId_key" UNIQUE("userId","hubId")
);
--> statement-breakpoint
CREATE TABLE "ServerBlacklist" (
	"id" text PRIMARY KEY NOT NULL,
	"serverId" text NOT NULL,
	"moderatorId" text NOT NULL,
	"reason" varchar(500) NOT NULL,
	"duration" integer,
	"expiresAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"type" "BlacklistType" DEFAULT 'PERMANENT' NOT NULL,
	"lobbyReportId" text,
	"hubReportId" text,
	"deletedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "ReputationLog" (
	"id" text PRIMARY KEY NOT NULL,
	"giverId" text NOT NULL,
	"receiverId" text NOT NULL,
	"reason" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"automatic" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ServerBlocklist" (
	"id" text PRIMARY KEY NOT NULL,
	"serverId" text NOT NULL,
	"blockedUserId" text,
	"blockedServerId" text,
	"reason" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ServerBlocklist_serverId_blockedServerId_key" UNIQUE("serverId","blockedServerId"),
	CONSTRAINT "ServerBlocklist_serverId_blockedUserId_key" UNIQUE("serverId","blockedUserId"),
	CONSTRAINT "check_no_self_block" CHECK (("blockedServerId" IS NULL) OR ("blockedServerId" <> "serverId")),
	CONSTRAINT "check_only_one_blocked" CHECK ((("blockedUserId" IS NOT NULL) AND ("blockedServerId" IS NULL)) OR (("blockedUserId" IS NULL) AND ("blockedServerId" IS NOT NULL)))
);
--> statement-breakpoint
CREATE TABLE "Achievement" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"badgeEmoji" text NOT NULL,
	"badgeUrl" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"threshold" integer DEFAULT 1 NOT NULL,
	"secret" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "UserAchievement" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"achievementId" text NOT NULL,
	"unlockedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "UserAchievement_userId_achievementId_key" UNIQUE("userId","achievementId")
);
--> statement-breakpoint
CREATE TABLE "Session" (
	"userId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"token" text NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	CONSTRAINT "Session_token_key" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "_HubToTag" (
	"A" text NOT NULL,
	"B" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Tag" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text,
	"description" text,
	"color" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"isOfficial" boolean DEFAULT false NOT NULL,
	"usageCount" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "Tag_name_key" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "ServerData" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"lastMessageAt" timestamp DEFAULT now() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"inviteCode" text,
	"messageCount" integer DEFAULT 0 NOT NULL,
	"iconUrl" text,
	"callCount" integer DEFAULT 0 NOT NULL,
	"prefix" text,
	"hideServerName" boolean DEFAULT false NOT NULL,
	"pingOnMatch" boolean DEFAULT false NOT NULL,
	"autoRequeueOnSkip" boolean DEFAULT false NOT NULL,
	"autoRequeueOnHangup" boolean DEFAULT false NOT NULL,
	"filterNsfw" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Bot" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"image" varchar(512),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"shortDescription" varchar(255) NOT NULL,
	"longDescription" text NOT NULL,
	"features" text NOT NULL,
	"state" "ApprovalStatus" DEFAULT 'PENDING' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "AllowedBots" (
	"id" text PRIMARY KEY NOT NULL,
	"hubId" text NOT NULL,
	"botId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Account" (
	"userId" text NOT NULL,
	"scope" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"idToken" text,
	"accessTokenExpiresAt" timestamp,
	"refreshTokenExpiresAt" timestamp,
	"password" text
);
--> statement-breakpoint
CREATE TABLE "Verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "_BotToTag" (
	"A" text NOT NULL,
	"B" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "BotTag" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"category" varchar(50),
	"description" varchar(255),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "BotTag_name_key" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "HubServerStats" (
	"id" text PRIMARY KEY NOT NULL,
	"hubId" text NOT NULL,
	"serverId" text NOT NULL,
	"year" integer NOT NULL,
	"month" integer NOT NULL,
	"messageCount" integer DEFAULT 0 NOT NULL,
	"lastMessageAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "HubServerStats_hub_server_year_month_key" UNIQUE("hubId","serverId","year","month")
);
--> statement-breakpoint
CREATE TABLE "HubUserStats" (
	"id" text PRIMARY KEY NOT NULL,
	"hubId" text NOT NULL,
	"userId" text NOT NULL,
	"year" integer NOT NULL,
	"month" integer NOT NULL,
	"messageCount" integer DEFAULT 0 NOT NULL,
	"lastMessageAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "HubUserStats_hub_user_year_month_key" UNIQUE("hubId","userId","year","month")
);
--> statement-breakpoint
CREATE TABLE "StripeEvent" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "GiftCode" (
	"id" text PRIMARY KEY NOT NULL,
	"type" "GiftType" NOT NULL,
	"tier" "PremiumTier" NOT NULL,
	"purchasedBy" text NOT NULL,
	"claimedBy" text,
	"discountCouponId" text,
	"isClaimed" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"claimedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "PremiumKey" (
	"id" text PRIMARY KEY NOT NULL,
	"tier" "PremiumTier" NOT NULL,
	"purchasedBy" text,
	"subscriptionId" text NOT NULL,
	"assignedUser" text,
	"assignedGuild" text,
	"assignedHub" text,
	"status" "KeyStatus" DEFAULT 'PENDING' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "StripeSubscription" (
	"id" text PRIMARY KEY NOT NULL,
	"customerId" text NOT NULL,
	"tier" "PremiumTier" NOT NULL,
	"currentPeriodEnd" timestamp NOT NULL,
	"cancelAtPeriodEnd" boolean NOT NULL,
	"status" "SubscriptionStatus" DEFAULT 'PENDING' NOT NULL,
	"lastEventTime" bigint,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Lobby" (
	"id" varchar PRIMARY KEY NOT NULL,
	"status" "LobbyStatus" NOT NULL,
	"maxMemberCap" integer NOT NULL,
	"messageCount" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"closedAt" timestamp,
	"callStartedAt" timestamp,
	"durationSeconds" integer
);
--> statement-breakpoint
CREATE TABLE "LobbyMessage" (
	"id" varchar PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"lobbyId" text NOT NULL,
	"sourceMemberId" text,
	"sourceChannelId" text,
	"authorId" text NOT NULL,
	"replyToId" text,
	"original" boolean NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"attachmentUrls" text[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE "BetaServer" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"invitedById" text NOT NULL,
	"invitedAt" timestamp NOT NULL,
	"isActive" boolean NOT NULL,
	"maxLobbies" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "LobbyMember" (
	"id" varchar PRIMARY KEY NOT NULL,
	"lobbyId" text NOT NULL,
	"webhookUrl" text NOT NULL,
	"channelId" text NOT NULL,
	"invokerUserId" text NOT NULL,
	"invokerServerId" text NOT NULL,
	"joinedAt" timestamp DEFAULT now() NOT NULL,
	"leftAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "LobbyMessageDelivery" (
	"id" varchar PRIMARY KEY NOT NULL,
	"lobbyMessageId" text NOT NULL,
	"targetMemberId" text NOT NULL,
	"webhookMessageId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "LobbyReport" (
	"id" varchar PRIMARY KEY NOT NULL,
	"reason" text NOT NULL,
	"lobbyId" text NOT NULL,
	"reporterId" text NOT NULL,
	"reportedMessageId" text,
	"handledBy" text,
	"status" "ReportStatus" DEFAULT 'PENDING' NOT NULL,
	"handledAt" timestamp,
	"actionTaken" text,
	"reportChannelId" text,
	"reportMessageId" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "UserStats" (
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"userId" text PRIMARY KEY NOT NULL,
	"voteCount" integer DEFAULT 0 NOT NULL,
	"reputation" integer DEFAULT 0 NOT NULL,
	"messageCount" integer DEFAULT 0 NOT NULL,
	"callCount" integer DEFAULT 0 NOT NULL,
	"hubJoinCount" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "UserStats_callCount_check" CHECK ("callCount" >= 0),
	CONSTRAINT "UserStats_hubJoinCount_check" CHECK ("hubJoinCount" >= 0),
	CONSTRAINT "UserStats_messageCount_check" CHECK ("messageCount" >= 0),
	CONSTRAINT "UserStats_reputation_check" CHECK (reputation >= 0),
	CONSTRAINT "UserStats_voteCount_check" CHECK ("voteCount" >= 0)
);
--> statement-breakpoint
CREATE TABLE "LobbyInfraction" (
	"id" varchar PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"moderatorId" text NOT NULL,
	"infractionType" "LobbyInfractionType" NOT NULL,
	"reason" text NOT NULL,
	"reportId" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "LobbyReportActionLog" (
	"id" varchar PRIMARY KEY NOT NULL,
	"reportId" text NOT NULL,
	"actionType" "LobbyReportActionType" NOT NULL,
	"moderatorId" text NOT NULL,
	"targetUserId" text,
	"reason" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "UserAchievementProgress" (
	"userId" text NOT NULL,
	"achievementId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"currentValue" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "UserAchievementProgress_pkey" PRIMARY KEY("userId","achievementId"),
	CONSTRAINT "UserAchievementProgress_currentValue_check" CHECK ("currentValue" >= 0)
);
--> statement-breakpoint
ALTER TABLE "Connection" ADD CONSTRAINT "Connection_hubId_fkey" FOREIGN KEY ("hubId") REFERENCES "public"."Hub"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Connection" ADD CONSTRAINT "Connection_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "public"."ServerData"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Broadcast" ADD CONSTRAINT "Broadcast_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "public"."Message"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Message" ADD CONSTRAINT "Message_hubId_fkey" FOREIGN KEY ("hubId") REFERENCES "public"."Hub"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Message" ADD CONSTRAINT "Message_referredMessageId_fkey" FOREIGN KEY ("referredMessageId") REFERENCES "public"."Message"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "BlockWord" ADD CONSTRAINT "BlockWord_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "BlockWord" ADD CONSTRAINT "BlockWord_hubId_fkey" FOREIGN KEY ("hubId") REFERENCES "public"."Hub"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "BlockWord" ADD CONSTRAINT "BlockWord_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "public"."ServerData"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "AutoModEscalationRule" ADD CONSTRAINT "AutoModEscalationRule_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "AutoModEscalationRule" ADD CONSTRAINT "AutoModEscalationRule_hubId_fkey" FOREIGN KEY ("hubId") REFERENCES "public"."Hub"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "AutoModEscalationRule" ADD CONSTRAINT "AutoModEscalationRule_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "public"."ServerData"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "AntiSwearRule" ADD CONSTRAINT "AntiSwearRule_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "AntiSwearRule" ADD CONSTRAINT "AntiSwearRule_hubId_fkey" FOREIGN KEY ("hubId") REFERENCES "public"."Hub"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "AntiSwearRule" ADD CONSTRAINT "AntiSwearRule_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "public"."ServerData"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "NsfwOverride" ADD CONSTRAINT "NsfwOverride_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "NsfwOverride" ADD CONSTRAINT "NsfwOverride_hubId_fkey" FOREIGN KEY ("hubId") REFERENCES "public"."Hub"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "NsfwReviewQueue" ADD CONSTRAINT "NsfwReviewQueue_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "NsfwReviewQueue" ADD CONSTRAINT "NsfwReviewQueue_handledById_fkey" FOREIGN KEY ("handledById") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "NsfwReviewQueue" ADD CONSTRAINT "NsfwReviewQueue_hubId_fkey" FOREIGN KEY ("hubId") REFERENCES "public"."Hub"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "AntiSwearPattern" ADD CONSTRAINT "AntiSwearPattern_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "public"."AntiSwearRule"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Hub" ADD CONSTRAINT "Hub_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "AntiSwearWhitelist" ADD CONSTRAINT "AntiSwearWhitelist_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "AntiSwearWhitelist" ADD CONSTRAINT "AntiSwearWhitelist_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "public"."AntiSwearRule"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Appeal" ADD CONSTRAINT "Appeal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Appeal" ADD CONSTRAINT "Appeal_infractionId_fkey" FOREIGN KEY ("infractionId") REFERENCES "public"."Infraction"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Infraction" ADD CONSTRAINT "Infraction_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Infraction" ADD CONSTRAINT "Infraction_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "public"."ServerData"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Infraction" ADD CONSTRAINT "Infraction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Infraction" ADD CONSTRAINT "Infraction_hubId_fkey" FOREIGN KEY ("hubId") REFERENCES "public"."Hub"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Blacklist" ADD CONSTRAINT "Blacklist_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Blacklist" ADD CONSTRAINT "Blacklist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Blacklist" ADD CONSTRAINT "Blacklist_hubReportId_fkey" FOREIGN KEY ("hubReportId") REFERENCES "public"."HubReport"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Blacklist" ADD CONSTRAINT "Blacklist_lobbyReportId_fkey" FOREIGN KEY ("lobbyReportId") REFERENCES "public"."LobbyReport"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "HubActivityMetrics" ADD CONSTRAINT "HubActivityMetrics_hubId_fkey" FOREIGN KEY ("hubId") REFERENCES "public"."Hub"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "GlobalReport" ADD CONSTRAINT "GlobalReport_handledBy_fkey" FOREIGN KEY ("handledBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "GlobalReport" ADD CONSTRAINT "GlobalReport_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "public"."Message"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "GlobalReport" ADD CONSTRAINT "GlobalReport_reportedUserId_fkey" FOREIGN KEY ("reportedUserId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "GlobalReport" ADD CONSTRAINT "GlobalReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "HubInvite" ADD CONSTRAINT "HubInvite_hubId_fkey" FOREIGN KEY ("hubId") REFERENCES "public"."Hub"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "HubAnnouncement" ADD CONSTRAINT "HubAnnouncement_hubId_fkey" FOREIGN KEY ("hubId") REFERENCES "public"."Hub"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "HubLogConfig" ADD CONSTRAINT "HubLogConfig_hubId_fkey" FOREIGN KEY ("hubId") REFERENCES "public"."Hub"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "HubMessageReaction" ADD CONSTRAINT "HubMessageReaction_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "public"."Message"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "HubModerator" ADD CONSTRAINT "HubModerator_hubId_fkey" FOREIGN KEY ("hubId") REFERENCES "public"."Hub"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "HubModerator" ADD CONSTRAINT "HubModerator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "HubReport" ADD CONSTRAINT "HubReport_handledBy_fkey" FOREIGN KEY ("handledBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "HubReport" ADD CONSTRAINT "HubReport_hubId_fkey" FOREIGN KEY ("hubId") REFERENCES "public"."Hub"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "HubReport" ADD CONSTRAINT "HubReport_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "public"."Message"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "HubReport" ADD CONSTRAINT "HubReport_reportedUserId_fkey" FOREIGN KEY ("reportedUserId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "HubReport" ADD CONSTRAINT "HubReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "HubReview" ADD CONSTRAINT "HubReview_hubId_fkey" FOREIGN KEY ("hubId") REFERENCES "public"."Hub"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "HubReview" ADD CONSTRAINT "HubReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "HubRulesAcceptance" ADD CONSTRAINT "HubRulesAcceptance_hubId_fkey" FOREIGN KEY ("hubId") REFERENCES "public"."Hub"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "HubRulesAcceptance" ADD CONSTRAINT "HubRulesAcceptance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "HubUpvote" ADD CONSTRAINT "HubUpvote_hubId_fkey" FOREIGN KEY ("hubId") REFERENCES "public"."Hub"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "HubUpvote" ADD CONSTRAINT "HubUpvote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ServerBlacklist" ADD CONSTRAINT "ServerBlacklist_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ServerBlacklist" ADD CONSTRAINT "ServerBlacklist_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "public"."ServerData"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ServerBlacklist" ADD CONSTRAINT "ServerBlacklist_hubReportId_fkey" FOREIGN KEY ("hubReportId") REFERENCES "public"."HubReport"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ServerBlacklist" ADD CONSTRAINT "ServerBlacklist_lobbyReportId_fkey" FOREIGN KEY ("lobbyReportId") REFERENCES "public"."LobbyReport"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ReputationLog" ADD CONSTRAINT "ReputationLog_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ServerBlocklist" ADD CONSTRAINT "ServerBlocklist_blockedServerId_fkey" FOREIGN KEY ("blockedServerId") REFERENCES "public"."ServerData"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ServerBlocklist" ADD CONSTRAINT "ServerBlocklist_blockedUserId_fkey" FOREIGN KEY ("blockedUserId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ServerBlocklist" ADD CONSTRAINT "ServerBlocklist_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "public"."ServerData"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "public"."Achievement"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "_HubToTag" ADD CONSTRAINT "_HubToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Hub"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "_HubToTag" ADD CONSTRAINT "_HubToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Tag"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "AllowedBots" ADD CONSTRAINT "AllowedBots_botId_fkey" FOREIGN KEY ("botId") REFERENCES "public"."Bot"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "AllowedBots" ADD CONSTRAINT "AllowedBots_hubId_fkey" FOREIGN KEY ("hubId") REFERENCES "public"."Hub"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "_BotToTag" ADD CONSTRAINT "_BotToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Bot"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "_BotToTag" ADD CONSTRAINT "_BotToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."BotTag"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "HubServerStats" ADD CONSTRAINT "HubServerStats_hubId_fkey" FOREIGN KEY ("hubId") REFERENCES "public"."Hub"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "HubServerStats" ADD CONSTRAINT "HubServerStats_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "public"."ServerData"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "HubUserStats" ADD CONSTRAINT "HubUserStats_hubId_fkey" FOREIGN KEY ("hubId") REFERENCES "public"."Hub"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "HubUserStats" ADD CONSTRAINT "HubUserStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "GiftCode" ADD CONSTRAINT "GiftCode_claimedBy_fkey" FOREIGN KEY ("claimedBy") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "GiftCode" ADD CONSTRAINT "GiftCode_purchasedBy_fkey" FOREIGN KEY ("purchasedBy") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "PremiumKey" ADD CONSTRAINT "PremiumKey_assignedGuild_fkey" FOREIGN KEY ("assignedGuild") REFERENCES "public"."ServerData"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "PremiumKey" ADD CONSTRAINT "PremiumKey_assignedHub_fkey" FOREIGN KEY ("assignedHub") REFERENCES "public"."Hub"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "PremiumKey" ADD CONSTRAINT "PremiumKey_assignedUser_fkey" FOREIGN KEY ("assignedUser") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "PremiumKey" ADD CONSTRAINT "PremiumKey_purchasedBy_fkey" FOREIGN KEY ("purchasedBy") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "PremiumKey" ADD CONSTRAINT "PremiumKey_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "public"."StripeSubscription"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "LobbyMessage" ADD CONSTRAINT "LobbyMessage_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "LobbyMessage" ADD CONSTRAINT "LobbyMessage_lobbyId_fkey" FOREIGN KEY ("lobbyId") REFERENCES "public"."Lobby"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "LobbyMessage" ADD CONSTRAINT "LobbyMessage_sourceMemberId_fkey" FOREIGN KEY ("sourceMemberId") REFERENCES "public"."LobbyMember"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "LobbyMessage" ADD CONSTRAINT "LobbyMessage_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "public"."LobbyMessage"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "BetaServer" ADD CONSTRAINT "BetaServer_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."ServerData"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "BetaServer" ADD CONSTRAINT "BetaServer_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "LobbyMember" ADD CONSTRAINT "LobbyMember_invokerServerId_fkey" FOREIGN KEY ("invokerServerId") REFERENCES "public"."ServerData"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "LobbyMember" ADD CONSTRAINT "LobbyMember_invokerUserId_fkey" FOREIGN KEY ("invokerUserId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "LobbyMember" ADD CONSTRAINT "LobbyMember_lobbyId_fkey" FOREIGN KEY ("lobbyId") REFERENCES "public"."Lobby"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "LobbyMessageDelivery" ADD CONSTRAINT "LobbyMessageDelivery_targetMemberId_fkey" FOREIGN KEY ("targetMemberId") REFERENCES "public"."LobbyMember"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "LobbyMessageDelivery" ADD CONSTRAINT "LobbyMessageDelivery_lobbyMessageId_fkey" FOREIGN KEY ("lobbyMessageId") REFERENCES "public"."LobbyMessage"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "LobbyReport" ADD CONSTRAINT "LobbyReport_handledBy_fkey" FOREIGN KEY ("handledBy") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "LobbyReport" ADD CONSTRAINT "LobbyReport_lobbyId_fkey" FOREIGN KEY ("lobbyId") REFERENCES "public"."Lobby"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "LobbyReport" ADD CONSTRAINT "LobbyReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "LobbyReport" ADD CONSTRAINT "LobbyReport_reportedMessageId_fkey" FOREIGN KEY ("reportedMessageId") REFERENCES "public"."LobbyMessage"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "UserStats" ADD CONSTRAINT "UserStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "LobbyInfraction" ADD CONSTRAINT "LobbyInfraction_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "LobbyInfraction" ADD CONSTRAINT "LobbyInfraction_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "public"."LobbyReport"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "LobbyInfraction" ADD CONSTRAINT "LobbyInfraction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "LobbyReportActionLog" ADD CONSTRAINT "LobbyReportActionLog_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "LobbyReportActionLog" ADD CONSTRAINT "LobbyReportActionLog_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "public"."LobbyReport"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "LobbyReportActionLog" ADD CONSTRAINT "LobbyReportActionLog_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "UserAchievementProgress" ADD CONSTRAINT "UserAchievementProgress_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "public"."Achievement"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "UserAchievementProgress" ADD CONSTRAINT "UserAchievementProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "Connection_channelId_connected_idx" ON "Connection" USING btree ("channelId" bool_ops,"connected" bool_ops);--> statement-breakpoint
CREATE INDEX "Connection_channel_connected_idx" ON "Connection" USING btree ("channelId" text_ops) WHERE (connected = true);--> statement-breakpoint
CREATE INDEX "Connection_channelid_idx" ON "Connection" USING btree ("channelId" text_ops);--> statement-breakpoint
CREATE INDEX "Connection_hubId_idx" ON "Connection" USING btree ("hubId" text_ops);--> statement-breakpoint
CREATE INDEX "Connection_lastActive_idx" ON "Connection" USING btree ("lastActive" timestamp_ops);--> statement-breakpoint
CREATE INDEX "Connection_serverId_idx" ON "Connection" USING btree ("serverId" text_ops);--> statement-breakpoint
CREATE INDEX "Broadcast_channelId_idx" ON "Broadcast" USING btree ("channelId" text_ops);--> statement-breakpoint
CREATE INDEX "Broadcast_createdAt_idx" ON "Broadcast" USING btree ("createdAt" timestamp_ops);--> statement-breakpoint
CREATE INDEX "Broadcast_id_messageId_channelId_createdAt_idx" ON "Broadcast" USING btree ("id" text_ops,"messageId" timestamp_ops,"channelId" text_ops,"createdAt" text_ops);--> statement-breakpoint
CREATE INDEX "Broadcast_messageId_channelId_idx" ON "Broadcast" USING btree ("messageId" text_ops,"channelId" text_ops);--> statement-breakpoint
CREATE INDEX "Broadcast_messageId_idx" ON "Broadcast" USING btree ("messageId" text_ops);--> statement-breakpoint
CREATE INDEX "Message_createdAt_idx" ON "Message" USING btree ("createdAt" timestamp_ops);--> statement-breakpoint
CREATE INDEX "Message_guildId_authorId_idx" ON "Message" USING btree ("guildId" text_ops,"authorId" text_ops);--> statement-breakpoint
CREATE INDEX "Message_hubId_createdAt_idx" ON "Message" USING btree ("hubId" timestamp_ops,"createdAt" text_ops);--> statement-breakpoint
CREATE INDEX "Message_hubId_idx" ON "Message" USING btree ("hubId" text_ops);--> statement-breakpoint
CREATE INDEX "Message_referredMessageId_idx" ON "Message" USING btree ("referredMessageId" text_ops);--> statement-breakpoint
CREATE INDEX "Message_status_createdAt_idx" ON "Message" USING btree ("status" timestamp_ops,"createdAt" timestamp_ops);--> statement-breakpoint
CREATE INDEX "User_email_idx" ON "User" USING btree ("email" text_ops);--> statement-breakpoint
CREATE INDEX "User_lastVoted_idx" ON "User" USING btree ("lastVoted" timestamp_ops);--> statement-breakpoint
CREATE INDEX "NsfwOverride_hubId_idx" ON "NsfwOverride" USING btree ("hubId" text_ops);--> statement-breakpoint
CREATE INDEX "NsfwOverride_phash_idx" ON "NsfwOverride" USING btree ("phash" text_ops);--> statement-breakpoint
CREATE INDEX "NsfwOverride_xxh3_idx" ON "NsfwOverride" USING btree ("xxh3" text_ops);--> statement-breakpoint
CREATE INDEX "NsfwReviewQueue_hubId_idx" ON "NsfwReviewQueue" USING btree ("hubId" text_ops);--> statement-breakpoint
CREATE INDEX "NsfwReviewQueue_status_idx" ON "NsfwReviewQueue" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "AntiSwearPattern_ruleId_idx" ON "AntiSwearPattern" USING btree ("ruleId" text_ops);--> statement-breakpoint
CREATE INDEX "Hub_connectionCount_idx" ON "Hub" USING btree ("connectionCount" int4_ops);--> statement-breakpoint
CREATE INDEX "Hub_createdAt_idx" ON "Hub" USING btree ("createdAt" timestamp_ops);--> statement-breakpoint
CREATE INDEX "Hub_nsfw_idx" ON "Hub" USING btree ("nsfw" bool_ops);--> statement-breakpoint
CREATE INDEX "Hub_ownerId_idx" ON "Hub" USING btree ("ownerId" text_ops);--> statement-breakpoint
CREATE INDEX "Hub_upvoteCount_idx" ON "Hub" USING btree ("upvoteCount" int4_ops);--> statement-breakpoint
CREATE INDEX "Hub_verified_featured_visibility_idx" ON "Hub" USING btree ("verified" enum_ops,"featured" enum_ops,"visibility" enum_ops);--> statement-breakpoint
CREATE INDEX "Hub_weeklyMessageCount_idx" ON "Hub" USING btree ("weeklyMessageCount" int4_ops);--> statement-breakpoint
CREATE INDEX "Appeal_createdAt_idx" ON "Appeal" USING btree ("createdAt" timestamp_ops);--> statement-breakpoint
CREATE INDEX "Appeal_infractionId_idx" ON "Appeal" USING btree ("infractionId" text_ops);--> statement-breakpoint
CREATE INDEX "Appeal_userId_idx" ON "Appeal" USING btree ("userId" text_ops);--> statement-breakpoint
CREATE INDEX "Infraction_server_active_idx" ON "Infraction" USING btree ("hubId" text_ops,"serverId" timestamp_ops,"type" enum_ops,"expiresAt" text_ops) WHERE (status = 'ACTIVE'::"InfractionStatus");--> statement-breakpoint
CREATE INDEX "Infraction_status_hubId_idx" ON "Infraction" USING btree ("status" enum_ops,"hubId" text_ops);--> statement-breakpoint
CREATE INDEX "Infraction_user_active_idx" ON "Infraction" USING btree ("hubId" text_ops,"userId" text_ops,"type" text_ops,"expiresAt" text_ops) WHERE (status = 'ACTIVE'::"InfractionStatus");--> statement-breakpoint
CREATE INDEX "Blacklist_hubReportId_idx" ON "Blacklist" USING btree ("hubReportId" text_ops);--> statement-breakpoint
CREATE INDEX "Blacklist_lobbyReportId_idx" ON "Blacklist" USING btree ("lobbyReportId" text_ops);--> statement-breakpoint
CREATE INDEX "Blacklist_user_active_idx" ON "Blacklist" USING btree ("userId" timestamp_ops,"expiresAt" timestamp_ops) WHERE ("deletedAt" IS NULL);--> statement-breakpoint
CREATE INDEX "HubActivityMetrics_hubId_idx" ON "HubActivityMetrics" USING btree ("hubId" text_ops);--> statement-breakpoint
CREATE INDEX "HubActivityMetrics_lastUpdated_idx" ON "HubActivityMetrics" USING btree ("lastUpdated" timestamp_ops);--> statement-breakpoint
CREATE INDEX "HubActivityMetrics_trendingScore_idx" ON "HubActivityMetrics" USING btree ("trendingScore" float8_ops);--> statement-breakpoint
CREATE INDEX "GlobalReport_handledBy_idx" ON "GlobalReport" USING btree ("handledBy" text_ops);--> statement-breakpoint
CREATE INDEX "GlobalReport_messageId_idx" ON "GlobalReport" USING btree ("messageId" text_ops);--> statement-breakpoint
CREATE INDEX "GlobalReport_reportedUserId_idx" ON "GlobalReport" USING btree ("reportedUserId" text_ops);--> statement-breakpoint
CREATE INDEX "GlobalReport_reporterId_idx" ON "GlobalReport" USING btree ("reporterId" text_ops);--> statement-breakpoint
CREATE INDEX "HubInvite_hubId_idx" ON "HubInvite" USING btree ("hubId" text_ops);--> statement-breakpoint
CREATE INDEX "HubLogConfig_hubId_idx" ON "HubLogConfig" USING btree ("hubId" text_ops);--> statement-breakpoint
CREATE INDEX "HubModerator_userId_idx" ON "HubModerator" USING btree ("userId" text_ops);--> statement-breakpoint
CREATE INDEX "HubReport_createdAt_idx" ON "HubReport" USING btree ("createdAt" timestamp_ops);--> statement-breakpoint
CREATE INDEX "HubReport_handledBy_idx" ON "HubReport" USING btree ("handledBy" text_ops);--> statement-breakpoint
CREATE INDEX "HubReport_hubId_idx" ON "HubReport" USING btree ("hubId" text_ops);--> statement-breakpoint
CREATE INDEX "HubReport_messageId_idx" ON "HubReport" USING btree ("messageId" text_ops);--> statement-breakpoint
CREATE INDEX "HubReport_reportedUserId_idx" ON "HubReport" USING btree ("reportedUserId" text_ops);--> statement-breakpoint
CREATE INDEX "HubReport_reporterId_idx" ON "HubReport" USING btree ("reporterId" text_ops);--> statement-breakpoint
CREATE INDEX "HubReport_status_idx" ON "HubReport" USING btree ("status" enum_ops);--> statement-breakpoint
CREATE INDEX "ServerBlacklist_hubReportId_idx" ON "ServerBlacklist" USING btree ("hubReportId" text_ops);--> statement-breakpoint
CREATE INDEX "ServerBlacklist_lobbyReportId_idx" ON "ServerBlacklist" USING btree ("lobbyReportId" text_ops);--> statement-breakpoint
CREATE INDEX "ServerBlacklist_serverId_type_idx" ON "ServerBlacklist" USING btree ("serverId" enum_ops,"type" enum_ops);--> statement-breakpoint
CREATE INDEX "ServerBlacklist_server_active_idx" ON "ServerBlacklist" USING btree ("serverId" timestamp_ops,"expiresAt" text_ops) WHERE ("deletedAt" IS NULL);--> statement-breakpoint
CREATE INDEX "ReputationLog_giverId_idx" ON "ReputationLog" USING btree ("giverId" text_ops);--> statement-breakpoint
CREATE INDEX "ReputationLog_receiverId_idx" ON "ReputationLog" USING btree ("receiverId" text_ops);--> statement-breakpoint
CREATE INDEX "ServerBlocklist_serverId_idx" ON "ServerBlocklist" USING btree ("serverId" text_ops);--> statement-breakpoint
CREATE INDEX "UserAchievement_achievementId_idx" ON "UserAchievement" USING btree ("achievementId" text_ops);--> statement-breakpoint
CREATE INDEX "UserAchievement_userId_idx" ON "UserAchievement" USING btree ("userId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "_HubToTag_AB_unique" ON "_HubToTag" USING btree ("A" text_ops,"B" text_ops);--> statement-breakpoint
CREATE INDEX "_HubToTag_B_index" ON "_HubToTag" USING btree ("B" text_ops);--> statement-breakpoint
CREATE INDEX "Bot_state_idx" ON "Bot" USING btree ("state" enum_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "_BotToTag_AB_unique" ON "_BotToTag" USING btree ("A" text_ops,"B" text_ops);--> statement-breakpoint
CREATE INDEX "_BotToTag_B_index" ON "_BotToTag" USING btree ("B" text_ops);--> statement-breakpoint
CREATE INDEX "HubServerStats_hubId_year_month_count_idx" ON "HubServerStats" USING btree ("hubId" int4_ops,"year" text_ops,"month" text_ops,"messageCount" int4_ops);--> statement-breakpoint
CREATE INDEX "HubUserStats_hubId_year_month_count_idx" ON "HubUserStats" USING btree ("hubId" int4_ops,"year" text_ops,"month" text_ops,"messageCount" int4_ops);--> statement-breakpoint
CREATE INDEX "GiftCode_claimedBy_idx" ON "GiftCode" USING btree ("claimedBy" text_ops);--> statement-breakpoint
CREATE INDEX "GiftCode_purchasedBy_idx" ON "GiftCode" USING btree ("purchasedBy" text_ops);--> statement-breakpoint
CREATE INDEX "PremiumKey_assignedGuild_idx" ON "PremiumKey" USING btree ("assignedGuild" text_ops);--> statement-breakpoint
CREATE INDEX "PremiumKey_assignedHub_idx" ON "PremiumKey" USING btree ("assignedHub" text_ops);--> statement-breakpoint
CREATE INDEX "PremiumKey_assignedUser_idx" ON "PremiumKey" USING btree ("assignedUser" text_ops);--> statement-breakpoint
CREATE INDEX "PremiumKey_purchasedBy_idx" ON "PremiumKey" USING btree ("purchasedBy" text_ops);--> statement-breakpoint
CREATE INDEX "PremiumKey_subscriptionId_idx" ON "PremiumKey" USING btree ("subscriptionId" text_ops);--> statement-breakpoint
CREATE INDEX "ix_LobbyMessage_createdAt" ON "LobbyMessage" USING btree ("createdAt" timestamp_ops);--> statement-breakpoint
CREATE INDEX "ix_LobbyMessage_lobbyId" ON "LobbyMessage" USING btree ("lobbyId" text_ops);--> statement-breakpoint
CREATE INDEX "ix_LobbyMessage_replyToId" ON "LobbyMessage" USING btree ("replyToId" text_ops);--> statement-breakpoint
CREATE INDEX "ix_LobbyMember_channelId" ON "LobbyMember" USING btree ("channelId" text_ops);--> statement-breakpoint
CREATE INDEX "ix_LobbyMember_lobbyId" ON "LobbyMember" USING btree ("lobbyId" text_ops);--> statement-breakpoint
CREATE INDEX "ix_LobbyMessageDelivery_lobbyMessageId" ON "LobbyMessageDelivery" USING btree ("lobbyMessageId" text_ops);--> statement-breakpoint
CREATE INDEX "ix_LobbyMessageDelivery_webhookMessageId" ON "LobbyMessageDelivery" USING btree ("webhookMessageId" text_ops);--> statement-breakpoint
CREATE INDEX "ix_LobbyReport_lobbyId" ON "LobbyReport" USING btree ("lobbyId" text_ops);--> statement-breakpoint
CREATE INDEX "ix_LobbyReport_reportedMessageId" ON "LobbyReport" USING btree ("reportedMessageId" text_ops);--> statement-breakpoint
CREATE INDEX "UserStats_callCount_idx" ON "UserStats" USING btree ("callCount" int4_ops);--> statement-breakpoint
CREATE INDEX "UserStats_messageCount_idx" ON "UserStats" USING btree ("messageCount" int4_ops);--> statement-breakpoint
CREATE INDEX "UserStats_reputation_idx" ON "UserStats" USING btree ("reputation" int4_ops);--> statement-breakpoint
CREATE INDEX "UserStats_voteCount_idx" ON "UserStats" USING btree ("voteCount" int4_ops);--> statement-breakpoint
CREATE INDEX "ix_LobbyInfraction_userId" ON "LobbyInfraction" USING btree ("userId" text_ops);--> statement-breakpoint
CREATE INDEX "ix_LobbyReportActionLog_reportId" ON "LobbyReportActionLog" USING btree ("reportId" text_ops);--> statement-breakpoint
CREATE INDEX "UserAchievementProgress_achievementId_idx" ON "UserAchievementProgress" USING btree ("achievementId" text_ops);--> statement-breakpoint
CREATE INDEX "UserAchievementProgress_userId_idx" ON "UserAchievementProgress" USING btree ("userId" text_ops);
*/