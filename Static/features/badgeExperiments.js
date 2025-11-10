(function () {
  if (!window.Weld) return;

  const features = window.Weld.features || (window.Weld.features = {});
  const AppData = window.AppData || {};
  const { WeldUtil } = window;
  const difficultyOrder = ["Starter", "Rising", "Skilled", "Expert", "Legendary"];
  const iconBasePath = "svg/Laura_Reen";
  const lauraReenIcons = ["activity", "award", "cup", "finish", "mountain", "ok", "podium", "smartwatch", "torch", "watch"];
  const PROGRESSION_TIERS = [
    { id: "aware", label: "Aware", reference: "Emerald", gradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)", shadow: "0 18px 32px rgba(17, 153, 142, 0.32)" },
    { id: "observant", label: "Observant", reference: "Sapphire", gradient: "linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)", shadow: "0 18px 32px rgba(33, 147, 176, 0.32)" },
    { id: "careful", label: "Careful", reference: "Amethyst", gradient: "linear-gradient(135deg, #9d50bb 0%, #6e48aa 100%)", shadow: "0 18px 32px rgba(110, 72, 170, 0.32)" },
    { id: "measured", label: "Measured", reference: "Ruby", gradient: "linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)", shadow: "0 18px 32px rgba(255, 75, 43, 0.32)" },
    { id: "vigilant", label: "Vigilant", reference: "Obsidian", gradient: "linear-gradient(135deg, #434343 0%, #000000 100%)", shadow: "0 18px 32px rgba(0, 0, 0, 0.45)" }
  ];
  const MAX_LAB_BADGES = 50;
  const labFilterState = { status: "all", category: null, tier: null };
  let labCategoryLookup = new Map();

  features.badgeExperiments = {
    render(container) {
      if (!container) return;
      renderLabPage(container);
    }
  };

  function renderLabPage(container) {
    const tieredBadges = getTieredBadges();
    const categories = getBadgeCategories(tieredBadges);
    const filteredBadges = applyLabFilters(tieredBadges);
    container.innerHTML = `
      <section class="badge-experiments">
        ${renderCatalogueHeader(tieredBadges, categories, filteredBadges)}
        ${renderGroupedGrid(filteredBadges)}
      </section>
    `;
    attachFilterHandlers(container);
  }

  function renderCatalogueHeader(allBadges, categories, filteredBadges) {
    const total = allBadges.length;
    const publishedCount = allBadges.filter(badge => badge.published !== false).length;
    const draftCount = total - publishedCount;
    const categoryCount = categories.length;
    const statusFilterMarkup = renderStatusFilter();
    const categoryFilterMarkup = renderCategoryFilter(categories);
    const tierFilterMarkup = renderProgressionKey();
    const summaryMarkup = renderSummary(total, filteredBadges.length);
    const metrics = [
      { label: "Total badges", value: formatNumber(total), caption: "Across all tiers" },
      { label: "Published badges", value: formatNumber(publishedCount), caption: "Visible in experiences" },
      { label: "Draft badges", value: formatNumber(draftCount), caption: "Awaiting publication" },
      { label: "Catalogue categories", value: formatNumber(categoryCount), caption: "Storytelling themes" }
    ]
      .map(
        metric => `
        <article class="client-badges__metric">
          <h3>${escapeHtml(metric.label)}</h3>
          <strong>${escapeHtml(metric.value)}</strong>
          <span>${escapeHtml(metric.caption)}</span>
        </article>
      `
      )
      .join("");

    return `
      <section class="client-catalogue__intro">
        <span class="client-catalogue__eyebrow">Badge catalogue</span>
        <h1>Experiment with cinematic badge animations.</h1>
        <p>Preview all 50 badge levels inside the new progression tiers, then publish or unpublish them without leaving the lab.</p>
      </section>
      <section class="client-badges__metrics">
        ${metrics}
      </section>
      <div class="client-badges__actions">
        <div class="client-catalogue__actions-row">
          <div class="client-badges__bulk">
            <button
              type="button"
              class="button-pill button-pill--primary"
              data-lab-bulk="publish">
              Publish all badges
            </button>
            <button
              type="button"
              class="button-pill button-pill--danger-light"
              data-lab-bulk="unpublish">
              Unpublish all badges
            </button>
          </div>
          ${statusFilterMarkup}
        </div>
        ${categoryFilterMarkup}
        ${summaryMarkup}
        ${tierFilterMarkup}
      </div>
    `;
  }

  function renderProgressionKey() {
    return `
      <section class="badge-experiments__key" aria-label="Progression tiers">
        ${PROGRESSION_TIERS.map(
          tier => {
            const isActive = labFilterState.tier === tier.id;
            return `
              <button
                type="button"
                class="progression-key__item${isActive ? " progression-key__item--active" : ""}"
                data-lab-tier="${tier.id}"
                aria-pressed="${isActive}">
                <span class="progression-key__swatch" style="background:${tier.gradient}; box-shadow:${tier.shadow};" aria-hidden="true"></span>
                <div class="progression-key__text">
                  <strong>${tier.label}</strong>
                  <span>${tier.reference}</span>
                </div>
              </button>
            `;
          }
        ).join("")}
      </section>
    `;
  }

  function renderStatusFilter() {
    const options = [
      { id: "all", label: "All statuses" },
      { id: "published", label: "Published" },
      { id: "unpublished", label: "Unpublished" }
    ];
    return `
      <div class="badge-filter client-catalogue__status" role="toolbar" aria-label="Badge publication status">
        ${options
          .map(option => {
            const isActive = labFilterState.status === option.id;
            return `
              <button
                type="button"
                class="badge-filter__item${isActive ? " badge-filter__item--active" : ""}"
                data-lab-status="${option.id}"
                aria-pressed="${isActive}">
                ${option.label}
              </button>
            `;
          })
          .join("")}
      </div>
    `;
  }

  function renderCategoryFilter(categories) {
    if (!categories.length) return "";
    const buttons = categories
      .map(category => {
        const isActive = labFilterState.category === category.value;
        return `
          <button
            type="button"
            class="badge-filter__item${isActive ? " badge-filter__item--active" : ""}"
            data-lab-category="${category.value}"
            aria-pressed="${isActive}">
            ${escapeHtml(category.label)} (${formatNumber(category.count)})
          </button>
        `;
      })
      .join("");

    const allActive = !labFilterState.category;

    return `
      <div class="badge-filter client-badges__filters" role="toolbar" aria-label="Badge categories">
        <button
          type="button"
          class="badge-filter__item${allActive ? " badge-filter__item--active" : ""}"
          data-lab-category=""
          aria-pressed="${allActive}">
          All badges
        </button>
        ${buttons}
      </div>
    `;
  }

  function renderSummary(total, filtered) {
    if (total === filtered && !labFilterState.category && labFilterState.status === "all") return "";
    const summaryParts = [];
    if (filtered !== total || labFilterState.category || labFilterState.status !== "all") {
      summaryParts.push(`${formatNumber(filtered)} of ${formatNumber(total)} badges shown`);
    }
    if (labFilterState.status === "published") summaryParts.push("Published only");
    if (labFilterState.status === "unpublished") summaryParts.push("Unpublished only");
    if (labFilterState.category) {
      summaryParts.push(`Category: ${getCategoryLabel(labFilterState.category)}`);
    }
    if (labFilterState.tier) {
      summaryParts.push(`Tier: ${getTierLabel(labFilterState.tier)}`);
    }
    return summaryParts.length
      ? `<p class="detail-table__meta">${summaryParts.map(escapeHtml).join(" | ")}</p>`
      : "";
  }

  function renderGroupedGrid(badges) {
    const groups = groupBadgesByCategory(badges);
    if (!groups.length) {
      return `
        <div class="badge-experiments__fallback">
          <p>No badges match the selected filters. Try adjusting the status or category.</p>
        </div>
      `;
    }

    return `
      <div class="badge-experiments__groups">
        ${groups
          .map(group => {
            const countLabel = `${formatNumber(group.badges.length)} badge${group.badges.length === 1 ? "" : "s"}`;
            return `
              <section class="catalogue-badge-group" data-badge-category="${escapeHtml(group.key)}">
                <header class="catalogue-badge-group__header">
                  <h3>${escapeHtml(group.label)}</h3>
                  <span class="detail-table__meta">${countLabel}</span>
                </header>
                <div class="catalogue-badge-grid badge-experiments__grid-group">
                  ${group.badges.map(entry => renderTierCard(entry.badge, entry.index)).join("")}
                </div>
              </section>
            `;
          })
          .join("")}
      </div>
    `;
  }

  function renderTierCard(badge, index) {
    const safeTitle = escapeHtml(badge.title || "Badge");
    const safeSummary = escapeHtml(badge.description || "");
    const safeCategory = escapeHtml(badge.category || "");
    const rawId = String(badge.id || WeldUtil.generateId("badge"));
    const sanitizedId = rawId.replace(/[^a-zA-Z0-9:_-]/g, "-");
    const safeId = escapeHtml(rawId);
    const cardId = escapeHtml(`badge-lab-card-${index}-${sanitizedId || "detail"}`);
    const tierMeta = badge.tierMeta || PROGRESSION_TIERS[0];
    const styles = getTierStyles(tierMeta);
    const ariaLabel = `${tierMeta.label} tier badge ${badge.title || ""}`.trim();
    const tagsMarkup = renderBadgeTags(safeCategory);
    const arcId = `badge-lab-arc-${index}-${sanitizedId}`;
    const isPublished = badge.published !== false;
    const badgeStateClass = isPublished ? "catalogue-badge--published" : "catalogue-badge--draft";
    const cardStateClass = isPublished ? "catalogue-badge-card--published" : "catalogue-badge-card--draft";

    return `
      <article class="catalogue-badge badge-lab-badge ${badgeStateClass}" data-badge="${safeId}">
        <button
          type="button"
          class="catalogue-badge__trigger"
          aria-haspopup="true"
          aria-controls="${cardId}"
          aria-label="${escapeHtml(ariaLabel)}">
          <span class="catalogue-badge__icon badge-lab-badge__icon" style="background:${styles.background}; box-shadow:${styles.shadow};">
            ${renderBadgeShine()}
            ${renderBadgeRing()}
            ${renderBadgeParticles()}
            ${renderBadgeArc(tierMeta.label, arcId)}
            ${renderBadgeIconImage(badge)}
          </span>
        </button>
        <span class="catalogue-badge__label">${safeTitle}</span>
        ${renderDetailCard({
          cardId,
          tagsMarkup,
          safeSummary,
          safeTitle,
          ariaLabel,
          points: badge.points,
          published: isPublished,
          cardStateClass
        })}
      </article>
    `;
  }

  function renderDetailCard({ cardId, tagsMarkup, safeSummary, safeTitle, ariaLabel, points, published, cardStateClass }) {
    const pointsValue = Number(points) || 0;
    const pointsMarkup =
      pointsValue > 0
        ? `<span class="catalogue-badge-card__points">
            <span class="catalogue-badge-card__points-value">+${formatNumber(pointsValue)}</span>
            <span class="catalogue-badge-card__points-unit">pts</span>
          </span>`
        : "";
    const descriptionMarkup = safeSummary
      ? `<p class="catalogue-badge-card__description">${safeSummary}</p>`
      : `<p class="catalogue-badge-card__description catalogue-badge-card__description--empty">No description available yet.</p>`;

    return `
      <div id="${cardId}" class="catalogue-badge-card badge-lab-card catalogue-badge-card--hub ${cardStateClass}" role="group" aria-label="${escapeHtml(
        ariaLabel
      )}">
        <span class="catalogue-badge-card__halo"></span>
        <span class="catalogue-badge-card__orb catalogue-badge-card__orb--one"></span>
        <span class="catalogue-badge-card__orb catalogue-badge-card__orb--two"></span>
        <div class="catalogue-badge-card__main">
          <h3 class="catalogue-badge-card__title">${safeTitle}</h3>
          ${tagsMarkup}
          ${descriptionMarkup}
        </div>
        <footer class="catalogue-badge-card__footer">
          ${pointsMarkup}
          <span class="catalogue-badge-card__status ${published ? "catalogue-badge-card__status--published" : "catalogue-badge-card__status--draft"}">
            ${published ? "Published" : "Unpublished"}
          </span>
        </footer>
      </div>
    `;
  }

  function renderBadgeArc(label, arcId) {
    const safeLabel = escapeHtml(label || "");
    return `
      <svg viewBox="0 0 120 120" class="badge-lab-badge__arc" aria-hidden="true">
        <defs>
          <path id="${arcId}" d="M20,55 A40,40 0 0,1 100,55" />
        </defs>
        <text>
          <textPath href="#${arcId}" startOffset="50%" text-anchor="middle">
            ${safeLabel}
          </textPath>
        </text>
      </svg>
    `;
  }
  function renderBadgeTags(categoryLabel) {
    if (!categoryLabel) return "";
    return `<div class="catalogue-badge-card__tags catalogue-card__tags"><span class="catalogue-card__tag catalogue-badge-card__tag">${escapeHtml(
      categoryLabel
    )}</span></div>`;
  }

  function renderBadgeIconImage(badge) {
    const iconSrc = typeof badge.labIcon === "string" ? badge.labIcon : "";
    const rawInitial =
      typeof badge.title === "string" && badge.title.trim().length > 0 ? badge.title.trim().charAt(0) : "B";
    const safeInitial = escapeHtml(rawInitial.toUpperCase());
    if (!iconSrc) {
      return `<span class="badge-lab-badge__fallback" aria-hidden="true">${safeInitial}</span>`;
    }
    const safeSrc = escapeHtml(iconSrc);
    return `<img class="badge-lab-badge__img" src="${safeSrc}" alt="" loading="lazy" decoding="async" />`;
  }

  function renderBadgeShine() {
    return `<span class="badge-lab-badge__shine" aria-hidden="true"></span>`;
  }

  function renderBadgeRing() {
    return `<span class="badge-lab-badge__ring" aria-hidden="true"></span>`;
  }

  function renderBadgeParticles(count = 10) {
    const particles = [];
    for (let i = 0; i < count; i++) {
      const size = (Math.random() * 3 + 3).toFixed(2);
      const left = (Math.random() * 100).toFixed(2);
      const top = (Math.random() * 100).toFixed(2);
      const delay = (Math.random() * 2).toFixed(2);
      particles.push(
        `<span class="badge-lab-badge__particle" style="width:${size}px;height:${size}px;left:${left}%;top:${top}%;animation-delay:${delay}s;" aria-hidden="true"></span>`
      );
    }
    return `<span class="badge-lab-badge__particles" aria-hidden="true">${particles.join("")}</span>`;
  }

  function getTierStyles(tierMeta) {
    if (!tierMeta) {
      return {
        background: "linear-gradient(135deg, #c7d2fe, #818cf8)",
        shadow: "0 12px 24px rgba(79, 70, 229, 0.32)"
      };
    }
    return {
      background: tierMeta.gradient,
      shadow: tierMeta.shadow
    };
  }

  function getTieredBadges() {
    const publishedSource = Array.isArray(AppData.BADGES) ? AppData.BADGES : [];
    const draftSource = Array.isArray(AppData.BADGE_DRAFTS) ? AppData.BADGE_DRAFTS : [];
    const combined = [...publishedSource, ...draftSource];
    const visibleBadges = combined.filter(badge => {
      if (!badge || typeof badge !== "object") return false;
      if (typeof badge.published === "boolean") {
        return badge.published;
      }
      return true;
    });

    if (!visibleBadges.length) {
      return [];
    }

    const trimmed = visibleBadges
      .sort((a, b) => {
        const rankDiff = getDifficultyRank(a?.difficulty) - getDifficultyRank(b?.difficulty);
        if (rankDiff !== 0) return rankDiff;
        const pointsDiff = (Number(b?.points) || 0) - (Number(a?.points) || 0);
        if (pointsDiff !== 0) return pointsDiff;
        const titleA = typeof a?.title === "string" ? a.title : "";
        const titleB = typeof b?.title === "string" ? b.title : "";
        return titleA.localeCompare(titleB, undefined, { sensitivity: "base" });
      })
      .slice(0, MAX_LAB_BADGES);

    return trimmed.map((badge, index) => ({
      ...badge,
      level: index + 1,
      labIcon: getLabIconForLevel(index),
      tierMeta: getTierMetaForIndex(index, trimmed.length)
    }));
  }

  function getBadgeCategories(badges) {
    const map = new Map();
    badges.forEach(badge => {
      const label = (typeof badge.category === "string" && badge.category.trim()) || "Uncategorised";
      const key = label.trim().toLowerCase() || "uncategorised";
      if (!map.has(key)) {
        map.set(key, { label, count: 0 });
      }
      map.get(key).count += 1;
    });
    labCategoryLookup = new Map(map);

    return Array.from(map.entries())
      .sort((a, b) => a[1].label.localeCompare(b[1].label, undefined, { sensitivity: "base" }))
      .map(([value, info]) => ({ value, label: info.label, count: info.count }));
  }

  function applyLabFilters(badges) {
    return badges.filter(badge => {
      if (labFilterState.status === "published" && badge.published === false) return false;
      if (labFilterState.status === "unpublished" && badge.published !== false) return false;
      if (labFilterState.category) {
        const categoryKey =
          (typeof badge.category === "string" && badge.category.trim().toLowerCase()) || "uncategorised";
        if (categoryKey !== labFilterState.category) return false;
      }
      if (labFilterState.tier && badge.tierMeta?.id !== labFilterState.tier) return false;
      return true;
    });
  }

  function groupBadgesByCategory(badges) {
    const groups = new Map();
    badges.forEach((badge, index) => {
      const label = (typeof badge.category === "string" && badge.category.trim()) || "Uncategorised";
      const key = label.trim().toLowerCase() || "uncategorised";
      if (!groups.has(key)) {
        groups.set(key, { key, label, badges: [] });
      }
      groups.get(key).badges.push({ badge, index });
    });

    return Array.from(groups.values()).sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
  }

  function getCategoryLabel(key) {
    if (!key) return "All badges";
    const entry = labCategoryLookup.get(key);
    if (entry && entry.label) return entry.label;
    return key.charAt(0).toUpperCase() + key.slice(1);
  }

  function getTierLabel(tierId) {
    const tier = PROGRESSION_TIERS.find(entry => entry.id === tierId);
    return tier ? tier.label : "All tiers";
  }

  function attachFilterHandlers(container) {
    if (container.__labFilterHandler) {
      container.removeEventListener("click", container.__labFilterHandler);
    }
    const handler = event => {
      const bulkButton = event.target.closest("[data-lab-bulk]");
      if (bulkButton && typeof window.setAllBadgesPublication === "function") {
        const action = bulkButton.getAttribute("data-lab-bulk");
        if (action === "publish") {
          window.setAllBadgesPublication(true);
        } else if (action === "unpublish") {
          window.setAllBadgesPublication(false);
        }
        renderLabPage(container);
        return;
      }
      const badgeTrigger = event.target.closest(".catalogue-badge__trigger");
      if (badgeTrigger && typeof window.setBadgePublication === "function") {
        const badgeElement = badgeTrigger.closest(".catalogue-badge");
        const badgeId = (badgeElement?.getAttribute("data-badge") || "").trim();
        if (!badgeId) return;
        event.preventDefault();
        const isPublished = badgeElement?.classList.contains("catalogue-badge--published");
        window.setBadgePublication(badgeId, !isPublished);
        renderLabPage(container);
        return;
      }
      const statusButton = event.target.closest("[data-lab-status]");
      if (statusButton) {
        const nextStatus = statusButton.getAttribute("data-lab-status") || "all";
        if (labFilterState.status !== nextStatus) {
          labFilterState.status = nextStatus;
          renderLabPage(container);
        }
        return;
      }
      const categoryButton = event.target.closest("[data-lab-category]");
      if (categoryButton) {
        const value = (categoryButton.getAttribute("data-lab-category") || "").trim().toLowerCase();
        const nextCategory = value.length ? value : null;
        if (labFilterState.category !== nextCategory) {
          labFilterState.category = nextCategory;
          renderLabPage(container);
        }
        return;
      }
      const tierButton = event.target.closest("[data-lab-tier]");
      if (tierButton) {
        const value = tierButton.getAttribute("data-lab-tier") || "";
        const tierId = value.length ? value : null;
        const nextTier = labFilterState.tier === tierId ? null : tierId;
        if (labFilterState.tier !== nextTier) {
          labFilterState.tier = nextTier;
          renderLabPage(container);
        }
        return;
      }
    };
    container.addEventListener("click", handler);
    container.__labFilterHandler = handler;
  }

  function getTierMetaForIndex(index, total) {
    if (!PROGRESSION_TIERS.length) return null;
    const groupSize = Math.ceil(total / PROGRESSION_TIERS.length) || 1;
    const tierIndex = Math.min(Math.floor(index / groupSize), PROGRESSION_TIERS.length - 1);
    return PROGRESSION_TIERS[tierIndex];
  }

  function getLabIconForLevel(levelIndex) {
    if (!lauraReenIcons.length) return "";
    const iconName = lauraReenIcons[levelIndex % lauraReenIcons.length];
    return `${iconBasePath}/${iconName}.svg`;
  }

  function getDifficultyRank(value) {
    if (typeof value !== "string") return difficultyOrder.length;
    const normalized = value.trim();
    const index = difficultyOrder.indexOf(normalized);
    return index === -1 ? difficultyOrder.length : index;
  }

  function formatNumber(value) {
    if (typeof window.formatNumber === "function") {
      return window.formatNumber(value);
    }
    const number = Number(value) || 0;
    return number.toLocaleString();
  }

  function escapeHtml(value) {
    if (!value) return "";
    if (WeldUtil?.escapeHtml) {
      return WeldUtil.escapeHtml(value);
    }
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();
