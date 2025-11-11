// state.js - state init & persistence helpers (namespaced)
(function () {
  const appData = window.AppData || {};
  const STORAGE_KEY = appData.STORAGE_KEY || "WeldDemoState";
  const APP_DEFAULTS = appData.DEFAULTS && typeof appData.DEFAULTS === "object" ? appData.DEFAULTS : {};
  const resolveStringDefault = (value, fallback) => {
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed.length > 0) return trimmed;
    }
    if (typeof fallback === "string") {
      const trimmedFallback = fallback.trim();
      if (trimmedFallback.length > 0) return trimmedFallback;
    }
    return "";
  };
  const cloneReasonList = source =>
    Array.isArray(source) ? source.map(item => (item && typeof item === "object" ? { ...item } : item)) : [];
  const DEFAULT_REPORTER_PROMPT_SAFE = resolveStringDefault(
    appData.DEFAULT_REPORTER_PROMPT,
    APP_DEFAULTS.REPORTER_PROMPT
  );
  const DEFAULT_EMERGENCY_LABEL_SAFE = resolveStringDefault(
    appData.DEFAULT_EMERGENCY_LABEL,
    APP_DEFAULTS.EMERGENCY_LABEL
  );
  const PREVIOUS_EMERGENCY_LABEL = resolveStringDefault(
    appData.PREVIOUS_EMERGENCY_LABEL,
    APP_DEFAULTS.PREVIOUS_EMERGENCY_LABEL
  );
  const DEFAULT_REPORTER_REASONS_SAFE = (() => {
    if (Array.isArray(appData.DEFAULT_REPORTER_REASONS) && appData.DEFAULT_REPORTER_REASONS.length > 0) {
      return cloneReasonList(appData.DEFAULT_REPORTER_REASONS);
    }
    if (Array.isArray(APP_DEFAULTS.REPORTER_REASONS) && APP_DEFAULTS.REPORTER_REASONS.length > 0) {
      return cloneReasonList(APP_DEFAULTS.REPORTER_REASONS);
    }
    return [];
  })();
  const BADGES = appData.BADGES || [];
  const rawBadgeDrafts = appData.BADGE_DRAFTS;
  const BADGE_DRAFTS = rawBadgeDrafts instanceof Set ? rawBadgeDrafts : new Set(rawBadgeDrafts || []);
  const DEFAULT_QUESTS = appData.DEFAULT_QUESTS || [];
  const DEPARTMENT_LEADERBOARD = appData.DEPARTMENT_LEADERBOARD || [];
  const ENGAGEMENT_PROGRAMS = appData.ENGAGEMENT_PROGRAMS || [];
  const MessageStatus = appData.MessageStatus || {};
  const THEME_OPTIONS = ["light", "dark"];
  const DEFAULT_FEATURE_TOGGLES = {
    badges: true,
    leaderboards: true,
    quests: true,
    rewards: true
  };
  const DEFAULT_GUIDED_TOUR_META = {
    enabled: true,
    dismissedRoutes: {}
  };
  const blueprintConfig = appData.phishingBlueprints || {};
  const CHANNEL_OPTIONS = Array.isArray(appData.PHISHING_CHANNELS) && appData.PHISHING_CHANNELS.length > 0
    ? appData.PHISHING_CHANNELS.map(channel => (typeof channel === "string" ? channel.trim().toLowerCase() : channel)).filter(Boolean)
    : ["email", "sms", "teams", "slack", "qr"];
  const defaultBlueprintForm =
    blueprintConfig.defaultForm && typeof blueprintConfig.defaultForm === "object"
      ? blueprintConfig.defaultForm
      : {};
  const defaultBlueprintSender =
    defaultBlueprintForm.sender && typeof defaultBlueprintForm.sender === "object"
      ? defaultBlueprintForm.sender
      : {};
  const DEFAULT_PHISHING_FORM = {
    id: null,
    templateId:
      typeof defaultBlueprintForm.templateId === "string" && defaultBlueprintForm.templateId.trim().length > 0
        ? defaultBlueprintForm.templateId.trim()
        : null,
    name: resolveStringDefault(defaultBlueprintForm.name, ""),
    status: "draft",
    channel:
      typeof defaultBlueprintForm.channel === "string" && defaultBlueprintForm.channel.trim().length > 0
        ? defaultBlueprintForm.channel.trim().toLowerCase()
        : CHANNEL_OPTIONS[0] || "email",
    sender: {
      displayName: resolveStringDefault(defaultBlueprintSender.displayName, "Security Desk"),
      address: resolveStringDefault(defaultBlueprintSender.address, "security@weldsecure.com")
    },
    subject: resolveStringDefault(defaultBlueprintForm.subject, ""),
    body: typeof defaultBlueprintForm.body === "string" ? defaultBlueprintForm.body : "",
    signalIds: Array.isArray(defaultBlueprintForm.signalIds)
      ? defaultBlueprintForm.signalIds.slice()
      : Array.isArray(defaultBlueprintForm.defaultSignals)
      ? defaultBlueprintForm.defaultSignals.slice()
      : [],
    targetIds: Array.isArray(defaultBlueprintForm.targetIds)
      ? defaultBlueprintForm.targetIds.slice()
      : Array.isArray(defaultBlueprintForm.suggestedTargets)
      ? defaultBlueprintForm.suggestedTargets.slice()
      : [],
    schedule:
      typeof defaultBlueprintForm.schedule === "string" && defaultBlueprintForm.schedule.trim().length > 0
        ? new Date(defaultBlueprintForm.schedule).toISOString()
        : null,
    ownerId: resolveStringDefault(defaultBlueprintForm.ownerId, defaultBlueprintSender.address) || "amelia-reed"
  };
  const getGenerateId =
    window.WeldUtil && typeof window.WeldUtil.generateId === "function"
      ? window.WeldUtil.generateId
      : prefix => {
          const normalizedPrefix = typeof prefix === "string" && prefix.length > 0 ? `${prefix}-` : "";
          return `${normalizedPrefix}${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6)
            .toString(36)
            .padStart(4, "0")}`;
        };
  const ALLOWED_DRAFT_STATUSES = new Set(["draft", "staged", "published"]);

  const normalizeDesignerKey = value => {
    if (typeof value === "string") {
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : null;
    }
    if (Number.isFinite(value)) {
      return String(value);
    }
    return null;
  };

  const normalizeDesignerChannel = (value, fallback) => {
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (CHANNEL_OPTIONS.includes(normalized)) {
        return normalized;
      }
    }
    return fallback || CHANNEL_OPTIONS[0] || "email";
  };

  const normalizeDesignerSchedule = value => {
    if (!value) return null;
    const candidate =
      value instanceof Date
        ? value
        : typeof value === "string" && value.trim().length > 0
        ? new Date(value)
        : null;
    if (!candidate || Number.isNaN(candidate.getTime())) {
      return null;
    }
    return candidate.toISOString();
  };

  const normalizeDesignerStatus = (value, fallback = "draft") => {
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (ALLOWED_DRAFT_STATUSES.has(normalized)) {
        return normalized;
      }
    }
    return fallback;
  };

  const normalizeDesignerList = (list, fallback = []) => {
    if (!Array.isArray(list)) {
      return fallback.slice();
    }
    const seen = new Set();
    const normalized = [];
    list.forEach(entry => {
      const key = normalizeDesignerKey(entry);
      if (!key || seen.has(key)) return;
      seen.add(key);
      normalized.push(key);
    });
    return normalized;
  };

  function clonePhishingForm(source) {
    const base = {
      ...DEFAULT_PHISHING_FORM,
      sender: { ...DEFAULT_PHISHING_FORM.sender },
      signalIds: Array.isArray(DEFAULT_PHISHING_FORM.signalIds)
        ? DEFAULT_PHISHING_FORM.signalIds.slice()
        : [],
      targetIds: Array.isArray(DEFAULT_PHISHING_FORM.targetIds)
        ? DEFAULT_PHISHING_FORM.targetIds.slice()
        : []
    };
    if (!source || typeof source !== "object") {
      return base;
    }
    const mergedSender =
      source.sender && typeof source.sender === "object"
        ? {
            displayName: resolveStringDefault(source.sender.displayName, base.sender.displayName),
            address: resolveStringDefault(source.sender.address, base.sender.address)
          }
        : base.sender;
    return {
      ...base,
      id: normalizeDesignerKey(source.id),
      templateId: normalizeDesignerKey(source.templateId) || base.templateId,
      name: resolveStringDefault(source.name, base.name),
      status: normalizeDesignerStatus(source.status, base.status),
      channel: normalizeDesignerChannel(source.channel, base.channel),
      sender: mergedSender,
      subject: typeof source.subject === "string" ? source.subject : base.subject,
      body: typeof source.body === "string" ? source.body : base.body,
      signalIds: normalizeDesignerList(source.signalIds, base.signalIds),
      targetIds: normalizeDesignerList(source.targetIds, base.targetIds),
      schedule: normalizeDesignerSchedule(source.schedule),
      ownerId: resolveStringDefault(source.ownerId, base.ownerId)
    };
  }

  const parseIsoDate = value => {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    const parsed = new Date(trimmed);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed.toISOString();
  };

  const normalizeDesignerDraft = (source, fallbackStatus = "draft") => {
    const normalized = clonePhishingForm(source);
    if (!normalized.id) {
      normalized.id = getGenerateId("phish-draft");
    }
    normalized.status = normalizeDesignerStatus(source?.status, fallbackStatus);
    normalized.createdAt = parseIsoDate(source?.createdAt) || new Date().toISOString();
    normalized.updatedAt = parseIsoDate(source?.updatedAt) || normalized.createdAt;
    normalized.lastPublishedAt = parseIsoDate(source?.lastPublishedAt);
    return normalized;
  };

  const blueprintTemplates = Array.isArray(blueprintConfig.templates) ? blueprintConfig.templates : [];

  const seedPhishingDrafts = () => {
    if (!blueprintTemplates.length) return [];
    const now = Date.now();
    return blueprintTemplates.slice(0, 3).map((template, index) => {
      const draft = clonePhishingForm({
        id: template.id,
        templateId: template.id,
        name: template.name,
        channel: template.defaultChannel,
        subject: template.subject,
        body: template.body,
        signalIds: template.defaultSignals,
        targetIds: template.suggestedTargets
      });
      const timestamp = new Date(now - index * 4 * 60 * 60 * 1000).toISOString();
      return {
        ...draft,
        status: "draft",
        createdAt: timestamp,
        updatedAt: timestamp,
        lastPublishedAt: null
      };
    });
  };

  const normalizePhishingDesigner = (source, fallbackState) => {
    const fallback =
      fallbackState && typeof fallbackState === "object"
        ? fallbackState
        : {
            activeTemplateId: null,
            drafts: [],
            form: clonePhishingForm(),
            validation: {}
          };
    const base = {
      activeTemplateId: normalizeDesignerKey(fallback.activeTemplateId),
      drafts: Array.isArray(fallback.drafts)
        ? fallback.drafts.map(entry => ({
            ...entry,
            sender: entry.sender ? { ...entry.sender } : { ...DEFAULT_PHISHING_FORM.sender },
            signalIds: Array.isArray(entry.signalIds) ? entry.signalIds.slice() : [],
            targetIds: Array.isArray(entry.targetIds) ? entry.targetIds.slice() : []
          }))
        : [],
      form: clonePhishingForm(fallback.form),
      validation:
        fallback.validation && typeof fallback.validation === "object"
          ? { ...fallback.validation }
          : {}
    };
    if (!source || typeof source !== "object") {
      if (!base.drafts.length) {
        base.drafts = seedPhishingDrafts();
      }
      if (!base.form.id && base.drafts.length > 0) {
        base.form = clonePhishingForm(base.drafts[0]);
        base.activeTemplateId = base.drafts[0].id;
      }
      return base;
    }
    const drafts =
      Array.isArray(source.drafts) && source.drafts.length > 0
        ? source.drafts.map(entry => normalizeDesignerDraft(entry))
        : base.drafts.length > 0
        ? base.drafts
        : seedPhishingDrafts();
    const form = clonePhishingForm(source.form);
    const activeTemplateId = normalizeDesignerKey(source.activeTemplateId) || form.id || (drafts[0] && drafts[0].id) || null;
    const validation =
      source.validation && typeof source.validation === "object" ? { ...source.validation } : {};
    if (!form.id && drafts.length > 0) {
      const [firstDraft] = drafts;
      return {
        activeTemplateId: firstDraft.id,
        drafts,
        form: clonePhishingForm(firstDraft),
        validation
      };
    }
    return {
      activeTemplateId,
      drafts,
      form,
      validation
    };
  };

  const normalizeSandboxSignalId = value => {
    if (typeof value === "string") {
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed.toLowerCase() : null;
    }
    return null;
  };

  const normalizeSandboxSender = sender => {
    const displayName =
      typeof sender?.displayName === "string" && sender.displayName.trim().length > 0
        ? sender.displayName.trim()
        : "Security Desk";
    const address =
      typeof sender?.address === "string" && sender.address.trim().length > 0
        ? sender.address.trim()
        : "security@weldsecure.com";
    return { displayName, address };
  };

  const normalizeSandboxAttachments = list => {
    if (!Array.isArray(list)) return [];
    return list
      .map(item => {
        if (!item || typeof item !== "object") return null;
        const id =
          typeof item.id === "string" && item.id.trim().length > 0 ? item.id.trim() : getGenerateId("sandbox-attachment");
        const name =
          typeof item.name === "string" && item.name.trim().length > 0 ? item.name.trim() : "attachment.bin";
        const type =
          typeof item.type === "string" && item.type.trim().length > 0 ? item.type.trim().toLowerCase() : "file";
        return { id, name, type };
      })
      .filter(Boolean);
  };

  const normalizeSandboxMetadata = metadata => {
    if (!metadata || typeof metadata !== "object") return {};
    const copy = { ...metadata };
    Object.keys(copy).forEach(key => {
      if (copy[key] === undefined) {
        delete copy[key];
      }
    });
    return copy;
  };

  const normalizeSandboxMessage = (source, fallbackId) => {
    if (!source || typeof source !== "object") return null;
    const id =
      typeof source.id === "string" && source.id.trim().length > 0
        ? source.id.trim()
        : fallbackId || getGenerateId("sandbox-msg");
    const createdAt =
      typeof source.createdAt === "string" && source.createdAt.trim().length > 0
        ? new Date(source.createdAt).toISOString()
        : new Date().toISOString();
    const channel =
      typeof source.channel === "string" && source.channel.trim().length > 0
        ? source.channel.trim().toLowerCase()
        : "email";
    const signalIds = Array.isArray(source.signalIds)
      ? source.signalIds.map(normalizeSandboxSignalId).filter(Boolean)
      : [];
    const subject = typeof source.subject === "string" ? source.subject : "Simulation message";
    const previewText =
      typeof source.previewText === "string" && source.previewText.trim().length > 0
        ? source.previewText.trim()
        : "";
    const body = typeof source.body === "string" ? source.body : "";
    return {
      id,
      campaignId:
        typeof source.campaignId === "string" && source.campaignId.trim().length > 0
          ? source.campaignId.trim()
          : null,
      channel,
      createdAt,
      sender: normalizeSandboxSender(source.sender),
      subject,
      previewText,
      body,
      signalIds,
      attachments: normalizeSandboxAttachments(source.attachments),
      metadata: normalizeSandboxMetadata(source.metadata)
    };
  };

  const cloneSandboxMessages = (list, prefix = "sandbox-msg") => {
    if (!Array.isArray(list)) return [];
    return list
      .map((message, index) => normalizeSandboxMessage(message, `${prefix}-${index + 1}`))
      .filter(Boolean);
  };

  const DEFAULT_SANDBOX_MESSAGES = cloneSandboxMessages(
    (appData.phishingSimulations && appData.phishingSimulations.sandboxMessages) || [],
    "sandbox-seed"
  );

  const normalizeSandboxFindings = source => {
    if (!source || typeof source !== "object") return {};
    const entries = {};
    Object.entries(source).forEach(([messageId, signals]) => {
      const normalizedId =
        typeof messageId === "string" && messageId.trim().length > 0 ? messageId.trim() : null;
      if (!normalizedId) return;
      entries[normalizedId] = Array.isArray(signals)
        ? signals.map(normalizeSandboxSignalId).filter(Boolean)
        : [];
    });
    return entries;
  };

  const normalizeSandboxSubmission = (entry, index = 0) => {
    if (!entry || typeof entry !== "object") return null;
    const messageId =
      typeof entry.messageId === "string" && entry.messageId.trim().length > 0 ? entry.messageId.trim() : null;
    if (!messageId) return null;
    const normalizeList = list =>
      Array.isArray(list) ? list.map(normalizeSandboxSignalId).filter(Boolean) : [];
    const submittedAt =
      typeof entry.submittedAt === "string" && entry.submittedAt.trim().length > 0
        ? entry.submittedAt.trim()
        : new Date(Date.now() - index * 1000).toISOString();
    return {
      messageId,
      selectedSignals: normalizeList(entry.selectedSignals),
      correctSignals: normalizeList(entry.correctSignals),
      missedSignals: normalizeList(entry.missedSignals),
      extraSignals: normalizeList(entry.extraSignals),
      submittedAt,
      usedHints: entry.usedHints === true,
      success: entry.success === true
    };
  };

  const normalizeReporterSandbox = (source, fallback) => {
    const base =
      fallback && typeof fallback === "object"
        ? fallback
        : {
            messages: cloneSandboxMessages(DEFAULT_SANDBOX_MESSAGES),
            activeMessageId: DEFAULT_SANDBOX_MESSAGES[0]?.id || null,
            hintsVisible: false,
            findings: {},
            submissions: []
          };
    const fallbackMessages =
      Array.isArray(base.messages) && base.messages.length > 0
        ? cloneSandboxMessages(base.messages, "sandbox-fallback")
        : cloneSandboxMessages(DEFAULT_SANDBOX_MESSAGES);
    const messages =
      Array.isArray(source?.messages) && source.messages.length > 0
        ? cloneSandboxMessages(source.messages, "sandbox-state")
        : fallbackMessages;
    const ensureMessageId = value =>
      typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
    const requestedActive = ensureMessageId(source?.activeMessageId);
    const hasRequested =
      requestedActive && messages.some(message => message.id === requestedActive) ? requestedActive : null;
    const activeMessageId = hasRequested || messages[0]?.id || null;
    const submissions =
      Array.isArray(source?.submissions) && source.submissions.length > 0
        ? source.submissions
            .map((entry, index) => normalizeSandboxSubmission(entry, index))
            .filter(Boolean)
            .slice(0, 24)
        : Array.isArray(base.submissions) && base.submissions.length > 0
        ? base.submissions
            .map((entry, index) => normalizeSandboxSubmission(entry, index))
            .filter(Boolean)
        : [];
    return {
      messages,
      activeMessageId,
      hintsVisible: source?.hintsVisible === true,
      findings: normalizeSandboxFindings(source?.findings || base.findings),
      submissions
    };
  };

  function storageAvailable() {
    try {
      const testKey = "__weldTest";
      localStorage.setItem(testKey, "1");
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  function normalizeGuidedTourMeta(source) {
    const base = {
      enabled: DEFAULT_GUIDED_TOUR_META.enabled,
      dismissedRoutes: { ...DEFAULT_GUIDED_TOUR_META.dismissedRoutes }
    };
    if (!source || typeof source !== "object") {
      return { ...base };
    }
    base.enabled = source.enabled !== false;
    if (source.dismissedRoutes && typeof source.dismissedRoutes === "object") {
      const dismissed = {};
      Object.keys(source.dismissedRoutes).forEach(key => {
        if (typeof key !== "string") return;
        const trimmedKey = key.trim();
        if (!trimmedKey) return;
        const value = source.dismissedRoutes[key];
        if (value === false || value === null || value === undefined) {
          return;
        }
        if (Number.isFinite(value)) {
          dismissed[trimmedKey] = Number(value);
          return;
        }
        if (typeof value === "string" && value.trim().length > 0) {
          dismissed[trimmedKey] = value.trim();
          return;
        }
        dismissed[trimmedKey] = Date.now();
      });
      base.dismissedRoutes = dismissed;
    }
    return base;
  }

  function normalizeAchievementFlags(source, fallback = {}) {
    const base =
      fallback && typeof fallback === "object" && !Array.isArray(fallback) ? { ...fallback } : {};
    if (!source || typeof source !== "object") {
      return base;
    }
    Object.keys(source).forEach(key => {
      if (typeof key !== "string") return;
      const trimmedKey = key.trim();
      if (!trimmedKey) return;
      const value = source[key];
      if (value === null || value === undefined || value === false) {
        return;
      }
      if (value === true) {
        base[trimmedKey] = true;
        return;
      }
      if (typeof value === "string") {
        const trimmedValue = value.trim();
        base[trimmedKey] = trimmedValue.length > 0 ? trimmedValue : true;
        return;
      }
      if (Number.isFinite(value)) {
        base[trimmedKey] = Number(value);
        return;
      }
      if (value && typeof value === "object" && typeof value.timestamp === "string") {
        const stamp = value.timestamp.trim();
        if (stamp.length > 0) {
          base[trimmedKey] = stamp;
        }
        return;
      }
      base[trimmedKey] = Boolean(value);
    });
    return base;
  }

  function normalizePhishingSimulation(source, fallback) {
    const base =
      fallback && typeof fallback === "object"
        ? fallback
        : FALLBACK_BASE.phishingSimulation || {
            activeCampaignId: null,
            selectedDepartmentId: null,
            simLaunchQueue: [],
            lastSimFeedback: null
          };
    const ensureId = value => {
      if (typeof value === "string") {
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : null;
      }
      if (Number.isFinite(value)) {
        return String(value);
      }
      return null;
    };
    const ensureQueue = list => {
      if (!Array.isArray(list)) {
        return Array.isArray(base.simLaunchQueue) ? base.simLaunchQueue.slice() : [];
      }
      const normalized = list
        .map(entry => ensureId(entry))
        .filter(Boolean)
        .slice(0, 10);
      if (normalized.length > 0) return normalized;
      return Array.isArray(base.simLaunchQueue) ? base.simLaunchQueue.slice() : [];
    };
    const ensureFeedback = value => {
      if (typeof value === "string") {
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : null;
      }
      return null;
    };
    return {
      activeCampaignId: ensureId(source?.activeCampaignId) || ensureId(base.activeCampaignId),
      selectedDepartmentId: ensureId(source?.selectedDepartmentId),
      simLaunchQueue: ensureQueue(source?.simLaunchQueue),
      lastSimFeedback: ensureFeedback(source?.lastSimFeedback)
    };
  }

  const FALLBACK_BASE = {
    meta: {
      role: null,
      route: "landing",
      theme: "light",
      addinScreen: "report",
      addinShellHeight: 760,
      lastReportedSubject: null,
      lastReportPoints: null,
      lastBalanceBefore: null,
      lastBalanceAfter: null,
      lastBadgeId: null,
      lastBadgeIds: [],
      lastBadgePoints: null,
      lastTotalAwarded: null,
      lastMessageId: null,
      lastClientSnapshot: null,
      reportFilter: null,
      rewardFilter: null,
      rewardStatusFilter: null,
      questFilter: null,
      questStatusFilter: null,
      badgeFilter: null,
      badgeStatusFilter: null,
      customerBadgeAvailabilityFilter: null,
      settingsOpen: false,
      settingsCategory: "reporter",
      directorySelection: {
        departmentId: null,
        teamId: null
      },
      achievementFlags: {},
      featureToggles: { ...DEFAULT_FEATURE_TOGGLES },
      guidedTour: { ...DEFAULT_GUIDED_TOUR_META }
    },
    settings: {
      reporter: {}
    },
    customer: {
      id: null,
      name: "",
      email: "",
      currentPoints: 0,
      redeemedPoints: 0,
      clientId: null,
      bonusPoints: {
        weeklyCap: 0,
        earnedThisWeek: 0,
        breakdown: []
      },
      questCompletions: []
    },
    directory: {
      integrations: {},
      departments: [],
      teams: [],
      users: []
    },
    teamMembers: [],
    recognitions: [],
    rewards: [],
    clients: [],
    rewardRedemptions: [],
    messages: [],
    labs: {
      lastReviewAt: null,
      features: []
    },
    phishingSimulation: {
      activeCampaignId: null,
      selectedDepartmentId: null,
      simLaunchQueue: [],
      lastSimFeedback: null
    },
    phishingDesigner: {
      activeTemplateId: null,
      drafts: [],
      form: clonePhishingForm(),
      validation: {}
    },
    reporterSandbox: {
      messages: cloneSandboxMessages(DEFAULT_SANDBOX_MESSAGES, "sandbox-default"),
      activeMessageId: DEFAULT_SANDBOX_MESSAGES[0]?.id || null,
      hintsVisible: false,
      findings: {},
      submissions: []
    }
  };

  function cloneFallback() {
    return JSON.parse(JSON.stringify(FALLBACK_BASE));
  }

  function cloneBasePayload() {
    const payload = window.WeldInitialState;
    if (!payload || typeof payload !== "object") {
      return cloneFallback();
    }
    try {
      return JSON.parse(JSON.stringify(payload));
    } catch {
      return cloneFallback();
    }
  }

  function initialState() {
    const base = cloneBasePayload();
    const reporterReasons = DEFAULT_REPORTER_REASONS_SAFE.map(item => ({ ...item }));

    const metaSource = base.meta && typeof base.meta === "object" ? base.meta : FALLBACK_BASE.meta;
    const meta = {
      ...FALLBACK_BASE.meta,
      ...metaSource
    };
    const metaFeatureToggles =
      metaSource.featureToggles && typeof metaSource.featureToggles === "object"
        ? metaSource.featureToggles
        : {};
    meta.featureToggles = {
      ...DEFAULT_FEATURE_TOGGLES,
      ...metaFeatureToggles
    };
    meta.guidedTour = normalizeGuidedTourMeta(meta.guidedTour || DEFAULT_GUIDED_TOUR_META);
    meta.achievementFlags = normalizeAchievementFlags(
      metaSource.achievementFlags || FALLBACK_BASE.meta.achievementFlags,
      FALLBACK_BASE.meta.achievementFlags
    );

    const reporterSettingsBase =
      base.settings && base.settings.reporter && typeof base.settings.reporter === "object"
        ? base.settings.reporter
        : {};
    const fallbackReporter = FALLBACK_BASE.settings.reporter || {};
    const settings = {
      reporter: {
        ...fallbackReporter,
        ...reporterSettingsBase,
        reasonPrompt:
          typeof DEFAULT_REPORTER_PROMPT === "string" && DEFAULT_REPORTER_PROMPT.trim().length > 0
            ? DEFAULT_REPORTER_PROMPT
            : reporterSettingsBase.reasonPrompt || fallbackReporter.reasonPrompt || DEFAULT_REPORTER_PROMPT_SAFE,
        emergencyLabel:
          typeof DEFAULT_EMERGENCY_LABEL === "string" && DEFAULT_EMERGENCY_LABEL.trim().length > 0
            ? DEFAULT_EMERGENCY_LABEL
            : reporterSettingsBase.emergencyLabel ||
              fallbackReporter.emergencyLabel ||
              DEFAULT_EMERGENCY_LABEL_SAFE,
        reasons: reporterReasons
      }
    };
    if (typeof PREVIOUS_EMERGENCY_LABEL === "string" && PREVIOUS_EMERGENCY_LABEL.trim().length > 0) {
      settings.reporter.previousEmergencyLabel = PREVIOUS_EMERGENCY_LABEL;
    }

    const customerSource =
      base.customer && typeof base.customer === "object" ? base.customer : FALLBACK_BASE.customer;
    const bonusSource =
      customerSource.bonusPoints && typeof customerSource.bonusPoints === "object"
        ? customerSource.bonusPoints
        : FALLBACK_BASE.customer.bonusPoints;
    const customer = {
      ...FALLBACK_BASE.customer,
      ...customerSource,
      bonusPoints: {
        ...FALLBACK_BASE.customer.bonusPoints,
        ...bonusSource,
        breakdown: Array.isArray(bonusSource.breakdown)
          ? bonusSource.breakdown.map(entry => ({ ...entry }))
          : []
      },
      questCompletions: Array.isArray(customerSource.questCompletions)
        ? customerSource.questCompletions.map(entry => ({ ...entry }))
        : []
    };

    const cloneArray = (source, mapper = entry => ({ ...entry })) =>
      Array.isArray(source) ? source.map(mapper) : [];

    const teamMembers = cloneArray(base.teamMembers);
    const recognitions = cloneArray(base.recognitions);
    const rewards = cloneArray(base.rewards);
    const clients = cloneArray(base.clients);
    const rewardRedemptions = cloneArray(base.rewardRedemptions);

    const labsSource = base.labs && typeof base.labs === "object" ? base.labs : FALLBACK_BASE.labs;
    const labs = {
      lastReviewAt:
        typeof labsSource.lastReviewAt === "string" && labsSource.lastReviewAt.length > 0
          ? labsSource.lastReviewAt
          : FALLBACK_BASE.labs.lastReviewAt,
      features: Array.isArray(labsSource.features)
        ? labsSource.features.map(feature => ({
            ...feature,
            tags: Array.isArray(feature.tags) ? feature.tags.slice() : [],
            enabledClientIds: Array.isArray(feature.enabledClientIds)
              ? feature.enabledClientIds.slice()
              : []
          }))
        : []
    };

    const normalizeStatus = value => {
      const raw = typeof value === "string" ? value.toLowerCase() : "";
      const approved = typeof MessageStatus.APPROVED === "string" ? MessageStatus.APPROVED.toLowerCase() : "approved";
      const rejected = typeof MessageStatus.REJECTED === "string" ? MessageStatus.REJECTED.toLowerCase() : "rejected";
      const pending = typeof MessageStatus.PENDING === "string" ? MessageStatus.PENDING.toLowerCase() : "pending";
      if (raw === approved) return MessageStatus.APPROVED || "approved";
      if (raw === rejected) return MessageStatus.REJECTED || "rejected";
      if (raw === pending) return MessageStatus.PENDING || "pending";
      return MessageStatus.PENDING || raw || "pending";
    };

    const messages = cloneArray(base.messages, message => ({
      ...message,
      reasons: Array.isArray(message.reasons) ? message.reasons.slice() : [],
      status: normalizeStatus(message.status)
    }));
    const phishingSimulation = normalizePhishingSimulation(base.phishingSimulation);
    const phishingDesigner = normalizePhishingDesigner(
      base.phishingDesigner,
      FALLBACK_BASE.phishingDesigner
    );
    const reporterSandbox = normalizeReporterSandbox(
      base.reporterSandbox,
      FALLBACK_BASE.reporterSandbox
    );

    return {
      meta,
      settings,
      customer,
      teamMembers,
      recognitions,
      rewards,
      quests: DEFAULT_QUESTS.map(quest => ({
        ...quest,
        published: typeof quest.published === "boolean" ? quest.published : true
      })),
      badges: BADGES.map(badge => ({
        ...badge,
        published: !BADGE_DRAFTS.has(badge.id)
      })),
      departmentLeaderboard: DEPARTMENT_LEADERBOARD.map(entry => ({
        ...entry
      })),
      engagementPrograms: ENGAGEMENT_PROGRAMS.map(program => ({
        ...program
      })),
      labs,
      rewardRedemptions,
      messages,
      clients,
      phishingSimulation,
      phishingDesigner,
      reporterSandbox
    };
  }

  function loadState() {
    if (!storageAvailable()) {
      return initialState();
    }
  
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return initialState();
    }
  
    try {
      const parsed = JSON.parse(raw);
      const baseState = initialState();
      const {
        reportReasons: legacyReportReasons,
        settings: storedSettingsRaw,
        ...passthrough
      } = parsed;
      const parsedSettings =
        storedSettingsRaw && typeof storedSettingsRaw === "object" ? storedSettingsRaw : {};
      const normalizedQuests = Array.isArray(parsed.quests)
        ? parsed.quests.map(quest => {
            const baseQuest = baseState.quests.find(item => item.id === quest.id);
            return {
              ...baseQuest,
              ...quest,
              published:
                typeof quest.published === "boolean"
                  ? quest.published
                  : baseQuest?.published ?? true
            };
          })
        : baseState.quests;
      const normalizedRewards = Array.isArray(parsed.rewards)
        ? (() => {
            const mergedRewards = parsed.rewards.map(reward => {
              const baseReward =
                baseState.rewards.find(item => item.id === reward.id) || {};
              const unlimited = baseReward.unlimited === true || reward.unlimited === true;
              const hasFiniteRemaining = Number.isFinite(reward.remaining);
              const baseRemaining = Number.isFinite(baseReward.remaining)
                ? baseReward.remaining
                : 0;
              return {
                ...baseReward,
                ...reward,
                icon: "gift",
                unlimited,
                remaining: unlimited
                  ? null
                  : hasFiniteRemaining
                  ? reward.remaining
                  : baseRemaining,
                published:
                  typeof reward.published === "boolean"
                    ? reward.published
                    : baseReward.published ?? true
              };
            });
            const existingRewardIds = new Set(
              mergedRewards.map(reward => reward.id)
            );
            const newRewards = baseState.rewards
              .filter(reward => !existingRewardIds.has(reward.id))
              .map(reward => ({ ...reward }));
            return [...mergedRewards, ...newRewards];
          })()
        : baseState.rewards;
      const normalizedBadges = Array.isArray(parsed.badges)
        ? (() => {
            const overrides = new Map();
            parsed.badges.forEach(item => {
              if (!item) return;
              const key =
                typeof item.id === "string" && item.id.trim().length > 0
                  ? item.id.trim()
                  : null;
              if (key) {
                overrides.set(key, { ...item, id: key });
              } else {
                const fallbackId = WeldUtil.generateId("badge");
                overrides.set(fallbackId, { ...item, id: fallbackId });
              }
            });
            const merged = baseState.badges.map(baseBadge => {
              const override = overrides.get(baseBadge.id);
              if (!override) {
                return { ...baseBadge };
              }
              overrides.delete(baseBadge.id);
              return {
                ...baseBadge,
                ...override,
                id: baseBadge.id,
                published:
                  typeof override.published === "boolean"
                    ? override.published
                    : baseBadge.published
              };
            });
            const additional = Array.from(overrides.values()).map(item => ({
              ...item,
              published:
                typeof item.published === "boolean"
                  ? item.published
                  : !BADGE_DRAFTS.has(item.id)
            }));
            return [...merged, ...additional];
          })()
        : baseState.badges;
      const normalizedClients = Array.isArray(parsed.clients)
        ? parsed.clients.map(client => {
            const baseClient = baseState.clients.find(item => item.id === client.id);
            return {
              ...client,
              pointsPerMessage: baseClient ? baseClient.pointsPerMessage : 20,
              pointsOnApproval: baseClient ? baseClient.pointsOnApproval : 80
            };
          })
        : baseState.clients;
      const normalizedRewardRedemptions = Array.isArray(parsed.rewardRedemptions)
        ? parsed.rewardRedemptions.map(entry => ({
            ...entry,
            id: WeldUtil.normalizeId(entry.id, "redemption") ?? WeldUtil.generateId("redemption")
          }))
        : baseState.rewardRedemptions.map(entry => ({
            ...entry,
            id: WeldUtil.normalizeId(entry.id, "redemption") ?? WeldUtil.generateId("redemption")
          }));
      const baseTeamMembers = Array.isArray(baseState.teamMembers) ? baseState.teamMembers : [];
      const normalizedTeamMembers = Array.isArray(parsed.teamMembers)
        ? (() => {
            const seenEmails = new Set();
            const normalized = [];
            parsed.teamMembers.forEach(member => {
              if (!member) return;
              const email =
                typeof member.email === "string" && member.email.trim().length > 0
                  ? member.email.trim()
                  : null;
              if (!email) return;
              const emailKey = email.toLowerCase();
              if (seenEmails.has(emailKey)) return;
              seenEmails.add(emailKey);
              const candidateId = WeldUtil.normalizeId(member.id, "member") ?? WeldUtil.generateId("member");
              const baseMatch =
                baseTeamMembers.find(baseMember => {
                  if (!baseMember) return false;
                  if (baseMember.id && baseMember.id === candidateId) return true;
                  if (typeof baseMember.email !== "string") return false;
                  return baseMember.email.trim().toLowerCase() === emailKey;
                }) || null;
              normalized.push({
                ...(baseMatch ? { ...baseMatch } : {}),
                ...member,
                id: candidateId,
                email
              });
            });
            baseTeamMembers.forEach(baseMember => {
              if (!baseMember || typeof baseMember.email !== "string") return;
              const emailKey = baseMember.email.trim().toLowerCase();
              if (!emailKey || seenEmails.has(emailKey)) return;
              seenEmails.add(emailKey);
              normalized.push({ ...baseMember });
            });
            return normalized;
          })()
        : baseTeamMembers.map(member => ({ ...member }));
      const teamMemberLookup = new Map();
      normalizedTeamMembers.forEach(member => {
        if (!member || typeof member.email !== "string") return;
        const key = member.email.trim().toLowerCase();
        if (!key || teamMemberLookup.has(key)) return;
        teamMemberLookup.set(key, member);
      });
      const normalizedRecognitions = Array.isArray(parsed.recognitions)
        ? (() => {
            const seenIds = new Set();
            return parsed.recognitions
              .map(entry => {
                if (!entry) return null;
                const id = WeldUtil.normalizeId(entry.id, "recognition") ?? WeldUtil.generateId("recognition");
                if (seenIds.has(id)) return null;
                seenIds.add(id);
                const senderEmail =
                  typeof entry.senderEmail === "string" && entry.senderEmail.trim().length > 0
                    ? entry.senderEmail.trim()
                    : null;
                const recipientEmail =
                  typeof entry.recipientEmail === "string" && entry.recipientEmail.trim().length > 0
                    ? entry.recipientEmail.trim()
                    : null;
                if (!senderEmail || !recipientEmail) return null;
                const senderMember = teamMemberLookup.get(senderEmail.toLowerCase()) || null;
                const recipientMember = teamMemberLookup.get(recipientEmail.toLowerCase()) || null;
                const rawPoints = Number(entry.points);
                const normalizedPoints =
                  Number.isFinite(rawPoints) && rawPoints > 0 ? Math.round(rawPoints) : 0;
                const focusLabel =
                  typeof entry.focus === "string" && entry.focus.trim().length > 0
                    ? entry.focus.trim()
                    : "Recognition spotlight";
                const channelLabel =
                  typeof entry.channel === "string" && entry.channel.trim().length > 0
                    ? entry.channel.trim()
                    : "Hub spotlight";
                const message =
                  typeof entry.message === "string" && entry.message.trim().length > 0
                    ? entry.message.trim()
                    : null;
                if (!message) return null;
                const createdAt =
                  typeof entry.createdAt === "string" && entry.createdAt.trim().length > 0
                    ? entry.createdAt.trim()
                    : new Date().toISOString();
                return {
                  id,
                  senderEmail,
                  senderName: entry.senderName || senderMember?.name || senderEmail,
                  senderTitle: entry.senderTitle || senderMember?.title || "",
                  recipientEmail,
                  recipientName: entry.recipientName || recipientMember?.name || recipientEmail,
                  recipientTitle: entry.recipientTitle || recipientMember?.title || "",
                  points: normalizedPoints,
                  focus: focusLabel,
                  message,
                  channel: channelLabel,
                  createdAt
                };
              })
              .filter(Boolean);
          })()
        : (baseState.recognitions || []).map(entry => ({ ...entry }));
      const normalizedLeaderboard = Array.isArray(parsed.departmentLeaderboard)
        ? (() => {
            const baseMap = new Map(
              (baseState.departmentLeaderboard || []).map(entry => [entry.id, entry])
            );
            const seen = new Set();
            const merged = parsed.departmentLeaderboard
              .map(entry => {
                if (!entry) return null;
                const normalizedId = WeldUtil.normalizeId(entry.id, "dept") ?? WeldUtil.generateId("dept");
                const baseEntry = baseMap.get(normalizedId) || {};
                seen.add(normalizedId);
                return {
                  ...baseEntry,
                  ...entry,
                  id: normalizedId,
                  published:
                    typeof entry.published === "boolean"
                      ? entry.published
                      : baseEntry.published ?? true
                };
              })
              .filter(Boolean);
            const additions = (baseState.departmentLeaderboard || [])
              .filter(entry => entry && !seen.has(entry.id))
              .map(entry => ({ ...entry }));
            return [...merged, ...additions];
          })()
        : (baseState.departmentLeaderboard || []).map(entry => ({ ...entry }));
      const normalizedPrograms = Array.isArray(parsed.engagementPrograms)
        ? (() => {
            const baseMap = new Map((baseState.engagementPrograms || []).map(item => [item.id, item]));
            const seen = new Set();
            const merged = parsed.engagementPrograms
              .map(item => {
                if (!item) return null;
                const normalizedId = WeldUtil.normalizeId(item.id, "program") ?? WeldUtil.generateId("program");
                const baseItem = baseMap.get(normalizedId) || {};
                seen.add(normalizedId);
                return {
                  ...baseItem,
                  ...item,
                  id: normalizedId,
                  published:
                    typeof item.published === "boolean"
                      ? item.published
                      : baseItem.published ?? true
                };
              })
              .filter(Boolean);
            const additions = (baseState.engagementPrograms || [])
              .filter(item => item && !seen.has(item.id))
              .map(item => ({ ...item }));
            return [...merged, ...additions];
          })()
        : (baseState.engagementPrograms || []).map(item => ({ ...item }));
      const normalizedLabs = (() => {
        const baseLabs = baseState.labs && typeof baseState.labs === "object" ? baseState.labs : {};
        const parsedLabs = parsed.labs && typeof parsed.labs === "object" ? parsed.labs : {};
        const baseFeatures = Array.isArray(baseLabs.features) ? baseLabs.features : [];
        const parsedFeatures = Array.isArray(parsedLabs.features) ? parsedLabs.features : [];
        const overrides = new Map();
        parsedFeatures.forEach(item => {
          if (!item) return;
          const key =
            typeof item.id === "string" && item.id.trim().length > 0
              ? item.id.trim()
              : typeof item.id === "number" && Number.isFinite(item.id)
              ? String(item.id)
              : null;
          if (!key) return;
          overrides.set(key, { ...item, id: key });
        });
        const normalizeClientIds = source => {
          if (!Array.isArray(source)) return [];
          const seen = new Set();
          const normalized = [];
          source.forEach(value => {
            let candidate = null;
            if (Number.isFinite(value)) {
              candidate = Number(value);
            } else if (typeof value === "string") {
              const trimmed = value.trim();
              if (!trimmed) return;
              const numeric = Number(trimmed);
              candidate = Number.isFinite(numeric) ? numeric : trimmed;
            }
            if (candidate === null) return;
            const key = typeof candidate === "number" ? candidate : String(candidate);
            if (seen.has(key)) return;
            seen.add(key);
            normalized.push(candidate);
          });
          return normalized;
        };
        const mergedFeatures = baseFeatures.map(feature => {
          const id =
            typeof feature.id === "string" && feature.id.trim().length > 0
              ? feature.id.trim()
              : typeof feature.id === "number" && Number.isFinite(feature.id)
              ? String(feature.id)
              : WeldUtil.generateId("lab");
          const override = overrides.get(id);
          if (override) {
            overrides.delete(id);
          }
          const enabledSource = override?.enabledClientIds ?? feature.enabledClientIds ?? [];
          return {
            ...feature,
            ...(override ? { ...override } : {}),
            id,
            enabledClientIds: normalizeClientIds(enabledSource)
          };
        });
        overrides.forEach((override, id) => {
          mergedFeatures.push({
            ...override,
            id,
            enabledClientIds: normalizeClientIds(override.enabledClientIds)
          });
        });
        const lastReviewAt =
          typeof parsedLabs.lastReviewAt === "string" && parsedLabs.lastReviewAt.trim().length > 0
            ? parsedLabs.lastReviewAt.trim()
            : typeof baseLabs.lastReviewAt === "string" && baseLabs.lastReviewAt.trim().length > 0
            ? baseLabs.lastReviewAt.trim()
            : null;
        return {
          ...baseLabs,
          ...parsedLabs,
          lastReviewAt,
          features: mergedFeatures
        };
      })();
      const baseReporterSettings = baseState.settings?.reporter || {
        reasonPrompt: DEFAULT_REPORTER_PROMPT,
        emergencyLabel: DEFAULT_EMERGENCY_LABEL,
        reasons: []
      };
      const storedReporterSettings =
        parsedSettings && typeof parsedSettings.reporter === "object"
          ? parsedSettings.reporter
          : null;
      const reporterReasonsSource = Array.isArray(storedReporterSettings?.reasons)
        ? storedReporterSettings.reasons
        : Array.isArray(legacyReportReasons)
        ? legacyReportReasons
        : baseReporterSettings.reasons;
      const seenReasonIds = new Set();
      const reasonIdMap = new Map();
      const normalizedReporterReasons = [];
      reporterReasonsSource.forEach((reason, index) => {
        if (!reason) return;
        const labelSource =
          typeof reason === "string"
            ? reason
            : typeof reason.label === "string"
            ? reason.label
            : typeof reason.description === "string"
            ? reason.description
            : null;
        if (!labelSource) return;
        const label = labelSource.trim();
        if (!label) return;
        const idCandidate =
          typeof reason === "string" ? null : reason.id ?? reason.key ?? reason.value ?? null;
        let normalizedId = WeldUtil.normalizeId(idCandidate, "reason");
        const legacyKey = normalizedId;
        if (!normalizedId) {
          normalizedId = `reason-${index + 1}`;
        }
        while (seenReasonIds.has(normalizedId)) {
          normalizedId = `${normalizedId}-${index + 1}`;
        }
        seenReasonIds.add(normalizedId);
        if (legacyKey) {
          reasonIdMap.set(legacyKey, normalizedId);
        }
        reasonIdMap.set(String(index + 1), normalizedId);
        normalizedReporterReasons.push({ id: normalizedId, label });
      });
      const reporterReasons =
        normalizedReporterReasons.length > 0
          ? normalizedReporterReasons
          : baseReporterSettings.reasons.map(item => ({ ...item }));
      const normalizedReporterSettings = {
        reasonPrompt:
          typeof storedReporterSettings?.reasonPrompt === "string" &&
          storedReporterSettings.reasonPrompt.trim().length > 0
            ? storedReporterSettings.reasonPrompt.trim()
            : baseReporterSettings.reasonPrompt,
        emergencyLabel:
          typeof storedReporterSettings?.emergencyLabel === "string" &&
          storedReporterSettings.emergencyLabel.trim().length > 0
            ? storedReporterSettings.emergencyLabel.trim()
            : baseReporterSettings.emergencyLabel,
        reasons: reporterReasons
      };
      if (
        typeof normalizedReporterSettings.emergencyLabel === "string" &&
        normalizedReporterSettings.emergencyLabel.trim().toLowerCase() ===
          PREVIOUS_EMERGENCY_LABEL.toLowerCase()
      ) {
        normalizedReporterSettings.emergencyLabel = DEFAULT_EMERGENCY_LABEL;
      }
      const normalizedSettings = {
        ...baseState.settings,
        ...(parsedSettings && typeof parsedSettings === "object" ? parsedSettings : {}),
        reporter: normalizedReporterSettings
      };
      const normalizedMessages = Array.isArray(parsed.messages)
        ? parsed.messages.map(message => {
            const clientId = message.clientId ?? baseState.customer.clientId;
            const clientConfig =
              normalizedClients.find(client => client.id === clientId) ??
              baseState.clients.find(client => client.id === clientId);
            const normalizedMessageId = WeldUtil.normalizeId(message.id, "message") ?? WeldUtil.generateId("message");
            const externalMessageId =
              typeof message.messageId === "string" && message.messageId.trim().length > 0
                ? message.messageId.trim()
                : WeldUtil.generateId("MSG").toUpperCase();
            const rawReasons = Array.isArray(message.reasons) ? message.reasons : [];
            const normalizedReasonIds = [];
            rawReasons.forEach((reasonId, index) => {
              const normalizedKey = WeldUtil.normalizeId(reasonId, "reason");
              let mappedId = null;
              if (normalizedKey && reasonIdMap.has(normalizedKey)) {
                mappedId = reasonIdMap.get(normalizedKey);
              } else if (reasonIdMap.has(String(index + 1))) {
                mappedId = reasonIdMap.get(String(index + 1));
              } else if (normalizedKey) {
                mappedId = normalizedKey;
              }
              if (mappedId && !normalizedReasonIds.includes(mappedId)) {
                normalizedReasonIds.push(mappedId);
              }
            });
            return {
              ...message,
              id: normalizedMessageId,
              messageId: externalMessageId,
              clientId,
              pointsOnMessage: message.pointsOnMessage ?? clientConfig?.pointsPerMessage ?? 20,
              pointsOnApproval: message.pointsOnApproval ?? clientConfig?.pointsOnApproval ?? 80,
              reasons: normalizedReasonIds
            };
          })
        : baseState.messages.map(message => {
            const normalizedMessageId = WeldUtil.normalizeId(message.id, "message") ?? WeldUtil.generateId("message");
            const externalMessageId =
              typeof message.messageId === "string" && message.messageId.trim().length > 0
                ? message.messageId.trim()
                : WeldUtil.generateId("MSG").toUpperCase();
            const baseReasons = Array.isArray(message.reasons) ? message.reasons : [];
            const normalizedReasonIds = [];
            baseReasons.forEach((reasonId, index) => {
              const normalizedKey = WeldUtil.normalizeId(reasonId, "reason");
              let mappedId = null;
              if (normalizedKey && reasonIdMap.has(normalizedKey)) {
                mappedId = reasonIdMap.get(normalizedKey);
              } else if (reasonIdMap.has(String(index + 1))) {
                mappedId = reasonIdMap.get(String(index + 1));
              } else if (normalizedKey) {
                mappedId = normalizedKey;
              }
              if (mappedId && !normalizedReasonIds.includes(mappedId)) {
                normalizedReasonIds.push(mappedId);
              }
            });
            return {
              ...message,
              id: normalizedMessageId,
              messageId: externalMessageId,
              reasons: normalizedReasonIds
            };
          });
      const mergedMeta = {
        ...baseState.meta,
        ...parsed.meta
      };
      mergedMeta.guidedTour = normalizeGuidedTourMeta(mergedMeta.guidedTour);
      mergedMeta.achievementFlags = normalizeAchievementFlags(
        mergedMeta.achievementFlags,
        FALLBACK_BASE.meta.achievementFlags
      );
      if (mergedMeta.lastMessageId === null || mergedMeta.lastMessageId === undefined) {
        mergedMeta.lastMessageId = null;
      } else if (typeof mergedMeta.lastMessageId === "string") {
        mergedMeta.lastMessageId = mergedMeta.lastMessageId.trim() || null;
      } else if (Number.isFinite(mergedMeta.lastMessageId)) {
        mergedMeta.lastMessageId = String(mergedMeta.lastMessageId);
      } else {
        mergedMeta.lastMessageId = null;
      }
      const normalizeFilter = value =>
        typeof value === "string" && value.trim().length > 0 ? value.trim().toLowerCase() : null;
      const normalizeStatusFilter = value => {
        const normalized = normalizeFilter(value);
        return normalized === "published" || normalized === "unpublished" ? normalized : null;
      };
      const normalizeAvailabilityFilter = value => {
        const normalized = normalizeFilter(value);
        return normalized === "unlocked" || normalized === "locked" ? normalized : null;
      };
      const normalizeReportFilter = value => {
        const normalized = normalizeFilter(value);
        return normalized === "other" ? "other" : null;
      };
      mergedMeta.reportFilter = normalizeReportFilter(mergedMeta.reportFilter);
      mergedMeta.rewardFilter = normalizeFilter(mergedMeta.rewardFilter);
      mergedMeta.rewardStatusFilter = normalizeStatusFilter(mergedMeta.rewardStatusFilter);
      mergedMeta.questFilter = normalizeFilter(mergedMeta.questFilter);
      mergedMeta.questStatusFilter = normalizeStatusFilter(mergedMeta.questStatusFilter);
      mergedMeta.badgeFilter = normalizeFilter(mergedMeta.badgeFilter);
      mergedMeta.badgeStatusFilter = normalizeStatusFilter(mergedMeta.badgeStatusFilter);
      mergedMeta.customerBadgeAvailabilityFilter = normalizeAvailabilityFilter(
        mergedMeta.customerBadgeAvailabilityFilter
      );
      if (Array.isArray(mergedMeta.lastBadgeIds)) {
        mergedMeta.lastBadgeIds = mergedMeta.lastBadgeIds
          .map(id => {
            if (typeof id === "string") {
              const trimmed = id.trim();
              return trimmed.length > 0 ? trimmed : null;
            }
            if (Number.isFinite(id)) {
              return String(id);
            }
            return null;
          })
          .filter(Boolean);
      } else {
        mergedMeta.lastBadgeIds = [];
      }
      mergedMeta.settingsOpen = false;
      const normalizedTheme =
        typeof mergedMeta.theme === "string" ? mergedMeta.theme.trim().toLowerCase() : "";
      mergedMeta.theme = THEME_OPTIONS.includes(normalizedTheme) ? normalizedTheme : "light";
      if (
        mergedMeta.settingsCategory &&
        !SETTINGS_CATEGORIES.some(
          category => category.id === mergedMeta.settingsCategory && !category.disabled
        )
      ) {
        const fallbackCategory =
          SETTINGS_CATEGORIES.find(category => !category.disabled) || SETTINGS_CATEGORIES[0] || null;
        mergedMeta.settingsCategory = fallbackCategory ? fallbackCategory.id : null;
      }
      const {
        customer: storedCustomer,
        phishingSimulation: storedPhishingSimulation,
        phishingDesigner: storedPhishingDesigner,
        reporterSandbox: storedReporterSandbox,
        ...restPassthrough
      } = passthrough;
      const normalizeBonusPoints = (candidate, baseBonus) => {
        const fallback = baseBonus && typeof baseBonus === "object" ? baseBonus : {};
        const baseBreakdown = Array.isArray(fallback.breakdown) ? fallback.breakdown : [];
        const cloneBaseBreakdown = () => baseBreakdown.map(item => ({ ...item }));
        if (!candidate || typeof candidate !== "object") {
          const weeklyCapFallback = Number(fallback.weeklyCap);
          const earnedFallback = Number(fallback.earnedThisWeek);
          return {
            weeklyCap: Math.max(0, Number.isFinite(weeklyCapFallback) ? weeklyCapFallback : 0),
            earnedThisWeek: Math.max(0, Number.isFinite(earnedFallback) ? earnedFallback : 0),
            breakdown: cloneBaseBreakdown()
          };
        }
        const weeklyCapRaw = Number(candidate.weeklyCap);
        const earnedRaw = Number(
          candidate.earnedThisWeek ?? candidate.earned ?? candidate.current ?? fallback.earnedThisWeek
        );
        const weeklyCap = Math.max(
          0,
          Number.isFinite(weeklyCapRaw) ? weeklyCapRaw : Number(fallback.weeklyCap) || 0
        );
        const earnedThisWeek = Math.max(
          0,
          Number.isFinite(earnedRaw) ? earnedRaw : Number(fallback.earnedThisWeek) || 0
        );
        const sourceBreakdown = Array.isArray(candidate.breakdown) ? candidate.breakdown : [];
        const baseMap = new Map(
          baseBreakdown
            .map(entry => {
              if (!entry || typeof entry !== "object") return null;
              const key =
                typeof entry.id === "string" && entry.id.trim().length > 0 ? entry.id.trim() : null;
              return key ? [key, entry] : null;
            })
            .filter(Boolean)
        );
        const normalizedBreakdown = sourceBreakdown
          .map((entry, index) => {
            if (!entry || typeof entry !== "object") return null;
            const rawId =
              typeof entry.id === "string" && entry.id.trim().length > 0 ? entry.id.trim() : null;
            const baseEntry = (rawId && baseMap.get(rawId)) || baseBreakdown[index] || null;
            const labelCandidate =
              typeof entry.label === "string" && entry.label.trim().length > 0
                ? entry.label.trim()
                : typeof baseEntry?.label === "string"
                ? baseEntry.label
                : "";
            if (!labelCandidate) return null;
            const normalizedId =
              rawId ||
              (typeof baseEntry?.id === "string" && baseEntry.id.trim().length > 0
                ? baseEntry.id.trim()
                : WeldUtil.generateId(`bonus-${index + 1}`));
            const descriptionCandidate =
              typeof entry.description === "string" && entry.description.trim().length > 0
                ? entry.description.trim()
                : typeof baseEntry?.description === "string"
                ? baseEntry.description
                : "";
            const pointsCandidate = Number(entry.points);
            const basePointsCandidate = Number(baseEntry?.points);
            const points = Number.isFinite(pointsCandidate)
              ? pointsCandidate
              : Number.isFinite(basePointsCandidate)
              ? basePointsCandidate
              : 0;
            const firstOfMonthDouble =
              entry.firstOfMonthDouble === true ||
              (baseEntry && baseEntry.firstOfMonthDouble === true);
            return {
              id: normalizedId,
              label: labelCandidate,
              description: descriptionCandidate,
              points,
              firstOfMonthDouble
            };
          })
          .filter(Boolean);
        const breakdown =
          normalizedBreakdown.length > 0 ? normalizedBreakdown : cloneBaseBreakdown();
        return {
          weeklyCap,
          earnedThisWeek,
          breakdown
        };
      };
      const normalizeQuestCompletions = (source, baseHistory) => {
        const baseList = Array.isArray(baseHistory) ? baseHistory : [];
        const cloneBaseList = () => baseList.map(entry => ({ ...entry }));
        if (!Array.isArray(source)) {
          return cloneBaseList();
        }
        const normalized = source
          .map((entry, index) => {
            if (!entry || typeof entry !== "object") return null;
            const questIdSource =
              entry.questId !== undefined && entry.questId !== null ? String(entry.questId) : null;
            const questId = questIdSource ? questIdSource.trim() : "";
            if (!questId) return null;
            const rawCompleted =
              typeof entry.completedAt === "string" ? entry.completedAt.trim() : "";
            let completedAt = null;
            if (rawCompleted) {
              const parsed = new Date(rawCompleted);
              if (!Number.isNaN(parsed.getTime())) {
                completedAt = parsed.toISOString();
              }
            }
            if (!completedAt) {
              const baseEntry = baseList[index];
              if (baseEntry && typeof baseEntry.completedAt === "string") {
                const parsed = new Date(baseEntry.completedAt);
                if (!Number.isNaN(parsed.getTime())) {
                  completedAt = parsed.toISOString();
                }
              }
            }
            if (!completedAt) {
              completedAt = new Date().toISOString();
            }
            const rawAwarded = Number(entry.pointsAwarded);
            const rawBase = Number(entry.basePoints);
            const pointsAwarded = Number.isFinite(rawAwarded)
              ? rawAwarded
              : Number.isFinite(rawBase)
              ? rawBase
              : 0;
            const basePoints = Number.isFinite(rawBase) ? rawBase : null;
            const doubled = entry.doubled === true;
            const idSource =
              typeof entry.id === "string" && entry.id.trim().length > 0
                ? entry.id.trim()
                : null;
            const id = idSource || WeldUtil.generateId(`quest-completion-${index + 1}`);
            return {
              id,
              questId,
              completedAt,
              pointsAwarded,
              basePoints,
              doubled
            };
          })
          .filter(Boolean);
        if (normalized.length === 0) {
          return cloneBaseList();
        }
        const maxEntries = 50;
        return normalized.slice(0, maxEntries);
      };
      const baseCustomer =
        baseState.customer && typeof baseState.customer === "object" ? baseState.customer : {};
      const normalizedCustomer = (() => {
        if (!storedCustomer || typeof storedCustomer !== "object") {
          const baseBonus = baseCustomer.bonusPoints || {};
          return {
            ...baseCustomer,
            bonusPoints: normalizeBonusPoints(null, baseBonus),
            questCompletions: normalizeQuestCompletions(null, baseCustomer.questCompletions)
          };
        }
        const baseBonus = baseCustomer.bonusPoints || {};
        return {
          ...baseCustomer,
          ...storedCustomer,
          bonusPoints: normalizeBonusPoints(storedCustomer.bonusPoints, baseBonus),
          questCompletions: normalizeQuestCompletions(
            storedCustomer.questCompletions,
            baseCustomer.questCompletions
          )
        };
      })();
      const normalizedPhishingSimulation = normalizePhishingSimulation(
        storedPhishingSimulation,
        baseState.phishingSimulation
      );
      const normalizedPhishingDesigner = normalizePhishingDesigner(
        storedPhishingDesigner,
        baseState.phishingDesigner
      );
      const normalizedReporterSandbox = normalizeReporterSandbox(
        storedReporterSandbox,
        baseState.reporterSandbox
      );
      return {
        ...baseState,
        ...restPassthrough,
        customer: normalizedCustomer,
        phishingSimulation: normalizedPhishingSimulation,
        meta: mergedMeta,
        rewards: normalizedRewards,
        quests: normalizedQuests,
        badges: normalizedBadges,
        messages: normalizedMessages,
        clients: normalizedClients,
        rewardRedemptions: normalizedRewardRedemptions,
        teamMembers: normalizedTeamMembers,
        recognitions: normalizedRecognitions,
        departmentLeaderboard: normalizedLeaderboard,
        engagementPrograms: normalizedPrograms,
        labs: normalizedLabs,
        settings: normalizedSettings,
        phishingDesigner: normalizedPhishingDesigner,
        reporterSandbox: normalizedReporterSandbox
      };
    } catch {
      return initialState();
    }
  }

  function saveState(nextState) {
    if (!storageAvailable()) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  }

  window.WeldState = { initialState, loadState, saveState, storageAvailable, STORAGE_KEY };
})();
