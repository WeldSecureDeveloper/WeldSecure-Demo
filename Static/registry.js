(function () {
  const registry = window.WeldRegistry || (window.WeldRegistry = {});
  const registerRoute =
    window.registerWeldRoute ||
    function registerRoute(name, config) {
      registry[name] = config || {};
      return registry[name];
    };

  const DEFAULT_SHELL = {
    pageClass: "page",
    innerClass: "page__inner",
    contentClass: "layout-content",
    contentId: "main-content"
  };

  const toArray = value => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  };

  function resolveState(state) {
    if (state && typeof state === "object") return state;
    if (window.Weld && typeof window.Weld.state === "object") return window.Weld.state;
    if (typeof window.state === "object") return window.state;
    return {};
  }

  function renderFromFeature(feature, methods, state) {
    if (!feature) return "";
    const ordered = toArray(methods);
    for (let i = 0; i < ordered.length; i += 1) {
      const method = ordered[i];
      if (!method) continue;
      if (method === "render" && typeof feature.render === "function") {
        const temp = document.createElement("div");
        feature.render(temp, state);
        return temp.innerHTML;
      }
      if (typeof feature[method] === "function") {
        return feature[method](state);
      }
    }
    return "";
  }

  function attachFromFeature(feature, methods, container, state) {
    if (!feature || !container) return;
    const ordered = toArray(methods);
    for (let i = 0; i < ordered.length; i += 1) {
      const method = ordered[i];
      if (!method) continue;
      if (method === "render" && typeof feature.render === "function") {
        feature.render(container, state);
        return;
      }
      if (typeof feature[method] === "function") {
        feature[method](container, state);
        return;
      }
    }
  }

  function featureRoute(featureKey, options = {}) {
    const {
      pageClass,
      innerClass,
      contentClass,
      contentId,
      templateMethods = [],
      attachMethods = [],
      getFeature
    } = options;

    const shell = {
      ...DEFAULT_SHELL,
      ...(pageClass ? { pageClass } : {}),
      ...(innerClass ? { innerClass } : {}),
      ...(contentClass ? { contentClass } : {}),
      ...(contentId !== undefined ? { contentId } : {})
    };

    const featureResolver =
      typeof getFeature === "function"
        ? getFeature
        : () => {
            if (featureKey === null || featureKey === undefined) return null;
            return window.Weld?.features?.[featureKey] || null;
          };

    return {
      ...shell,
      render(state) {
        const resolvedState = resolveState(state);
        const feature = featureResolver(resolvedState);
        return renderFromFeature(feature, templateMethods, resolvedState);
      },
      attach(container, state) {
        const resolvedState = resolveState(state);
        const feature = featureResolver(resolvedState);
        attachFromFeature(feature, attachMethods, container, resolvedState);
      }
    };
  }

  const routes = {
    landing: featureRoute("landing", {
      pageClass: "page page--landing",
      innerClass: "page__inner page__inner--single",
      templateMethods: ["template", "render"],
      attachMethods: ["attach", "render"]
    }),
    settings: featureRoute(null, {
      getFeature: () => (window.Weld && window.Weld.settings) || null,
      templateMethods: ["render"],
      attachMethods: ["attach"]
    }),
    customer: featureRoute("customer", {
      templateMethods: ["templateHub"],
      attachMethods: ["attachHub"]
    }),
    "customer-hub-rewards": featureRoute("customer", {
      templateMethods: ["templateHubRewards"],
      attachMethods: ["attachHubRewards"]
    }),
    "customer-hub-quests": featureRoute("customer", {
      templateMethods: ["templateHubQuests"],
      attachMethods: ["attachHubQuests"]
    }),
    "customer-badges": featureRoute("customer", {
      templateMethods: ["templateBadges"],
      attachMethods: ["attachBadges"]
    }),
    "customer-reports": featureRoute("customer", {
      templateMethods: ["templateReports"],
      attachMethods: ["attachReports"]
    }),
    "customer-redemptions": featureRoute("customer", {
      templateMethods: ["templateRedemptions"],
      attachMethods: ["attachRedemptions"]
    }),
    "customer-leaderboards": featureRoute("customer", {
      templateMethods: ["templateLeaderboards"],
      attachMethods: ["attachLeaderboards"]
    }),
    "client-dashboard": featureRoute("orgHub", {
      attachMethods: ["render"]
    }),
    "client-user-config": featureRoute("userConfig", {
      attachMethods: ["render"]
    }),
    "client-leaderboards": featureRoute("leaderboards", {
      attachMethods: ["render"]
    }),
    "client-reporting": featureRoute("dashboard", {
      attachMethods: ["render"]
    }),
    "client-badges": featureRoute("badges", {
      attachMethods: ["render"]
    }),
    "client-quests": featureRoute("hub", {
      attachMethods: ["render"]
    }),
    "client-rewards": featureRoute("client", {
      templateMethods: ["templateRewards"],
      attachMethods: ["attachRewards"]
    }),
    addin: featureRoute("reporter", {
      pageClass: "page page--addin",
      innerClass: "page__inner page__inner--single",
      contentClass: "layout-content layout-content--flush",
      templateMethods: [],
      attachMethods: ["render"]
    }),
    "weld-labs": featureRoute("labs", {
      templateMethods: ["template", "render"],
      attachMethods: ["attach", "render"]
    }),
    "weld-admin": featureRoute("admin", {
      templateMethods: ["template", "render"],
      attachMethods: ["attach", "render"]
    })
  };

  Object.entries(routes).forEach(([name, config]) => {
    registerRoute(name, config);
  });
})();
