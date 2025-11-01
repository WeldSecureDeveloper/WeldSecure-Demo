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
      if (typeof window.renderCustomer === 'function') {
        return window.renderCustomer();
      }
      return '';
    },
    attach(container, state) {
      const feature = window.Weld?.features?.customer;
      if (feature && typeof feature.attachHub === 'function') {
        feature.attachHub(container, state);
        return;
      }
      if (typeof window.attachCustomerEvents === 'function') {
        window.attachCustomerEvents(container);
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
      if (typeof window.renderCustomerBadgesPage === 'function') {
        return window.renderCustomerBadgesPage();
      }
      return '';
    },
    attach(container, state) {
      const feature = window.Weld?.features?.customer;
      if (feature && typeof feature.attachBadges === 'function') {
        feature.attachBadges(container, state);
        return;
      }
      if (typeof window.attachCustomerBadgesEvents === 'function') {
        window.attachCustomerBadgesEvents(container);
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
      if (typeof window.renderCustomerReportsPage === 'function') {
        return window.renderCustomerReportsPage();
      }
      return '';
    },
    attach(container, state) {
      const feature = window.Weld?.features?.customer;
      if (feature && typeof feature.attachReports === 'function') {
        feature.attachReports(container, state);
        return;
      }
      if (typeof window.attachCustomerReportsEvents === 'function') {
        window.attachCustomerReportsEvents(container);
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
      if (typeof window.renderCustomerRedemptionsPage === 'function') {
        return window.renderCustomerRedemptionsPage();
      }
      return '';
    },
    attach(container, state) {
      const feature = window.Weld?.features?.customer;
      if (feature && typeof feature.attachRedemptions === 'function') {
        feature.attachRedemptions(container, state);
        return;
      }
      if (typeof window.attachCustomerRedemptionsEvents === 'function') {
        window.attachCustomerRedemptionsEvents(container);
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
      if (typeof window.renderClientRewards === 'function') {
        return window.renderClientRewards();
      }
      return '';
    },
    attach(container, state) {
      const feature = window.Weld?.features?.client;
      if (feature && typeof feature.attachRewards === 'function') {
        feature.attachRewards(container, state);
        return;
      }
      if (typeof window.attachClientRewardsEvents === 'function') {
        window.attachClientRewardsEvents(container);
      }
    }
  });
})();
