(function () {
  const modules = window.WeldModules;
  if (!modules || modules.has("components/reporterSandbox/addinShell")) return;

  const MIN_ADDIN_SHELL_HEIGHT = 760;
  const DEFAULT_ADDIN_SHELL_HEIGHT = 840;
  const MAX_ADDIN_SHELL_HEIGHT = 920;

  modules.define("components/reporterSandbox/addinShell", function () {
    function clampAddinShellHeight(value) {
      const numeric = Number(value);
      if (!Number.isFinite(numeric) || numeric <= 0) {
        return DEFAULT_ADDIN_SHELL_HEIGHT;
      }
      return Math.min(MAX_ADDIN_SHELL_HEIGHT, Math.max(MIN_ADDIN_SHELL_HEIGHT, Math.ceil(numeric)));
    }

    function resolveAddinShellHeight(state) {
      if (!state || !state.meta) {
        return DEFAULT_ADDIN_SHELL_HEIGHT;
      }
      const stored = Number(state.meta.addinShellHeight);
      if (Number.isFinite(stored) && stored > 0) {
        return clampAddinShellHeight(stored);
      }
      return DEFAULT_ADDIN_SHELL_HEIGHT;
    }

    function applyAddinVisibility(options) {
      const { visible, refs, state, onGuidedTourDisable, onUpdateButton } = options || {};
      if (!refs) return;
      const { reporterSidebar, readingRegion, sandboxStage, container } = refs;
      const nextVisible = visible === true;
      if (nextVisible && typeof onGuidedTourDisable === "function") {
        onGuidedTourDisable();
      }
      if (reporterSidebar) {
        reporterSidebar.hidden = !nextVisible;
        reporterSidebar.setAttribute("aria-hidden", nextVisible ? "false" : "true");
        reporterSidebar.setAttribute("data-addin-visible", nextVisible ? "true" : "false");
      }
      if (readingRegion) {
        readingRegion.setAttribute("data-addin-visible", nextVisible ? "true" : "false");
      }
      if (sandboxStage) {
        sandboxStage.classList.toggle("sandbox-stage--addin-visible", nextVisible);
        sandboxStage.setAttribute("data-addin-visible", nextVisible ? "true" : "false");
      }
      if (container && container.classList) {
        container.classList.toggle("has-addin", nextVisible);
      }
      if (typeof onUpdateButton === "function") {
        onUpdateButton(nextVisible);
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
      const reporterFeature = window.Weld && window.Weld.features && window.Weld.features.reporter;
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

    return {
      applyAddinVisibility,
      mountReporterDock,
      resolveAddinShellHeight,
      clampAddinShellHeight
    };
  });
})();
