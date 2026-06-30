import { pgTable, index, foreignKey, text, timestamp, varchar, unique, check, boolean, jsonb, integer, doublePrecision, bigint, uniqueIndex, uuid, primaryKey, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const appealStatus = pgEnum("AppealStatus", ['PENDING', 'ACCEPTED', 'REJECTED'])
export const approvalStatus = pgEnum("ApprovalStatus", ['PENDING', 'APPROVED', 'REJECTED'])
export const badges = pgEnum("Badges", ['VOTER', 'SUPPORTER', 'TRANSLATOR', 'DEVELOPER', 'STAFF', 'BETA_TESTER', 'HUB_OWNER', 'HUB_MANAGER', 'HUB_MODERATOR', 'TOP_CHATTER'])
export const blacklistType = pgEnum("BlacklistType", ['PERMANENT', 'TEMPORARY'])
export const blockWordAction = pgEnum("BlockWordAction", ['BLOCK_MESSAGE', 'CENSOR_MESSAGE', 'SEND_ALERT', 'WARN', 'MUTE', 'BAN', 'BLACKLIST', 'CENSOR_WORD'])
export const giftType = pgEnum("GiftType", ['FREE', 'DISCOUNT'])
export const hubActivityLevel = pgEnum("HubActivityLevel", ['LOW', 'MEDIUM', 'HIGH'])
export const hubVisibility = pgEnum("HubVisibility", ['PUBLIC', 'PRIVATE', 'UNLISTED'])
export const infractionStatus = pgEnum("InfractionStatus", ['ACTIVE', 'REVOKED', 'APPEALED'])
export const infractionType = pgEnum("InfractionType", ['BAN', 'BLACKLIST', 'MUTE', 'WARNING'])
export const keyStatus = pgEnum("KeyStatus", ['ACTIVE', 'EXPIRED', 'REVOKED', 'PENDING'])
export const lobbyInfractionType = pgEnum("LobbyInfractionType", ['warning'])
export const lobbyReportActionType = pgEnum("LobbyReportActionType", ['warned', 'global_blacklisted', 'resolved', 'dismissed'])
export const lobbyStatus = pgEnum("LobbyStatus", ['open', 'closed'])
export const messageStatus = pgEnum("MessageStatus", ['PENDING', 'ACTIVE', 'DELETED'])
export const patternMatchType = pgEnum("PatternMatchType", ['EXACT', 'PREFIX', 'SUFFIX', 'WILDCARD'])
export const premiumTier = pgEnum("PremiumTier", ['CORE', 'PLUS', 'PRO'])
export const reportStatus = pgEnum("ReportStatus", ['PENDING', 'RESOLVED', 'IGNORED'])
export const safetyFlagStatus = pgEnum("SafetyFlagStatus", ['ACTIVE', 'ACKNOWLEDGED', 'DISMISSED', 'ESCALATED', 'RESOLVED'])
export const safetyScoreTier = pgEnum("SafetyScoreTier", ['SAFE', 'LOW_RISK', 'MEDIUM_RISK', 'HIGH_RISK'])
export const safetySignalType = pgEnum("SafetySignalType", ['INFRACTION_ACTIVE', 'INFRACTION_HISTORY', 'HUB_REPORT_RECEIVED', 'GLOBAL_REPORT_RECEIVED', 'LOBBY_REPORT_RECEIVED', 'CONTENT_SIMILARITY', 'NAME_SIMILARITY', 'JOIN_VELOCITY', 'MESSAGE_VELOCITY', 'ACCOUNT_AGE', 'REPUTATION', 'PREMIUM', 'STAFF_ROLE', 'HUB_STAFF_ROLE', 'VERIFIED_HUB_OWNER', 'AUTOMOD_VIOLATION', 'GUILD_INFRACTION_RATE', 'GUILD_NSFW_FREQUENCY', 'GUILD_AUTOMOD_VIOLATIONS', 'GUILD_BLACKLIST_HISTORY'])
export const subscriptionStatus = pgEnum("SubscriptionStatus", ['ACTIVE', 'PAST_DUE', 'CANCELLED', 'PENDING'])


export const broadcast = pgTable("Broadcast", {
	id: text().primaryKey().notNull(),
	messageId: text().notNull(),
	guildId: text().notNull(),
	channelId: text().notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("Broadcast_channelId_idx").using("btree", table.channelId.asc().nullsLast().op("text_ops")),
	index("Broadcast_createdAt_idx").using("btree", table.createdAt.desc().nullsFirst().op("timestamp_ops")),
	index("Broadcast_messageId_channelId_idx").using("btree", table.messageId.asc().nullsLast().op("text_ops"), table.channelId.asc().nullsLast().op("text_ops"), table.id.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.messageId],
			foreignColumns: [message.id],
			name: "Broadcast_messageId_fkey"
		}).onDelete("cascade"),
]);

export const message = pgTable("Message", {
	id: text().primaryKey().notNull(),
	hubId: text().notNull(),
	content: varchar({ length: 4000 }).notNull(),
	imageUrl: varchar(),
	channelId: text().notNull(),
	guildId: text().notNull(),
	authorId: text().notNull(),
	referredMessageId: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	status: messageStatus().default('ACTIVE').notNull(),
	deletionQueuedAt: timestamp({ mode: 'string' }),
	retentionUntil: timestamp({ mode: 'string' }),
}, (table) => [
	index("Message_authorId_idx").using("btree", table.authorId.asc().nullsLast().op("text_ops")),
	index("Message_channel_timestamp_idx").using("btree", table.channelId.asc().nullsLast().op("timestamp_ops"), table.createdAt.desc().nullsFirst().op("timestamp_ops")),
	index("Message_createdAt_idx").using("btree", table.createdAt.desc().nullsFirst().op("timestamp_ops")),
	index("Message_guildId_authorId_idx").using("btree", table.guildId.asc().nullsLast().op("text_ops"), table.authorId.asc().nullsLast().op("text_ops")),
	index("Message_guildId_idx").using("btree", table.guildId.asc().nullsLast().op("text_ops")),
	index("Message_hubId_createdAt_idx").using("btree", table.hubId.asc().nullsLast().op("timestamp_ops"), table.createdAt.desc().nullsFirst().op("timestamp_ops")),
	index("Message_referredMessageId_idx").using("btree", table.referredMessageId.asc().nullsLast().op("text_ops")),
	index("Message_status_createdAt_idx").using("btree", table.status.asc().nullsLast().op("timestamp_ops"), table.createdAt.desc().nullsFirst().op("enum_ops")),
	foreignKey({
			columns: [table.hubId],
			foreignColumns: [hub.id],
			name: "Message_hubId_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.referredMessageId],
			foreignColumns: [table.id],
			name: "Message_referredMessageId_fkey"
		}),
]);

export const blockWord = pgTable("BlockWord", {
	id: text().primaryKey().notNull(),
	hubId: text(),
	name: text().notNull(),
	createdBy: text().notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	words: text().notNull(),
	// TODO: failed to parse database type 'BlockWordAction"[]'
	actions: blockWordAction().array().notNull(),
	serverId: text(),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [user.id],
			name: "BlockWord_createdBy_fkey"
		}),
	foreignKey({
			columns: [table.hubId],
			foreignColumns: [hub.id],
			name: "BlockWord_hubId_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.serverId],
			foreignColumns: [serverData.id],
			name: "BlockWord_serverId_fkey"
		}).onDelete("cascade"),
	unique("uq_blockword_hub_name").on(table.hubId, table.name),
	unique("uq_blockword_server_name").on(table.name, table.serverId),
	check("check_blockword_target", sql`(("hubId" IS NOT NULL) AND ("serverId" IS NULL)) OR (("hubId" IS NULL) AND ("serverId" IS NOT NULL))`),
]);

export const devAlerts = pgTable("DevAlerts", {
	id: text().primaryKey().notNull(),
	title: text().notNull(),
	content: text().notNull(),
	imageUrl: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	thumbnailUrl: text(),
});

export const user = pgTable("User", {
	id: text().primaryKey().notNull(),
	name: text(),
	image: text(),
	lastMessageAt: timestamp({ mode: 'string' }).defaultNow(),
	inboxLastReadDate: timestamp({ mode: 'string' }).defaultNow(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	activityLevel: hubActivityLevel(),
	email: text(),
	emailVerified: boolean(),
	showBadges: boolean().default(true).notNull(),
	mentionOnReply: boolean().default(true).notNull(),
	showNsfwHubs: boolean().default(false).notNull(),
	locale: text(),
	lastVoted: timestamp({ mode: 'string' }),
	badges: badges().array().default([]).notNull(),
	voteRemindersEnabled: boolean().default(true).notNull(),
	lastVoteReminderSent: timestamp({ mode: 'string' }),
	customerId: text(),
}, (table) => [
	index("User_createdAt_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("User_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("User_lastVoted_idx").using("btree", table.lastVoted.asc().nullsLast().op("timestamp_ops")),
	index("User_locale_idx").using("btree", table.locale.asc().nullsLast().op("text_ops")),
]);

export const hub = pgTable("Hub", {
	id: text().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	description: varchar({ length: 1024 }).notNull(),
	ownerId: text().notNull(),
	iconUrl: varchar({ length: 512 }).notNull(),
	shortDescription: varchar({ length: 100 }),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	lastActive: timestamp({ mode: 'string' }).defaultNow().notNull(),
	lastNameChange: timestamp({ mode: 'string' }).defaultNow(),
	bannerUrl: text(),
	welcomeMessage: text(),
	language: text(),
	region: text(),
	customBadges: jsonb(),
	settings: integer().default(0).notNull(),
	appealCooldownHours: integer().default(168).notNull(),
	weeklyMessageCount: integer().default(0).notNull(),
	locked: boolean().default(false).notNull(),
	nsfw: boolean().default(false).notNull(),
	verified: boolean().default(false).notNull(),
	partnered: boolean().default(false).notNull(),
	featured: boolean().default(false).notNull(),
	rules: text().array().notNull(),
	activityLevel: hubActivityLevel().default('LOW').notNull(),
	averageRating: doublePrecision().default(0),
	visibility: hubVisibility().default('PUBLIC').notNull(),
	connectionCount: integer().default(0).notNull(),
	upvoteCount: integer().default(0).notNull(),
	reviewCount: integer().default(0).notNull(),
}, (table) => [
	index("Hub_connectionCount_idx").using("btree", table.connectionCount.desc().nullsFirst().op("int4_ops")),
	index("Hub_createdAt_idx").using("btree", table.createdAt.desc().nullsFirst().op("timestamp_ops")),
	index("Hub_nsfw_idx").using("btree", table.nsfw.asc().nullsLast().op("bool_ops")),
	index("Hub_ownerId_idx").using("btree", table.ownerId.asc().nullsLast().op("text_ops")),
	index("Hub_upvoteCount_idx").using("btree", table.upvoteCount.desc().nullsFirst().op("int4_ops")),
	index("Hub_verified_featured_visibility_idx").using("btree", table.verified.asc().nullsLast().op("bool_ops"), table.featured.asc().nullsLast().op("enum_ops"), table.visibility.asc().nullsLast().op("bool_ops")),
	index("Hub_weeklyMessageCount_idx").using("btree", table.weeklyMessageCount.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.ownerId],
			foreignColumns: [user.id],
			name: "Hub_ownerId_fkey"
		}),
	unique("Hub_name_key").on(table.name),
]);

export const appeal = pgTable("Appeal", {
	infractionId: text().notNull(),
	userId: text().notNull(),
	reason: varchar({ length: 1000 }).notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	id: text().primaryKey().notNull(),
	status: appealStatus().default('PENDING').notNull(),
}, (table) => [
	index("Appeal_createdAt_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("Appeal_infractionId_idx").using("btree", table.infractionId.asc().nullsLast().op("text_ops")),
	index("Appeal_userId_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.infractionId],
			foreignColumns: [infraction.id],
			name: "Appeal_infractionId_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "Appeal_userId_fkey"
		}),
]);

export const infraction = pgTable("Infraction", {
	id: text().primaryKey().notNull(),
	hubId: text().notNull(),
	moderatorId: text().notNull(),
	reason: varchar({ length: 500 }).notNull(),
	expiresAt: timestamp({ mode: 'string' }),
	userId: text(),
	serverId: text(),
	serverName: text(),
	type: infractionType().notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	status: infractionStatus().default('ACTIVE').notNull(),
	notified: boolean().default(false).notNull(),
	evidenceMessageId: text(),
	evidenceContent: text(),
	evidenceImageUrl: text(),
	evidenceAuthorId: text(),
	evidenceAuthorName: text(),
	evidenceChannelId: text(),
	evidenceGuildId: text(),
	evidenceGuildName: text(),
	evidenceCreatedAt: timestamp({ mode: 'string' }),
}, (table) => [
	index("Infraction_server_active_idx").using("btree", table.hubId.asc().nullsLast().op("timestamp_ops"), table.serverId.asc().nullsLast().op("timestamp_ops"), table.type.asc().nullsLast().op("enum_ops"), table.expiresAt.asc().nullsLast().op("enum_ops")).where(sql`(status = 'ACTIVE'::"InfractionStatus")`),
	index("Infraction_status_hubId_idx").using("btree", table.status.asc().nullsLast().op("enum_ops"), table.hubId.asc().nullsLast().op("text_ops")),
	index("Infraction_user_active_idx").using("btree", table.hubId.asc().nullsLast().op("enum_ops"), table.userId.asc().nullsLast().op("text_ops"), table.type.asc().nullsLast().op("timestamp_ops"), table.expiresAt.asc().nullsLast().op("text_ops")).where(sql`(status = 'ACTIVE'::"InfractionStatus")`),
	foreignKey({
			columns: [table.hubId],
			foreignColumns: [hub.id],
			name: "Infraction_hubId_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.moderatorId],
			foreignColumns: [user.id],
			name: "Infraction_moderatorId_fkey"
		}),
	foreignKey({
			columns: [table.serverId],
			foreignColumns: [serverData.id],
			name: "Infraction_serverId_fkey"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "Infraction_userId_fkey"
		}),
]);

export const blacklist = pgTable("Blacklist", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	moderatorId: text().notNull(),
	reason: text().notNull(),
	expiresAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow(),
	type: blacklistType().default('PERMANENT').notNull(),
	lobbyReportId: text(),
	hubReportId: text(),
	deletedAt: timestamp({ mode: 'string' }),
}, (table) => [
	index("Blacklist_hubReportId_idx").using("btree", table.hubReportId.asc().nullsLast().op("text_ops")),
	index("Blacklist_lobbyReportId_idx").using("btree", table.lobbyReportId.asc().nullsLast().op("text_ops")),
	index("Blacklist_user_active_idx").using("btree", table.userId.asc().nullsLast().op("timestamp_ops"), table.expiresAt.asc().nullsLast().op("text_ops")).where(sql`("deletedAt" IS NULL)`),
	foreignKey({
			columns: [table.hubReportId],
			foreignColumns: [hubReport.id],
			name: "Blacklist_hubReportId_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.lobbyReportId],
			foreignColumns: [lobbyReport.id],
			name: "Blacklist_lobbyReportId_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.moderatorId],
			foreignColumns: [user.id],
			name: "Blacklist_moderatorId_fkey"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "Blacklist_userId_fkey"
		}),
]);

export const hubActivityMetrics = pgTable("HubActivityMetrics", {
	id: text().primaryKey().notNull(),
	hubId: text().notNull(),
	lastUpdated: timestamp({ mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	messagesLast24h: integer().default(0).notNull(),
	activeUsersLast24h: integer().default(0).notNull(),
	newConnectionsLast24h: integer().default(0).notNull(),
	messagesLast7d: integer().default(0).notNull(),
	activeUsersLast7d: integer().default(0).notNull(),
	newConnectionsLast7d: integer().default(0).notNull(),
	memberGrowthRate: doublePrecision().default(0).notNull(),
	engagementRate: doublePrecision().default(0).notNull(),
	trendingScore: doublePrecision().default(0).notNull(),
}, (table) => [
	index("HubActivityMetrics_lastUpdated_idx").using("btree", table.lastUpdated.asc().nullsLast().op("timestamp_ops")),
	index("HubActivityMetrics_trendingScore_idx").using("btree", table.trendingScore.asc().nullsLast().op("float8_ops")),
	foreignKey({
			columns: [table.hubId],
			foreignColumns: [hub.id],
			name: "HubActivityMetrics_hubId_fkey"
		}).onDelete("cascade"),
	unique("HubActivityMetrics_hubId_key").on(table.hubId),
]);

export const connection = pgTable("Connection", {
	id: text().primaryKey().notNull(),
	channelId: text().notNull(),
	invite: text(),
	webhookURL: text().notNull(),
	serverId: text().notNull(),
	hubId: text().notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	lastActive: timestamp({ mode: 'string' }).defaultNow().notNull(),
	parentId: text(),
	webhookSecondaryURL: text(),
	connected: boolean().default(true).notNull(),
	pausedByBot: boolean().default(false).notNull(),
	pauseReason: text(),
}, (table) => [
	index("Connection_hubId_idx").using("btree", table.hubId.asc().nullsLast().op("text_ops")),
	index("Connection_lastActive_idx").using("btree", table.lastActive.asc().nullsLast().op("timestamp_ops")),
	index("Connection_serverId_idx").using("btree", table.serverId.asc().nullsLast().op("text_ops"), table.channelId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.hubId],
			foreignColumns: [hub.id],
			name: "Connection_hubId_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.serverId],
			foreignColumns: [serverData.id],
			name: "Connection_serverId_fkey"
		}),
	unique("Connection_channelId_key").on(table.channelId),
	unique("Connection_hubId_serverId_key").on(table.hubId, table.serverId),
]);

export const globalReport = pgTable("GlobalReport", {
	id: text().primaryKey().notNull(),
	reporterId: text().notNull(),
	reportedUserId: text().notNull(),
	reportedServerId: text().notNull(),
	messageId: text(),
	reason: text().notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	handledBy: text(),
	status: reportStatus().default('PENDING').notNull(),
	handledAt: timestamp({ mode: 'string' }),
	reportMessageId: text(),
	reportChannelId: text(),
	actionTaken: text(),
}, (table) => [
	index("GlobalReport_handledBy_idx").using("btree", table.handledBy.asc().nullsLast().op("text_ops")),
	index("GlobalReport_messageId_idx").using("btree", table.messageId.asc().nullsLast().op("text_ops")),
	index("GlobalReport_reportedUserId_idx").using("btree", table.reportedUserId.asc().nullsLast().op("text_ops")),
	index("GlobalReport_reporterId_idx").using("btree", table.reporterId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.handledBy],
			foreignColumns: [user.id],
			name: "GlobalReport_handledBy_fkey"
		}),
	foreignKey({
			columns: [table.messageId],
			foreignColumns: [message.id],
			name: "GlobalReport_messageId_fkey"
		}),
	foreignKey({
			columns: [table.reportedUserId],
			foreignColumns: [user.id],
			name: "GlobalReport_reportedUserId_fkey"
		}),
	foreignKey({
			columns: [table.reporterId],
			foreignColumns: [user.id],
			name: "GlobalReport_reporterId_fkey"
		}),
]);

export const hubInvite = pgTable("HubInvite", {
	hubId: text().notNull(),
	expires: timestamp({ mode: 'string' }),
	code: text().primaryKey().notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	maxUses: integer().default(0).notNull(),
	uses: integer().default(0).notNull(),
}, (table) => [
	index("HubInvite_hubId_idx").using("btree", table.hubId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.hubId],
			foreignColumns: [hub.id],
			name: "HubInvite_hubId_fkey"
		}).onDelete("cascade"),
]);

export const hubAnnouncement = pgTable("HubAnnouncement", {
	id: text().primaryKey().notNull(),
	hubId: text().notNull(),
	title: text().notNull(),
	content: text().notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	frequencyMs: bigint({ mode: "number" }).notNull(),
	previousAnnouncement: timestamp({ mode: 'string' }),
	nextAnnouncement: timestamp({ mode: 'string' }),
	imageUrl: text(),
	thumbnailUrl: text(),
}, (table) => [
	foreignKey({
			columns: [table.hubId],
			foreignColumns: [hub.id],
			name: "HubAnnouncement_hubId_fkey"
		}).onDelete("cascade"),
]);

export const hubReport = pgTable("HubReport", {
	id: text().primaryKey().notNull(),
	hubId: text().notNull(),
	reporterId: text().notNull(),
	reportedUserId: text().notNull(),
	reportedServerId: text().notNull(),
	messageId: text(),
	reason: text().notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	handledBy: text(),
	status: reportStatus().default('PENDING').notNull(),
	handledAt: timestamp({ mode: 'string' }),
	reportMessageId: text(),
	reportChannelId: text(),
	actionTaken: text(),
}, (table) => [
	index("HubReport_createdAt_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("HubReport_handledBy_idx").using("btree", table.handledBy.asc().nullsLast().op("text_ops")),
	index("HubReport_hubId_idx").using("btree", table.hubId.asc().nullsLast().op("text_ops")),
	index("HubReport_messageId_idx").using("btree", table.messageId.asc().nullsLast().op("text_ops")),
	index("HubReport_reportedUserId_idx").using("btree", table.reportedUserId.asc().nullsLast().op("text_ops")),
	index("HubReport_reporterId_idx").using("btree", table.reporterId.asc().nullsLast().op("text_ops")),
	index("HubReport_status_idx").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	foreignKey({
			columns: [table.handledBy],
			foreignColumns: [user.id],
			name: "HubReport_handledBy_fkey"
		}),
	foreignKey({
			columns: [table.hubId],
			foreignColumns: [hub.id],
			name: "HubReport_hubId_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.messageId],
			foreignColumns: [message.id],
			name: "HubReport_messageId_fkey"
		}),
	foreignKey({
			columns: [table.reportedUserId],
			foreignColumns: [user.id],
			name: "HubReport_reportedUserId_fkey"
		}),
	foreignKey({
			columns: [table.reporterId],
			foreignColumns: [user.id],
			name: "HubReport_reporterId_fkey"
		}),
]);

export const hubMessageReaction = pgTable("HubMessageReaction", {
	id: varchar().primaryKey().notNull(),
	messageId: text().notNull(),
	emoji: varchar({ length: 64 }).notNull(),
	users: text().array().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.messageId],
			foreignColumns: [message.id],
			name: "HubMessageReaction_messageId_fkey"
		}).onDelete("cascade"),
	unique("HubMessageReaction_messageId_emoji_key").on(table.emoji, table.messageId),
]);

export const hubReview = pgTable("HubReview", {
	id: text().primaryKey().notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	rating: integer().notNull(),
	text: text().notNull(),
	hubId: text().notNull(),
	userId: text().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.hubId],
			foreignColumns: [hub.id],
			name: "HubReview_hubId_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "HubReview_userId_fkey"
		}),
	unique("HubReview_hubId_userId_key").on(table.hubId, table.userId),
]);

export const hubLogConfig = pgTable("HubLogConfig", {
	id: text().primaryKey().notNull(),
	hubId: text().notNull(),
	modLogsChannelId: text(),
	modLogsRoleId: text(),
	joinLeavesChannelId: text(),
	joinLeavesRoleId: text(),
	appealsChannelId: text(),
	appealsRoleId: text(),
	reportsChannelId: text(),
	reportsRoleId: text(),
	networkAlertsChannelId: text(),
	networkAlertsRoleId: text(),
	messageModerationChannelId: text(),
	messageModerationRoleId: text(),
	safetyAlertsChannelId: text(),
	safetyAlertsRoleId: text(),
}, (table) => [
	foreignKey({
			columns: [table.hubId],
			foreignColumns: [hub.id],
			name: "HubLogConfig_hubId_fkey"
		}).onDelete("cascade"),
	unique("HubLogConfig_hubId_key").on(table.hubId),
]);

export const hubRulesAcceptance = pgTable("HubRulesAcceptance", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	hubId: text().notNull(),
	acceptedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.hubId],
			foreignColumns: [hub.id],
			name: "HubRulesAcceptance_hubId_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "HubRulesAcceptance_userId_fkey"
		}),
	unique("HubRulesAcceptance_userId_hubId_key").on(table.hubId, table.userId),
]);

export const hubUpvote = pgTable("HubUpvote", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	hubId: text().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.hubId],
			foreignColumns: [hub.id],
			name: "HubUpvote_hubId_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "HubUpvote_userId_fkey"
		}),
	unique("HubUpvote_hubId_userId_key").on(table.hubId, table.userId),
]);

export const reputationLog = pgTable("ReputationLog", {
	id: text().primaryKey().notNull(),
	giverId: text().notNull(),
	receiverId: text().notNull(),
	reason: text().notNull(),
	timestamp: timestamp({ mode: 'string' }).defaultNow().notNull(),
	automatic: boolean().default(false).notNull(),
}, (table) => [
	index("ReputationLog_giverId_idx").using("btree", table.giverId.asc().nullsLast().op("text_ops")),
	index("ReputationLog_receiverId_idx").using("btree", table.receiverId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.receiverId],
			foreignColumns: [user.id],
			name: "ReputationLog_receiverId_fkey"
		}),
]);

export const serverBlacklist = pgTable("ServerBlacklist", {
	id: text().primaryKey().notNull(),
	serverId: text().notNull(),
	moderatorId: text().notNull(),
	reason: varchar({ length: 500 }).notNull(),
	duration: integer(),
	expiresAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	type: blacklistType().default('PERMANENT').notNull(),
	lobbyReportId: text(),
	hubReportId: text(),
	deletedAt: timestamp({ mode: 'string' }),
}, (table) => [
	index("ServerBlacklist_hubReportId_idx").using("btree", table.hubReportId.asc().nullsLast().op("text_ops")),
	index("ServerBlacklist_lobbyReportId_idx").using("btree", table.lobbyReportId.asc().nullsLast().op("text_ops")),
	index("ServerBlacklist_serverId_type_idx").using("btree", table.serverId.asc().nullsLast().op("text_ops"), table.type.asc().nullsLast().op("text_ops")),
	index("ServerBlacklist_server_active_idx").using("btree", table.serverId.asc().nullsLast().op("text_ops"), table.expiresAt.asc().nullsLast().op("text_ops")).where(sql`("deletedAt" IS NULL)`),
	foreignKey({
			columns: [table.hubReportId],
			foreignColumns: [hubReport.id],
			name: "ServerBlacklist_hubReportId_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.lobbyReportId],
			foreignColumns: [lobbyReport.id],
			name: "ServerBlacklist_lobbyReportId_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.moderatorId],
			foreignColumns: [user.id],
			name: "ServerBlacklist_moderatorId_fkey"
		}),
	foreignKey({
			columns: [table.serverId],
			foreignColumns: [serverData.id],
			name: "ServerBlacklist_serverId_fkey"
		}),
]);

export const serverBlocklist = pgTable("ServerBlocklist", {
	id: text().primaryKey().notNull(),
	serverId: text().notNull(),
	blockedUserId: text(),
	blockedServerId: text(),
	reason: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("ServerBlocklist_serverId_idx").using("btree", table.serverId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.blockedServerId],
			foreignColumns: [serverData.id],
			name: "ServerBlocklist_blockedServerId_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.blockedUserId],
			foreignColumns: [user.id],
			name: "ServerBlocklist_blockedUserId_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.serverId],
			foreignColumns: [serverData.id],
			name: "ServerBlocklist_serverId_fkey"
		}).onDelete("cascade"),
	unique("ServerBlocklist_serverId_blockedServerId_key").on(table.blockedServerId, table.serverId),
	unique("ServerBlocklist_serverId_blockedUserId_key").on(table.blockedUserId, table.serverId),
	check("check_no_self_block", sql`("blockedServerId" IS NULL) OR ("blockedServerId" <> "serverId")`),
	check("check_only_one_blocked", sql`(("blockedUserId" IS NOT NULL) AND ("blockedServerId" IS NULL)) OR (("blockedUserId" IS NULL) AND ("blockedServerId" IS NOT NULL))`),
]);

export const achievement = pgTable("Achievement", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	description: text().notNull(),
	badgeEmoji: text().notNull(),
	badgeUrl: text().notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	threshold: integer().default(1).notNull(),
	secret: boolean().default(false).notNull(),
});

export const userAchievement = pgTable("UserAchievement", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	achievementId: text().notNull(),
	unlockedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("UserAchievement_achievementId_idx").using("btree", table.achievementId.asc().nullsLast().op("text_ops")),
	index("UserAchievement_userId_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.achievementId],
			foreignColumns: [achievement.id],
			name: "UserAchievement_achievementId_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "UserAchievement_userId_fkey"
		}).onDelete("cascade"),
	unique("UserAchievement_userId_achievementId_key").on(table.achievementId, table.userId),
]);

export const session = pgTable("Session", {
	userId: text().notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	id: text().primaryKey().notNull(),
	expiresAt: timestamp({ mode: 'string' }).notNull(),
	token: text().notNull(),
	ipAddress: text(),
	userAgent: text(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "Session_userId_fkey"
		}).onDelete("cascade"),
	unique("Session_token_key").on(table.token),
]);

export const tag = pgTable("Tag", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	category: text(),
	description: text(),
	color: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	isOfficial: boolean().default(false).notNull(),
	usageCount: integer().default(0).notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("Tag_name_key").on(table.name),
]);

export const hubToTag = pgTable("_HubToTag", {
	a: text("A").notNull(),
	b: text("B").notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("_HubToTag_AB_unique").using("btree", table.a.asc().nullsLast().op("text_ops"), table.b.asc().nullsLast().op("text_ops")),
	index().using("btree", table.b.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.a],
			foreignColumns: [hub.id],
			name: "_HubToTag_A_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.b],
			foreignColumns: [tag.id],
			name: "_HubToTag_B_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const verification = pgTable("Verification", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp({ mode: 'string' }).notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow(),
});

export const allowedBots = pgTable("AllowedBots", {
	id: text().primaryKey().notNull(),
	hubId: text().notNull(),
	botId: text().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.botId],
			foreignColumns: [bot.id],
			name: "AllowedBots_botId_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.hubId],
			foreignColumns: [hub.id],
			name: "AllowedBots_hubId_fkey"
		}).onDelete("cascade"),
]);

export const account = pgTable("Account", {
	userId: text().notNull(),
	scope: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	id: text().primaryKey().notNull(),
	accountId: text().notNull(),
	providerId: text().notNull(),
	accessToken: text(),
	refreshToken: text(),
	idToken: text(),
	accessTokenExpiresAt: timestamp({ mode: 'string' }),
	refreshTokenExpiresAt: timestamp({ mode: 'string' }),
	password: text(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "Account_userId_fkey"
		}).onDelete("cascade"),
]);

export const serverData = pgTable("ServerData", {
	id: text().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	lastMessageAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	inviteCode: text(),
	messageCount: integer().default(0).notNull(),
	iconUrl: text(),
	callCount: integer().default(0).notNull(),
	prefix: text(),
	hideServerName: boolean().default(false).notNull(),
	pingOnMatch: boolean().default(false).notNull(),
	autoRequeueOnSkip: boolean().default(false).notNull(),
	autoRequeueOnHangup: boolean().default(false).notNull(),
	filterNsfw: boolean().default(true).notNull(),
}, (table) => [
	index("ServerData_callCount_idx").using("btree", table.callCount.asc().nullsLast().op("int4_ops")),
	index("ServerData_lastMessageAt_idx").using("btree", table.lastMessageAt.desc().nullsFirst().op("timestamp_ops")),
]);

export const bot = pgTable("Bot", {
	id: text().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	image: varchar({ length: 512 }),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	shortDescription: varchar({ length: 255 }).notNull(),
	longDescription: text().notNull(),
	features: text().notNull(),
	state: approvalStatus().default('PENDING').notNull(),
}, (table) => [
	index("Bot_state_idx").using("btree", table.state.asc().nullsLast().op("enum_ops")),
]);

export const botToTag = pgTable("_BotToTag", {
	a: text("A").notNull(),
	b: text("B").notNull(),
}, (table) => [
	uniqueIndex("_BotToTag_AB_unique").using("btree", table.a.asc().nullsLast().op("text_ops"), table.b.asc().nullsLast().op("text_ops")),
	index().using("btree", table.b.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.a],
			foreignColumns: [bot.id],
			name: "_BotToTag_A_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.b],
			foreignColumns: [botTag.id],
			name: "_BotToTag_B_fkey"
		}).onDelete("cascade"),
]);

export const botTag = pgTable("BotTag", {
	id: text().primaryKey().notNull(),
	name: varchar({ length: 50 }).notNull(),
	category: varchar({ length: 50 }),
	description: varchar({ length: 255 }),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("BotTag_name_key").on(table.name),
]);

export const hubServerStats = pgTable("HubServerStats", {
	id: text().primaryKey().notNull(),
	hubId: text().notNull(),
	serverId: text().notNull(),
	year: integer().notNull(),
	month: integer().notNull(),
	messageCount: integer().default(0).notNull(),
	lastMessageAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("HubServerStats_hubId_year_month_count_idx").using("btree", table.hubId.asc().nullsLast().op("int4_ops"), table.year.asc().nullsLast().op("int4_ops"), table.month.asc().nullsLast().op("text_ops"), table.messageCount.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.hubId],
			foreignColumns: [hub.id],
			name: "HubServerStats_hubId_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.serverId],
			foreignColumns: [serverData.id],
			name: "HubServerStats_serverId_fkey"
		}).onDelete("cascade"),
	unique("HubServerStats_hub_server_year_month_key").on(table.hubId, table.month, table.serverId, table.year),
]);

export const hubUserStats = pgTable("HubUserStats", {
	id: text().primaryKey().notNull(),
	hubId: text().notNull(),
	userId: text().notNull(),
	year: integer().notNull(),
	month: integer().notNull(),
	messageCount: integer().default(0).notNull(),
	lastMessageAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("HubUserStats_hubId_year_month_count_idx").using("btree", table.hubId.asc().nullsLast().op("int4_ops"), table.year.asc().nullsLast().op("int4_ops"), table.month.asc().nullsLast().op("text_ops"), table.messageCount.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.hubId],
			foreignColumns: [hub.id],
			name: "HubUserStats_hubId_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "HubUserStats_userId_fkey"
		}).onDelete("cascade"),
	unique("HubUserStats_hub_user_year_month_key").on(table.hubId, table.month, table.userId, table.year),
]);

export const stripeEvent = pgTable("StripeEvent", {
	id: text().primaryKey().notNull(),
	type: text().notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const giftCode = pgTable("GiftCode", {
	id: text().primaryKey().notNull(),
	type: giftType().notNull(),
	tier: premiumTier().notNull(),
	purchasedBy: text().notNull(),
	claimedBy: text(),
	discountCouponId: text(),
	isClaimed: boolean().default(false).notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	claimedAt: timestamp({ mode: 'string' }),
}, (table) => [
	index("GiftCode_claimedBy_idx").using("btree", table.claimedBy.asc().nullsLast().op("text_ops")),
	index("GiftCode_purchasedBy_idx").using("btree", table.purchasedBy.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.claimedBy],
			foreignColumns: [user.id],
			name: "GiftCode_claimedBy_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.purchasedBy],
			foreignColumns: [user.id],
			name: "GiftCode_purchasedBy_fkey"
		}).onDelete("cascade"),
]);

export const premiumKey = pgTable("PremiumKey", {
	id: text().primaryKey().notNull(),
	tier: premiumTier().notNull(),
	purchasedBy: text(),
	subscriptionId: text().notNull(),
	assignedUser: text(),
	assignedGuild: text(),
	assignedHub: text(),
	status: keyStatus().default('PENDING').notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("PremiumKey_assignedGuild_idx").using("btree", table.assignedGuild.asc().nullsLast().op("text_ops")),
	index("PremiumKey_assignedHub_idx").using("btree", table.assignedHub.asc().nullsLast().op("text_ops")),
	index("PremiumKey_assignedUser_idx").using("btree", table.assignedUser.asc().nullsLast().op("text_ops")),
	index("PremiumKey_purchasedBy_idx").using("btree", table.purchasedBy.asc().nullsLast().op("text_ops")),
	index("PremiumKey_subscriptionId_idx").using("btree", table.subscriptionId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.assignedGuild],
			foreignColumns: [serverData.id],
			name: "PremiumKey_assignedGuild_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.assignedHub],
			foreignColumns: [hub.id],
			name: "PremiumKey_assignedHub_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.assignedUser],
			foreignColumns: [user.id],
			name: "PremiumKey_assignedUser_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.purchasedBy],
			foreignColumns: [user.id],
			name: "PremiumKey_purchasedBy_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.subscriptionId],
			foreignColumns: [stripeSubscription.id],
			name: "PremiumKey_subscriptionId_fkey"
		}).onDelete("cascade"),
]);

export const stripeSubscription = pgTable("StripeSubscription", {
	id: text().primaryKey().notNull(),
	customerId: text().notNull(),
	tier: premiumTier().notNull(),
	currentPeriodEnd: timestamp({ mode: 'string' }).notNull(),
	cancelAtPeriodEnd: boolean().notNull(),
	status: subscriptionStatus().default('PENDING').notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	lastEventTime: bigint({ mode: "number" }),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const lobby = pgTable("Lobby", {
	id: varchar().primaryKey().notNull(),
	status: lobbyStatus().notNull(),
	maxMemberCap: integer().notNull(),
	messageCount: integer().notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	closedAt: timestamp({ mode: 'string' }),
	callStartedAt: timestamp({ mode: 'string' }),
	durationSeconds: integer(),
}, (table) => [
	index("ix_lobby_status_open").using("btree", table.status.asc().nullsLast().op("enum_ops")).where(sql`(status = 'open'::"LobbyStatus")`),
]);

export const lobbyConnection = pgTable("LobbyConnection", {
	id: varchar().primaryKey().notNull(),
	lobbyId: text().notNull(),
	webhookUrl: text().notNull(),
	channelId: text().notNull(),
	invokerUserId: text().notNull(),
	invokerServerId: text().notNull(),
	joinedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	leftAt: timestamp({ mode: 'string' }),
	invokerServerName: text().default('Unknown Server').notNull(),
}, (table) => [
	index("ix_LobbyConnection_channelId").using("btree", table.channelId.asc().nullsLast().op("text_ops")),
	index("ix_LobbyConnection_invokerServerId").using("btree", table.invokerServerId.asc().nullsLast().op("text_ops")),
	index("ix_LobbyConnection_invokerUserId").using("btree", table.invokerUserId.asc().nullsLast().op("text_ops")),
	index("ix_LobbyConnection_lobbyId").using("btree", table.lobbyId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.invokerServerId],
			foreignColumns: [serverData.id],
			name: "LobbyConnection_invokerServerId_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.invokerUserId],
			foreignColumns: [user.id],
			name: "LobbyConnection_invokerUserId_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.lobbyId],
			foreignColumns: [lobby.id],
			name: "LobbyConnection_lobbyId_fkey"
		}).onDelete("cascade"),
]);

export const lobbyMessage = pgTable("LobbyMessage", {
	id: varchar().primaryKey().notNull(),
	content: text().notNull(),
	lobbyId: text().notNull(),
	sourceConnectionId: text(),
	sourceChannelId: text(),
	authorId: text().notNull(),
	replyToId: text(),
	original: boolean().notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	attachmentUrls: text().array().notNull(),
	authorDisplayName: text().default('Unknown User').notNull(),
}, (table) => [
	index("ix_LobbyMessage_authorId").using("btree", table.authorId.asc().nullsLast().op("text_ops")),
	index("ix_LobbyMessage_createdAt").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("ix_LobbyMessage_lobbyId").using("btree", table.lobbyId.asc().nullsLast().op("text_ops")),
	index("ix_LobbyMessage_replyToId").using("btree", table.replyToId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.authorId],
			foreignColumns: [user.id],
			name: "LobbyMessage_authorId_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.lobbyId],
			foreignColumns: [lobby.id],
			name: "LobbyMessage_lobbyId_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.replyToId],
			foreignColumns: [table.id],
			name: "LobbyMessage_replyToId_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.sourceConnectionId],
			foreignColumns: [lobbyConnection.id],
			name: "LobbyMessage_sourceConnectionId_fkey"
		}),
]);

export const betaServer = pgTable("BetaServer", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	invitedById: text().notNull(),
	invitedAt: timestamp({ mode: 'string' }).notNull(),
	isActive: boolean().notNull(),
	maxLobbies: integer().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.id],
			foreignColumns: [serverData.id],
			name: "BetaServer_id_fkey"
		}),
	foreignKey({
			columns: [table.invitedById],
			foreignColumns: [user.id],
			name: "BetaServer_invitedById_fkey"
		}),
]);

export const lobbyMessageDelivery = pgTable("LobbyMessageDelivery", {
	id: varchar().primaryKey().notNull(),
	lobbyMessageId: text().notNull(),
	targetConnectionId: text().notNull(),
	webhookMessageId: text().notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("ix_LobbyMessageDelivery_lobbyMessageId").using("btree", table.lobbyMessageId.asc().nullsLast().op("text_ops")),
	index("ix_LobbyMessageDelivery_webhookMessageId").using("btree", table.webhookMessageId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.lobbyMessageId],
			foreignColumns: [lobbyMessage.id],
			name: "LobbyMessageDelivery_lobbyMessageId_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.targetConnectionId],
			foreignColumns: [lobbyConnection.id],
			name: "LobbyMessageDelivery_targetConnectionId_fkey"
		}),
]);

export const lobbyReport = pgTable("LobbyReport", {
	id: varchar().primaryKey().notNull(),
	reason: text().notNull(),
	lobbyId: text().notNull(),
	reporterId: text().notNull(),
	reportedMessageId: text(),
	handledBy: text(),
	status: reportStatus().default('PENDING').notNull(),
	handledAt: timestamp({ mode: 'string' }),
	actionTaken: text(),
	reportChannelId: text(),
	reportMessageId: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("ix_LobbyReport_lobbyId").using("btree", table.lobbyId.asc().nullsLast().op("text_ops")),
	index("ix_LobbyReport_reportedMessageId").using("btree", table.reportedMessageId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.handledBy],
			foreignColumns: [user.id],
			name: "LobbyReport_handledBy_fkey"
		}),
	foreignKey({
			columns: [table.lobbyId],
			foreignColumns: [lobby.id],
			name: "LobbyReport_lobbyId_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.reportedMessageId],
			foreignColumns: [lobbyMessage.id],
			name: "LobbyReport_reportedMessageId_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.reporterId],
			foreignColumns: [user.id],
			name: "LobbyReport_reporterId_fkey"
		}),
]);

export const userStats = pgTable("UserStats", {
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	userId: text().primaryKey().notNull(),
	voteCount: integer().default(0).notNull(),
	reputation: integer().default(0).notNull(),
	messageCount: integer().default(0).notNull(),
	callCount: integer().default(0).notNull(),
	hubJoinCount: integer().default(0).notNull(),
}, (table) => [
	index("UserStats_callCount_idx").using("btree", table.callCount.asc().nullsLast().op("int4_ops")),
	index("UserStats_messageCount_idx").using("btree", table.messageCount.asc().nullsLast().op("int4_ops")),
	index("UserStats_reputation_idx").using("btree", table.reputation.asc().nullsLast().op("int4_ops")),
	index("UserStats_voteCount_idx").using("btree", table.voteCount.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "UserStats_userId_fkey"
		}).onDelete("cascade"),
	check("UserStats_callCount_check", sql`"callCount" >= 0`),
	check("UserStats_hubJoinCount_check", sql`"hubJoinCount" >= 0`),
	check("UserStats_messageCount_check", sql`"messageCount" >= 0`),
	check("UserStats_reputation_check", sql`reputation >= 0`),
	check("UserStats_voteCount_check", sql`"voteCount" >= 0`),
]);

export const lobbyInfraction = pgTable("LobbyInfraction", {
	id: varchar().primaryKey().notNull(),
	userId: text().notNull(),
	moderatorId: text().notNull(),
	infractionType: lobbyInfractionType().notNull(),
	reason: text().notNull(),
	reportId: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("ix_LobbyInfraction_userId").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.moderatorId],
			foreignColumns: [user.id],
			name: "LobbyInfraction_moderatorId_fkey"
		}),
	foreignKey({
			columns: [table.reportId],
			foreignColumns: [lobbyReport.id],
			name: "LobbyInfraction_reportId_fkey"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "LobbyInfraction_userId_fkey"
		}),
]);

export const lobbyReportActionLog = pgTable("LobbyReportActionLog", {
	id: varchar().primaryKey().notNull(),
	reportId: text().notNull(),
	actionType: lobbyReportActionType().notNull(),
	moderatorId: text().notNull(),
	targetUserId: text(),
	reason: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("ix_LobbyReportActionLog_reportId").using("btree", table.reportId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.moderatorId],
			foreignColumns: [user.id],
			name: "LobbyReportActionLog_moderatorId_fkey"
		}),
	foreignKey({
			columns: [table.reportId],
			foreignColumns: [lobbyReport.id],
			name: "LobbyReportActionLog_reportId_fkey"
		}),
	foreignKey({
			columns: [table.targetUserId],
			foreignColumns: [user.id],
			name: "LobbyReportActionLog_targetUserId_fkey"
		}),
]);

export const autoModEscalationRule = pgTable("AutoModEscalationRule", {
	id: text().primaryKey().notNull(),
	hubId: text(),
	serverId: text(),
	triggerThreshold: integer().notNull(),
	triggerWindowMinutes: integer().notNull(),
	action: blockWordAction().notNull(),
	createdBy: text().notNull(),
	actionDurationMinutes: integer(),
	enabled: boolean().default(false).notNull(),
	includeManual: boolean().default(false).notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [user.id],
			name: "AutoModEscalationRule_createdBy_fkey"
		}),
	foreignKey({
			columns: [table.hubId],
			foreignColumns: [hub.id],
			name: "AutoModEscalationRule_hubId_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.serverId],
			foreignColumns: [serverData.id],
			name: "AutoModEscalationRule_serverId_fkey"
		}).onDelete("cascade"),
	check("check_escalationrule_target", sql`(("hubId" IS NOT NULL) AND ("serverId" IS NULL)) OR (("hubId" IS NULL) AND ("serverId" IS NOT NULL))`),
]);

export const nsfwOverride = pgTable("NsfwOverride", {
	id: text().primaryKey().notNull(),
	createdById: text().notNull(),
	xxh3: varchar({ length: 64 }),
	phash: varchar({ length: 255 }),
	isSafe: boolean().default(true).notNull(),
	hubId: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("NsfwOverride_hubId_idx").using("btree", table.hubId.asc().nullsLast().op("text_ops")),
	index("NsfwOverride_phash_idx").using("btree", table.phash.asc().nullsLast().op("text_ops")),
	index("NsfwOverride_xxh3_idx").using("btree", table.xxh3.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.createdById],
			foreignColumns: [user.id],
			name: "NsfwOverride_createdById_fkey"
		}),
	foreignKey({
			columns: [table.hubId],
			foreignColumns: [hub.id],
			name: "NsfwOverride_hubId_fkey"
		}).onDelete("cascade"),
]);

export const nsfwReviewQueue = pgTable("NsfwReviewQueue", {
	id: text().primaryKey().notNull(),
	authorId: text().notNull(),
	url: text().notNull(),
	score: doublePrecision().notNull(),
	messageId: text(),
	xxh3: varchar({ length: 64 }),
	phash: varchar({ length: 255 }),
	hubId: text(),
	status: varchar({ length: 20 }).default('PENDING').notNull(),
	handledById: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("NsfwReviewQueue_hubId_idx").using("btree", table.hubId.asc().nullsLast().op("text_ops")),
	index("NsfwReviewQueue_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.authorId],
			foreignColumns: [user.id],
			name: "NsfwReviewQueue_authorId_fkey"
		}),
	foreignKey({
			columns: [table.handledById],
			foreignColumns: [user.id],
			name: "NsfwReviewQueue_handledById_fkey"
		}),
	foreignKey({
			columns: [table.hubId],
			foreignColumns: [hub.id],
			name: "NsfwReviewQueue_hubId_fkey"
		}).onDelete("cascade"),
]);

export const lobbyParticipant = pgTable("LobbyParticipant", {
	id: varchar().primaryKey().notNull(),
	lobbyId: text().notNull(),
	userId: text().notNull(),
	sourceConnectionId: text().notNull(),
	displayName: text().notNull(),
	firstSpokeAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("ix_LobbyParticipant_lobbyId").using("btree", table.lobbyId.asc().nullsLast().op("text_ops")),
	index("ix_LobbyParticipant_userId").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.lobbyId],
			foreignColumns: [lobby.id],
			name: "LobbyParticipant_lobbyId_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.sourceConnectionId],
			foreignColumns: [lobbyConnection.id],
			name: "LobbyParticipant_sourceConnectionId_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "LobbyParticipant_userId_fkey"
		}).onDelete("cascade"),
	unique("uq_lobby_participant").on(table.lobbyId, table.userId),
]);

export const automodRule = pgTable("AutomodRule", {
	id: text().primaryKey().notNull(),
	hubId: text(),
	serverId: text(),
	name: text().notNull(),
	createdBy: text().notNull(),
	enabled: boolean().default(true).notNull(),
	muteDurationMinutes: integer(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	// TODO: failed to parse database type 'BlockWordAction"[]'
	actions: blockWordAction().array().default([]).notNull(),
	isGlobal: boolean().default(false).notNull(),
	description: text(),
	shortDescription: text(),
	emoji: text(),
	isMandatory: boolean().default(false).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [user.id],
			name: "AutomodRule_createdBy_fkey"
		}),
	foreignKey({
			columns: [table.hubId],
			foreignColumns: [hub.id],
			name: "AutomodRule_hubId_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.serverId],
			foreignColumns: [serverData.id],
			name: "AutomodRule_serverId_fkey"
		}).onDelete("cascade"),
	unique("uq_automodrule_hub_name").on(table.hubId, table.name),
	unique("uq_automodrule_server_name").on(table.name, table.serverId),
	check("check_automodrule_target", sql`("isGlobal" IS TRUE) OR (("hubId" IS NOT NULL) AND ("serverId" IS NULL)) OR (("hubId" IS NULL) AND ("serverId" IS NOT NULL))`),
]);

export const automodPattern = pgTable("AutomodPattern", {
	id: text().primaryKey().notNull(),
	ruleId: text().notNull(),
	pattern: text().notNull(),
	matchType: patternMatchType().default('EXACT').notNull(),
	isUiExample: boolean().default(false).notNull(),
}, (table) => [
	index("AutomodPattern_ruleId_idx").using("btree", table.ruleId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.ruleId],
			foreignColumns: [automodRule.id],
			name: "AutomodPattern_ruleId_fkey"
		}).onDelete("cascade"),
]);

export const automodWhitelist = pgTable("AutomodWhitelist", {
	id: text().primaryKey().notNull(),
	ruleId: text().notNull(),
	word: text().notNull(),
	createdBy: text().notNull(),
	reason: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [user.id],
			name: "AutomodWhitelist_createdBy_fkey"
		}),
	foreignKey({
			columns: [table.ruleId],
			foreignColumns: [automodRule.id],
			name: "AutomodWhitelist_ruleId_fkey"
		}).onDelete("cascade"),
	unique("AutomodWhitelist_ruleId_word_key").on(table.ruleId, table.word),
]);

export const authRole = pgTable("AuthRole", {
	id: uuid().primaryKey().notNull(),
	hubId: text(),
	name: text().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	permissions: bigint({ mode: "number" }).notNull(),
	position: integer().notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("ix_AuthRole_hubId").using("btree", table.hubId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.hubId],
			foreignColumns: [hub.id],
			name: "AuthRole_hubId_fkey"
		}).onDelete("cascade"),
	unique("uq_authrole_hubid_name").on(table.hubId, table.name),
]);

export const authUserAssignment = pgTable("AuthUserAssignment", {
	id: uuid().primaryKey().notNull(),
	roleId: uuid().notNull(),
	userId: text().notNull(),
	targetServerId: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("ix_AuthUserAssignment_roleId").using("btree", table.roleId.asc().nullsLast().op("uuid_ops")),
	index("ix_AuthUserAssignment_targetServerId").using("btree", table.targetServerId.asc().nullsLast().op("text_ops")),
	index("ix_AuthUserAssignment_userId").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.roleId],
			foreignColumns: [authRole.id],
			name: "AuthUserAssignment_roleId_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "AuthUserAssignment_userId_fkey"
		}).onDelete("cascade"),
]);

export const auditLog = pgTable("AuditLog", {
	id: text().primaryKey().notNull(),
	eventType: varchar({ length: 64 }).notNull(),
	summary: text().notNull(),
	guildId: text(),
	hubId: text(),
	userId: text(),
	actorId: text(),
	before: jsonb(),
	after: jsonb(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("AuditLog_actorId_idx").using("btree", table.actorId.asc().nullsLast().op("text_ops")),
	index("AuditLog_createdAt_idx").using("btree", table.createdAt.desc().nullsFirst().op("timestamp_ops")),
	index("AuditLog_eventType_idx").using("btree", table.eventType.asc().nullsLast().op("text_ops")),
	index("AuditLog_guildId_createdAt_idx").using("btree", table.guildId.asc().nullsLast().op("text_ops"), table.createdAt.desc().nullsFirst().op("text_ops")),
	index("AuditLog_guildId_idx").using("btree", table.guildId.asc().nullsLast().op("text_ops")),
	index("AuditLog_guildName_eventType_idx").using("btree", table.eventType.asc().nullsLast().op("text_ops"), table.guildId.asc().nullsLast().op("text_ops")).where(sql`(("eventType")::text = 'GuildNameChanged'::text)`),
	index("AuditLog_hubId_createdAt_idx").using("btree", table.hubId.asc().nullsLast().op("text_ops"), table.createdAt.desc().nullsFirst().op("text_ops")),
	index("AuditLog_hubId_idx").using("btree", table.hubId.asc().nullsLast().op("text_ops")),
	index("AuditLog_userId_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.actorId],
			foreignColumns: [user.id],
			name: "AuditLog_actorId_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.guildId],
			foreignColumns: [serverData.id],
			name: "AuditLog_guildId_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.hubId],
			foreignColumns: [hub.id],
			name: "AuditLog_hubId_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "AuditLog_userId_fkey"
		}).onDelete("set null"),
]);

export const botAnalyticsEvent = pgTable("BotAnalyticsEvent", {
	id: uuid().primaryKey().notNull(),
	eventType: varchar({ length: 64 }).notNull(),
	userId: text(),
	guildId: text(),
	hubId: text(),
	properties: jsonb(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("BotAnalyticsEvent_eventType_createdAt_idx").using("btree", table.eventType.asc().nullsLast().op("text_ops"), table.createdAt.asc().nullsLast().op("text_ops")),
	index("BotAnalyticsEvent_guildId_createdAt_idx").using("btree", table.guildId.asc().nullsLast().op("text_ops"), table.createdAt.asc().nullsLast().op("text_ops")),
	index("BotAnalyticsEvent_hubId_createdAt_idx").using("btree", table.hubId.asc().nullsLast().op("timestamp_ops"), table.createdAt.asc().nullsLast().op("text_ops")),
	index("BotAnalyticsEvent_userId_createdAt_idx").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.createdAt.asc().nullsLast().op("text_ops")),
	index("ix_BotAnalyticsEvent_createdAt").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("ix_BotAnalyticsEvent_eventType").using("btree", table.eventType.asc().nullsLast().op("text_ops")),
	index("ix_BotAnalyticsEvent_guildId").using("btree", table.guildId.asc().nullsLast().op("text_ops")),
	index("ix_BotAnalyticsEvent_hubId").using("btree", table.hubId.asc().nullsLast().op("text_ops")),
	index("ix_BotAnalyticsEvent_userId").using("btree", table.userId.asc().nullsLast().op("text_ops")),
]);

export const userSafetyScore = pgTable("UserSafetyScore", {
	userId: text().primaryKey().notNull(),
	compositeScore: doublePrecision().default(0).notNull(),
	tier: safetyScoreTier().default('SAFE').notNull(),
	signalBreakdown: jsonb().default({}).notNull(),
	lastEvaluatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("ix_user_safety_score_last_evaluated").using("btree", table.lastEvaluatedAt.asc().nullsLast().op("timestamp_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "UserSafetyScore_userId_fkey"
		}),
]);

export const safetySignal = pgTable("SafetySignal", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	signalType: safetySignalType().notNull(),
	value: doublePrecision().notNull(),
	weight: doublePrecision().notNull(),
	expiresAt: timestamp({ mode: 'string' }).notNull(),
	confidence: doublePrecision().default(1).notNull(),
	signalMetadata: jsonb(),
	hubId: text(),
	lobbyId: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("ix_safety_signal_expires").using("btree", table.expiresAt.asc().nullsLast().op("timestamp_ops")),
	index("ix_safety_signal_user_id").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	index("ix_safety_signal_user_type").using("btree", table.userId.asc().nullsLast().op("enum_ops"), table.signalType.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.hubId],
			foreignColumns: [hub.id],
			name: "SafetySignal_hubId_fkey"
		}),
	foreignKey({
			columns: [table.lobbyId],
			foreignColumns: [lobby.id],
			name: "SafetySignal_lobbyId_fkey"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "SafetySignal_userId_fkey"
		}),
]);

export const safetyFlag = pgTable("SafetyFlag", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	score: doublePrecision().notNull(),
	previousTier: safetyScoreTier().notNull(),
	newTier: safetyScoreTier().notNull(),
	reason: text().notNull(),
	hubId: text(),
	lobbyId: text(),
	evidence: jsonb().default({}).notNull(),
	status: safetyFlagStatus().default('ACTIVE').notNull(),
	acknowledgedBy: text(),
	acknowledgedAt: timestamp({ mode: 'string' }),
	autoActionTaken: text(),
	staffNotes: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("ix_safety_flag_hub_id").using("btree", table.hubId.asc().nullsLast().op("text_ops"), table.status.asc().nullsLast().op("text_ops")),
	index("ix_safety_flag_status").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	index("ix_safety_flag_user_id").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.acknowledgedBy],
			foreignColumns: [user.id],
			name: "SafetyFlag_acknowledgedBy_fkey"
		}),
	foreignKey({
			columns: [table.hubId],
			foreignColumns: [hub.id],
			name: "SafetyFlag_hubId_fkey"
		}),
	foreignKey({
			columns: [table.lobbyId],
			foreignColumns: [lobby.id],
			name: "SafetyFlag_lobbyId_fkey"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "SafetyFlag_userId_fkey"
		}),
]);

export const bannedUserAlias = pgTable("BannedUserAlias", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	displayName: text().notNull(),
	source: text().notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("ix_banned_alias_name").using("btree", table.displayName.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "BannedUserAlias_userId_fkey"
		}),
]);

export const moderatedContentHash = pgTable("ModeratedContentHash", {
	id: text().primaryKey().notNull(),
	contentHash: text().notNull(),
	contentPreview: text().notNull(),
	infractionId: text(),
	lobbyInfractionId: text(),
	hubReportId: text(),
	globalReportId: text(),
	lobbyReportId: text(),
	severity: integer().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("ix_moderated_content_created").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("ix_moderated_content_hash").using("btree", table.contentHash.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.globalReportId],
			foreignColumns: [globalReport.id],
			name: "ModeratedContentHash_globalReportId_fkey"
		}),
	foreignKey({
			columns: [table.hubReportId],
			foreignColumns: [hubReport.id],
			name: "ModeratedContentHash_hubReportId_fkey"
		}),
	foreignKey({
			columns: [table.infractionId],
			foreignColumns: [infraction.id],
			name: "ModeratedContentHash_infractionId_fkey"
		}),
	foreignKey({
			columns: [table.lobbyInfractionId],
			foreignColumns: [lobbyInfraction.id],
			name: "ModeratedContentHash_lobbyInfractionId_fkey"
		}),
	foreignKey({
			columns: [table.lobbyReportId],
			foreignColumns: [lobbyReport.id],
			name: "ModeratedContentHash_lobbyReportId_fkey"
		}),
	unique("ModeratedContentHash_contentHash_key").on(table.contentHash),
]);

export const serverSafetyScore = pgTable("ServerSafetyScore", {
	serverId: text().primaryKey().notNull(),
	compositeScore: doublePrecision().default(0).notNull(),
	tier: safetyScoreTier().default('SAFE').notNull(),
	signalBreakdown: jsonb().default({}).notNull(),
	lastEvaluatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("ix_server_safety_score_last_evaluated").using("btree", table.lastEvaluatedAt.asc().nullsLast().op("timestamp_ops")),
	foreignKey({
			columns: [table.serverId],
			foreignColumns: [serverData.id],
			name: "ServerSafetyScore_serverId_fkey"
		}),
]);

export const serverSafetySignal = pgTable("ServerSafetySignal", {
	id: text().primaryKey().notNull(),
	serverId: text().notNull(),
	signalType: safetySignalType().notNull(),
	value: doublePrecision().notNull(),
	weight: doublePrecision().notNull(),
	confidence: doublePrecision().default(1).notNull(),
	expiresAt: timestamp({ mode: 'string' }).notNull(),
	signalMetadata: jsonb(),
	hubId: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("ix_server_safety_signal_expires").using("btree", table.expiresAt.asc().nullsLast().op("timestamp_ops")),
	index("ix_server_safety_signal_server_id").using("btree", table.serverId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.hubId],
			foreignColumns: [hub.id],
			name: "ServerSafetySignal_hubId_fkey"
		}),
	foreignKey({
			columns: [table.serverId],
			foreignColumns: [serverData.id],
			name: "ServerSafetySignal_serverId_fkey"
		}),
]);

export const serverSafetyFlag = pgTable("ServerSafetyFlag", {
	id: text().primaryKey().notNull(),
	serverId: text().notNull(),
	score: doublePrecision().notNull(),
	previousTier: safetyScoreTier().notNull(),
	newTier: safetyScoreTier().notNull(),
	reason: text().notNull(),
	hubId: text(),
	evidence: jsonb().default({}).notNull(),
	status: safetyFlagStatus().default('ACTIVE').notNull(),
	acknowledgedBy: text(),
	acknowledgedAt: timestamp({ mode: 'string' }),
	staffNotes: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("ix_server_safety_flag_server_id").using("btree", table.serverId.asc().nullsLast().op("text_ops")),
	index("ix_server_safety_flag_status").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	foreignKey({
			columns: [table.acknowledgedBy],
			foreignColumns: [user.id],
			name: "ServerSafetyFlag_acknowledgedBy_fkey"
		}),
	foreignKey({
			columns: [table.hubId],
			foreignColumns: [hub.id],
			name: "ServerSafetyFlag_hubId_fkey"
		}),
	foreignKey({
			columns: [table.serverId],
			foreignColumns: [serverData.id],
			name: "ServerSafetyFlag_serverId_fkey"
		}),
]);

export const serverAutomodRuleState = pgTable("ServerAutomodRuleState", {
	serverId: text().notNull(),
	ruleId: text().notNull(),
	enabled: boolean().default(true).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.ruleId],
			foreignColumns: [automodRule.id],
			name: "ServerAutomodRuleState_ruleId_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.serverId],
			foreignColumns: [serverData.id],
			name: "ServerAutomodRuleState_serverId_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.ruleId, table.serverId], name: "uq_server_automod_rule_state"}),
]);

export const userAchievementProgress = pgTable("UserAchievementProgress", {
	userId: text().notNull(),
	achievementId: text().notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	currentValue: integer().default(0).notNull(),
}, (table) => [
	index("UserAchievementProgress_achievementId_idx").using("btree", table.achievementId.asc().nullsLast().op("text_ops")),
	index("UserAchievementProgress_userId_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.achievementId],
			foreignColumns: [achievement.id],
			name: "UserAchievementProgress_achievementId_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "UserAchievementProgress_userId_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.achievementId, table.userId], name: "UserAchievementProgress_pkey"}),
	check("UserAchievementProgress_currentValue_check", sql`"currentValue" >= 0`),
]);