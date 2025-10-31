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

  const leaderboardEntries = Array.isArray(state.departmentLeaderboard)
    ? state.departmentLeaderboard
        .slice()
        .sort((a, b) => (Number(b?.points) || 0) - (Number(a?.points) || 0))
    : [];
  const publishedDepartments = leaderboardEntries.filter(entry => entry && entry.published);
  const leaderboardRows = leaderboardEntries.length
    ? leaderboardEntries
        .map((entry, index) => {
          if (!entry) return "";
          const fallbackId = `dept-${index}`;
          const entryId =
            typeof entry.id === "string" && entry.id.trim().length > 0 ? entry.id.trim() : fallbackId;
          const tone =
            typeof entry.tone === "string" && entry.tone.trim().length > 0
              ? entry.tone.trim().toLowerCase()
              : "indigo";
          const pointsValue = Number.isFinite(entry.points) ? formatNumber(entry.points) : "0";
          const momentumTag =
            typeof entry.momentumTag === "string" && entry.momentumTag.trim().length > 0
              ? entry.momentumTag.trim()
              : "Momentum story";
          const rawTrendDirection =
            typeof entry.trendDirection === "string" && entry.trendDirection.trim().length > 0
              ? entry.trendDirection.trim().toLowerCase()
              : "";
          const trendDirection =
            rawTrendDirection === "up" || rawTrendDirection === "down" ? rawTrendDirection : "steady";
          const trendValue =
            typeof entry.trendValue === "string" && entry.trendValue.trim().length > 0
              ? entry.trendValue.trim()
              : "--";
          const trendCaption =
            typeof entry.trendCaption === "string" && entry.trendCaption.trim().length > 0
              ? `<span class="detail-table__meta">${WeldUtil.escapeHtml(entry.trendCaption)}</span>`
              : "";
          const participation = Number.isFinite(entry.participationRate)
            ? formatPercent(entry.participationRate)
            : "--";
          const streakWeeks = Number.isFinite(entry.streakWeeks)
            ? `${formatNumber(entry.streakWeeks)} wks`
            : "--";
          const badge = badgeById(entry.featuredBadgeId);
          const badgeLabel = badge ? `Badge: ${badge.title}` : null;
          const quest = Array.isArray(state.quests)
            ? state.quests.find(questItem => String(questItem.id) === String(entry.featuredQuestId))
            : null;
          const questLabel = quest ? `Quest: ${quest.title}` : null;
          const avgResponse =
            Number.isFinite(entry.avgResponseMinutes) && entry.avgResponseMinutes > 0
              ? `Avg triage ${formatNumber(entry.avgResponseMinutes)} mins`
              : null;
          const chips = [];
          if (badgeLabel) chips.push(`<span class="department-leaderboard__chip">${WeldUtil.escapeHtml(badgeLabel)}</span>`);
          if (questLabel) chips.push(`<span class="department-leaderboard__chip">${WeldUtil.escapeHtml(questLabel)}</span>`);
          if (avgResponse) chips.push(`<span class="department-leaderboard__chip">${WeldUtil.escapeHtml(avgResponse)}</span>`);
          const chipsMarkup = chips.length
            ? `<div class="department-leaderboard__chips">${chips.join("")}</div>`
            : "";
          const focusNarrative =
            typeof entry.focusNarrative === "string" && entry.focusNarrative.trim().length > 0
              ? `<p class="department-leaderboard__focus">${WeldUtil.escapeHtml(entry.focusNarrative)}</p>`
              : "";
          const action = entry.published ? "unpublish" : "publish";
          const actionLabel = entry.published ? "Unpublish" : "Publish";
          const actionTone = entry.published ? "button-pill--danger-light" : "button-pill--primary";
          const statusLabel = entry.published ? "Published" : "Draft";
          const statusClass = entry.published
            ? "department-leaderboard__state--published"
            : "department-leaderboard__state--draft";
          return `
            <tr class="department-leaderboard__row" data-tone="${WeldUtil.escapeHtml(tone)}" data-department="${WeldUtil.escapeHtml(entryId)}">
              <td class="department-leaderboard__rank-cell">
                <span class="department-leaderboard__rank" data-rank="${index + 1}">${formatNumber(index + 1)}</span>
              </td>
              <td>
                <div class="department-leaderboard__team">
                  <strong>${WeldUtil.escapeHtml(entry.name || "Department")}</strong>
                  <span class="detail-table__meta">${WeldUtil.escapeHtml(entry.department || "Organisation team")}</span>
                </div>
              </td>
              <td>
                <div class="department-leaderboard__metric">
                  <strong>${pointsValue}</strong>
                  <span class="detail-table__meta">${WeldUtil.escapeHtml(momentumTag)}</span>
                </div>
              </td>
              <td>
                <div class="department-leaderboard__trend" data-direction="${trendDirection}">
                  <strong>${WeldUtil.escapeHtml(trendValue)}</strong>
                  ${trendCaption}
                </div>
              </td>
              <td>
                <div class="department-leaderboard__metric">
                  <strong>${WeldUtil.escapeHtml(participation)}</strong>
                  <span class="detail-table__meta">Participation</span>
                </div>
              </td>
              <td>
                <div class="department-leaderboard__metric">
                  <strong>${WeldUtil.escapeHtml(streakWeeks)}</strong>
                  <span class="detail-table__meta">Streak</span>
                </div>
              </td>
              <td>
                ${chipsMarkup}${focusNarrative}
              </td>
              <td class="department-leaderboard__actions">
                <span class="department-leaderboard__state ${statusClass}">${statusLabel}</span>
                <div class="table-actions">
                  <button
                    type="button"
                    class="button-pill ${actionTone} department-publish-toggle"
                    data-department="${WeldUtil.escapeHtml(entryId)}"
                    data-action="${action}">
                    ${actionLabel}
                  </button>
                </div>
              </td>
            </tr>
          `;
        })
        .join("")
    : `<tr><td colspan="8" class="department-leaderboard__empty">Add departments to highlight the leaderboard story.</td></tr>`;

  const leaderboardSummaryItems = [
    `${formatNumber(leaderboardEntries.length)} departments`,
    `${formatNumber(publishedDepartments.length)} published`
  ];
  const leaderboardSummaryCopy = leaderboardSummaryItems.join(" | ");
  const leaderboardMarkup = `
    <section class="department-leaderboard">
      <div class="section-header">
        <h2>Department leaderboard</h2>
        <p>Inspire friendly competition with streaks, spotlighted badges, and hub-ready publishing.</p>
      </div>
      <div class="department-leaderboard__controls">
        <p class="detail-table__meta">${WeldUtil.escapeHtml(leaderboardSummaryCopy)}</p>
        <div class="department-leaderboard__bulk">
          <button type="button" class="button-pill button-pill--primary" data-bulk-department-action="publish">Publish all</button>
          <button type="button" class="button-pill button-pill--danger-light" data-bulk-department-action="unpublish">Unpublish all</button>
        </div>
      </div>
      <div class="detail-table-wrapper department-leaderboard__table-wrapper">
        <table class="detail-table department-leaderboard__table">
          <thead>
            <tr>
              <th>#</th>
              <th>Department</th>
              <th>Points</th>
              <th>Trend</th>
              <th>Participation</th>
              <th>Streak</th>
              <th>Spotlight</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>${leaderboardRows}</tbody>
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
    ${leaderboardMarkup}
    ${programsMarkup}
  `;
}


function attachOrgHubEvents(container) {
  if (!container) return;
  container.addEventListener("click", event => {
    const bulkDepartment = event.target.closest("[data-bulk-department-action]");
    if (bulkDepartment) {
      const action = bulkDepartment.getAttribute("data-bulk-department-action");
      if (action === "publish") {
        setAllLeaderboardPublication(true);
      } else if (action === "unpublish") {
        setAllLeaderboardPublication(false);
      }
      return;
    }

    const departmentToggle = event.target.closest(".department-publish-toggle");
    if (departmentToggle) {
      const departmentId = departmentToggle.getAttribute("data-department");
      const action = departmentToggle.getAttribute("data-action");
      if (departmentId && action) {
        setLeaderboardEntryPublication(departmentId, action === "publish");
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
