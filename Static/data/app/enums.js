(function () {
  const AppData = window.AppData || (window.AppData = {});
  const defaultRoleLabels = {
    customer: { label: "Reporter", chip: "chip--customer" },
    client: { label: "Organisation", chip: "chip--client" },
    admin: { label: "WeldSecure", chip: "chip--admin" }
  };
  const existingRoleLabels =
    AppData.ROLE_LABELS && typeof AppData.ROLE_LABELS === "object" ? AppData.ROLE_LABELS : {};
  AppData.ROLE_LABELS = {
    customer: existingRoleLabels.customer || defaultRoleLabels.customer,
    client: existingRoleLabels.client || defaultRoleLabels.client,
    admin: existingRoleLabels.admin || defaultRoleLabels.admin
  };

  const defaultMessageStatus = {
    PENDING: "pending",
    APPROVED: "approved",
    REJECTED: "rejected"
  };
  const existingMessageStatus =
    AppData.MessageStatus && typeof AppData.MessageStatus === "object" ? AppData.MessageStatus : {};
  AppData.MessageStatus = {
    PENDING: existingMessageStatus.PENDING || defaultMessageStatus.PENDING,
    APPROVED: existingMessageStatus.APPROVED || defaultMessageStatus.APPROVED,
    REJECTED: existingMessageStatus.REJECTED || defaultMessageStatus.REJECTED
  };

  const normalizeKey = value => {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
    return null;
  };

  const blueprintConfig = AppData.phishingBlueprints || {};
  const defaultPhishingChannels = ["email", "sms", "teams", "slack", "qr"];
  const normalizedChannels = Array.isArray(AppData.PHISHING_CHANNELS) && AppData.PHISHING_CHANNELS.length > 0
    ? AppData.PHISHING_CHANNELS.slice()
    : Array.isArray(blueprintConfig.channels) && blueprintConfig.channels.length > 0
    ? blueprintConfig.channels.slice()
    : defaultPhishingChannels.slice();
  AppData.PHISHING_CHANNELS = normalizedChannels.map(channel => {
    if (typeof channel === "string") {
      const normalized = channel.trim().toLowerCase();
      return normalized.length > 0 ? normalized : "email";
    }
    return "email";
  });

  const defaultSignalCategories = {
    deception: "Identity deception",
    delivery: "Delivery channel oddities",
    persuasion: "Persuasion & urgency",
    payload: "Payload or attachment risk"
  };
  const blueprintSignalOverrides =
    blueprintConfig.signalCategories && typeof blueprintConfig.signalCategories === "object"
      ? blueprintConfig.signalCategories
      : {};
  const normalizedSignalCategories = { ...defaultSignalCategories };
  Object.keys(blueprintSignalOverrides).forEach(key => {
    const normalizedKey = normalizeKey(key);
    if (!normalizedKey) return;
    const label = blueprintSignalOverrides[key];
    if (typeof label === "string" && label.trim().length > 0) {
      normalizedSignalCategories[normalizedKey] = label.trim();
    }
  });
  AppData.PHISHING_SIGNAL_CATEGORIES = normalizedSignalCategories;

  const defaultStorageKey = "weldStaticDemoStateV1";
  if (typeof AppData.STORAGE_KEY !== "string" || AppData.STORAGE_KEY.trim().length === 0) {
    AppData.STORAGE_KEY = defaultStorageKey;
  }

  const modules = window.WeldModules;
  if (modules && (!modules.has || !modules.has("data/app/enums"))) {
    modules.define("data/app/enums", () => ({
      roleLabels: AppData.ROLE_LABELS,
      messageStatus: AppData.MessageStatus,
      phishingChannels: AppData.PHISHING_CHANNELS,
      phishingSignalCategories: AppData.PHISHING_SIGNAL_CATEGORIES,
      storageKey: AppData.STORAGE_KEY
    }));
  }
})();
