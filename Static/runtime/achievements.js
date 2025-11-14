(function () {
  const modules = window.WeldModules;
  function factory() {
    const WeldState = window.WeldState || {};
    const getAppState = () => (window.Weld && window.Weld.state) || window.state || {};
const ACHIEVEMENT_EYEBROW = "";
const ACHIEVEMENT_TRIGGER_DELAY = 600;
const ACHIEVEMENT_DISPLAY_MS = 6200;
const ACHIEVEMENT_EXIT_DURATION_MS = 750;
const ACHIEVEMENT_LEAVE_CLEANUP_MS = 750;
const ACHIEVEMENT_EXIT_CLEANUP_BUFFER_MS = 120;
const ACHIEVEMENT_BLINK_DELAY = 1400;
const ACHIEVEMENT_COLLAPSE_LEAD_MS = 700;
const ACHIEVEMENT_EXIT_ANIMATION_NAME = "slideDownExit";
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
  const state = getAppState();
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
  const state = getAppState();
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
      if (event.animationName !== ACHIEVEMENT_EXIT_ANIMATION_NAME) {
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


    return {
      queueAchievementToast,
      queueBadgeAchievements,
      handleRouteAchievements,
      unlockHubWelcomeAchievement,
      renderBadgeLabOrb,
      WeldAchievements
    };
  }
  window.__WeldAchievementsModuleFactory = factory;
  if (modules && (!modules.has || !modules.has("runtime/achievements"))) {
    modules.define("runtime/achievements", factory);
  }
})();
