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
        : '<div class="reading-status reading-status--warn">Signals missing — try again</div>'
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
            <button class="link-button">Manage add-ins…</button>
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
          <button type="button" class="btn primary" data-action="report">Report via Reporter</button>
        </div>
        <section class="reading-signals">
          <header>
            <h3>Detection checklist</h3>
            <p>Select every signal you spotted before submitting.</p>
          </header>
          <div class="reading-signals__grid">
            ${renderSignalsChecklist(sandbox, message)}
          </div>
        </section>
        ${renderSubmissionFeedback(submission)}
      </section>
    `;
  };

  const renderSidebar = () => `
    <aside class="sandbox-sidebar">
      <h3>Favorites</h3>
      <button class="folder-button is-active">
        <span>Inbox</span>
        <span class="badge">1</span>
      </button>
      <button class="folder-button">Sent Items</button>
      <button class="folder-button">Drafts</button>
      <button class="folder-button">Archive</button>
      <h3>Folders</h3>
      <button class="folder-button">Approvals</button>
      <button class="folder-button">Programs</button>
      <button class="folder-button">Teams sync</button>
    </aside>
  `;

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
          <span class="identity-chip__chevron">▾</span>
        </button>
        <button class="status-settings" aria-haspopup="dialog" data-open="settings">
          <span aria-hidden="true">⚙️</span>
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

  const renderAddinDrawer = () => `
    <div class="sandbox-addin" data-sandbox-addin hidden>
      <div class="sandbox-addin__backdrop" data-close-addin></div>
      <div class="sandbox-addin__panel">
        <header>
          <strong>Reporter add-in</strong>
          <button type="button" data-close-addin aria-label="Close">✕</button>
        </header>
        <div class="sandbox-addin__body" data-sandbox-addin-body>
          <div class="reporter-sandbox__addin-empty">
            <p>Select a message to dock the Reporter add-in.</p>
          </div>
        </div>
      </div>
    </div>
  `;

  const renderLayout = state => {
    const sandbox = getSandboxSlice(state);
    const identity = resolveIdentity(state, sandbox);
    const rootClasses = ["sandbox-window"];
    if (sandbox.layout.compactRows) rootClasses.push("is-compact");
    if (!sandbox.layout.showSnippets) rootClasses.push("hide-snippets");
    if (sandbox.layout.highlightReading) rootClasses.push("highlight-reading");
    const activeMessage = sandbox.messages.find(message => message.id === sandbox.activeMessageId) || null;

    return `
      <div class="${rootClasses.join(" ")}">
        <header class="sandbox-topbar">
          <div class="logo-chip">
            <span>O</span>
            <span>Outlook</span>
          </div>
          <span class="topbar-route">Mail &gt; Sandbox inbox</span>
          <div class="topbar-search">
            <span aria-hidden="true">🔍</span>
            <input type="search" placeholder="Search mail and people" disabled />
          </div>
          <button class="status-settings" aria-haspopup="dialog" data-open="settings" title="Inbox settings">⚙️</button>
        </header>
        <section class="sandbox-ribbon">
          <div class="ribbon-tabs">
            <button class="is-active">Message</button>
            <button disabled>Home</button>
            <button disabled>View</button>
          </div>
          <div class="ribbon-groups">
            <button class="ribbon-button"><span>✉️</span>New email</button>
            <button class="ribbon-button"><span>📎</span>Attach</button>
            <button class="ribbon-button"><span>🗑️</span>Delete</button>
            <button class="ribbon-button"><span>🚩</span>Follow up</button>
          </div>
        </section>
        <div class="sandbox-main">
          ${renderSidebar()}
          <section class="message-column">
            <div class="message-toolbar">
              <span>Arrange By: <strong>Date</strong></span>
              <span>Newest on top ▾</span>
            </div>
            <div class="message-list" data-sandbox-list>
              ${renderMessageGroups(sandbox, state)}
            </div>
          </section>
          ${renderReadingPane(sandbox, activeMessage, identity)}
        </div>
        ${renderStatusBar(identity, sandbox)}
      </div>
      ${renderUserPicker(identity, sandbox)}
      ${renderSettingsDrawer(sandbox)}
      ${renderAddinDrawer()}
    `;
  };

  reporterSandboxFeature.template = function templateReporterSandbox(state) {
    return renderLayout(state || getState());
  };

  reporterSandboxFeature.attach = function attachReporterSandbox(container, providedState) {
    if (!container) return;
    const state = providedState || getState();
    const sandbox = getSandboxSlice(state);
    const addinOverlay = container.querySelector("[data-sandbox-addin]");
    const addinBody = container.querySelector("[data-sandbox-addin-body]");

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

    const closeAddin = () => {
      if (!addinOverlay) return;
      addinOverlay.classList.remove("is-visible");
      addinOverlay.hidden = true;
    };

    const openAddin = () => {
      if (!addinOverlay) return;
      addinOverlay.hidden = false;
      addinOverlay.classList.add("is-visible");
      const snapshot = getState();
      const snapshotSandbox = getSandboxSlice(snapshot);
      const activeMessage = snapshotSandbox.messages.find(message => message.id === snapshotSandbox.activeMessageId);
      mountReporterDock(addinBody, snapshotSandbox, snapshot, activeMessage);
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
          openAddin();
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

    if (addinOverlay) {
      addinOverlay.addEventListener("click", event => {
        if (event.target.hasAttribute("data-close-addin") || event.target === addinOverlay) {
          closeAddin();
        }
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
        '<div class="reporter-sandbox__addin-empty"><p>Select a message to dock the Reporter add-in.</p></div>';
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
