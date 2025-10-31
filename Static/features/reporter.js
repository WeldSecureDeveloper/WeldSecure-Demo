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
            <span class="points-celebration__points-value">+${formatNumber(totalAwarded)}</span>
            <span class="points-celebration__points-caption">total points earned</span>
          </div>
        </div>
        <div class="points-celebration__ticker">
          ${tickerMarkup}
        </div>
        <div class="points-celebration__bursts">
          ${burstsMarkup}
        </div>
        <div class="points-celebration__sparkles" aria-hidden="true">
          ${sparklesMarkup}
        </div>
      </div>
      <div class="addin-success__body">
        <h1>Thanks for reporting.</h1>
        <p>Security has everything they need. Keep sharing anything that feels suspicious — it keeps the team safe and earns you more recognition.</p>
        <div class="addin-success__actions">
          <button type="button" class="addin-primary" data-addin-action="another-report">Report another email</button>
          <button type="button" class="addin-secondary" data-addin-action="view-rewards">View rewards</button>
        </div>
      </div>
    </div>
  `;
    const screenMarkup = screen === "success" ? successView : reportForm;

    return `
    <div class="addin-page">
      <div class="addin-shell">
        <header class="addin-header">
          <div class="addin-header__top">
            <div class="addin-header__title">
              ${screen === "success" ? `<button class="addin-header__back" data-addin-back aria-label="Back to add-in"><span aria-hidden="true">←</span></button>` : ""}
              ${
                screen === "success"
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
                  <path class="inline" d="m261.5 276.5-40.1-14.4-24.3 32.5-11.6-38.8c-1-.3-20 3-20 2.2 0-.8 15.8-24.3 15.5-25.1l-23.9-33 40.8.7 14.1-38.9 13 38.7 41 .1-32.5 24.2z" fill="#fff3b0"></path>
                </svg>
              </span>
              <span class="addin-points__value">${formatNumber(afterBalance)} pts</span>
            </div>
          </div>
          <p class="addin-header__subtitle" id="addin-header-subtitle">Report suspicious email directly from Outlook. Security receives full context so they can take action quickly.</p>
        </header>
        <main class="addin-main" aria-describedby="addin-header-subtitle" data-addin-screen="${WeldUtil.escapeHtml(screen)}">
          ${screenMarkup}
        </main>
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
          const generatedMessageId = generateId("MSG").toUpperCase();

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
