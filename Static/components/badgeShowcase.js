(function () {
  const modules = window.WeldModules;
  if (!modules || modules.has("components/badgeShowcase")) return;

  modules.define("components/badgeShowcase", function () {
    const AppData = window.AppData || {};
    const BADGE_ICON_BACKDROPS = AppData.BADGE_ICON_BACKDROPS || {};
    const BadgeLabTheme = window.BadgeLabTheme || {};
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

    function getSpotlightTierMeta(badge, index, total) {
      if (typeof BadgeLabTheme.getTierMetaByDifficulty === "function") {
        const tier = BadgeLabTheme.getTierMetaByDifficulty(badge?.difficulty, index);
        if (tier) return tier;
      }
      if (typeof BadgeLabTheme.getTierMetaForIndex === "function") {
        return BadgeLabTheme.getTierMetaForIndex(index, total || 1);
      }
      return {
        label: badge?.difficulty || "featured",
        gradient: BADGE_ICON_BACKDROPS[index % BADGE_ICON_BACKDROPS.length] || "linear-gradient(135deg, #6366f1, #a855f7)"
      };
    }

    function getBadgeTierStyles(tierMeta) {
      if (!tierMeta) {
        return {
          background: "linear-gradient(135deg, #c7d2fe, #818cf8)",
          shadow: "0 12px 24px rgba(79, 70, 229, 0.32)"
        };
      }
      if (typeof BadgeLabTheme.getTierStyles === "function") {
        return BadgeLabTheme.getTierStyles(tierMeta);
      }
      if (tierMeta.gradient) {
        return {
          background: tierMeta.gradient,
          shadow: tierMeta.shadow || "0 18px 32px rgba(15, 23, 42, 0.25)"
        };
      }
      return {
        background: "linear-gradient(135deg, #c7d2fe, #818cf8)",
        shadow: "0 12px 24px rgba(79, 70, 229, 0.32)"
      };
    }

    function getBadgeIconSource(badge, fallbackIndex = 0) {
      if (typeof BadgeLabTheme.getIconForBadge === "function") {
        const src = BadgeLabTheme.getIconForBadge(badge, fallbackIndex);
        if (src) return src;
      }
      if (typeof badge?.labIcon === "string" && badge.labIcon.trim().length > 0) {
        return badge.labIcon.trim();
      }
      return "";
    }

    function sanitizeBadgeArcId(id, index) {
      const raw =
        typeof id === "string" && id.trim().length > 0
          ? id.trim()
          : `badge-${index}-${Date.now().toString(16)}`;
      return raw.replace(/[^a-zA-Z0-9:_-]/g, "-");
    }

    function renderBadgeVisual({ tierMeta, arcId, iconSrc, fallbackInitial, modifier = "", particleCount = 10 }) {
      const styles = getBadgeTierStyles(tierMeta);
      const arcMarkup =
        typeof BadgeLabTheme.renderArc === "function" ? BadgeLabTheme.renderArc(tierMeta?.label || "", arcId) : "";
      const shine = typeof BadgeLabTheme.renderShine === "function" ? BadgeLabTheme.renderShine() : "";
      const ring = typeof BadgeLabTheme.renderRing === "function" ? BadgeLabTheme.renderRing() : "";
      const particles =
        typeof BadgeLabTheme.renderParticles === "function" ? BadgeLabTheme.renderParticles(particleCount) : "";
      const iconMarkup =
        typeof BadgeLabTheme.renderIconImage === "function"
          ? BadgeLabTheme.renderIconImage(iconSrc, fallbackInitial || "")
          : WeldUtil.renderIcon("medal", "sm");
      return `
        <span class="badge-lab-badge ${modifier || ""}">
          <span class="badge-lab-badge__icon" style="background:${styles.background}; box-shadow:${styles.shadow};">
            ${shine}
            ${ring}
            ${particles}
            ${arcMarkup}
            ${iconMarkup}
          </span>
        </span>
      `;
    }

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

      const renderTile = (badge, index, total) => {
        if (!badge) return "";
        const tierMeta = getSpotlightTierMeta(badge, index, total);
        const arcId = `badge-spotlight-arc-${sanitizeBadgeArcId(badge.id, index)}`;
        const iconSrc = getBadgeIconSource(badge, index);
        const badgeVisual = renderBadgeVisual({
          tierMeta,
          arcId,
          iconSrc,
          fallbackInitial: badge.title,
          modifier: "badge-lab-badge--spotlight",
          particleCount: 10
        });
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
        data-badge="${WeldUtil.escapeHtml(String(badge.id ?? ""))}"
        aria-label="${WeldUtil.escapeHtml(ariaLabel)}">
        <span class="badge-spotlight-tile__icon">
          ${badgeVisual}
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
              const formatExtra = (badge, index) => {
                if (!badge) return "";
                const tierMeta = getSpotlightTierMeta(badge, index + 1, badges.length);
                const arcId = `badge-spotlight-mini-arc-${sanitizeBadgeArcId(badge.id, index)}`;
                const iconSrc = getBadgeIconSource(badge, index);
                const badgeVisual = renderBadgeVisual({
                  tierMeta,
                  arcId,
                  iconSrc,
                  fallbackInitial: badge.title,
                  modifier: "badge-lab-badge--spotlight-mini",
                  particleCount: 6
                });
                const normalizedTitle =
                  typeof badge.title === "string" && badge.title.trim().length > 0
                    ? badge.title.trim()
                    : "Bonus badge";
                const rawPoints = Number(badge.points);
                const pointsValue = Number.isFinite(rawPoints) ? rawPoints : 0;
                return `
        <li class="badge-spotlight-extra__item" data-badge="${WeldUtil.escapeHtml(String(badge.id ?? ""))}">
          <span class="badge-spotlight-extra__icon">${badgeVisual}</span>
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
            ${displayedExtras.map((badge, index) => formatExtra(badge, index)).join("")}
          </ul>
        </div>
      </div>`;
            })()
          : "";

      return `
    <div class="badge-spotlight" data-badge-showcase>
      <div class="badge-spotlight__primary" role="list">
        ${renderTile(primaryBadge, 0, badges.length)}
      </div>
      ${extrasMarkup}
    </div>
  `;
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

      const eligible = badges.filter(badge => Boolean(badge));
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
        let resizeHandlerBound = false;
        const moreButton = extraWrapper.querySelector(".badge-spotlight-extra__more");
        const clampPanelToViewport = () => {
          if (!panel || typeof window === "undefined") return;
          panel.style.removeProperty("--badge-panel-shift");
          panel.style.removeProperty("--badge-panel-caret-offset");
          const rect = panel.getBoundingClientRect();
          if (!rect || !rect.width) {
            return;
          }
          const viewportWidth = window.innerWidth || document.documentElement?.clientWidth || 0;
          const padding = 24;
          let shift = 0;
          if (viewportWidth > 0 && rect.right > viewportWidth - padding) {
            shift = Math.min(shift, (viewportWidth - padding) - rect.right);
          }
          if (viewportWidth > 0 && rect.left < padding) {
            shift = Math.max(shift, padding - rect.left);
          }
          if (shift !== 0) {
            panel.style.setProperty("--badge-panel-shift", `${shift}px`);
            panel.style.setProperty("--badge-panel-caret-offset", `${-shift}px`);
          }
        };
        const bindResizeListener = () => {
          if (resizeHandlerBound || typeof window === "undefined") return;
          window.addEventListener("resize", clampPanelToViewport);
          resizeHandlerBound = true;
        };
        const unbindResizeListener = () => {
          if (!resizeHandlerBound || typeof window === "undefined") return;
          window.removeEventListener("resize", clampPanelToViewport);
          resizeHandlerBound = false;
        };
        const scheduleClamp = () => {
          if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
            window.requestAnimationFrame(() => {
              clampPanelToViewport();
              bindResizeListener();
            });
          } else {
            clampPanelToViewport();
            bindResizeListener();
          }
        };
        const openPanel = () => {
          if (hoverIntent) {
            window.clearTimeout(hoverIntent);
            hoverIntent = null;
          }
          extraWrapper.classList.add("badge-spotlight-extra--open");
          extraToggle.setAttribute("aria-expanded", "true");
          panel.setAttribute("aria-hidden", "false");
          scheduleClamp();
        };
        const closePanel = () => {
          if (hoverIntent) {
            window.clearTimeout(hoverIntent);
            hoverIntent = null;
          }
          extraWrapper.classList.remove("badge-spotlight-extra--open");
          extraToggle.setAttribute("aria-expanded", "false");
          panel.setAttribute("aria-hidden", "true");
          panel.style.removeProperty("--badge-panel-shift");
          panel.style.removeProperty("--badge-panel-caret-offset");
          unbindResizeListener();
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

    return {
      renderBadgeSpotlight,
      teardownBadgeShowcase,
      setupBadgeShowcase
    };
  });
})();
