import { relations } from "drizzle-orm/relations";
import { hub, connection, serverData, message, broadcast, user, blockWord, autoModEscalationRule, antiSwearRule, nsfwOverride, nsfwReviewQueue, antiSwearPattern, antiSwearWhitelist, appeal, infraction, lobby, lobbyParticipant, lobbyConnection, blacklist, hubReport, lobbyReport, hubActivityMetrics, globalReport, hubInvite, hubAnnouncement, hubLogConfig, hubMessageReaction, hubModerator, hubReview, hubRulesAcceptance, hubUpvote, serverBlacklist, reputationLog, serverBlocklist, achievement, userAchievement, session, hubToTag, tag, bot, allowedBots, account, botToTag, botTag, hubServerStats, hubUserStats, giftCode, premiumKey, stripeSubscription, lobbyMessage, betaServer, lobbyMessageDelivery, userStats, lobbyInfraction, lobbyReportActionLog, userAchievementProgress } from "./schema";

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

export const hubRelations = relations(hub, ({one, many}) => ({
	connections: many(connection),
	messages: many(message),
	blockWords: many(blockWord),
	autoModEscalationRules: many(autoModEscalationRule),
	antiSwearRules: many(antiSwearRule),
	nsfwOverrides: many(nsfwOverride),
	nsfwReviewQueues: many(nsfwReviewQueue),
	user: one(user, {
		fields: [hub.ownerId],
		references: [user.id]
	}),
	infractions: many(infraction),
	hubActivityMetrics: many(hubActivityMetrics),
	hubInvites: many(hubInvite),
	hubAnnouncements: many(hubAnnouncement),
	hubLogConfigs: many(hubLogConfig),
	hubModerators: many(hubModerator),
	hubReports: many(hubReport),
	hubReviews: many(hubReview),
	hubRulesAcceptances: many(hubRulesAcceptance),
	hubUpvotes: many(hubUpvote),
	hubToTags: many(hubToTag),
	allowedBots: many(allowedBots),
	hubServerStats: many(hubServerStats),
	hubUserStats: many(hubUserStats),
	premiumKeys: many(premiumKey),
}));

export const serverDataRelations = relations(serverData, ({many}) => ({
	connections: many(connection),
	blockWords: many(blockWord),
	autoModEscalationRules: many(autoModEscalationRule),
	antiSwearRules: many(antiSwearRule),
	infractions: many(infraction),
	serverBlacklists: many(serverBlacklist),
	serverBlocklists_blockedServerId: many(serverBlocklist, {
		relationName: "serverBlocklist_blockedServerId_serverData_id"
	}),
	serverBlocklists_serverId: many(serverBlocklist, {
		relationName: "serverBlocklist_serverId_serverData_id"
	}),
	hubServerStats: many(hubServerStats),
	premiumKeys: many(premiumKey),
	lobbyConnections: many(lobbyConnection),
	betaServers: many(betaServer),
}));

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
	hubMessageReactions: many(hubMessageReaction),
	hubReports: many(hubReport),
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
	autoModEscalationRules: many(autoModEscalationRule),
	antiSwearRules: many(antiSwearRule),
	nsfwOverrides: many(nsfwOverride),
	nsfwReviewQueues_authorId: many(nsfwReviewQueue, {
		relationName: "nsfwReviewQueue_authorId_user_id"
	}),
	nsfwReviewQueues_handledById: many(nsfwReviewQueue, {
		relationName: "nsfwReviewQueue_handledById_user_id"
	}),
	hubs: many(hub),
	antiSwearWhitelists: many(antiSwearWhitelist),
	appeals: many(appeal),
	lobbyParticipants: many(lobbyParticipant),
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
	hubModerators: many(hubModerator),
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
	serverBlacklists: many(serverBlacklist),
	reputationLogs: many(reputationLog),
	serverBlocklists: many(serverBlocklist),
	userAchievements: many(userAchievement),
	sessions: many(session),
	accounts: many(account),
	hubUserStats: many(hubUserStats),
	giftCodes_claimedBy: many(giftCode, {
		relationName: "giftCode_claimedBy_user_id"
	}),
	giftCodes_purchasedBy: many(giftCode, {
		relationName: "giftCode_purchasedBy_user_id"
	}),
	premiumKeys_assignedUser: many(premiumKey, {
		relationName: "premiumKey_assignedUser_user_id"
	}),
	premiumKeys_purchasedBy: many(premiumKey, {
		relationName: "premiumKey_purchasedBy_user_id"
	}),
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
	userAchievementProgresses: many(userAchievementProgress),
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

export const antiSwearRuleRelations = relations(antiSwearRule, ({one, many}) => ({
	user: one(user, {
		fields: [antiSwearRule.createdBy],
		references: [user.id]
	}),
	hub: one(hub, {
		fields: [antiSwearRule.hubId],
		references: [hub.id]
	}),
	serverDatum: one(serverData, {
		fields: [antiSwearRule.serverId],
		references: [serverData.id]
	}),
	antiSwearPatterns: many(antiSwearPattern),
	antiSwearWhitelists: many(antiSwearWhitelist),
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

export const antiSwearPatternRelations = relations(antiSwearPattern, ({one}) => ({
	antiSwearRule: one(antiSwearRule, {
		fields: [antiSwearPattern.ruleId],
		references: [antiSwearRule.id]
	}),
}));

export const antiSwearWhitelistRelations = relations(antiSwearWhitelist, ({one}) => ({
	user: one(user, {
		fields: [antiSwearWhitelist.createdBy],
		references: [user.id]
	}),
	antiSwearRule: one(antiSwearRule, {
		fields: [antiSwearWhitelist.ruleId],
		references: [antiSwearRule.id]
	}),
}));

export const appealRelations = relations(appeal, ({one}) => ({
	user: one(user, {
		fields: [appeal.userId],
		references: [user.id]
	}),
	infraction: one(infraction, {
		fields: [appeal.infractionId],
		references: [infraction.id]
	}),
}));

export const infractionRelations = relations(infraction, ({one, many}) => ({
	appeals: many(appeal),
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
	hub: one(hub, {
		fields: [infraction.hubId],
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

export const lobbyRelations = relations(lobby, ({many}) => ({
	lobbyParticipants: many(lobbyParticipant),
	lobbyConnections: many(lobbyConnection),
	lobbyMessages: many(lobbyMessage),
	lobbyReports: many(lobbyReport),
}));

export const lobbyConnectionRelations = relations(lobbyConnection, ({one, many}) => ({
	lobbyParticipants: many(lobbyParticipant),
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
}));

export const blacklistRelations = relations(blacklist, ({one}) => ({
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
	hubReport: one(hubReport, {
		fields: [blacklist.hubReportId],
		references: [hubReport.id]
	}),
	lobbyReport: one(lobbyReport, {
		fields: [blacklist.lobbyReportId],
		references: [lobbyReport.id]
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
}));

export const lobbyReportRelations = relations(lobbyReport, ({one, many}) => ({
	blacklists: many(blacklist),
	serverBlacklists: many(serverBlacklist),
	user_handledBy: one(user, {
		fields: [lobbyReport.handledBy],
		references: [user.id],
		relationName: "lobbyReport_handledBy_user_id"
	}),
	user_reporterId: one(user, {
		fields: [lobbyReport.reporterId],
		references: [user.id],
		relationName: "lobbyReport_reporterId_user_id"
	}),
	lobbyMessage: one(lobbyMessage, {
		fields: [lobbyReport.reportedMessageId],
		references: [lobbyMessage.id]
	}),
	lobby: one(lobby, {
		fields: [lobbyReport.lobbyId],
		references: [lobby.id]
	}),
	lobbyInfractions: many(lobbyInfraction),
	lobbyReportActionLogs: many(lobbyReportActionLog),
}));

export const hubActivityMetricsRelations = relations(hubActivityMetrics, ({one}) => ({
	hub: one(hub, {
		fields: [hubActivityMetrics.hubId],
		references: [hub.id]
	}),
}));

export const globalReportRelations = relations(globalReport, ({one}) => ({
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

export const hubLogConfigRelations = relations(hubLogConfig, ({one}) => ({
	hub: one(hub, {
		fields: [hubLogConfig.hubId],
		references: [hub.id]
	}),
}));

export const hubMessageReactionRelations = relations(hubMessageReaction, ({one}) => ({
	message: one(message, {
		fields: [hubMessageReaction.messageId],
		references: [message.id]
	}),
}));

export const hubModeratorRelations = relations(hubModerator, ({one}) => ({
	hub: one(hub, {
		fields: [hubModerator.hubId],
		references: [hub.id]
	}),
	user: one(user, {
		fields: [hubModerator.userId],
		references: [user.id]
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

export const serverBlacklistRelations = relations(serverBlacklist, ({one}) => ({
	user: one(user, {
		fields: [serverBlacklist.moderatorId],
		references: [user.id]
	}),
	serverDatum: one(serverData, {
		fields: [serverBlacklist.serverId],
		references: [serverData.id]
	}),
	hubReport: one(hubReport, {
		fields: [serverBlacklist.hubReportId],
		references: [hubReport.id]
	}),
	lobbyReport: one(lobbyReport, {
		fields: [serverBlacklist.lobbyReportId],
		references: [lobbyReport.id]
	}),
}));

export const reputationLogRelations = relations(reputationLog, ({one}) => ({
	user: one(user, {
		fields: [reputationLog.receiverId],
		references: [user.id]
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

export const giftCodeRelations = relations(giftCode, ({one}) => ({
	user_claimedBy: one(user, {
		fields: [giftCode.claimedBy],
		references: [user.id],
		relationName: "giftCode_claimedBy_user_id"
	}),
	user_purchasedBy: one(user, {
		fields: [giftCode.purchasedBy],
		references: [user.id],
		relationName: "giftCode_purchasedBy_user_id"
	}),
}));

export const premiumKeyRelations = relations(premiumKey, ({one}) => ({
	serverDatum: one(serverData, {
		fields: [premiumKey.assignedGuild],
		references: [serverData.id]
	}),
	hub: one(hub, {
		fields: [premiumKey.assignedHub],
		references: [hub.id]
	}),
	user_assignedUser: one(user, {
		fields: [premiumKey.assignedUser],
		references: [user.id],
		relationName: "premiumKey_assignedUser_user_id"
	}),
	user_purchasedBy: one(user, {
		fields: [premiumKey.purchasedBy],
		references: [user.id],
		relationName: "premiumKey_purchasedBy_user_id"
	}),
	stripeSubscription: one(stripeSubscription, {
		fields: [premiumKey.subscriptionId],
		references: [stripeSubscription.id]
	}),
}));

export const stripeSubscriptionRelations = relations(stripeSubscription, ({many}) => ({
	premiumKeys: many(premiumKey),
}));

export const lobbyMessageRelations = relations(lobbyMessage, ({one, many}) => ({
	lobbyMessage: one(lobbyMessage, {
		fields: [lobbyMessage.replyToId],
		references: [lobbyMessage.id],
		relationName: "lobbyMessage_replyToId_lobbyMessage_id"
	}),
	lobbyMessages: many(lobbyMessage, {
		relationName: "lobbyMessage_replyToId_lobbyMessage_id"
	}),
	user: one(user, {
		fields: [lobbyMessage.authorId],
		references: [user.id]
	}),
	lobby: one(lobby, {
		fields: [lobbyMessage.lobbyId],
		references: [lobby.id]
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

export const lobbyInfractionRelations = relations(lobbyInfraction, ({one}) => ({
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