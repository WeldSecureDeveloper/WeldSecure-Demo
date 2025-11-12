(function () {
  const AppData = window.AppData || {};
  const DirectoryData = window.DirectoryData || {};
  const WeldState = window.WeldState;
  const WeldUtil = window.WeldUtil;
  const WeldServices = window.WeldServices || (window.WeldServices = {});

  const ROUTES = AppData.ROUTES || {};
  const THEME_OPTIONS = ["light", "dark"];
  const DEFAULT_REPORTER_PROMPT = AppData.DEFAULT_REPORTER_PROMPT || "";
  const DEFAULT_EMERGENCY_LABEL = AppData.DEFAULT_EMERGENCY_LABEL || "";
  const DEFAULT_REPORTER_REASONS = AppData.DEFAULT_REPORTER_REASONS || [];
  const DEFAULT_GUIDED_TOUR_META = {
    enabled: true,
    dismissedRoutes: {}
  };
  const PHISHING_BLUEPRINTS = AppData.phishingBlueprints || {};
  const DESIGNER_CHANNELS =
    Array.isArray(AppData.PHISHING_CHANNELS) && AppData.PHISHING_CHANNELS.length > 0
      ? AppData.PHISHING_CHANNELS.map(channel =>
          typeof channel === "string" ? channel.trim().toLowerCase() : channel
        ).filter(Boolean)
      : ["email", "sms", "teams", "slack", "qr"];
  const blueprintDefaultForm =
    PHISHING_BLUEPRINTS.defaultForm && typeof PHISHING_BLUEPRINTS.defaultForm === "object"
      ? PHISHING_BLUEPRINTS.defaultForm
      : {};
  const blueprintDefaultSender =
    blueprintDefaultForm.sender && typeof blueprintDefaultForm.sender === "object"
      ? blueprintDefaultForm.sender
      : {};
  const DEFAULT_DESIGNER_FORM = {
    id: null,
    templateId:
      typeof blueprintDefaultForm.templateId === "string" && blueprintDefaultForm.templateId.trim().length > 0
        ? blueprintDefaultForm.templateId.trim()
        : null,
    name: typeof blueprintDefaultForm.name === "string" ? blueprintDefaultForm.name : "",
    status: "draft",
    channel:
      typeof blueprintDefaultForm.channel === "string" && blueprintDefaultForm.channel.trim().length > 0
        ? blueprintDefaultForm.channel.trim().toLowerCase()
        : DESIGNER_CHANNELS[0] || "email",
    sender: {
      displayName:
        typeof blueprintDefaultSender.displayName === "string" && blueprintDefaultSender.displayName.trim().length > 0
          ? blueprintDefaultSender.displayName.trim()
          : "Security Desk",
      address:
        typeof blueprintDefaultSender.address === "string" && blueprintDefaultSender.address.trim().length > 0
          ? blueprintDefaultSender.address.trim()
          : "security@weldsecure.com"
    },
    subject: typeof blueprintDefaultForm.subject === "string" ? blueprintDefaultForm.subject : "",
    body: typeof blueprintDefaultForm.body === "string" ? blueprintDefaultForm.body : "",
    signalIds: Array.isArray(blueprintDefaultForm.signalIds)
      ? blueprintDefaultForm.signalIds.slice()
      : Array.isArray(blueprintDefaultForm.defaultSignals)
      ? blueprintDefaultForm.defaultSignals.slice()
      : [],
    targetIds: Array.isArray(blueprintDefaultForm.targetIds)
      ? blueprintDefaultForm.targetIds.slice()
      : Array.isArray(blueprintDefaultForm.suggestedTargets)
      ? blueprintDefaultForm.suggestedTargets.slice()
      : [],
    schedule:
      typeof blueprintDefaultForm.schedule === "string" && blueprintDefaultForm.schedule.trim().length > 0
        ? blueprintDefaultForm.schedule
        : null,
    ownerId:
      typeof blueprintDefaultForm.ownerId === "string" && blueprintDefaultForm.ownerId.trim().length > 0
        ? blueprintDefaultForm.ownerId.trim()
        : blueprintDefaultSender.address || "amelia-reed"
  };
  const blueprintTemplates = Array.isArray(PHISHING_BLUEPRINTS.templates) ? PHISHING_BLUEPRINTS.templates : [];
  const designerTokens = Array.isArray(PHISHING_BLUEPRINTS.tokens) ? PHISHING_BLUEPRINTS.tokens : [];
  const designerId = prefix =>
    WeldUtil && typeof WeldUtil.generateId === "function"
      ? WeldUtil.generateId(prefix || "phish-draft")
      : `${prefix || "phish-draft"}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6)
          .toString(36)
          .padStart(4, "0")}`;
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
  const normalizeDesignerChannel = (value, fallback = DESIGNER_CHANNELS[0] || "email") => {
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (DESIGNER_CHANNELS.includes(normalized)) {
        return normalized;
      }
    }
    return fallback;
  };
  const normalizeDesignerSchedule = value => {
    if (!value) return null;
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      return value.toISOString();
    }
    if (typeof value === "string" && value.trim().length > 0) {
      const parsed = new Date(value);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toISOString();
      }
    }
    return null;
  };
  const normalizeDesignerList = (list, fallback = []) => {
    if (!Array.isArray(list)) {
      return fallback.slice();
    }
    const seen = new Set();
    const normalized = [];
    list.forEach(item => {
      const key = normalizeDesignerKey(item);
      if (!key || seen.has(key)) return;
      seen.add(key);
      normalized.push(key);
    });
    return normalized;
  };
  const cloneDesignerForm = source => {
    const base = {
      ...DEFAULT_DESIGNER_FORM,
      sender: { ...DEFAULT_DESIGNER_FORM.sender },
      signalIds: Array.isArray(DEFAULT_DESIGNER_FORM.signalIds) ? DEFAULT_DESIGNER_FORM.signalIds.slice() : [],
      targetIds: Array.isArray(DEFAULT_DESIGNER_FORM.targetIds) ? DEFAULT_DESIGNER_FORM.targetIds.slice() : []
    };
    if (!source || typeof source !== "object") {
      return base;
    }
    const senderPatch =
      source.sender && typeof source.sender === "object"
        ? {
            displayName:
              typeof source.sender.displayName === "string" && source.sender.displayName.trim().length > 0
                ? source.sender.displayName.trim()
                : base.sender.displayName,
            address:
              typeof source.sender.address === "string" && source.sender.address.trim().length > 0
                ? source.sender.address.trim()
                : base.sender.address
          }
        : base.sender;
    return {
      ...base,
      id: normalizeDesignerKey(source.id),
      templateId: normalizeDesignerKey(source.templateId) || base.templateId,
      name: typeof source.name === "string" ? source.name : base.name,
      status: typeof source.status === "string" ? source.status : base.status,
      channel: normalizeDesignerChannel(source.channel, base.channel),
      sender: senderPatch,
      subject: typeof source.subject === "string" ? source.subject : base.subject,
      body: typeof source.body === "string" ? source.body : base.body,
      signalIds: normalizeDesignerList(source.signalIds, base.signalIds),
      targetIds: normalizeDesignerList(source.targetIds, base.targetIds),
      schedule: normalizeDesignerSchedule(source.schedule),
      ownerId:
        typeof source.ownerId === "string" && source.ownerId.trim().length > 0
          ? source.ownerId.trim()
          : base.ownerId
    };
  };
  const mergeDesignerForm = (current, patch) => {
    if (!patch || typeof patch !== "object") {
      return cloneDesignerForm(current);
    }
    const merged = {
      ...current,
      ...patch,
      sender: {
        ...(current && current.sender ? current.sender : DEFAULT_DESIGNER_FORM.sender),
        ...(patch.sender && typeof patch.sender === "object" ? patch.sender : {})
      }
    };
    if (patch.signalIds !== undefined) {
      merged.signalIds = Array.isArray(patch.signalIds) ? patch.signalIds.slice() : [];
    }
    if (patch.targetIds !== undefined) {
      merged.targetIds = Array.isArray(patch.targetIds) ? patch.targetIds.slice() : [];
    }
    return cloneDesignerForm(merged);
  };
  const ensureDesignerState = state => {
    if (!state.phishingDesigner || typeof state.phishingDesigner !== "object") {
      state.phishingDesigner = {
        activeTemplateId: null,
        drafts: [],
        form: cloneDesignerForm(DEFAULT_DESIGNER_FORM),
        validation: {}
      };
      return state.phishingDesigner;
    }
    const designer = state.phishingDesigner;
    if (!Array.isArray(designer.drafts)) {
      designer.drafts = [];
    }
    designer.form = cloneDesignerForm(designer.form);
    if (!designer.validation || typeof designer.validation !== "object") {
      designer.validation = {};
    }
    if (designer.activeTemplateId) {
      designer.activeTemplateId = normalizeDesignerKey(designer.activeTemplateId);
    }
    return designer;
  };

  const normalizeSandboxMessageId = value => {
    if (typeof value === "string") {
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : null;
    }
    if (Number.isFinite(value)) {
      return String(value);
    }
    return null;
  };

  const SANDBOX_TIMESTAMP_META_KEY = "__timestampOffsetMs";

  const normalizeSandboxSignalId = value => {
    if (typeof value === "string") {
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed.toLowerCase() : null;
    }
    return null;
  };

  const resolveSandboxCreatedAt = (sourceValue, metadata) => {
    const now = Date.now();
    const storedOffset =
      metadata && typeof metadata[SANDBOX_TIMESTAMP_META_KEY] === "number"
        ? metadata[SANDBOX_TIMESTAMP_META_KEY]
        : null;
    const parsedTime =
      typeof sourceValue === "string" && sourceValue.trim().length > 0
        ? new Date(sourceValue).getTime()
        : NaN;
    let offset = Number.isFinite(storedOffset)
      ? storedOffset
      : Number.isFinite(parsedTime)
      ? now - parsedTime
      : 0;
    if (!Number.isFinite(offset) || offset < 0) {
      offset = 0;
    } else {
      offset = Math.round(offset);
    }
    if (metadata) {
      metadata[SANDBOX_TIMESTAMP_META_KEY] = offset;
    }
    return new Date(now - offset).toISOString();
  };

  const cloneSandboxAttachments = list => {
    if (!Array.isArray(list)) return [];
    return list
      .map(item => {
        if (!item || typeof item !== "object") return null;
        const id = normalizeSandboxMessageId(item.id) || getGenerateId("sandbox-file");
        const name =
          typeof item.name === "string" && item.name.trim().length > 0 ? item.name.trim() : "attachment.bin";
        const type =
          typeof item.type === "string" && item.type.trim().length > 0 ? item.type.trim().toLowerCase() : "file";
        return { id, name, type };
      })
      .filter(Boolean);
  };

  const normalizeSandboxMessage = (source, fallbackId) => {
    if (!source || typeof source !== "object") return null;
    const id = normalizeSandboxMessageId(source.id) || fallbackId || getGenerateId("sandbox-msg");
    const metadata =
      source.metadata && typeof source.metadata === "object" ? { ...source.metadata } : {};
    const createdAt = resolveSandboxCreatedAt(source.createdAt, metadata);
    const channel =
      typeof source.channel === "string" && source.channel.trim().length > 0
        ? source.channel.trim().toLowerCase()
        : "email";
    const senderInput = source.sender && typeof source.sender === "object" ? source.sender : {};
    const senderDisplay =
      typeof senderInput.displayName === "string" && senderInput.displayName.trim().length > 0
        ? senderInput.displayName.trim()
        : "Security Desk";
    const senderAddress =
      typeof senderInput.address === "string" && senderInput.address.trim().length > 0
        ? senderInput.address.trim()
        : "security@weldsecure.com";
    const signalIds = Array.isArray(source.signalIds)
      ? source.signalIds.map(normalizeSandboxSignalId).filter(Boolean)
      : [];
    Object.keys(metadata).forEach(key => {
      if (metadata[key] === undefined) {
        delete metadata[key];
      }
    });
    return {
      id,
      campaignId: normalizeSandboxMessageId(source.campaignId),
      channel,
      createdAt,
      sender: {
        displayName: senderDisplay,
        address: senderAddress
      },
      subject: typeof source.subject === "string" ? source.subject : "Simulation message",
      previewText:
        typeof source.previewText === "string" && source.previewText.trim().length > 0
          ? source.previewText.trim()
          : "",
      body: typeof source.body === "string" ? source.body : "",
      signalIds,
      attachments: cloneSandboxAttachments(source.attachments),
      metadata
    };
  };

  const cloneSandboxMessagesForState = (list, prefix = "sandbox-msg") => {
    if (!Array.isArray(list)) return [];
    const seen = new Set();
    return list
      .map((entry, index) => normalizeSandboxMessage(entry, `${prefix}-${index + 1}`))
      .filter(entry => {
        if (!entry || seen.has(entry.id)) return false;
        seen.add(entry.id);
        return true;
      });
  };

  const normalizeSandboxSubmissionEntry = (entry, index = 0) => {
    if (!entry || typeof entry !== "object") return null;
    const messageId = normalizeSandboxMessageId(entry.messageId);
    if (!messageId) return null;
    const normalizeList = list =>
      Array.isArray(list) ? list.map(normalizeSandboxSignalId).filter(Boolean) : [];
    const submittedAt =
      typeof entry.submittedAt === "string" && entry.submittedAt.trim().length > 0
        ? entry.submittedAt.trim()
        : new Date(Date.now() - index * 500).toISOString();
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

  const ensureReporterSandboxState = state => {
    if (!state) return null;
    const sandboxSeed = ensureSimData().sandboxMessages;
    if (!state.reporterSandbox || typeof state.reporterSandbox !== "object") {
      state.reporterSandbox = {
        messages: cloneSandboxMessagesForState(sandboxSeed, "sandbox-state"),
        activeMessageId: null,
        hintsVisible: false,
        findings: {},
        submissions: [],
        selectedUserId: null,
        layout: {
          compactRows: false,
          showSnippets: true,
          highlightReading: true,
          showAddin: false
        }
      };
    } else {
      const sandboxMessages = Array.isArray(state.reporterSandbox.messages)
        ? state.reporterSandbox.messages
        : sandboxSeed;
      state.reporterSandbox.messages = cloneSandboxMessagesForState(sandboxMessages, "sandbox-state");
      if (!state.reporterSandbox.findings || typeof state.reporterSandbox.findings !== "object") {
        state.reporterSandbox.findings = {};
      }
      if (!Array.isArray(state.reporterSandbox.submissions)) {
        state.reporterSandbox.submissions = [];
      } else {
        state.reporterSandbox.submissions = state.reporterSandbox.submissions
          .map((entry, index) => normalizeSandboxSubmissionEntry(entry, index))
          .filter(Boolean)
          .slice(0, 24);
      }
    }
    if (
      !state.reporterSandbox.activeMessageId ||
      !state.reporterSandbox.messages.some(msg => msg.id === state.reporterSandbox.activeMessageId)
    ) {
      state.reporterSandbox.activeMessageId = state.reporterSandbox.messages[0]?.id || null;
    }
    if (typeof state.reporterSandbox.selectedUserId !== "string") {
      state.reporterSandbox.selectedUserId = state.reporterSandbox.selectedUserId && String(state.reporterSandbox.selectedUserId);
    } else {
      state.reporterSandbox.selectedUserId = state.reporterSandbox.selectedUserId.trim() || null;
    }
    if (!state.reporterSandbox.layout || typeof state.reporterSandbox.layout !== "object") {
      state.reporterSandbox.layout = {
        compactRows: false,
        showSnippets: true,
        highlightReading: true,
        showAddin: false
      };
    } else {
      state.reporterSandbox.layout.compactRows = state.reporterSandbox.layout.compactRows === true;
      state.reporterSandbox.layout.showSnippets = state.reporterSandbox.layout.showSnippets !== false;
      state.reporterSandbox.layout.highlightReading = state.reporterSandbox.layout.highlightReading !== false;
    }
    state.reporterSandbox.layout.showAddin = state.reporterSandbox.layout.showAddin === true;
    return state.reporterSandbox;
  };

  const findSandboxMessage = (sandboxState, messageId) => {
    if (!sandboxState || !Array.isArray(sandboxState.messages)) return null;
    const normalizedId = normalizeSandboxMessageId(messageId);
    if (!normalizedId) return null;
    return sandboxState.messages.find(message => message && message.id === normalizedId) || null;
  };

  const upsertSandboxMessage = (sandboxState, message) => {
    if (!sandboxState || !message) return;
    if (!Array.isArray(sandboxState.messages)) {
      sandboxState.messages = [];
    }
    const index = sandboxState.messages.findIndex(entry => entry && entry.id === message.id);
    if (index === -1) {
      sandboxState.messages.unshift(message);
    } else {
      sandboxState.messages[index] = message;
    }
    sandboxState.messages = cloneSandboxMessagesForState(sandboxState.messages, "sandbox-state");
    if (
      !sandboxState.activeMessageId ||
      !sandboxState.messages.some(entry => entry.id === sandboxState.activeMessageId)
    ) {
      sandboxState.activeMessageId = sandboxState.messages[0]?.id || null;
    }
  };
  const validateDesignerForm = form => {
    const errors = {};
    if (!form.name || form.name.trim().length === 0) {
      errors.name = "Name is required.";
    }
    if (!form.subject || form.subject.trim().length === 0) {
      errors.subject = "Subject is required.";
    }
    if (!form.body || form.body.trim().length === 0) {
      errors.body = "Body copy cannot be empty.";
    }
    if (!form.sender || !form.sender.displayName || form.sender.displayName.trim().length === 0) {
      errors.senderDisplayName = "Sender display name required.";
    }
    if (!form.sender || !form.sender.address || form.sender.address.trim().length === 0) {
      errors.senderAddress = "Sender address required.";
    }
    if (!form.channel) {
      errors.channel = "Select a channel.";
    }
    if (!Array.isArray(form.signalIds) || form.signalIds.length === 0) {
      errors.signalIds = "Select at least one signal.";
    }
    if (!Array.isArray(form.targetIds) || form.targetIds.length === 0) {
      errors.targetIds = "Choose at least one target.";
    }
    return errors;
  };
  const findDraftById = (designerState, draftId) => {
    if (
      !designerState ||
      !Array.isArray(designerState.drafts) ||
      !draftId ||
      typeof draftId !== "string"
    ) {
      return null;
    }
    return (
      designerState.drafts.find(draft => draft && draft.id === draftId) || null
    );
  };
  const blueprintTemplateById = templateId =>
    blueprintTemplates.find(template => template && template.id === templateId) || null;
  const ensureSimData = () => {
    if (!AppData.phishingSimulations || typeof AppData.phishingSimulations !== "object") {
      AppData.phishingSimulations = {
        campaigns: [],
        templates: [],
        historyByDepartment: {},
        signalsByCampaign: {},
        sandboxMessages: []
      };
    }
    const simData = AppData.phishingSimulations;
    if (!Array.isArray(simData.campaigns)) {
      simData.campaigns = [];
    }
    if (!Array.isArray(simData.templates)) {
      simData.templates = [];
    }
    if (!simData.historyByDepartment || typeof simData.historyByDepartment !== "object") {
      simData.historyByDepartment = {};
    }
    if (!simData.signalsByCampaign || typeof simData.signalsByCampaign !== "object") {
      simData.signalsByCampaign = {};
    }
    if (!Array.isArray(simData.sandboxMessages)) {
      simData.sandboxMessages = [];
    }
    return simData;
  };

  const markSandboxMessageRead = (sandboxState, target) => {
    if (!sandboxState) return false;
    const message =
      target && typeof target === "object" && target.id ? target : findSandboxMessage(sandboxState, target);
    if (!message) return false;
    if (!message.metadata || typeof message.metadata !== "object") {
      message.metadata = {};
    }
    if (message.metadata.unread === false) {
      return false;
    }
    message.metadata.unread = false;
    const simData = ensureSimData();
    if (Array.isArray(simData.sandboxMessages)) {
      const seed = simData.sandboxMessages.find(entry => entry && entry.id === message.id);
      if (seed) {
        if (!seed.metadata || typeof seed.metadata !== "object") {
          seed.metadata = {};
        }
        seed.metadata.unread = false;
      }
    }
    return true;
  };

  function resolveState(providedState) {
    if (providedState && typeof providedState === "object") return providedState;
    if (window.state && typeof window.state === "object") return window.state;
    if (window.Weld && typeof window.Weld.state === "object") return window.Weld.state;
    return null;
  }

  function syncGlobalState(state) {
    if (!state || typeof state !== "object") return state;
    window.state = state;
    if (window.Weld) {
      window.Weld.state = state;
    }
    return state;
  }

  function saveState(state) {
    if (WeldState && typeof WeldState.saveState === "function") {
      WeldState.saveState(state);
    }
  }

  function renderShell() {
    if (typeof window.renderApp === "function") {
      window.renderApp();
    } else if (window.Weld && typeof window.Weld.render === "function" && window.Weld.autorun) {
      window.Weld.render();
    }
  }

  function normalizeTheme(theme) {
    if (typeof theme === "string") {
      const normalized = theme.trim().toLowerCase();
      if (THEME_OPTIONS.includes(normalized)) {
        return normalized;
      }
    }
    return "light";
  }

  function applyThemeIfAvailable(theme) {
    if (typeof window.applyTheme === "function") {
      window.applyTheme(theme);
    }
  }

  function ensureGuidedTourMeta(state) {
    if (!state.meta) {
      state.meta = {};
    }
    if (!state.meta.guidedTour || typeof state.meta.guidedTour !== "object") {
      state.meta.guidedTour = { ...DEFAULT_GUIDED_TOUR_META };
    }
    state.meta.guidedTour.enabled = state.meta.guidedTour.enabled !== false;
    if (
      !state.meta.guidedTour.dismissedRoutes ||
      typeof state.meta.guidedTour.dismissedRoutes !== "object"
    ) {
      state.meta.guidedTour.dismissedRoutes = {};
    }
    return state.meta.guidedTour;
  }

  WeldServices.navigate = function navigate(route, providedState) {
    const state = resolveState(providedState);
    if (!state || !state.meta) return;
    const nextRoute = ROUTES[route] ? route : "landing";
    state.meta.route = nextRoute;
    if (nextRoute === "landing") {
      state.meta.role = null;
    }
    if (nextRoute !== "customer-reports") {
      state.meta.reportFilter = null;
    }
    syncGlobalState(state);
    saveState(state);
    renderShell();
  };

  WeldServices.setRole = function setRole(role, route, providedState) {
    const state = resolveState(providedState);
    if (!state || !state.meta) return;
    state.meta.role = role || null;
    if (route) {
      if (route !== "customer-reports") {
        state.meta.reportFilter = null;
      }
      state.meta.route = ROUTES[route] ? route : "landing";
    }
    syncGlobalState(state);
    saveState(state);
    renderShell();
  };

  WeldServices.resetDemo = function resetDemo(providedState) {
    const state = resolveState(providedState);
    if (!state) return;
    if (!WeldUtil || typeof WeldUtil.clone !== "function") return;
    const defaultState =
      typeof WeldState.initialState === "function" ? WeldState.initialState() : {};
    state.meta = WeldUtil.clone(defaultState.meta);
    state.customer = WeldUtil.clone(defaultState.customer);
    state.rewards = WeldUtil.clone(defaultState.rewards);
    state.quests = WeldUtil.clone(defaultState.quests);
    state.badges = WeldUtil.clone(defaultState.badges);
    state.rewardRedemptions = WeldUtil.clone(defaultState.rewardRedemptions);
    state.settings = WeldUtil.clone(defaultState.settings);
    state.messages = WeldUtil.clone(defaultState.messages);
    state.clients = WeldUtil.clone(defaultState.clients);
    state.departmentLeaderboard = WeldUtil.clone(defaultState.departmentLeaderboard);
    state.engagementPrograms = WeldUtil.clone(defaultState.engagementPrograms);
    state.labs = WeldUtil.clone(defaultState.labs);
    state.phishingSimulation = WeldUtil.clone(defaultState.phishingSimulation);

    if (window.location && window.location.hash) {
      if (window.history && typeof window.history.replaceState === "function") {
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      } else {
        window.location.hash = "";
      }
    }

    syncGlobalState(state);
    applyThemeIfAvailable(state.meta && state.meta.theme);
    saveState(state);
    renderShell();
  };

  WeldServices.persist = function persist(providedState) {
    const state = resolveState(providedState);
    if (!state) return;
    syncGlobalState(state);
    saveState(state);
  };

  WeldServices.setTheme = function setTheme(theme, providedState) {
    const state = resolveState(providedState);
    if (!state || !state.meta) return;
    const nextTheme = normalizeTheme(theme);
    state.meta.theme = nextTheme;
    syncGlobalState(state);
    saveState(state);
    applyThemeIfAvailable(nextTheme);
    renderShell();
  };

  WeldServices.toggleTheme = function toggleTheme(providedState) {
    const state = resolveState(providedState);
    if (!state || !state.meta) return;
    const current = normalizeTheme(state.meta.theme);
    const next = current === "dark" ? "light" : "dark";
    WeldServices.setTheme(next, state);
  };

  WeldServices.setGuidedTourEnabled = function setGuidedTourEnabled(enabled, providedState) {
    const state = resolveState(providedState);
    if (!state) return;
    const guidedMeta = ensureGuidedTourMeta(state);
    const next = enabled !== false;
    if (guidedMeta.enabled === next) return;
    guidedMeta.enabled = next;
    syncGlobalState(state);
    saveState(state);
    renderShell();
  };

  WeldServices.toggleGuidedTour = function toggleGuidedTour(providedState) {
    const state = resolveState(providedState);
    if (!state) return;
    const guidedMeta = ensureGuidedTourMeta(state);
    WeldServices.setGuidedTourEnabled(!guidedMeta.enabled, state);
  };

  WeldServices.completeQuest = function completeQuest(questId, options = {}, providedState) {
    const state = resolveState(providedState);
    if (!state || !state.customer) {
      return { success: false, reason: "State missing." };
    }
    if (typeof window.questById !== "function") {
      return { success: false, reason: "Quest lookup unavailable." };
    }
    const quest = window.questById(questId);
    if (!quest) {
      return { success: false, reason: "Quest not found." };
    }

    const providedDate = options.completedAt ? new Date(options.completedAt) : new Date();
    const completedDate = Number.isNaN(providedDate.getTime()) ? new Date() : providedDate;
    const completedAt = completedDate.toISOString();
    if (!Array.isArray(state.customer.questCompletions)) {
      state.customer.questCompletions = [];
    }
    const hasCompletionThisMonth = state.customer.questCompletions.some(entry => {
      if (!entry || typeof entry.completedAt !== "string") return false;
      const parsed = new Date(entry.completedAt);
      if (Number.isNaN(parsed.getTime())) return false;
      return (
        parsed.getFullYear() === completedDate.getFullYear() &&
        parsed.getMonth() === completedDate.getMonth()
      );
    });
    const basePointsRaw = Number(quest.points);
    const basePoints = Number.isFinite(basePointsRaw) ? basePointsRaw : 0;
    const doubled = !hasCompletionThisMonth && basePoints > 0;
    const multiplier = doubled ? 2 : 1;
    const awardedPoints = basePoints * multiplier;
    if (awardedPoints > 0) {
      state.customer.currentPoints += awardedPoints;
    }
    state.customer.questCompletions.unshift({
      id:
        WeldUtil && typeof WeldUtil.generateId === "function"
          ? WeldUtil.generateId("quest-completion")
          : `quest-completion-${Date.now()}`,
      questId: quest.id,
      completedAt,
      pointsAwarded: awardedPoints,
      basePoints,
      doubled
    });
    if (state.customer.questCompletions.length > 50) {
      state.customer.questCompletions.length = 50;
    }
    const bonus = state.customer.bonusPoints;
    if (bonus && typeof bonus === "object") {
      const currentEarned = Number(bonus.earnedThisWeek);
      const updatedEarned = (Number.isFinite(currentEarned) ? currentEarned : 0) + awardedPoints;
      bonus.earnedThisWeek = Math.max(0, updatedEarned);
      if (!Array.isArray(bonus.breakdown)) {
        bonus.breakdown = [];
      }
      let questSource = bonus.breakdown.find(entry => {
        if (!entry || entry.id === undefined || entry.id === null) return false;
        return String(entry.id).trim().toLowerCase() === "quests";
      });
      if (!questSource) {
        questSource = {
          id: "quests",
          label: "Quests completed",
          description: "Quest completions recorded this week.",
          points: 0
        };
        bonus.breakdown.push(questSource);
      }
      const existingPoints = Number(questSource.points);
      questSource.points = (Number.isFinite(existingPoints) ? existingPoints : 0) + awardedPoints;
      if (doubled) {
        questSource.firstOfMonthDouble = true;
        if (
          typeof questSource.description !== "string" ||
          questSource.description.trim().length === 0
        ) {
          questSource.description = "First quest completion this month triggered double points.";
        }
      }
    }

    syncGlobalState(state);
    saveState(state);
    renderShell();

    return { success: true, awardedPoints, doubled, completedAt };
  };

  WeldServices.redeemReward = function redeemReward(rewardId, providedState) {
    const state = resolveState(providedState);
    if (!state || !state.customer) {
      return { success: false, reason: "State missing." };
    }
    if (typeof window.rewardById !== "function") {
      return { success: false, reason: "Reward lookup unavailable." };
    }
    const reward = window.rewardById(rewardId);
    if (!reward) return { success: false, reason: "Reward not found." };
    if (!reward.published) {
      return { success: false, reason: "This reward is not currently published to hubs." };
    }
    const isUnlimited = reward.unlimited === true;
    if (state.customer.currentPoints < reward.pointsCost) {
      return { success: false, reason: "Not enough points to redeem this reward yet." };
    }
    if (!isUnlimited && reward.remaining <= 0) {
      return { success: false, reason: "This reward is temporarily out of stock." };
    }

    state.customer.currentPoints -= reward.pointsCost;
    state.customer.redeemedPoints += reward.pointsCost;
    if (!isUnlimited) {
      reward.remaining = Math.max(reward.remaining - 1, 0);
    }

    if (!Array.isArray(state.rewardRedemptions)) {
      state.rewardRedemptions = [];
    }
    const redemption = {
      id:
        WeldUtil && typeof WeldUtil.generateId === "function"
          ? WeldUtil.generateId("redemption")
          : `redemption-${Date.now()}`,
      rewardId: reward.id,
      redeemedAt: new Date().toISOString(),
      status: "pending"
    };
    state.rewardRedemptions.unshift(redemption);

    syncGlobalState(state);
    saveState(state);
    renderShell();

    return { success: true, redemption };
  };

  WeldServices.openSettings = function openSettings(category, providedState) {
    const state = resolveState(providedState);
    if (!state || !state.meta) return;
    if (typeof category === "string" && category.trim().length > 0) {
      state.meta.settingsCategory = category.trim();
    }
    if (state.meta.settingsOpen) return;
    state.meta.settingsOpen = true;
    syncGlobalState(state);
    saveState(state);
    renderShell();
  };

  WeldServices.closeSettings = function closeSettings(providedState) {
    const state = resolveState(providedState);
    if (!state || !state.meta) return;
    if (!state.meta.settingsOpen) return;
    state.meta.settingsOpen = false;
    syncGlobalState(state);
    saveState(state);
    renderShell();
  };

  function normalizeLabFeatureIdSafe(value) {
    if (WeldUtil && typeof WeldUtil.normalizeLabFeatureId === "function") {
      return WeldUtil.normalizeLabFeatureId(value);
    }
    if (Number.isFinite(value)) return String(value);
    if (typeof value === "string") {
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : null;
    }
    return null;
  }

  function normalizeLabClientIdSafe(value) {
    if (WeldUtil && typeof WeldUtil.normalizeLabClientId === "function") {
      return WeldUtil.normalizeLabClientId(value);
    }
    if (Number.isFinite(value)) return Number(value);
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) return null;
      const numeric = Number(trimmed);
      return Number.isFinite(numeric) ? numeric : trimmed;
    }
    return null;
  }

  function labClientKeySafe(value) {
    if (WeldUtil && typeof WeldUtil.labClientKey === "function") {
      return WeldUtil.labClientKey(value);
    }
    if (Number.isFinite(value)) return String(Number(value));
    if (typeof value === "string") return value.trim();
    return "";
  }

  function findLabFeature(state, featureId) {
    if (!state?.labs || !Array.isArray(state.labs.features)) return null;
    const normalizedFeatureId = normalizeLabFeatureIdSafe(featureId);
    if (!normalizedFeatureId) return null;
    return state.labs.features.find(item => normalizeLabFeatureIdSafe(item?.id) === normalizedFeatureId) || null;
  }

  WeldServices.setLabFeatureAccess = function setLabFeatureAccess(featureId, clientIdValue, enabled, providedState) {
    const state = resolveState(providedState);
    if (!state) return;
    const feature = findLabFeature(state, featureId);
    if (!feature) return;
    const normalizedClientId = normalizeLabClientIdSafe(clientIdValue);
    if (normalizedClientId === null || normalizedClientId === undefined) return;
    const shouldEnable = Boolean(enabled);
    if (!Array.isArray(feature.enabledClientIds)) {
      feature.enabledClientIds = [];
    }
    const targetKey = labClientKeySafe(normalizedClientId);
    if (!targetKey) return;
    const existingIndex = feature.enabledClientIds.findIndex(id => labClientKeySafe(id) === targetKey);
    const alreadyEnabled = existingIndex !== -1;
    if (shouldEnable && alreadyEnabled) return;
    if (!shouldEnable && !alreadyEnabled) return;
    if (shouldEnable) {
      feature.enabledClientIds.push(normalizedClientId);
    } else {
      feature.enabledClientIds.splice(existingIndex, 1);
    }
    feature.enabledClientIds = feature.enabledClientIds
      .map(id => {
        if (Number.isFinite(id)) return Number(id);
        if (typeof id === "string") return id.trim();
        return id;
      })
      .filter((value, index, array) => {
        const key = labClientKeySafe(value);
        if (!key) return false;
        return array.findIndex(candidate => labClientKeySafe(candidate) === key) === index;
      });
    syncGlobalState(state);
    saveState(state);
    renderShell();
  };

  WeldServices.setLabFeatureAccessForAll = function setLabFeatureAccessForAll(featureId, enabled, providedState) {
    const state = resolveState(providedState);
    if (!state) return;
    const feature = findLabFeature(state, featureId);
    if (!feature) return;
    if (!Array.isArray(feature.enabledClientIds)) {
      feature.enabledClientIds = [];
    }
    const shouldEnable = Boolean(enabled);
    if (!shouldEnable) {
      if (feature.enabledClientIds.length === 0) return;
      feature.enabledClientIds = [];
      syncGlobalState(state);
      saveState(state);
      renderShell();
      return;
    }
    const clients = Array.isArray(state.clients) ? state.clients : [];
    const targetIds = clients
      .map(client => normalizeLabClientIdSafe(client?.id))
      .filter(value => labClientKeySafe(value));
    const existingKeys = new Set(feature.enabledClientIds.map(labClientKeySafe).filter(Boolean));
    const targetKeys = new Set(targetIds.map(labClientKeySafe).filter(Boolean));
    let changed = existingKeys.size !== targetKeys.size;
    if (!changed) {
      existingKeys.forEach(key => {
        if (!targetKeys.has(key)) {
          changed = true;
        }
      });
    }
    if (!changed) return;
    feature.enabledClientIds = targetIds;
    syncGlobalState(state);
    saveState(state);
    renderShell();
  };

  WeldServices.setPhishingDesignerForm = function setPhishingDesignerForm(patch, providedState) {
    const state = resolveState(providedState);
    if (!state) return { success: false, reason: "State missing." };
    const designer = ensureDesignerState(state);
    designer.form = mergeDesignerForm(designer.form, patch);
    designer.activeTemplateId = designer.form.id || null;
    designer.validation = validateDesignerForm(designer.form);
    syncGlobalState(state);
    saveState(state);
    renderShell();
    return { success: true, form: designer.form, validation: designer.validation };
  };

  WeldServices.createPhishingDraft = function createPhishingDraft(payload = {}, providedState) {
    const state = resolveState(providedState);
    if (!state) return { success: false, reason: "State missing." };
    const designer = ensureDesignerState(state);
    const mergedForm = mergeDesignerForm(designer.form, payload);
    const validation = validateDesignerForm(mergedForm);
    if (Object.keys(validation).length > 0) {
      designer.validation = validation;
      designer.form = mergedForm;
      syncGlobalState(state);
      saveState(state);
      renderShell();
      return { success: false, validation };
    }
    const nowIso = new Date().toISOString();
    const draft = {
      ...mergedForm,
      id: mergedForm.id || designerId("phish-draft"),
      status: "draft",
      createdAt: nowIso,
      updatedAt: nowIso,
      lastPublishedAt: null
    };
    designer.drafts = [draft, ...designer.drafts.filter(existing => existing && existing.id !== draft.id)].slice(0, 12);
    designer.form = cloneDesignerForm(draft);
    designer.validation = {};
    designer.activeTemplateId = draft.id;
    syncGlobalState(state);
    saveState(state);
    renderShell();
    return { success: true, draft };
  };

  WeldServices.updatePhishingDraft = function updatePhishingDraft(draftId, patch = {}, providedState) {
    const state = resolveState(providedState);
    if (!state) return { success: false, reason: "State missing." };
    const designer = ensureDesignerState(state);
    const normalizedId = normalizeDesignerKey(draftId) || designer.form.id;
    const sourceDraft = normalizedId ? findDraftById(designer, normalizedId) : null;
    const baseForm = sourceDraft || designer.form;
    const mergedForm = mergeDesignerForm(baseForm, patch);
    designer.form = mergedForm;
    if (normalizedId) {
      designer.activeTemplateId = normalizedId;
      const targetIndex = designer.drafts.findIndex(draft => draft && draft.id === normalizedId);
      if (targetIndex !== -1) {
        designer.drafts[targetIndex] = {
          ...designer.drafts[targetIndex],
          ...mergedForm,
          id: normalizedId,
          updatedAt: new Date().toISOString()
        };
      }
    }
    designer.validation = validateDesignerForm(mergedForm);
    syncGlobalState(state);
    saveState(state);
    renderShell();
    return { success: true, form: designer.form, validation: designer.validation };
  };

  WeldServices.loadPhishingDraft = function loadPhishingDraft(draftId, providedState) {
    const state = resolveState(providedState);
    if (!state) return { success: false, reason: "State missing." };
    const designer = ensureDesignerState(state);
    const normalizedId = normalizeDesignerKey(draftId);
    if (!normalizedId) {
      return { success: false, reason: "Draft id missing." };
    }
    const draft = findDraftById(designer, normalizedId);
    if (!draft) {
      return { success: false, reason: "Draft not found." };
    }
    designer.form = cloneDesignerForm(draft);
    designer.activeTemplateId = normalizedId;
    designer.validation = validateDesignerForm(designer.form);
    syncGlobalState(state);
    saveState(state);
    renderShell();
    return { success: true, form: designer.form };
  };

  WeldServices.duplicatePhishingDraft = function duplicatePhishingDraft(draftId, providedState) {
    const state = resolveState(providedState);
    if (!state) return { success: false, reason: "State missing." };
    const designer = ensureDesignerState(state);
    const normalizedId = normalizeDesignerKey(draftId);
    if (!normalizedId) {
      return { success: false, reason: "Draft id missing." };
    }
    const draft = findDraftById(designer, normalizedId);
    if (!draft) {
      return { success: false, reason: "Draft not found." };
    }
    const nowIso = new Date().toISOString();
    const copyName = draft.name ? `${draft.name} copy` : "New simulation draft";
    const duplicate = {
      ...cloneDesignerForm({ ...draft, id: null }),
      id: designerId("phish-draft"),
      name: copyName,
      status: "draft",
      createdAt: nowIso,
      updatedAt: nowIso,
      lastPublishedAt: null
    };
    designer.drafts = [duplicate, ...designer.drafts].slice(0, 12);
    designer.form = cloneDesignerForm(duplicate);
    designer.validation = {};
    designer.activeTemplateId = duplicate.id;
    syncGlobalState(state);
    saveState(state);
    renderShell();
    return { success: true, draft: duplicate };
  };

  WeldServices.applyPhishingTemplate = function applyPhishingTemplate(templateId, providedState) {
    const state = resolveState(providedState);
    if (!state) return { success: false, reason: "State missing." };
    const template = blueprintTemplateById(templateId);
    if (!template) {
      return { success: false, reason: "Template not found." };
    }
    const designer = ensureDesignerState(state);
    const form = cloneDesignerForm({
      templateId: template.id,
      name: template.name,
      channel: template.defaultChannel,
      subject: template.subject,
      body: template.body,
      signalIds: Array.isArray(template.defaultSignals) ? template.defaultSignals : [],
      targetIds: Array.isArray(template.suggestedTargets) ? template.suggestedTargets : [],
      id: null
    });
    form.status = "draft";
    designer.form = form;
    designer.activeTemplateId = template.id;
    designer.validation = validateDesignerForm(form);
    syncGlobalState(state);
    saveState(state);
    renderShell();
    return { success: true, form };
  };

  WeldServices.publishPhishingDraft = function publishPhishingDraft(draftId, options = {}, providedState) {
    const state = resolveState(providedState);
    if (!state) return { success: false, reason: "State missing." };
    const designer = ensureDesignerState(state);
    const normalizedId = normalizeDesignerKey(draftId) || designer.form.id;
    let draft = normalizedId ? findDraftById(designer, normalizedId) : null;
    const mergedForm = mergeDesignerForm(draft || designer.form, options.patch || {});
    const validation = validateDesignerForm(mergedForm);
    if (Object.keys(validation).length > 0) {
      designer.validation = validation;
      designer.form = mergedForm;
      syncGlobalState(state);
      saveState(state);
      renderShell();
      return { success: false, validation };
    }
    const nowIso = new Date().toISOString();
    if (!draft) {
      draft = {
        ...mergedForm,
        id: mergedForm.id || designerId("phish-draft"),
        status: "draft",
        createdAt: nowIso,
        updatedAt: nowIso,
        lastPublishedAt: null
      };
      designer.drafts = [draft, ...designer.drafts].slice(0, 12);
    } else {
      Object.assign(draft, mergedForm, {
        id: draft.id,
        updatedAt: nowIso
      });
    }
    const simData = ensureSimData();
    const templateId = draft.templateId || `template-${draft.id}`;
    const templateSignals = draft.signalIds.map(id =>
      typeof id === "string" ? id.replace(/[^a-z0-9]+/gi, "_").toUpperCase() : id
    );
    if (!simData.templates.some(template => template && template.id === templateId)) {
      simData.templates.push({
        id: templateId,
        subject: draft.subject || draft.name || "Simulation template",
        vector: draft.channel || "email",
        difficulty:
          draft.signalIds.length >= 4 ? "high" : draft.signalIds.length >= 2 ? "medium" : "low",
        signals: templateSignals
      });
    }
    const launchDate = normalizeDesignerSchedule(draft.schedule) || nowIso;
    const targetIds =
      Array.isArray(draft.targetIds) && draft.targetIds.length > 0
        ? draft.targetIds.slice()
        : ["security-enablement"];
    const campaignId = normalizeDesignerKey(options.campaignId) || designerId("sim");
    const targetCount = Math.max(targetIds.length, 1);
    const sent = targetCount * 120;
    const delivered = Math.max(sent - Math.floor(sent * 0.02), 0);
    const failed = sent - delivered;
    const campaign = {
      id: campaignId,
      name: draft.name || "Simulation",
      launchDate,
      templateId,
      ownerId: draft.ownerId || "amelia-reed",
      targets: targetIds,
      delivery: { sent, delivered, failed },
      engagement: { reported: 0, clicked: 0, ignored: Math.max(delivered - 0, 0) },
      followUps: [],
      designerDraftId: draft.id
    };
    simData.campaigns = [campaign, ...simData.campaigns.filter(entry => entry && entry.id !== campaignId)];
    simData.signalsByCampaign[campaignId] = templateSignals;
    if ((draft.channel || "email").toLowerCase() === "email") {
      const sandboxMessage = normalizeSandboxMessage(
        {
          id: `sandbox-${campaignId}`,
          campaignId,
          channel: draft.channel,
          createdAt: launchDate,
          sender: draft.sender,
          subject: draft.subject || draft.name || "Simulation",
          previewText: draft.name || draft.subject || "Simulation email",
          body: draft.body || "",
          signalIds: draft.signalIds,
          metadata: {
            microLesson:
              (options && options.microLesson) ||
              (draft.metadata && draft.metadata.microLesson) ||
              "Spot every selected signal before submitting via the Reporter dock."
          }
        },
        `sandbox-${campaignId}`
      );
      if (sandboxMessage) {
        simData.sandboxMessages = [
          sandboxMessage,
          ...simData.sandboxMessages.filter(entry => entry && entry.id !== sandboxMessage.id)
        ];
        const sandboxState = ensureReporterSandboxState(state);
        upsertSandboxMessage(sandboxState, sandboxMessage);
      }
    }
    draft.status = "staged";
    draft.lastPublishedAt = launchDate;
    draft.lastCampaignId = campaignId;
    draft.updatedAt = launchDate;
    designer.form = cloneDesignerForm(draft);
    designer.validation = {};
    designer.activeTemplateId = draft.id;
    syncGlobalState(state);
    saveState(state);
    renderShell();
    if (typeof WeldServices.queuePhishingLaunch === "function") {
      WeldServices.queuePhishingLaunch(campaignId, { targets: targetIds }, state);
    }
    return { success: true, draft, campaignId };
  };

  WeldServices.setActiveSandboxMessage = function setActiveSandboxMessage(messageId, providedState) {
    const state = resolveState(providedState);
    if (!state) return { success: false, reason: "State missing." };
    const sandbox = ensureReporterSandboxState(state);
    const message = findSandboxMessage(sandbox, messageId);
    if (!message) {
      return { success: false, reason: "Message not found." };
    }
    markSandboxMessageRead(sandbox, message);
    const changed = sandbox.activeMessageId !== message.id;
    sandbox.activeMessageId = message.id;
    if (changed) {
      sandbox.hintsVisible = false;
    }
    syncGlobalState(state);
    saveState(state);
    renderShell();
    return { success: true, message };
  };

  WeldServices.toggleSandboxHints = function toggleSandboxHints(forceValue, providedState) {
    const state = resolveState(providedState);
    if (!state) return { success: false, reason: "State missing." };
    const sandbox = ensureReporterSandboxState(state);
    sandbox.hintsVisible = forceValue === undefined ? !sandbox.hintsVisible : forceValue === true;
    syncGlobalState(state);
    saveState(state);
    renderShell();
    return { success: true, hintsVisible: sandbox.hintsVisible };
  };

  WeldServices.updateSandboxFindings = function updateSandboxFindings(messageId, signalIds = [], providedState) {
    const state = resolveState(providedState);
    if (!state) return { success: false, reason: "State missing." };
    const sandbox = ensureReporterSandboxState(state);
    const normalizedId = normalizeSandboxMessageId(messageId) || sandbox.activeMessageId;
    if (!normalizedId) {
      return { success: false, reason: "Message id missing." };
    }
    const message = findSandboxMessage(sandbox, normalizedId);
    if (!message) {
      return { success: false, reason: "Message not found." };
    }
    const normalizedSignals = Array.isArray(signalIds)
      ? signalIds.map(normalizeSandboxSignalId).filter(Boolean)
      : [];
    sandbox.findings[normalizedId] = normalizedSignals;
    syncGlobalState(state);
    saveState(state);
    return { success: true, selections: normalizedSignals };
  };

  WeldServices.recordSandboxSubmission = function recordSandboxSubmission(payload = {}, providedState) {
    const state = resolveState(providedState);
    if (!state) return { success: false, reason: "State missing." };
    const sandbox = ensureReporterSandboxState(state);
    const normalizedId = normalizeSandboxMessageId(payload.messageId) || sandbox.activeMessageId;
    if (!normalizedId) {
      return { success: false, reason: "Message id missing." };
    }
    const message = findSandboxMessage(sandbox, normalizedId);
    if (!message) {
      return { success: false, reason: "Message not found." };
    }
    const selectedSignalsSource =
      Array.isArray(payload.signalIds) && payload.signalIds.length > 0
        ? payload.signalIds
        : sandbox.findings[normalizedId] || [];
    const selectedSignals = selectedSignalsSource.map(normalizeSandboxSignalId).filter(Boolean);
    const expectedSignals = Array.isArray(message.signalIds) ? message.signalIds : [];
    const expectedSet = new Set(expectedSignals);
    const selectedSet = new Set(selectedSignals);
    const correctSignals = selectedSignals.filter(id => expectedSet.has(id));
    const missedSignals = expectedSignals.filter(id => !selectedSet.has(id));
    const extraSignals = selectedSignals.filter(id => !expectedSet.has(id));
    const submission = {
      messageId: message.id,
      selectedSignals,
      correctSignals,
      missedSignals,
      extraSignals,
      submittedAt: new Date().toISOString(),
      usedHints: sandbox.hintsVisible === true || payload.usedHints === true
    };
    submission.success = missedSignals.length === 0 && extraSignals.length === 0 && selectedSignals.length > 0;
    sandbox.submissions.unshift(submission);
    sandbox.submissions = sandbox.submissions.slice(0, 24);
    sandbox.findings[message.id] = selectedSignals;
    sandbox.hintsVisible = false;
    syncGlobalState(state);
    saveState(state);
    renderShell();
    return { success: true, submission };
  };

  WeldServices.setSandboxUser = function setSandboxUser(userId, providedState) {
    const state = resolveState(providedState);
    if (!state) return { success: false, reason: "State missing." };
    const sandbox = ensureReporterSandboxState(state);
    if (!sandbox) return { success: false, reason: "Sandbox missing." };
    const normalized =
      typeof userId === "string" && userId.trim().length > 0 ? userId.trim() : null;
    sandbox.selectedUserId = normalized;
    syncGlobalState(state);
    saveState(state);
    renderShell();
    return { success: true, selectedUserId: sandbox.selectedUserId };
  };

  const SANDBOX_LAYOUT_PREFS = new Set(["compactRows", "showSnippets", "highlightReading", "showAddin"]);

  WeldServices.setSandboxLayoutPreference = function setSandboxLayoutPreference(prefName, enabled, providedState) {
    const state = resolveState(providedState);
    if (!state) return { success: false, reason: "State missing." };
    const sandbox = ensureReporterSandboxState(state);
    if (!sandbox) return { success: false, reason: "Sandbox missing." };
    if (!SANDBOX_LAYOUT_PREFS.has(prefName)) {
      return { success: false, reason: "Unknown layout preference." };
    }
    if (!sandbox.layout || typeof sandbox.layout !== "object") {
      sandbox.layout = {
        compactRows: false,
        showSnippets: true,
        highlightReading: true,
        showAddin: false
      };
    }
    sandbox.layout[prefName] = enabled === true;
    syncGlobalState(state);
    saveState(state);
    renderShell();
    return { success: true, layout: { ...sandbox.layout } };
  };

  const DEFAULT_PHISHING_SIM_STATE = {
    activeCampaignId: null,
    selectedDepartmentId: null,
    simLaunchQueue: [],
    lastSimFeedback: null
  };

  const getPhishingData = () => ensureSimData();
  const getPhishingCampaigns = () => {
    const campaigns = getPhishingData().campaigns;
    return Array.isArray(campaigns) ? campaigns : [];
  };
  const getDepartments = () =>
    Array.isArray(DirectoryData.departments) ? DirectoryData.departments : [];

  const normalizeCampaignId = value => {
    if (typeof value === "string") {
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : null;
    }
    if (Number.isFinite(value)) {
      return String(value);
    }
    return null;
  };

  const findCampaignById = id => {
    const normalized = normalizeCampaignId(id);
    if (!normalized) return null;
    return getPhishingCampaigns().find(campaign => campaign && campaign.id === normalized) || null;
  };

  const normalizeDepartmentId = value => {
    if (typeof value === "string") {
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : null;
    }
    return null;
  };

  function ensurePhishingSimState(state) {
    if (!state.phishingSimulation || typeof state.phishingSimulation !== "object") {
      state.phishingSimulation =
        (WeldUtil && typeof WeldUtil.clone === "function"
          ? WeldUtil.clone(DEFAULT_PHISHING_SIM_STATE)
          : { ...DEFAULT_PHISHING_SIM_STATE }) || {};
    }
    if (!Array.isArray(state.phishingSimulation.simLaunchQueue)) {
      state.phishingSimulation.simLaunchQueue = [];
    }
    return state.phishingSimulation;
  }

  function updatePhishingState(state, updater) {
    const simState = ensurePhishingSimState(state);
    const next = typeof updater === "function" ? updater(simState) : null;
    return next || simState;
  }

  function renderPhishFeedback(campaign, targets) {
    const name = campaign?.name || "Simulation";
    const targetCount = Array.isArray(targets) ? targets.length : 0;
    const plural = targetCount === 1 ? "department" : "departments";
    return `${name} queued for ${targetCount || "0"} ${plural} at ${new Date().toISOString()}`;
  }

  WeldServices.selectPhishingCampaign = function selectPhishingCampaign(campaignId, providedState) {
    const state = resolveState(providedState);
    if (!state) return { success: false, reason: "State missing." };
    const campaigns = getPhishingCampaigns();
    if (campaigns.length === 0) return { success: false, reason: "No campaigns available." };
    const targetCampaign =
      findCampaignById(campaignId) ||
      findCampaignById(state.phishingSimulation && state.phishingSimulation.activeCampaignId) ||
      campaigns[0];
    if (!targetCampaign) return { success: false, reason: "Campaign not found." };
    const normalizedId = normalizeCampaignId(targetCampaign.id);
    updatePhishingState(state, simState => {
      if (simState.activeCampaignId !== normalizedId) {
        simState.activeCampaignId = normalizedId;
        simState.selectedDepartmentId = null;
      }
      return simState;
    });
    syncGlobalState(state);
    saveState(state);
    renderShell();
    return { success: true, campaignId: normalizedId };
  };

  WeldServices.selectPhishingDepartment = function selectPhishingDepartment(departmentId, providedState) {
    const state = resolveState(providedState);
    if (!state) return { success: false, reason: "State missing." };
    const normalizedDepartmentId = normalizeDepartmentId(departmentId);
    if (!normalizedDepartmentId) {
      updatePhishingState(state, simState => {
        simState.selectedDepartmentId = null;
        return simState;
      });
      syncGlobalState(state);
      saveState(state);
      renderShell();
      return { success: true, departmentId: null };
    }
    const departments = getDepartments();
    const departmentExists = departments.some(dept => dept?.id === normalizedDepartmentId);
    if (!departmentExists) {
      return { success: false, reason: "Department not found." };
    }
    const activeCampaign =
      state.phishingSimulation && state.phishingSimulation.activeCampaignId
        ? findCampaignById(state.phishingSimulation.activeCampaignId)
        : null;
    if (activeCampaign && Array.isArray(activeCampaign.targets) && activeCampaign.targets.length > 0) {
      const targetsSet = new Set(activeCampaign.targets);
      if (!targetsSet.has(normalizedDepartmentId)) {
        return { success: false, reason: "Department not targeted in this campaign." };
      }
    }
    updatePhishingState(state, simState => {
      simState.selectedDepartmentId = normalizedDepartmentId;
      return simState;
    });
    syncGlobalState(state);
    saveState(state);
    renderShell();
    return { success: true, departmentId: normalizedDepartmentId };
  };

  WeldServices.queuePhishingLaunch = function queuePhishingLaunch(
    campaignId,
    options = {},
    providedState
  ) {
    const state = resolveState(providedState);
    if (!state) return { success: false, reason: "State missing." };
    const campaigns = getPhishingCampaigns();
    if (campaigns.length === 0) return { success: false, reason: "No campaigns available." };
    const fallbackCampaign =
      findCampaignById(state.phishingSimulation && state.phishingSimulation.activeCampaignId) ||
      campaigns[0];
    const targetCampaign = findCampaignById(campaignId) || fallbackCampaign;
    if (!targetCampaign) return { success: false, reason: "Campaign not found." };
    const normalizedId = normalizeCampaignId(targetCampaign.id);
    const targets =
      Array.isArray(options.targets) && options.targets.length > 0
        ? options.targets
        : Array.isArray(targetCampaign.targets)
        ? targetCampaign.targets
        : [];
    const feedbackMessage = renderPhishFeedback(targetCampaign, targets);
    updatePhishingState(state, simState => {
      const queue = Array.isArray(simState.simLaunchQueue) ? simState.simLaunchQueue.slice() : [];
      const filtered = queue.filter(id => id !== normalizedId);
      filtered.unshift(normalizedId);
      simState.simLaunchQueue = filtered.slice(0, 10);
      simState.activeCampaignId = normalizedId;
      simState.lastSimFeedback = feedbackMessage;
      return simState;
    });
    syncGlobalState(state);
    saveState(state);
    renderShell();
    return {
      success: true,
      campaignId: normalizedId,
      message: feedbackMessage
    };
  };
})();
