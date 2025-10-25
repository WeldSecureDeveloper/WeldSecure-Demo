const STORAGE_KEY = "weldStaticDemoStateV1";

const ROLE_LABELS = {
  customer: { label: "Reporter", chip: "chip--customer" },
  client: { label: "Organisation", chip: "chip--client" },
  admin: { label: "WeldSecure", chip: "chip--admin" }
};

const ROUTES = {
  landing: { requiresRole: false },
  customer: { requiresRole: "customer" },
  "customer-reports": { requiresRole: "customer" },
  "customer-redemptions": { requiresRole: "customer" },
  "client-dashboard": { requiresRole: "client" },
  "client-reporting": { requiresRole: "client" },
  "client-rewards": { requiresRole: "client" },
  "client-quests": { requiresRole: "client" },
  "weld-admin": { requiresRole: "admin" },
  "client-badges": { requiresRole: "client" },
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
      { label: "Hub", route: "customer", role: "customer" }
    ]
  },
  {
    label: "Organisation",
    items: [
      { label: "Organisation Dashboard", route: "client-dashboard", role: "client" },
      { label: "Security Team Dashboard", route: "client-reporting", role: "client" },
      { label: "Badge Catalogue", route: "client-badges", role: "client" },
      { label: "Quest Catalogue", route: "client-quests", role: "client" },
      { label: "Rewards Catalogue", route: "client-rewards", role: "client" }
    ]
  },
  {
    label: "WeldSecure",
    items: [{ label: "Weld Admin", route: "weld-admin", role: "admin" }]
  }
];

const QUEST_DIFFICULTY_ORDER = ["starter", "intermediate", "advanced"];

function generateId(prefix = "id") {
  const idPrefix = typeof prefix === "string" && prefix.length > 0 ? `${prefix}-` : "";
  const cryptoSource = typeof globalThis !== "undefined" ? globalThis.crypto : null;
  if (cryptoSource && typeof cryptoSource.randomUUID === "function") {
    return `${idPrefix}${cryptoSource.randomUUID()}`;
  }
  const now = Date.now().toString(36);
  const random = Math.floor(Math.random() * 1e9)
    .toString(36)
    .padStart(6, "0");
  return `${idPrefix}${now}-${random}`;
}

function normalizeId(value, prefix) {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (Number.isFinite(value)) {
    return String(value);
  }
  const stringValue = typeof value.toString === "function" ? value.toString() : "";
  if (stringValue && stringValue !== "[object Object]") {
    return stringValue;
  }
  return generateId(prefix);
}

function questDifficultyRank(value) {
  if (typeof value !== "string") return QUEST_DIFFICULTY_ORDER.length;
  const normalized = value.trim().toLowerCase();
  const index = QUEST_DIFFICULTY_ORDER.indexOf(normalized);
  return index === -1 ? QUEST_DIFFICULTY_ORDER.length : index;
}

function compareQuestsByDifficulty(a, b) {
  const rankDiff = questDifficultyRank(a && a.difficulty) - questDifficultyRank(b && b.difficulty);
  if (rankDiff !== 0) return rankDiff;
  const aTitle = a && typeof a.title === "string" ? a.title : "";
  const bTitle = b && typeof b.title === "string" ? b.title : "";
  return aTitle.localeCompare(bTitle, undefined, { sensitivity: "base" });
}

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

const METRIC_TONES = {
  indigo: { bg: "linear-gradient(135deg, rgba(99, 102, 241, 0.16), rgba(129, 140, 248, 0.28))", color: "#312e81" },
  emerald: { bg: "linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(52, 211, 153, 0.28))", color: "#065f46" },
  amber: { bg: "linear-gradient(135deg, rgba(250, 204, 21, 0.22), rgba(253, 224, 71, 0.32))", color: "#92400e" },
  fuchsia: { bg: "linear-gradient(135deg, rgba(236, 72, 153, 0.18), rgba(244, 114, 182, 0.28))", color: "#9d174d" },
  slate: { bg: "linear-gradient(135deg, rgba(148, 163, 184, 0.18), rgba(226, 232, 240, 0.26))", color: "#1f2937" }
};

function renderMetricCard(label, value, trend, toneKey = "indigo", icon = "medal") {
  const tone = METRIC_TONES[toneKey] || METRIC_TONES.indigo;
  const trendDirection =
    trend && (trend.direction === "up" || trend.direction === "down") ? trend.direction : null;
  const trendValue = trend && trend.value ? escapeHtml(String(trend.value)) : null;
  const trendCaption = trend && trend.caption ? escapeHtml(String(trend.caption)) : null;
  const trendMarkup = trendValue
    ? `<div class="metric-card__trend"${trendDirection ? ` data-direction="${trendDirection}"` : ""}>
        <span>${trendValue}</span>
        ${trendCaption ? `<small>${trendCaption}</small>` : ""}
      </div>`
    : "";

  return `
    <article class="metric-card" style="--tone-bg:${tone.bg};--tone-color:${tone.color};">
      <span class="metric-card__icon">${renderIcon(icon, "md")}</span>
      <div class="metric-card__body">
        <span class="metric-card__label">${escapeHtml(String(label))}</span>
        <strong class="metric-card__value">${escapeHtml(String(value))}</strong>
        ${trendMarkup}
      </div>
    </article>
  `;
}

function escapeHtml(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const BADGE_TONES = {
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

const BADGE_ICON_BACKDROPS = {
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
};

const POINTS_CARD_ICONS = {
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
};


const BADGES = [
  {
    id: "welcome-wave",
    title: "Welcome Wave",
    description: "Log into the WeldSecure hub within your first 24 hours.",
    category: "Onboarding",
    points: 20,
    difficulty: "Starter",
    icon: "spark",
    tone: "violet"
  },
  {
    id: "hub-hopper",
    title: "Hub Hopper",
    description: "Visit every navigation section during your first week.",
    category: "Onboarding",
    points: 30,
    difficulty: "Starter",
    icon: "network",
    tone: "aqua"
  },
  {
    id: "profile-polisher",
    title: "Profile Polisher",
    description: "Complete your profile and set your security preferences.",
    category: "Onboarding",
    points: 25,
    difficulty: "Starter",
    icon: "badge",
    tone: "slate"
  },
  {
    id: "orientation-ace",
    title: "Orientation Ace",
    description: "Watch the orientation walkthrough and pass the recap quiz.",
    category: "Onboarding",
    points: 30,
    difficulty: "Starter",
    icon: "lightbulb",
    tone: "amber"
  },
  {
    id: "tour-trailblazer",
    title: "Tour Trailblazer",
    description: "Finish the interactive product tour without skipping a stop.",
    category: "Onboarding",
    points: 35,
    difficulty: "Rising",
    icon: "compass",
    tone: "aqua"
  },
  {
    id: "kickoff-kudos",
    title: "Kickoff Kudos",
    description: "Send your first kudos or recognition note from the hub.",
    category: "Onboarding",
    points: 30,
    difficulty: "Rising",
    icon: "heart",
    tone: "coral"
  },
  {
    id: "launch-checklist",
    title: "Launch Checklist",
    description: "Complete every task on the onboarding checklist.",
    category: "Onboarding",
    points: 40,
    difficulty: "Rising",
    icon: "clipboard",
    tone: "emerald"
  },
  {
    id: "alert-acknowledged",
    title: "Alert Acknowledged",
    description: "Enable notifications across the channels your team uses.",
    category: "Onboarding",
    points: 25,
    difficulty: "Rising",
    icon: "whistle",
    tone: "cobalt"
  },
  {
    id: "mission-briefing",
    title: "Mission Briefing",
    description: "Complete your first interactive training mission.",
    category: "Onboarding",
    points: 35,
    difficulty: "Rising",
    icon: "book",
    tone: "midnight"
  },
  {
    id: "hub-habit",
    title: "Hub Habit",
    description: "Log in three consecutive days during onboarding.",
    category: "Onboarding",
    points: 40,
    difficulty: "Skilled",
    icon: "laurel",
    tone: "emerald"
  },
  {
    id: "toolkit-tour",
    title: "Toolkit Tour",
    description: "Install the WeldSecure add-ins and connect your devices.",
    category: "Onboarding",
    points: 40,
    difficulty: "Skilled",
    icon: "gear",
    tone: "slate"
  },
  {
    id: "first-catch",
    title: "First Catch",
    description: "Report your very first suspicious email through WeldSecure.",
    category: "Onboarding",
    points: 40,
    difficulty: "Starter",
    icon: "medal",
    tone: "violet"
  },
  {
    id: "launch-pad",
    title: "Launch Pad",
    description: "Complete every onboarding checklist item in your first week.",
    category: "Onboarding",
    points: 50,
    difficulty: "Rising",
    icon: "rocket",
    tone: "aqua"
  },
  {
    id: "reward-ready",
    title: "Reward Ready",
    description: "Earn enough points to unlock your first WeldSecure reward.",
    category: "Onboarding",
    points: 80,
    difficulty: "Skilled",
    icon: "gift",
    tone: "gold"
  },
  {
    id: "first-redemption",
    title: "First Redemption",
    description: "Redeem your first reward to celebrate getting started.",
    category: "Onboarding",
    points: 90,
    difficulty: "Skilled",
    icon: "trophy",
    tone: "gold"
  },
  {
    id: "rapid-reporter",
    title: "Rapid Reporter",
    description: "Flag a potentially risky message within 10 minutes of receiving it.",
    category: "Speed",
    points: 60,
    difficulty: "Rising",
    icon: "hourglass",
    tone: "cobalt"
  },
  {
    id: "whistle-watch",
    title: "Whistle Watch",
    description: "Escalate a suspicious phone call or SMS using WeldSecure tools.",
    category: "Speed",
    points: 115,
    difficulty: "Expert",
    icon: "whistle",
    tone: "cobalt"
  },
  {
    id: "resilience-ranger",
    title: "Resilience Ranger",
    description: "Coordinate a cross-team response that closes a high-severity incident in under an hour.",
    category: "Speed",
    points: 165,
    difficulty: "Legendary",
    icon: "shield",
    tone: "emerald"
  },
  {
    id: "spark-starter",
    title: "Spark Starter",
    description: "Be the first reporter to raise a newly trending threat subject.",
    category: "Impact",
    points: 85,
    difficulty: "Skilled",
    icon: "spark",
    tone: "blush"
  },
  {
    id: "automation-ally",
    title: "Automation Ally",
    description: "Trigger an automated secure response with your report metadata.",
    category: "Impact",
    points: 125,
    difficulty: "Expert",
    icon: "gear",
    tone: "midnight"
  },
  {
    id: "intel-curator",
    title: "Intel Curator",
    description: "Publish a weekly threat digest that five teammates subscribe to.",
    category: "Impact",
    points: 135,
    difficulty: "Expert",
    icon: "lightbulb",
    tone: "amber"
  },
  {
    id: "golden-signal",
    title: "Golden Signal",
    description: "Submit intel that leads to a high-severity threat takedown.",
    category: "Impact",
    points: 150,
    difficulty: "Legendary",
    icon: "diamond",
    tone: "amber"
  },
  {
    id: "threat-cartographer",
    title: "Threat Cartographer",
    description: "Map an emerging campaign across regions with actionable insights.",
    category: "Impact",
    points: 195,
    difficulty: "Legendary",
    icon: "globe",
    tone: "midnight"
  },
  {
    id: "zero-day-zeal",
    title: "Zero-Day Zeal",
    description: "Raise the first report tied to a zero-day alert in the news.",
    category: "Impact",
    points: 155,
    difficulty: "Legendary",
    icon: "flame",
    tone: "gold"
  },
  {
    id: "signal-sculptor",
    title: "Signal Sculptor",
    description: "Deliver ten high-confidence reports with full remediation playbooks.",
    category: "Precision",
    points: 190,
    difficulty: "Legendary",
    icon: "target",
    tone: "cobalt"
  },
  {
    id: "bullseye-breaker",
    title: "Bullseye Breaker",
    description: "Identify a targeted phishing attempt that hits multiple peers.",
    category: "Precision",
    points: 90,
    difficulty: "Expert",
    icon: "target",
    tone: "cobalt"
  },
  {
    id: "pattern-decoder",
    title: "Pattern Decoder",
    description: "Connect three related phishing emails across different days.",
    category: "Impact",
    points: 145,
    difficulty: "Expert",
    icon: "puzzle",
    tone: "midnight"
  },
  {
    id: "context-captain",
    title: "Context Captain",
    description: "Provide detailed notes and evidence for five consecutive reports.",
    category: "Mastery",
    points: 65,
    difficulty: "Skilled",
    icon: "clipboard",
    tone: "emerald"
  },
  {
    id: "playbook-pro",
    title: "Playbook Pro",
    description: "Complete every interactive training mission in the reporter hub.",
    category: "Mastery",
    points: 75,
    difficulty: "Skilled",
    icon: "book",
    tone: "slate"
  },
  {
    id: "playbook-architect",
    title: "Playbook Architect",
    description: "Design a custom response playbook adopted by your security team.",
    category: "Mastery",
    points: 185,
    difficulty: "Legendary",
    icon: "gear",
    tone: "slate"
  },
  {
    id: "insight-whisperer",
    title: "Insight Whisperer",
    description: "Spot a new attacker tactic before it appears in threat advisories.",
    category: "Impact",
    points: 140,
    difficulty: "Expert",
    icon: "lightbulb",
    tone: "coral"
  },
  {
    id: "hype-herald",
    title: "Hype Herald",
    description: "Promote WeldSecure reporting in a company-wide channel.",
    category: "Culture",
    points: 60,
    difficulty: "Skilled",
    icon: "megaphone",
    tone: "emerald"
  },
  {
    id: "culture-spark",
    title: "Culture Spark",
    description: "Share a vigilance tip that inspires three coworkers to report.",
    category: "Culture",
    points: 70,
    difficulty: "Skilled",
    icon: "heart",
    tone: "emerald"
  },
  {
    id: "buddy-system",
    title: "Buddy System",
    description: "Coach a colleague through their first WeldSecure report.",
    category: "Collaboration",
    points: 90,
    difficulty: "Skilled",
    icon: "handshake",
    tone: "emerald"
  },
  {
    id: "network-node",
    title: "Network Node",
    description: "Share a WeldSecure threat insight that sparks a team discussion.",
    category: "Collaboration",
    points: 80,
    difficulty: "Skilled",
    icon: "network",
    tone: "aqua"
  },
  {
    id: "mentor-maven",
    title: "Mentor Maven",
    description: "Guide three teammates to unlock their first advanced badge.",
    category: "Collaboration",
    points: 175,
    difficulty: "Legendary",
    icon: "handshake",
    tone: "emerald"
  },
  {
    id: "trend-setter",
    title: "Trend Setter",
    description: "Contribute to three weekly momentum report spikes in a quarter.",
    category: "Consistency",
    points: 95,
    difficulty: "Expert",
    icon: "chart",
    tone: "slate"
  },
  {
    id: "guardian-streak",
    title: "Guardian Streak",
    description: "Report suspicious content for seven days in a row.",
    category: "Consistency",
    points: 120,
    difficulty: "Expert",
    icon: "shield",
    tone: "emerald"
  },
  {
    id: "streak-ribbon",
    title: "Streak Ribbon",
    description: "Maintain a fourteen-day reporting streak without missing a beat.",
    category: "Consistency",
    points: 130,
    difficulty: "Expert",
    icon: "ribbon",
    tone: "aqua"
  },
  {
    id: "seasoned-sentinel",
    title: "Seasoned Sentinel",
    description: "Report suspicious activity every month for six consecutive months.",
    category: "Consistency",
    points: 160,
    difficulty: "Legendary",
    icon: "laurel",
    tone: "amber"
  },
  {
    id: "global-scout",
    title: "Global Scout",
    description: "Submit a report while traveling outside your primary office.",
    category: "Mobility",
    points: 100,
    difficulty: "Skilled",
    icon: "globe",
    tone: "midnight"
  },
  {
    id: "carry-on-defender",
    title: "Carry-on Defender",
    description: "Submit a high-quality report while traveling on business day one.",
    category: "Mobility",
    points: 100,
    difficulty: "Expert",
    icon: "plane",
    tone: "blush"
  },
  {
    id: "early-pathfinder",
    title: "Early Pathfinder",
    description: "Submit the first report from a newly onboarded location.",
    category: "Activation",
    points: 105,
    difficulty: "Skilled",
    icon: "compass",
    tone: "slate"
  },
  {
    id: "elevation-500",
    title: "Elevation 500",
    description: "Reach 500 lifetime WeldSecure points as a reporter.",
    category: "Rewards",
    points: 110,
    difficulty: "Skilled",
    icon: "mountain",
    tone: "midnight"
  },
  {
    id: "vanguard-veteran",
    title: "Vanguard Veteran",
    description: "Accumulate 1,000 lifetime points and keep your streak active.",
    category: "Rewards",
    points: 250,
    difficulty: "Legendary",
    icon: "crown",
    tone: "gold"
  },
  {
    id: "leaderboard-legend",
    title: "Leaderboard Legend",
    description: "Finish a month at the top of the reporter leaderboard.",
    category: "Recognition",
    points: 160,
    difficulty: "Legendary",
    icon: "trophy",
    tone: "gold"
  },
  {
    id: "spotlight-star",
    title: "Spotlight Star",
    description: "Be featured on the company vigilance wall of fame.",
    category: "Recognition",
    points: 170,
    difficulty: "Legendary",
    icon: "star",
    tone: "gold"
  },
  {
    id: "champion-circle",
    title: "Champion Circle",
    description: "Earn the monthly champion recognition from security leaders.",
    category: "Recognition",
    points: 180,
    difficulty: "Legendary",
    icon: "crown",
    tone: "gold"
  },
  {
    id: "sentinel-summit",
    title: "Sentinel Summit",
    description: "Headline a global security summit with a WeldSecure success story.",
    category: "Recognition",
    points: 210,
    difficulty: "Legendary",
    icon: "trophy",
    tone: "midnight"
  },
  {
    id: "badge-binge",
    title: "Badge Binge",
    description: "Unlock five unique reporter badges in a single quarter.",
    category: "Meta",
    points: 200,
    difficulty: "Legendary",
    icon: "badge",
    tone: "amber"
  }
];

const BADGE_DRAFTS = new Set([
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
]);


const DEFAULT_QUESTS = [
  {
    id: "phish-flash",
    title: "Phish or Friend?",
    icon: "target",
    category: "Phishing defence",
    difficulty: "Starter",
    duration: 5,
    questions: 6,
    points: 120,
    published: true,
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
    icon: "shield",
    category: "Password hygiene",
    difficulty: "Intermediate",
    duration: 6,
    questions: 8,
    points: 140,
    published: true,
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
    icon: "network",
    category: "Shadow IT awareness",
    difficulty: "Intermediate",
    duration: 7,
    questions: 7,
    points: 150,
    published: true,
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
    icon: "globe",
    category: "Remote work hygiene",
    difficulty: "Starter",
    duration: 4,
    questions: 5,
    points: 100,
    published: true,
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
    icon: "lightbulb",
    category: "AI safety",
    difficulty: "Advanced",
    duration: 8,
    questions: 9,
    points: 180,
    published: false,
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
    icon: "flame",
    category: "Incident response",
    difficulty: "Advanced",
    duration: 9,
    questions: 8,
    points: 200,
    published: false,
    format: "Timer-based tabletop",
    focus: ["Draft escalation updates", "Coordinate with SOC", "Protect comms channels"],
    bonus: "+60 crisis mastery",
    bonusDetail: "Finish under the time limit to unlock a post-incident debrief template.",
    description: "Run a tight tabletop simulation that flexes response muscles without needing the SOC team online.",
    sampleQuestion:
      "Finance reports a compromised CFO mailbox. Who do you notify first and which channel keeps legal synced?"
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
      lastBalanceBefore: null,
      lastBalanceAfter: null,
      lastBadgeId: null,
      lastBadgePoints: null,
      lastTotalAwarded: null,
      lastMessageId: null,
      lastClientSnapshot: null,
      rewardFilter: null,
      questFilter: null,
      badgeFilter: null
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
        remaining: 6,
        published: true
      },
      {
        id: 2,
        name: "Selfridges Gift Card",
        description: "Digital gift card redeemable online or in-store.",
        pointsCost: 280,
        icon: "gift",
        category: "voucher",
        provider: "Selfridges & Co",
        image: "linear-gradient(135deg, #ff8a80 0%, #ff416c 100%)",
        remaining: 12,
        published: true
      },
      {
        id: 3,
        name: "Margot & Montanez Chocolate Hamper",
        description: "Limited edition artisan chocolate selection to celebrate vigilance.",
        pointsCost: 120,
        icon: "gift",
        category: "merchandise",
        provider: "Margot & Montanez",
        image: "linear-gradient(135deg, #ffbe0b 0%, #fb5607 100%)",
        remaining: 20,
        published: false
      },
      {
        id: 4,
        name: "Weld Champion Hoodie",
        description: "Exclusive Weld hoodie for team members leading the risk scoreboard.",
        pointsCost: 260,
        icon: "gift",
        category: "merchandise",
        provider: "Weld Apparel",
        image: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)",
        remaining: 15,
        published: false
      },
      {
        id: 5,
        name: "Amazon Gift Card",
        description: "Digital code redeemable across Amazon.co.uk for everyday essentials or treats.",
        pointsCost: 220,
        icon: "gift",
        category: "voucher",
        provider: "Amazon UK",
        image: "linear-gradient(135deg, #f97316 0%, #facc15 100%)",
        remaining: 18,
        published: true
      },
      {
        id: 6,
        name: "Plant a Tree",
        description: "Fund the planting of a tree through our sustainability partner.",
        pointsCost: 150,
        icon: "gift",
        category: "sustainability",
        provider: "Green Earth Collective",
        image: "linear-gradient(135deg, #22c55e 0%, #0ea5e9 100%)",
        remaining: 40,
        published: true
      },
      {
        id: 7,
        name: "Extra Day of Annual Leave",
        description: "Enjoy an additional day of paid leave approved by your manager.",
        pointsCost: 480,
        icon: "gift",
        category: "benefit",
        provider: "People Team",
        image: "linear-gradient(135deg, #818cf8 0%, #312e81 100%)",
        remaining: 5,
        published: false
      },
      {
        id: 8,
        name: "Donate to Charity",
        description: "Direct a WeldSecure-supported donation to a charitable partner of your choice.",
        pointsCost: 180,
        icon: "gift",
        category: "charity",
        provider: "WeldSecure Giving",
        image: "linear-gradient(135deg, #f472b6 0%, #ec4899 100%)",
        remaining: null,
        unlimited: true,
        published: true
      },
      {
        id: 9,
        name: "Contribute to Work Social Event",
        description: "Add funds to enhance the next team social experience.",
        pointsCost: 140,
        icon: "gift",
        category: "culture",
        provider: "Employee Engagement",
        image: "linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)",
        remaining: 25,
        published: false
      }
    ],
    quests: DEFAULT_QUESTS.map(quest => ({
      ...quest,
      published: typeof quest.published === "boolean" ? quest.published : true
    })),
    badges: BADGES.map(badge => ({
      ...badge,
      published: !BADGE_DRAFTS.has(badge.id)
    })),
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
    const normalizedQuests = Array.isArray(parsed.quests)
      ? parsed.quests.map(quest => {
          const baseQuest = baseState.quests.find(item => item.id === quest.id);
          return {
            ...baseQuest,
            ...quest,
            published:
              typeof quest.published === "boolean"
                ? quest.published
                : baseQuest?.published ?? true
          };
        })
      : baseState.quests;
    const normalizedRewards = Array.isArray(parsed.rewards)
      ? (() => {
          const mergedRewards = parsed.rewards.map(reward => {
            const baseReward =
              baseState.rewards.find(item => item.id === reward.id) || {};
            const unlimited = baseReward.unlimited === true || reward.unlimited === true;
            const hasFiniteRemaining = Number.isFinite(reward.remaining);
            const baseRemaining = Number.isFinite(baseReward.remaining)
              ? baseReward.remaining
              : 0;
            return {
              ...baseReward,
              ...reward,
              icon: "gift",
              unlimited,
              remaining: unlimited
                ? null
                : hasFiniteRemaining
                ? reward.remaining
                : baseRemaining,
              published:
                typeof reward.published === "boolean"
                  ? reward.published
                  : baseReward.published ?? true
            };
          });
          const existingRewardIds = new Set(
            mergedRewards.map(reward => reward.id)
          );
          const newRewards = baseState.rewards
            .filter(reward => !existingRewardIds.has(reward.id))
            .map(reward => ({ ...reward }));
          return [...mergedRewards, ...newRewards];
        })()
      : baseState.rewards;
    const normalizedBadges = Array.isArray(parsed.badges)
      ? (() => {
          const overrides = new Map();
          parsed.badges.forEach(item => {
            if (!item) return;
            const key =
              typeof item.id === "string" && item.id.trim().length > 0
                ? item.id.trim()
                : null;
            if (key) {
              overrides.set(key, { ...item, id: key });
            } else {
              const fallbackId = generateId("badge");
              overrides.set(fallbackId, { ...item, id: fallbackId });
            }
          });
          const merged = baseState.badges.map(baseBadge => {
            const override = overrides.get(baseBadge.id);
            if (!override) {
              return { ...baseBadge };
            }
            overrides.delete(baseBadge.id);
            return {
              ...baseBadge,
              ...override,
              id: baseBadge.id,
              published:
                typeof override.published === "boolean"
                  ? override.published
                  : baseBadge.published
            };
          });
          const additional = Array.from(overrides.values()).map(item => ({
            ...item,
            published:
              typeof item.published === "boolean"
                ? item.published
                : !BADGE_DRAFTS.has(item.id)
          }));
          return [...merged, ...additional];
        })()
      : baseState.badges;
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
          const normalizedMessageId = normalizeId(message.id, "message") ?? generateId("message");
          const externalMessageId =
            typeof message.messageId === "string" && message.messageId.trim().length > 0
              ? message.messageId.trim()
              : generateId("MSG").toUpperCase();
          return {
            ...message,
            id: normalizedMessageId,
            messageId: externalMessageId,
            clientId,
            pointsOnMessage: message.pointsOnMessage ?? clientConfig?.pointsPerMessage ?? 20,
            pointsOnApproval: message.pointsOnApproval ?? clientConfig?.pointsOnApproval ?? 80
          };
        })
      : baseState.messages.map(message => ({
          ...message,
          id: normalizeId(message.id, "message") ?? generateId("message"),
          messageId:
            typeof message.messageId === "string" && message.messageId.trim().length > 0
              ? message.messageId.trim()
              : generateId("MSG").toUpperCase()
        }));
    const normalizedRewardRedemptions = Array.isArray(parsed.rewardRedemptions)
      ? parsed.rewardRedemptions.map(entry => ({
          ...entry,
          id: normalizeId(entry.id, "redemption") ?? generateId("redemption")
        }))
      : baseState.rewardRedemptions.map(entry => ({
          ...entry,
          id: normalizeId(entry.id, "redemption") ?? generateId("redemption")
        }));
    const mergedMeta = {
      ...baseState.meta,
      ...parsed.meta
    };
    if (mergedMeta.lastMessageId === null || mergedMeta.lastMessageId === undefined) {
      mergedMeta.lastMessageId = null;
    } else if (typeof mergedMeta.lastMessageId === "string") {
      mergedMeta.lastMessageId = mergedMeta.lastMessageId.trim() || null;
    } else if (Number.isFinite(mergedMeta.lastMessageId)) {
      mergedMeta.lastMessageId = String(mergedMeta.lastMessageId);
    } else {
      mergedMeta.lastMessageId = null;
    }
    const normalizeFilter = value =>
      typeof value === "string" && value.trim().length > 0 ? value.trim().toLowerCase() : null;
    mergedMeta.rewardFilter = normalizeFilter(mergedMeta.rewardFilter);
    mergedMeta.questFilter = normalizeFilter(mergedMeta.questFilter);
    mergedMeta.badgeFilter = normalizeFilter(mergedMeta.badgeFilter);
    return {
      ...baseState,
      ...parsed,
      meta: mergedMeta,
      rewards: normalizedRewards,
      quests: normalizedQuests,
      badges: normalizedBadges,
      messages: normalizedMessages,
      clients: normalizedClients,
      rewardRedemptions: normalizedRewardRedemptions
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
  state.quests = clone(defaultState.quests);
  state.badges = clone(defaultState.badges);
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

function getBadges() {
  if (Array.isArray(state.badges) && state.badges.length > 0) {
    return state.badges;
  }
  return BADGES.map(badge => ({
    ...badge,
    published: !BADGE_DRAFTS.has(badge.id)
  }));
}

function rewardRemainingLabel(reward) {
  if (reward?.unlimited) {
    return "&infin;";
  }
  if (typeof reward?.remaining === "number") {
    return reward.remaining;
  }
  return 0;
}

function reasonById(id) {
  return state.reportReasons.find(item => item.id === id);
}

function messageBelongsToCustomer(message) {
  return message?.reporterEmail === state.customer.email;
}

function redeemReward(rewardId) {
  const reward = rewardById(rewardId);
  if (!reward) return { success: false, reason: "Reward not found." };
  if (!reward.published) {
    return { success: false, reason: "This reward is not currently published to hubs." };
  }
  const isUnlimited = reward.unlimited === true;
  if (state.customer.currentPoints < reward.pointsCost) {
    return { success: false, reason: "Not enough points to redeem this reward yet." };
  }
  if (!isUnlimited && reward.remaining <= 0) {
    return { success: false, reason: "This reward is temporarily out of stock." };
  }

  state.customer.currentPoints -= reward.pointsCost;
  state.customer.redeemedPoints += reward.pointsCost;
  if (!isUnlimited) {
    reward.remaining = Math.max(reward.remaining - 1, 0);
  }

  const redemption = {
    id: generateId("redemption"),
    rewardId: reward.id,
    redeemedAt: new Date().toISOString(),
    status: "pending"
  };

  state.rewardRedemptions.unshift(redemption);
  persist();
  renderApp();

  return { success: true, redemption };
}

function setRewardPublication(rewardId, published) {
  const reward = rewardById(rewardId);
  if (!reward) return;
  reward.published = Boolean(published);
  persist();
  renderApp();
}

function setBadgePublication(badgeId, published) {
  if (!Array.isArray(state.badges)) return;
  const targetId =
    typeof badgeId === "string" && badgeId.trim().length > 0 ? badgeId.trim() : String(badgeId ?? "");
  const badge = state.badges.find(item => item.id === targetId);
  if (!badge) return;
  badge.published = Boolean(published);
  persist();
  renderApp();
}

function setAllRewardsPublication(published) {
  const nextPublished = Boolean(published);
  let changed = false;
  state.rewards.forEach(reward => {
    if (reward.published !== nextPublished) {
      reward.published = nextPublished;
      changed = true;
    }
  });
  if (!changed) return;
  persist();
  renderApp();
}

function setAllBadgesPublication(published) {
  if (!Array.isArray(state.badges) || state.badges.length === 0) return;
  const nextPublished = Boolean(published);
  let changed = false;
  state.badges.forEach(badge => {
    if (badge.published !== nextPublished) {
      badge.published = nextPublished;
      changed = true;
    }
  });
  if (!changed) return;
  persist();
  renderApp();
}

function setAllQuestsPublication(published) {
  if (!Array.isArray(state.quests)) return;
  const nextPublished = Boolean(published);
  let changed = false;
  state.quests.forEach(quest => {
    if (quest.published !== nextPublished) {
      quest.published = nextPublished;
      changed = true;
    }
  });
  if (!changed) return;
  persist();
  renderApp();
}

function setQuestPublication(questId, published) {
  if (!Array.isArray(state.quests)) return;
  const targetId = String(questId);
  const quest = state.quests.find(item => String(item.id) === targetId);
  if (!quest) return;
  quest.published = Boolean(published);
  persist();
  renderApp();
}

function reportMessage(payload) {
  const client = state.clients.find(c => c.id === state.customer.clientId);
  const previousClientSnapshot = client
    ? {
        id: client.id,
        openCases: client.openCases,
        healthScore: client.healthScore,
        lastReportAt: client.lastReportAt ?? null
      }
    : null;
  const pointsOnMessage = 20;
  const pointsOnApproval = client?.pointsOnApproval ?? 80;
  const beforePoints = state.customer.currentPoints;
  const internalMessageId = generateId("message");
  const messageIdValue =
    typeof payload.messageId === "string" && payload.messageId.trim().length > 0
      ? payload.messageId.trim()
      : generateId("MSG").toUpperCase();
  const message = {
    id: internalMessageId,
    messageId: messageIdValue,
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
  message.pointsOnMessage = pointsOnMessage;
  state.meta.lastMessageId = internalMessageId;

  const selectedBadge = selectRandomBadge(state.meta.lastBadgeId);
  const badgePoints = selectedBadge ? selectedBadge.points : 0;
  if (badgePoints > 0) {
    state.customer.currentPoints += badgePoints;
  }
  const afterPoints = state.customer.currentPoints;
  const totalAwarded = afterPoints - beforePoints;

  if (client) {
    client.openCases += 1;
    client.healthScore = Math.min(client.healthScore + 1, 100);
    client.lastReportAt = message.reportedAt;
  }

  state.meta.lastClientSnapshot = previousClientSnapshot;
  state.meta.addinScreen = "success";
  state.meta.lastReportedSubject = payload.subject;
  state.meta.lastReportPoints = pointsOnMessage;
  state.meta.lastBalanceBefore = beforePoints;
  state.meta.lastBalanceAfter = afterPoints;
  state.meta.lastBadgePoints = badgePoints;
  state.meta.lastBadgeId = selectedBadge ? selectedBadge.id : null;
  state.meta.lastTotalAwarded = totalAwarded;
  if (Array.isArray(payload.emergencyFlags) && payload.emergencyFlags.length > 0) {
    message.emergencyFlags = payload.emergencyFlags;
  }
  persist();
  renderApp();
}

function setupCelebrationReplay(container) {
  const celebration = container.querySelector(".points-celebration");
  if (!celebration) return;
  setupCelebrationSup(celebration, () => animatePointsTicker(celebration));
  const bubble = celebration.querySelector(".points-celebration__bubble");
  if (!bubble || bubble.dataset.replayBound === "true") return;

  bubble.dataset.replayBound = "true";
  bubble.classList.add("points-celebration__bubble--interactive");
  bubble.setAttribute("role", "button");
  bubble.setAttribute("tabindex", "0");
  bubble.setAttribute("aria-label", "Replay celebration animation");

  const restart = () => {
    const replacement = celebration.cloneNode(true);
    const clonedBubble = replacement.querySelector(".points-celebration__bubble");
    if (clonedBubble) {
      delete clonedBubble.dataset.replayBound;
      clonedBubble.classList.remove("points-celebration__bubble--interactive");
      clonedBubble.removeAttribute("role");
      clonedBubble.removeAttribute("tabindex");
      clonedBubble.removeAttribute("aria-label");
    }
    celebration.replaceWith(replacement);
    setupCelebrationSup(replacement, () => animatePointsTicker(replacement));
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

function revertLastReportAward() {
  if (state.meta.addinScreen !== "success") return;

  const beforeBalance = Number(state.meta.lastBalanceBefore);
  const totalAwarded = Number(state.meta.lastTotalAwarded);

  if (Number.isFinite(beforeBalance)) {
    state.customer.currentPoints = Math.max(0, beforeBalance);
  } else if (Number.isFinite(totalAwarded)) {
    state.customer.currentPoints = Math.max(0, state.customer.currentPoints - totalAwarded);
  }

  const lastMessageId = state.meta.lastMessageId;
  if (lastMessageId) {
    const index = state.messages.findIndex(msg => String(msg.id) === String(lastMessageId));
    if (index !== -1) {
      state.messages.splice(index, 1);
    }
    state.meta.lastMessageId = null;
  }

  const snapshot = state.meta.lastClientSnapshot;
  if (snapshot && typeof snapshot === "object" && Number.isFinite(snapshot.id)) {
    const client = state.clients.find(c => c.id === snapshot.id);
    if (client) {
      if (typeof snapshot.openCases === "number") {
        client.openCases = snapshot.openCases;
      }
      if (typeof snapshot.healthScore === "number") {
        client.healthScore = snapshot.healthScore;
      }
      if (Object.prototype.hasOwnProperty.call(snapshot, "lastReportAt")) {
        client.lastReportAt = snapshot.lastReportAt;
      }
    }
  }

  state.meta.addinScreen = "report";
  state.meta.lastReportedSubject = null;
  state.meta.lastReportPoints = null;
  state.meta.lastBalanceBefore = null;
  state.meta.lastBalanceAfter = null;
  state.meta.lastBadgeId = null;
  state.meta.lastBadgePoints = null;
  state.meta.lastTotalAwarded = null;
  state.meta.lastClientSnapshot = null;

  persist();
  renderApp();
}

function animatePointsTicker(root) {
  let ticker = null;
  if (root && typeof root.querySelector === "function") {
    ticker = root.querySelector(".points-ticker");
  }
  if (!ticker) {
    ticker = document.querySelector('[data-points-ticker="total"]');
  }
  if (!ticker) return;
  const valueEl = ticker.querySelector(".points-ticker__value");
  const supEl = ticker.querySelector(".points-ticker__sup");
  if (!valueEl || !supEl) return;

  const targetEndAttr = Number(valueEl.dataset.targetEnd);
  const end = Number.isFinite(targetEndAttr) ? targetEndAttr : Number(ticker.dataset.end);
  if (!Number.isFinite(end)) return;

  if (typeof window === "undefined" || !window.requestAnimationFrame) {
    return;
  }

  const currentAward = Number(supEl.dataset.currentAward) || 0;
  const start = Number(ticker.dataset.start);
  const target = Math.max(start + currentAward, start);
  const finalTarget = Math.max(end, target);

  const duration = 720;
  const startTime = performance.now();
  const change = finalTarget - start;
  if (change <= 0) {
    valueEl.textContent = formatNumber(finalTarget);
    return;
  }

  const easeOutQuart = t => 1 - Math.pow(1 - t, 4);

  const tick = now => {
    const elapsed = Math.min((now - startTime) / duration, 1);
    const eased = easeOutQuart(elapsed);
    const current = Math.round(start + change * eased);
    valueEl.textContent = formatNumber(current);
    if (elapsed < 1) {
      window.requestAnimationFrame(tick);
    } else {
      valueEl.textContent = formatNumber(finalTarget);
    }
  };

  window.requestAnimationFrame(tick);
}

function updateMessageStatus(messageId, status) {
  const target = state.messages.find(msg => String(msg.id) === String(messageId));
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

function openDialog({
  title,
  description,
  content,
  confirmLabel,
  onConfirm,
  cancelLabel,
  onCancel,
  tone = "primary"
}) {
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

  root.innerHTML = "";

  const backdrop = document.createElement("div");
  backdrop.className = "dialog-backdrop";
  backdrop.setAttribute("role", "dialog");
  backdrop.setAttribute("aria-modal", "true");

  const surface = document.createElement("div");
  surface.className = "dialog-surface";

  const header = document.createElement("header");
  const heading = document.createElement("h2");
  heading.textContent = title || "";
  header.appendChild(heading);
  if (description) {
    const descriptionEl = document.createElement("p");
    descriptionEl.textContent = description;
    header.appendChild(descriptionEl);
  }

  const bodySection = document.createElement("section");
  appendDialogContent(bodySection, content);
  const hasContent = bodySection.childNodes.length > 0;

  const footer = document.createElement("footer");
  footer.className = "dialog-actions";

  let cancelButton = null;
  if (cancelLabel) {
    cancelButton = document.createElement("button");
    cancelButton.className = "button-pill button-pill--ghost";
    cancelButton.dataset.dialogAction = "cancel";
    cancelButton.textContent = cancelLabel;
    footer.appendChild(cancelButton);
  }

  let confirmButton = null;
  if (confirmLabel) {
    confirmButton = document.createElement("button");
    const toneClass = tone === "critical" ? "button-pill--critical" : "button-pill--primary";
    confirmButton.className = `button-pill ${toneClass}`;
    confirmButton.dataset.dialogAction = "confirm";
    confirmButton.textContent = confirmLabel;
    footer.appendChild(confirmButton);
  }

  surface.appendChild(header);
  if (hasContent) {
    surface.appendChild(bodySection);
  }
  surface.appendChild(footer);
  backdrop.appendChild(surface);
  root.appendChild(backdrop);

  function cleanup() {
    backdrop.removeEventListener("click", handleBackdrop);
    document.removeEventListener("keydown", handleKey);
    delete root.__weldDialogCleanup__;
  }

  function close() {
    cleanup();
    root.innerHTML = "";
    const storedOverflow = document.body.dataset.previousOverflow;
    document.body.style.overflow = storedOverflow !== undefined ? storedOverflow : "";
    delete document.body.dataset.previousOverflow;
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

  function appendDialogContent(parent, value) {
    if (value === null || value === undefined) return;
    if (typeof value === "function") {
      appendDialogContent(parent, value());
      return;
    }
    if (Array.isArray(value)) {
      value.forEach(item => appendDialogContent(parent, item));
      return;
    }
    if (typeof Node !== "undefined" && value instanceof Node) {
      parent.appendChild(value);
      return;
    }
    const wrapper = document.createElement("p");
    wrapper.textContent = String(value);
    parent.appendChild(wrapper);
  }

  backdrop.addEventListener("click", handleBackdrop);
  document.addEventListener("keydown", handleKey);
  root.__weldDialogCleanup__ = cleanup;

  if (confirmButton) {
    confirmButton.addEventListener("click", () => {
      if (onConfirm) onConfirm(close);
      else close();
    });
  }

  if (cancelButton) {
    cancelButton.addEventListener("click", () => {
      if (onCancel) onCancel();
      close();
    });
  }
}

function closeDialog() {
  const root = document.getElementById("dialog-root");
  if (!root) return;
  if (typeof root.__weldDialogCleanup__ === "function") {
    root.__weldDialogCleanup__();
  }
  root.innerHTML = "";
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
      <div class="global-nav__actions">
        ${activeRoute === "landing"
          ? `<button type="button" class="button-pill button-pill--primary global-nav__reset" id="landing-reset">Reset</button>`
          : ""}
        <button type="button" class="button-pill button-pill--primary global-nav__journey" id="global-journey">
          Home
        </button>
      </div>
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
            card.route === "client-badges" ? "Explore badges" : card.route === "addin" ? "Launch task pane" : "Launch journey"
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
        <div class="landing__visual">
          <div
            class="landing__badge-sample"
            role="button"
            tabindex="0"
            aria-label="Replay badge animation"
            data-landing-badge
          >
            <svg class="badge" xmlns="http://www.w3.org/2000/svg" height="440" width="440" viewBox="-40 -40 440 440">
              <circle class="outer" fill="#F9D535" stroke="#fff" stroke-width="8" stroke-linecap="round" cx="180" cy="180" r="157"></circle>
              <circle class="inner" fill="#DFB828" stroke="#fff" stroke-width="8" cx="180" cy="180" r="108.3"></circle>
              <path class="inline" d="M89.4 276.7c-26-24.2-42.2-58.8-42.2-97.1 0-22.6 5.6-43.8 15.5-62.4m234.7.1c9.9 18.6 15.4 39.7 15.4 62.2 0 38.3-16.2 72.8-42.1 97" stroke="#CAA61F" stroke-width="7" stroke-linecap="round" fill="none"></path>
              <g class="star">
                <path fill="#F9D535" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" d="M180 107.8l16.9 52.1h54.8l-44.3 32.2 16.9 52.1-44.3-32.2-44.3 32.2 16.9-52.1-44.3-32.2h54.8z"></path>
                <circle fill="#DFB828" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" cx="180" cy="107.8" r="4.4"></circle>
                <circle fill="#DFB828" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" cx="223.7" cy="244.2" r="4.4"></circle>
                <circle fill="#DFB828" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" cx="135.5" cy="244.2" r="4.4"></circle>
                <circle fill="#DFB828" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" cx="108.3" cy="160.4" r="4.4"></circle>
                <circle fill="#DFB828" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" cx="251.7" cy="160.4" r="4.4"></circle>
              </g>
            </svg>
          </div>
        </div>
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
      action: { label: "View badges", route: "client-badges", role: "customer" }
    },
    {
      title: "Quest catalogue",
      description: "Show how organisations curate and publish quest experiences directly into employee hubs.",
      icon: "lightbulb",
      action: { label: "Open quest catalogue", route: "client-quests", role: "client" }
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


function renderCustomer() {
  const customerMessages = state.messages.filter(messageBelongsToCustomer);
  const pendingMessages = customerMessages.filter(message => message.status === MessageStatus.PENDING);
  const pendingApprovalPoints = pendingMessages.reduce((sum, message) => sum + (message.pointsOnApproval || 0), 0);
  const publishedRewards = state.rewards.filter(reward => reward.published);
  const publishedQuests = Array.isArray(state.quests)
    ? state.quests.filter(quest => quest.published).sort(compareQuestsByDifficulty)
    : [];
  const publishedBadges = getBadges().filter(badge => badge.published);

  const rewardsHtml = publishedRewards
    .map(reward => {
      const remainingLabel = rewardRemainingLabel(reward);
      return `
      <article class="reward-card reward-card--catalogue reward-card--hub" data-reward="${escapeHtml(String(reward.id))}">
        <div class="reward-card__artwork" style="background:${reward.image};">
          ${renderIcon(reward.icon || "gift", "lg")}
        </div>
        <div class="reward-card__meta">
          <span class="reward-card__chip reward-card__chip--category">${escapeHtml(reward.category || "Reward")}</span>
          <span class="reward-card__chip reward-card__chip--provider">${escapeHtml(reward.provider || "WeldSecure")}</span>
        </div>
        <h4 class="reward-card__title">${escapeHtml(reward.name || "Reward")}</h4>
        <p class="reward-card__desc">${escapeHtml(reward.description || "")}</p>
        <div class="reward-card__footer">
          <strong>${formatNumber(reward.pointsCost || 0)} pts</strong>
          <span>${remainingLabel} left</span>
        </div>
        <button type="button" class="reward-card__cta button-pill button-pill--primary">Redeem reward</button>
      </article>
    `;
    })
    .join("");

  const questsHtml = publishedQuests
    .map(quest => {
      const focusTags = Array.isArray(quest.focus)
        ? quest.focus.slice(0, 2).map(item => `<span>${escapeHtml(item)}</span>`).join("")
        : "";
      const focusBlock = focusTags ? `<div class="quest-card__focus quest-card__focus--compact">${focusTags}</div>` : "";
      const difficultyChip = quest.difficulty
        ? `<span class="quest-card__chip quest-card__chip--difficulty" data-difficulty="${escapeHtml(
            quest.difficulty
          )}">${escapeHtml(quest.difficulty)}</span>`
        : "";
      const headerTags = [];
      if (quest.category) headerTags.push(`<span class="quest-card__chip">${escapeHtml(quest.category)}</span>`);
      const chipGroup = headerTags.length ? `<div class="quest-card__chip-group">${headerTags.join("")}</div>` : "";
      return `
      <article class="quest-card quest-card--hub" data-quest="${escapeHtml(String(quest.id))}">
        <header class="quest-card__header quest-card__header--hub">
          ${difficultyChip}
          ${chipGroup}
        </header>
        <h4 class="quest-card__title">${escapeHtml(quest.title)}</h4>
        <p class="quest-card__description">${escapeHtml(quest.description)}</p>
        <ul class="quest-card__details quest-card__details--compact">
          <li><span>Duration</span><strong>${escapeHtml(String(quest.duration))} min</strong></li>
          <li><span>Questions</span><strong>${escapeHtml(String(quest.questions))}</strong></li>
          <li><span>Format</span><strong>${escapeHtml(quest.format || "")}</strong></li>
          <li><span>Points</span><strong>${formatNumber(quest.points || 0)}</strong></li>
        </ul>
        ${focusBlock}
        <div class="quest-card__footer quest-card__footer--hub">
          <button type="button" class="button-pill button-pill--primary quest-card__cta" data-quest="${escapeHtml(
            String(quest.id)
          )}">
            View in catalogue
          </button>
        </div>
      </article>
    `;
    })
    .join("");

  const badgesHtml = publishedBadges
    .slice(0, 4)
    .map(badge => {
      const safeId = escapeHtml(String(badge.id));
      const cardId = `${safeId}-card`;
      const tone = BADGE_TONES[badge.tone] || BADGE_TONES.violet;
      const iconBackdrop =
        BADGE_ICON_BACKDROPS[badge.tone]?.background ||
        BADGE_ICON_BACKDROPS.violet?.background ||
        "linear-gradient(135deg, #c7d2fe, #818cf8)";
      const iconShadow =
        BADGE_ICON_BACKDROPS[badge.tone]?.shadow ||
        BADGE_ICON_BACKDROPS.violet?.shadow ||
        "rgba(79, 70, 229, 0.32)";
      const normalizedCategory =
        typeof badge.category === "string" && badge.category.trim().length > 0
          ? badge.category.trim()
          : "Badge";
      const difficultyLabel =
        typeof badge.difficulty === "string" && badge.difficulty.trim().length > 0
          ? badge.difficulty.trim()
          : null;
      const tags = [];
      if (normalizedCategory && normalizedCategory !== "Badge") {
        tags.push(`<span>${escapeHtml(normalizedCategory)}</span>`);
      }
      if (difficultyLabel) {
        tags.push(`<span>${escapeHtml(difficultyLabel)}</span>`);
      }
      const tagsMarkup = tags.length ? `<div class="gem-badge-card__tags">${tags.join("")}</div>` : "";
      const pointsValue = Number(badge.points) || 0;
      const ariaLabel = `${badge.title} badge, worth ${formatNumber(pointsValue)} points in the collection.`;
      return `
        <button
          type="button"
          class="gem-badge__trigger"
          aria-haspopup="true"
          aria-label="${escapeHtml(badge.title)} badge details"
          aria-controls="${cardId}">
          <span class="gem-badge__icon" style="background:${iconBackdrop}; box-shadow:0 18px 32px ${iconShadow};">
            ${renderIcon(badge.icon || "medal", "sm")}
          </span>
        </button>
        <span class="gem-badge__label">${escapeHtml(badge.title)}</span>
        <div id="${cardId}" class="gem-badge-card gem-badge-card--hub gem-badge-card--published" role="group" aria-label="${escapeHtml(ariaLabel)}">
          <span class="gem-badge-card__halo"></span>
          <span class="gem-badge-card__orb gem-badge-card__orb--one"></span>
          <span class="gem-badge-card__orb gem-badge-card__orb--two"></span>
          <header class="gem-badge-card__header">
            <span>${escapeHtml(normalizedCategory)}</span>
            <span class="gem-badge-card__status gem-badge-card__status--published">Published</span>
          </header>
          <div class="gem-badge-card__main">
            <div class="gem-badge-card__icon">
              ${renderIcon(badge.icon || "medal", "md")}
            </div>
            <h3 class="gem-badge-card__title">${escapeHtml(badge.title)}</h3>
            ${tagsMarkup}
            <p class="gem-badge-card__description">${escapeHtml(badge.description)}</p>
          </div>
          <footer class="gem-badge-card__footer">
            <span class="gem-badge-card__points">
              <span class="gem-badge-card__points-value">+${formatNumber(pointsValue)}</span>
              <span class="gem-badge-card__points-unit">pts</span>
            </span>
            <button type="button" class="button-pill button-pill--ghost gem-badge-card__action hub-badge__cta" data-route="client-badges" data-role="client">
              View catalogue
            </button>
          </footer>
        </div>
      </article>
    `;
    })
    .join("");

  return `
    <header class="customer-hero">
      <h1>Good day, ${escapeHtml(state.customer.name)}</h1>
      <p>Your vigilance is fuelling a safer inbox for everyone at Evergreen Capital.</p>
      <button class="button-pill button-pill--primary" id="customer-report-button">Report other suspicious activity</button>
    </header>
    <section class="customer-section customer-section--points points-strip">
      <article class="points-card" style="background: linear-gradient(135deg, #6d28d9, #4338ca);">
        <div class="points-card__chip points-card__chip--interactive">
          <span>Available to spend</span>
          <button type="button" class="points-card__chip-action" data-scroll="#customer-rewards">Browse rewards</button>
        </div>
        <div class="points-card__content">
          <span class="points-icon" style="background: linear-gradient(135deg, #ede9fe, #c7d2fe);">
            ${renderIcon("medal", "sm")}
          </span>
          <div class="points-card__metrics">
            <span class="points-card__value">${formatNumber(state.customer.currentPoints)}</span>
            <span class="points-card__unit">PTS</span>
          </div>
        </div>
      </article>
      <article class="points-card" style="background: linear-gradient(135deg, #f97316, #facc15);">
        <div class="points-card__chip points-card__chip--interactive">
          <span>Pending approval</span>
          <button type="button" class="points-card__chip-action" data-route="customer-reports">Recent reports</button>
        </div>
        <div class="points-card__content">
          <span class="points-icon" style="background: linear-gradient(135deg, #fff7ed, #ffedd5);">
            ${renderIcon("hourglass", "sm")}
          </span>
          <div class="points-card__metrics">
            <span class="points-card__value">${formatNumber(pendingApprovalPoints)}</span>
            <span class="points-card__unit">PTS</span>
          </div>
        </div>
      </article>
      <article class="points-card" style="background: linear-gradient(135deg, #0ea5e9, #6366f1);">
        <div class="points-card__chip points-card__chip--interactive">
          <span>Reward history</span>
          <button type="button" class="points-card__chip-action" data-route="customer-redemptions">View history</button>
        </div>
        <div class="points-card__content">
          <span class="points-icon" style="background: linear-gradient(135deg, #dbeafe, #bfdbfe);">
            ${renderIcon("gift", "sm")}
          </span>
          <div class="points-card__metrics">
            <span class="points-card__value">${formatNumber(state.customer.redeemedPoints)}</span>
            <span class="points-card__unit">PTS</span>
          </div>
        </div>
      </article>
    </section>
    <section id="customer-rewards" class="customer-section customer-section--rewards">
      <div class="section-header">
        <h2>Your rewards</h2>
        <p>Select a reward to demonstrate the instant redemption flow. Only rewards published by your organisation appear here.</p>
      </div>
      ${
        rewardsHtml
          ? `<div class="reward-grid reward-grid--catalogue reward-grid--hub">${rewardsHtml}</div>`
          : `<div class="reward-empty"><p>No rewards are currently published. Check back soon!</p></div>`
      }
    </section>
    <section class="customer-section customer-section--quests">
      <div class="section-header">
        <h2>Your quests</h2>
        <p>Introduce squads to the latest WeldSecure quests. Only published quests from your organisation appear here.</p>
      </div>
      ${
        questsHtml
          ? `<div class="quest-grid quest-grid--hub">${questsHtml}</div>`
          : `<div class="reward-empty"><p>No quests are currently published. Check back soon!</p></div>`
      }
    </section>
    <section class="customer-section customer-section--badges">
      <div class="section-header">
        <h2>Your badges</h2>
        <p>Preview the badges your organisation curates. Published badges appear here and inside the add-in spotlight.</p>
      </div>
      ${
        badgesHtml
          ? `<div class="gem-badge-grid gem-badge-grid--hub">${badgesHtml}</div>`
          : `<div class="badge-empty"><p>No badges are currently published. Switch to the organisation catalogue to curate them.</p></div>`
      }
    </section>
  `;
}

function renderCustomerReportsPage() {
  const customerMessages = state.messages
    .filter(messageBelongsToCustomer)
    .slice()
    .sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime());

  const rowsMarkup = customerMessages
    .map(message => {
      const reasons = Array.isArray(message.reasons) ? message.reasons.map(reasonById).filter(Boolean) : [];
      const reasonChips = reasons
        .map(reason => `<span class="detail-chip">${escapeHtml(reason.description)}</span>`)
        .join("");
      const approvedPoints = message.status === MessageStatus.APPROVED ? message.pointsOnApproval || 0 : 0;
      const totalPoints = (message.pointsOnMessage || 0) + approvedPoints;
      return `
        <tr>
          <td>${formatDateTime(message.reportedAt)}</td>
          <td>
            <strong>${escapeHtml(message.subject || "Suspicious message")}</strong>
            ${reasonChips ? `<div class="detail-table__chips">${reasonChips}</div>` : ""}
          </td>
          <td><span class="badge" data-state="${escapeHtml(message.status)}">${escapeHtml(message.status)}</span></td>
          <td>
            <div class="detail-table__points">
              <span>+${formatNumber(message.pointsOnMessage || 0)}</span>
              ${
                message.status === MessageStatus.APPROVED
                  ? `<span>+${formatNumber(approvedPoints)}</span>`
                  : ""
              }
              <strong>= ${formatNumber(totalPoints)}</strong>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");

  const tableMarkup = customerMessages.length
    ? `
      <div class="detail-table-wrapper">
        <table class="detail-table detail-table--reports">
          <thead>
            <tr>
              <th>Reported</th>
              <th>Subject &amp; reasons</th>
              <th>Status</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>${rowsMarkup}</tbody>
        </table>
      </div>
    `
    : `<div class="customer-detail__empty">No reports recorded yet. Use the hub to submit your first suspicious email.</div>`;

  return `
    <header class="customer-detail-header">
      <button type="button" class="button-pill button-pill--ghost customer-detail__back" data-action="back-to-hub">
        Back to hub
      </button>
      <span class="customer-detail__eyebrow">Reports</span>
      <h1>Your reported messages</h1>
      <p>Review everything you've flagged and track approvals from the security team.</p>
    </header>
    ${tableMarkup}
  `;
}

function renderCustomerRedemptionsPage() {
  const redemptions = Array.isArray(state.rewardRedemptions)
    ? state.rewardRedemptions.slice().sort((a, b) => new Date(b.redeemedAt).getTime() - new Date(a.redeemedAt).getTime())
    : [];

  const rowsMarkup = redemptions
    .map(entry => {
      const reward = rewardById(entry.rewardId);
      const rewardName = reward ? reward.name : "Reward";
      const provider = reward?.provider ? `<span class="detail-table__meta">${escapeHtml(reward.provider)}</span>` : "";
      return `
        <tr>
          <td>${formatDateTime(entry.redeemedAt)}</td>
          <td>
            <strong>${escapeHtml(rewardName)}</strong>
            ${provider}
          </td>
          <td>${formatNumber(reward?.pointsCost || 0)} pts</td>
          <td>
            <span class="badge" data-state="${escapeHtml(entry.status || "pending")}">
              ${escapeHtml(entry.status || "pending")}
            </span>
          </td>
        </tr>
      `;
    })
    .join("");

  const tableMarkup = redemptions.length
    ? `
      <div class="detail-table-wrapper">
        <table class="detail-table detail-table--reports">
          <thead>
            <tr>
              <th>Redeemed</th>
              <th>Reward</th>
              <th>Points</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>${rowsMarkup}</tbody>
        </table>
      </div>
    `
    : `<div class="customer-detail__empty">No rewards redeemed yet. Redeem from the hub to see history appear here.</div>`;

  return `
    <header class="customer-detail-header">
      <button type="button" class="button-pill button-pill--ghost customer-detail__back" data-action="back-to-hub">
        Back to hub
      </button>
      <span class="customer-detail__eyebrow">Rewards</span>
      <h1>Your redemption history</h1>
      <p>Show stakeholders how Weld provides instant recognition and celebration moments.</p>
    </header>
    ${tableMarkup}
  `;
}

function renderClientDashboard() {
  const clients = Array.isArray(state.clients) ? state.clients.slice() : [];
  const totalActiveUsers = clients.reduce(
    (sum, client) => sum + (Number(client.activeUsers) || 0),
    0
  );
  const averageHealth = clients.length
    ? Math.round(
        clients.reduce((sum, client) => sum + (Number(client.healthScore) || 0), 0) / clients.length
      )
    : 0;
  const openCases = clients.reduce((sum, client) => sum + (Number(client.openCases) || 0), 0);
  const pendingMessages = Array.isArray(state.messages)
    ? state.messages.filter(message => message?.status === MessageStatus.PENDING).length
    : 0;

  const metricsConfig = [
    {
      label: "Active reporters",
      value: clients.length ? formatNumber(totalActiveUsers) : "—",
      trend: clients.length
        ? { direction: "up", value: "+18", caption: "vs last quarter" }
        : { direction: "up", value: "Ready to demo", caption: "Add sample data" },
      tone: "indigo",
      icon: "rocket"
    },
    {
      label: "Average health",
      value: clients.length ? `${formatNumber(averageHealth)}%` : "—",
      trend: clients.length
        ? { direction: "up", value: "+5 pts", caption: "quarter to date" }
        : { direction: "up", value: "Set baseline", caption: "Import client scores" },
      tone: "emerald",
      icon: "shield"
    },
    {
      label: "Open cases",
      value: formatNumber(openCases),
      trend: openCases > 0
        ? { direction: "up", value: `${formatNumber(openCases)} escalations`, caption: "Prioritise follow-up" }
        : { direction: "down", value: "Queue cleared", caption: "No escalations pending" },
      tone: "amber",
      icon: "hourglass"
    },
    {
      label: "Pending approvals",
      value: formatNumber(pendingMessages),
      trend: pendingMessages > 0
        ? { direction: "up", value: `${formatNumber(pendingMessages)} awaiting`, caption: "Action in security view" }
        : { direction: "down", value: "All approved", caption: "Celebrate the wins" },
      tone: "fuchsia",
      icon: "target"
    }
  ];

  const metricsMarkup = metricsConfig
    .map(metric => renderMetricCard(metric.label, metric.value, metric.trend, metric.tone, metric.icon))
    .join("");

  const clientCards = clients.length
    ? clients
        .map(client => {
          const healthScore = Number.isFinite(client.healthScore)
            ? `${formatNumber(client.healthScore)}%`
            : "—";
          const activeUsers = Number.isFinite(client.activeUsers)
            ? formatNumber(client.activeUsers)
            : "—";
          const openCasesValue = Number.isFinite(client.openCases)
            ? formatNumber(client.openCases)
            : "0";
          const lastReportedAt = client.lastReportAt
            ? formatDateTime(client.lastReportAt)
            : "No recent reports";
          const lastReportedRelative = client.lastReportAt
            ? relativeTime(client.lastReportAt)
            : "Awaiting first signal";
          const organisationId = client.organizationId
            ? `Org ID: ${escapeHtml(client.organizationId)}`
            : "Org ID pending";
          return `
            <article class="client-card">
              <div>
                <span class="landing__addin-eyebrow">Organisation</span>
                <h2>${escapeHtml(client.name)}</h2>
                <p>${organisationId}</p>
              </div>
              <div class="client-card__stats">
                <div>
                  <label>Health score</label>
                  <span>${healthScore}</span>
                </div>
                <div>
                  <label>Active reporters</label>
                  <span>${activeUsers}</span>
                </div>
                <div>
                  <label>Open cases</label>
                  <span>${openCasesValue}</span>
                </div>
              </div>
              <footer>
                <div>
                  <label>Last reporter signal</label>
                  <strong>${lastReportedAt}</strong>
                  <span class="landing__addin-eyebrow">${escapeHtml(lastReportedRelative)}</span>
                </div>
                <div class="table-actions">
                  <button type="button" data-route="client-reporting" data-role="client">Security dashboard</button>
                  <button type="button" data-route="client-rewards" data-role="client">Rewards catalogue</button>
                </div>
              </footer>
            </article>
          `;
        })
        .join("")
    : `<div class="customer-detail__empty">Add a client profile to unlock the storytelling metrics.</div>`;

  return `
    <section class="client-catalogue__intro">
      <span class="client-catalogue__eyebrow">Organisation dashboard</span>
      <h1>Track health and momentum in one glance.</h1>
      <p>Use this view to connect reporter energy, security follow-up, and the rewards in flight. Everything aligns to the questions prospects ask.</p>
    </section>
    <section class="metrics-grid">
      ${metricsMarkup}
    </section>
    <section class="clients-grid">
      ${clientCards}
    </section>
  `;
}

function renderClientReporting() {
  const messages = Array.isArray(state.messages)
    ? state.messages.slice().sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime())
    : [];

  const rowsMarkup = messages
    .map(message => {
      const reasons = Array.isArray(message.reasons) ? message.reasons.map(reasonById).filter(Boolean) : [];
      const reasonChips = reasons
        .map(reason => `<span class="detail-chip">${escapeHtml(reason.description)}</span>`)
        .join("");
      const client =
        state.clients && message && Number.isFinite(message.clientId)
          ? state.clients.find(item => Number(item.id) === Number(message.clientId))
          : null;
      const reporterName = message?.reporterName ? escapeHtml(message.reporterName) : "Reporter";
      const reporterEmail = message?.reporterEmail ? escapeHtml(message.reporterEmail) : "n/a";
      const clientName = client ? escapeHtml(client.name) : "Client view";
      const clientOrgId = client?.organizationId ? escapeHtml(client.organizationId) : "Org ID pending";
      const reportedAt = message?.reportedAt ? formatDateTime(message.reportedAt) : "Unknown";
      const status = escapeHtml(message?.status || MessageStatus.PENDING);
      const isPending = message?.status === MessageStatus.PENDING;
      const approvePoints = Number(message?.pointsOnApproval) || 0;
      const capturePoints = Number(message?.pointsOnMessage) || 0;
      const totalPoints = capturePoints + (message?.status === MessageStatus.APPROVED ? approvePoints : 0);
      const actionsMarkup = isPending
        ? `<div class="table-actions">
            <button type="button" class="button-pill button-pill--primary" data-action="approve" data-message="${escapeHtml(
              String(message.id)
            )}">Approve</button>
            <button type="button" class="button-pill button-pill--critical" data-action="reject" data-message="${escapeHtml(
              String(message.id)
            )}">Reject</button>
          </div>`
        : `<span class="detail-table__meta">Decision recorded</span>`;
      return `
        <tr>
          <td>${reportedAt}</td>
          <td>
            <strong>${reporterName}</strong>
            <span class="detail-table__meta">${reporterEmail}</span>
          </td>
          <td>
            <strong>${clientName}</strong>
            <span class="detail-table__meta">${clientOrgId}</span>
          </td>
          <td>
            <strong>${escapeHtml(message?.subject || "Suspicious message")}</strong>
            ${reasonChips ? `<div class="detail-table__chips">${reasonChips}</div>` : ""}
          </td>
          <td>
            <div class="detail-table__points">
              <span>+${formatNumber(capturePoints)}</span>
              ${message?.status === MessageStatus.APPROVED ? `<span>+${formatNumber(approvePoints)}</span>` : ""}
              <strong>= ${formatNumber(totalPoints)}</strong>
            </div>
          </td>
          <td>
            <span class="badge" data-state="${status}">${status}</span>
            ${actionsMarkup}
          </td>
        </tr>
      `;
    })
    .join("");

  const tableMarkup = messages.length
    ? `
      <div class="detail-table-wrapper">
        <table class="detail-table detail-table--reports detail-table--client">
          <thead>
            <tr>
              <th>Reported</th>
              <th>Reporter</th>
              <th>Client</th>
              <th>Subject &amp; reasons</th>
              <th>Points</th>
              <th>Status &amp; actions</th>
            </tr>
          </thead>
          <tbody>${rowsMarkup}</tbody>
        </table>
      </div>
    `
    : `<div class="customer-detail__empty">No security follow-up yet. Use the add-in journey to generate the first report.</div>`;

  return `
    <section class="client-catalogue__intro">
      <span class="client-catalogue__eyebrow">Security team dashboard</span>
      <h1>Approve reports and talk through the audit trail.</h1>
      <p>Highlight how reviewers approve submissions, gift bonus points, and export a full audit log without leaving the workflow.</p>
      <div class="client-rewards__actions">
        <button type="button" class="button-pill button-pill--primary" id="download-csv-button">Download CSV</button>
      </div>
    </section>
    ${tableMarkup}
  `;
}

function renderClientRewards() {
  const rewards = Array.isArray(state.rewards) ? state.rewards.slice() : [];
  const publishedRewards = rewards.filter(reward => reward.published);
  const draftRewards = rewards.filter(reward => !reward.published);
  const averageCost = rewards.length
    ? Math.round(
        rewards.reduce((sum, reward) => sum + (Number(reward.pointsCost) || 0), 0) / rewards.length
      )
    : 0;
  const totalInventory = rewards.reduce((sum, reward) => {
    if (reward?.unlimited) return sum;
    return sum + (Number(reward?.remaining) || 0);
  }, 0);

  const categoryMap = new Map();
  rewards.forEach(reward => {
    const rawCategory = typeof reward.category === "string" ? reward.category.trim() : "";
    if (!rawCategory) return;
    const normalized = rawCategory.toLowerCase();
    if (!categoryMap.has(normalized)) {
      categoryMap.set(normalized, rawCategory);
    }
  });

  const rewardCategories = Array.from(categoryMap.entries())
    .sort((a, b) => a[1].localeCompare(b[1], undefined, { sensitivity: "base" }))
    .map(([value, label]) => ({ value, label }));

  const activeFilter =
    typeof state.meta.rewardFilter === "string" && state.meta.rewardFilter.length > 0
      ? state.meta.rewardFilter
      : null;

  const filteredRewards = activeFilter
    ? rewards.filter(reward => {
        const category = typeof reward.category === "string" ? reward.category.trim().toLowerCase() : "";
        return category === activeFilter;
      })
    : rewards;

  const metricsConfig = [
    {
      label: "Total catalogue",
      value: formatNumber(rewards.length),
      caption: "Configured experiences"
    },
    {
      label: "Published rewards",
      value: formatNumber(publishedRewards.length),
      caption: "Visible to reporters"
    },
    {
      label: "Draft rewards",
      value: formatNumber(draftRewards.length),
      caption: "Ready for the next launch"
    },
    {
      label: "Average cost",
      value: rewards.length ? `${formatNumber(averageCost)} pts` : "--",
      caption: "Across the catalogue"
    }
  ];

  const metricsMarkup = metricsConfig
    .map(
      metric => `
        <article class="client-rewards__metric">
          <h3>${escapeHtml(metric.label)}</h3>
          <strong>${escapeHtml(String(metric.value))}</strong>
          <span>${escapeHtml(metric.caption)}</span>
        </article>
      `
    )
    .join("");

  const rewardsMarkup = filteredRewards.length
    ? filteredRewards
        .map(reward => {
          const id = escapeHtml(String(reward.id));
          const isPublished = reward.published === true;
          const action = isPublished ? "unpublish" : "publish";
          const actionLabel = isPublished ? "Unpublish from hubs" : "Publish to hubs";
          const actionTone = isPublished ? "button-pill--danger-light" : "button-pill--primary";
          const remainingLabel = rewardRemainingLabel(reward);
          const remainingCopy =
            reward?.unlimited === true
              ? "Unlimited redemptions"
              : `${remainingLabel} remaining`;
          const categoryLabel = formatCatalogueLabel(reward.category || "Reward");
          const providerLabel = reward.provider ? reward.provider : "WeldSecure";
          return `
            <article class="reward-card reward-card--catalogue ${isPublished ? "reward-card--published" : "reward-card--draft"}" data-reward="${id}">
              <div class="reward-card__artwork" style="background:${reward.image};">
                ${renderIcon(reward.icon || "gift", "lg")}
              </div>
              <div class="reward-card__meta catalogue-card__tags">
                <span class="catalogue-card__tag reward-card__chip reward-card__chip--category">${escapeHtml(
                  categoryLabel
                )}</span>
                <span class="catalogue-card__tag reward-card__chip reward-card__chip--provider">${escapeHtml(
                  providerLabel
                )}</span>
              </div>
              <h4 class="reward-card__title">${escapeHtml(reward.name || "Reward")}</h4>
              <p class="reward-card__desc">${escapeHtml(reward.description || "")}</p>
              <div class="reward-card__footer">
                <strong>${formatNumber(Number(reward.pointsCost) || 0)} pts</strong>
                <span>${remainingCopy}</span>
              </div>
              <div class="reward-card__actions">
                <span class="detail-table__meta">${isPublished ? "Published to hubs" : "Draft only"}</span>
                <button
                  type="button"
                  class="button-pill ${actionTone} reward-publish-toggle"
                  data-reward="${id}"
                  data-action="${action}">
                  ${actionLabel}
                </button>
              </div>
            </article>
          `;
        })
        .join("")
    : `<div class="customer-detail__empty">${
        rewards.length
          ? "No rewards match the selected filter."
          : "Create your first reward to spark recognition moments."
      }</div>`;

  const catalogueMarkup = filteredRewards.length
    ? `<div class="reward-grid reward-grid--catalogue">${rewardsMarkup}</div>`
    : rewardsMarkup;

  const baseInventoryCopy =
    rewards.length && totalInventory > 0
      ? `${formatNumber(totalInventory)} total items remaining`
      : rewards.length
      ? "Inventory updates live as redemptions happen"
      : "Add rewards to build your catalogue narrative.";

  const filterSummary = activeFilter
    ? `${formatNumber(filteredRewards.length)} of ${formatNumber(rewards.length)} rewards shown`
    : "";

  const actionsMeta = [filterSummary, baseInventoryCopy].filter(Boolean).join(" | ") || baseInventoryCopy;

  const filterButtons = rewardCategories
    .map(category => {
      const value = escapeHtml(category.value);
      const isActive = activeFilter === category.value;
      const label = formatCatalogueLabel(category.label);
      return `
        <button
          type="button"
          class="badge-filter__item${isActive ? " badge-filter__item--active" : ""}"
          data-reward-filter="${value}"
          aria-pressed="${isActive ? "true" : "false"}">
          ${escapeHtml(label)}
        </button>
      `;
    })
    .join("");

  const filterMarkup =
    rewardCategories.length > 1
      ? `
        <div class="catalogue-filter badge-filter client-rewards__filters" role="toolbar" aria-label="Reward categories">
          <button
            type="button"
            class="badge-filter__item${activeFilter ? "" : " badge-filter__item--active"}"
            data-reward-filter=""
            aria-pressed="${activeFilter ? "false" : "true"}">
            All rewards
          </button>
          ${filterButtons}
        </div>
      `
      : "";

  return `
    <section class="client-catalogue__intro">
      <span class="client-catalogue__eyebrow">Rewards catalogue</span>
      <h1>Curate recognition that converts champions.</h1>
      <p>Toggle availability and talk through the narrative. Weld makes it easy to ship curated rewards in every launch.</p>
    </section>
    <section class="client-rewards__metrics">
      ${metricsMarkup}
    </section>
    <div class="client-rewards__actions">
      <div class="client-rewards__bulk">
        <button type="button" class="button-pill button-pill--primary" data-bulk-reward-action="publish">Publish all rewards</button>
        <button type="button" class="button-pill button-pill--danger-light" data-bulk-reward-action="unpublish">Unpublish all rewards</button>
      </div>
      ${filterMarkup}
      <p class="detail-table__meta">${escapeHtml(actionsMeta)}</p>
    </div>
    ${catalogueMarkup}
  `;
}

function renderClientQuests() {
  const quests = Array.isArray(state.quests)
    ? state.quests.slice().sort(compareQuestsByDifficulty)
    : [];
  const publishedQuests = quests.filter(quest => quest.published);
  const draftQuests = quests.filter(quest => !quest.published);
  const averagePoints = quests.length
    ? Math.round(quests.reduce((sum, quest) => sum + (Number(quest.points) || 0), 0) / quests.length)
    : 0;
  const averageDuration = quests.length
    ? Math.round(
        quests.reduce((sum, quest) => sum + (Number(quest.duration) || 0), 0) / quests.length
      )
    : 0;

  const categoryMap = new Map();
  quests.forEach(quest => {
    const rawCategory = typeof quest.category === "string" ? quest.category.trim() : "";
    if (!rawCategory) return;
    const normalized = rawCategory.toLowerCase();
    if (!categoryMap.has(normalized)) {
      categoryMap.set(normalized, rawCategory);
    }
  });

  const questCategories = Array.from(categoryMap.entries())
    .sort((a, b) => a[1].localeCompare(b[1], undefined, { sensitivity: "base" }))
    .map(([value, label]) => ({ value, label }));

  const activeFilter =
    typeof state.meta.questFilter === "string" && state.meta.questFilter.length > 0
      ? state.meta.questFilter
      : null;

  const filteredQuests = activeFilter
    ? quests.filter(quest => {
        const category = typeof quest.category === "string" ? quest.category.trim().toLowerCase() : "";
        return category === activeFilter;
      })
    : quests;

  const metricsConfig = [
    {
      label: "Total quests",
      value: formatNumber(quests.length),
      caption: "Across the catalogue"
    },
    {
      label: "Published quests",
      value: formatNumber(publishedQuests.length),
      caption: "Visible to reporters"
    },
    {
      label: "Draft quests",
      value: formatNumber(draftQuests.length),
      caption: "Queued for the next beat"
    },
    {
      label: "Average duration",
      value: quests.length ? `${formatNumber(averageDuration)} min` : "--",
      caption: "Per quest experience"
    }
  ];

  const metricsMarkup = metricsConfig
    .map(
      metric => `
        <article class="client-quests__metric">
          <h3>${escapeHtml(metric.label)}</h3>
          <strong>${escapeHtml(String(metric.value))}</strong>
          <span>${escapeHtml(metric.caption)}</span>
        </article>
      `
    )
    .join("");

  const questsMarkup = filteredQuests.length
    ? filteredQuests
        .map(quest => {
          const id = escapeHtml(String(quest.id));
          const isPublished = quest.published === true;
          const action = isPublished ? "unpublish" : "publish";
          const actionLabel = isPublished ? "Unpublish from hubs" : "Publish to hubs";
          const actionTone = isPublished ? "button-pill--danger-light" : "button-pill--primary";
          const tagItems = [];
          if (quest.difficulty) {
            tagItems.push(
              `<span class="catalogue-card__tag quest-card__chip quest-card__chip--difficulty" data-difficulty="${escapeHtml(
                quest.difficulty
              )}">${escapeHtml(quest.difficulty)}</span>`
            );
          }
          if (quest.category) {
            tagItems.push(
              `<span class="catalogue-card__tag quest-card__chip">${escapeHtml(
                formatCatalogueLabel(quest.category)
              )}</span>`
            );
          }
          const tagMarkup = tagItems.length
            ? `<div class="quest-card__chip-group catalogue-card__tags">${tagItems.join("")}</div>`
            : "";
          const focusMarkup = Array.isArray(quest.focus) && quest.focus.length
            ? `<div class="quest-card__focus">${quest.focus
                .slice(0, 3)
                .map(item => `<span>${escapeHtml(item)}</span>`)
                .join("")}</div>`
            : "";
          return `
            <article class="quest-card ${isPublished ? "quest-card--published" : "quest-card--draft"}" data-quest="${id}">
              <header class="quest-card__header">
                ${tagMarkup}
              </header>
              <h3 class="quest-card__title">${escapeHtml(quest.title || "Quest")}</h3>
              <p class="quest-card__description">${escapeHtml(quest.description || "")}</p>
              <ul class="quest-card__details">
                <li><span>Format</span><strong>${escapeHtml(quest.format || "Interactive")}</strong></li>
                <li><span>Duration</span><strong>${formatNumber(Number(quest.duration) || 0)} min</strong></li>
                <li><span>Questions</span><strong>${formatNumber(Number(quest.questions) || 0)}</strong></li>
                <li><span>Points</span><strong>${formatNumber(Number(quest.points) || 0)} pts</strong></li>
              </ul>
              ${focusMarkup}
              ${
                quest.bonus
                  ? `<p class="detail-table__meta"><strong>${escapeHtml(quest.bonus)}</strong> ${escapeHtml(
                      quest.bonusDetail || ""
                    )}</p>`
                  : ""
              }
              <footer class="quest-card__footer">
                <button
                  type="button"
                  class="button-pill ${actionTone} quest-publish-toggle"
                  data-action="${action}"
                  data-quest="${id}">
                  ${actionLabel}
                </button>
              </footer>
            </article>
          `;
        })
        .join("")
    : `<div class="customer-detail__empty">${
        quests.length
          ? "No quests match the selected filter."
          : "Build a quest to showcase how Weld coaches behaviour change."
      }</div>`;

  const catalogueMarkup = filteredQuests.length
    ? `<div class="quest-grid quest-grid--catalogue">${questsMarkup}</div>`
    : questsMarkup;

  const filterButtons = questCategories
    .map(category => {
      const value = escapeHtml(category.value);
      const isActive = activeFilter === category.value;
      const label = formatCatalogueLabel(category.label);
      return `
        <button
          type="button"
          class="badge-filter__item${isActive ? " badge-filter__item--active" : ""}"
          data-quest-filter="${value}"
          aria-pressed="${isActive ? "true" : "false"}">
          ${escapeHtml(label)}
        </button>
      `;
    })
    .join("");

  const filterMarkup =
    questCategories.length > 1
      ? `
        <div class="catalogue-filter badge-filter client-quests__filters" role="toolbar" aria-label="Quest categories">
          <button
            type="button"
            class="badge-filter__item${activeFilter ? "" : " badge-filter__item--active"}"
            data-quest-filter=""
            aria-pressed="${activeFilter ? "false" : "true"}">
            All quests
          </button>
          ${filterButtons}
        </div>
      `
      : "";

  const filterSummary = activeFilter
    ? `${formatNumber(filteredQuests.length)} of ${formatNumber(quests.length)} quests shown`
    : "";

  const guidanceCopy = "Use the publish toggles to talk through seasonal programming or targeted enablement waves.";
  const actionsMeta = [filterSummary, guidanceCopy].filter(Boolean).join(" | ");

  return `
    <section class="client-catalogue__intro">
      <span class="client-catalogue__eyebrow">Quest catalogue</span>
      <h1>Coach behaviour change with curated quests.</h1>
      <p>Demonstrate how Weld guides employees through inbox scenarios, verifies understanding, and rewards mastery.</p>
    </section>
    <section class="client-quests__metrics">
      ${metricsMarkup}
    </section>
    <div class="client-quests__actions">
      <div class="client-quests__bulk">
        <button type="button" class="button-pill button-pill--primary" data-bulk-quest-action="publish">Publish all quests</button>
        <button type="button" class="button-pill button-pill--danger-light" data-bulk-quest-action="unpublish">Unpublish all quests</button>
      </div>
      ${filterMarkup}
      <p class="detail-table__meta">${escapeHtml(actionsMeta)}</p>
    </div>
    ${catalogueMarkup}
  `;
}

function renderClientBadges() {
  const badges = getBadges().slice();
  const difficultyOrder = ["Starter", "Rising", "Skilled", "Expert", "Legendary"];
  badges.sort((a, b) => {
    const indexA = difficultyOrder.indexOf(typeof a.difficulty === "string" ? a.difficulty : "Skilled");
    const indexB = difficultyOrder.indexOf(typeof b.difficulty === "string" ? b.difficulty : "Skilled");
    const diffRankA = indexA === -1 ? difficultyOrder.length : indexA;
    const diffRankB = indexB === -1 ? difficultyOrder.length : indexB;
    if (diffRankA !== diffRankB) return diffRankA - diffRankB;
    const categoryA = typeof a.category === "string" ? a.category : "";
    const categoryB = typeof b.category === "string" ? b.category : "";
    if (categoryA !== categoryB) return categoryA.localeCompare(categoryB, undefined, { sensitivity: "base" });
    const pointsA = Number(a.points) || 0;
    const pointsB = Number(b.points) || 0;
    if (pointsA !== pointsB) return pointsB - pointsA;
    const titleA = typeof a.title === "string" ? a.title : "";
    const titleB = typeof b.title === "string" ? b.title : "";
    return titleA.localeCompare(titleB, undefined, { sensitivity: "base" });
  });

  const publishedBadges = badges.filter(badge => badge.published);
  const draftBadges = badges.filter(badge => !badge.published);
  const publishedPointsTotal = publishedBadges.reduce((sum, badge) => sum + (Number(badge.points) || 0), 0);
  const totalPoints = badges.reduce((sum, badge) => sum + (Number(badge.points) || 0), 0);

  const categoryMap = new Map();
  badges.forEach(badge => {
    const rawCategory = typeof badge.category === "string" ? badge.category.trim() : "";
    if (!rawCategory) return;
    const normalized = rawCategory.toLowerCase();
    if (!categoryMap.has(normalized)) {
      categoryMap.set(normalized, rawCategory);
    }
  });

  const categories = Array.from(categoryMap.entries())
    .sort((a, b) => a[1].localeCompare(b[1], undefined, { sensitivity: "base" }))
    .map(([value, label]) => ({ value, label }));

  const activeFilter =
    typeof state.meta.badgeFilter === "string" && state.meta.badgeFilter.length > 0
      ? state.meta.badgeFilter
      : null;

  const filteredBadges = activeFilter
    ? badges.filter(badge => {
        const category = typeof badge.category === "string" ? badge.category.trim().toLowerCase() : "";
        return category === activeFilter;
      })
    : badges;

  const averagePublishedPoints = publishedBadges.length ? Math.round(publishedPointsTotal / publishedBadges.length) : 0;
  const averageLabel = publishedBadges.length ? formatNumber(averagePublishedPoints) : "--";
  const totalPointsCopy = `${formatNumber(totalPoints)} total points minted | Avg ${averageLabel} pts per published badge`;

  const filterButtons = categories
    .map(category => {
      const isActive = activeFilter === category.value;
      const value = escapeHtml(category.value);
      const label = formatCatalogueLabel(category.label);
      return `
        <button
          type="button"
          class="badge-filter__item${isActive ? " badge-filter__item--active" : ""}"
          data-badge-filter="${value}"
          aria-pressed="${isActive ? "true" : "false"}">
          ${escapeHtml(label)}
        </button>
      `;
    })
    .join("");

  const filterMarkup = categories.length
    ? `
      <div class="badge-gallery__filters badge-filter client-badges__filters" role="toolbar" aria-label="Badge categories">
        <button
          type="button"
          class="badge-filter__item${activeFilter ? "" : " badge-filter__item--active"}"
          data-badge-filter=""
          aria-pressed="${activeFilter ? "false" : "true"}">
          All badges
        </button>
        ${filterButtons}
      </div>
    `
    : "";

  const gridMarkup = filteredBadges.length
    ? filteredBadges
        .map((badge, index) => {
          const rawId = String(badge.id ?? generateId("badge"));
          const sanitizedId = rawId.replace(/[^a-zA-Z0-9:_-]/g, "-");
          const id = escapeHtml(rawId);
          const cardId = escapeHtml(`badge-card-${index}-${sanitizedId || "detail"}`);
          const action = badge.published ? "unpublish" : "publish";
          const actionLabel = badge.published ? "Unpublish from hubs" : "Publish to hubs";
          const actionTone = badge.published ? "button-pill--danger-light" : "button-pill--primary";
          const toneKey = BADGE_TONES[badge.tone] ? badge.tone : "violet";
          const tone = BADGE_TONES[toneKey] || BADGE_TONES.violet;
          const iconBackdrop =
            BADGE_ICON_BACKDROPS[toneKey]?.background ||
            BADGE_ICON_BACKDROPS.violet?.background ||
            "linear-gradient(135deg, #c7d2fe, #818cf8)";
          const iconShadow =
            BADGE_ICON_BACKDROPS[toneKey]?.shadow || BADGE_ICON_BACKDROPS.violet?.shadow || "rgba(79, 70, 229, 0.32)";
          const difficultyLabel =
            typeof badge.difficulty === "string" && badge.difficulty.trim().length > 0
              ? badge.difficulty.trim()
              : "Skilled";
          const rawCategory =
            typeof badge.category === "string" && badge.category.trim().length > 0
              ? badge.category.trim()
              : "Badge";
          const categoryLabel = formatCatalogueLabel(rawCategory);
          const pointsValue = Number(badge.points) || 0;
          const tags = [];
          if (rawCategory && rawCategory.toLowerCase() !== "badge") {
            tags.push(`<span class="catalogue-card__tag gem-badge-card__tag">${escapeHtml(categoryLabel)}</span>`);
          }
          if (difficultyLabel) {
            tags.push(`<span class="catalogue-card__tag gem-badge-card__tag">${escapeHtml(difficultyLabel)}</span>`);
          }
          const tagsMarkup = tags.length ? `<div class="gem-badge-card__tags catalogue-card__tags">${tags.join("")}</div>` : "";
          const statusLabel = badge.published ? "Published" : "Draft";
          const statusClass = badge.published ? "gem-badge-card__status--published" : "gem-badge-card__status--draft";
          const ariaLabel = `${badge.title} badge, ${difficultyLabel} difficulty, worth ${formatNumber(pointsValue)} points.`;

          return `
            <article
              class="gem-badge ${badge.published ? "gem-badge--published" : "gem-badge--draft"}"
              data-badge="${id}"
              style="--badge-tone:${tone};--badge-icon-tone:${iconBackdrop};--badge-icon-shadow:${iconShadow};">
              <button
                type="button"
                class="gem-badge__trigger"
                aria-haspopup="true"
                aria-label="${escapeHtml(badge.title)} badge details"
                aria-controls="${cardId}">
                <span class="gem-badge__icon" style="background:${iconBackdrop}; box-shadow:0 18px 32px ${iconShadow};">
                  ${renderIcon(badge.icon || "medal", "sm")}
                </span>
              </button>
              <span class="gem-badge__label">${escapeHtml(badge.title)}</span>
              <div
                id="${cardId}"
                class="gem-badge-card ${badge.published ? "gem-badge-card--published" : "gem-badge-card--draft"}"
                role="group"
                aria-label="${escapeHtml(ariaLabel)}">
                <span class="gem-badge-card__halo"></span>
                <span class="gem-badge-card__orb gem-badge-card__orb--one"></span>
                <span class="gem-badge-card__orb gem-badge-card__orb--two"></span>
                <header class="gem-badge-card__header">
                  <span>${escapeHtml(categoryLabel)}</span>
                  <span class="gem-badge-card__status ${statusClass}">${statusLabel}</span>
                </header>
                <div class="gem-badge-card__main">
                  <div class="gem-badge-card__icon">
                    ${renderIcon(badge.icon || "medal", "md")}
                  </div>
                  <h3 class="gem-badge-card__title">${escapeHtml(badge.title)}</h3>
                  ${tagsMarkup}
                  <p class="gem-badge-card__description">${escapeHtml(badge.description)}</p>
                </div>
                <footer class="gem-badge-card__footer">
                  <span class="gem-badge-card__points">
                    <span class="gem-badge-card__points-value">+${formatNumber(pointsValue)}</span>
                    <span class="gem-badge-card__points-unit">pts</span>
                  </span>
                  <button
                    type="button"
                    class="button-pill ${actionTone} badge-publish-toggle gem-badge-card__action"
                    data-action="${action}"
                    data-badge="${id}">
                    ${actionLabel}
                  </button>
                </footer>
              </div>
            </article>
          `;
        })
        .join("")
    : `<div class="badge-empty"><p>${
        activeFilter ? "No badges match the selected filter." : "No badges are configured yet."
      }</p></div>`;

  const metricsConfig = [
    {
      label: "Total badges",
      value: formatNumber(badges.length),
      caption: "Across all tiers"
    },
    {
      label: "Published badges",
      value: formatNumber(publishedBadges.length),
      caption: "Visible in experiences"
    },
    {
      label: "Draft badges",
      value: formatNumber(draftBadges.length),
      caption: "Awaiting publication"
    },
    {
      label: "Catalogue categories",
      value: formatNumber(categories.length),
      caption: "Storytelling themes"
    }
  ];

  const metricsMarkup = metricsConfig
    .map(
      metric => `
        <article class="badge-gallery__metric client-badges__metric">
          <h3>${escapeHtml(metric.label)}</h3>
          <strong>${escapeHtml(String(metric.value))}</strong>
          <span>${escapeHtml(metric.caption)}</span>
        </article>
      `
    )
    .join("");

  return `
    <section class="badge-gallery" aria-labelledby="badge-gallery-heading">
      <div class="badge-gallery__inner">
        <section class="badge-gallery__hero client-catalogue__intro">
          <span class="badge-gallery__eyebrow client-catalogue__eyebrow">Badge catalogue</span>
          <h1 id="badge-gallery-heading">Badge collection</h1>
          <p>Curate the badge tiers you want squads to chase. Publish just the stories you need and bring the sparkle into every hub and add-in moment.</p>
          <p class="badge-gallery__sub detail-table__meta">${escapeHtml(totalPointsCopy)}</p>
        </section>
        <section class="badge-gallery__metrics client-badges__metrics">
          ${metricsMarkup}
        </section>
        <div class="badge-gallery__actions client-badges__actions">
          <div class="badge-gallery__bulk client-badges__bulk">
            <button
              type="button"
              class="button-pill button-pill--primary"
              data-bulk-badge-action="publish">
              Publish all badges
            </button>
            <button
              type="button"
              class="button-pill button-pill--danger-light"
              data-bulk-badge-action="unpublish">
              Unpublish all badges
            </button>
          </div>
          ${filterMarkup}
        </div>
        <section class="badge-gallery__grid gem-badge-grid client-badges__grid">
          ${gridMarkup}
        </section>
      </div>
    </section>
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

function formatCatalogueLabel(label) {
  if (typeof label !== "string") return "";
  const normalized = label.replace(/[_-]+/g, " ").trim();
  if (!normalized) return "";
  return normalized
    .split(/\s+/)
    .map(word => {
      if (word.length === 0) return "";
      if (word.toUpperCase() === word) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

function formatNumber(value) {
  try {
    return new Intl.NumberFormat().format(Number(value));
  } catch {
    return String(value);
  }
}

function renderPointsTicker(beforeValue, afterValue, awarded, extraAttributes = "") {
  const before = Number.isFinite(beforeValue) ? beforeValue : 0;
  const after = Number.isFinite(afterValue) ? afterValue : before;
  const awardedValue = Number.isFinite(awarded) ? awarded : Math.max(after - before, 0);
  const finalTotal = Number.isFinite(afterValue) ? after : before + awardedValue;
  return `
    <span class="points-ticker" ${extraAttributes} aria-live="polite" data-start="${before}" data-end="${before}" data-final-total="${finalTotal}">
      <span class="points-ticker__value" data-target-end="${before}">${formatNumber(before)}</span>
      <span class="points-ticker__sup" data-total-award="${awardedValue}" data-current-award="0">+0</span>
    </span>
  `;
}

function renderPointsBurst(value, variant, label, index) {
  if (!Number.isFinite(value) || value <= 0) return "";
  const durationSeconds = 3.4;
  const absorbSeconds = 1;
  const inlineStyle = `--burst-duration:${durationSeconds}s;`;
  return `
    <span class="points-burst points-burst--${variant}" data-burst-index="${index}" data-burst-value="${value}" data-burst-duration="${durationSeconds}" data-burst-absorb="${absorbSeconds}" style="${inlineStyle}">
      <span class="points-burst__value">+${formatNumber(value)}</span>
      <span class="points-burst__label">${label}</span>
    </span>
  `;
}

function renderPointsBursts(entries) {
  const fragments = [];
  entries.forEach(entry => {
    if (!entry) return;
    const { value, variant, label } = entry;
    if (!Number.isFinite(value) || value <= 0) return;
    const index = fragments.length;
    const burstMarkup = renderPointsBurst(value, variant, label, index);
    if (burstMarkup) {
      fragments.push(burstMarkup);
    }
  });

  if (fragments.length === 0) return "";
  return `<div class="points-celebration__bursts" aria-hidden="true" data-points-bursts="true">${fragments.join(
    ""
  )}</div>`;
}

function resetCelebrationFireworks(celebrationRoot) {
  if (!celebrationRoot) return;
  const emitters = celebrationRoot.querySelectorAll(".points-celebration__fireworks .firework");
  if (emitters.length === 0) return;
  emitters.forEach(emitter => {
    emitter.style.animation = "none";
    // Force reflow so the browser registers the animation reset.
    void emitter.offsetWidth;
    emitter.style.removeProperty("animation");
  });
}

function setupCelebrationSup(celebrationRoot, onBurstsComplete) {
  if (typeof onBurstsComplete !== "function") {
    onBurstsComplete = () => {};
  }

  resetCelebrationFireworks(celebrationRoot);
  const sup =
    celebrationRoot.querySelector(".points-ticker__sup") ||
    document.querySelector('[data-points-ticker="total"] .points-ticker__sup');
  const celebrationAward = celebrationRoot.querySelector("[data-celebration-award]");
  const resolveTicker = () =>
    celebrationRoot.querySelector(".points-ticker") || document.querySelector('[data-points-ticker="total"]');
  const resetTickerDisplay = () => {
    const ticker = resolveTicker();
    if (!ticker) return;
    const startRaw = Number(ticker.dataset.start);
    if (!Number.isFinite(startRaw)) return;
    const valueEl = ticker.querySelector(".points-ticker__value");
    if (valueEl) {
      valueEl.textContent = formatNumber(startRaw);
      valueEl.dataset.targetEnd = String(startRaw);
    }
    ticker.dataset.end = String(startRaw);
  };
  resetTickerDisplay();
  if (!sup) {
    if (celebrationAward) {
      celebrationAward.textContent = "+0";
    }
    onBurstsComplete();
    return;
  }

  sup.dataset.burstBound = "true";
  const totalAward = Number(sup.dataset.totalAward);
  const safeTotal = Number.isFinite(totalAward) ? Math.max(totalAward, 0) : 0;

  const setSupValue = value => {
    const rounded = Math.max(0, Math.round(value));
    const formatted = formatNumber(rounded);
    sup.textContent = `+${formatted}`;
    sup.dataset.currentAward = String(rounded);
    if (celebrationAward) {
      celebrationAward.textContent = `+${formatted}`;
    }
  };

  let animationFrame = null;
  const animateSup = (target, onComplete) => {
    const start = Number(sup.dataset.currentAward) || 0;
    const clampedTarget = Math.min(Math.max(target, start), safeTotal);
    if (clampedTarget <= start) {
      setSupValue(start);
      if (typeof onComplete === "function") onComplete();
      return;
    }

    if (typeof window === "undefined" || !window.requestAnimationFrame) {
      setSupValue(clampedTarget);
      if (typeof onComplete === "function") onComplete();
      return;
    }

    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }

    const duration = 480;
    const startTime = performance.now();
    const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

    const step = now => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = easeOutCubic(progress);
      const value = start + (clampedTarget - start) * eased;
      setSupValue(value);
      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      } else {
        animationFrame = null;
        setSupValue(clampedTarget);
        if (typeof onComplete === "function") onComplete();
      }
    };

    animationFrame = requestAnimationFrame(step);
  };

  setSupValue(0);

  const burstsContainer = celebrationRoot.querySelector("[data-points-bursts]");
  const bursts = burstsContainer ? Array.from(burstsContainer.querySelectorAll(".points-burst")) : [];
  const resetBurstLayout = () => {
    bursts.forEach(burst => {
      burst.style.removeProperty("--burst-offset");
    });
  };

  const lastBurst = bursts.length > 0 ? bursts[bursts.length - 1] : null;
  const lastDurationRaw = lastBurst ? Number(lastBurst.dataset.burstDuration) : NaN;
  const lastAbsorbRaw = lastBurst ? Number(lastBurst.dataset.burstAbsorb) : NaN;
  const safeLastDuration = Number.isFinite(lastDurationRaw) ? lastDurationRaw : 3.4;
  const safeLastAbsorb = Number.isFinite(lastAbsorbRaw) ? lastAbsorbRaw : 1;
  const finalTailMs = Math.max((safeLastDuration - safeLastAbsorb) * 1000 + 180, 220);

  bursts.forEach(burst => {
    burst.classList.remove("points-burst--active");
    burst.style.removeProperty("display");
    // reset animation by forcing reflow
    void burst.offsetWidth;
  });
  resetBurstLayout();

  const finish = () => {
    const current = Number(sup.dataset.currentAward) || 0;
    const commitTicker = () => {
      const ticker = resolveTicker();
      const valueEl = ticker ? ticker.querySelector(".points-ticker__value") : null;
      if (ticker && valueEl) {
        const startRaw = Number(ticker.dataset.start);
        const startValue = Number.isFinite(startRaw) ? startRaw : 0;
        const plannedTotalRaw = Number(ticker.dataset.finalTotal);
        const plannedTotal = Number.isFinite(plannedTotalRaw) ? plannedTotalRaw : startValue + safeTotal;
        const computedTotal = Number.isFinite(safeTotal) ? startValue + safeTotal : startValue;
        const targetTotal = Number.isFinite(plannedTotal) ? plannedTotal : computedTotal;
        const resolvedTotal = Number.isFinite(targetTotal) ? targetTotal : computedTotal;
        valueEl.dataset.targetEnd = String(resolvedTotal);
        ticker.dataset.end = String(resolvedTotal);
        ticker.dataset.finalTotal = String(resolvedTotal);
      }
      onBurstsComplete();
    };
    if (current < safeTotal) {
      animateSup(safeTotal, commitTicker);
    } else {
      commitTicker();
    }
  };

  if (safeTotal === 0 || bursts.length === 0) {
    animateSup(safeTotal, finish);
    return;
  }

  const playBurst = index => {
    if (index >= bursts.length) {
      window.setTimeout(() => {
        finish();
      }, finalTailMs);
      return;
    }

    const burst = bursts[index];
    const burstValue = Number(burst.dataset.burstValue);
    if (!Number.isFinite(burstValue) || burstValue <= 0) {
      playBurst(index + 1);
      return;
    }

    resetBurstLayout();

    const durationSeconds = Number(burst.dataset.burstDuration) || 3.4;
    burst.style.setProperty("--burst-duration", `${durationSeconds}s`);

    const rawAbsorb = Number(burst.dataset.burstAbsorb) || 1;
    const absorbSeconds = Number.isFinite(rawAbsorb) ? rawAbsorb : 0;
    const absorbMs = absorbSeconds * 1000;
    const cleanupMs = Number.isFinite(durationSeconds)
      ? Math.max(durationSeconds * 1000, absorbMs + 120)
      : absorbMs + 120;

    burst.classList.add("points-burst--active");

    window.setTimeout(() => {
      const current = Number(sup.dataset.currentAward) || 0;
      const target = Math.min(current + burstValue, safeTotal);
      animateSup(target, () => playBurst(index + 1));
    }, absorbMs);

    if (Number.isFinite(cleanupMs) && cleanupMs > 0) {
      window.setTimeout(() => {
        burst.style.display = "none";
      }, cleanupMs);
    }
  };

  playBurst(0);
}

function renderBadgeSpotlight(badge) {
  if (!badge) return "";
  const background = BADGE_TONES[badge.tone] || BADGE_TONES.violet;
  const iconBackdrop = BADGE_ICON_BACKDROPS[badge.tone]?.background || "linear-gradient(135deg, #e0e7ff, #a855f7)";
  const iconShadow = BADGE_ICON_BACKDROPS[badge.tone]?.shadow || "rgba(79, 70, 229, 0.32)";
  return `
    <article class="badge-spotlight" data-badge="${badge.id}" style="--badge-tone:${background};--badge-icon-tone:${iconBackdrop};--badge-icon-shadow:${iconShadow};">
      <div class="badge-spotlight__icon">
        ${renderIcon(badge.icon, "sm")}
      </div>
      <div class="badge-spotlight__content">
        <span class="badge-spotlight__eyebrow">Badge unlocked</span>
        <strong class="badge-spotlight__title">${badge.title}</strong>
        <p class="badge-spotlight__description">${badge.description}</p>
        <span class="badge-spotlight__points">
          <span class="badge-spotlight__points-value">+${formatNumber(badge.points)}</span>
          <span class="badge-spotlight__points-unit">pts</span>
        </span>
      </div>
    </article>
  `;
}

function selectRandomBadge(excludeId) {
  const badges = getBadges();
  const eligible = badges.filter(badge => badge.icon);
  if (eligible.length === 0) return null;
  const publishedEligible = eligible.filter(badge => badge.published !== false);
  const basePool = publishedEligible.length > 0 ? publishedEligible : eligible;
  const pool = excludeId && excludeId.length > 0 ? basePool.filter(badge => badge.id !== excludeId) : basePool;
  const source = pool.length > 0 ? pool : basePool;
  const index = Math.floor(Math.random() * source.length);
  return source[index];
}

function badgeById(id) {
  if (!id) return null;
  return getBadges().find(badge => badge.id === id) || null;
}

function teardownBadgeShowcase() {
  if (typeof document === "undefined") return;
  document.querySelectorAll("[data-badge-showcase][data-badge-bound='true']").forEach(container => {
    const replacement = container.cloneNode(true);
    replacement.removeAttribute("data-badge-bound");
    container.replaceWith(replacement);
  });
}

function setupBadgeShowcase(container) {
  const badgeContainer = container.querySelector("[data-badge-showcase]");
  const badges = getBadges();
  if (!badgeContainer || !Array.isArray(badges) || badges.length === 0) return;

  if (badgeContainer.dataset.badgeBound === "true") {
    return;
  }

  badgeContainer.setAttribute("role", "status");
  badgeContainer.setAttribute("aria-live", "polite");
  badgeContainer.setAttribute("tabindex", "0");
  badgeContainer.setAttribute("aria-label", "Badge spotlight. Activate to view another badge.");

  const showBadge = badge => {
    if (!badge) {
      badgeContainer.innerHTML = "";
      badgeContainer.removeAttribute("data-current-badge");
      return;
    }
    badgeContainer.innerHTML = renderBadgeSpotlight(badge);
    badgeContainer.setAttribute("data-current-badge", badge.id);
  };

  let initialBadge = badgeById(state.meta.lastBadgeId);
  if (!initialBadge) {
    initialBadge = selectRandomBadge(null);
    if (initialBadge) {
      state.meta.lastBadgeId = initialBadge.id;
      persist();
    }
  }

  showBadge(initialBadge);

  const rotateBadge = () => {
    const currentId = badgeContainer.getAttribute("data-current-badge") || null;
    const nextBadge = selectRandomBadge(currentId);
    if (!nextBadge) return;
    showBadge(nextBadge);
  };

  const handleKeydown = event => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    rotateBadge();
  };

  badgeContainer.addEventListener("click", rotateBadge);
  badgeContainer.addEventListener("keydown", handleKeydown);
  badgeContainer.dataset.badgeBound = "true";
}

function renderAddIn() {
  const screen = state.meta.addinScreen;
  const reportForm = `
    <div class="addin-body">
      <fieldset class="addin-field">
        <legend>Why are you reporting this?</legend>
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
      </fieldset>
      <label class="addin-emergency">
        <input type="checkbox" value="clicked-link,opened-attachment,shared-credentials" />
        <span class="addin-emergency__text">Recipient clicked a link, opened an attachment, or entered credentials</span>
      </label>
      <label class="addin-field addin-field--notes">
        Another reason or anything else we should know?
        <textarea rows="3" id="addin-notes" placeholder="Optional context for your security reviewers."></textarea>
      </label>
      <button class="addin-primary" id="addin-submit">Report</button>
    </div>
  `;

  const reportAward = Number.isFinite(state.meta.lastReportPoints) ? state.meta.lastReportPoints : 0;
  const badgeAward = Number.isFinite(state.meta.lastBadgePoints) ? state.meta.lastBadgePoints : 0;
  const afterBalance = Number.isFinite(state.meta.lastBalanceAfter) ? state.meta.lastBalanceAfter : state.customer.currentPoints;
  const fallbackTotal = reportAward + badgeAward;
  const previousBalance = Number.isFinite(state.meta.lastBalanceBefore)
    ? state.meta.lastBalanceBefore
    : Math.max(afterBalance - fallbackTotal, 0);
  let totalAwarded = Number.isFinite(state.meta.lastTotalAwarded)
    ? state.meta.lastTotalAwarded
    : afterBalance - previousBalance;
  if (!Number.isFinite(totalAwarded) || totalAwarded <= 0) {
    totalAwarded = Math.max(fallbackTotal, 0);
  }
  const tickerMarkup = renderPointsTicker(previousBalance, afterBalance, totalAwarded, 'data-points-ticker="total"');
  const burstsMarkup = renderPointsBursts([
    { value: reportAward, variant: "report", label: "Report" },
    { value: badgeAward, variant: "badge", label: "Badge" }
  ]);
  const auroraLayers = [
    { angle: 12, hue: 258, delay: "0s", offsetX: -28, offsetY: -52, shape: "wave1" },
    { angle: -18, hue: 210, delay: "0.08s", offsetX: 6, offsetY: -44, shape: "wave2" },
    { angle: 28, hue: 42, delay: "0.15s", offsetX: -4, offsetY: 6, shape: "wave3" },
    { angle: -6, hue: 320, delay: "0.22s", offsetX: 18, offsetY: -18, shape: "wave4" },
    { angle: 34, hue: 168, delay: "0.3s", offsetX: -20, offsetY: -8, shape: "wave5" }
  ];
  const sparkles = [
    { x: -92, y: -68, delay: "0.32s", size: 18 },
    { x: -32, y: -8, delay: "0.45s", size: 14 },
    { x: 38, y: -10, delay: "0.58s", size: 12 },
    { x: 74, y: -44, delay: "0.72s", size: 16 }
  ];
  const auroraMarkup = auroraLayers
    .map(
      layer => `
        <span class="points-aurora__ribbon points-aurora__ribbon--${layer.shape}" style="--aurora-angle:${layer.angle}deg;--aurora-hue:${layer.hue};--aurora-delay:${layer.delay};--aurora-offset-x:${layer.offsetX}px;--aurora-offset-y:${layer.offsetY}px;"></span>
      `
    )
    .join("");
  const sparklesMarkup = sparkles
    .map(
      sparkle => `
        <span class="points-sparkle" style="--sparkle-x:${sparkle.x}px;--sparkle-y:${sparkle.y}px;--sparkle-delay:${sparkle.delay};--sparkle-size:${sparkle.size}px;"></span>
      `
    )
    .join("");
  const successView = `
    <div class="addin-success">
      <div class="points-celebration points-celebration--aurora">
        <div class="points-celebration__fireworks" aria-hidden="true">
          <div class="firework"></div>
          <div class="firework"></div>
          <div class="firework"></div>
        </div>
        <div class="points-celebration__halo"></div>
        <div class="points-aurora" aria-hidden="true">
          ${auroraMarkup}
        </div>
        <div class="points-celebration__bubble">
          <span class="points-celebration__label">Great catch</span>
          <div class="points-celebration__points">
            <span class="points-celebration__star" aria-hidden="true">
              <svg
                class="badge"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 360 360"
                preserveAspectRatio="xMidYMid meet"
                focusable="false"
              >
                <circle class="outer" fill="#F9D535" stroke="#fff" stroke-width="8" stroke-linecap="round" cx="180" cy="180" r="157"></circle>
                <circle class="inner" fill="#DFB828" stroke="#fff" stroke-width="8" cx="180" cy="180" r="108.3"></circle>
                <path class="inline" d="M89.4 276.7c-26-24.2-42.2-58.8-42.2-97.1 0-22.6 5.6-43.8 15.5-62.4m234.7.1c9.9 18.6 15.4 39.7 15.4 62.2 0 38.3-16.2 72.8-42.1 97" stroke="#CAA61F" stroke-width="7" stroke-linecap="round" fill="none"></path>
                <g class="star">
                  <path fill="#F9D535" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" d="M180 107.8l16.9 52.1h54.8l-44.3 32.2 16.9 52.1-44.3-32.2-44.3 32.2 16.9-52.1-44.3-32.2h54.8z"></path>
                  <circle fill="#DFB828" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" cx="180" cy="107.8" r="4.4"></circle>
                  <circle fill="#DFB828" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" cx="223.7" cy="244.2" r="4.4"></circle>
                  <circle fill="#DFB828" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" cx="135.5" cy="244.2" r="4.4"></circle>
                  <circle fill="#DFB828" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" cx="108.3" cy="160.4" r="4.4"></circle>
                  <circle fill="#DFB828" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" cx="251.7" cy="160.4" r="4.4"></circle>
                </g>
              </svg>
            </span>
            <span class="points-celebration__award">
              <span class="points-celebration__award-value" data-celebration-award>+0</span>
              <span class="points-celebration__award-unit">pts</span>
            </span>
            ${burstsMarkup}
          </div>
        </div>
        <div class="points-sparkles" aria-hidden="true">
          ${sparklesMarkup}
        </div>
      </div>
      <div class="addin-success__badge" data-badge-showcase aria-live="polite"></div>
      <p>The security team will review your report shortly. Your points are available immediately.</p>
      <div class="addin-actions">
        <button class="addin-cta addin-cta--primary" id="addin-view-rewards">
          ${renderIcon("gift", "xs")}
          <span>Rewards</span>
        </button>
      </div>
    </div>
  `;

  const headerPointsDisplay =
    screen === "success"
      ? tickerMarkup
      : `<span class="addin-points__value">${formatNumber(state.customer.currentPoints)}</span>`;
  const showBackNav = screen === "success";
  const backButtonMarkup = showBackNav
    ? `<button type="button" class="addin-header__back" data-addin-back aria-label="Back to report form">
        <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
          <path d="M12.94 4.44a1 1 0 0 1 0 1.41L9.29 9.5l3.65 3.65a1 1 0 1 1-1.41 1.41l-4.36-4.36a1 1 0 0 1 0-1.41l4.36-4.36a1 1 0 0 1 1.41 0z" fill="currentColor"/>
        </svg>
      </button>`
    : "";

  return `
    <div class="addin-page">
      <div class="addin-shell">
        <header class="addin-header">
          <div class="addin-header__top">
            <div class="addin-header__title">
              ${backButtonMarkup}
              ${
                showBackNav
                  ? ""
                  : `<div class="addin-logo">W</div>`
              }
            </div>
            <div class="addin-points" aria-live="polite">
              <span class="addin-points__star" aria-hidden="true">
                <svg
                  class="badge"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 360 360"
                  preserveAspectRatio="xMidYMid meet"
                  focusable="false"
                >
                  <circle class="outer" fill="#F9D535" stroke="#fff" stroke-width="8" stroke-linecap="round" cx="180" cy="180" r="157"></circle>
                  <circle class="inner" fill="#DFB828" stroke="#fff" stroke-width="8" cx="180" cy="180" r="108.3"></circle>
                  <path class="inline" d="M89.4 276.7c-26-24.2-42.2-58.8-42.2-97.1 0-22.6 5.6-43.8 15.5-62.4m234.7.1c9.9 18.6 15.4 39.7 15.4 62.2 0 38.3-16.2 72.8-42.1 97" stroke="#CAA61F" stroke-width="7" stroke-linecap="round" fill="none"></path>
                  <g class="star">
                    <path fill="#F9D535" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" d="M180 107.8l16.9 52.1h54.8l-44.3 32.2 16.9 52.1-44.3-32.2-44.3 32.2 16.9-52.1-44.3-32.2h54.8z"></path>
                    <circle fill="#DFB828" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" cx="180" cy="107.8" r="4.4"></circle>
                    <circle fill="#DFB828" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" cx="223.7" cy="244.2" r="4.4"></circle>
                    <circle fill="#DFB828" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" cx="135.5" cy="244.2" r="4.4"></circle>
                    <circle fill="#DFB828" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" cx="108.3" cy="160.4" r="4.4"></circle>
                    <circle fill="#DFB828" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" cx="251.7" cy="160.4" r="4.4"></circle>
                  </g>
                </svg>
              </span>
              ${headerPointsDisplay}
            </div>
          </div>
          <div class="addin-header__body">
            <h1>Report with Weld</h1>
            <p>Flag anything suspicious, earn recognition, and protect your team.</p>
          </div>
          <div class="addin-status">
            <span>Signed in</span>
            <strong>${state.customer.name}</strong>
          </div>
        </header>
        ${screen === "report" ? reportForm : successView}
      </div>
    </div>
  `;
}

function renderHeader() {
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
    case "customer-reports":
      return renderCustomerReportsPage();
    case "customer-redemptions":
      return renderCustomerRedemptionsPage();
    case "client-dashboard":
      return renderClientDashboard();
    case "client-reporting":
      return renderClientReporting();
    case "client-rewards":
      return renderClientRewards();
    case "client-quests":
      return renderClientQuests();
    case "weld-admin":
      return renderWeldAdmin();
    default:
      return "";
  }
}

function attachBadgeEvents(container) {
  if (!container) return;

  container.addEventListener("click", event => {
    const filterButton = event.target.closest("[data-badge-filter]");
    if (filterButton) {
      const value = (filterButton.getAttribute("data-badge-filter") || "").trim().toLowerCase();
      const nextFilter = value.length > 0 ? value : null;
      if (state.meta.badgeFilter !== nextFilter) {
        state.meta.badgeFilter = nextFilter;
        persist();
        renderApp();
      }
      return;
    }

    const bulkButton = event.target.closest("[data-bulk-badge-action]");
    if (bulkButton) {
      const action = bulkButton.getAttribute("data-bulk-badge-action");
      if (action === "publish") {
        setAllBadgesPublication(true);
      } else if (action === "unpublish") {
        setAllBadgesPublication(false);
      }
      return;
    }

    const toggle = event.target.closest(".badge-publish-toggle");
    if (!toggle) return;
    const badgeId = toggle.getAttribute("data-badge");
    const action = toggle.getAttribute("data-action");
    if (!badgeId || !action) return;
    setBadgePublication(badgeId, action === "publish");
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

  const landingBadge = container.querySelector("[data-landing-badge]");
  if (landingBadge) {
    const restartAnimation = () => {
      const svg = landingBadge.querySelector("svg");
      if (!svg) return;
      const clone = svg.cloneNode(true);
      svg.replaceWith(clone);
    };
    landingBadge.addEventListener("click", () => {
      restartAnimation();
    });
    landingBadge.addEventListener("keydown", event => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      restartAnimation();
    });
  }

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

      const dialogContent = document.createElement("div");
      const nameElement = document.createElement("strong");
      nameElement.textContent = reward.name || "Reward";
      dialogContent.appendChild(nameElement);
      if (reward.description) {
        const descriptionElement = document.createElement("p");
        descriptionElement.textContent = reward.description;
        dialogContent.appendChild(descriptionElement);
      }
      if (reward.provider) {
        const providerElement = document.createElement("span");
        providerElement.textContent = reward.provider;
        dialogContent.appendChild(providerElement);
      }

      openDialog({
        title: "Redeem this reward?",
        description: `This will use ${reward.pointsCost} of your available points.`,
        content: dialogContent,
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
  container.querySelectorAll(".points-card__chip-action").forEach(button => {
    button.addEventListener("click", () => {
      const scrollTarget = button.getAttribute("data-scroll");
      if (scrollTarget) {
        const target = document.querySelector(scrollTarget);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
      const targetRoute = button.getAttribute("data-route");
      if (targetRoute) {
        setRole("customer", targetRoute);
      }
    });
  });
  container.querySelectorAll(".quest-card__cta").forEach(button => {
    button.addEventListener("click", () => {
      setRole("client", "client-quests");
    });
  });
  container.querySelectorAll(".hub-badge__cta").forEach(button => {
    button.addEventListener("click", () => {
      const targetRoute = button.getAttribute("data-route") || "client-badges";
      const targetRole = button.getAttribute("data-role") || "client";
      setRole(targetRole, targetRoute);
    });
  });
}

function attachCustomerReportsEvents(container) {
  const back = container.querySelector("[data-action='back-to-hub']");
  if (back) {
    back.addEventListener("click", () => {
      setRole("customer", "customer");
    });
  }
}

function attachCustomerRedemptionsEvents(container) {
  const back = container.querySelector("[data-action='back-to-hub']");
  if (back) {
    back.addEventListener("click", () => {
      setRole("customer", "customer");
    });
  }
}

function attachClientDashboardEvents(container) {
  if (!container) return;
  container.addEventListener("click", event => {
    const button = event.target.closest(".client-card .table-actions [data-route]");
    if (!button) return;
    event.preventDefault();
    const route = button.getAttribute("data-route");
    const role = button.getAttribute("data-role");
    if (role) {
      setRole(role, route || role);
    } else if (route) {
      navigate(route);
    }
  });
}

function attachClientRewardsEvents(container) {
  container.addEventListener("click", event => {
    const filterButton = event.target.closest("[data-reward-filter]");
    if (filterButton) {
      const value = (filterButton.getAttribute("data-reward-filter") || "").trim().toLowerCase();
      const nextFilter = value.length > 0 ? value : null;
      if (state.meta.rewardFilter !== nextFilter) {
        state.meta.rewardFilter = nextFilter;
        persist();
        renderApp();
      }
      return;
    }

    const bulkButton = event.target.closest("[data-bulk-reward-action]");
    if (bulkButton) {
      const action = bulkButton.getAttribute("data-bulk-reward-action");
      if (action === "publish") {
        setAllRewardsPublication(true);
      } else if (action === "unpublish") {
        setAllRewardsPublication(false);
      }
      return;
    }

    const button = event.target.closest(".reward-publish-toggle");
    if (!button) return;
    const rewardId = Number(button.getAttribute("data-reward"));
    if (!Number.isFinite(rewardId)) return;
    const action = button.getAttribute("data-action");
    if (!action) return;
    const nextPublished = action === "publish";
    setRewardPublication(rewardId, nextPublished);
  });
}

function attachClientQuestsEvents(container) {
  container.addEventListener("click", event => {
    const filterButton = event.target.closest("[data-quest-filter]");
    if (filterButton) {
      const value = (filterButton.getAttribute("data-quest-filter") || "").trim().toLowerCase();
      const nextFilter = value.length > 0 ? value : null;
      if (state.meta.questFilter !== nextFilter) {
        state.meta.questFilter = nextFilter;
        persist();
        renderApp();
      }
      return;
    }

    const bulkButton = event.target.closest("[data-bulk-quest-action]");
    if (bulkButton) {
      const action = bulkButton.getAttribute("data-bulk-quest-action");
      if (action === "publish") {
        setAllQuestsPublication(true);
      } else if (action === "unpublish") {
        setAllQuestsPublication(false);
      }
      return;
    }

    const button = event.target.closest(".quest-publish-toggle");
    if (!button) return;
    const questId = button.getAttribute("data-quest");
    const action = button.getAttribute("data-action");
    if (!questId || !action) return;
    setQuestPublication(questId, action === "publish");
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
    teardownBadgeShowcase();
    const submitBtn = container.querySelector("#addin-submit");
    const emergencyInputs = container.querySelectorAll('.addin-emergency input[type="checkbox"]');
    if (emergencyInputs.length > 0) {
      emergencyInputs.forEach(input => {
        input.checked = false;
      });
    }
    if (submitBtn) {
      submitBtn.addEventListener("click", () => {
        const notesInput = container.querySelector("#addin-notes");
        const reasonCheckboxes = Array.from(
          container.querySelectorAll('.addin-checkbox-list input[type="checkbox"]')
        )
          .filter(input => input.checked)
          .map(input => Number(input.value));
        const notesValue = notesInput ? notesInput.value.trim() : "";

        if (reasonCheckboxes.length === 0 && !notesValue) {
          openDialog({
            title: "Add a reason",
            description: "Select a reason or share additional details so security can triage quickly.",
            confirmLabel: "Close"
          });
          return;
        }

        const primaryReason = reasonById(reasonCheckboxes[0]);
        const generatedSubject = primaryReason
          ? `Suspicious email: ${primaryReason.description}`
          : notesValue
          ? `Suspicious email: ${notesValue.slice(0, 60)}`
          : "Suspicious email reported";
        const generatedMessageId = generateId("MSG").toUpperCase();

        const emergencySelections = Array.from(container.querySelectorAll('.addin-emergency input[type="checkbox"]'))
          .filter(input => input.checked)
          .flatMap(input => input.value.split(","))
          .map(item => item.trim())
          .filter(Boolean);

        reportMessage({
          subject: generatedSubject,
          messageId: generatedMessageId,
          reasons: reasonCheckboxes,
          reporterName: state.customer.name,
          reporterEmail: state.customer.email,
          notes: notesValue,
          emergencyFlags: emergencySelections
        });
      });
    }
  } else {
    if (state.meta.addinScreen === "success") {
      setupCelebrationReplay(container);
      setupBadgeShowcase(container);
      const backControl = container.querySelector("[data-addin-back]");
      if (backControl && backControl.dataset.backBound !== "true") {
        backControl.dataset.backBound = "true";
        backControl.addEventListener("click", () => {
          revertLastReportAward();
        });
      }
    } else {
      teardownBadgeShowcase();
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

  if (route !== "addin") {
    teardownBadgeShowcase();
  }

  if (route === "landing") {
    app.innerHTML = `
      <div class="page page--landing">
        ${renderHeader()}
        <div class="page__inner page__inner--single">
          <main class="layout-content" id="main-content">${renderLanding()}</main>
        </div>
      </div>
    `;
    attachHeaderEvents(app);
    attachGlobalNav(app);
    attachLandingEvents(app);
    return;
  }

  if (route === "client-badges") {
    app.innerHTML = `
      <div class="page">
        ${renderHeader()}
        <div class="page__inner">
          <main class="layout-content" id="main-content">${renderClientBadges()}</main>
        </div>
      </div>
    `;
    attachHeaderEvents(app);
    attachGlobalNav(app);
    const mainContent = app.querySelector("#main-content");
    if (mainContent) attachBadgeEvents(mainContent);
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
  if (route === "customer-reports") attachCustomerReportsEvents(mainContent);
  if (route === "customer-redemptions") attachCustomerRedemptionsEvents(mainContent);
  if (route === "client-dashboard") attachClientDashboardEvents(mainContent);
  if (route === "client-reporting") attachReportingEvents(mainContent);
  if (route === "client-rewards") attachClientRewardsEvents(mainContent);
  if (route === "client-quests") attachClientQuestsEvents(mainContent);
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








