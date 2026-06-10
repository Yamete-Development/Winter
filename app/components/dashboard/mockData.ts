import type { DashboardConfigs, DashboardHub, DashboardLayouts } from "./types";

export const defaultDashboardLayouts: DashboardLayouts = {"moderation":{"lg":[{"i":"liveFeed","x":0,"y":0,"w":7,"h":22,"minW":5,"minH":10},{"i":"safetyKnobs","x":7,"y":0,"w":5,"h":10,"minW":4,"minH":5},{"i":"blockedWords","x":7,"y":10,"w":5,"h":12,"minW":4,"minH":5},{"i":"infractions","x":0,"y":22,"w":7,"h":10,"minW":4,"minH":5},{"i":"staff","x":7,"y":22,"w":5,"h":10,"minW":4,"minH":5}],"xs":[{"i":"liveFeed","x":0,"y":0,"w":4,"h":22,"minW":5,"minH":10,"moved":false,"static":false},{"i":"safetyKnobs","x":0,"y":22,"w":4,"h":10,"minW":4,"minH":5,"moved":false,"static":false},{"i":"blockedWords","x":0,"y":32,"w":4,"h":12,"minW":4,"minH":5,"moved":false,"static":false},{"i":"infractions","x":0,"y":44,"w":4,"h":10,"minW":4,"minH":5,"moved":false,"static":false},{"i":"staff","x":0,"y":54,"w":4,"h":10,"minW":4,"minH":5,"moved":false,"static":false}],"md":[{"i":"liveFeed","x":0,"y":0,"w":5,"h":15,"minW":5,"minH":10,"moved":false,"static":false},{"i":"safetyKnobs","x":0,"y":15,"w":5,"h":10,"minW":4,"minH":5,"moved":false,"static":false},{"i":"blockedWords","x":5,"y":11,"w":5,"h":7,"minW":4,"minH":5,"moved":false,"static":false},{"i":"infractions","x":5,"y":0,"w":5,"h":11,"minW":4,"minH":5,"moved":false,"static":false},{"i":"staff","x":5,"y":18,"w":5,"h":10,"minW":4,"minH":5,"moved":false,"static":false}]} ,"general":{"lg":[{"i":"connections","x":0,"y":0,"w":7,"h":18,"minW":4,"minH":8},{"i":"profile","x":7,"y":0,"w":5,"h":10,"minW":4,"minH":8},{"i":"dangerZone","x":7,"y":10,"w":5,"h":8,"minW":4,"minH":5}]}};



export const mockFallbackHub: DashboardHub = {
  id: "empty-state",
  name: "No Hubs Found",
  avatarUrl: "",
  bannerUrl: "",
  verified: false,
  partnered: false,
  weeklyMsgs: "0",
};