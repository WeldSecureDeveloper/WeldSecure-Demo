(function () {
  const modules = window.WeldModules;
  if (!modules || modules.has("components/globalNav")) return;

  modules.define("components/globalNav", function () {
    const AppData = window.AppData || {};

    const resolveRoleLabels = () => {
      if (modules && typeof modules.has === "function" && modules.has("data/app/enums")) {
        try {
          const enums = modules.use("data/app/enums");
          if (enums && enums.roleLabels) {
            return enums.roleLabels;
          }
        } catch (error) {
          console.warn("globalNav: data/app/enums unavailable.", error);
        }
      }
      return AppData.ROLE_LABELS || {};
    };

    const resolveNavGroups = () => {
      if (modules && typeof modules.has === "function" && modules.has("data/app/nav")) {
        try {
          const navModule = modules.use("data/app/nav");
          if (Array.isArray(navModule)) {
            return navModule;
          }
        } catch (error) {
          console.warn("globalNav: data/app/nav unavailable.", error);
        }
      }
      return Array.isArray(AppData.NAV_GROUPS) ? AppData.NAV_GROUPS : [];
    };

    const resolveRoutes = () => {
      if (modules && typeof modules.has === "function" && modules.has("data/app/routes")) {
        try {
          const routesModule = modules.use("data/app/routes");
          if (routesModule && typeof routesModule === "object") {
            return routesModule;
          }
        } catch (error) {
          console.warn("globalNav: data/app/routes unavailable.", error);
        }
      }
      return AppData.ROUTES || {};
    };

    const ROLE_LABELS = resolveRoleLabels();
    const NAV_GROUPS = resolveNavGroups();
    const ROUTES = resolveRoutes();
    const WeldUtil = window.WeldUtil || {};
    const THEME_TOGGLE_LABELS = {
      light: "Switch to dark mode",
      dark: "Switch to light mode"
    };

    function renderMoonIcon() {
      return `
        <svg class="global-nav__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          ></path>
        </svg>
      `;
    }

    function renderSunIcon() {
      return `
        <svg class="global-nav__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <circle
            cx="12"
            cy="12"
            r="4.5"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          ></circle>
          <path
            d="M12 2.25v2.5M12 19.25v2.5M4.219 4.219l1.768 1.768M17.99 17.99l1.768 1.768M2.25 12h2.5M19.25 12h2.5M4.219 19.781l1.768-1.768M17.99 6.01l1.768-1.768"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          ></path>
        </svg>
      `;
    }

    function renderThemeToggle(theme) {
      const normalized = theme === "dark" ? "dark" : "light";
      const ariaLabel = THEME_TOGGLE_LABELS[normalized];
      const iconMarkup = normalized === "dark" ? renderSunIcon() : renderMoonIcon();
      const pressed = normalized === "dark" ? "true" : "false";
      return `
        <button
          type="button"
          class="global-nav__icon-button"
          id="global-theme-toggle"
          data-theme-toggle
          aria-pressed="${pressed}"
          aria-label="${ariaLabel}"
          title="${ariaLabel}"
        >
          ${iconMarkup.trim()}
        </button>
      `;
    }

    function isGuidedTourEnabled(state) {
      if (window.WeldGuidedTour && typeof window.WeldGuidedTour.isEnabled === "function") {
        try {
          return window.WeldGuidedTour.isEnabled();
        } catch {
          // ignore
        }
      }
      const guidedMeta = state?.meta?.guidedTour;
      if (!guidedMeta || typeof guidedMeta !== "object") {
        return true;
      }
      return guidedMeta.enabled !== false;
    }

    function renderGuidedTourButton(state) {
      const enabled = isGuidedTourEnabled(state);
      const label = enabled ? "Turn guided tour off" : "Turn guided tour on";
      return `
        <button
          type="button"
          class="global-nav__icon-button global-nav__icon-button--tour${enabled ? " global-nav__icon-button--tour-active" : ""}"
          data-guided-tour-toggle
          aria-pressed="${enabled ? "true" : "false"}"
          aria-label="${label}"
          title="${label}"
        >
          <span class="global-nav__icon global-nav__icon--tour" aria-hidden="true">?</span>
        </button>
      `;
    }

    function ensureGuidedTourMeta(state) {
      if (!state || typeof state !== "object") return null;
      if (!state.meta || typeof state.meta !== "object") {
        state.meta = {};
      }
      const guided = state.meta.guidedTour;
      if (!guided || typeof guided !== "object") {
        state.meta.guidedTour = { enabled: true, dismissedRoutes: {} };
        return state.meta.guidedTour;
      }
      if (!guided.dismissedRoutes || typeof guided.dismissedRoutes !== "object") {
        guided.dismissedRoutes = {};
      }
      return guided;
    }

    function renderGlobalNav(activeRoute, state) {
      const currentTheme = state?.meta?.theme === "dark" ? "dark" : "light";
      return `
    <nav class="global-nav" aria-label="Primary navigation" data-theme="${currentTheme}">
      <button type="button" class="brand global-nav__brand" id="brand-button">
        <span class="brand__glyph" aria-hidden="true">
          <img
            src="./WeldSecure_logo.svg"
            alt=""
            class="brand__logo"
            width="40"
            height="40"
            decoding="async"
          />
        </span>
        <span>WeldSecure</span>
      </button>
      <div class="global-nav__groups">
        ${NAV_GROUPS.map(group => {
          const isGroupActive = group.items.some(item => item.route === activeRoute);
          const activeItem = group.items.find(item => item.route === activeRoute);
          const groupRole = group.role || (activeItem && activeItem.role) || "";
          const groupRoleAttr = groupRole ? ` data-role="${groupRole}"` : "";
          return `
            <div class="global-nav__group ${isGroupActive ? "global-nav__group--active" : ""}"${groupRoleAttr}>
              <button type="button" class="global-nav__trigger" data-group="${group.label}"${groupRoleAttr}>
                ${group.label}
                <span class="global-nav__caret" aria-hidden="true"></span>
              </button>
              <div class="global-nav__menu" role="menu">
                ${group.items
                  .map(item => {
                    const isActive = activeRoute === item.route;
                    const ariaCurrent = isActive ? 'aria-current="page"' : "";
                    const roleAttr = item.role ? ` data-role="${item.role}"` : "";
                    return `
                      <button type="button" role="menuitem" class="global-nav__item ${
                        isActive ? "global-nav__item--active" : ""
                      }" data-route="${item.route}"${roleAttr} ${ariaCurrent}>
                        ${item.label}
                      </button>
                    `;
                  })
                  .join("")}
              </div>
            </div>
          `;
        }).join("")}
      </div>
      <div class="global-nav__actions">
        <button type="button" class="button-pill button-pill--primary global-nav__reset" id="global-reset">
          Reset
        </button>
        ${renderThemeToggle(currentTheme)}
        ${renderGuidedTourButton(state)}
        <button
        type="button"
        class="global-nav__icon-button"
        id="global-settings"
        aria-label="Open settings"
        data-settings-toggle
      >
        <svg class="global-nav__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            d="M10.325 4.317c.427-1.756 3.002-1.756 3.429 0a1.72 1.72 0 002.586 1.066c1.544-.89 3.31.876 2.42 2.42a1.72 1.72 0 001.065 2.572c1.756.426 1.756 3.002 0 3.429a1.72 1.72 0 00-1.066 2.586c.89 1.544-.876 3.31-2.42 2.42a1.72 1.72 0 00-2.586 1.065c-.426 1.756-3.002 1.756-3.429 0a1.72 1.72 0 00-2.586-1.066c-1.544.89-3.31-.876-2.42-2.42a1.72 1.72 0 00-1.065-2.586c-1.756-.426-1.756-3.002 0-3.429a1.72 1.72 0 001.066-2.586c-.89-1.544.876-3.31 2.42-2.42a1.72 1.72 0 002.586-1.065z"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          ></path>
          <circle
            cx="12"
            cy="12"
            r="3"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          ></circle>
        </svg>
      </button>
    </div>
  </nav>
      `;
    }

    function setupNavScrollBehavior(globalNav) {
      if (!globalNav || typeof window === "undefined") return;

      if (typeof window.__weldGlobalNavScrollCleanup__ === "function") {
        window.__weldGlobalNavScrollCleanup__();
      }

      let lastScrollY = window.scrollY || 0;
      let ticking = false;

      const handleScroll = () => {
        const currentY = window.scrollY || 0;
        const delta = currentY - lastScrollY;
        const scrollingDown = delta > 6;
        const scrollingUp = delta < -6;
        const nearTop = currentY < 32;

        globalNav.classList.toggle("global-nav--solid", currentY > 32);

        if (nearTop || scrollingUp) {
          globalNav.classList.remove("global-nav--hidden");
        } else if (scrollingDown) {
          globalNav.classList.add("global-nav--hidden");
        }

        lastScrollY = currentY;
        ticking = false;
      };

      const onScroll = () => {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(handleScroll);
        }
      };

      window.addEventListener("scroll", onScroll, { passive: true });
      window.__weldGlobalNavScrollCleanup__ = () => {
        window.removeEventListener("scroll", onScroll);
      };

      handleScroll();
    }

    function attachHeaderEvents(container) {
      if (!container) return;
      const brandBtn = container.querySelector("#brand-button");
      if (brandBtn) {
        brandBtn.addEventListener("click", event => {
          event.preventDefault();
          event.stopPropagation();
          if (typeof navigate === "function") {
            navigate("landing");
            return;
          }
          if (typeof setRole === "function") {
            setRole(null, "landing");
          }
        });
      }
    }

    function attachGlobalNav(container, state) {
      if (!container) return;
      const activeRoute = state?.meta?.route || "landing";

      const navHost = container.querySelector(".global-nav");
      if (navHost) {
        navHost.outerHTML = renderGlobalNav(activeRoute, state);
      }

      const globalNav = container.querySelector(".global-nav");
      if (!globalNav) return;
      attachHeaderEvents(globalNav);

      const groups = Array.from(globalNav.querySelectorAll(".global-nav__group"));
      const closeGroups = () => {
        groups.forEach(group => {
          group.classList.remove("global-nav__group--open");
          const triggerEl = group.querySelector(".global-nav__trigger");
          if (triggerEl) {
            triggerEl.setAttribute("aria-expanded", "false");
          }
        });
      };

      groups.forEach(group => {
        const trigger = group.querySelector(".global-nav__trigger");
        const menu = group.querySelector(".global-nav__menu");
        if (!trigger || !menu) return;

        trigger.setAttribute("aria-expanded", "false");
        trigger.setAttribute("aria-haspopup", "true");

        const toggleGroup = event => {
          event.stopPropagation();
          const isOpen = group.classList.contains("global-nav__group--open");
          closeGroups();
          if (!isOpen) {
            group.classList.add("global-nav__group--open");
            trigger.setAttribute("aria-expanded", "true");
          }
        };

        trigger.addEventListener("click", event => {
          event.preventDefault();
          toggleGroup(event);
        });

        trigger.addEventListener("keydown", event => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          toggleGroup(event);
        });

        menu.querySelectorAll(".global-nav__item").forEach(item => {
          item.addEventListener("click", event => {
            event.preventDefault();
            const route = item.dataset.route;
            const requiredRole = item.dataset.role;
            if (route === "addin") {
              const guidedMeta = ensureGuidedTourMeta(state);
              if (guidedMeta) {
                guidedMeta.enabled = false;
              }
            }
            closeGroups();
            if (requiredRole && typeof setRole === "function") {
              setRole(requiredRole, route);
              return;
            }
            if (typeof navigate === "function") {
              navigate(route);
            }
          });
        });
      });

      const resetButton = globalNav.querySelector("#global-reset");
      if (resetButton) {
        resetButton.addEventListener("click", event => {
          event.preventDefault();
          event.stopPropagation();
          closeGroups();
          const runReset = () => {
            if (typeof resetDemo === "function") {
              resetDemo();
            }
          };
          if (typeof openDialog === "function") {
            openDialog({
              title: "Reset demo data?",
              description: "This clears persona progress and restores the default walkthrough.",
              confirmLabel: "Reset demo data",
              cancelLabel: "Keep current state",
              tone: "critical",
              onConfirm: closeDialog => {
                runReset();
                if (typeof closeDialog === "function") {
                  closeDialog();
                }
              }
            });
          } else {
            runReset();
          }
        });
      }

      const settingsToggle = globalNav.querySelector("[data-settings-toggle]");
      if (settingsToggle) {
        settingsToggle.addEventListener("click", event => {
          event.preventDefault();
          event.stopPropagation();
          closeGroups();
          const settingsOpen = Boolean(state?.meta?.settingsOpen);
          if (settingsOpen) {
            if (typeof closeSettings === "function") {
              closeSettings();
            }
          } else if (typeof openSettings === "function") {
            openSettings();
          }
        });
      }

      const themeToggle = globalNav.querySelector("[data-theme-toggle]");
      if (themeToggle) {
        themeToggle.addEventListener("click", event => {
          event.preventDefault();
          event.stopPropagation();
          closeGroups();
          if (typeof window.toggleTheme === "function") {
            window.toggleTheme();
          }
        });
      }

      const guidedTourToggle = globalNav.querySelector("[data-guided-tour-toggle]");
      if (guidedTourToggle) {
        const applyGuidedTourState = enabled => {
          const isOn = enabled !== false;
          const label = isOn ? "Turn guided tour off" : "Turn guided tour on";
          guidedTourToggle.setAttribute("aria-pressed", isOn ? "true" : "false");
          guidedTourToggle.setAttribute("aria-label", label);
          guidedTourToggle.setAttribute("title", label);
          guidedTourToggle.classList.toggle("global-nav__icon-button--tour-active", isOn);
        };
        applyGuidedTourState(isGuidedTourEnabled(state));
        guidedTourToggle.addEventListener("click", event => {
          event.preventDefault();
          event.stopPropagation();
          closeGroups();
          if (window.WeldGuidedTour && typeof window.WeldGuidedTour.toggle === "function") {
            const next = window.WeldGuidedTour.toggle();
            applyGuidedTourState(next);
            if (window.WeldServices && typeof window.WeldServices.setGuidedTourEnabled === "function") {
              window.WeldServices.setGuidedTourEnabled(next, state);
            }
          }
        });
      }

      setupNavScrollBehavior(globalNav);

      const outsideHandler = event => {
        if (!globalNav.contains(event.target)) {
          closeGroups();
        }
      };

      if (window.__weldGlobalNavOutside__) {
        document.removeEventListener("click", window.__weldGlobalNavOutside__);
      }
      document.addEventListener("click", outsideHandler);
      window.__weldGlobalNavOutside__ = outsideHandler;
    }

    return {
      renderGlobalNav,
      attachGlobalNav,
      attachHeaderEvents
    };
  });
})();
