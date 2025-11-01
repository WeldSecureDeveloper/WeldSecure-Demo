(function () {
  const registry = window.WeldRegistry || (window.WeldRegistry = {});
  const registerRoute = window.registerWeldRoute || function registerRoute(name, config) {
    registry[name] = config || {};
    return registry[name];
  };

  registerRoute('landing', {
    pageClass: 'page page--landing',
    innerClass: 'page__inner page__inner--single',
    contentClass: 'layout-content',
    contentId: 'main-content',
    render() {
      const state = window.Weld?.state || window.state || {};
      const landingFeature = window.Weld?.features?.landing;
      if (landingFeature && typeof landingFeature.template === 'function') {
        return landingFeature.template(state);
      }
      if (landingFeature && typeof landingFeature.render === 'function') {
        const temp = document.createElement('div');
        landingFeature.render(temp, state);
        return temp.innerHTML;
      }
      return '';
    },
    attach(container, state) {
      const landingFeature = window.Weld?.features?.landing;
      if (landingFeature && typeof landingFeature.attach === 'function') {
        landingFeature.attach(container, state);
      } else if (landingFeature && typeof landingFeature.render === 'function') {
        landingFeature.render(container, state);
      }
    }
  });

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
