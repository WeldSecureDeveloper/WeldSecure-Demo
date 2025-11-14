(function () {
  const modules = window.WeldModules;
  if (!modules || modules.has("components/reporterSandbox/messages")) return;

  modules.define("components/reporterSandbox/messages", function () {
    return {
      renderMessageGroups,
      renderReadingPane
    };

    function latestSubmissionFor(submissions, messageId) {
      return submissions.find(entry => entry && entry.messageId === messageId) || null;
    }

    function groupMessages(messages) {
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
    }

    function renderMessageGroups(sandbox, state, helpers) {
      const {
        escapeHtml,
        fluentIconImg,
        formatTime,
        messagePreview,
        fluentChevronImg
      } = helpers;

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
    }

    function renderReadingPane(sandbox, message, identity, state, helpers) {
      const {
        escapeHtml,
        formatFullDate,
        fluentIconImg,
        initialsFor,
        avatarToneFor,
        getDirectorySnapshot,
        getState,
        isInternalSender,
        normalizeCcEntries,
        formatBody,
        stripCcLineFromBody
      } = helpers;

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
          ${renderSubmissionSummary(submission, helpers)}
        </div>
      </section>
    `;
    }

    function renderSubmissionSummary(submission, helpers) {
      const { escapeHtml, formatFullDate } = helpers;

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
    }
  });
})();
