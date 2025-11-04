(function () {
  if (!window.Weld) return;
  const features = window.Weld.features || (window.Weld.features = {});
  const AppData = window.AppData || {};
  const CONFIG_ICON =
    (window.WeldUtil && typeof window.WeldUtil.renderIcon === "function" && window.WeldUtil.renderIcon("settings", "xs")) ||
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true" focusable="false">
      <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.427-1.756 3.002-1.756 3.429 0a1.724 1.724 0 002.586 1.066c1.544-.89 3.31.876 2.42 2.42a1.724 1.724 0 001.065 2.572c1.756.426 1.756 3.002 0 3.429a1.724 1.724 0 00-1.066 2.586c.89 1.544-.876 3.31-2.42 2.42a1.724 1.724 0 00-2.586 1.065c-.426 1.756-3.002 1.756-3.429 0a1.724 1.724 0 00-2.586-1.066c-1.544.89-3.31-.876-2.42-2.42a1.724 1.724 0 00-1.065-2.586c-1.756-.426-1.756-3.002 0-3.429a1.724 1.724 0 001.066-2.586c-.89-1.544.876-3.31 2.42-2.42a1.724 1.724 0 002.586-1.065z"/>
      <circle cx="12" cy="12" r="3" />
    </svg>`;

  features.hub = {
    render(container, appState) {
      if (!container) return;
      const state = appState || window.state || {};
      container.innerHTML = renderHub(state);
      attachHubEvents(container);
    },
  };

function renderHub(state) {
  const quests = Array.isArray(state.quests)
    ? state.quests.slice().sort(WeldUtil.compareQuestsByDifficulty)
    : [];
  const publishedQuests = quests.filter(quest => quest.published);
  const draftQuests = quests.filter(quest => !quest.published);
  const averagePoints = quests.length
    ? Math.round(quests.reduce((sum, quest) => sum + (Number(quest.points) || 0), 0) / quests.length)
    : 0;
  const averageDuration = quests.length
    ? Math.round(
        quests.reduce((sum, quest) => sum + (Number(quest.duration) || 0), 0) / quests.length
      )
    : 0;

  const categoryMap = new Map();
  quests.forEach(quest => {
    const rawCategory = typeof quest.category === "string" ? quest.category.trim() : "";
    if (!rawCategory) return;
    const normalized = rawCategory.toLowerCase();
    if (!categoryMap.has(normalized)) {
      categoryMap.set(normalized, rawCategory);
    }
  });

  const questCategories = Array.from(categoryMap.entries())
    .sort((a, b) => a[1].localeCompare(b[1], undefined, { sensitivity: "base" }))
    .map(([value, label]) => ({ value, label }));

  const activeFilter =
    typeof state.meta.questFilter === "string" && state.meta.questFilter.length > 0
      ? state.meta.questFilter
      : null;
  const statusFilter =
    typeof state.meta.questStatusFilter === "string" && state.meta.questStatusFilter.length > 0
      ? state.meta.questStatusFilter
      : null;

  const categoryFilteredQuests = activeFilter
    ? quests.filter(quest => {
        const category = typeof quest.category === "string" ? quest.category.trim().toLowerCase() : "";
        return category === activeFilter;
      })
    : quests;

  const filteredQuests =
    statusFilter === "published"
      ? categoryFilteredQuests.filter(quest => quest.published)
      : statusFilter === "unpublished"
      ? categoryFilteredQuests.filter(quest => !quest.published)
      : categoryFilteredQuests;

  const metricsConfig = [
    {
      label: "Total quests",
      value: formatNumber(quests.length),
      caption: "Across the catalogue"
    },
    {
      label: "Published quests",
      value: formatNumber(publishedQuests.length),
      caption: "Visible to reporters"
    },
    {
      label: "Draft quests",
      value: formatNumber(draftQuests.length),
      caption: "Queued for the next beat"
    },
    {
      label: "Average duration",
      value: quests.length ? `${formatNumber(averageDuration)} min` : "--",
      caption: "Per quest experience"
    }
  ];

  const metricsMarkup = metricsConfig
    .map(
      metric => `
        <article class="client-quests__metric">
          <h3>${WeldUtil.escapeHtml(metric.label)}</h3>
          <strong>${WeldUtil.escapeHtml(String(metric.value))}</strong>
          <span>${WeldUtil.escapeHtml(metric.caption)}</span>
        </article>
      `
    )
    .join("");

  const questsMarkup = filteredQuests.length
    ? filteredQuests
        .map(quest => {
          const id = WeldUtil.escapeHtml(String(quest.id));
          const isPublished = quest.published === true;
          const action = isPublished ? "unpublish" : "publish";
          const actionLabel = isPublished ? "Unpublish" : "Publish";
          const actionTone = isPublished ? "button-pill--danger-light" : "button-pill--primary";
          const difficultyChip = quest.difficulty
            ? `<span class="catalogue-card__tag quest-card__chip quest-card__chip--difficulty" data-difficulty="${WeldUtil.escapeHtml(
                quest.difficulty
              )}">${WeldUtil.escapeHtml(quest.difficulty)}</span>`
            : "";
          const difficultyRow = difficultyChip ? `<div class="quest-card__header-top">${difficultyChip}</div>` : "";
          const otherTags = [];
          if (quest.category) {
            otherTags.push(
              `<span class="catalogue-card__tag quest-card__chip">${WeldUtil.escapeHtml(
                formatCatalogueLabel(quest.category)
              )}</span>`
            );
          }
          const tagMarkup = otherTags.length
            ? `<div class="quest-card__chip-group catalogue-card__tags">${otherTags.join("")}</div>`
            : "";
          const focusMarkup = Array.isArray(quest.focus) && quest.focus.length
            ? `<div class="quest-card__focus">${quest.focus
                .slice(0, 3)
                .map(item => `<span>${WeldUtil.escapeHtml(item)}</span>`)
                .join("")}</div>`
            : "";
          const questLabel = quest.title ? WeldUtil.escapeHtml(quest.title) : "Quest";
          const configButton = `<button type="button" class="quest-card__config" data-quest="${id}" title="Configure ${questLabel}" aria-label="Configure ${questLabel}"><span class="quest-card__config-cog" aria-hidden="true">${CONFIG_ICON}</span></button>`;
          return `
            <article class="quest-card ${isPublished ? "quest-card--published" : "quest-card--draft"}" data-quest="${id}">
              ${configButton}
              <header class="quest-card__header">
                ${difficultyRow}
                ${tagMarkup}
              </header>
              <h3 class="quest-card__title">${WeldUtil.escapeHtml(quest.title || "Quest")}</h3>
              <p class="quest-card__description">${WeldUtil.escapeHtml(quest.description || "")}</p>
              <ul class="quest-card__details">
                <li><span>Format</span><strong>${WeldUtil.escapeHtml(quest.format || "Interactive")}</strong></li>
                <li><span>Duration</span><strong>${formatNumber(Number(quest.duration) || 0)} min</strong></li>
                <li><span>Questions</span><strong>${formatNumber(Number(quest.questions) || 0)}</strong></li>
              </ul>
              ${focusMarkup}
              ${
                quest.bonus
                  ? `<p class="detail-table__meta"><strong>${WeldUtil.escapeHtml(quest.bonus)}</strong> ${WeldUtil.escapeHtml(
                      quest.bonusDetail || ""
                    )}</p>`
                  : ""
              }
              <footer class="quest-card__footer">
                <span class="quest-card__points">
                  <strong class="quest-card__points-value">${formatNumber(Number(quest.points) || 0)}</strong>
                  <span class="quest-card__points-unit">pts</span>
                </span>
                <button
                  type="button"
                  class="button-pill ${actionTone} quest-publish-toggle"
                  data-action="${action}"
                  data-quest="${id}">
                  ${actionLabel}
                </button>
              </footer>
            </article>
          `;
        })
        .join("")
    : `<div class="customer-detail__empty">${
        quests.length
          ? "No quests match the selected filter."
          : "Build a quest to showcase how Weld coaches behaviour change."
      }</div>`;

  const catalogueMarkup = filteredQuests.length
    ? `<div class="quest-grid quest-grid--catalogue">${questsMarkup}</div>`
    : questsMarkup;

  const filterButtons = questCategories
    .map(category => {
      const value = WeldUtil.escapeHtml(category.value);
      const isActive = activeFilter === category.value;
      const label = formatCatalogueLabel(category.label);
      return `
        <button
          type="button"
          class="badge-filter__item${isActive ? " badge-filter__item--active" : ""}"
          data-quest-filter="${value}"
          aria-pressed="${isActive ? "true" : "false"}">
          ${WeldUtil.escapeHtml(label)}
        </button>
      `;
    })
    .join("");

  const statusFilterMarkup = `
        <div class="badge-filter client-catalogue__status" role="toolbar" aria-label="Quest publication status">
          <button
            type="button"
            class="badge-filter__item${statusFilter ? "" : " badge-filter__item--active"}"
            data-quest-status=""
            aria-pressed="${statusFilter ? "false" : "true"}">
            All statuses
          </button>
          <button
            type="button"
            class="badge-filter__item${statusFilter === "published" ? " badge-filter__item--active" : ""}"
            data-quest-status="published"
            aria-pressed="${statusFilter === "published" ? "true" : "false"}">
            Published
          </button>
          <button
            type="button"
            class="badge-filter__item${statusFilter === "unpublished" ? " badge-filter__item--active" : ""}"
            data-quest-status="unpublished"
            aria-pressed="${statusFilter === "unpublished" ? "true" : "false"}">
            Unpublished
          </button>
        </div>
      `;

  const filterMarkup =
    questCategories.length > 1
      ? `
        <div class="catalogue-filter badge-filter client-quests__filters" role="toolbar" aria-label="Quest categories">
          <button
            type="button"
            class="badge-filter__item${activeFilter ? "" : " badge-filter__item--active"}"
            data-quest-filter=""
            aria-pressed="${activeFilter ? "false" : "true"}">
            All quests
          </button>
          ${filterButtons}
        </div>
      `
      : "";

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
      ? `${formatNumber(filteredQuests.length)} of ${formatNumber(quests.length)} quests shown`
      : "";

  const actionsMeta = [resultsSummary, filterSummaryText].filter(Boolean).join(" | ");

  const summaryMarkup = actionsMeta
    ? `<p class="detail-table__meta">${WeldUtil.escapeHtml(actionsMeta)}</p>`
    : "";

  return `
    <section class="client-catalogue__intro">
      <span class="client-catalogue__eyebrow">Quest catalogue</span>
      <h1>Coach behaviour change with curated quests.</h1>
      <p>Demonstrate how Weld guides employees through inbox scenarios, verifies understanding, and rewards mastery.</p>
    </section>
    <section class="client-quests__metrics">
      ${metricsMarkup}
    </section>
    <div class="client-quests__actions">
      <div class="client-catalogue__actions-row">
        <div class="client-quests__bulk">
          <button type="button" class="button-pill button-pill--primary" data-bulk-quest-action="publish">Publish all quests</button>
          <button type="button" class="button-pill button-pill--danger-light" data-bulk-quest-action="unpublish">Unpublish all quests</button>
        </div>
        ${statusFilterMarkup}
      </div>
      ${filterMarkup}
      ${summaryMarkup}
    </div>
    ${catalogueMarkup}
  `;
}



function attachHubEvents(container) {
  if (!container) return;
  container.addEventListener("click", event => {
    const globalState = window.state;

    const statusButton = event.target.closest("[data-quest-status]");
    if (statusButton && globalState && globalState.meta) {
      const rawValue = (statusButton.getAttribute("data-quest-status") || "").trim().toLowerCase();
      const nextStatus = rawValue === "published" || rawValue === "unpublished" ? rawValue : null;
      if (globalState.meta.questStatusFilter !== nextStatus) {
        globalState.meta.questStatusFilter = nextStatus;
        WeldState.saveState(globalState);
        renderApp();
      }
      return;
    }

    const filterButton = event.target.closest("[data-quest-filter]");
    if (filterButton && globalState && globalState.meta) {
      const value = (filterButton.getAttribute("data-quest-filter") || "").trim().toLowerCase();
      const nextFilter = value.length > 0 ? value : null;
      if (globalState.meta.questFilter !== nextFilter) {
        globalState.meta.questFilter = nextFilter;
        WeldState.saveState(globalState);
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

})();
