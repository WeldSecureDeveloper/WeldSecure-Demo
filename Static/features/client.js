(function () {
  if (!window.Weld) return;

  const features = window.Weld.features || (window.Weld.features = {});
  const clientFeature = features.client || (features.client = {});
  const WeldUtil = window.WeldUtil || {};
  const AppData = window.AppData || {};
  const CONFIG_ICON =
    typeof WeldUtil.renderConfigIcon === "function" ? WeldUtil.renderConfigIcon() : "";

  const formatNumberSafe =
    typeof WeldUtil.formatNumberSafe === "function"
      ? WeldUtil.formatNumberSafe
      : value => (Number.isFinite(Number(value)) ? Number(value) : 0);

  const formatCatalogueLabelSafe =
    typeof WeldUtil.formatCatalogueLabel === "function"
      ? WeldUtil.formatCatalogueLabel
      : label => (label ? String(label) : "Reward");

  const rewardRemainingLabelSafe =
    typeof WeldUtil.rewardRemainingLabel === "function"
      ? WeldUtil.rewardRemainingLabel
      : reward => (reward?.unlimited ? "&infin;" : Number(reward?.remaining) || 0);

  const getState =
    typeof WeldUtil.getState === "function"
      ? WeldUtil.getState
      : appState => (appState && typeof appState === "object" ? appState : {});

  function renderClientRewardsView(stateOverride) {
    const state = getState(stateOverride);

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
      typeof state.meta?.rewardFilter === "string" && state.meta.rewardFilter.length > 0
        ? state.meta.rewardFilter
        : null;
    const statusFilter =
      typeof state.meta?.rewardStatusFilter === "string" && state.meta.rewardStatusFilter.length > 0
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
        value: formatNumberSafe(rewards.length),
        caption: "Configured experiences"
      },
      {
        label: "Published rewards",
        value: formatNumberSafe(publishedRewards.length),
        caption: "Visible to reporters"
      },
      {
        label: "Draft rewards",
        value: formatNumberSafe(draftRewards.length),
        caption: "Ready for the next launch"
      },
      {
        label: "Average cost",
        value: rewards.length ? `${formatNumberSafe(averageCost)} pts` : "--",
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
            const remainingLabel = rewardRemainingLabelSafe(reward);
            const remainingCopy =
              reward?.unlimited === true
                ? "Unlimited redemptions"
                : `${remainingLabel} remaining`;
            const pointsCost = Number(reward.pointsCost) || 0;
            const categoryLabel = formatCatalogueLabelSafe(reward.category || "Reward");
            const providerLabel = reward.provider ? reward.provider : "WeldSecure";
            const rewardLabel = reward.name ? WeldUtil.escapeHtml(reward.name) : "Reward";
            const configButton = `<button type="button" class="reward-card__config" data-reward="${id}" title="Configure ${rewardLabel}" aria-label="Configure ${rewardLabel}"><span class="reward-card__config-cog" aria-hidden="true">${CONFIG_ICON}</span></button>`;
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
              <h4 class="reward-card__title">${rewardLabel}</h4>
              <p class="reward-card__desc">${WeldUtil.escapeHtml(reward.description || "")}</p>
              <div class="reward-card__footer">
                <span>${remainingCopy}</span>
              </div>
              <div class="reward-card__actions">
                <span class="catalogue-card__tag reward-card__chip reward-card__chip--points">
                  <strong class="reward-card__points-value">${WeldUtil.escapeHtml(
                    String(formatNumberSafe(pointsCost))
                  )}</strong>
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
        ? `${formatNumberSafe(totalInventory)} total items remaining`
        : rewards.length
        ? "Inventory updates live as redemptions happen"
        : "Add rewards to build your catalogue narrative.";

    const selectedCategoryLabel =
      activeFilter && categoryMap.has(activeFilter)
        ? formatCatalogueLabelSafe(categoryMap.get(activeFilter))
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
        ? `${formatNumberSafe(filteredRewards.length)} of ${formatNumberSafe(rewards.length)} rewards shown`
        : "";

    const actionsMeta =
      [resultsSummary, filterSummaryText, baseInventoryCopy].filter(Boolean).join(" | ") || baseInventoryCopy;

    const filterButtons = rewardCategories
      .map(category => {
        const value = WeldUtil.escapeHtml(category.value);
        const isActive = activeFilter === category.value;
        const label = formatCatalogueLabelSafe(category.label);
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

  function attachClientRewardsEvents(container, stateOverride) {
    if (!container) return;
    const state = getState(stateOverride);
    state.meta = state.meta || {};

    container.addEventListener("click", event => {
      const statusButton = event.target.closest("[data-reward-status]");
      if (statusButton) {
        const rawValue = (statusButton.getAttribute("data-reward-status") || "").trim().toLowerCase();
        const nextStatus = rawValue === "published" || rawValue === "unpublished" ? rawValue : null;
        if (state.meta.rewardStatusFilter !== nextStatus) {
          state.meta.rewardStatusFilter = nextStatus;
          if (typeof window.persist === "function") {
            window.persist();
          }
          if (typeof window.renderApp === "function") {
            window.renderApp();
          }
        }
        return;
      }

      const filterButton = event.target.closest("[data-reward-filter]");
      if (filterButton) {
        const value = (filterButton.getAttribute("data-reward-filter") || "").trim().toLowerCase();
        const nextFilter = value.length > 0 ? value : null;
        if (state.meta.rewardFilter !== nextFilter) {
          state.meta.rewardFilter = nextFilter;
          if (typeof window.persist === "function") {
            window.persist();
          }
          if (typeof window.renderApp === "function") {
            window.renderApp();
          }
        }
        return;
      }

      const bulkButton = event.target.closest("[data-bulk-reward-action]");
      if (bulkButton) {
        const action = bulkButton.getAttribute("data-bulk-reward-action");
        if (action === "publish") {
          if (typeof window.setAllRewardsPublication === "function") {
            window.setAllRewardsPublication(true);
          }
        } else if (action === "unpublish") {
          if (typeof window.setAllRewardsPublication === "function") {
            window.setAllRewardsPublication(false);
          }
        }
        return;
      }

      const configButton = event.target.closest(".reward-card__config");
      if (configButton) {
        event.preventDefault();
        const idAttr = configButton.getAttribute("data-reward");
        if (!idAttr || typeof window.openRewardConfig !== "function") return;
        const numericId = Number(idAttr);
        window.openRewardConfig(Number.isFinite(numericId) ? numericId : idAttr);
        return;
      }

      const toggleButton = event.target.closest(".reward-publish-toggle");
      if (!toggleButton) return;
      const rewardId = Number(toggleButton.getAttribute("data-reward"));
      if (!Number.isFinite(rewardId)) return;
      const action = toggleButton.getAttribute("data-action");
      if (!action || typeof window.setRewardPublication !== "function") return;
      const nextPublished = action === "publish";
      window.setRewardPublication(rewardId, nextPublished);
    });
  }

  clientFeature.templateRewards = function templateRewards(appState) {
    return renderClientRewardsView(appState);
  };

  clientFeature.renderRewards = function renderRewards(container, appState) {
    if (!container) return;
    container.innerHTML = renderClientRewardsView(appState);
    attachClientRewardsEvents(container, appState);
  };

  clientFeature.attachRewards = function attachRewards(container, appState) {
    if (!container) return;
    attachClientRewardsEvents(container, appState);
  };
})();
