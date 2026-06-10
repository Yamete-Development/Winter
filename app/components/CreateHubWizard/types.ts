export type HubFormValues = {
  name: string;
  shortDescription: string;
  description: string;
  visibility: "PUBLIC" | "UNLISTED" | "PRIVATE";
  language: string;
  region: string;
  welcomeMessage: string;
  iconUrl: string;
  bannerUrl: string;
};

export type HubActionData = {
  success?: boolean;
  hubId?: string;
  error?: string;
  fieldErrors?: Partial<Record<keyof HubFormValues, string>>;
};

export const INITIAL_FORM: HubFormValues = {
  name: "",
  shortDescription: "",
  description: "",
  visibility: "PUBLIC",
  language: "English",
  region: "Global",
  welcomeMessage: "",
  iconUrl: "",
  bannerUrl: "",
};

export const STEP_ITEMS = [
  {
    title: "Identity",
    description: "Name the hub and write the short summary other communities will see.",
  },
  {
    title: "Defaults",
    description: "Pick visibility, language, region, and the tone for new connections.",
  },
  {
    title: "Review",
    description: "Confirm the setup and launch the hub into your dashboard.",
  },
] as const;

export const VISIBILITY_OPTIONS = [
  {
    value: "PUBLIC",
    title: "Public",
    description: "Discoverable and ready to grow across communities.",
  },
  {
    value: "UNLISTED",
    title: "Unlisted",
    description: "Share directly without surfacing it in public discovery.",
  },
  {
    value: "PRIVATE",
    title: "Private",
    description: "Invite-only setup while you prepare the space.",
  },
] as const;

export const LANGUAGE_OPTIONS = [
  { label: "English", value: "English" },
  { label: "Spanish", value: "Spanish" },
  { label: "French", value: "French" },
  { label: "Thai", value: "Thai" },
] as const;

export const REGION_OPTIONS = [
  { label: "Global", value: "Global" },
  { label: "North America", value: "North America" },
  { label: "Europe", value: "Europe" },
  { label: "Asia Pacific", value: "Asia Pacific" },
] as const;
