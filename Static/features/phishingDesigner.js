(function () {
  if (!window.Weld) return;

  const features = window.Weld.features || (window.Weld.features = {});
  if (features.phishingDesigner && typeof features.phishingDesigner.render === "function") {
    // Allow redefinition for hot reload scenarios
    delete features.phishingDesigner;
  }

  const designerFeature = (features.phishingDesigner = {});
  const AppData = window.AppData || {};
  const DirectoryData = window.DirectoryData || {};
  const WeldUtil = window.WeldUtil || {};
  const WeldServices = window.WeldServices || {};

  const blueprint = AppData.phishingBlueprints || {};
  const blueprintTemplates = Array.isArray(blueprint.templates) ? blueprint.templates : [];
  const blueprintSignals = Array.isArray(blueprint.signals) ? blueprint.signals : [];
  const blueprintTokens = Array.isArray(blueprint.tokens) ? blueprint.tokens : [];
  const channelOptions =
    Array.isArray(AppData.PHISHING_CHANNELS) && AppData.PHISHING_CHANNELS.length > 0
      ? AppData.PHISHING_CHANNELS
      : ["email", "sms", "teams", "slack", "qr"];

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
  const escapeAttr = value => escapeHtml(value).replace(/"/g, "&quot;");

  const getState =
    typeof WeldUtil.getState === "function"
      ? WeldUtil.getState
      : appState => (appState && typeof appState === "object" ? appState : window.state || {});

  const getDepartments = () =>
    Array.isArray(DirectoryData.departments) ? DirectoryData.departments : [];

  const formatDate = value => {
    if (!value) return "";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "";
    return parsed.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  };

  const formatTime = value => {
    if (!value) return "";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "";
    return parsed.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  };

  const toInputDateValue = iso => {
    if (!iso) return "";
    const parsed = new Date(iso);
    if (Number.isNaN(parsed.getTime())) return "";
    const pad = num => String(num).padStart(2, "0");
    return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}T${pad(
      parsed.getHours()
    )}:${pad(parsed.getMinutes())}`;
  };

  const serializeRichText = text => {
    if (!text) return "";
    const tokenPattern = /(\{\{[A-Z0-9_]+\}\})/gi;
    const parts = String(text).split(tokenPattern);
    return parts
      .map(segment => {
        if (!segment) return "";
        if (/^\{\{[A-Z0-9_]+\}\}$/i.test(segment)) {
          return `<span class="phish-designer__token">${escapeHtml(segment)}</span>`;
        }
        return escapeHtml(segment).replace(/\n/g, "<br />");
      })
      .join("");
  };

  const renderTokenButtons = () => {
    if (!blueprintTokens.length) return "";
    return `
      <div class="phish-designer__token-bar">
        ${blueprintTokens
          .map(
            token => `
              <button
                type="button"
                class="button-pill button-pill--ghost"
                data-designer-action="insert-token"
                data-token="${escapeAttr(token)}"
              >
                ${escapeHtml(token)}
              </button>
            `
          )
          .join("")}
      </div>
    `;
  };

  const getDesignerState = state => {
    const slice = state && typeof state.phishingDesigner === "object" ? state.phishingDesigner : {};
    const form = slice.form && typeof slice.form === "object" ? slice.form : {};
    return {
      activeTemplateId: slice.activeTemplateId || form.id || null,
      drafts: Array.isArray(slice.drafts) ? slice.drafts : [],
      form: {
        ...form,
        sender:
          form.sender && typeof form.sender === "object"
            ? form.sender
            : { displayName: "", address: "" },
        signalIds: Array.isArray(form.signalIds) ? form.signalIds : [],
        targetIds: Array.isArray(form.targetIds) ? form.targetIds : []
      },
      validation: slice.validation && typeof slice.validation === "object" ? slice.validation : {}
    };
  };

  const statusLabel = status => {
    switch ((status || "draft").toLowerCase()) {
      case "staged":
        return "Staged";
      case "published":
        return "Published";
      default:
        return "Draft";
    }
  };

  const statusTone = status => {
    switch ((status || "draft").toLowerCase()) {
      case "staged":
        return "tone-info";
      case "published":
        return "tone-success";
      default:
        return "tone-muted";
    }
  };

  const renderValidationSummary = validation => {
    const entries = validation && typeof validation === "object" ? Object.values(validation) : [];
    if (!entries || entries.length === 0) return "";
    return `
      <div class="phish-designer__validation" role="alert">
        <strong>Complete required fields</strong>
        <ul>
          ${entries.map(entry => `<li>${escapeHtml(entry)}</li>`).join("")}
        </ul>
      </div>
    `;
  };

  const renderDraftCard = (draft, isActive) => {
    const signals = Array.isArray(draft.signalIds) ? draft.signalIds.length : 0;
    const targets = Array.isArray(draft.targetIds) ? draft.targetIds.length : 0;
    const status = statusLabel(draft.status);
    const launchDate = draft.lastPublishedAt || draft.updatedAt;
    return `
      <article class="phish-designer__draft-card${isActive ? " phish-designer__draft-card--active" : ""}">
        <div class="phish-designer__draft-card-header">
          <div>
            <p class="phish-designer__eyebrow">${escapeHtml(draft.channel || "email")}</p>
            <h3>${escapeHtml(draft.name || "Untitled draft")}</h3>
          </div>
          <span class="phish-designer__status ${statusTone(draft.status)}">${escapeHtml(status)}</span>
        </div>
        <p class="phish-designer__draft-meta">
          ${escapeHtml(draft.subject || "No subject yet")}
        </p>
        <dl class="phish-designer__draft-stats">
          <div>
            <dt>Signals</dt>
            <dd>${signals}</dd>
          </div>
          <div>
            <dt>Targets</dt>
            <dd>${targets}</dd>
          </div>
          <div>
            <dt>Updated</dt>
            <dd>${launchDate ? `${formatDate(launchDate)} · ${formatTime(launchDate)}` : "Just now"}</dd>
          </div>
        </dl>
        <div class="phish-designer__card-actions">
          <button
            type="button"
            class="button-pill button-pill--ghost"
            data-designer-action="load-draft"
            data-draft-id="${escapeAttr(draft.id)}"
          >
            Edit
          </button>
          <button
            type="button"
            class="button-pill button-pill--ghost"
            data-designer-action="duplicate"
            data-draft-id="${escapeAttr(draft.id)}"
          >
            Duplicate
          </button>
          <button
            type="button"
            class="button-pill button-pill--primary"
            data-designer-action="launch"
            data-draft-id="${escapeAttr(draft.id)}"
          >
            Launch now
          </button>
        </div>
      </article>
    `;
  };

  const renderTemplateBoard = (drafts, activeId) => {
    const hasDrafts = drafts.length > 0;
    const templateButtons = blueprintTemplates.slice(0, 3).map(template => {
      return `
        <button
          type="button"
          class="button-pill button-pill--ghost"
          data-designer-action="apply-template"
          data-template-id="${escapeAttr(template.id)}"
        >
          ${escapeHtml(template.name)}
        </button>
      `;
    });
    return `
      <section class="phish-designer__board">
        <header class="phish-designer__board-header">
          <div>
            <p class="phish-designer__eyebrow">Draft library</p>
            <h2>Saved simulations</h2>
            <p>Stage campaigns and revisit drafts to iterate quickly.</p>
          </div>
          <div class="phish-designer__board-actions">
            <button
              type="button"
              class="button-pill button-pill--ghost"
              data-designer-action="new-blank"
            >
              New blank draft
            </button>
            ${templateButtons.join("")}
          </div>
        </header>
        <div class="phish-designer__board-grid">
          ${
            hasDrafts
              ? drafts
                  .map(draft => renderDraftCard(draft, activeId && draft.id === activeId))
                  .join("")
              : `<article class="phish-designer__empty">
                  <h3>No drafts yet</h3>
                  <p>Start from scratch or pull in a template from the Weld playbook.</p>
                </article>`
          }
        </div>
      </section>
    `;
  };

  const renderChannelOptions = current => {
    return channelOptions
      .map(channel => {
        const selected = channel === current ? "selected" : "";
        return `<option value="${escapeAttr(channel)}" ${selected}>${escapeHtml(
          channel.charAt(0).toUpperCase() + channel.slice(1)
        )}</option>`;
      })
      .join("");
  };

  const renderSignals = form => {
    const selected = new Set(Array.isArray(form.signalIds) ? form.signalIds : []);
    return `
      <section class="phish-designer__section">
        <header>
          <div>
            <p class="phish-designer__eyebrow">Signals</p>
            <h3>Red flags reporters should catch</h3>
          </div>
        </header>
        <div class="phish-designer__signal-grid">
          ${blueprintSignals
            .map(signal => {
              const active = selected.has(signal.id);
              return `
                <button
                  type="button"
                  class="phish-designer__signal-chip${active ? " is-active" : ""}"
                  data-designer-action="toggle-signal"
                  data-signal-id="${escapeAttr(signal.id)}"
                  aria-pressed="${active ? "true" : "false"}"
                >
                  <span>${escapeHtml(signal.label)}</span>
                  <small>${escapeHtml(signal.severity || "medium")}</small>
                </button>
              `;
            })
            .join("")}
        </div>
      </section>
    `;
  };

  const renderTargets = (form, departments) => {
    const selected = new Set(Array.isArray(form.targetIds) ? form.targetIds : []);
    const sortedDepartments = departments.slice(0).sort((a, b) => {
      const aName = a && a.name ? a.name : "";
      const bName = b && b.name ? b.name : "";
      return aName.localeCompare(bName);
    });
    return `
      <section class="phish-designer__section">
        <header>
          <div>
            <p class="phish-designer__eyebrow">Targeting</p>
            <h3>Select departments or segments</h3>
          </div>
          <span>${selected.size} selected</span>
        </header>
        <div class="phish-designer__target-grid">
          ${
            sortedDepartments.length
              ? sortedDepartments
                  .map(department => {
                    const checked = selected.has(department.id) ? "checked" : "";
                    return `
                      <label class="phish-designer__target-row">
                        <input
                          type="checkbox"
                          value="${escapeAttr(department.id)}"
                          data-designer-target
                          ${checked}
                        />
                        <div>
                          <strong>${escapeHtml(department.name)}</strong>
                          <span>${escapeHtml(department.description || "Department target")}</span>
                        </div>
                      </label>
                    `;
                  })
                  .join("")
              : `<p class="phish-designer__muted">Directory data unavailable.</p>`
          }
        </div>
      </section>
    `;
  };

  const renderEnvelope = form => {
    return `
      <section class="phish-designer__section">
        <header>
          <div>
            <p class="phish-designer__eyebrow">Envelope</p>
            <h3>Overview</h3>
          </div>
        </header>
        <div class="phish-designer__field-grid">
          <label class="phish-designer__field">
            <span>Name</span>
            <input
              type="text"
              value="${escapeAttr(form.name || "")}"
              placeholder="Finance escalation"
              data-designer-field="name"
            />
          </label>
          <label class="phish-designer__field">
            <span>Channel</span>
            <select data-designer-field="channel">
              ${renderChannelOptions(form.channel)}
            </select>
          </label>
        </div>
        <div class="phish-designer__field-grid">
          <label class="phish-designer__field">
            <span>Sender display name</span>
            <input
              type="text"
              value="${escapeAttr(form.sender.displayName || "")}"
              placeholder="Treasury Escalations"
              data-designer-field="sender.displayName"
            />
          </label>
          <label class="phish-designer__field">
            <span>Sender address</span>
            <input
              type="text"
              value="${escapeAttr(form.sender.address || "")}"
              placeholder="alerts@contoso-payments.com"
              data-designer-field="sender.address"
            />
          </label>
        </div>
      </section>
    `;
  };

  const renderBody = form => {
    return `
      <section class="phish-designer__section">
        <header>
          <div>
            <p class="phish-designer__eyebrow">Body copy</p>
            <h3>What reporters will see</h3>
          </div>
        </header>
        <label class="phish-designer__field">
          <span>Subject line</span>
          <input
            type="text"
            value="${escapeAttr(form.subject || "")}"
            placeholder="Action required: validate supplier wire"
            data-designer-field="subject"
          />
        </label>
        <label class="phish-designer__field">
          <span>Message</span>
          <textarea
            rows="6"
            data-designer-field="body"
            placeholder="Draft the payload or paste an existing script..."
          >${escapeHtml(form.body || "")}</textarea>
        </label>
        ${renderTokenButtons()}
      </section>
    `;
  };

  const renderSchedule = form => {
    return `
      <section class="phish-designer__section">
        <header>
          <div>
            <p class="phish-designer__eyebrow">Scheduling</p>
            <h3>Optional launch timing</h3>
          </div>
        </header>
        <label class="phish-designer__field phish-designer__field--narrow">
          <span>Launch at</span>
          <input
            type="datetime-local"
            value="${escapeAttr(toInputDateValue(form.schedule))}"
            data-designer-field="schedule"
          />
        </label>
      </section>
    `;
  };

  const renderPreview = form => {
    const selectedSignals = new Set(Array.isArray(form.signalIds) ? form.signalIds : []);
    const signalBadges = blueprintSignals
      .filter(signal => selectedSignals.has(signal.id))
      .map(
        signal => `
          <span class="phish-designer__pill" data-severity="${escapeAttr(signal.severity || "medium")}">
            ${escapeHtml(signal.label)}
          </span>
        `
      )
      .join("");
    const bodyHtml = form.body
      ? form.body
          .split(/\n{2,}/)
          .map(paragraph => `<p>${serializeRichText(paragraph)}</p>`)
          .join("")
      : `<p class="phish-designer__muted">Start writing to preview the payload.</p>`;
    return `
      <aside class="phish-designer__preview-column">
        <div class="phish-designer__preview">
          <header class="phish-designer__preview-header">
            <div>
              <p class="phish-designer__eyebrow">${escapeHtml(form.channel || "email")}</p>
              <h3>${escapeHtml(form.subject || "Untitled payload")}</h3>
            </div>
            <span>${escapeHtml(form.sender.displayName || "Security Desk")}</span>
          </header>
          <div class="phish-designer__preview-signals">
            ${signalBadges || `<span class="phish-designer__muted">No signals tagged yet.</span>`}
          </div>
          <article class="phish-designer__preview-body">
            ${bodyHtml}
          </article>
        </div>
      </aside>
    `;
  };

  const renderWorkspace = (designerState, departments) => {
    const form = designerState.form;
    const validationCount = Object.keys(designerState.validation || {}).length;
    const disableLaunch = validationCount > 0;
    return `
      <section class="phish-designer__workspace">
        <div class="phish-designer__form-column">
          ${renderEnvelope(form)}
          ${renderBody(form)}
          ${renderSignals(form)}
          ${renderTargets(form, departments)}
          ${renderSchedule(form)}
          <div class="phish-designer__actions">
            <button
              type="button"
              class="button-pill button-pill--ghost"
              data-designer-action="save"
            >
              Save draft
            </button>
            <button
              type="button"
              class="button-pill button-pill--primary"
              data-designer-action="launch"
              ${disableLaunch ? "disabled" : ""}
            >
              Launch now
            </button>
          </div>
        </div>
        ${renderPreview(form)}
      </section>
    `;
  };

  let latestDesignerState = null;

  const renderView = state => {
    const designerState = getDesignerState(state);
    latestDesignerState = designerState;
    const departments = getDepartments();
    const activeDraftId = designerState.form.id || designerState.activeTemplateId || "";
    return `
      <div class="phish-designer" data-active-draft="${escapeAttr(activeDraftId || "")}">
        ${renderValidationSummary(designerState.validation)}
        ${renderTemplateBoard(designerState.drafts, designerState.activeTemplateId)}
        ${renderWorkspace(designerState, departments)}
      </div>
    `;
  };

  designerFeature.render = function render(container, appState) {
    if (!container) return;
    const state = getState(appState);
    container.innerHTML = renderView(state);
  };

  let boundContainer = null;
  let inputHandler = null;
  let clickHandler = null;
  let changeHandler = null;

  const detach = () => {
    if (!boundContainer) return;
    if (inputHandler) {
      boundContainer.removeEventListener("input", inputHandler);
    }
    if (clickHandler) {
      boundContainer.removeEventListener("click", clickHandler);
    }
    if (changeHandler) {
      boundContainer.removeEventListener("change", changeHandler);
    }
    boundContainer = null;
    inputHandler = null;
    clickHandler = null;
    changeHandler = null;
  };

  const getActiveDraftId = () => {
    if (!boundContainer) return null;
    const root = boundContainer.querySelector(".phish-designer");
    if (!root) return null;
    const draftId = root.getAttribute("data-active-draft");
    return draftId && draftId.length > 0 ? draftId : null;
  };

  const invokeService = (name, ...args) => {
    const fn = WeldServices && typeof WeldServices[name] === "function" ? WeldServices[name] : null;
    if (!fn) return null;
    return fn(...args);
  };

  const parseFieldPatch = (field, value) => {
    if (!field) return {};
    if (field === "schedule") {
      return { schedule: value ? new Date(value).toISOString() : null };
    }
    if (field.includes(".")) {
      const [root, nested] = field.split(".");
      if (root === "sender") {
        return { sender: { [nested]: value } };
      }
    }
    return { [field]: value };
  };

  const handleFieldInput = target => {
    const field = target.getAttribute("data-designer-field");
    if (!field) return;
    const draftId = getActiveDraftId();
    const value =
      target.type === "datetime-local"
        ? target.value
        : target.type === "number"
        ? target.valueAsNumber
        : target.value;
    const patch = parseFieldPatch(field, target.type === "datetime-local" ? value : value ?? "");
    invokeService("updatePhishingDraft", draftId, patch);
  };

  const toggleSignal = signalId => {
    if (!signalId) return;
    const current = latestDesignerState?.form?.signalIds
      ? latestDesignerState.form.signalIds.slice()
      : [];
    const exists = current.includes(signalId);
    const next = exists ? current.filter(id => id !== signalId) : [...current, signalId];
    invokeService("updatePhishingDraft", getActiveDraftId(), { signalIds: next });
  };

  const toggleTarget = (targetId, checked) => {
    if (!targetId) return;
    const current = latestDesignerState?.form?.targetIds
      ? latestDesignerState.form.targetIds.slice()
      : [];
    const next = checked
      ? current.includes(targetId)
        ? current
        : [...current, targetId]
      : current.filter(id => id !== targetId);
    invokeService("updatePhishingDraft", getActiveDraftId(), { targetIds: next });
  };

  const handleTokenInsert = token => {
    if (!token || !boundContainer) return;
    const textarea = boundContainer.querySelector('textarea[data-designer-field="body"]');
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const original = textarea.value || "";
    const nextValue = `${original.slice(0, start)}${token}${original.slice(end)}`;
    textarea.value = nextValue;
    invokeService("updatePhishingDraft", getActiveDraftId(), { body: nextValue });
  };

  const handleAction = (action, target) => {
    const draftId = target.getAttribute("data-draft-id") || getActiveDraftId();
    switch (action) {
      case "save":
        invokeService("createPhishingDraft");
        break;
      case "launch":
        invokeService("publishPhishingDraft", draftId);
        break;
      case "duplicate":
        invokeService("duplicatePhishingDraft", target.getAttribute("data-draft-id") || draftId);
        break;
      case "load-draft":
        invokeService("loadPhishingDraft", target.getAttribute("data-draft-id"));
        break;
      case "apply-template":
        invokeService("applyPhishingTemplate", target.getAttribute("data-template-id"));
        break;
      case "new-blank":
        invokeService("setPhishingDesignerForm", {
          id: null,
          name: "",
          channel: channelOptions[0] || "email",
          subject: "",
          body: "",
          signalIds: [],
          targetIds: [],
          schedule: null,
          sender: { displayName: "Security Desk", address: "security@weldsecure.com" }
        });
        break;
      case "insert-token":
        handleTokenInsert(target.getAttribute("data-token"));
        break;
      case "toggle-signal":
        toggleSignal(target.getAttribute("data-signal-id"));
        break;
      default:
        break;
    }
  };

  designerFeature.attach = function attach(container) {
    detach();
    if (!container) return;
    inputHandler = event => {
      const fieldTarget = event.target.closest("[data-designer-field]");
      if (fieldTarget) {
        handleFieldInput(fieldTarget);
      }
    };
    changeHandler = event => {
      const target = event.target;
      if (target && target.matches("[data-designer-target]")) {
        toggleTarget(target.value, target.checked);
      }
    };
    clickHandler = event => {
      const actionTarget = event.target.closest("[data-designer-action]");
      if (actionTarget) {
        event.preventDefault();
        handleAction(actionTarget.getAttribute("data-designer-action"), actionTarget);
      }
    };
    container.addEventListener("input", inputHandler);
    container.addEventListener("change", changeHandler);
    container.addEventListener("click", clickHandler);
    boundContainer = container;
  };

  designerFeature.destroy = function destroy() {
    detach();
  };
})();
