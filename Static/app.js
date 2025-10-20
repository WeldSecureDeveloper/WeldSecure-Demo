const STORAGE_KEY = "weldStaticDemoStateV1";

const ROLE_LABELS = {
  customer: { label: "Reporter", chip: "chip--customer" },
  client: { label: "Organisation", chip: "chip--client" },
  admin: { label: "WeldSecure", chip: "chip--admin" }
};

const ROUTES = {
  landing: { requiresRole: false },
  customer: { requiresRole: "customer" },
  "client-dashboard": { requiresRole: "client" },
  "client-reporting": { requiresRole: "client" },
  "weld-admin": { requiresRole: "admin" },
  achievements: { requiresRole: false },
  quizzes: { requiresRole: false },
  addin: { requiresRole: false }
};

const MessageStatus = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected"
};

const NAV_GROUPS = [
  {
    label: "Reporter",
    items: [
      { label: "Reporter Journey", route: "addin", role: "customer" },
      { label: "Reporter Profile", route: "customer", role: "customer" },
      { label: "Quests", route: "quizzes", role: "customer" },
      { label: "Badges", route: "achievements", role: "customer" }
    ]
  },
  {
    label: "Organisation",
    items: [
      { label: "Organisation Dashboard", route: "client-dashboard", role: "client" },
      { label: "Security Team Dashboard", route: "client-reporting", role: "client" }
    ]
  },
  {
    label: "WeldSecure",
    items: [{ label: "Weld Admin", route: "weld-admin", role: "admin" }]
  }
];

const ICONS = {
  medal: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="20" fill="#fbbf24" />
      <circle cx="32" cy="32" r="14" fill="#fde68a" />
      <polygon fill="#fef3c7" points="32 18 35.8 27.6 46 28.6 38.4 34.8 41 44 32 38.6 23 44 25.6 34.8 18 28.6 28.2 27.6" />
      <path fill="#6366f1" opacity="0.65" d="M24 9h16l-2 8h-12z" />
    </svg>
  `,
  outlook: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <defs>
        <linearGradient id="outlookGradient" x1="12" y1="52" x2="52" y2="12" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#0078d4" />
          <stop offset="1" stop-color="#5a5df0" />
        </linearGradient>
      </defs>
      <rect x="12" y="14" width="28" height="36" rx="6" fill="url(#outlookGradient)" />
      <path d="M20 18h24l12 12-12 12H20z" fill="#0b1f4b" opacity="0.2" />
      <rect x="24" y="24" width="16" height="16" rx="4" fill="#fff" />
      <path fill="#0f4c81" d="M34 38h-4l-4-6 4-6h4l4 6z" />
      <circle cx="32" cy="32" r="4" fill="#0f172a" opacity="0.1" />
    </svg>
  `,
  hourglass: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect x="22" y="16" width="20" height="6" rx="3" fill="#38bdf8" />
      <rect x="22" y="42" width="20" height="6" rx="3" fill="#0ea5e9" />
      <path fill="#22d3ee" d="M24 22h16c0 4.6-3.4 8.2-8 11 4.6 2.8 8 6.4 8 11H24c0-4.6 3.4-8.2 8-11-4.6-2.8-8-6.4-8-11z" />
      <path fill="#0ea5e9" d="M26 26h12c0 2.4-2.2 4.2-6 5.6-3.8-1.4-6-3.2-6-5.6z" />
      <path fill="#14b8a6" d="M26 38c0-2.4 2.2-4.2 6-5.6 3.8 1.4 6 3.2 6 5.6H26z" />
    </svg>
  `,
  gift: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect x="10" y="26" width="44" height="26" rx="8" fill="#f97316"/>
      <rect x="10" y="18" width="44" height="12" rx="6" fill="#fb7185"/>
      <rect x="28" y="18" width="8" height="34" fill="#fde047"/>
      <rect x="10" y="32" width="44" height="6" fill="#fde047" opacity="0.85"/>
      <path fill="#fbbf24" d="M24 18c-3 0-5.5-2.4-5.5-5.4 0-2.2 1.5-3.6 3.7-3.6 3 0 6.8 3 8.8 5.6L32 18h-8z"/>
      <path fill="#fbbf24" d="M40 18c3 0 5.5-2.4 5.5-5.4 0-2.2-1.5-3.6-3.7-3.6-3 0-6.8 3-8.8 5.6L32 18h8z"/>
    </svg>
  `,
  target: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="24" fill="#dbeafe"/>
      <circle cx="32" cy="32" r="16" fill="#60a5fa"/>
      <circle cx="32" cy="32" r="8" fill="#1e3a8a"/>
      <circle cx="32" cy="32" r="4" fill="#f8fafc"/>
      <path fill="#f97316" d="M32 8h4v10l6-6 2.8 2.8-6 6H48v4H32z"/>
    </svg>
  `,
  trophy: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <path fill="#fbbf24" d="M18 10h28v10c0 9.4-7.4 17-16 17s-16-7.6-16-17z"/>
      <path fill="#f59e0b" d="M18 10h6v11c0 6.6 3.8 11 8 11s8-4.4 8-11V10h6v10c0 9.4-7.4 17-16 17s-16-7.6-16-17z"/>
      <path fill="#f97316" d="M20 8h24v4H20z"/>
      <path fill="#fde68a" d="M30 38h4v6h-4z"/>
      <path fill="#f97316" d="M24 44h16v6H24z"/>
      <path fill="#7c2d12" opacity="0.16" d="M22 50h20v4H22z"/>
      <path fill="#fef3c7" d="M24 22l4 1 4-6 4 6 4-1-4 10h-8z"/>
    </svg>
  `,
  diamond: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <polygon fill="#bfdbfe" points="12 22 24 10 40 10 52 22 32 54"/>
      <polygon fill="#60a5fa" points="24 10 32 26 40 10"/>
      <polygon fill="#1d4ed8" points="12 22 32 26 24 10"/>
      <polygon fill="#2563eb" points="52 22 32 26 40 10"/>
      <polygon fill="#93c5fd" points="18 22 32 46 12 22"/>
      <polygon fill="#3b82f6" points="46 22 32 46 52 22"/>
    </svg>
  `,
  heart: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <path fill="#f472b6" d="M32 54s-18-11.4-24-21C3.6 26 6 16 14 13c4.6-1.6 9.8 0 12.8 3.8L32 22l5.2-5.2C40.2 13 45.4 11.4 50 13c8 3 10.4 13 6 20-6 9.6-24 21-24 21z"/>
      <path fill="#fbcfe8" d="M32 47s-13.6-8.8-18.4-16.2C10.4 25.4 12.2 18.6 18 16.6c3.4-1.2 7.2 0 9.4 2.8L32 24l4.6-4.6c2.2-2.8 6-4 9.4-2.8 5.8 2 7.6 8.8 4.4 14.2C45.6 38.2 32 47 32 47z"/>
    </svg>
  `,
  shield: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <path fill="#4f46e5" d="M32 6l20 8v16c0 12.4-8.8 23.6-20 28-11.2-4.4-20-15.6-20-28V14z"/>
      <path fill="#312e81" d="M32 12l14 5.6V30c0 8.8-5.8 17.2-14 21-8.2-3.8-14-12.2-14-21V17.6z"/>
      <path fill="#60a5fa" d="M32 18l10 4v8c0 6-3.6 11.8-10 15-6.4-3.2-10-9-10-15v-8z"/>
      <path fill="#bfdbfe" d="M30 32l2-10 2 10h10l-8 6 3 10-7-5.2-7 5.2 3-10-8-6z"/>
    </svg>
  `,
  rocket: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <path fill="#4c1d95" d="M32 6c10 6 16 18 16 28 0 5.6-1.6 10.8-4.4 15.6L32 54l-11.6-4.4C17.6 44.8 16 39.6 16 34 16 24 22 12 32 6z"/>
      <circle cx="32" cy="26" r="8" fill="#f0f9ff"/>
      <circle cx="32" cy="26" r="4" fill="#38bdf8"/>
      <path fill="#fb923c" d="M20 48l4 12 8-6 8 6 4-12-12-4z"/>
      <path fill="#f97316" d="M32 44l-12 4 4-8h16l4 8z"/>
    </svg>
  `,
  crown: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <path fill="#facc15" d="M12 44h40l-4 10H16z"/>
      <path fill="#fde68a" d="M12 20l10 12 10-16 10 16 10-12 4 24H8z"/>
      <circle cx="12" cy="18" r="4" fill="#f97316"/>
      <circle cx="52" cy="18" r="4" fill="#f97316"/>
      <circle cx="32" cy="14" r="4" fill="#f97316"/>
    </svg>
  `,
  megaphone: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <path fill="#7c3aed" d="M10 26h8l20-14v40L18 38h-8z"/>
      <path fill="#a855f7" d="M38 12 54 8v48l-16-4V12z"/>
      <path fill="#fef9c3" d="M18 38h6l4 10c1.2 3-0.6 6-3.6 6H20z"/>
      <circle cx="50" cy="18" r="3" fill="#fde68a"/>
      <circle cx="50" cy="46" r="3" fill="#fde68a"/>
    </svg>
  `,
  globe: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="22" fill="#1e3a8a"/>
      <path fill="#38bdf8" d="M18 20c6 0 8-6 14-6s10 4 10 8 4 6 8 6-2 16-10 16-12-4-18-4-8-4-8-8 0-12 4-12z"/>
      <path fill="#0ea5e9" d="M24 44c4 0 6 4 10 4s8-2 8-6 4-4 6-4c0 6-6 14-14 16-10-2-16-10-16-10s2 0 6 0z"/>
      <circle cx="32" cy="32" r="22" fill="none" stroke="#38bdf8" stroke-width="2"/>
    </svg>
  `,
  spark: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <polygon fill="#fde047" points="32 6 36 24 54 28 38 36 44 54 32 44 20 54 26 36 10 28 28 24"/>
      <polygon fill="#f97316" points="32 12 35 24 46 26 36 32 40 44 32 38 24 44 28 32 18 26 29 24"/>
    </svg>
  `,
  book: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <path fill="#0ea5e9" d="M12 12h20c4 0 8 4 8 8v32H20c-4 0-8-4-8-8V12z"/>
      <path fill="#38bdf8" d="M32 12h20v32c0 4-4 8-8 8h-20V20c0-4 4-8 8-8z"/>
      <path fill="#f8fafc" d="M18 18h12v4H18zm24 0h10v4H42z"/>
      <path fill="#fef3c7" d="M18 28h12v4H18zm24 0h10v4H42z"/>
    </svg>
  `,
  clipboard: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect x="14" y="12" width="36" height="44" rx="6" fill="#f1f5f9"/>
      <rect x="22" y="8" width="20" height="8" rx="3" fill="#6366f1"/>
      <rect x="18" y="20" width="28" height="4" rx="2" fill="#94a3b8"/>
      <rect x="18" y="28" width="28" height="4" rx="2" fill="#94a3b8"/>
      <rect x="18" y="36" width="20" height="4" rx="2" fill="#22c55e"/>
      <path fill="#22c55e" d="M42 36h4v12h-4z"/>
    </svg>
  `,
  mountain: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect width="64" height="20" y="44" fill="#0f172a"/>
      <path fill="#1e3a8a" d="M6 44 26 16l10 12z"/>
      <path fill="#3b82f6" d="M26 16 46 44H6z"/>
      <path fill="#f8fafc" d="M32 18 58 44H22z"/>
      <path fill="#22d3ee" d="M32 18 46 36h-8z"/>
    </svg>
  `,
  lightbulb: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <path fill="#fde047" d="M20 26c0-8.8 7.2-16 16-16s16 7.2 16 16c0 5.6-2.8 10.6-7.4 13.6-2.2 1.4-4.6 2.8-4.6 6.4v2H32v-2c0-3.6-2.4-5-4.6-6.4C22.8 36.6 20 31.6 20 26z"/>
      <rect x="26" y="48" width="12" height="6" rx="2" fill="#f97316"/>
      <rect x="24" y="54" width="16" height="4" rx="2" fill="#475569"/>
      <path fill="#fde68a" d="M28 28h16c0 4-4 8-8 8s-8-4-8-8z"/>
    </svg>
  `,
  ribbon: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <circle cx="32" cy="26" r="14" fill="#ec4899"/>
      <circle cx="32" cy="26" r="8" fill="#fdf2f8"/>
      <path fill="#db2777" d="M24 36 18 58l14-10 14 10-6-22z"/>
      <path fill="#fdf2f8" d="M32 18a8 8 0 0 0-8 8h4a4 4 0 0 1 4-4z"/>
    </svg>
  `,
  chart: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect x="12" y="8" width="40" height="48" rx="6" fill="#0f172a"/>
      <rect x="18" y="38" width="8" height="10" fill="#38bdf8"/>
      <rect x="28" y="30" width="8" height="18" fill="#f97316"/>
      <rect x="38" y="22" width="8" height="26" fill="#22c55e"/>
      <path fill="#94a3b8" d="M18 46h32v2H18z"/>
    </svg>
  `,
  handshake: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <path fill="#f97316" d="M10 24h14l10 12-8 10H12c-1.6 0-2.8-1.2-2.8-2.8z"/>
      <path fill="#facc15" d="M54 24H40l-10 12 8 10h14c1.6 0 2.8-1.2 2.8-2.8z"/>
      <path fill="#fef3c7" d="M28 36h8l6 8c1 1.2.2 3-1.4 3H23.4c-1.6 0-2.4-1.8-1.4-3z"/>
      <path fill="#f59e0b" d="M36 24h-8l-6 6h8z"/>
    </svg>
  `,
  star: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="22" fill="#0f172a"/>
      <path fill="#facc15" d="M32 12 37.6 26H52l-11.2 8 4.2 14L32 38l-12.8 10 4.2-14L12 26h14.4z"/>
      <circle cx="32" cy="32" r="6" fill="#fef9c3"/>
    </svg>
  `,
  compass: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="24" fill="#0f172a"/>
      <circle cx="32" cy="32" r="20" fill="#111827"/>
      <polygon fill="#38bdf8" points="32 14 38 32 32 32 26 32"/>
      <polygon fill="#f97316" points="32 50 26 32 32 32 38 32"/>
      <circle cx="32" cy="32" r="4" fill="#fefefe"/>
    </svg>
  `,
  laurel: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <circle cx="32" cy="30" r="14" fill="#22c55e"/>
      <path fill="#14532d" d="M18 18c-4 4-6 10-6 14 4 0 10-2 14-6-4-4-6-10-8-8z"/>
      <path fill="#14532d" d="M46 18c4 4 6 10 6 14-4 0-10-2-14-6 4-4 6-10 8-8z"/>
      <path fill="#14532d" d="M22 46c-4-2-6-6-8-10 4 0 8 2 12 6-2 2-2 4-4 4z"/>
      <path fill="#14532d" d="M42 46c4-2 6-6 8-10-4 0-8 2-12 6 2 2 2 4 4 4z"/>
      <rect x="26" y="40" width="12" height="12" rx="3" fill="#0f172a"/>
    </svg>
  `,
  puzzle: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <path fill="#2563eb" d="M12 18h16v12h-2c-2.2 0-4 1.8-4 4s1.8 4 4 4h2v16H12z"/>
      <path fill="#3b82f6" d="M36 18h16v16h-2c-2.2 0-4 1.8-4 4s1.8 4 4 4h2v16H36z"/>
      <path fill="#60a5fa" d="M28 30h8v4h-8z"/>
      <path fill="#93c5fd" d="M28 42h8v4h-8z"/>
    </svg>
  `,
  badge: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <path fill="#3730a3" d="M32 8 46 16l4 16-4 16-14 8-14-8-4-16 4-16z"/>
      <path fill="#4f46e5" d="M32 14 42 20l3 12-3 12-10 6-10-6-3-12 3-12z"/>
      <circle cx="32" cy="32" r="8" fill="#facc15"/>
      <path fill="#fef9c3" d="M32 26 34.5 30.5 39 32l-4.5 1.5L32 38l-1.5-4.5L26 32l4.5-1.5z"/>
    </svg>
  `,
  flame: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <path fill="#f97316" d="M24 30c0-12 12-20 12-26 8 6 14 16 14 24 0 6.6-3.2 12.6-8.4 16.4C39.2 46.8 36 50 36 54H28c0-4-3.2-7.2-5.6-9.6C25.2 40.6 24 35.4 24 30z"/>
      <path fill="#facc15" d="M28 34c0-6 6-10 6-14 4 4 8 8 8 12 0 4-2 7.6-5.2 9.8C36 44 34.4 46 34.4 48h-4.8c0-2-1.2-4-2.4-4.2C29.6 41.6 28 38 28 34z"/>
    </svg>
  `,
  network: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <circle cx="18" cy="20" r="6" fill="#38bdf8"/>
      <circle cx="46" cy="20" r="6" fill="#f97316"/>
      <circle cx="32" cy="44" r="8" fill="#6366f1"/>
      <path fill="none" stroke="#0f172a" stroke-width="3" d="M18 20 32 44 46 20"/>
      <path fill="none" stroke="#0f172a" stroke-width="3" d="M18 20h28"/>
    </svg>
  `,
  gear: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="10" fill="#fef3c7"/>
      <circle cx="32" cy="32" r="6" fill="#f97316"/>
      <path fill="#0ea5e9" d="M32 10 39 12l3 8-4 4 4 4-3 8-7 2-7-2-3-8 4-4-4-4 3-8z"/>
      <path fill="#38bdf8" d="M32 16 36 18l2 4-3 2 3 2-2 4-4 2-4-2-2-4 3-2-3-2 2-4z"/>
    </svg>
  `,
  whistle: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect x="12" y="24" width="30" height="16" rx="8" fill="#3b82f6"/>
      <circle cx="40" cy="32" r="12" fill="#0f172a"/>
      <circle cx="40" cy="32" r="6" fill="#60a5fa"/>
      <path fill="#1d4ed8" d="M42 24h10l4 8-4 8H42z"/>
      <path fill="#bfdbfe" d="M46 28h6l2 4-2 4h-6l2-4z"/>
    </svg>
  `,
  plane: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <path fill="#0ea5e9" d="M10 34 54 14l-12 24 12 4-12 10-8-8-4 8-6-6 4-12z"/>
      <path fill="#38bdf8" d="M28 36 42 20l6 2-8 16 8 4-6 6z"/>
      <path fill="#f8fafc" d="M24 38 30 40 26 50l-2-2z"/>
    </svg>
  `
};

function renderIcon(name, size = "md") {
  const svg = ICONS[name];
  if (!svg) return "";
  const sizes = ["xs", "sm", "md", "lg"];
  const sizeClass = sizes.includes(size) ? size : "md";
  return `<span class="icon-token icon-token--${sizeClass}" data-icon="${name}" aria-hidden="true">${svg.trim()}</span>`;
}

const ACHIEVEMENT_TONES = {
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
};

const ACHIEVEMENTS = [
  {
    id: "first-catch",
    title: "First Catch",
    description: "Report your very first suspicious email through WeldSecure.",
    category: "Activation",
    points: 40,
    icon: "medal",
    tone: "violet"
  },
  {
    id: "rapid-reporter",
    title: "Rapid Reporter",
    description: "Flag a potentially risky message within 10 minutes of receiving it.",
    category: "Speed",
    points: 60,
    icon: "hourglass",
    tone: "cobalt"
  },
  {
    id: "reward-ready",
    title: "Reward Ready",
    description: "Earn enough points to unlock your first WeldSecure reward.",
    category: "Rewards",
    points: 80,
    icon: "gift",
    tone: "coral"
  },
  {
    id: "bullseye-breaker",
    title: "Bullseye Breaker",
    description: "Identify a targeted phishing attempt that hits multiple peers.",
    category: "Precision",
    points: 90,
    icon: "target",
    tone: "aqua"
  },
  {
    id: "leaderboard-legend",
    title: "Leaderboard Legend",
    description: "Finish a month at the top of the reporter leaderboard.",
    category: "Recognition",
    points: 160,
    icon: "trophy",
    tone: "gold"
  },
  {
    id: "golden-signal",
    title: "Golden Signal",
    description: "Submit intel that leads to a high-severity threat takedown.",
    category: "Impact",
    points: 150,
    icon: "diamond",
    tone: "amber"
  },
  {
    id: "culture-spark",
    title: "Culture Spark",
    description: "Share a vigilance tip that inspires three coworkers to report.",
    category: "Culture",
    points: 70,
    icon: "heart",
    tone: "emerald"
  },
  {
    id: "guardian-streak",
    title: "Guardian Streak",
    description: "Report suspicious content for seven days in a row.",
    category: "Consistency",
    points: 120,
    icon: "shield",
    tone: "midnight"
  },
  {
    id: "launch-pad",
    title: "Launch Pad",
    description: "Complete every onboarding checklist item in your first week.",
    category: "Activation",
    points: 50,
    icon: "rocket",
    tone: "violet"
  },
  {
    id: "champion-circle",
    title: "Champion Circle",
    description: "Earn the monthly champion recognition from security leaders.",
    category: "Recognition",
    points: 180,
    icon: "crown",
    tone: "gold"
  },
  {
    id: "hype-herald",
    title: "Hype Herald",
    description: "Promote WeldSecure reporting in a company-wide channel.",
    category: "Culture",
    points: 60,
    icon: "megaphone",
    tone: "coral"
  },
  {
    id: "global-scout",
    title: "Global Scout",
    description: "Submit a report while traveling outside your primary office.",
    category: "Mobility",
    points: 100,
    icon: "globe",
    tone: "cobalt"
  },
  {
    id: "spark-starter",
    title: "Spark Starter",
    description: "Be the first reporter to raise a newly trending threat subject.",
    category: "Impact",
    points: 85,
    icon: "spark",
    tone: "blush"
  },
  {
    id: "playbook-pro",
    title: "Playbook Pro",
    description: "Complete every interactive training mission in the reporter hub.",
    category: "Mastery",
    points: 75,
    icon: "book",
    tone: "slate"
  },
  {
    id: "context-captain",
    title: "Context Captain",
    description: "Provide detailed notes and evidence for five consecutive reports.",
    category: "Mastery",
    points: 65,
    icon: "clipboard",
    tone: "emerald"
  },
  {
    id: "elevation-500",
    title: "Elevation 500",
    description: "Reach 500 lifetime WeldSecure points as a reporter.",
    category: "Rewards",
    points: 110,
    icon: "mountain",
    tone: "midnight"
  },
  {
    id: "insight-whisperer",
    title: "Insight Whisperer",
    description: "Spot a new attacker tactic before it appears in threat advisories.",
    category: "Impact",
    points: 140,
    icon: "lightbulb",
    tone: "gold"
  },
  {
    id: "streak-ribbon",
    title: "Streak Ribbon",
    description: "Maintain a fourteen-day reporting streak without missing a beat.",
    category: "Consistency",
    points: 130,
    icon: "ribbon",
    tone: "violet"
  },
  {
    id: "trend-setter",
    title: "Trend Setter",
    description: "Contribute to three weekly momentum report spikes in a quarter.",
    category: "Consistency",
    points: 95,
    icon: "chart",
    tone: "aqua"
  },
  {
    id: "buddy-system",
    title: "Buddy System",
    description: "Coach a colleague through their first WeldSecure report.",
    category: "Collaboration",
    points: 90,
    icon: "handshake",
    tone: "emerald"
  },
  {
    id: "spotlight-star",
    title: "Spotlight Star",
    description: "Be featured on the company vigilance wall of fame.",
    category: "Recognition",
    points: 170,
    icon: "star",
    tone: "gold"
  },
  {
    id: "early-pathfinder",
    title: "Early Pathfinder",
    description: "Submit the first report from a newly onboarded location.",
    category: "Activation",
    points: 105,
    icon: "compass",
    tone: "slate"
  },
  {
    id: "seasoned-sentinel",
    title: "Seasoned Sentinel",
    description: "Report suspicious activity every month for six consecutive months.",
    category: "Consistency",
    points: 160,
    icon: "laurel",
    tone: "emerald"
  },
  {
    id: "pattern-decoder",
    title: "Pattern Decoder",
    description: "Connect three related phishing emails across different days.",
    category: "Impact",
    points: 145,
    icon: "puzzle",
    tone: "midnight"
  },
  {
    id: "badge-binge",
    title: "Badge Binge",
    description: "Unlock five unique reporter achievements in a single quarter.",
    category: "Meta",
    points: 200,
    icon: "badge",
    tone: "violet"
  },
  {
    id: "zero-day-zeal",
    title: "Zero-Day Zeal",
    description: "Raise the first report tied to a zero-day alert in the news.",
    category: "Impact",
    points: 155,
    icon: "flame",
    tone: "coral"
  },
  {
    id: "network-node",
    title: "Network Node",
    description: "Share a WeldSecure threat insight that sparks a team discussion.",
    category: "Collaboration",
    points: 80,
    icon: "network",
    tone: "aqua"
  },
  {
    id: "automation-ally",
    title: "Automation Ally",
    description: "Trigger an automated secure response with your report metadata.",
    category: "Impact",
    points: 125,
    icon: "gear",
    tone: "slate"
  },
  {
    id: "whistle-watch",
    title: "Whistle Watch",
    description: "Escalate a suspicious phone call or SMS using WeldSecure tools.",
    category: "Speed",
    points: 115,
    icon: "whistle",
    tone: "cobalt"
  },
  {
    id: "carry-on-defender",
    title: "Carry-on Defender",
    description: "Submit a high-quality report while traveling on business day one.",
    category: "Mobility",
    points: 100,
    icon: "plane",
    tone: "blush"
  }
];

function initialState() {
  return {
    meta: {
      role: null,
      route: "landing",
      addinScreen: "report",
      lastReportedSubject: null,
      lastReportPoints: null,
      achievementFilter: null,
      quizFilter: null,
      quizStatus: {}
    },
    customer: {
      id: 501,
      name: "Rachel Summers",
      email: "rachel.summers@example.com",
      currentPoints: 540,
      redeemedPoints: 180,
      clientId: 101
    },
    rewards: [
      {
        id: 1,
        name: "Fortnum & Mason Afternoon Tea",
        description: "Premium afternoon tea experience for two, delivered to your door.",
        pointsCost: 400,
        icon: "gift",
        category: "experience",
        provider: "Fortnum & Mason",
        image: "linear-gradient(135deg, #9457ff 0%, #4e0dff 100%)",
        remaining: 6
      },
      {
        id: 2,
        name: "Selfridges Gift Card",
        description: "Digital gift card redeemable online or in-store.",
        pointsCost: 280,
        icon: "diamond",
        category: "voucher",
        provider: "Selfridges & Co",
        image: "linear-gradient(135deg, #ff8a80 0%, #ff416c 100%)",
        remaining: 12
      },
      {
        id: 3,
        name: "Margot & Montañez Chocolate Hamper",
        description: "Limited edition artisan chocolate selection to celebrate vigilance.",
        pointsCost: 120,
        icon: "heart",
        category: "merchandise",
        provider: "Margot & Montañez",
        image: "linear-gradient(135deg, #ffbe0b 0%, #fb5607 100%)",
        remaining: 20
      },
      {
        id: 4,
        name: "Weld Champion Hoodie",
        description: "Exclusive Weld hoodie for team members leading the risk scoreboard.",
        pointsCost: 260,
        icon: "trophy",
        category: "merchandise",
        provider: "Weld Apparel",
        image: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)",
        remaining: 15
      }
    ],
    rewardRedemptions: [
      { id: 1, rewardId: 3, redeemedAt: "2025-09-12T09:30:00Z", status: "fulfilled" }
    ],
    reportReasons: [
      { id: 1, description: "Looks like a phishing attempt" },
      { id: 2, description: "Unexpected attachment or link" },
      { id: 3, description: "Urgent language / suspicious tone" },
      { id: 4, description: "Sender spoofing a senior colleague" },
      { id: 5, description: "Personal data request" }
    ],
    messages: [
      {
        id: 9001,
        messageId: "AAMkAGU0Zjk5ZGMyLTQ4M2UtND",
        subject: "Updated supplier bank details",
        reporterName: "Rachel Summers",
        reporterEmail: "rachel.summers@example.com",
        clientId: 101,
        reportedAt: "2025-10-07T08:45:00Z",
        status: MessageStatus.APPROVED,
        reasons: [1, 3],
        pointsOnMessage: 20,
        pointsOnApproval: 80,
        additionalNotes: "Sender domain looked suspicious and the tone was urgent."
      },
      {
        id: 9002,
        messageId: "AAMkAGRjYTgzZjAtOGQ0Mi00",
        subject: "Benefits enrolment confirmation",
        reporterName: "Rachel Summers",
        reporterEmail: "rachel.summers@example.com",
        clientId: 101,
        reportedAt: "2025-10-02T17:12:00Z",
        status: MessageStatus.PENDING,
        reasons: [2],
        pointsOnMessage: 20,
        pointsOnApproval: 80
      },
      {
        id: 9003,
        messageId: "AAMkAGQxZTZlNDAtZWMxOS00",
        subject: "CEO request for quick payment",
        reporterName: "Will Adams",
        reporterEmail: "will.adams@example.com",
        clientId: 101,
        reportedAt: "2025-09-26T11:06:00Z",
        status: MessageStatus.APPROVED,
        reasons: [4, 5],
        pointsOnMessage: 20,
        pointsOnApproval: 80,
        additionalNotes: "Attempted to impersonate our CEO - flagged for urgency."
      }
    ],
    clients: [
      {
        id: 101,
        name: "Evergreen Capital",
        organizationId: "e3a4-uk-lon",
        pointsPerMessage: 20,
        pointsOnApproval: 80,
        activeUsers: 184,
        healthScore: 92,
        openCases: 3,
        lastReportAt: "2025-10-07T08:45:00Z"
      },
      {
        id: 102,
        name: "Harper & Black",
        organizationId: "hb-uk-lon",
        pointsPerMessage: 20,
        pointsOnApproval: 80,
        activeUsers: 82,
        healthScore: 86,
        openCases: 5,
        lastReportAt: "2025-10-06T15:20:00Z"
      },
      {
        id: 103,
        name: "Cobalt Manufacturing",
        organizationId: "cobalt-emea",
        pointsPerMessage: 20,
        pointsOnApproval: 80,
        activeUsers: 241,
        healthScore: 74,
        openCases: 9,
        lastReportAt: "2025-10-05T10:15:00Z"
      }
    ]
  };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function storageAvailable() {
  try {
    const testKey = "__weldTest";
    localStorage.setItem(testKey, "1");
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

function loadState() {
  if (!storageAvailable()) {
    return initialState();
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return initialState();
  }

  try {
    const parsed = JSON.parse(raw);
    const baseState = initialState();
    const normalizedClients = Array.isArray(parsed.clients)
      ? parsed.clients.map(client => {
          const baseClient = baseState.clients.find(item => item.id === client.id);
          return {
            ...client,
            pointsPerMessage: baseClient ? baseClient.pointsPerMessage : 20,
            pointsOnApproval: baseClient ? baseClient.pointsOnApproval : 80
          };
        })
      : baseState.clients;
    const normalizedMessages = Array.isArray(parsed.messages)
      ? parsed.messages.map(message => {
          const clientId = message.clientId ?? baseState.customer.clientId;
          const clientConfig =
            normalizedClients.find(client => client.id === clientId) ??
            baseState.clients.find(client => client.id === clientId);
          return {
            ...message,
            clientId,
            pointsOnMessage: message.pointsOnMessage ?? clientConfig?.pointsPerMessage ?? 20,
            pointsOnApproval: message.pointsOnApproval ?? clientConfig?.pointsOnApproval ?? 80
          };
        })
      : baseState.messages;
    return {
      ...baseState,
      ...parsed,
      meta: {
        ...baseState.meta,
        ...parsed.meta
      },
      messages: normalizedMessages,
      clients: normalizedClients
    };
  } catch {
    return initialState();
  }
}

let state = loadState();

function initializeRoute() {
  const hashRoute = window.location.hash.replace("#", "");
  if (hashRoute && ROUTES[hashRoute]) {
    state.meta.route = hashRoute;
    state.meta.role = ROUTES[hashRoute].requiresRole || null;
    if (hashRoute === "addin") {
      state.meta.addinScreen = "report";
    }
  } else {
    state.meta.route = "landing";
    state.meta.role = null;
  }
}

initializeRoute();

function persist() {
  if (!storageAvailable()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function navigate(route) {
  const nextRoute = ROUTES[route] ? route : "landing";
  state.meta.route = nextRoute;
  if (nextRoute === "landing") {
    state.meta.role = null;
  }
  persist();
  renderApp();
}

function setRole(role, route) {
  state.meta.role = role;
  if (route) {
    state.meta.route = route;
  }
  persist();
  renderApp();
}

function resetDemo() {
  const defaultState = initialState();
  state.meta = clone(defaultState.meta);
  state.customer = clone(defaultState.customer);
  state.rewards = clone(defaultState.rewards);
  state.rewardRedemptions = clone(defaultState.rewardRedemptions);
  state.reportReasons = clone(defaultState.reportReasons);
  state.messages = clone(defaultState.messages);
  state.clients = clone(defaultState.clients);
  if (storageAvailable()) {
    localStorage.removeItem(STORAGE_KEY);
  }
  persist();
  if (window.location.hash) {
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    } else {
      window.location.hash = "";
    }
  }
  renderApp();
}

function rewardById(id) {
  return state.rewards.find(item => item.id === id);
}

function reasonById(id) {
  return state.reportReasons.find(item => item.id === id);
}

function quizById(id) {
  return QUIZZES.find(item => item.id === id);
}

function messageBelongsToCustomer(message) {
  return message?.reporterEmail === state.customer.email;
}

function redeemReward(rewardId) {
  const reward = rewardById(rewardId);
  if (!reward) return { success: false, reason: "Reward not found." };
  if (state.customer.currentPoints < reward.pointsCost) {
    return { success: false, reason: "Not enough points to redeem this reward yet." };
  }
  if (reward.remaining <= 0) {
    return { success: false, reason: "This reward is temporarily out of stock." };
  }

  state.customer.currentPoints -= reward.pointsCost;
  state.customer.redeemedPoints += reward.pointsCost;
  reward.remaining = Math.max(reward.remaining - 1, 0);

  const redemption = {
    id: Date.now(),
    rewardId: reward.id,
    redeemedAt: new Date().toISOString(),
    status: "pending"
  };

  state.rewardRedemptions.unshift(redemption);
  persist();
  renderApp();

  return { success: true, redemption };
}

function reportMessage(payload) {
  const client = state.clients.find(c => c.id === state.customer.clientId);
  const pointsOnMessage = 20;
  const pointsOnApproval = client?.pointsOnApproval ?? 80;
  const beforePoints = state.customer.currentPoints;
  const message = {
    id: Date.now(),
    messageId: payload.messageId,
    subject: payload.subject,
    reporterName: payload.reporterName,
    reporterEmail: payload.reporterEmail,
    clientId: state.customer.clientId,
    reportedAt: new Date().toISOString(),
    status: MessageStatus.PENDING,
    reasons: payload.reasons,
    pointsOnMessage,
    pointsOnApproval,
    additionalNotes: payload.notes || null
  };

  state.messages.unshift(message);
  state.customer.currentPoints += pointsOnMessage;
  const awardedPoints = state.customer.currentPoints - beforePoints;
  message.pointsOnMessage = awardedPoints;

  if (client) {
    client.openCases += 1;
    client.healthScore = Math.min(client.healthScore + 1, 100);
    client.lastReportAt = message.reportedAt;
  }

  state.meta.addinScreen = "success";
  state.meta.lastReportedSubject = payload.subject;
  state.meta.lastReportPoints = awardedPoints;
  persist();
  renderApp();
}

function setupCelebrationReplay(container) {
  const celebration = container.querySelector(".points-celebration");
  if (!celebration) return;
  const bubble = celebration.querySelector(".points-celebration__bubble");
  if (!bubble || bubble.dataset.replayBound === "true") return;

  bubble.dataset.replayBound = "true";
  bubble.classList.add("points-celebration__bubble--interactive");
  bubble.setAttribute("role", "button");
  bubble.setAttribute("tabindex", "0");
  bubble.setAttribute("aria-label", "Replay celebration animation");

  const restart = () => {
    const replacement = celebration.cloneNode(true);
    celebration.replaceWith(replacement);
    setupCelebrationReplay(container);
    const nextBubble = container.querySelector(".points-celebration__bubble");
    if (nextBubble) {
      nextBubble.focus();
    }
  };

  const handleTrigger = event => {
    if (
      event.type === "click" ||
      (event.type === "keydown" && (event.key === "Enter" || event.key === " "))
    ) {
      event.preventDefault();
      restart();
    }
  };

  bubble.addEventListener("click", handleTrigger);
  bubble.addEventListener("keydown", handleTrigger);
}

function updateMessageStatus(messageId, status) {
  const target = state.messages.find(msg => msg.id === messageId);
  if (!target || target.status === status) return;

  const previousStatus = target.status;
  const wasPending = previousStatus === MessageStatus.PENDING;
  const willBePending = status === MessageStatus.PENDING;
  const affectsCustomer = messageBelongsToCustomer(target);
  if (target.clientId === undefined && affectsCustomer) {
    target.clientId = state.customer.clientId;
  }

  if (previousStatus === MessageStatus.APPROVED && status !== MessageStatus.APPROVED) {
    if (affectsCustomer) {
      state.customer.currentPoints = Math.max(state.customer.currentPoints - target.pointsOnApproval, 0);
    }
  }
  target.status = status;
  if (status === MessageStatus.APPROVED && previousStatus !== MessageStatus.APPROVED) {
    if (affectsCustomer) {
      state.customer.currentPoints += target.pointsOnApproval;
    }
  }

  if (wasPending && !willBePending) {
    const clientId = target.clientId ?? (affectsCustomer ? state.customer.clientId : null);
    const client = clientId ? state.clients.find(c => c.id === clientId) : null;
    if (client && client.openCases > 0) {
      client.openCases -= 1;
    }
  }

  persist();
  renderApp();
}

function formatDateTime(iso) {
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function relativeTime(iso) {
  const target = new Date(iso);
  const diff = Date.now() - target.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;

  if (diff < minute) return "just now";
  if (diff < hour) {
    const m = Math.floor(diff / minute);
    return `${m} minute${m === 1 ? "" : "s"} ago`;
  }
  if (diff < day) {
    const h = Math.floor(diff / hour);
    return `${h} hour${h === 1 ? "" : "s"} ago`;
  }
  if (diff < week) {
    const d = Math.floor(diff / day);
    return `${d} day${d === 1 ? "" : "s"} ago`;
  }
  return target.toLocaleDateString();
}

function openDialog({ title, description, content, confirmLabel, onConfirm, cancelLabel, onCancel, tone = "primary" }) {
  let root = document.getElementById("dialog-root");
  if (!root) {
    root = document.createElement("div");
    root.id = "dialog-root";
  }
  if (root.parentElement !== document.body) {
    document.body.appendChild(root);
  }

  const previousOverflow = document.body.style.overflow;
  document.body.dataset.previousOverflow = previousOverflow;
  document.body.style.overflow = "hidden";

  root.innerHTML = `
    <div class="dialog-backdrop" role="dialog" aria-modal="true">
      <div class="dialog-surface">
        <header>
          <h2>${title}</h2>
          ${description ? `<p>${description}</p>` : ""}
        </header>
        <section>${content || ""}</section>
        <footer class="dialog-actions">
          ${cancelLabel ? `<button class="button-pill button-pill--ghost" data-dialog-action="cancel">${cancelLabel}</button>` : ""}
          ${confirmLabel ? `<button class="button-pill ${tone === "critical" ? "button-pill--critical" : "button-pill--primary"}" data-dialog-action="confirm">${confirmLabel}</button>` : ""}
        </footer>
      </div>
    </div>
  `;

  function close() {
    root.innerHTML = "";
    const storedOverflow = document.body.dataset.previousOverflow;
    document.body.style.overflow = storedOverflow !== undefined ? storedOverflow : "";
    delete document.body.dataset.previousOverflow;
    root.removeEventListener("click", handleBackdrop);
    document.removeEventListener("keydown", handleKey);
  }

  function handleBackdrop(event) {
    if (event.target === event.currentTarget) {
      if (onCancel) onCancel();
      close();
    }
  }

  function handleKey(event) {
    if (event.key === "Escape") {
      if (onCancel) onCancel();
      close();
    }
  }

  root.addEventListener("click", handleBackdrop);
  document.addEventListener("keydown", handleKey);

  const confirmBtn = root.querySelector('[data-dialog-action="confirm"]');
  const cancelBtn = root.querySelector('[data-dialog-action="cancel"]');

  if (confirmBtn) {
    confirmBtn.addEventListener("click", () => {
      if (onConfirm) onConfirm(close);
      else close();
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      if (onCancel) onCancel();
      close();
    });
  }
}

function closeDialog() {
  const root = document.getElementById("dialog-root");
  if (root) {
    root.innerHTML = "";
  }
  const storedOverflow = document.body.dataset.previousOverflow;
  document.body.style.overflow = storedOverflow !== undefined ? storedOverflow : "";
  delete document.body.dataset.previousOverflow;
}

function renderGlobalNav(activeRoute) {
  return `
    <nav class="global-nav" aria-label="Primary navigation">
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
                      <button type="button" role="menuitem" class="global-nav__item ${isActive ? "global-nav__item--active" : ""}" data-route="${item.route}"${roleAttr} ${ariaCurrent}>
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
      <button type="button" class="button-pill button-pill--primary global-nav__journey" id="global-journey">
        Home
      </button>
    </nav>
  `;
}

function renderLanding() {
  const journeyCards = [
    {
      title: "Reporter Journey",
      description: "Show how frontline reporters spot suspicious emails, earn points, and redeem curated rewards.",
      tone: "linear-gradient(135deg, #6f47ff, #3623de)",
      role: "customer",
      route: "addin"
    },
    {
      title: "Organisation Journey",
      description: "Demonstrate analytics, reporting cadence, and insights security leaders rely on.",
      tone: "linear-gradient(135deg, #ff8a80, #ff4d6d)",
      role: "client",
      route: "client-dashboard"
    },
    {
      title: "WeldSecure Journey",
      description: "Highlight how Weld curates multi-tenant success with organisation health signals and playbooks.",
      tone: "linear-gradient(135deg, #0ea5e9, #2563eb)",
      role: "admin",
      route: "weld-admin"
    }
  ]
    .map(card => {
      const roleMeta = card.role ? ROLE_LABELS[card.role] : null;
      const chipClass = card.chipClass || (roleMeta ? roleMeta.chip : "");
      const chipLabel = card.chipLabel || (roleMeta ? roleMeta.label : "");
      return `
        <button class="journey-card" style="--tone:${card.tone}" data-role="${card.role || ""}" data-route="${card.route}">
          ${
            chipLabel
              ? `<div class="chip ${chipClass}">
                  <span class="chip__dot"></span>${chipLabel}
                </div>`
              : ""
          }
          <h3>${card.title}</h3>
          <p>${card.description}</p>
          <span class="journey-card__action">${
            card.route === "achievements" ? "Explore badges" : card.route === "addin" ? "Launch task pane" : "Launch journey"
          }</span>
        </button>
      `;
    })
    .join("");

  return `
    <div class="landing">
      <section class="landing__hero">
        <div class="landing__intro">
          <span class="landing__eyebrow">Product tour</span>
          <h1 class="landing__headline">Weld keeps human vigilance rewarding.<span>Walk through every journey in minutes.</span></h1>
          <p class="landing__lead">Select the experience you want to explore. Each journey mirrors the shipping SaaS surfaces with live-feeling interactions and updated metrics--no backend required.</p>
        </div>
        <button class="button-pill button-pill--primary landing-reset" id="landing-reset">Reset</button>
      </section>
      <section class="landing__section landing__section--journeys">
        <header class="landing__section-header">
          <div>
            <span class="landing__section-eyebrow">Journeys</span>
            <h2>Explore WeldSecure from every stakeholder lens.</h2>
            <p>Select a view to tailor the narrative to reporters, organisation leaders, or Weld operators.</p>
          </div>
        </header>
        <div class="landing__tiles">
          ${journeyCards}
        </div>
      </section>
      <section class="landing__section landing__section--features">
        <header class="landing__section-header">
          <div>
            <span class="landing__section-eyebrow">Feature showcase</span>
            <h2>Jump straight to the demo moments that resonate.</h2>
            <p>Use these cards to spotlight the metrics, recognition, and automation flows that close deals.</p>
          </div>
        </header>
        <div class="landing__tiles landing__tiles--features">
          ${renderFeatureShowcase()}
        </div>
      </section>
    </div>
  `;
}

function renderFeatureShowcase() {
  const featureCards = [
    {
      title: "Reporter journey",
      description: "Launch the task pane to demonstrate reporting, instant recognition, and success animations.",
      icon: "outlook",
      action: { label: "Launch add-in", route: "addin" }
    },
    {
      title: "Badge gallery",
      description: "Browse all 30 WeldSecure badges with filters, points, and storytelling angles.",
      icon: "medal",
      action: { label: "View badges", route: "achievements", role: "customer" }
    },
    {
      title: "Quest challenges",
      description: "Show how five-minute scenario quests award instant vigilance points and streak bonuses.",
      icon: "lightbulb",
      action: { label: "Run quest experience", route: "quizzes", role: "customer" }
    },
    {
      title: "Recognition metrics",
      description: "Preview reporter points, pending approvals, and redemption data in one glance.",
      icon: "medal",
      action: { label: "Open reporter profile", route: "customer", role: "customer" }
    },
    {
      title: "Automation playbooks",
      description: "Explain how Weld orchestrates cross-tenant interventions during risk spikes.",
      icon: "gear",
      action: { label: "Show admin controls", route: "weld-admin", role: "admin" }
    },
    {
      title: "Reporting insights",
      description: "Dive into dashboards and exports that give security teams weekly confidence.",
      icon: "target",
      action: { label: "Open security dashboard", route: "client-reporting", role: "client" }
    }
  ];

  return featureCards
    .map(card => {
      return `
        <article class="feature-card">
          <div class="feature-card__icon">${renderIcon(card.icon, "sm")}</div>
          <div class="feature-card__body">
            <h3>${card.title}</h3>
            <p>${card.description}</p>
          </div>
          <button type="button" class="feature-card__action" data-route="${card.action.route}" data-role="${card.action.role || ""}">
            ${card.action.label}
          </button>
        </article>
      `;
    })
    .join("");
}

const QUIZZES = [
  {
    id: "phish-flash",
    title: "Phish or Friend?",
    category: "Phishing defence",
    difficulty: "Starter",
    duration: 5,
    questions: 6,
    points: 120,
    format: "Inbox lightning round",
    focus: ["Spot high-risk signals", "Practice one-click reporting", "Coach escalation confidence"],
    bonus: "+20 streak bonus",
    bonusDetail: "Complete this quiz two weeks in a row to unlock a ready-made recognition shout-out.",
    description: "Review real inbox screenshots and choose whether to report, ignore, or escalate in under 20 seconds.",
    sampleQuestion:
      "A supplier email mirrors your branding and asks for credential re-entry. What is the next WeldSecure-approved step?"
  },
  {
    id: "password-gauntlet",
    title: "Password Gauntlet",
    category: "Password hygiene",
    difficulty: "Intermediate",
    duration: 6,
    questions: 8,
    points: 140,
    format: "Drag-and-drop mission",
    focus: ["Strengthen passphrases", "Prioritise MFA usage", "Promote password managers"],
    bonus: "Double points on perfect run",
    bonusDetail: "Score 100% to unlock an extra 140 bonus points for the participant.",
    description: "Launch a timed challenge comparing passphrases, MFA prompts, and vault best practice.",
    sampleQuestion:
      "Which combination gives the strongest defence for a finance approver approving payments on the go?"
  },
  {
    id: "shadow-it-sweep",
    title: "Shadow IT Sweep",
    category: "Shadow IT awareness",
    difficulty: "Intermediate",
    duration: 7,
    questions: 7,
    points: 150,
    format: "Choose-your-path",
    focus: ["Surface risky tools", "Coach safer swaps", "Reinforce reporting habits"],
    bonus: "+30 guidance bonus",
    bonusDetail: "Award additional points when teammates suggest Weld-approved replacements.",
    description: "Guide employees through murky productivity tool choices without slowing their workflow.",
    sampleQuestion:
      "A colleague uploads customer data into an unsanctioned notes app. How do you protect the deal and momentum?"
  },
  {
    id: "remote-first-response",
    title: "Remote-First Response",
    category: "Remote work hygiene",
    difficulty: "Starter",
    duration: 4,
    questions: 5,
    points: 100,
    format: "Tap-to-reveal story",
    focus: ["Secure home setups", "Spot shoulder-surfing risk", "Keep VPN habits healthy"],
    bonus: "+15 fast finish",
    bonusDetail: "Wrap the quiz under four minutes to trigger a real-time kudos animation.",
    description: "Short stories recreate remote mishaps from global deployments with choose-your-fix prompts.",
    sampleQuestion:
      "Your teammate joins a call from a cafe with customer dashboards on screen. What is the fastest mitigation?"
  },
  {
    id: "gen-ai-guardrails",
    title: "GenAI Guardrails Lab",
    category: "AI safety",
    difficulty: "Advanced",
    duration: 8,
    questions: 9,
    points: 180,
    format: "Scenario lab",
    focus: ["Detect sensitive prompts", "Classify training data", "Escalate AI misuse"],
    bonus: "+40 policy boost",
    bonusDetail: "Completing awards an instant badge plus a personalised follow-up module.",
    description: "Experience modern GenAI prompts and decide which ones violate policy before they spread.",
    sampleQuestion:
      "An engineer pastes client logs into an AI chat to debug an issue. What is the WeldSecure-approved response?"
  },
  {
    id: "incident-escalation-sprint",
    title: "Incident Escalation Sprint",
    category: "Incident response",
    difficulty: "Advanced",
    duration: 9,
    questions: 8,
    points: 200,
    format: "Timer-based tabletop",
    focus: ["Draft escalation updates", "Coordinate with SOC", "Protect comms channels"],
    bonus: "+60 crisis mastery",
    bonusDetail: "Finish under the time limit to unlock a post-incident debrief template.",
    description: "Run a tight tabletop simulation that flexes response muscles without needing the SOC team online.",
    sampleQuestion:
      "Finance reports a compromised CFO mailbox. Who do you notify first and which channel keeps legal synced?"
  }
];

function renderAchievementsPage() {
  const totalPoints = ACHIEVEMENTS.reduce((sum, achievement) => sum + achievement.points, 0);
  const categories = Array.from(new Set(ACHIEVEMENTS.map(achievement => achievement.category))).sort((a, b) =>
    a.localeCompare(b)
  );
  const filteredAchievements = state.meta.achievementFilter
    ? ACHIEVEMENTS.filter(achievement => achievement.category === state.meta.achievementFilter)
    : ACHIEVEMENTS;
  const visiblePoints = filteredAchievements.reduce((sum, achievement) => sum + achievement.points, 0);

  const filterButtons = [
    {
      label: "All themes",
      value: "all",
      active: state.meta.achievementFilter === null
    },
    ...categories.map(category => ({
      label: category,
      value: category,
      active: state.meta.achievementFilter === category
    }))
  ]
    .map(
      filter => `
        <button
          type="button"
          class="achievements-filter__item ${filter.active ? "achievements-filter__item--active" : ""}"
          data-filter="${filter.value}"
          aria-pressed="${filter.active ? "true" : "false"}">
          ${filter.label}
        </button>
      `
    )
    .join("");

  const cards = filteredAchievements.map((achievement, index) => {
    const tone = ACHIEVEMENT_TONES[achievement.tone] || ACHIEVEMENT_TONES.violet;
    return `
      <article class="achievement-card" style="--achievement-tone:${tone};">
        <div class="achievement-card__icon">
          ${renderIcon(achievement.icon, "md")}
        </div>
        <div class="achievement-card__body">
          <span class="achievement-card__category">${achievement.category}</span>
          <h3>${achievement.title}</h3>
          <p>${achievement.description}</p>
        </div>
        <div class="achievement-card__footer">
          <span class="achievement-card__points">+${achievement.points} pts</span>
          <span class="achievement-card__index">#${String(index + 1).padStart(2, "0")}</span>
        </div>
      </article>
    `;
  });

  return `
    <div class="page page--achievements">
      ${renderHeader()}
      <div class="page__inner page__inner--single">
        <main class="layout-content" id="main-content">
          <section class="hero-section hero-section--achievements">
            <div class="hero-section__header">
              <div class="hero-section__intro">
                <span class="hero-section__eyebrow">Badge milestones</span>
                <h1 class="hero-section__headline">Celebrate vigilance with 30 WeldSecure badges.</h1>
                <p class="hero-section__lead">
                  Mix and match these badges to show how WeldSecure rewards frontline reporters for keeping the organisation safe.
                </p>
              </div>
              <div class="hero-stats">
                <div class="hero-stats__item">
                  <strong>${ACHIEVEMENTS.length}</strong>
                  <span>Total badges</span>
                </div>
                <div class="hero-stats__item">
                  <strong>${categories.length}</strong>
                  <span>Badge themes</span>
                </div>
                <div class="hero-stats__item">
                  <strong>${filteredAchievements.length}</strong>
                  <span>Visible badges</span>
                </div>
                <div class="hero-stats__item">
                  <strong>${visiblePoints}</strong>
                  <span>Points on offer</span>
                </div>
              </div>
            </div>
            <div class="hero-section__filters achievements-filter" role="toolbar" aria-label="Filter badges by theme">
              ${filterButtons}
            </div>
          </section>
          <div class="achievements-content">
            <section class="achievements-grid">
              ${cards.join("")}
            </section>
          </div>
        </main>
      </div>
    </div>
  `;
}

function renderQuizzesPage() {
  const quizStatus = state.meta.quizStatus || {};
  const categories = Array.from(new Set(QUIZZES.map(quiz => quiz.category))).sort((a, b) => a.localeCompare(b));
  const filteredQuizzes = state.meta.quizFilter ? QUIZZES.filter(quiz => quiz.category === state.meta.quizFilter) : QUIZZES;
  const scheduledCount = filteredQuizzes.filter(quiz => {
    const status = quizStatus[quiz.id];
    return status === "scheduled" || status === "completed";
  }).length;
  const completedCount = filteredQuizzes.filter(quiz => quizStatus[quiz.id] === "completed").length;
  const completedPoints = filteredQuizzes.reduce(
    (sum, quiz) => sum + (quizStatus[quiz.id] === "completed" ? quiz.points : 0),
    0
  );
  const averageDuration = filteredQuizzes.length
    ? Math.round(filteredQuizzes.reduce((sum, quiz) => sum + quiz.duration, 0) / filteredQuizzes.length)
    : 0;

  const filterButtons = [
    {
      label: "All themes",
      value: "all",
      active: state.meta.quizFilter === null
    },
    ...categories.map(category => ({
      label: category,
      value: category,
      active: state.meta.quizFilter === category
    }))
  ]
    .map(
      filter => `
        <button
          type="button"
          class="quizzes-filter__item ${filter.active ? "quizzes-filter__item--active" : ""}"
          data-filter="${filter.value}"
          aria-pressed="${filter.active ? "true" : "false"}">
          ${filter.label}
        </button>
      `
    )
    .join("");

  const cardsMarkup = filteredQuizzes.length
    ? filteredQuizzes
        .map(quiz => {
          const status = quizStatus[quiz.id] || "new";
          const isScheduled = status === "scheduled" || status === "completed";
          const isCompleted = status === "completed";
          const scheduleLabel = isScheduled ? "Scheduled" : "Add to rollout";
          const completeLabel = isCompleted ? "Completed" : `Mark completed (+${quiz.points} pts)`;
          const focusTags = quiz.focus.map(item => `<span class="quiz-card__tag">${item}</span>`).join("");
          return `
            <article class="quiz-card" data-quiz-id="${quiz.id}">
              <header class="quiz-card__header">
                <span class="quiz-card__category">${quiz.category}</span>
                <span class="quiz-card__points">+${quiz.points} pts</span>
              </header>
              <div class="quiz-card__body">
                <h3>${quiz.title}</h3>
                <p>${quiz.description}</p>
                <ul class="quiz-card__meta">
                  <li>
                    <span>Duration</span>
                    <strong>${quiz.duration} min</strong>
                  </li>
                  <li>
                    <span>Questions</span>
                    <strong>${quiz.questions}</strong>
                  </li>
                  <li>
                    <span>Difficulty</span>
                    <strong>${quiz.difficulty}</strong>
                  </li>
                  <li>
                    <span>Format</span>
                    <strong>${quiz.format}</strong>
                  </li>
                </ul>
                <div class="quiz-card__tags">
                  ${focusTags}
                </div>
                <div class="quiz-card__sample">
                  <span>Sample question</span>
                  <p>${quiz.sampleQuestion}</p>
                </div>
              </div>
              <footer class="quiz-card__footer">
                <div class="quiz-card__bonus">
                  <strong>${quiz.bonus}</strong>
                  <span>${quiz.bonusDetail}</span>
                </div>
                <div class="quiz-card__actions">
                  <button
                    type="button"
                    class="quiz-card__action quiz-card__action--schedule"
                    data-action="schedule"
                    ${isScheduled ? 'aria-pressed="true" disabled' : ""}>
                    ${scheduleLabel}
                  </button>
                  <button
                    type="button"
                    class="quiz-card__action quiz-card__action--complete"
                    data-action="complete"
                    ${isCompleted ? 'aria-pressed="true" disabled' : ""}>
                    ${completeLabel}
                  </button>
                </div>
              </footer>
            </article>
          `;
        })
        .join("")
    : `<p class="quests-empty">No quests match this filter yet. Try selecting another theme.</p>`;

  return `
    <div class="page page--quizzes">
      ${renderHeader()}
      <div class="page__inner page__inner--single">
        <main class="layout-content" id="main-content">
          <section class="hero-section hero-section--quizzes">
            <div class="hero-section__header">
              <div class="hero-section__intro">
                <span class="hero-section__eyebrow">Micro-learning quests</span>
                <h1 class="hero-section__headline">Award points for five-minute vigilance quests.</h1>
                <p class="hero-section__lead">
                  Roll these scenario-based quests out to squads and watch points land the moment a player crosses the finish line.
                </p>
              </div>
              <div class="hero-stats">
                <div class="hero-stats__item">
                  <strong>${filteredQuizzes.length}</strong>
                  <span>Quests live</span>
                </div>
                <div class="hero-stats__item">
                  <strong>${scheduledCount}</strong>
                  <span>Assigned to squads</span>
                </div>
                <div class="hero-stats__item">
                  <strong>${completedPoints}</strong>
                  <span>Points awarded</span>
                </div>
                <div class="hero-stats__item">
                  <strong>${averageDuration || 0} min</strong>
                  <span>Avg duration</span>
                </div>
              </div>
            </div>
            <div class="hero-section__filters quizzes-filter" role="toolbar" aria-label="Filter quests by theme">
              ${filterButtons}
            </div>
          </section>
          <div class="quizzes-content">
            <section class="quizzes-grid">
              ${cardsMarkup}
            </section>
          </div>
        </main>
      </div>
    </div>
  `;
}

function renderPointsCard(label, value, tone, icon) {
  const backgrounds = {
    purple: "linear-gradient(135deg, #6f47ff, #3623de)",
    orange: "linear-gradient(135deg, #ff922b, #f97316)",
    slate: "linear-gradient(135deg, #1f2937, #0f172a)"
  };
  return `
    <article class="points-card" style="background:${backgrounds[tone]};">
      ${icon ? `<div class="points-card__icon">${renderIcon(icon, "sm")}</div>` : ""}
      <div class="points-card__body">
        <span class="points-card__label">${label}</span>
        <strong class="points-card__value">${value}</strong>
        <p>Weld points</p>
      </div>
    </article>
  `;
}

function renderCustomer() {
  const customerMessages = state.messages.filter(messageBelongsToCustomer);
  const pendingMessages = customerMessages.filter(msg => msg.status === MessageStatus.PENDING);
  const pendingApprovalPoints = pendingMessages.reduce((sum, msg) => sum + (msg.pointsOnApproval || 0), 0);
  const rewardsHtml = state.rewards
    .map(
      reward => `
      <article class="reward-card" data-reward="${reward.id}">
        <div class="reward-card__artwork" style="background:${reward.image};">
          ${renderIcon(reward.icon || "medal", "lg")}
        </div>
        <div class="reward-card__meta">
          <span>${reward.category}</span>
          <span>${reward.provider}</span>
        </div>
        <h4 class="reward-card__title">${reward.name}</h4>
        <p class="reward-card__desc">${reward.description}</p>
        <div class="reward-card__footer">
          <strong>${reward.pointsCost} pts</strong>
          <span>${reward.remaining} left</span>
        </div>
        <button type="button" class="reward-card__cta button-pill button-pill--primary">Redeem reward</button>
      </article>
    `
    )
    .join("");

  const recentMessages = customerMessages.slice(0, 3);
  const timelineItems = recentMessages
    .map(msg => {
      const reasons = msg.reasons.map(reasonById).filter(Boolean);
      return `
        <li class="timeline__item">
          <div class="timeline__status" data-state="${msg.status}">${msg.status}</div>
          <div class="timeline__details">
            <strong>${msg.subject}</strong>
            <span>${relativeTime(msg.reportedAt)}</span>
            <div class="timeline__chips">
              ${reasons.map(reason => `<span>${reason.description}</span>`).join("")}
            </div>
          </div>
          <div class="timeline__points">
            <span>+${msg.pointsOnMessage}</span>
            ${msg.status === MessageStatus.APPROVED ? `<span>+${msg.pointsOnApproval}</span>` : ""}
          </div>
        </li>
      `;
    })
    .join("");

  const rewardHistory = state.rewardRedemptions.slice(0, 5).map(entry => {
    const reward = rewardById(entry.rewardId);
    return `
      <tr>
        <td>${reward ? reward.name : "Reward"}</td>
        <td>${formatDateTime(entry.redeemedAt)}</td>
        <td>${reward ? reward.pointsCost : 0}</td>
        <td><span class="badge" data-state="${entry.status}">${entry.status}</span></td>
      </tr>
    `;
  });

  return `
    <header>
      <h1>Good day, ${state.customer.name}</h1>
      <p>Your vigilance is fuelling a safer inbox for everyone at Evergreen Capital.</p>
      <button class="button-pill button-pill--primary" id="customer-report-button">Report suspicious email</button>
    </header>
    <section class="points-strip">
      ${renderPointsCard("Available to spend", state.customer.currentPoints, "purple", "medal")}
      ${renderPointsCard("Pending approval", pendingApprovalPoints, "orange", "hourglass")}
      ${renderPointsCard("Already redeemed", state.customer.redeemedPoints, "slate", "gift")}
    </section>
    <section>
      <div class="section-header">
        <h2>Your rewards</h2>
        <p>Select a reward to demonstrate the instant redemption flow.</p>
      </div>
      <div class="reward-grid">${rewardsHtml}</div>
    </section>
    <section class="grid-two">
      <article class="timeline">
        <div>
          <h3>Recent reports</h3>
          <p>Fresh from the Reporter journey.</p>
        </div>
        <ul class="timeline__list">${timelineItems}</ul>
      </article>
      <article class="card">
        <div>
          <h3>Reward history</h3>
          <p>Use this to show fulfilment states.</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Reward</th>
              <th>Redeemed</th>
              <th>Points</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>${rewardHistory.join("")}</tbody>
        </table>
      </article>
    </section>
  `;
}

function computeReportsByDay() {
  const now = new Date();
  const result = [];
  for (let i = 6; i >= 0; i -= 1) {
    const day = new Date(now);
    day.setDate(day.getDate() - i);
    const dayKey = day.toISOString().slice(0, 10);
    const count = state.messages.filter(msg => msg.reporterEmail.endsWith("@example.com") && msg.reportedAt.slice(0, 10) === dayKey).length;
    result.push({
      label: day.toLocaleDateString(undefined, { weekday: "short" }),
      value: count,
      isToday: i === 0
    });
  }
  return result;
}

function renderMetricCard(label, value, trend, tone, icon) {
  const palette = {
    indigo: { bg: "linear-gradient(135deg, rgba(99, 102, 241, 0.18), rgba(129, 140, 248, 0.24))", color: "#312e81" },
    emerald: { bg: "linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(34, 197, 94, 0.26))", color: "#065f46" },
    amber: { bg: "linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(250, 204, 21, 0.26))", color: "#92400e" },
    slate: { bg: "linear-gradient(135deg, rgba(148, 163, 184, 0.12), rgba(100, 116, 139, 0.18))", color: "#1e293b" }
  };
  const paletteEntry = palette[tone] || palette.indigo;

  return `
    <article class="metric-card" style="background:${paletteEntry.bg}; --tone-color:${paletteEntry.color};">
      ${icon ? `<div class="metric-card__icon">${renderIcon(icon, "xs")}</div>` : ""}
      <div class="metric-card__body">
        <span class="metric-card__label">${label}</span>
        <strong class="metric-card__value">${value}</strong>
        ${
          trend
            ? `<div class="metric-card__trend" data-direction="${trend.direction}">
                <span>${trend.direction === "up" ? "&uarr;" : "&darr;"} ${trend.value}</span>
                <small>${trend.caption}</small>
              </div>`
            : ""
        }
      </div>
    </article>
  `;
}

function renderClientDashboard() {
  const weeklyMessages = state.messages.filter(msg => msg.reporterEmail.endsWith("@example.com")).slice(0, 100);
  const approvals = weeklyMessages.filter(msg => msg.status === MessageStatus.APPROVED).length;
  const approvalRate = weeklyMessages.length ? Math.round((approvals / weeklyMessages.length) * 100) : 0;
  const topReasons = {};
  weeklyMessages.forEach(msg => {
    msg.reasons.forEach(reasonId => {
      const reason = reasonById(reasonId);
      if (!reason) return;
      topReasons[reason.description] = (topReasons[reason.description] || 0) + 1;
    });
  });
  const sortedReasons = Object.entries(topReasons)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const reportersMap = {};
  weeklyMessages.forEach(msg => {
    if (!reportersMap[msg.reporterName]) {
      reportersMap[msg.reporterName] = { count: 0, approved: 0, lastReport: msg.reportedAt };
    }
    reportersMap[msg.reporterName].count += 1;
    reportersMap[msg.reporterName].lastReport = msg.reportedAt;
    if (msg.status === MessageStatus.APPROVED) {
      reportersMap[msg.reporterName].approved += 1;
    }
  });

  const reporters = Object.entries(reportersMap).map(([name, stats]) => ({
    name,
    ...stats,
    approvalRate: stats.count ? Math.round((stats.approved / stats.count) * 100) : 0
  }));

  const reportsByDay = computeReportsByDay();

  return `
    <header>
      <h1>Organisation dashboard – security pulse</h1>
      <p>Track how your team spots threats, and spotlight the behaviour change security leaders care about.</p>
      <span class="chip chip--client">Updated ${relativeTime(weeklyMessages[0]?.reportedAt || new Date().toISOString())}</span>
    </header>
    <section class="metrics-grid">
      ${renderMetricCard("Reports this week", weeklyMessages.length.toString(), { direction: "up", value: "12%", caption: "vs last week" }, "indigo", "target")}
      ${renderMetricCard("Approval rate", `${approvalRate}%`, { direction: "up", value: "4 pts", caption: "month on month" }, "emerald", "trophy")}
      ${renderMetricCard("Median review time", "2h 14m", { direction: "down", value: "18 mins", caption: "faster than target" }, "amber", "hourglass")}
      ${renderMetricCard("Active champions", "38", { direction: "up", value: "5 new", caption: "this month" }, "slate", "diamond")}
    </section>
    <section class="grid-two">
      <article class="panel">
        <div>
          <h2>Report momentum</h2>
          <p>Showcase consistent employee engagement by day of week.</p>
        </div>
        <div class="bar-chart">
          ${reportsByDay
            .map(
              bar => `
                <div class="bar-chart__item">
                  <div class="bar-chart__bar" data-highlight="${bar.isToday}" style="height:${bar.value === 0 ? 8 : 30 + bar.value * 22}px;"></div>
                  <span class="bar-chart__label">${bar.label}</span>
                  <span class="bar-chart__value">${bar.value}</span>
                </div>
              `
            )
            .join("")}
        </div>
      </article>
      <article class="panel">
        <div>
          <h2>Top threat signals</h2>
          <p>Stakeholders appreciate understanding why people reported messages.</p>
        </div>
        <ul class="timeline__list">
          ${sortedReasons
            .map(
              reason => `
                <li class="timeline__item" style="grid-template-columns: 1fr auto;">
                  <div>${reason.label}</div>
                  <strong>${reason.value}</strong>
                </li>
              `
            )
            .join("")}
        </ul>
      </article>
    </section>
    <article class="panel">
      <div>
        <h2>Team champions</h2>
        <p>Use this leaderboard to highlight culture change.</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>Team member</th>
            <th>Reports</th>
            <th>Approved</th>
            <th>Approval rate</th>
            <th>Last activity</th>
          </tr>
        </thead>
        <tbody>
          ${reporters
            .map(
              reporter => `
                <tr>
                  <td>${reporter.name}</td>
                  <td>${reporter.count}</td>
                  <td>${reporter.approved}</td>
                  <td>${reporter.approvalRate}%</td>
                  <td>${relativeTime(reporter.lastReport)}</td>
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>
    </article>
  `;
}

function renderClientReporting() {
  const tableRows = state.messages.slice(0, 20).map(
    msg => `
      <tr>
        <td>${formatDateTime(msg.reportedAt)}</td>
        <td>
          <strong>${msg.subject}</strong>
          <div class="timeline__chips"><span>${msg.messageId}</span></div>
        </td>
        <td>
          ${msg.reporterName}
          <div class="timeline__chips"><span>${msg.reporterEmail}</span></div>
        </td>
        <td>
          <div class="timeline__chips">
            ${msg.reasons
              .map(reasonById)
              .filter(Boolean)
              .map(reason => `<span>${reason.description}</span>`)
              .join("")}
          </div>
        </td>
        <td><span class="badge" data-state="${msg.status}">${msg.status}</span></td>
        <td>
          <div class="table-actions">
            <button data-action="approve" data-message="${msg.id}">Approve</button>
            <button data-action="reject" data-message="${msg.id}">Reject</button>
          </div>
        </td>
      </tr>
    `
  );

  return `
    <header>
      <h1>Security team dashboard</h1>
      <p>Filter every reported email, approve them live, and download a CSV ready for compliance or SOC reviews.</p>
      <button class="button-pill button-pill--primary" id="download-csv-button">Download CSV</button>
    </header>
    <article class="panel">
      <table>
        <thead>
          <tr>
            <th>Reported</th>
            <th>Subject</th>
            <th>Reporter</th>
            <th>Reasons</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>${tableRows.join("")}</tbody>
      </table>
    </article>
    <div class="note">
      <strong>Demo guidance</strong>
      <p>
        Remind teams that approvals feed the customer rewards experience in real time--best seen by switching tabs after approving a message.
      </p>
    </div>
  `;
}

function renderWeldAdmin() {
  const clientCards = state.clients
    .map(
      client => `
        <article class="client-card">
          <div>
            <span class="landing__addin-eyebrow">Client</span>
            <h2>${client.name}</h2>
            <p>Org ID: ${client.organizationId}</p>
          </div>
          <div class="client-card__stats">
            <div>
              <label>Health score</label>
              <span>${client.healthScore}%</span>
            </div>
            <div>
              <label>Open cases</label>
              <span>${client.openCases}</span>
            </div>
            <div>
              <label>Active users</label>
              <span>${client.activeUsers}</span>
            </div>
          </div>
          <footer>
            <div>
              <label>Last reported email</label>
              <strong>${formatDateTime(client.lastReportAt)}</strong>
              <span class="landing__addin-eyebrow">${relativeTime(client.lastReportAt)}</span>
            </div>
            <div class="table-actions">
              <button data-client="${client.id}" data-action="view-journey">View journey</button>
              <button data-client="${client.id}" data-action="share-insights">Share insights</button>
            </div>
          </footer>
        </article>
      `
    )
    .join("");

  return `
    <header>
      <h1>WeldSecure - multi-tenant view</h1>
      <p>Use this vantage point to share how Weld scales across clients while spotting where to lean in.</p>
      <button class="button-pill button-pill--primary" id="trigger-playbook">Trigger playbook</button>
    </header>
    <section class="metrics-grid">
      ${renderMetricCard("Active clients", state.clients.length.toString(), { direction: "up", value: "2 onboarded", caption: "last month" }, "indigo", "shield")}
      ${renderMetricCard(
        "Average health",
        `${Math.round(state.clients.reduce((acc, client) => acc + client.healthScore, 0) / state.clients.length)}%`,
        { direction: "up", value: "+6 pts", caption: "quarter to date" },
        "emerald",
        "heart"
      )}
      ${renderMetricCard(
        "Open cases",
        state.clients.reduce((acc, client) => acc + client.openCases, 0).toString(),
        { direction: "down", value: "-3", caption: "since Monday" },
        "amber",
        "hourglass"
      )}
    </section>
    <section class="clients-grid">${clientCards}</section>
    <section class="playbook-card">
      <div>
        <strong>Multi-tenant narrative</strong>
        <p>Leadership wants confidence Weld scales easily. Use these cards to show targeted interventions based on engagement health.</p>
      </div>
      <div class="playbook-card__set">
        <div class="playbook">
          <h3>Evergreen Capital</h3>
          <p>Run "Celebrate Champions" sequence - approvals consistently above 80%.</p>
          <span>Scheduled: Tomorrow 09:00</span>
        </div>
        <div class="playbook">
          <h3>Cobalt Manufacturing</h3>
          <p>Launch "Win Back Vigilance" workshop - health dipped below 75%.</p>
          <span>Owner: Customer Success</span>
        </div>
      </div>
    </section>
  `;
}

function renderAddIn() {
  const screen = state.meta.addinScreen;
  const pendingApprovalPoints = state.messages
    .filter(messageBelongsToCustomer)
    .filter(msg => msg.status === MessageStatus.PENDING)
    .reduce((sum, msg) => sum + (msg.pointsOnApproval || 0), 0);
  const statsStrip = `
    <div class="addin-stats">
      <article class="addin-stat">
        <div class="addin-stat__item">
          ${renderIcon("medal", "xs")}
          <div>
            <span>Available</span>
            <strong>${state.customer.currentPoints}</strong>
          </div>
        </div>
        <div class="addin-stat__divider"></div>
        <div class="addin-stat__item">
          ${renderIcon("hourglass", "xs")}
          <div>
            <span>Pending</span>
            <strong>${pendingApprovalPoints}</strong>
          </div>
        </div>
      </article>
    </div>
  `;

  const reportForm = `
    <div class="addin-body">
      <div class="addin-field">
        <span>Why are you reporting this?</span>
        <div class="addin-checkbox-list">
          ${state.reportReasons
            .map(
              reason => `
                <label>
                  <input type="checkbox" value="${reason.id}" />
                  <span>${reason.description}</span>
                </label>
              `
            )
            .join("")}
        </div>
      </div>
      <label class="addin-field">
        Anything else we should know?
        <textarea rows="3" id="addin-notes" placeholder="Optional context for your security reviewers."></textarea>
      </label>
      <button class="addin-primary" id="addin-submit">Report</button>
    </div>
  `;

  const lastPoints = state.meta.lastReportPoints ?? 20;
  const auroraLayers = [
    { angle: 18, hue: 258, delay: "0s" },
    { angle: -22, hue: 200, delay: "0.08s" },
    { angle: 36, hue: 42, delay: "0.16s" }
  ];
  const shimmerLayers = [
    { delay: "0.4s" },
    { delay: "0.6s" },
    { delay: "0.8s" }
  ];
  const auroraMarkup = auroraLayers
    .map(
      layer => `
        <span class="points-aurora__ribbon" style="--aurora-angle:${layer.angle}deg;--aurora-hue:${layer.hue};--aurora-delay:${layer.delay};"></span>
      `
    )
    .join("");
  const shimmerMarkup = shimmerLayers
    .map(layer => `<span class="points-shimmer" style="--shimmer-delay:${layer.delay};"></span>`)
    .join("");
  const successView = `
    <div class="addin-success">
      <div class="points-celebration points-celebration--aurora">
        <div class="points-celebration__halo"></div>
        <div class="points-aurora" aria-hidden="true">
          ${auroraMarkup}
        </div>
        <div class="points-celebration__bubble">
          <span class="points-celebration__label">Great catch</span>
          <div class="points-celebration__points">
            ${renderIcon("medal", "xs")}
            <strong class="points-celebration__points-value">+${lastPoints} pts</strong>
          </div>
        </div>
        <div class="points-shimmer-group" aria-hidden="true">
          ${shimmerMarkup}
        </div>
        <div class="points-celebration__confetti">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
      <p>The security team will review your report shortly. Your points are available immediately.</p>
      <div class="addin-actions">
        <button class="addin-cta addin-cta--primary" id="addin-view-rewards">
          ${renderIcon("gift", "xs")}
          <span>Rewards</span>
        </button>
      </div>
    </div>
  `;

  return `
    <div class="addin-page">
      <div class="addin-shell">
        <header class="addin-header">
          <div class="addin-logo">W</div>
          <div class="addin-header__body">
            <h1>Report with Weld</h1>
            <p>Flag anything suspicious, earn recognition, and protect your team.</p>
          </div>
          <div class="addin-status">
            <span>Signed in</span>
            <strong>${state.customer.name}</strong>
          </div>
        </header>
        ${statsStrip}
        ${screen === "report" ? reportForm : successView}
      </div>
    </div>
  `;
}

function renderHeader() {
  if (state.meta.route === "landing") {
    return "";
  }
  const role = state.meta.role;
  const navMarkup = renderGlobalNav(state.meta.route);
  return `
    ${navMarkup}
    <header class="header">
      <button class="brand" id="brand-button">
        <span class="brand__glyph">W</span>
        <span>WeldSecure</span>
      </button>
      <div class="header__actions">
        ${
          role
            ? `<span class="chip ${ROLE_LABELS[role].chip}"><span class="chip__dot"></span>${ROLE_LABELS[role].label}</span>`
            : ""
        }
      </div>
    </header>
  `;
}

function renderContent() {
  switch (state.meta.route) {
    case "customer":
      return renderCustomer();
    case "client-dashboard":
      return renderClientDashboard();
    case "client-reporting":
      return renderClientReporting();
    case "weld-admin":
      return renderWeldAdmin();
    default:
      return "";
  }
}

function attachAchievementsEvents(container) {
  const filterContainer = container.querySelector(".achievements-filter");
  if (filterContainer) {
    filterContainer.addEventListener("click", event => {
      const button = event.target.closest("[data-filter]");
      if (!button) return;
      const value = button.getAttribute("data-filter");
      const nextFilter = value === "all" ? null : value;
      if (state.meta.achievementFilter === nextFilter) return;
      state.meta.achievementFilter = nextFilter;
      persist();
      renderApp();
    });
  }
}

function attachQuizzesEvents(container) {
  const filterContainer = container.querySelector(".quizzes-filter");
  if (filterContainer) {
    filterContainer.addEventListener("click", event => {
      const button = event.target.closest("[data-filter]");
      if (!button) return;
      const value = button.getAttribute("data-filter");
      const nextFilter = value === "all" ? null : value;
      if (state.meta.quizFilter === nextFilter) return;
      state.meta.quizFilter = nextFilter;
      persist();
      renderApp();
    });
  }

  container.addEventListener("click", event => {
    const actionButton = event.target.closest(".quiz-card__action");
    if (!actionButton || actionButton.disabled) return;
    const action = actionButton.getAttribute("data-action");
    const card = actionButton.closest(".quiz-card");
    if (!card) return;
    const quizId = card.getAttribute("data-quiz-id");
    if (!quizId) return;
    const currentStatus = state.meta.quizStatus || {};

    if (action === "schedule") {
      if (currentStatus[quizId] === "scheduled" || currentStatus[quizId] === "completed") return;
      state.meta.quizStatus = { ...currentStatus, [quizId]: "scheduled" };
      persist();
      renderApp();
      return;
    }

    if (action === "complete") {
      if (currentStatus[quizId] === "completed") return;
      const quiz = quizById(quizId);
      state.meta.quizStatus = { ...currentStatus, [quizId]: "completed" };
      if (quiz) {
        state.customer.currentPoints += quiz.points;
      }
      persist();
      renderApp();
      if (quiz) {
        openDialog({
          title: "Points awarded",
          description: `+${quiz.points} points credited for finishing "${quiz.title}".`,
          confirmLabel: "Close"
        });
      }
    }
  });
}

function attachGlobalNav(container) {
  const groups = Array.from(container.querySelectorAll(".global-nav__group"));

  const closeGroups = () => {
    groups.forEach(group => {
      group.classList.remove("global-nav__group--open");
      const triggerEl = group.querySelector(".global-nav__trigger");
      if (triggerEl) triggerEl.setAttribute("aria-expanded", "false");
    });
  };

  groups.forEach(group => {
    const trigger = group.querySelector(".global-nav__trigger");
    if (!trigger) return;
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

    trigger.addEventListener("click", toggleGroup);
    trigger.addEventListener("keydown", event => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      toggleGroup(event);
    });
  });

  container.querySelectorAll(".global-nav [data-route]").forEach(button => {
    button.addEventListener("click", event => {
      event.stopPropagation();
      const route = button.getAttribute("data-route");
      const role = button.getAttribute("data-role");

      closeGroups();

      if (route === "addin") {
        state.meta.addinScreen = "report";
      }

      if (role) {
        setRole(role, route || role);
      } else if (route) {
        navigate(route);
      }
    });
  });

  const journeyButton = container.querySelector("#global-journey");
  if (journeyButton) {
    journeyButton.addEventListener("click", event => {
      event.stopPropagation();
      closeGroups();
      navigate("landing");
    });
  }

  container.addEventListener("focusout", event => {
    if (!event.relatedTarget || !container.contains(event.relatedTarget)) {
      closeGroups();
    }
  });

  if (!window.__weldNavDismiss__) {
    document.addEventListener("click", () => {
      document.querySelectorAll(".global-nav__group").forEach(group => {
        group.classList.remove("global-nav__group--open");
        const triggerEl = group.querySelector(".global-nav__trigger");
        if (triggerEl) triggerEl.setAttribute("aria-expanded", "false");
      });
    });
    window.__weldNavDismiss__ = true;
  }

  if (!window.__weldNavEscape__) {
    document.addEventListener("keydown", event => {
      if (event.key !== "Escape") return;
      document.querySelectorAll(".global-nav__group").forEach(group => {
        group.classList.remove("global-nav__group--open");
        const triggerEl = group.querySelector(".global-nav__trigger");
        if (triggerEl) triggerEl.setAttribute("aria-expanded", "false");
      });
    });
    window.__weldNavEscape__ = true;
  }
}

function attachLandingEvents(container) {
  const handleRouteClick = element => {
    const route = element.getAttribute("data-route");
    const role = element.getAttribute("data-role");
    if (!route) return;
    if (route === "addin") {
      state.meta.addinScreen = "report";
    }
    if (role) {
      setRole(role, route);
    } else {
      navigate(route);
    }
  };

  container.querySelectorAll(".journey-card[data-route]").forEach(btn => {
    btn.addEventListener("click", () => handleRouteClick(btn));
  });

  container.querySelectorAll(".feature-card__action[data-route]").forEach(btn => {
    btn.addEventListener("click", () => handleRouteClick(btn));
  });

  const resetBtn = container.querySelector("#landing-reset");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      openDialog({
        title: "Reset demo data?",
        description: "This will return every journey to the default product narrative.",
        confirmLabel: "Reset now",
        cancelLabel: "Cancel",
        tone: "critical",
        onConfirm: close => {
          resetDemo();
          close();
        }
      });
    });
  }
}

function attachHeaderEvents(container) {
  const brandBtn = container.querySelector("#brand-button");
  if (brandBtn) {
    brandBtn.addEventListener("click", () => navigate("landing"));
  }
}

function attachCustomerEvents(container) {
  const reportBtn = container.querySelector("#customer-report-button");
  if (reportBtn) {
    reportBtn.addEventListener("click", () => {
      state.meta.addinScreen = "report";
      navigate("addin");
    });
  }
  container.querySelectorAll(".reward-card__cta").forEach(button => {
    button.addEventListener("click", () => {
      const card = button.closest(".reward-card");
      if (!card) return;
      const rewardId = Number(card.getAttribute("data-reward"));
      const reward = rewardById(rewardId);
      if (!reward) return;

      openDialog({
        title: "Redeem this reward?",
        description: `This will use ${reward.pointsCost} of your available points.`,
        content: `<strong>${reward.name}</strong><p>${reward.description}</p><span>${reward.provider}</span>`,
        confirmLabel: "Confirm redemption",
        cancelLabel: "Cancel",
        onConfirm: close => {
          const result = redeemReward(rewardId);
          close();
          if (result.success) {
            openDialog({
              title: "Reward queued for fulfilment",
              description: `${reward.name} has been added to your rewards queue.`,
              confirmLabel: "Back to rewards",
              onConfirm: closeDialog
            });
          } else {
            openDialog({
              title: "Unable to redeem",
              description: result.reason || "Please try again.",
              confirmLabel: "Close"
            });
          }
        }
      });
    });
  });
}

function attachReportingEvents(container) {
  const csvBtn = container.querySelector("#download-csv-button");
  if (csvBtn) {
    csvBtn.addEventListener("click", () => {
      openDialog({
        title: "CSV export ready",
        description: "In the real product this downloads a CSV. For the demo, use this cue to talk through the audit trail.",
        confirmLabel: "Got it"
      });
    });
  }
  container.querySelectorAll(".table-actions button").forEach(button => {
    button.addEventListener("click", () => {
      const action = button.getAttribute("data-action");
      const messageId = Number(button.getAttribute("data-message"));
      updateMessageStatus(messageId, action === "approve" ? MessageStatus.APPROVED : MessageStatus.REJECTED);
    });
  });
}

function attachAdminEvents(container) {
  const triggerBtn = container.querySelector("#trigger-playbook");
  if (triggerBtn) {
    triggerBtn.addEventListener("click", () => {
      openDialog({
        title: "Playbook scheduled",
        description: "Use this cue to explain how Weld orchestrates interventions across tenants.",
        confirmLabel: "Nice"
      });
    });
  }

  container.querySelectorAll("[data-action='view-journey'], [data-action='share-insights']").forEach(button => {
    button.addEventListener("click", () => {
      const clientId = Number(button.getAttribute("data-client"));
      const client = state.clients.find(c => c.id === clientId);
      if (!client) return;
      if (button.getAttribute("data-action") === "view-journey") {
        openDialog({
          title: `Switch to ${client.name}?`,
          description: "For the demo, remind stakeholders each client gets a dedicated journey view with custom insights.",
          confirmLabel: "Return",
          onConfirm: closeDialog
        });
      } else {
        openDialog({
          title: "Insights shared",
          description: `Customer Success receives a packaged summary for ${client.name}.`,
          confirmLabel: "Great"
        });
      }
    });
  });
}

function attachAddInEvents(container) {
  if (state.meta.addinScreen === "report") {
    const submitBtn = container.querySelector("#addin-submit");
    if (submitBtn) {
      submitBtn.addEventListener("click", () => {
        const notesInput = container.querySelector("#addin-notes");
        const reasonCheckboxes = Array.from(container.querySelectorAll('.addin-checkbox-list input[type="checkbox"]'))
          .filter(input => input.checked)
          .map(input => Number(input.value));

        if (reasonCheckboxes.length === 0) {
          openDialog({
            title: "Select at least one reason",
            description: "This helps reviewers triage the report quickly.",
            confirmLabel: "Close"
          });
          return;
        }

        const primaryReason = reasonById(reasonCheckboxes[0]);
        const generatedSubject = primaryReason ? `Suspicious email: ${primaryReason.description}` : "Suspicious email reported";
        const generatedMessageId =
          "MSG-" + Date.now() + "-" + Math.floor(Math.random() * 10000).toString().padStart(4, "0");

        reportMessage({
          subject: generatedSubject,
          messageId: generatedMessageId,
          reasons: reasonCheckboxes,
          reporterName: state.customer.name,
          reporterEmail: state.customer.email,
          notes: notesInput ? notesInput.value.trim() : ""
        });
      });
    }
  } else {
    if (state.meta.addinScreen === "success") {
      setupCelebrationReplay(container);
    }
    const viewRewards = container.querySelector("#addin-view-rewards");
    if (viewRewards) {
      viewRewards.addEventListener("click", () => {
        setRole("customer", "customer");
      });
    }
  }
}

function ensureRouteSafety() {
  const routeInfo = ROUTES[state.meta.route];
  if (!routeInfo) {
    state.meta.route = "landing";
    state.meta.role = null;
  } else if (routeInfo.requiresRole && state.meta.role !== routeInfo.requiresRole) {
    state.meta.route = "landing";
    state.meta.role = null;
  }
}

function renderApp() {
  ensureRouteSafety();
  const app = document.getElementById("app");
  const route = state.meta.route;

  if (route === "landing") {
    app.innerHTML = `
      <div class="page page--landing">
        <div class="page__inner page__inner--single">
          <main class="layout-content" id="main-content">${renderLanding()}</main>
        </div>
      </div>
    `;
    attachLandingEvents(app);
    return;
  }

  if (route === "achievements") {
    app.innerHTML = renderAchievementsPage();
    attachHeaderEvents(app);
    attachGlobalNav(app);
    attachAchievementsEvents(app);
    return;
  }

  if (route === "quizzes") {
    app.innerHTML = renderQuizzesPage();
    attachHeaderEvents(app);
    attachGlobalNav(app);
    attachQuizzesEvents(app);
    return;
  }

  if (route === "addin") {
    app.innerHTML = `
      <div class="page page--addin">
        ${renderHeader()}
        <div class="page__inner page__inner--single">
          <main class="layout-content layout-content--flush" id="main-content">${renderAddIn()}</main>
        </div>
    </div>
  `;

  attachHeaderEvents(app);
  attachGlobalNav(app);
  const mainContent = app.querySelector("#main-content");
  if (mainContent) attachAddInEvents(mainContent);
  return;
}

  app.innerHTML = `
    <div class="page">
      ${renderHeader()}
      <div class="page__inner">
        <main class="layout-content" id="main-content">${renderContent()}</main>
      </div>
    </div>
  `;

  attachHeaderEvents(app);
  attachGlobalNav(app);

  const mainContent = app.querySelector("#main-content");
  if (!mainContent) return;
  if (route === "customer") attachCustomerEvents(mainContent);
  if (route === "client-reporting") attachReportingEvents(mainContent);
  if (route === "weld-admin") attachAdminEvents(mainContent);
}

window.addEventListener("DOMContentLoaded", () => {
  renderApp();
});

window.addEventListener("hashchange", () => {
  const hashRoute = window.location.hash.replace("#", "");
  if (hashRoute && ROUTES[hashRoute]) {
    if (ROUTES[hashRoute].requiresRole) {
      state.meta.role = ROUTES[hashRoute].requiresRole;
    }
    state.meta.route = hashRoute;
    persist();
    renderApp();
  }
});




