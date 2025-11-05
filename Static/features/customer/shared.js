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
        ? value => WeldUtil.formatNumberSafe(value)
        : typeof window.formatNumber === "function"
        ? window.formatNumber
        : value => (Number.isFinite(Number(value)) ? Number(value) : 0);

    const formatDateTime =
      typeof WeldUtil.formatDateTimeSafe === "function"
        ? value => WeldUtil.formatDateTimeSafe(value)
        : typeof window.formatDateTime === "function"
        ? window.formatDateTime
        : value => value || "";

    const relativeTime =
      typeof window.relativeTime === "function" ? window.relativeTime : value => value || "";

    const CONFIG_ICON =
      typeof WeldUtil.renderConfigIcon === "function" ? WeldUtil.renderConfigIcon() : "";

    const getState =
      typeof WeldUtil.getState === "function"
        ? WeldUtil.getState
        : appState => {
            if (appState && typeof appState === "object") return appState;
            if (window.Weld && typeof window.Weld.state === "object") return window.Weld.state;
            if (typeof window.state === "object") return window.state;
            return {};
          };

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
