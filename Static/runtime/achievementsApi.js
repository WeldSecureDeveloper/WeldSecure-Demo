(function () {
  const modules = window.WeldModules;
  function factory() {
    let cachedAchievementsModule = null;
    const loadAchievementsModule = () => {
      if (cachedAchievementsModule) return cachedAchievementsModule;
      const loader = window.WeldModules;
      if (loader && typeof loader.has === "function" && loader.has("runtime/achievements")) {
        try {
          cachedAchievementsModule = loader.use("runtime/achievements");
          return cachedAchievementsModule;
        } catch (error) {
          console.warn("runtime/achievements module unavailable.", error);
        }
      }
      if (typeof window.__WeldAchievementsModuleFactory === "function") {
        try {
          cachedAchievementsModule = window.__WeldAchievementsModuleFactory();
          return cachedAchievementsModule;
        } catch (factoryError) {
          console.warn("runtime/achievements factory fallback failed.", factoryError);
        }
      }
      return null;
    };

    const queueAchievementToast = entry => {
      if (!entry) return;
      const module = loadAchievementsModule();
      if (module?.queueAchievementToast) {
        module.queueAchievementToast(entry);
        return;
      }
      console.warn("Achievement toast skipped; runtime/achievements module unavailable.", entry);
    };

    const queueBadgeAchievements = (badges, options) => {
      const module = loadAchievementsModule();
      if (module?.queueBadgeAchievements) {
        module.queueBadgeAchievements(badges, options);
        return;
      }
      if (Array.isArray(badges) && badges.length > 0) {
        console.warn("Badge achievements skipped; runtime/achievements module unavailable.");
      }
    };

    const handleRouteAchievements = route => {
      const module = loadAchievementsModule();
      if (module?.handleRouteAchievements) {
        module.handleRouteAchievements(route);
      }
    };

    const unlockHubWelcomeAchievement = () => {
      const module = loadAchievementsModule();
      if (module?.unlockHubWelcomeAchievement) {
        module.unlockHubWelcomeAchievement();
      }
    };

    const resolveWeldAchievements = () => {
      const module = loadAchievementsModule();
      if (module?.WeldAchievements) {
        window.WeldAchievements = module.WeldAchievements;
        return module.WeldAchievements;
      }
      const fallback = window.WeldAchievements || {};
      fallback.queue = entry => queueAchievementToast(entry);
      fallback.queueBadgeUnlocks = (badges, options) => queueBadgeAchievements(badges, options);
      fallback.queueBadgeAchievements = (badges, options) => queueBadgeAchievements(badges, options);
      if (typeof fallback.isActive !== "function") {
        fallback.isActive = () => false;
      }
      window.WeldAchievements = fallback;
      return fallback;
    };

    resolveWeldAchievements();

    return {
      queueAchievementToast,
      queueBadgeAchievements,
      handleRouteAchievements,
      unlockHubWelcomeAchievement,
      getWeldAchievements: resolveWeldAchievements
    };
  }
  window.__WeldAchievementsApiFactory = factory;
  if (modules && (!modules.has || !modules.has("runtime/achievementsApi"))) {
    modules.define("runtime/achievementsApi", factory);
  }
})();

