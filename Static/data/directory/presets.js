(function () {
  const AppData = window.AppData || (window.AppData = {});
  AppData.DIRECTORY_PRESETS = (() => {
    const directoryData = window.DirectoryData || {};
    const cloneList = source => (Array.isArray(source) ? source.map(entry => ({ ...entry })) : []);
    const cloneObject = source =>
      source && typeof source === "object" ? { ...source } : {};
    return {
      integrations: cloneObject(directoryData.integrations),
      departments: cloneList(directoryData.departments),
      teams: cloneList(directoryData.teams),
      users: cloneList(directoryData.users)
    };
  })();
  AppData.DIRECTORY = AppData.DIRECTORY_PRESETS;
  const modules = window.WeldModules;
  if (modules && (!modules.has || !modules.has("data/directory/presets"))) {
    modules.define("data/directory/presets", () => AppData.DIRECTORY_PRESETS);
  }
})();

