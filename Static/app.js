const ROLE_LABELS = window.AppData.ROLE_LABELS;
const ROUTES = window.AppData.ROUTES;
const MessageStatus = window.AppData.MessageStatus;
const NAV_GROUPS = window.AppData.NAV_GROUPS;
const QUEST_DIFFICULTY_ORDER = window.AppData.QUEST_DIFFICULTY_ORDER;
const METRIC_TONES = window.AppData.METRIC_TONES;
const BADGE_TONES = window.AppData.BADGE_TONES;
const BADGE_ICON_BACKDROPS = window.AppData.BADGE_ICON_BACKDROPS;
const POINTS_CARD_ICONS = window.AppData.POINTS_CARD_ICONS;
const BadgeLabTheme = window.BadgeLabTheme || {};
const BADGES = window.AppData.BADGES;
const BADGE_CATEGORY_ORDER = window.AppData.BADGE_CATEGORY_ORDER;
const BADGE_DRAFTS = new Set(window.AppData.BADGE_DRAFTS);
const DEFAULT_QUESTS = window.AppData.DEFAULT_QUESTS;
const DEPARTMENT_LEADERBOARD = window.AppData.DEPARTMENT_LEADERBOARD;
const ENGAGEMENT_PROGRAMS = window.AppData.ENGAGEMENT_PROGRAMS;
const THEME_OPTIONS = ["light", "dark"];
let state =
  (typeof window.state === "object" && window.state) ||
  WeldState.loadState() ||
  (typeof WeldState.initialState === "function" ? WeldState.initialState() : {});
window.state = state;
if (window.Weld) {
  window.Weld.state = state;
}

const WeldServices = window.WeldServices || {};

function normalizeTheme(theme) {
  if (typeof theme === "string") {
    const normalized = theme.trim().toLowerCase();
    if (THEME_OPTIONS.includes(normalized)) {
      return normalized;
    }
  }
  return "light";
}

function applyTheme(theme) {
  const root = document.documentElement;
  const body = document.body;
  const nextTheme = normalizeTheme(theme);
  if (state?.meta) {
    state.meta.theme = nextTheme;
  }
  if (root) {
    root.setAttribute("data-theme", nextTheme);
    root.classList.toggle("theme-dark", nextTheme === "dark");
    root.classList.toggle("theme-light", nextTheme === "light");
    if (root.style) {
      root.style.colorScheme = nextTheme === "dark" ? "dark" : "light";
    }
  }
  if (body) {
    body.setAttribute("data-theme", nextTheme);
    body.classList.toggle("theme-dark", nextTheme === "dark");
    body.classList.toggle("theme-light", nextTheme === "light");
  }
  return nextTheme;
}

applyTheme(state?.meta?.theme);
window.applyTheme = applyTheme;

function invokeService(name, args = []) {
  const service = WeldServices[name];
  if (typeof service === "function") {
    return service(...args);
  }
  console.warn(`WeldServices.${name} is unavailable. Ensure services/stateServices.js is loaded.`);
  return undefined;
}

function navigate(route) {
  return invokeService("navigate", [route, state]);
}

function setRole(role, route) {
  return invokeService("setRole", [role, route, state]);
}

function resetDemo() {
  return invokeService("resetDemo", [state]);
}

function persist() {
  return invokeService("persist", [state]);
}

function completeQuest(questId, options = {}) {
  return invokeService("completeQuest", [questId, options, state]);
}

function redeemReward(rewardId) {
  return invokeService("redeemReward", [rewardId, state]);
}

function openSettings(category) {
  return invokeService("openSettings", [category, state]);
}

function closeSettings() {
  return invokeService("closeSettings", [state]);
}

function setTheme(theme) {
  return invokeService("setTheme", [theme, state]);
}

function toggleTheme() {
  return invokeService("toggleTheme", [state]);
}

const serviceWrappers = {
  navigate,
  setRole,
  resetDemo,
  persist,
  completeQuest,
  redeemReward,
  openSettings,
  closeSettings,
  setTheme,
  toggleTheme
};

Object.entries(serviceWrappers).forEach(([key, fn]) => {
  window[key] = fn;
});

const ACHIEVEMENT_EYEBROW = "";
const ACHIEVEMENT_TRIGGER_DELAY = 600;
const ACHIEVEMENT_DISPLAY_MS = 6200;
const ACHIEVEMENT_EXIT_DURATION_MS = 750;
const ACHIEVEMENT_LEAVE_CLEANUP_MS = 750;
const ACHIEVEMENT_EXIT_CLEANUP_BUFFER_MS = 120;
const ACHIEVEMENT_BLINK_DELAY = 1400;
const ACHIEVEMENT_COLLAPSE_LEAD_MS = 700;
const ACHIEVEMENT_SUBTITLE_MAX_LENGTH = 54;
const ACHIEVEMENT_TITLE_TEXT = "Badge unlocked!";
const ACHIEVEMENT_FLAG_KEYS = {
  HUB_WELCOME: "hub-welcome"
};
const HUB_WELCOME_BADGE_ID = "welcome-wave";

const achievementOverlayState = {
  host: null,
  queue: [],
  active: null,
  pendingShowTimer: null,
  hideTimer: null,
  cleanupTimer: null,
  blinkTimer: null,
  collapseTimer: null,
  timeline: null,
  paused: false,
  blinkFired: false,
  collapseFired: false,
  exitAnimationTarget: null,
  exitAnimationHandler: null
};

function ensureAchievementFlags() {
  if (!state.meta || typeof state.meta !== "object") {
    state.meta = {};
  }
  if (!state.meta.achievementFlags || typeof state.meta.achievementFlags !== "object") {
    state.meta.achievementFlags = {};
  }
  return state.meta.achievementFlags;
}

function hasAchievementFlag(key) {
  const flags = ensureAchievementFlags();
  return Boolean(flags[key]);
}

function setAchievementFlag(key, value) {
  const flags = ensureAchievementFlags();
  const stamp =
    typeof value === "string" && value.trim().length > 0 ? value.trim() : new Date().toISOString();
  flags[key] = stamp;
  try {
    WeldState.saveState(state);
  } catch (error) {
    console.warn("Failed to persist achievement flag:", error);
  }
}

function ensureAchievementHost() {
  if (typeof document === "undefined") return null;
  if (
    achievementOverlayState.host &&
    document.body &&
    document.body.contains(achievementOverlayState.host)
  ) {
    return achievementOverlayState.host;
  }
  if (!document.body) return null;
  const host = document.createElement("div");
  host.className = "achievement-overlay";
  host.setAttribute("aria-live", "polite");
  host.setAttribute("aria-atomic", "true");
  host.setAttribute("role", "status");
  host.setAttribute("aria-hidden", "true");
  host.tabIndex = -1;
  host.dataset.achievementOverlay = "true";
  bindAchievementOverlayInteractions(host);
  document.body.appendChild(host);
  achievementOverlayState.host = host;
  return host;
}

function bindAchievementOverlayInteractions(host) {
  if (!host || host.dataset.achievementOverlayBound === "true") return;
  const pause = () => pauseAchievementTimeline();
  const resume = () => resumeAchievementTimeline();
  host.addEventListener("mouseenter", pause);
  host.addEventListener("mouseleave", resume);
  host.addEventListener("focus", pause);
  host.addEventListener("blur", resume);
  host.dataset.achievementOverlayBound = "true";
}

function achievementToneStyles(toneKey) {
  if (toneKey && BADGE_ICON_BACKDROPS && BADGE_ICON_BACKDROPS[toneKey]) {
    return BADGE_ICON_BACKDROPS[toneKey];
  }
  if (BADGE_ICON_BACKDROPS?.default) {
    return BADGE_ICON_BACKDROPS.default;
  }
  return {
    background: "linear-gradient(135deg, #86efac, #22c55e)",
    shadow: "rgba(34, 197, 94, 0.3)"
  };
}

function sanitizeBadgeVisualId(value, prefix = "badge") {
  const base =
    typeof value === "string" && value.trim().length > 0 ? value.trim() : `${prefix}-${Date.now().toString(36)}`;
  return `${prefix}-${base.replace(/[^a-zA-Z0-9:_-]/g, "-")}`;
}

function getBadgeTierMetaValue(badgeLike, fallbackIndex = 0) {
  if (!badgeLike) return null;
  if (badgeLike.tierMeta) return badgeLike.tierMeta;
  if (badgeLike.badgeTier && typeof BadgeLabTheme?.getTierMetaById === "function") {
    const tier = BadgeLabTheme.getTierMetaById(badgeLike.badgeTier);
    if (tier) return tier;
  }
  if (typeof badgeLike.difficulty === "string" && typeof BadgeLabTheme?.getTierMetaByDifficulty === "function") {
    const tier = BadgeLabTheme.getTierMetaByDifficulty(badgeLike.difficulty, fallbackIndex);
    if (tier) return tier;
  }
  if (typeof BadgeLabTheme?.getTierMetaForIndex === "function") {
    return BadgeLabTheme.getTierMetaForIndex(fallbackIndex, BadgeLabTheme.tiers?.length || 1);
  }
  if (Array.isArray(BadgeLabTheme?.tiers) && BadgeLabTheme.tiers.length) {
    return BadgeLabTheme.tiers[Math.min(fallbackIndex, BadgeLabTheme.tiers.length - 1)];
  }
  return null;
}

function getBadgeVisualStyles(tierMeta) {
  if (typeof BadgeLabTheme?.getTierStyles === "function") {
    return BadgeLabTheme.getTierStyles(tierMeta);
  }
  if (tierMeta?.gradient) {
    return {
      background: tierMeta.gradient,
      shadow: tierMeta.shadow || "0 12px 24px rgba(79, 70, 229, 0.32)"
    };
  }
  return {
    background: "linear-gradient(135deg, #c7d2fe, #818cf8)",
    shadow: "0 12px 24px rgba(79, 70, 229, 0.32)"
  };
}

function getBadgeIconSource(badgeLike, fallbackIndex = 0) {
  if (badgeLike?.labIcon) return badgeLike.labIcon;
  if (typeof BadgeLabTheme?.getIconForBadge === "function") {
    const src = BadgeLabTheme.getIconForBadge(badgeLike, fallbackIndex);
    if (src) return src;
  }
  return typeof badgeLike?.icon === "string" ? badgeLike.icon : "";
}

function renderBadgeLabOrb(badgeLike, { arcPrefix = "badge", modifier = "", particleCount = 10 } = {}) {
  if (!BadgeLabTheme || typeof BadgeLabTheme.renderArc !== "function") {
    return null;
  }
  const tierMeta = getBadgeTierMetaValue(badgeLike);
  const styles = getBadgeVisualStyles(tierMeta);
  const arcId = sanitizeBadgeVisualId(badgeLike?.id || arcPrefix, arcPrefix);
  const shine = typeof BadgeLabTheme.renderShine === "function" ? BadgeLabTheme.renderShine() : "";
  const ring = typeof BadgeLabTheme.renderRing === "function" ? BadgeLabTheme.renderRing() : "";
  const particles =
    typeof BadgeLabTheme.renderParticles === "function" ? BadgeLabTheme.renderParticles(particleCount) : "";
  const iconSrc = getBadgeIconSource(badgeLike);
  const label =
    typeof badgeLike?.title === "string" && badgeLike.title.trim().length > 0 ? badgeLike.title.trim() : "Badge";
  const iconMarkup =
    typeof BadgeLabTheme.renderIconImage === "function"
      ? BadgeLabTheme.renderIconImage(iconSrc, label)
      : typeof WeldUtil?.renderIcon === "function"
      ? WeldUtil.renderIcon("medal", "sm")
      : `<span class="badge-lab-badge__fallback" aria-hidden="true">B</span>`;
  return {
    markup: `
      <span class="badge-lab-badge ${modifier}">
        <span class="badge-lab-badge__icon" style="background:${styles.background}; box-shadow:${styles.shadow};">
          ${shine}
          ${ring}
          ${particles}
          ${BadgeLabTheme.renderArc(tierMeta?.label || "", arcId)}
          ${iconMarkup}
        </span>
      </span>
    `,
    shadow: styles.shadow || "rgba(15, 23, 42, 0.25)",
    tierMeta
  };
}

function sanitizeAchievementText(value, maxLength = ACHIEVEMENT_SUBTITLE_MAX_LENGTH) {
  if (typeof value !== "string") return "";
  let normalized = value.replace(/[^\x20-\x7E]/g, " ").replace(/\s+/g, " ").trim();
  if (!normalized) {
    return "";
  }
  if (typeof maxLength === "number" && maxLength > 3 && normalized.length > maxLength) {
    normalized = `${normalized.slice(0, maxLength - 3).trimEnd()}...`;
  }
  return normalized;
}

function normalizeAchievementEntry(entry) {
  if (!entry || typeof entry !== "object") return null;
  const escapeTitle = value =>
    typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
  const pointsValue = Number(entry.points);
  const sanitizedSubtitle = sanitizeAchievementText(entry.subtitle || "");
  return {
    id:
      (typeof entry.id === "string" && entry.id.trim().length > 0
        ? entry.id.trim()
        : (WeldUtil?.generateId?.("achievement") ||
            `achievement-${Date.now()}-${Math.random().toString(16).slice(2)}`)),
    eyebrow: sanitizeAchievementText(entry.eyebrow || "") || ACHIEVEMENT_EYEBROW,
    title: escapeTitle(entry.title) || ACHIEVEMENT_TITLE_TEXT,
    subtitle: sanitizedSubtitle,
    points: Number.isFinite(pointsValue) && pointsValue > 0 ? pointsValue : null,
    icon: escapeTitle(entry.icon) || "medal",
    tone: escapeTitle(entry.tone) || "emerald",
    badgeId:
      typeof entry.badgeId === "string" && entry.badgeId.trim().length > 0 ? entry.badgeId.trim() : null,
    badgeTierId:
      typeof entry.badgeTier === "string" && entry.badgeTier.trim().length > 0
        ? entry.badgeTier.trim().toLowerCase()
        : null,
    badgeDifficulty:
      typeof entry.difficulty === "string" && entry.difficulty.trim().length > 0 ? entry.difficulty.trim() : null,
    badgeLabIcon:
      typeof entry.labIcon === "string" && entry.labIcon.trim().length > 0 ? entry.labIcon.trim() : null,
    displayMs:
      Number.isFinite(entry.displayMs) && entry.displayMs > 0 ? entry.displayMs : ACHIEVEMENT_DISPLAY_MS
  };
}

function renderAchievementContent(entry) {
  const escapeHtml =
    typeof WeldUtil?.escapeHtml === "function"
      ? WeldUtil.escapeHtml
      : value => value;
  const iconMarkup =
    typeof WeldUtil?.renderIcon === "function"
      ? WeldUtil.renderIcon(entry.icon || "medal", "md")
      : `<span class="achievement-toast__icon-placeholder">?</span>`;
  const toneStyles = achievementToneStyles(entry.tone);
  const badgeVisual = renderAchievementBadge(entry);
  const visualMarkup = badgeVisual?.markup || iconMarkup;
  const visualShadow = badgeVisual?.shadow || toneStyles.shadow || "rgba(0, 0, 0, 0.3)";
  let formattedPoints = null;
  if (Number.isFinite(entry.points) && entry.points > 0) {
    formattedPoints =
      typeof formatNumber === "function"
        ? formatNumber(entry.points)
        : Number(entry.points).toLocaleString("en-GB");
  }
  const subtitleBase =
    typeof entry.subtitle === "string" && entry.subtitle.trim().length > 0
      ? entry.subtitle.trim()
      : "";
  const pointsSuffix = formattedPoints !== null ? ` +${formattedPoints} pts` : "";
  const subtextValue = `${subtitleBase}${pointsSuffix}`.trim();
  const detailMarkup = subtextValue
    ? `<p class="achievement-subtext">${escapeHtml(subtextValue)}</p>`
    : "";
  return `
    <div class="achievement-wrapper animation" data-achievement-toast>
      <div class="achievement-super">
        <div class="achievement-body">
          <p class="achievement-text">${escapeHtml(entry.title)}</p>
          ${detailMarkup}
        </div>
        <div class="achievement-title" style="box-shadow:0 0 18px ${visualShadow};">
          ${visualMarkup}
        </div>
      </div>
    </div>
  `;
}

function renderAchievementBadge(entry) {
  const badgeDetails = {
    id: entry.badgeId || entry.id,
    title: entry.subtitle || entry.title,
    badgeTier: entry.badgeTierId,
    difficulty: entry.badgeDifficulty,
    labIcon: entry.badgeLabIcon
  };
  const orb = renderBadgeLabOrb(badgeDetails, {
    arcPrefix: entry.id ? `achievement-${entry.id}` : "achievement-toast",
    modifier: "badge-lab-badge--toast",
    particleCount: 6
  });
  return orb;
}

const ACHIEVEMENT_SUBTEXT_FIT_ATTEMPTS = 5;
const ACHIEVEMENT_SUBTEXT_FIT_DELAY = 220;

function scheduleAchievementDescriptionFit(host) {
  if (!host) return;
  let attempt = 0;
  const runFit = () => {
    if (!host.isConnected || host.getAttribute("aria-hidden") === "true") {
      return;
    }
    if (!host.dataset.activeId) {
      return;
    }
    fitAchievementDescription(host);
    attempt += 1;
    if (attempt < ACHIEVEMENT_SUBTEXT_FIT_ATTEMPTS) {
      window.setTimeout(runFit, ACHIEVEMENT_SUBTEXT_FIT_DELAY);
    }
  };
  runFit();
}

function fitAchievementDescription(host) {
  if (!host || typeof window === "undefined" || typeof window.getComputedStyle !== "function") {
    return;
  }
  const body = host.querySelector(".achievement-body");
  if (!body) return;
  const detail = body.querySelector(".achievement-subtext");
  if (!detail) return;
  detail.style.removeProperty("--achievement-subtext-size");
  detail.classList.remove("achievement-subtext--scaled");
  const availableWidth = Math.max(body.clientWidth - 24, 0);
  if (availableWidth <= 0) {
    return;
  }
  const contentWidth = detail.scrollWidth;
  if (contentWidth <= availableWidth) {
    return;
  }
  const baseSize = parseFloat(window.getComputedStyle(detail).fontSize) || 14;
  const ratio = Math.max(0.6, availableWidth / contentWidth);
  const nextSize = Math.max(10, baseSize * ratio);
  detail.style.setProperty("--achievement-subtext-size", `${nextSize.toFixed(2)}px`);
  detail.classList.add("achievement-subtext--scaled");
}
function processAchievementQueue() {
  if (achievementOverlayState.active || achievementOverlayState.queue.length === 0) return;
  const nextEntry = achievementOverlayState.queue.shift();
  achievementOverlayState.active = nextEntry;
  achievementOverlayState.pendingShowTimer = window.setTimeout(() => {
    achievementOverlayState.pendingShowTimer = null;
    displayAchievement(nextEntry);
  }, ACHIEVEMENT_TRIGGER_DELAY);
}

function clearAchievementTimers() {
  const host = achievementOverlayState.host;
  if (achievementOverlayState.pendingShowTimer) {
    window.clearTimeout(achievementOverlayState.pendingShowTimer);
    achievementOverlayState.pendingShowTimer = null;
  }
  if (achievementOverlayState.hideTimer) {
    window.clearTimeout(achievementOverlayState.hideTimer);
    achievementOverlayState.hideTimer = null;
  }
  if (achievementOverlayState.cleanupTimer) {
    window.clearTimeout(achievementOverlayState.cleanupTimer);
    achievementOverlayState.cleanupTimer = null;
  }
  unbindAchievementExitListener();
  if (achievementOverlayState.blinkTimer) {
    window.clearTimeout(achievementOverlayState.blinkTimer);
    achievementOverlayState.blinkTimer = null;
  }
  if (achievementOverlayState.collapseTimer) {
    window.clearTimeout(achievementOverlayState.collapseTimer);
    achievementOverlayState.collapseTimer = null;
  }
  achievementOverlayState.timeline = null;
  achievementOverlayState.paused = false;
  achievementOverlayState.blinkFired = false;
  achievementOverlayState.collapseFired = false;
  if (host) {
    host.classList.remove(
      "achievement-overlay--leaving",
      "achievement-overlay--blink",
      "achievement-overlay--collapsing",
      "achievement-overlay--paused"
    );
  }
}

function unbindAchievementExitListener() {
  const { exitAnimationTarget, exitAnimationHandler } = achievementOverlayState;
  if (exitAnimationTarget && exitAnimationHandler) {
    exitAnimationTarget.removeEventListener("animationend", exitAnimationHandler);
  }
  achievementOverlayState.exitAnimationTarget = null;
  achievementOverlayState.exitAnimationHandler = null;
}

function finalizeAchievementExit(entryId) {
  const host = achievementOverlayState.host;
  if (!host) return;
  if (!entryId || host.dataset.activeId === entryId) {
    host.innerHTML = "";
    host.removeAttribute("data-active-id");
    host.setAttribute("aria-hidden", "true");
    host.tabIndex = -1;
  }
  host.classList.remove(
    "achievement-overlay--leaving",
    "achievement-overlay--visible",
    "achievement-overlay--blink",
    "achievement-overlay--collapsing",
    "achievement-overlay--paused"
  );
  achievementOverlayState.active = null;
  achievementOverlayState.timeline = null;
  achievementOverlayState.paused = false;
  achievementOverlayState.cleanupTimer = null;
  processAchievementQueue();
}

function scheduleAchievementExitCleanup(entryId) {
  // Wait for the slideDown exit animation to finish before tearing down the DOM.
  const host = achievementOverlayState.host;
  if (!host) return;
  const fallbackDelay = Math.max(
    0,
    ACHIEVEMENT_LEAVE_CLEANUP_MS + ACHIEVEMENT_EXIT_CLEANUP_BUFFER_MS
  );
  let resolved = false;
  const complete = () => {
    if (resolved) return;
    resolved = true;
    if (achievementOverlayState.cleanupTimer) {
      window.clearTimeout(achievementOverlayState.cleanupTimer);
      achievementOverlayState.cleanupTimer = null;
    }
    unbindAchievementExitListener();
    finalizeAchievementExit(entryId);
  };
  const wrapper = host.querySelector("[data-achievement-toast]");
  if (wrapper) {
    const handler = event => {
      if (event.animationName !== "slideDown") {
        return;
      }
      complete();
    };
    unbindAchievementExitListener();
    wrapper.addEventListener("animationend", handler);
    achievementOverlayState.exitAnimationTarget = wrapper;
    achievementOverlayState.exitAnimationHandler = handler;
  }
  achievementOverlayState.cleanupTimer = window.setTimeout(() => {
    achievementOverlayState.cleanupTimer = null;
    complete();
  }, fallbackDelay);
}

function hideAchievement(entryId) {
  const host = achievementOverlayState.host;
  if (!host) {
    achievementOverlayState.active = null;
    processAchievementQueue();
    return;
  }
  if (host.dataset.activeId !== entryId) {
    return;
  }
  if (!host.classList.contains("achievement-overlay--collapsing")) {
    host.classList.add("achievement-overlay--collapsing");
  }
  if (achievementOverlayState.hideTimer) {
    window.clearTimeout(achievementOverlayState.hideTimer);
    achievementOverlayState.hideTimer = null;
  }
  if (achievementOverlayState.blinkTimer) {
    window.clearTimeout(achievementOverlayState.blinkTimer);
    achievementOverlayState.blinkTimer = null;
  }
  if (achievementOverlayState.collapseTimer) {
    window.clearTimeout(achievementOverlayState.collapseTimer);
    achievementOverlayState.collapseTimer = null;
  }
  host.classList.add("achievement-overlay--leaving");
  scheduleAchievementExitCleanup(entryId);
}

function displayAchievement(entry) {
  const host = ensureAchievementHost();
  if (!host) {
    achievementOverlayState.active = null;
    return;
  }
  clearAchievementTimers();
  host.classList.remove(
    "achievement-overlay--leaving",
    "achievement-overlay--blink",
    "achievement-overlay--collapsing",
    "achievement-overlay--paused"
  );
  host.innerHTML = renderAchievementContent(entry);
  host.dataset.activeId = entry.id;
  host.setAttribute("aria-hidden", "false");
  host.tabIndex = 0;
  host.classList.add("achievement-overlay--visible");
  scheduleAchievementDescriptionFit(host);
  scheduleAchievementTimeline(entry);
}

function scheduleAchievementTimeline(entry) {
  const host = achievementOverlayState.host;
  if (!host) return;
  const now = performance.now();
  const hideDelay = Math.max(0, entry.displayMs - ACHIEVEMENT_EXIT_DURATION_MS);
  const collapseDelay = Math.max(0, hideDelay - ACHIEVEMENT_COLLAPSE_LEAD_MS);
  const blinkDelay = Math.max(0, ACHIEVEMENT_BLINK_DELAY);
  const timeline = {
    entryId: entry.id,
    totalDisplay: entry.displayMs,
    hideRemaining: hideDelay,
    hideTimerStart: now,
    blinkRemaining: blinkDelay,
    blinkTimerStart: blinkDelay > 0 ? now : null,
    collapseRemaining: collapseDelay,
    collapseTimerStart: collapseDelay > 0 ? now : null,
    exitDuration: ACHIEVEMENT_EXIT_DURATION_MS
  };
  achievementOverlayState.timeline = timeline;
  achievementOverlayState.paused = false;
  achievementOverlayState.blinkFired = blinkDelay <= 0;
  achievementOverlayState.collapseFired = collapseDelay <= 0;

  achievementOverlayState.hideTimer = window.setTimeout(() => {
    hideAchievement(entry.id);
  }, timeline.hideRemaining);

  if (!achievementOverlayState.blinkFired) {
    achievementOverlayState.blinkTimer = window.setTimeout(() => {
      triggerAchievementBlink(entry.id);
    }, blinkDelay);
  } else {
    triggerAchievementBlink(entry.id);
  }

  if (!achievementOverlayState.collapseFired) {
    achievementOverlayState.collapseTimer = window.setTimeout(() => {
      triggerAchievementCollapse(entry.id);
    }, collapseDelay);
  } else {
    triggerAchievementCollapse(entry.id);
  }
}

function triggerAchievementBlink(entryId) {
  achievementOverlayState.blinkFired = true;
  if (achievementOverlayState.blinkTimer) {
    window.clearTimeout(achievementOverlayState.blinkTimer);
    achievementOverlayState.blinkTimer = null;
  }
  const host = achievementOverlayState.host;
  if (!host || host.dataset.activeId !== entryId) return;
  host.classList.add("achievement-overlay--blink");
  if (achievementOverlayState.timeline) {
    achievementOverlayState.timeline.blinkRemaining = 0;
    achievementOverlayState.timeline.blinkTimerStart = null;
  }
}

function triggerAchievementCollapse(entryId) {
  achievementOverlayState.collapseFired = true;
  if (achievementOverlayState.collapseTimer) {
    window.clearTimeout(achievementOverlayState.collapseTimer);
    achievementOverlayState.collapseTimer = null;
  }
  const host = achievementOverlayState.host;
  if (!host || host.dataset.activeId !== entryId) return;
  host.classList.add("achievement-overlay--collapsing");
  if (achievementOverlayState.timeline) {
    achievementOverlayState.timeline.collapseRemaining = 0;
    achievementOverlayState.timeline.collapseTimerStart = null;
  }
}

function pauseAchievementTimeline() {
  if (!achievementOverlayState.active || achievementOverlayState.paused) return;
  const timeline = achievementOverlayState.timeline;
  if (!timeline) return;
  const now = performance.now();
  if (achievementOverlayState.hideTimer) {
    window.clearTimeout(achievementOverlayState.hideTimer);
    achievementOverlayState.hideTimer = null;
    if (typeof timeline.hideRemaining === "number" && typeof timeline.hideTimerStart === "number") {
      timeline.hideRemaining = Math.max(0, timeline.hideRemaining - (now - timeline.hideTimerStart));
    } else {
      timeline.hideRemaining = 0;
    }
  }
  if (!achievementOverlayState.blinkFired && achievementOverlayState.blinkTimer) {
    window.clearTimeout(achievementOverlayState.blinkTimer);
    achievementOverlayState.blinkTimer = null;
    if (typeof timeline.blinkRemaining === "number" && typeof timeline.blinkTimerStart === "number") {
      timeline.blinkRemaining = Math.max(0, timeline.blinkRemaining - (now - timeline.blinkTimerStart));
    } else {
      timeline.blinkRemaining = 0;
    }
  }
  if (!achievementOverlayState.collapseFired && achievementOverlayState.collapseTimer) {
    window.clearTimeout(achievementOverlayState.collapseTimer);
    achievementOverlayState.collapseTimer = null;
    if (
      typeof timeline.collapseRemaining === "number" &&
      typeof timeline.collapseTimerStart === "number"
    ) {
      timeline.collapseRemaining = Math.max(
        0,
        timeline.collapseRemaining - (now - timeline.collapseTimerStart)
      );
    } else {
      timeline.collapseRemaining = 0;
    }
  }
  achievementOverlayState.paused = true;
  if (achievementOverlayState.host) {
    achievementOverlayState.host.classList.add("achievement-overlay--paused");
  }
}

function resumeAchievementTimeline() {
  if (!achievementOverlayState.active || !achievementOverlayState.paused) return;
  const timeline = achievementOverlayState.timeline;
  if (!timeline) return;
  const entryId = timeline.entryId;
  const now = performance.now();
  if (timeline.hideRemaining > 0) {
    timeline.hideTimerStart = now;
    achievementOverlayState.hideTimer = window.setTimeout(() => {
      hideAchievement(entryId);
    }, timeline.hideRemaining);
  } else if (!achievementOverlayState.hideTimer) {
    hideAchievement(entryId);
    return;
  }

  if (!achievementOverlayState.blinkFired && timeline.blinkRemaining > 0) {
    timeline.blinkTimerStart = now;
    achievementOverlayState.blinkTimer = window.setTimeout(() => {
      triggerAchievementBlink(entryId);
    }, timeline.blinkRemaining);
  } else if (!achievementOverlayState.blinkFired && timeline.blinkRemaining <= 0) {
    triggerAchievementBlink(entryId);
  }

  if (!achievementOverlayState.collapseFired && timeline.collapseRemaining > 0) {
    timeline.collapseTimerStart = now;
    achievementOverlayState.collapseTimer = window.setTimeout(() => {
      triggerAchievementCollapse(entryId);
    }, timeline.collapseRemaining);
  } else if (!achievementOverlayState.collapseFired && timeline.collapseRemaining <= 0) {
    triggerAchievementCollapse(entryId);
  }

  achievementOverlayState.paused = false;
  if (achievementOverlayState.host) {
    achievementOverlayState.host.classList.remove("achievement-overlay--paused");
  }
}

function queueAchievementToast(entry) {
  const normalized = normalizeAchievementEntry(entry);
  if (!normalized) return;
  achievementOverlayState.queue.push(normalized);
  if (!achievementOverlayState.active) {
    processAchievementQueue();
  }
}

function queueBadgeAchievements(badgeInput, options = {}) {
  const list = Array.isArray(badgeInput) ? badgeInput : [badgeInput];
  if (!list || list.length === 0) return;
  const eyebrow =
    sanitizeAchievementText(options.eyebrow || "") || ACHIEVEMENT_EYEBROW;
  const fallbackSubtitle = sanitizeAchievementText(ACHIEVEMENT_TITLE_TEXT);
  list.forEach((badge, index) => {
    if (!badge) return;
    const resolvedBadge =
      typeof badge === "string" ? (typeof badgeById === "function" ? badgeById(badge) : null) : badge;
    if (!resolvedBadge) return;
    const badgeName =
      typeof resolvedBadge.title === "string" && resolvedBadge.title.trim().length > 0
        ? resolvedBadge.title.trim()
        : "";
    const subtitleText = sanitizeAchievementText(badgeName) || fallbackSubtitle;
    const tierId =
      typeof resolvedBadge.tierMeta?.id === "string" && resolvedBadge.tierMeta.id.trim().length > 0
        ? resolvedBadge.tierMeta.id.trim().toLowerCase()
        : null;
    queueAchievementToast({
      id:
        typeof resolvedBadge.id === "string" && resolvedBadge.id.trim().length > 0
          ? `${resolvedBadge.id}-${index}-${Date.now()}`
          : undefined,
      eyebrow,
      title: ACHIEVEMENT_TITLE_TEXT,
      subtitle: subtitleText,
      points: resolvedBadge.points,
      icon: resolvedBadge.icon || "medal",
      tone: resolvedBadge.tone || "emerald",
      badgeId: resolvedBadge.id,
      badgeTier: tierId,
      difficulty: resolvedBadge.difficulty,
      labIcon: resolvedBadge.labIcon
    });
  });
}

const WeldAchievements = {
  queue: queueAchievementToast,
  queueBadgeUnlocks: queueBadgeAchievements,
  queueBadgeAchievements,
  isActive() {
    return Boolean(achievementOverlayState.active);
  }
};

window.WeldAchievements = Object.assign(window.WeldAchievements || {}, WeldAchievements);

function unlockHubWelcomeAchievement() {
  if (hasAchievementFlag(ACHIEVEMENT_FLAG_KEYS.HUB_WELCOME)) {
    return;
  }
  const badge =
    typeof badgeById === "function" ? badgeById(HUB_WELCOME_BADGE_ID) : null;
  setAchievementFlag(ACHIEVEMENT_FLAG_KEYS.HUB_WELCOME);
  if (badge && window.WeldAchievements?.queueBadgeUnlocks) {
    window.WeldAchievements.queueBadgeUnlocks([badge], {
      context: "Reporter hub",
      subtitle: "First visit"
    });
    return;
  }
  if (window.WeldAchievements?.queue) {
    window.WeldAchievements.queue({
      title: "Reporter hub unlocked",
      subtitle: "First visit",
      points: 20,
      icon: "spark",
      tone: "emerald"
    });
  }
}

function handleRouteAchievements(route) {
  if (route === "customer") {
    unlockHubWelcomeAchievement();
  }
}

function rewardById(id) {
  const rewards = Array.isArray(state.rewards) ? state.rewards : [];
  const target = String(id);
  return (
    rewards.find(item => {
      const candidate = item?.id;
      return candidate !== undefined && candidate !== null && String(candidate) === target;
    }) || null
  );
}

function questById(id) {
  const quests = Array.isArray(state.quests) ? state.quests : [];
  const target = String(id);
  return (
    quests.find(item => {
      const candidate = item?.id;
      return candidate !== undefined && candidate !== null && String(candidate) === target;
    }) || null
  );
}

window.rewardById = rewardById;
window.questById = questById;

let cachedAppShell = null;

function getAppShell() {
  if (cachedAppShell) return cachedAppShell;
  try {
    const modules = window.WeldModules;
    if (!modules || typeof modules.use !== "function") {
      console.warn("WeldModules unavailable; app shell components not loaded.");
      cachedAppShell = null;
      return cachedAppShell;
    }
    cachedAppShell = modules.use("components/appShell");
  } catch (error) {
    console.warn("Failed to load components/appShell module:", error);
    cachedAppShell = null;
  }
  return cachedAppShell;
}

function invokeShell(method, args = [], options = {}) {
  const shell = getAppShell();
  if (!shell || typeof shell[method] !== "function") {
    return options.fallback;
  }
  const includeState = options.includeState === true;
  const finalArgs = includeState ? [...args, state] : args;
  const result = shell[method](...finalArgs);
  return result === undefined ? options.fallback : result;
}

function renderBadgeSpotlight(badgeInput) {
  return (
    invokeShell("renderBadgeSpotlight", [badgeInput], { includeState: true, fallback: "" }) || ""
  );
}

function teardownBadgeShowcase() {
  invokeShell("teardownBadgeShowcase");
}

function setupBadgeShowcase(container) {
  invokeShell("setupBadgeShowcase", [container], { includeState: true });
}

function renderGlobalNav(activeRoute) {
  return (
    invokeShell("renderGlobalNav", [activeRoute], { includeState: true, fallback: "" }) || ""
  );
}

function attachHeaderEvents(container) {
  invokeShell("attachHeaderEvents", [container]);
}

function attachGlobalNav(container) {
  invokeShell("attachGlobalNav", [container], { includeState: true });
}

function initializeSettingsUI(container) {
  invokeShell("initializeSettingsUI", [container], { includeState: true });
}

function renderHeader() {
  return invokeShell("renderHeader", [], { includeState: true, fallback: "" }) || "";
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

window.getBadges = getBadges;

function rewardRemainingLabel(reward) {
  if (typeof WeldUtil?.rewardRemainingLabel === "function") {
    return WeldUtil.rewardRemainingLabel(reward);
  }
  if (reward?.unlimited) {
    return "&infin;";
  }
  const remaining = Number(reward?.remaining);
  return Number.isFinite(remaining) ? remaining : 0;
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
        reasons = ["reason-urgent-tone", "reason-looks-like-phishing"];
        break;
      case "smishing":
        reasons = ["reason-spoofing-senior", "reason-urgent-tone"];
        break;
      case "quishing":
        reasons = ["reason-unexpected-attachment", "reason-looks-like-phishing"];
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
      reasons: ["reason-urgent-tone", "reason-looks-like-phishing"],
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
      reasons: ["reason-spoofing-senior", "reason-urgent-tone"],
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
      reasons: ["reason-unexpected-attachment", "reason-looks-like-phishing"],
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
  const nextPublished = Boolean(published);
  if (reward.published === nextPublished) return;
  reward.published = nextPublished;
  WeldState.saveState(state);
  renderAppPreservingScroll();
}

function setBadgePublication(badgeId, published, options = {}) {
  if (!Array.isArray(state.badges)) return false;
  const targetId =
    typeof badgeId === "string" && badgeId.trim().length > 0 ? badgeId.trim() : String(badgeId ?? "");
  const badge = state.badges.find(item => item.id === targetId);
  if (!badge) return false;
  const nextPublished = Boolean(published);
  if (badge.published === nextPublished) return false;
  badge.published = nextPublished;
  WeldState.saveState(state);
  if (!options || options.silent !== true) {
    renderAppPreservingScroll();
  }
  return true;
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
  renderAppPreservingScroll();
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
  renderAppPreservingScroll();
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
  renderAppPreservingScroll();
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
  renderAppPreservingScroll();
}

function setHubFeatureToggle(featureKey, enabled) {
  if (!state.meta || typeof state.meta !== "object") {
    state.meta = {};
  }
  if (
    !state.meta.featureToggles ||
    typeof state.meta.featureToggles !== "object" ||
    Array.isArray(state.meta.featureToggles)
  ) {
    state.meta.featureToggles = {};
  }
  const normalizedKey =
    typeof featureKey === "string" && featureKey.trim().length > 0
      ? featureKey.trim().toLowerCase()
      : "";
  if (!normalizedKey) return;
  const targetEnabled = Boolean(enabled);
  const currentEntry = state.meta.featureToggles[normalizedKey];
  const currentEnabled = currentEntry !== false;
  if (currentEnabled === targetEnabled) return;
  if (targetEnabled) {
    delete state.meta.featureToggles[normalizedKey];
  } else {
    state.meta.featureToggles[normalizedKey] = false;
  }
  WeldState.saveState(state);
  renderAppPreservingScroll();
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
  if (origin !== "addin" && badgeBundle.length > 0 && window.WeldAchievements?.queueBadgeUnlocks) {
    const badgeContext = origin === "addin" ? "Outlook add-in" : "Reporter hub";
    window.WeldAchievements.queueBadgeUnlocks(badgeBundle, { context: badgeContext });
  }
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
      if (onCancel) {
        onCancel(close);
        return;
      }
      close();
    }
  }

  function handleKey(event) {
    if (event.key === "Escape") {
      if (onCancel) {
        onCancel(close);
        return;
      }
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
      if (onCancel) onCancel(close);
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
    tags.push(`<span class="catalogue-card__tag catalogue-badge-card__tag">${WeldUtil.escapeHtml(normalizedCategory)}</span>`);
  }
  if (difficultyLabel) {
    tags.push(`<span class="catalogue-card__tag catalogue-badge-card__tag">${WeldUtil.escapeHtml(difficultyLabel)}</span>`);
  }
  const tagsMarkup = tags.length
    ? `<div class="catalogue-badge-card__tags catalogue-card__tags">${tags.join("")}</div>`
    : "";
  const pointsValue = Number(badge.points) || 0;
  const toggleTitle = difficultyLabel
    ? `${WeldUtil.escapeHtml(difficultyLabel)} - ${formatNumber(pointsValue)} pts`
    : `${formatNumber(pointsValue)} pts`;
  const ariaLabel = `${badge.title} badge, worth ${formatNumber(pointsValue)} points in the collection.`;
  const badgeOrb = renderBadgeLabOrb(badge, {
    arcPrefix: `hub-${sanitizedId}`,
    modifier: "badge-lab-badge--spotlight",
    particleCount: 8
  });
  const iconMarkup = badgeOrb
    ? `<span class="catalogue-badge__icon catalogue-badge__icon--lab">${badgeOrb.markup}</span>`
    : `<span class="catalogue-badge__icon" style="background:${iconBackdrop}; box-shadow:0 18px 32px ${iconShadow};">
          ${WeldUtil.renderIcon(badge.icon || "medal", "sm")}
        </span>`;

  return `
    <article
      class="catalogue-badge catalogue-badge--hub"
      data-badge="${safeDataId}"
      style="--badge-tone:${WeldUtil.escapeHtml(tone)};--badge-icon-tone:${WeldUtil.escapeHtml(iconBackdrop)};--badge-icon-shadow:${WeldUtil.escapeHtml(
        iconShadow
      )};">
      <button
        type="button"
        class="catalogue-badge__trigger"
        aria-haspopup="true"
        aria-label="${WeldUtil.escapeHtml(badge.title)} badge details"
        aria-controls="${cardId}"
        title="${WeldUtil.escapeHtml(toggleTitle)}">
        ${iconMarkup}
      </button>
      <span class="catalogue-badge__label">${WeldUtil.escapeHtml(badge.title)}</span>
      <div id="${cardId}" class="catalogue-badge-card catalogue-badge-card--hub" role="group" aria-label="${WeldUtil.escapeHtml(ariaLabel)}">
        <span class="catalogue-badge-card__halo"></span>
        <span class="catalogue-badge-card__orb catalogue-badge-card__orb--one"></span>
        <span class="catalogue-badge-card__orb catalogue-badge-card__orb--two"></span>
        <div class="catalogue-badge-card__main">
          <h3 class="catalogue-badge-card__title">${WeldUtil.escapeHtml(badge.title)}</h3>
          ${tagsMarkup}
          <p class="catalogue-badge-card__description">${WeldUtil.escapeHtml(badge.description)}</p>
        </div>
        <footer class="catalogue-badge-card__footer">
          <span class="catalogue-badge-card__points">
            <span class="catalogue-badge-card__points-value">+${formatNumber(pointsValue)}</span>
            <span class="catalogue-badge-card__points-unit">pts</span>
          </span>
        </footer>
      </div>
    </article>
  `;
}

function formatCatalogueLabel(label) {
  if (typeof WeldUtil?.formatCatalogueLabel === "function") {
    return WeldUtil.formatCatalogueLabel(label);
  }
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

window.badgeById = badgeById;

let lastRenderedRoute = null;

function clearGuidedTourOverlay() {
  if (window.WeldGuidedTour && typeof window.WeldGuidedTour.clear === "function") {
    window.WeldGuidedTour.clear();
  }
}

function scrollViewportToTop() {
  if (typeof window === "undefined") return;
  const doc = document.scrollingElement || document.documentElement || document.body;
  let previousScrollBehavior;
  if (doc && doc.style) {
    previousScrollBehavior = doc.style.scrollBehavior;
    doc.style.scrollBehavior = "auto";
  }
  if (doc && typeof doc.scrollTo === "function") {
    doc.scrollTo(0, 0);
  } else if (typeof window.scrollTo === "function") {
    window.scrollTo(0, 0);
  }
  if (doc && doc.style) {
    if (typeof previousScrollBehavior === "string" && previousScrollBehavior.length > 0) {
      doc.style.scrollBehavior = previousScrollBehavior;
    } else {
      doc.style.removeProperty("scroll-behavior");
    }
  }
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
  applyTheme(state?.meta?.theme);

  const app = document.getElementById("app");
  const route = state.meta.route;
  const shouldResetScroll = lastRenderedRoute !== null && lastRenderedRoute !== route;
  if (lastRenderedRoute && lastRenderedRoute !== route) {
    clearGuidedTourOverlay();
  }
  handleRouteAchievements(route);

  if (route !== "addin") {
    teardownBadgeShowcase();
  }

  const registry = window.WeldRegistry || {};
  const routeConfig = route ? registry[route] : undefined;

  if (!routeConfig) {
    if (route !== "landing") {
      state.meta.route = "landing";
      WeldState.saveState(state);
      renderApp();
    }
    return;
  }

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
  scheduleBadgeEdgeAlignment(app);
  if (shouldResetScroll) {
    scrollViewportToTop();
  }
  lastRenderedRoute = route;
}

function renderAppPreservingScroll() {
  if (typeof window === "undefined") {
    renderApp();
    return;
  }

  const doc = document.scrollingElement || document.documentElement || document.body;
  const scrollX = window.pageXOffset ?? window.scrollX ?? (doc ? doc.scrollLeft : 0) ?? 0;
  const scrollY = window.pageYOffset ?? window.scrollY ?? (doc ? doc.scrollTop : 0) ?? 0;
  let previousScrollBehavior;
  if (doc && doc.style) {
    previousScrollBehavior = doc.style.scrollBehavior;
    doc.style.scrollBehavior = "auto";
  }
  renderApp();
  if (doc && typeof doc.scrollTo === "function") {
    doc.scrollTo(scrollX, scrollY);
  } else {
    window.scrollTo(scrollX, scrollY);
  }
  if (doc && doc.style) {
    if (typeof previousScrollBehavior === "string" && previousScrollBehavior.length > 0) {
      doc.style.scrollBehavior = previousScrollBehavior;
    } else {
      doc.style.removeProperty("scroll-behavior");
    }
  }
}

let badgeEdgeAlignmentFrame = null;
let badgeEdgeAlignmentScope = null;
let badgeEdgeResizeListenerAttached = false;

function scheduleBadgeEdgeAlignment(scope) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }
  const nextScope =
    scope && typeof scope.querySelectorAll === "function" ? scope : document;
  badgeEdgeAlignmentScope = nextScope;
  if (badgeEdgeAlignmentFrame) return;
  const requestFrame =
    typeof window.requestAnimationFrame === "function"
      ? window.requestAnimationFrame.bind(window)
      : callback => window.setTimeout(callback, 16);
  badgeEdgeAlignmentFrame = requestFrame(() => {
    badgeEdgeAlignmentFrame = null;
    const target =
      badgeEdgeAlignmentScope && badgeEdgeAlignmentScope.isConnected
        ? badgeEdgeAlignmentScope
        : document;
    applyBadgeEdgeAlignment(target);
  });
  if (!badgeEdgeResizeListenerAttached) {
    badgeEdgeResizeListenerAttached = true;
    window.addEventListener("resize", () => scheduleBadgeEdgeAlignment());
  }
}

function applyBadgeEdgeAlignment(scope) {
  if (!scope || typeof scope.querySelectorAll !== "function") return;
  const containers = scope.querySelectorAll(
    ".catalogue-badge-grid, .catalogue-badge-grid--hub, .catalogue-badge-group__grid"
  );
  containers.forEach(container => alignBadgeEdgesInContainer(container));
}

function alignBadgeEdgesInContainer(container) {
  if (!container || typeof container.querySelectorAll !== "function") return;
  const badges = Array.from(container.querySelectorAll(".catalogue-badge"));
  if (badges.length === 0) return;
  const edgeClass = "catalogue-badge--edge";
  const rowTolerance = 12;
  badges.forEach(badge => badge.classList.remove(edgeClass));
  const rows = [];
  badges.forEach(badge => {
    const top = badge.offsetTop;
    if (!Number.isFinite(top)) return;
    let row = rows.find(entry => Math.abs(entry.top - top) <= rowTolerance);
    if (!row) {
      row = { top, badges: [] };
      rows.push(row);
    }
    row.badges.push(badge);
  });
  rows.forEach(row => {
    let edgeBadge = null;
    let edgeRight = -Infinity;
    row.badges.forEach(badge => {
      const rect = typeof badge.getBoundingClientRect === "function" ? badge.getBoundingClientRect() : null;
      if (!rect) return;
      if (!edgeBadge || rect.right > edgeRight) {
        edgeBadge = badge;
        edgeRight = rect.right;
      }
    });
    if (edgeBadge) {
      edgeBadge.classList.add(edgeClass);
    }
  });
}


