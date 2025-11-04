(function () {
  if (!window.Weld) return;

  const features = window.Weld.features || (window.Weld.features = {});
  const badgeTones = (window.AppData && window.AppData.BADGE_TONES) || {};
  const badgeIconBackdrops = (window.AppData && window.AppData.BADGE_ICON_BACKDROPS) || {};
  const badgeCategoryOrder = (window.AppData && window.AppData.BADGE_CATEGORY_ORDER) || [];

  features.badges = {
    render(container, appState) {
      if (!container) return;
      const stateRef = appState || window.state || {};
      container.innerHTML = renderClientBadges(stateRef);
      attachBadgeEvents(container, stateRef);
    },
  };

  function renderClientBadges(stateRef) {
    const badges = getBadges().slice();
    const difficultyOrder = ["Starter", "Rising", "Skilled", "Expert", "Legendary"];
    badges.sort((a, b) => {
      const indexA = difficultyOrder.indexOf(typeof a.difficulty === "string" ? a.difficulty : "Skilled");
      const indexB = difficultyOrder.indexOf(typeof b.difficulty === "string" ? b.difficulty : "Skilled");
      const diffRankA = indexA === -1 ? difficultyOrder.length : indexA;
      const diffRankB = indexB === -1 ? difficultyOrder.length : indexB;
      if (diffRankA !== diffRankB) return diffRankA - diffRankB;
      const categoryA = typeof a.category === "string" ? a.category : "";
      const categoryB = typeof b.category === "string" ? b.category : "";
      if (categoryA !== categoryB) return categoryA.localeCompare(categoryB, undefined, { sensitivity: "base" });
      const pointsA = Number(a.points) || 0;
      const pointsB = Number(b.points) || 0;
      if (pointsA !== pointsB) return pointsB - pointsA;
      const titleA = typeof a.title === "string" ? a.title : "";
      const titleB = typeof b.title === "string" ? b.title : "";
      return titleA.localeCompare(titleB, undefined, { sensitivity: "base" });
    });

    const publishedBadges = badges.filter(badge => badge.published);
    const draftBadges = badges.filter(badge => !badge.published);
    const categoryMap = new Map();
    badges.forEach(badge => {
      const rawCategory = typeof badge.category === "string" ? badge.category.trim() : "";
      if (!rawCategory) return;
      const normalized = rawCategory.toLowerCase();
      if (!categoryMap.has(normalized)) {
        categoryMap.set(normalized, rawCategory);
      }
    });

    const categories = Array.from(categoryMap.entries())
      .sort((a, b) => a[1].localeCompare(b[1], undefined, { sensitivity: "base" }))
      .map(([value, label]) => ({ value, label }));

    const activeFilter =
      typeof stateRef.meta?.badgeFilter === "string" && stateRef.meta.badgeFilter.length > 0
        ? stateRef.meta.badgeFilter
        : null;
    const statusFilter =
      typeof stateRef.meta?.badgeStatusFilter === "string" && stateRef.meta.badgeStatusFilter.length > 0
        ? stateRef.meta.badgeStatusFilter
        : null;

    const categoryFilteredBadges = activeFilter
      ? badges.filter(badge => {
          const category = typeof badge.category === "string" ? badge.category.trim().toLowerCase() : "";
          return category === activeFilter;
        })
      : badges;

    const filteredBadges =
      statusFilter === "published"
        ? categoryFilteredBadges.filter(badge => badge.published)
        : statusFilter === "unpublished"
        ? categoryFilteredBadges.filter(badge => !badge.published)
        : categoryFilteredBadges;

    const selectedCategoryLabel =
      activeFilter && categoryMap.has(activeFilter) ? formatCatalogueLabel(categoryMap.get(activeFilter)) : null;

    const summaryParts = [];
    if (activeFilter || statusFilter) {
      summaryParts.push(`${formatNumber(filteredBadges.length)} of ${formatNumber(badges.length)} badges shown`);
    }
    if (statusFilter === "published") {
      summaryParts.push("Published only");
    } else if (statusFilter === "unpublished") {
      summaryParts.push("Unpublished only");
    }
    if (selectedCategoryLabel) {
      summaryParts.push(`Category: ${selectedCategoryLabel}`);
    }

    const summaryMarkup = summaryParts.length
      ? `<p class="detail-table__meta">${WeldUtil.escapeHtml(summaryParts.join(" | "))}</p>`
      : "";

    const filterButtons = categories
      .map(category => {
        const isActive = activeFilter === category.value;
        const value = WeldUtil.escapeHtml(category.value);
        const label = formatCatalogueLabel(category.label);
        return `
        <button
          type="button"
          class="badge-filter__item${isActive ? " badge-filter__item--active" : ""}"
          data-badge-filter="${value}"
          aria-pressed="${isActive ? "true" : "false"}">
          ${WeldUtil.escapeHtml(label)}
        </button>
      `;
      })
      .join("");

    const statusFilterMarkup = `
      <div class="badge-filter client-catalogue__status" role="toolbar" aria-label="Badge publication status">
        <button
          type="button"
          class="badge-filter__item${statusFilter ? "" : " badge-filter__item--active"}"
          data-badge-status=""
          aria-pressed="${statusFilter ? "false" : "true"}">
          All statuses
        </button>
        <button
          type="button"
          class="badge-filter__item${statusFilter === "published" ? " badge-filter__item--active" : ""}"
          data-badge-status="published"
          aria-pressed="${statusFilter === "published" ? "true" : "false"}">
          Published
        </button>
        <button
          type="button"
          class="badge-filter__item${statusFilter === "unpublished" ? " badge-filter__item--active" : ""}"
          data-badge-status="unpublished"
          aria-pressed="${statusFilter === "unpublished" ? "true" : "false"}">
          Unpublished
        </button>
      </div>
      `;

    const filterMarkup = categories.length
      ? `
      <div class="badge-filter client-badges__filters" role="toolbar" aria-label="Badge categories">
        <button
          type="button"
          class="badge-filter__item${activeFilter ? "" : " badge-filter__item--active"}"
          data-badge-filter=""
          aria-pressed="${activeFilter ? "false" : "true"}">
          All badges
        </button>
        ${filterButtons}
      </div>
    `
      : "";

    const renderBadgeCard = (badge, index) => {
      const rawId = String(badge.id ?? WeldUtil.generateId("badge"));
      const sanitizedId = rawId.replace(/[^a-zA-Z0-9:_-]/g, "-");
      const id = WeldUtil.escapeHtml(rawId);
      const cardId = WeldUtil.escapeHtml(`badge-card-${index}-${sanitizedId || "detail"}`);
      const action = badge.published ? "unpublish" : "publish";
      const actionLabel = badge.published ? "Unpublish" : "Publish";
      const actionTone = badge.published ? "button-pill--danger-light" : "button-pill--primary";
      const toneKey = badgeTones[badge.tone] ? badge.tone : "violet";
      const tone = badgeTones[toneKey] || badgeTones.violet;
      const iconBackdrop =
        badgeIconBackdrops[toneKey]?.background || badgeIconBackdrops.violet?.background || "linear-gradient(135deg, #c7d2fe, #818cf8)";
      const iconShadow =
        badgeIconBackdrops[toneKey]?.shadow || badgeIconBackdrops.violet?.shadow || "rgba(79, 70, 229, 0.32)";
      const difficultyLabel =
        typeof badge.difficulty === "string" && badge.difficulty.trim().length > 0 ? badge.difficulty.trim() : "Skilled";
      const rawCategory =
        typeof badge.category === "string" && badge.category.trim().length > 0 ? badge.category.trim() : "Badge";
      const categoryLabel = formatCatalogueLabel(rawCategory);
      const pointsValue = Number(badge.points) || 0;
      const ariaLabel = `${badge.title} badge, ${difficultyLabel} difficulty, worth ${formatNumber(pointsValue)} points.`;
      const tags = [];
      if (rawCategory && rawCategory.toLowerCase() !== "badge") {
        tags.push(
          `<span class="catalogue-card__tag catalogue-badge-card__tag">${WeldUtil.escapeHtml(categoryLabel)}</span>`
        );
      }
      if (difficultyLabel) {
        tags.push(
          `<span class="catalogue-card__tag catalogue-badge-card__tag">${WeldUtil.escapeHtml(difficultyLabel)}</span>`
        );
      }
      const tagsMarkup = tags.length
        ? `<div class="catalogue-badge-card__tags catalogue-card__tags">${tags.join("")}</div>`
        : "";
      const bonusMarkup =
        badge.bonus && badge.bonusDetail
          ? `<p class="catalogue-badge-card__bonus"><strong>${WeldUtil.escapeHtml(badge.bonus)}</strong> ${WeldUtil.escapeHtml(
              badge.bonusDetail
            )}</p>`
          : "";
      const toggleTitleParts = [];
      if (difficultyLabel) toggleTitleParts.push(difficultyLabel);
      if (rawCategory && rawCategory.toLowerCase() !== "badge") toggleTitleParts.push(categoryLabel);
      if (badge.points) toggleTitleParts.push(`${formatNumber(pointsValue)} pts`);
      const toggleTitle = toggleTitleParts.join(" • ");

      return `
      <article
        class="catalogue-badge ${badge.published ? "catalogue-badge--published" : "catalogue-badge--draft"}"
        data-badge="${id}"
        style="--badge-tone:${WeldUtil.escapeHtml(tone)};--badge-icon-tone:${WeldUtil.escapeHtml(iconBackdrop)};--badge-icon-shadow:${WeldUtil.escapeHtml(
          iconShadow
        )};">
        <header class="catalogue-badge__header">
          ${tagsMarkup}
        </header>
        <div class="catalogue-badge__body">
          <div class="catalogue-badge__figure">
            <span class="catalogue-badge__icon" style="background:${iconBackdrop}; box-shadow:0 22px 44px ${iconShadow};">
              ${WeldUtil.renderIcon(badge.icon || "medal", "sm")}
            </span>
          </div>
          <div class="catalogue-badge__copy">
            <h3>${WeldUtil.escapeHtml(badge.title || "Badge")}</h3>
            <p>${WeldUtil.escapeHtml(badge.description || "")}</p>
            ${bonusMarkup}
          </div>
        </div>
        <footer class="catalogue-badge__footer">
          <span class="catalogue-badge__points">
            <strong>${formatNumber(pointsValue)}</strong>
            <span>pts</span>
          </span>
          <button
            type="button"
            class="button-pill ${actionTone} badge-publish-toggle"
            data-badge="${id}"
            data-action="${action}"
            aria-label="${WeldUtil.escapeHtml(`${actionLabel} ${badge.title}`)}">
            ${actionLabel}
          </button>
        </footer>
      </article>
    `;
    };

    let badgeIndex = 0;
    const groupedBadges = groupBadgesByCategory(filteredBadges);
    const gridMarkup = filteredBadges.length
      ? `
      <div class="client-badges__groups">
        ${groupedBadges
          .map(group => {
            const count = group.badges.length;
            const countLabel = `${formatNumber(count)} badge${count === 1 ? "" : "s"}`;
            return `
              <section class="catalogue-badge-group" data-badge-category="${WeldUtil.escapeHtml(group.key)}">
                <header class="catalogue-badge-group__header">
                  <h3>${WeldUtil.escapeHtml(group.label)}</h3>
                  <span class="detail-table__meta">${WeldUtil.escapeHtml(countLabel)}</span>
                </header>
                <div class="catalogue-badge-grid catalogue-badge-group__grid client-badges__grid">
                  ${group.badges
                    .map(badge => {
                      const markup = renderBadgeCard(badge, badgeIndex);
                      badgeIndex += 1;
                      return markup;
                    })
                    .join("")}
                </div>
              </section>
            `;
          })
          .join("")}
      </div>
    `
      : `<div class="badge-empty"><p>${
          activeFilter ? "No badges match the selected filter." : "No badges are configured yet."
        }</p></div>`;

    const metricsConfig = [
      {
        label: "Total badges",
        value: formatNumber(badges.length),
        caption: "Across all tiers",
      },
      {
        label: "Published badges",
        value: formatNumber(publishedBadges.length),
        caption: "Visible in experiences",
      },
      {
        label: "Draft badges",
        value: formatNumber(draftBadges.length),
        caption: "Awaiting publication",
      },
      {
        label: "Catalogue categories",
        value: formatNumber(categories.length),
        caption: "Storytelling themes",
      },
    ];

    const metricsMarkup = metricsConfig
      .map(
        metric => `
        <article class="client-badges__metric">
          <h3>${WeldUtil.escapeHtml(metric.label)}</h3>
          <strong>${WeldUtil.escapeHtml(String(metric.value))}</strong>
          <span>${WeldUtil.escapeHtml(metric.caption)}</span>
        </article>
      `
      )
      .join("");

    return `
    <section class="client-catalogue__intro">
      <span class="client-catalogue__eyebrow">Badge catalogue</span>
      <h1>Celebrate progress with curated badges.</h1>
      <p>Curate the badge tiers you want squads to chase. Publish just the stories you need and bring the sparkle into every hub and add-in moment.</p>
    </section>
    <section class="client-badges__metrics">
      ${metricsMarkup}
    </section>
    <div class="client-badges__actions">
      <div class="client-catalogue__actions-row">
        <div class="client-badges__bulk">
          <button
            type="button"
            class="button-pill button-pill--primary"
            data-bulk-badge-action="publish">
            Publish all badges
          </button>
          <button
            type="button"
            class="button-pill button-pill--danger-light"
            data-bulk-badge-action="unpublish">
            Unpublish all badges
          </button>
        </div>
        ${statusFilterMarkup}
      </div>
      ${filterMarkup}
      ${summaryMarkup}
    </div>
    <section class="catalogue-badge-grid client-badges__grid">
      ${gridMarkup}
    </section>
  `;
  }

  function groupBadgesByCategory(badges) {
    const order = Array.isArray(badgeCategoryOrder) ? badgeCategoryOrder : [];
    const groups = new Map();
    badges.forEach(badge => {
      const rawCategory = typeof badge.category === "string" ? badge.category.trim() : "";
      const key = rawCategory ? rawCategory.toLowerCase() : "uncategorised";
      if (!groups.has(key)) {
        groups.set(key, {
          key,
          label: rawCategory || "Uncategorised",
          badges: [],
          rank: order.indexOf(key),
        });
      }
      groups.get(key).badges.push(badge);
    });

    return Array.from(groups.values()).sort((a, b) => {
      const rankA = a.rank === -1 ? Number.MAX_SAFE_INTEGER : a.rank;
      const rankB = b.rank === -1 ? Number.MAX_SAFE_INTEGER : b.rank;
      if (rankA !== rankB) return rankA - rankB;
      return a.label.localeCompare(b.label, undefined, { sensitivity: "base" });
    });
  }

  function attachBadgeEvents(container, stateRef) {
    if (!container) return;

    container.addEventListener("click", event => {
      const statusButton = event.target.closest("[data-badge-status]");
      if (statusButton) {
        const rawValue = (statusButton.getAttribute("data-badge-status") || "").trim().toLowerCase();
        const nextStatus = rawValue === "published" || rawValue === "unpublished" ? rawValue : null;
        if (stateRef.meta.badgeStatusFilter !== nextStatus) {
          stateRef.meta.badgeStatusFilter = nextStatus;
          WeldState.saveState(stateRef);
          renderApp();
        }
        return;
      }

      const filterButton = event.target.closest("[data-badge-filter]");
      if (filterButton) {
        const value = (filterButton.getAttribute("data-badge-filter") || "").trim().toLowerCase();
        const nextFilter = value.length > 0 ? value : null;
        if (stateRef.meta.badgeFilter !== nextFilter) {
          stateRef.meta.badgeFilter = nextFilter;
          WeldState.saveState(stateRef);
          renderApp();
        }
        return;
      }

      const bulkButton = event.target.closest("[data-bulk-badge-action]");
      if (bulkButton) {
        const action = bulkButton.getAttribute("data-bulk-badge-action");
        if (action === "publish") {
          setAllBadgesPublication(true);
        } else if (action === "unpublish") {
          setAllBadgesPublication(false);
        }
        return;
      }

      const toggle = event.target.closest(".badge-publish-toggle");
      if (!toggle) return;
      const badgeId = toggle.getAttribute("data-badge");
      const action = toggle.getAttribute("data-action");
      if (!badgeId || !action) return;
      setBadgePublication(badgeId, action === "publish");
    });
  }
})();

