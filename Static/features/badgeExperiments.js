(function () {
  if (!window.Weld) return;

  const features = window.Weld.features || (window.Weld.features = {});
  const AppData = window.AppData || {};
  const { WeldUtil } = window;
  const difficultyOrder = ["Starter", "Rising", "Skilled", "Expert", "Legendary"];
  const iconBasePath = "svg/Laura_Reen";
  const lauraReenIcons = [
    "activity",
    "award",
    "bottle",
    "cup",
    "finish",
    "mountain",
    "ok",
    "podium",
    "smartwatch",
    "torch",
    "watch"
  ];
  const PROGRESSION_TIERS = [
    {
      id: "aware",
      label: "Aware",
      reference: "Emerald",
      gradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
      shadow: "0 18px 32px rgba(17, 153, 142, 0.32)"
    },
    {
      id: "observant",
      label: "Observant",
      reference: "Sapphire",
      gradient: "linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)",
      shadow: "0 18px 32px rgba(33, 147, 176, 0.32)"
    },
    {
      id: "careful",
      label: "Careful",
      reference: "Amethyst",
      gradient: "linear-gradient(135deg, #9d50bb 0%, #6e48aa 100%)",
      shadow: "0 18px 32px rgba(110, 72, 170, 0.32)"
    },
    {
      id: "measured",
      label: "Measured",
      reference: "Ruby",
      gradient: "linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)",
      shadow: "0 18px 32px rgba(255, 75, 43, 0.32)"
    },
    {
      id: "vigilant",
      label: "Vigilant",
      reference: "Obsidian",
      gradient: "linear-gradient(135deg, #434343 0%, #000000 100%)",
      shadow: "0 18px 32px rgba(0, 0, 0, 0.45)"
    }
  ];
  const MAX_LAB_BADGES = 50;

  features.badgeExperiments = {
    render(container) {
      if (!container) return;
      const tieredBadges = getTieredBadges();
      container.innerHTML = `
        <section class="badge-experiments">
          ${renderLabHero(tieredBadges.length)}
          ${renderProgressionKey()}
          ${renderTierGrid(tieredBadges)}
        </section>
      `;

      initAnimatedTierBadges(container);
    }
  };

  function renderLabHero(totalLevels) {
    return `
      <header class="badge-experiments__hero">
        <div class="badge-experiments__intro">
          <span class="badge-experiments__eyebrow">Badge Lab</span>
          <h1>Experiment with cinematic badge animations.</h1>
          <p>We've replaced the legacy catalogue with a 50-level system so you can preview motion, gradients, and iconography together without leaving the lab view.</p>
        </div>
        <div class="badge-experiments__stats">
          <article>
            <strong>${totalLevels}</strong>
            <span>Levels</span>
          </article>
          <article>
            <strong>${PROGRESSION_TIERS.length}</strong>
            <span>Progression tiers</span>
          </article>
          <article>
            <strong>2x</strong>
            <span>Engagement lift target</span>
          </article>
        </div>
      </header>
    `;
  }

  function renderProgressionKey() {
    return `
      <section class="badge-experiments__key" aria-label="Progression tiers">
        ${PROGRESSION_TIERS.map(
          tier => `
            <article class="progression-key__item" data-tier="${tier.id}">
              <span class="progression-key__swatch" style="background:${tier.gradient}; box-shadow:${tier.shadow};" aria-hidden="true"></span>
              <div class="progression-key__text">
                <strong>${tier.label}</strong>
                <span>${tier.reference} palette</span>
              </div>
            </article>
          `
        ).join("")}
      </section>
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

  function renderTierCard(badge) {
    const safeTitle = escapeHtml(badge.title || "Badge prototype");
    const safeSummary = escapeHtml(badge.description || "");
    const safeDifficulty = escapeHtml(badge.difficulty || "");
    const safeId = escapeHtml(badge.id || "");
    const safeLevel = escapeHtml(String(badge.level));
    const tierMeta = badge.tierMeta || PROGRESSION_TIERS[0];
    const styles = getTierStyles(tierMeta);
    const arcId = generateArcId(safeId, safeLevel);
    return `
      <article class="badge-experiments__card">
        <div
          class="badge-tier"
          data-tier="${tierMeta.id}"
          data-level="${safeLevel}"
          data-badge="${safeId}"
          style="background:${styles.background};box-shadow:${styles.shadow};">
          ${renderArcLabel(tierMeta.label, arcId)}
          <span class="badge-tier__shine" aria-hidden="true"></span>
          <span class="badge-tier__particles" aria-hidden="true"></span>
          ${renderBadgeIconImage(badge)}
        </div>
        <footer>
          <strong>${safeTitle}</strong>
          <span class="badge-experiments__tier-label">${tierMeta.label} &middot; ${safeDifficulty}</span>
          ${safeSummary ? `<p>${safeSummary}</p>` : ""}
        </footer>
      </article>
    `;
  }

  function renderArcLabel(label, arcId) {
    const safeLabel = escapeHtml(label || "");
    return `
      <svg viewBox="0 0 120 120" class="badge-tier__arc" aria-hidden="true">
        <defs>
          <path id="${arcId}" d="M25,58 A35,35 0 0,1 95,58" />
        </defs>
        <text>
          <textPath href="#${arcId}" startOffset="50%" text-anchor="middle">
            ${safeLabel}
          </textPath>
        </text>
      </svg>
    `;
  }

  function generateArcId(seed, level) {
    if (typeof WeldUtil?.generateId === "function") {
      return WeldUtil.generateId("tierArc");
    }
    return `tier-arc-${seed || "badge"}-${level}-${Math.random().toString(36).slice(2, 6)}`;
  }

  function renderBadgeIconImage(badge) {
    const iconSrc = typeof badge.labIcon === "string" ? badge.labIcon : "";
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

  function getTierStyles(tierMeta) {
    if (!tierMeta) {
      return {
        background: "linear-gradient(135deg, #c7d2fe, #818cf8)",
        shadow: "0 12px 24px rgba(79, 70, 229, 0.32)"
      };
    }
    return {
      background: tierMeta.gradient,
      shadow: tierMeta.shadow
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

    const trimmed = visibleBadges
      .sort((a, b) => {
        const rankDiff = getDifficultyRank(a?.difficulty) - getDifficultyRank(b?.difficulty);
        if (rankDiff !== 0) return rankDiff;
        const pointsDiff = (Number(b?.points) || 0) - (Number(a?.points) || 0);
        if (pointsDiff !== 0) return pointsDiff;
        const titleA = typeof a?.title === "string" ? a.title : "";
        const titleB = typeof b?.title === "string" ? b.title : "";
        return titleA.localeCompare(titleB, undefined, { sensitivity: "base" });
      })
      .slice(0, MAX_LAB_BADGES);

    return trimmed.map((badge, index) => {
      const tierMeta = getTierMetaForIndex(index, trimmed.length);
      return {
        ...badge,
        level: index + 1,
        labIcon: getLabIconForLevel(index),
        tierMeta
      };
    });
  }

  function getTierMetaForIndex(index, total) {
    if (!PROGRESSION_TIERS.length) return null;
    const groupSize = Math.ceil(total / PROGRESSION_TIERS.length) || 1;
    const tierIndex = Math.min(Math.floor(index / groupSize), PROGRESSION_TIERS.length - 1);
    return PROGRESSION_TIERS[tierIndex];
  }

  function getLabIconForLevel(levelIndex) {
    if (!lauraReenIcons.length) return "";
    const iconName = lauraReenIcons[levelIndex % lauraReenIcons.length];
    return `${iconBasePath}/${iconName}.svg`;
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
