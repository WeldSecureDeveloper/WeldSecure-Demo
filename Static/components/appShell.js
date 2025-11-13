(function () {
  const modules = window.WeldModules;
  if (!modules || modules.has("components/appShell")) return;

  modules.define("components/appShell", function () {
    let globalNavModule = null;
    let badgeShowcaseModule = null;
    let settingsShellModule = null;

    function getGlobalNavModule() {
      if (globalNavModule) return globalNavModule;
      if (!modules || typeof modules.use !== "function") return null;
      try {
        globalNavModule = modules.use("components/globalNav");
      } catch (error) {
        console.warn("WeldModules: components/globalNav module unavailable.", error);
        globalNavModule = null;
      }
      return globalNavModule;
    }

    function renderGlobalNav(activeRoute, state) {
      const navModule = getGlobalNavModule();
      if (navModule && typeof navModule.renderGlobalNav === "function") {
        return navModule.renderGlobalNav(activeRoute, state);
      }
      return "";
    }

    function attachHeaderEvents(container) {
      const navModule = getGlobalNavModule();
      if (navModule && typeof navModule.attachHeaderEvents === "function") {
        navModule.attachHeaderEvents(container);
      }
    }

    function attachGlobalNav(container, state) {
      const navModule = getGlobalNavModule();
      if (navModule && typeof navModule.attachGlobalNav === "function") {
        navModule.attachGlobalNav(container, state);
      }
    }

    function getBadgeShowcaseModule() {
      if (badgeShowcaseModule) return badgeShowcaseModule;
      if (!modules || typeof modules.use !== "function") return null;
      try {
        badgeShowcaseModule = modules.use("components/badgeShowcase");
      } catch (error) {
        console.warn("WeldModules: components/badgeShowcase module unavailable.", error);
        badgeShowcaseModule = null;
      }
      return badgeShowcaseModule;
    }

    function renderBadgeSpotlight(badgeInput, state) {
      const badgeModule = getBadgeShowcaseModule();
      if (badgeModule && typeof badgeModule.renderBadgeSpotlight === "function") {
        return badgeModule.renderBadgeSpotlight(badgeInput, state);
      }
      return "";
    }

    function teardownBadgeShowcase() {
      const badgeModule = getBadgeShowcaseModule();
      if (badgeModule && typeof badgeModule.teardownBadgeShowcase === "function") {
        badgeModule.teardownBadgeShowcase();
      }
    }

    function setupBadgeShowcase(container, state) {
      const badgeModule = getBadgeShowcaseModule();
      if (badgeModule && typeof badgeModule.setupBadgeShowcase === "function") {
        badgeModule.setupBadgeShowcase(container, state);
      }
    }

    function getSettingsShellModule() {
      if (settingsShellModule) return settingsShellModule;
      if (!modules || typeof modules.use !== "function") return null;
      try {
        settingsShellModule = modules.use("components/settingsShell");
      } catch (error) {
        console.warn("WeldModules: components/settingsShell module unavailable.", error);
        settingsShellModule = null;
      }
      return settingsShellModule;
    }

    function initializeSettingsUI(container, state) {
      const settingsModule = getSettingsShellModule();
      if (settingsModule && typeof settingsModule.initializeSettingsUI === "function") {
        settingsModule.initializeSettingsUI(container, state);
      }
    }

    function renderHeader(state) {
      const resolvedState = state || (window.Weld && window.Weld.state) || window.state || null;
      return renderGlobalNav(resolvedState?.meta?.route || "landing", resolvedState);
    }

    return {
      renderHeader,
      attachHeaderEvents,
      attachGlobalNav,
      initializeSettingsUI,
      teardownBadgeShowcase,
      setupBadgeShowcase,
      renderBadgeSpotlight,
      renderGlobalNav
    };
  });
})();
