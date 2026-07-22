import { pgTable, index, uuid, varchar, text, jsonb, timestamp, boolean, foreignKey, unique, doublePrecision, integer, bigint, check, uniqueIndex, date, primaryKey, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const approvalStatus = pgEnum("ApprovalStatus", ['PENDING', 'APPROVED', 'REJECTED'])
export const badges = pgEnum("Badges", ['VOTER', 'SUPPORTER', 'TRANSLATOR', 'DEVELOPER', 'STAFF', 'BETA_TESTER', 'HUB_OWNER', 'HUB_MANAGER', 'HUB_MODERATOR', 'TOP_CHATTER'])
export const hubActivityLevel = pgEnum("HubActivityLevel", ['LOW', 'MEDIUM', 'HIGH'])
export const hubVisibility = pgEnum("HubVisibility", ['PUBLIC', 'PRIVATE', 'UNLISTED'])
export const lobbyStatus = pgEnum("LobbyStatus", ['OPEN', 'CLOSED'])
export const messageStatus = pgEnum("MessageStatus", ['PENDING', 'ACTIVE', 'DELETED'])
export const reportStatus = pgEnum("ReportStatus", ['PENDING', 'RESOLVED', 'IGNORED'])


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
	index("BotAnalyticsEvent_guildId_createdAt_idx").using("btree", table.guildId.asc().nullsLast().op("timestamp_ops"), table.createdAt.asc().nullsLast().op("text_ops")),
	index("BotAnalyticsEvent_hubId_createdAt_idx").using("btree", table.hubId.asc().nullsLast().op("text_ops"), table.createdAt.asc().nullsLast().op("text_ops")),
	index("BotAnalyticsEvent_userId_createdAt_idx").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.createdAt.asc().nullsLast().op("text_ops")),
	index("ix_BotAnalyticsEvent_createdAt").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("ix_BotAnalyticsEvent_eventType").using("btree", table.eventType.asc().nullsLast().op("text_ops")),
	index("ix_BotAnalyticsEvent_guildId").using("btree", table.guildId.asc().nullsLast().op("text_ops")),
	index("ix_BotAnalyticsEvent_hubId").using("btree", table.hubId.asc().nullsLast().op("text_ops")),
	index("ix_BotAnalyticsEvent_userId").using("btree", table.userId.asc().nullsLast().op("text_ops")),
]);

export const devAlerts = pgTable("DevAlerts", {
	id: text().primaryKey().notNull(),
	title: text().notNull(),
	content: text().notNull(),
	imageUrl: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	thumbnailUrl: text(),
});

export const verification = pgTable("Verification", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp({ mode: 'string' }).notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow(),
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
	}, (table) => [
	index("User_createdAt_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("User_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("User_lastVoted_idx").using("btree", table.lastVoted.asc().nullsLast().op("timestamp_ops")),
	index("User_locale_idx").using("btree", table.locale.asc().nullsLast().op("text_ops")),
]);

export const account = pgTable("Account", {
	id: text().primaryKey().notNull(),
	accountId: text().notNull(),
	providerId: text().notNull(),
	userId: text().notNull(),
	accessToken: text(),
	refreshToken: text(),
	idToken: text(),
	accessTokenExpiresAt: timestamp({ mode: 'string' }),
	refreshTokenExpiresAt: timestamp({ mode: 'string' }),
	scope: text(),
	password: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "Account_userId_fkey"
		}).onDelete("cascade"),
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
	averageRating: doublePrecision().default(0),
	settings: integer().default(0).notNull(),
	appealCooldownHours: integer().default(168).notNull(),
	weeklyMessageCount: integer().default(0).notNull(),
	connectionCount: integer().default(0).notNull(),
	upvoteCount: integer().default(0).notNull(),
	reviewCount: integer().default(0).notNull(),
	locked: boolean().default(false).notNull(),
	nsfw: boolean().default(false).notNull(),
	verified: boolean().default(false).notNull(),
	partnered: boolean().default(false).notNull(),
	featured: boolean().default(false).notNull(),
	rules: text().array().notNull(),
	activityLevel: hubActivityLevel().default('LOW').notNull(),
	visibility: hubVisibility().default('PUBLIC').notNull(),
}, (table) => [
	index("Hub_connectionCount_idx").using("btree", table.connectionCount.desc().nullsFirst().op("int4_ops")),
	index("Hub_createdAt_idx").using("btree", table.createdAt.desc().nullsFirst().op("timestamp_ops")),
	index("Hub_nsfw_idx").using("btree", table.nsfw.asc().nullsLast().op("bool_ops")),
	index("Hub_ownerId_idx").using("btree", table.ownerId.asc().nullsLast().op("text_ops")),
	index("Hub_upvoteCount_idx").using("btree", table.upvoteCount.desc().nullsFirst().op("int4_ops")),
	index("Hub_verified_featured_visibility_idx").using("btree", table.verified.asc().nullsLast().op("bool_ops"), table.featured.asc().nullsLast().op("bool_ops"), table.visibility.asc().nullsLast().op("bool_ops")),
	index("Hub_weeklyMessageCount_idx").using("btree", table.weeklyMessageCount.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.ownerId],
			foreignColumns: [user.id],
			name: "Hub_ownerId_fkey"
		}),
	unique("Hub_name_key").on(table.name),
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
	index("AuditLog_guildId_createdAt_idx").using("btree", table.guildId.asc().nullsLast().op("timestamp_ops"), table.createdAt.desc().nullsFirst().op("timestamp_ops")),
	index("AuditLog_guildId_idx").using("btree", table.guildId.asc().nullsLast().op("text_ops")),
	index("AuditLog_guildName_eventType_idx").using("btree", table.eventType.asc().nullsLast().op("text_ops"), table.guildId.asc().nullsLast().op("text_ops")).where(sql`(("eventType")::text = 'GuildNameChanged'::text)`),
	index("AuditLog_hubId_createdAt_idx").using("btree", table.hubId.asc().nullsLast().op("text_ops"), table.createdAt.desc().nullsFirst().op("timestamp_ops")),
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

export const serverData = pgTable("ServerData", {
	id: text().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	lastMessageAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	prefix: text(),
	inviteCode: text(),
	messageCount: integer().default(0).notNull(),
	callCount: integer().default(0).notNull(),
	iconUrl: text(),
	hideServerName: boolean().default(false).notNull(),
	pingOnMatch: boolean().default(false).notNull(),
	autoRequeueOnSkip: boolean().default(false).notNull(),
	autoRequeueOnHangup: boolean().default(false).notNull(),
	filterNsfw: boolean().default(true).notNull(),
	lobbyChannelIds: text().array().default([""]).notNull(),
}, (table) => [
	index("ServerData_callCount_idx").using("btree", table.callCount.asc().nullsLast().op("int4_ops")),
	index("ServerData_lastMessageAt_idx").using("btree", table.lastMessageAt.desc().nullsFirst().op("timestamp_ops")),
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

export const message = pgTable("Message", {
	id: text().primaryKey().notNull(),
	hubId: text().notNull(),
	content: varchar({ length: 4000 }).notNull(),
	imageUrl: varchar(),
	channelId: text().notNull(),
	guildId: text().notNull(),
	authorId: text().notNull(),
	referredMessageId: text(),
	status: messageStatus().default('ACTIVE').notNull(),
	deletionQueuedAt: timestamp({ mode: 'string' }),
	retentionUntil: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("Message_authorId_idx").using("btree", table.authorId.asc().nullsLast().op("text_ops")),
	index("Message_channel_timestamp_idx").using("btree", table.channelId.asc().nullsLast().op("text_ops"), table.createdAt.desc().nullsFirst().op("text_ops")),
	index("Message_createdAt_idx").using("btree", table.createdAt.desc().nullsFirst().op("timestamp_ops")),
	index("Message_guildId_authorId_idx").using("btree", table.guildId.asc().nullsLast().op("text_ops"), table.authorId.asc().nullsLast().op("text_ops")),
	index("Message_guildId_idx").using("btree", table.guildId.asc().nullsLast().op("text_ops")),
	index("Message_hubId_createdAt_idx").using("btree", table.hubId.asc().nullsLast().op("text_ops"), table.createdAt.desc().nullsFirst().op("text_ops")),
	index("Message_referredMessageId_idx").using("btree", table.referredMessageId.asc().nullsLast().op("text_ops")),
	index("Message_status_createdAt_idx").using("btree", table.status.asc().nullsLast().op("timestamp_ops"), table.createdAt.desc().nullsFirst().op("timestamp_ops")),
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

export const connection = pgTable("Connection", {
	id: text().primaryKey().notNull(),
	channelId: text().notNull(),
	invite: text(),
	webhookUrl: text().notNull(),
	serverId: text().notNull(),
	hubId: text().notNull(),
	lastActive: timestamp({ mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	parentId: text(),
	webhookSecondaryUrl: text(),
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

export const feedbackFormVersion = pgTable("FeedbackFormVersion", {
	id: text().primaryKey().notNull(),
	formKey: varchar({ length: 64 }).notNull(),
	version: integer().notNull(),
	schemaFingerprint: varchar({ length: 64 }).notNull(),
	schemaSnapshot: jsonb().notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	retiredAt: timestamp({ mode: 'string' }),
}, (table) => [
	unique("FeedbackFormVersion_formKey_version_key").on(table.formKey, table.version),
	check("FeedbackFormVersion_version_check", sql`version > 0`),
]);

export const feedbackSubmission = pgTable("FeedbackSubmission", {
	id: text().primaryKey().notNull(),
	invitationId: text().notNull(),
	formKey: varchar({ length: 64 }).notNull(),
	formVersion: integer().notNull(),
	schemaFingerprint: varchar({ length: 64 }).notNull(),
	userId: text().notNull(),
	source: varchar({ length: 64 }).notNull(),
	occurrenceId: text().notNull(),
	answers: jsonb().notNull(),
	context: jsonb().notNull(),
	locale: varchar({ length: 16 }).notNull(),
	guildId: text(),
	channelId: text(),
	hubId: text(),
	lobbyId: text(),
	reportId: text(),
	commandName: varchar({ length: 100 }),
	sourceInteractionId: text(),
	dedupeKey: varchar({ length: 64 }),
	submittedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("FeedbackSubmission_dedupeKey_key").using("btree", table.dedupeKey.asc().nullsLast().op("text_ops")).where(sql`("dedupeKey" IS NOT NULL)`),
	index("FeedbackSubmission_formKey_formVersion_submittedAt_idx").using("btree", table.formKey.asc().nullsLast().op("int4_ops"), table.formVersion.asc().nullsLast().op("int4_ops"), table.submittedAt.asc().nullsLast().op("timestamp_ops")),
	index("FeedbackSubmission_guildId_submittedAt_idx").using("btree", table.guildId.asc().nullsLast().op("timestamp_ops"), table.submittedAt.asc().nullsLast().op("timestamp_ops")),
	index("FeedbackSubmission_hubId_submittedAt_idx").using("btree", table.hubId.asc().nullsLast().op("text_ops"), table.submittedAt.asc().nullsLast().op("text_ops")),
	index("FeedbackSubmission_lobbyId_submittedAt_idx").using("btree", table.lobbyId.asc().nullsLast().op("text_ops"), table.submittedAt.asc().nullsLast().op("text_ops")),
	index("FeedbackSubmission_source_submittedAt_idx").using("btree", table.source.asc().nullsLast().op("text_ops"), table.submittedAt.asc().nullsLast().op("text_ops")),
	index("FeedbackSubmission_userId_submittedAt_idx").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.submittedAt.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.formKey, table.formVersion],
			foreignColumns: [feedbackFormVersion.formKey, feedbackFormVersion.version],
			name: "FeedbackSubmission_formKey_formVersion_fkey"
		}),
	unique("FeedbackSubmission_invitationId_key").on(table.invitationId),
	check("FeedbackSubmission_formVersion_check", sql`"formVersion" > 0`),
]);

export const feedbackHandlerJob = pgTable("FeedbackHandlerJob", {
	id: text().primaryKey().notNull(),
	submissionId: text().notNull(),
	handlerKey: varchar({ length: 100 }).notNull(),
	availableAt: timestamp({ mode: 'string' }).notNull(),
	status: varchar({ length: 16 }).default('PENDING').notNull(),
	attempts: integer().default(0).notNull(),
	lastError: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	processedAt: timestamp({ mode: 'string' }),
}, (table) => [
	index("FeedbackHandlerJob_status_availableAt_idx").using("btree", table.status.asc().nullsLast().op("timestamp_ops"), table.availableAt.asc().nullsLast().op("text_ops")),
	index("FeedbackHandlerJob_submissionId_idx").using("btree", table.submissionId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.submissionId],
			foreignColumns: [feedbackSubmission.id],
			name: "FeedbackHandlerJob_submissionId_fkey"
		}).onDelete("cascade"),
	unique("FeedbackHandlerJob_submissionId_handlerKey_key").on(table.handlerKey, table.submissionId),
	check("FeedbackHandlerJob_attempts_check", sql`attempts >= 0`),
	check("FeedbackHandlerJob_status_check", sql`(status)::text = ANY (ARRAY[('PENDING'::character varying)::text, ('PROCESSING'::character varying)::text, ('COMPLETED'::character varying)::text, ('FAILED'::character varying)::text])`),
]);

export const globalReport = pgTable("GlobalReport", {
	id: text().primaryKey().notNull(),
	reporterId: text().notNull(),
	reportedUserId: text().notNull(),
	reportedServerId: text().notNull(),
	messageId: text(),
	reason: text().notNull(),
	reportContextId: text(),
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
	index("GlobalReport_reportContextId_idx").using("btree", table.reportContextId.asc().nullsLast().op("text_ops")),
	index("GlobalReport_reportedUserId_idx").using("btree", table.reportedUserId.asc().nullsLast().op("text_ops")),
	index("GlobalReport_reporterId_idx").using("btree", table.reporterId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.handledBy],
			foreignColumns: [user.id],
			name: "GlobalReport_handledBy_fkey"
		}),
	foreignKey({
			columns: [table.reportContextId],
			foreignColumns: [reportContext.id],
			name: "GlobalReport_reportContextId_fkey"
		}).onDelete("set null"),
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

export const reportContext = pgTable("ReportContext", {
	id: text().primaryKey().notNull(),
	reportId: text().notNull(),
	reportType: text().notNull(),
	messageId: text().notNull(),
	content: text(),
	authorId: text().notNull(),
	channelId: text(),
	guildId: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	messageData: jsonb(),
}, (table) => [
	index("ReportContext_messageId_idx").using("btree", table.messageId.asc().nullsLast().op("text_ops")),
	index("ReportContext_reportId_idx").using("btree", table.reportId.asc().nullsLast().op("text_ops")),
]);

export const hubActivityMetrics = pgTable("HubActivityMetrics", {
	id: text().primaryKey().notNull(),
	hubId: text().notNull(),
	lastUpdated: timestamp({ mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	messagesLast24H: integer().default(0).notNull(),
	activeUsersLast24H: integer().default(0).notNull(),
	newConnectionsLast24H: integer().default(0).notNull(),
	messagesLast7D: integer().default(0).notNull(),
	activeUsersLast7D: integer().default(0).notNull(),
	newConnectionsLast7D: integer().default(0).notNull(),
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

export const hubReport = pgTable("HubReport", {
	id: text().primaryKey().notNull(),
	hubId: text().notNull(),
	reporterId: text().notNull(),
	reportedUserId: text().notNull(),
	reportedServerId: text().notNull(),
	messageId: text(),
	reason: text().notNull(),
	reportContextId: text(),
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
	index("HubReport_reportContextId_idx").using("btree", table.reportContextId.asc().nullsLast().op("text_ops")),
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
			columns: [table.reportContextId],
			foreignColumns: [reportContext.id],
			name: "HubReport_reportContextId_fkey"
		}).onDelete("set null"),
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

export const hubServerStats = pgTable("HubServerStats", {
	id: text().primaryKey().notNull(),
	hubId: text().notNull(),
	serverId: text().notNull(),
	year: integer().notNull(),
	month: integer().notNull(),
	messageCount: integer().default(0).notNull(),
	lastMessageAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("HubServerStats_hubId_year_month_count_idx").using("btree", table.hubId.asc().nullsLast().op("int4_ops"), table.year.asc().nullsLast().op("text_ops"), table.month.asc().nullsLast().op("text_ops"), table.messageCount.asc().nullsLast().op("int4_ops")),
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

export const hubUserStats = pgTable("HubUserStats", {
	id: text().primaryKey().notNull(),
	hubId: text().notNull(),
	userId: text().notNull(),
	year: integer().notNull(),
	month: integer().notNull(),
	messageCount: integer().default(0).notNull(),
	lastMessageAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("HubUserStats_hubId_year_month_count_idx").using("btree", table.hubId.asc().nullsLast().op("int4_ops"), table.year.asc().nullsLast().op("text_ops"), table.month.asc().nullsLast().op("text_ops"), table.messageCount.asc().nullsLast().op("int4_ops")),
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

export const lobbyConnection = pgTable("LobbyConnection", {
	id: varchar().primaryKey().notNull(),
	lobbyId: text().notNull(),
	webhookUrl: text().notNull(),
	channelId: text().notNull(),
	invokerUserId: text().notNull(),
	invokerServerId: text().notNull(),
	invokerServerName: text().default('Unknown Server').notNull(),
	joinedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	leftAt: timestamp({ mode: 'string' }),
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
	index("ix_lobby_status_open").using("btree", table.status.asc().nullsLast().op("enum_ops")).where(sql`(status = 'OPEN'::"LobbyStatus")`),
]);

export const lobbyMessage = pgTable("LobbyMessage", {
	id: varchar().primaryKey().notNull(),
	content: text().notNull(),
	lobbyId: text().notNull(),
	sourceConnectionId: text(),
	sourceChannelId: text(),
	authorId: text().notNull(),
	authorDisplayName: text().default('Unknown User').notNull(),
	replyToId: text(),
	original: boolean().notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	attachmentUrls: text().array().notNull(),
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

export const lobbyParticipant = pgTable("LobbyParticipant", {
	id: varchar().primaryKey().notNull(),
	lobbyId: text().notNull(),
	userId: text().notNull(),
	sourceConnectionId: text().notNull(),
	displayName: text().notNull(),
	avatarUrl: text(),
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

export const session = pgTable("Session", {
	id: text().primaryKey().notNull(),
	expiresAt: timestamp({ mode: 'string' }).notNull(),
	token: text().notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	ipAddress: text(),
	userAgent: text(),
	userId: text().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "Session_userId_fkey"
		}).onDelete("cascade"),
	unique("Session_token_key").on(table.token),
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

export const userStats = pgTable("UserStats", {
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	userId: text().primaryKey().notNull(),
	voteCount: integer().default(0).notNull(),
	reputation: integer().default(0).notNull(),
	messageCount: integer().default(0).notNull(),
	callCount: integer().default(0).notNull(),
	hubJoinCount: integer().default(0).notNull(),
	currentStreak: integer().default(0).notNull(),
	longestStreak: integer().default(0).notNull(),
	streakFreezes: integer().default(0).notNull(),
	lastStreakDate: date(),
}, (table) => [
	index("UserStats_callCount_idx").using("btree", table.callCount.asc().nullsLast().op("int4_ops")),
	index("UserStats_currentStreak_idx").using("btree", table.currentStreak.asc().nullsLast().op("int4_ops")),
	index("UserStats_messageCount_idx").using("btree", table.messageCount.asc().nullsLast().op("int4_ops")),
	index("UserStats_reputation_idx").using("btree", table.reputation.asc().nullsLast().op("int4_ops")),
	index("UserStats_voteCount_idx").using("btree", table.voteCount.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "UserStats_userId_fkey"
		}).onDelete("cascade"),
	check("UserStats_callCount_check", sql`"callCount" >= 0`),
	check("UserStats_currentStreak_check", sql`"currentStreak" >= 0`),
	check("UserStats_hubJoinCount_check", sql`"hubJoinCount" >= 0`),
	check("UserStats_longestStreak_check", sql`"longestStreak" >= 0`),
	check("UserStats_messageCount_check", sql`"messageCount" >= 0`),
	check("UserStats_reputation_check", sql`reputation >= 0`),
	check("UserStats_streakFreezes_check", sql`("streakFreezes" >= 0) AND ("streakFreezes" <= 2)`),
	check("UserStats_voteCount_check", sql`"voteCount" >= 0`),
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

export const tag = pgTable("Tag", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	category: text(),
	description: text(),
	color: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	isOfficial: boolean().default(false).notNull(),
	usageCount: integer().default(0).notNull(),
}, (table) => [
	unique("Tag_name_key").on(table.name),
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
