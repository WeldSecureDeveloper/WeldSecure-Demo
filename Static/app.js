const STORAGE_KEY = "weldStaticDemoStateV1";

const ROLE_LABELS = {
  customer: { label: "Customer Journey", chip: "chip--customer" },
  client: { label: "Client Admin Journey", chip: "chip--client" },
  admin: { label: "Weld Admin Journey", chip: "chip--admin" }
};

const ROUTES = {
  landing: { requiresRole: false },
  customer: { requiresRole: "customer" },
  "client-dashboard": { requiresRole: "client" },
  "client-reporting": { requiresRole: "client" },
  "weld-admin": { requiresRole: "admin" },
  addin: { requiresRole: false }
};

const MessageStatus = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected"
};

function initialState() {
  return {
    meta: {
      role: null,
      route: "landing",
      addinScreen: "report",
      lastReportedSubject: null
    },
    customer: {
      id: 501,
      name: "Rachel Summers",
      email: "rachel.summers@example.com",
      currentPoints: 540,
      redeemedPoints: 180,
      clientId: 101
    },
    rewards: [
      {
        id: 1,
        name: "Fortnum & Mason Afternoon Tea",
        description: "Premium afternoon tea experience for two, delivered to your door.",
        pointsCost: 400,
        category: "experience",
        provider: "Fortnum & Mason",
        image: "linear-gradient(135deg, #9457ff 0%, #4e0dff 100%)",
        remaining: 6
      },
      {
        id: 2,
        name: "Selfridges Gift Card",
        description: "Digital gift card redeemable online or in-store.",
        pointsCost: 280,
        category: "voucher",
        provider: "Selfridges & Co",
        image: "linear-gradient(135deg, #ff8a80 0%, #ff416c 100%)",
        remaining: 12
      },
      {
        id: 3,
        name: "Margot & Montañez Chocolate Hamper",
        description: "Limited edition artisan chocolate selection to celebrate vigilance.",
        pointsCost: 120,
        category: "merchandise",
        provider: "Margot & Montañez",
        image: "linear-gradient(135deg, #ffbe0b 0%, #fb5607 100%)",
        remaining: 20
      },
      {
        id: 4,
        name: "Weld Champion Hoodie",
        description: "Exclusive Weld hoodie for team members leading the risk scoreboard.",
        pointsCost: 260,
        category: "merchandise",
        provider: "Weld Apparel",
        image: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)",
        remaining: 15
      }
    ],
    rewardRedemptions: [
      { id: 1, rewardId: 3, redeemedAt: "2025-09-12T09:30:00Z", status: "fulfilled" }
    ],
    reportReasons: [
      { id: 1, description: "Looks like a phishing attempt" },
      { id: 2, description: "Unexpected attachment or link" },
      { id: 3, description: "Urgent language / suspicious tone" },
      { id: 4, description: "Sender spoofing a senior colleague" },
      { id: 5, description: "Personal data request" }
    ],
    messages: [
      {
        id: 9001,
        messageId: "AAMkAGU0Zjk5ZGMyLTQ4M2UtND",
        subject: "Updated supplier bank details",
        reporterName: "Rachel Summers",
        reporterEmail: "rachel.summers@example.com",
        reportedAt: "2025-10-07T08:45:00Z",
        status: MessageStatus.APPROVED,
        reasons: [1, 3],
        pointsOnMessage: 20,
        pointsOnApproval: 80,
        additionalNotes: "Sender domain looked suspicious and the tone was urgent."
      },
      {
        id: 9002,
        messageId: "AAMkAGRjYTgzZjAtOGQ0Mi00",
        subject: "Benefits enrolment confirmation",
        reporterName: "Rachel Summers",
        reporterEmail: "rachel.summers@example.com",
        reportedAt: "2025-10-02T17:12:00Z",
        status: MessageStatus.PENDING,
        reasons: [2],
        pointsOnMessage: 20,
        pointsOnApproval: 80
      },
      {
        id: 9003,
        messageId: "AAMkAGQxZTZlNDAtZWMxOS00",
        subject: "CEO request for quick payment",
        reporterName: "Will Adams",
        reporterEmail: "will.adams@example.com",
        reportedAt: "2025-09-26T11:06:00Z",
        status: MessageStatus.APPROVED,
        reasons: [4, 5],
        pointsOnMessage: 20,
        pointsOnApproval: 80,
        additionalNotes: "Attempted to impersonate our CEO - flagged for urgency."
      }
    ],
    clients: [
      {
        id: 101,
        name: "Evergreen Capital",
        organizationId: "e3a4-uk-lon",
        pointsPerMessage: 20,
        pointsOnApproval: 80,
        activeUsers: 184,
        healthScore: 92,
        openCases: 3,
        lastReportAt: "2025-10-07T08:45:00Z"
      },
      {
        id: 102,
        name: "Harper & Black",
        organizationId: "hb-uk-lon",
        pointsPerMessage: 20,
        pointsOnApproval: 80,
        activeUsers: 82,
        healthScore: 86,
        openCases: 5,
        lastReportAt: "2025-10-06T15:20:00Z"
      },
      {
        id: 103,
        name: "Cobalt Manufacturing",
        organizationId: "cobalt-emea",
        pointsPerMessage: 20,
        pointsOnApproval: 80,
        activeUsers: 241,
        healthScore: 74,
        openCases: 9,
        lastReportAt: "2025-10-05T10:15:00Z"
      }
    ]
  };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function storageAvailable() {
  try {
    const testKey = "__weldTest";
    localStorage.setItem(testKey, "1");
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

function loadState() {
  if (!storageAvailable()) {
    return initialState();
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return initialState();
  }

  try {
    const parsed = JSON.parse(raw);
    return {
      ...initialState(),
      ...parsed,
      meta: {
        ...initialState().meta,
        ...parsed.meta
      }
    };
  } catch {
    return initialState();
  }
}

let state = loadState();

function persist() {
  if (!storageAvailable()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function navigate(route) {
  const nextRoute = ROUTES[route] ? route : "landing";
  state.meta.route = nextRoute;
  if (nextRoute === "landing") {
    state.meta.role = null;
  }
  persist();
  renderApp();
}

function setRole(role, route) {
  state.meta.role = role;
  if (route) {
    state.meta.route = route;
  }
  persist();
  renderApp();
}

function resetDemo() {
  state = initialState();
  persist();
  renderApp();
}

function rewardById(id) {
  return state.rewards.find(item => item.id === id);
}

function reasonById(id) {
  return state.reportReasons.find(item => item.id === id);
}

function redeemReward(rewardId) {
  const reward = rewardById(rewardId);
  if (!reward) return { success: false, reason: "Reward not found." };
  if (state.customer.currentPoints < reward.pointsCost) {
    return { success: false, reason: "Not enough points to redeem this reward yet." };
  }

  state.customer.currentPoints -= reward.pointsCost;
  state.customer.redeemedPoints += reward.pointsCost;
  reward.remaining = Math.max(reward.remaining - 1, 0);

  const redemption = {
    id: Date.now(),
    rewardId: reward.id,
    redeemedAt: new Date().toISOString(),
    status: "pending"
  };

  state.rewardRedemptions.unshift(redemption);
  persist();
  renderApp();

  return { success: true, redemption };
}

function reportMessage(payload) {
  const message = {
    id: Date.now(),
    messageId: payload.messageId,
    subject: payload.subject,
    reporterName: payload.reporterName,
    reporterEmail: payload.reporterEmail,
    reportedAt: new Date().toISOString(),
    status: MessageStatus.PENDING,
    reasons: payload.reasons,
    pointsOnMessage: 20,
    pointsOnApproval: 80,
    additionalNotes: payload.notes || null
  };

  state.messages.unshift(message);
  state.customer.currentPoints += message.pointsOnMessage;

  const client = state.clients.find(c => c.id === state.customer.clientId);
  if (client) {
    client.openCases += 1;
    client.healthScore = Math.min(client.healthScore + 1, 100);
    client.lastReportAt = message.reportedAt;
  }

  state.meta.addinScreen = "success";
  state.meta.lastReportedSubject = payload.subject;
  persist();
  renderApp();
}

function updateMessageStatus(messageId, status) {
  const target = state.messages.find(msg => msg.id === messageId);
  if (!target || target.status === status) return;

  target.status = status;
  if (status === MessageStatus.APPROVED) {
    state.customer.currentPoints += target.pointsOnApproval;
  }
  persist();
  renderApp();
}

function formatDateTime(iso) {
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function relativeTime(iso) {
  const target = new Date(iso);
  const diff = Date.now() - target.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;

  if (diff < minute) return "just now";
  if (diff < hour) {
    const m = Math.floor(diff / minute);
    return `${m} minute${m === 1 ? "" : "s"} ago`;
  }
  if (diff < day) {
    const h = Math.floor(diff / hour);
    return `${h} hour${h === 1 ? "" : "s"} ago`;
  }
  if (diff < week) {
    const d = Math.floor(diff / day);
    return `${d} day${d === 1 ? "" : "s"} ago`;
  }
  return target.toLocaleDateString();
}

function openDialog({ title, description, content, confirmLabel, onConfirm, cancelLabel, onCancel, tone = "primary" }) {
  const root = document.getElementById("dialog-root");
  root.innerHTML = `
    <div class="dialog-backdrop" role="dialog" aria-modal="true">
      <div class="dialog-surface">
        <header>
          <h2>${title}</h2>
          ${description ? `<p>${description}</p>` : ""}
        </header>
        <section>${content || ""}</section>
        <footer class="dialog-actions">
          ${cancelLabel ? `<button class="button-pill button-pill--ghost" data-dialog-action="cancel">${cancelLabel}</button>` : ""}
          ${confirmLabel ? `<button class="button-pill ${tone === "critical" ? "button-pill--critical" : "button-pill--primary"}" data-dialog-action="confirm">${confirmLabel}</button>` : ""}
        </footer>
      </div>
    </div>
  `;

  function close() {
    root.innerHTML = "";
    root.removeEventListener("click", handleBackdrop);
    document.removeEventListener("keydown", handleKey);
  }

  function handleBackdrop(event) {
    if (event.target === event.currentTarget) {
      if (onCancel) onCancel();
      close();
    }
  }

  function handleKey(event) {
    if (event.key === "Escape") {
      if (onCancel) onCancel();
      close();
    }
  }

  root.addEventListener("click", handleBackdrop);
  document.addEventListener("keydown", handleKey);

  const confirmBtn = root.querySelector('[data-dialog-action="confirm"]');
  const cancelBtn = root.querySelector('[data-dialog-action="cancel"]');

  if (confirmBtn) {
    confirmBtn.addEventListener("click", () => {
      if (onConfirm) onConfirm(close);
      else close();
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      if (onCancel) onCancel();
      close();
    });
  }
}

function closeDialog() {
  document.getElementById("dialog-root").innerHTML = "";
}

function renderLanding() {
  return `
    <div class="landing">
      <section class="landing__hero">
        <div>
          <span class="landing__eyebrow">Investor preview</span>
          <h1 class="landing__headline">Weld keeps human vigilance rewarding.<span>Walk through every journey in minutes.</span></h1>
          <p class="landing__lead">Select the experience you want to showcase. Each journey is fully self-contained with live-feeling interactions and updated metrics - no backend required.</p>
        </div>
        <button class="landing__addin" data-route="addin">
          <span class="landing__addin-eyebrow">Pixel-accurate</span>
          <h3>Outlook add-in</h3>
          <p>Launch the task pane experience that sparks the rewards loop.</p>
        </button>
      </section>
      <section class="landing__grid">
        ${[
          {
            title: "Customer rewards journey",
            description: "Show how employees spot suspicious emails, earn points, and redeem curated rewards.",
            tone: "linear-gradient(135deg, #6f47ff, #3623de)",
            role: "customer",
            route: "customer"
          },
          {
            title: "Client admin journey",
            description: "Demonstrate analytics, reporting cadence, and insights client security leads rely on.",
            tone: "linear-gradient(135deg, #ff8a80, #ff4d6d)",
            role: "client",
            route: "client-dashboard"
          },
          {
            title: "Weld admin journey",
            description: "Highlight how Weld curates multi-tenant success with client health signals and playbooks.",
            tone: "linear-gradient(135deg, #0ea5e9, #2563eb)",
            role: "admin",
            route: "weld-admin"
          }
        ]
          .map(
            card => `
          <button class="journey-card" style="--tone: ${card.tone}" data-role="${card.role}" data-route="${card.route}">
            <div class="chip ${card.role === "customer" ? "chip--customer" : card.role === "client" ? "chip--client" : "chip--admin"}">
              <span class="chip__dot"></span>${ROLE_LABELS[card.role].label}
            </div>
            <h3>${card.title}</h3>
            <p>${card.description}</p>
            <span class="journey-card__action">Launch journey</span>
          </button>
        `
          )
          .join("")}
      </section>
    </div>
  `;
}

function renderPointsCard(label, value, tone) {
  const backgrounds = {
    purple: "linear-gradient(135deg, #6f47ff, #3623de)",
    orange: "linear-gradient(135deg, #ff922b, #f97316)",
    slate: "linear-gradient(135deg, #1f2937, #0f172a)"
  };
  return `
    <article class="points-card" style="background:${backgrounds[tone]};">
      <span>${label}</span>
      <strong>${value}</strong>
      <p>Weld points</p>
    </article>
  `;
}

function renderCustomer() {
  const pendingApprovals = state.messages.filter(msg => msg.status === MessageStatus.PENDING).length;
  const rewardsHtml = state.rewards
    .map(
      reward => `
      <button class="reward-card" data-reward="${reward.id}">
        <div class="reward-card__artwork" style="background:${reward.image};"></div>
        <div class="reward-card__meta">
          <span>${reward.category}</span>
          <span>${reward.provider}</span>
        </div>
        <h4 class="reward-card__title">${reward.name}</h4>
        <p class="reward-card__desc">${reward.description}</p>
        <div class="reward-card__footer">
          <strong>${reward.pointsCost} pts</strong>
          <span>${reward.remaining} left</span>
        </div>
      </button>
    `
    )
    .join("");

  const recentMessages = state.messages.filter(msg => msg.reporterEmail === state.customer.email).slice(0, 3);
  const timelineItems = recentMessages
    .map(msg => {
      const reasons = msg.reasons.map(reasonById).filter(Boolean);
      return `
        <li class="timeline__item">
          <div class="timeline__status" data-state="${msg.status}">${msg.status}</div>
          <div class="timeline__details">
            <strong>${msg.subject}</strong>
            <span>${relativeTime(msg.reportedAt)}</span>
            <div class="timeline__chips">
              ${reasons.map(reason => `<span>${reason.description}</span>`).join("")}
            </div>
          </div>
          <div class="timeline__points">
            <span>+${msg.pointsOnMessage}</span>
            ${msg.status === MessageStatus.APPROVED ? `<span>+${msg.pointsOnApproval}</span>` : ""}
          </div>
        </li>
      `;
    })
    .join("");

  const rewardHistory = state.rewardRedemptions.slice(0, 5).map(entry => {
    const reward = rewardById(entry.rewardId);
    return `
      <tr>
        <td>${reward ? reward.name : "Reward"}</td>
        <td>${formatDateTime(entry.redeemedAt)}</td>
        <td>${reward ? reward.pointsCost : 0}</td>
        <td><span class="badge" data-state="${entry.status}">${entry.status}</span></td>
      </tr>
    `;
  });

  return `
    <header>
      <h1>Good day, ${state.customer.name}</h1>
      <p>Your vigilance is fuelling a safer inbox for everyone at Evergreen Capital.</p>
      <button class="button-pill button-pill--primary" id="customer-report-button">Report suspicious email</button>
    </header>
    <section class="points-strip">
      ${renderPointsCard("Available to spend", state.customer.currentPoints, "purple")}
      ${renderPointsCard("Pending approval", pendingApprovals * 80, "orange")}
      ${renderPointsCard("Already redeemed", state.customer.redeemedPoints, "slate")}
    </section>
    <section>
      <div class="section-header">
        <h2>Your rewards</h2>
        <p>Select a reward to demonstrate the instant redemption flow.</p>
      </div>
      <div class="reward-grid">${rewardsHtml}</div>
    </section>
    <section class="grid-two">
      <article class="timeline">
        <div>
          <h3>Recent reports</h3>
          <p>Fresh from the Outlook add-in.</p>
        </div>
        <ul class="timeline__list">${timelineItems}</ul>
      </article>
      <article class="card">
        <div>
          <h3>Reward history</h3>
          <p>Use this to show fulfilment states.</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Reward</th>
              <th>Redeemed</th>
              <th>Points</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>${rewardHistory.join("")}</tbody>
        </table>
      </article>
    </section>
  `;
}

function computeReportsByDay() {
  const now = new Date();
  const result = [];
  for (let i = 6; i >= 0; i -= 1) {
    const day = new Date(now);
    day.setDate(day.getDate() - i);
    const dayKey = day.toISOString().slice(0, 10);
    const count = state.messages.filter(msg => msg.reporterEmail.endsWith("@example.com") && msg.reportedAt.slice(0, 10) === dayKey).length;
    result.push({
      label: day.toLocaleDateString(undefined, { weekday: "short" }),
      value: count,
      isToday: i === 0
    });
  }
  return result;
}

function renderMetricCard(label, value, trend, tone) {
  const palette = {
    indigo: { bg: "linear-gradient(135deg, rgba(99, 102, 241, 0.18), rgba(129, 140, 248, 0.24))", color: "#312e81" },
    emerald: { bg: "linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(34, 197, 94, 0.26))", color: "#065f46" },
    amber: { bg: "linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(250, 204, 21, 0.26))", color: "#92400e" },
    slate: { bg: "linear-gradient(135deg, rgba(148, 163, 184, 0.12), rgba(100, 116, 139, 0.18))", color: "#1e293b" }
  };
  const paletteEntry = palette[tone] || palette.indigo;

  return `
    <article class="metric-card" style="background:${paletteEntry.bg}; --tone-color:${paletteEntry.color};">
      <span>${label}</span>
      <strong>${value}</strong>
      ${
        trend
          ? `<div class="metric-card__trend" data-direction="${trend.direction}">
              <span>${trend.direction === "up" ? "↑" : "↓"} ${trend.value}</span>
              <small>${trend.caption}</small>
            </div>`
          : ""
      }
    </article>
  `;
}

function renderClientDashboard() {
  const weeklyMessages = state.messages.filter(msg => msg.reporterEmail.endsWith("@example.com")).slice(0, 100);
  const approvals = weeklyMessages.filter(msg => msg.status === MessageStatus.APPROVED).length;
  const approvalRate = weeklyMessages.length ? Math.round((approvals / weeklyMessages.length) * 100) : 0;
  const topReasons = {};
  weeklyMessages.forEach(msg => {
    msg.reasons.forEach(reasonId => {
      const reason = reasonById(reasonId);
      if (!reason) return;
      topReasons[reason.description] = (topReasons[reason.description] || 0) + 1;
    });
  });
  const sortedReasons = Object.entries(topReasons)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const reportersMap = {};
  weeklyMessages.forEach(msg => {
    if (!reportersMap[msg.reporterName]) {
      reportersMap[msg.reporterName] = { count: 0, approved: 0, lastReport: msg.reportedAt };
    }
    reportersMap[msg.reporterName].count += 1;
    reportersMap[msg.reporterName].lastReport = msg.reportedAt;
    if (msg.status === MessageStatus.APPROVED) {
      reportersMap[msg.reporterName].approved += 1;
    }
  });

  const reporters = Object.entries(reportersMap).map(([name, stats]) => ({
    name,
    ...stats,
    approvalRate: stats.count ? Math.round((stats.approved / stats.count) * 100) : 0
  }));

  const reportsByDay = computeReportsByDay();

  return `
    <header>
      <h1>Evergreen Capital - security pulse</h1>
      <p>Track how your team spots threats, and spotlight the behaviour change investors care about.</p>
      <span class="chip chip--client">Updated ${relativeTime(weeklyMessages[0]?.reportedAt || new Date().toISOString())}</span>
    </header>
    <section class="metrics-grid">
      ${renderMetricCard("Reports this week", weeklyMessages.length.toString(), { direction: "up", value: "12%", caption: "vs last week" }, "indigo")}
      ${renderMetricCard("Approval rate", `${approvalRate}%`, { direction: "up", value: "4 pts", caption: "month on month" }, "emerald")}
      ${renderMetricCard("Median review time", "2h 14m", { direction: "down", value: "18 mins", caption: "faster than target" }, "amber")}
      ${renderMetricCard("Active champions", "38", { direction: "up", value: "5 new", caption: "this month" }, "slate")}
    </section>
    <section class="grid-two">
      <article class="panel">
        <div>
          <h2>Report momentum</h2>
          <p>Showcase consistent employee engagement by day of week.</p>
        </div>
        <div class="bar-chart">
          ${reportsByDay
            .map(
              bar => `
                <div class="bar-chart__item">
                  <div class="bar-chart__bar" data-highlight="${bar.isToday}" style="height:${bar.value === 0 ? 8 : 30 + bar.value * 22}px;"></div>
                  <span class="bar-chart__label">${bar.label}</span>
                  <span class="bar-chart__value">${bar.value}</span>
                </div>
              `
            )
            .join("")}
        </div>
      </article>
      <article class="panel">
        <div>
          <h2>Top threat signals</h2>
          <p>Investors like hearing why people reported messages.</p>
        </div>
        <ul class="timeline__list">
          ${sortedReasons
            .map(
              reason => `
                <li class="timeline__item" style="grid-template-columns: 1fr auto;">
                  <div>${reason.label}</div>
                  <strong>${reason.value}</strong>
                </li>
              `
            )
            .join("")}
        </ul>
      </article>
    </section>
    <article class="panel">
      <div>
        <h2>Team champions</h2>
        <p>Use this leaderboard to highlight culture change.</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>Team member</th>
            <th>Reports</th>
            <th>Approved</th>
            <th>Approval rate</th>
            <th>Last activity</th>
          </tr>
        </thead>
        <tbody>
          ${reporters
            .map(
              reporter => `
                <tr>
                  <td>${reporter.name}</td>
                  <td>${reporter.count}</td>
                  <td>${reporter.approved}</td>
                  <td>${reporter.approvalRate}%</td>
                  <td>${relativeTime(reporter.lastReport)}</td>
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>
    </article>
  `;
}

function renderClientReporting() {
  const tableRows = state.messages.slice(0, 20).map(
    msg => `
      <tr>
        <td>${formatDateTime(msg.reportedAt)}</td>
        <td>
          <strong>${msg.subject}</strong>
          <div class="timeline__chips"><span>${msg.messageId}</span></div>
        </td>
        <td>
          ${msg.reporterName}
          <div class="timeline__chips"><span>${msg.reporterEmail}</span></div>
        </td>
        <td>
          <div class="timeline__chips">
            ${msg.reasons
              .map(reasonById)
              .filter(Boolean)
              .map(reason => `<span>${reason.description}</span>`)
              .join("")}
          </div>
        </td>
        <td><span class="badge" data-state="${msg.status}">${msg.status}</span></td>
        <td>
          <div class="table-actions">
            <button data-action="approve" data-message="${msg.id}">Approve</button>
            <button data-action="reject" data-message="${msg.id}">Reject</button>
          </div>
        </td>
      </tr>
    `
  );

  return `
    <header>
      <h1>Reporting & export</h1>
      <p>Filter every reported email, approve them live, and download a CSV that investors can see in action.</p>
      <button class="button-pill button-pill--primary" id="download-csv-button">Download CSV</button>
    </header>
    <article class="panel">
      <table>
        <thead>
          <tr>
            <th>Reported</th>
            <th>Subject</th>
            <th>Reporter</th>
            <th>Reasons</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>${tableRows.join("")}</tbody>
      </table>
    </article>
    <div class="note">
      <strong>Demo guidance</strong>
      <p>
        Remind investors that approvals feed the customer rewards experience in real time - best seen by switching tabs after approving a message.
      </p>
    </div>
  `;
}

function renderWeldAdmin() {
  const clientCards = state.clients
    .map(
      client => `
        <article class="client-card">
          <div>
            <span class="landing__addin-eyebrow">Client</span>
            <h2>${client.name}</h2>
            <p>Org ID: ${client.organizationId}</p>
          </div>
          <div class="client-card__stats">
            <div>
              <label>Health score</label>
              <span>${client.healthScore}%</span>
            </div>
            <div>
              <label>Open cases</label>
              <span>${client.openCases}</span>
            </div>
            <div>
              <label>Active users</label>
              <span>${client.activeUsers}</span>
            </div>
          </div>
          <footer>
            <div>
              <label>Last reported email</label>
              <strong>${formatDateTime(client.lastReportAt)}</strong>
              <span class="landing__addin-eyebrow">${relativeTime(client.lastReportAt)}</span>
            </div>
            <div class="table-actions">
              <button data-client="${client.id}" data-action="view-journey">View journey</button>
              <button data-client="${client.id}" data-action="share-insights">Share insights</button>
            </div>
          </footer>
        </article>
      `
    )
    .join("");

  return `
    <header>
      <h1>Weld studio - multi-tenant view</h1>
      <p>Use this vantage point to share how Weld scales across clients while spotting where to lean in.</p>
      <button class="button-pill button-pill--primary" id="trigger-playbook">Trigger playbook</button>
    </header>
    <section class="metrics-grid">
      ${renderMetricCard("Active clients", state.clients.length.toString(), { direction: "up", value: "2 onboarded", caption: "last month" }, "indigo")}
      ${renderMetricCard(
        "Average health",
        `${Math.round(state.clients.reduce((acc, client) => acc + client.healthScore, 0) / state.clients.length)}%`,
        { direction: "up", value: "+6 pts", caption: "quarter to date" },
        "emerald"
      )}
      ${renderMetricCard(
        "Open cases",
        state.clients.reduce((acc, client) => acc + client.openCases, 0).toString(),
        { direction: "down", value: "-3", caption: "since Monday" },
        "amber"
      )}
    </section>
    <section class="clients-grid">${clientCards}</section>
    <section class="playbook-card">
      <div>
        <strong>Multi-tenant narrative</strong>
        <p>Investors want confidence Weld scales easily. Use these cards to show targeted interventions based on engagement health.</p>
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

function renderAddIn() {
  const screen = state.meta.addinScreen;
  const reportForm = `
    <div class="addin-body">
      <div class="addin-strip">
        <div>
          <span>Available points</span>
          <strong>${state.customer.currentPoints}</strong>
        </div>
        <div>
          <span>Pending approval</span>
          <strong>${state.messages.filter(msg => msg.status === MessageStatus.PENDING).length * 80}</strong>
        </div>
      </div>
      <label class="addin-field">
        Email subject
        <input type="text" id="addin-subject" value="Purchase authorisation needed" />
      </label>
      <label class="addin-field">
        Message ID
        <input type="text" id="addin-message-id" value="AAMkAGY1OTNhYzRjLTk2MTEtNDdmOS04YTVlLTNjZjFjZjdiOTY3OABGAAAAAAAowR" />
        <small>This links the report to Microsoft Defender for full analysis.</small>
      </label>
      <div class="addin-field">
        <span>Why are you reporting this?</span>
        <div class="addin-checkbox-list">
          ${state.reportReasons
            .map(
              reason => `
                <label>
                  <input type="checkbox" value="${reason.id}" />
                  <span>${reason.description}</span>
                </label>
              `
            )
            .join("")}
        </div>
      </div>
      <label class="addin-field">
        Anything else we should know?
        <textarea rows="3" id="addin-notes" placeholder="Optional context for your security reviewers."></textarea>
      </label>
      <button class="addin-primary" id="addin-submit">Send to Weld</button>
    </div>
  `;

  const successView = `
    <div class="addin-success">
      <div class="chip chip--customer"><span class="chip__dot"></span>Great catch</div>
      <h2>Thanks for looking out!</h2>
      <p>Security will review "${state.meta.lastReportedSubject || "your message"}" shortly. Points land immediately.</p>
      <div class="addin-actions">
        <button id="addin-report-another">Report another email</button>
        <button id="addin-view-rewards">View my rewards</button>
      </div>
    </div>
  `;

  return `
    <div class="addin-page">
      <div class="addin-shell">
        <header class="addin-header">
          <div class="addin-logo">W</div>
          <div>
            <h1>Report with Weld</h1>
            <p>Flag anything suspicious, earn recognition, and protect your team.</p>
          </div>
          <div class="addin-status">
            <span>Signed in</span>
            <strong>${state.customer.name}</strong>
          </div>
        </header>
        ${screen === "report" ? reportForm : successView}
      </div>
    </div>
  `;
}

function renderHeader() {
  if (state.meta.route === "landing") {
    return "";
  }
  const role = state.meta.role;
  return `
    <header class="header">
      <button class="brand" id="brand-button">
        <span class="brand__glyph">◇</span>
        <span>Weld</span>
        <span class="brand__descriptor">Security Intelligence Studio</span>
      </button>
      <div class="header__actions">
        ${
          role
            ? `<span class="chip ${ROLE_LABELS[role].chip}"><span class="chip__dot"></span>${ROLE_LABELS[role].label}</span>`
            : ""
        }
        <button class="button-pill button-pill--ghost" id="reset-demo">Reset demo data</button>
        <button class="button-pill button-pill--primary" id="journey-picker">Journey picker</button>
      </div>
    </header>
  `;
}

function renderSidebar() {
  if (!state.meta.role) {
    return `
      <aside class="sidebar">
        <div class="card">
          <p>Please choose a journey to begin.</p>
        </div>
      </aside>
    `;
  }

  const links = [];
  if (state.meta.role === "customer") {
    links.push({ route: "customer", label: "Customer rewards" });
  }
  if (state.meta.role === "client") {
    links.push({ route: "client-dashboard", label: "Client admin dashboard" });
    links.push({ route: "client-reporting", label: "Client admin reporting" });
  }
  if (state.meta.role === "admin") {
    links.push({ route: "weld-admin", label: "Weld admin clients" });
  }

  const navLinks = links
    .map(
      link => `
        <button class="sidebar__link ${state.meta.route === link.route ? "sidebar__link--active" : ""}" data-route="${link.route}">
          ${link.label}
        </button>
      `
    )
    .join("");

  return `
    <aside class="sidebar">
      <nav class="sidebar__nav">${navLinks}</nav>
      <a class="sidebar__addin" data-route="addin">
        <span class="sidebar__addin-eyebrow">Also in this demo</span>
        <h4>Outlook add-in</h4>
        <p>Open the task pane experience that seeded the customer journey.</p>
      </a>
    </aside>
  `;
}

function renderContent() {
  switch (state.meta.route) {
    case "customer":
      return renderCustomer();
    case "client-dashboard":
      return renderClientDashboard();
    case "client-reporting":
      return renderClientReporting();
    case "weld-admin":
      return renderWeldAdmin();
    default:
      return "";
  }
}

function attachLandingEvents(container) {
  container.querySelectorAll("[data-route]").forEach(btn => {
    btn.addEventListener("click", () => {
      const route = btn.getAttribute("data-route");
      const role = btn.getAttribute("data-role");
      if (route === "addin") {
        state.meta.addinScreen = "report";
        navigate("addin");
        return;
      }
      if (role) {
        setRole(role, route);
      } else {
        navigate(route);
      }
    });
  });
}

function attachHeaderEvents(container) {
  const brandBtn = container.querySelector("#brand-button");
  if (brandBtn) {
    brandBtn.addEventListener("click", () => navigate("landing"));
  }
  const resetBtn = container.querySelector("#reset-demo");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      openDialog({
        title: "Reset demo data?",
        description: "This will return every journey to the starting investor narrative.",
        confirmLabel: "Reset now",
        cancelLabel: "Cancel",
        tone: "critical",
        onConfirm: close => {
          resetDemo();
          close();
        }
      });
    });
  }
  const pickerBtn = container.querySelector("#journey-picker");
  if (pickerBtn) {
    pickerBtn.addEventListener("click", () => navigate("landing"));
  }
}

function attachSidebarEvents(container) {
  container.querySelectorAll("[data-route]").forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();
      const route = link.getAttribute("data-route");
      if (route === "addin") {
        state.meta.addinScreen = "report";
        navigate("addin");
      } else {
        navigate(route);
      }
    });
  });
}

function attachCustomerEvents(container) {
  const reportBtn = container.querySelector("#customer-report-button");
  if (reportBtn) {
    reportBtn.addEventListener("click", () => {
      state.meta.addinScreen = "report";
      navigate("addin");
    });
  }
  container.querySelectorAll(".reward-card").forEach(card => {
    card.addEventListener("click", () => {
      const rewardId = Number(card.getAttribute("data-reward"));
      const reward = rewardById(rewardId);
      if (!reward) return;

      openDialog({
        title: "Redeem this reward?",
        description: `This will use ${reward.pointsCost} of your available points.`,
        content: `<strong>${reward.name}</strong><p>${reward.description}</p><span>${reward.provider}</span>`,
        confirmLabel: "Confirm redemption",
        cancelLabel: "Cancel",
        onConfirm: close => {
          const result = redeemReward(rewardId);
          close();
          if (result.success) {
            openDialog({
              title: "Reward queued for fulfilment",
              description: `${reward.name} has been added to your rewards queue.`,
              confirmLabel: "Back to rewards",
              onConfirm: closeDialog
            });
          } else {
            openDialog({
              title: "Unable to redeem",
              description: result.reason || "Please try again.",
              confirmLabel: "Close"
            });
          }
        }
      });
    });
  });
}

function attachReportingEvents(container) {
  const csvBtn = container.querySelector("#download-csv-button");
  if (csvBtn) {
    csvBtn.addEventListener("click", () => {
      openDialog({
        title: "CSV export ready",
        description: "In the real product this downloads a CSV. For the demo, use this cue to talk through the audit trail.",
        confirmLabel: "Got it"
      });
    });
  }
  container.querySelectorAll(".table-actions button").forEach(button => {
    button.addEventListener("click", () => {
      const action = button.getAttribute("data-action");
      const messageId = Number(button.getAttribute("data-message"));
      updateMessageStatus(messageId, action === "approve" ? MessageStatus.APPROVED : MessageStatus.REJECTED);
    });
  });
}

function attachAdminEvents(container) {
  const triggerBtn = container.querySelector("#trigger-playbook");
  if (triggerBtn) {
    triggerBtn.addEventListener("click", () => {
      openDialog({
        title: "Playbook scheduled",
        description: "Use this cue to explain how Weld orchestrates interventions across tenants.",
        confirmLabel: "Nice"
      });
    });
  }

  container.querySelectorAll("[data-action='view-journey'], [data-action='share-insights']").forEach(button => {
    button.addEventListener("click", () => {
      const clientId = Number(button.getAttribute("data-client"));
      const client = state.clients.find(c => c.id === clientId);
      if (!client) return;
      if (button.getAttribute("data-action") === "view-journey") {
        openDialog({
          title: `Switch to ${client.name}?`,
          description: "For the demo, remind investors each client gets a dedicated journey view with custom insights.",
          confirmLabel: "Return",
          onConfirm: closeDialog
        });
      } else {
        openDialog({
          title: "Insights shared",
          description: `Customer Success receives a packaged summary for ${client.name}.`,
          confirmLabel: "Great"
        });
      }
    });
  });
}

function attachAddInEvents(container) {
  if (state.meta.addinScreen === "report") {
    const submitBtn = container.querySelector("#addin-submit");
    if (submitBtn) {
      submitBtn.addEventListener("click", () => {
        const subjectInput = container.querySelector("#addin-subject");
        const messageIdInput = container.querySelector("#addin-message-id");
        const notesInput = container.querySelector("#addin-notes");
        const reasonCheckboxes = Array.from(container.querySelectorAll('.addin-checkbox-list input[type="checkbox"]'))
          .filter(input => input.checked)
          .map(input => Number(input.value));

        if (!subjectInput.value.trim()) {
          openDialog({
            title: "Subject required",
            description: "Add a subject so security can identify the message.",
            confirmLabel: "Close"
          });
          return;
        }
        if (reasonCheckboxes.length === 0) {
          openDialog({
            title: "Select at least one reason",
            description: "This helps reviewers triage the report quickly.",
            confirmLabel: "Close"
          });
          return;
        }

        reportMessage({
          subject: subjectInput.value.trim(),
          messageId: messageIdInput.value.trim() || "MESSAGE-ID",
          reasons: reasonCheckboxes,
          reporterName: state.customer.name,
          reporterEmail: state.customer.email,
          notes: notesInput.value.trim()
        });
      });
    }
  } else {
    const reportAnother = container.querySelector("#addin-report-another");
    if (reportAnother) {
      reportAnother.addEventListener("click", () => {
        state.meta.addinScreen = "report";
        persist();
        renderApp();
      });
    }
    const viewRewards = container.querySelector("#addin-view-rewards");
    if (viewRewards) {
      viewRewards.addEventListener("click", () => {
        setRole("customer", "customer");
      });
    }
  }
}

function ensureRouteSafety() {
  const routeInfo = ROUTES[state.meta.route];
  if (!routeInfo) {
    state.meta.route = "landing";
    state.meta.role = null;
  } else if (routeInfo.requiresRole && state.meta.role !== routeInfo.requiresRole) {
    state.meta.route = "landing";
    state.meta.role = null;
  }
}

function renderApp() {
  ensureRouteSafety();
  const app = document.getElementById("app");
  const route = state.meta.route;

  if (route === "landing") {
    app.innerHTML = `
      <div class="page page--landing">
        ${renderLanding()}
      </div>
    `;
    attachLandingEvents(app);
    return;
  }

  if (route === "addin") {
    app.innerHTML = renderAddIn();
    attachAddInEvents(app);
    return;
  }

  app.innerHTML = `
    <div class="page">
      ${renderHeader()}
      <div class="page__inner">
        ${renderSidebar()}
        <main class="layout-content" id="main-content">${renderContent()}</main>
      </div>
    </div>
  `;

  attachHeaderEvents(app);
  const sidebar = app.querySelector(".sidebar");
  if (sidebar) attachSidebarEvents(sidebar);

  const mainContent = app.querySelector("#main-content");
  if (!mainContent) return;
  if (route === "customer") attachCustomerEvents(mainContent);
  if (route === "client-reporting") attachReportingEvents(mainContent);
  if (route === "weld-admin") attachAdminEvents(mainContent);
}

window.addEventListener("DOMContentLoaded", () => {
  renderApp();
});

window.addEventListener("hashchange", () => {
  const hashRoute = window.location.hash.replace("#", "");
  if (hashRoute && ROUTES[hashRoute]) {
    if (ROUTES[hashRoute].requiresRole) {
      state.meta.role = ROUTES[hashRoute].requiresRole;
    }
    state.meta.route = hashRoute;
    persist();
    renderApp();
  }
});
