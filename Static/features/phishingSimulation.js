(function () {
  if (!window.Weld) return;

  const AppData = window.AppData || {};
  const DirectoryData = window.DirectoryData || {};
  const WeldUtil = window.WeldUtil || {};
  const WeldServices = window.WeldServices || {};
  const features = window.Weld.features || (window.Weld.features = {});
  const phishingModule = features.phishingSimulation || (features.phishingSimulation = {});

  const DEFAULT_SIM_STATE = {
    activeCampaignId: null,
    selectedDepartmentId: null,
    simLaunchQueue: [],
    lastSimFeedback: null
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

  const getCampaigns = () => {
    const campaigns = AppData.phishingSimulations?.campaigns;
    if (!Array.isArray(campaigns)) return [];
    return campaigns
      .slice()
      .sort((a, b) => {
        const aDate = new Date(a?.launchDate || 0).getTime();
        const bDate = new Date(b?.launchDate || 0).getTime();
        return bDate - aDate;
      })
      .map(campaign => ({ ...campaign }));
  };

  const getTemplates = () => {
    const templates = AppData.phishingSimulations?.templates;
    return Array.isArray(templates) ? templates : [];
  };

  const getTemplateById = id => getTemplates().find(template => template?.id === id) || null;

  const departmentsById = () => {
    const map = new Map();
    const departments = Array.isArray(DirectoryData.departments) ? DirectoryData.departments : [];
    departments.forEach(department => {
      if (!department?.id) return;
      map.set(department.id, department);
    });
    return map;
  };

  const usersById = () => {
    const map = new Map();
    const users = Array.isArray(DirectoryData.users) ? DirectoryData.users : [];
    users.forEach(user => {
      if (!user?.id) return;
      map.set(user.id, user);
    });
    return map;
  };

  const getHistoryByDepartment = departmentId => {
    const history = AppData.phishingSimulations?.historyByDepartment || {};
    const deptHistory = history[departmentId];
    return Array.isArray(deptHistory) ? deptHistory : [];
  };

  const formatPercent = (value, total) => {
    const numericValue = Number(value);
    const numericTotal = Number(total);
    if (!Number.isFinite(numericValue) || !Number.isFinite(numericTotal) || numericTotal <= 0) {
      return "0%";
    }
    return `${Math.round((numericValue / numericTotal) * 100)}%`;
  };

  const formatNumber = value =>
    WeldUtil && typeof WeldUtil.formatNumberSafe === "function"
      ? WeldUtil.formatNumberSafe(value)
      : Number(value || 0).toLocaleString("en-GB");

  const formatDate = value => {
    if (!value) return "--";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return WeldUtil && typeof WeldUtil.formatDateTimeSafe === "function"
        ? WeldUtil.formatDateTimeSafe(value)
        : String(value);
    }
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short"
    });
  };

  const escapeHtml = value =>
    WeldUtil && typeof WeldUtil.escapeHtml === "function"
      ? WeldUtil.escapeHtml(value)
      : String(value ?? "");

  const getSimState = state => {
    if (state && typeof state.phishingSimulation === "object") {
      return {
        ...DEFAULT_SIM_STATE,
        ...state.phishingSimulation,
        simLaunchQueue: Array.isArray(state.phishingSimulation.simLaunchQueue)
          ? state.phishingSimulation.simLaunchQueue.slice()
          : []
      };
    }
    return { ...DEFAULT_SIM_STATE };
  };

  const findCampaignById = (campaigns, id) => {
    if (!id) return null;
    return campaigns.find(campaign => campaign?.id === id) || null;
  };

  const resolveActiveCampaign = (campaigns, simState) => {
    if (!campaigns.length) return null;
    const target =
      findCampaignById(campaigns, simState.activeCampaignId) ||
      findCampaignById(campaigns, simState.simLaunchQueue?.[0]) ||
      campaigns[0];
    return target || campaigns[0];
  };

  const getDepartmentStats = (campaign, departmentId) => {
    const history = getHistoryByDepartment(departmentId);
    if (!history.length) return null;
    const specific = history.find(entry => entry?.campaignId === campaign?.id);
    return specific || history[0];
  };

  const renderHero = (campaigns, simState) => {
    if (!campaigns.length) {
      return `
        <section class="phish-sim__hero">
          <div class="phish-sim__empty">No campaigns configured yet.</div>
        </section>
      `;
    }
    const targetCoverage = new Set();
    let reportedSum = 0;
    let deliveredSum = 0;
    campaigns.forEach(campaign => {
      (Array.isArray(campaign.targets) ? campaign.targets : []).forEach(target =>
        targetCoverage.add(target)
      );
      const reported = Number(campaign?.engagement?.reported) || 0;
      const delivered = Number(campaign?.delivery?.delivered) || 0;
      reportedSum += reported;
      deliveredSum += delivered;
    });
    const queueCount = Array.isArray(simState.simLaunchQueue) ? simState.simLaunchQueue.length : 0;
    const avgReportRate =
      deliveredSum > 0 ? `${Math.round((reportedSum / deliveredSum) * 100)}%` : "0%";

    const metrics = [
      {
        label: "Active campaigns",
        value: formatNumber(campaigns.length),
        caption: `${formatNumber(targetCoverage.size)} departments covered`
      },
      {
        label: "Avg report rate",
        value: avgReportRate,
        caption: "Across delivered payloads"
      },
      {
        label: "Queued launches",
        value: formatNumber(queueCount),
        caption: simState.lastSimFeedback ? "Last queue event" : "No queued launches yet"
      }
    ];

    const queueCopy = simState.lastSimFeedback
      ? escapeHtml(simState.lastSimFeedback)
      : "Use “Simulate now” to stage the next launch.";

    return `
      <section class="phish-sim__hero">
        <div class="phish-sim__metrics">
          ${metrics
            .map(
              metric => `
                <article class="phish-sim__metric">
                  <span class="phish-sim__metric-label">${escapeHtml(metric.label)}</span>
                  <strong class="phish-sim__metric-value">${escapeHtml(metric.value)}</strong>
                  <p class="phish-sim__metric-caption">${escapeHtml(metric.caption)}</p>
                </article>
              `
            )
            .join("")}
        </div>
        <div class="phish-sim__queue">
          <div class="phish-sim__queue-indicator">
            <span class="phish-sim__pill" data-tone="queue">Launch queue</span>
            <strong>${formatNumber(queueCount)}</strong>
          </div>
          <p>${queueCopy}</p>
        </div>
      </section>
    `;
  };

  const renderCampaignCard = (campaign, isActive) => {
    const template = getTemplateById(campaign.templateId);
    const reported = Number(campaign?.engagement?.reported) || 0;
    const clicked = Number(campaign?.engagement?.clicked) || 0;
    const ignored = Number(campaign?.engagement?.ignored) || 0;
    const delivered = Number(campaign?.delivery?.delivered) || 0;
    const sent = Number(campaign?.delivery?.sent) || 0;

    const deliveredRate = sent ? formatPercent(delivered, sent) : "0%";
    const reportRate = delivered ? formatPercent(reported, delivered) : "0%";
    const clickRate = delivered ? formatPercent(clicked, delivered) : "0%";
    const ignoreRate = delivered ? formatPercent(ignored, delivered) : "0%";
    const owner = usersById().get(campaign.ownerId);

    return `
      <article class="phish-sim__campaign-card${
        isActive ? " phish-sim__campaign-card--active" : ""
      }" data-campaign-id="${escapeHtml(campaign.id)}">
        <header class="phish-sim__campaign-header">
          <div>
            <p class="phish-sim__eyebrow">${escapeHtml(formatDate(campaign.launchDate))}</p>
            <h3>${escapeHtml(campaign.name || "Simulation")}</h3>
          </div>
          <span class="phish-sim__pill" data-tone="vector">${escapeHtml(
            template?.vector || "Channel"
          )}</span>
        </header>
        <p class="phish-sim__campaign-meta">
          Template: <strong>${escapeHtml(template?.subject || "Custom template")}</strong>
          <span aria-hidden="true">•</span>
          Owner: <strong>${escapeHtml(owner?.displayName || campaign.ownerId || "WeldSecure Ops")}</strong>
        </p>
        <ul class="phish-sim__kpis">
          <li>
            <span>Delivery</span>
            <strong>${escapeHtml(deliveredRate)}</strong>
          </li>
          <li>
            <span>Reported</span>
            <strong>${escapeHtml(reportRate)}</strong>
          </li>
          <li>
            <span>Clicked</span>
            <strong>${escapeHtml(clickRate)}</strong>
          </li>
          <li>
            <span>Ignored</span>
            <strong>${escapeHtml(ignoreRate)}</strong>
          </li>
        </ul>
        <div class="phish-sim__actions">
          <button
            type="button"
            class="phish-sim__action"
            data-phish-action="select-campaign"
            data-campaign-id="${escapeHtml(campaign.id)}"
          >
            View departments
          </button>
          <button
            type="button"
            class="phish-sim__action phish-sim__action--primary"
            data-phish-action="simulate-campaign"
            data-campaign-id="${escapeHtml(campaign.id)}"
          >
            Simulate now
          </button>
        </div>
      </article>
    `;
  };

  const renderCampaignSection = (campaigns, activeCampaign, simState) => {
    if (!campaigns.length) {
      return `
        <section class="phish-sim__campaigns">
          <header>
            <h2>Campaign coverage</h2>
          </header>
          <div class="phish-sim__empty">No campaigns available.</div>
        </section>
      `;
    }
    const cards = campaigns
      .map(campaign => renderCampaignCard(campaign, activeCampaign?.id === campaign.id))
      .join("");
    return `
      <section class="phish-sim__campaigns">
        <header>
          <h2>Campaign coverage</h2>
          <p>${escapeHtml(
            simState.selectedDepartmentId
              ? "Drill into departments to stage the next wave."
              : "Select a campaign to review department readiness."
          )}</p>
        </header>
        <div class="phish-sim__campaign-grid">${cards}</div>
      </section>
    `;
  };

  const renderDepartmentButton = (department, departmentStats, isActive) => {
    const reportRate =
      departmentStats && typeof departmentStats.reported === "number"
        ? formatPercent(departmentStats.reported, departmentStats.reported + departmentStats.clicked)
        : "0%";
    const clickRate =
      departmentStats && typeof departmentStats.clicked === "number"
        ? formatPercent(departmentStats.clicked, departmentStats.reported + departmentStats.clicked)
        : "0%";
    return `
      <button
        type="button"
        class="phish-sim__department${isActive ? " phish-sim__department--active" : ""}"
        data-phish-action="select-department"
        data-department-id="${escapeHtml(department.id)}"
      >
        <div>
          <strong>${escapeHtml(department.name)}</strong>
          <span>${escapeHtml(department.description || "Department target")}</span>
        </div>
        <div class="phish-sim__department-metrics">
          <span class="phish-sim__department-metric" data-tone="report">Reported ${escapeHtml(
            reportRate
          )}</span>
          <span class="phish-sim__department-metric" data-tone="click">Clicked ${escapeHtml(
            clickRate
          )}</span>
        </div>
      </button>
    `;
  };

  const renderDepartmentDetail = (department, campaign, simState) => {
    if (!department) {
      return `
        <div class="phish-sim__department-detail phish-sim__empty">
          Select a targeted department to see readiness signals.
        </div>
      `;
    }
    const stats = getDepartmentStats(campaign, department.id);
    const templateHistory = getHistoryByDepartment(department.id)
      .slice(0, 3)
      .map(entry => {
        const template = getTemplateById(entry.templateId);
        const campaignName =
          findCampaignById(getCampaigns(), entry.campaignId)?.name || entry.campaignId;
        return `
          <li>
            <strong>${escapeHtml(template?.subject || "Template")}</strong>
            <span>${escapeHtml(campaignName)}</span>
            <small>${formatNumber(entry.reported || 0)} reported · ${formatNumber(
          entry.clicked || 0
        )} clicked</small>
          </li>
        `;
      })
      .join("");
    const owner = usersById().get(department.ownerId);
    return `
      <div class="phish-sim__department-detail">
        <header>
          <div>
            <p class="phish-sim__eyebrow">Department focus</p>
            <h3>${escapeHtml(department.name)}</h3>
          </div>
          <span class="phish-sim__pill">${escapeHtml(department.syncType || "Hybrid")}</span>
        </header>
        <dl class="phish-sim__detail-grid">
          <div>
            <dt>Owner</dt>
            <dd>${escapeHtml(owner?.displayName || department.ownerId || "Unassigned")}</dd>
          </div>
          <div>
            <dt>Mail alias</dt>
            <dd>${escapeHtml(department.mailNickname || department.exchangeAddress || "N/A")}</dd>
          </div>
          <div>
            <dt>Report rate</dt>
            <dd>${stats ? formatPercent(stats.reported || 0, (stats.reported || 0) + (stats.clicked || 0)) : "—"}</dd>
          </div>
          <div>
            <dt>Click rate</dt>
            <dd>${stats ? formatPercent(stats.clicked || 0, (stats.reported || 0) + (stats.clicked || 0)) : "—"}</dd>
          </div>
        </dl>
        <div class="phish-sim__history">
          <p>Template history</p>
          ${
            templateHistory
              ? `<ul>${templateHistory}</ul>`
              : "<div class=\"phish-sim__empty\">No recent simulations for this department.</div>"
          }
        </div>
        <div class="phish-sim__detail-actions">
          <button
            type="button"
            class="phish-sim__action phish-sim__action--primary"
            data-phish-action="simulate-campaign"
            data-campaign-id="${escapeHtml(campaign.id)}"
            data-target-department="${escapeHtml(department.id)}"
          >
            Simulate for ${escapeHtml(department.name)}
          </button>
          <button
            type="button"
            class="phish-sim__action"
            data-phish-action="select-campaign"
            data-campaign-id="${escapeHtml(campaign.id)}"
          >
            Switch campaign
          </button>
        </div>
      </div>
    `;
  };

  const renderDepartmentPanel = (campaign, simState) => {
    if (!campaign) {
      return `
        <section class="phish-sim__panel">
          <header>
            <h2>Department readiness</h2>
          </header>
          <div class="phish-sim__empty">Select a campaign to view targeted departments.</div>
        </section>
      `;
    }
    const map = departmentsById();
    const targets = Array.isArray(campaign.targets) ? campaign.targets : [];
    if (!targets.length) {
      return `
        <section class="phish-sim__panel">
          <header>
            <h2>Department readiness</h2>
          </header>
          <div class="phish-sim__empty">This campaign has no target departments defined.</div>
        </section>
      `;
    }
    const selectedId = targets.includes(simState.selectedDepartmentId)
      ? simState.selectedDepartmentId
      : targets[0];
    const buttons = targets
      .map(targetId => {
        const department = map.get(targetId);
        if (!department) return null;
        return renderDepartmentButton(
          department,
          getDepartmentStats(campaign, targetId),
          targetId === selectedId
        );
      })
      .filter(Boolean)
      .join("");
    const selectedDepartment = map.get(selectedId);

    return `
      <section class="phish-sim__panel">
        <header>
          <h2>Department readiness</h2>
          <p>Keep pressure on hotspots before they become incidents.</p>
        </header>
        <div class="phish-sim__department-list">${buttons}</div>
        ${renderDepartmentDetail(selectedDepartment, campaign, simState)}
      </section>
    `;
  };

  const renderInsights = (campaign, simState) => {
    const followUps = Array.isArray(campaign?.followUps) ? campaign.followUps : [];
    const followUpMarkup = followUps.length
      ? followUps
          .map(
            followUp => `
              <li class="phish-sim__follow-up">
                <strong>${escapeHtml(followUp.label || followUp.id)}</strong>
                <span>${escapeHtml(followUp.id || "")}</span>
              </li>
            `
          )
          .join("")
      : '<li class="phish-sim__empty">Add follow-up playbooks to showcase next best actions.</li>';

    const queueItems = Array.isArray(simState.simLaunchQueue) ? simState.simLaunchQueue : [];
    const campaigns = getCampaigns();
    const queueMarkup = queueItems.length
      ? queueItems
          .map(id => {
            const campaignName = findCampaignById(campaigns, id)?.name || id;
            return `<li>${escapeHtml(campaignName)}</li>`;
          })
          .join("")
      : '<li class="phish-sim__empty">No queued launches.</li>';

    return `
      <section class="phish-sim__panel phish-sim__panel--insights">
        <header>
          <h2>Playbooks & insights</h2>
        </header>
        <div class="phish-sim__insights-grid">
          <div>
            <p class="phish-sim__eyebrow">Follow-up actions</p>
            <ul class="phish-sim__follow-ups">${followUpMarkup}</ul>
          </div>
          <div>
            <p class="phish-sim__eyebrow">Launch queue</p>
            <ul class="phish-sim__queue-list">${queueMarkup}</ul>
          </div>
        </div>
      </section>
    `;
  };

  function renderView(state) {
    const campaigns = getCampaigns();
    const simState = getSimState(state);
    const activeCampaign = resolveActiveCampaign(campaigns, simState);
    return `
      <div class="phish-sim">
        ${renderHero(campaigns, simState)}
        <div class="phish-sim__layout">
          ${renderCampaignSection(campaigns, activeCampaign, simState)}
          <div class="phish-sim__side-column">
            ${renderDepartmentPanel(activeCampaign, simState)}
            ${renderInsights(activeCampaign, simState)}
          </div>
        </div>
      </div>
    `;
  }

  phishingModule.render = function render(container, appState) {
    if (!container) return;
    const state = getState(appState);
    container.innerHTML = renderView(state);
  };

  let boundContainer = null;
  let boundClickHandler = null;

  const detachListeners = () => {
    if (boundContainer && boundClickHandler) {
      boundContainer.removeEventListener("click", boundClickHandler);
    }
    boundContainer = null;
    boundClickHandler = null;
  };

  phishingModule.attach = function attach(container) {
    detachListeners();
    if (!container || typeof container.addEventListener !== "function") return;
    const handleClick = event => {
      const target = event.target && typeof event.target.closest === "function"
        ? event.target.closest("[data-phish-action]")
        : null;
      if (!target) return;
      event.preventDefault();
      const action = target.getAttribute("data-phish-action");
      const campaignId = target.getAttribute("data-campaign-id");
      if (action === "select-campaign" && WeldServices.selectPhishingCampaign) {
        WeldServices.selectPhishingCampaign(campaignId);
        return;
      }
      if (action === "simulate-campaign" && WeldServices.queuePhishingLaunch) {
        const departmentId = target.getAttribute("data-target-department");
        const options = departmentId ? { targets: [departmentId] } : undefined;
        WeldServices.queuePhishingLaunch(campaignId, options);
        return;
      }
      if (action === "select-department" && WeldServices.selectPhishingDepartment) {
        const departmentId = target.getAttribute("data-department-id");
        WeldServices.selectPhishingDepartment(departmentId);
      }
    };
    container.addEventListener("click", handleClick);
    boundContainer = container;
    boundClickHandler = handleClick;
  };

  phishingModule.destroy = function destroy() {
    detachListeners();
  };
})();
