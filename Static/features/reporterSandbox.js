(function () {
  if (!window.Weld) return;

  const features = window.Weld.features || (window.Weld.features = {});
  if (features.reporterSandbox) {
    delete features.reporterSandbox;
  }

  const WeldServices = window.WeldServices || {};
  const WeldUtil = window.WeldUtil || {};
  const reporterSandboxFeature = (features.reporterSandbox = {});
  const MIN_ADDIN_SHELL_HEIGHT = 760;
  const DEFAULT_ADDIN_SHELL_HEIGHT = 840;
  const MAX_ADDIN_SHELL_HEIGHT = 920;

  const clampAddinShellHeight = value => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric <= 0) {
      return DEFAULT_ADDIN_SHELL_HEIGHT;
    }
    return Math.min(MAX_ADDIN_SHELL_HEIGHT, Math.max(MIN_ADDIN_SHELL_HEIGHT, Math.ceil(numeric)));
  };

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
    const weekday = parsed.toLocaleDateString("en-GB", { weekday: "short" });
    const day = parsed.toLocaleDateString("en-GB", { day: "numeric" });
    const month = parsed.toLocaleDateString("en-GB", { month: "short" });
    const year = parsed.getFullYear();
    const time = parsed.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });
    return `${weekday} ${day} ${month} ${year} ${time}`;
  };

  const inferInternalDomains = state => {
    const domains = new Set(["weldsecure.com", "weld.onmicrosoft.com"]);
    const customerEmail = state && state.customer && state.customer.email;
    if (customerEmail && customerEmail.includes("@")) {
      domains.add(customerEmail.split("@").pop().toLowerCase());
    }
    return domains;
  };

  const isInternalSender = (address, state) => {
    if (!address) return true;
    const normalized = String(address).trim().toLowerCase();
    if (!normalized) return true;
    const domain = normalized.includes("@") ? normalized.split("@").pop() : normalized;
    if (!domain) return true;
    const domains = inferInternalDomains(state);
    return domains.has(domain);
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

  const resolveAddinShellHeight = state => {
    if (!state || !state.meta) return DEFAULT_ADDIN_SHELL_HEIGHT;
    const stored = Number(state.meta.addinShellHeight);
    if (Number.isFinite(stored) && stored > 0) {
      return clampAddinShellHeight(stored);
    }
    return DEFAULT_ADDIN_SHELL_HEIGHT;
  };

  const fluentColorIcon = relativePath =>
    `https://raw.githubusercontent.com/microsoft/fluentui-system-icons/main/${relativePath}`;

  const fluentSvgIcon = fileName => `svg/fluent/${fileName}`;
  const fluentIconImg = fileName =>
    `<img src="${fluentSvgIcon(fileName)}" alt="" class="icon-img" loading="lazy" decoding="async" />`;
  const fluentChevronImg = () => fluentIconImg("chevron-down-16-regular.svg");

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

  const normalizeEmail = value => (typeof value === "string" ? value.trim().toLowerCase() : "");

  const directoryDisplayForEmail = (users, email) => {
    const normalized = normalizeEmail(email);
    if (!normalized || !Array.isArray(users)) return null;
    const match = users.find(user => {
      const candidates = [user.mail, user.userPrincipalName, user.email];
      return candidates.some(candidate => normalizeEmail(candidate) === normalized);
    });
    return match ? match.displayName || match.mail || match.userPrincipalName : null;
  };

  const normalizeCcEntries = (ccList, users) => {
    if (!Array.isArray(ccList)) return [];
    return ccList
      .map(entry => {
        if (!entry) return null;
        if (typeof entry === "string") {
          const trimmed = entry.trim();
          if (!trimmed) return null;
          return directoryDisplayForEmail(users, trimmed) || trimmed;
        }
        if (typeof entry === "object") {
          const display =
            (typeof entry.displayName === "string" && entry.displayName.trim().length > 0 && entry.displayName.trim()) ||
            (typeof entry.name === "string" && entry.name.trim().length > 0 && entry.name.trim());
          const address =
            (typeof entry.address === "string" && entry.address.trim().length > 0 && entry.address.trim()) ||
            (typeof entry.mail === "string" && entry.mail.trim().length > 0 && entry.mail.trim()) ||
            (typeof entry.email === "string" && entry.email.trim().length > 0 && entry.email.trim());
          if (display) return display;
          if (address) return directoryDisplayForEmail(users, address) || address;
          return null;
        }
        return null;
      })
      .filter(Boolean);
  };

  const stripCcLineFromBody = (body, hasCc) => {
    if (!hasCc || typeof body !== "string") return body;
    const lines = body.split(/\r?\n/);
    let ccRemoved = false;
    let skipNextBlank = false;
    const cleaned = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!ccRemoved && /^\s*Cc:/i.test(line)) {
        ccRemoved = true;
        skipNextBlank = true;
        continue;
      }
      if (skipNextBlank) {
        if (line.trim().length === 0) {
          skipNextBlank = false;
          continue;
        }
        skipNextBlank = false;
      }
      cleaned.push(line);
    }
    return cleaned.join("\n");
  };

  const getSandboxSlice = state => {
    const slice = state && typeof state.reporterSandbox === "object" ? state.reporterSandbox : {};
    const layoutSource = slice.layout && typeof slice.layout === "object" ? slice.layout : {};
    return {
      messages: Array.isArray(slice.messages) ? slice.messages : [],
      activeMessageId: slice.activeMessageId,
      submissions: Array.isArray(slice.submissions) ? slice.submissions : [],
      selectedUserId:
        typeof slice.selectedUserId === "string" && slice.selectedUserId.trim().length > 0 ? slice.selectedUserId.trim() : null,
      layout: {
        compactRows: layoutSource.compactRows === true,
        showSnippets: layoutSource.showSnippets !== false,
        highlightReading: layoutSource.highlightReading !== false,
        showAddin: layoutSource.showAddin === true
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

  const AVATAR_COLOR_PALETTE = [
    { from: "A", to: "C", background: "#0078D4", color: "#ffffff" }, // Cornflower Blue
    { from: "D", to: "F", background: "#107C10", color: "#ffffff" }, // Emerald Green
    { from: "G", to: "I", background: "#D83B01", color: "#ffffff" }, // Orange
    { from: "J", to: "L", background: "#038387", color: "#ffffff" }, // Teal
    { from: "M", to: "O", background: "#5C2D91", color: "#ffffff" }, // Purple
    { from: "P", to: "R", background: "#B4009E", color: "#ffffff" }, // Magenta Pink
    { from: "S", to: "U", background: "#A4262C", color: "#ffffff" }, // Red
    { from: "V", to: "X", background: "#FFB900", color: "#2f2f2f" }, // Gold/Amber needs dark text
    { from: "Y", to: "Z", background: "#2B88D8", color: "#ffffff" } // Steel Blue
  ];

  const avatarToneFor = name => {
    const fallback = { background: "#1f2440", color: "#ffffff" };
    if (!name || typeof name !== "string") return fallback;
    const initial = name.trim().charAt(0).toUpperCase();
    if (!initial || initial < "A" || initial > "Z") return fallback;
    const tone = AVATAR_COLOR_PALETTE.find(entry => initial >= entry.from && initial <= entry.to);
    return tone || fallback;
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
    const now = new Date();
    const todayKey = now.toDateString();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const msPerDay = 1000 * 60 * 60 * 24;
    const sorted = messages
      .slice()
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    const groups = [];
    sorted.forEach(message => {
      const date = message.createdAt ? new Date(message.createdAt) : null;
      let label = "Earlier";
      if (date && !Number.isNaN(date.getTime())) {
        const messageKey = date.toDateString();
        const sameDay = messageKey === todayKey;
        const startOfMessageDay = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
        const diffDays = Math.floor((startOfToday - startOfMessageDay) / msPerDay);
        if (sameDay) {
          label = "Today";
        } else if (diffDays === 1) {
          label = "Yesterday";
        } else {
          label = "Earlier";
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
            const classes = ["message-row"];
            if (message.id === sandbox.activeMessageId) classes.push("is-active");
            const hasExplicitUnread = message.metadata?.unread === true;
            const hasExplicitRead = message.metadata?.unread === false;
            if (hasExplicitUnread || (!hasExplicitRead && !submission && index === 0)) {
              classes.push("is-unread");
            }
            const preview = messagePreview(message);
            const sender = escapeHtml(message.sender?.displayName || "Security Desk");
            const subject = escapeHtml(message.subject || "Sandbox simulation");
            const time = formatTime(message.createdAt);
            const escapedTime = escapeHtml(time);
            const hasConversation =
              message.metadata?.conversation === true ||
              (typeof message.metadata?.conversationReplies === "number" &&
                message.metadata.conversationReplies > 0);
            const conversationIcon = hasConversation
              ? `<span class="message-row__conversation" aria-hidden="true">${fluentIconImg("chevron-right-12-regular.svg")}</span>`
              : "";
            const showAttachmentIndicator = message.metadata?.attachmentIndicator === true;
            const attachmentMarkup = showAttachmentIndicator
              ? `<span class="message-row__attachment" aria-hidden="true">${fluentIconImg("attach-16-regular.svg")}</span>`
              : "";
            const timeMarkup = `<span class="message-row__time">${escapedTime}</span>`;
            const metaMarkup =
              attachmentMarkup || timeMarkup
                ? `<div class="message-row__meta">
                    ${attachmentMarkup}
                    ${timeMarkup}
                  </div>`
                : "";
            return `
              <li class="${classes.join(" ")}" data-sandbox-message="${escapeHtml(message.id)}">
                <div class="message-row__sender-line">
                  <span class="message-row__sender">${sender}</span>
                </div>
                <div class="message-row__subject-line">
                  <div class="message-row__subject-wrap">
                    ${conversationIcon}
                    <span class="message-row__subject">${subject}</span>
                  </div>
                </div>
                ${metaMarkup}
                <div class="message-row__preview">${escapeHtml(preview)}</div>
              </li>
            `;
          })
          .join("");
        return `
          <div class="message-group">
            <span class="message-group__chevron" aria-hidden="true">${fluentChevronImg()}</span>
            <span class="message-group__label">${escapeHtml(group.label)}</span>
          </div>
          <ul class="message-rows">
            ${rows}
          </ul>
        `;
      })
      .join("");
  };

  const renderSubmissionSummary = submission => {
    if (!submission) return "";
    const summaryText =
      typeof submission.summary === "string" && submission.summary.trim().length > 0
        ? submission.summary.trim()
        : submission.success
        ? "Report synced to WeldSecure."
        : "Follow-up required. Check WeldSecure for next steps.";
    const notesText =
      typeof submission.notes === "string" && submission.notes.trim().length > 0 ? submission.notes.trim() : "";
    const timestamp = submission.submittedAt ? formatFullDate(submission.submittedAt) : "Just now";
    const notesMarkup = notesText ? `<p class="reading-feedback__notes">${escapeHtml(notesText)}</p>` : "";
    return `
      <section class="reading-feedback">
        <header>
          <strong>${submission.success ? "Report logged" : "Needs attention"}</strong>
          <span>${escapeHtml(summaryText)}</span>
        </header>
        <div class="reading-feedback__meta">Logged ${escapeHtml(timestamp)}</div>
        ${notesMarkup}
      </section>
    `;
  };

  const renderReadingPane = (sandbox, message, identity, state) => {
    if (!message) {
      return `
        <section class="reading-pane reading-pane--empty" data-reading-pane>
          <p>Select a sandbox message to preview the envelope and body copy.</p>
        </section>
      `;
    }
    const activeState = state || getState();
    const submission = latestSubmissionFor(sandbox.submissions, message.id);
    const senderName = message.sender?.displayName || "Security Desk";
    const senderAddress = message.sender?.address || "security@weldsecure.com";
    const senderIsInternal = isInternalSender(senderAddress, activeState);
    const senderDisplay = senderIsInternal ? senderName : `${senderName} <${senderAddress}>`;
    const avatarTone = avatarToneFor(senderName);
    const subject = message.subject || "Sandbox simulation";
    const directorySnapshot = (identity && identity.directory) || getDirectorySnapshot(activeState);
    const directoryUsers = Array.isArray(directorySnapshot?.users) ? directorySnapshot.users : [];
    const ccEntries = normalizeCcEntries(message.metadata?.cc, directoryUsers);
    const messageBody = formatBody(stripCcLineFromBody(message.body, ccEntries.length > 0));
    const statusTone = submission
      ? submission.success
        ? '<div class="reading-status reading-status--success">Report sent to WeldSecure</div>'
        : '<div class="reading-status reading-status--warn">Follow-up required in WeldSecure</div>'
      : "";
    const toLine = identity && identity.name ? `To: ${identity.name}` : "";
    const timestamp = formatFullDate(message.createdAt);
    const recipientMarkup = toLine ? escapeHtml(toLine) : "&nbsp;";
    const ccLine = ccEntries.length ? `Cc: ${ccEntries.join("; ")}` : "";
    const ccMarkup = ccLine
      ? `<div class="reading-cc-row">
          <span class="reading-recipient reading-recipient--cc">${escapeHtml(ccLine)}</span>
        </div>`
      : "";
    const headerActions = [
      { id: "reply", label: "Reply", asset: "arrow-reply-24-regular.svg", tone: "accent" },
      { id: "reply-all", label: "Reply all", asset: "arrow-reply-all-24-regular.svg", tone: "accent" },
      { id: "forward", label: "Forward", asset: "arrow-forward-24-regular.svg", tone: "link" },
      { id: "more", label: "More actions", asset: "more-horizontal-24-regular.svg", tone: "muted" }
    ]
      .map(
        action => `
          <button
            type="button"
            class="reading-icon-button${action.tone ? ` command-icon--${action.tone}` : ""}"
            aria-label="${escapeHtml(action.label)}"
          >
            ${fluentIconImg(action.asset)}
          </button>
        `
      )
      .join("");
    const subjectClasses = ["reading-card", "reading-card--subject"];
    if (message.metadata?.unread === true) subjectClasses.push("is-unread");
    return `
      <section class="reading-pane" data-reading-pane>
        <div class="${subjectClasses.join(" ")}">
          <span class="reading-subject">${escapeHtml(subject)}</span>
        </div>
        <div class="reading-card reading-card--message">
          <div class="reading-message-header">
            <div
              class="reading-avatar"
              style="background:${avatarTone.background};color:${avatarTone.color};"
            >
              ${escapeHtml(initialsFor(message.sender?.displayName))}
            </div>
            <div class="reading-header__content">
              <div class="reading-sender-row">
                <span class="reading-sender">${escapeHtml(senderDisplay)}</span>
                <div class="reading-header__actions">
                  ${headerActions}
                </div>
              </div>
              <div class="reading-recipient-row">
                <span class="reading-recipient">${recipientMarkup}</span>
                <span class="reading-timestamp">${escapeHtml(timestamp)}</span>
              </div>
              ${ccMarkup}
            </div>
          </div>
          ${statusTone}
          <article class="reading-body">
            ${messageBody}
          </article>
          ${renderSubmissionSummary(submission)}
        </div>
      </section>
    `;
  };

  const renderReporterSidebar = addinVisible => {
    const isVisible = addinVisible === true;
    const hiddenAttr = isVisible ? "" : " hidden";
    return `
    <aside
      class="reporter-sidebar"
      data-reporter-sidebar
      data-sandbox-addin
      data-addin-visible="${isVisible ? 'true' : 'false'}"
      aria-hidden="${isVisible ? 'false' : 'true'}"${hiddenAttr}
    >
      <div class="reporter-sidebar__body" data-reporter-sidebar-body>
        <div class="reporter-sidebar__placeholder">
          <p>Select a sandbox message to load the Reporter add-in.</p>
        </div>
      </div>
    </aside>
  `;
  };

  const renderRibbon = addinVisible => {
    const isAddinVisible = addinVisible === true;
    const weldButtonLabel = isAddinVisible ? "Hide WeldSecure add-in" : "Show WeldSecure add-in";
    const commandIcons = [
      { id: "delete", label: "Delete", asset: "delete-24-regular.svg", tone: "muted", flyout: true },
      { id: "archive", label: "Archive", asset: "archive-24-regular.svg", tone: "success" },
      { id: "report", label: "Report", asset: "shield-error-24-regular.svg", tone: "danger", flyout: true },
      { id: "move", label: "Move to", asset: "folder-arrow-right-24-regular.svg", tone: "link", flyout: true },
      { id: "reply", label: "Reply", asset: "arrow-reply-24-regular.svg", tone: "accent" },
      { id: "reply-all", label: "Reply all", asset: "arrow-reply-all-24-regular.svg", tone: "accent" },
      { id: "forward", label: "Forward", asset: "arrow-forward-24-regular.svg", tone: "link", flyout: true }
    ];

    return `
      <section class="sandbox-ribbon" aria-label="Mailbox commands">
        <div class="command-bar" role="toolbar">
          <button type="button" class="command-primary">
            <span class="command-primary__icon" aria-hidden="true">${fluentIconImg("mail-add-24-regular.svg")}</span>
            <span>New mail</span>
            <span class="command-primary__chevron" aria-hidden="true">${fluentChevronImg()}</span>
          </button>
          <div class="command-divider" aria-hidden="true"></div>
          <div class="command-icon-strip">
            ${commandIcons
              .map(action => {
                const classes = ["command-icon"];
                if (action.tone) classes.push(`command-icon--${action.tone}`);
                if (action.flyout) classes.push("command-icon--flyout");
                const chevronMarkup = action.flyout
                  ? `<span class="command-icon__chevron" aria-hidden="true">${fluentChevronImg()}</span>`
                  : "";
                return `
                  <button
                    type="button"
                    class="${classes.join(" ")}"
                    aria-label="${escapeHtml(action.label)}"
                  >
                    ${fluentIconImg(action.asset)}
                    ${chevronMarkup}
                  </button>
                `;
              })
              .join("")}
          </div>
          <div class="command-divider command-divider--brand" aria-hidden="true"></div>
          <button
            type="button"
            class="command-icon command-icon--brand"
            data-action="toggle-addin"
            aria-label="${escapeHtml(weldButtonLabel)}"
            title="${escapeHtml(weldButtonLabel)}"
            aria-pressed="${isAddinVisible ? 'true' : 'false'}"
          >
            ${fluentIconImg("weldsecure-logo.svg")}
          </button>
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
        iconSrc: "svg/microsoft_copilot_logo.svg"
      },
      {
        id: "people",
        label: "People",
        iconSrc: fluentColorIcon("assets/People/SVG/ic_fluent_people_48_color.svg?raw=true")
      },
      {
        id: "todo",
        label: "To Do",
        iconSrc: "svg/microsoft_to_do_icon.svg"
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
      },
      {
        id: "more-apps",
        label: "More apps",
        iconSrc: fluentColorIcon("assets/Apps/SVG/ic_fluent_apps_48_color.svg?raw=true"),
        variant: "more",
        toggleable: false
      }
    ];

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
        </nav>
      </aside>
    `;
  };

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
    const addinVisible = sandbox.layout.showAddin === true;
    if (addinVisible) rootClasses.push("has-addin");
    const activeMessage = sandbox.messages.find(message => message.id === sandbox.activeMessageId) || null;
    const readingRegionClasses = ["reading-region"];
    const sandboxContentClasses = ["sandbox-content"];
    const stageClasses = ["sandbox-stage"];
    const addinShellHeight = resolveAddinShellHeight(state);
    if (addinVisible) {
      stageClasses.push("sandbox-stage--addin-visible");
    }

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
              <button type="button" class="topbar-icon topbar-icon--ghost" aria-label="Open settings" data-open="settings">
                ${fluentIconImg("more-horizontal-24-regular.svg")}
              </button>
              <button type="button" class="topbar-avatar" aria-label="Choose sandbox user" data-open="user-picker">
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
          <div
            class="${stageClasses.join(" ")}"
            data-sandbox-stage
            data-addin-visible="${addinVisible ? 'true' : 'false'}"
            style="--sandbox-shell-height: ${addinShellHeight}px;"
          >
            <div class="${sandboxContentClasses.join(" ")}">
              <div class="sandbox-content__main">
                ${renderRibbon(addinVisible)}
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
                        <button type="button" aria-label="Copy message">
                          ${fluentIconImg("copy-16-regular.svg")}
                        </button>
                        <button type="button" aria-label="Jump to folder">
                          ${fluentIconImg("arrow-turn-down-right-20-regular.svg")}
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
                  <div class="${readingRegionClasses.join(" ")}" data-reading-region data-addin-visible="${addinVisible ? 'true' : 'false'}">
                    ${renderReadingPane(sandbox, activeMessage, identity, state)}
                  </div>
                </div>
              </div>
            </div>
            ${renderReporterSidebar(addinVisible)}
          </div>
        </div>
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
    const readingRegion = container.querySelector("[data-reading-region]");
    const sandboxStage = container.querySelector("[data-sandbox-stage]");
    const toggleAddinButton = container.querySelector("[data-action='toggle-addin']");
    const activeMessage =
      sandbox.messages.find(message => message.id === sandbox.activeMessageId) || null;
    let addinVisible = sandbox.layout && sandbox.layout.showAddin === true;
    let hasAppliedAddinVisibility = false;

    const persistAddinPreference = nextValue => {
      if (WeldServices && typeof WeldServices.setSandboxLayoutPreference === "function") {
        WeldServices.setSandboxLayoutPreference("showAddin", nextValue);
      }
    };

    const disableGuidedTourForSandboxAddin = () => {
      const tour = window.WeldGuidedTour;
      const guidedMeta = state?.meta?.guidedTour;
      const isEnabled =
        tour && typeof tour.isEnabled === "function"
          ? tour.isEnabled()
          : guidedMeta
          ? guidedMeta.enabled !== false
          : true;
      if (!isEnabled) {
        return;
      }
      if (tour && typeof tour.setEnabled === "function") {
        tour.setEnabled(false);
        return;
      }
      if (tour && typeof tour.toggle === "function") {
        tour.toggle();
        return;
      }
      if (!state || typeof state !== "object") {
        return;
      }
      if (!state.meta || typeof state.meta !== "object") {
        state.meta = {};
      }
      if (!state.meta.guidedTour || typeof state.meta.guidedTour !== "object") {
        state.meta.guidedTour = { enabled: false, dismissedRoutes: {} };
      } else {
        state.meta.guidedTour.enabled = false;
      }
    };

    const updateCommandButton = visible => {
      if (!toggleAddinButton) return;
      const label = visible ? "Hide WeldSecure add-in" : "Show WeldSecure add-in";
      toggleAddinButton.setAttribute("aria-pressed", visible ? "true" : "false");
      toggleAddinButton.setAttribute("aria-label", label);
      toggleAddinButton.setAttribute("title", label);
    };

    const applyAddinVisibility = visible => {
      const wasVisible = hasAppliedAddinVisibility ? addinVisible === true : false;
      const nextVisible = visible === true;
      addinVisible = nextVisible;
      hasAppliedAddinVisibility = true;
      if (nextVisible && !wasVisible) {
        disableGuidedTourForSandboxAddin();
      }
      if (reporterSidebar) {
        reporterSidebar.hidden = !addinVisible;
        reporterSidebar.setAttribute("aria-hidden", addinVisible ? "false" : "true");
        reporterSidebar.setAttribute("data-addin-visible", addinVisible ? "true" : "false");
      }
      if (readingRegion) {
        readingRegion.setAttribute("data-addin-visible", addinVisible ? "true" : "false");
      }
      if (sandboxStage) {
        sandboxStage.classList.toggle("sandbox-stage--addin-visible", addinVisible);
        sandboxStage.setAttribute("data-addin-visible", addinVisible ? "true" : "false");
      }
      if (container && container.classList) {
        container.classList.toggle("has-addin", addinVisible);
      }
      updateCommandButton(addinVisible);
    };

    if (reporterBody) {
      reporterBody.classList.add("reporter-outlook-shell");
      mountReporterDock(reporterBody, sandbox, state, activeMessage);
    }

    applyAddinVisibility(addinVisible);

    if (toggleAddinButton) {
      toggleAddinButton.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        const next = !addinVisible;
        applyAddinVisibility(next);
        persistAddinPreference(next);
      });
    }

    const focusReporterSidebar = () => {
      if (!sandbox.activeMessageId || !reporterSidebar) return;
      if (!addinVisible) {
        applyAddinVisibility(true);
        persistAddinPreference(true);
      }
      reporterSidebar.scrollIntoView({ behavior: "smooth", block: "nearest" });
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
      }
      return;
    }
    const reporterFeature = features.reporter;
    if (!reporterFeature || typeof reporterFeature.render !== "function") {
      container.innerHTML =
        '<div class="reporter-sandbox__addin-empty"><p>Reporter add-in unavailable.</p></div>';
      if (overlay) {
        overlay.classList.remove("is-visible");
      }
      return;
    }
    reporterFeature.render(container, state, {
      sandboxContext: {
        sandboxMessageId: activeMessage.id
      }
    });
    if (overlay) {
      overlay.classList.add("is-visible");
    }
  }
})();
