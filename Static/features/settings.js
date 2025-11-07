(function () {
  if (!window.Weld) {
    window.Weld = {};
  }
  const settingsFeature = window.Weld.settings || (window.Weld.settings = {});

  const AppData = window.AppData || {};
  const SETTINGS_CATEGORIES = AppData.SETTINGS_CATEGORIES || [];
  const DEFAULT_REPORTER_PROMPT = AppData.DEFAULT_REPORTER_PROMPT || "";
  const DEFAULT_EMERGENCY_LABEL = AppData.DEFAULT_EMERGENCY_LABEL || "";
  const DEFAULT_REPORTER_REASONS = AppData.DEFAULT_REPORTER_REASONS || [];
  const THEME_OPTIONS = [
    {
      id: "light",
      label: "Light",
      description: "Bright surfaces and punchy gradients"
    },
    {
      id: "dark",
      label: "Dark",
      description: "High-contrast styling for low-light viewing"
    }
  ];

  const WeldState = window.WeldState;
  const WeldUtil = window.WeldUtil || {};

  const getState =
    typeof WeldUtil.getState === "function"
      ? WeldUtil.getState
      : appState => {
          if (appState && typeof appState === "object") return appState;
          if (window.state && typeof window.state === "object") return window.state;
          if (window.Weld && typeof window.Weld.state === "object") return window.Weld.state;
          return {};
        };

  function resolveActiveSettingsCategory(state) {
    if (!Array.isArray(SETTINGS_CATEGORIES) || SETTINGS_CATEGORIES.length === 0) return null;
    const storedId = state?.meta?.settingsCategory;
    const matched = SETTINGS_CATEGORIES.find(
      category => category.id === storedId && !category.disabled
    );
    if (matched) return matched;
    const fallback = SETTINGS_CATEGORIES.find(category => !category.disabled);
    return fallback || SETTINGS_CATEGORIES[0];
  }

  function ensureSettingsRoot() {
    let root = document.getElementById("settings-root");
    if (!root) {
      root = document.createElement("div");
      root.id = "settings-root";
      document.body.appendChild(root);
    }
    return root;
  }

  function ensureSettingsShortcuts() {
    if (window.__weldSettingsEscape__) return;
    document.addEventListener("keydown", event => {
      if (event.key !== "Escape") return;
      const state = getState();
      if (!state.meta?.settingsOpen) return;
      if (typeof window.closeSettings === "function") {
        window.closeSettings();
      }
    });
    window.__weldSettingsEscape__ = true;
  }

  function escapeSettingsSelector(value) {
    if (!value) return "";
    if (typeof CSS !== "undefined" && CSS && typeof CSS.escape === "function") {
      return CSS.escape(value);
    }
    return String(value).replace(/([ #;?%&,.+*~':"!^$[\]()=>|/@])/g, "\\$1");
  }

  function reporterReasonRowTemplate(reason, index) {
    const source = reason || {};
    const baseId =
      typeof source.id === "string" && source.id.trim().length > 0
        ? source.id.trim()
        : `reason-${index + 1}`;
    const id = WeldUtil.escapeHtml(baseId);
    const value =
      typeof source.label === "string" && source.label.trim().length > 0
        ? WeldUtil.escapeHtml(source.label.trim())
        : "";
    return `
    <div class="settings-reason" data-reason-row="${id}">
      <span class="settings-reason__index">${index + 1}</span>
      <input
        type="text"
        class="settings-reason__input"
        data-reason-input
        data-reason-id="${id}"
        value="${value}"
        placeholder="Add a reason reporters can select"
      />
      <button
        type="button"
        class="settings-reason__remove"
        data-action="remove-reason"
        data-reason-id="${id}"
        aria-label="Remove reason ${index + 1}"
      >
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  `;
  }

  function renderSettingsPlaceholder(category) {
    const label = WeldUtil.escapeHtml(category?.label || "Settings");
    const description =
      typeof category?.description === "string" && category.description.trim().length > 0
        ? WeldUtil.escapeHtml(category.description)
        : "Configuration options coming soon.";
    return `
    <section class="settings-panel__section settings-panel__section--placeholder">
      <h3>${label}</h3>
      <p>${description}</p>
      <span class="settings-panel__chip">Coming soon</span>
    </section>
  `;
  }

  function renderAppearanceSettingsContent(state) {
    const currentTheme = state?.meta?.theme === "dark" ? "dark" : "light";
    const optionsMarkup = THEME_OPTIONS.map(option => {
      const optionId = WeldUtil.escapeHtml(option.id);
      const label = WeldUtil.escapeHtml(option.label);
      const description =
        typeof option.description === "string" && option.description.trim().length > 0
          ? `<span class="settings-theme__description">${WeldUtil.escapeHtml(option.description.trim())}</span>`
          : "";
      const checkedAttr = option.id === currentTheme ? " checked" : "";
      return `
      <label class="settings-theme__option">
        <input
          type="radio"
          name="settings-theme"
          value="${optionId}"
          class="settings-theme__input"
          data-theme-option
          ${checkedAttr}
        />
        <span class="settings-theme__content">
          <span class="settings-theme__label">${label}</span>
          ${description}
        </span>
      </label>
    `;
    }).join("");
    return `
    <section class="settings-panel__section">
      <div class="settings-panel__section-header">
        <h3>Theme</h3>
        <p>Choose how WeldSecure should look.</p>
      </div>
      <div class="settings-theme" role="radiogroup" aria-label="Theme selection">
        ${optionsMarkup}
      </div>
    </section>
  `;
  }

  function renderReporterSettingsContent(state) {
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
    const reasons =
      Array.isArray(reporterSettings.reasons) && reporterSettings.reasons.length > 0
        ? reporterSettings.reasons
        : DEFAULT_REPORTER_REASONS;
    const reasonsMarkup = reasons.map((reason, index) => reporterReasonRowTemplate(reason, index)).join("");
    return `
    <section class="settings-panel__section" aria-labelledby="reporter-settings-heading">
      <div class="settings-panel__section-header">
        <h3 id="reporter-settings-heading">Reporter experience</h3>
        <p>Control the prompts reporters see when escalating suspicious messages.</p>
      </div>
      <form id="reporter-settings-form" class="settings-form" autocomplete="off">
        <div class="settings-form__group">
          <label class="settings-form__label" for="reporter-reason-prompt">Reason prompt</label>
          <input
            type="text"
            id="reporter-reason-prompt"
            name="reasonPrompt"
            class="settings-form__input"
            value="${WeldUtil.escapeHtml(reasonPrompt)}"
            placeholder="${WeldUtil.escapeHtml(DEFAULT_REPORTER_PROMPT)}"
          />
        </div>
        <div class="settings-form__group">
          <label class="settings-form__label" for="reporter-emergency-label">Urgent checkbox label</label>
          <textarea
            id="reporter-emergency-label"
            class="settings-form__textarea"
            rows="2"
            data-autofocus
            placeholder="${WeldUtil.escapeHtml(DEFAULT_EMERGENCY_LABEL)}"
          >${WeldUtil.escapeHtml(emergencyLabel)}</textarea>
        </div>
        <div class="settings-form__group">
          <div class="settings-form__group-header">
            <span class="settings-form__label">Reasons reporters can choose</span>
            <p class="settings-form__hint">Reorder or rewrite the shortlist that appears in the add-in.</p>
          </div>
          <div class="settings-form__reasons" data-reasons-container>
            ${reasonsMarkup || ""}
          </div>
          <button type="button" class="button-pill button-pill--ghost settings-form__add" data-action="add-reason">
            Add reason
          </button>
        </div>
        <footer class="settings-panel__footer">
          <button type="button" class="button-pill button-pill--danger-light" data-action="reset-reporter-defaults">
            Reset to default
          </button>
          <button type="submit" class="button-pill button-pill--primary">Save changes</button>
        </footer>
      </form>
    </section>
  `;
  }

  function renderSettingsPanel(state) {
    const categories = SETTINGS_CATEGORIES || [];
    if (categories.length === 0) return "";
    const activeCategory = resolveActiveSettingsCategory(state);
    const categoryMarkup = categories
      .map(category => {
        const isActive = activeCategory && category.id === activeCategory.id;
        const classes = [
          "settings-nav__item",
          isActive ? "settings-nav__item--active" : "",
          category.disabled ? "settings-nav__item--disabled" : ""
        ]
          .filter(Boolean)
          .join(" ");
        const description =
          typeof category.description === "string" && category.description.trim().length > 0
            ? WeldUtil.escapeHtml(category.description)
            : "";
        const disabledAttr = category.disabled ? " disabled" : "";
        const metaLabel = category.disabled ? '<span class="settings-nav__meta">Coming soon</span>' : "";
        return `
        <button
          type="button"
          class="${classes}"
          data-settings-category="${WeldUtil.escapeHtml(category.id)}"
          ${disabledAttr}
        >
          <span class="settings-nav__label">${WeldUtil.escapeHtml(category.label)}</span>
          ${description ? `<span class="settings-nav__description">${description}</span>` : ""}
          ${metaLabel}
        </button>
      `;
      })
      .join("");
    const contentMarkup = (() => {
      if (!activeCategory) {
        return renderSettingsPlaceholder(activeCategory);
      }
      if (activeCategory.id === "reporter") {
        return renderReporterSettingsContent(state);
      }
      if (activeCategory.id === "appearance") {
        return renderAppearanceSettingsContent(state);
      }
      return renderSettingsPlaceholder(activeCategory);
    })();
    return `
    <div class="settings-shell settings-shell--open" role="presentation">
      <div class="settings-shell__backdrop" data-settings-dismiss></div>
      <section class="settings-panel" role="dialog" aria-modal="true" aria-labelledby="settings-title" tabindex="-1">
        <header class="settings-panel__header">
          <div>
            <p class="settings-panel__eyebrow">Configuration</p>
            <h2 class="settings-panel__title" id="settings-title">Settings</h2>
          </div>
          <button type="button" class="settings-panel__close" id="settings-close" aria-label="Close settings">
            <span aria-hidden="true">&times;</span>
          </button>
        </header>
        <div class="settings-panel__body">
          <nav class="settings-panel__nav" aria-label="Settings categories">
            ${categoryMarkup}
          </nav>
          <div class="settings-panel__content">
            ${contentMarkup}
          </div>
        </div>
      </section>
    </div>
  `;
  }

  function bindSettingsShellEvents(root, state) {
    if (!root) return;
    const closeButton = root.querySelector("#settings-close");
    if (closeButton) {
      closeButton.addEventListener("click", event => {
        event.preventDefault();
        if (typeof window.closeSettings === "function") {
          window.closeSettings();
        }
      });
    }
    root.querySelectorAll("[data-settings-dismiss]").forEach(element => {
      element.addEventListener("click", () => {
        if (typeof window.closeSettings === "function") {
          window.closeSettings();
        }
      });
    });

    const activeCategory = resolveActiveSettingsCategory(state);
    if (activeCategory && state.meta.settingsCategory !== activeCategory.id) {
      state.meta.settingsCategory = activeCategory.id;
      if (WeldState && typeof WeldState.saveState === "function") {
        WeldState.saveState(state);
      }
      if (typeof window.renderApp === "function") {
        window.renderApp();
      }
      return;
    }

    root.querySelectorAll("[data-settings-category]").forEach(button => {
      if (button.disabled) return;
      button.addEventListener("click", event => {
        event.preventDefault();
        const category = button.getAttribute("data-settings-category");
        if (!category || state.meta.settingsCategory === category) return;
        state.meta.settingsCategory = category;
        if (WeldState && typeof WeldState.saveState === "function") {
          WeldState.saveState(state);
        }
        if (typeof window.renderApp === "function") {
          window.renderApp();
        }
      });
    });

    root.querySelectorAll("[data-theme-option]").forEach(input => {
      input.addEventListener("change", event => {
        if (!event.target.checked) return;
        const selectedTheme = typeof event.target.value === "string" ? event.target.value : "";
        if (typeof window.setTheme === "function") {
          window.setTheme(selectedTheme);
        }
      });
    });

    const reporterForm = root.querySelector("#reporter-settings-form");
    if (reporterForm) {
      const reasonsContainer = reporterForm.querySelector("[data-reasons-container]");
      const promptField = reporterForm.querySelector("#reporter-reason-prompt");
      const emergencyField = reporterForm.querySelector("#reporter-emergency-label");

      const updateReasonIndices = () => {
        if (!reasonsContainer) return;
        Array.from(reasonsContainer.querySelectorAll(".settings-reason__index")).forEach((item, index) => {
          item.textContent = String(index + 1);
        });
      };

      reporterForm.addEventListener("click", event => {
        const addButton = event.target.closest("[data-action='add-reason']");
        if (addButton) {
          event.preventDefault();
          if (!reasonsContainer) return;
          const newId =
            WeldUtil && typeof WeldUtil.generateId === "function"
              ? WeldUtil.generateId("reason")
              : `reason-${Date.now()}`;
          const rowMarkup = reporterReasonRowTemplate({ id: newId, label: "" }, reasonsContainer.children.length);
          reasonsContainer.insertAdjacentHTML("beforeend", rowMarkup);
          updateReasonIndices();
          const selector = `[data-reason-id="${escapeSettingsSelector(newId)}"]`;
          const newInput = reasonsContainer.querySelector(selector);
          if (newInput) newInput.focus();
          return;
        }
        const removeButton = event.target.closest("[data-action='remove-reason']");
        if (removeButton) {
          event.preventDefault();
          if (!reasonsContainer) return;
          const reasonId = removeButton.getAttribute("data-reason-id");
          if (!reasonId) return;
          const row = reasonsContainer.querySelector(
            `[data-reason-row="${escapeSettingsSelector(reasonId)}"]`
          );
          if (row) {
            row.remove();
            updateReasonIndices();
          }
          return;
        }
        const resetButton = event.target.closest("[data-action='reset-reporter-defaults']");
        if (resetButton) {
          event.preventDefault();
          if (typeof window.openDialog === "function") {
            window.openDialog({
              title: "Reset reporter settings?",
              description:
                "This restores the default prompt, urgent label, and standard reasons for reporters.",
              confirmLabel: "Reset settings",
              cancelLabel: "Cancel",
              tone: "danger",
              onConfirm: close => {
                if (typeof close === "function") close();
                state.settings = state.settings || {};
                state.settings.reporter = {
                  reasonPrompt: DEFAULT_REPORTER_PROMPT,
                  emergencyLabel: DEFAULT_EMERGENCY_LABEL,
                  reasons: DEFAULT_REPORTER_REASONS.map(reason => ({ ...reason }))
                };
                if (Array.isArray(state.messages)) {
                  const validIds = new Set(state.settings.reporter.reasons.map(reason => reason.id));
                  state.messages.forEach(message => {
                    if (!Array.isArray(message.reasons)) return;
                    message.reasons = message.reasons.filter(id => validIds.has(id));
                  });
                }
                if (WeldState && typeof WeldState.saveState === "function") {
                  WeldState.saveState(state);
                }
                if (typeof window.renderApp === "function") {
                  window.renderApp();
                }
              }
            });
          }
        }
      });

      reporterForm.addEventListener("submit", event => {
        event.preventDefault();
        const reasonInputs = reasonsContainer
          ? Array.from(reasonsContainer.querySelectorAll("[data-reason-input]"))
          : [];
        const reasons = [];
        const seenIds = new Set();
        reasonInputs.forEach(input => {
          const text = (input.value || "").trim();
          if (!text) return;
          const currentId = input.getAttribute("data-reason-id");
          let normalizedId =
            WeldUtil && typeof WeldUtil.normalizeId === "function"
              ? WeldUtil.normalizeId(currentId, "reason")
              : currentId;
          if (!normalizedId) {
            normalizedId =
              WeldUtil && typeof WeldUtil.generateId === "function"
                ? WeldUtil.generateId("reason")
                : `reason-${Date.now()}`;
            input.setAttribute("data-reason-id", normalizedId);
          }
          while (seenIds.has(normalizedId)) {
            normalizedId =
              WeldUtil && typeof WeldUtil.generateId === "function"
                ? WeldUtil.generateId("reason")
                : `reason-${Date.now()}`;
            input.setAttribute("data-reason-id", normalizedId);
          }
          seenIds.add(normalizedId);
          reasons.push({ id: normalizedId, label: text });
        });
        if (reasons.length === 0) {
          if (typeof window.openDialog === "function") {
            window.openDialog({
              title: "Add at least one reason",
              description: "Reporters need at least one selectable reason.",
              confirmLabel: "Close"
            });
          }
          return;
        }
        const promptValue = promptField ? promptField.value.trim() : "";
        const emergencyValue = emergencyField ? emergencyField.value.trim() : "";
        if (!emergencyValue) {
          if (typeof window.openDialog === "function") {
            window.openDialog({
              title: "Add urgent label text",
              description: "Describe what happens when reporters tick the urgent box.",
              confirmLabel: "Close"
            });
          }
          if (emergencyField) emergencyField.focus();
          return;
        }
        state.settings = state.settings || {};
        const existing = state.settings.reporter || {};
        const nextPrompt = promptValue.length > 0 ? promptValue : DEFAULT_REPORTER_PROMPT;
        state.settings.reporter = {
          ...existing,
          reasonPrompt: nextPrompt,
          emergencyLabel: emergencyValue,
          reasons
        };
        if (Array.isArray(state.messages)) {
          const validIds = new Set(reasons.map(reason => reason.id));
          state.messages.forEach(message => {
            if (!Array.isArray(message.reasons)) return;
            message.reasons = message.reasons.filter(id => validIds.has(id));
          });
        }
        if (WeldState && typeof WeldState.saveState === "function") {
          WeldState.saveState(state);
        }
        if (typeof window.renderApp === "function") {
          window.renderApp();
        }
      });
    }
  }

  function syncSettingsShell(state) {
    const root = ensureSettingsRoot();
    if (!state.meta?.settingsOpen) {
      root.innerHTML = "";
      return;
    }
    root.innerHTML = renderSettingsPanel(state);
    bindSettingsShellEvents(root, state);
    requestAnimationFrame(() => {
      const panel = root.querySelector(".settings-panel");
      if (!panel) return;
      const focusTarget =
        panel.querySelector("[data-autofocus]") || panel.querySelector("input, textarea, button, select");
      if (focusTarget) {
        focusTarget.focus();
      } else {
        panel.focus();
      }
    });
  }

  function bindSettingsToggle(container, state) {
    if (!container) return;
    const settingsButton = container.querySelector("#global-settings");
    if (settingsButton && settingsButton.dataset.settingsToggleBound !== "true") {
      settingsButton.dataset.settingsToggleBound = "true";
      settingsButton.addEventListener("click", event => {
        event.preventDefault();
        if (typeof window.openSettings === "function") {
          window.openSettings();
        } else {
          state.meta.settingsOpen = true;
          if (WeldState && typeof WeldState.saveState === "function") {
            WeldState.saveState(state);
          }
          if (typeof window.renderApp === "function") {
            window.renderApp();
          }
        }
      });
    }
  }

  settingsFeature.init = function init(container, appState) {
    const state = getState(appState);
    bindSettingsToggle(container, state);
    ensureSettingsShortcuts();
    syncSettingsShell(state);
  };

  settingsFeature.sync = function sync(appState) {
    const state = getState(appState);
    syncSettingsShell(state);
  };

  settingsFeature.render = function render(appState) {
    const state = getState(appState);
    ensureSettingsShortcuts();
    syncSettingsShell(state);
    return "";
  };

  settingsFeature.attach = function attach(container, appState) {
    settingsFeature.init(container, appState);
  };
})();
