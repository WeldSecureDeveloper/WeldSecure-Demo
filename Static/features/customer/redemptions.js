(function () {
  const modules = window.WeldModules;
  if (!modules || typeof modules.define !== "function") return;
  if (modules.has && modules.has("features/customer/redemptions")) return;

  modules.define("features/customer/redemptions", function () {
    let shared;
    try {
      shared = modules.use("features/customer/shared");
    } catch (error) {
      console.warn("Customer redemptions module could not load shared utilities:", error);
      return null;
    }
    if (!shared) {
      console.warn("Customer redemptions module missing shared utilities.");
      return null;
    }

    const { WeldUtil, formatNumber, formatDateTime, getState } = shared;

    function renderCustomerRedemptionsView(state) {
      const redemptions = Array.isArray(state.rewardRedemptions)
        ? state.rewardRedemptions
            .slice()
            .sort((a, b) => new Date(b.redeemedAt).getTime() - new Date(a.redeemedAt).getTime())
        : [];

      const rowsMarkup = redemptions
        .map(entry => {
          const reward = rewardById(entry.rewardId);
          const rewardName = reward ? reward.name : "Reward";
          const provider = reward?.provider
            ? `<span class="detail-table__meta">${WeldUtil.escapeHtml(reward.provider)}</span>`
            : "";
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

    function attachCustomerRedemptionsEvents(container) {
      const back = container.querySelector("[data-action='back-to-hub']");
      if (back) {
        back.addEventListener("click", () => {
          setRole("customer", "customer");
        });
      }
    }

    function templateRedemptions(appState) {
      const state = getState(appState);
      return renderCustomerRedemptionsView(state);
    }

    function renderRedemptions(container, appState) {
      if (!container) return;
      const state = getState(appState);
      container.innerHTML = renderCustomerRedemptionsView(state);
      attachCustomerRedemptionsEvents(container);
    }

    function attachRedemptions(container) {
      if (!container) return;
      attachCustomerRedemptionsEvents(container);
    }

    return {
      template: templateRedemptions,
      render: renderRedemptions,
      attach: attachRedemptions
    };
  });
})();
