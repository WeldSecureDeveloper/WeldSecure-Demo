(function () {
  const AppData = window.AppData || {};
  const WeldState = window.WeldState;
  const WeldUtil = window.WeldUtil || {};
  const registry = window.WeldRegistry || (window.WeldRegistry = {});
  const registerRoute = window.registerWeldRoute || function registerRoute(name, config) {
    registry[name] = config || {};
    return registry[name];
  };

  registerRoute('settings', {
    pageClass: 'page',
    innerClass: 'page__inner',
    contentClass: 'layout-content',
    contentId: 'main-content',
    render() {
      const state = window.Weld?.state || window.state || {};
      const settingsFeature = window.Weld && window.Weld.settings;
      if (settingsFeature && typeof settingsFeature.render === 'function') {
        return settingsFeature.render(state);
      }
      return '';
    },
    attach(container, state) {
      const settingsFeature = window.Weld && window.Weld.settings;
      if (settingsFeature && typeof settingsFeature.attach === 'function') {
        settingsFeature.attach(container, state);
      }
    }
  });
})();
