(function () {
  if (!window.Weld) return;
  const features = window.Weld.features || (window.Weld.features = {});
  const WeldUtil = window.WeldUtil || {};

  features.leaderboards = {
    render(container, appState) {
      if (!container) return;
      const state = appState || window.state || {};
      container.innerHTML = renderLeaderboards(state);
      attachLeaderboardsEvents(container);
    }
  };

  function renderLeaderboards(state) {
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
            if (badgeLabel) {
              chips.push(
                `<span class="department-leaderboard__chip">${WeldUtil.escapeHtml(badgeLabel)}</span>`
              );
            }
            if (questLabel) {
              chips.push(
                `<span class="department-leaderboard__chip">${WeldUtil.escapeHtml(questLabel)}</span>`
              );
            }
            if (avgResponse) {
              chips.push(
                `<span class="department-leaderboard__chip">${WeldUtil.escapeHtml(avgResponse)}</span>`
              );
            }
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
            <tr class="department-leaderboard__row" data-tone="${WeldUtil.escapeHtml(
              tone
            )}" data-department="${WeldUtil.escapeHtml(entryId)}">
              <td class="department-leaderboard__rank-cell">
                <span class="department-leaderboard__rank" data-rank="${index + 1}">${formatNumber(
              index + 1
            )}</span>
              </td>
              <td>
                <div class="department-leaderboard__team">
                  <strong>${WeldUtil.escapeHtml(entry.name || "Department")}</strong>
                  <span class="detail-table__meta">${WeldUtil.escapeHtml(
                    entry.department || "Organisation team"
                  )}</span>
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

    return `
      <section class="client-catalogue__intro">
        <span class="client-catalogue__eyebrow">Leaderboards</span>
        <h1>Showcase department momentum side by side.</h1>
        <p>Publish spotlight stories, track streaks, and walk prospects through how leaderboards fuel engagement.</p>
      </section>
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
  }

  function attachLeaderboardsEvents(container) {
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
      }
    });
  }
})();
