(function () {
  const modules = window.WeldModules;
  if (!modules || typeof modules.define !== "function") return;
  if (modules.has && modules.has("features/customer/reports")) return;

  modules.define("features/customer/reports", function () {
    let shared;
    try {
      shared = modules.use("features/customer/shared");
    } catch (error) {
      console.warn("Customer reports module could not load shared utilities:", error);
      return null;
    }
    if (!shared) {
      console.warn("Customer reports module missing shared utilities.");
      return null;
    }

    const { MessageStatus, WeldUtil, formatNumber, formatDateTime, getState } = shared;

    function renderCustomerReportsView(state) {
      const customerMessages = state.messages
        .filter(messageBelongsToCustomer)
        .slice()
        .sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime());

      const reportFilter = state.meta?.reportFilter === "other" ? "other" : "all";
      const filteredMessages = customerMessages.filter(message => {
        if (reportFilter === "other") {
          return Boolean(message?.activityType);
        }
        return true;
      });

      const sharedRows =
        window.WeldReportTable && typeof window.WeldReportTable.prepareRows === "function"
          ? window.WeldReportTable.prepareRows(filteredMessages, { state })
          : null;

      const rowsMarkup = Array.isArray(sharedRows)
        ? sharedRows
            .map(row => {
              const activityMeta = row.hasActivityLabel
                ? `<span class="detail-table__meta">${row.activityLabel}${
                    row.hasActivityLocation ? ` ${row.activityLocation}` : ""
                  }</span>`
                : row.hasActivityLocation
                ? `<span class="detail-table__meta">Location: ${row.activityLocation}</span>`
                : "";
              return `
            <tr>
              <td>${row.reportedAtDisplay}</td>
              <td>
                <strong>${row.subject}</strong>
                ${activityMeta}
                ${row.reasonChipsMarkup || ""}
              </td>
              <td>${row.statusBadgeMarkup}</td>
              <td>
                ${row.pointsMarkup}
              </td>
            </tr>
          `;
            })
            .join("")
        : filteredMessages
            .map(message => {
              const reasons = Array.isArray(message.reasons) ? message.reasons.map(reasonById).filter(Boolean) : [];
              const reasonChips = reasons
                .map(reason => `<span class="detail-chip">${WeldUtil.escapeHtml(reason.label)}</span>`)
                .join("");
              const approvedPoints = message.status === MessageStatus.APPROVED ? message.pointsOnApproval || 0 : 0;
              const totalPoints = (message.pointsOnMessage || 0) + approvedPoints;
              const activityLabel = describeActivityType(message?.activityType);
              const hasLocation =
                typeof message?.incidentLocation === "string" && message.incidentLocation.trim().length > 0;
              const activityMeta = activityLabel
                ? `<span class="detail-table__meta">${WeldUtil.escapeHtml(activityLabel)}${
                    hasLocation ? ` ${WeldUtil.escapeHtml(message.incidentLocation.trim())}` : ""
                  }</span>`
                : hasLocation
                ? `<span class="detail-table__meta">Location: ${WeldUtil.escapeHtml(message.incidentLocation.trim())}</span>`
                : "";
              return `
            <tr>
              <td>${formatDateTime(message.reportedAt)}</td>
              <td>
                <strong>${WeldUtil.escapeHtml(message.subject || "Suspicious message")}</strong>
                ${activityMeta}
                ${reasonChips ? `<div class="detail-table__chips">${reasonChips}</div>` : ""}
              </td>
              <td><span class="badge" data-state="${WeldUtil.escapeHtml(message.status)}">${WeldUtil.escapeHtml(message.status)}</span></td>
              <td>
                <div class="detail-table__points">
                  <span>+${formatNumber(message.pointsOnMessage || 0)}</span>
                  ${
                    message.status === MessageStatus.APPROVED
                      ? `<span>+${formatNumber(approvedPoints)}</span>`
                      : ""
                  }
                  <strong>= ${formatNumber(totalPoints)}</strong>
                </div>
              </td>
            </tr>
          `;
            })
            .join("");

      const emptyCopy =
        reportFilter === "other"
          ? "No other suspicious activity reports yet. Log calls, texts, or QR finds to see them here."
          : "No reports recorded yet. Use the hub to submit your first suspicious email.";

      const tableMarkup = filteredMessages.length
        ? `
          <div class="detail-table-wrapper">
            <table class="detail-table detail-table--reports">
              <thead>
                <tr>
                  <th>Reported</th>
                  <th>Subject &amp; reasons</th>
                  <th>Status</th>
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>${rowsMarkup}</tbody>
            </table>
          </div>
        `
        : `<div class="customer-detail__empty">${WeldUtil.escapeHtml(emptyCopy)}</div>`;

      return `
        <header class="customer-detail-header">
          <button type="button" class="customer-detail__back" data-action="back-to-hub">
            Back to hub
          </button>
          <span class="customer-detail__eyebrow">Reports</span>
          <h1>Latest suspicious reports</h1>
          <p>Filter the activity feed to show phishing reports, suspicious calls, texts, or QR events.</p>
        </header>
        <section class="customer-section customer-section--reports">
          ${tableMarkup}
        </section>
      `;
    }

    function attachCustomerReportsEvents(container) {
      const back = container.querySelector("[data-action='back-to-hub']");
      if (back) {
        back.addEventListener("click", () => {
          setRole("customer", "customer");
        });
      }
    }

    function templateReports(appState) {
      const state = getState(appState);
      return renderCustomerReportsView(state);
    }

    function renderReports(container, appState) {
      if (!container) return;
      const state = getState(appState);
      container.innerHTML = renderCustomerReportsView(state);
      attachCustomerReportsEvents(container);
    }

    function attachReports(container) {
      if (!container) return;
      attachCustomerReportsEvents(container);
    }

    return {
      template: templateReports,
      render: renderReports,
      attach: attachReports
    };
  });
})();
