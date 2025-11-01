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

  registerRoute('customer', {
    pageClass: 'page',
    innerClass: 'page__inner',
    contentClass: 'layout-content',
    contentId: 'main-content',
    render() {
      const state = window.Weld?.state || window.state || {};
      const feature = window.Weld?.features?.customer;
      if (feature && typeof feature.templateHub === 'function') {
        return feature.templateHub(state);
      }
      return '';
    },
    attach(container, state) {
      const feature = window.Weld?.features?.customer;
      if (feature && typeof feature.attachHub === 'function') {
        feature.attachHub(container, state);
        return;
      }
    }
  });

  registerRoute('customer-badges', {
    pageClass: 'page',
    innerClass: 'page__inner',
    contentClass: 'layout-content',
    contentId: 'main-content',
    render() {
      const state = window.Weld?.state || window.state || {};
      const feature = window.Weld?.features?.customer;
      if (feature && typeof feature.templateBadges === 'function') {
        return feature.templateBadges(state);
      }
      return '';
    },
    attach(container, state) {
      const feature = window.Weld?.features?.customer;
      if (feature && typeof feature.attachBadges === 'function') {
        feature.attachBadges(container, state);
        return;
      }
    }
  });

  registerRoute('customer-reports', {
    pageClass: 'page',
    innerClass: 'page__inner',
    contentClass: 'layout-content',
    contentId: 'main-content',
    render() {
      const state = window.Weld?.state || window.state || {};
      const feature = window.Weld?.features?.customer;
      if (feature && typeof feature.templateReports === 'function') {
        return feature.templateReports(state);
      }
      return '';
    },
    attach(container, state) {
      const feature = window.Weld?.features?.customer;
      if (feature && typeof feature.attachReports === 'function') {
        feature.attachReports(container, state);
        return;
      }
    }
  });

  registerRoute('customer-redemptions', {
    pageClass: 'page',
    innerClass: 'page__inner',
    contentClass: 'layout-content',
    contentId: 'main-content',
    render() {
      const state = window.Weld?.state || window.state || {};
      const feature = window.Weld?.features?.customer;
      if (feature && typeof feature.templateRedemptions === 'function') {
        return feature.templateRedemptions(state);
      }
      return '';
    },
    attach(container, state) {
      const feature = window.Weld?.features?.customer;
      if (feature && typeof feature.attachRedemptions === 'function') {
        feature.attachRedemptions(container, state);
        return;
      }
    }
  });

  registerRoute('client-dashboard', {
    pageClass: 'page',
    innerClass: 'page__inner',
    contentClass: 'layout-content',
    contentId: 'main-content',
    render() {
      return '';
    },
    attach(container, state) {
      const feature = window.Weld?.features?.orgHub;
      if (feature && typeof feature.render === 'function') {
        feature.render(container, state);
      }
    }
  });

  registerRoute('client-reporting', {
    pageClass: 'page',
    innerClass: 'page__inner',
    contentClass: 'layout-content',
    contentId: 'main-content',
    render() {
      return '';
    },
    attach(container, state) {
      const feature = window.Weld?.features?.dashboard;
      if (feature && typeof feature.render === 'function') {
        feature.render(container, state);
      }
    }
  });

  registerRoute('client-badges', {
    pageClass: 'page',
    innerClass: 'page__inner',
    contentClass: 'layout-content',
    contentId: 'main-content',
    render() {
      return '';
    },
    attach(container, state) {
      const feature = window.Weld?.features?.badges;
      if (feature && typeof feature.render === 'function') {
        feature.render(container, state);
      }
    }
  });

  registerRoute('client-quests', {
    pageClass: 'page',
    innerClass: 'page__inner',
    contentClass: 'layout-content',
    contentId: 'main-content',
    render() {
      return '';
    },
    attach(container, state) {
      const feature = window.Weld?.features?.hub;
      if (feature && typeof feature.render === 'function') {
        feature.render(container, state);
      }
    }
  });

  registerRoute('client-rewards', {
    pageClass: 'page',
    innerClass: 'page__inner',
    contentClass: 'layout-content',
    contentId: 'main-content',
    render() {
      const state = window.Weld?.state || window.state || {};
      const feature = window.Weld?.features?.client;
      if (feature && typeof feature.templateRewards === 'function') {
        return feature.templateRewards(state);
      }
      return '';
    },
    attach(container, state) {
      const feature = window.Weld?.features?.client;
      if (feature && typeof feature.attachRewards === 'function') {
        feature.attachRewards(container, state);
        return;
      }
    }
  });

  registerRoute('addin', {
    pageClass: 'page page--addin',
    innerClass: 'page__inner page__inner--single',
    contentClass: 'layout-content layout-content--flush',
    contentId: 'main-content',
    render() {
      return '';
    },
    attach(container, state) {
      const feature = window.Weld?.features?.reporter;
      if (feature && typeof feature.render === 'function') {
        feature.render(container, state);
      }
    }
  });

  registerRoute('weld-labs', {
    pageClass: 'page',
    innerClass: 'page__inner',
    contentClass: 'layout-content',
    contentId: 'main-content',
    render() {
      const state = window.Weld?.state || window.state || {};
      const feature = window.Weld?.features?.labs;
      if (feature && typeof feature.template === 'function') {
        return feature.template(state);
      }
      if (feature && typeof feature.render === 'function') {
        const temp = document.createElement('div');
        feature.render(temp, state);
        return temp.innerHTML;
      }
      return '';
    },
    attach(container, state) {
      const feature = window.Weld?.features?.labs;
      if (feature && typeof feature.attach === 'function') {
        feature.attach(container, state);
        return;
      }
      if (feature && typeof feature.render === 'function') {
        feature.render(container, state);
      }
    }
  });

  registerRoute('weld-admin', {
    pageClass: 'page',
    innerClass: 'page__inner',
    contentClass: 'layout-content',
    contentId: 'main-content',
    render() {
      const state = window.Weld?.state || window.state || {};
      const feature = window.Weld?.features?.admin;
      if (feature && typeof feature.template === 'function') {
        return feature.template(state);
      }
      if (feature && typeof feature.render === 'function') {
        const temp = document.createElement('div');
        feature.render(temp, state);
        return temp.innerHTML;
      }
      return '';
    },
    attach(container, state) {
      const feature = window.Weld?.features?.admin;
      if (feature && typeof feature.attach === 'function') {
        feature.attach(container, state);
        return;
      }
      if (feature && typeof feature.render === 'function') {
        feature.render(container, state);
      }
    }
  });
})();
