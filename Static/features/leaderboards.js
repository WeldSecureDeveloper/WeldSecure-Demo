(function () {
  if (!window.Weld) return;
  const globalScope = typeof window !== "undefined" ? window : {};
  const features = window.Weld.features || (window.Weld.features = {});
  const WeldUtil = window.WeldUtil || {};

  const shortDateFormatter = (() => {
    try {
      return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
    } catch {
      return null;
    }
  })();

  const VIEW_BLUEPRINTS = [
    {
      id: "department",
      label: "Departments",
      title: "Department momentum",
      description: "Keep streaks, spotlighted badges, and publishing controls within one quick view.",
      builder: buildDepartmentView
    },
    {
      id: "individual",
      label: "Individuals",
      title: "Reporter heroes",
      description: "Highlight the reporters fueling the programme and who deserves the next shout-out.",
      builder: buildIndividualView
    }
  ];

  const USER_TONE_PALETTE = ["violet", "teal", "amber", "blue", "rose", "emerald", "indigo", "cyan"];

  function getDirectorySnapshot(state) {
    const fallback = (window.AppData && window.AppData.DIRECTORY) || {};
    const fromState = state && typeof state.directory === "object" ? state.directory : {};
    const ensureList = (source, backup) => {
      if (Array.isArray(source) && source.length > 0) return source;
      if (Array.isArray(backup) && backup.length > 0) return backup;
      return [];
    };
    const departments = ensureList(fromState.departments, fallback.departments);
    const users = ensureList(fromState.users, fallback.users);
    return {
      departments,
      users,
      departmentMap: new Map(departments.map(dept => [dept.id, dept])),
      userMap: new Map(users.map(user => [user.id, user]))
    };
  }

  function mapDirectoryUsersToMembers(users) {
    if (!Array.isArray(users)) return [];
    return users.map((user, index) => {
      const displayNameParts = [user?.givenName, user?.surname].filter(
        part => typeof part === "string" && part.trim().length > 0
      );
      const name = user?.displayName || displayNameParts.join(" ") || user?.mail || `Member ${index + 1}`;
      return {
        id: user?.id || `member-${index}`,
        name,
        email: user?.mail || "",
        title: user?.jobTitle || "",
        location: user?.officeLocation || "",
        specialty: user?.expertiseTag || user?.jobTitle || "Security champion",
        avatarTone: user?.avatarTone || USER_TONE_PALETTE[index % USER_TONE_PALETTE.length]
      };
    });
  }

  features.leaderboards = {
    render(container, appState) {
      if (!container) return;
      const state = appState || window.state || {};
      container.innerHTML = renderLeaderboards(state);
      attachLeaderboardsEvents(container);
    }
  };

  function renderLeaderboards(state) {
    const directory = getDirectorySnapshot(state);
    const views = VIEW_BLUEPRINTS.map(blueprint => blueprint.builder(state, blueprint, directory));
    const firstAvailableView = views.find(view => view.hasData) || views[0];
    const activeViewId = firstAvailableView ? firstAvailableView.id : null;

    const tabsMarkup = views
      .map((view, index) => renderLeaderboardTab(view, activeViewId, index === 0))
      .join("");
    const panelsMarkup = views
      .map((view, index) => renderLeaderboardPanel(view, activeViewId, index === 0))
      .join("");

    return `
      <section class="client-catalogue__intro">
        <span class="client-catalogue__eyebrow">Leaderboards</span>
        <h1>Guide prospects through the stories that matter.</h1>
        <p>Switch between department momentum, stand-out reporters, or overall organisation health without leaving this page.</p>
      </section>
      <section class="leaderboards-hub">
        <div class="leaderboard-tabs" role="tablist">${tabsMarkup}</div>
        <div class="leaderboard-panels">${panelsMarkup}</div>
      </section>
    `;
  }

  function renderLeaderboardTab(view, activeViewId, isFirst) {
    const isActive = activeViewId ? view.id === activeViewId : isFirst;
    return `
      <button
        type="button"
        class="leaderboard-tab${isActive ? " is-active" : ""}"
        role="tab"
        id="leaderboard-tab-${escapeHtml(view.id)}"
        aria-controls="leaderboard-panel-${escapeHtml(view.id)}"
        aria-selected="${isActive}"
        data-leaderboard-tab="${escapeHtml(view.id)}">
        <span>${escapeHtml(view.label)}</span>
        <span class="leaderboard-tab__meta">${escapeHtml(view.tabMeta || "—")}</span>
      </button>
    `;
  }

  function renderLeaderboardPanel(view, activeViewId, isFirst) {
    const isActive = activeViewId ? view.id === activeViewId : isFirst;
    const hiddenAttr = isActive ? "" : " hidden";
    return `
      <section
        class="leaderboard-panel"
        id="leaderboard-panel-${escapeHtml(view.id)}"
        role="tabpanel"
        aria-labelledby="leaderboard-tab-${escapeHtml(view.id)}"
        data-leaderboard-panel="${escapeHtml(view.id)}"${hiddenAttr}>
        <div class="leaderboard-panel__intro">
          <div>
            <h2>${escapeHtml(view.title)}</h2>
            <p>${escapeHtml(view.description)}</p>
          </div>
          <p class="leaderboard-panel__summary">${escapeHtml(view.summary)}</p>
        </div>
        ${view.actionsMarkup || ""}
        ${view.body}
      </section>
    `;
  }

  function buildDepartmentView(state, blueprint, directory) {
    const entries = getDepartmentEntries(state, directory);
    const publishedDepartments = entries.filter(entry => entry.published);
    const summary =
      entries.length > 0
        ? `${formatNumberSafe(entries.length)} departments | ${formatNumberSafe(publishedDepartments.length)} published`
        : "No departments configured yet";
    const actionsMarkup =
      entries.length > 0
        ? `
      <div class="leaderboard-panel__actions">
        <button type="button" class="button-pill button-pill--primary" data-bulk-department-action="publish">Publish all</button>
        <button type="button" class="button-pill button-pill--danger-light" data-bulk-department-action="unpublish">Unpublish all</button>
      </div>`
        : "";
    const cardsMarkup = entries.length
      ? entries.map((entry, index) => renderDepartmentCard(entry, index, state)).join("")
      : `<li class="leaderboard-empty-card">Add departments to highlight the leaderboard story.</li>`;

    return {
      ...blueprint,
      summary,
      tabMeta: entries.length ? `${formatNumberSafe(entries.length)} rows` : "No data",
      body: `<ul class="leaderboard-cards department-leaderboard__cards">${cardsMarkup}</ul>`,
      actionsMarkup,
      hasData: entries.length > 0
    };
  }

  function renderDepartmentCard(entry, index, state) {
    const fallbackId = `dept-${index}`;
    const entryId =
      typeof entry.id === "string" && entry.id.trim().length > 0 ? entry.id.trim() : fallbackId;
    const tone =
      typeof entry.tone === "string" && entry.tone.trim().length > 0
        ? entry.tone.trim().toLowerCase()
        : "indigo";
    const pointsValue = Number.isFinite(entry.points) ? formatNumberSafe(entry.points) : "0";
    const departmentLabel =
      typeof entry.department === "string" && entry.department.trim().length > 0
        ? entry.department.trim()
        : "Organisation team";
    const trend = resolveTrend(entry);
    const participation = Number.isFinite(entry.participationRate)
      ? formatPercentSafe(entry.participationRate)
      : "--";
    const streakWeeks = Number.isFinite(entry.streakWeeks)
      ? `${formatNumberSafe(entry.streakWeeks)} wks`
      : "--";
    const chipsMarkup = buildSpotlightChips(entry, state);
    const focusNarrative =
      typeof entry.focusNarrative === "string" && entry.focusNarrative.trim().length > 0
        ? `<p class="leaderboard-focus">${escapeHtml(entry.focusNarrative)}</p>`
        : "";
    const action = entry.published ? "unpublish" : "publish";
    const actionLabel = entry.published ? "Unpublish" : "Publish";
    const actionTone = entry.published ? "button-pill--danger-light" : "button-pill--primary";
    const statusLabel = entry.published ? "Published" : "Draft";
    const statusClass = entry.published
      ? "department-leaderboard__state--published"
      : "department-leaderboard__state--draft";
    const momentumTag =
      typeof entry.momentumTag === "string" && entry.momentumTag.trim().length > 0
        ? entry.momentumTag.trim()
        : "Momentum story";
    const ownerName = entry.ownerName || "Unassigned";
    const ownerDetail = entry.ownerTitle || entry.ownerEmail || "";

    return `
      <li class="leaderboard-card" data-tone="${escapeHtml(tone)}" data-leaderboard-card="${escapeHtml(entryId)}">
        <div class="leaderboard-card__summary">
          <span class="leaderboard-card__rank" data-rank="${index + 1}">${formatNumberSafe(index + 1)}</span>
          <div class="leaderboard-card__primary">
            <strong>${escapeHtml(entry.name || departmentLabel)}</strong>
            <span class="leaderboard-card__meta">${escapeHtml(departmentLabel)}</span>
          </div>
          <div class="leaderboard-card__value" title="Total points captured for this department">
            <span class="leaderboard-card__value-label">Points</span>
            <strong>${escapeHtml(pointsValue)}</strong>
          </div>
          <div class="leaderboard-card__trend department-leaderboard__trend" data-direction="${escapeHtml(
            trend.direction
          )}" title="${escapeHtml(trend.label)}">
            <strong>${escapeHtml(trend.value)}</strong>
            ${trend.caption ? `<span class="detail-table__meta">${escapeHtml(trend.caption)}</span>` : ""}
          </div>
          <button type="button" class="leaderboard-card__detail-toggle" aria-expanded="false">
            Quick view
          </button>
        </div>
        <div class="leaderboard-card__details" hidden>
          <div class="leaderboard-card__detail-grid">
            <div>
              <span class="detail-table__meta">Participation</span>
              <strong>${escapeHtml(participation)}</strong>
            </div>
            <div>
              <span class="detail-table__meta">Streak</span>
              <strong>${escapeHtml(streakWeeks)}</strong>
            </div>
            <div>
              <span class="detail-table__meta">Momentum tag</span>
              <strong>${escapeHtml(momentumTag)}</strong>
            </div>
            <div>
              <span class="detail-table__meta">Owner</span>
              <strong>${escapeHtml(ownerName)}</strong>
              ${ownerDetail ? `<span class="detail-table__meta">${escapeHtml(ownerDetail)}</span>` : ""}
            </div>
          </div>
          ${chipsMarkup}
          ${focusNarrative}
          <div class="leaderboard-card__actions">
            <span class="department-leaderboard__state ${statusClass}">${statusLabel}</span>
            <button
              type="button"
              class="button-pill ${actionTone} department-publish-toggle"
              data-department="${escapeHtml(entryId)}"
              data-action="${action}">
              ${actionLabel}
            </button>
          </div>
        </div>
      </li>
    `;
  }

  function buildSpotlightChips(entry, state) {
    const chips = [];
    const badge = typeof badgeById === "function" ? badgeById(entry.featuredBadgeId) : null;
    if (badge?.title) {
      chips.push(`<span class="department-leaderboard__chip" title="Featured badge">${escapeHtml(`Badge: ${badge.title}`)}</span>`);
    }
    const quest = Array.isArray(state.quests)
      ? state.quests.find(questItem => String(questItem.id) === String(entry.featuredQuestId))
      : null;
    if (quest?.title) {
      chips.push(
        `<span class="department-leaderboard__chip" title="Featured quest">${escapeHtml(`Quest: ${quest.title}`)}</span>`
      );
    }
    if (Number.isFinite(entry.avgResponseMinutes) && entry.avgResponseMinutes > 0) {
      chips.push(
        `<span class="department-leaderboard__chip" title="Average triage time">${escapeHtml(
          `Avg triage ${formatNumberSafe(entry.avgResponseMinutes)} mins`
        )}</span>`
      );
    }
    return chips.length ? `<div class="department-leaderboard__chips">${chips.join("")}</div>` : "";
  }

  function buildIndividualView(state, blueprint, directory) {
    const { entries, totals } = computeIndividualEntries(state, directory);
    const summary =
      entries.length > 0
        ? `${formatNumberSafe(entries.length)} teammates | ${formatNumberSafe(totals.shoutouts)} shout-outs`
        : "Collect reports or recognitions to unlock this view";
    const cardsMarkup = entries.length
      ? entries.map((entry, index) => renderIndividualCard(entry, index)).join("")
      : `<li class="leaderboard-empty-card">No reporter data captured yet.</li>`;

    return {
      ...blueprint,
      summary,
      tabMeta: entries.length ? `${formatNumberSafe(entries.length)} people` : "No data",
      body: `<ul class="leaderboard-cards">${cardsMarkup}</ul>`,
      actionsMarkup: "",
      hasData: entries.length > 0
    };
  }

  function renderIndividualCard(entry, index) {
    const chips = [];
    if (entry.specialty) {
      chips.push(`<span class="leaderboard-chip" title="Specialty">${escapeHtml(entry.specialty)}</span>`);
    }
    if (entry.location) {
      chips.push(`<span class="leaderboard-chip" title="Location">${escapeHtml(entry.location)}</span>`);
    }
    const chipsMarkup = chips.length ? `<div class="leaderboard-card__chips">${chips.join("")}</div>` : "";
    const activityLabel = entry.lastActivity
      ? `${formatRelativeTime(entry.lastActivity)} • ${entry.lastSource}`
      : "Awaiting update";
    const lastHighlight =
      entry.lastHighlight && entry.lastHighlight.trim().length > 0
        ? `<p class="leaderboard-focus">${escapeHtml(entry.lastHighlight)}</p>`
        : "";

    return `
      <li class="leaderboard-card" data-tone="${escapeHtml(entry.tone)}" data-leaderboard-card="${escapeHtml(entry.id)}">
        <div class="leaderboard-card__summary">
          <span class="leaderboard-card__rank" data-rank="${index + 1}">${formatNumberSafe(index + 1)}</span>
          <div class="leaderboard-card__primary">
            <strong>${escapeHtml(entry.name)}</strong>
            <span class="leaderboard-card__meta">${escapeHtml(entry.title || "Reporter")}</span>
          </div>
          <div class="leaderboard-card__value" title="Composite impact points">
            <span class="leaderboard-card__value-label">Impact</span>
            <strong>${escapeHtml(formatNumberSafe(entry.totalPoints))}</strong>
            <span class="detail-table__meta">${escapeHtml(
              `${formatNumberSafe(entry.reports)} reports • ${formatNumberSafe(entry.shoutouts)} kudos`
            )}</span>
          </div>
          <button type="button" class="leaderboard-card__detail-toggle" aria-expanded="false">
            Quick view
          </button>
        </div>
        <div class="leaderboard-card__details" hidden>
          <div class="leaderboard-card__detail-grid">
            <div>
              <span class="detail-table__meta">Reports escalated</span>
              <strong>${escapeHtml(formatNumberSafe(entry.reports))}</strong>
            </div>
            <div>
              <span class="detail-table__meta">Kudos logged</span>
              <strong>${escapeHtml(formatNumberSafe(entry.shoutouts))}</strong>
            </div>
            <div>
              <span class="detail-table__meta">Last activity</span>
              <strong>${escapeHtml(activityLabel)}</strong>
            </div>
          </div>
          ${chipsMarkup}
          ${lastHighlight}
        </div>
      </li>
    `;
  }

  function getDepartmentEntries(state, directorySnapshot) {
    const directory = directorySnapshot || getDirectorySnapshot(state);
    const departmentMap = directory.departmentMap || new Map();
    const userMap = directory.userMap || new Map();
    return Array.isArray(state.departmentLeaderboard)
      ? state.departmentLeaderboard
          .slice()
          .filter(Boolean)
          .map(entry => {
            const departmentId = entry.departmentId || entry.id || null;
            const department = departmentId ? departmentMap.get(departmentId) : null;
            const generatedId =
              WeldUtil && typeof WeldUtil.generateId === "function"
                ? WeldUtil.generateId("dept")
                : `department-${Date.now()}`;
            const resolvedId = departmentId || department?.id || generatedId;
            const name =
              department?.name ||
              (typeof entry.name === "string" && entry.name.trim().length > 0 ? entry.name.trim() : null) ||
              (typeof entry.department === "string" && entry.department.trim().length > 0
                ? entry.department.trim()
                : null) ||
              resolvedId;
            const ownerId = entry.ownerId || department?.ownerId || null;
            const owner = ownerId ? userMap.get(ownerId) : null;
            return {
              ...entry,
              id: resolvedId,
              departmentId: resolvedId,
              name,
              department: name,
              ownerId,
              ownerName: owner?.displayName || owner?.mail || null,
              ownerTitle: owner?.jobTitle || null,
              ownerEmail: owner?.mail || null,
              directoryDepartment: department
            };
          })
          .sort((a, b) => (Number(b?.points) || 0) - (Number(a?.points) || 0))
      : [];
  }

  function computeIndividualEntries(state, directorySnapshot) {
    const directory = directorySnapshot || getDirectorySnapshot(state);
    const baseMembers =
      Array.isArray(state.teamMembers) && state.teamMembers.length > 0
        ? state.teamMembers
        : mapDirectoryUsersToMembers(directory.users);
    const memberByEmail = new Map();
    baseMembers.forEach(member => {
      if (!member || typeof member.email !== "string") return;
      memberByEmail.set(member.email.trim().toLowerCase(), member);
    });
    const stats = new Map();
    const ensureEntry = (email, fallbackName, fallbackTitle) => {
      const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
      const key =
        normalizedEmail ||
        (WeldUtil.normalizeId && WeldUtil.normalizeId(fallbackName, "member")) ||
        (WeldUtil.generateId ? WeldUtil.generateId("member") : `member-${stats.size + 1}`);
      if (stats.has(key)) return stats.get(key);
      const member = normalizedEmail ? memberByEmail.get(normalizedEmail) : null;
      const name =
        (fallbackName && fallbackName.trim()) || member?.name || (normalizedEmail ? normalizedEmail : "Unknown teammate");
      const tone = member?.avatarTone || "indigo";
      const entry = {
        id: key,
        email: normalizedEmail || null,
        name,
        title: member?.title || fallbackTitle || "",
        specialty: member?.specialty || "",
        location: member?.location || "",
        tone,
        totalPoints: 0,
        reports: 0,
        shoutouts: 0,
        lastHighlight: "",
        lastActivity: null,
        lastSource: ""
      };
      stats.set(key, entry);
      return entry;
    };

    const messages = Array.isArray(state.messages) ? state.messages : [];
    messages.forEach(message => {
      if (!message) return;
      const entry = ensureEntry(message.reporterEmail, message.reporterName, "Reporter");
      const points =
        (Number(message.pointsOnMessage) || 0) + (Number(message.pointsOnApproval) || 0);
      entry.totalPoints += points;
      entry.reports += 1;
      updateLastActivity(entry, message.reportedAt, message.subject || "Report escalated", "Report");
    });

    const recognitions = Array.isArray(state.recognitions) ? state.recognitions : [];
    recognitions.forEach(recognition => {
      if (!recognition) return;
      const entry = ensureEntry(recognition.recipientEmail, recognition.recipientName, recognition.recipientTitle);
      entry.totalPoints += Number(recognition.points) || 0;
      entry.shoutouts += 1;
      updateLastActivity(entry, recognition.createdAt, recognition.focus || recognition.message, "Recognition");
    });
    baseMembers.forEach(member => {
      if (!member) return;
      const entry = ensureEntry(member.email, member.name, member.title);
      if (!entry.specialty && member.specialty) entry.specialty = member.specialty;
      if (!entry.location && member.location) entry.location = member.location;
      if (!entry.tone && member.avatarTone) entry.tone = member.avatarTone;
    });

    const entries = Array.from(stats.values());
    entries.sort((a, b) => {
      const pointsDiff = (b.totalPoints || 0) - (a.totalPoints || 0);
      if (pointsDiff !== 0) return pointsDiff;
      const shoutDiff = (b.shoutouts || 0) - (a.shoutouts || 0);
      if (shoutDiff !== 0) return shoutDiff;
      return (b.reports || 0) - (a.reports || 0);
    });

    const totals = entries.reduce(
      (acc, entry) => {
        acc.shoutouts += entry.shoutouts;
        acc.reports += entry.reports;
        return acc;
      },
      { shoutouts: 0, reports: 0 }
    );

    return { entries, totals };
  }

  function updateLastActivity(entry, isoDate, highlight, sourceLabel) {
    if (!isoDate) return;
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return;
    if (!entry.lastActivity || new Date(entry.lastActivity) < date) {
      entry.lastActivity = isoDate;
      entry.lastHighlight = highlight || entry.lastHighlight;
      entry.lastSource = sourceLabel;
    }
  }

  function resolveTrend(entry) {
    const rawDirection =
      typeof entry.trendDirection === "string" && entry.trendDirection.trim().length > 0
        ? entry.trendDirection.trim().toLowerCase()
        : "";
    const direction = rawDirection === "up" || rawDirection === "down" ? rawDirection : "steady";
    const trendValue =
      typeof entry.trendValue === "string" && entry.trendValue.trim().length > 0 ? entry.trendValue.trim() : "--";
    const caption =
      typeof entry.trendCaption === "string" && entry.trendCaption.trim().length > 0 ? entry.trendCaption.trim() : "";
    const label = caption ? `${trendValue} ${caption}` : trendValue;
    return { direction, value: trendValue, caption, label };
  }

  function formatNumberSafe(value) {
    if (typeof globalScope.formatNumber === "function") {
      return globalScope.formatNumber(value);
    }
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return "0";
    return numeric.toLocaleString("en-GB");
  }

  function formatPercentSafe(value) {
    if (typeof globalScope.formatPercent === "function") {
      return globalScope.formatPercent(value);
    }
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return "--";
    const percent = Math.round(numeric * 100);
    return `${percent}%`;
  }

  function formatRelativeTime(value) {
    if (!value) return "--";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (diffMs < 0) {
      return shortDateFormatter ? shortDateFormatter.format(date) : value;
    }
    const diffMinutes = Math.floor(diffMs / 60000);
    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes} min${diffMinutes === 1 ? "" : "s"} ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hr${diffHours === 1 ? "" : "s"} ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return shortDateFormatter ? shortDateFormatter.format(date) : date.toISOString().split("T")[0];
  }

  function escapeHtml(value) {
    const stringValue = value === null || value === undefined ? "" : String(value);
    if (WeldUtil && typeof WeldUtil.escapeHtml === "function") {
      return WeldUtil.escapeHtml(stringValue);
    }
    return stringValue.replace(/[&<>"']/g, char => {
      switch (char) {
        case "&":
          return "&amp;";
        case "<":
          return "&lt;";
        case ">":
          return "&gt;";
        case '"':
          return "&quot;";
        case "'":
          return "&#39;";
        default:
          return char;
      }
    });
  }

  function attachLeaderboardsEvents(container) {
    if (!container) return;
    container.addEventListener("click", event => {
      const tabButton = event.target.closest("[data-leaderboard-tab]");
      if (tabButton) {
        const tabId = tabButton.getAttribute("data-leaderboard-tab");
        if (tabId) {
          setActiveLeaderboardTab(container, tabId);
        }
        return;
      }

      const detailToggle = event.target.closest(".leaderboard-card__detail-toggle");
      if (detailToggle) {
        toggleCardDetails(detailToggle);
        return;
      }

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

  function setActiveLeaderboardTab(container, tabId) {
    const tabs = container.querySelectorAll("[data-leaderboard-tab]");
    const panels = container.querySelectorAll("[data-leaderboard-panel]");
    let matched = false;
    tabs.forEach(tab => {
      const isActive = tab.getAttribute("data-leaderboard-tab") === tabId;
      if (isActive) {
        matched = true;
      }
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", isActive ? "true" : "false");
    });
    panels.forEach(panel => {
      const isActive = panel.getAttribute("data-leaderboard-panel") === tabId;
      if (isActive) {
        panel.removeAttribute("hidden");
      } else {
        panel.setAttribute("hidden", "hidden");
      }
    });
    if (!matched && tabs.length > 0) {
      const fallback = tabs[0].getAttribute("data-leaderboard-tab");
      if (fallback) {
        setActiveLeaderboardTab(container, fallback);
      }
    }
  }

  function toggleCardDetails(toggleButton) {
    const card = toggleButton.closest(".leaderboard-card");
    if (!card) return;
    const details = card.querySelector(".leaderboard-card__details");
    if (!details) return;
    const expanded = toggleButton.getAttribute("aria-expanded") === "true";
    toggleButton.setAttribute("aria-expanded", expanded ? "false" : "true");
    if (expanded) {
      details.setAttribute("hidden", "hidden");
      card.classList.remove("leaderboard-card--expanded");
    } else {
      details.removeAttribute("hidden");
      card.classList.add("leaderboard-card--expanded");
    }
  }
})();
