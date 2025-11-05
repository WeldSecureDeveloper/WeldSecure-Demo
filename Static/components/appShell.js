(function () {
  const modules = window.WeldModules;
  if (!modules || modules.has("components/appShell")) return;

  modules.define("components/appShell", function () {
    const AppData = window.AppData || {};
    const ROLE_LABELS = AppData.ROLE_LABELS || {};
    const NAV_GROUPS = Array.isArray(AppData.NAV_GROUPS) ? AppData.NAV_GROUPS : [];
    const ROUTES = AppData.ROUTES || {};
    const BADGE_ICON_BACKDROPS = AppData.BADGE_ICON_BACKDROPS || {};
    const WeldUtil = window.WeldUtil || {};

    const getFormatNumber = () => {
      if (typeof window.formatNumber === "function") {
        return window.formatNumber;
      }
      return value => {
        const numeric = Number(value);
        if (!Number.isFinite(numeric)) return "0";
        return numeric.toLocaleString("en-GB");
      };
    };

    function renderBadgeSpotlight(badgeInput, state) {
      const formatNumber = getFormatNumber();
      const badges = Array.isArray(badgeInput)
        ? badgeInput.filter(Boolean)
        : badgeInput
        ? [badgeInput]
        : [];
      if (badges.length === 0) return "";
      const EXTRA_DISPLAY_LIMIT = 3;
      const [primaryBadge, ...extraBadges] = badges;
      const displayedExtras = extraBadges.slice(0, EXTRA_DISPLAY_LIMIT);
      const renderTile = badge => {
        if (!badge) return "";
        const safeId = WeldUtil.escapeHtml(String(badge.id ?? ""));
        const toneKey =
          typeof badge.tone === "string" && BADGE_ICON_BACKDROPS[badge.tone]
            ? badge.tone
            : "violet";
        const iconBackdrop =
          BADGE_ICON_BACKDROPS[toneKey]?.background ||
          BADGE_ICON_BACKDROPS.violet?.background ||
          "linear-gradient(135deg, #c7d2fe, #818cf8)";
        const iconShadow =
          BADGE_ICON_BACKDROPS[toneKey]?.shadow ||
          BADGE_ICON_BACKDROPS.violet?.shadow ||
          "rgba(79, 70, 229, 0.32)";
        const normalizedTitle =
          typeof badge.title === "string" && badge.title.trim().length > 0
            ? badge.title.trim()
            : "Badge unlocked";
        const rawPoints = Number(badge.points);
        const pointsValue = Number.isFinite(rawPoints) ? rawPoints : 0;
        const ariaLabel = `${normalizedTitle} badge, worth ${formatNumber(pointsValue)} points`;
        return `
      <div
        class="badge-spotlight-tile"
        role="listitem"
        tabindex="0"
        data-badge="${safeId}"
        aria-label="${WeldUtil.escapeHtml(ariaLabel)}">
        <span class="badge-spotlight-tile__icon" style="background:${iconBackdrop}; box-shadow:0 22px 44px ${iconShadow};">
          ${WeldUtil.renderIcon(badge.icon || "medal", "sm")}
        </span>
        <span class="badge-spotlight-tile__label">${WeldUtil.escapeHtml(normalizedTitle)}</span>
        <span class="badge-spotlight-tile__points" aria-label="${WeldUtil.escapeHtml(
          `${formatNumber(pointsValue)} points`
        )}">+${formatNumber(pointsValue)}</span>
      </div>
    `;
      };

      const extrasMarkup =
        extraBadges.length > 0
          ? (() => {
              const extraPanelId = WeldUtil.generateId("extra-badges");
              const formatExtra = badge => {
                if (!badge) return "";
                const safeId = WeldUtil.escapeHtml(String(badge.id ?? ""));
                const normalizedTitle =
                  typeof badge.title === "string" && badge.title.trim().length > 0
                    ? badge.title.trim()
                    : "Bonus badge";
                const rawPoints = Number(badge.points);
                const pointsValue = Number.isFinite(rawPoints) ? rawPoints : 0;
                return `
        <li class="badge-spotlight-extra__item" data-badge="${safeId}">
          <span class="badge-spotlight-extra__icon">${WeldUtil.renderIcon(
            badge.icon || "medal",
            "xs"
          )}</span>
          <span class="badge-spotlight-extra__name">${WeldUtil.escapeHtml(normalizedTitle)}</span>
          <span class="badge-spotlight-extra__points" aria-label="${WeldUtil.escapeHtml(
            `${formatNumber(pointsValue)} points`
          )}">+${formatNumber(pointsValue)}</span>
        </li>`;
              };

              return `
      <div class="badge-spotlight-extra" role="listitem">
        <button
          type="button"
          class="badge-spotlight-extra__trigger"
          aria-expanded="false"
          aria-controls="${extraPanelId}">
          +${formatNumber(extraBadges.length)}
        </button>
        <div class="badge-spotlight-extra__panel" id="${extraPanelId}" role="group" aria-label="Additional badges earned">
          <ul class="badge-spotlight-extra__list">
            ${displayedExtras.map(formatExtra).join("")}
          </ul>
        </div>
      </div>`;
            })()
          : "";

      return `
    <div class="badge-spotlight" data-badge-showcase>
      <div class="badge-spotlight__primary" role="list">
        ${renderTile(primaryBadge)}
        ${extrasMarkup}
      </div>
    </div>`;
    }

    function teardownBadgeShowcase() {
      if (typeof document === "undefined") return;
      document.querySelectorAll("[data-badge-showcase][data-badge-bound='true']").forEach(container => {
        const replacement = container.cloneNode(true);
        replacement.removeAttribute("data-badge-bound");
        container.replaceWith(replacement);
      });
    }

    function setupBadgeShowcase(container, state) {
      const formatNumber = getFormatNumber();
      const badgeContainer = container?.querySelector?.("[data-badge-showcase]");
      const badges =
        typeof window.getBadges === "function" ? window.getBadges(state) : state?.badges || [];
      if (!badgeContainer || !Array.isArray(badges) || badges.length === 0) return;

      if (badgeContainer.dataset.badgeBound === "true") {
        return;
      }

      const eligible = badges.filter(badge => badge && badge.icon);
      if (eligible.length === 0) {
        badgeContainer.innerHTML = "";
        return;
      }

      const storedBadgeIds = Array.isArray(state?.meta?.lastBadgeIds) ? state.meta.lastBadgeIds : [];
      let selections = storedBadgeIds.map(id => window.badgeById?.(id) || null).filter(Boolean);

      if (selections.length === 0) {
        const published = eligible.filter(badge => badge.published !== false);
        const pool = published.length > 0 ? published : eligible;
        if (pool.length === 0) {
          badgeContainer.innerHTML = "";
          return;
        }
        let desiredCount = pool.length >= 3 ? (Math.random() < 0.5 ? 2 : 3) : Math.min(pool.length, 3);
        if (desiredCount <= 0) desiredCount = 1;
        const poolCopy = pool.slice();
        for (let i = poolCopy.length - 1; i > 0; i -= 1) {
          const j = Math.floor(Math.random() * (i + 1));
          [poolCopy[i], poolCopy[j]] = [poolCopy[j], poolCopy[i]];
        }
        selections = poolCopy.slice(0, desiredCount);
      }

      badgeContainer.innerHTML = renderBadgeSpotlight(selections, state);
      badgeContainer.dataset.badgeBound = "true";

      const extraWrapper = badgeContainer.querySelector(".badge-spotlight-extra");
      const extraToggle = extraWrapper?.querySelector(".badge-spotlight-extra__trigger");
      const panelId = extraToggle?.getAttribute("aria-controls") || "";
      const escapeCssValue = value => {
        if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
          return CSS.escape(value);
        }
        const unsafeCharacters = /[#;.\?%&,+*~\[\]:'"!^$()=>|\/@]/g;
        return String(value).replace(unsafeCharacters, "\\$&");
      };
      const panel = panelId ? badgeContainer.querySelector(`#${escapeCssValue(panelId)}`) : null;

      if (extraWrapper && extraToggle && panel) {
        panel.setAttribute("aria-hidden", "true");
        let hoverIntent = null;
        const moreButton = extraWrapper.querySelector(".badge-spotlight-extra__more");
        const openPanel = () => {
          if (hoverIntent) {
            window.clearTimeout(hoverIntent);
            hoverIntent = null;
          }
          extraWrapper.classList.add("badge-spotlight-extra--open");
          extraToggle.setAttribute("aria-expanded", "true");
          panel.setAttribute("aria-hidden", "false");
        };
        const closePanel = () => {
          if (hoverIntent) {
            window.clearTimeout(hoverIntent);
            hoverIntent = null;
          }
          extraWrapper.classList.remove("badge-spotlight-extra--open");
          extraToggle.setAttribute("aria-expanded", "false");
          panel.setAttribute("aria-hidden", "true");
        };

        extraToggle.addEventListener("click", event => {
          event.preventDefault();
          if (extraWrapper.classList.contains("badge-spotlight-extra--open")) {
            closePanel();
          } else {
            openPanel();
          }
        });

        extraWrapper.addEventListener("mouseenter", () => {
          if (hoverIntent) window.clearTimeout(hoverIntent);
          openPanel();
        });

        extraWrapper.addEventListener("mouseleave", () => {
          hoverIntent = window.setTimeout(() => {
            closePanel();
          }, 120);
        });

        extraToggle.addEventListener("focus", openPanel);

        extraWrapper.addEventListener("keydown", event => {
          if (event.key === "Escape") {
            closePanel();
            extraToggle.focus();
          }
        });

        extraWrapper.addEventListener("focusout", event => {
          if (!event.relatedTarget || !extraWrapper.contains(event.relatedTarget)) {
            closePanel();
          }
        });

        if (moreButton) {
          moreButton.addEventListener("click", () => {
            closePanel();
            if (typeof setRole === "function") {
              setRole("client", "client-badges");
            }
          });
        }
      }
    }

    function renderGlobalNav(activeRoute) {
      return `
    <nav class="global-nav" aria-label="Primary navigation">
      <button type="button" class="brand global-nav__brand" id="brand-button">
        <span class="brand__glyph">W</span>
        <span>WeldSecure</span>
      </button>
      <div class="global-nav__groups">
        ${NAV_GROUPS.map(group => {
          const isGroupActive = group.items.some(item => item.route === activeRoute);
          return `
            <div class="global-nav__group ${isGroupActive ? "global-nav__group--active" : ""}">
              <button type="button" class="global-nav__trigger" data-group="${group.label}">
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
        navHost.outerHTML = renderGlobalNav(activeRoute);
      }

      const globalNav = container.querySelector(".global-nav");
      if (!globalNav) return;

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

      setupNavScrollBehavior(globalNav);
      attachHeaderEvents(container);

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

    function initializeSettingsUI(container, state) {
      if (!container) return;
      const settingsFeature = window.Weld && window.Weld.settings;
      if (!settingsFeature) return;
      if (typeof settingsFeature.init === "function") {
        settingsFeature.init(container, state);
        return;
      }
      if (typeof settingsFeature.attach === "function") {
        settingsFeature.attach(container, state);
      }
    }

    function renderHeader(state) {
      const role = state?.meta?.role;
      const navMarkup = renderGlobalNav(state?.meta?.route || "landing");
      const chipMarkup =
        role && ROLE_LABELS[role]
          ? `<span class="chip ${ROLE_LABELS[role].chip}"><span class="chip__dot"></span>${ROLE_LABELS[role].label}</span>`
          : "";
      return `
    ${navMarkup}
    <header class="header">
      <div class="header__actions">
        ${chipMarkup}
      </div>
    </header>
  `;
    }

    return {
      renderHeader,
      attachHeaderEvents,
      attachGlobalNav,
      initializeSettingsUI,
      teardownBadgeShowcase,
      setupBadgeShowcase,
      renderBadgeSpotlight,
      renderGlobalNav
    };
  });
})();
