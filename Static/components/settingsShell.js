(function () {
  const modules = window.WeldModules;
  if (!modules || modules.has("components/settingsShell")) return;

  modules.define("components/settingsShell", function () {
    function initializeSettingsUI(container, state) {
      if (!container) return;
      const settingsFeature = (window.Weld && window.Weld.settings) || null;
      if (!settingsFeature) return;
      const resolvedState = state || (window.Weld && window.Weld.state) || window.state || null;
      if (typeof settingsFeature.init === "function") {
        settingsFeature.init(container, resolvedState);
        return;
      }
      if (typeof settingsFeature.attach === "function") {
        settingsFeature.attach(container, resolvedState);
      }
    }

    return {
      initializeSettingsUI
    };
  });
})();
