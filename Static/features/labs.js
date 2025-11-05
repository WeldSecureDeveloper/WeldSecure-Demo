(function () {
  if (!window.Weld) return;

  const features = window.Weld.features || (window.Weld.features = {});
  const labsFeature = features.labs || (features.labs = {});
  const WeldUtil = window.WeldUtil || {};
  const WeldServices = window.WeldServices || {};

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

  const normalizeLabFeatureIdSafe = value => {
    if (typeof WeldUtil.normalizeLabFeatureId === "function") {
      return WeldUtil.normalizeLabFeatureId(value);
    }
    if (Number.isFinite(value)) return String(value);
    if (typeof value === "string") {
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : null;
    }
    return null;
  };

  const labClientKeySafe = value => {
    if (typeof WeldUtil.labClientKey === "function") {
      return WeldUtil.labClientKey(value);
    }
    if (Number.isFinite(value)) return String(Number(value));
    if (typeof value === "string") return value.trim();
    return "";
  };

  const normalizeLabClientIdSafe = value => {
    if (typeof WeldUtil.normalizeLabClientId === "function") {
      return WeldUtil.normalizeLabClientId(value);
    }
    if (Number.isFinite(value)) return Number(value);
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) return null;
      const numeric = Number(trimmed);
      return Number.isFinite(numeric) ? numeric : trimmed;
    }
    return null;
  };

  const getState =
    typeof WeldUtil.getState === "function"
      ? WeldUtil.getState
      : appState => {
          if (appState && typeof appState === "object") return appState;
          if (window.Weld && typeof window.Weld.state === "object") return window.Weld.state;
          if (typeof window.state === "object") return window.state;
          return {};
        };

  function renderLabsView(stateOverride) {
    const state = getState(stateOverride);
    const labs = state.labs && typeof state.labs === "object" ? state.labs : {};
    const featuresList = Array.isArray(labs.features) ? labs.features : [];
    const clients = Array.isArray(state.clients) ? state.clients : [];
    const totalFeatures = featuresList.length;
    const activeFeatures = featuresList.filter(feature => {
      return Array.isArray(feature?.enabledClientIds) && feature.enabledClientIds.length > 0;
    }).length;
    const enabledSet = new Set();
    let totalAssignments = 0;
    featuresList.forEach(feature => {
      if (!Array.isArray(feature?.enabledClientIds)) return;
      feature.enabledClientIds.forEach(id => {
        const key = labClientKeySafe(id);
        if (!key) return;
        enabledSet.add(key);
        totalAssignments += 1;
      });
    });
    const coverage = clients.length > 0 ? Math.round((enabledSet.size / clients.length) * 100) : 0;

    const metricsConfig = [
      {
        label: "Experiments in labs",
        value: formatNumberSafe(totalFeatures),
        caption: "Ready to showcase"
      },
      {
        label: "Active pilots",
        value: formatNumberSafe(activeFeatures),
        caption: "Enabled for tenants"
      },
      {
        label: "Coverage",
        value: clients.length ? `${coverage}%` : "--",
        caption: `${formatNumberSafe(enabledSet.size)} of ${formatNumberSafe(clients.length)} organisations`
      }
    ];

    const metricsMarkup = metricsConfig
      .map(
        metric => `
        <article class="weld-labs__metric">
          <h3>${WeldUtil.escapeHtml(metric.label)}</h3>
          <strong>${WeldUtil.escapeHtml(metric.value)}</strong>
          <span>${WeldUtil.escapeHtml(metric.caption)}</span>
        </article>
      `
      )
      .join("");

    const reviewMarkup = labs.lastReviewAt
      ? `
        <div class="weld-labs__review">
          <span>Last review</span>
          <strong>${WeldUtil.escapeHtml(formatDateTimeSafe(labs.lastReviewAt))}</strong>
          <small>${WeldUtil.escapeHtml(relativeTimeSafe(labs.lastReviewAt))}</small>
        </div>
      `
      : `
        <div class="weld-labs__review">
          <span>Last review</span>
          <strong>Not yet scheduled</strong>
        </div>
      `;

    const featureCards = featuresList.length
      ? featuresList
          .map((feature, index) => {
            const featureId = normalizeLabFeatureIdSafe(feature?.id) || `lab-${index + 1}`;
            const name =
              typeof feature?.name === "string" && feature.name.trim().length > 0
                ? feature.name
                : "Experiment";
            const status =
              typeof feature?.status === "string" && feature.status.trim().length > 0
                ? feature.status
                : "Preview";
            const summary = typeof feature?.summary === "string" ? feature.summary : "";
            const benefit = typeof feature?.benefit === "string" ? feature.benefit : "";
            const owner =
              typeof feature?.owner === "string" && feature.owner.trim().length > 0
                ? feature.owner
                : "";
            const tags = Array.isArray(feature?.tags)
              ? feature.tags
                  .map(tag => (typeof tag === "string" ? tag.trim() : ""))
                  .filter(Boolean)
              : [];
            const enabledIds = Array.isArray(feature?.enabledClientIds)
              ? feature.enabledClientIds
              : [];
            const enabledKeys = new Set(enabledIds.map(labClientKeySafe).filter(Boolean));
            const enabledCount = enabledKeys.size;
            const clientToggleMarkup = clients.length
              ? clients
                  .map(client => {
                    const clientKey = labClientKeySafe(client?.id);
                    const orgKey = labClientKeySafe(client?.organizationId);
                    const isEnabled =
                      (clientKey && enabledKeys.has(clientKey)) || (orgKey && enabledKeys.has(orgKey));
                    const toneClass = isEnabled ? "button-pill--primary" : "button-pill--ghost";
                    const enabledAttr = isEnabled ? "true" : "false";
                    const clientName =
                      typeof client?.name === "string" ? client.name : `Org ${client?.id ?? ""}`;
                    const titleParts = [];
                    if (clientName) titleParts.push(clientName);
                    if (client?.organizationId) {
                      titleParts.push(`Org ID ${client.organizationId}`);
                    }
                    const toggleTitle = titleParts.join(" - ");
                    const actionLabel = isEnabled ? "Disable" : "Enable";
                    return `
                    <button
                      type="button"
                      class="button-pill ${toneClass} weld-labs__toggle"
                      data-lab-toggle
                      data-lab-feature="${WeldUtil.escapeHtml(featureId)}"
                      data-client="${WeldUtil.escapeHtml(String(client.id))}"
                      data-enabled="${enabledAttr}"
                      aria-pressed="${enabledAttr}"
                      aria-label="${WeldUtil.escapeHtml(`${actionLabel} ${clientName} for ${name}`)}"
                      ${toggleTitle ? `title="${WeldUtil.escapeHtml(toggleTitle)}"` : ""}
                    >
                      ${WeldUtil.escapeHtml(clientName)}
                    </button>
                  `;
                  })
                  .join("")
              : "";
            const tagsMarkup = tags.length
              ? `<div class="weld-labs__tags">${tags
                  .map(tag => `<span class="weld-labs__tag">${WeldUtil.escapeHtml(tag)}</span>`)
                  .join("")}</div>`
              : "";
            const toggleSection = clients.length
              ? `
              <div class="weld-labs__toggle-header">
                <h4>Organisations</h4>
                <span>${WeldUtil.escapeHtml(
                  `${formatNumberSafe(enabledCount)} of ${formatNumberSafe(clients.length)} active`
                )}</span>
              </div>
              <div class="weld-labs__toggle-grid">
                ${clientToggleMarkup}
              </div>
              <div class="weld-labs__bulk">
                <button
                  type="button"
                  class="button-pill button-pill--ghost weld-labs__bulk-action"
                  data-lab-feature="${WeldUtil.escapeHtml(featureId)}"
                  data-lab-bulk="enable"
                  aria-label="${WeldUtil.escapeHtml(`Enable ${name} for all organisations`)}"
                >
                  Enable all
                </button>
                <button
                  type="button"
                  class="button-pill button-pill--ghost weld-labs__bulk-action"
                  data-lab-feature="${WeldUtil.escapeHtml(featureId)}"
                  data-lab-bulk="disable"
                  aria-label="${WeldUtil.escapeHtml(`Disable ${name} for all organisations`)}"
                >
                  Disable all
                </button>
              </div>
            `
              : `<p class="weld-labs__no-clients">Add organisation accounts to pilot this experiment.</p>`;
            return `
            <article class="weld-labs__feature" data-feature="${WeldUtil.escapeHtml(featureId)}">
              <header class="weld-labs__feature-header">
                <span class="weld-labs__status">${WeldUtil.escapeHtml(status)}</span>
                <h3>${WeldUtil.escapeHtml(name)}</h3>
                ${tagsMarkup}
              </header>
              <p class="weld-labs__summary">${WeldUtil.escapeHtml(summary)}</p>
              ${benefit ? `<p class="weld-labs__benefit">${WeldUtil.escapeHtml(benefit)}</p>` : ""}
              <div class="weld-labs__meta">
                ${owner ? `<span class="weld-labs__owner">Owner: ${WeldUtil.escapeHtml(owner)}</span>` : ""}
                <span class="weld-labs__assignments">${WeldUtil.escapeHtml(
                  `${formatNumberSafe(enabledCount)} organisations enabled`
                )}</span>
              </div>
              <section class="weld-labs__toggle-panel" aria-label="Manage access for ${WeldUtil.escapeHtml(name)}">
                ${toggleSection}
              </section>
            </article>
          `;
          })
          .join("")
      : `
        <div class="weld-labs__empty">
          <h3>Nothing in Labs yet</h3>
          <p>Use this workspace to curate early feature previews. Add experiments in the data model to toggle availability per organisation.</p>
        </div>
      `;

    return `
    <section class="weld-labs">
      <header class="weld-labs__hero">
        <div>
          <span class="weld-labs__eyebrow">Labs workspace</span>
          <h1>Weld Labs</h1>
          <p>Walk organisations through experimental capabilities, shape the story, and toggle access in real time.</p>
        </div>
        ${reviewMarkup}
      </header>
      <section class="weld-labs__metrics">
        ${metricsMarkup}
      </section>
      <section class="weld-labs__assignments-summary">
        <strong>${WeldUtil.escapeHtml(formatNumberSafe(totalAssignments))}</strong>
        <span>Total tenant toggles active</span>
      </section>
      <section class="weld-labs__list">
        ${featureCards}
      </section>
    </section>
  `;
  }

  function attachLabsEvents(container, appState) {
    if (!container) return;
    container.addEventListener("click", event => {
      const toggle = event.target.closest("[data-lab-toggle]");
      if (toggle && typeof WeldServices.setLabFeatureAccess === "function") {
        event.preventDefault();
        const featureId = (toggle.getAttribute("data-lab-feature") || "").trim();
        const clientIdRaw = (toggle.getAttribute("data-client") || "").trim();
        if (!featureId || !clientIdRaw) {
          return;
        }
        const numericClientId = Number(clientIdRaw);
        const clientIdValue =
          Number.isFinite(numericClientId) && clientIdRaw !== "" ? numericClientId : clientIdRaw;
        const currentEnabled = toggle.getAttribute("data-enabled") === "true";
        WeldServices.setLabFeatureAccess(featureId, clientIdValue, !currentEnabled, getState(appState));
        return;
      }
      const bulk = event.target.closest("[data-lab-bulk]");
      if (bulk && typeof WeldServices.setLabFeatureAccessForAll === "function") {
        event.preventDefault();
        const featureId = (bulk.getAttribute("data-lab-feature") || "").trim();
        const mode = (bulk.getAttribute("data-lab-bulk") || "").trim().toLowerCase();
        if (!featureId || !mode) return;
        if (mode === "enable") {
          WeldServices.setLabFeatureAccessForAll(featureId, true, getState(appState));
        } else if (mode === "disable") {
          WeldServices.setLabFeatureAccessForAll(featureId, false, getState(appState));
        }
      }
    });
  }

  labsFeature.template = function template(appState) {
    return renderLabsView(appState);
  };

  labsFeature.render = function render(container, appState) {
    if (!container) return;
    container.innerHTML = renderLabsView(appState);
    attachLabsEvents(container, appState);
  };

  labsFeature.attach = function attach(container, appState) {
    attachLabsEvents(container, appState);
  };
})();
