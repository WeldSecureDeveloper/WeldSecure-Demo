// data.js - container for static demo data & enums (migrate in Phase 3)
const AppData = window.AppData || (window.AppData = {});

const DEFAULT_REPORTER_PROMPT_BASE = "Why are you reporting this?";
const DEFAULT_EMERGENCY_LABEL_BASE = "I clicked a link, opened an attachment, or entered credentials";
const PREVIOUS_EMERGENCY_LABEL_BASE =
  "Recipient clicked a link, opened an attachment, or entered credentials";
const DEFAULT_REPORTER_REASONS_BASE = [
  { id: "reason-looks-like-phishing", label: "Looks like a phishing attempt" },
  { id: "reason-unexpected-attachment", label: "Unexpected attachment or link" },
  { id: "reason-urgent-tone", label: "Urgent language / suspicious tone" },
  { id: "reason-spoofing-senior", label: "Sender spoofing a senior colleague" }
];

const existingDefaults = AppData.DEFAULTS && typeof AppData.DEFAULTS === "object" ? AppData.DEFAULTS : {};
const reporterReasonDefaults =
  Array.isArray(existingDefaults.REPORTER_REASONS) && existingDefaults.REPORTER_REASONS.length > 0
    ? existingDefaults.REPORTER_REASONS
    : DEFAULT_REPORTER_REASONS_BASE;

AppData.DEFAULTS = {
  REPORTER_PROMPT: existingDefaults.REPORTER_PROMPT || DEFAULT_REPORTER_PROMPT_BASE,
  EMERGENCY_LABEL: existingDefaults.EMERGENCY_LABEL || DEFAULT_EMERGENCY_LABEL_BASE,
  PREVIOUS_EMERGENCY_LABEL: existingDefaults.PREVIOUS_EMERGENCY_LABEL || PREVIOUS_EMERGENCY_LABEL_BASE,
  REPORTER_REASONS: reporterReasonDefaults
};

const resolvedReporterReasons =
  Array.isArray(AppData.DEFAULT_REPORTER_REASONS) && AppData.DEFAULT_REPORTER_REASONS.length > 0
    ? AppData.DEFAULT_REPORTER_REASONS
    : reporterReasonDefaults;

const normalizedReporterReasons = Array.isArray(resolvedReporterReasons)
  ? resolvedReporterReasons.map(reason => (reason && typeof reason === "object" ? { ...reason } : reason))
  : [];

const blueprintConfig = AppData.phishingBlueprints || {};
const defaultPhishingChannels = ["email", "sms", "teams", "slack", "qr"];
const phishingChannelsEnum =
  Array.isArray(blueprintConfig.channels) && blueprintConfig.channels.length > 0
    ? blueprintConfig.channels.slice()
    : defaultPhishingChannels;
const defaultSignalCategories = {
  deception: "Identity deception",
  delivery: "Delivery channel oddities",
  persuasion: "Persuasion & urgency",
  payload: "Payload or attachment risk"
};
const phishingSignalCategories =
  blueprintConfig.signalCategories && typeof blueprintConfig.signalCategories === "object"
    ? { ...defaultSignalCategories, ...blueprintConfig.signalCategories }
    : { ...defaultSignalCategories };

Object.assign(AppData, {
  STORAGE_KEY: "weldStaticDemoStateV1",
  ROLE_LABELS: {
  customer: { label: "Reporter", chip: "chip--customer" },
  client: { label: "Organisation", chip: "chip--client" },
  admin: { label: "WeldSecure", chip: "chip--admin" }
},
  ROUTES: {
  landing: { requiresRole: false },
  customer: { requiresRole: "customer" },
  "customer-hub-rewards": { requiresRole: "customer" },
  "customer-hub-quests": { requiresRole: "customer" },
  "customer-reports": { requiresRole: "customer" },
  "customer-badges": { requiresRole: "customer" },
  "customer-redemptions": { requiresRole: "customer" },
  "customer-leaderboards": { requiresRole: "customer" },
  "reporter-sandbox": { requiresRole: "customer" },
  "client-dashboard": { requiresRole: "client" },
  "client-user-config": { requiresRole: "client" },
  "client-leaderboards": { requiresRole: "client" },
  "client-reporting": { requiresRole: "client" },
  "client-rewards": { requiresRole: "client" },
  "client-quests": { requiresRole: "client" },
  "weld-admin": { requiresRole: "admin" },
  "phishing-sims": { requiresRole: "admin" },
  "phishing-designer": { requiresRole: "admin" },
  "weld-labs": { requiresRole: "admin" },
  "client-badges": { requiresRole: "client" },
  addin: { requiresRole: false }
},
  MessageStatus: {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected"
},
  NAV_GROUPS: [
  {
    label: "Reporter",
    role: "customer",
    items: [
      { label: "Reporter", route: "addin", role: "customer" },
      { label: "Hub", route: "customer", role: "customer" },
      { label: "Sandbox", route: "reporter-sandbox", role: "customer" }
    ]
  },
  {
    label: "Organisation",
    role: "client",
    items: [
      { label: "Organisation Hub", route: "client-dashboard", role: "client" },
      { label: "Security Team Dashboard", route: "client-reporting", role: "client" },
      { label: "Badge Catalogue", route: "client-badges", role: "client" },
      { label: "Quest Catalogue", route: "client-quests", role: "client" },
      { label: "Rewards Catalogue", route: "client-rewards", role: "client" },
      { label: "Leaderboards", route: "client-leaderboards", role: "client" },
      { label: "User configuration", route: "client-user-config", role: "client" },
      { label: "Phishing Designer", route: "phishing-designer", role: "admin" }
    ]
  },
  {
    label: "WeldSecure",
    role: "admin",
    items: [
      { label: "Weld Admin", route: "weld-admin", role: "admin" },
      { label: "Phishing Sims", route: "phishing-sims", role: "admin" },
      { label: "Weld Labs", route: "weld-labs", role: "admin" }
    ]
  }
],
  PHISHING_CHANNELS: phishingChannelsEnum,
  PHISHING_SIGNAL_CATEGORIES: phishingSignalCategories,
  DIRECTORY_PRESETS: (() => {
    const directoryData = window.DirectoryData || {};
    const cloneList = source => (Array.isArray(source) ? source.map(entry => ({ ...entry })) : []);
    const cloneObject = source =>
      source && typeof source === "object" ? { ...source } : {};
    return {
      integrations: cloneObject(directoryData.integrations),
      departments: cloneList(directoryData.departments),
      teams: cloneList(directoryData.teams),
      users: cloneList(directoryData.users)
    };
  })()

});

// Expose routes for legacy hash navigation helpers.
window.ROUTES = window.AppData.ROUTES;

// Surface directory data for easier reuse across features.
window.AppData.DIRECTORY = window.AppData.DIRECTORY_PRESETS;

