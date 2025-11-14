(function () {
  const modules = window.WeldModules;
  const hasFn = modules && typeof modules.has === "function" ? modules.has : null;
  if (!modules || (hasFn && hasFn("runtime/serviceWrappers"))) {
    return;
  }

  modules.define("runtime/serviceWrappers", function () {
    function getState() {
      if (window.Weld && typeof window.Weld.state === "object") {
        return window.Weld.state;
      }
      if (typeof window.state === "object") {
        return window.state;
      }
      return null;
    }

    function getServices() {
      if (window.WeldServices && typeof window.WeldServices === "object") {
        return window.WeldServices;
      }
      return {};
    }

    function invokeService(name, args = []) {
      const services = getServices();
      const service = services[name];
      if (typeof service === "function") {
        return service.apply(null, args);
      }
      console.warn(
        `WeldServices.${name} is unavailable. Ensure services/stateServices.js is loaded before app.js.`
      );
      return undefined;
    }

    function wrap(serviceName, buildArgs) {
      return function wrapper() {
        const state = getState();
        const input = Array.prototype.slice.call(arguments);
        const args =
          typeof buildArgs === "function" ? buildArgs.apply(null, [state].concat(input)) : [state].concat(input);
        return invokeService(serviceName, args);
      };
    }

    return {
      invokeService,
      navigate: wrap("navigate", function (state, route) {
        return [route, state];
      }),
      setRole: wrap("setRole", function (state, role, route) {
        return [role, route, state];
      }),
      resetDemo: wrap("resetDemo", function (state) {
        return [state];
      }),
      persist: wrap("persist", function (state) {
        return [state];
      }),
      completeQuest: wrap("completeQuest", function (state, questId, options) {
        return [questId, options || {}, state];
      }),
      redeemReward: wrap("redeemReward", function (state, rewardId) {
        return [rewardId, state];
      }),
      setRewardFilter: wrap("setRewardFilter", function (state, filter) {
        return [filter, state];
      }),
      setRewardStatusFilter: wrap("setRewardStatusFilter", function (state, filter) {
        return [filter, state];
      }),
      setCustomerReportFilter: wrap("setCustomerReportFilter", function (state, filter) {
        return [filter, state];
      }),
      setCustomerRecognitionFilter: wrap("setCustomerRecognitionFilter", function (state, filter) {
        return [filter, state];
      }),
      setCustomerBadgeAvailabilityFilter: wrap("setCustomerBadgeAvailabilityFilter", function (state, filter) {
        return [filter, state];
      }),
      setSettingsCategory: wrap("setSettingsCategory", function (state, category) {
        return [category, state];
      }),
      openSettings: wrap("openSettings", function (state, category) {
        return [category, state];
      }),
      closeSettings: wrap("closeSettings", function (state) {
        return [state];
      }),
      setTheme: wrap("setTheme", function (state, theme) {
        return [theme, state];
      }),
      toggleTheme: wrap("toggleTheme", function (state) {
        return [state];
      })
    };
  });
})();
