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

    const { WeldUtil, formatNumber, getState } = shared;

    function renderCustomerBadgesView(state) {
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

    function attachCustomerBadgesEvents(container) {
      const back = container.querySelector("[data-action='back-to-hub']");
      if (back) {
        back.addEventListener("click", () => {
          setRole("customer", "customer");
        });
      }
    }

    function templateBadges(appState) {
      const state = getState(appState);
      return renderCustomerBadgesView(state);
    }

    function renderBadges(container, appState) {
      if (!container) return;
      const state = getState(appState);
      container.innerHTML = renderCustomerBadgesView(state);
      attachCustomerBadgesEvents(container);
    }

    function attachBadges(container) {
      if (!container) return;
      attachCustomerBadgesEvents(container);
    }

    return {
      template: templateBadges,
      render: renderBadges,
      attach: attachBadges
    };
  });
})();
