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

  const formatTime = value => {
    if (!value) return "Just now";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "Just now";
    return parsed.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  };

  const formatFullDate = value => {
    if (!value) return "Date unknown";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "Date unknown";
    return parsed.toLocaleString("en-GB", {
      weekday: "long",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const placeholderIcon = (variant, color = "#ffffff") => {
    const stroke = color;
    switch (variant) {
      case "waffle":
        return `
          <svg viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false">
            ${[4, 10, 16]
              .map(
                x =>
                  [4, 10, 16]
                    .map(
                      y => `<circle cx="${x}" cy="${y}" r="1.2" fill="${color}" opacity="0.9" />`
                    )
                    .join("")
              )
              .join("")}
          </svg>
        `;
      case "menu":
        return `
          <svg viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false">
            <path d="M4 7h16M4 12h14M4 17h10" stroke="${stroke}" stroke-width="1.8" stroke-linecap="round" />
          </svg>
        `;
      case "folder":
        return `
          <svg viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false">
            <path d="M4 9h16a1.5 1.5 0 0 1 1.5 1.5v7a2.5 2.5 0 0 1-2.5 2.5H6A2.5 2.5 0 0 1 3.5 17V8A2 2 0 0 1 5.5 6h4l2 2H20" stroke="${stroke}" stroke-width="1.6" fill="none" stroke-linejoin="round" />
          </svg>
        `;
      case "shield":
        return `
          <svg viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false">
            <path d="M12 4l7 3v5.5c0 4.3-3.1 8-7 8.5-3.9-.5-7-4.2-7-8.5V7z" stroke="${stroke}" stroke-width="1.6" fill="none" stroke-linejoin="round" />
          </svg>
        `;
      case "spark":
        return `
          <svg viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false">
            <circle cx="8" cy="8" r="3" fill="${color}" />
            <circle cx="16" cy="8" r="2" fill="${color}" opacity="0.8" />
            <circle cx="9" cy="16" r="2.2" fill="${color}" opacity="0.7" />
            <circle cx="16" cy="16" r="3" fill="${color}" opacity="0.9" />
          </svg>
        `;
      case "search":
        return `
          <svg viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false">
            <circle cx="11" cy="11" r="6" stroke="${stroke}" stroke-width="1.8" fill="none" />
            <path d="M15.5 15.5L20 20" stroke="${stroke}" stroke-width="1.8" stroke-linecap="round" />
          </svg>
        `;
      case "settings":
        return `
          <svg viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false">
            <circle cx="12" cy="12" r="4.2" stroke="${stroke}" stroke-width="1.6" fill="none" />
            <path d="M12 4v2.2M12 17.8V20M4 12h2.2M17.8 12H20M6.5 6.5l1.6 1.6M15.9 15.9l1.6 1.6M6.5 17.5l1.6-1.6M15.9 8.1l1.6-1.6" stroke="${stroke}" stroke-width="1.4" stroke-linecap="round" />
          </svg>
        `;
      case "help":
        return `
          <svg viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false">
            <circle cx="12" cy="12" r="8" stroke="${stroke}" stroke-width="1.6" fill="none" />
            <path d="M9.8 9a2.2 2.2 0 0 1 4.4 0c0 1.8-2.2 2-2.2 3.6" stroke="${stroke}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none" />
            <circle cx="12" cy="17" r="0.9" fill="${stroke}" />
          </svg>
        `;
      case "compose":
        return `
          <svg viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false">
            <path d="M5 19l3.8-.7 9.4-9.4a1.5 1.5 0 0 0 0-2.1l-1.4-1.4a1.5 1.5 0 0 0-2.1 0L5.7 14.8 5 19z" stroke="${stroke}" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M12.3 7.7l3 3" stroke="${stroke}" stroke-width="1.6" stroke-linecap="round" />
          </svg>
        `;
      case "ignore":
        return `
          <svg viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false">
            <circle cx="12" cy="12" r="7" stroke="${stroke}" stroke-width="1.7" fill="none" />
            <path d="M7 17l10-10" stroke="${stroke}" stroke-width="1.7" stroke-linecap="round" />
          </svg>
        `;
      case "block":
        return `
          <svg viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false">
            <path d="M12 4l7 3v5.5c0 4.3-3.1 8-7 8.5-3.9-.5-7-4.2-7-8.5V7z" stroke="${stroke}" stroke-width="1.6" fill="none" stroke-linejoin="round" />
            <path d="M9 9l6 6m0-6-6 6" stroke="${stroke}" stroke-width="1.6" stroke-linecap="round" />
          </svg>
        `;
      case "delete":
        return `
          <svg viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false">
            <path d="M9 6h6l.8 1.5H20" stroke="${stroke}" stroke-width="1.6" stroke-linecap="round" />
            <path d="M8 9v8.5A1.5 1.5 0 0 0 9.5 19h5a1.5 1.5 0 0 0 1.5-1.5V9" stroke="${stroke}" stroke-width="1.6" fill="none" />
            <path d="M10.5 11.5v5m3-5v5" stroke="${stroke}" stroke-width="1.6" stroke-linecap="round" />
          </svg>
        `;
      case "archive":
        return `
          <svg viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false">
            <rect x="5" y="5" width="14" height="5" rx="1.2" stroke="${stroke}" stroke-width="1.6" fill="none" />
            <path d="M7 10v7.5A1.5 1.5 0 0 0 8.5 19h7a1.5 1.5 0 0 0 1.5-1.5V10" stroke="${stroke}" stroke-width="1.6" fill="none" />
            <path d="M10 13.5h4" stroke="${stroke}" stroke-width="1.6" stroke-linecap="round" />
          </svg>
        `;
      case "report":
        return `
          <svg viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false">
            <path d="M12 4l9 16H3z" stroke="${stroke}" stroke-width="1.6" fill="none" stroke-linejoin="round" />
            <path d="M12 10v4.5" stroke="${stroke}" stroke-width="1.6" stroke-linecap="round" />
            <circle cx="12" cy="17.5" r="0.8" fill="${stroke}" />
          </svg>
        `;
      case "panes":
        return `
          <svg viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false">
            <rect x="4.5" y="6" width="6.5" height="12" rx="1.2" stroke="${stroke}" stroke-width="1.6" fill="none" />
            <rect x="13" y="6" width="6.5" height="12" rx="1.2" stroke="${stroke}" stroke-width="1.6" fill="none" />
          </svg>
        `;
      case "layout":
        return `
          <svg viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false">
            <rect x="4.5" y="5" width="15" height="14" rx="1.6" stroke="${stroke}" stroke-width="1.6" fill="none" />
            <path d="M4.5 10.5h15" stroke="${stroke}" stroke-width="1.4" stroke-linecap="round" />
            <path d="M12 5v14" stroke="${stroke}" stroke-width="1.4" stroke-linecap="round" />
          </svg>
        `;
      case "rows":
        return `
          <svg viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false">
            <path d="M5 7h14M5 12h14M5 17h10" stroke="${stroke}" stroke-width="1.6" stroke-linecap="round" />
          </svg>
        `;
      case "filter":
        return `
          <svg viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false">
            <path d="M5 6h14l-5.5 6.5v4.5l-3 1.5V12.5z" stroke="${stroke}" stroke-width="1.6" fill="none" stroke-linejoin="round" />
          </svg>
        `;
      case "refresh":
        return `
          <svg viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false">
            <path d="M5.5 7.5A7 7 0 0 1 18 8.2" stroke="${stroke}" stroke-width="1.6" fill="none" stroke-linecap="round" />
            <path d="M18 8.2V4.5m0 0-2.5 2.2" stroke="${stroke}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M18.5 16.5A7 7 0 0 1 6 15.8" stroke="${stroke}" stroke-width="1.6" fill="none" stroke-linecap="round" />
            <path d="M6 15.8V19.5m0 0 2.5-2.2" stroke="${stroke}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        `;
      case "undo":
        return `
          <svg viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false">
            <path d="M8 7L4.5 10.5 8 14" stroke="${stroke}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none" />
            <path d="M5 10.5h7a5 5 0 0 1 5 5V17" stroke="${stroke}" stroke-width="1.6" stroke-linecap="round" fill="none" />
          </svg>
        `;
      case "redo":
        return `
          <svg viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false">
            <path d="M16 7l3.5 3.5L16 14" stroke="${stroke}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none" />
            <path d="M19 10.5h-7a5 5 0 0 0-5 5V17" stroke="${stroke}" stroke-width="1.6" stroke-linecap="round" fill="none" />
          </svg>
        `;
      default:
        return "";
    }
  };

  const fluentColorIcon = relativePath =>
    `https://raw.githubusercontent.com/microsoft/fluentui-system-icons/main/${relativePath}`;

  const fluentSvgIcon = fileName => `svg/fluent/${fileName}`;
  const fluentIconImg = fileName =>
    `<img src="${fluentSvgIcon(fileName)}" alt="" class="icon-img" loading="lazy" decoding="async" />`;

  const messagePreview = message => {
    if (!message) return "";
    if (typeof message.previewText === "string" && message.previewText.trim().length > 0) {
      return message.previewText.trim();
    }
    if (typeof message.body === "string" && message.body.trim().length > 0) {
      const firstLine = message.body.split(/\r?\n/).find(line => line.trim().length > 0);
      return firstLine ? firstLine.trim() : "";
    }
    return "";
  };

  const formatBody = body => {
    if (!body) return '<p class="sandbox-reading__placeholder">No body copy provided yet.</p>';
    return body
      .split(/\r?\n/)
      .map(line => `<p>${escapeHtml(line)}</p>`)
      .join("");
  };

  const getSandboxSlice = state => {
    const slice = state && typeof state.reporterSandbox === "object" ? state.reporterSandbox : {};
    const layoutSource = slice.layout && typeof slice.layout === "object" ? slice.layout : {};
    return {
      messages: Array.isArray(slice.messages) ? slice.messages : [],
      activeMessageId: slice.activeMessageId,
      hintsVisible: slice.hintsVisible === true,
      findings: slice.findings && typeof slice.findings === "object" ? slice.findings : {},
      submissions: Array.isArray(slice.submissions) ? slice.submissions : [],
      selectedUserId: typeof slice.selectedUserId === "string" && slice.selectedUserId.trim().length > 0 ? slice.selectedUserId.trim() : null,
      layout: {
        compactRows: layoutSource.compactRows === true,
        showSnippets: layoutSource.showSnippets !== false,
        highlightReading: layoutSource.highlightReading !== false
      }
    };
  };

  const getDirectorySnapshot = state => {
    const directory = state && state.directory && typeof state.directory === "object" ? state.directory : {};
    const departments = Array.isArray(directory.departments) ? directory.departments : [];
    const users = Array.isArray(directory.users) ? directory.users : [];
    return { departments, users };
  };

  const initialsFor = name => {
    if (!name || typeof name !== "string") return "--";
    const parts = name.trim().split(/\s+/);
    return parts
      .slice(0, 2)
      .map(part => part.charAt(0))
      .join("")
      .toUpperCase();
  };

  const resolveIdentity = (state, sandbox) => {
    const directory = getDirectorySnapshot(state);
    const selected =
      directory.users.find(user => user && user.id === sandbox.selectedUserId) || directory.users[0] || null;
    const department = selected
      ? directory.departments.find(dep => dep && dep.id === selected.departmentId)
      : null;
    const fallbackName =
      (state.customer && state.customer.name) || (state.meta && state.meta.currentUser) || "Sandbox User";
    const fallbackRole = (state.customer && state.customer.title) || "Security Analyst";
    return {
      id: selected ? selected.id : null,
      name: selected ? selected.displayName : fallbackName,
      role: selected ? selected.jobTitle || "Team member" : fallbackRole,
      department: selected ? department?.name || "Cross-functional" : department?.name || "Cross-functional",
      email: selected ? selected.mail || selected.userPrincipalName || "" : state.customer?.email || "",
      location: selected ? selected.officeLocation || "Hybrid" : "Hybrid",
      initials: initialsFor(selected ? selected.displayName : fallbackName),
      hasDirectoryUsers: directory.users.length > 0,
      directory,
      selectedUser: selected
    };
  };

  const latestSubmissionFor = (submissions, messageId) =>
    submissions.find(entry => entry && entry.messageId === messageId) || null;

  const groupMessages = messages => {
    if (!Array.isArray(messages) || messages.length === 0) return [];
    const sorted = messages
      .slice()
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    const groups = [];
    sorted.forEach(message => {
      const date = message.createdAt ? new Date(message.createdAt) : null;
      let label = "Earlier";
      if (date && !Number.isNaN(date.getTime())) {
        const now = new Date();
        const sameDay = date.toDateString() === now.toDateString();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
        if (sameDay) {
          label = "Today";
        } else if (diffDays === 1) {
          label = "Yesterday";
        } else {
          label = date.toLocaleDateString("en-GB", { month: "short", day: "numeric" });
        }
      }
      let group = groups.find(entry => entry.label === label);
      if (!group) {
        group = { label, items: [] };
        groups.push(group);
      }
      group.items.push(message);
    });
    return groups;
  };

  const rowStatus = (submission, message) => {
    if (submission && submission.success) {
      return { label: "Reported accurately", className: "message-row__status message-row__status--success" };
    }
    if (submission && !submission.success) {
      return { label: "Needs review", className: "message-row__status message-row__status--warn" };
    }
    const signalCount = Array.isArray(message.signalIds) ? message.signalIds.length : 0;
    return { label: `${signalCount} signals`, className: "message-row__status" };
  };

  const renderMessageGroups = (sandbox, state) => {
    if (!sandbox.messages.length) {
      return '<div class="message-empty"><p>No sandbox messages published yet.</p></div>';
    }
    const groups = groupMessages(sandbox.messages);
    return groups
      .map(group => {
        const rows = group.items
          .map((message, index) => {
            const submission = latestSubmissionFor(sandbox.submissions, message.id);
            const status = rowStatus(submission, message);
            const classes = ["message-row"];
            if (message.id === sandbox.activeMessageId) classes.push("is-active");
            if (message.metadata?.unread === true || (!submission && index === 0)) {
              classes.push("is-unread");
            }
            const preview = messagePreview(message);
            const sender = escapeHtml(message.sender?.displayName || "Security Desk");
            const subject = escapeHtml(message.subject || "Sandbox simulation");
            const time = formatTime(message.createdAt);
            return `
              <li class="${classes.join(" ")}" data-sandbox-message="${escapeHtml(message.id)}">
                <div>
                  <div class="message-row__subject">
                    ${subject}
                    <span class="${status.className}">${escapeHtml(status.label)}</span>
                  </div>
                  <div class="message-row__sender">${sender}</div>
                </div>
                <div class="message-row__time">${escapeHtml(time)}</div>
                <div class="message-row__preview">${escapeHtml(preview)}</div>
              </li>
            `;
          })
          .join("");
        return `
          <div class="message-group">${escapeHtml(group.label)}</div>
          <ul class="message-rows">
            ${rows}
          </ul>
        `;
      })
      .join("");
  };

  const renderSignalsChecklist = (sandbox, message) => {
    if (!message || !Array.isArray(message.signalIds) || message.signalIds.length === 0) {
      return '<p class="reading-signals__empty">No signals attached to this draft.</p>';
    }
    const selectedSignals =
      sandbox.findings && Array.isArray(sandbox.findings[message.id]) ? sandbox.findings[message.id] : [];
    return message.signalIds
      .map(signalId => {
        const checked = selectedSignals.includes(signalId) ? "checked" : "";
        const label = signalId.replace(/-/g, " ");
        return `
          <label class="reading-signal">
            <input type="checkbox" value="${escapeHtml(signalId)}" ${checked} data-sandbox-signal />
            <span>${escapeHtml(label)}</span>
          </label>
        `;
      })
      .join("");
  };

  const renderSubmissionFeedback = submission => {
    if (!submission) return "";
    const correct = submission.correctSignals || [];
    const missed = submission.missedSignals || [];
    const extra = submission.extraSignals || [];
    return `
      <section class="reading-feedback">
        <header>
          <strong>${submission.success ? "Great catch!" : "Keep iterating"}</strong>
          <span>${submission.success ? "All expected signals were flagged." : "Review the missed signals below."}</span>
        </header>
        <div class="reading-feedback__chips">
          ${
            correct.length
              ? `<span class="feedback-chip feedback-chip--success">Correct: ${escapeHtml(correct.join(", "))}</span>`
              : ""
          }
          ${
            missed.length
              ? `<span class="feedback-chip feedback-chip--warn">Missed: ${escapeHtml(missed.join(", "))}</span>`
              : ""
          }
          ${
            extra.length
              ? `<span class="feedback-chip feedback-chip--muted">Extra: ${escapeHtml(extra.join(", "))}</span>`
              : ""
          }
        </div>
      </section>
    `;
  };

  const renderReadingPane = (sandbox, message, identity) => {
    if (!message) {
      return `
        <section class="reading-pane reading-pane--empty" data-reading-pane>
          <p>Select a sandbox message to preview the envelope and body copy.</p>
        </section>
      `;
    }
    const submission = latestSubmissionFor(sandbox.submissions, message.id);
    const senderName = escapeHtml(message.sender?.displayName || "Security Desk");
    const senderAddress = escapeHtml(message.sender?.address || "security@weldsecure.com");
    const subject = escapeHtml(message.subject || "Sandbox simulation");
    const messageBody = formatBody(message.body);
    const statusTone = submission
      ? submission.success
        ? '<div class="reading-status reading-status--success">Accurate report logged</div>'
        : '<div class="reading-status reading-status--warn">Signals missing - try again</div>'
      : "";
    const toLine = identity && identity.name ? `To: ${escapeHtml(identity.name)}` : "";
    return `
      <section class="reading-pane" data-reading-pane>
            <div class="reading-header">
              <h1>${subject}</h1>
              <div class="reading-meta">
                <div>
                  <div class="reading-meta__time">${escapeHtml(formatFullDate(message.createdAt))}</div>
                  <div class="reading-meta__to">${escapeHtml(toLine)}</div>
                </div>
              </div>
              <div class="reading-envelope">
                <div class="reading-avatar">${initialsFor(message.sender?.displayName)}</div>
                <div class="reading-envelope__details">
                  <strong>${senderName}</strong>
              <span>${senderAddress}</span>
            </div>
          </div>
        </div>
        ${statusTone}
        <article class="reading-body${sandbox.hintsVisible ? " reading-body--hint" : ""}">
          ${messageBody}
        </article>
        <div class="reading-actions">
          <button type="button" class="btn ghost" data-action="toggle-hints">
            ${sandbox.hintsVisible ? "Hide hints" : "Reveal signals"}
          </button>
          <button type="button" class="btn primary" data-action="report">Open Reporter add-in</button>
        </div>
        ${renderSubmissionFeedback(submission)}
      </section>
    `;
  };

  const renderReporterSidebar = () => `
    <aside class="reporter-sidebar" data-reporter-sidebar>
      <div class="reporter-sidebar__body" data-reporter-sidebar-body>
        <div class="reporter-sidebar__placeholder">
          <p>Select a sandbox message to load the Reporter add-in.</p>
        </div>
      </div>
    </aside>
  `;

  const renderRibbon = () => {
    const commandIcons = [
      { id: "delete", label: "Delete", asset: "delete-24-regular.svg", tone: "muted" },
      { id: "archive", label: "Archive", asset: "archive-24-regular.svg", tone: "success" },
      { id: "report", label: "Report", asset: "shield-error-24-regular.svg", tone: "danger" },
      { id: "move", label: "Move to", asset: "folder-arrow-right-24-regular.svg", tone: "link" },
      { id: "reply", label: "Reply", asset: "arrow-reply-24-regular.svg", tone: "accent" },
      { id: "reply-all", label: "Reply all", asset: "arrow-reply-all-24-regular.svg", tone: "accent" },
      { id: "forward", label: "Forward", asset: "arrow-forward-24-regular.svg", tone: "link" }
    ];

    return `
      <section class="sandbox-ribbon" aria-label="Mailbox commands">
        <div class="command-bar" role="toolbar">
          <button type="button" class="command-primary">
            <span class="command-primary__icon" aria-hidden="true">${fluentIconImg("mail-add-24-regular.svg")}</span>
            <span>New mail</span>
            <span class="command-primary__chevron" aria-hidden="true">&#9662;</span>
          </button>
          <div class="command-divider" aria-hidden="true"></div>
          <div class="command-icon-strip">
            ${commandIcons
              .map(
                action => `
                  <button
                    type="button"
                    class="command-icon${action.tone ? ` command-icon--${action.tone}` : ""}"
                    aria-label="${escapeHtml(action.label)}"
                  >
                    ${fluentIconImg(action.asset)}
                  </button>
                `
              )
              .join("")}
          </div>
        </div>
      </section>
    `;
  };

  const renderSidebar = () => {
    const railApps = [
      {
        id: "mail",
        label: "Mail",
        iconSrc: fluentColorIcon("assets/Mail/SVG/ic_fluent_mail_48_color.svg?raw=true"),
        pressed: true
      },
      {
        id: "calendar",
        label: "Calendar",
        iconSrc: fluentColorIcon("assets/Calendar/SVG/ic_fluent_calendar_48_color.svg?raw=true")
      },
      {
        id: "copilot",
        label: "Copilot",
        iconSrc: fluentColorIcon("assets/Bot%20Sparkle/SVG/ic_fluent_bot_sparkle_24_color.svg?raw=true")
      },
      {
        id: "people",
        label: "People",
        iconSrc: fluentColorIcon("assets/People/SVG/ic_fluent_people_48_color.svg?raw=true")
      },
      {
        id: "people-team",
        label: "Approvals",
        iconSrc: fluentColorIcon("assets/People%20Team/SVG/ic_fluent_people_team_48_color.svg?raw=true")
      },
      {
        id: "todo",
        label: "To Do",
        iconSrc: fluentColorIcon("assets/Checkmark%20Circle/SVG/ic_fluent_checkmark_circle_48_color.svg?raw=true")
      },
      {
        id: "notebook",
        label: "Notebook",
        iconSrc: fluentColorIcon("assets/Notebook/SVG/ic_fluent_notebook_32_color.svg?raw=true")
      },
      {
        id: "org-explorer",
        label: "Org Explorer",
        iconSrc: fluentColorIcon("assets/Person/SVG/ic_fluent_person_48_color.svg?raw=true")
      },
      {
        id: "files",
        label: "OneDrive",
        iconSrc: fluentColorIcon("assets/Cloud/SVG/ic_fluent_cloud_48_color.svg?raw=true")
      }
    ];
    const moreApps = {
      id: "more-apps",
      label: "More apps",
      iconSrc: fluentColorIcon("assets/Apps/SVG/ic_fluent_apps_48_color.svg?raw=true"),
      variant: "more",
      toggleable: false
    };

    const renderRailButton = app => {
      const isActive = Boolean(app.pressed);
      const pressedAttr =
        app.toggleable === false
          ? ""
          : ` aria-pressed="${isActive ? "true" : "false"}"`;
      const variantClass = app.variant ? ` app-rail__button--${app.variant}` : "";
      return `
        <button type="button" class="app-rail__button${variantClass}${isActive ? " is-active" : ""}" title="${escapeHtml(
          app.label
        )}" aria-label="${escapeHtml(app.label)}"${pressedAttr}>
          <span class="app-rail__glyph" aria-hidden="true">
            <img src="${app.iconSrc}" alt="" loading="lazy" decoding="async" />
          </span>
          <span class="sr-only">${escapeHtml(app.label)}</span>
        </button>
      `;
    };

    return `
      <aside class="sandbox-sidebar sandbox-sidebar--rail">
        <nav class="app-rail" aria-label="Outlook app rail">
          <div class="app-rail__stack">
            ${railApps.map(renderRailButton).join("")}
          </div>
          <div class="app-rail__stack app-rail__stack--end">
            ${renderRailButton(moreApps)}
          </div>
        </nav>
      </aside>
    `;
  };

  const renderStatusBar = (identity, sandbox) => `
    <div class="status-bar">
      <div class="status-bar__count">
        <span id="status-items">Items: ${sandbox.messages.length}</span>
        <span id="status-context">
          Previewing ${escapeHtml(identity.name || "a sandbox user")}'s ${escapeHtml(identity.department || "team")} mailbox.
        </span>
      </div>
      <div class="status-bar__actions">
        <button class="identity-chip" id="user-picker-trigger" aria-haspopup="dialog" data-open="user-picker">
          <span class="identity-chip__avatar" data-profile-avatar>${escapeHtml(identity.initials)}</span>
          <span class="identity-chip__meta">
            <strong data-profile-name>${escapeHtml(identity.name || "Sandbox User")}</strong>
            <small data-profile-role>${escapeHtml(identity.role || "Security Analyst")}</small>
          </span>
          <span class="identity-chip__chevron">&#9662;</span>
        </button>
        <button class="status-settings" aria-haspopup="dialog" data-open="settings">
          <span aria-hidden="true">${placeholderIcon("settings", "#6b7280")}</span>
          <span class="sr-only">Inbox layout settings</span>
        </button>
      </div>
    </div>
  `;

  const renderUserPicker = (identity, sandbox) => {
    const { users, departments } = identity.directory;
    const options = users
      .map(user => {
        const department = departments.find(dep => dep && dep.id === user.departmentId);
        const searchText = [user.displayName, user.jobTitle, department ? department.name : ""]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        const isActive = sandbox.selectedUserId
          ? sandbox.selectedUserId === user.id
          : users[0] && users[0].id === user.id;
        return `
          <button type="button" class="user-option${isActive ? " is-active" : ""}" data-user-id="${escapeHtml(
            user.id
          )}" data-search-text="${escapeHtml(searchText)}">
            <strong>${escapeHtml(user.displayName)}</strong>
            <span>${escapeHtml(user.jobTitle || "Team member")}</span>
            <span>${escapeHtml(department ? department.name : "Cross-functional")}</span>
          </button>
        `;
      })
      .join("");
    const emptyState = identity.directory.users.length
      ? ""
      : '<p class="user-picker__empty">Import demo users to populate this list.</p>';
    return `
      <div class="sandbox-modal" data-sandbox-user-picker hidden>
        <div class="sandbox-modal__dialog">
          <header>
            <h2>Choose a sandbox identity</h2>
            <button type="button" data-close-user-picker aria-label="Close">✕</button>
          </header>
          <div class="sandbox-modal__body">
            ${
              identity.hasDirectoryUsers
                ? `<input type="search" data-user-filter placeholder="Search by name, role, or department" />`
                : ""
            }
            <div data-user-picker-list>
              ${options || emptyState}
            </div>
            <p class="user-picker__empty" data-user-empty hidden>No users found.</p>
          </div>
        </div>
      </div>
    `;
  };

  const renderSettingsDrawer = sandbox => `
    <div class="sandbox-modal" data-sandbox-settings hidden>
      <div class="sandbox-modal__dialog">
        <header>
          <h2>Inbox layout settings</h2>
          <button type="button" data-close-settings aria-label="Close">✕</button>
        </header>
        <div class="sandbox-modal__body">
          <form class="settings-form">
            <label class="settings-option">
              <input type="checkbox" data-layout-pref="compactRows" ${sandbox.layout.compactRows ? "checked" : ""} />
              <div>
                <strong>Compact message list</strong>
                <span>Reduce row height for a denser triage queue.</span>
              </div>
            </label>
            <label class="settings-option">
              <input type="checkbox" data-layout-pref="showSnippets" ${sandbox.layout.showSnippets ? "checked" : ""} />
              <div>
                <strong>Show preview snippets</strong>
                <span>Display the first line of each email beneath the subject.</span>
              </div>
            </label>
            <label class="settings-option">
              <input type="checkbox" data-layout-pref="highlightReading" ${sandbox.layout.highlightReading ? "checked" : ""} />
              <div>
                <strong>Emphasize reading pane</strong>
                <span>Add a subtle focus ring when the add-in is docked.</span>
              </div>
            </label>
          </form>
        </div>
      </div>
    </div>
  `;

  const renderLayout = state => {
    const sandbox = getSandboxSlice(state);
    const identity = resolveIdentity(state, sandbox);
    const navTabs = ["File", "Home", "View", "Help"];
    const rootClasses = ["sandbox-window"];
    if (sandbox.layout.compactRows) rootClasses.push("is-compact");
    if (!sandbox.layout.showSnippets) rootClasses.push("hide-snippets");
    if (sandbox.layout.highlightReading) rootClasses.push("highlight-reading");
    const activeMessage = sandbox.messages.find(message => message.id === sandbox.activeMessageId) || null;

    return `
      <div class="${rootClasses.join(" ")}">
        <header class="sandbox-topbar">
          <div class="topbar-hero">
            <div class="topbar-left">
              <span class="topbar-wordmark" aria-label="Outlook">
                <span class="topbar-wordmark__glyph" aria-hidden="true">${fluentIconImg("waffle-grid-24.svg")}</span>
                <span class="topbar-wordmark__label">Outlook</span>
              </span>
            </div>
            <div class="topbar-right">
              <button type="button" class="topbar-icon topbar-icon--ghost" aria-label="Search mailbox">
                ${fluentIconImg("search-28-regular.svg")}
              </button>
              <button type="button" class="topbar-icon topbar-icon--ghost" aria-label="More actions">
                ${fluentIconImg("more-horizontal-24-regular.svg")}
              </button>
              <button type="button" class="topbar-avatar" aria-label="Open profile">
                <span>${escapeHtml(identity.initials)}</span>
              </button>
            </div>
          </div>
          <div class="topbar-nav" role="navigation" aria-label="Mailbox navigation">
            <button type="button" class="topbar-hamburger" aria-label="Open app launcher">
              ${fluentIconImg("line-horizontal-3-24-regular.svg")}
            </button>
            <nav class="sandbox-tabs" role="tablist">
              ${navTabs
                .map(
                  (tab, index) => `
                    <button type="button" role="tab" class="sandbox-tab${index === 1 ? " is-active" : ""}">
                      <span>${escapeHtml(tab)}</span>
                    </button>
                  `
                )
                .join("")}
            </nav>
          </div>
        </header>
        <div class="sandbox-main">
          ${renderSidebar()}
          <div class="sandbox-content">
            ${renderRibbon()}
            <div class="sandbox-content__body">
              <section class="message-column">
                <div class="message-toolbar" role="toolbar" aria-label="Mailbox view controls">
                  <div class="message-toolbar__title">
                    <span class="message-toolbar__folder">Inbox</span>
                    <button type="button" class="message-toolbar__favorite" aria-label="Toggle favorite">
                      ${fluentIconImg("star-16-filled.svg")}
                    </button>
                  </div>
                  <div class="message-toolbar__actions">
                    <button type="button" aria-label="Select conversations">
                      ${fluentIconImg("checkbox-checked-24-regular.svg")}
                    </button>
                    <button type="button" aria-label="Snooze settings">
                      ${fluentIconImg("clock-arrow-download-24-regular.svg")}
                    </button>
                    <button type="button" aria-label="Filter messages">
                      ${fluentIconImg("filter-24-regular.svg")}
                    </button>
                    <button type="button" aria-label="Sort order">
                      ${fluentIconImg("arrow-sort-24-regular.svg")}
                    </button>
                  </div>
                </div>
                <div class="message-list" data-sandbox-list>
                  ${renderMessageGroups(sandbox, state)}
                </div>
              </section>
              <div class="reading-region">
                ${renderReadingPane(sandbox, activeMessage, identity)}
                ${renderReporterSidebar()}
              </div>
            </div>
          </div>
        </div>
        ${renderStatusBar(identity, sandbox)}
      </div>
      ${renderUserPicker(identity, sandbox)}
      ${renderSettingsDrawer(sandbox)}
    `;
  };

  reporterSandboxFeature.template = function templateReporterSandbox(state) {
    return renderLayout(state || getState());
  };

  reporterSandboxFeature.attach = function attachReporterSandbox(container, providedState) {
    if (!container) return;
    const state = providedState || getState();
    const sandbox = getSandboxSlice(state);
    const reporterSidebar = container.querySelector("[data-reporter-sidebar]");
    const reporterBody = container.querySelector("[data-reporter-sidebar-body]");
    const activeMessage =
      sandbox.messages.find(message => message.id === sandbox.activeMessageId) || null;
    let reporterPulseHandle = null;

    if (reporterBody) {
      reporterBody.classList.add("reporter-outlook-shell");
      mountReporterDock(reporterBody, sandbox, state, activeMessage);
    }

    const focusReporterSidebar = () => {
      if (!sandbox.activeMessageId || !reporterSidebar) return;
      reporterSidebar.classList.add("is-hinted");
      reporterSidebar.scrollIntoView({ behavior: "smooth", block: "nearest" });
      window.clearTimeout(reporterPulseHandle);
      reporterPulseHandle = window.setTimeout(() => {
        reporterSidebar.classList.remove("is-hinted");
      }, 1400);
    };

    const openUserPicker = () => {
      const picker = container.querySelector("[data-sandbox-user-picker]");
      if (!picker) return;
      picker.hidden = false;
      picker.classList.add("is-visible");
      const input = picker.querySelector("[data-user-filter]");
      if (input) {
        input.value = "";
        input.focus();
      }
      toggleUserPickerEmptyState(picker);
    };

    const closeUserPicker = () => {
      const picker = container.querySelector("[data-sandbox-user-picker]");
      if (!picker) return;
      picker.classList.remove("is-visible");
      picker.hidden = true;
    };

    const openSettings = () => {
      const drawer = container.querySelector("[data-sandbox-settings]");
      if (!drawer) return;
      drawer.hidden = false;
      drawer.classList.add("is-visible");
    };

    const closeSettings = () => {
      const drawer = container.querySelector("[data-sandbox-settings]");
      if (!drawer) return;
      drawer.classList.remove("is-visible");
      drawer.hidden = true;
    };

    container.querySelectorAll("[data-sandbox-message]").forEach(row => {
      row.addEventListener("click", () => {
        const messageId = row.getAttribute("data-sandbox-message");
        if (WeldServices && typeof WeldServices.setActiveSandboxMessage === "function") {
          WeldServices.setActiveSandboxMessage(messageId);
        }
      });
    });

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
      const hintToggle = readingPane.querySelector("[data-action='toggle-hints']");
      if (hintToggle) {
        hintToggle.addEventListener("click", () => {
          if (WeldServices && typeof WeldServices.toggleSandboxHints === "function") {
            WeldServices.toggleSandboxHints();
          }
        });
      }
      const reportButton = readingPane.querySelector("[data-action='report']");
      if (reportButton) {
        reportButton.addEventListener("click", () => {
          if (!sandbox.activeMessageId) return;
          focusReporterSidebar();
        });
      }
    }

    const userChip = container.querySelector("[data-open='user-picker']");
    if (userChip) {
      userChip.addEventListener("click", openUserPicker);
    }
    const pickerClose = container.querySelector("[data-close-user-picker]");
    if (pickerClose) {
      pickerClose.addEventListener("click", closeUserPicker);
    }
    const picker = container.querySelector("[data-sandbox-user-picker]");
    if (picker) {
      picker.addEventListener("click", event => {
        if (event.target === picker) {
          closeUserPicker();
        }
      });
      const filterInput = picker.querySelector("[data-user-filter]");
      if (filterInput) {
        filterInput.addEventListener("input", () => toggleUserPickerEmptyState(picker));
      }
      const list = picker.querySelector("[data-user-picker-list]");
      if (list) {
        list.addEventListener("click", event => {
          const button = event.target.closest("[data-user-id]");
          if (!button) return;
          const userId = button.getAttribute("data-user-id");
          if (WeldServices && typeof WeldServices.setSandboxUser === "function") {
            WeldServices.setSandboxUser(userId);
          }
          closeUserPicker();
        });
      }
    }

    container.querySelectorAll("[data-open='settings']").forEach(button => {
      button.addEventListener("click", openSettings);
    });
    const settingsClose = container.querySelector("[data-close-settings]");
    if (settingsClose) {
      settingsClose.addEventListener("click", closeSettings);
    }
    const settings = container.querySelector("[data-sandbox-settings]");
    if (settings) {
      settings.addEventListener("click", event => {
        if (event.target === settings) {
          closeSettings();
        }
      });
      settings.querySelectorAll("[data-layout-pref]").forEach(input => {
        input.addEventListener("change", event => {
          const pref = event.target.getAttribute("data-layout-pref");
          if (!pref) return;
          if (WeldServices && typeof WeldServices.setSandboxLayoutPreference === "function") {
            WeldServices.setSandboxLayoutPreference(pref, event.target.checked);
          }
        });
      });
    }

  };

  function toggleUserPickerEmptyState(picker) {
    if (!picker) return;
    const filterInput = picker.querySelector("[data-user-filter]");
    const list = picker.querySelector("[data-user-picker-list]");
    const empty = picker.querySelector("[data-user-empty]");
    if (!list) return;
    const query = filterInput ? filterInput.value.trim().toLowerCase() : "";
    let visibleCount = 0;
    list.querySelectorAll("[data-user-id]").forEach(button => {
      const haystack = button.getAttribute("data-search-text") || "";
      const isMatch = !query || haystack.includes(query);
      button.hidden = !isMatch;
      if (isMatch) visibleCount += 1;
    });
    if (empty) {
      empty.hidden = visibleCount !== 0;
    }
  }

  function mountReporterDock(container, sandbox, state, activeMessage) {
    if (!container) return;
    const overlay = container.closest("[data-sandbox-addin]");
    if (!activeMessage) {
      container.innerHTML =
        '<div class="reporter-sandbox__addin-empty"><p>Select a sandbox message to load the Reporter add-in.</p></div>';
      if (overlay) {
        overlay.classList.remove("is-visible");
        overlay.hidden = true;
      }
      return;
    }
    const reporterFeature = features.reporter;
    if (!reporterFeature || typeof reporterFeature.render !== "function") {
      container.innerHTML =
        '<div class="reporter-sandbox__addin-empty"><p>Reporter add-in unavailable.</p></div>';
      return;
    }
    reporterFeature.render(container, state, {
      sandboxContext: {
        sandboxMessageId: activeMessage.id,
        expectedSignalIds: Array.isArray(activeMessage.signalIds) ? activeMessage.signalIds : []
      }
    });
  }
})();
