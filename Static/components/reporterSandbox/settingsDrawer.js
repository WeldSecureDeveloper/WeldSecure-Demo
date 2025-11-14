(function () {
  const modules = window.WeldModules;
  if (!modules || modules.has("components/reporterSandbox/settingsDrawer")) return;

  modules.define("components/reporterSandbox/settingsDrawer", function () {
    function renderSettingsDrawer(sandbox, helpers = {}) {
      const escapeHtml =
        typeof helpers.escapeHtml === "function"
          ? helpers.escapeHtml
          : value => {
              if (value === null || value === undefined) return "";
              return String(value)
                .replace(/&/g, "&amp;")
                .replace(/"/g, "&quot;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");
            };
      if (!sandbox || !sandbox.layout) {
        return "";
      }
      const options = [
        {
          key: "compactRows",
          title: "Compact message list",
          subtitle: "Reduce row height for a denser triage queue."
        },
        {
          key: "showSnippets",
          title: "Show preview snippets",
          subtitle: "Display the first line of each email beneath the subject."
        },
        {
          key: "highlightReading",
          title: "Emphasize reading pane",
          subtitle: "Add a subtle focus ring when the add-in is docked."
        }
      ];

      const optionMarkup = options
        .map(option => {
          const checked = sandbox.layout[option.key] ? "checked" : "";
          return `
          <label class="settings-option">
            <input type="checkbox" data-layout-pref="${escapeHtml(option.key)}" ${checked} />
            <div>
              <strong>${escapeHtml(option.title)}</strong>
              <span>${escapeHtml(option.subtitle)}</span>
            </div>
          </label>
        `;
        })
        .join("");

      return `
        <div class="sandbox-modal" data-sandbox-settings hidden>
          <div class="sandbox-modal__dialog">
            <header>
              <h2>Inbox layout settings</h2>
              <button type="button" data-close-settings aria-label="Close">&times;</button>
            </header>
            <div class="sandbox-modal__body">
              <form class="settings-form">
                ${optionMarkup}
              </form>
            </div>
          </div>
        </div>
      `;
    }

    function attachSettingsDrawer(options = {}) {
      const { container, onSetPreference } = options;
      if (!container) return;
      const drawer = container.querySelector("[data-sandbox-settings]");
      if (!drawer) return;
      const openButtons = container.querySelectorAll("[data-open='settings']");
      const closeButton = drawer.querySelector("[data-close-settings]");

      const openDrawer = () => {
        drawer.hidden = false;
        drawer.classList.add("is-visible");
      };

      const closeDrawer = () => {
        drawer.classList.remove("is-visible");
        drawer.hidden = true;
      };

      openButtons.forEach(button =>
        button.addEventListener("click", event => {
          event.preventDefault();
          openDrawer();
        })
      );

      if (closeButton) {
        closeButton.addEventListener("click", event => {
          event.preventDefault();
          closeDrawer();
        });
      }

      drawer.addEventListener("click", event => {
        if (event.target === drawer) {
          closeDrawer();
        }
      });

      drawer.querySelectorAll("[data-layout-pref]").forEach(input => {
        input.addEventListener("change", event => {
          const pref = event.target.getAttribute("data-layout-pref");
          if (!pref || typeof onSetPreference !== "function") return;
          onSetPreference(pref, event.target.checked === true || event.target.checked === "checked");
        });
      });
    }

    return {
      renderSettingsDrawer,
      attachSettingsDrawer
    };
  });
})();
