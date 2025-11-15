
(function () {
  const AppData = window.AppData || (window.AppData = {});
  AppData.SETTINGS_CATEGORIES = AppData.SETTINGS_CATEGORIES || [
    {
      id: "reporter",
      label: "Reporter",
      description: "Configure the reporter add-in experience"
    },
    {
      id: "appearance",
      label: "Appearance",
      description: "Toggle between light and dark themes"
    },
    {
      id: "organisation",
      label: "Organisation",
      description: "Tailor organisation dashboards and engagement",
      disabled: true
    },
    {
      id: "weldsecure",
      label: "WeldSecure",
      description: "Shape WeldSecure playbooks and operations",
      disabled: true
    }
  ];
  const modules = window.WeldModules;
  if (modules && (!modules.has || !modules.has("data/app/settings"))) {
    modules.define("data/app/settings", () => AppData.SETTINGS_CATEGORIES);
  }
})();
