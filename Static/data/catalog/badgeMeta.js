(function () {
  const AppData = window.AppData || (window.AppData = {});
  Object.assign(AppData, {
  ICON_PATHS: {
    medal: "svg/Laura_Reen/award.svg",
    outlook: "svg/outlook.svg",
    hourglass: "svg/hourglass.svg",
    gift: "svg/gift.svg",
    settings: "svg/settings.svg",
    target: "svg/target.svg",
    trophy: "svg/Laura_Reen/cup.svg",
    cup: "svg/Laura_Reen/cup.svg",
    diamond: "svg/diamond.svg",
    heart: "svg/heart.svg",
    shield: "svg/shield.svg",
    rocket: "svg/rocket.svg",
    crown: "svg/crown.svg",
    megaphone: "svg/megaphone.svg",
    globe: "svg/globe.svg",
    spark: "svg/spark.svg",
    book: "svg/book.svg",
    clipboard: "svg/clipboard.svg",
    mountain: "svg/mountain.svg",
    lightbulb: "svg/lightbulb.svg",
    ribbon: "svg/ribbon.svg",
    chart: "svg/chart.svg",
    handshake: "svg/handshake.svg",
    star: "svg/star.svg",
    compass: "svg/compass.svg",
    laurel: "svg/laurel.svg",
    puzzle: "svg/puzzle.svg",
    badge: "svg/badge.svg",
    flame: "svg/flame.svg",
    network: "svg/network.svg",
    gear: "svg/gear.svg",
    whistle: "svg/whistle.svg",
    plane: "svg/plane.svg"
  },
  BADGE_LAB_ICONS: AppData.BADGE_LAB_ICONS || {
    basePath: "svg/Laura_Reen",
    names: ["activity", "award", "cup", "finish", "mountain", "ok", "podium", "smartwatch", "torch", "watch"]
  },
  BADGE_PROGRESSION_TIERS: AppData.BADGE_PROGRESSION_TIERS || [
    { id: "aware", label: "Aware", reference: "Emerald", gradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)", shadow: "0 18px 32px rgba(17, 153, 142, 0.32)" },
    { id: "observant", label: "Observant", reference: "Sapphire", gradient: "linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)", shadow: "0 18px 32px rgba(33, 147, 176, 0.32)" },
    { id: "careful", label: "Careful", reference: "Amethyst", gradient: "linear-gradient(135deg, #9d50bb 0%, #6e48aa 100%)", shadow: "0 18px 32px rgba(110, 72, 170, 0.32)" },
    { id: "measured", label: "Measured", reference: "Ruby", gradient: "linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)", shadow: "0 18px 32px rgba(255, 75, 43, 0.32)" },
    { id: "vigilant", label: "Vigilant", reference: "Obsidian", gradient: "linear-gradient(135deg, #434343 0%, #000000 100%)", shadow: "0 18px 32px rgba(0, 0, 0, 0.45)" }
  ],
  METRIC_TONES: {
  indigo: { bg: "linear-gradient(135deg, rgba(99, 102, 241, 0.16), rgba(129, 140, 248, 0.28))", color: "#312e81" },
  emerald: { bg: "linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(52, 211, 153, 0.28))", color: "#065f46" },
  amber: { bg: "linear-gradient(135deg, rgba(250, 204, 21, 0.22), rgba(253, 224, 71, 0.32))", color: "#92400e" },
  fuchsia: { bg: "linear-gradient(135deg, rgba(236, 72, 153, 0.18), rgba(244, 114, 182, 0.28))", color: "#9d174d" },
  slate: { bg: "linear-gradient(135deg, rgba(148, 163, 184, 0.18), rgba(226, 232, 240, 0.26))", color: "#1f2937" }
},
  BADGE_TONES: {
  violet: "linear-gradient(135deg, #ede9fe, #ddd6fe)",
  cobalt: "linear-gradient(135deg, #dbeafe, #bfdbfe)",
  coral: "linear-gradient(135deg, #ffe4e6, #fecdd3)",
  emerald: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
  amber: "linear-gradient(135deg, #fde68a, #fcd34d)",
  aqua: "linear-gradient(135deg, #cffafe, #bae6fd)",
  midnight: "linear-gradient(135deg, #e0f2fe, #c7d2fe)",
  blush: "linear-gradient(135deg, #fce7f3, #e9d5ff)",
  gold: "linear-gradient(135deg, #fef9c3, #fde68a)",
  slate: "linear-gradient(135deg, #f8fafc, #e2e8f0)"
},
  BADGE_ICON_BACKDROPS: {
  violet: {
    background: "linear-gradient(135deg, #c4b5fd, #a855f7)",
    shadow: "rgba(124, 58, 237, 0.36)"
  },
  cobalt: {
    background: "linear-gradient(135deg, #bfdbfe, #2563eb)",
    shadow: "rgba(37, 99, 235, 0.32)"
  },
  coral: {
    background: "linear-gradient(135deg, #fbcfe8, #f97316)",
    shadow: "rgba(249, 115, 22, 0.34)"
  },
  emerald: {
    background: "linear-gradient(135deg, #bbf7d0, #10b981)",
    shadow: "rgba(16, 185, 129, 0.34)"
  },
  amber: {
    background: "linear-gradient(135deg, #fde68a, #f59e0b)",
    shadow: "rgba(245, 158, 11, 0.36)"
  },
  aqua: {
    background: "linear-gradient(135deg, #bae6fd, #0ea5e9)",
    shadow: "rgba(14, 165, 233, 0.32)"
  },
  midnight: {
    background: "linear-gradient(135deg, #c7d2fe, #1e3a8a)",
    shadow: "rgba(30, 58, 138, 0.38)"
  },
  blush: {
    background: "linear-gradient(135deg, #fbcfe8, #ec4899)",
    shadow: "rgba(236, 72, 153, 0.34)"
  },
  gold: {
    background: "linear-gradient(135deg, #fef08a, #f59e0b)",
    shadow: "rgba(217, 119, 6, 0.36)"
  },
  slate: {
    background: "linear-gradient(135deg, #e2e8f0, #64748b)",
    shadow: "rgba(100, 116, 139, 0.3)"
  }
},
  POINTS_CARD_ICONS: {
  medal: {
    background: "linear-gradient(135deg, #facc15, #f97316)",
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="16" cy="16" r="13" fill="rgba(255,255,255,0.16)" />
        <circle cx="16" cy="16" r="9.5" fill="#fde68a" />
        <path d="M16 10.2 17.6 14h4.2l-3.3 2.3 1.2 3.8L16 18.8l-3.7 2.3 1.2-3.8L10.2 14h4.2z" fill="#f97316"/>
        <path d="M12.4 7h2.8l1.2 2.8H13.6zM18.8 7h2.8l-1.1 2.8h-2.8z" fill="#fde68a" opacity="0.6"/>
      </svg>
    `
  },
  hourglass: {
    background: "linear-gradient(135deg, #60a5fa, #0ea5e9)",
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true">
        <rect x="10" y="6.5" width="12" height="2.8" rx="1.4" fill="#ffffff"/>
        <rect x="10" y="22.7" width="12" height="2.8" rx="1.4" fill="#ffffff"/>
        <path d="M11.8 10.6h8.4c0 2.4-1.9 4.2-4.2 5.7 2.3 1.4 4.2 3.3 4.2 5.7h-8.4c0-2.4 1.9-4.2 4.2-5.7-2.3-1.4-4.2-3.3-4.2-5.7z" fill="#bae6fd"/>
        <path d="M12.8 14h6.4c0 1.1-0.9 2.1-2.6 2.7-1.7-0.6-2.6-1.6-2.6-2.7z" fill="#38bdf8"/>
        <path d="M12.8 18.9c0-1.1 0.9-2.1 2.6-2.7 1.7 0.6 2.6 1.6 2.6 2.7z" fill="#0ea5e9"/>
      </svg>
    `
  },
  gift: {
    background: "linear-gradient(135deg, #fb7185, #ec4899)",
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true">
        <rect x="7" y="12.5" width="18" height="12" rx="2.6" fill="#fdf2f8" opacity="0.8"/>
        <rect x="7" y="9" width="18" height="4" rx="1.6" fill="#fde68a" opacity="0.7"/>
        <path d="M13.5 9c-1.5 0-2.7-1.2-2.7-2.6 0-1.1 0.8-1.9 1.8-1.9 1.5 0 3.4 1.3 4.5 2.7L17.5 9z" fill="#f97316"/>
        <path d="M18.5 9c1.5 0 2.7-1.2 2.7-2.6 0-1.1-0.8-1.9-1.8-1.9-1.5 0-3.4 1.3-4.5 2.7L14.5 9z" fill="#f97316" opacity="0.75"/>
        <rect x="14.6" y="9" width="2.8" height="15.5" fill="#fef08a"/>
        <rect x="7" y="14.4" width="18" height="2.4" fill="#fef3c7" opacity="0.6"/>
      </svg>
    `
  },
  default: {
    background: "linear-gradient(135deg, #cbd5f5, #818cf8)",
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="16" cy="16" r="10" fill="#f8fafc" opacity="0.5"/>
        <circle cx="16" cy="16" r="6" fill="#f8fafc"/>
      </svg>
    `
  }
},
  BADGE_CATEGORY_ORDER: [
  "onboarding",
  "activation",
  "speed",
  "impact",
  "precision",
  "mastery",
  "collaboration",
  "culture",
  "consistency",
  "mobility",
  "rewards",
  "recognition",
  "meta"
],
  BADGE_DRAFTS: [
  "culture-spark",
  "buddy-system",
  "network-node",
  "playbook-pro",
  "mentor-maven",
  "playbook-architect",
  "threat-cartographer",
  "signal-sculptor",
  "vanguard-veteran",
  "sentinel-summit"
],
  CUSTOMER_BADGE_UNLOCKS: [
  { id: "resilience-ranger", achievedAt: "2025-03-14T10:45:00Z" },
  { id: "zero-day-zeal", achievedAt: "2025-03-02T09:10:00Z" },
  { id: "automation-ally", achievedAt: "2025-02-21T16:30:00Z" },
  { id: "bullseye-breaker", achievedAt: "2025-02-12T08:15:00Z" },
  { id: "golden-signal", achievedAt: "2025-02-28T08:40:00Z" },
  { id: "signal-sculptor", achievedAt: "2025-02-05T13:20:00Z" },
  { id: "hub-hopper", achievedAt: "2025-03-18T12:05:00Z", highlight: "recent" }
],
  });
  const badgeMeta = {
    ICON_PATHS: AppData.ICON_PATHS,
    BADGE_LAB_ICONS: AppData.BADGE_LAB_ICONS,
    BADGE_PROGRESSION_TIERS: AppData.BADGE_PROGRESSION_TIERS,
    METRIC_TONES: AppData.METRIC_TONES,
    BADGE_TONES: AppData.BADGE_TONES,
    BADGE_ICON_BACKDROPS: AppData.BADGE_ICON_BACKDROPS,
    POINTS_CARD_ICONS: AppData.POINTS_CARD_ICONS,
    BADGE_CATEGORY_ORDER: AppData.BADGE_CATEGORY_ORDER,
    BADGE_DRAFTS: AppData.BADGE_DRAFTS,
    CUSTOMER_BADGE_UNLOCKS: AppData.CUSTOMER_BADGE_UNLOCKS
  };
  window.WeldBadgeMeta = badgeMeta;
  const modules = window.WeldModules;
  if (modules && (!modules.has || !modules.has("data/catalog/badgeMeta"))) {
    modules.define("data/catalog/badgeMeta", () => window.WeldBadgeMeta || badgeMeta);
  }
})();
