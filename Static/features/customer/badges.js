(function () {
  const modules = window.WeldModules;
  if (!modules || typeof modules.define !== "function") return;
  if (modules.has && modules.has("features/customer/badges")) return;

  modules.define("features/customer/badges", function () {
    let shared;
    try {
      shared = modules.use("features/customer/shared");
    } catch (error) {
      console.warn("Customer badges module could not load shared utilities:", error);
      return null;
    }
    if (!shared) {
      console.warn("Customer badges module missing shared utilities.");
      return null;
    }

    const { AppData, WeldUtil, formatNumber, formatDateTime, getState } = shared;
    const badgeUnlockEntries = Array.isArray(AppData?.CUSTOMER_BADGE_UNLOCKS) ? AppData.CUSTOMER_BADGE_UNLOCKS : [];
    const rarityOrder = ["starter", "rising", "skilled", "expert", "legendary"];

    function getProgressFilter(state) {
      const value = state?.meta?.customerBadgeAvailabilityFilter;
      return value === "unlocked" || value === "locked" ? value : null;
    }

    function buildUnlockMap(entries) {
      const map = new Map();
      entries.forEach(entry => {
        if (!entry || typeof entry !== "object") return;
        const id = typeof entry.id === "string" ? entry.id.trim() : "";
        if (!id) return;
        const achievedAt =
          typeof entry.achievedAt === "string" && entry.achievedAt.trim().length > 0
            ? entry.achievedAt.trim()
            : null;
        map.set(id, { achievedAt });
      });
      return map;
    }

    function attachProgressMetadata(badges, unlockMap) {
      return badges.map(badge => {
        const unlock = unlockMap.get(badge.id);
        const achievedAt = unlock?.achievedAt || null;
        return { ...badge, achievedAt, unlocked: Boolean(achievedAt) };
      });
    }

    function getDifficultyRank(value) {
      if (typeof value !== "string") return rarityOrder.length;
      const normalized = value.trim().toLowerCase();
      const index = rarityOrder.indexOf(normalized);
      return index === -1 ? rarityOrder.length : index;
    }

    function sortByRarity(badges) {
      return badges.slice().sort((a, b) => {
        const rankDiff = getDifficultyRank(a?.difficulty) - getDifficultyRank(b?.difficulty);
        if (rankDiff !== 0) return rankDiff;
        const titleA = typeof a?.title === "string" ? a.title : "";
        const titleB = typeof b?.title === "string" ? b.title : "";
        return titleA.localeCompare(titleB, undefined, { sensitivity: "base" });
      });
    }

    function renderProgressFilters(counts, activeFilter, disabled = false) {
      const totalCount =
        typeof counts.total === "number" ? counts.total : (counts.unlocked || 0) + (counts.locked || 0);
      const filters = [
        { id: "all", label: "All", count: totalCount },
        { id: "unlocked", label: "Unlocked", count: counts.unlocked },
        { id: "locked", label: "Locked", count: counts.locked }
      ];
      return `
        <div class="badge-filter customer-badge-filter" role="toolbar" aria-label="Filter badges by unlock status">
          ${filters.map(filter => renderProgressFilterButton(filter, activeFilter, disabled)).join("")}
        </div>
      `;
    }

    function renderProgressFilterButton(filter, activeFilter, disabled = false) {
      const normalizedActive = typeof activeFilter === "string" ? activeFilter : null;
      const isAllFilter = filter.id === "all";
      const isActive = isAllFilter ? normalizedActive === null : normalizedActive === filter.id;
      const isDisabled = Boolean(disabled);
      const disabledAttributes = isDisabled ? 'disabled aria-disabled="true"' : "";
      const countLabel =
        filter.count === null || filter.count === undefined
          ? ""
          : ` (${WeldUtil.escapeHtml(String(formatNumber(filter.count)))})`;
      const buttonLabel = `${filter.label}${countLabel}`;
      return `
        <button
          type="button"
          class="badge-filter__item${isActive ? " badge-filter__item--active" : ""}"
          data-progress-filter="${WeldUtil.escapeHtml(isAllFilter ? "" : filter.id)}"
          ${isAllFilter ? 'data-progress-filter-all="true"' : ""}
          aria-pressed="${isActive ? "true" : "false"}"
          ${disabledAttributes}>
          ${WeldUtil.escapeHtml(buttonLabel)}
        </button>
      `;
    }

    function formatAchievementDate(timestamp) {
      if (!timestamp) return "";
      const date = new Date(timestamp);
      if (Number.isNaN(date.getTime())) {
        return formatDateTime(timestamp);
      }
      return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
    }

    function renderBadgeGridItem(badge) {
      const statusMarkup = badge.unlocked && badge.achievedAt ? renderUnlockedStatus(badge.achievedAt) : renderLockedStatus();
      return `
        <div class="customer-badge-grid__item" role="listitem">
          ${renderHubBadgeCard(badge)}
          ${statusMarkup}
        </div>
      `;
    }

    function renderUnlockedStatus(timestamp) {
      const safeTimestamp = typeof timestamp === "string" ? timestamp : "";
      const formattedDate = formatAchievementDate(safeTimestamp);
      if (!formattedDate) {
        return renderLockedStatus();
      }
      const safeDate = WeldUtil.escapeHtml(formattedDate);
      const safeDateTime = WeldUtil.escapeHtml(safeTimestamp);
      const ariaLabel = WeldUtil.escapeHtml(`Unlocked ${formattedDate}`);
      return `
        <span class="customer-badge-grid__status" data-status="unlocked" aria-label="${ariaLabel}">
          ${renderPadlockIcon("unlock")}
          <time class="customer-badge-grid__status-detail" datetime="${safeDateTime}">${safeDate}</time>
        </span>
      `;
    }

    function renderLockedStatus() {
      return `
        <span class="customer-badge-grid__status" data-status="locked" aria-label="Locked badge">
          ${renderPadlockIcon("lock")}
        </span>
      `;
    }

    function renderPadlockIcon(variant) {
      const unlockedPaths =
        '<g transform="translate(8 0) scale(-1 1) translate(-8 0)"><path d="M8 10V7a4 4 0 018 0" stroke-linecap="round" stroke-linejoin="round"/></g><rect x="6" y="10" width="12" height="10" rx="2" fill="none"/><path d="M12 14v2" stroke-linecap="round" stroke-linejoin="round"/>';
      const lockedPaths =
        '<path d="M8 10V7a4 4 0 018 0v3" stroke-linecap="round" stroke-linejoin="round"/><rect x="6" y="10" width="12" height="10" rx="2" fill="none"/><path d="M12 14v2" stroke-linecap="round" stroke-linejoin="round"/>';
      const svgPaths = variant === "unlock" ? unlockedPaths : lockedPaths;
      const viewBox = variant === "unlock" ? "-2 0 26 24" : "0 0 24 24";
      return `
        <span class="customer-badge-grid__status-icon" aria-hidden="true">
          <svg viewBox="${viewBox}" fill="none" stroke="currentColor" stroke-width="1.5">
            ${svgPaths}
          </svg>
        </span>
      `;
    }

    function renderBadgeGridContainer(badges, label) {
      if (!Array.isArray(badges) || badges.length === 0) return "";
      const safeLabel = WeldUtil.escapeHtml(label || "Badges");
      return `
        <div class="catalogue-badge-grid catalogue-badge-grid--hub customer-badge-grid" role="list" aria-label="${safeLabel}">
          ${badges.map(renderBadgeGridItem).join("")}
        </div>
      `;
    }

    function getGroupEmptyCopy(groupId) {
      if (groupId === "unlocked") {
        return "Badges you unlock will appear here. Keep building momentum to start filling this list.";
      }
      if (groupId === "locked") {
        return "Great news - there are no locked badges left. Explore your unlocked badges above.";
      }
      return "No badges match the selected filter.";
    }

    function getOverallEmptyCopy() {
      return "No badges are currently published. Return to the hub to curate or publish them.";
    }

    function renderBadgeGroup({ id, title, badges, totalCount }) {
      const countLabel = formatNumber(totalCount);
      const heading = `${title} (${countLabel})`;
      const safeHeading = WeldUtil.escapeHtml(heading);
      const gridLabel = `${title} list`;
      const gridMarkup = badges.length
        ? renderBadgeGridContainer(badges, gridLabel)
        : `<div class="customer-detail__empty customer-detail__empty--inline">${getGroupEmptyCopy(id)}</div>`;
      return `
        <div class="customer-badge-group" data-group="${WeldUtil.escapeHtml(id)}">
          <header class="customer-badge-group__header">
            <h2 class="customer-badge-group__title">${safeHeading}</h2>
          </header>
          ${gridMarkup}
        </div>
      `;
    }

    function renderCustomerBadgesView(state) {
      const publishedBadges = getBadges().filter(badge => badge.published);
      const badgeCount = publishedBadges.length;
      const badgeLabel = badgeCount === 1 ? "badge" : "badges";
      const unlockMap = buildUnlockMap(badgeUnlockEntries);
      const badgesWithProgress = sortByRarity(attachProgressMetadata(publishedBadges, unlockMap));
      const unlockedBadges = badgesWithProgress.filter(badge => badge.unlocked);
      const lockedBadges = badgesWithProgress.filter(badge => !badge.unlocked);
      const unlockedCount = unlockedBadges.length;
      const lockedCount = lockedBadges.length;
      const activeFilter = getProgressFilter(state);
      const visibleCount =
        activeFilter === "unlocked" ? unlockedCount : activeFilter === "locked" ? lockedCount : badgeCount;
      const descriptionTail = badgeCount
        ? activeFilter
          ? ` Showing ${WeldUtil.escapeHtml(String(formatNumber(visibleCount)))} of ${WeldUtil.escapeHtml(
              String(formatNumber(badgeCount))
            )} ${badgeLabel}.`
          : ` Currently showing ${WeldUtil.escapeHtml(String(formatNumber(badgeCount)))} ${badgeLabel}.`
        : "";
      const filtersMarkup = renderProgressFilters(
        { total: badgeCount, unlocked: unlockedCount, locked: lockedCount },
        activeFilter,
        badgeCount === 0
      );
      const filterNote =
        activeFilter && badgeCount
          ? `<p class="customer-detail__filter-note">Showing ${activeFilter} badges only. Tap the filter again to clear it.</p>`
          : "";
      const showUnlocked = !activeFilter || activeFilter === "unlocked";
      const showLocked = !activeFilter || activeFilter === "locked";
      const groups = [];
      if (badgeCount > 0 && showUnlocked) {
        groups.push(
          renderBadgeGroup({
            id: "unlocked",
            title: "Unlocked badges",
            badges: unlockedBadges,
            totalCount: unlockedCount
          })
        );
      }
      if (badgeCount > 0 && showLocked) {
        groups.push(
          renderBadgeGroup({
            id: "locked",
            title: "Locked badges",
            badges: lockedBadges,
            totalCount: lockedCount
          })
        );
      }
      const fallbackGroupId = activeFilter === "locked" ? "locked" : "unlocked";
      const badgeGroupsMarkup =
        badgeCount === 0
          ? `<div class="customer-detail__empty">${getOverallEmptyCopy()}</div>`
          : groups.length
          ? `<div class="customer-badge-groups">${groups.join("")}</div>`
          : `<div class="customer-detail__empty customer-detail__empty--inline">${getGroupEmptyCopy(fallbackGroupId)}</div>`;

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
          ${filtersMarkup}
          ${filterNote}
          ${badgeGroupsMarkup}
        </section>
      `;
    }

    function attachCustomerBadgesEvents(container, state) {
      if (!container) return;
      const back = container.querySelector("[data-action='back-to-hub']");
      if (back) {
        back.addEventListener("click", () => {
          setRole("customer", "customer");
        });
      }
      container.addEventListener("click", event => {
        const filterButton = event.target.closest("[data-progress-filter]");
        if (!filterButton) return;
        if (filterButton.hasAttribute("disabled")) return;
        if (!state || !state.meta) return;
        const rawValue = (filterButton.getAttribute("data-progress-filter") || "").trim().toLowerCase();
        const isAllFilter = filterButton.hasAttribute("data-progress-filter-all");
        const normalized = rawValue === "unlocked" || rawValue === "locked" ? rawValue : null;
        const current = getProgressFilter(state);
        const nextValue = isAllFilter ? null : current === normalized ? null : normalized;
        if (current === nextValue) return;
        state.meta.customerBadgeAvailabilityFilter = nextValue;
        WeldState.saveState(state);
        renderApp();
      });
    }

    function templateBadges(appState) {
      const state = getState(appState);
      return renderCustomerBadgesView(state);
    }

    function renderBadges(container, appState) {
      if (!container) return;
      const state = getState(appState);
      container.innerHTML = renderCustomerBadgesView(state);
      attachCustomerBadgesEvents(container, state);
    }

    function attachBadges(container) {
      if (!container) return;
      const state = getState();
      attachCustomerBadgesEvents(container, state);
    }

    return {
      template: templateBadges,
      render: renderBadges,
      attach: attachBadges
    };
  });
})();
