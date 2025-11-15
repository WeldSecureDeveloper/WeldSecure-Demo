(function () {
  const AppData = window.AppData || (window.AppData = {});
  AppData.NAV_GROUPS = AppData.NAV_GROUPS || [
    {
      label: "Reporter",
      role: "customer",
      items: [
        { label: "Reporter", route: "addin", role: "customer" },
        { label: "Hub", route: "customer", role: "customer" },
        { label: "Sandbox", route: "reporter-sandbox", role: "customer" }
      ]
    },
    {
      label: "Organisation",
      role: "client",
      items: [
        { label: "Organisation Hub", route: "client-dashboard", role: "client" },
        { label: "Security Team Dashboard", route: "client-reporting", role: "client" },
        { label: "Badge Catalogue", route: "client-badges", role: "client" },
        { label: "Quest Catalogue", route: "client-quests", role: "client" },
        { label: "Rewards Catalogue", route: "client-rewards", role: "client" },
        { label: "Leaderboards", route: "client-leaderboards", role: "client" },
        { label: "User configuration", route: "client-user-config", role: "client" },
        { label: "Phishing Designer", route: "phishing-designer", role: "admin" }
      ]
    },
    {
      label: "WeldSecure",
      role: "admin",
      items: [
        { label: "Weld Admin", route: "weld-admin", role: "admin" },
        { label: "Phishing Sims", route: "phishing-sims", role: "admin" },
        { label: "Weld Labs", route: "weld-labs", role: "admin" }
      ]
    }
  ];
  const modules = window.WeldModules;
  if (modules && (!modules.has || !modules.has("data/app/nav"))) {
    modules.define("data/app/nav", () => AppData.NAV_GROUPS);
  }
})();

