(function () {
  if (!window.Weld) return;

  const modules = window.WeldModules;
  if (!modules || typeof modules.use !== "function") {
    console.warn("WeldModules unavailable; customer features could not be initialised.");
    return;
  }

  const features = window.Weld.features || (window.Weld.features = {});
  const customerFeature = features.customer || (features.customer = {});

  let api = null;
  try {
    api = modules.use("features/customer/modules");
  } catch (error) {
    console.warn("Failed to load customer modules:", error);
    return;
  }

  if (!api) {
    console.warn("features/customer/modules returned no API; skipping customer feature wiring.");
    return;
  }

  const wiring = {
    templateHub: "templateHub",
    renderHub: "renderHub",
    attachHub: "attachHub",
    templateBadges: "templateBadges",
    renderBadges: "renderBadges",
    attachBadges: "attachBadges",
    templateReports: "templateReports",
    renderReports: "renderReports",
    attachReports: "attachReports",
    templateRedemptions: "templateRedemptions",
    renderRedemptions: "renderRedemptions",
    attachRedemptions: "attachRedemptions"
  };

  Object.entries(wiring).forEach(([featureKey, apiKey]) => {
    if (typeof api[apiKey] === "function") {
      customerFeature[featureKey] = api[apiKey];
    } else {
      console.warn(`Customer module missing implementation for "${apiKey}".`);
    }
  });
})();
