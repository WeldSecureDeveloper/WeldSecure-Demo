// util.js - tiny helpers; add more as you migrate
(function () {
  const WeldUtil = window.WeldUtil || {};
  const AppData = window.AppData || {};
  const QUEST_DIFFICULTY_ORDER =
    Array.isArray(AppData.QUEST_DIFFICULTY_ORDER) ? AppData.QUEST_DIFFICULTY_ORDER : [];
  const ICON_PATHS = AppData.ICON_PATHS || {};
  const METRIC_TONES = AppData.METRIC_TONES || {};

  Object.assign(WeldUtil, {
    clone(value) {
      return JSON.parse(JSON.stringify(value));
    },

    generateId(prefix = "id") {
      const idPrefix = typeof prefix === "string" && prefix.length > 0 ? `${prefix}-` : "";
      const cryptoSource = typeof globalThis !== "undefined" ? globalThis.crypto : null;
      if (cryptoSource && typeof cryptoSource.randomUUID === "function") {
        return `${idPrefix}${cryptoSource.randomUUID()}`;
      }
      const now = Date.now().toString(36);
      const random = Math.floor(Math.random() * 1e9)
        .toString(36)
        .padStart(6, "0");
      return `${idPrefix}${now}-${random}`;
    },

    normalizeId(value, prefix) {
      if (value === null || value === undefined) return null;
      if (typeof value === "string") {
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : null;
      }
      if (Number.isFinite(value)) {
        return String(value);
      }
      const stringValue = typeof value.toString === "function" ? value.toString() : "";
      if (stringValue && stringValue !== "[object Object]") {
        return stringValue;
      }
      return WeldUtil.generateId(prefix);
    },

    normalizeLabFeatureId(value) {
      if (Number.isFinite(value)) {
        return String(value);
      }
      if (typeof value === "string") {
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : null;
      }
      return null;
    },

    normalizeLabClientId(value) {
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
    },

    labClientKey(value) {
      if (Number.isFinite(value)) {
        return String(Number(value));
      }
      if (typeof value === "string") {
        return value.trim();
      }
      return "";
    },

    questDifficultyRank(value) {
      if (typeof value !== "string") return QUEST_DIFFICULTY_ORDER.length;
      const normalized = value.trim().toLowerCase();
      const index = QUEST_DIFFICULTY_ORDER.indexOf(normalized);
      return index === -1 ? QUEST_DIFFICULTY_ORDER.length : index;
    },

    compareQuestsByDifficulty(a, b) {
      const rankDiff =
        WeldUtil.questDifficultyRank(a && a.difficulty) -
        WeldUtil.questDifficultyRank(b && b.difficulty);
      if (rankDiff !== 0) return rankDiff;
      const aTitle = a && typeof a.title === "string" ? a.title : "";
      const bTitle = b && typeof b.title === "string" ? b.title : "";
      return aTitle.localeCompare(bTitle, undefined, { sensitivity: "base" });
    },

    renderIcon(name, size = "md") {
      if (!name) return "";
      const sizes = ["xs", "sm", "md", "lg"];
      const sizeClass = sizes.includes(size) ? size : "md";
      const safeName = WeldUtil.escapeHtml(String(name));
      const path = ICON_PATHS[name];
      if (typeof path === "string" && path.trim().length > 0) {
        const safePath = WeldUtil.escapeHtml(path.trim());
        return `<span class="icon-token icon-token--${sizeClass}" data-icon="${safeName}" aria-hidden="true"><img src="${safePath}" alt="" loading="lazy" decoding="async" /></span>`;
      }
      return "";
    },

    renderMetricCard(label, value, trend, toneKey = "indigo", icon = "medal") {
      const tone = METRIC_TONES[toneKey] || METRIC_TONES.indigo;
      const trendDirection =
        trend && (trend.direction === "up" || trend.direction === "down") ? trend.direction : null;
      const trendValue = trend && trend.value ? WeldUtil.escapeHtml(String(trend.value)) : null;
      const trendCaption = trend && trend.caption ? WeldUtil.escapeHtml(String(trend.caption)) : null;
      const trendMarkup = trendValue
        ? `<div class="metric-card__trend"${trendDirection ? ` data-direction="${trendDirection}"` : ""}>
        <span>${trendValue}</span>
        ${trendCaption ? `<small>${trendCaption}</small>` : ""}
      </div>`
        : "";

      return `
    <article class="metric-card" style="--tone-bg:${tone.bg};--tone-color:${tone.color};">
      <span class="metric-card__icon">${WeldUtil.renderIcon(icon, "md")}</span>
      <div class="metric-card__body">
        <span class="metric-card__label">${WeldUtil.escapeHtml(String(label))}</span>
        <strong class="metric-card__value">${WeldUtil.escapeHtml(String(value))}</strong>
        ${trendMarkup}
      </div>
    </article>
  `;
    },

    escapeHtml(value) {
      if (value === null || value === undefined) return "";
      return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    },

    el(tag, props = {}, children = []) {
      const element = document.createElement(tag);
      Object.assign(element, props);
      (Array.isArray(children) ? children : [children]).forEach(child => element.append(child));
      return element;
    }
  });

  window.WeldUtil = WeldUtil;
})();
