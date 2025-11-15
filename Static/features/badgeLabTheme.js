(function () {
  const AppData = window.AppData || {};
  const badgeMeta = (() => {
    const loader = window.WeldModules;
    if (loader && typeof loader.has === "function") {
      try {
        if (loader.has("data/catalog/badgeMeta")) {
          return loader.use("data/catalog/badgeMeta");
        }
      } catch (error) {
        console.warn("badgeLabTheme: data/catalog/badgeMeta unavailable.", error);
      }
    }
    if (window.WeldBadgeMeta) {
      return window.WeldBadgeMeta;
    }
    return {};
  })();
  const defaultIcons = {
    basePath: "svg/Laura_Reen",
    names: ["activity", "award", "cup", "finish", "mountain", "ok", "podium", "smartwatch", "torch", "watch"]
  };
  const iconConfig = badgeMeta.BADGE_LAB_ICONS || AppData.BADGE_LAB_ICONS || {};
  const iconBasePath =
    typeof iconConfig.basePath === "string" && iconConfig.basePath.trim().length > 0
      ? iconConfig.basePath.trim()
      : defaultIcons.basePath;
  const iconNames =
    Array.isArray(iconConfig.names) && iconConfig.names.length > 0 ? iconConfig.names.slice() : defaultIcons.names;

  const defaultTiers = [
    { id: "aware", label: "Aware", reference: "Emerald", gradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)", shadow: "0 18px 32px rgba(17, 153, 142, 0.32)" },
    { id: "observant", label: "Observant", reference: "Sapphire", gradient: "linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)", shadow: "0 18px 32px rgba(33, 147, 176, 0.32)" },
    { id: "careful", label: "Careful", reference: "Amethyst", gradient: "linear-gradient(135deg, #9d50bb 0%, #6e48aa 100%)", shadow: "0 18px 32px rgba(110, 72, 170, 0.32)" },
    { id: "measured", label: "Measured", reference: "Ruby", gradient: "linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)", shadow: "0 18px 32px rgba(255, 75, 43, 0.32)" },
    { id: "vigilant", label: "Vigilant", reference: "Obsidian", gradient: "linear-gradient(135deg, #434343 0%, #000000 100%)", shadow: "0 18px 32px rgba(0, 0, 0, 0.45)" }
  ];
  const tiers =
    Array.isArray(badgeMeta.BADGE_PROGRESSION_TIERS) && badgeMeta.BADGE_PROGRESSION_TIERS.length > 0
      ? badgeMeta.BADGE_PROGRESSION_TIERS.slice()
      : Array.isArray(AppData.BADGE_PROGRESSION_TIERS) && AppData.BADGE_PROGRESSION_TIERS.length > 0
      ? AppData.BADGE_PROGRESSION_TIERS.slice()
      : defaultTiers;

  const difficultyTierMap = {
    starter: "aware",
    rising: "observant",
    skilled: "careful",
    expert: "measured",
    legendary: "vigilant"
  };

  const BadgeLabTheme = window.BadgeLabTheme || {};

  function escapeHtml(value) {
    if (value == null) return "";
    if (typeof value !== "string") value = String(value);
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getTierMetaById(id) {
    if (!id) return null;
    const needle = id.trim().toLowerCase();
    return tiers.find(tier => tier.id && tier.id.toLowerCase() === needle) || null;
  }

  function getTierMetaForIndex(index, total) {
    if (!tiers.length) return null;
    const safeTotal = Number.isFinite(total) && total > 0 ? total : tiers.length;
    const groupSize = Math.ceil(safeTotal / tiers.length) || 1;
    const tierIndex = Math.min(Math.floor((Number(index) || 0) / groupSize), tiers.length - 1);
    return tiers[tierIndex] || tiers[0] || null;
  }

  function getTierMetaByDifficulty(difficulty, fallbackIndex = 0) {
    if (typeof difficulty === "string") {
      const tierId = difficultyTierMap[difficulty.trim().toLowerCase()];
      const tierMeta = tierId ? getTierMetaById(tierId) : null;
      if (tierMeta) return tierMeta;
    }
    return getTierMetaForIndex(fallbackIndex, tiers.length);
  }

  function getTierStyles(tierMeta) {
    if (tierMeta && tierMeta.gradient) {
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

  function getIconForLevel(levelIndex) {
    if (!iconNames.length) return "";
    const index = Math.abs(Number(levelIndex) || 0) % iconNames.length;
    return `${iconBasePath}/${iconNames[index]}.svg`;
  }

  function hashString(value) {
    const input = typeof value === "string" && value.length ? value : String(value ?? "");
    let hash = 0;
    for (let i = 0; i < input.length; i += 1) {
      hash = (hash << 5) - hash + input.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }

  function getIconForBadge(badge, fallbackIndex = 0) {
    if (badge && typeof badge.labIcon === "string" && badge.labIcon.trim().length > 0) {
      return badge.labIcon.trim();
    }
    if (!iconNames.length) return "";
    const sourceId =
      typeof badge?.id === "string" && badge.id.trim().length > 0
        ? badge.id.trim()
        : typeof badge?.title === "string" && badge.title.trim().length > 0
        ? badge.title.trim()
        : `badge-${fallbackIndex}`;
    const iconIndex = Math.abs(hashString(sourceId)) % iconNames.length;
    return `${iconBasePath}/${iconNames[iconIndex]}.svg`;
  }

  function renderArc(label, arcId) {
    const safeId = (typeof arcId === "string" && arcId.trim().length > 0 ? arcId : `badge-lab-arc-${Date.now()}`)
      .replace(/[^a-zA-Z0-9:_-]/g, "-");
    const safeLabel = escapeHtml(label || "");
    return `
      <svg viewBox="0 0 120 120" class="badge-lab-badge__arc" aria-hidden="true">
        <defs>
          <path id="${safeId}" d="M20,55 A40,40 0 0,1 100,55" />
        </defs>
        <text>
          <textPath href="#${safeId}" startOffset="50%" text-anchor="middle">
            ${safeLabel}
          </textPath>
        </text>
      </svg>
    `;
  }

  function renderShine() {
    return `<span class="badge-lab-badge__shine" aria-hidden="true"></span>`;
  }

  function renderRing() {
    return `<span class="badge-lab-badge__ring" aria-hidden="true"></span>`;
  }

  function renderParticles(count = 10) {
    const particles = [];
    for (let i = 0; i < count; i += 1) {
      const size = (Math.random() * 3 + 3).toFixed(2);
      const left = (Math.random() * 100).toFixed(2);
      const top = (Math.random() * 100).toFixed(2);
      const delay = (Math.random() * 2).toFixed(2);
      particles.push(
        `<span class="badge-lab-badge__particle" style="width:${size}px;height:${size}px;left:${left}%;top:${top}%;animation-delay:${delay}s;" aria-hidden="true"></span>`
      );
    }
    return `<span class="badge-lab-badge__particles" aria-hidden="true">${particles.join("")}</span>`;
  }

  function renderIconImage(iconSrc, fallbackInitial) {
    if (typeof iconSrc === "string" && iconSrc.trim().length > 0) {
      const safeSrc = escapeHtml(iconSrc.trim());
      return `<img class="badge-lab-badge__img" src="${safeSrc}" alt="" loading="lazy" decoding="async" />`;
    }
    const initial =
      typeof fallbackInitial === "string" && fallbackInitial.trim().length > 0
        ? fallbackInitial.trim().charAt(0)
        : "B";
    return `<span class="badge-lab-badge__fallback" aria-hidden="true">${escapeHtml(initial.toUpperCase())}</span>`;
  }

  window.BadgeLabTheme = Object.assign({}, BadgeLabTheme, {
    tiers,
    iconNames,
    iconBasePath,
    difficultyTierMap,
    getTierMetaById,
    getTierMetaForIndex,
    getTierMetaByDifficulty,
    getTierStyles,
    getIconForLevel,
    getIconForBadge,
    renderArc,
    renderShine,
    renderRing,
    renderParticles,
    renderIconImage
  });
})();
