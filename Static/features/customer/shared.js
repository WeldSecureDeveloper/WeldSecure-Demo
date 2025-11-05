(function () {
  const modules = window.WeldModules;
  if (!modules || typeof modules.define !== "function") return;
  if (modules.has && modules.has("features/customer/shared")) return;

  modules.define("features/customer/shared", function () {
    const AppData = window.AppData || {};
    const MessageStatus = AppData.MessageStatus || {};
    const WeldUtil = window.WeldUtil || {};

    const formatNumber =
      typeof WeldUtil.formatNumberSafe === "function"
        ? WeldUtil.formatNumberSafe
        : value => (Number.isFinite(Number(value)) ? Number(value) : 0);

    const formatDateTime =
      typeof WeldUtil.formatDateTimeSafe === "function"
        ? WeldUtil.formatDateTimeSafe
        : value => (value === null || value === undefined ? "" : String(value));

    const relativeTime =
      typeof WeldUtil.relativeTimeSafe === "function"
        ? WeldUtil.relativeTimeSafe
        : value => (value === null || value === undefined ? "" : String(value));

    const CONFIG_ICON =
      typeof WeldUtil.renderConfigIcon === "function" ? WeldUtil.renderConfigIcon() : "";

    const getState =
      typeof WeldUtil.getState === "function"
        ? WeldUtil.getState
        : appState => (appState && typeof appState === "object" ? appState : {});

    return {
      AppData,
      MessageStatus,
      WeldUtil,
      formatNumber,
      formatDateTime,
      relativeTime,
      CONFIG_ICON,
      getState
    };
  });
})();
