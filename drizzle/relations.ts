import { relations } from "drizzle-orm/relations";
import { message, broadcast, hub, user, blockWord, serverData, infraction, appeal, hubReport, blacklist, lobbyReport, hubActivityMetrics, connection, globalReport, hubInvite, hubAnnouncement, hubMessageReaction, hubReview, hubLogConfig, hubRulesAcceptance, hubUpvote, reputationLog, serverBlacklist, serverBlocklist, achievement, userAchievement, session, hubToTag, tag, bot, allowedBots, account, botToTag, botTag, hubServerStats, hubUserStats, lobbyConnection, lobby, lobbyMessage, betaServer, lobbyMessageDelivery, userStats, lobbyInfraction, lobbyReportActionLog, autoModEscalationRule, nsfwOverride, nsfwReviewQueue, lobbyParticipant, automodRule, automodPattern, automodWhitelist, authRole, authUserAssignment, auditLog, userSafetyScore, safetySignal, safetyFlag, bannedUserAlias, moderatedContentHash, serverSafetyScore, serverSafetySignal, serverSafetyFlag, serverAutomodRuleState, userAchievementProgress } from "./schema";

export const broadcastRelations = relations(broadcast, ({one}) => ({
	message: one(message, {
		fields: [broadcast.messageId],
		references: [message.id]
	}),
}));

export const messageRelations = relations(message, ({one, many}) => ({
	broadcasts: many(broadcast),
	hub: one(hub, {
		fields: [message.hubId],
		references: [hub.id]
	}),
	message: one(message, {
		fields: [message.referredMessageId],
		references: [message.id],
		relationName: "message_referredMessageId_message_id"
	}),
	messages: many(message, {
		relationName: "message_referredMessageId_message_id"
	}),
	globalReports: many(globalReport),
	hubReports: many(hubReport),
	hubMessageReactions: many(hubMessageReaction),
}));

export const hubRelations = relations(hub, ({one, many}) => ({
	messages: many(message),
	blockWords: many(blockWord),
	user: one(user, {
		fields: [hub.ownerId],
		references: [user.id]
	}),
	infractions: many(infraction),
	hubActivityMetrics: many(hubActivityMetrics),
	connections: many(connection),
	hubInvites: many(hubInvite),
	hubAnnouncements: many(hubAnnouncement),
	hubReports: many(hubReport),
	hubReviews: many(hubReview),
	hubLogConfigs: many(hubLogConfig),
	hubRulesAcceptances: many(hubRulesAcceptance),
	hubUpvotes: many(hubUpvote),
	hubToTags: many(hubToTag),
	allowedBots: many(allowedBots),
	hubServerStats: many(hubServerStats),
	hubUserStats: many(hubUserStats),
	autoModEscalationRules: many(autoModEscalationRule),
	nsfwOverrides: many(nsfwOverride),
	nsfwReviewQueues: many(nsfwReviewQueue),
	automodRules: many(automodRule),
	authRoles: many(authRole),
	auditLogs: many(auditLog),
	safetySignals: many(safetySignal),
	safetyFlags: many(safetyFlag),
	serverSafetySignals: many(serverSafetySignal),
	serverSafetyFlags: many(serverSafetyFlag),
}));

export const blockWordRelations = relations(blockWord, ({one}) => ({
	user: one(user, {
		fields: [blockWord.createdBy],
		references: [user.id]
	}),
	hub: one(hub, {
		fields: [blockWord.hubId],
		references: [hub.id]
	}),
	serverDatum: one(serverData, {
		fields: [blockWord.serverId],
		references: [serverData.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	blockWords: many(blockWord),
	hubs: many(hub),
	appeals: many(appeal),
	infractions_moderatorId: many(infraction, {
		relationName: "infraction_moderatorId_user_id"
	}),
	infractions_userId: many(infraction, {
		relationName: "infraction_userId_user_id"
	}),
	blacklists_moderatorId: many(blacklist, {
		relationName: "blacklist_moderatorId_user_id"
	}),
	blacklists_userId: many(blacklist, {
		relationName: "blacklist_userId_user_id"
	}),
	globalReports_handledBy: many(globalReport, {
		relationName: "globalReport_handledBy_user_id"
	}),
	globalReports_reportedUserId: many(globalReport, {
		relationName: "globalReport_reportedUserId_user_id"
	}),
	globalReports_reporterId: many(globalReport, {
		relationName: "globalReport_reporterId_user_id"
	}),
	hubReports_handledBy: many(hubReport, {
		relationName: "hubReport_handledBy_user_id"
	}),
	hubReports_reportedUserId: many(hubReport, {
		relationName: "hubReport_reportedUserId_user_id"
	}),
	hubReports_reporterId: many(hubReport, {
		relationName: "hubReport_reporterId_user_id"
	}),
	hubReviews: many(hubReview),
	hubRulesAcceptances: many(hubRulesAcceptance),
	hubUpvotes: many(hubUpvote),
	reputationLogs: many(reputationLog),
	serverBlacklists: many(serverBlacklist),
	serverBlocklists: many(serverBlocklist),
	userAchievements: many(userAchievement),
	sessions: many(session),
	accounts: many(account),
	hubUserStats: many(hubUserStats),
	lobbyConnections: many(lobbyConnection),
	lobbyMessages: many(lobbyMessage),
	betaServers: many(betaServer),
	lobbyReports_handledBy: many(lobbyReport, {
		relationName: "lobbyReport_handledBy_user_id"
	}),
	lobbyReports_reporterId: many(lobbyReport, {
		relationName: "lobbyReport_reporterId_user_id"
	}),
	userStats: many(userStats),
	lobbyInfractions_moderatorId: many(lobbyInfraction, {
		relationName: "lobbyInfraction_moderatorId_user_id"
	}),
	lobbyInfractions_userId: many(lobbyInfraction, {
		relationName: "lobbyInfraction_userId_user_id"
	}),
	lobbyReportActionLogs_moderatorId: many(lobbyReportActionLog, {
		relationName: "lobbyReportActionLog_moderatorId_user_id"
	}),
	lobbyReportActionLogs_targetUserId: many(lobbyReportActionLog, {
		relationName: "lobbyReportActionLog_targetUserId_user_id"
	}),
	autoModEscalationRules: many(autoModEscalationRule),
	nsfwOverrides: many(nsfwOverride),
	nsfwReviewQueues_authorId: many(nsfwReviewQueue, {
		relationName: "nsfwReviewQueue_authorId_user_id"
	}),
	nsfwReviewQueues_handledById: many(nsfwReviewQueue, {
		relationName: "nsfwReviewQueue_handledById_user_id"
	}),
	lobbyParticipants: many(lobbyParticipant),
	automodRules: many(automodRule),
	automodWhitelists: many(automodWhitelist),
	authUserAssignments: many(authUserAssignment),
	auditLogs_actorId: many(auditLog, {
		relationName: "auditLog_actorId_user_id"
	}),
	auditLogs_userId: many(auditLog, {
		relationName: "auditLog_userId_user_id"
	}),
	userSafetyScores: many(userSafetyScore),
	safetySignals: many(safetySignal),
	safetyFlags_acknowledgedBy: many(safetyFlag, {
		relationName: "safetyFlag_acknowledgedBy_user_id"
	}),
	safetyFlags_userId: many(safetyFlag, {
		relationName: "safetyFlag_userId_user_id"
	}),
	bannedUserAliases: many(bannedUserAlias),
	serverSafetyFlags: many(serverSafetyFlag),
	userAchievementProgresses: many(userAchievementProgress),
}));

export const serverDataRelations = relations(serverData, ({many}) => ({
	blockWords: many(blockWord),
	infractions: many(infraction),
	connections: many(connection),
	serverBlacklists: many(serverBlacklist),
	serverBlocklists_blockedServerId: many(serverBlocklist, {
		relationName: "serverBlocklist_blockedServerId_serverData_id"
	}),
	serverBlocklists_serverId: many(serverBlocklist, {
		relationName: "serverBlocklist_serverId_serverData_id"
	}),
	hubServerStats: many(hubServerStats),
	lobbyConnections: many(lobbyConnection),
	betaServers: many(betaServer),
	autoModEscalationRules: many(autoModEscalationRule),
	automodRules: many(automodRule),
	auditLogs: many(auditLog),
	serverSafetyScores: many(serverSafetyScore),
	serverSafetySignals: many(serverSafetySignal),
	serverSafetyFlags: many(serverSafetyFlag),
	serverAutomodRuleStates: many(serverAutomodRuleState),
}));

export const appealRelations = relations(appeal, ({one}) => ({
	infraction: one(infraction, {
		fields: [appeal.infractionId],
		references: [infraction.id]
	}),
	user: one(user, {
		fields: [appeal.userId],
		references: [user.id]
	}),
}));

export const infractionRelations = relations(infraction, ({one, many}) => ({
	appeals: many(appeal),
	hub: one(hub, {
		fields: [infraction.hubId],
		references: [hub.id]
	}),
	user_moderatorId: one(user, {
		fields: [infraction.moderatorId],
		references: [user.id],
		relationName: "infraction_moderatorId_user_id"
	}),
	serverDatum: one(serverData, {
		fields: [infraction.serverId],
		references: [serverData.id]
	}),
	user_userId: one(user, {
		fields: [infraction.userId],
		references: [user.id],
		relationName: "infraction_userId_user_id"
	}),
	moderatedContentHashes: many(moderatedContentHash),
}));

export const blacklistRelations = relations(blacklist, ({one}) => ({
	hubReport: one(hubReport, {
		fields: [blacklist.hubReportId],
		references: [hubReport.id]
	}),
	lobbyReport: one(lobbyReport, {
		fields: [blacklist.lobbyReportId],
		references: [lobbyReport.id]
	}),
	user_moderatorId: one(user, {
		fields: [blacklist.moderatorId],
		references: [user.id],
		relationName: "blacklist_moderatorId_user_id"
	}),
	user_userId: one(user, {
		fields: [blacklist.userId],
		references: [user.id],
		relationName: "blacklist_userId_user_id"
	}),
}));

export const hubReportRelations = relations(hubReport, ({one, many}) => ({
	blacklists: many(blacklist),
	user_handledBy: one(user, {
		fields: [hubReport.handledBy],
		references: [user.id],
		relationName: "hubReport_handledBy_user_id"
	}),
	hub: one(hub, {
		fields: [hubReport.hubId],
		references: [hub.id]
	}),
	message: one(message, {
		fields: [hubReport.messageId],
		references: [message.id]
	}),
	user_reportedUserId: one(user, {
		fields: [hubReport.reportedUserId],
		references: [user.id],
		relationName: "hubReport_reportedUserId_user_id"
	}),
	user_reporterId: one(user, {
		fields: [hubReport.reporterId],
		references: [user.id],
		relationName: "hubReport_reporterId_user_id"
	}),
	serverBlacklists: many(serverBlacklist),
	moderatedContentHashes: many(moderatedContentHash),
}));

export const lobbyReportRelations = relations(lobbyReport, ({one, many}) => ({
	blacklists: many(blacklist),
	serverBlacklists: many(serverBlacklist),
	user_handledBy: one(user, {
		fields: [lobbyReport.handledBy],
		references: [user.id],
		relationName: "lobbyReport_handledBy_user_id"
	}),
	lobby: one(lobby, {
		fields: [lobbyReport.lobbyId],
		references: [lobby.id]
	}),
	lobbyMessage: one(lobbyMessage, {
		fields: [lobbyReport.reportedMessageId],
		references: [lobbyMessage.id]
	}),
	user_reporterId: one(user, {
		fields: [lobbyReport.reporterId],
		references: [user.id],
		relationName: "lobbyReport_reporterId_user_id"
	}),
	lobbyInfractions: many(lobbyInfraction),
	lobbyReportActionLogs: many(lobbyReportActionLog),
	moderatedContentHashes: many(moderatedContentHash),
}));

export const hubActivityMetricsRelations = relations(hubActivityMetrics, ({one}) => ({
	hub: one(hub, {
		fields: [hubActivityMetrics.hubId],
		references: [hub.id]
	}),
}));

export const connectionRelations = relations(connection, ({one}) => ({
	hub: one(hub, {
		fields: [connection.hubId],
		references: [hub.id]
	}),
	serverDatum: one(serverData, {
		fields: [connection.serverId],
		references: [serverData.id]
	}),
}));

export const globalReportRelations = relations(globalReport, ({one, many}) => ({
	user_handledBy: one(user, {
		fields: [globalReport.handledBy],
		references: [user.id],
		relationName: "globalReport_handledBy_user_id"
	}),
	message: one(message, {
		fields: [globalReport.messageId],
		references: [message.id]
	}),
	user_reportedUserId: one(user, {
		fields: [globalReport.reportedUserId],
		references: [user.id],
		relationName: "globalReport_reportedUserId_user_id"
	}),
	user_reporterId: one(user, {
		fields: [globalReport.reporterId],
		references: [user.id],
		relationName: "globalReport_reporterId_user_id"
	}),
	moderatedContentHashes: many(moderatedContentHash),
}));

export const hubInviteRelations = relations(hubInvite, ({one}) => ({
	hub: one(hub, {
		fields: [hubInvite.hubId],
		references: [hub.id]
	}),
}));

export const hubAnnouncementRelations = relations(hubAnnouncement, ({one}) => ({
	hub: one(hub, {
		fields: [hubAnnouncement.hubId],
		references: [hub.id]
	}),
}));

export const hubMessageReactionRelations = relations(hubMessageReaction, ({one}) => ({
	message: one(message, {
		fields: [hubMessageReaction.messageId],
		references: [message.id]
	}),
}));

export const hubReviewRelations = relations(hubReview, ({one}) => ({
	hub: one(hub, {
		fields: [hubReview.hubId],
		references: [hub.id]
	}),
	user: one(user, {
		fields: [hubReview.userId],
		references: [user.id]
	}),
}));

export const hubLogConfigRelations = relations(hubLogConfig, ({one}) => ({
	hub: one(hub, {
		fields: [hubLogConfig.hubId],
		references: [hub.id]
	}),
}));

export const hubRulesAcceptanceRelations = relations(hubRulesAcceptance, ({one}) => ({
	hub: one(hub, {
		fields: [hubRulesAcceptance.hubId],
		references: [hub.id]
	}),
	user: one(user, {
		fields: [hubRulesAcceptance.userId],
		references: [user.id]
	}),
}));

export const hubUpvoteRelations = relations(hubUpvote, ({one}) => ({
	hub: one(hub, {
		fields: [hubUpvote.hubId],
		references: [hub.id]
	}),
	user: one(user, {
		fields: [hubUpvote.userId],
		references: [user.id]
	}),
}));

export const reputationLogRelations = relations(reputationLog, ({one}) => ({
	user: one(user, {
		fields: [reputationLog.receiverId],
		references: [user.id]
	}),
}));

export const serverBlacklistRelations = relations(serverBlacklist, ({one}) => ({
	hubReport: one(hubReport, {
		fields: [serverBlacklist.hubReportId],
		references: [hubReport.id]
	}),
	lobbyReport: one(lobbyReport, {
		fields: [serverBlacklist.lobbyReportId],
		references: [lobbyReport.id]
	}),
	user: one(user, {
		fields: [serverBlacklist.moderatorId],
		references: [user.id]
	}),
	serverDatum: one(serverData, {
		fields: [serverBlacklist.serverId],
		references: [serverData.id]
	}),
}));

export const serverBlocklistRelations = relations(serverBlocklist, ({one}) => ({
	serverDatum_blockedServerId: one(serverData, {
		fields: [serverBlocklist.blockedServerId],
		references: [serverData.id],
		relationName: "serverBlocklist_blockedServerId_serverData_id"
	}),
	user: one(user, {
		fields: [serverBlocklist.blockedUserId],
		references: [user.id]
	}),
	serverDatum_serverId: one(serverData, {
		fields: [serverBlocklist.serverId],
		references: [serverData.id],
		relationName: "serverBlocklist_serverId_serverData_id"
	}),
}));

export const userAchievementRelations = relations(userAchievement, ({one}) => ({
	achievement: one(achievement, {
		fields: [userAchievement.achievementId],
		references: [achievement.id]
	}),
	user: one(user, {
		fields: [userAchievement.userId],
		references: [user.id]
	}),
}));

export const achievementRelations = relations(achievement, ({many}) => ({
	userAchievements: many(userAchievement),
	userAchievementProgresses: many(userAchievementProgress),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const hubToTagRelations = relations(hubToTag, ({one}) => ({
	hub: one(hub, {
		fields: [hubToTag.a],
		references: [hub.id]
	}),
	tag: one(tag, {
		fields: [hubToTag.b],
		references: [tag.id]
	}),
}));

export const tagRelations = relations(tag, ({many}) => ({
	hubToTags: many(hubToTag),
}));

export const allowedBotsRelations = relations(allowedBots, ({one}) => ({
	bot: one(bot, {
		fields: [allowedBots.botId],
		references: [bot.id]
	}),
	hub: one(hub, {
		fields: [allowedBots.hubId],
		references: [hub.id]
	}),
}));

export const botRelations = relations(bot, ({many}) => ({
	allowedBots: many(allowedBots),
	botToTags: many(botToTag),
}));

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const botToTagRelations = relations(botToTag, ({one}) => ({
	bot: one(bot, {
		fields: [botToTag.a],
		references: [bot.id]
	}),
	botTag: one(botTag, {
		fields: [botToTag.b],
		references: [botTag.id]
	}),
}));

export const botTagRelations = relations(botTag, ({many}) => ({
	botToTags: many(botToTag),
}));

export const hubServerStatsRelations = relations(hubServerStats, ({one}) => ({
	hub: one(hub, {
		fields: [hubServerStats.hubId],
		references: [hub.id]
	}),
	serverDatum: one(serverData, {
		fields: [hubServerStats.serverId],
		references: [serverData.id]
	}),
}));

export const hubUserStatsRelations = relations(hubUserStats, ({one}) => ({
	hub: one(hub, {
		fields: [hubUserStats.hubId],
		references: [hub.id]
	}),
	user: one(user, {
		fields: [hubUserStats.userId],
		references: [user.id]
	}),
}));

export const lobbyConnectionRelations = relations(lobbyConnection, ({one, many}) => ({
	serverDatum: one(serverData, {
		fields: [lobbyConnection.invokerServerId],
		references: [serverData.id]
	}),
	user: one(user, {
		fields: [lobbyConnection.invokerUserId],
		references: [user.id]
	}),
	lobby: one(lobby, {
		fields: [lobbyConnection.lobbyId],
		references: [lobby.id]
	}),
	lobbyMessages: many(lobbyMessage),
	lobbyMessageDeliveries: many(lobbyMessageDelivery),
	lobbyParticipants: many(lobbyParticipant),
}));

export const lobbyRelations = relations(lobby, ({many}) => ({
	lobbyConnections: many(lobbyConnection),
	lobbyMessages: many(lobbyMessage),
	lobbyReports: many(lobbyReport),
	lobbyParticipants: many(lobbyParticipant),
	safetySignals: many(safetySignal),
	safetyFlags: many(safetyFlag),
}));

export const lobbyMessageRelations = relations(lobbyMessage, ({one, many}) => ({
	user: one(user, {
		fields: [lobbyMessage.authorId],
		references: [user.id]
	}),
	lobby: one(lobby, {
		fields: [lobbyMessage.lobbyId],
		references: [lobby.id]
	}),
	lobbyMessage: one(lobbyMessage, {
		fields: [lobbyMessage.replyToId],
		references: [lobbyMessage.id],
		relationName: "lobbyMessage_replyToId_lobbyMessage_id"
	}),
	lobbyMessages: many(lobbyMessage, {
		relationName: "lobbyMessage_replyToId_lobbyMessage_id"
	}),
	lobbyConnection: one(lobbyConnection, {
		fields: [lobbyMessage.sourceConnectionId],
		references: [lobbyConnection.id]
	}),
	lobbyMessageDeliveries: many(lobbyMessageDelivery),
	lobbyReports: many(lobbyReport),
}));

export const betaServerRelations = relations(betaServer, ({one}) => ({
	serverDatum: one(serverData, {
		fields: [betaServer.id],
		references: [serverData.id]
	}),
	user: one(user, {
		fields: [betaServer.invitedById],
		references: [user.id]
	}),
}));

export const lobbyMessageDeliveryRelations = relations(lobbyMessageDelivery, ({one}) => ({
	lobbyMessage: one(lobbyMessage, {
		fields: [lobbyMessageDelivery.lobbyMessageId],
		references: [lobbyMessage.id]
	}),
	lobbyConnection: one(lobbyConnection, {
		fields: [lobbyMessageDelivery.targetConnectionId],
		references: [lobbyConnection.id]
	}),
}));

export const userStatsRelations = relations(userStats, ({one}) => ({
	user: one(user, {
		fields: [userStats.userId],
		references: [user.id]
	}),
}));

export const lobbyInfractionRelations = relations(lobbyInfraction, ({one, many}) => ({
	user_moderatorId: one(user, {
		fields: [lobbyInfraction.moderatorId],
		references: [user.id],
		relationName: "lobbyInfraction_moderatorId_user_id"
	}),
	lobbyReport: one(lobbyReport, {
		fields: [lobbyInfraction.reportId],
		references: [lobbyReport.id]
	}),
	user_userId: one(user, {
		fields: [lobbyInfraction.userId],
		references: [user.id],
		relationName: "lobbyInfraction_userId_user_id"
	}),
	moderatedContentHashes: many(moderatedContentHash),
}));

export const lobbyReportActionLogRelations = relations(lobbyReportActionLog, ({one}) => ({
	user_moderatorId: one(user, {
		fields: [lobbyReportActionLog.moderatorId],
		references: [user.id],
		relationName: "lobbyReportActionLog_moderatorId_user_id"
	}),
	lobbyReport: one(lobbyReport, {
		fields: [lobbyReportActionLog.reportId],
		references: [lobbyReport.id]
	}),
	user_targetUserId: one(user, {
		fields: [lobbyReportActionLog.targetUserId],
		references: [user.id],
		relationName: "lobbyReportActionLog_targetUserId_user_id"
	}),
}));

export const autoModEscalationRuleRelations = relations(autoModEscalationRule, ({one}) => ({
	user: one(user, {
		fields: [autoModEscalationRule.createdBy],
		references: [user.id]
	}),
	hub: one(hub, {
		fields: [autoModEscalationRule.hubId],
		references: [hub.id]
	}),
	serverDatum: one(serverData, {
		fields: [autoModEscalationRule.serverId],
		references: [serverData.id]
	}),
}));

export const nsfwOverrideRelations = relations(nsfwOverride, ({one}) => ({
	user: one(user, {
		fields: [nsfwOverride.createdById],
		references: [user.id]
	}),
	hub: one(hub, {
		fields: [nsfwOverride.hubId],
		references: [hub.id]
	}),
}));

export const nsfwReviewQueueRelations = relations(nsfwReviewQueue, ({one}) => ({
	user_authorId: one(user, {
		fields: [nsfwReviewQueue.authorId],
		references: [user.id],
		relationName: "nsfwReviewQueue_authorId_user_id"
	}),
	user_handledById: one(user, {
		fields: [nsfwReviewQueue.handledById],
		references: [user.id],
		relationName: "nsfwReviewQueue_handledById_user_id"
	}),
	hub: one(hub, {
		fields: [nsfwReviewQueue.hubId],
		references: [hub.id]
	}),
}));

export const lobbyParticipantRelations = relations(lobbyParticipant, ({one}) => ({
	lobby: one(lobby, {
		fields: [lobbyParticipant.lobbyId],
		references: [lobby.id]
	}),
	lobbyConnection: one(lobbyConnection, {
		fields: [lobbyParticipant.sourceConnectionId],
		references: [lobbyConnection.id]
	}),
	user: one(user, {
		fields: [lobbyParticipant.userId],
		references: [user.id]
	}),
}));

export const automodRuleRelations = relations(automodRule, ({one, many}) => ({
	user: one(user, {
		fields: [automodRule.createdBy],
		references: [user.id]
	}),
	hub: one(hub, {
		fields: [automodRule.hubId],
		references: [hub.id]
	}),
	serverDatum: one(serverData, {
		fields: [automodRule.serverId],
		references: [serverData.id]
	}),
	automodPatterns: many(automodPattern),
	automodWhitelists: many(automodWhitelist),
	serverAutomodRuleStates: many(serverAutomodRuleState),
}));

export const automodPatternRelations = relations(automodPattern, ({one}) => ({
	automodRule: one(automodRule, {
		fields: [automodPattern.ruleId],
		references: [automodRule.id]
	}),
}));

export const automodWhitelistRelations = relations(automodWhitelist, ({one}) => ({
	user: one(user, {
		fields: [automodWhitelist.createdBy],
		references: [user.id]
	}),
	automodRule: one(automodRule, {
		fields: [automodWhitelist.ruleId],
		references: [automodRule.id]
	}),
}));

export const authRoleRelations = relations(authRole, ({one, many}) => ({
	hub: one(hub, {
		fields: [authRole.hubId],
		references: [hub.id]
	}),
	authUserAssignments: many(authUserAssignment),
}));

export const authUserAssignmentRelations = relations(authUserAssignment, ({one}) => ({
	authRole: one(authRole, {
		fields: [authUserAssignment.roleId],
		references: [authRole.id]
	}),
	user: one(user, {
		fields: [authUserAssignment.userId],
		references: [user.id]
	}),
}));

export const auditLogRelations = relations(auditLog, ({one}) => ({
	user_actorId: one(user, {
		fields: [auditLog.actorId],
		references: [user.id],
		relationName: "auditLog_actorId_user_id"
	}),
	serverDatum: one(serverData, {
		fields: [auditLog.guildId],
		references: [serverData.id]
	}),
	hub: one(hub, {
		fields: [auditLog.hubId],
		references: [hub.id]
	}),
	user_userId: one(user, {
		fields: [auditLog.userId],
		references: [user.id],
		relationName: "auditLog_userId_user_id"
	}),
}));

export const userSafetyScoreRelations = relations(userSafetyScore, ({one}) => ({
	user: one(user, {
		fields: [userSafetyScore.userId],
		references: [user.id]
	}),
}));

export const safetySignalRelations = relations(safetySignal, ({one}) => ({
	hub: one(hub, {
		fields: [safetySignal.hubId],
		references: [hub.id]
	}),
	lobby: one(lobby, {
		fields: [safetySignal.lobbyId],
		references: [lobby.id]
	}),
	user: one(user, {
		fields: [safetySignal.userId],
		references: [user.id]
	}),
}));

export const safetyFlagRelations = relations(safetyFlag, ({one}) => ({
	user_acknowledgedBy: one(user, {
		fields: [safetyFlag.acknowledgedBy],
		references: [user.id],
		relationName: "safetyFlag_acknowledgedBy_user_id"
	}),
	hub: one(hub, {
		fields: [safetyFlag.hubId],
		references: [hub.id]
	}),
	lobby: one(lobby, {
		fields: [safetyFlag.lobbyId],
		references: [lobby.id]
	}),
	user_userId: one(user, {
		fields: [safetyFlag.userId],
		references: [user.id],
		relationName: "safetyFlag_userId_user_id"
	}),
}));

export const bannedUserAliasRelations = relations(bannedUserAlias, ({one}) => ({
	user: one(user, {
		fields: [bannedUserAlias.userId],
		references: [user.id]
	}),
}));

export const moderatedContentHashRelations = relations(moderatedContentHash, ({one}) => ({
	globalReport: one(globalReport, {
		fields: [moderatedContentHash.globalReportId],
		references: [globalReport.id]
	}),
	hubReport: one(hubReport, {
		fields: [moderatedContentHash.hubReportId],
		references: [hubReport.id]
	}),
	infraction: one(infraction, {
		fields: [moderatedContentHash.infractionId],
		references: [infraction.id]
	}),
	lobbyInfraction: one(lobbyInfraction, {
		fields: [moderatedContentHash.lobbyInfractionId],
		references: [lobbyInfraction.id]
	}),
	lobbyReport: one(lobbyReport, {
		fields: [moderatedContentHash.lobbyReportId],
		references: [lobbyReport.id]
	}),
}));

export const serverSafetyScoreRelations = relations(serverSafetyScore, ({one}) => ({
	serverDatum: one(serverData, {
		fields: [serverSafetyScore.serverId],
		references: [serverData.id]
	}),
}));

export const serverSafetySignalRelations = relations(serverSafetySignal, ({one}) => ({
	hub: one(hub, {
		fields: [serverSafetySignal.hubId],
		references: [hub.id]
	}),
	serverDatum: one(serverData, {
		fields: [serverSafetySignal.serverId],
		references: [serverData.id]
	}),
}));

export const serverSafetyFlagRelations = relations(serverSafetyFlag, ({one}) => ({
	user: one(user, {
		fields: [serverSafetyFlag.acknowledgedBy],
		references: [user.id]
	}),
	hub: one(hub, {
		fields: [serverSafetyFlag.hubId],
		references: [hub.id]
	}),
	serverDatum: one(serverData, {
		fields: [serverSafetyFlag.serverId],
		references: [serverData.id]
	}),
}));

export const serverAutomodRuleStateRelations = relations(serverAutomodRuleState, ({one}) => ({
	automodRule: one(automodRule, {
		fields: [serverAutomodRuleState.ruleId],
		references: [automodRule.id]
	}),
	serverDatum: one(serverData, {
		fields: [serverAutomodRuleState.serverId],
		references: [serverData.id]
	}),
}));

export const userAchievementProgressRelations = relations(userAchievementProgress, ({one}) => ({
	achievement: one(achievement, {
		fields: [userAchievementProgress.achievementId],
		references: [achievement.id]
	}),
	user: one(user, {
		fields: [userAchievementProgress.userId],
		references: [user.id]
	}),
}));
