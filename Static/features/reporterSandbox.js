(function () {
  if (!window.Weld) return;

  const features = window.Weld.features || (window.Weld.features = {});
  if (features.reporterSandbox) {
    delete features.reporterSandbox;
  }

  const WeldServices = window.WeldServices || {};
  const WeldUtil = window.WeldUtil || {};

  const reporterSandboxFeature = (features.reporterSandbox = {});

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

  const formatBody = body => {
    if (!body) {
      return `<p class="reporter-sandbox__empty-copy">No message content provided yet.</p>`;
    }
    return body
      .split(/\r?\n/)
      .map(line => `<p>${escapeHtml(line)}</p>`)
      .join("");
  };

  const formatDate = value => {
    if (!value) return "Just now";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "Just now";
    return parsed.toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  const getSandboxSlice = state => {
    const slice = state && typeof state.reporterSandbox === "object" ? state.reporterSandbox : {};
    return {
      messages: Array.isArray(slice.messages) ? slice.messages : [],
      activeMessageId: slice.activeMessageId,
      hintsVisible: slice.hintsVisible === true,
      findings: slice.findings && typeof slice.findings === "object" ? slice.findings : {},
      submissions: Array.isArray(slice.submissions) ? slice.submissions : []
    };
  };

  const latestSubmissionFor = (submissions, messageId) =>
    submissions.find(entry => entry && entry.messageId === messageId) || null;

  const renderMessageList = (sandbox, activeId) => {
    if (sandbox.messages.length === 0) {
      return `<div class="reporter-sandbox__list-empty"><p>No sandbox messages available yet.</p></div>`;
    }
    return sandbox.messages
      .map(message => {
        const isActive = message.id === activeId;
        const submission = latestSubmissionFor(sandbox.submissions, message.id);
        const status =
          submission && submission.success
            ? `<span class="reporter-sandbox__status reporter-sandbox__status--success">Accurate</span>`
            : submission
            ? `<span class="reporter-sandbox__status reporter-sandbox__status--retry">Review</span>`
            : `<span class="reporter-sandbox__status">Pending</span>`;
        return `
          <button type="button" class="reporter-sandbox__message ${isActive ? "reporter-sandbox__message--active" : ""}" data-sandbox-message="${escapeHtml(message.id)}">
            <div>
              <p class="reporter-sandbox__message-eyebrow">${escapeHtml(message.channel || "email")}</p>
              <strong>${escapeHtml(message.subject || "Sandbox simulation")}</strong>
              <p class="reporter-sandbox__message-preview">${escapeHtml(message.previewText || "")}</p>
            </div>
            ${status}
          </button>
        `;
      })
      .join("");
  };

  const renderSignalsChecklist = (message, sandbox, hintsVisible) => {
    const selectedSignals =
      sandbox.findings && Array.isArray(sandbox.findings[message.id]) ? sandbox.findings[message.id] : [];
    if (!Array.isArray(message.signalIds) || message.signalIds.length === 0) {
      return `<p class="reporter-sandbox__empty-copy">No signals defined for this draft.</p>`;
    }
    return message.signalIds
      .map(signalId => {
        const checked = selectedSignals.includes(signalId) ? "checked" : "";
        return `
          <label class="reporter-sandbox__signal${hintsVisible ? " reporter-sandbox__signal--hint" : ""}">
            <input type="checkbox" value="${escapeHtml(signalId)}" ${checked} data-sandbox-signal />
            <span>${escapeHtml(signalId.replace(/-/g, " "))}</span>
          </label>
        `;
      })
      .join("");
  };

  const renderViewer = (sandbox, message) => {
    if (!message) {
      return `
        <div class="reporter-sandbox__viewer-empty">
          <p>Select a sandbox message to preview the phishing email and open the Reporter dock.</p>
        </div>
      `;
    }
    const submission = latestSubmissionFor(sandbox.submissions, message.id);
    const submissionSummary = submission
      ? `<div class="reporter-sandbox__feedback ${
          submission.success ? "reporter-sandbox__feedback--success" : "reporter-sandbox__feedback--error"
        }">
          <strong>${submission.success ? "Great work" : "Keep practicing"}!</strong>
          <p>
            ${submission.success ? "You captured every expected signal." : "Review the missed signals and try again."}
          </p>
        </div>`
      : "";
    return `
      <header class="reporter-sandbox__viewer-header">
        <div>
          <p class="reporter-sandbox__viewer-eyebrow">${escapeHtml(message.sender?.displayName || "Security Desk")} &lt;${escapeHtml(
      message.sender?.address || "security@weldsecure.com"
    )}&gt;</p>
          <h1>${escapeHtml(message.subject || "Sandbox simulation")}</h1>
          <p>${escapeHtml(message.previewText || "")}</p>
        </div>
        <div class="reporter-sandbox__viewer-meta">
          <span>${escapeHtml(message.channel || "email")}</span>
          <span>${formatDate(message.createdAt)}</span>
        </div>
      </header>
      <article class="reporter-sandbox__viewer-body${sandbox.hintsVisible ? " reporter-sandbox__viewer-body--hint" : ""}">
        ${formatBody(message.body)}
      </article>
      <div class="reporter-sandbox__controls">
        <button type="button" class="button-pill button-pill--ghost" data-sandbox-toggle="hints">
          ${sandbox.hintsVisible ? "Hide hints" : "Reveal signals"}
        </button>
        <button type="button" class="button-pill button-pill--primary" data-sandbox-action="report">
          Report via Reporter
        </button>
      </div>
      ${submissionSummary}
      <section class="reporter-sandbox__signals">
        <h2>Detection checklist</h2>
        <div class="reporter-sandbox__signals-grid">
          ${renderSignalsChecklist(message, sandbox, sandbox.hintsVisible)}
        </div>
      </section>
    `;
  };

  const renderLayout = state => {
    const sandbox = getSandboxSlice(state);
    const activeMessage = sandbox.messages.find(message => message.id === sandbox.activeMessageId) || sandbox.messages[0];
    const listMarkup = renderMessageList(sandbox, activeMessage ? activeMessage.id : null);
    const viewerMarkup = renderViewer(sandbox, activeMessage);
    return `
      <div class="reporter-sandbox">
        <aside class="reporter-sandbox__list" data-sandbox-list>
          ${listMarkup}
        </aside>
        <section class="reporter-sandbox__viewer" data-sandbox-viewer>
          ${viewerMarkup}
        </section>
        <aside class="reporter-sandbox__addin" data-sandbox-addin>
          <div class="reporter-sandbox__addin-empty">
            <p>Select a message to dock the Reporter add-in.</p>
          </div>
        </aside>
      </div>
    `;
  };

  const renderTemplate = state => renderLayout(state || getState());

  reporterSandboxFeature.template = function templateReporterSandbox(state) {
    return renderTemplate(state);
  };

  reporterSandboxFeature.attach = function attachReporterSandbox(container, providedState) {
    if (!container) return;
    const state = providedState || getState();
    const sandbox = getSandboxSlice(state);
    const addinTarget = container.querySelector("[data-sandbox-addin]");
    mountReporterDock(addinTarget, sandbox, state);

    container.querySelectorAll("[data-sandbox-message]").forEach(button => {
      button.addEventListener("click", () => {
        const messageId = button.getAttribute("data-sandbox-message");
        if (WeldServices && typeof WeldServices.setActiveSandboxMessage === "function") {
          WeldServices.setActiveSandboxMessage(messageId);
        }
      });
    });

    const toggle = container.querySelector("[data-sandbox-toggle='hints']");
    if (toggle) {
      toggle.addEventListener("click", () => {
        if (WeldServices && typeof WeldServices.toggleSandboxHints === "function") {
          WeldServices.toggleSandboxHints();
        }
      });
    }

    container.querySelectorAll("input[data-sandbox-signal]").forEach(input => {
      input.addEventListener("change", () => {
        const viewer = input.closest("[data-sandbox-viewer]");
        if (!viewer) return;
        const messageId = sandbox.activeMessageId;
        if (!messageId) return;
        const selected = Array.from(viewer.querySelectorAll("input[data-sandbox-signal]:checked")).map(element =>
          element.value.trim().toLowerCase()
        );
        if (WeldServices && typeof WeldServices.updateSandboxFindings === "function") {
          WeldServices.updateSandboxFindings(messageId, selected);
        }
      });
    });

    const reportButton = container.querySelector("[data-sandbox-action='report']");
    if (reportButton) {
      reportButton.addEventListener("click", () => {
        const stateSnapshot = getState();
        const sandboxSnapshot = getSandboxSlice(stateSnapshot);
        const activeMessage = sandboxSnapshot.messages.find(message => message.id === sandboxSnapshot.activeMessageId);
        mountReporterDock(addinTarget, sandboxSnapshot, stateSnapshot, activeMessage);
      });
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
        subject: message.subject,
        previewText: message.previewText,
        body: message.body,
        expectedSignalIds: message.signalIds
      }
    });
  }
})();
