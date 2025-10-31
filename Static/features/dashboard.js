(function () {
  if (!window.Weld) return;
  const features = window.Weld.features || (window.Weld.features = {});

  features.dashboard = {
    render(container, appState) {
      if (!container) return;
      const state = appState || window.state || {};
      container.innerHTML = renderDashboard(state);
      attachDashboardEvents(container);
    },
  };

function renderDashboard(state) {
  const messages = Array.isArray(state.messages)
    ? state.messages.slice().sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime())
    : [];

  const rowsMarkup = messages
    .map(message => {
      const reasons = Array.isArray(message.reasons) ? message.reasons.map(reasonById).filter(Boolean) : [];
      const reasonChips = reasons
        .map(reason => `<span class="detail-chip">${WeldUtil.escapeHtml(reason.label)}</span>`)
        .join("");
      const client =
        state.clients && message && Number.isFinite(message.clientId)
          ? state.clients.find(item => Number(item.id) === Number(message.clientId))
          : null;
      const reporterName = message?.reporterName ? WeldUtil.escapeHtml(message.reporterName) : "Reporter";
      const reporterEmail = message?.reporterEmail ? WeldUtil.escapeHtml(message.reporterEmail) : "n/a";
      const clientName = client ? WeldUtil.escapeHtml(client.name) : "Client view";
      const clientOrgId = client?.organizationId ? WeldUtil.escapeHtml(client.organizationId) : "Org ID pending";
      const reportedAt = message?.reportedAt ? formatDateTime(message.reportedAt) : "Unknown";
      const status = WeldUtil.escapeHtml(message?.status || MessageStatus.PENDING);
      const isPending = message?.status === MessageStatus.PENDING;
      const approvePoints = Number(message?.pointsOnApproval) || 0;
      const capturePoints = Number(message?.pointsOnMessage) || 0;
      const totalPoints = capturePoints + (message?.status === MessageStatus.APPROVED ? approvePoints : 0);
      const actionsMarkup = isPending
        ? `<div class="table-actions">
            <button type="button" class="button-pill button-pill--primary" data-action="approve" data-message="${WeldUtil.escapeHtml(
              String(message.id)
            )}">Approve</button>
            <button type="button" class="button-pill button-pill--critical" data-action="reject" data-message="${WeldUtil.escapeHtml(
              String(message.id)
            )}">Reject</button>
          </div>`
        : `<span class="detail-table__meta">Decision recorded</span>`;
      return `
        <tr>
          <td>${reportedAt}</td>
          <td>
            <strong>${reporterName}</strong>
            <span class="detail-table__meta">${reporterEmail}</span>
          </td>
          <td>
            <strong>${clientName}</strong>
            <span class="detail-table__meta">${clientOrgId}</span>
          </td>
          <td>
            <strong>${WeldUtil.escapeHtml(message?.subject || "Suspicious message")}</strong>
            ${reasonChips ? `<div class="detail-table__chips">${reasonChips}</div>` : ""}
          </td>
          <td>
            <div class="detail-table__points">
              <span>+${formatNumber(capturePoints)}</span>
              ${message?.status === MessageStatus.APPROVED ? `<span>+${formatNumber(approvePoints)}</span>` : ""}
              <strong>= ${formatNumber(totalPoints)}</strong>
            </div>
          </td>
          <td>
            <span class="badge" data-state="${status}">${status}</span>
            ${actionsMarkup}
          </td>
        </tr>
      `;
    })
    .join("");

  const tableMarkup = messages.length
    ? `
      <div class="detail-table-wrapper">
        <table class="detail-table detail-table--reports detail-table--client">
          <thead>
            <tr>
              <th>Reported</th>
              <th>Reporter</th>
              <th>Client</th>
              <th>Subject &amp; reasons</th>
              <th>Points</th>
              <th>Status &amp; actions</th>
            </tr>
          </thead>
          <tbody>${rowsMarkup}</tbody>
        </table>
      </div>
    `
    : `<div class="customer-detail__empty">No security follow-up yet. Use the add-in journey to generate the first report.</div>`;

  return `
    <section class="client-catalogue__intro">
      <span class="client-catalogue__eyebrow">Security team dashboard</span>
      <h1>Approve reports and talk through the audit trail.</h1>
      <p>Highlight how reviewers approve submissions, gift bonus points, and export a full audit log without leaving the workflow.</p>
      <div class="client-rewards__actions">
        <button type="button" class="button-pill button-pill--primary" id="download-csv-button">Download CSV</button>
      </div>
    </section>
    ${tableMarkup}
  `;
}



function attachDashboardEvents(container) {
  if (!container) return;
  const csvBtn = container.querySelector("#download-csv-button");
  if (csvBtn) {
    csvBtn.addEventListener("click", () => {
      openDialog({
        title: "CSV export ready",
        description: "In the real product this downloads a CSV. For the demo, use this cue to talk through the audit trail.",
        confirmLabel: "Got it",
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

})();
