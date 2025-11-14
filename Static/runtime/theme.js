(function () {
  const modules = window.WeldModules;
  const hasFn = modules && typeof modules.has === "function" ? modules.has : null;
  if (!modules || (hasFn && hasFn("runtime/theme"))) {
    return;
  }

  function safeIncludes(list, value) {
    if (!Array.isArray(list)) return false;
    for (let i = 0; i < list.length; i += 1) {
      if (list[i] === value) {
        return true;
      }
    }
    return false;
  }

  function resolveState(state) {
    if (state && typeof state === "object") {
      return state;
    }
    if (window.Weld && window.Weld.state && typeof window.Weld.state === "object") {
      return window.Weld.state;
    }
    if (window.state && typeof window.state === "object") {
      return window.state;
    }
    return {};
  }

  modules.define("runtime/theme", function () {
    const THEME_OPTIONS = ["light", "dark"];

    function normalizeTheme(theme) {
      if (typeof theme === "string") {
        const normalized = theme.trim().toLowerCase();
        if (safeIncludes(THEME_OPTIONS, normalized)) {
          return normalized;
        }
      }
      return "light";
    }

    function applyTheme(theme, providedState) {
      const nextTheme = normalizeTheme(theme);
      const appState = resolveState(providedState);
      if (!appState.meta || typeof appState.meta !== "object") {
        appState.meta = {};
      }
      appState.meta.theme = nextTheme;

      const root = document.documentElement;
      const body = document.body;
      if (root) {
        root.setAttribute("data-theme", nextTheme);
        root.classList.toggle("theme-dark", nextTheme === "dark");
        root.classList.toggle("theme-light", nextTheme === "light");
        if (root.style && typeof root.style === "object") {
          root.style.colorScheme = nextTheme === "dark" ? "dark" : "light";
        }
      }
      if (body) {
        body.setAttribute("data-theme", nextTheme);
        body.classList.toggle("theme-dark", nextTheme === "dark");
        body.classList.toggle("theme-light", nextTheme === "light");
      }
      return nextTheme;
    }

    function initializeTheme(state) {
      const currentTheme =
        state && state.meta && typeof state.meta === "object" ? state.meta.theme : undefined;
      applyTheme(currentTheme, state);
    }

    return {
      THEME_OPTIONS,
      normalizeTheme,
      applyTheme,
      initializeTheme
    };
  });
})();
