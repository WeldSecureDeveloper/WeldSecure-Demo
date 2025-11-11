(function () {
  if (!window.Weld) return;

  const features = window.Weld.features || (window.Weld.features = {});
  if (features.reporterSandbox) {
    delete features.reporterSandbox;
  }

  const WeldServices = window.WeldServices || {};
  const WeldUtil = window.WeldUtil || {};
  const reporterSandboxFeature = (features.reporterSandbox = {});
  const TABS = ["focused", "other"];

  const getState = () => window.state || (window.Weld && window.Weld.state) || {};

  const escapeHtml =
    typeof WeldUtil.escapeHtml === "function"
      ? WeldUtil.escapeHtml
      : value => {
          if (value === null || value === undefined) return "";
          return String(value)
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
        };

  const formatTime = value => {
    if (!value) return "Just now";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "Just now";
    return parsed.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  };

  const formatBody = body => {
    if (!body) return `<p class="outlook-reading__placeholder">No body copy provided yet.</p>`;
    return body
      .split(/\r?\n/)
      .map(line => `<p>${escapeHtml(line)}</p>`)
      .join("");
  };

  const getSandboxSlice = state => {
    const slice = state && typeof state.reporterSandbox === "object" ? state.reporterSandbox : {};
    return {
      messages: Array.isArray(slice.messages) ? slice.messages : [],
      activeMessageId: slice.activeMessageId,
      hintsVisible: slice.hintsVisible === true,
      findings: slice.findings && typeof slice.findings === "object" ? slice.findings : {},
      submissions: Array.isArray(slice.submissions) ? slice.submissions : [],
      activeTab:
        typeof slice.activeTab === "string" && slice.activeTab.trim().toLowerCase() === "other" ? "other" : "focused"
    };
  };

  const messageTab = message => {
    const tab = typeof message?.metadata?.tab === "string" ? message.metadata.tab.trim().toLowerCase() : "";
    return tab === "other" ? "other" : "focused";
  };

  const latestSubmissionFor = (submissions, messageId) =>
    submissions.find(entry => entry && entry.messageId === messageId) || null;

  const renderAppBar = () => `
    <header class="outlook-appbar">
      <div class="outlook-appbar__brand">
        <span class="outlook-appbar__waffle">▦</span>
        <span class="outlook-appbar__logo">Outlook</span>
      </div>
      <div class="outlook-search">
        <input type="text" placeholder="Search mail and people" />
        <span aria-hidden="true">🔍</span>
      </div>
      <div class="outlook-avatar" aria-label="Reporter profile"></div>
    </header>
  `;

  const renderFolders = () => `
    <div class="outlook-panel outlook-folders">
      <div class="outlook-panel__head">Folders</div>
      <button class="outlook-folder outlook-folder--active">📥 Inbox <span class="outlook-badge">12</span></button>
      <button class="outlook-folder">⭐ Favorites</button>
      <button class="outlook-folder">📤 Sent Items</button>
      <button class="outlook-folder">🗑 Deleted Items</button>
      <button class="outlook-folder">📦 Archive</button>
      <button class="outlook-folder">📁 Projects</button>
    </div>
  `;

  const renderTabs = activeTab => `
    <div class="outlook-tabs">
      ${TABS.map(tab => {
        const normalized = tab === "other" ? "other" : "focused";
        const isActive = normalized === activeTab;
        const label = normalized === "focused" ? "Focused" : "Other";
        return `<button type="button" class="outlook-tab${isActive ? " outlook-tab--active" : ""}" data-sandbox-tab="${normalized}">
          ${label}
        </button>`;
      }).join("")}
    </div>
  `;

  const renderMessageList = (sandbox, activeMessageId) => {
    const rows = sandbox.messages.filter(message => messageTab(message) === sandbox.activeTab);
    if (rows.length === 0) {
      return `<div class="outlook-list__empty">
        <p>No messages in this tab yet. Publish another sandbox email from the designer.</p>
      </div>`;
    }
    return rows
      .map(message => {
        const isActive = message.id === activeMessageId;
        const submission = latestSubmissionFor(sandbox.submissions, message.id);
        const statusIcon = (() => {
          if (submission && submission.success) return "✅";
          if (submission) return "⚠️";
          return "⚐";
        })();
        const sender = escapeHtml(message.sender?.displayName || "Security Desk");
        const subject = escapeHtml(message.subject || "Sandbox simulation");
        const preview = escapeHtml(message.previewText || message.metadata?.excerpt || "");
        const time = formatTime(message.createdAt);
        return `
          <button type="button" class="outlook-row${isActive ? " outlook-row--active" : ""}" data-sandbox-message="${escapeHtml(
            message.id
          )}">
            <div class="outlook-row__icon">${statusIcon}</div>
            <div class="outlook-row__body">
              <div class="outlook-row__subject">${subject}</div>
              <div class="outlook-row__meta">${sender} · <span>${preview}</span></div>
            </div>
            <div class="outlook-row__time">${escapeHtml(time)}</div>
          </button>
        `;
      })
      .join("");
  };

  const renderSignalsChecklist = (message, sandbox) => {
    const selectedSignals =
      sandbox.findings && Array.isArray(sandbox.findings[message.id]) ? sandbox.findings[message.id] : [];
    if (!Array.isArray(message.signalIds) || message.signalIds.length === 0) {
      return `<p class="outlook-reading__placeholder">No signals attached to this draft.</p>`;
    }
    return message.signalIds
      .map(signalId => {
        const checked = selectedSignals.includes(signalId) ? "checked" : "";
        const label = signalId.replace(/-/g, " ");
        return `
          <label class="outlook-signal">
            <input type="checkbox" value="${escapeHtml(signalId)}" ${checked} data-sandbox-signal />
            <span>${escapeHtml(label)}</span>
          </label>
        `;
      })
      .join("");
  };

  const renderReadingPane = (sandbox, message) => {
    if (!message) {
      return `
        <div class="outlook-reading outlook-reading--empty" data-reading-pane>
          <p>Select a sandbox message to preview the email and open the Reporter add-in.</p>
        </div>
      `;
    }
    const submission = latestSubmissionFor(sandbox.submissions, message.id);
    const submissionTone =
      submission && submission.success
        ? `<div class="outlook-reading__status outlook-reading__status--success">Accurate report logged</div>`
        : submission
        ? `<div class="outlook-reading__status outlook-reading__status--warn">Missed signals — review again</div>`
        : "";
    return `
      <div class="outlook-reading" data-reading-pane>
        <div class="outlook-reading__header">
          <div>
            <div class="outlook-reading__subject">${escapeHtml(message.subject || "Sandbox simulation")}</div>
            <div class="outlook-reading__from">${escapeHtml(message.sender?.displayName || "Security Desk")} · ${escapeHtml(
      message.sender?.address || "security@weldsecure.com"
    )}</div>
          </div>
          <div class="outlook-reading__time">${escapeHtml(formatTime(message.createdAt))}</div>
        </div>
        ${submissionTone}
        <article class="outlook-reading__body${sandbox.hintsVisible ? " outlook-reading__body--hint" : ""}">
          ${formatBody(message.body)}
        </article>
        <div class="outlook-reading__actions">
          <button type="button" class="outlook-btn outlook-btn--ghost" data-sandbox-toggle="hints">
            ${sandbox.hintsVisible ? "Hide hints" : "Reveal signals"}
          </button>
          <button type="button" class="outlook-btn outlook-btn--primary" data-sandbox-action="report">
            Report via Reporter
          </button>
        </div>
        <section class="outlook-signals">
          <h3>Detection checklist</h3>
          <div class="outlook-signals__grid">
            ${renderSignalsChecklist(message, sandbox)}
          </div>
        </section>
      </div>
    `;
  };

  const renderLayout = state => {
    const sandbox = getSandboxSlice(state);
    const activeMessage = sandbox.messages.find(message => message.id === sandbox.activeMessageId) || null;
    const listMarkup = renderMessageList(sandbox, activeMessage ? activeMessage.id : null);
    const readingMarkup = renderReadingPane(sandbox, activeMessage);
    const layoutClass = `outlook-layout${activeMessage ? " outlook-layout--reading" : ""}`;
    return `
      <div class="reporter-sandbox outlook-shell">
        ${renderAppBar()}
        <div class="${layoutClass}">
          ${renderFolders()}
          <section class="outlook-mail outlook-panel">
            <div class="outlook-toolbar">
              <button class="outlook-btn">New mail</button>
              <button class="outlook-btn outlook-btn--ghost">Mark as unread</button>
              <button class="outlook-btn outlook-btn--ghost">Move to</button>
              <button class="outlook-btn outlook-btn--ghost">Sweep</button>
              <span class="outlook-toolbar__density">Display density: Comfortable ▾</span>
            </div>
            ${renderTabs(sandbox.activeTab)}
            <div class="outlook-mail__columns">
              <div class="outlook-list" data-sandbox-list>
                ${listMarkup}
              </div>
              ${readingMarkup}
            </div>
          </section>
          <aside class="outlook-reporter" data-sandbox-addin>
            <div class="reporter-sandbox__addin-empty">
              <p>Select a message to dock the Reporter add-in.</p>
            </div>
          </aside>
        </div>
      </div>
    `;
  };

  reporterSandboxFeature.template = function templateReporterSandbox(state) {
    return renderLayout(state || getState());
  };

  reporterSandboxFeature.attach = function attachReporterSandbox(container, providedState) {
    if (!container) return;
    const state = providedState || getState();
    const sandbox = getSandboxSlice(state);
    const addinTarget = container.querySelector("[data-sandbox-addin]");
    mountReporterDock(addinTarget, sandbox, state);

    container.querySelectorAll("[data-sandbox-tab]").forEach(button => {
      button.addEventListener("click", () => {
        const tab = button.getAttribute("data-sandbox-tab");
        if (WeldServices && typeof WeldServices.setSandboxTab === "function") {
          WeldServices.setSandboxTab(tab);
        }
      });
    });

    container.querySelectorAll("[data-sandbox-message]").forEach(button => {
      button.addEventListener("click", () => {
        const messageId = button.getAttribute("data-sandbox-message");
        if (WeldServices && typeof WeldServices.setActiveSandboxMessage === "function") {
          WeldServices.setActiveSandboxMessage(messageId);
        }
      });
    });

    const hintToggle = container.querySelector("[data-sandbox-toggle='hints']");
    if (hintToggle) {
      hintToggle.addEventListener("click", () => {
        if (WeldServices && typeof WeldServices.toggleSandboxHints === "function") {
          WeldServices.toggleSandboxHints();
        }
      });
    }

    const readingPane = container.querySelector("[data-reading-pane]");
    if (readingPane) {
      readingPane.querySelectorAll("input[data-sandbox-signal]").forEach(input => {
        input.addEventListener("change", () => {
          const messageId = sandbox.activeMessageId;
          if (!messageId) return;
          const selected = Array.from(readingPane.querySelectorAll("input[data-sandbox-signal]:checked")).map(el =>
            el.value.trim().toLowerCase()
          );
          if (WeldServices && typeof WeldServices.updateSandboxFindings === "function") {
            WeldServices.updateSandboxFindings(messageId, selected);
          }
        });
      });

      const reportButton = readingPane.querySelector("[data-sandbox-action='report']");
      if (reportButton) {
        reportButton.addEventListener("click", () => {
          const snapshot = getState();
          const snapshotSandbox = getSandboxSlice(snapshot);
          const activeMessage = snapshotSandbox.messages.find(message => message.id === snapshotSandbox.activeMessageId);
          mountReporterDock(addinTarget, snapshotSandbox, snapshot, activeMessage);
        });
      }
    }
  };

  function mountReporterDock(container, sandbox, state, activeMessage) {
    if (!container) return;
    const message = activeMessage || sandbox.messages.find(entry => entry.id === sandbox.activeMessageId);
    if (!message) {
      container.innerHTML = `<div class="reporter-sandbox__addin-empty"><p>Select a message to dock the Reporter add-in.</p></div>`;
      return;
    }
    const reporterFeature = features.reporter;
    if (!reporterFeature || typeof reporterFeature.render !== "function") {
      container.innerHTML = `<div class="reporter-sandbox__addin-empty"><p>Reporter add-in unavailable.</p></div>`;
      return;
    }
    reporterFeature.render(container, state, {
      sandboxContext: {
        sandboxMessageId: message.id,
        expectedSignalIds: Array.isArray(message.signalIds) ? message.signalIds : []
      }
    });
  }
})();
