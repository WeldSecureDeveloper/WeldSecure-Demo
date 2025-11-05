(function () {
  if (!window.Weld) return;

  const features = window.Weld.features || (window.Weld.features = {});
  const adminFeature = features.admin || (features.admin = {});
  const WeldUtil = window.WeldUtil || {};

  const formatNumberSafe =
    typeof WeldUtil.formatNumberSafe === "function"
      ? WeldUtil.formatNumberSafe
      : value => (Number.isFinite(Number(value)) ? Number(value) : 0);

  const formatDateTimeSafe =
    typeof WeldUtil.formatDateTimeSafe === "function"
      ? WeldUtil.formatDateTimeSafe
      : value => (value === null || value === undefined ? "" : String(value));

  const relativeTimeSafe =
    typeof WeldUtil.relativeTimeSafe === "function"
      ? WeldUtil.relativeTimeSafe
      : value => (value === null || value === undefined ? "" : String(value));

  const getState =
    typeof WeldUtil.getState === "function"
      ? WeldUtil.getState
      : appState => (appState && typeof appState === "object" ? appState : {});

  function renderAdminView(stateOverride) {
    const state = getState(stateOverride);
    const clients = Array.isArray(state.clients) ? state.clients : [];
    const clientCards = clients
      .map(
        client => `
        <article class="client-card">
          <div>
            <span class="landing__addin-eyebrow">Client</span>
            <h2>${WeldUtil.escapeHtml(client.name)}</h2>
            <p>Org ID: ${WeldUtil.escapeHtml(client.organizationId)}</p>
          </div>
          <div class="client-card__stats">
            <div>
              <label>Health score</label>
              <span>${WeldUtil.escapeHtml(`${client.healthScore}%`)}</span>
            </div>
            <div>
              <label>Open cases</label>
              <span>${WeldUtil.escapeHtml(String(client.openCases))}</span>
            </div>
            <div>
              <label>Active users</label>
              <span>${WeldUtil.escapeHtml(String(client.activeUsers))}</span>
            </div>
          </div>
          <footer>
            <div>
              <label>Last reported email</label>
              <strong>${WeldUtil.escapeHtml(formatDateTimeSafe(client.lastReportAt))}</strong>
              <span class="landing__addin-eyebrow">${WeldUtil.escapeHtml(
                relativeTimeSafe(client.lastReportAt)
              )}</span>
            </div>
            <div class="table-actions">
              <button data-client="${WeldUtil.escapeHtml(String(client.id))}" data-action="view-journey">View journey</button>
              <button data-client="${WeldUtil.escapeHtml(String(client.id))}" data-action="share-insights">Share insights</button>
            </div>
          </footer>
        </article>
      `
      )
      .join("");

    const totalClients = clients.length;
    const averageHealth = totalClients
      ? Math.round(
          clients.reduce((acc, client) => acc + (Number(client.healthScore) || 0), 0) / totalClients
        )
      : 0;
    const openCases = clients.reduce((acc, client) => acc + (Number(client.openCases) || 0), 0);

    const metricsMarkup = [
      WeldUtil.renderMetricCard(
        "Active clients",
        totalClients.toString(),
        { direction: "up", value: "2 onboarded", caption: "last month" },
        "indigo",
        "shield"
      ),
      WeldUtil.renderMetricCard(
        "Average health",
        `${averageHealth}%`,
        { direction: "up", value: "+6 pts", caption: "quarter to date" },
        "emerald",
        "heart"
      ),
      WeldUtil.renderMetricCard(
        "Open cases",
        formatNumberSafe(openCases),
        { direction: "down", value: "-3", caption: "since Monday" },
        "amber",
        "hourglass"
      )
    ].join("");

    return `
    <header>
      <h1>WeldSecure - multi-tenant view</h1>
      <p>Use this vantage point to share how Weld scales across clients while spotting where to lean in.</p>
      <button class="button-pill button-pill--primary" id="trigger-playbook">Trigger playbook</button>
    </header>
    <section class="metrics-grid">
      ${metricsMarkup}
    </section>
    <section class="clients-grid">${clientCards}</section>
    <section class="playbook-card">
      <div>
        <strong>Multi-tenant narrative</strong>
        <p>Leadership wants confidence Weld scales easily. Use these cards to show targeted interventions based on engagement health.</p>
      </div>
      <div class="playbook-card__set">
        <div class="playbook">
          <h3>Evergreen Capital</h3>
          <p>Run "Celebrate Champions" sequence - approvals consistently above 80%.</p>
          <span>Scheduled: Tomorrow 09:00</span>
        </div>
        <div class="playbook">
          <h3>Cobalt Manufacturing</h3>
          <p>Launch "Win Back Vigilance" workshop - health dipped below 75%.</p>
          <span>Owner: Customer Success</span>
        </div>
      </div>
    </section>
  `;
  }

  function attachAdminEvents(container, appState) {
    if (!container) return;
    const triggerBtn = container.querySelector("#trigger-playbook");
    if (triggerBtn && typeof window.openDialog === "function") {
      triggerBtn.addEventListener("click", () => {
        window.openDialog({
          title: "Playbook scheduled",
          description: "Use this cue to explain how Weld orchestrates interventions across tenants.",
          confirmLabel: "Nice"
        });
      });
    }

    container
      .querySelectorAll("[data-action='view-journey'], [data-action='share-insights']")
      .forEach(button => {
        button.addEventListener("click", () => {
          const state = getState(appState);
          const clientId = Number(button.getAttribute("data-client"));
          const client = Array.isArray(state.clients)
            ? state.clients.find(entry => Number(entry?.id) === clientId)
            : null;
          if (!client || typeof window.openDialog !== "function") return;
          const action = button.getAttribute("data-action");
          if (action === "view-journey") {
            window.openDialog({
              title: `Switch to ${client.name}?`,
              description:
                "For the demo, remind stakeholders each client gets a dedicated journey view with custom insights.",
              confirmLabel: "Return",
              onConfirm: typeof window.closeDialog === "function" ? window.closeDialog : undefined
            });
          } else {
            window.openDialog({
              title: "Insights shared",
              description: `Customer Success receives a packaged summary for ${client.name}.`,
              confirmLabel: "Great"
            });
          }
        });
      });
  }

  adminFeature.template = function template(appState) {
    return renderAdminView(appState);
  };

  adminFeature.render = function render(container, appState) {
    if (!container) return;
    container.innerHTML = renderAdminView(appState);
    attachAdminEvents(container, appState);
  };

  adminFeature.attach = function attach(container, appState) {
    attachAdminEvents(container, appState);
  };
})();
