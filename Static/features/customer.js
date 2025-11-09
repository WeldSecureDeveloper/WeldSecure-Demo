(function () {
  if (!window.Weld) return;

  const modules = window.WeldModules;
  if (!modules || typeof modules.use !== "function") {
    console.warn("WeldModules unavailable; customer features could not be initialised.");
    return;
  }

  const features = window.Weld.features || (window.Weld.features = {});
  const customerFeature = features.customer || (features.customer = {});

  function hydrateModule(moduleId, mapping) {
    let api = null;
    try {
      api = modules.use(moduleId);
    } catch (error) {
      console.warn(`Failed to load ${moduleId}:`, error);
      return;
    }

    if (!api) {
      console.warn(`${moduleId} returned no API; skipping wiring.`);
      return;
    }

    Object.entries(mapping).forEach(([targetKey, sourceKey]) => {
      if (typeof api[sourceKey] === "function") {
        customerFeature[targetKey] = api[sourceKey];
      } else {
        console.warn(`${moduleId} missing implementation for "${sourceKey}".`);
      }
    });
  }

  hydrateModule("features/customer/hub", {
    templateHub: "template",
    renderHub: "render",
    attachHub: "attach",
    templateHubRewards: "templateRewards",
    renderHubRewards: "renderRewards",
    attachHubRewards: "attachRewards",
    templateHubQuests: "templateQuests",
    renderHubQuests: "renderQuests",
    attachHubQuests: "attachQuests"
  });

  hydrateModule("features/customer/badges", {
    templateBadges: "template",
    renderBadges: "render",
    attachBadges: "attach"
  });

  hydrateModule("features/customer/leaderboards", {
    templateLeaderboards: "template",
    renderLeaderboards: "render",
    attachLeaderboards: "attach"
  });

  hydrateModule("features/customer/reports", {
    templateReports: "template",
    renderReports: "render",
    attachReports: "attach"
  });

  hydrateModule("features/customer/redemptions", {
    templateRedemptions: "template",
    renderRedemptions: "render",
    attachRedemptions: "attach"
  });
})();
