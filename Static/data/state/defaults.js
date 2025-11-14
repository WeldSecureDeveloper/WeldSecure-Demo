(function () {
  const AppData = window.AppData || {};
  const designerDefaults = window.WeldDesignerDefaults || null;
  const PHISHING_BLUEPRINTS = AppData.phishingBlueprints || {};
  const DEFAULTS = AppData.DEFAULTS && typeof AppData.DEFAULTS === "object" ? AppData.DEFAULTS : {};

  function resolveStringDefault(value, fallback) {
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed.length > 0) return trimmed;
    }
    if (typeof fallback === "string") {
      const trimmedFallback = fallback.trim();
      if (trimmedFallback.length > 0) return trimmedFallback;
    }
    return "";
  }

  function normalizeChannelList(list, fallback) {
    const source = Array.isArray(list) && list.length > 0 ? list : fallback;
    if (!Array.isArray(source)) return [];
    return source
      .map(channel => (typeof channel === "string" ? channel.trim().toLowerCase() : channel))
      .filter(Boolean);
  }

  function cloneArray(list) {
    return Array.isArray(list) ? list.slice() : [];
  }

  function clonePlainObject(value) {
    if (!value || typeof value !== "object") return {};
    return { ...value };
  }

  const DEFAULT_REPORTER_PROMPT = resolveStringDefault(
    AppData.DEFAULT_REPORTER_PROMPT,
    DEFAULTS.REPORTER_PROMPT
  );
  const DEFAULT_EMERGENCY_LABEL = resolveStringDefault(
    AppData.DEFAULT_EMERGENCY_LABEL,
    DEFAULTS.EMERGENCY_LABEL
  );
  const PREVIOUS_EMERGENCY_LABEL = resolveStringDefault(
    AppData.PREVIOUS_EMERGENCY_LABEL,
    DEFAULTS.PREVIOUS_EMERGENCY_LABEL
  );
  const DEFAULT_REPORTER_REASONS = Array.isArray(AppData.DEFAULT_REPORTER_REASONS) && AppData.DEFAULT_REPORTER_REASONS.length > 0
    ? AppData.DEFAULT_REPORTER_REASONS.map(item => (item && typeof item === "object" ? { ...item } : item))
    : Array.isArray(DEFAULTS.REPORTER_REASONS) && DEFAULTS.REPORTER_REASONS.length > 0
    ? DEFAULTS.REPORTER_REASONS.map(item => (item && typeof item === "object" ? { ...item } : item))
    : [];

  const BLUEPRINT_DEFAULT_FORM =
    PHISHING_BLUEPRINTS.defaultForm && typeof PHISHING_BLUEPRINTS.defaultForm === "object"
      ? PHISHING_BLUEPRINTS.defaultForm
      : {};
  const BLUEPRINT_DEFAULT_SENDER =
    BLUEPRINT_DEFAULT_FORM.sender && typeof BLUEPRINT_DEFAULT_FORM.sender === "object"
      ? BLUEPRINT_DEFAULT_FORM.sender
      : {};
  const CHANNEL_OPTIONS = normalizeChannelList(AppData.PHISHING_CHANNELS, ["email", "sms", "teams", "slack", "qr"]);

  const DEFAULT_PHISHING_FORM = {
    id: null,
    templateId:
      typeof BLUEPRINT_DEFAULT_FORM.templateId === "string" && BLUEPRINT_DEFAULT_FORM.templateId.trim().length > 0
        ? BLUEPRINT_DEFAULT_FORM.templateId.trim()
        : null,
    name: resolveStringDefault(BLUEPRINT_DEFAULT_FORM.name, ""),
    status: "draft",
    channel:
      typeof BLUEPRINT_DEFAULT_FORM.channel === "string" && BLUEPRINT_DEFAULT_FORM.channel.trim().length > 0
        ? BLUEPRINT_DEFAULT_FORM.channel.trim().toLowerCase()
        : CHANNEL_OPTIONS[0] || "email",
    sender: {
      displayName: resolveStringDefault(BLUEPRINT_DEFAULT_SENDER.displayName, "Security Desk"),
      address: resolveStringDefault(BLUEPRINT_DEFAULT_SENDER.address, "security@weldsecure.com")
    },
    subject: resolveStringDefault(BLUEPRINT_DEFAULT_FORM.subject, ""),
    body: typeof BLUEPRINT_DEFAULT_FORM.body === "string" ? BLUEPRINT_DEFAULT_FORM.body : "",
    signalIds: cloneArray(BLUEPRINT_DEFAULT_FORM.signalIds || BLUEPRINT_DEFAULT_FORM.defaultSignals),
    targetIds: cloneArray(BLUEPRINT_DEFAULT_FORM.targetIds || BLUEPRINT_DEFAULT_FORM.suggestedTargets),
    schedule:
      typeof BLUEPRINT_DEFAULT_FORM.schedule === "string" && BLUEPRINT_DEFAULT_FORM.schedule.trim().length > 0
        ? new Date(BLUEPRINT_DEFAULT_FORM.schedule).toISOString()
        : null,
    ownerId: resolveStringDefault(BLUEPRINT_DEFAULT_FORM.ownerId, BLUEPRINT_DEFAULT_SENDER.address) || "amelia-reed"
  };

  const fallbackDesignerChannels = normalizeChannelList(AppData.PHISHING_CHANNELS, []);
  const DESIGNER_CHANNELS = normalizeChannelList(
    designerDefaults && designerDefaults.CHANNEL_OPTIONS,
    fallbackDesignerChannels.length > 0 ? fallbackDesignerChannels : CHANNEL_OPTIONS
  );

  const DEFAULT_DESIGNER_FORM =
    designerDefaults && designerDefaults.DEFAULT_FORM
      ? {
          ...designerDefaults.DEFAULT_FORM,
          sender: clonePlainObject(designerDefaults.DEFAULT_FORM.sender),
          signalIds: cloneArray(designerDefaults.DEFAULT_FORM.signalIds),
          targetIds: cloneArray(designerDefaults.DEFAULT_FORM.targetIds)
        }
      : {
          id: null,
          templateId:
            typeof BLUEPRINT_DEFAULT_FORM.templateId === "string" && BLUEPRINT_DEFAULT_FORM.templateId.trim().length > 0
              ? BLUEPRINT_DEFAULT_FORM.templateId.trim()
              : null,
          name: typeof BLUEPRINT_DEFAULT_FORM.name === "string" ? BLUEPRINT_DEFAULT_FORM.name : "",
          status: "draft",
          channel:
            typeof BLUEPRINT_DEFAULT_FORM.channel === "string" && BLUEPRINT_DEFAULT_FORM.channel.trim().length > 0
              ? BLUEPRINT_DEFAULT_FORM.channel.trim().toLowerCase()
              : DESIGNER_CHANNELS[0] || "email",
          sender: {
            displayName:
              typeof BLUEPRINT_DEFAULT_SENDER.displayName === "string" && BLUEPRINT_DEFAULT_SENDER.displayName.trim().length > 0
                ? BLUEPRINT_DEFAULT_SENDER.displayName.trim()
                : "Security Desk",
            address:
              typeof BLUEPRINT_DEFAULT_SENDER.address === "string" && BLUEPRINT_DEFAULT_SENDER.address.trim().length > 0
                ? BLUEPRINT_DEFAULT_SENDER.address.trim()
                : "security@weldsecure.com"
          },
          subject: typeof BLUEPRINT_DEFAULT_FORM.subject === "string" ? BLUEPRINT_DEFAULT_FORM.subject : "",
          body: typeof BLUEPRINT_DEFAULT_FORM.body === "string" ? BLUEPRINT_DEFAULT_FORM.body : "",
          signalIds: cloneArray(BLUEPRINT_DEFAULT_FORM.signalIds || BLUEPRINT_DEFAULT_FORM.defaultSignals),
          targetIds: cloneArray(BLUEPRINT_DEFAULT_FORM.targetIds || BLUEPRINT_DEFAULT_FORM.suggestedTargets),
          schedule:
            typeof BLUEPRINT_DEFAULT_FORM.schedule === "string" && BLUEPRINT_DEFAULT_FORM.schedule.trim().length > 0
              ? BLUEPRINT_DEFAULT_FORM.schedule
              : null,
          ownerId:
            typeof BLUEPRINT_DEFAULT_FORM.ownerId === "string" && BLUEPRINT_DEFAULT_FORM.ownerId.trim().length > 0
              ? BLUEPRINT_DEFAULT_FORM.ownerId.trim()
              : BLUEPRINT_DEFAULT_SENDER.address || "amelia-reed"
        };

  const DEFAULT_GUIDED_TOUR_META = {
    enabled: true,
    dismissedRoutes: {}
  };

  const DEFAULT_FEATURE_TOGGLES = {
    badges: true,
    leaderboards: true,
    quests: true,
    rewards: true
  };

  const exports = {
    DEFAULT_REPORTER_PROMPT,
    DEFAULT_EMERGENCY_LABEL,
    PREVIOUS_EMERGENCY_LABEL,
    DEFAULT_REPORTER_REASONS,
    DEFAULT_PHISHING_FORM,
    DEFAULT_DESIGNER_FORM,
    DEFAULT_GUIDED_TOUR_META,
    DEFAULT_FEATURE_TOGGLES,
    CHANNEL_OPTIONS,
    DESIGNER_CHANNELS
  };

  if (window) {
    window.WeldStateDefaults = exports;
  }

  const modules = window.WeldModules;
  if (modules && (!modules.has || !modules.has("data/state/defaults"))) {
    modules.define("data/state/defaults", () => exports);
  }
})();
