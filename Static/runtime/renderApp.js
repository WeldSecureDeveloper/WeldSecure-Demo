(function () {
  const modules = window.WeldModules;

  function factory() {
    let lastRenderedRoute = null;
    let badgeEdgeAlignmentFrame = null;
    let badgeEdgeAlignmentScope = null;
    let badgeEdgeResizeListenerAttached = false;

    function resolveState(providedState) {
      if (providedState && typeof providedState === "object") {
        if (!providedState.meta || typeof providedState.meta !== "object") {
          providedState.meta = {};
        }
        return providedState;
      }
      if (window.Weld && typeof window.Weld.state === "object") {
        return resolveState(window.Weld.state);
      }
      if (typeof window.state === "object") {
        return resolveState(window.state);
      }
      return { meta: { route: "landing", role: null } };
    }

    function resolveRoutes(overrides) {
      if (overrides && typeof overrides === "object") {
        return overrides;
      }
      if (window.ROUTES && typeof window.ROUTES === "object") {
        return window.ROUTES;
      }
      if (window.AppData && typeof window.AppData.ROUTES === "object") {
        return window.AppData.ROUTES;
      }
      return {};
    }

    function ensureRouteSafety(state, routes) {
      if (!state.meta || typeof state.meta !== "object") {
        state.meta = { route: "landing", role: null };
        return;
      }
      const currentRoute = state.meta.route;
      const routeInfo = routes[currentRoute];
      if (!routeInfo) {
        state.meta.route = "landing";
        state.meta.role = null;
        return;
      }
      if (routeInfo.requiresRole && state.meta.role !== routeInfo.requiresRole) {
        state.meta.route = "landing";
        state.meta.role = null;
      }
    }

    function getRegistry(context) {
      if (modules && typeof modules.has === "function") {
        try {
          if (modules.has("runtime/routes")) {
            const routesModule = modules.use("runtime/routes");
            if (routesModule && typeof routesModule.getRegistry === "function") {
              const resolved = routesModule.getRegistry();
              if (resolved) {
                return resolved;
              }
            }
          }
        } catch (error) {
          console.warn("renderApp: failed to load runtime/routes registry.", error);
        }
      }
      if (context && typeof context.getRegistry === "function") {
        try {
          const registry = context.getRegistry();
          if (registry) return registry;
        } catch (error) {
          console.warn("renderApp registry resolver failed.", error);
        }
      }
      if (context && context.registry && typeof context.registry === "object") {
        return context.registry;
      }
      if (window.WeldRegistry && typeof window.WeldRegistry === "object") {
        return window.WeldRegistry;
      }
      return {};
    }

    function getAppRoot(context) {
      if (context && typeof context.getAppRoot === "function") {
        try {
          const node = context.getAppRoot();
          if (node) return node;
        } catch (error) {
          console.warn("renderApp getAppRoot resolver failed.", error);
        }
      }
      return document.getElementById("app");
    }

    function invokeHook(hook, ...args) {
      if (typeof hook !== "function") return undefined;
      try {
        return hook(...args);
      } catch (error) {
        console.warn("renderApp hook failed.", error);
        return undefined;
      }
    }

    function clearGuidedTourOverlay() {
      if (window.WeldGuidedTour && typeof window.WeldGuidedTour.clear === "function") {
        try {
          window.WeldGuidedTour.clear();
        } catch (error) {
          console.warn("Failed to clear guided tour overlay.", error);
        }
      }
    }

    function scrollViewportToTop() {
      if (typeof window === "undefined") return;
      const doc = document.scrollingElement || document.documentElement || document.body;
      let previousScrollBehavior;
      if (doc && doc.style) {
        previousScrollBehavior = doc.style.scrollBehavior;
        doc.style.scrollBehavior = "auto";
      }
      if (doc && typeof doc.scrollTo === "function") {
        doc.scrollTo(0, 0);
      } else if (typeof window.scrollTo === "function") {
        window.scrollTo(0, 0);
      }
      if (doc && doc.style) {
        if (typeof previousScrollBehavior === "string" && previousScrollBehavior.length > 0) {
          doc.style.scrollBehavior = previousScrollBehavior;
        } else {
          doc.style.removeProperty("scroll-behavior");
        }
      }
    }

    function scheduleBadgeEdgeAlignment(scope) {
      if (typeof window === "undefined" || typeof document === "undefined") {
        return;
      }
      const nextScope =
        scope && typeof scope.querySelectorAll === "function" ? scope : document;
      badgeEdgeAlignmentScope = nextScope;
      if (badgeEdgeAlignmentFrame) return;
      const requestFrame =
        typeof window.requestAnimationFrame === "function"
          ? window.requestAnimationFrame.bind(window)
          : callback => window.setTimeout(callback, 16);
      badgeEdgeAlignmentFrame = requestFrame(() => {
        badgeEdgeAlignmentFrame = null;
        const target =
          badgeEdgeAlignmentScope && badgeEdgeAlignmentScope.isConnected
            ? badgeEdgeAlignmentScope
            : document;
        applyBadgeEdgeAlignment(target);
      });
      if (!badgeEdgeResizeListenerAttached) {
        badgeEdgeResizeListenerAttached = true;
        window.addEventListener("resize", () => scheduleBadgeEdgeAlignment());
      }
    }

    function applyBadgeEdgeAlignment(scope) {
      if (!scope || typeof scope.querySelectorAll !== "function") return;
      const badges = Array.from(scope.querySelectorAll(".catalogue-badge"));
      if (badges.length === 0) return;
      const viewportWidth = Math.max(
        window.innerWidth || 0,
        document.documentElement?.clientWidth || 0,
        0
      );
      if (viewportWidth <= 0) return;
      const safePadding = 16;
      badges.forEach(badge => alignBadgeEdgesForBadge(badge, viewportWidth, safePadding));
    }

    function alignBadgeEdgesForBadge(badge, viewportWidth, safePadding) {
      if (
        !badge ||
        typeof badge.querySelector !== "function" ||
        typeof badge.classList?.remove !== "function"
      ) {
        return;
      }
      const edgeClass = "catalogue-badge--edge";
      const edgeRightClass = "catalogue-badge--edge-right";
      const edgeLeftClass = "catalogue-badge--edge-left";
      badge.classList.remove(edgeClass, edgeRightClass, edgeLeftClass);
      const card = badge.querySelector(".catalogue-badge-card");
      if (!card || typeof card.getBoundingClientRect !== "function") return;
      const cardRect = card.getBoundingClientRect();
      if (!cardRect || !Number.isFinite(cardRect.left) || !Number.isFinite(cardRect.right)) {
        return;
      }
      const thresholdLeft = safePadding;
      const thresholdRight = viewportWidth - safePadding;
      const overflowLeft = cardRect.left < thresholdLeft;
      const overflowRight = cardRect.right > thresholdRight;
      if (overflowRight) {
        badge.classList.add(edgeClass, edgeRightClass);
      }
      if (overflowLeft) {
        badge.classList.add(edgeLeftClass);
      }
    }

    function renderApp(context = {}) {
      const state = resolveState(context.state);
      const routes = resolveRoutes(context.routes);

      ensureRouteSafety(state, routes);

      if (typeof context.applyTheme === "function") {
        invokeHook(context.applyTheme, state?.meta?.theme, state);
      }

      const app = getAppRoot(context);
      if (!app) {
        console.warn("renderApp: #app container not found.");
        return;
      }

      const route = state?.meta?.route || "landing";
      const shouldResetScroll = lastRenderedRoute !== null && lastRenderedRoute !== route;
      if (lastRenderedRoute && lastRenderedRoute !== route) {
        clearGuidedTourOverlay();
      }
      invokeHook(context.handleRouteAchievements, route);

      if (route !== "addin") {
        invokeHook(context.teardownBadgeShowcase);
      }

      const registry = getRegistry(context);
      const routeConfig = route ? registry[route] : undefined;

      if (!routeConfig) {
        if (route !== "landing" && state.meta) {
          state.meta.route = "landing";
          invokeHook(context.saveState, state);
          renderApp(context);
        }
        return;
      }

      const pageClass = routeConfig.pageClass || "page";
      const innerClass = routeConfig.innerClass || "page__inner";
      const contentClass = routeConfig.contentClass || "layout-content";
      const contentId = routeConfig.contentId || "main-content";
      const renderedContent =
        typeof routeConfig.render === "function" ? routeConfig.render(state) : "";
      const mainIdAttribute = contentId ? ` id="${contentId}"` : "";
      const renderHeader = typeof context.renderHeader === "function" ? context.renderHeader : () => "";

      app.innerHTML = `
        <div class="${pageClass}">
          ${renderHeader()}
          <div class="${innerClass}">
            <main class="${contentClass}"${mainIdAttribute}>${renderedContent}</main>
          </div>
        </div>
      `;

      invokeHook(context.attachHeaderEvents, app);
      invokeHook(context.attachGlobalNav, app);
      invokeHook(context.initializeSettingsUI, app);

      const attachTarget =
        (contentId && app.querySelector("#" + contentId)) || app.querySelector("main") || app;
      if (typeof routeConfig.attach === "function") {
        try {
          routeConfig.attach(attachTarget, state);
        } catch (error) {
          console.warn(`renderApp: route attach failed for "${route}".`, error);
        }
      }

      scheduleBadgeEdgeAlignment(app);
      if (shouldResetScroll) {
        scrollViewportToTop();
      }
      lastRenderedRoute = route;
    }

    function renderAppPreservingScroll(context = {}) {
      if (typeof window === "undefined") {
        renderApp(context);
        return;
      }

      const doc = document.scrollingElement || document.documentElement || document.body;
      const scrollX = window.pageXOffset ?? window.scrollX ?? (doc ? doc.scrollLeft : 0) ?? 0;
      const scrollY = window.pageYOffset ?? window.scrollY ?? (doc ? doc.scrollTop : 0) ?? 0;
      let previousScrollBehavior;
      if (doc && doc.style) {
        previousScrollBehavior = doc.style.scrollBehavior;
        doc.style.scrollBehavior = "auto";
      }
      renderApp(context);
      if (doc && typeof doc.scrollTo === "function") {
        doc.scrollTo(scrollX, scrollY);
      } else if (typeof window.scrollTo === "function") {
        window.scrollTo(scrollX, scrollY);
      }
      if (doc && doc.style) {
        if (typeof previousScrollBehavior === "string" && previousScrollBehavior.length > 0) {
          doc.style.scrollBehavior = previousScrollBehavior;
        } else {
          doc.style.removeProperty("scroll-behavior");
        }
      }
    }

    return {
      renderApp,
      renderAppPreservingScroll
    };
  }

  window.__WeldRenderAppModuleFactory = factory;
  if (modules && (!modules.has || !modules.has("runtime/renderApp"))) {
    modules.define("runtime/renderApp", factory);
  }
})();
