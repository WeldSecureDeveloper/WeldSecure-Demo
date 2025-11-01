(function () {
  if (!window.Weld) return;

  const features = window.Weld.features || (window.Weld.features = {});
  const customerFeature = features.customer || (features.customer = {});

  function getState(appState) {
    if (appState && typeof appState === "object") return appState;
    if (window.Weld && typeof window.Weld.state === "object") return window.Weld.state;
    if (typeof window.state === "object") return window.state;
    return {};
  }

  function callGlobal(fnName, ...args) {
    const fn = typeof window[fnName] === "function" ? window[fnName] : null;
    if (!fn) return null;
    return fn(...args);
  }

  customerFeature.templateHub = function templateHub(appState) {
    getState(appState);
    const markup = callGlobal("renderCustomer");
    return typeof markup === "string" ? markup : "";
  };

  customerFeature.renderHub = function renderHub(container, appState) {
    if (!container) return;
    container.innerHTML = customerFeature.templateHub(appState);
    callGlobal("attachCustomerEvents", container);
  };

  customerFeature.attachHub = function attachHub(container, appState) {
    if (!container) return;
    getState(appState);
    callGlobal("attachCustomerEvents", container);
  };

  customerFeature.templateBadges = function templateBadges(appState) {
    getState(appState);
    const markup = callGlobal("renderCustomerBadgesPage");
    return typeof markup === "string" ? markup : "";
  };

  customerFeature.renderBadges = function renderBadges(container, appState) {
    if (!container) return;
    container.innerHTML = customerFeature.templateBadges(appState);
    callGlobal("attachCustomerBadgesEvents", container);
  };

  customerFeature.attachBadges = function attachBadges(container, appState) {
    if (!container) return;
    getState(appState);
    callGlobal("attachCustomerBadgesEvents", container);
  };

  customerFeature.templateReports = function templateReports(appState) {
    getState(appState);
    const markup = callGlobal("renderCustomerReportsPage");
    return typeof markup === "string" ? markup : "";
  };

  customerFeature.renderReports = function renderReports(container, appState) {
    if (!container) return;
    container.innerHTML = customerFeature.templateReports(appState);
    callGlobal("attachCustomerReportsEvents", container);
  };

  customerFeature.attachReports = function attachReports(container, appState) {
    if (!container) return;
    getState(appState);
    callGlobal("attachCustomerReportsEvents", container);
  };

  customerFeature.templateRedemptions = function templateRedemptions(appState) {
    getState(appState);
    const markup = callGlobal("renderCustomerRedemptionsPage");
    return typeof markup === "string" ? markup : "";
  };

  customerFeature.renderRedemptions = function renderRedemptions(container, appState) {
    if (!container) return;
    container.innerHTML = customerFeature.templateRedemptions(appState);
    callGlobal("attachCustomerRedemptionsEvents", container);
  };

  customerFeature.attachRedemptions = function attachRedemptions(container, appState) {
    if (!container) return;
    getState(appState);
    callGlobal("attachCustomerRedemptionsEvents", container);
  };
})();
