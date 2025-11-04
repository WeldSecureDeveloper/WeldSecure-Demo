(function () {
  const modules = window.WeldModules;
  if (!modules || typeof modules.define !== "function") return;
  if (modules.has && modules.has("features/customer/shared")) return;

  modules.define("features/customer/shared", function () {
    const AppData = window.AppData || {};
    const MessageStatus = AppData.MessageStatus || {};
    const WeldUtil = window.WeldUtil || {};

    const formatNumber =
      typeof window.formatNumber === "function"
        ? window.formatNumber
        : value => (Number.isFinite(Number(value)) ? Number(value) : 0);

    const formatDateTime =
      typeof window.formatDateTime === "function" ? window.formatDateTime : value => value || "";

    const relativeTime =
      typeof window.relativeTime === "function" ? window.relativeTime : value => value || "";

    const CONFIG_ICON =
      (WeldUtil && typeof WeldUtil.renderIcon === "function" && WeldUtil.renderIcon("settings", "xs")) ||
      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true" focusable="false">
        <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.427-1.756 3.002-1.756 3.429 0a1.724 1.724 0 002.586 1.066c1.544-.89 3.31.876 2.42 2.42a1.724 1.724 0 001.065 2.572c1.756.426 1.756 3.002 0 3.429a1.724 1.724 0 00-1.066 2.586c.89 1.544-.876 3.31-2.42 2.42a1.724 1.724 0 00-2.586 1.065c-.426 1.756-3.002 1.756-3.429 0a1.724 1.724 0 00-2.586-1.066c-1.544.89-3.31-.876-2.42-2.42a1.724 1.724 0 00-1.065-2.586c-1.756-.426-1.756-3.002 0-3.429a1.724 1.724 0 001.066-2.586c-.89-1.544.876-3.31 2.42-2.42a1.724 1.724 0 002.586-1.065z"/>
        <circle cx="12" cy="12" r="3" />
      </svg>`;

    function getState(appState) {
      if (appState && typeof appState === "object") return appState;
      if (window.Weld && typeof window.Weld.state === "object") return window.Weld.state;
      if (typeof window.state === "object") return window.state;
      return {};
    }

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
