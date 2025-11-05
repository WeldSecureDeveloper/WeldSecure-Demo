(function () {
  if (window.WeldReportTable) return;

  const global = window;
  const WeldUtil = global.WeldUtil || {};
  const AppData = global.AppData || {};
  const MessageStatus = AppData.MessageStatus || {};

  const escapeHtml =
    typeof WeldUtil.escapeHtml === "function"
      ? value => WeldUtil.escapeHtml(String(value ?? ""))
      : value =>
          String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");

  const formatNumberSafe =
    typeof WeldUtil.formatNumberSafe === "function"
      ? WeldUtil.formatNumberSafe
      : value => {
          const numeric = Number(value);
          if (!Number.isFinite(numeric)) return "0";
          return numeric.toLocaleString("en-GB");
        };

  const formatDateTimeSafe =
    typeof WeldUtil.formatDateTimeSafe === "function"
      ? WeldUtil.formatDateTimeSafe
      : value => (value ? String(value) : "Unknown");

  function describeActivity(value) {
    if (typeof global.describeActivityType === "function") {
      return global.describeActivityType(value);
    }
    return null;
  }

  function lookupReason(id, state) {
    if (!id) return null;
    if (typeof global.reasonById === "function") {
      const viaGlobal = global.reasonById(id);
      if (viaGlobal && viaGlobal.label) return viaGlobal;
    }
    const reasonSets = [
      state?.settings?.reporter?.reasons,
      global.state?.settings?.reporter?.reasons
    ].filter(Array.isArray);
    for (const reasons of reasonSets) {
      const match = reasons.find(item => item && item.id === id);
      if (match) return match;
    }
    return null;
  }

  function buildReasonChips(message, state) {
    const reasonIds = Array.isArray(message?.reasons) ? message.reasons : [];
    if (reasonIds.length === 0) return "";
    const chips = reasonIds
      .map(id => {
        const reason = lookupReason(id, state);
        if (!reason || !reason.label) return null;
        return `<span class="detail-chip">${escapeHtml(reason.label)}</span>`;
      })
      .filter(Boolean);
    return chips.length ? `<div class="detail-table__chips">${chips.join("")}</div>` : "";
  }

  function normalizeStatus(value) {
    const raw = typeof value === "string" ? value : "";
    const normalized = raw.toLowerCase();
    const approved = String(MessageStatus.APPROVED || "approved").toLowerCase();
    const rejected = String(MessageStatus.REJECTED || "rejected").toLowerCase();
    const pending = String(MessageStatus.PENDING || "pending").toLowerCase();
    if (normalized === approved) return MessageStatus.APPROVED || "approved";
    if (normalized === rejected) return MessageStatus.REJECTED || "rejected";
    if (normalized === pending) return MessageStatus.PENDING || "pending";
    return MessageStatus.PENDING || raw || "pending";
  }

  function sanitize(value, fallback = "") {
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed) return escapeHtml(trimmed);
    }
    if (fallback === null || fallback === undefined) return "";
    return escapeHtml(fallback);
  }

  function findClientDetails(state, message) {
    const clients = Array.isArray(state?.clients) ? state.clients : [];
    const id = message?.clientId;
    if (!Number.isFinite(Number(id))) {
      return {
        name: "Client view",
        orgId: "Org ID pending"
      };
    }
    const match =
      clients.find(client => Number(client?.id) === Number(id)) ||
      (Array.isArray(global.state?.clients)
        ? global.state.clients.find(client => Number(client?.id) === Number(id))
        : null);
    if (!match) {
      return {
        name: "Client view",
        orgId: "Org ID pending"
      };
    }
    return {
      name: match.name,
      orgId: match.organizationId
    };
  }

  function buildPointsMarkup(capture, approval, showApproval) {
    const captureLabel = formatNumberSafe(capture);
    const approvalLabel = formatNumberSafe(approval);
    const totalLabel = formatNumberSafe(showApproval ? capture + approval : capture);
    const approvalSegment = showApproval ? `<span>+${approvalLabel}</span>` : "";
    return `<div class="detail-table__points">
      <span>+${captureLabel}</span>
      ${approvalSegment}
      <strong>= ${totalLabel}</strong>
    </div>`;
  }

  function prepareRows(messages, options = {}) {
    if (!Array.isArray(messages) || messages.length === 0) return [];
    const state = options.state || global.state || {};
    return messages.map(message => {
      const reportedAtDisplay = formatDateTimeSafe(message?.reportedAt);
      const reporterName = sanitize(message?.reporterName, "Reporter");
      const reporterEmail = sanitize(message?.reporterEmail, "n/a");
      const { name: clientNameRaw, orgId: clientOrgIdRaw } = findClientDetails(state, message);
      const clientName = sanitize(clientNameRaw, "Client view");
      const clientOrgId = sanitize(clientOrgIdRaw, "Org ID pending");
      const subject = sanitize(message?.subject, "Suspicious message");

      const reasonChipsMarkup = buildReasonChips(message, state);

      const capturePoints = Number(message?.pointsOnMessage) || 0;
      const approvalPoints = Number(message?.pointsOnApproval) || 0;
      const statusNormalized = normalizeStatus(message?.status);
      const isApproved = statusNormalized === (MessageStatus.APPROVED || "approved");
      const isPending = statusNormalized === (MessageStatus.PENDING || "pending");

      const pointsMarkup = buildPointsMarkup(capturePoints, approvalPoints, isApproved);

      const statusDisplay = sanitize(statusNormalized);
      const statusBadgeMarkup = `<span class="badge" data-state="${statusDisplay}">${statusDisplay}</span>`;

      const activityLabel = sanitize(describeActivity(message?.activityType), "");
      const hasActivityLabel = Boolean(activityLabel);
      const activityLocation =
        typeof message?.incidentLocation === "string" ? sanitize(message.incidentLocation) : "";

      return {
        idRaw: message?.id,
        idAttr: sanitize(String(message?.id ?? "")),
        message,
        reportedAtDisplay,
        reporterName,
        reporterEmail,
        clientName,
        clientOrgId,
        subject,
        reasonChipsMarkup,
        pointsMarkup,
        capturePoints,
        approvalPoints: isApproved ? approvalPoints : 0,
        totalPoints: isApproved ? capturePoints + approvalPoints : capturePoints,
        status: statusNormalized,
        statusDisplay,
        statusBadgeMarkup,
        isPending,
        isApproved,
        activityLabel: hasActivityLabel ? activityLabel : "",
        activityLocation,
        hasActivityLabel,
        hasActivityLocation: Boolean(activityLocation)
      };
    });
  }

  window.WeldReportTable = {
    prepareRows
  };
})();
