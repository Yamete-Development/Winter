import { relations } from "drizzle-orm/relations";
import { user, account, hub, bot, allowedBots, auditLog, serverData, authRole, authUserAssignment, betaServer, message, broadcast, connection, feedbackFormVersion, feedbackSubmission, feedbackHandlerJob, globalReport, reportContext, hubActivityMetrics, hubAnnouncement, hubInvite, hubLogConfig, hubMessageReaction, hubReport, hubReview, hubRulesAcceptance, hubServerStats, hubUpvote, hubUserStats, lobbyConnection, lobby, lobbyMessage, lobbyMessageDelivery, lobbyParticipant, reputationLog, serverBlocklist, session, achievement, userAchievement, userStats, botToTag, botTag, hubToTag, tag, userAchievementProgress } from "./schema";

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	accounts: many(account),
	hubs: many(hub),
	auditLogs_actorId: many(auditLog, {
		relationName: "auditLog_actorId_user_id"
	}),
	auditLogs_userId: many(auditLog, {
		relationName: "auditLog_userId_user_id"
	}),
	authUserAssignments: many(authUserAssignment),
	betaServers: many(betaServer),
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
	hubUserStats: many(hubUserStats),
	lobbyConnections: many(lobbyConnection),
	lobbyMessages: many(lobbyMessage),
	lobbyParticipants: many(lobbyParticipant),
	reputationLogs: many(reputationLog),
	serverBlocklists: many(serverBlocklist),
	sessions: many(session),
	userAchievements: many(userAchievement),
	userStats: many(userStats),
	userAchievementProgresses: many(userAchievementProgress),
}));

export const hubRelations = relations(hub, ({one, many}) => ({
	user: one(user, {
		fields: [hub.ownerId],
		references: [user.id]
	}),
	allowedBots: many(allowedBots),
	auditLogs: many(auditLog),
	authRoles: many(authRole),
	messages: many(message),
	connections: many(connection),
	hubActivityMetrics: many(hubActivityMetrics),
	hubAnnouncements: many(hubAnnouncement),
	hubInvites: many(hubInvite),
	hubLogConfigs: many(hubLogConfig),
	hubReports: many(hubReport),
	hubReviews: many(hubReview),
	hubRulesAcceptances: many(hubRulesAcceptance),
	hubServerStats: many(hubServerStats),
	hubUpvotes: many(hubUpvote),
	hubUserStats: many(hubUserStats),
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

export const serverDataRelations = relations(serverData, ({many}) => ({
	auditLogs: many(auditLog),
	betaServers: many(betaServer),
	connections: many(connection),
	hubServerStats: many(hubServerStats),
	lobbyConnections: many(lobbyConnection),
	serverBlocklists_blockedServerId: many(serverBlocklist, {
		relationName: "serverBlocklist_blockedServerId_serverData_id"
	}),
	serverBlocklists_serverId: many(serverBlocklist, {
		relationName: "serverBlocklist_serverId_serverData_id"
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

export const messageRelations = relations(message, ({one, many}) => ({
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
	broadcasts: many(broadcast),
	hubMessageReactions: many(hubMessageReaction),
}));

export const broadcastRelations = relations(broadcast, ({one}) => ({
	message: one(message, {
		fields: [broadcast.messageId],
		references: [message.id]
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

export const feedbackSubmissionRelations = relations(feedbackSubmission, ({one, many}) => ({
	feedbackFormVersion: one(feedbackFormVersion, {
		fields: [feedbackSubmission.formKey],
		references: [feedbackFormVersion.formKey]
	}),
	feedbackHandlerJobs: many(feedbackHandlerJob),
}));

export const feedbackFormVersionRelations = relations(feedbackFormVersion, ({many}) => ({
	feedbackSubmissions: many(feedbackSubmission),
}));

export const feedbackHandlerJobRelations = relations(feedbackHandlerJob, ({one}) => ({
	feedbackSubmission: one(feedbackSubmission, {
		fields: [feedbackHandlerJob.submissionId],
		references: [feedbackSubmission.id]
	}),
}));

export const globalReportRelations = relations(globalReport, ({one}) => ({
	user_handledBy: one(user, {
		fields: [globalReport.handledBy],
		references: [user.id],
		relationName: "globalReport_handledBy_user_id"
	}),
	reportContext: one(reportContext, {
		fields: [globalReport.reportContextId],
		references: [reportContext.id]
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

export const reportContextRelations = relations(reportContext, ({many}) => ({
	globalReports: many(globalReport),
	hubReports: many(hubReport),
}));

export const hubActivityMetricsRelations = relations(hubActivityMetrics, ({one}) => ({
	hub: one(hub, {
		fields: [hubActivityMetrics.hubId],
		references: [hub.id]
	}),
}));

export const hubAnnouncementRelations = relations(hubAnnouncement, ({one}) => ({
	hub: one(hub, {
		fields: [hubAnnouncement.hubId],
		references: [hub.id]
	}),
}));

export const hubInviteRelations = relations(hubInvite, ({one}) => ({
	hub: one(hub, {
		fields: [hubInvite.hubId],
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

export const hubReportRelations = relations(hubReport, ({one}) => ({
	user_handledBy: one(user, {
		fields: [hubReport.handledBy],
		references: [user.id],
		relationName: "hubReport_handledBy_user_id"
	}),
	hub: one(hub, {
		fields: [hubReport.hubId],
		references: [hub.id]
	}),
	reportContext: one(reportContext, {
		fields: [hubReport.reportContextId],
		references: [reportContext.id]
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
	lobbyParticipants: many(lobbyParticipant),
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

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
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

export const userStatsRelations = relations(userStats, ({one}) => ({
	user: one(user, {
		fields: [userStats.userId],
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