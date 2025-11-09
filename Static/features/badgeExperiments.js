(function () {
  if (!window.Weld) return;

  const features = window.Weld.features || (window.Weld.features = {});
  const AppData = window.AppData || {};
  const { WeldUtil } = window;
  const badgeIconBackdrops = AppData.BADGE_ICON_BACKDROPS || {};
  const iconPaths = AppData.ICON_PATHS || {};
  const difficultyOrder = ["Starter", "Rising", "Skilled", "Expert", "Legendary"];

  features.badgeExperiments = {
    render(container, appState) {
      if (!container) return;
      const tieredBadges = getTieredBadges();
      container.innerHTML = `
        <section class="badge-experiments">
          ${renderLabHero()}
          ${renderTierGrid(tieredBadges)}
        </section>
      `;

      initAnimatedTierBadges(container);
    }
  };

  function renderLabHero() {
    return `
      <header class="badge-experiments__hero">
        <div class="badge-experiments__intro">
          <span class="badge-experiments__eyebrow">Badge Lab</span>
          <h1>Experiment with cinematic badge animations.</h1>
          <p>We’ve replaced the legacy catalogue with level-based hero badges so you can preview motion, gradients, and iconography together without leaving the lab view.</p>
        </div>
        <div class="badge-experiments__stats">
          <article>
            <strong>10</strong>
            <span>Levels</span>
          </article>
          <article>
            <strong>4</strong>
            <span>Micro-interactions</span>
          </article>
          <article>
            <strong>2x</strong>
            <span>Engagement lift target</span>
          </article>
        </div>
      </header>
    `;
  }

  function renderTierGrid(badges) {
    if (!badges.length) {
      return `
        <div class="badge-experiments__fallback">
          <p>No badges are published yet. Publish a few and check back to see them visualised.</p>
        </div>
      `;
    }

    return `
      <section class="badge-experiments__grid" aria-label="Animated tier prototypes">
        ${badges.map(renderTierCard).join("")}
      </section>
    `;
  }

  function renderTierCard(tier) {
    const safeTitle = escapeHtml(tier.title || "Badge prototype");
    const safeSummary = escapeHtml(tier.description || "");
    const safeDifficulty = escapeHtml(tier.difficulty || "");
    const safeId = escapeHtml(tier.id || "");
    const safeLevel = escapeHtml(String(tier.level));
    const toneStyles = getToneStyles(tier.tone);
    return `
      <article class="badge-experiments__card">
        <div
          class="badge-tier"
          data-tier="${safeId}"
          style="background:${toneStyles.background};box-shadow:${toneStyles.shadow};">
          <span class="badge-tier__shine" aria-hidden="true"></span>
          <span class="badge-tier__particles" aria-hidden="true"></span>
          ${renderBadgeIconImage(tier)}
        </div>
        <footer>
          <strong>${safeTitle}</strong>
          <span class="badge-experiments__tier-label">Level ${safeLevel} · ${safeDifficulty}</span>
          ${safeSummary ? `<p>${safeSummary}</p>` : ""}
        </footer>
      </article>
    `;
  }

  function renderBadgeIconImage(badge) {
    const iconKey = typeof badge.icon === "string" && iconPaths[badge.icon] ? badge.icon : "badge";
    const iconSrc = iconPaths[iconKey] || iconPaths.badge || "";
    const rawInitial =
      typeof badge.title === "string" && badge.title.trim().length > 0 ? badge.title.trim().charAt(0) : "B";
    const safeInitial = escapeHtml(rawInitial.toUpperCase());
    if (!iconSrc) {
      return `
        <span class="badge-tier__icon" aria-hidden="true">
          <span class="badge-tier__icon-fallback">${safeInitial}</span>
        </span>
      `;
    }
    const safeSrc = escapeHtml(iconSrc);
    return `
      <span class="badge-tier__icon" aria-hidden="true">
        <img src="${safeSrc}" alt="" loading="lazy" decoding="async" />
      </span>
    `;
  }

  function getToneStyles(toneKey) {
    const fallbackBackground = "linear-gradient(135deg, #c7d2fe, #818cf8)";
    const fallbackShadow = "0 12px 24px rgba(79, 70, 229, 0.3), inset 0 -3px 0 rgba(0, 0, 0, 0.18)";
    if (!toneKey || !badgeIconBackdrops[toneKey]) {
      return { background: fallbackBackground, shadow: fallbackShadow };
    }
    const tone = badgeIconBackdrops[toneKey];
    const background = tone.background || fallbackBackground;
    const shadowColor = tone.shadow || "rgba(79, 70, 229, 0.3)";
    return {
      background,
      shadow: `0 12px 24px ${shadowColor}, inset 0 -3px 0 rgba(0, 0, 0, 0.18)`
    };
  }

  function getTieredBadges() {
    const publishedSource = Array.isArray(AppData.BADGES) ? AppData.BADGES : [];
    const draftSource = Array.isArray(AppData.BADGE_DRAFTS) ? AppData.BADGE_DRAFTS : [];
    const combined = [...publishedSource, ...draftSource];
    const visibleBadges = combined.filter(badge => {
      if (!badge || typeof badge !== "object") return false;
      if (typeof badge.published === "boolean") {
        return badge.published;
      }
      return true;
    });

    if (!visibleBadges.length) {
      return [];
    }

    return visibleBadges
      .sort((a, b) => {
        const rankDiff = getDifficultyRank(a?.difficulty) - getDifficultyRank(b?.difficulty);
        if (rankDiff !== 0) return rankDiff;
        const pointsDiff = (Number(b?.points) || 0) - (Number(a?.points) || 0);
        if (pointsDiff !== 0) return pointsDiff;
        const titleA = typeof a?.title === "string" ? a.title : "";
        const titleB = typeof b?.title === "string" ? b.title : "";
        return titleA.localeCompare(titleB, undefined, { sensitivity: "base" });
      })
      .slice(0, 10)
      .map((badge, index) => ({
        ...badge,
        level: index + 1
      }));
  }

  function getDifficultyRank(value) {
    if (typeof value !== "string") return difficultyOrder.length;
    const normalized = value.trim();
    const index = difficultyOrder.indexOf(normalized);
    return index === -1 ? difficultyOrder.length : index;
  }

  function escapeHtml(value) {
    if (!value) return "";
    if (WeldUtil?.escapeHtml) {
      return WeldUtil.escapeHtml(value);
    }
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initAnimatedTierBadges(root) {
    if (!root) return;
    const badges = root.querySelectorAll(".badge-tier");
    badges.forEach(badge => {
      const particleHost = badge.querySelector(".badge-tier__particles");
      if (!particleHost) return;
      particleHost.innerHTML = "";
      for (let i = 0; i < 12; i += 1) {
        const particle = document.createElement("span");
        particle.className = "badge-tier__particle";
        const size = Math.random() * 3 + 3;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 2}s`;
        particleHost.appendChild(particle);
      }

      badge.addEventListener("mouseenter", () => {
        const particles = particleHost.querySelectorAll(".badge-tier__particle");
        particles.forEach((particle, index) => {
          particle.style.animationDelay = `${index * 0.1}s`;
        });
      });
    });
  }
})();
