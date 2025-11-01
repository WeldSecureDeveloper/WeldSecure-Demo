const ROLE_LABELS = window.AppData.ROLE_LABELS;
const ROUTES = window.AppData.ROUTES;
const MessageStatus = window.AppData.MessageStatus;
const NAV_GROUPS = window.AppData.NAV_GROUPS;
const QUEST_DIFFICULTY_ORDER = window.AppData.QUEST_DIFFICULTY_ORDER;
const ICONS = window.AppData.ICONS;
const METRIC_TONES = window.AppData.METRIC_TONES;
const BADGE_TONES = window.AppData.BADGE_TONES;
const BADGE_ICON_BACKDROPS = window.AppData.BADGE_ICON_BACKDROPS;
const POINTS_CARD_ICONS = window.AppData.POINTS_CARD_ICONS;
const BADGES = window.AppData.BADGES;
const BADGE_CATEGORY_ORDER = window.AppData.BADGE_CATEGORY_ORDER;
const BADGE_DRAFTS = new Set(window.AppData.BADGE_DRAFTS);
const DEFAULT_QUESTS = window.AppData.DEFAULT_QUESTS;
const DEPARTMENT_LEADERBOARD = window.AppData.DEPARTMENT_LEADERBOARD;
const ENGAGEMENT_PROGRAMS = window.AppData.ENGAGEMENT_PROGRAMS;
let state =
  (typeof window.state === "object" && window.state) ||
  WeldState.loadState() ||
  (typeof WeldState.initialState === "function" ? WeldState.initialState() : {});
window.state = state;
if (window.Weld) {
  window.Weld.state = state;
}

const WeldServices = window.WeldServices || {};
const serviceMap = {
  navigate: WeldServices.navigate,
  setRole: WeldServices.setRole,
  resetDemo: WeldServices.resetDemo,
  persist: WeldServices.persist,
  completeQuest: WeldServices.completeQuest,
  redeemReward: WeldServices.redeemReward,
  openSettings: WeldServices.openSettings,
  closeSettings: WeldServices.closeSettings
};

Object.keys(serviceMap).forEach(key => {
  if (typeof serviceMap[key] === "function") {
    window[key] = serviceMap[key];
  }
});



function initializeRoute() {
  const hashRoute = window.location.hash.replace("#", "");
  if (hashRoute && ROUTES[hashRoute]) {
    state.meta.route = hashRoute;
    state.meta.role = ROUTES[hashRoute].requiresRole || null;
    if (hashRoute === "addin") {
      state.meta.addinScreen = "report";
    }
  } else {
    state.meta.route = "landing";
    state.meta.role = null;
  }
}

initializeRoute();



function navigate(route) {
  if (window.WeldServices && typeof window.WeldServices.navigate === "function") {
    return window.WeldServices.navigate(route, state);
  }
  const nextRoute = ROUTES[route] ? route : "landing";
  state.meta.route = nextRoute;
  if (nextRoute === "landing") {
    state.meta.role = null;
  }
  if (nextRoute !== "customer-reports") {
    state.meta.reportFilter = null;
  }
  WeldState.saveState(state);
  renderApp();
}

function setRole(role, route) {
  if (window.WeldServices && typeof window.WeldServices.setRole === "function") {
    return window.WeldServices.setRole(role, route, state);
  }
  state.meta.role = role;
  if (route) {
    if (route !== "customer-reports") {
      state.meta.reportFilter = null;
    }
    state.meta.route = route;
  }
  WeldState.saveState(state);
  renderApp();
}

function resetDemo() {
  if (window.WeldServices && typeof window.WeldServices.resetDemo === "function") {
    return window.WeldServices.resetDemo(state);
  }
  const defaultState = WeldState.initialState();
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
  WeldState.saveState(state);
  if (window.location.hash) {
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    } else {
      window.location.hash = "";
    }
  }
  renderApp();
}

function persist() {
  if (window.WeldServices && typeof window.WeldServices.persist === "function") {
    return window.WeldServices.persist(state);
  }
  WeldState.saveState(state);
}

function rewardById(id) {
  const target = id;
  return state.rewards.find(item => {
    if (item?.id === target) return true;
    return String(item?.id) === String(target);
  });
}

function questById(id) {
  if (!Array.isArray(state.quests)) return null;
  const targetId = String(id);
  return (
    state.quests.find(item => {
      return String(item.id) === targetId;
    }) || null
  );
}

function completeQuest(questId, options = {}) {
  if (window.WeldServices && typeof window.WeldServices.completeQuest === "function") {
    return window.WeldServices.completeQuest(questId, options, state);
  }
  const quest = questById(questId);
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
    id: WeldUtil.generateId("quest-completion"),
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
    const newPoints = (Number.isFinite(existingPoints) ? existingPoints : 0) + awardedPoints;
    questSource.points = newPoints;
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
  WeldState.saveState(state);
  renderApp();
  return { success: true, awardedPoints, doubled, completedAt };
}

function getBadges() {
  if (Array.isArray(state.badges) && state.badges.length > 0) {
    return state.badges;
  }
  return BADGES.map(badge => ({
    ...badge,
    published: !BADGE_DRAFTS.has(badge.id)
  }));
}

function rewardRemainingLabel(reward) {
  if (reward?.unlimited) {
    return "&infin;";
  }
  if (typeof reward?.remaining === "number") {
    return reward.remaining;
  }
  return 0;
}

function reasonById(id) {
  const reasons = state?.settings?.reporter?.reasons;
  if (!Array.isArray(reasons)) return null;
  return reasons.find(item => item.id === id) || null;
}

function messageBelongsToCustomer(message) {
  return message?.reporterEmail === state.customer.email;
}

function buildOtherActivityForm() {
  const form = document.createElement("form");
  form.className = "other-activity-form";
  form.setAttribute("novalidate", "true");

  const fieldset = document.createElement("div");
  fieldset.className = "other-activity-form__fields";

  const typeWrapper = document.createElement("label");
  typeWrapper.className = "other-activity-form__field";
  typeWrapper.setAttribute("for", "other-activity-type");
  typeWrapper.innerHTML = `<span class="other-activity-form__label">What kind of activity?</span>`;
  const typeSelect = document.createElement("select");
  typeSelect.id = "other-activity-type";
  typeSelect.className = "other-activity-form__select";
  typeSelect.innerHTML = `
    <option value="">Select a category</option>
    <option value="vishing">Phone call or voicemail (vishing)</option>
    <option value="smishing">Text or messaging app (smishing)</option>
    <option value="quishing">QR code or signage (quishing)</option>
    <option value="other">Something else suspicious</option>
  `;
  typeWrapper.appendChild(typeSelect);
  fieldset.appendChild(typeWrapper);

  const summaryWrapper = document.createElement("label");
  summaryWrapper.className = "other-activity-form__field";
  summaryWrapper.setAttribute("for", "other-activity-summary");
  summaryWrapper.innerHTML =
    `<span class="other-activity-form__label">Give it a short title</span>`;
  const summaryInput = document.createElement("input");
  summaryInput.type = "text";
  summaryInput.id = "other-activity-summary";
  summaryInput.className = "other-activity-form__input";
  summaryInput.placeholder = "e.g. Caller impersonating IT support";
  summaryWrapper.appendChild(summaryInput);
  fieldset.appendChild(summaryWrapper);

  const detailsWrapper = document.createElement("label");
  detailsWrapper.className = "other-activity-form__field";
  detailsWrapper.setAttribute("for", "other-activity-details");
  detailsWrapper.innerHTML =
    `<span class="other-activity-form__label">What happened?</span>`;
  const detailsTextarea = document.createElement("textarea");
  detailsTextarea.id = "other-activity-details";
  detailsTextarea.className = "other-activity-form__textarea";
  detailsTextarea.rows = 4;
  detailsTextarea.placeholder =
    "Share what made it suspicious and any actions taken so far.";
  detailsWrapper.appendChild(detailsTextarea);
  fieldset.appendChild(detailsWrapper);

  const locationWrapper = document.createElement("label");
  locationWrapper.className = "other-activity-form__field";
  locationWrapper.setAttribute("for", "other-activity-location");
  locationWrapper.innerHTML =
    `<span class="other-activity-form__label">Where did this occur? <span class="other-activity-form__optional">(optional)</span></span>`;
  const locationInput = document.createElement("input");
  locationInput.type = "text";
  locationInput.id = "other-activity-location";
  locationInput.className = "other-activity-form__input";
  locationInput.placeholder = "e.g. Reception desk, employee parking, Teams call";
  locationWrapper.appendChild(locationInput);
  fieldset.appendChild(locationWrapper);

  form.appendChild(fieldset);

  const helper = document.createElement("p");
  helper.className = "other-activity-form__helper";
  helper.textContent = "Security will review straight away and follow up if more detail is needed.";
  form.appendChild(helper);

  const errorEl = document.createElement("p");
  errorEl.className = "other-activity-form__error";
  errorEl.setAttribute("role", "alert");
  errorEl.hidden = true;
  form.appendChild(errorEl);

  const setError = message => {
    if (message) {
      errorEl.textContent = message;
      errorEl.hidden = false;
    } else {
      errorEl.textContent = "";
      errorEl.hidden = true;
    }
  };

  const getValues = () => {
    const type = typeSelect.value;
    const summary = summaryInput.value.trim();
    const details = detailsTextarea.value.trim();
    const location = locationInput.value.trim();
    if (!type) {
      setError("Choose the channel so security knows how to respond.");
      typeSelect.focus();
      return null;
    }
    if (!summary) {
      setError("Add a short title to help the SOC triage quickly.");
      summaryInput.focus();
      return null;
    }
    if (!details) {
      setError("Add a few details so the SOC understands what happened.");
      detailsTextarea.focus();
      return null;
    }
    setError(null);

    let reasons = [];
    switch (type) {
      case "vishing":
        reasons = ["reason-suspicious-call"];
        break;
      case "smishing":
        reasons = ["reason-suspicious-text"];
        break;
      case "quishing":
        reasons = ["reason-suspicious-qr"];
        break;
      default:
        reasons = ["reason-looks-like-phishing"];
    }

    return {
      type,
      summary,
      details,
      location: location || null,
      reasons
    };
  };

  return {
    element: form,
    getValues,
    setError
  };
}

function openSuspiciousActivityForm() {
  const form = buildOtherActivityForm();
  openDialog({
    title: "Report other suspicious activity",
    description: "Flag suspicious calls, texts, QR codes, or anything else your security team should investigate.",
    content: form.element,
    confirmLabel: "Submit report",
    cancelLabel: "Cancel",
    onConfirm: close => {
      const values = form.getValues();
      if (!values) return;

      reportMessage({
        subject: values.summary,
        reporterName: state.customer.name,
        reporterEmail: state.customer.email,
        reasons: values.reasons,
        notes: values.details,
        origin: "hub",
        activityType: values.type,
        incidentLocation: values.location
      });

      close();
      openDialog({
        title: "Report submitted",
        description:
          "Thanks for logging it. Security will review and award bonus points once the incident is actioned.",
        confirmLabel: "Close"
      });
    }
  });
}

function buildCustomerReportHistoryContent(messages) {
  const wrapper = document.createElement("div");
  wrapper.className = "report-history-dialog";

  if (!Array.isArray(messages) || messages.length === 0) {
    const demo = getDemoOtherActivityReports();
    if (demo.length === 0) {
      const emptyState = document.createElement("p");
      emptyState.textContent =
        "No reports submitted yet. Flag anything suspicious to start building your history.";
      wrapper.appendChild(emptyState);
      return wrapper;
    }
    messages = demo;
  }

  const sorted = messages
    .slice()
    .sort((a, b) => new Date(b.reportedAt || 0).getTime() - new Date(a.reportedAt || 0).getTime());
  const actionedCount = sorted.filter(message => message?.status === MessageStatus.APPROVED).length;
  const pendingCount = sorted.filter(message => message?.status === MessageStatus.PENDING).length;
  const summary = document.createElement("p");
  summary.className = "report-history-dialog__summary";
  const summaryParts = [`You've submitted ${sorted.length} report${sorted.length === 1 ? "" : "s"}.`];
  if (actionedCount > 0) {
    summaryParts.push(
      `${actionedCount} ${actionedCount === 1 ? "was" : "were"} actioned by the security team.`
    );
  }
  if (pendingCount > 0) {
    summaryParts.push(
      `${pendingCount} ${pendingCount === 1 ? "is" : "are"} awaiting review for extra points.`
    );
  }
  summary.textContent = summaryParts.join(" ");
  wrapper.appendChild(summary);

  const list = document.createElement("ul");
  list.className = "report-history-dialog__list";

  sorted.forEach(message => {
    const item = document.createElement("li");
    item.className = "report-history-dialog__item";

    const titleRow = document.createElement("div");
    titleRow.className = "report-history-dialog__title-row";

    const subjectEl = document.createElement("span");
    subjectEl.className = "report-history-dialog__subject";
    subjectEl.textContent = message?.subject || "Suspicious message";
    titleRow.appendChild(subjectEl);

    const statusBadge = document.createElement("span");
    statusBadge.className = "badge";
    const statusValue =
      typeof message?.status === "string" ? message.status : MessageStatus.PENDING;
    statusBadge.dataset.state = statusValue;
    const statusLabel = `${statusValue.charAt(0).toUpperCase()}${statusValue.slice(1)}`;
    statusBadge.textContent = statusLabel;
    titleRow.appendChild(statusBadge);

    item.appendChild(titleRow);

    const meta = document.createElement("div");
    meta.className = "report-history-dialog__meta";
    const reportedAt = message?.reportedAt;
    meta.textContent = reportedAt ? formatDateTime(reportedAt) : "Date not recorded";
    item.appendChild(meta);

    const activityLabel = describeActivityType(message?.activityType);
    if (activityLabel) {
      const activityChip = document.createElement("span");
      activityChip.className = "report-history-dialog__activity";
      activityChip.textContent = activityLabel;
      item.appendChild(activityChip);
    }

    if (message?.incidentLocation) {
      const locationLine = document.createElement("p");
      locationLine.className = "report-history-dialog__location";
      locationLine.textContent = `Location: ${message.incidentLocation}`;
      item.appendChild(locationLine);
    }

    const reasons = Array.isArray(message?.reasons)
      ? message.reasons.map(reasonById).filter(Boolean)
      : [];
    if (reasons.length > 0) {
      const reasonsWrap = document.createElement("div");
      reasonsWrap.className = "report-history-dialog__reasons";
      reasons.forEach(reason => {
        const chip = document.createElement("span");
        chip.className = "detail-chip";
        chip.textContent = reason.label || "";
        reasonsWrap.appendChild(chip);
      });
      item.appendChild(reasonsWrap);
    }

    const response = document.createElement("p");
    response.className = "report-history-dialog__response";
    response.textContent = getReportResponseCopy({ ...message, status: statusValue });
    item.appendChild(response);

    if (message?.additionalNotes) {
      const note = document.createElement("p");
      note.className = "report-history-dialog__note";
      note.textContent = `Your note: ${message.additionalNotes}`;
      item.appendChild(note);
    }

    const pointsRow = document.createElement("div");
    pointsRow.className = "report-history-dialog__points";

    const clientForMessage =
      Array.isArray(state.clients) && message?.clientId
        ? state.clients.find(client => client?.id === message.clientId) || null
        : null;

    let basePoints = 20;
    if (typeof message?.pointsOnMessage === "number" && Number.isFinite(message.pointsOnMessage)) {
      basePoints = message.pointsOnMessage;
    } else if (clientForMessage && typeof clientForMessage.pointsPerMessage === "number") {
      basePoints = clientForMessage.pointsPerMessage;
    }

    const captureChip = document.createElement("span");
    captureChip.className = "report-history-dialog__points-chip report-history-dialog__points-chip--base";
    captureChip.textContent = `+${formatNumber(basePoints)} capture`;
    pointsRow.appendChild(captureChip);

    let bonusPoints = 0;
    if (statusValue === MessageStatus.APPROVED) {
      if (typeof message?.pointsOnApproval === "number" && Number.isFinite(message.pointsOnApproval)) {
        bonusPoints = message.pointsOnApproval;
      } else if (clientForMessage && typeof clientForMessage.pointsOnApproval === "number") {
        bonusPoints = clientForMessage.pointsOnApproval;
      }
    }

    if (bonusPoints > 0) {
      const bonusChip = document.createElement("span");
      bonusChip.className =
        "report-history-dialog__points-chip report-history-dialog__points-chip--bonus";
      bonusChip.textContent = `+${formatNumber(bonusPoints)} actioned`;
      pointsRow.appendChild(bonusChip);
    } else if (statusValue === MessageStatus.PENDING) {
      const pendingChip = document.createElement("span");
      pendingChip.className =
        "report-history-dialog__points-chip report-history-dialog__points-chip--pending";
      pendingChip.textContent = "Bonus pending review";
      pointsRow.appendChild(pendingChip);
    } else if (statusValue === MessageStatus.REJECTED) {
      const rejectedChip = document.createElement("span");
      rejectedChip.className =
        "report-history-dialog__points-chip report-history-dialog__points-chip--pending";
      rejectedChip.textContent = "Bonus not awarded";
      pointsRow.appendChild(rejectedChip);
    }

    const totalPoints = basePoints + (bonusPoints > 0 ? bonusPoints : 0);
    const totalEl = document.createElement("strong");
    totalEl.className = "report-history-dialog__points-total";
    totalEl.textContent = `= ${formatNumber(totalPoints)} pts`;
    pointsRow.appendChild(totalEl);

    item.appendChild(pointsRow);
    list.appendChild(item);
  });

  wrapper.appendChild(list);
  return wrapper;
}

function describeActivityType(value) {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";
  switch (normalized) {
    case "vishing":
      return "Phone / vishing";
    case "smishing":
      return "SMS / smishing";
    case "quishing":
      return "QR / quishing";
    default:
      return normalized ? "Suspicious activity" : "";
  }
}

function getReportResponseCopy(message) {
  const status =
    typeof message?.status === "string" ? message.status : MessageStatus.PENDING;
  if (status === MessageStatus.APPROVED) {
    let bonusPoints = 0;
    if (typeof message?.pointsOnApproval === "number" && Number.isFinite(message.pointsOnApproval)) {
      bonusPoints = message.pointsOnApproval;
    } else if (Array.isArray(state.clients) && message?.clientId) {
      const client = state.clients.find(entry => entry?.id === message.clientId);
      if (client && typeof client.pointsOnApproval === "number") {
        bonusPoints = client.pointsOnApproval;
      }
    }
    const bonusCopy =
      bonusPoints > 0 ? ` and awarded +${formatNumber(bonusPoints)} bonus points` : "";
    return `Security team actioned this report${bonusCopy}.`;
  }
  if (status === MessageStatus.REJECTED) {
    return "Security reviewed this report and no further action was required.";
  }
  return "Security is reviewing this report. You'll see the outcome once it has been actioned.";
}

function getDemoOtherActivityReports() {
  const now = Date.now();
  const offsets = [2, 5, 12];
  const toIso = days => new Date(now - days * 24 * 60 * 60 * 1000).toISOString();
  return [
    {
      subject: "Caller posing as IT support about device settings",
      reportedAt: toIso(offsets[0]),
      status: MessageStatus.APPROVED,
      reasons: ["reason-suspicious-call", "reason-urgent-tone"],
      pointsOnMessage: 20,
      pointsOnApproval: 80,
      additionalNotes:
        "They phoned claiming MFA was broken and pushed me to disable it. I hung up and called IT.",
      activityType: "vishing",
      incidentLocation: "Desk phone, HQ floor 5"
    },
    {
      subject: "WhatsApp message pretending to be our CFO",
      reportedAt: toIso(offsets[1]),
      status: MessageStatus.PENDING,
      reasons: ["reason-suspicious-text", "reason-spoofing-senior"],
      pointsOnMessage: 20,
      pointsOnApproval: 80,
      additionalNotes:
        "Unknown number asked me to buy gift cards urgently and keep quiet. Sent screenshots.",
      activityType: "smishing",
      incidentLocation: "Personal mobile"
    },
    {
      subject: "Unfamiliar QR code posted at the car park entrance",
      reportedAt: toIso(offsets[2]),
      status: MessageStatus.APPROVED,
      reasons: ["reason-suspicious-qr", "reason-unexpected-attachment"],
      pointsOnMessage: 20,
      pointsOnApproval: 80,
      additionalNotes:
        "Sticker linked to a fake Microsoft login. I removed it and alerted facilities.",
      activityType: "quishing",
      incidentLocation: "Employee parking entrance"
    }
  ];
}

function getTeamMembers() {
  if (Array.isArray(state.teamMembers)) {
    return state.teamMembers;
  }
  return [];
}

function teamMemberByEmail(email) {
  if (typeof email !== "string") return null;
  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;
  const members = getTeamMembers();
  return (
    members.find(member => {
      if (!member || typeof member.email !== "string") return false;
      return member.email.trim().toLowerCase() === normalized;
    }) || null
  );
}

function getRecognitions() {
  if (Array.isArray(state.recognitions)) {
    return state.recognitions;
  }
  return [];
}

function redeemReward(rewardId) {
  if (window.WeldServices && typeof window.WeldServices.redeemReward === "function") {
    return window.WeldServices.redeemReward(rewardId, state);
  }
  const reward = rewardById(rewardId);
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

  const redemption = {
    id: WeldUtil.generateId("redemption"),
    rewardId: reward.id,
    redeemedAt: new Date().toISOString(),
    status: "pending"
  };

  state.rewardRedemptions.unshift(redemption);
  WeldState.saveState(state);
  renderApp();

  return { success: true, redemption };
}

function recordRecognition({ recipientEmail, points, focus, message, channel }) {
  const sender = state.customer || {};
  const senderEmail =
    typeof sender.email === "string" && sender.email.trim().length > 0 ? sender.email.trim() : null;
  if (!senderEmail) {
    return { success: false, reason: "Select a reporter profile before sharing recognition." };
  }

  const normalizedRecipient =
    typeof recipientEmail === "string" && recipientEmail.trim().length > 0
      ? recipientEmail.trim()
      : null;
  if (!normalizedRecipient) {
    return { success: false, reason: "Choose a teammate to recognise." };
  }
  if (normalizedRecipient.toLowerCase() === senderEmail.toLowerCase()) {
    return { success: false, reason: "You cannot award recognition to yourself." };
  }

  const trimmedMessage = typeof message === "string" ? message.trim() : "";
  if (!trimmedMessage) {
    return { success: false, reason: "Add a short note so your teammate knows what they did well." };
  }

  const senderMember = teamMemberByEmail(senderEmail);
  const recipientMember = teamMemberByEmail(normalizedRecipient);
  const rawPoints = Number(points);
  const normalizedPoints =
    Number.isFinite(rawPoints) && rawPoints > 0 ? Math.round(rawPoints) : 0;
  const focusLabel =
    typeof focus === "string" && focus.trim().length > 0 ? focus.trim() : "Recognition spotlight";
  const channelLabel =
    typeof channel === "string" && channel.trim().length > 0 ? channel.trim() : "Hub spotlight";

  const recognition = {
    id: WeldUtil.generateId("recognition"),
    senderEmail: senderEmail,
    senderName: senderMember?.name || sender.name || senderEmail,
    senderTitle: senderMember?.title || sender.title || "",
    recipientEmail: recipientMember?.email || normalizedRecipient,
    recipientName: recipientMember?.name || normalizedRecipient,
    recipientTitle: recipientMember?.title || "",
    points: normalizedPoints,
    focus: focusLabel,
    message: trimmedMessage,
    channel: channelLabel,
    createdAt: new Date().toISOString()
  };

  if (!Array.isArray(state.recognitions)) {
    state.recognitions = [];
  }
  state.recognitions.unshift(recognition);
  state.meta.recognitionFilter = "given";

  WeldState.saveState(state);
  renderApp();

  return { success: true, recognition };
}

function openRecognitionFormDialog() {
  const teammateList = getTeamMembers();
  const lowerCustomerEmail =
    typeof state.customer?.email === "string"
      ? state.customer.email.trim().toLowerCase()
      : "";
  const teammateOptions = teammateList
    .filter(member => {
      if (!member || typeof member.email !== "string") return false;
      const email = member.email.trim();
      if (!email) return false;
      if (lowerCustomerEmail && email.toLowerCase() === lowerCustomerEmail) {
        return false;
      }
      return true;
    })
    .map(member => {
      const email = member.email.trim();
      const title =
        typeof member.title === "string" && member.title.trim().length > 0
          ? member.title.trim()
          : "";
      const titleMarkup = title ? ` - ${WeldUtil.escapeHtml(title)}` : "";
      const displayName = member.name || email;
      return `<option value="${WeldUtil.escapeHtml(email)}">${WeldUtil.escapeHtml(
        displayName
      )}${titleMarkup}</option>`;
    })
    .join("");
  const teammateSelectOptions = teammateOptions
    ? `<option value="" disabled selected>Select teammate</option>${teammateOptions}`
    : `<option value="" disabled selected>No teammates available</option>`;
  const recognitionPointChoices = [
    { value: 10, label: "+10 pts - Quick kudos" },
    { value: 15, label: "+15 pts - Awareness boost", default: true },
    { value: 25, label: "+25 pts - Incident averted" },
    { value: 35, label: "+35 pts - High-risk stop" }
  ];
  const pointsOptionsMarkup = recognitionPointChoices
    .map(choice => {
      const selectedAttr = choice.default ? " selected" : "";
      return `<option value="${WeldUtil.escapeHtml(
        String(choice.value)
      )}"${selectedAttr}>${WeldUtil.escapeHtml(choice.label)}</option>`;
    })
    .join("");
  const recognitionFocusChoices = [
    "Suspicious supplier update",
    "Credential lure stopped",
    "Business email compromise attempt",
    "Unexpected bank change",
    "Phishing simulation debrief"
  ];
  const focusOptionsMarkup = recognitionFocusChoices
    .map((label, index) => {
      const selectedAttr = index === 0 ? " selected" : "";
      return `<option value="${WeldUtil.escapeHtml(label)}"${selectedAttr}>${WeldUtil.escapeHtml(
        label
      )}</option>`;
    })
    .join("");

  const container = document.createElement("div");
  container.innerHTML = `
    <section class="recognition-form recognition-form--dialog">
      <p class="recognition-form__intro">Grant bonus points when a teammate spots a threat or shares intel.</p>
      <form id="recognition-form" class="recognition-form__fields">
        <label class="recognition-form__field">
          <span>Team mate</span>
          <select name="recipient" required>
            ${teammateSelectOptions}
          </select>
        </label>
        <div class="recognition-form__row">
          <label class="recognition-form__field recognition-form__field--inline">
            <span>Bonus points</span>
            <select name="points" required>
              ${pointsOptionsMarkup}
            </select>
          </label>
          <label class="recognition-form__field recognition-form__field--inline">
            <span>Threat focus</span>
            <select name="focus">
              ${focusOptionsMarkup}
            </select>
          </label>
        </div>
        <label class="recognition-form__field">
          <span>Recognition message</span>
          <textarea name="message" rows="4" maxlength="280" placeholder="Share the context so everyone knows what to watch for..." required></textarea>
        </label>
        <p class="recognition-form__helper">Security amplifies these stories in the weekly wrap-up and your next quest together pays out double points.</p>
        <p class="recognition-form__error" role="alert" aria-live="assertive"></p>
        <button type="submit" class="button-pill button-pill--primary recognition-form__submit">
          Share recognition
        </button>
      </form>
    </section>
  `;

  const form = container.querySelector("#recognition-form");
  const errorEl = container.querySelector(".recognition-form__error");
  if (errorEl) {
    errorEl.hidden = true;
  }
  if (form) {
    form.addEventListener("submit", event => {
      event.preventDefault();
      if (errorEl) {
        errorEl.textContent = "";
        errorEl.hidden = true;
      }
      const formData = new FormData(form);
      const recipientEmail = String(formData.get("recipient") || "").trim();
      const pointsValue = Number(formData.get("points") || 0);
      const focusValue = String(formData.get("focus") || "").trim();
      const messageValue = String(formData.get("message") || "").trim();

      const result = recordRecognition({
        recipientEmail,
        points: pointsValue,
        focus: focusValue,
        message: messageValue,
        channel: "Hub spotlight"
      });

      if (!result.success) {
        if (errorEl) {
          errorEl.textContent = result.reason || "Please try again.";
          errorEl.hidden = false;
        }
        return;
      }

      closeDialog();

      const teammate = teamMemberByEmail(recipientEmail);
      const recipientName = teammate?.name || recipientEmail;
      const normalizedPoints =
        Number.isFinite(pointsValue) && pointsValue > 0 ? pointsValue : 0;
      const pointsSnippet =
        normalizedPoints > 0 ? ` and earn +${formatNumber(normalizedPoints)} pts` : "";
      openDialog({
        title: "Recognition shared",
        description: `${recipientName} will see your note${pointsSnippet}. Next quest together: double points.`,
        confirmLabel: "Close",
        onConfirm: closeDialog
      });
    });
  }

  openDialog({
    title: "Share recognition",
    description: "Award kudos, pass on bonus points, and unlock a double quest boost.",
    content: container,
    cancelLabel: "Close"
  });
}

function setRewardPublication(rewardId, published) {
  const reward = rewardById(rewardId);
  if (!reward) return;
  reward.published = Boolean(published);
  WeldState.saveState(state);
  renderApp();
}

function setBadgePublication(badgeId, published) {
  if (!Array.isArray(state.badges)) return;
  const targetId =
    typeof badgeId === "string" && badgeId.trim().length > 0 ? badgeId.trim() : String(badgeId ?? "");
  const badge = state.badges.find(item => item.id === targetId);
  if (!badge) return;
  badge.published = Boolean(published);
  WeldState.saveState(state);
  renderApp();
}

function setAllRewardsPublication(published) {
  const nextPublished = Boolean(published);
  let changed = false;
  state.rewards.forEach(reward => {
    if (reward.published !== nextPublished) {
      reward.published = nextPublished;
      changed = true;
    }
  });
  if (!changed) return;
  WeldState.saveState(state);
  renderApp();
}

function setAllBadgesPublication(published) {
  if (!Array.isArray(state.badges) || state.badges.length === 0) return;
  const nextPublished = Boolean(published);
  let changed = false;
  state.badges.forEach(badge => {
    if (badge.published !== nextPublished) {
      badge.published = nextPublished;
      changed = true;
    }
  });
  if (!changed) return;
  WeldState.saveState(state);
  renderApp();
}

function setAllQuestsPublication(published) {
  if (!Array.isArray(state.quests)) return;
  const nextPublished = Boolean(published);
  let changed = false;
  state.quests.forEach(quest => {
    if (quest.published !== nextPublished) {
      quest.published = nextPublished;
      changed = true;
    }
  });
  if (!changed) return;
  WeldState.saveState(state);
  renderApp();
}

function setQuestPublication(questId, published) {
  if (!Array.isArray(state.quests)) return;
  const targetId = String(questId);
  const quest = state.quests.find(item => String(item.id) === targetId);
  if (!quest) return;
  quest.published = Boolean(published);
  WeldState.saveState(state);
  renderApp();
}

function setLeaderboardEntryPublication(entryId, published) {
  if (!Array.isArray(state.departmentLeaderboard)) return;
  const targetId =
    typeof entryId === "string" && entryId.trim().length > 0
      ? entryId.trim()
      : Number.isFinite(entryId)
      ? String(entryId)
      : null;
  if (!targetId) return;
  const entry = state.departmentLeaderboard.find(item => {
    const candidate =
      typeof item?.id === "string" && item.id.trim().length > 0
        ? item.id.trim()
        : Number.isFinite(item?.id)
        ? String(item.id)
        : null;
    return candidate === targetId;
  });
  if (!entry) return;
  const nextPublished = Boolean(published);
  if (entry.published === nextPublished) return;
  entry.published = nextPublished;
  WeldState.saveState(state);
  renderApp();
}

function setAllLeaderboardPublication(published) {
  if (!Array.isArray(state.departmentLeaderboard) || state.departmentLeaderboard.length === 0) return;
  const nextPublished = Boolean(published);
  let changed = false;
  state.departmentLeaderboard.forEach(entry => {
    if (entry && entry.published !== nextPublished) {
      entry.published = nextPublished;
      changed = true;
    }
  });
  if (!changed) return;
  WeldState.saveState(state);
  renderApp();
}

function setEngagementProgramPublication(programId, published) {
  if (!Array.isArray(state.engagementPrograms)) return;
  const targetId =
    typeof programId === "string" && programId.trim().length > 0
      ? programId.trim()
      : Number.isFinite(programId)
      ? String(programId)
      : null;
  if (!targetId) return;
  const program = state.engagementPrograms.find(item => {
    const candidate =
      typeof item?.id === "string" && item.id.trim().length > 0
        ? item.id.trim()
        : Number.isFinite(item?.id)
        ? String(item.id)
        : null;
    return candidate === targetId;
  });
  if (!program) return;
  const nextPublished = Boolean(published);
  if (program.published === nextPublished) return;
  program.published = nextPublished;
  WeldState.saveState(state);
  renderApp();
}

function setAllEngagementProgramsPublication(published) {
  if (!Array.isArray(state.engagementPrograms) || state.engagementPrograms.length === 0) return;
  const nextPublished = Boolean(published);
  let changed = false;
  state.engagementPrograms.forEach(program => {
    if (program && program.published !== nextPublished) {
      program.published = nextPublished;
      changed = true;
    }
  });
  if (!changed) return;
  WeldState.saveState(state);
  renderApp();
}

function normalizeLabFeatureId(value) {
  if (Number.isFinite(value)) {
    return String(value);
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  return null;
}

function normalizeLabClientId(value) {
  if (Number.isFinite(value)) {
    return Number(value);
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const numeric = Number(trimmed);
    return Number.isFinite(numeric) ? numeric : trimmed;
  }
  return null;
}

function labClientKey(value) {
  if (Number.isFinite(value)) {
    return String(Number(value));
  }
  if (typeof value === "string") {
    return value.trim();
  }
  return "";
}

function setLabFeatureAccess(featureId, clientIdValue, enabled) {
  if (!state.labs || !Array.isArray(state.labs.features)) return;
  const normalizedFeatureId = normalizeLabFeatureId(featureId);
  if (!normalizedFeatureId) return;
  const feature = state.labs.features.find(
    item => normalizeLabFeatureId(item?.id) === normalizedFeatureId
  );
  if (!feature) return;
  const normalizedClientId = normalizeLabClientId(clientIdValue);
  if (normalizedClientId === null || normalizedClientId === undefined) return;
  if (!Array.isArray(feature.enabledClientIds)) {
    feature.enabledClientIds = [];
  }
  const targetKey = labClientKey(normalizedClientId);
  if (!targetKey) return;
  const existingIndex = feature.enabledClientIds.findIndex(
    id => labClientKey(id) === targetKey
  );
  const alreadyEnabled = existingIndex !== -1;
  if (enabled && alreadyEnabled) return;
  if (!enabled && !alreadyEnabled) return;
  if (enabled) {
    feature.enabledClientIds.push(normalizedClientId);
  } else {
    feature.enabledClientIds.splice(existingIndex, 1);
  }
  feature.enabledClientIds = feature.enabledClientIds
    .map(id =>
      Number.isFinite(id) ? Number(id) : typeof id === "string" ? id.trim() : id
    )
    .filter((value, index, array) => {
      const key = labClientKey(value);
      if (!key) return false;
      return array.findIndex(candidate => labClientKey(candidate) === key) === index;
    });
  WeldState.saveState(state);
  renderApp();
}

function setLabFeatureAccessForAll(featureId, enabled) {
  if (!state.labs || !Array.isArray(state.labs.features)) return;
  const normalizedFeatureId = normalizeLabFeatureId(featureId);
  if (!normalizedFeatureId) return;
  const feature = state.labs.features.find(
    item => normalizeLabFeatureId(item?.id) === normalizedFeatureId
  );
  if (!feature) return;
  if (!Array.isArray(feature.enabledClientIds)) {
    feature.enabledClientIds = [];
  }
  if (!enabled) {
    if (feature.enabledClientIds.length === 0) return;
    feature.enabledClientIds = [];
    WeldState.saveState(state);
    renderApp();
    return;
  }
  const clients = Array.isArray(state.clients) ? state.clients : [];
  const targetIds = clients
    .map(client => normalizeLabClientId(client?.id))
    .filter(value => labClientKey(value));
  const existingKeys = new Set(feature.enabledClientIds.map(labClientKey).filter(Boolean));
  const targetKeys = new Set(targetIds.map(labClientKey).filter(Boolean));
  let changed = false;
  if (existingKeys.size !== targetKeys.size) {
    changed = true;
  } else {
    existingKeys.forEach(key => {
      if (!targetKeys.has(key)) {
        changed = true;
      }
    });
  }
  if (!changed) return;
  feature.enabledClientIds = targetIds;
  WeldState.saveState(state);
  renderApp();
}

function reportMessage(payload) {
  const origin = payload?.origin || "addin";
  const client = state.clients.find(c => c.id === state.customer.clientId);
  const previousClientSnapshot = client
    ? {
        id: client.id,
        openCases: client.openCases,
        healthScore: client.healthScore,
        lastReportAt: client.lastReportAt ?? null
      }
    : null;
  const pointsOnMessage = 20;
  const pointsOnApproval = client?.pointsOnApproval ?? 80;
  const beforePoints = state.customer.currentPoints;
  const internalMessageId = WeldUtil.generateId("message");
  const messageIdValue =
    typeof payload.messageId === "string" && payload.messageId.trim().length > 0
      ? payload.messageId.trim()
      : WeldUtil.generateId("MSG").toUpperCase();
  const message = {
    id: internalMessageId,
    messageId: messageIdValue,
    subject: payload.subject,
    reporterName: payload.reporterName,
    reporterEmail: payload.reporterEmail,
    clientId: state.customer.clientId,
    reportedAt: new Date().toISOString(),
    status: MessageStatus.PENDING,
    reasons: payload.reasons,
    pointsOnMessage,
    pointsOnApproval,
    additionalNotes: payload.notes || null
  };
  if (payload.activityType) message.activityType = payload.activityType;
  if (payload.channel) message.channel = payload.channel;
  if (payload.incidentLocation) message.incidentLocation = payload.incidentLocation;

  state.messages.unshift(message);
  state.customer.currentPoints += pointsOnMessage;
  message.pointsOnMessage = pointsOnMessage;
  state.meta.lastMessageId = internalMessageId;

  const eligibleBadges = getBadges().filter(badge => badge && badge.icon);
  const badgeBundle = [];
  let primaryBadge = null;
  if (eligibleBadges.length > 0) {
    primaryBadge = selectRandomBadge(state.meta.lastBadgeId);
    if (!primaryBadge) {
      primaryBadge = eligibleBadges[Math.floor(Math.random() * eligibleBadges.length)];
    }
    if (primaryBadge) {
      badgeBundle.push(primaryBadge);
    }
    let extraPool = eligibleBadges.filter(
      badge => !badgeBundle.some(selected => selected && selected.id === badge.id)
    );
    if (extraPool.length > 1) {
      extraPool = extraPool.slice();
      for (let i = extraPool.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [extraPool[i], extraPool[j]] = [extraPool[j], extraPool[i]];
      }
    }
    const maxExtras = Math.min(3, extraPool.length);
    let extrasNeeded = 0;
    if (maxExtras > 0) {
      extrasNeeded = Math.max(1, Math.floor(Math.random() * (maxExtras + 1)));
      extrasNeeded = Math.min(maxExtras, extrasNeeded);
    }
    if (!primaryBadge && extraPool.length > 0) {
      primaryBadge = extraPool.shift();
      if (primaryBadge) {
        badgeBundle.push(primaryBadge);
        if (extrasNeeded > 0) extrasNeeded = Math.max(0, extrasNeeded - 1);
      }
    }
    if (extrasNeeded > 0 && extraPool.length > 0) {
      badgeBundle.push(...extraPool.slice(0, extrasNeeded));
    }
  }
  const badgePointsTotal = badgeBundle.reduce((sum, badge) => {
    const raw = Number(badge?.points);
    return sum + (Number.isFinite(raw) ? raw : 0);
  }, 0);
  if (badgePointsTotal > 0) {
    state.customer.currentPoints += badgePointsTotal;
  }
  const afterPoints = state.customer.currentPoints;
  const totalAwarded = afterPoints - beforePoints;

  if (client) {
    client.openCases += 1;
    client.healthScore = Math.min(client.healthScore + 1, 100);
    client.lastReportAt = message.reportedAt;
  }

  state.meta.lastClientSnapshot = previousClientSnapshot;
  state.meta.lastReportedSubject = payload.subject;
  state.meta.lastReportPoints = pointsOnMessage;
  state.meta.lastBalanceBefore = beforePoints;
  state.meta.lastBalanceAfter = afterPoints;
  state.meta.lastBadgePoints = badgePointsTotal;
  state.meta.lastBadgeId = badgeBundle.length > 0 ? badgeBundle[0].id : null;
  state.meta.lastBadgeIds = badgeBundle.map(badge => badge.id);
  state.meta.lastTotalAwarded = totalAwarded;
  if (origin === "addin") {
    state.meta.addinScreen = "success";
  }
  if (Array.isArray(payload.emergencyFlags) && payload.emergencyFlags.length > 0) {
    message.emergencyFlags = payload.emergencyFlags;
  }
  WeldState.saveState(state);
  renderApp();
  return message;
}

function setupCelebrationReplay(container) {
  const celebration = container.querySelector(".points-celebration");
  if (!celebration) return;
  setupCelebrationSup(celebration, () => animatePointsTicker(celebration));
  const bubble = celebration.querySelector(".points-celebration__bubble");
  if (!bubble || bubble.dataset.replayBound === "true") return;

  bubble.dataset.replayBound = "true";
  bubble.classList.add("points-celebration__bubble--interactive");
  bubble.setAttribute("role", "button");
  bubble.setAttribute("tabindex", "0");
  bubble.setAttribute("aria-label", "Replay celebration animation");

  const restart = () => {
    const replacement = celebration.cloneNode(true);
    const clonedBubble = replacement.querySelector(".points-celebration__bubble");
    if (clonedBubble) {
      delete clonedBubble.dataset.replayBound;
      clonedBubble.classList.remove("points-celebration__bubble--interactive");
      clonedBubble.removeAttribute("role");
      clonedBubble.removeAttribute("tabindex");
      clonedBubble.removeAttribute("aria-label");
    }
    celebration.replaceWith(replacement);
    setupCelebrationSup(replacement, () => animatePointsTicker(replacement));
    setupCelebrationReplay(container);
    const nextBubble = container.querySelector(".points-celebration__bubble");
    if (nextBubble) {
      nextBubble.focus();
    }
  };

  const handleTrigger = event => {
    if (
      event.type === "click" ||
      (event.type === "keydown" && (event.key === "Enter" || event.key === " "))
    ) {
      event.preventDefault();
      restart();
    }
  };

  bubble.addEventListener("click", handleTrigger);
  bubble.addEventListener("keydown", handleTrigger);
}

function revertLastReportAward() {
  if (state.meta.addinScreen !== "success") return;

  const beforeBalance = Number(state.meta.lastBalanceBefore);
  const totalAwarded = Number(state.meta.lastTotalAwarded);

  if (Number.isFinite(beforeBalance)) {
    state.customer.currentPoints = Math.max(0, beforeBalance);
  } else if (Number.isFinite(totalAwarded)) {
    state.customer.currentPoints = Math.max(0, state.customer.currentPoints - totalAwarded);
  }

  const lastMessageId = state.meta.lastMessageId;
  if (lastMessageId) {
    const index = state.messages.findIndex(msg => String(msg.id) === String(lastMessageId));
    if (index !== -1) {
      state.messages.splice(index, 1);
    }
    state.meta.lastMessageId = null;
  }

  const snapshot = state.meta.lastClientSnapshot;
  if (snapshot && typeof snapshot === "object" && Number.isFinite(snapshot.id)) {
    const client = state.clients.find(c => c.id === snapshot.id);
    if (client) {
      if (typeof snapshot.openCases === "number") {
        client.openCases = snapshot.openCases;
      }
      if (typeof snapshot.healthScore === "number") {
        client.healthScore = snapshot.healthScore;
      }
      if (Object.prototype.hasOwnProperty.call(snapshot, "lastReportAt")) {
        client.lastReportAt = snapshot.lastReportAt;
      }
    }
  }

  state.meta.addinScreen = "report";
  state.meta.lastReportedSubject = null;
  state.meta.lastReportPoints = null;
  state.meta.lastBalanceBefore = null;
  state.meta.lastBalanceAfter = null;
  state.meta.lastBadgeId = null;
  state.meta.lastBadgeIds = [];
  state.meta.lastBadgePoints = null;
  state.meta.lastTotalAwarded = null;
  state.meta.lastClientSnapshot = null;

  WeldState.saveState(state);
  renderApp();
}

function animatePointsTicker(root) {
  let ticker = null;
  if (root && typeof root.querySelector === "function") {
    ticker = root.querySelector(".points-ticker");
  }
  if (!ticker) {
    ticker = document.querySelector('[data-points-ticker="total"]');
  }
  if (!ticker) return;
  const valueEl = ticker.querySelector(".points-ticker__value");
  const supEl = ticker.querySelector(".points-ticker__sup");
  if (!valueEl || !supEl) return;

  const targetEndAttr = Number(valueEl.dataset.targetEnd);
  const end = Number.isFinite(targetEndAttr) ? targetEndAttr : Number(ticker.dataset.end);
  if (!Number.isFinite(end)) return;

  if (typeof window === "undefined" || !window.requestAnimationFrame) {
    return;
  }

  const currentAward = Number(supEl.dataset.currentAward) || 0;
  const start = Number(ticker.dataset.start);
  const target = Math.max(start + currentAward, start);
  const finalTarget = Math.max(end, target);

  const duration = 720;
  const startTime = performance.now();
  const change = finalTarget - start;
  if (change <= 0) {
    valueEl.textContent = formatNumber(finalTarget);
    return;
  }

  const easeOutQuart = t => 1 - Math.pow(1 - t, 4);

  const tick = now => {
    const elapsed = Math.min((now - startTime) / duration, 1);
    const eased = easeOutQuart(elapsed);
    const current = Math.round(start + change * eased);
    valueEl.textContent = formatNumber(current);
    if (elapsed < 1) {
      window.requestAnimationFrame(tick);
    } else {
      valueEl.textContent = formatNumber(finalTarget);
    }
  };

  window.requestAnimationFrame(tick);
}

function updateMessageStatus(messageId, status) {
  const target = state.messages.find(msg => String(msg.id) === String(messageId));
  if (!target || target.status === status) return;

  const previousStatus = target.status;
  const wasPending = previousStatus === MessageStatus.PENDING;
  const willBePending = status === MessageStatus.PENDING;
  const affectsCustomer = messageBelongsToCustomer(target);
  if (target.clientId === undefined && affectsCustomer) {
    target.clientId = state.customer.clientId;
  }

  if (previousStatus === MessageStatus.APPROVED && status !== MessageStatus.APPROVED) {
    if (affectsCustomer) {
      state.customer.currentPoints = Math.max(state.customer.currentPoints - target.pointsOnApproval, 0);
    }
  }
  target.status = status;
  if (status === MessageStatus.APPROVED && previousStatus !== MessageStatus.APPROVED) {
    if (affectsCustomer) {
      state.customer.currentPoints += target.pointsOnApproval;
    }
  }

  if (wasPending && !willBePending) {
    const clientId = target.clientId ?? (affectsCustomer ? state.customer.clientId : null);
    const client = clientId ? state.clients.find(c => c.id === clientId) : null;
    if (client && client.openCases > 0) {
      client.openCases -= 1;
    }
  }

  WeldState.saveState(state);
  renderApp();
}

function formatDateTime(iso) {
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function relativeTime(iso) {
  const target = new Date(iso);
  const diff = Date.now() - target.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;

  if (diff < minute) return "just now";
  if (diff < hour) {
    const m = Math.floor(diff / minute);
    return `${m} minute${m === 1 ? "" : "s"} ago`;
  }
  if (diff < day) {
    const h = Math.floor(diff / hour);
    return `${h} hour${h === 1 ? "" : "s"} ago`;
  }
  if (diff < week) {
    const d = Math.floor(diff / day);
    return `${d} day${d === 1 ? "" : "s"} ago`;
  }
  return target.toLocaleDateString();
}

function openDialog({
  title,
  description,
  content,
  confirmLabel,
  onConfirm,
  cancelLabel,
  onCancel,
  tone = "primary"
}) {
  let root = document.getElementById("dialog-root");
  if (!root) {
    root = document.createElement("div");
    root.id = "dialog-root";
  }
  if (root.parentElement !== document.body) {
    document.body.appendChild(root);
  }

  const previousOverflow = document.body.style.overflow;
  document.body.dataset.previousOverflow = previousOverflow;
  document.body.style.overflow = "hidden";

  root.innerHTML = "";

  const backdrop = document.createElement("div");
  backdrop.className = "dialog-backdrop";
  backdrop.setAttribute("role", "dialog");
  backdrop.setAttribute("aria-modal", "true");

  const surface = document.createElement("div");
  surface.className = "dialog-surface";

  const header = document.createElement("header");
  const heading = document.createElement("h2");
  heading.textContent = title || "";
  header.appendChild(heading);
  if (description) {
    const descriptionEl = document.createElement("p");
    descriptionEl.textContent = description;
    header.appendChild(descriptionEl);
  }

  const bodySection = document.createElement("section");
  appendDialogContent(bodySection, content);
  const hasContent = bodySection.childNodes.length > 0;

  const footer = document.createElement("footer");
  footer.className = "dialog-actions";

  let cancelButton = null;
  if (cancelLabel) {
    cancelButton = document.createElement("button");
    cancelButton.className = "button-pill button-pill--ghost";
    cancelButton.dataset.dialogAction = "cancel";
    cancelButton.textContent = cancelLabel;
    footer.appendChild(cancelButton);
  }

  let confirmButton = null;
  if (confirmLabel) {
    confirmButton = document.createElement("button");
    const toneClass = tone === "critical" ? "button-pill--critical" : "button-pill--primary";
    confirmButton.className = `button-pill ${toneClass}`;
    confirmButton.dataset.dialogAction = "confirm";
    confirmButton.textContent = confirmLabel;
    footer.appendChild(confirmButton);
  }

  surface.appendChild(header);
  if (hasContent) {
    surface.appendChild(bodySection);
  }
  surface.appendChild(footer);
  backdrop.appendChild(surface);
  root.appendChild(backdrop);

  function cleanup() {
    backdrop.removeEventListener("click", handleBackdrop);
    document.removeEventListener("keydown", handleKey);
    delete root.__weldDialogCleanup__;
  }

  function close() {
    cleanup();
    root.innerHTML = "";
    const storedOverflow = document.body.dataset.previousOverflow;
    document.body.style.overflow = storedOverflow !== undefined ? storedOverflow : "";
    delete document.body.dataset.previousOverflow;
  }

  function handleBackdrop(event) {
    if (event.target === event.currentTarget) {
      if (onCancel) onCancel();
      close();
    }
  }

  function handleKey(event) {
    if (event.key === "Escape") {
      if (onCancel) onCancel();
      close();
    }
  }

  function appendDialogContent(parent, value) {
    if (value === null || value === undefined) return;
    if (typeof value === "function") {
      appendDialogContent(parent, value());
      return;
    }
    if (Array.isArray(value)) {
      value.forEach(item => appendDialogContent(parent, item));
      return;
    }
    if (typeof Node !== "undefined" && value instanceof Node) {
      parent.appendChild(value);
      return;
    }
    const wrapper = document.createElement("p");
    wrapper.textContent = String(value);
    parent.appendChild(wrapper);
  }

  backdrop.addEventListener("click", handleBackdrop);
  document.addEventListener("keydown", handleKey);
  root.__weldDialogCleanup__ = cleanup;

  if (confirmButton) {
    confirmButton.addEventListener("click", () => {
      if (onConfirm) onConfirm(close);
      else close();
    });
  }

  if (cancelButton) {
    cancelButton.addEventListener("click", () => {
      if (onCancel) onCancel();
      close();
    });
  }
}

function closeDialog() {
  const root = document.getElementById("dialog-root");
  if (!root) return;
  if (typeof root.__weldDialogCleanup__ === "function") {
    root.__weldDialogCleanup__();
  }
  root.innerHTML = "";
  const storedOverflow = document.body.dataset.previousOverflow;
  document.body.style.overflow = storedOverflow !== undefined ? storedOverflow : "";
  delete document.body.dataset.previousOverflow;
}

function buildQuestWalkthroughContent(quest) {
  const walkthrough = quest?.walkthrough;
  if (!walkthrough) {
    return "Walkthrough content coming soon.";
  }
  if (typeof document === "undefined") {
    return "Quest walkthroughs are available in the interactive demo.";
  }

  const container = document.createElement("div");
  container.className = "quest-walkthrough";

  const learningObjectives = Array.isArray(walkthrough.learningObjectives)
    ? walkthrough.learningObjectives.filter(item => typeof item === "string" && item.trim())
    : [];
  const setupSteps =
    walkthrough.setup && Array.isArray(walkthrough.setup.steps)
      ? walkthrough.setup.steps.filter(item => typeof item === "string" && item.trim())
      : [];
  const storyBeats = Array.isArray(walkthrough.storyBeats)
    ? walkthrough.storyBeats.filter(beat => beat && (beat.title || beat.scenario || beat.prompt || beat.idealAction))
    : [];
  const instrumentation = Array.isArray(walkthrough.instrumentation)
    ? walkthrough.instrumentation.filter(entry => entry && (entry.label || entry.detail))
    : [];
  const followUpActions =
    walkthrough.followUp && Array.isArray(walkthrough.followUp.actions)
      ? walkthrough.followUp.actions.filter(item => typeof item === "string" && item.trim())
      : [];
  const demoTips = Array.isArray(walkthrough.demoTips)
    ? walkthrough.demoTips.filter(item => typeof item === "string" && item.trim())
    : [];

  function createSection(title) {
    const section = document.createElement("section");
    section.className = "quest-walkthrough__section";
    if (title) {
      const heading = document.createElement("h3");
      heading.textContent = title;
      section.appendChild(heading);
    }
    return section;
  }

  function createDetailParagraph(label, value) {
    if (!value) return null;
    const paragraph = document.createElement("p");
    paragraph.className = "quest-walkthrough__detail";
    if (label) {
      const strong = document.createElement("strong");
      const normalized = label.endsWith(":") ? label : `${label}:`;
      strong.textContent = normalized;
      paragraph.appendChild(strong);
      paragraph.appendChild(document.createTextNode(` ${value}`));
    } else {
      paragraph.textContent = value;
    }
    return paragraph;
  }

  if (walkthrough.summary) {
    const summary = document.createElement("p");
    summary.className = "quest-walkthrough__summary";
    summary.textContent = walkthrough.summary;
    container.appendChild(summary);
  }

  if (learningObjectives.length) {
    const section = createSection("Learning objectives");
    const list = document.createElement("ul");
    list.className = "quest-walkthrough__list";
    learningObjectives.forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      list.appendChild(li);
    });
    section.appendChild(list);
    container.appendChild(section);
  }

  if (walkthrough.setup && (walkthrough.setup.narrative || setupSteps.length)) {
    const section = createSection("How to set it up");
    if (walkthrough.setup.narrative) {
      const narrative = document.createElement("p");
      narrative.textContent = walkthrough.setup.narrative;
      section.appendChild(narrative);
    }
    if (setupSteps.length) {
      const list = document.createElement("ol");
      list.className = "quest-walkthrough__list quest-walkthrough__list--numbered";
      setupSteps.forEach(step => {
        const li = document.createElement("li");
        li.textContent = step;
        list.appendChild(li);
      });
      section.appendChild(list);
    }
    container.appendChild(section);
  }

  if (storyBeats.length) {
    const section = createSection("Story beats");
    const list = document.createElement("ol");
    list.className = "quest-walkthrough__beats";
    storyBeats.forEach(beat => {
      const item = document.createElement("li");
      item.className = "quest-walkthrough__beat";
      if (beat.title) {
        const heading = document.createElement("h4");
        heading.textContent = beat.title;
        item.appendChild(heading);
      }
      const scenario = createDetailParagraph("Scenario", beat.scenario);
      if (scenario) item.appendChild(scenario);
      const prompt = createDetailParagraph("Prompt", beat.prompt);
      if (prompt) item.appendChild(prompt);
      const ideal = createDetailParagraph("Ideal action", beat.idealAction);
      if (ideal) item.appendChild(ideal);
      const callout = createDetailParagraph("Callout", beat.callout);
      if (callout) item.appendChild(callout);
      list.appendChild(item);
    });
    section.appendChild(list);
    container.appendChild(section);
  }

  if (instrumentation.length) {
    const section = createSection("Instrumentation & signals");
    const list = document.createElement("ul");
    list.className = "quest-walkthrough__list quest-walkthrough__list--dense";
    instrumentation.forEach(entry => {
      const li = document.createElement("li");
      if (entry.label) {
        const strong = document.createElement("strong");
        strong.textContent = entry.label;
        li.appendChild(strong);
      }
      if (entry.detail) {
        const span = document.createElement("span");
        span.textContent = entry.detail;
        li.appendChild(span);
      }
      list.appendChild(li);
    });
    section.appendChild(list);
    container.appendChild(section);
  }

  if (walkthrough.followUp && (walkthrough.followUp.highlight || followUpActions.length)) {
    const section = createSection("Bring it home");
    if (walkthrough.followUp.highlight) {
      const highlight = document.createElement("p");
      highlight.textContent = walkthrough.followUp.highlight;
      section.appendChild(highlight);
    }
    if (followUpActions.length) {
      const list = document.createElement("ul");
      list.className = "quest-walkthrough__list";
      followUpActions.forEach(action => {
        const li = document.createElement("li");
        li.textContent = action;
        list.appendChild(li);
      });
      section.appendChild(list);
    }
    container.appendChild(section);
  }

  if (demoTips.length) {
    const section = createSection("Demo tips");
    const list = document.createElement("ul");
    list.className = "quest-walkthrough__list quest-walkthrough__list--bullet";
    demoTips.forEach(tip => {
      const li = document.createElement("li");
      li.textContent = tip;
      list.appendChild(li);
    });
    section.appendChild(list);
    container.appendChild(section);
  }

  return container;
}

function openQuestWalkthrough(questId) {
  const quest = questById(questId);
  if (!quest || !quest.walkthrough) return false;
  const description = quest.description || quest.walkthrough.summary || "";
  openDialog({
    title: `${quest.title || "Quest"} walkthrough`,
    description,
    content: () => buildQuestWalkthroughContent(quest),
    confirmLabel: "Close",
    onConfirm: close => close()
  });
  return true;
}

function buildQuestConfigContent(quest) {
  if (typeof document === "undefined") {
    return "Quest configuration is available in the live demo.";
  }

  const container = document.createElement("div");
  container.className = "quest-config";

  const metaList = document.createElement("ul");
  metaList.className = "quest-config__meta";
  const metaEntries = [
    { label: "Difficulty", value: quest.difficulty || "Starter" },
    { label: "Format", value: quest.format || "Interactive" },
    {
      label: "Status",
      value: quest.published ? "Published to hubs" : "Draft only"
    },
    { label: "Duration", value: `${formatNumber(Number(quest.duration) || 0)} min` },
    { label: "Questions", value: formatNumber(Number(quest.questions) || 0) }
  ];

  metaEntries.forEach(entry => {
    const li = document.createElement("li");
    const label = document.createElement("span");
    label.textContent = entry.label;
    const value = document.createElement("strong");
    value.textContent = entry.value;
    li.appendChild(label);
    li.appendChild(value);
    metaList.appendChild(li);
  });
  container.appendChild(metaList);

  const actions = document.createElement("div");
  actions.className = "quest-config__actions";
  const baseQuestPoints = Number(quest.points) || 0;

  const completionBtn = document.createElement("button");
  completionBtn.type = "button";
  completionBtn.className = "button-pill button-pill--ghost quest-config__action";
  completionBtn.textContent = "Simulate completion";
  completionBtn.addEventListener("click", () => {
    const result = completeQuest(quest.id);
    closeDialog();
    requestAnimationFrame(() => {
      if (!result.success) {
        openDialog({
          title: "Unable to complete quest",
          description: result.reason || "Please try again.",
          confirmLabel: "Close",
          onConfirm: close => close()
        });
        return;
      }
      const pointsLabel = formatNumber(result.awardedPoints);
      const baseLabel = formatNumber(baseQuestPoints);
      const completionMoment = formatDateTime(result.completedAt);
      const successTitle = result.doubled ? "Double points applied" : "Quest completion recorded";
      const successDescription = result.doubled
        ? `First quest completed this month (${completionMoment}) delivered ${pointsLabel} points instead of the usual ${baseLabel}.`
        : `Quest completion logged on ${completionMoment} for ${pointsLabel} points.`;
      openDialog({
        title: successTitle,
        description: successDescription,
        confirmLabel: "Back to hub",
        onConfirm: close => close()
      });
    });
  });
  actions.appendChild(completionBtn);

  if (quest.walkthrough) {
    const walkthroughBtn = document.createElement("button");
    walkthroughBtn.type = "button";
    walkthroughBtn.className = "button-pill button-pill--primary quest-config__action";
    walkthroughBtn.textContent = "View walkthrough";
    walkthroughBtn.addEventListener("click", () => {
      closeDialog();
      requestAnimationFrame(() => {
        openQuestWalkthrough(quest.id);
      });
    });
    actions.appendChild(walkthroughBtn);
  } else {
    const noWalkthrough = document.createElement("p");
    noWalkthrough.className = "quest-config__hint";
    noWalkthrough.textContent = "Walkthrough coming soon for this quest.";
    actions.appendChild(noWalkthrough);
  }

  container.appendChild(actions);
  return container;
}

function openQuestConfig(questId) {
  const quest = questById(questId);
  if (!quest) return false;
  const title = quest.title ? `${quest.title} controls` : "Quest controls";
  openDialog({
    title,
    description: "Configure how this quest appears in the demo catalogue.",
    content: () => buildQuestConfigContent(quest),
    confirmLabel: "Close",
    onConfirm: close => close()
  });
  return true;
}

function buildRewardConfigContent(reward) {
  if (typeof document === "undefined") {
    return "Reward configuration is available in the interactive demo.";
  }

  const form = document.createElement("form");
  form.className = "reward-config";
  form.addEventListener("submit", event => event.preventDefault());

  const intro = document.createElement("p");
  intro.className = "reward-config__intro";
  intro.textContent = "Adjust the catalogue-facing reward cost and remaining quantity.";
  form.appendChild(intro);

  const fields = document.createElement("div");
  fields.className = "reward-config__fields";

  const remainingField = document.createElement("label");
  remainingField.className = "reward-config__field";
  const remainingLabel = document.createElement("span");
  remainingLabel.textContent = "Remaining";
  const remainingInput = document.createElement("input");
  remainingInput.type = "number";
  remainingInput.min = "0";
  remainingInput.step = "1";
  remainingInput.dataset.rewardConfig = "remaining";
  if (reward.unlimited === true) {
    remainingInput.value = "";
    remainingInput.placeholder = "Unlimited";
  } else if (Number.isFinite(Number(reward.remaining))) {
    remainingInput.value = String(Math.max(0, Number(reward.remaining)));
    remainingInput.placeholder = "0";
  } else {
    remainingInput.value = "0";
    remainingInput.placeholder = "0";
  }
  remainingField.appendChild(remainingLabel);
  remainingField.appendChild(remainingInput);

  const unlimitedField = document.createElement("label");
  unlimitedField.className = "reward-config__checkbox";
  const unlimitedInput = document.createElement("input");
  unlimitedInput.type = "checkbox";
  unlimitedInput.dataset.rewardConfig = "unlimited";
  unlimitedInput.checked = reward.unlimited === true;
  const unlimitedLabel = document.createElement("span");
  unlimitedLabel.textContent = "Unlimited redemptions";
  unlimitedField.appendChild(unlimitedInput);
  unlimitedField.appendChild(unlimitedLabel);

  const pointsField = document.createElement("label");
  pointsField.className = "reward-config__field";
  const pointsLabel = document.createElement("span");
  pointsLabel.textContent = "Points cost";
  const pointsInput = document.createElement("input");
  pointsInput.type = "number";
  pointsInput.min = "0";
  pointsInput.step = "1";
  pointsInput.dataset.rewardConfig = "points";
  pointsInput.value = Number.isFinite(Number(reward.pointsCost))
    ? String(Math.max(0, Number(reward.pointsCost)))
    : "0";
  pointsField.appendChild(pointsLabel);
  pointsField.appendChild(pointsInput);

  fields.appendChild(remainingField);
  fields.appendChild(pointsField);
  form.appendChild(fields);
  form.appendChild(unlimitedField);

  const guidance = document.createElement("p");
  guidance.className = "reward-config__hint";
  guidance.textContent = "When unlimited is enabled, the remaining count is hidden from the reporter hub.";
  form.appendChild(guidance);

  const error = document.createElement("p");
  error.className = "reward-config__error";
  error.hidden = true;
  form.appendChild(error);

  function syncRemainingState() {
    const unlimited = unlimitedInput.checked;
    remainingInput.disabled = unlimited;
    if (unlimited) {
      remainingInput.value = "";
      remainingInput.placeholder = "Unlimited";
    } else {
      if (remainingInput.value === "") {
        remainingInput.value = "0";
      }
      remainingInput.placeholder = "0";
    }
  }

  unlimitedInput.addEventListener("change", () => {
    syncRemainingState();
  });
  syncRemainingState();

  form.__rewardConfigRefs = {
    remainingInput,
    pointsInput,
    unlimitedInput,
    errorNode: error
  };

  return form;
}

function openRewardConfig(rewardId) {
  const reward = rewardById(rewardId);
  if (!reward) return false;
  const title = reward.name ? `${reward.name} controls` : "Reward controls";
  let configForm = null;
  openDialog({
    title,
    description: "Configure the reward's presentation for the demo catalogue.",
    content: () => {
      const node = buildRewardConfigContent(reward);
      if (node instanceof HTMLElement) {
        configForm = node;
      } else {
        configForm = null;
      }
      return node;
    },
    confirmLabel: "Save changes",
    cancelLabel: "Cancel",
    onConfirm: close => {
      if (!configForm || !(configForm instanceof HTMLElement)) {
        close();
        return;
      }
      const refs = configForm.__rewardConfigRefs || {};
      const remainingInput = refs.remainingInput;
      const pointsInput = refs.pointsInput;
      const unlimitedInput = refs.unlimitedInput;
      const errorNode = refs.errorNode;

      const showError = message => {
        if (errorNode) {
          errorNode.textContent = message;
          errorNode.hidden = false;
        }
      };
      if (errorNode) {
        errorNode.hidden = true;
      }

      const unlimited = unlimitedInput ? unlimitedInput.checked === true : false;

      let remainingValue = null;
      if (!unlimited && remainingInput) {
        const rawRemaining = (remainingInput.value || "").trim();
        if (rawRemaining.length === 0) {
          showError("Enter the number of rewards remaining or enable unlimited redemptions.");
          remainingInput.focus();
          return;
        }
        const parsedRemaining = Number(rawRemaining);
        if (!Number.isFinite(parsedRemaining) || parsedRemaining < 0) {
          showError("Remaining must be a non-negative number.");
          remainingInput.focus();
          return;
        }
        remainingValue = Math.round(parsedRemaining);
      }

      if (!pointsInput) {
        close();
        return;
      }
      const rawPoints = (pointsInput.value || "").trim();
      if (rawPoints.length === 0) {
        showError("Enter a points cost for this reward.");
        pointsInput.focus();
        return;
      }
      const parsedPoints = Number(rawPoints);
      if (!Number.isFinite(parsedPoints) || parsedPoints < 0) {
        showError("Points cost must be a non-negative number.");
        pointsInput.focus();
        return;
      }
      const pointsValue = Math.round(parsedPoints);

      reward.pointsCost = pointsValue;
      if (unlimited) {
        reward.unlimited = true;
      } else {
        reward.unlimited = false;
        reward.remaining = remainingValue ?? 0;
      }

      WeldState.saveState(state);
      renderApp();
      close();
    }
  });
  return true;
}

function renderGlobalNav(activeRoute) {
  return `
    <nav class="global-nav" aria-label="Primary navigation">
      <button type="button" class="brand global-nav__brand" id="brand-button">
        <span class="brand__glyph">W</span>
        <span>WeldSecure</span>
      </button>
      <div class="global-nav__groups">
        ${NAV_GROUPS.map(group => {
          const isGroupActive = group.items.some(item => item.route === activeRoute);
          return `
            <div class="global-nav__group ${isGroupActive ? "global-nav__group--active" : ""}">
              <button type="button" class="global-nav__trigger" data-group="${group.label}">
                ${group.label}
                <span class="global-nav__caret" aria-hidden="true"></span>
              </button>
              <div class="global-nav__menu" role="menu">
                ${group.items
                  .map(item => {
                    const isActive = activeRoute === item.route;
                    const ariaCurrent = isActive ? 'aria-current="page"' : "";
                    const roleAttr = item.role ? ` data-role="${item.role}"` : "";
                    return `
                      <button type="button" role="menuitem" class="global-nav__item ${isActive ? "global-nav__item--active" : ""}" data-route="${item.route}"${roleAttr} ${ariaCurrent}>
                        ${item.label}
                      </button>
                    `;
                  })
                  .join("")}
              </div>
            </div>
          `;
        }).join("")}
      </div>
      <div class="global-nav__actions">
        <button type="button" class="button-pill button-pill--primary global-nav__reset" id="global-reset">
          Reset
        </button>
        <button
        type="button"
        class="global-nav__icon-button"
        id="global-settings"
        aria-label="Open settings"
        data-settings-toggle
      >
        <svg class="global-nav__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            d="M10.325 4.317c.427-1.756 3.002-1.756 3.429 0a1.72 1.72 0 002.586 1.066c1.544-.89 3.31.876 2.42 2.42a1.72 1.72 0 001.065 2.572c1.756.426 1.756 3.002 0 3.429a1.72 1.72 0 00-1.066 2.586c.89 1.544-.876 3.31-2.42 2.42a1.72 1.72 0 00-2.586 1.065c-.426 1.756-3.002 1.756-3.429 0a1.72 1.72 0 00-2.586-1.066c-1.544.89-3.31-.876-2.42-2.42a1.72 1.72 0 00-1.065-2.586c-1.756-.426-1.756-3.002 0-3.429a1.72 1.72 0 001.066-2.586c-.89-1.544.876-3.31 2.42-2.42a1.72 1.72 0 002.586-1.065z"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          ></path>
          <circle
            cx="12"
            cy="12"
            r="3"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          ></circle>
        </svg>
      </button>
    </div>
  </nav>
`;
}

function renderHubBadgeCard(badge) {
  if (!badge) return "";
  const rawId = String(badge.id ?? WeldUtil.generateId("badge"));
  const normalizedId = rawId.trim().length > 0 ? rawId.trim() : WeldUtil.generateId("badge");
  const safeDataId = WeldUtil.escapeHtml(normalizedId);
  const sanitizedId = normalizedId.replace(/[^a-zA-Z0-9:_-]/g, "-");
  const cardId = WeldUtil.escapeHtml(`${sanitizedId}-card`);
  const toneKey = BADGE_TONES[badge.tone] ? badge.tone : "violet";
  const tone = BADGE_TONES[toneKey] || BADGE_TONES.violet;
  const iconBackdrop =
    BADGE_ICON_BACKDROPS[toneKey]?.background ||
    BADGE_ICON_BACKDROPS.violet?.background ||
    "linear-gradient(135deg, #c7d2fe, #818cf8)";
  const iconShadow =
    BADGE_ICON_BACKDROPS[toneKey]?.shadow ||
    BADGE_ICON_BACKDROPS.violet?.shadow ||
    "rgba(79, 70, 229, 0.32)";
  const normalizedCategory =
    typeof badge.category === "string" && badge.category.trim().length > 0
      ? badge.category.trim()
      : "Badge";
  const difficultyLabel =
    typeof badge.difficulty === "string" && badge.difficulty.trim().length > 0
      ? badge.difficulty.trim()
      : null;
  const tags = [];
  if (normalizedCategory && normalizedCategory !== "Badge") {
    tags.push(`<span class="catalogue-card__tag gem-badge-card__tag">${WeldUtil.escapeHtml(normalizedCategory)}</span>`);
  }
  if (difficultyLabel) {
    tags.push(`<span class="catalogue-card__tag gem-badge-card__tag">${WeldUtil.escapeHtml(difficultyLabel)}</span>`);
  }
  const tagsMarkup = tags.length
    ? `<div class="gem-badge-card__tags catalogue-card__tags">${tags.join("")}</div>`
    : "";
  const pointsValue = Number(badge.points) || 0;
  const toggleTitle = difficultyLabel
    ? `${WeldUtil.escapeHtml(difficultyLabel)}  ${formatNumber(pointsValue)} pts`
    : `${formatNumber(pointsValue)} pts`;
  const ariaLabel = `${badge.title} badge, worth ${formatNumber(pointsValue)} points in the collection.`;

  return `
    <article
      class="gem-badge gem-badge--hub"
      data-badge="${safeDataId}"
      style="--badge-tone:${WeldUtil.escapeHtml(tone)};--badge-icon-tone:${WeldUtil.escapeHtml(iconBackdrop)};--badge-icon-shadow:${WeldUtil.escapeHtml(
        iconShadow
      )};">
      <button
        type="button"
        class="gem-badge__trigger"
        aria-haspopup="true"
        aria-label="${WeldUtil.escapeHtml(badge.title)} badge details"
        aria-controls="${cardId}"
        title="${WeldUtil.escapeHtml(toggleTitle)}">
        <span class="gem-badge__icon" style="background:${iconBackdrop}; box-shadow:0 18px 32px ${iconShadow};">
          ${WeldUtil.renderIcon(badge.icon || "medal", "sm")}
        </span>
      </button>
      <span class="gem-badge__label">${WeldUtil.escapeHtml(badge.title)}</span>
      <div id="${cardId}" class="gem-badge-card gem-badge-card--hub" role="group" aria-label="${WeldUtil.escapeHtml(ariaLabel)}">
        <span class="gem-badge-card__halo"></span>
        <span class="gem-badge-card__orb gem-badge-card__orb--one"></span>
        <span class="gem-badge-card__orb gem-badge-card__orb--two"></span>
        <div class="gem-badge-card__main">
          <h3 class="gem-badge-card__title">${WeldUtil.escapeHtml(badge.title)}</h3>
          ${tagsMarkup}
          <p class="gem-badge-card__description">${WeldUtil.escapeHtml(badge.description)}</p>
        </div>
        <footer class="gem-badge-card__footer">
          <span class="gem-badge-card__points">
            <span class="gem-badge-card__points-value">+${formatNumber(pointsValue)}</span>
            <span class="gem-badge-card__points-unit">pts</span>
          </span>
        </footer>
      </div>
    </article>
  `;
}

function renderRecognitionCard(entry, currentEmail) {
  if (!entry) return "";
  const currentKey = typeof currentEmail === "string" ? currentEmail.trim().toLowerCase() : "";
  const recipientEmail =
    typeof entry.recipientEmail === "string" ? entry.recipientEmail.trim() : "";
  const senderName = entry.senderName || entry.senderEmail || "Teammate";
  const recipientName = entry.recipientName || recipientEmail || "Teammate";
  const isForCurrentUser =
    currentKey && recipientEmail && recipientEmail.toLowerCase() === currentKey;
  const pointsValue = Number(entry.points) || 0;
  const pointsMarkup =
    pointsValue > 0
      ? `<span class="recognition-card__points">+${formatNumber(pointsValue)} pts</span>`
      : "";
  const focusLabel =
    typeof entry.focus === "string" && entry.focus.trim().length > 0
      ? entry.focus.trim()
      : "Recognition spotlight";
  const channelLabel =
    typeof entry.channel === "string" && entry.channel.trim().length > 0
      ? entry.channel.trim()
      : null;
  const contextLabel = isForCurrentUser ? "For you" : `For ${recipientName}`;
  const createdAt = typeof entry.createdAt === "string" ? entry.createdAt : "";
  const parsedDate = createdAt ? new Date(createdAt) : null;
  const hasValidDate = parsedDate && !Number.isNaN(parsedDate.getTime());
  const relativeLabel = hasValidDate ? relativeTime(createdAt) : "Just now";
  const absoluteLabel = hasValidDate ? formatDateTime(createdAt) : "";
  const timeMarkup = hasValidDate
    ? `<time datetime="${WeldUtil.escapeHtml(createdAt)}" title="${WeldUtil.escapeHtml(absoluteLabel)}">${WeldUtil.escapeHtml(
        relativeLabel
      )}</time>`
    : `<span class="recognition-card__time">Just now</span>`;
  const tagMarkup = channelLabel
    ? `<span class="recognition-card__tag">${WeldUtil.escapeHtml(channelLabel)}</span>`
    : "";
  const entryId =
    entry?.id !== undefined && entry?.id !== null
      ? WeldUtil.escapeHtml(String(entry.id))
      : WeldUtil.escapeHtml(WeldUtil.generateId("recognition"));

  return `
    <article class="recognition-card${isForCurrentUser ? " recognition-card--highlight" : ""}" data-recognition="${entryId}">
      <header class="recognition-card__header">
        <span class="recognition-card__eyebrow">${WeldUtil.escapeHtml(contextLabel)}</span>
        ${tagMarkup}
        ${pointsMarkup}
      </header>
      <div class="recognition-card__body">
        <h4 class="recognition-card__title">${WeldUtil.escapeHtml(focusLabel)}</h4>
        <p class="recognition-card__message">${WeldUtil.escapeHtml(entry.message || "")}</p>
      </div>
      <footer class="recognition-card__footer">
        <div class="recognition-card__actors">
          <span>${WeldUtil.escapeHtml(senderName)}</span>
          <span aria-hidden="true">&rarr;</span>
          <span>${WeldUtil.escapeHtml(recipientName)}</span>
        </div>
        ${timeMarkup}
      </footer>
    </article>
  `;
}

function renderCustomer() {
  const customerMessages = state.messages.filter(messageBelongsToCustomer);
  const pendingMessages = customerMessages.filter(message => message.status === MessageStatus.PENDING);
  const pendingApprovalPoints = pendingMessages.reduce((sum, message) => sum + (message.pointsOnApproval || 0), 0);
  const publishedRewards = state.rewards.filter(reward => reward.published);
  const publishedQuests = Array.isArray(state.quests)
    ? state.quests.filter(quest => quest.published).sort(WeldUtil.compareQuestsByDifficulty)
    : [];
  const publishedBadges = getBadges().filter(badge => badge.published);
  const bonusConfig = state.customer?.bonusPoints || {};
  const rawCap = Number(bonusConfig.weeklyCap);
  const weeklyCap = Math.max(0, Number.isFinite(rawCap) ? rawCap : 0);
  const earnedRaw = Number(
    bonusConfig.earnedThisWeek ?? bonusConfig.earned ?? bonusConfig.current ?? 0
  );
  const earnedThisWeek = Math.max(0, Number.isFinite(earnedRaw) ? earnedRaw : 0);
  const progressPercent =
    weeklyCap > 0 ? Math.min(100, Math.round((earnedThisWeek / weeklyCap) * 100)) : 0;
  const remainingThisWeek = weeklyCap > 0 ? Math.max(0, weeklyCap - earnedThisWeek) : 0;
  const bonusProgressLabel =
    weeklyCap > 0
      ? `Bonus points earned this week: ${formatNumber(earnedThisWeek)} of ${formatNumber(weeklyCap)} points.`
      : `Bonus points earned this week: ${formatNumber(earnedThisWeek)} points.`;
  const breakdownEntries = Array.isArray(bonusConfig.breakdown) ? bonusConfig.breakdown : [];
  const doublePointsTotal = breakdownEntries.reduce((sum, entry) => {
    if (!entry || entry.firstOfMonthDouble !== true) return sum;
    const value = Number(entry.points);
    return sum + (Number.isFinite(value) ? value : 0);
  }, 0);
  const boostPercentOfTrackRaw =
    weeklyCap > 0 ? Math.round((doublePointsTotal / weeklyCap) * 100) : 0;
  const boostPercentOfTrack = Math.max(
    0,
    Math.min(progressPercent, boostPercentOfTrackRaw)
  );
  const boostActive = boostPercentOfTrack > 0;
  const boostDescription = boostActive
    ? `Double points segment: ${formatNumber(doublePointsTotal)} bonus points.`
    : "";
  const boostMarkup = boostActive
    ? `<span class="points-bonus__meter-boost" style="--bonus-boost:${boostPercentOfTrack}%;" aria-label="${WeldUtil.escapeHtml(
        boostDescription
      )}">
        <span class="points-bonus__boost-label" aria-hidden="true">x2</span>
      </span>`
    : "";
  const bonusMeterLabel = boostActive
    ? `${bonusProgressLabel} Includes an orange x2 segment representing ${formatNumber(doublePointsTotal)} double points.`
    : bonusProgressLabel;
  let bonusSourcesCount = 0;
  const bonusBreakdownMarkup = (() => {
    const items = breakdownEntries
      .map((entry, index) => {
        if (!entry || typeof entry !== "object") return null;
        const label =
          typeof entry.label === "string" && entry.label.trim().length > 0 ? entry.label.trim() : "";
        if (!label) return null;
        const normalizedId =
          typeof entry.id === "string" && entry.id.trim().length > 0
            ? entry.id.trim()
            : `bonus-source-${index + 1}`;
        const description =
          typeof entry.description === "string" && entry.description.trim().length > 0
            ? entry.description.trim()
            : "";
        const pointsValue = Number(entry.points);
        const points = Number.isFinite(pointsValue) ? pointsValue : 0;
        const isDouble = entry.firstOfMonthDouble === true;
        const tooltipParts = [];
        if (description) tooltipParts.push(description);
        const pointsLabel = `+${formatNumber(points)} pts${isDouble ? " (double)" : ""}`;
        tooltipParts.push(pointsLabel);
        if (isDouble) {
          tooltipParts.push("First quest completion this month delivered double points.");
        }
        const tooltipText = tooltipParts.join(" � ");
        const sourceClasses = [
          "points-bonus__source",
          isDouble ? "points-bonus__source--boost" : ""
        ]
          .filter(Boolean)
          .join(" ");
        const boostBadge = isDouble
          ? `<span class="points-bonus__source-boost" aria-hidden="true">x2</span>`
          : "";
        return `
          <span
            class="${sourceClasses}"
            role="listitem"
            tabindex="0"
            data-source="${WeldUtil.escapeHtml(normalizedId)}"
            data-tooltip="${WeldUtil.escapeHtml(tooltipText)}"
            title="${WeldUtil.escapeHtml(tooltipText)}"
            aria-label="${WeldUtil.escapeHtml(tooltipText)}">
            <span class="points-bonus__source-label">${WeldUtil.escapeHtml(label)}</span>
            ${boostBadge}
            <span class="points-bonus__source-points">+${formatNumber(points)} pts</span>
          </span>
        `;
      })
      .filter(Boolean);
    bonusSourcesCount = items.length;
    if (items.length === 0) {
      return `<p class="points-bonus__empty">Activate quests and behaviour nudges to unlock bonus point sources.</p>`;
    }
    return `<div class="points-bonus__sources" role="list">${items.join("")}</div>`;
  })();
  const bonusHoverNote =
    bonusSourcesCount > 0
      ? `<p class="points-bonus__note">Hover or focus a source to see this week's bonus story.</p>`
      : "";
  const remainingLabelMarkup =
    weeklyCap > 0
      ? remainingThisWeek === 0
        ? `<span class="points-bonus__meter-remaining points-bonus__meter-remaining--met">Cap reached</span>`
        : `<span class="points-bonus__meter-remaining">${formatNumber(remainingThisWeek)} pts left</span>`
      : `<span class="points-bonus__meter-remaining">No cap set</span>`;
  const bonusCapLabel = weeklyCap > 0 ? `${formatNumber(weeklyCap)} pt cap` : "No cap set";
  const bonusScaleHtml = `
      <div class="points-bonus" role="region" aria-label="Weekly bonus points">
        <div class="points-bonus__header">
          <h3>Weekly bonus points</h3>
          <span class="points-bonus__cap">${WeldUtil.escapeHtml(bonusCapLabel)}</span>
        </div>
        <p class="points-bonus__summary">
          Earn extra points from quests and team boosts. Reporting suspicious emails always awards your core points outside this cap.
        </p>
        <div class="points-bonus__meter" role="img" aria-label="${WeldUtil.escapeHtml(bonusMeterLabel)}">
          <div class="points-bonus__meter-track">
            <span class="points-bonus__meter-fill" style="--bonus-progress:${progressPercent}%;"></span>
            ${boostMarkup}
          </div>
          <div class="points-bonus__meter-labels">
            <span class="points-bonus__meter-value">+${formatNumber(earnedThisWeek)} pts</span>
            ${remainingLabelMarkup}
          </div>
        </div>
        ${bonusBreakdownMarkup}
        ${bonusHoverNote}
      </div>
    `;

  const recognitionEntries = getRecognitions()
    .slice()
    .sort(
      (a, b) =>
        new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime()
    );
  const lowerCustomerEmail =
    typeof state.customer?.email === "string"
      ? state.customer.email.trim().toLowerCase()
      : "";
  const recognitionReceived = lowerCustomerEmail
    ? recognitionEntries.filter(entry => {
        const email =
          typeof entry.recipientEmail === "string"
            ? entry.recipientEmail.trim().toLowerCase()
            : "";
        return email === lowerCustomerEmail;
      })
    : [];
  const recognitionGiven = lowerCustomerEmail
    ? recognitionEntries.filter(entry => {
        const email =
          typeof entry.senderEmail === "string"
            ? entry.senderEmail.trim().toLowerCase()
            : "";
        return email === lowerCustomerEmail;
      })
    : [];
  const recognitionPointsTotal = recognitionReceived.reduce(
    (sum, entry) => sum + (Number(entry.points) || 0),
    0
  );
  const recognitionGivenPoints = recognitionGiven.reduce(
    (sum, entry) => sum + (Number(entry.points) || 0),
    0
  );
  const recognitionPeerCount = (() => {
    const peers = new Set();
    recognitionReceived.forEach(entry => {
      const email =
        typeof entry.senderEmail === "string"
          ? entry.senderEmail.trim().toLowerCase()
          : "";
      if (email) peers.add(email);
    });
    return peers.size;
  })();
  const validRecognitionFilters = ["received", "given", "all"];
  const storedFilter =
    typeof state.meta.recognitionFilter === "string"
      ? state.meta.recognitionFilter.trim().toLowerCase()
      : "";
  const activeRecognitionFilter = validRecognitionFilters.includes(storedFilter)
    ? storedFilter
    : "received";
  const recognitionFeedSource =
    activeRecognitionFilter === "received"
      ? recognitionReceived
      : activeRecognitionFilter === "given"
      ? recognitionGiven
      : recognitionEntries;
  const recognitionFeedEntries = recognitionFeedSource.slice(0, 4);
  const recognitionEmptyCopy =
    activeRecognitionFilter === "given"
      ? "Share a recognition note to spotlight a teammate's vigilance, award bonus points, and trigger a x2 quest boost for you both."
      : activeRecognitionFilter === "received"
      ? "No teammate recognition yet. Highlight a story to invite recognition from the wider team and unlock that x2 quest boost."
      : "Recognition moments will appear here as teams swap kudos and line up double quest points.";
  const recognitionFeedMarkup = recognitionFeedEntries.length
    ? recognitionFeedEntries
        .map(entry => renderRecognitionCard(entry, state.customer.email))
        .join("")
    : `<div class="recognition-empty"><p>${WeldUtil.escapeHtml(recognitionEmptyCopy)}</p></div>`;
  const recognitionFilterButtons = [
    { id: "received", label: "Got" },
    { id: "given", label: "Gave" },
    { id: "all", label: "All" }
  ]
    .map(filter => {
      const isActive = activeRecognitionFilter === filter.id;
      return `<button type="button" class="recognition-filter${isActive ? " recognition-filter--active" : ""}" data-recognition-filter="${filter.id}">${WeldUtil.escapeHtml(filter.label)}</button>`;
    })
    .join("");
  const recognitionControlsMarkup = `
    <div class="recognition-feed__controls" role="toolbar" aria-label="Filter recognition stories">
      ${recognitionFilterButtons}
    </div>
  `;
  const latestRecognition = recognitionReceived[0] || null;
  const latestSnippet = (() => {
    if (!latestRecognition) {
      return `<div class="recognition-summary__recent recognition-summary__recent--placeholder"><p>Encourage peers to celebrate your catches and they'll appear here.</p></div>`;
    }
    const iso =
      typeof latestRecognition.createdAt === "string"
        ? latestRecognition.createdAt
        : "";
    const parsed = iso ? new Date(iso) : null;
    const hasValidDate = parsed && !Number.isNaN(parsed.getTime());
    const relativeLabel = hasValidDate ? relativeTime(iso) : "Just now";
    const message =
      typeof latestRecognition.message === "string"
        ? latestRecognition.message.trim()
        : "";
    const snippet =
      message.length > 120 ? `${message.slice(0, 117)}...` : message;
    const senderLabel =
      latestRecognition.senderName ||
      latestRecognition.senderEmail ||
      "Teammate";
    const focusLabel =
      typeof latestRecognition.focus === "string" &&
      latestRecognition.focus.trim().length > 0
        ? latestRecognition.focus.trim()
        : "";
    const focusMarkup = focusLabel ? ` - ${WeldUtil.escapeHtml(focusLabel)}` : "";
    const snippetMarkup = snippet
      ? `<blockquote class="recognition-summary__quote">"${WeldUtil.escapeHtml(
          snippet
        )}"</blockquote>`
      : "";
    return `
      <div class="recognition-summary__recent">
        <span class="recognition-summary__recent-label">Latest recognition</span>
        <p><strong>${WeldUtil.escapeHtml(senderLabel)}</strong> ${WeldUtil.escapeHtml(
          relativeLabel
        )}${focusMarkup}</p>
        ${snippetMarkup}
      </div>
    `;
  })();
  const recognitionSummaryHelper =
    recognitionGivenPoints > 0
      ? `You have passed on ${formatNumber(
          recognitionGivenPoints
        )} pts to your teammates and lined up a x2 quest boost for both sides.`
      : "Share recognition when someone stops a threat to award bonus points and unlock a x2 quest boost for you and them.";
  const recognitionSummaryHtml = `
    <article class="recognition-summary">
      <span class="recognition-summary__eyebrow">Teammate recognition</span>
      <h3 class="recognition-summary__title">Vigilance kudos</h3>
      <div class="recognition-summary__metric">
        <span class="recognition-summary__metric-value">+${formatNumber(
          recognitionPointsTotal
        )}</span>
        <span class="recognition-summary__metric-label">pts awarded to you</span>
      </div>
      <ul class="recognition-summary__stats">
        <li><strong>${formatNumber(
          recognitionReceived.length
        )}</strong><span>Got</span></li>
        <li><strong>${formatNumber(
          recognitionGiven.length
        )}</strong><span>Gave</span></li>
        <li><strong>${formatNumber(
          recognitionPeerCount
        )}</strong><span>Boost</span></li>
      </ul>
      <p class="recognition-summary__helper">${WeldUtil.escapeHtml(
        recognitionSummaryHelper
      )}</p>
      ${latestSnippet}
    </article>
  `;
  const recognitionBoardMarkup = `
    <section class="customer-section customer-section--recognition">
      <div class="section-header">
        <h2>Recognition highlights</h2>
        <p>Celebrate vigilance stories so every teammate knows what suspicious activity looks like.</p>
      </div>
      <div class="recognition-board__note" role="note" aria-label="Recognition quest boost reminder">
        <div class="recognition-board__note-header">
          <span class="recognition-board__note-title">Share recognition</span>
          <button type="button" class="button-pill button-pill--primary recognition-board__note-button" aria-haspopup="dialog">
            <span class="recognition-board__note-button-label">Give kudos</span>
            <span class="recognition-board__note-button-subtext">x2 quest boost</span>
          </button>
        </div>
        <p>Give or receive kudos and your next quest pays double points for both teammates.</p>
      </div>
      <div class="recognition-board">
        <div class="recognition-board__insight">
          ${recognitionSummaryHtml}
        </div>
        <div class="recognition-board__feed">
          ${recognitionControlsMarkup}
          <div class="recognition-feed">
            ${recognitionFeedMarkup}
          </div>
        </div>
      </div>
    </section>
  `;

  const rewardsHtml = publishedRewards
    .map(reward => {
      const remainingLabel = rewardRemainingLabel(reward);
      const pointsCost = Number(reward.pointsCost) || 0;
      return `
      <article class="reward-card reward-card--catalogue reward-card--hub" data-reward="${WeldUtil.escapeHtml(String(reward.id))}">
        <div class="reward-card__artwork" style="background:${reward.image};">
          ${WeldUtil.renderIcon(reward.icon || "gift", "lg")}
        </div>
        <div class="reward-card__meta">
          <span class="reward-card__chip reward-card__chip--category">${WeldUtil.escapeHtml(reward.category || "Reward")}</span>
          <span class="reward-card__chip reward-card__chip--provider">${WeldUtil.escapeHtml(reward.provider || "WeldSecure")}</span>
        </div>
        <h4 class="reward-card__title">${WeldUtil.escapeHtml(reward.name || "Reward")}</h4>
        <p class="reward-card__desc">${WeldUtil.escapeHtml(reward.description || "")}</p>
        <div class="reward-card__footer">
          <span>${remainingLabel} left</span>
        </div>
        <div class="reward-card__actions">
          <span class="reward-card__chip reward-card__chip--points">
            <strong class="reward-card__points-value">${formatNumber(pointsCost)}</strong>
            <span class="reward-card__points-unit">pts</span>
          </span>
          <button type="button" class="reward-card__cta button-pill button-pill--primary">Redeem reward</button>
        </div>
      </article>
    `;
    })
    .join("");

  const questsHtml = publishedQuests
    .map(quest => {
      const questId = WeldUtil.escapeHtml(String(quest.id));
      const focusTags = Array.isArray(quest.focus)
        ? quest.focus.slice(0, 2).map(item => `<span>${WeldUtil.escapeHtml(item)}</span>`).join("")
        : "";
      const focusBlock = focusTags ? `<div class="quest-card__focus quest-card__focus--compact">${focusTags}</div>` : "";
      const difficultyChip = quest.difficulty
        ? `<span class="quest-card__chip quest-card__chip--difficulty" data-difficulty="${WeldUtil.escapeHtml(
            quest.difficulty
          )}">${WeldUtil.escapeHtml(quest.difficulty)}</span>`
        : "";
      const difficultyRow = difficultyChip ? `<div class="quest-card__header-top">${difficultyChip}</div>` : "";
      const headerTags = [];
      if (quest.category) headerTags.push(`<span class="quest-card__chip">${WeldUtil.escapeHtml(quest.category)}</span>`);
      const chipGroup = headerTags.length ? `<div class="quest-card__chip-group">${headerTags.join("")}</div>` : "";
      const questLabel = quest.title ? WeldUtil.escapeHtml(quest.title) : "quest";
      const configButton = `<button type="button" class="quest-card__config" data-quest="${questId}" title="Configure ${questLabel}" aria-label="Configure ${questLabel}"><span class="quest-card__config-cog" aria-hidden="true">?</span></button>`;
      return `
      <article class="quest-card quest-card--hub" data-quest="${questId}">
        ${configButton}
        <header class="quest-card__header quest-card__header--hub">
          ${difficultyRow}
          ${chipGroup}
        </header>
        <h4 class="quest-card__title">${WeldUtil.escapeHtml(quest.title)}</h4>
        <p class="quest-card__description">${WeldUtil.escapeHtml(quest.description)}</p>
        <ul class="quest-card__details quest-card__details--compact">
          <li><span>Duration</span><strong>${WeldUtil.escapeHtml(String(quest.duration))} min</strong></li>
          <li><span>Questions</span><strong>${WeldUtil.escapeHtml(String(quest.questions))}</strong></li>
          <li><span>Format</span><strong>${WeldUtil.escapeHtml(quest.format || "")}</strong></li>
        </ul>
        ${focusBlock}
        <div class="quest-card__footer quest-card__footer--hub">
          <span class="quest-card__points">
            <strong class="quest-card__points-value">${formatNumber(quest.points || 0)}</strong>
            <span class="quest-card__points-unit">pts</span>
          </span>
          <button type="button" class="button-pill button-pill--primary quest-card__cta" data-quest="${questId}">
            Take Quiz
          </button>
        </div>
      </article>
    `;
    })
    .join("");

  const rarityOrder = ["Legendary", "Expert", "Skilled", "Rising", "Starter"];
  const demoBadgeAchievements = [
    { id: "resilience-ranger", achievedAt: "2025-03-14T10:45:00Z" },
    { id: "zero-day-zeal", achievedAt: "2025-03-02T09:10:00Z" },
    { id: "automation-ally", achievedAt: "2025-02-21T16:30:00Z" },
    { id: "bullseye-breaker", achievedAt: "2025-02-12T08:15:00Z" },
    { id: "hub-hopper", achievedAt: "2025-03-18T12:05:00Z", highlight: "recent" }
  ];
  const demoBadges = demoBadgeAchievements
    .map(entry => {
      const badge = publishedBadges.find(item => item.id === entry.id);
      if (!badge) return null;
      return { ...badge, achievedAt: entry.achievedAt, highlight: entry.highlight || null };
    })
    .filter(Boolean);
  const recentBadge =
    demoBadges.find(item => item.highlight === "recent") ||
    demoBadges
      .slice()
      .sort((a, b) => {
        const timeA = new Date(a.achievedAt || 0).getTime();
        const timeB = new Date(b.achievedAt || 0).getTime();
        return timeB - timeA;
      })[0];
  const getRarityRank = badge => {
    const difficulty = typeof badge.difficulty === "string" ? badge.difficulty : "";
    const index = rarityOrder.indexOf(difficulty);
    return index === -1 ? rarityOrder.length : index;
  };
  const topRarityBadges = demoBadges
    .filter(badge => !recentBadge || badge.id !== recentBadge.id)
    .sort((a, b) => {
      const rarityDiff = getRarityRank(a) - getRarityRank(b);
      if (rarityDiff !== 0) return rarityDiff;
      const pointsDiff = (Number(b.points) || 0) - (Number(a.points) || 0);
      if (pointsDiff !== 0) return pointsDiff;
      const timeA = new Date(a.achievedAt || 0).getTime();
      const timeB = new Date(b.achievedAt || 0).getTime();
      return timeB - timeA;
    })
    .slice(0, 3);
  const fallbackTopBadges = recentBadge
    ? publishedBadges.filter(badge => badge.id !== recentBadge.id)
    : publishedBadges.slice();
  const displayTopBadges = topRarityBadges.length > 0 ? topRarityBadges : fallbackTopBadges.slice(0, 3);
  const renderBadgeShowcaseItem = (badge, extraClass = "") => {
    const achievedDate = badge?.achievedAt ? new Date(badge.achievedAt) : null;
    const metaMarkup =
      achievedDate && !Number.isNaN(achievedDate.getTime())
        ? `<span class="badge-showcase__meta">Unlocked ${WeldUtil.escapeHtml(formatDateTime(badge.achievedAt))}</span>`
        : "";
    return `
      <div class="badge-showcase__item${extraClass ? ` ${extraClass}` : ""}" role="listitem">
        ${renderHubBadgeCard(badge)}
        ${metaMarkup}
      </div>
    `;
  };
  const topBadgesMarkup = displayTopBadges.length
    ? `
      <div class="badge-showcase__group" role="group" aria-label="Badge showcase">
        <p class="badge-showcase__label">Badge showcase</p>
        <div class="badge-showcase__list" role="list" aria-label="Top badges by rarity">
          ${displayTopBadges.map(badge => renderBadgeShowcaseItem(badge)).join("")}
        </div>
      </div>
    `
    : "";
  const recentBadgeMarkup = recentBadge
    ? `
      <div class="badge-showcase__group badge-showcase__group--recent" role="group" aria-label="Most recent badge">
        <p class="badge-showcase__label">Most recent</p>
        <div class="badge-showcase__list badge-showcase__list--recent" role="list" aria-label="Most recent badge">
          ${renderBadgeShowcaseItem(recentBadge, "badge-showcase__item--recent")}
        </div>
      </div>
    `
    : "";
  const hasAnyBadges = displayTopBadges.length > 0 || Boolean(recentBadge);
  const badgesHtml = hasAnyBadges
    ? `
      <div class="badge-showcase${recentBadge ? " badge-showcase--inline" : ""}">
        ${topBadgesMarkup}
        ${
          recentBadge
            ? `<div class="badge-showcase__divider" role="separator" aria-hidden="true"></div>${recentBadgeMarkup}`
            : ""
        }
      </div>
    `
    : `<div class="badge-empty"><p>No badges are currently published. Switch to the organisation catalogue to curate them.</p></div>`;

  return `
    <header class="customer-hero">
      <h1>Good day, ${WeldUtil.escapeHtml(state.customer.name)}</h1>
      <p>Your vigilance is fuelling a safer inbox for everyone at Evergreen Capital.</p>
    </header>
    <div class="customer-hero-actions">
      <div class="customer-hero-actions__panel">
        <div class="customer-hero-actions__main">
          <button class="button-pill button-pill--primary customer-hero-actions__button" id="customer-report-button">Report other suspicious activity</button>
          <p class="customer-hero-actions__description">Log smishing, quishing, or any other suspicious behaviour you come across so the security team can jump on it.</p>
        </div>
        <div class="customer-hero-actions__meta">
          <button
            type="button"
            class="button-pill customer-hero-actions__history"
            id="customer-report-history-button"
            data-route="customer-reports"
            data-report-filter="other"
          >
            Other report history
          </button>
          <p class="customer-hero-actions__history-note">Each submission grants +20 pts immediately. Use Other report history to track how non-email incidents progress and when bonus points land.</p>
        </div>
      </div>
    </div>
    <section class="customer-section customer-section--points points-strip">
      <article class="points-card" style="background: linear-gradient(135deg, #6d28d9, #4338ca);">
        <div class="points-card__chip points-card__chip--interactive">
          <span>Available to spend</span>
          <button type="button" class="points-card__chip-action" data-scroll="#customer-rewards">Browse rewards</button>
        </div>
        <div class="points-card__content">
          <span class="points-icon" style="background: linear-gradient(135deg, #ede9fe, #c7d2fe);">
            ${WeldUtil.renderIcon("medal", "sm")}
          </span>
          <div class="points-card__metrics">
            <span class="points-card__value">${formatNumber(state.customer.currentPoints)}</span>
            <span class="points-card__unit">PTS</span>
          </div>
        </div>
      </article>
      <article class="points-card" style="background: linear-gradient(135deg, #f97316, #facc15);">
        <div class="points-card__chip points-card__chip--interactive">
          <span>Pending approval</span>
          <button type="button" class="points-card__chip-action" data-route="customer-reports" data-report-filter="all">Recent reports</button>
        </div>
        <div class="points-card__content">
          <span class="points-icon" style="background: linear-gradient(135deg, #fff7ed, #ffedd5);">
            ${WeldUtil.renderIcon("hourglass", "sm")}
          </span>
          <div class="points-card__metrics">
            <span class="points-card__value">${formatNumber(pendingApprovalPoints)}</span>
            <span class="points-card__unit">PTS</span>
          </div>
        </div>
      </article>
      <article class="points-card" style="background: linear-gradient(135deg, #0ea5e9, #6366f1);">
        <div class="points-card__chip points-card__chip--interactive">
          <span>Reward history</span>
          <button type="button" class="points-card__chip-action" data-route="customer-redemptions">View history</button>
        </div>
        <div class="points-card__content">
          <span class="points-icon" style="background: linear-gradient(135deg, #dbeafe, #bfdbfe);">
            ${WeldUtil.renderIcon("gift", "sm")}
          </span>
          <div class="points-card__metrics">
            <span class="points-card__value">${formatNumber(state.customer.redeemedPoints)}</span>
            <span class="points-card__unit">PTS</span>
          </div>
        </div>
      </article>
      ${bonusScaleHtml}
    </section>
    <section class="customer-section customer-section--badges">
      <div class="section-header section-header--with-action">
        <div class="section-header__copy">
          <h2>Your badges</h2>
          <p>Preview the badges your organisation curates. Published badges appear here and inside the add-in spotlight.</p>
        </div>
        <button type="button" class="button-pill button-pill--primary section-header__action" data-route="customer-badges" data-role="customer">
          All badges
        </button>
      </div>
      ${badgesHtml}
    </section>
    <section id="customer-rewards" class="customer-section customer-section--rewards">
      <div class="section-header">
        <h2>Your rewards</h2>
        <p>Select a reward to demonstrate the instant redemption flow. Only rewards published by your organisation appear here.</p>
      </div>
      ${
        rewardsHtml
          ? `<div class="reward-grid reward-grid--catalogue reward-grid--hub">${rewardsHtml}</div>`
          : `<div class="reward-empty"><p>No rewards are currently published. Check back soon!</p></div>`
      }
    </section>
    <section class="customer-section customer-section--quests">
      <div class="section-header">
        <h2>Your quests</h2>
        <p>Introduce squads to the latest WeldSecure quests. Only published quests from your organisation appear here.</p>
      </div>
      ${
        questsHtml
          ? `<div class="quest-grid quest-grid--hub">${questsHtml}</div>`
          : `<div class="reward-empty"><p>No quests are currently published. Check back soon!</p></div>`
      }
    </section>
    ${recognitionBoardMarkup}
  `;
}

function renderCustomerBadgesPage() {
  const publishedBadges = getBadges().filter(badge => badge.published);
  const badgeCount = publishedBadges.length;
  const badgeLabel = badgeCount === 1 ? "badge" : "badges";
  const badgeGrid = badgeCount
    ? `
      <div class="gem-badge-grid gem-badge-grid--hub customer-badge-grid" role="list" aria-label="All published badges">
        ${publishedBadges
          .map(
            badge => `
          <div class="customer-badge-grid__item" role="listitem">
            ${renderHubBadgeCard(badge)}
          </div>
        `
          )
          .join("")}
      </div>
    `
    : `<div class="customer-detail__empty">No badges are currently published. Return to the hub to curate or publish them.</div>`;

  const descriptionTail = badgeCount
    ? ` Currently showing ${WeldUtil.escapeHtml(formatNumber(badgeCount))} ${badgeLabel}.`
    : "";

  return `
    <header class="customer-detail-header">
      <button type="button" class="customer-detail__back" data-action="back-to-hub">
        Back to hub
      </button>
      <span class="customer-detail__eyebrow">Badges</span>
      <h1>All available badges</h1>
      <p>Every badge your organisation has published to the reporter hub.${descriptionTail}</p>
    </header>
    <section class="customer-section customer-section--badges customer-section--badges-all">
      ${badgeGrid}
    </section>
  `;
}

function renderCustomerReportsPage() {
  const customerMessages = state.messages
    .filter(messageBelongsToCustomer)
    .slice()
    .sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime());

  const reportFilter = state.meta?.reportFilter === "other" ? "other" : "all";
  const filteredMessages = customerMessages.filter(message => {
    if (reportFilter === "other") {
      return Boolean(message?.activityType);
    }
    return true;
  });

  const rowsMarkup = filteredMessages
    .map(message => {
      const reasons = Array.isArray(message.reasons) ? message.reasons.map(reasonById).filter(Boolean) : [];
      const reasonChips = reasons
        .map(reason => `<span class="detail-chip">${WeldUtil.escapeHtml(reason.label)}</span>`)
        .join("");
      const approvedPoints = message.status === MessageStatus.APPROVED ? message.pointsOnApproval || 0 : 0;
      const totalPoints = (message.pointsOnMessage || 0) + approvedPoints;
      const activityLabel = describeActivityType(message?.activityType);
      const hasLocation =
        typeof message?.incidentLocation === "string" && message.incidentLocation.trim().length > 0;
      const activityMeta = activityLabel
        ? `<span class="detail-table__meta">${WeldUtil.escapeHtml(activityLabel)}${
            hasLocation ? ` � ${WeldUtil.escapeHtml(message.incidentLocation.trim())}` : ""
          }</span>`
        : hasLocation
        ? `<span class="detail-table__meta">Location: ${WeldUtil.escapeHtml(message.incidentLocation.trim())}</span>`
        : "";
      return `
        <tr>
          <td>${formatDateTime(message.reportedAt)}</td>
          <td>
            <strong>${WeldUtil.escapeHtml(message.subject || "Suspicious message")}</strong>
            ${activityMeta}
            ${reasonChips ? `<div class="detail-table__chips">${reasonChips}</div>` : ""}
          </td>
          <td><span class="badge" data-state="${WeldUtil.escapeHtml(message.status)}">${WeldUtil.escapeHtml(message.status)}</span></td>
          <td>
            <div class="detail-table__points">
              <span>+${formatNumber(message.pointsOnMessage || 0)}</span>
              ${
                message.status === MessageStatus.APPROVED
                  ? `<span>+${formatNumber(approvedPoints)}</span>`
                  : ""
              }
              <strong>= ${formatNumber(totalPoints)}</strong>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");

  const emptyCopy =
    reportFilter === "other"
      ? "No other suspicious activity reports yet. Log calls, texts, or QR finds to see them here."
      : "No reports recorded yet. Use the hub to submit your first suspicious email.";

  const tableMarkup = filteredMessages.length
    ? `
      <div class="detail-table-wrapper">
        <table class="detail-table detail-table--reports">
          <thead>
            <tr>
              <th>Reported</th>
              <th>Subject &amp; reasons</th>
              <th>Status</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>${rowsMarkup}</tbody>
        </table>
      </div>
    `
    : `<div class="customer-detail__empty">${WeldUtil.escapeHtml(emptyCopy)}</div>`;

  const filterNote =
    reportFilter === "other"
      ? `<p class="customer-detail__filter-note">Showing other suspicious activity (calls, texts, QR codes, and similar).</p>`
      : "";

  return `
    <header class="customer-detail-header">
      <button type="button" class="customer-detail__back" data-action="back-to-hub">
        Back to hub
      </button>
      <span class="customer-detail__eyebrow">Reports</span>
      <h1>Your reported messages</h1>
      <p>Review everything you've flagged and track approvals from the security team.</p>
      ${filterNote}
    </header>
    ${tableMarkup}
  `;
}

function renderCustomerRedemptionsPage() {
  const redemptions = Array.isArray(state.rewardRedemptions)
    ? state.rewardRedemptions.slice().sort((a, b) => new Date(b.redeemedAt).getTime() - new Date(a.redeemedAt).getTime())
    : [];

  const rowsMarkup = redemptions
    .map(entry => {
      const reward = rewardById(entry.rewardId);
      const rewardName = reward ? reward.name : "Reward";
      const provider = reward?.provider ? `<span class="detail-table__meta">${WeldUtil.escapeHtml(reward.provider)}</span>` : "";
      return `
        <tr>
          <td>${formatDateTime(entry.redeemedAt)}</td>
          <td>
            <strong>${WeldUtil.escapeHtml(rewardName)}</strong>
            ${provider}
          </td>
          <td>${formatNumber(reward?.pointsCost || 0)} pts</td>
          <td>
            <span class="badge" data-state="${WeldUtil.escapeHtml(entry.status || "pending")}">
              ${WeldUtil.escapeHtml(entry.status || "pending")}
            </span>
          </td>
        </tr>
      `;
    })
    .join("");

  const tableMarkup = redemptions.length
    ? `
      <div class="detail-table-wrapper">
        <table class="detail-table detail-table--reports">
          <thead>
            <tr>
              <th>Redeemed</th>
              <th>Reward</th>
              <th>Points</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>${rowsMarkup}</tbody>
        </table>
      </div>
    `
    : `<div class="customer-detail__empty">No rewards redeemed yet. Redeem from the hub to see history appear here.</div>`;

  return `
    <header class="customer-detail-header">
      <button type="button" class="customer-detail__back" data-action="back-to-hub">
        Back to hub
      </button>
      <span class="customer-detail__eyebrow">Rewards</span>
      <h1>Your redemption history</h1>
      <p>Show stakeholders how Weld provides instant recognition and celebration moments.</p>
    </header>
    ${tableMarkup}
  `;
}

function renderClientRewards() {
  const rewards = Array.isArray(state.rewards) ? state.rewards.slice() : [];
  const publishedRewards = rewards.filter(reward => reward.published);
  const draftRewards = rewards.filter(reward => !reward.published);
  const averageCost = rewards.length
    ? Math.round(
        rewards.reduce((sum, reward) => sum + (Number(reward.pointsCost) || 0), 0) / rewards.length
      )
    : 0;
  const totalInventory = rewards.reduce((sum, reward) => {
    if (reward?.unlimited) return sum;
    return sum + (Number(reward?.remaining) || 0);
  }, 0);

  const categoryMap = new Map();
  rewards.forEach(reward => {
    const rawCategory = typeof reward.category === "string" ? reward.category.trim() : "";
    if (!rawCategory) return;
    const normalized = rawCategory.toLowerCase();
    if (!categoryMap.has(normalized)) {
      categoryMap.set(normalized, rawCategory);
    }
  });

  const rewardCategories = Array.from(categoryMap.entries())
    .sort((a, b) => a[1].localeCompare(b[1], undefined, { sensitivity: "base" }))
    .map(([value, label]) => ({ value, label }));

  const activeFilter =
    typeof state.meta.rewardFilter === "string" && state.meta.rewardFilter.length > 0
      ? state.meta.rewardFilter
      : null;
  const statusFilter =
    typeof state.meta.rewardStatusFilter === "string" && state.meta.rewardStatusFilter.length > 0
      ? state.meta.rewardStatusFilter
      : null;

  const categoryFilteredRewards = activeFilter
    ? rewards.filter(reward => {
        const category = typeof reward.category === "string" ? reward.category.trim().toLowerCase() : "";
        return category === activeFilter;
      })
    : rewards;

  const filteredRewards =
    statusFilter === "published"
      ? categoryFilteredRewards.filter(reward => reward.published)
      : statusFilter === "unpublished"
      ? categoryFilteredRewards.filter(reward => !reward.published)
      : categoryFilteredRewards;

  const metricsConfig = [
    {
      label: "Total catalogue",
      value: formatNumber(rewards.length),
      caption: "Configured experiences"
    },
    {
      label: "Published rewards",
      value: formatNumber(publishedRewards.length),
      caption: "Visible to reporters"
    },
    {
      label: "Draft rewards",
      value: formatNumber(draftRewards.length),
      caption: "Ready for the next launch"
    },
    {
      label: "Average cost",
      value: rewards.length ? `${formatNumber(averageCost)} pts` : "--",
      caption: "Across the catalogue"
    }
  ];

  const metricsMarkup = metricsConfig
    .map(
      metric => `
        <article class="client-rewards__metric">
          <h3>${WeldUtil.escapeHtml(metric.label)}</h3>
          <strong>${WeldUtil.escapeHtml(String(metric.value))}</strong>
          <span>${WeldUtil.escapeHtml(metric.caption)}</span>
        </article>
      `
    )
    .join("");

  const rewardsMarkup = filteredRewards.length
    ? filteredRewards
        .map(reward => {
          const id = WeldUtil.escapeHtml(String(reward.id));
          const isPublished = reward.published === true;
          const action = isPublished ? "unpublish" : "publish";
          const actionLabel = isPublished ? "Unpublish" : "Publish";
          const actionTone = isPublished ? "button-pill--danger-light" : "button-pill--primary";
          const remainingLabel = rewardRemainingLabel(reward);
          const remainingCopy =
            reward?.unlimited === true
              ? "Unlimited redemptions"
              : `${remainingLabel} remaining`;
          const pointsCost = Number(reward.pointsCost) || 0;
          const categoryLabel = formatCatalogueLabel(reward.category || "Reward");
          const providerLabel = reward.provider ? reward.provider : "WeldSecure";
          const rewardLabel = reward.name ? WeldUtil.escapeHtml(reward.name) : "Reward";
          const configButton = `<button type="button" class="reward-card__config" data-reward="${id}" title="Configure ${rewardLabel}" aria-label="Configure ${rewardLabel}"><span class="reward-card__config-cog" aria-hidden="true">?</span></button>`;
          return `
            <article class="reward-card reward-card--catalogue ${isPublished ? "reward-card--published" : "reward-card--draft"}" data-reward="${id}">
              ${configButton}
              <div class="reward-card__artwork" style="background:${reward.image};">
                ${WeldUtil.renderIcon(reward.icon || "gift", "lg")}
              </div>
              <div class="reward-card__meta catalogue-card__tags">
                <span class="catalogue-card__tag reward-card__chip reward-card__chip--category">${WeldUtil.escapeHtml(
                  categoryLabel
                )}</span>
                <span class="catalogue-card__tag reward-card__chip reward-card__chip--provider">${WeldUtil.escapeHtml(
                  providerLabel
                )}</span>
              </div>
              <h4 class="reward-card__title">${WeldUtil.escapeHtml(reward.name || "Reward")}</h4>
              <p class="reward-card__desc">${WeldUtil.escapeHtml(reward.description || "")}</p>
              <div class="reward-card__footer">
                <span>${remainingCopy}</span>
              </div>
              <div class="reward-card__actions">
                <span class="catalogue-card__tag reward-card__chip reward-card__chip--points">
                  <strong class="reward-card__points-value">${formatNumber(pointsCost)}</strong>
                  <span class="reward-card__points-unit">pts</span>
                </span>
                <button
                  type="button"
                  class="button-pill ${actionTone} reward-publish-toggle"
                  data-reward="${id}"
                  data-action="${action}">
                  ${actionLabel}
                </button>
              </div>
            </article>
          `;
        })
        .join("")
    : `<div class="customer-detail__empty">${
        rewards.length
          ? "No rewards match the selected filter."
          : "Create your first reward to spark recognition moments."
      }</div>`;

  const catalogueMarkup = filteredRewards.length
    ? `<div class="reward-grid reward-grid--catalogue">${rewardsMarkup}</div>`
    : rewardsMarkup;

  const baseInventoryCopy =
    rewards.length && totalInventory > 0
      ? `${formatNumber(totalInventory)} total items remaining`
      : rewards.length
      ? "Inventory updates live as redemptions happen"
      : "Add rewards to build your catalogue narrative.";

  const selectedCategoryLabel =
    activeFilter && categoryMap.has(activeFilter)
      ? formatCatalogueLabel(categoryMap.get(activeFilter))
      : null;

  const filterSummaryParts = [];
  if (statusFilter === "published") {
    filterSummaryParts.push("Published only");
  } else if (statusFilter === "unpublished") {
    filterSummaryParts.push("Unpublished only");
  }
  if (selectedCategoryLabel) {
    filterSummaryParts.push(`Category: ${selectedCategoryLabel}`);
  }

  const filterSummaryText = filterSummaryParts.length ? filterSummaryParts.join(" - ") : "";
  const resultsSummary =
    activeFilter || statusFilter
      ? `${formatNumber(filteredRewards.length)} of ${formatNumber(rewards.length)} rewards shown`
      : "";

  const actionsMeta =
    [resultsSummary, filterSummaryText, baseInventoryCopy].filter(Boolean).join(" | ") || baseInventoryCopy;

  const filterButtons = rewardCategories
    .map(category => {
      const value = WeldUtil.escapeHtml(category.value);
      const isActive = activeFilter === category.value;
      const label = formatCatalogueLabel(category.label);
      return `
        <button
          type="button"
          class="badge-filter__item${isActive ? " badge-filter__item--active" : ""}"
          data-reward-filter="${value}"
          aria-pressed="${isActive ? "true" : "false"}">
          ${WeldUtil.escapeHtml(label)}
        </button>
      `;
    })
    .join("");

  const statusFilterMarkup = `
        <div class="badge-filter client-catalogue__status" role="toolbar" aria-label="Reward publication status">
          <button
            type="button"
            class="badge-filter__item${statusFilter ? "" : " badge-filter__item--active"}"
            data-reward-status=""
            aria-pressed="${statusFilter ? "false" : "true"}">
            All statuses
          </button>
          <button
            type="button"
            class="badge-filter__item${statusFilter === "published" ? " badge-filter__item--active" : ""}"
            data-reward-status="published"
            aria-pressed="${statusFilter === "published" ? "true" : "false"}">
            Published
          </button>
          <button
            type="button"
            class="badge-filter__item${statusFilter === "unpublished" ? " badge-filter__item--active" : ""}"
            data-reward-status="unpublished"
            aria-pressed="${statusFilter === "unpublished" ? "true" : "false"}">
            Unpublished
          </button>
        </div>
      `;

  const filterMarkup =
    rewardCategories.length > 1
      ? `
        <div class="catalogue-filter badge-filter client-rewards__filters" role="toolbar" aria-label="Reward categories">
          <button
            type="button"
            class="badge-filter__item${activeFilter ? "" : " badge-filter__item--active"}"
            data-reward-filter=""
            aria-pressed="${activeFilter ? "false" : "true"}">
            All rewards
          </button>
          ${filterButtons}
        </div>
      `
      : "";

  const summaryMarkup = actionsMeta
    ? `<p class="detail-table__meta">${WeldUtil.escapeHtml(actionsMeta)}</p>`
    : "";

  return `
    <section class="client-catalogue__intro">
      <span class="client-catalogue__eyebrow">Rewards catalogue</span>
      <h1>Curate recognition that converts champions.</h1>
      <p>Toggle availability and talk through the narrative. Weld makes it easy to ship curated rewards in every launch.</p>
    </section>
    <section class="client-rewards__metrics">
      ${metricsMarkup}
    </section>
    <div class="client-rewards__actions">
      <div class="client-catalogue__actions-row">
        <div class="client-rewards__bulk">
          <button type="button" class="button-pill button-pill--primary" data-bulk-reward-action="publish">Publish all rewards</button>
          <button type="button" class="button-pill button-pill--danger-light" data-bulk-reward-action="unpublish">Unpublish all rewards</button>
        </div>
        ${statusFilterMarkup}
      </div>
      ${filterMarkup}
      ${summaryMarkup}
    </div>
    ${catalogueMarkup}
  `;
}

function renderWeldLabs() {
  const labs = state.labs && typeof state.labs === "object" ? state.labs : {};
  const features = Array.isArray(labs.features) ? labs.features : [];
  const clients = Array.isArray(state.clients) ? state.clients : [];
  const totalFeatures = features.length;
  const activeFeatures = features.filter(
    feature => Array.isArray(feature?.enabledClientIds) && feature.enabledClientIds.length > 0
  ).length;
  const enabledSet = new Set();
  let totalAssignments = 0;
  features.forEach(feature => {
    if (!Array.isArray(feature?.enabledClientIds)) return;
    feature.enabledClientIds.forEach(id => {
      const key = labClientKey(id);
      if (!key) return;
      enabledSet.add(key);
      totalAssignments += 1;
    });
  });
  const coverage =
    clients.length > 0 ? Math.round((enabledSet.size / clients.length) * 100) : 0;

  const metricsConfig = [
    {
      label: "Experiments in labs",
      value: formatNumber(totalFeatures),
      caption: "Ready to showcase"
    },
    {
      label: "Active pilots",
      value: formatNumber(activeFeatures),
      caption: "Enabled for tenants"
    },
    {
      label: "Coverage",
      value: clients.length ? `${coverage}%` : "--",
      caption: `${formatNumber(enabledSet.size)} of ${formatNumber(clients.length)} organisations`
    }
  ];

  const metricsMarkup = metricsConfig
    .map(
      metric => `
        <article class="weld-labs__metric">
          <h3>${WeldUtil.escapeHtml(metric.label)}</h3>
          <strong>${WeldUtil.escapeHtml(metric.value)}</strong>
          <span>${WeldUtil.escapeHtml(metric.caption)}</span>
        </article>
      `
    )
    .join("");

  const reviewMarkup = labs.lastReviewAt
    ? `
        <div class="weld-labs__review">
          <span>Last review</span>
          <strong>${WeldUtil.escapeHtml(formatDateTime(labs.lastReviewAt))}</strong>
          <small>${WeldUtil.escapeHtml(relativeTime(labs.lastReviewAt))}</small>
        </div>
      `
    : `
        <div class="weld-labs__review">
          <span>Last review</span>
          <strong>Not yet scheduled</strong>
        </div>
      `;

  const featureCards = features.length
    ? features
        .map((feature, index) => {
          const featureId = normalizeLabFeatureId(feature?.id) || `lab-${index + 1}`;
          const name = typeof feature?.name === "string" && feature.name.trim().length > 0 ? feature.name : "Experiment";
          const status =
            typeof feature?.status === "string" && feature.status.trim().length > 0
              ? feature.status
              : "Preview";
          const summary =
            typeof feature?.summary === "string" ? feature.summary : "";
          const benefit =
            typeof feature?.benefit === "string" ? feature.benefit : "";
          const owner =
            typeof feature?.owner === "string" && feature.owner.trim().length > 0
              ? feature.owner
              : "";
          const tags = Array.isArray(feature?.tags)
            ? feature.tags
                .map(tag => (typeof tag === "string" ? tag.trim() : ""))
                .filter(Boolean)
            : [];
          const enabledIds = Array.isArray(feature?.enabledClientIds)
            ? feature.enabledClientIds
            : [];
          const enabledKeys = new Set(enabledIds.map(labClientKey).filter(Boolean));
          const enabledCount = enabledKeys.size;
          const clientToggleMarkup = clients.length
            ? clients
                .map(client => {
                  const clientKey = labClientKey(client?.id);
                  const orgKey = labClientKey(client?.organizationId);
                  const isEnabled =
                    (clientKey && enabledKeys.has(clientKey)) ||
                    (orgKey && enabledKeys.has(orgKey));
                  const toneClass = isEnabled ? "button-pill--primary" : "button-pill--ghost";
                  const enabledAttr = isEnabled ? "true" : "false";
                  const clientName =
                    typeof client?.name === "string" ? client.name : `Org ${client?.id ?? ""}`;
                  const titleParts = [];
                  if (clientName) titleParts.push(clientName);
                  if (client?.organizationId) {
                    titleParts.push(`Org ID ${client.organizationId}`);
                  }
                  const toggleTitle = titleParts.join(" • ");
                  const actionLabel = isEnabled ? "Disable" : "Enable";
                  return `
                    <button
                      type="button"
                      class="button-pill ${toneClass} weld-labs__toggle"
                      data-lab-toggle
                      data-lab-feature="${WeldUtil.escapeHtml(featureId)}"
                      data-client="${WeldUtil.escapeHtml(String(client.id))}"
                      data-enabled="${enabledAttr}"
                      aria-pressed="${enabledAttr}"
                      aria-label="${WeldUtil.escapeHtml(
                        `${actionLabel} ${clientName} for ${name}`
                      )}"
                      ${toggleTitle ? `title="${WeldUtil.escapeHtml(toggleTitle)}"` : ""}
                    >
                      ${WeldUtil.escapeHtml(clientName)}
                    </button>
                  `;
                })
                .join("")
            : "";
          const tagsMarkup = tags.length
            ? `<div class="weld-labs__tags">${tags
                .map(tag => `<span class="weld-labs__tag">${WeldUtil.escapeHtml(tag)}</span>`)
                .join("")}</div>`
            : "";
          const toggleSection = clients.length
            ? `
              <div class="weld-labs__toggle-header">
                <h4>Organisations</h4>
                <span>${WeldUtil.escapeHtml(
                  `${formatNumber(enabledCount)} of ${formatNumber(clients.length)} active`
                )}</span>
              </div>
              <div class="weld-labs__toggle-grid">
                ${clientToggleMarkup}
              </div>
              <div class="weld-labs__bulk">
                <button
                  type="button"
                  class="button-pill button-pill--ghost weld-labs__bulk-action"
                  data-lab-feature="${WeldUtil.escapeHtml(featureId)}"
                  data-lab-bulk="enable"
                  aria-label="${WeldUtil.escapeHtml(`Enable ${name} for all organisations`)}"
                >
                  Enable all
                </button>
                <button
                  type="button"
                  class="button-pill button-pill--ghost weld-labs__bulk-action"
                  data-lab-feature="${WeldUtil.escapeHtml(featureId)}"
                  data-lab-bulk="disable"
                  aria-label="${WeldUtil.escapeHtml(`Disable ${name} for all organisations`)}"
                >
                  Disable all
                </button>
              </div>
            `
            : `<p class="weld-labs__no-clients">Add organisation accounts to pilot this experiment.</p>`;
          return `
            <article class="weld-labs__feature" data-feature="${WeldUtil.escapeHtml(featureId)}">
              <header class="weld-labs__feature-header">
                <span class="weld-labs__status">${WeldUtil.escapeHtml(status)}</span>
                <h3>${WeldUtil.escapeHtml(name)}</h3>
                ${tagsMarkup}
              </header>
              <p class="weld-labs__summary">${WeldUtil.escapeHtml(summary)}</p>
              ${benefit ? `<p class="weld-labs__benefit">${WeldUtil.escapeHtml(benefit)}</p>` : ""}
              <div class="weld-labs__meta">
                ${
                  owner
                    ? `<span class="weld-labs__owner">Owner: ${WeldUtil.escapeHtml(owner)}</span>`
                    : ""
                }
                <span class="weld-labs__assignments">${WeldUtil.escapeHtml(
                  `${formatNumber(enabledCount)} organisations enabled`
                )}</span>
              </div>
              <section class="weld-labs__toggle-panel" aria-label="Manage access for ${WeldUtil.escapeHtml(
                name
              )}">
                ${toggleSection}
              </section>
            </article>
          `;
        })
        .join("")
    : `
        <div class="weld-labs__empty">
          <h3>Nothing in Labs yet</h3>
          <p>Use this workspace to curate early feature previews. Add experiments in the data model to toggle availability per organisation.</p>
        </div>
      `;

  return `
    <section class="weld-labs">
      <header class="weld-labs__hero">
        <div>
          <span class="weld-labs__eyebrow">Labs workspace</span>
          <h1>Weld Labs</h1>
          <p>Walk organisations through experimental capabilities, shape the story, and toggle access in real time.</p>
        </div>
        ${reviewMarkup}
      </header>
      <section class="weld-labs__metrics">
        ${metricsMarkup}
      </section>
      <section class="weld-labs__assignments-summary">
        <strong>${WeldUtil.escapeHtml(formatNumber(totalAssignments))}</strong>
        <span>Total tenant toggles active</span>
      </section>
      <section class="weld-labs__list">
        ${featureCards}
      </section>
    </section>
  `;
}

function renderWeldAdmin() {
  const clientCards = state.clients
    .map(
      client => `
        <article class="client-card">
          <div>
            <span class="landing__addin-eyebrow">Client</span>
            <h2>${client.name}</h2>
            <p>Org ID: ${client.organizationId}</p>
          </div>
          <div class="client-card__stats">
            <div>
              <label>Health score</label>
              <span>${client.healthScore}%</span>
            </div>
            <div>
              <label>Open cases</label>
              <span>${client.openCases}</span>
            </div>
            <div>
              <label>Active users</label>
              <span>${client.activeUsers}</span>
            </div>
          </div>
          <footer>
            <div>
              <label>Last reported email</label>
              <strong>${formatDateTime(client.lastReportAt)}</strong>
              <span class="landing__addin-eyebrow">${relativeTime(client.lastReportAt)}</span>
            </div>
            <div class="table-actions">
              <button data-client="${client.id}" data-action="view-journey">View journey</button>
              <button data-client="${client.id}" data-action="share-insights">Share insights</button>
            </div>
          </footer>
        </article>
      `
    )
    .join("");

  return `
    <header>
      <h1>WeldSecure - multi-tenant view</h1>
      <p>Use this vantage point to share how Weld scales across clients while spotting where to lean in.</p>
      <button class="button-pill button-pill--primary" id="trigger-playbook">Trigger playbook</button>
    </header>
    <section class="metrics-grid">
      ${WeldUtil.renderMetricCard("Active clients", state.clients.length.toString(), { direction: "up", value: "2 onboarded", caption: "last month" }, "indigo", "shield")}
      ${WeldUtil.renderMetricCard(
        "Average health",
        `${Math.round(state.clients.reduce((acc, client) => acc + client.healthScore, 0) / state.clients.length)}%`,
        { direction: "up", value: "+6 pts", caption: "quarter to date" },
        "emerald",
        "heart"
      )}
      ${WeldUtil.renderMetricCard(
        "Open cases",
        state.clients.reduce((acc, client) => acc + client.openCases, 0).toString(),
        { direction: "down", value: "-3", caption: "since Monday" },
        "amber",
        "hourglass"
      )}
    </section>
    <section class="clients-grid">${clientCards}</section>
    <section class="playbook-card">
      <div>
        <strong>Multi-tenant narrative</strong>
        <p>Leadership wants confidence Weld scales easily. Use these cards to show targeted interventions based on engagement health.</p>
      </div>
      <div class="playbook-card__set">
        <div class="playbook">
          <h3>Evergreen Capital</h3>
          <p>Run "Celebrate Champions" sequence - approvals consistently above 80%.</p>
          <span>Scheduled: Tomorrow 09:00</span>
        </div>
        <div class="playbook">
          <h3>Cobalt Manufacturing</h3>
          <p>Launch "Win Back Vigilance" workshop - health dipped below 75%.</p>
          <span>Owner: Customer Success</span>
        </div>
      </div>
    </section>
  `;
}

function formatCatalogueLabel(label) {
  if (typeof label !== "string") return "";
  const normalized = label.replace(/[_-]+/g, " ").trim();
  if (!normalized) return "";
  return normalized
    .split(/\s+/)
    .map(word => {
      if (word.length === 0) return "";
      if (word.toUpperCase() === word) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

function formatNumber(value) {
  try {
    return new Intl.NumberFormat().format(Number(value));
  } catch {
    return String(value);
  }
}

function formatPercent(value) {
  if (!Number.isFinite(value)) {
    return "--";
  }
  try {
    const options =
      value < 0.1
        ? { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1 }
        : { style: "percent", minimumFractionDigits: 0, maximumFractionDigits: 1 };
    return new Intl.NumberFormat(undefined, options).format(value);
  } catch {
    return `${Math.round(value * 100)}%`;
  }
}

function renderPointsTicker(beforeValue, afterValue, awarded, extraAttributes = "") {
  const before = Number.isFinite(beforeValue) ? beforeValue : 0;
  const after = Number.isFinite(afterValue) ? afterValue : before;
  const awardedValue = Number.isFinite(awarded) ? awarded : Math.max(after - before, 0);
  const finalTotal = Number.isFinite(afterValue) ? after : before + awardedValue;
  return `
    <span class="points-ticker" ${extraAttributes} aria-live="polite" data-start="${before}" data-end="${before}" data-final-total="${finalTotal}">
      <span class="points-ticker__value" data-target-end="${before}">${formatNumber(before)}</span>
      <span class="points-ticker__sup" data-total-award="${awardedValue}" data-current-award="0">+0</span>
    </span>
  `;
}

function renderPointsBurst(value, variant, label, index) {
  if (!Number.isFinite(value) || value <= 0) return "";
  const durationSeconds = 3.4;
  const absorbSeconds = 1;
  const inlineStyle = `--burst-duration:${durationSeconds}s;`;
  return `
    <span class="points-burst points-burst--${variant}" data-burst-index="${index}" data-burst-value="${value}" data-burst-duration="${durationSeconds}" data-burst-absorb="${absorbSeconds}" style="${inlineStyle}">
      <span class="points-burst__value">+${formatNumber(value)}</span>
      <span class="points-burst__label">${label}</span>
    </span>
  `;
}

function renderPointsBursts(entries) {
  const fragments = [];
  entries.forEach(entry => {
    if (!entry) return;
    const { value, variant, label } = entry;
    if (!Number.isFinite(value) || value <= 0) return;
    const index = fragments.length;
    const burstMarkup = renderPointsBurst(value, variant, label, index);
    if (burstMarkup) {
      fragments.push(burstMarkup);
    }
  });

  if (fragments.length === 0) return "";
  return `<div class="points-celebration__bursts" aria-hidden="true" data-points-bursts="true">${fragments.join(
    ""
  )}</div>`;
}

function resetCelebrationFireworks(celebrationRoot) {
  if (!celebrationRoot) return;
  const emitters = celebrationRoot.querySelectorAll(".points-celebration__fireworks .firework");
  if (emitters.length === 0) return;
  emitters.forEach(emitter => {
    emitter.style.animation = "none";
    // Force reflow so the browser registers the animation reset.
    void emitter.offsetWidth;
    emitter.style.removeProperty("animation");
  });
}

function setupCelebrationSup(celebrationRoot, onBurstsComplete) {
  if (typeof onBurstsComplete !== "function") {
    onBurstsComplete = () => {};
  }

  resetCelebrationFireworks(celebrationRoot);
  const sup =
    celebrationRoot.querySelector(".points-ticker__sup") ||
    document.querySelector('[data-points-ticker="total"] .points-ticker__sup');
  const celebrationAward = celebrationRoot.querySelector("[data-celebration-award]");
  const resolveTicker = () =>
    celebrationRoot.querySelector(".points-ticker") || document.querySelector('[data-points-ticker="total"]');
  const resetTickerDisplay = () => {
    const ticker = resolveTicker();
    if (!ticker) return;
    const startRaw = Number(ticker.dataset.start);
    if (!Number.isFinite(startRaw)) return;
    const valueEl = ticker.querySelector(".points-ticker__value");
    if (valueEl) {
      valueEl.textContent = formatNumber(startRaw);
      valueEl.dataset.targetEnd = String(startRaw);
    }
    ticker.dataset.end = String(startRaw);
  };
  resetTickerDisplay();
  if (!sup) {
    if (celebrationAward) {
      celebrationAward.textContent = "+0";
    }
    onBurstsComplete();
    return;
  }

  sup.dataset.burstBound = "true";
  const totalAward = Number(sup.dataset.totalAward);
  const safeTotal = Number.isFinite(totalAward) ? Math.max(totalAward, 0) : 0;

  const setSupValue = value => {
    const rounded = Math.max(0, Math.round(value));
    const formatted = formatNumber(rounded);
    sup.textContent = `+${formatted}`;
    sup.dataset.currentAward = String(rounded);
    if (celebrationAward) {
      celebrationAward.textContent = `+${formatted}`;
    }
  };

  let animationFrame = null;
  const animateSup = (target, onComplete) => {
    const start = Number(sup.dataset.currentAward) || 0;
    const clampedTarget = Math.min(Math.max(target, start), safeTotal);
    if (clampedTarget <= start) {
      setSupValue(start);
      if (typeof onComplete === "function") onComplete();
      return;
    }

    if (typeof window === "undefined" || !window.requestAnimationFrame) {
      setSupValue(clampedTarget);
      if (typeof onComplete === "function") onComplete();
      return;
    }

    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }

    const duration = 480;
    const startTime = performance.now();
    const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

    const step = now => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = easeOutCubic(progress);
      const value = start + (clampedTarget - start) * eased;
      setSupValue(value);
      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      } else {
        animationFrame = null;
        setSupValue(clampedTarget);
        if (typeof onComplete === "function") onComplete();
      }
    };

    animationFrame = requestAnimationFrame(step);
  };

  setSupValue(0);

  const burstsContainer = celebrationRoot.querySelector("[data-points-bursts]");
  const bursts = burstsContainer ? Array.from(burstsContainer.querySelectorAll(".points-burst")) : [];
  const resetBurstLayout = () => {
    bursts.forEach(burst => {
      burst.style.removeProperty("--burst-offset");
    });
  };

  const lastBurst = bursts.length > 0 ? bursts[bursts.length - 1] : null;
  const lastDurationRaw = lastBurst ? Number(lastBurst.dataset.burstDuration) : NaN;
  const lastAbsorbRaw = lastBurst ? Number(lastBurst.dataset.burstAbsorb) : NaN;
  const safeLastDuration = Number.isFinite(lastDurationRaw) ? lastDurationRaw : 3.4;
  const safeLastAbsorb = Number.isFinite(lastAbsorbRaw) ? lastAbsorbRaw : 1;
  const finalTailMs = Math.max((safeLastDuration - safeLastAbsorb) * 1000 + 180, 220);

  bursts.forEach(burst => {
    burst.classList.remove("points-burst--active");
    burst.style.removeProperty("display");
    // reset animation by forcing reflow
    void burst.offsetWidth;
  });
  resetBurstLayout();

  const finish = () => {
    const current = Number(sup.dataset.currentAward) || 0;
    const commitTicker = () => {
      const ticker = resolveTicker();
      const valueEl = ticker ? ticker.querySelector(".points-ticker__value") : null;
      if (ticker && valueEl) {
        const startRaw = Number(ticker.dataset.start);
        const startValue = Number.isFinite(startRaw) ? startRaw : 0;
        const plannedTotalRaw = Number(ticker.dataset.finalTotal);
        const plannedTotal = Number.isFinite(plannedTotalRaw) ? plannedTotalRaw : startValue + safeTotal;
        const computedTotal = Number.isFinite(safeTotal) ? startValue + safeTotal : startValue;
        const targetTotal = Number.isFinite(plannedTotal) ? plannedTotal : computedTotal;
        const resolvedTotal = Number.isFinite(targetTotal) ? targetTotal : computedTotal;
        valueEl.dataset.targetEnd = String(resolvedTotal);
        ticker.dataset.end = String(resolvedTotal);
        ticker.dataset.finalTotal = String(resolvedTotal);
      }
      onBurstsComplete();
    };
    if (current < safeTotal) {
      animateSup(safeTotal, commitTicker);
    } else {
      commitTicker();
    }
  };

  if (safeTotal === 0 || bursts.length === 0) {
    animateSup(safeTotal, finish);
    return;
  }

  const playBurst = index => {
    if (index >= bursts.length) {
      window.setTimeout(() => {
        finish();
      }, finalTailMs);
      return;
    }

    const burst = bursts[index];
    const burstValue = Number(burst.dataset.burstValue);
    if (!Number.isFinite(burstValue) || burstValue <= 0) {
      playBurst(index + 1);
      return;
    }

    resetBurstLayout();

    const durationSeconds = Number(burst.dataset.burstDuration) || 3.4;
    burst.style.setProperty("--burst-duration", `${durationSeconds}s`);

    const rawAbsorb = Number(burst.dataset.burstAbsorb) || 1;
    const absorbSeconds = Number.isFinite(rawAbsorb) ? rawAbsorb : 0;
    const absorbMs = absorbSeconds * 1000;
    const minVisibleMs = 8000;
    const cleanupMs = Number.isFinite(durationSeconds)
      ? Math.max(durationSeconds * 1000, absorbMs + 120, minVisibleMs)
      : Math.max(absorbMs + 120, minVisibleMs);

    burst.classList.add("points-burst--active");

    window.setTimeout(() => {
      const current = Number(sup.dataset.currentAward) || 0;
      const target = Math.min(current + burstValue, safeTotal);
      animateSup(target, () => playBurst(index + 1));
    }, absorbMs);

    if (Number.isFinite(cleanupMs) && cleanupMs > 0) {
      window.setTimeout(() => {
        burst.style.display = "none";
      }, cleanupMs);
    }
  };

  playBurst(0);
}

function renderBadgeSpotlight(badgeInput) {
  const badges = Array.isArray(badgeInput)
    ? badgeInput.filter(Boolean)
    : badgeInput
    ? [badgeInput]
    : [];
  if (badges.length === 0) return "";
  const EXTRA_DISPLAY_LIMIT = 3;
  const [primaryBadge, ...extraBadges] = badges;
  const displayedExtras = extraBadges.slice(0, EXTRA_DISPLAY_LIMIT);
  const hasMoreExtras = extraBadges.length > EXTRA_DISPLAY_LIMIT;

  const renderTile = badge => {
    if (!badge) return "";
    const safeId = WeldUtil.escapeHtml(String(badge.id ?? ""));
    const iconBackdrop =
      BADGE_ICON_BACKDROPS[badge.tone]?.background ||
      BADGE_ICON_BACKDROPS.violet?.background ||
      "linear-gradient(135deg, #c7d2fe, #818cf8)";
    const iconShadow =
      BADGE_ICON_BACKDROPS[badge.tone]?.shadow ||
      BADGE_ICON_BACKDROPS.violet?.shadow ||
      "rgba(79, 70, 229, 0.32)";
    const normalizedTitle =
      typeof badge.title === "string" && badge.title.trim().length > 0
        ? badge.title.trim()
        : "Badge unlocked";
    const rawPoints = Number(badge.points);
    const pointsValue = Number.isFinite(rawPoints) ? rawPoints : 0;
    const ariaLabel = `${normalizedTitle} badge, worth ${formatNumber(pointsValue)} points`;
    return `
      <div
        class="badge-spotlight-tile"
        role="listitem"
        tabindex="0"
        data-badge="${safeId}"
        aria-label="${WeldUtil.escapeHtml(ariaLabel)}">
        <span class="badge-spotlight-tile__icon" style="background:${iconBackdrop}; box-shadow:0 22px 44px ${iconShadow};">
          ${WeldUtil.renderIcon(badge.icon || "medal", "sm")}
        </span>
        <span class="badge-spotlight-tile__label">${WeldUtil.escapeHtml(normalizedTitle)}</span>
        <span class="badge-spotlight-tile__points" aria-label="${WeldUtil.escapeHtml(
          `${formatNumber(pointsValue)} points`
        )}">+${formatNumber(pointsValue)}</span>
      </div>
    `;
  };

  const extraCount = extraBadges.length;
  const extraPanelId = WeldUtil.generateId("extra-badges");
  const extrasMarkup =
    extraCount > 0
      ? `
      <div class="badge-spotlight-extra" role="listitem">
        <button
          type="button"
          class="badge-spotlight-extra__trigger"
          aria-expanded="false"
          aria-controls="${extraPanelId}">
          +${formatNumber(extraCount)}
        </button>
        <div class="badge-spotlight-extra__panel" id="${extraPanelId}" role="group" aria-label="Additional badges earned">
          <ul class="badge-spotlight-extra__list">
            ${displayedExtras
              .map(badge => {
                const safeId = WeldUtil.escapeHtml(String(badge.id ?? ""));
                const normalizedTitle =
                  typeof badge.title === "string" && badge.title.trim().length > 0
                    ? badge.title.trim()
                    : "Bonus badge";
                const rawPoints = Number(badge.points);
                const pointsValue = Number.isFinite(rawPoints) ? rawPoints : 0;
                return `
                  <li class="badge-spotlight-extra__item" data-badge="${safeId}">
                    <span class="badge-spotlight-extra__icon">${WeldUtil.renderIcon(badge.icon || "medal", "xs")}</span>
                    <span class="badge-spotlight-extra__name">${WeldUtil.escapeHtml(normalizedTitle)}</span>
                    <span class="badge-spotlight-extra__points" aria-label="${WeldUtil.escapeHtml(
                      `${formatNumber(pointsValue)} points`
                    )}">+${formatNumber(pointsValue)}</span>
                  </li>
                `;
              })
              .join("")}
          </ul>
          ${
            hasMoreExtras
              ? `<button type="button" class="badge-spotlight-extra__more" data-route="client-badges">...more badges</button>`
              : ""
          }
        </div>
      </div>
    `
      : "";

  return `
    <div class="badge-spotlight-row" role="list" aria-label="Recently highlighted badges">
      ${renderTile(primaryBadge)}
      ${extrasMarkup}
    </div>
  `;
}

function selectRandomBadge(excludeId) {
  const badges = getBadges();
  const eligible = badges.filter(badge => badge.icon);
  if (eligible.length === 0) return null;
  const publishedEligible = eligible.filter(badge => badge.published !== false);
  const basePool = publishedEligible.length > 0 ? publishedEligible : eligible;
  const pool = excludeId && excludeId.length > 0 ? basePool.filter(badge => badge.id !== excludeId) : basePool;
  const source = pool.length > 0 ? pool : basePool;
  const index = Math.floor(Math.random() * source.length);
  return source[index];
}

function badgeById(id) {
  if (!id) return null;
  return getBadges().find(badge => badge.id === id) || null;
}

function teardownBadgeShowcase() {
  if (typeof document === "undefined") return;
  document.querySelectorAll("[data-badge-showcase][data-badge-bound='true']").forEach(container => {
    const replacement = container.cloneNode(true);
    replacement.removeAttribute("data-badge-bound");
    container.replaceWith(replacement);
  });
}

function setupBadgeShowcase(container) {
  const badgeContainer = container.querySelector("[data-badge-showcase]");
  const badges = getBadges();
  if (!badgeContainer || !Array.isArray(badges) || badges.length === 0) return;

  if (badgeContainer.dataset.badgeBound === "true") {
    return;
  }

  const eligible = badges.filter(badge => badge && badge.icon);
  if (eligible.length === 0) {
    badgeContainer.innerHTML = "";
    return;
  }

  const storedBadgeIds = Array.isArray(state.meta.lastBadgeIds) ? state.meta.lastBadgeIds : [];
  let selections = storedBadgeIds.map(id => badgeById(id)).filter(Boolean);

  if (selections.length === 0) {
    const published = eligible.filter(badge => badge.published !== false);
    const pool = published.length > 0 ? published : eligible;
    if (pool.length === 0) {
      badgeContainer.innerHTML = "";
      return;
    }
    let desiredCount = pool.length >= 3 ? (Math.random() < 0.5 ? 2 : 3) : Math.min(pool.length, 3);
    if (desiredCount <= 0) desiredCount = 1;
    const poolCopy = pool.slice();
    for (let i = poolCopy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [poolCopy[i], poolCopy[j]] = [poolCopy[j], poolCopy[i]];
    }
    selections = poolCopy.slice(0, desiredCount);
  }

  badgeContainer.innerHTML = renderBadgeSpotlight(selections);
  badgeContainer.dataset.badgeBound = "true";

  const extraWrapper = badgeContainer.querySelector(".badge-spotlight-extra");
  const extraToggle = extraWrapper?.querySelector(".badge-spotlight-extra__trigger");
  const panelId = extraToggle?.getAttribute("aria-controls") || "";
  const escapeCssValue = value => {
    if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
      return CSS.escape(value);
    }
    return String(value).replace(/([#;.?%&,+*~[\]:'"!^$()=>|\/@])/g, "\\$1");
  };
  const panel = panelId ? badgeContainer.querySelector(`#${escapeCssValue(panelId)}`) : null;

  if (extraWrapper && extraToggle && panel) {
    panel.setAttribute("aria-hidden", "true");
    let hoverIntent = null;
    const moreButton = extraWrapper.querySelector(".badge-spotlight-extra__more");
    const openPanel = () => {
      if (hoverIntent) {
        window.clearTimeout(hoverIntent);
        hoverIntent = null;
      }
      extraWrapper.classList.add("badge-spotlight-extra--open");
      extraToggle.setAttribute("aria-expanded", "true");
      panel.setAttribute("aria-hidden", "false");
    };
    const closePanel = () => {
      if (hoverIntent) {
        window.clearTimeout(hoverIntent);
        hoverIntent = null;
      }
      extraWrapper.classList.remove("badge-spotlight-extra--open");
      extraToggle.setAttribute("aria-expanded", "false");
      panel.setAttribute("aria-hidden", "true");
    };

    extraToggle.addEventListener("click", event => {
      event.preventDefault();
      if (extraWrapper.classList.contains("badge-spotlight-extra--open")) {
        closePanel();
      } else {
        openPanel();
      }
    });

    extraWrapper.addEventListener("mouseenter", () => {
      if (hoverIntent) window.clearTimeout(hoverIntent);
      openPanel();
    });

    extraWrapper.addEventListener("mouseleave", () => {
      hoverIntent = window.setTimeout(() => {
        closePanel();
      }, 120);
    });

    extraToggle.addEventListener("focus", openPanel);

    extraWrapper.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        closePanel();
        extraToggle.focus();
      }
    });

    extraWrapper.addEventListener("focusout", event => {
      if (!event.relatedTarget || !extraWrapper.contains(event.relatedTarget)) {
        closePanel();
      }
    });

    if (moreButton) {
      moreButton.addEventListener("click", () => {
        closePanel();
        setRole("client", "client-badges");
      });
    }
  }
}

function initializeSettingsUI(container) {
  if (!container) return;
  const settingsFeature = window.Weld && window.Weld.settings;
  if (!settingsFeature) return;
  if (typeof settingsFeature.init === "function") {
    settingsFeature.init(container, state);
    return;
  }
  if (typeof settingsFeature.attach === "function") {
    settingsFeature.attach(container, state);
  }
}


function attachCustomerEvents(container) {
  const reportBtn = container.querySelector("#customer-report-button");
  if (reportBtn) {
    reportBtn.addEventListener("click", () => {
      openSuspiciousActivityForm();
    });
  }
  const historyBtn = container.querySelector("#customer-report-history-button");
  if (historyBtn) {
    historyBtn.addEventListener("click", () => {
      state.meta.reportFilter = "other";
      setRole("customer", "customer-reports");
    });
  }
  container.querySelectorAll(".reward-card__cta").forEach(button => {
    button.addEventListener("click", () => {
      const card = button.closest(".reward-card");
      if (!card) return;
      const rewardId = Number(card.getAttribute("data-reward"));
      const reward = rewardById(rewardId);
      if (!reward) return;

      const dialogContent = document.createElement("div");
      const nameElement = document.createElement("strong");
      nameElement.textContent = reward.name || "Reward";
      dialogContent.appendChild(nameElement);
      if (reward.description) {
        const descriptionElement = document.createElement("p");
        descriptionElement.textContent = reward.description;
        dialogContent.appendChild(descriptionElement);
      }
      if (reward.provider) {
        const providerElement = document.createElement("span");
        providerElement.textContent = reward.provider;
        dialogContent.appendChild(providerElement);
      }

      openDialog({
        title: "Redeem this reward?",
        description: `This will use ${reward.pointsCost} of your available points.`,
        content: dialogContent,
        confirmLabel: "Confirm redemption",
        cancelLabel: "Cancel",
        onConfirm: close => {
          const result = redeemReward(rewardId);
          close();
          if (result.success) {
            openDialog({
              title: "Reward queued for fulfilment",
              description: `${reward.name} has been added to your rewards queue.`,
              confirmLabel: "Back to rewards",
              onConfirm: closeDialog
            });
          } else {
            openDialog({
              title: "Unable to redeem",
              description: result.reason || "Please try again.",
              confirmLabel: "Close"
            });
          }
        }
      });
    });
  });
  container.querySelectorAll(".points-card__chip-action").forEach(button => {
    button.addEventListener("click", () => {
      const scrollTarget = button.getAttribute("data-scroll");
      if (scrollTarget) {
        const target = document.querySelector(scrollTarget);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
      const targetRoute = button.getAttribute("data-route");
      if (targetRoute) {
        const filter = button.getAttribute("data-report-filter");
        if (filter) {
          state.meta.reportFilter = filter === "other" ? "other" : null;
        } else if (targetRoute === "customer-reports") {
          state.meta.reportFilter = null;
        }
        setRole("customer", targetRoute);
      }
    });
  });
  container.querySelectorAll(".quest-card__cta").forEach(button => {
    button.addEventListener("click", () => {
      setRole("client", "client-quests");
    });
  });
  container.querySelectorAll(".quest-card__config").forEach(button => {
    button.addEventListener("click", event => {
      event.preventDefault();
      const questId = button.getAttribute("data-quest");
      if (questId) {
        openQuestConfig(questId);
      }
    });
  });
  container.querySelectorAll(".section-header__action[data-route]").forEach(button => {
    button.addEventListener("click", () => {
      const targetRoute = button.getAttribute("data-route");
      const targetRole = button.getAttribute("data-role") || state.meta.role || "customer";
      if (targetRoute) {
        setRole(targetRole, targetRoute);
      }
    });
  });
  container.querySelectorAll("[data-recognition-filter]").forEach(button => {
    button.addEventListener("click", () => {
      const value = (button.getAttribute("data-recognition-filter") || "").trim().toLowerCase();
      const valid = ["received", "given", "all"];
      const nextFilter = valid.includes(value) ? value : "received";
      if (state.meta.recognitionFilter !== nextFilter) {
        state.meta.recognitionFilter = nextFilter;
        persist();
        renderApp();
      }
    });
  });
  const recognitionButton = container.querySelector(".recognition-board__note-button");
  if (recognitionButton) {
    recognitionButton.addEventListener("click", () => {
      openRecognitionFormDialog();
    });
  }
}

function attachCustomerBadgesEvents(container) {
  const back = container.querySelector("[data-action='back-to-hub']");
  if (back) {
    back.addEventListener("click", () => {
      setRole("customer", "customer");
    });
  }
}

function attachCustomerReportsEvents(container) {
  const back = container.querySelector("[data-action='back-to-hub']");
  if (back) {
    back.addEventListener("click", () => {
      setRole("customer", "customer");
    });
  }
}

function attachCustomerRedemptionsEvents(container) {
  const back = container.querySelector("[data-action='back-to-hub']");
  if (back) {
    back.addEventListener("click", () => {
      setRole("customer", "customer");
    });
  }
}

function attachClientDashboardEvents(container) {
  if (!container) return;
  container.addEventListener("click", event => {
    const bulkDepartment = event.target.closest("[data-bulk-department-action]");
    if (bulkDepartment) {
      const action = bulkDepartment.getAttribute("data-bulk-department-action");
      if (action === "publish") {
        setAllLeaderboardPublication(true);
      } else if (action === "unpublish") {
        setAllLeaderboardPublication(false);
      }
      return;
    }

    const departmentToggle = event.target.closest(".department-publish-toggle");
    if (departmentToggle) {
      const departmentId = departmentToggle.getAttribute("data-department");
      const action = departmentToggle.getAttribute("data-action");
      if (departmentId && action) {
        setLeaderboardEntryPublication(departmentId, action === "publish");
      }
      return;
    }

    const bulkProgram = event.target.closest("[data-bulk-program-action]");
    if (bulkProgram) {
      const action = bulkProgram.getAttribute("data-bulk-program-action");
      if (action === "publish") {
        setAllEngagementProgramsPublication(true);
      } else if (action === "unpublish") {
        setAllEngagementProgramsPublication(false);
      }
      return;
    }

    const programToggle = event.target.closest(".program-publish-toggle");
    if (programToggle) {
      const programId = programToggle.getAttribute("data-program");
      const action = programToggle.getAttribute("data-action");
      if (programId && action) {
        setEngagementProgramPublication(programId, action === "publish");
      }
      return;
    }

    const button = event.target.closest(".client-card .table-actions [data-route]");
    if (!button) return;
    event.preventDefault();
    const route = button.getAttribute("data-route");
    const role = button.getAttribute("data-role");
    if (role) {
      setRole(role, route || role);
    } else if (route) {
      navigate(route);
    }
  });
}

function attachReportingEvents(container) {
  const csvBtn = container.querySelector("#download-csv-button");
  if (csvBtn) {
    csvBtn.addEventListener("click", () => {
      openDialog({
        title: "CSV export ready",
        description: "In the real product this downloads a CSV. For the demo, use this cue to talk through the audit trail.",
        confirmLabel: "Got it"
      });
    });
  }
  container.querySelectorAll(".table-actions button").forEach(button => {
    button.addEventListener("click", () => {
      const action = button.getAttribute("data-action");
      const messageId = Number(button.getAttribute("data-message"));
      updateMessageStatus(messageId, action === "approve" ? MessageStatus.APPROVED : MessageStatus.REJECTED);
    });
  });
}

function attachClientRewardsEvents(container) {
  container.addEventListener("click", event => {
    const statusButton = event.target.closest("[data-reward-status]");
    if (statusButton) {
      const rawValue = (statusButton.getAttribute("data-reward-status") || "").trim().toLowerCase();
      const nextStatus = rawValue === "published" || rawValue === "unpublished" ? rawValue : null;
      if (state.meta.rewardStatusFilter !== nextStatus) {
        state.meta.rewardStatusFilter = nextStatus;
        persist();
        renderApp();
      }
      return;
    }

    const filterButton = event.target.closest("[data-reward-filter]");
    if (filterButton) {
      const value = (filterButton.getAttribute("data-reward-filter") || "").trim().toLowerCase();
      const nextFilter = value.length > 0 ? value : null;
      if (state.meta.rewardFilter !== nextFilter) {
        state.meta.rewardFilter = nextFilter;
        persist();
        renderApp();
      }
      return;
    }

    const bulkButton = event.target.closest("[data-bulk-reward-action]");
    if (bulkButton) {
      const action = bulkButton.getAttribute("data-bulk-reward-action");
      if (action === "publish") {
        setAllRewardsPublication(true);
      } else if (action === "unpublish") {
        setAllRewardsPublication(false);
      }
      return;
    }

    const configButton = event.target.closest(".reward-card__config");
    if (configButton) {
      event.preventDefault();
      const idAttr = configButton.getAttribute("data-reward");
      if (!idAttr) return;
      const numericId = Number(idAttr);
      if (Number.isFinite(numericId)) {
        openRewardConfig(numericId);
      } else {
        openRewardConfig(idAttr);
      }
      return;
    }

    const button = event.target.closest(".reward-publish-toggle");
    if (!button) return;
    const rewardId = Number(button.getAttribute("data-reward"));
    if (!Number.isFinite(rewardId)) return;
    const action = button.getAttribute("data-action");
    if (!action) return;
    const nextPublished = action === "publish";
    setRewardPublication(rewardId, nextPublished);
  });
}

function attachClientQuestsEvents(container) {
  container.addEventListener("click", event => {
    const statusButton = event.target.closest("[data-quest-status]");
    if (statusButton) {
      const rawValue = (statusButton.getAttribute("data-quest-status") || "").trim().toLowerCase();
      const nextStatus = rawValue === "published" || rawValue === "unpublished" ? rawValue : null;
      if (state.meta.questStatusFilter !== nextStatus) {
        state.meta.questStatusFilter = nextStatus;
        persist();
        renderApp();
      }
      return;
    }

    const filterButton = event.target.closest("[data-quest-filter]");
    if (filterButton) {
      const value = (filterButton.getAttribute("data-quest-filter") || "").trim().toLowerCase();
      const nextFilter = value.length > 0 ? value : null;
      if (state.meta.questFilter !== nextFilter) {
        state.meta.questFilter = nextFilter;
        persist();
        renderApp();
      }
      return;
    }

    const bulkButton = event.target.closest("[data-bulk-quest-action]");
    if (bulkButton) {
      const action = bulkButton.getAttribute("data-bulk-quest-action");
      if (action === "publish") {
        setAllQuestsPublication(true);
      } else if (action === "unpublish") {
        setAllQuestsPublication(false);
      }
      return;
    }

    const configButton = event.target.closest(".quest-card__config");
    if (configButton) {
      const questId = configButton.getAttribute("data-quest");
      if (questId) {
        event.preventDefault();
        openQuestConfig(questId);
      }
      return;
    }

    const button = event.target.closest(".quest-publish-toggle");
    if (!button) return;
    const questId = button.getAttribute("data-quest");
    const action = button.getAttribute("data-action");
    if (!questId || !action) return;
    setQuestPublication(questId, action === "publish");
  });
}

function attachWeldLabsEvents(container) {
  if (!container) return;
  container.addEventListener("click", event => {
    const toggle = event.target.closest("[data-lab-toggle]");
    if (toggle) {
      const featureId = (toggle.getAttribute("data-lab-feature") || "").trim();
      const clientIdRaw = (toggle.getAttribute("data-client") || "").trim();
      if (!featureId || !clientIdRaw) {
        return;
      }
      const numericClientId = Number(clientIdRaw);
      const clientIdValue =
        Number.isFinite(numericClientId) && clientIdRaw !== "" ? numericClientId : clientIdRaw;
      const currentEnabled = toggle.getAttribute("data-enabled") === "true";
      setLabFeatureAccess(featureId, clientIdValue, !currentEnabled);
      return;
    }
    const bulk = event.target.closest("[data-lab-bulk]");
    if (bulk) {
      const featureId = (bulk.getAttribute("data-lab-feature") || "").trim();
      const mode = (bulk.getAttribute("data-lab-bulk") || "").trim().toLowerCase();
      if (!featureId || !mode) return;
      if (mode === "enable") {
        setLabFeatureAccessForAll(featureId, true);
      } else if (mode === "disable") {
        setLabFeatureAccessForAll(featureId, false);
      }
    }
  });
}

function attachAdminEvents(container) {
  const triggerBtn = container.querySelector("#trigger-playbook");
  if (triggerBtn) {
    triggerBtn.addEventListener("click", () => {
      openDialog({
        title: "Playbook scheduled",
        description: "Use this cue to explain how Weld orchestrates interventions across tenants.",
        confirmLabel: "Nice"
      });
    });
  }

  container.querySelectorAll("[data-action='view-journey'], [data-action='share-insights']").forEach(button => {
    button.addEventListener("click", () => {
      const clientId = Number(button.getAttribute("data-client"));
      const client = state.clients.find(c => c.id === clientId);
      if (!client) return;
      if (button.getAttribute("data-action") === "view-journey") {
        openDialog({
          title: `Switch to ${client.name}?`,
          description: "For the demo, remind stakeholders each client gets a dedicated journey view with custom insights.",
          confirmLabel: "Return",
          onConfirm: closeDialog
        });
      } else {
        openDialog({
          title: "Insights shared",
          description: `Customer Success receives a packaged summary for ${client.name}.`,
          confirmLabel: "Great"
        });
      }
    });
  });
}
function attachHeaderEvents(container) {
  if (!container) return;
  const brandBtn = container.querySelector("#brand-button");
  if (brandBtn) {
    brandBtn.addEventListener("click", () => {
      navigate("landing");
    });
  }
}

function renderHeader() {
  const role = state.meta.role;
  const navMarkup = renderGlobalNav(state.meta.route);
  return `
    ${navMarkup}
    <header class="header">
      <div class="header__actions">
        ${
          role
            ? `<span class="chip ${ROLE_LABELS[role].chip}"><span class="chip__dot"></span>${ROLE_LABELS[role].label}</span>`
            : ""
        }
      </div>
    </header>
  `;
}

function renderContent() {
  switch (state.meta.route) {
    case "customer":
      return renderCustomer();
    case "customer-badges":
      return renderCustomerBadgesPage();
    case "customer-reports":
      return renderCustomerReportsPage();
    case "customer-redemptions":
      return renderCustomerRedemptionsPage();
    case "client-dashboard":
      return "";
    case "client-reporting":
      return "";
    case "client-rewards":
      return renderClientRewards();
    case "client-quests":
      return "";
    case "weld-admin":
      return renderWeldAdmin();
    case "weld-labs":
      return renderWeldLabs();
    default:
      return "";
  }
}

function attachGlobalNav(container) {

  const groups = Array.from(container.querySelectorAll(".global-nav__group"));



  const closeGroups = () => {

    groups.forEach(group => {

      group.classList.remove("global-nav__group--open");

      const triggerEl = group.querySelector(".global-nav__trigger");

      if (triggerEl) triggerEl.setAttribute("aria-expanded", "false");

    });

  };



  groups.forEach(group => {

    const trigger = group.querySelector(".global-nav__trigger");

    if (!trigger) return;

    trigger.setAttribute("aria-expanded", "false");

    trigger.setAttribute("aria-haspopup", "true");

    const toggleGroup = event => {

      event.stopPropagation();

      const isOpen = group.classList.contains("global-nav__group--open");

      closeGroups();

      if (!isOpen) {

        group.classList.add("global-nav__group--open");

        trigger.setAttribute("aria-expanded", "true");

      }

    };



    trigger.addEventListener("click", toggleGroup);

    trigger.addEventListener("keydown", event => {

      if (event.key !== "Enter" && event.key !== " ") return;

      event.preventDefault();

      toggleGroup(event);

    });

  });



  container.querySelectorAll(".global-nav [data-route]").forEach(button => {

    button.addEventListener("click", event => {

      event.stopPropagation();

      const route = button.getAttribute("data-route");

      const role = button.getAttribute("data-role");



      closeGroups();



      if (route === "addin") {

        state.meta.addinScreen = "report";

      }



      if (role) {

        setRole(role, route || role);

      } else if (route) {

        navigate(route);

      }

    });

  });

}


function ensureRouteSafety() {
  const routeInfo = ROUTES[state.meta.route];
  if (!routeInfo) {
    state.meta.route = "landing";
    state.meta.role = null;
  } else if (routeInfo.requiresRole && state.meta.role !== routeInfo.requiresRole) {
    state.meta.route = "landing";
    state.meta.role = null;
  }
}

function renderApp() {
  ensureRouteSafety();

  const app = document.getElementById("app");
  const route = state.meta.route;

  if (route !== "addin") {
    teardownBadgeShowcase();
  }

  const registry = window.WeldRegistry || {};
  const routeConfig = route ? registry[route] : undefined;

  if (routeConfig) {
    const pageClass = routeConfig.pageClass || "page";
    const innerClass = routeConfig.innerClass || "page__inner";
    const contentClass = routeConfig.contentClass || "layout-content";
    const contentId = routeConfig.contentId || "main-content";
    const renderedContent =
      typeof routeConfig.render === "function" ? routeConfig.render(state) : "";
    const mainIdAttribute = contentId ? ` id="${contentId}"` : "";
    app.innerHTML = `
      <div class="${pageClass}">
        ${renderHeader()}
        <div class="${innerClass}">
          <main class="${contentClass}"${mainIdAttribute}>${renderedContent}</main>
        </div>
      </div>
    `;
    attachHeaderEvents(app);
    attachGlobalNav(app);
    initializeSettingsUI(app);
    const attachTarget =
      (contentId && app.querySelector("#" + contentId)) || app.querySelector("main") || app;
    if (typeof routeConfig.attach === "function") {
      routeConfig.attach(attachTarget, state);
    }
    return;
  }



  if (route === "client-badges") {

    app.innerHTML = `

      <div class="page">

        ${renderHeader()}

        <div class="page__inner">

          <main class="layout-content" id="main-content"></main>

        </div>

      </div>

    `;

    attachHeaderEvents(app);

    attachGlobalNav(app);

    initializeSettingsUI(app);

    const mainContent = app.querySelector("#main-content");

    const badgesFeature = window.Weld && window.Weld.features && window.Weld.features.badges;

    if (mainContent && badgesFeature && typeof badgesFeature.render === "function") {

      badgesFeature.render(mainContent, state);

    }

    return;

  }



  if (route === "addin") {

    app.innerHTML = `

      <div class="page page--addin">

        ${renderHeader()}

        <div class="page__inner page__inner--single">

          <main class="layout-content layout-content--flush" id="main-content"></main>

        </div>

      </div>

    `;

    attachHeaderEvents(app);

    attachGlobalNav(app);

    initializeSettingsUI(app);

    const mainContent = app.querySelector("#main-content");

    const reporterFeature = window.Weld && window.Weld.features && window.Weld.features.reporter;

    if (mainContent && reporterFeature && typeof reporterFeature.render === "function") {

      reporterFeature.render(mainContent, state);

    }

    return;

  }



  if (route === "client-dashboard") {

    app.innerHTML = `

      <div class="page">

        ${renderHeader()}

        <div class="page__inner">

          <main class="layout-content" id="main-content"></main>

        </div>

      </div>

    `;

    attachHeaderEvents(app);

    attachGlobalNav(app);

    initializeSettingsUI(app);

    const mainContent = app.querySelector("#main-content");

    const orgHubFeature = window.Weld && window.Weld.features && window.Weld.features.orgHub;

    if (mainContent && orgHubFeature && typeof orgHubFeature.render === "function") {

      orgHubFeature.render(mainContent, state);

    }

    return;

  }



  if (route === "client-reporting") {

    app.innerHTML = `

      <div class="page">

        ${renderHeader()}

        <div class="page__inner">

          <main class="layout-content" id="main-content"></main>

        </div>

      </div>

    `;

    attachHeaderEvents(app);

    attachGlobalNav(app);

    initializeSettingsUI(app);

    const mainContent = app.querySelector("#main-content");

    const dashboardFeature = window.Weld && window.Weld.features && window.Weld.features.dashboard;

    if (mainContent && dashboardFeature && typeof dashboardFeature.render === "function") {

      dashboardFeature.render(mainContent, state);

    }

    return;

  }



  if (route === "client-quests") {

    app.innerHTML = `

      <div class="page">

        ${renderHeader()}

        <div class="page__inner">

          <main class="layout-content" id="main-content"></main>

        </div>

      </div>

    `;

    attachHeaderEvents(app);

    attachGlobalNav(app);

    initializeSettingsUI(app);

    const mainContent = app.querySelector("#main-content");

    const hubFeature = window.Weld && window.Weld.features && window.Weld.features.hub;

    if (mainContent && hubFeature && typeof hubFeature.render === "function") {

      hubFeature.render(mainContent, state);

    }

    return;

  }



  app.innerHTML = `

    <div class="page">

      ${renderHeader()}

      <div class="page__inner">

        <main class="layout-content" id="main-content">${renderContent()}</main>

      </div>

    </div>

  `;



  attachHeaderEvents(app);

  attachGlobalNav(app);

  initializeSettingsUI(app);



  const mainContent = app.querySelector("#main-content");

  if (!mainContent) return;

  if (route === "client-rewards") attachClientRewardsEvents(mainContent);

  if (route === "weld-labs") attachWeldLabsEvents(mainContent);

  if (route === "weld-admin") attachAdminEvents(mainContent);

}



window.addEventListener("DOMContentLoaded", () => {
  renderApp();
});

window.addEventListener("hashchange", () => {
  const hashRoute = window.location.hash.replace("#", "");
  if (hashRoute && ROUTES[hashRoute]) {
    if (ROUTES[hashRoute].requiresRole) {
      state.meta.role = ROUTES[hashRoute].requiresRole;
    }
    state.meta.route = hashRoute;
    WeldState.saveState(state);
    renderApp();
  }
});
