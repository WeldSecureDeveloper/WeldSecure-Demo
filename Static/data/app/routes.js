
(function () {
  const AppData = window.AppData || (window.AppData = {});
  AppData.ROUTES = AppData.ROUTES || {
    landing: { requiresRole: false },
    customer: { requiresRole: "customer" },
    "customer-hub-rewards": { requiresRole: "customer" },
    "customer-hub-quests": { requiresRole: "customer" },
    "customer-reports": { requiresRole: "customer" },
    "customer-badges": { requiresRole: "customer" },
    "customer-redemptions": { requiresRole: "customer" },
    "customer-leaderboards": { requiresRole: "customer" },
    "reporter-sandbox": { requiresRole: "customer" },
    "client-dashboard": { requiresRole: "client" },
    "client-user-config": { requiresRole: "client" },
    "client-leaderboards": { requiresRole: "client" },
    "client-reporting": { requiresRole: "client" },
    "client-rewards": { requiresRole: "client" },
    "client-quests": { requiresRole: "client" },
    "weld-admin": { requiresRole: "admin" },
    "phishing-sims": { requiresRole: "admin" },
    "phishing-designer": { requiresRole: "admin" },
    "weld-labs": { requiresRole: "admin" },
    "client-badges": { requiresRole: "client" },
    addin: { requiresRole: false }
  };
  window.ROUTES = AppData.ROUTES;
  const modules = window.WeldModules;
  if (modules && (!modules.has || !modules.has("data/app/routes"))) {
    modules.define("data/app/routes", () => AppData.ROUTES);
  }
})();
