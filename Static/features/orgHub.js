(function () {
  if (!window.Weld) return;
  const features = window.Weld.features || (window.Weld.features = {});

  features.orgHub = {
    render(container, appState) {
      if (!container) return;
      const state = appState || window.state || {};
      container.innerHTML = renderOrgHub(state);
      attachOrgHubEvents(container);
    },
  };

function renderOrgHub(state) {
  const clients = Array.isArray(state.clients) ? state.clients.slice() : [];
  const totalActiveUsers = clients.reduce(
    (sum, client) => sum + (Number(client.activeUsers) || 0),
    0
  );
  const averageHealth = clients.length
    ? Math.round(
        clients.reduce((sum, client) => sum + (Number(client.healthScore) || 0), 0) / clients.length
      )
    : 0;
  const openCases = clients.reduce((sum, client) => sum + (Number(client.openCases) || 0), 0);
  const pendingMessages = Array.isArray(state.messages)
    ? state.messages.filter(message => message?.status === MessageStatus.PENDING).length
    : 0;

  const metricsConfig = [
    {
      label: "Active reporters",
      value: clients.length ? formatNumber(totalActiveUsers) : "--",
      trend: clients.length
        ? { direction: "up", value: "+18", caption: "vs last quarter" }
        : { direction: "up", value: "Ready to demo", caption: "Add sample data" },
      tone: "indigo",
      icon: "rocket"
    },
    {
      label: "Average health",
      value: clients.length ? `${formatNumber(averageHealth)}%` : "--",
      trend: clients.length
        ? { direction: "up", value: "+5 pts", caption: "quarter to date" }
        : { direction: "up", value: "Set baseline", caption: "Import client scores" },
      tone: "emerald",
      icon: "shield"
    },
    {
      label: "Open cases",
      value: formatNumber(openCases),
      trend: openCases > 0
        ? { direction: "up", value: `${formatNumber(openCases)} escalations`, caption: "Prioritise follow-up" }
        : { direction: "down", value: "Queue cleared", caption: "No escalations pending" },
      tone: "amber",
      icon: "hourglass"
    },
    {
      label: "Pending approvals",
      value: formatNumber(pendingMessages),
      trend: pendingMessages > 0
        ? { direction: "up", value: `${formatNumber(pendingMessages)} awaiting`, caption: "Action in security view" }
        : { direction: "down", value: "All approved", caption: "Celebrate the wins" },
      tone: "fuchsia",
      icon: "target"
    }
  ];

  const metricsMarkup = metricsConfig
    .map(metric => WeldUtil.renderMetricCard(metric.label, metric.value, metric.trend, metric.tone, metric.icon))
    .join("");

  const rawToggles =
    state?.meta && typeof state.meta === "object" && state.meta.featureToggles && typeof state.meta.featureToggles === "object"
      ? state.meta.featureToggles
      : {};
  const isFeatureEnabled = key => rawToggles[key] !== false;
  const featureToggleConfig = [
    {
      key: "badges",
      label: "Badges spotlight",
      description: "Showcase published badges and their stories inside the reporter hub.",
      icon: "medal"
    },
    {
      key: "leaderboards",
      label: "Leaderboard pulse",
      description: "Highlight top departments on the reporter hub snapshot and deep dive page.",
      icon: "trophy"
    },
    {
      key: "quests",
      label: "Quest playlist",
      description: "Highlight quests so squads can see the next security upskill challenge.",
      icon: "target"
    },
    {
      key: "rewards",
      label: "Rewards catalogue",
      description: "Surface rewards and redemptions to tell the recognition story end to end.",
      icon: "gift"
    }
  ];
  const featureToggleRows = featureToggleConfig
    .map(feature => {
      const enabled = isFeatureEnabled(feature.key);
      const statusClass = enabled
        ? "department-leaderboard__state department-leaderboard__state--published"
        : "department-leaderboard__state department-leaderboard__state--draft";
      const statusLabel = enabled ? "Visible on hub" : "Hidden on hub";
      const action = enabled ? "disable" : "enable";
      const buttonLabel = enabled ? "Hide on hub" : "Show on hub";
      const buttonTone = enabled ? "button-pill--danger-light" : "button-pill--primary";
      const iconMarkup =
        typeof WeldUtil.renderIcon === "function"
          ? WeldUtil.renderIcon(feature.icon, "sm")
          : WeldUtil.escapeHtml((feature.label || feature.key || "F").charAt(0));
      return `
        <tr data-feature-toggle-row="${WeldUtil.escapeHtml(feature.key)}">
          <td>
            <div class="feature-toggle__identity">
              <span class="feature-toggle__icon">${iconMarkup}</span>
              <div>
                <strong>${WeldUtil.escapeHtml(feature.label)}</strong>
                <span class="detail-table__meta">${WeldUtil.escapeHtml(feature.description)}</span>
              </div>
            </div>
          </td>
          <td>
            <span class="${statusClass}">${statusLabel}</span>
          </td>
          <td class="feature-toggle__actions">
            <button
              type="button"
              class="button-pill ${buttonTone}"
              data-feature="${WeldUtil.escapeHtml(feature.key)}"
              data-feature-toggle-action="${action}">
              ${buttonLabel}
            </button>
          </td>
        </tr>
      `;
    })
    .join("");
  const featureToggleMarkup = `
    <section class="feature-visibility">
      <div class="section-header">
        <h2>Hub visibility controls</h2>
        <p>Toggle demo cards on or off to match the story you want to tell inside the reporter hub.</p>
      </div>
      <div class="detail-table-wrapper feature-visibility__table-wrapper">
        <table class="detail-table feature-visibility__table">
          <thead>
            <tr>
              <th>Feature</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${featureToggleRows}
          </tbody>
        </table>
      </div>
    </section>
  `;

  const programs = Array.isArray(state.engagementPrograms) ? state.engagementPrograms.slice() : [];
  programs.sort((a, b) => {
    const aPublished = Boolean(a?.published);
    const bPublished = Boolean(b?.published);
    if (aPublished !== bPublished) {
      return aPublished ? -1 : 1;
    }
    const titleA = typeof a?.title === "string" ? a.title : "";
    const titleB = typeof b?.title === "string" ? b.title : "";
    return titleA.localeCompare(titleB, undefined, { sensitivity: "base" });
  });
  const publishedPrograms = programs.filter(program => program && program.published);
  const programCards = programs.length
    ? programs
        .map((program, index) => {
          if (!program) return "";
          const fallbackId = `program-${index}`;
          const programId =
            typeof program.id === "string" && program.id.trim().length > 0 ? program.id.trim() : fallbackId;
          const tone =
            typeof program.tone === "string" && program.tone.trim().length > 0
              ? program.tone.trim().toLowerCase()
              : "indigo";
          const statusLabel = program.published
            ? "Published"
            : program.status && String(program.status).trim().length > 0
            ? String(program.status).trim()
            : "Draft";
          const statusClass = program.published
            ? "engagement-card__status--published"
            : "engagement-card__status--draft";
          const action = program.published ? "unpublish" : "publish";
          const actionLabel = program.published ? "Unpublish" : "Publish";
          const actionTone = program.published ? "button-pill--danger-light" : "button-pill--primary";
          const metricValue =
            typeof program.metricValue === "string" && program.metricValue.trim().length > 0
              ? program.metricValue.trim()
              : "--";
          const metricCaption =
            typeof program.metricCaption === "string" && program.metricCaption.trim().length > 0
              ? program.metricCaption.trim()
              : "";
          const audience =
            typeof program.audience === "string" && program.audience.trim().length > 0
              ? program.audience.trim()
              : "";
          const owner =
            typeof program.owner === "string" && program.owner.trim().length > 0 ? program.owner.trim() : "";
          const successSignal =
            typeof program.successSignal === "string" && program.successSignal.trim().length > 0
              ? program.successSignal.trim()
              : "";
          const metaItems = [];
          if (audience) {
            metaItems.push(`<li><strong>Audience</strong><span>${WeldUtil.escapeHtml(audience)}</span></li>`);
          }
          if (owner) {
            metaItems.push(`<li><strong>Owner</strong><span>${WeldUtil.escapeHtml(owner)}</span></li>`);
          }
          const metaMarkup = metaItems.length
            ? `<ul class="engagement-card__meta">${metaItems.join("")}</ul>`
            : "";
          const successMarkup = successSignal
            ? `<p class="engagement-card__signal">${WeldUtil.escapeHtml(successSignal)}</p>`
            : "";
          const category =
            typeof program.category === "string" && program.category.trim().length > 0
              ? program.category.trim()
              : "Programme";
          const description =
            typeof program.description === "string" && program.description.trim().length > 0
              ? program.description.trim()
              : "";
          return `
            <article
              class="engagement-card ${program.published ? "engagement-card--published" : "engagement-card--draft"}"
              data-program="${WeldUtil.escapeHtml(programId)}"
              data-tone="${WeldUtil.escapeHtml(tone)}">
              <header class="engagement-card__header">
                <span class="engagement-card__category">${WeldUtil.escapeHtml(category)}</span>
                <span class="engagement-card__status ${statusClass}">${WeldUtil.escapeHtml(statusLabel)}</span>
              </header>
              <h3 class="engagement-card__title">${WeldUtil.escapeHtml(program.title || "Gamification boost")}</h3>
              <p class="engagement-card__description">${WeldUtil.escapeHtml(description)}</p>
              <div class="engagement-card__metric">
                <span class="engagement-card__metric-value">${WeldUtil.escapeHtml(metricValue)}</span>
                <span class="engagement-card__metric-caption">${WeldUtil.escapeHtml(metricCaption)}</span>
              </div>
              ${metaMarkup}
              ${successMarkup}
              <footer class="engagement-card__footer">
                <span class="detail-table__meta">${WeldUtil.escapeHtml(program.published ? "Visible in hub" : "Draft only")}</span>
                <button
                  type="button"
                  class="button-pill ${actionTone} program-publish-toggle"
                  data-program="${WeldUtil.escapeHtml(programId)}"
                  data-action="${action}">
                  ${actionLabel}
                </button>
              </footer>
            </article>
          `;
        })
        .join("")
    : `<div class="engagement-empty"><p>No gamification boosts configured yet. Pair the leaderboard with a programme to make it shine.</p></div>`;

  const programSummaryItems = [
    `${formatNumber(programs.length)} programmes`,
    `${formatNumber(publishedPrograms.length)} published`
  ];
  const programSummaryCopy = programSummaryItems.join(" | ");
  const programsMarkup = `
    <section class="engagement-programs">
      <div class="section-header">
        <h2>Gamification boosts</h2>
        <p>Bundle badge drops, double points windows, and quest playlists, then publish when the story is ready.</p>
      </div>
      <div class="engagement-programs__controls">
        <p class="detail-table__meta">${WeldUtil.escapeHtml(programSummaryCopy)}</p>
        <div class="engagement-programs__bulk">
          <button type="button" class="button-pill button-pill--primary" data-bulk-program-action="publish">Publish all</button>
          <button type="button" class="button-pill button-pill--danger-light" data-bulk-program-action="unpublish">Unpublish all</button>
        </div>
      </div>
      <div class="engagement-programs__grid">
        ${programCards}
      </div>
    </section>
  `;

  return `
    <section class="client-catalogue__intro">
      <span class="client-catalogue__eyebrow">Organisation Hub</span>
      <h1>Track health and momentum in one glance.</h1>
      <p>Use this view to connect reporter energy, security follow-up, and the rewards in flight. Everything aligns to the questions prospects ask.</p>
    </section>
    <section class="metrics-grid">
      ${metricsMarkup}
    </section>
    ${featureToggleMarkup}
    ${programsMarkup}
  `;
}


function attachOrgHubEvents(container) {
  if (!container) return;
  container.addEventListener("click", event => {
    const featureToggle = event.target.closest("[data-feature-toggle-action]");
    if (featureToggle) {
      const featureKey = featureToggle.getAttribute("data-feature");
      const action = featureToggle.getAttribute("data-feature-toggle-action");
      if (featureKey && action) {
        setHubFeatureToggle(featureKey, action === "enable");
      }
      return;
    }

    const bulkProgram = event.target.closest("[data-bulk-program-action]");
    if (bulkProgram) {
      const action = bulkProgram.getAttribute("data-bulk-program-action");
      if (action === "publish") {
        setAllEngagementProgramsPublication(true);
      } else if (action === "unpublish") {
        setAllEngagementProgramsPublication(false);
      }
      return;
    }

    const programToggle = event.target.closest(".program-publish-toggle");
    if (programToggle) {
      const programId = programToggle.getAttribute("data-program");
      const action = programToggle.getAttribute("data-action");
      if (programId && action) {
        setEngagementProgramPublication(programId, action === "publish");
      }
      return;
    }

    const button = event.target.closest(".client-card .table-actions [data-route]");
    if (!button) return;
    event.preventDefault();
    const route = button.getAttribute("data-route");
    const role = button.getAttribute("data-role");
    if (role) {
      setRole(role, route || role);
    } else if (route) {
      navigate(route);
    }
  });
}

})();
