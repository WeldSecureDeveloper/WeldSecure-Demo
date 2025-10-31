(function () {
  if (!window.Weld) return;

  const features = window.Weld.features || (window.Weld.features = {});

  features.reporter = {
    render(container) {
      if (!container) return;
      container.innerHTML = renderAddIn();
      attachAddInEvents(container);
    },
  };

  function renderAddIn() {
    const screen = state.meta.addinScreen;
    const reporterSettings = state?.settings?.reporter || {};
    const reasonPrompt =
      typeof reporterSettings.reasonPrompt === "string" &&
      reporterSettings.reasonPrompt.trim().length > 0
        ? reporterSettings.reasonPrompt.trim()
        : DEFAULT_REPORTER_PROMPT;
    const emergencyLabel =
      typeof reporterSettings.emergencyLabel === "string" &&
      reporterSettings.emergencyLabel.trim().length > 0
        ? reporterSettings.emergencyLabel.trim()
        : DEFAULT_EMERGENCY_LABEL;
    const reporterReasons =
      Array.isArray(reporterSettings.reasons) && reporterSettings.reasons.length > 0
        ? reporterSettings.reasons
        : DEFAULT_REPORTER_REASONS;
    const reasonsMarkup = reporterReasons
      .map(reason => {
        if (!reason) return "";
        const reasonId =
          typeof reason.id === "string" && reason.id.trim().length > 0
            ? reason.id.trim()
            : null;
        const label =
          typeof reason.label === "string" && reason.label.trim().length > 0
            ? reason.label.trim()
            : null;
        if (!reasonId || !label) return "";
        return `
          <label>
            <input type="checkbox" value="${WeldUtil.escapeHtml(reasonId)}" />
            <span>${WeldUtil.escapeHtml(label)}</span>
          </label>
        `;
      })
      .filter(Boolean)
      .join("");
    const reportForm = `
      <div class="addin-body">
        <fieldset class="addin-field">
          <legend>${WeldUtil.escapeHtml(reasonPrompt)}</legend>
          <div class="addin-checkbox-list">
            ${reasonsMarkup}
          </div>
        </fieldset>
        <label class="addin-emergency">
          <input type="checkbox" value="clicked-link,opened-attachment,shared-credentials" />
          <span class="addin-emergency__text">${WeldUtil.escapeHtml(emergencyLabel)}</span>
        </label>
        <label class="addin-field addin-field--notes">
          Another reason or anything else we should know?
          <textarea rows="3" id="addin-notes" placeholder="Optional context for your security reviewers."></textarea>
        </label>
        <button class="addin-primary" id="addin-submit">Report</button>
      </div>
    `;

    const reportAward = Number.isFinite(state.meta.lastReportPoints) ? state.meta.lastReportPoints : 0;
    const badgeAward = Number.isFinite(state.meta.lastBadgePoints) ? state.meta.lastBadgePoints : 0;
    const afterBalance = Number.isFinite(state.meta.lastBalanceAfter) ? state.meta.lastBalanceAfter : state.customer.currentPoints;
    const fallbackTotal = reportAward + badgeAward;
    const previousBalance = Number.isFinite(state.meta.lastBalanceBefore)
      ? state.meta.lastBalanceBefore
      : Math.max(afterBalance - fallbackTotal, 0);
    let totalAwarded = Number.isFinite(state.meta.lastTotalAwarded)
      ? state.meta.lastTotalAwarded
      : afterBalance - previousBalance;
    if (!Number.isFinite(totalAwarded) || totalAwarded <= 0) {
      totalAwarded = Math.max(fallbackTotal, 0);
    }
    const tickerMarkup = renderPointsTicker(previousBalance, afterBalance, totalAwarded, 'data-points-ticker="total"');
    const badgeBurstLabel =
      Array.isArray(state.meta.lastBadgeIds) && state.meta.lastBadgeIds.length > 1 ? "Badges" : "Badge";
    const burstsMarkup = renderPointsBursts([
      { value: reportAward, variant: "report", label: "Report" },
      { value: badgeAward, variant: "badge", label: badgeBurstLabel }
    ]);
    const auroraLayers = [
      { angle: 12, hue: 258, delay: "0s", offsetX: -28, offsetY: -52, shape: "wave1" },
      { angle: -18, hue: 210, delay: "0.08s", offsetX: 6, offsetY: -44, shape: "wave2" },
      { angle: 28, hue: 42, delay: "0.15s", offsetX: -4, offsetY: 6, shape: "wave3" },
      { angle: -6, hue: 320, delay: "0.22s", offsetX: 18, offsetY: -18, shape: "wave4" },
      { angle: 34, hue: 168, delay: "0.3s", offsetX: -20, offsetY: -8, shape: "wave5" }
    ];
    const sparkles = [
      { x: -92, y: -68, delay: "0.32s", size: 18 },
      { x: -32, y: -8, delay: "0.45s", size: 14 },
      { x: 38, y: -10, delay: "0.58s", size: 12 },
      { x: 74, y: -44, delay: "0.72s", size: 16 }
    ];
    const auroraMarkup = auroraLayers
      .map(
        layer => `
          <span class="points-aurora__ribbon points-aurora__ribbon--${layer.shape}" style="--aurora-angle:${layer.angle}deg;--aurora-hue:${layer.hue};--aurora-delay:${layer.delay};--aurora-offset-x:${layer.offsetX}px;--aurora-offset-y:${layer.offsetY}px;"></span>
        `
      )
      .join("");
    const sparklesMarkup = sparkles
      .map(
        sparkle => `
          <span class="points-sparkle" style="--sparkle-x:${sparkle.x}px;--sparkle-y:${sparkle.y}px;--sparkle-delay:${sparkle.delay};--sparkle-size:${sparkle.size}px;"></span>
        `
      )
      .join("");
    const successView = `
      <div class="addin-success">
        <div class="points-celebration points-celebration--aurora">
          <div class="points-celebration__fireworks" aria-hidden="true">
            <div class="firework"></div>
            <div class="firework"></div>
            <div class="firework"></div>
          </div>
          <div class="points-celebration__halo"></div>
          <div class="points-aurora" aria-hidden="true">
            ${auroraMarkup}
          </div>
          <div class="points-celebration__bubble">
            <span class="points-celebration__label">Great catch</span>
            <div class="points-celebration__points">
              <span class="points-celebration__star" aria-hidden="true">
                <svg
                  class="badge"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 360 360"
                  preserveAspectRatio="xMidYMid meet"
                  focusable="false"
                >
                  <circle class="outer" fill="#F9D535" stroke="#fff" stroke-width="8" stroke-linecap="round" cx="180" cy="180" r="157"></circle>
                  <circle class="inner" fill="#DFB828" stroke="#fff" stroke-width="8" cx="180" cy="180" r="108.3"></circle>
                  <path class="inline" d="M89.4 276.7c-26-24.2-42.2-58.8-42.2-97.1 0-22.6 5.6-43.8 15.5-62.4m234.7.1c9.9 18.6 15.4 39.7 15.4 62.2 0 38.3-16.2 72.8-42.1 97" stroke="#CAA61F" stroke-width="7" stroke-linecap="round" fill="none"></path>
                  <g class="star">
                    <path fill="#F9D535" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" d="M180 107.8l16.9 52.1h54.8l-44.3 32.2 16.9 52.1-44.3-32.2-44.3 32.2 16.9-52.1-44.3-32.2h54.8z"></path>
                    <circle fill="#DFB828" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" cx="180" cy="107.8" r="4.4"></circle>
                    <circle fill="#DFB828" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" cx="223.7" cy="244.2" r="4.4"></circle>
                    <circle fill="#DFB828" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" cx="135.5" cy="244.2" r="4.4"></circle>
                    <circle fill="#DFB828" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" cx="108.3" cy="160.4" r="4.4"></circle>
                    <circle fill="#DFB828" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" cx="251.7" cy="160.4" r="4.4"></circle>
                  </g>
                </svg>
              </span>
              <span class="points-celebration__award">
                <span class="points-celebration__award-value" data-celebration-award>+0</span>
                <span class="points-celebration__award-unit">pts</span>
              </span>
              ${burstsMarkup}
            </div>
          </div>
          <div class="points-sparkles" aria-hidden="true">
            ${sparklesMarkup}
          </div>
        </div>
        <div class="addin-success__badge" data-badge-showcase aria-live="polite"></div>
        <p>The security team will review your report shortly. Your points are available immediately.</p>
        <div class="addin-actions">
          <button class="addin-cta addin-cta--primary" id="addin-view-rewards">
            ${WeldUtil.renderIcon("gift", "xs")}
            <span>Rewards</span>
          </button>
        </div>
      </div>
    `;

    const headerPointsDisplay =
      screen === "success"
        ? tickerMarkup
        : `<span class="addin-points__value">${formatNumber(state.customer.currentPoints)}</span>`;
    const showBackNav = screen === "success";
    const backButtonMarkup = showBackNav
      ? `<button type="button" class="addin-header__back" data-addin-back aria-label="Back to report form">
          <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
            <path d="M12.94 4.44a1 1 0 0 1 0 1.41L9.29 9.5l3.65 3.65a1 1 0 1 1-1.41 1.41l-4.36-4.36a1 1 0 0 1 0-1.41l4.36-4.36a1 1 0 0 1 1.41 0z" fill="currentColor"/>
          </svg>
        </button>`
      : "";

    return `
      <div class="addin-page">
        <div class="addin-shell">
          <header class="addin-header">
            <div class="addin-header__top">
              <div class="addin-header__title">
                ${backButtonMarkup}
                ${
                  showBackNav
                    ? ""
                    : `<div class="addin-logo">W</div>`
                }
              </div>
              <div class="addin-points" aria-live="polite">
                <span class="addin-points__star" aria-hidden="true">
                  <svg
                    class="badge"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 360 360"
                    preserveAspectRatio="xMidYMid meet"
                    focusable="false"
                  >
                    <circle class="outer" fill="#F9D535" stroke="#fff" stroke-width="8" stroke-linecap="round" cx="180" cy="180" r="157"></circle>
                    <circle class="inner" fill="#DFB828" stroke="#fff" stroke-width="8" cx="180" cy="180" r="108.3"></circle>
                    <path class="inline" d="M89.4 276.7c-26-24.2-42.2-58.8-42.2-97.1 0-22.6 5.6-43.8 15.5-62.4m234.7.1c9.9 18.6 15.4 39.7 15.4 62.2 0 38.3-16.2 72.8-42.1 97" stroke="#CAA61F" stroke-width="7" stroke-linecap="round" fill="none"></path>
                    <g class="star">
                      <path fill="#F9D535" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" d="M180 107.8l16.9 52.1h54.8l-44.3 32.2 16.9 52.1-44.3-32.2-44.3 32.2 16.9-52.1-44.3-32.2h54.8z"></path>
                      <circle fill="#DFB828" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" cx="180" cy="107.8" r="4.4"></circle>
                      <circle fill="#DFB828" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" cx="223.7" cy="244.2" r="4.4"></circle>
                      <circle fill="#DFB828" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" cx="135.5" cy="244.2" r="4.4"></circle>
                      <circle fill="#DFB828" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" cx="108.3" cy="160.4" r="4.4"></circle>
                      <circle fill="#DFB828" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" cx="251.7" cy="160.4" r="4.4"></circle>
                    </g>
                  </svg>
                </span>
                ${headerPointsDisplay}
              </div>
            </div>
            <div class="addin-header__body">
              <h1>Report with Weld</h1>
              <p>Flag anything suspicious, earn recognition, and protect your team.</p>
            </div>
            <div class="addin-status">
              <span>Signed in</span>
              <strong>${WeldUtil.escapeHtml(state.customer.name)}</strong>
            </div>
          </header>
          ${screen === "report" ? reportForm : successView}
        </div>
      </div>
    `;
  }

  function attachAddInEvents(container) {
    if (state.meta.addinScreen === "report") {
      teardownBadgeShowcase();
      const submitBtn = container.querySelector("#addin-submit");
      const emergencyInputs = container.querySelectorAll('.addin-emergency input[type="checkbox"]');
      if (emergencyInputs.length > 0) {
        emergencyInputs.forEach(input => {
          input.checked = false;
        });
      }
      if (submitBtn) {
        submitBtn.addEventListener("click", () => {
          const notesInput = container.querySelector("#addin-notes");
          const reasonCheckboxes = Array.from(
            container.querySelectorAll('.addin-checkbox-list input[type="checkbox"]')
          )
            .filter(input => input.checked)
            .map(input => input.value)
            .map(value => (typeof value === "string" ? value.trim() : ""))
            .filter(Boolean);
          const notesValue = notesInput ? notesInput.value.trim() : "";

          if (reasonCheckboxes.length === 0 && !notesValue) {
            openDialog({
              title: "Add a reason",
              description: "Select a reason or share additional details so security can triage quickly.",
              confirmLabel: "Close"
            });
            return;
          }

          const primaryReason = reasonById(reasonCheckboxes[0]);
          const generatedSubject = primaryReason
            ? `Suspicious email: ${primaryReason.label}`
            : notesValue
            ? `Suspicious email: ${notesValue.slice(0, 60)}`
            : "Suspicious email reported";
          const generatedMessageId = WeldUtil.generateId("MSG").toUpperCase();

          const emergencySelections = Array.from(container.querySelectorAll('.addin-emergency input[type="checkbox"]'))
            .filter(input => input.checked)
            .flatMap(input => input.value.split(","))
            .map(item => item.trim())
            .filter(Boolean);

          reportMessage({
            subject: generatedSubject,
            messageId: generatedMessageId,
            reasons: reasonCheckboxes,
            reporterName: state.customer.name,
            reporterEmail: state.customer.email,
            notes: notesValue,
            emergencyFlags: emergencySelections,
            origin: "addin"
          });
        });
      }
    } else {
      if (state.meta.addinScreen === "success") {
        setupCelebrationReplay(container);
        setupBadgeShowcase(container);
        const backControl = container.querySelector("[data-addin-back]");
        if (backControl && backControl.dataset.backBound !== "true") {
          backControl.dataset.backBound = "true";
          backControl.addEventListener("click", () => {
            revertLastReportAward();
          });
        }
      } else {
        teardownBadgeShowcase();
      }
      const viewRewards = container.querySelector("#addin-view-rewards");
      if (viewRewards) {
        viewRewards.addEventListener("click", () => {
          setRole("customer", "customer");
        });
      }
    }
  }
})();



