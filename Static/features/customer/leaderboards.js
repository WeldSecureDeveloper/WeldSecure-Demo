(function () {
  const modules = window.WeldModules;
  if (!modules || typeof modules.define !== "function") return;
  if (modules.has && modules.has("features/customer/leaderboards")) return;

  modules.define("features/customer/leaderboards", function () {
    let shared;
    try {
      shared = modules.use("features/customer/shared");
    } catch (error) {
      console.warn("Customer leaderboards module could not load shared utilities:", error);
      return null;
    }
    if (!shared) {
      console.warn("Customer leaderboards module missing shared utilities.");
      return null;
    }

    const { WeldUtil, formatNumber, getState } = shared;
    const formatPercentSafe = value => {
      if (typeof window.formatPercent === "function") {
        return window.formatPercent(value);
      }
      const numeric = Number(value);
      if (!Number.isFinite(numeric)) return "--";
      const percent = Math.round(numeric * 100);
      return `${percent}%`;
    };

    function renderLeaderboardRows(state) {
      const entries = Array.isArray(state.departmentLeaderboard)
        ? state.departmentLeaderboard.filter(entry => entry && entry.published)
        : [];
      if (entries.length === 0) {
        return {
          rowsMarkup:
            `<tr><td colspan="7" class="department-leaderboard__empty">No leaderboards are currently published. Return to the hub to see when new stories go live.</td></tr>`,
          count: 0
        };
      }

      const sorted = entries
        .slice()
        .sort((a, b) => (Number(b?.points) || 0) - (Number(a?.points) || 0));

      const rowsMarkup = sorted
        .map((entry, index) => {
          const fallbackId = `dept-${index}`;
          const entryId =
            typeof entry.id === "string" && entry.id.trim().length > 0 ? entry.id.trim() : fallbackId;
          const tone =
            typeof entry.tone === "string" && entry.tone.trim().length > 0
              ? entry.tone.trim().toLowerCase()
              : "indigo";
          const teamName =
            typeof entry.name === "string" && entry.name.trim().length > 0
              ? entry.name.trim()
              : `Department ${formatNumber(index + 1)}`;
          const departmentLabel =
            typeof entry.department === "string" && entry.department.trim().length > 0
              ? entry.department.trim()
              : "Organisation team";
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
            ? formatPercentSafe(entry.participationRate)
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
                  <strong>${WeldUtil.escapeHtml(teamName)}</strong>
                  <span class="detail-table__meta">${WeldUtil.escapeHtml(departmentLabel)}</span>
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
            </tr>
          `;
        })
        .join("");

      return {
        rowsMarkup,
        count: sorted.length
      };
    }

    function renderCustomerLeaderboardsView(state) {
      const { rowsMarkup, count } = renderLeaderboardRows(state);
      const summaryCopy =
        count > 0
          ? `${formatNumber(count)} departments published`
          : "No published departments yet";

      return `
        <header class="customer-detail-header">
          <button type="button" class="customer-detail__back" data-action="back-to-hub">
            Back to hub
          </button>
          <span class="customer-detail__eyebrow">Leaderboards</span>
          <h1>Published department leaderboards</h1>
          <p>See the departments your organisation spotlights for vigilance, streaks, and participation. ${WeldUtil.escapeHtml(
            summaryCopy
          )}.</p>
        </header>
        <section class="customer-section customer-section--leaderboards">
          <div class="department-leaderboard department-leaderboard--customer">
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
                  </tr>
                </thead>
                <tbody>${rowsMarkup}</tbody>
              </table>
            </div>
          </div>
        </section>
      `;
    }

    function attachCustomerLeaderboardsEvents(container) {
      const back = container.querySelector("[data-action='back-to-hub']");
      if (back) {
        back.addEventListener("click", () => {
          setRole("customer", "customer");
        });
      }
    }

    function templateLeaderboards(appState) {
      const state = getState(appState);
      return renderCustomerLeaderboardsView(state);
    }

    function renderLeaderboards(container, appState) {
      if (!container) return;
      const state = getState(appState);
      container.innerHTML = renderCustomerLeaderboardsView(state);
      attachCustomerLeaderboardsEvents(container);
    }

    function attachLeaderboards(container) {
      if (!container) return;
      attachCustomerLeaderboardsEvents(container);
    }

    return {
      template: templateLeaderboards,
      render: renderLeaderboards,
      attach: attachLeaderboards
    };
  });
})();
