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
  "customer-badges": { requiresRole: "customer" },
  "customer-redemptions": { requiresRole: "customer" },
  "client-dashboard": { requiresRole: "client" },
  "client-reporting": { requiresRole: "client" },
  "client-rewards": { requiresRole: "client" },
  "client-quests": { requiresRole: "client" },
  "weld-admin": { requiresRole: "admin" },
  "weld-labs": { requiresRole: "admin" },
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
      { label: "Reporter", route: "addin", role: "customer" },
      { label: "Hub", route: "customer", role: "customer" }
    ]
  },
  {
    label: "Organisation",
    items: [
      { label: "Organisation Hub", route: "client-dashboard", role: "client" },
      { label: "Security Team Dashboard", route: "client-reporting", role: "client" },
      { label: "Badge Catalogue", route: "client-badges", role: "client" },
      { label: "Quest Catalogue", route: "client-quests", role: "client" },
      { label: "Rewards Catalogue", route: "client-rewards", role: "client" }
    ]
  },
  {
    label: "WeldSecure",
    items: [
      { label: "Weld Admin", route: "weld-admin", role: "admin" },
      { label: "Weld Labs", route: "weld-labs", role: "admin" }
    ]
  }
];

const QUEST_DIFFICULTY_ORDER = ["starter", "intermediate", "advanced"];

const SETTINGS_CATEGORIES = [
  {
    id: "reporter",
    label: "Reporter",
    description: "Configure the reporter add-in experience"
  },
  {
    id: "organisation",
    label: "Organisation",
    description: "Tailor organisation dashboards and engagement",
    disabled: true
  },
  {
    id: "weldsecure",
    label: "WeldSecure",
    description: "Shape WeldSecure playbooks and operations",
    disabled: true
  }
];

const DEFAULT_REPORTER_PROMPT = "Why are you reporting this?";
const DEFAULT_EMERGENCY_LABEL =
  "I clicked a link, opened an attachment, or entered credentials";
const PREVIOUS_EMERGENCY_LABEL =
  "Recipient clicked a link, opened an attachment, or entered credentials";

const DEFAULT_REPORTER_REASONS = [
  { id: "reason-looks-like-phishing", label: "Looks like a phishing attempt" },
  { id: "reason-unexpected-attachment", label: "Unexpected attachment or link" },
  { id: "reason-urgent-tone", label: "Urgent language / suspicious tone" },
  { id: "reason-spoofing-senior", label: "Sender spoofing a senior colleague" },
  { id: "reason-personal-data", label: "Personal data request" }
];

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

const BADGE_CATEGORY_ORDER = [
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
      "Your teammate joins a call from a cafe with customer dashboards on screen. What is the fastest mitigation?",
    walkthrough: {
      summary: "Use this quest to show how remote teammates stay sharp without a SOC on standby.",
      learningObjectives: [
        "Normalise quick remote environment checks before meetings.",
        "Reinforce one-tap escalation from the Reporter add-in when context changes.",
        "Celebrate streak momentum with bonus cues that feel rewarding, not punitive."
      ],
      setup: {
        narrative: "Frame the story around Will, a revenue analyst dialing in from a pop-up coworking space.",
        steps: [
          "From the Reporter Hub, spotlight the quest card and mention the +15 fast finish incentive.",
          "Call out that the quest is five micro-scenarios designed to be answered inside two minutes.",
          "Explain that picking a risky option brings up instant guidance instead of just marking the answer wrong."
        ]
      },
      storyBeats: [
        {
          title: "Beat 1 — Pop-up coworking chaos",
          scenario: "Will squeezes into shared seating minutes before a customer renewal call.",
          prompt: "Quiz asks whether to continue on the open floor, hunt for a focus room, or drop to audio only.",
          idealAction: "Choose the focus room option and mention the in-quest reminder about badge access and privacy screens.",
          callout: "Emphasise that the side panel presents the remote work checklist the moment the answer is submitted."
        },
        {
          title: "Beat 2 — Shoulder surfing risk",
          scenario: "A passer-by glances at pipeline dashboards while screen share is still active.",
          prompt: "Learners decide between pausing the share, enabling blur, or continuing because the call is internal.",
          idealAction: "Select 'Pause share + trigger WeldSecure alert' to show how the quest nudges the escalation flow.",
          callout: "Point to the copy that reassures them a pre-filled Teams message is ready in the add-in."
        },
        {
          title: "Beat 3 — VPN drop mid-call",
          scenario: "The cafe Wi-Fi blips and the device quietly falls back to a hotspot.",
          prompt: "Options include ignoring the change, reconnecting later, or re-authenticating immediately.",
          idealAction: "Pick the immediate re-auth option to surface the fast finish tip for staying under four minutes.",
          callout: "Note how the final screen tees up a recognition post security can paste into Slack."
        }
      ],
      instrumentation: [
        {
          label: "Signals tracked",
          detail: "VPN reconnect confirmations, device posture pings, and focus room bookings feed into Security Dashboards."
        },
        {
          label: "Auto nudges",
          detail: "Unsafe answers trigger microcopy nudging remote work policy, plus a one-click escalation draft."
        }
      ],
      followUp: {
        highlight: "Mention that completing the quest unlocks a templated kudos message security can send instantly.",
        actions: [
          "Jump to the Reporter points card to show the +15 fast finish bonus stacking on streaks.",
          "Switch to the Security Team dashboard to highlight the remote context signal on the next sync."
        ]
      },
      demoTips: [
        "If time is tight, narrate Beat 2 in detail and summarise the others to keep momentum.",
        "Reset demo data after the walkthrough to quickly rerun it with another audience."
      ]
    }
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

const DEPARTMENT_LEADERBOARD = [
  {
    id: "finance-vanguard",
    name: "Finance Vanguard",
    department: "Finance & Procurement",
    points: 1840,
    trendDirection: "up",
    trendValue: "+12%",
    trendCaption: "vs last month",
    participationRate: 0.88,
    streakWeeks: 6,
    avgResponseMinutes: 7,
    featuredBadgeId: "zero-day-zeal",
    featuredQuestId: "phish-flash",
    momentumTag: "Invoice armour programme",
    focusNarrative: "Refined vendor verification playbook and spotlighted cross-team hero catches.",
    tone: "indigo",
    published: true
  },
  {
    id: "people-pulse",
    name: "People Pulse",
    department: "People & Culture",
    points: 1520,
    trendDirection: "up",
    trendValue: "+8%",
    trendCaption: "participation jump",
    participationRate: 0.92,
    streakWeeks: 9,
    avgResponseMinutes: 5,
    featuredBadgeId: "reward-ready",
    featuredQuestId: "remote-first-response",
    momentumTag: "Recognition wave",
    focusNarrative: "Weekend flash quests with live kudos and squad shout-outs.",
    tone: "rose",
    published: true
  },
  {
    id: "engineering-guild",
    name: "Engineering Guild",
    department: "Engineering & Product",
    points: 1375,
    trendDirection: "steady",
    trendValue: "+0%",
    trendCaption: "holding line",
    participationRate: 0.71,
    streakWeeks: 3,
    avgResponseMinutes: 11,
    featuredBadgeId: "automation-ally",
    featuredQuestId: "gen-ai-guardrails",
    momentumTag: "AI guardrails pilot",
    focusNarrative: "Running targeted prompt labs for early adopters before wider launch.",
    tone: "cyan",
    published: false
  },
  {
    id: "operations-shield",
    name: "Operations Shield",
    department: "Operations & Logistics",
    points: 1655,
    trendDirection: "up",
    trendValue: "+5%",
    trendCaption: "vs prior sprint",
    participationRate: 0.83,
    streakWeeks: 7,
    avgResponseMinutes: 8,
    featuredBadgeId: "resilience-ranger",
    featuredQuestId: "incident-escalation-sprint",
    momentumTag: "Tabletop surge",
    focusNarrative: "Daily stand-ups highlight rapid approvals and rerun the crisis sprint.",
    tone: "emerald",
    published: true
  }
];

const ENGAGEMENT_PROGRAMS = [
  {
    id: "double-points-weekender",
    title: "Double points Friday",
    category: "Live boost",
    description: "Run a 90-minute double points window that encourages inbox clean-up before the weekend.",
    metricValue: "x2.1",
    metricCaption: "reports submitted",
    audience: "Finance Vanguard",
    owner: "Security champions",
    status: "Running",
    successSignal: "Finance Vanguard kept a six-week streak after launching this boost.",
    tone: "fuchsia",
    published: true
  },
  {
    id: "quest-mini-series",
    title: "Inbox mini-series",
    category: "Seasonal quest",
    description: "Bundle three quests into a themed playlist with auto-publishing between chapters.",
    metricValue: "87%",
    metricCaption: "completion rate",
    audience: "People Pulse",
    owner: "Enablement squad",
    status: "Scheduled",
    successSignal: "HR tees this up with a Monday post and finishes with raffle shout-outs.",
    tone: "indigo",
    published: false
  },
  {
    id: "legendary-badge-chase",
    title: "Legendary badge chase",
    category: "Badge drop",
    description: "Highlight the newest Legendary badges with a milestone tracker inside the hub.",
    metricValue: "14",
    metricCaption: "Legendary badges minted",
    audience: "All departments",
    owner: "Engagement operations",
    status: "Draft",
    successSignal: "Reporter success view now spotlights the latest Legendary unlock.",
    tone: "amber",
    published: false
  }
];

function initialState() {
  const reporterReasons = DEFAULT_REPORTER_REASONS.map(item => ({ ...item }));

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
      lastBadgeIds: [],
      lastBadgePoints: null,
      lastTotalAwarded: null,
      lastMessageId: null,
      lastClientSnapshot: null,
      rewardFilter: null,
      rewardStatusFilter: null,
      questFilter: null,
      questStatusFilter: null,
      badgeFilter: null,
      badgeStatusFilter: null,
      settingsOpen: false,
      settingsCategory: "reporter"
    },
    settings: {
      reporter: {
        reasonPrompt: DEFAULT_REPORTER_PROMPT,
        emergencyLabel: DEFAULT_EMERGENCY_LABEL,
        reasons: reporterReasons
      }
    },
    customer: {
      id: 501,
      name: "Rachel Summers",
      email: "rachel.summers@example.com",
      currentPoints: 540,
      redeemedPoints: 180,
      clientId: 101,
      bonusPoints: {
        weeklyCap: 150,
        earnedThisWeek: 110,
        breakdown: [
          {
            id: "quests",
            label: "Quests completed",
            description: "First quest this month triggered the double-points boost.",
            points: 60,
            firstOfMonthDouble: true
          },
          {
            id: "boosters",
            label: "Learning boosters",
            description: "Inbox coaching nudges acknowledged within 24 hours.",
            points: 30
          },
          {
            id: "team",
            label: "Team streak bonus",
            description: "Squad hit its weekly response streak target.",
            points: 20
          }
        ]
      },
      questCompletions: []
    },
    teamMembers: [
      {
        id: "rachel-summers",
        name: "Rachel Summers",
        email: "rachel.summers@example.com",
        title: "Operations Lead",
        location: "London HQ",
        specialty: "Finance workflows",
        avatarTone: "violet"
      },
      {
        id: "priya-shah",
        name: "Priya Shah",
        email: "priya.shah@example.com",
        title: "Senior Security Analyst",
        location: "London SOC",
        specialty: "Payment diversion",
        avatarTone: "teal"
      },
      {
        id: "will-adams",
        name: "Will Adams",
        email: "will.adams@example.com",
        title: "Risk Champion — Finance",
        location: "Birmingham",
        specialty: "Executive impersonation",
        avatarTone: "amber"
      },
      {
        id: "daniel-cho",
        name: "Daniel Cho",
        email: "daniel.cho@example.com",
        title: "Trading Operations Associate",
        location: "London HQ",
        specialty: "Market alerts",
        avatarTone: "blue"
      },
      {
        id: "hannah-elliott",
        name: "Hannah Elliott",
        email: "hannah.elliott@example.com",
        title: "Employee Success Partner",
        location: "Manchester",
        specialty: "Awareness programmes",
        avatarTone: "rose"
      }
    ],
    recognitions: [
      {
        id: "rec-1001",
        senderEmail: "priya.shah@example.com",
        senderName: "Priya Shah",
        senderTitle: "Senior Security Analyst",
        recipientEmail: "rachel.summers@example.com",
        recipientName: "Rachel Summers",
        recipientTitle: "Operations Lead",
        points: 35,
        focus: "Vendor payment spoof",
        message:
          "Rachel spotted the spoofed supplier account change before finance processed it and kept GBP 32k in our accounts.",
        channel: "Hub spotlight",
        createdAt: "2025-10-08T09:55:00Z"
      },
      {
        id: "rec-1002",
        senderEmail: "will.adams@example.com",
        senderName: "Will Adams",
        senderTitle: "Risk Champion — Finance",
        recipientEmail: "rachel.summers@example.com",
        recipientName: "Rachel Summers",
        recipientTitle: "Operations Lead",
        points: 20,
        focus: "BEC attempt escalated",
        message:
          "Thanks for looping me in on the fake CEO request. Your context helped us warn the exec team before any funds moved.",
        channel: "Slack kudos",
        createdAt: "2025-10-06T14:25:00Z"
      },
      {
        id: "rec-1003",
        senderEmail: "hannah.elliott@example.com",
        senderName: "Hannah Elliott",
        senderTitle: "Employee Success Partner",
        recipientEmail: "rachel.summers@example.com",
        recipientName: "Rachel Summers",
        recipientTitle: "Operations Lead",
        points: 25,
        focus: "Awareness champion",
        message:
          "Rachel’s town hall walkthrough on spotting bogus invoices gave every squad a playbook to challenge risky requests.",
        channel: "Town hall shout-out",
        createdAt: "2025-10-04T17:20:00Z"
      },
      {
        id: "rec-1004",
        senderEmail: "rachel.summers@example.com",
        senderName: "Rachel Summers",
        senderTitle: "Operations Lead",
        recipientEmail: "daniel.cho@example.com",
        recipientName: "Daniel Cho",
        recipientTitle: "Trading Operations Associate",
        points: 15,
        focus: "Credential lure spotted",
        message:
          "Daniel reset credentials within minutes of the lure email and blocked the follow-up attempt from reaching the desk.",
        channel: "Hub spotlight",
        createdAt: "2025-10-05T11:02:00Z"
      }
    ],
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
    departmentLeaderboard: DEPARTMENT_LEADERBOARD.map(entry => ({
      ...entry
    })),
    engagementPrograms: ENGAGEMENT_PROGRAMS.map(program => ({
      ...program
    })),
    labs: {
      lastReviewAt: "2025-10-18T08:30:00Z",
      features: [
        {
          id: "adaptive-detections",
          name: "Adaptive detection tuning",
          status: "Private beta",
          summary: "Automatically recalibrates phishing heuristics per tenant using cross-network telemetry.",
          benefit: "Cuts analyst investigation time by serving enriched verdicts back into the queue.",
          tags: ["Detection", "Automation"],
          owner: "Product incubation",
          enabledClientIds: [101, 103]
        },
        {
          id: "just-in-time-nudges",
          name: "Just-in-time nudges",
          status: "Design partner",
          summary: "Pushes contextual prompts to employees immediately after a risky action is detected.",
          benefit: "Reduces repeat risky behaviour through targeted reinforcement moments.",
          tags: ["Behaviour change", "Reporter experience"],
          owner: "Behaviour Lab",
          enabledClientIds: [102]
        },
        {
          id: "tenant-signal-exchange",
          name: "Tenant signal exchange",
          status: "Private preview",
          summary: "Shares anonymised threat fingerprints between tenants to accelerate pattern blocking.",
          benefit: "Creates early warning signals ahead of spikes hitting the broader customer base.",
          tags: ["Threat intel", "Network effects"],
          owner: "WeldSecure Labs",
          enabledClientIds: []
        }
      ]
    },
    rewardRedemptions: [
      { id: 1, rewardId: 3, redeemedAt: "2025-09-12T09:30:00Z", status: "fulfilled" }
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
        reasons: ["reason-looks-like-phishing", "reason-urgent-tone"],
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
        reasons: ["reason-unexpected-attachment"],
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
        reasons: ["reason-spoofing-senior", "reason-personal-data"],
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
    const {
      reportReasons: legacyReportReasons,
      settings: storedSettingsRaw,
      ...passthrough
    } = parsed;
    const parsedSettings =
      storedSettingsRaw && typeof storedSettingsRaw === "object" ? storedSettingsRaw : {};
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
    const normalizedRewardRedemptions = Array.isArray(parsed.rewardRedemptions)
      ? parsed.rewardRedemptions.map(entry => ({
          ...entry,
          id: normalizeId(entry.id, "redemption") ?? generateId("redemption")
        }))
      : baseState.rewardRedemptions.map(entry => ({
          ...entry,
          id: normalizeId(entry.id, "redemption") ?? generateId("redemption")
        }));
    const baseTeamMembers = Array.isArray(baseState.teamMembers) ? baseState.teamMembers : [];
    const normalizedTeamMembers = Array.isArray(parsed.teamMembers)
      ? (() => {
          const seenEmails = new Set();
          const normalized = [];
          parsed.teamMembers.forEach(member => {
            if (!member) return;
            const email =
              typeof member.email === "string" && member.email.trim().length > 0
                ? member.email.trim()
                : null;
            if (!email) return;
            const emailKey = email.toLowerCase();
            if (seenEmails.has(emailKey)) return;
            seenEmails.add(emailKey);
            const candidateId = normalizeId(member.id, "member") ?? generateId("member");
            const baseMatch =
              baseTeamMembers.find(baseMember => {
                if (!baseMember) return false;
                if (baseMember.id && baseMember.id === candidateId) return true;
                if (typeof baseMember.email !== "string") return false;
                return baseMember.email.trim().toLowerCase() === emailKey;
              }) || null;
            normalized.push({
              ...(baseMatch ? { ...baseMatch } : {}),
              ...member,
              id: candidateId,
              email
            });
          });
          baseTeamMembers.forEach(baseMember => {
            if (!baseMember || typeof baseMember.email !== "string") return;
            const emailKey = baseMember.email.trim().toLowerCase();
            if (!emailKey || seenEmails.has(emailKey)) return;
            seenEmails.add(emailKey);
            normalized.push({ ...baseMember });
          });
          return normalized;
        })()
      : baseTeamMembers.map(member => ({ ...member }));
    const teamMemberLookup = new Map();
    normalizedTeamMembers.forEach(member => {
      if (!member || typeof member.email !== "string") return;
      const key = member.email.trim().toLowerCase();
      if (!key || teamMemberLookup.has(key)) return;
      teamMemberLookup.set(key, member);
    });
    const normalizedRecognitions = Array.isArray(parsed.recognitions)
      ? (() => {
          const seenIds = new Set();
          return parsed.recognitions
            .map(entry => {
              if (!entry) return null;
              const id = normalizeId(entry.id, "recognition") ?? generateId("recognition");
              if (seenIds.has(id)) return null;
              seenIds.add(id);
              const senderEmail =
                typeof entry.senderEmail === "string" && entry.senderEmail.trim().length > 0
                  ? entry.senderEmail.trim()
                  : null;
              const recipientEmail =
                typeof entry.recipientEmail === "string" && entry.recipientEmail.trim().length > 0
                  ? entry.recipientEmail.trim()
                  : null;
              if (!senderEmail || !recipientEmail) return null;
              const senderMember = teamMemberLookup.get(senderEmail.toLowerCase()) || null;
              const recipientMember = teamMemberLookup.get(recipientEmail.toLowerCase()) || null;
              const rawPoints = Number(entry.points);
              const normalizedPoints =
                Number.isFinite(rawPoints) && rawPoints > 0 ? Math.round(rawPoints) : 0;
              const focusLabel =
                typeof entry.focus === "string" && entry.focus.trim().length > 0
                  ? entry.focus.trim()
                  : "Recognition spotlight";
              const channelLabel =
                typeof entry.channel === "string" && entry.channel.trim().length > 0
                  ? entry.channel.trim()
                  : "Hub spotlight";
              const message =
                typeof entry.message === "string" && entry.message.trim().length > 0
                  ? entry.message.trim()
                  : null;
              if (!message) return null;
              const createdAt =
                typeof entry.createdAt === "string" && entry.createdAt.trim().length > 0
                  ? entry.createdAt.trim()
                  : new Date().toISOString();
              return {
                id,
                senderEmail,
                senderName: entry.senderName || senderMember?.name || senderEmail,
                senderTitle: entry.senderTitle || senderMember?.title || "",
                recipientEmail,
                recipientName: entry.recipientName || recipientMember?.name || recipientEmail,
                recipientTitle: entry.recipientTitle || recipientMember?.title || "",
                points: normalizedPoints,
                focus: focusLabel,
                message,
                channel: channelLabel,
                createdAt
              };
            })
            .filter(Boolean);
        })()
      : (baseState.recognitions || []).map(entry => ({ ...entry }));
    const normalizedLeaderboard = Array.isArray(parsed.departmentLeaderboard)
      ? (() => {
          const baseMap = new Map(
            (baseState.departmentLeaderboard || []).map(entry => [entry.id, entry])
          );
          const seen = new Set();
          const merged = parsed.departmentLeaderboard
            .map(entry => {
              if (!entry) return null;
              const normalizedId = normalizeId(entry.id, "dept") ?? generateId("dept");
              const baseEntry = baseMap.get(normalizedId) || {};
              seen.add(normalizedId);
              return {
                ...baseEntry,
                ...entry,
                id: normalizedId,
                published:
                  typeof entry.published === "boolean"
                    ? entry.published
                    : baseEntry.published ?? true
              };
            })
            .filter(Boolean);
          const additions = (baseState.departmentLeaderboard || [])
            .filter(entry => entry && !seen.has(entry.id))
            .map(entry => ({ ...entry }));
          return [...merged, ...additions];
        })()
      : (baseState.departmentLeaderboard || []).map(entry => ({ ...entry }));
    const normalizedPrograms = Array.isArray(parsed.engagementPrograms)
      ? (() => {
          const baseMap = new Map((baseState.engagementPrograms || []).map(item => [item.id, item]));
          const seen = new Set();
          const merged = parsed.engagementPrograms
            .map(item => {
              if (!item) return null;
              const normalizedId = normalizeId(item.id, "program") ?? generateId("program");
              const baseItem = baseMap.get(normalizedId) || {};
              seen.add(normalizedId);
              return {
                ...baseItem,
                ...item,
                id: normalizedId,
                published:
                  typeof item.published === "boolean"
                    ? item.published
                    : baseItem.published ?? true
              };
            })
            .filter(Boolean);
          const additions = (baseState.engagementPrograms || [])
            .filter(item => item && !seen.has(item.id))
            .map(item => ({ ...item }));
          return [...merged, ...additions];
        })()
      : (baseState.engagementPrograms || []).map(item => ({ ...item }));
    const normalizedLabs = (() => {
      const baseLabs = baseState.labs && typeof baseState.labs === "object" ? baseState.labs : {};
      const parsedLabs = parsed.labs && typeof parsed.labs === "object" ? parsed.labs : {};
      const baseFeatures = Array.isArray(baseLabs.features) ? baseLabs.features : [];
      const parsedFeatures = Array.isArray(parsedLabs.features) ? parsedLabs.features : [];
      const overrides = new Map();
      parsedFeatures.forEach(item => {
        if (!item) return;
        const key =
          typeof item.id === "string" && item.id.trim().length > 0
            ? item.id.trim()
            : typeof item.id === "number" && Number.isFinite(item.id)
            ? String(item.id)
            : null;
        if (!key) return;
        overrides.set(key, { ...item, id: key });
      });
      const normalizeClientIds = source => {
        if (!Array.isArray(source)) return [];
        const seen = new Set();
        const normalized = [];
        source.forEach(value => {
          let candidate = null;
          if (Number.isFinite(value)) {
            candidate = Number(value);
          } else if (typeof value === "string") {
            const trimmed = value.trim();
            if (!trimmed) return;
            const numeric = Number(trimmed);
            candidate = Number.isFinite(numeric) ? numeric : trimmed;
          }
          if (candidate === null) return;
          const key = typeof candidate === "number" ? candidate : String(candidate);
          if (seen.has(key)) return;
          seen.add(key);
          normalized.push(candidate);
        });
        return normalized;
      };
      const mergedFeatures = baseFeatures.map(feature => {
        const id =
          typeof feature.id === "string" && feature.id.trim().length > 0
            ? feature.id.trim()
            : typeof feature.id === "number" && Number.isFinite(feature.id)
            ? String(feature.id)
            : generateId("lab");
        const override = overrides.get(id);
        if (override) {
          overrides.delete(id);
        }
        const enabledSource = override?.enabledClientIds ?? feature.enabledClientIds ?? [];
        return {
          ...feature,
          ...(override ? { ...override } : {}),
          id,
          enabledClientIds: normalizeClientIds(enabledSource)
        };
      });
      overrides.forEach((override, id) => {
        mergedFeatures.push({
          ...override,
          id,
          enabledClientIds: normalizeClientIds(override.enabledClientIds)
        });
      });
      const lastReviewAt =
        typeof parsedLabs.lastReviewAt === "string" && parsedLabs.lastReviewAt.trim().length > 0
          ? parsedLabs.lastReviewAt.trim()
          : typeof baseLabs.lastReviewAt === "string" && baseLabs.lastReviewAt.trim().length > 0
          ? baseLabs.lastReviewAt.trim()
          : null;
      return {
        ...baseLabs,
        ...parsedLabs,
        lastReviewAt,
        features: mergedFeatures
      };
    })();
    const baseReporterSettings = baseState.settings?.reporter || {
      reasonPrompt: DEFAULT_REPORTER_PROMPT,
      emergencyLabel: DEFAULT_EMERGENCY_LABEL,
      reasons: []
    };
    const storedReporterSettings =
      parsedSettings && typeof parsedSettings.reporter === "object"
        ? parsedSettings.reporter
        : null;
    const reporterReasonsSource = Array.isArray(storedReporterSettings?.reasons)
      ? storedReporterSettings.reasons
      : Array.isArray(legacyReportReasons)
      ? legacyReportReasons
      : baseReporterSettings.reasons;
    const seenReasonIds = new Set();
    const reasonIdMap = new Map();
    const normalizedReporterReasons = [];
    reporterReasonsSource.forEach((reason, index) => {
      if (!reason) return;
      const labelSource =
        typeof reason === "string"
          ? reason
          : typeof reason.label === "string"
          ? reason.label
          : typeof reason.description === "string"
          ? reason.description
          : null;
      if (!labelSource) return;
      const label = labelSource.trim();
      if (!label) return;
      const idCandidate =
        typeof reason === "string" ? null : reason.id ?? reason.key ?? reason.value ?? null;
      let normalizedId = normalizeId(idCandidate, "reason");
      const legacyKey = normalizedId;
      if (!normalizedId) {
        normalizedId = `reason-${index + 1}`;
      }
      while (seenReasonIds.has(normalizedId)) {
        normalizedId = `${normalizedId}-${index + 1}`;
      }
      seenReasonIds.add(normalizedId);
      if (legacyKey) {
        reasonIdMap.set(legacyKey, normalizedId);
      }
      reasonIdMap.set(String(index + 1), normalizedId);
      normalizedReporterReasons.push({ id: normalizedId, label });
    });
    const reporterReasons =
      normalizedReporterReasons.length > 0
        ? normalizedReporterReasons
        : baseReporterSettings.reasons.map(item => ({ ...item }));
    const normalizedReporterSettings = {
      reasonPrompt:
        typeof storedReporterSettings?.reasonPrompt === "string" &&
        storedReporterSettings.reasonPrompt.trim().length > 0
          ? storedReporterSettings.reasonPrompt.trim()
          : baseReporterSettings.reasonPrompt,
      emergencyLabel:
        typeof storedReporterSettings?.emergencyLabel === "string" &&
        storedReporterSettings.emergencyLabel.trim().length > 0
          ? storedReporterSettings.emergencyLabel.trim()
          : baseReporterSettings.emergencyLabel,
      reasons: reporterReasons
    };
    if (
      typeof normalizedReporterSettings.emergencyLabel === "string" &&
      normalizedReporterSettings.emergencyLabel.trim().toLowerCase() ===
        PREVIOUS_EMERGENCY_LABEL.toLowerCase()
    ) {
      normalizedReporterSettings.emergencyLabel = DEFAULT_EMERGENCY_LABEL;
    }
    const normalizedSettings = {
      ...baseState.settings,
      ...(parsedSettings && typeof parsedSettings === "object" ? parsedSettings : {}),
      reporter: normalizedReporterSettings
    };
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
          const rawReasons = Array.isArray(message.reasons) ? message.reasons : [];
          const normalizedReasonIds = [];
          rawReasons.forEach((reasonId, index) => {
            const normalizedKey = normalizeId(reasonId, "reason");
            let mappedId = null;
            if (normalizedKey && reasonIdMap.has(normalizedKey)) {
              mappedId = reasonIdMap.get(normalizedKey);
            } else if (reasonIdMap.has(String(index + 1))) {
              mappedId = reasonIdMap.get(String(index + 1));
            } else if (normalizedKey) {
              mappedId = normalizedKey;
            }
            if (mappedId && !normalizedReasonIds.includes(mappedId)) {
              normalizedReasonIds.push(mappedId);
            }
          });
          return {
            ...message,
            id: normalizedMessageId,
            messageId: externalMessageId,
            clientId,
            pointsOnMessage: message.pointsOnMessage ?? clientConfig?.pointsPerMessage ?? 20,
            pointsOnApproval: message.pointsOnApproval ?? clientConfig?.pointsOnApproval ?? 80,
            reasons: normalizedReasonIds
          };
        })
      : baseState.messages.map(message => {
          const normalizedMessageId = normalizeId(message.id, "message") ?? generateId("message");
          const externalMessageId =
            typeof message.messageId === "string" && message.messageId.trim().length > 0
              ? message.messageId.trim()
              : generateId("MSG").toUpperCase();
          const baseReasons = Array.isArray(message.reasons) ? message.reasons : [];
          const normalizedReasonIds = [];
          baseReasons.forEach((reasonId, index) => {
            const normalizedKey = normalizeId(reasonId, "reason");
            let mappedId = null;
            if (normalizedKey && reasonIdMap.has(normalizedKey)) {
              mappedId = reasonIdMap.get(normalizedKey);
            } else if (reasonIdMap.has(String(index + 1))) {
              mappedId = reasonIdMap.get(String(index + 1));
            } else if (normalizedKey) {
              mappedId = normalizedKey;
            }
            if (mappedId && !normalizedReasonIds.includes(mappedId)) {
              normalizedReasonIds.push(mappedId);
            }
          });
          return {
            ...message,
            id: normalizedMessageId,
            messageId: externalMessageId,
            reasons: normalizedReasonIds
          };
        });
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
    const normalizeStatusFilter = value => {
      const normalized = normalizeFilter(value);
      return normalized === "published" || normalized === "unpublished" ? normalized : null;
    };
    mergedMeta.rewardFilter = normalizeFilter(mergedMeta.rewardFilter);
    mergedMeta.rewardStatusFilter = normalizeStatusFilter(mergedMeta.rewardStatusFilter);
    mergedMeta.questFilter = normalizeFilter(mergedMeta.questFilter);
    mergedMeta.questStatusFilter = normalizeStatusFilter(mergedMeta.questStatusFilter);
    mergedMeta.badgeFilter = normalizeFilter(mergedMeta.badgeFilter);
    mergedMeta.badgeStatusFilter = normalizeStatusFilter(mergedMeta.badgeStatusFilter);
    if (Array.isArray(mergedMeta.lastBadgeIds)) {
      mergedMeta.lastBadgeIds = mergedMeta.lastBadgeIds
        .map(id => {
          if (typeof id === "string") {
            const trimmed = id.trim();
            return trimmed.length > 0 ? trimmed : null;
          }
          if (Number.isFinite(id)) {
            return String(id);
          }
          return null;
        })
        .filter(Boolean);
    } else {
      mergedMeta.lastBadgeIds = [];
    }
    mergedMeta.settingsOpen = false;
    if (
      mergedMeta.settingsCategory &&
      !SETTINGS_CATEGORIES.some(
        category => category.id === mergedMeta.settingsCategory && !category.disabled
      )
    ) {
      const fallbackCategory =
        SETTINGS_CATEGORIES.find(category => !category.disabled) || SETTINGS_CATEGORIES[0] || null;
      mergedMeta.settingsCategory = fallbackCategory ? fallbackCategory.id : null;
    }
    const { customer: storedCustomer, ...restPassthrough } = passthrough;
    const normalizeBonusPoints = (candidate, baseBonus) => {
      const fallback = baseBonus && typeof baseBonus === "object" ? baseBonus : {};
      const baseBreakdown = Array.isArray(fallback.breakdown) ? fallback.breakdown : [];
      const cloneBaseBreakdown = () => baseBreakdown.map(item => ({ ...item }));
      if (!candidate || typeof candidate !== "object") {
        const weeklyCapFallback = Number(fallback.weeklyCap);
        const earnedFallback = Number(fallback.earnedThisWeek);
        return {
          weeklyCap: Math.max(0, Number.isFinite(weeklyCapFallback) ? weeklyCapFallback : 0),
          earnedThisWeek: Math.max(0, Number.isFinite(earnedFallback) ? earnedFallback : 0),
          breakdown: cloneBaseBreakdown()
        };
      }
      const weeklyCapRaw = Number(candidate.weeklyCap);
      const earnedRaw = Number(
        candidate.earnedThisWeek ?? candidate.earned ?? candidate.current ?? fallback.earnedThisWeek
      );
      const weeklyCap = Math.max(
        0,
        Number.isFinite(weeklyCapRaw) ? weeklyCapRaw : Number(fallback.weeklyCap) || 0
      );
      const earnedThisWeek = Math.max(
        0,
        Number.isFinite(earnedRaw) ? earnedRaw : Number(fallback.earnedThisWeek) || 0
      );
      const sourceBreakdown = Array.isArray(candidate.breakdown) ? candidate.breakdown : [];
      const baseMap = new Map(
        baseBreakdown
          .map(entry => {
            if (!entry || typeof entry !== "object") return null;
            const key =
              typeof entry.id === "string" && entry.id.trim().length > 0 ? entry.id.trim() : null;
            return key ? [key, entry] : null;
          })
          .filter(Boolean)
      );
      const normalizedBreakdown = sourceBreakdown
        .map((entry, index) => {
          if (!entry || typeof entry !== "object") return null;
          const rawId =
            typeof entry.id === "string" && entry.id.trim().length > 0 ? entry.id.trim() : null;
          const baseEntry = (rawId && baseMap.get(rawId)) || baseBreakdown[index] || null;
          const labelCandidate =
            typeof entry.label === "string" && entry.label.trim().length > 0
              ? entry.label.trim()
              : typeof baseEntry?.label === "string"
              ? baseEntry.label
              : "";
          if (!labelCandidate) return null;
          const normalizedId =
            rawId ||
            (typeof baseEntry?.id === "string" && baseEntry.id.trim().length > 0
              ? baseEntry.id.trim()
              : generateId(`bonus-${index + 1}`));
          const descriptionCandidate =
            typeof entry.description === "string" && entry.description.trim().length > 0
              ? entry.description.trim()
              : typeof baseEntry?.description === "string"
              ? baseEntry.description
              : "";
          const pointsCandidate = Number(entry.points);
          const basePointsCandidate = Number(baseEntry?.points);
          const points = Number.isFinite(pointsCandidate)
            ? pointsCandidate
            : Number.isFinite(basePointsCandidate)
            ? basePointsCandidate
            : 0;
          const firstOfMonthDouble =
            entry.firstOfMonthDouble === true ||
            (baseEntry && baseEntry.firstOfMonthDouble === true);
          return {
            id: normalizedId,
            label: labelCandidate,
            description: descriptionCandidate,
            points,
            firstOfMonthDouble
          };
        })
        .filter(Boolean);
      const breakdown =
        normalizedBreakdown.length > 0 ? normalizedBreakdown : cloneBaseBreakdown();
      return {
        weeklyCap,
        earnedThisWeek,
        breakdown
      };
    };
    const normalizeQuestCompletions = (source, baseHistory) => {
      const baseList = Array.isArray(baseHistory) ? baseHistory : [];
      const cloneBaseList = () => baseList.map(entry => ({ ...entry }));
      if (!Array.isArray(source)) {
        return cloneBaseList();
      }
      const normalized = source
        .map((entry, index) => {
          if (!entry || typeof entry !== "object") return null;
          const questIdSource =
            entry.questId !== undefined && entry.questId !== null ? String(entry.questId) : null;
          const questId = questIdSource ? questIdSource.trim() : "";
          if (!questId) return null;
          const rawCompleted =
            typeof entry.completedAt === "string" ? entry.completedAt.trim() : "";
          let completedAt = null;
          if (rawCompleted) {
            const parsed = new Date(rawCompleted);
            if (!Number.isNaN(parsed.getTime())) {
              completedAt = parsed.toISOString();
            }
          }
          if (!completedAt) {
            const baseEntry = baseList[index];
            if (baseEntry && typeof baseEntry.completedAt === "string") {
              const parsed = new Date(baseEntry.completedAt);
              if (!Number.isNaN(parsed.getTime())) {
                completedAt = parsed.toISOString();
              }
            }
          }
          if (!completedAt) {
            completedAt = new Date().toISOString();
          }
          const rawAwarded = Number(entry.pointsAwarded);
          const rawBase = Number(entry.basePoints);
          const pointsAwarded = Number.isFinite(rawAwarded)
            ? rawAwarded
            : Number.isFinite(rawBase)
            ? rawBase
            : 0;
          const basePoints = Number.isFinite(rawBase) ? rawBase : null;
          const doubled = entry.doubled === true;
          const idSource =
            typeof entry.id === "string" && entry.id.trim().length > 0
              ? entry.id.trim()
              : null;
          const id = idSource || generateId(`quest-completion-${index + 1}`);
          return {
            id,
            questId,
            completedAt,
            pointsAwarded,
            basePoints,
            doubled
          };
        })
        .filter(Boolean);
      if (normalized.length === 0) {
        return cloneBaseList();
      }
      const maxEntries = 50;
      return normalized.slice(0, maxEntries);
    };
    const baseCustomer =
      baseState.customer && typeof baseState.customer === "object" ? baseState.customer : {};
    const normalizedCustomer = (() => {
      if (!storedCustomer || typeof storedCustomer !== "object") {
        const baseBonus = baseCustomer.bonusPoints || {};
        return {
          ...baseCustomer,
          bonusPoints: normalizeBonusPoints(null, baseBonus),
          questCompletions: normalizeQuestCompletions(null, baseCustomer.questCompletions)
        };
      }
      const baseBonus = baseCustomer.bonusPoints || {};
      return {
        ...baseCustomer,
        ...storedCustomer,
        bonusPoints: normalizeBonusPoints(storedCustomer.bonusPoints, baseBonus),
        questCompletions: normalizeQuestCompletions(
          storedCustomer.questCompletions,
          baseCustomer.questCompletions
        )
      };
    })();
    return {
      ...baseState,
      ...restPassthrough,
      customer: normalizedCustomer,
      meta: mergedMeta,
      rewards: normalizedRewards,
      quests: normalizedQuests,
      badges: normalizedBadges,
      messages: normalizedMessages,
      clients: normalizedClients,
      rewardRedemptions: normalizedRewardRedemptions,
      teamMembers: normalizedTeamMembers,
      recognitions: normalizedRecognitions,
      departmentLeaderboard: normalizedLeaderboard,
      engagementPrograms: normalizedPrograms,
      labs: normalizedLabs,
      settings: normalizedSettings
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
  state.settings = clone(defaultState.settings);
  state.messages = clone(defaultState.messages);
  state.clients = clone(defaultState.clients);
  state.departmentLeaderboard = clone(defaultState.departmentLeaderboard);
  state.engagementPrograms = clone(defaultState.engagementPrograms);
  state.labs = clone(defaultState.labs);
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
  const target = id;
  return state.rewards.find(item => {
    if (item?.id === target) return true;
    return String(item?.id) === String(target);
  });
}

function questById(id) {
  if (!Array.isArray(state.quests)) return null;
  const targetId = String(id);
  return (
    state.quests.find(item => {
      return String(item.id) === targetId;
    }) || null
  );
}

function completeQuest(questId, options = {}) {
  const quest = questById(questId);
  if (!quest) {
    return { success: false, reason: "Quest not found." };
  }
  const providedDate = options.completedAt ? new Date(options.completedAt) : new Date();
  const completedDate = Number.isNaN(providedDate.getTime()) ? new Date() : providedDate;
  const completedAt = completedDate.toISOString();
  if (!Array.isArray(state.customer.questCompletions)) {
    state.customer.questCompletions = [];
  }
  const hasCompletionThisMonth = state.customer.questCompletions.some(entry => {
    if (!entry || typeof entry.completedAt !== "string") return false;
    const parsed = new Date(entry.completedAt);
    if (Number.isNaN(parsed.getTime())) return false;
    return (
      parsed.getFullYear() === completedDate.getFullYear() &&
      parsed.getMonth() === completedDate.getMonth()
    );
  });
  const basePointsRaw = Number(quest.points);
  const basePoints = Number.isFinite(basePointsRaw) ? basePointsRaw : 0;
  const doubled = !hasCompletionThisMonth && basePoints > 0;
  const multiplier = doubled ? 2 : 1;
  const awardedPoints = basePoints * multiplier;
  if (awardedPoints > 0) {
    state.customer.currentPoints += awardedPoints;
  }
  state.customer.questCompletions.unshift({
    id: generateId("quest-completion"),
    questId: quest.id,
    completedAt,
    pointsAwarded: awardedPoints,
    basePoints,
    doubled
  });
  if (state.customer.questCompletions.length > 50) {
    state.customer.questCompletions.length = 50;
  }
  const bonus = state.customer.bonusPoints;
  if (bonus && typeof bonus === "object") {
    const currentEarned = Number(bonus.earnedThisWeek);
    const updatedEarned = (Number.isFinite(currentEarned) ? currentEarned : 0) + awardedPoints;
    bonus.earnedThisWeek = Math.max(0, updatedEarned);
    if (!Array.isArray(bonus.breakdown)) {
      bonus.breakdown = [];
    }
    let questSource = bonus.breakdown.find(entry => {
      if (!entry || entry.id === undefined || entry.id === null) return false;
      return String(entry.id).trim().toLowerCase() === "quests";
    });
    if (!questSource) {
      questSource = {
        id: "quests",
        label: "Quests completed",
        description: "Quest completions recorded this week.",
        points: 0
      };
      bonus.breakdown.push(questSource);
    }
    const existingPoints = Number(questSource.points);
    const newPoints = (Number.isFinite(existingPoints) ? existingPoints : 0) + awardedPoints;
    questSource.points = newPoints;
    if (doubled) {
      questSource.firstOfMonthDouble = true;
      if (
        typeof questSource.description !== "string" ||
        questSource.description.trim().length === 0
      ) {
        questSource.description = "First quest completion this month triggered double points.";
      }
    }
  }
  persist();
  renderApp();
  return { success: true, awardedPoints, doubled, completedAt };
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
  const reasons = state?.settings?.reporter?.reasons;
  if (!Array.isArray(reasons)) return null;
  return reasons.find(item => item.id === id) || null;
}

function messageBelongsToCustomer(message) {
  return message?.reporterEmail === state.customer.email;
}

function getTeamMembers() {
  if (Array.isArray(state.teamMembers)) {
    return state.teamMembers;
  }
  return [];
}

function teamMemberByEmail(email) {
  if (typeof email !== "string") return null;
  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;
  const members = getTeamMembers();
  return (
    members.find(member => {
      if (!member || typeof member.email !== "string") return false;
      return member.email.trim().toLowerCase() === normalized;
    }) || null
  );
}

function getRecognitions() {
  if (Array.isArray(state.recognitions)) {
    return state.recognitions;
  }
  return [];
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

function recordRecognition({ recipientEmail, points, focus, message, channel }) {
  const sender = state.customer || {};
  const senderEmail =
    typeof sender.email === "string" && sender.email.trim().length > 0 ? sender.email.trim() : null;
  if (!senderEmail) {
    return { success: false, reason: "Select a reporter profile before sharing recognition." };
  }

  const normalizedRecipient =
    typeof recipientEmail === "string" && recipientEmail.trim().length > 0
      ? recipientEmail.trim()
      : null;
  if (!normalizedRecipient) {
    return { success: false, reason: "Choose a teammate to recognise." };
  }
  if (normalizedRecipient.toLowerCase() === senderEmail.toLowerCase()) {
    return { success: false, reason: "You cannot award recognition to yourself." };
  }

  const trimmedMessage = typeof message === "string" ? message.trim() : "";
  if (!trimmedMessage) {
    return { success: false, reason: "Add a short note so your teammate knows what they did well." };
  }

  const senderMember = teamMemberByEmail(senderEmail);
  const recipientMember = teamMemberByEmail(normalizedRecipient);
  const rawPoints = Number(points);
  const normalizedPoints =
    Number.isFinite(rawPoints) && rawPoints > 0 ? Math.round(rawPoints) : 0;
  const focusLabel =
    typeof focus === "string" && focus.trim().length > 0 ? focus.trim() : "Recognition spotlight";
  const channelLabel =
    typeof channel === "string" && channel.trim().length > 0 ? channel.trim() : "Hub spotlight";

  const recognition = {
    id: generateId("recognition"),
    senderEmail: senderEmail,
    senderName: senderMember?.name || sender.name || senderEmail,
    senderTitle: senderMember?.title || sender.title || "",
    recipientEmail: recipientMember?.email || normalizedRecipient,
    recipientName: recipientMember?.name || normalizedRecipient,
    recipientTitle: recipientMember?.title || "",
    points: normalizedPoints,
    focus: focusLabel,
    message: trimmedMessage,
    channel: channelLabel,
    createdAt: new Date().toISOString()
  };

  if (!Array.isArray(state.recognitions)) {
    state.recognitions = [];
  }
  state.recognitions.unshift(recognition);
  state.meta.recognitionFilter = "given";

  persist();
  renderApp();

  return { success: true, recognition };
}

function openRecognitionFormDialog() {
  const teammateList = getTeamMembers();
  const lowerCustomerEmail =
    typeof state.customer?.email === "string"
      ? state.customer.email.trim().toLowerCase()
      : "";
  const teammateOptions = teammateList
    .filter(member => {
      if (!member || typeof member.email !== "string") return false;
      const email = member.email.trim();
      if (!email) return false;
      if (lowerCustomerEmail && email.toLowerCase() === lowerCustomerEmail) {
        return false;
      }
      return true;
    })
    .map(member => {
      const email = member.email.trim();
      const title =
        typeof member.title === "string" && member.title.trim().length > 0
          ? member.title.trim()
          : "";
      const titleMarkup = title ? ` - ${escapeHtml(title)}` : "";
      const displayName = member.name || email;
      return `<option value="${escapeHtml(email)}">${escapeHtml(
        displayName
      )}${titleMarkup}</option>`;
    })
    .join("");
  const teammateSelectOptions = teammateOptions
    ? `<option value="" disabled selected>Select teammate</option>${teammateOptions}`
    : `<option value="" disabled selected>No teammates available</option>`;
  const recognitionPointChoices = [
    { value: 10, label: "+10 pts - Quick kudos" },
    { value: 15, label: "+15 pts - Awareness boost", default: true },
    { value: 25, label: "+25 pts - Incident averted" },
    { value: 35, label: "+35 pts - High-risk stop" }
  ];
  const pointsOptionsMarkup = recognitionPointChoices
    .map(choice => {
      const selectedAttr = choice.default ? " selected" : "";
      return `<option value="${escapeHtml(
        String(choice.value)
      )}"${selectedAttr}>${escapeHtml(choice.label)}</option>`;
    })
    .join("");
  const recognitionFocusChoices = [
    "Suspicious supplier update",
    "Credential lure stopped",
    "Business email compromise attempt",
    "Unexpected bank change",
    "Phishing simulation debrief"
  ];
  const focusOptionsMarkup = recognitionFocusChoices
    .map((label, index) => {
      const selectedAttr = index === 0 ? " selected" : "";
      return `<option value="${escapeHtml(label)}"${selectedAttr}>${escapeHtml(
        label
      )}</option>`;
    })
    .join("");

  const container = document.createElement("div");
  container.innerHTML = `
    <section class="recognition-form recognition-form--dialog">
      <p class="recognition-form__intro">Grant bonus points when a teammate spots a threat or shares intel.</p>
      <form id="recognition-form" class="recognition-form__fields">
        <label class="recognition-form__field">
          <span>Team mate</span>
          <select name="recipient" required>
            ${teammateSelectOptions}
          </select>
        </label>
        <div class="recognition-form__row">
          <label class="recognition-form__field recognition-form__field--inline">
            <span>Bonus points</span>
            <select name="points" required>
              ${pointsOptionsMarkup}
            </select>
          </label>
          <label class="recognition-form__field recognition-form__field--inline">
            <span>Threat focus</span>
            <select name="focus">
              ${focusOptionsMarkup}
            </select>
          </label>
        </div>
        <label class="recognition-form__field">
          <span>Recognition message</span>
          <textarea name="message" rows="4" maxlength="280" placeholder="Share the context so everyone knows what to watch for..." required></textarea>
        </label>
        <p class="recognition-form__helper">Security amplifies these stories in the weekly wrap-up and your next quest together pays out double points.</p>
        <p class="recognition-form__error" role="alert" aria-live="assertive"></p>
        <button type="submit" class="button-pill button-pill--primary recognition-form__submit">
          Share recognition
        </button>
      </form>
    </section>
  `;

  const form = container.querySelector("#recognition-form");
  const errorEl = container.querySelector(".recognition-form__error");
  if (errorEl) {
    errorEl.hidden = true;
  }
  if (form) {
    form.addEventListener("submit", event => {
      event.preventDefault();
      if (errorEl) {
        errorEl.textContent = "";
        errorEl.hidden = true;
      }
      const formData = new FormData(form);
      const recipientEmail = String(formData.get("recipient") || "").trim();
      const pointsValue = Number(formData.get("points") || 0);
      const focusValue = String(formData.get("focus") || "").trim();
      const messageValue = String(formData.get("message") || "").trim();

      const result = recordRecognition({
        recipientEmail,
        points: pointsValue,
        focus: focusValue,
        message: messageValue,
        channel: "Hub spotlight"
      });

      if (!result.success) {
        if (errorEl) {
          errorEl.textContent = result.reason || "Please try again.";
          errorEl.hidden = false;
        }
        return;
      }

      closeDialog();

      const teammate = teamMemberByEmail(recipientEmail);
      const recipientName = teammate?.name || recipientEmail;
      const normalizedPoints =
        Number.isFinite(pointsValue) && pointsValue > 0 ? pointsValue : 0;
      const pointsSnippet =
        normalizedPoints > 0 ? ` and earn +${formatNumber(normalizedPoints)} pts` : "";
      openDialog({
        title: "Recognition shared",
        description: `${recipientName} will see your note${pointsSnippet}. Next quest together: double points.`,
        confirmLabel: "Close",
        onConfirm: closeDialog
      });
    });
  }

  openDialog({
    title: "Share recognition",
    description: "Award kudos, pass on bonus points, and unlock a double quest boost.",
    content: container,
    cancelLabel: "Close"
  });
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

function setLeaderboardEntryPublication(entryId, published) {
  if (!Array.isArray(state.departmentLeaderboard)) return;
  const targetId =
    typeof entryId === "string" && entryId.trim().length > 0
      ? entryId.trim()
      : Number.isFinite(entryId)
      ? String(entryId)
      : null;
  if (!targetId) return;
  const entry = state.departmentLeaderboard.find(item => {
    const candidate =
      typeof item?.id === "string" && item.id.trim().length > 0
        ? item.id.trim()
        : Number.isFinite(item?.id)
        ? String(item.id)
        : null;
    return candidate === targetId;
  });
  if (!entry) return;
  const nextPublished = Boolean(published);
  if (entry.published === nextPublished) return;
  entry.published = nextPublished;
  persist();
  renderApp();
}

function setAllLeaderboardPublication(published) {
  if (!Array.isArray(state.departmentLeaderboard) || state.departmentLeaderboard.length === 0) return;
  const nextPublished = Boolean(published);
  let changed = false;
  state.departmentLeaderboard.forEach(entry => {
    if (entry && entry.published !== nextPublished) {
      entry.published = nextPublished;
      changed = true;
    }
  });
  if (!changed) return;
  persist();
  renderApp();
}

function setEngagementProgramPublication(programId, published) {
  if (!Array.isArray(state.engagementPrograms)) return;
  const targetId =
    typeof programId === "string" && programId.trim().length > 0
      ? programId.trim()
      : Number.isFinite(programId)
      ? String(programId)
      : null;
  if (!targetId) return;
  const program = state.engagementPrograms.find(item => {
    const candidate =
      typeof item?.id === "string" && item.id.trim().length > 0
        ? item.id.trim()
        : Number.isFinite(item?.id)
        ? String(item.id)
        : null;
    return candidate === targetId;
  });
  if (!program) return;
  const nextPublished = Boolean(published);
  if (program.published === nextPublished) return;
  program.published = nextPublished;
  persist();
  renderApp();
}

function setAllEngagementProgramsPublication(published) {
  if (!Array.isArray(state.engagementPrograms) || state.engagementPrograms.length === 0) return;
  const nextPublished = Boolean(published);
  let changed = false;
  state.engagementPrograms.forEach(program => {
    if (program && program.published !== nextPublished) {
      program.published = nextPublished;
      changed = true;
    }
  });
  if (!changed) return;
  persist();
  renderApp();
}

function normalizeLabFeatureId(value) {
  if (Number.isFinite(value)) {
    return String(value);
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  return null;
}

function normalizeLabClientId(value) {
  if (Number.isFinite(value)) {
    return Number(value);
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const numeric = Number(trimmed);
    return Number.isFinite(numeric) ? numeric : trimmed;
  }
  return null;
}

function labClientKey(value) {
  if (Number.isFinite(value)) {
    return String(Number(value));
  }
  if (typeof value === "string") {
    return value.trim();
  }
  return "";
}

function setLabFeatureAccess(featureId, clientIdValue, enabled) {
  if (!state.labs || !Array.isArray(state.labs.features)) return;
  const normalizedFeatureId = normalizeLabFeatureId(featureId);
  if (!normalizedFeatureId) return;
  const feature = state.labs.features.find(
    item => normalizeLabFeatureId(item?.id) === normalizedFeatureId
  );
  if (!feature) return;
  const normalizedClientId = normalizeLabClientId(clientIdValue);
  if (normalizedClientId === null || normalizedClientId === undefined) return;
  if (!Array.isArray(feature.enabledClientIds)) {
    feature.enabledClientIds = [];
  }
  const targetKey = labClientKey(normalizedClientId);
  if (!targetKey) return;
  const existingIndex = feature.enabledClientIds.findIndex(
    id => labClientKey(id) === targetKey
  );
  const alreadyEnabled = existingIndex !== -1;
  if (enabled && alreadyEnabled) return;
  if (!enabled && !alreadyEnabled) return;
  if (enabled) {
    feature.enabledClientIds.push(normalizedClientId);
  } else {
    feature.enabledClientIds.splice(existingIndex, 1);
  }
  feature.enabledClientIds = feature.enabledClientIds
    .map(id =>
      Number.isFinite(id) ? Number(id) : typeof id === "string" ? id.trim() : id
    )
    .filter((value, index, array) => {
      const key = labClientKey(value);
      if (!key) return false;
      return array.findIndex(candidate => labClientKey(candidate) === key) === index;
    });
  persist();
  renderApp();
}

function setLabFeatureAccessForAll(featureId, enabled) {
  if (!state.labs || !Array.isArray(state.labs.features)) return;
  const normalizedFeatureId = normalizeLabFeatureId(featureId);
  if (!normalizedFeatureId) return;
  const feature = state.labs.features.find(
    item => normalizeLabFeatureId(item?.id) === normalizedFeatureId
  );
  if (!feature) return;
  if (!Array.isArray(feature.enabledClientIds)) {
    feature.enabledClientIds = [];
  }
  if (!enabled) {
    if (feature.enabledClientIds.length === 0) return;
    feature.enabledClientIds = [];
    persist();
    renderApp();
    return;
  }
  const clients = Array.isArray(state.clients) ? state.clients : [];
  const targetIds = clients
    .map(client => normalizeLabClientId(client?.id))
    .filter(value => labClientKey(value));
  const existingKeys = new Set(feature.enabledClientIds.map(labClientKey).filter(Boolean));
  const targetKeys = new Set(targetIds.map(labClientKey).filter(Boolean));
  let changed = false;
  if (existingKeys.size !== targetKeys.size) {
    changed = true;
  } else {
    existingKeys.forEach(key => {
      if (!targetKeys.has(key)) {
        changed = true;
      }
    });
  }
  if (!changed) return;
  feature.enabledClientIds = targetIds;
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

  const eligibleBadges = getBadges().filter(badge => badge && badge.icon);
  const badgeBundle = [];
  let primaryBadge = null;
  if (eligibleBadges.length > 0) {
    primaryBadge = selectRandomBadge(state.meta.lastBadgeId);
    if (!primaryBadge) {
      primaryBadge = eligibleBadges[Math.floor(Math.random() * eligibleBadges.length)];
    }
    if (primaryBadge) {
      badgeBundle.push(primaryBadge);
    }
    let extraPool = eligibleBadges.filter(
      badge => !badgeBundle.some(selected => selected && selected.id === badge.id)
    );
    if (extraPool.length > 1) {
      extraPool = extraPool.slice();
      for (let i = extraPool.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [extraPool[i], extraPool[j]] = [extraPool[j], extraPool[i]];
      }
    }
    const maxExtras = Math.min(3, extraPool.length);
    let extrasNeeded = 0;
    if (maxExtras > 0) {
      extrasNeeded = Math.max(1, Math.floor(Math.random() * (maxExtras + 1)));
      extrasNeeded = Math.min(maxExtras, extrasNeeded);
    }
    if (!primaryBadge && extraPool.length > 0) {
      primaryBadge = extraPool.shift();
      if (primaryBadge) {
        badgeBundle.push(primaryBadge);
        if (extrasNeeded > 0) extrasNeeded = Math.max(0, extrasNeeded - 1);
      }
    }
    if (extrasNeeded > 0 && extraPool.length > 0) {
      badgeBundle.push(...extraPool.slice(0, extrasNeeded));
    }
  }
  const badgePointsTotal = badgeBundle.reduce((sum, badge) => {
    const raw = Number(badge?.points);
    return sum + (Number.isFinite(raw) ? raw : 0);
  }, 0);
  if (badgePointsTotal > 0) {
    state.customer.currentPoints += badgePointsTotal;
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
  state.meta.lastBadgePoints = badgePointsTotal;
  state.meta.lastBadgeId = badgeBundle.length > 0 ? badgeBundle[0].id : null;
  state.meta.lastBadgeIds = badgeBundle.map(badge => badge.id);
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
  state.meta.lastBadgeIds = [];
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

function buildQuestWalkthroughContent(quest) {
  const walkthrough = quest?.walkthrough;
  if (!walkthrough) {
    return "Walkthrough content coming soon.";
  }
  if (typeof document === "undefined") {
    return "Quest walkthroughs are available in the interactive demo.";
  }

  const container = document.createElement("div");
  container.className = "quest-walkthrough";

  const learningObjectives = Array.isArray(walkthrough.learningObjectives)
    ? walkthrough.learningObjectives.filter(item => typeof item === "string" && item.trim())
    : [];
  const setupSteps =
    walkthrough.setup && Array.isArray(walkthrough.setup.steps)
      ? walkthrough.setup.steps.filter(item => typeof item === "string" && item.trim())
      : [];
  const storyBeats = Array.isArray(walkthrough.storyBeats)
    ? walkthrough.storyBeats.filter(beat => beat && (beat.title || beat.scenario || beat.prompt || beat.idealAction))
    : [];
  const instrumentation = Array.isArray(walkthrough.instrumentation)
    ? walkthrough.instrumentation.filter(entry => entry && (entry.label || entry.detail))
    : [];
  const followUpActions =
    walkthrough.followUp && Array.isArray(walkthrough.followUp.actions)
      ? walkthrough.followUp.actions.filter(item => typeof item === "string" && item.trim())
      : [];
  const demoTips = Array.isArray(walkthrough.demoTips)
    ? walkthrough.demoTips.filter(item => typeof item === "string" && item.trim())
    : [];

  function createSection(title) {
    const section = document.createElement("section");
    section.className = "quest-walkthrough__section";
    if (title) {
      const heading = document.createElement("h3");
      heading.textContent = title;
      section.appendChild(heading);
    }
    return section;
  }

  function createDetailParagraph(label, value) {
    if (!value) return null;
    const paragraph = document.createElement("p");
    paragraph.className = "quest-walkthrough__detail";
    if (label) {
      const strong = document.createElement("strong");
      const normalized = label.endsWith(":") ? label : `${label}:`;
      strong.textContent = normalized;
      paragraph.appendChild(strong);
      paragraph.appendChild(document.createTextNode(` ${value}`));
    } else {
      paragraph.textContent = value;
    }
    return paragraph;
  }

  if (walkthrough.summary) {
    const summary = document.createElement("p");
    summary.className = "quest-walkthrough__summary";
    summary.textContent = walkthrough.summary;
    container.appendChild(summary);
  }

  if (learningObjectives.length) {
    const section = createSection("Learning objectives");
    const list = document.createElement("ul");
    list.className = "quest-walkthrough__list";
    learningObjectives.forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      list.appendChild(li);
    });
    section.appendChild(list);
    container.appendChild(section);
  }

  if (walkthrough.setup && (walkthrough.setup.narrative || setupSteps.length)) {
    const section = createSection("How to set it up");
    if (walkthrough.setup.narrative) {
      const narrative = document.createElement("p");
      narrative.textContent = walkthrough.setup.narrative;
      section.appendChild(narrative);
    }
    if (setupSteps.length) {
      const list = document.createElement("ol");
      list.className = "quest-walkthrough__list quest-walkthrough__list--numbered";
      setupSteps.forEach(step => {
        const li = document.createElement("li");
        li.textContent = step;
        list.appendChild(li);
      });
      section.appendChild(list);
    }
    container.appendChild(section);
  }

  if (storyBeats.length) {
    const section = createSection("Story beats");
    const list = document.createElement("ol");
    list.className = "quest-walkthrough__beats";
    storyBeats.forEach(beat => {
      const item = document.createElement("li");
      item.className = "quest-walkthrough__beat";
      if (beat.title) {
        const heading = document.createElement("h4");
        heading.textContent = beat.title;
        item.appendChild(heading);
      }
      const scenario = createDetailParagraph("Scenario", beat.scenario);
      if (scenario) item.appendChild(scenario);
      const prompt = createDetailParagraph("Prompt", beat.prompt);
      if (prompt) item.appendChild(prompt);
      const ideal = createDetailParagraph("Ideal action", beat.idealAction);
      if (ideal) item.appendChild(ideal);
      const callout = createDetailParagraph("Callout", beat.callout);
      if (callout) item.appendChild(callout);
      list.appendChild(item);
    });
    section.appendChild(list);
    container.appendChild(section);
  }

  if (instrumentation.length) {
    const section = createSection("Instrumentation & signals");
    const list = document.createElement("ul");
    list.className = "quest-walkthrough__list quest-walkthrough__list--dense";
    instrumentation.forEach(entry => {
      const li = document.createElement("li");
      if (entry.label) {
        const strong = document.createElement("strong");
        strong.textContent = entry.label;
        li.appendChild(strong);
      }
      if (entry.detail) {
        const span = document.createElement("span");
        span.textContent = entry.detail;
        li.appendChild(span);
      }
      list.appendChild(li);
    });
    section.appendChild(list);
    container.appendChild(section);
  }

  if (walkthrough.followUp && (walkthrough.followUp.highlight || followUpActions.length)) {
    const section = createSection("Bring it home");
    if (walkthrough.followUp.highlight) {
      const highlight = document.createElement("p");
      highlight.textContent = walkthrough.followUp.highlight;
      section.appendChild(highlight);
    }
    if (followUpActions.length) {
      const list = document.createElement("ul");
      list.className = "quest-walkthrough__list";
      followUpActions.forEach(action => {
        const li = document.createElement("li");
        li.textContent = action;
        list.appendChild(li);
      });
      section.appendChild(list);
    }
    container.appendChild(section);
  }

  if (demoTips.length) {
    const section = createSection("Demo tips");
    const list = document.createElement("ul");
    list.className = "quest-walkthrough__list quest-walkthrough__list--bullet";
    demoTips.forEach(tip => {
      const li = document.createElement("li");
      li.textContent = tip;
      list.appendChild(li);
    });
    section.appendChild(list);
    container.appendChild(section);
  }

  return container;
}

function openQuestWalkthrough(questId) {
  const quest = questById(questId);
  if (!quest || !quest.walkthrough) return false;
  const description = quest.description || quest.walkthrough.summary || "";
  openDialog({
    title: `${quest.title || "Quest"} walkthrough`,
    description,
    content: () => buildQuestWalkthroughContent(quest),
    confirmLabel: "Close",
    onConfirm: close => close()
  });
  return true;
}

function buildQuestConfigContent(quest) {
  if (typeof document === "undefined") {
    return "Quest configuration is available in the live demo.";
  }

  const container = document.createElement("div");
  container.className = "quest-config";

  const metaList = document.createElement("ul");
  metaList.className = "quest-config__meta";
  const metaEntries = [
    { label: "Difficulty", value: quest.difficulty || "Starter" },
    { label: "Format", value: quest.format || "Interactive" },
    {
      label: "Status",
      value: quest.published ? "Published to hubs" : "Draft only"
    },
    { label: "Duration", value: `${formatNumber(Number(quest.duration) || 0)} min` },
    { label: "Questions", value: formatNumber(Number(quest.questions) || 0) }
  ];

  metaEntries.forEach(entry => {
    const li = document.createElement("li");
    const label = document.createElement("span");
    label.textContent = entry.label;
    const value = document.createElement("strong");
    value.textContent = entry.value;
    li.appendChild(label);
    li.appendChild(value);
    metaList.appendChild(li);
  });
  container.appendChild(metaList);

  const actions = document.createElement("div");
  actions.className = "quest-config__actions";
  const baseQuestPoints = Number(quest.points) || 0;

  const completionBtn = document.createElement("button");
  completionBtn.type = "button";
  completionBtn.className = "button-pill button-pill--ghost quest-config__action";
  completionBtn.textContent = "Simulate completion";
  completionBtn.addEventListener("click", () => {
    const result = completeQuest(quest.id);
    closeDialog();
    requestAnimationFrame(() => {
      if (!result.success) {
        openDialog({
          title: "Unable to complete quest",
          description: result.reason || "Please try again.",
          confirmLabel: "Close",
          onConfirm: close => close()
        });
        return;
      }
      const pointsLabel = formatNumber(result.awardedPoints);
      const baseLabel = formatNumber(baseQuestPoints);
      const completionMoment = formatDateTime(result.completedAt);
      const successTitle = result.doubled ? "Double points applied" : "Quest completion recorded";
      const successDescription = result.doubled
        ? `First quest completed this month (${completionMoment}) delivered ${pointsLabel} points instead of the usual ${baseLabel}.`
        : `Quest completion logged on ${completionMoment} for ${pointsLabel} points.`;
      openDialog({
        title: successTitle,
        description: successDescription,
        confirmLabel: "Back to hub",
        onConfirm: close => close()
      });
    });
  });
  actions.appendChild(completionBtn);

  if (quest.walkthrough) {
    const walkthroughBtn = document.createElement("button");
    walkthroughBtn.type = "button";
    walkthroughBtn.className = "button-pill button-pill--primary quest-config__action";
    walkthroughBtn.textContent = "View walkthrough";
    walkthroughBtn.addEventListener("click", () => {
      closeDialog();
      requestAnimationFrame(() => {
        openQuestWalkthrough(quest.id);
      });
    });
    actions.appendChild(walkthroughBtn);
  } else {
    const noWalkthrough = document.createElement("p");
    noWalkthrough.className = "quest-config__hint";
    noWalkthrough.textContent = "Walkthrough coming soon for this quest.";
    actions.appendChild(noWalkthrough);
  }

  container.appendChild(actions);
  return container;
}

function openQuestConfig(questId) {
  const quest = questById(questId);
  if (!quest) return false;
  const title = quest.title ? `${quest.title} controls` : "Quest controls";
  openDialog({
    title,
    description: "Configure how this quest appears in the demo catalogue.",
    content: () => buildQuestConfigContent(quest),
    confirmLabel: "Close",
    onConfirm: close => close()
  });
  return true;
}

function buildRewardConfigContent(reward) {
  if (typeof document === "undefined") {
    return "Reward configuration is available in the interactive demo.";
  }

  const form = document.createElement("form");
  form.className = "reward-config";
  form.addEventListener("submit", event => event.preventDefault());

  const intro = document.createElement("p");
  intro.className = "reward-config__intro";
  intro.textContent = "Adjust the catalogue-facing reward cost and remaining quantity.";
  form.appendChild(intro);

  const fields = document.createElement("div");
  fields.className = "reward-config__fields";

  const remainingField = document.createElement("label");
  remainingField.className = "reward-config__field";
  const remainingLabel = document.createElement("span");
  remainingLabel.textContent = "Remaining";
  const remainingInput = document.createElement("input");
  remainingInput.type = "number";
  remainingInput.min = "0";
  remainingInput.step = "1";
  remainingInput.dataset.rewardConfig = "remaining";
  if (reward.unlimited === true) {
    remainingInput.value = "";
    remainingInput.placeholder = "Unlimited";
  } else if (Number.isFinite(Number(reward.remaining))) {
    remainingInput.value = String(Math.max(0, Number(reward.remaining)));
    remainingInput.placeholder = "0";
  } else {
    remainingInput.value = "0";
    remainingInput.placeholder = "0";
  }
  remainingField.appendChild(remainingLabel);
  remainingField.appendChild(remainingInput);

  const unlimitedField = document.createElement("label");
  unlimitedField.className = "reward-config__checkbox";
  const unlimitedInput = document.createElement("input");
  unlimitedInput.type = "checkbox";
  unlimitedInput.dataset.rewardConfig = "unlimited";
  unlimitedInput.checked = reward.unlimited === true;
  const unlimitedLabel = document.createElement("span");
  unlimitedLabel.textContent = "Unlimited redemptions";
  unlimitedField.appendChild(unlimitedInput);
  unlimitedField.appendChild(unlimitedLabel);

  const pointsField = document.createElement("label");
  pointsField.className = "reward-config__field";
  const pointsLabel = document.createElement("span");
  pointsLabel.textContent = "Points cost";
  const pointsInput = document.createElement("input");
  pointsInput.type = "number";
  pointsInput.min = "0";
  pointsInput.step = "1";
  pointsInput.dataset.rewardConfig = "points";
  pointsInput.value = Number.isFinite(Number(reward.pointsCost))
    ? String(Math.max(0, Number(reward.pointsCost)))
    : "0";
  pointsField.appendChild(pointsLabel);
  pointsField.appendChild(pointsInput);

  fields.appendChild(remainingField);
  fields.appendChild(pointsField);
  form.appendChild(fields);
  form.appendChild(unlimitedField);

  const guidance = document.createElement("p");
  guidance.className = "reward-config__hint";
  guidance.textContent = "When unlimited is enabled, the remaining count is hidden from the reporter hub.";
  form.appendChild(guidance);

  const error = document.createElement("p");
  error.className = "reward-config__error";
  error.hidden = true;
  form.appendChild(error);

  function syncRemainingState() {
    const unlimited = unlimitedInput.checked;
    remainingInput.disabled = unlimited;
    if (unlimited) {
      remainingInput.value = "";
      remainingInput.placeholder = "Unlimited";
    } else {
      if (remainingInput.value === "") {
        remainingInput.value = "0";
      }
      remainingInput.placeholder = "0";
    }
  }

  unlimitedInput.addEventListener("change", () => {
    syncRemainingState();
  });
  syncRemainingState();

  form.__rewardConfigRefs = {
    remainingInput,
    pointsInput,
    unlimitedInput,
    errorNode: error
  };

  return form;
}

function openRewardConfig(rewardId) {
  const reward = rewardById(rewardId);
  if (!reward) return false;
  const title = reward.name ? `${reward.name} controls` : "Reward controls";
  let configForm = null;
  openDialog({
    title,
    description: "Configure the reward's presentation for the demo catalogue.",
    content: () => {
      const node = buildRewardConfigContent(reward);
      if (node instanceof HTMLElement) {
        configForm = node;
      } else {
        configForm = null;
      }
      return node;
    },
    confirmLabel: "Save changes",
    cancelLabel: "Cancel",
    onConfirm: close => {
      if (!configForm || !(configForm instanceof HTMLElement)) {
        close();
        return;
      }
      const refs = configForm.__rewardConfigRefs || {};
      const remainingInput = refs.remainingInput;
      const pointsInput = refs.pointsInput;
      const unlimitedInput = refs.unlimitedInput;
      const errorNode = refs.errorNode;

      const showError = message => {
        if (errorNode) {
          errorNode.textContent = message;
          errorNode.hidden = false;
        }
      };
      if (errorNode) {
        errorNode.hidden = true;
      }

      const unlimited = unlimitedInput ? unlimitedInput.checked === true : false;

      let remainingValue = null;
      if (!unlimited && remainingInput) {
        const rawRemaining = (remainingInput.value || "").trim();
        if (rawRemaining.length === 0) {
          showError("Enter the number of rewards remaining or enable unlimited redemptions.");
          remainingInput.focus();
          return;
        }
        const parsedRemaining = Number(rawRemaining);
        if (!Number.isFinite(parsedRemaining) || parsedRemaining < 0) {
          showError("Remaining must be a non-negative number.");
          remainingInput.focus();
          return;
        }
        remainingValue = Math.round(parsedRemaining);
      }

      if (!pointsInput) {
        close();
        return;
      }
      const rawPoints = (pointsInput.value || "").trim();
      if (rawPoints.length === 0) {
        showError("Enter a points cost for this reward.");
        pointsInput.focus();
        return;
      }
      const parsedPoints = Number(rawPoints);
      if (!Number.isFinite(parsedPoints) || parsedPoints < 0) {
        showError("Points cost must be a non-negative number.");
        pointsInput.focus();
        return;
      }
      const pointsValue = Math.round(parsedPoints);

      reward.pointsCost = pointsValue;
      if (unlimited) {
        reward.unlimited = true;
      } else {
        reward.unlimited = false;
        reward.remaining = remainingValue ?? 0;
      }

      persist();
      renderApp();
      close();
    }
  });
  return true;
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


function renderHubBadgeCard(badge) {
  if (!badge) return "";
  const rawId = String(badge.id ?? generateId("badge"));
  const normalizedId = rawId.trim().length > 0 ? rawId.trim() : generateId("badge");
  const safeDataId = escapeHtml(normalizedId);
  const sanitizedId = normalizedId.replace(/[^a-zA-Z0-9:_-]/g, "-");
  const cardId = escapeHtml(`${sanitizedId}-card`);
  const toneKey = BADGE_TONES[badge.tone] ? badge.tone : "violet";
  const tone = BADGE_TONES[toneKey] || BADGE_TONES.violet;
  const iconBackdrop =
    BADGE_ICON_BACKDROPS[toneKey]?.background ||
    BADGE_ICON_BACKDROPS.violet?.background ||
    "linear-gradient(135deg, #c7d2fe, #818cf8)";
  const iconShadow =
    BADGE_ICON_BACKDROPS[toneKey]?.shadow ||
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
    tags.push(`<span class="catalogue-card__tag gem-badge-card__tag">${escapeHtml(normalizedCategory)}</span>`);
  }
  if (difficultyLabel) {
    tags.push(`<span class="catalogue-card__tag gem-badge-card__tag">${escapeHtml(difficultyLabel)}</span>`);
  }
  const tagsMarkup = tags.length
    ? `<div class="gem-badge-card__tags catalogue-card__tags">${tags.join("")}</div>`
    : "";
  const pointsValue = Number(badge.points) || 0;
  const toggleTitle = difficultyLabel
    ? `${escapeHtml(difficultyLabel)}  ${formatNumber(pointsValue)} pts`
    : `${formatNumber(pointsValue)} pts`;
  const ariaLabel = `${badge.title} badge, worth ${formatNumber(pointsValue)} points in the collection.`;

  return `
    <article
      class="gem-badge gem-badge--hub"
      data-badge="${safeDataId}"
      style="--badge-tone:${escapeHtml(tone)};--badge-icon-tone:${escapeHtml(iconBackdrop)};--badge-icon-shadow:${escapeHtml(
        iconShadow
      )};">
      <button
        type="button"
        class="gem-badge__trigger"
        aria-haspopup="true"
        aria-label="${escapeHtml(badge.title)} badge details"
        aria-controls="${cardId}"
        title="${escapeHtml(toggleTitle)}">
        <span class="gem-badge__icon" style="background:${iconBackdrop}; box-shadow:0 18px 32px ${iconShadow};">
          ${renderIcon(badge.icon || "medal", "sm")}
        </span>
      </button>
      <span class="gem-badge__label">${escapeHtml(badge.title)}</span>
      <div id="${cardId}" class="gem-badge-card gem-badge-card--hub" role="group" aria-label="${escapeHtml(ariaLabel)}">
        <span class="gem-badge-card__halo"></span>
        <span class="gem-badge-card__orb gem-badge-card__orb--one"></span>
        <span class="gem-badge-card__orb gem-badge-card__orb--two"></span>
        <div class="gem-badge-card__main">
          <h3 class="gem-badge-card__title">${escapeHtml(badge.title)}</h3>
          ${tagsMarkup}
          <p class="gem-badge-card__description">${escapeHtml(badge.description)}</p>
        </div>
        <footer class="gem-badge-card__footer">
          <span class="gem-badge-card__points">
            <span class="gem-badge-card__points-value">+${formatNumber(pointsValue)}</span>
            <span class="gem-badge-card__points-unit">pts</span>
          </span>
        </footer>
      </div>
    </article>
  `;
}


function renderRecognitionCard(entry, currentEmail) {
  if (!entry) return "";
  const currentKey = typeof currentEmail === "string" ? currentEmail.trim().toLowerCase() : "";
  const recipientEmail =
    typeof entry.recipientEmail === "string" ? entry.recipientEmail.trim() : "";
  const senderName = entry.senderName || entry.senderEmail || "Teammate";
  const recipientName = entry.recipientName || recipientEmail || "Teammate";
  const isForCurrentUser =
    currentKey && recipientEmail && recipientEmail.toLowerCase() === currentKey;
  const pointsValue = Number(entry.points) || 0;
  const pointsMarkup =
    pointsValue > 0
      ? `<span class="recognition-card__points">+${formatNumber(pointsValue)} pts</span>`
      : "";
  const focusLabel =
    typeof entry.focus === "string" && entry.focus.trim().length > 0
      ? entry.focus.trim()
      : "Recognition spotlight";
  const channelLabel =
    typeof entry.channel === "string" && entry.channel.trim().length > 0
      ? entry.channel.trim()
      : null;
  const contextLabel = isForCurrentUser ? "For you" : `For ${recipientName}`;
  const createdAt = typeof entry.createdAt === "string" ? entry.createdAt : "";
  const parsedDate = createdAt ? new Date(createdAt) : null;
  const hasValidDate = parsedDate && !Number.isNaN(parsedDate.getTime());
  const relativeLabel = hasValidDate ? relativeTime(createdAt) : "Just now";
  const absoluteLabel = hasValidDate ? formatDateTime(createdAt) : "";
  const timeMarkup = hasValidDate
    ? `<time datetime="${escapeHtml(createdAt)}" title="${escapeHtml(absoluteLabel)}">${escapeHtml(
        relativeLabel
      )}</time>`
    : `<span class="recognition-card__time">Just now</span>`;
  const tagMarkup = channelLabel
    ? `<span class="recognition-card__tag">${escapeHtml(channelLabel)}</span>`
    : "";
  const entryId =
    entry?.id !== undefined && entry?.id !== null
      ? escapeHtml(String(entry.id))
      : escapeHtml(generateId("recognition"));

  return `
    <article class="recognition-card${isForCurrentUser ? " recognition-card--highlight" : ""}" data-recognition="${entryId}">
      <header class="recognition-card__header">
        <span class="recognition-card__eyebrow">${escapeHtml(contextLabel)}</span>
        ${tagMarkup}
        ${pointsMarkup}
      </header>
      <div class="recognition-card__body">
        <h4 class="recognition-card__title">${escapeHtml(focusLabel)}</h4>
        <p class="recognition-card__message">${escapeHtml(entry.message || "")}</p>
      </div>
      <footer class="recognition-card__footer">
        <div class="recognition-card__actors">
          <span>${escapeHtml(senderName)}</span>
          <span aria-hidden="true">&rarr;</span>
          <span>${escapeHtml(recipientName)}</span>
        </div>
        ${timeMarkup}
      </footer>
    </article>
  `;
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
  const bonusConfig = state.customer?.bonusPoints || {};
  const rawCap = Number(bonusConfig.weeklyCap);
  const weeklyCap = Math.max(0, Number.isFinite(rawCap) ? rawCap : 0);
  const earnedRaw = Number(
    bonusConfig.earnedThisWeek ?? bonusConfig.earned ?? bonusConfig.current ?? 0
  );
  const earnedThisWeek = Math.max(0, Number.isFinite(earnedRaw) ? earnedRaw : 0);
  const progressPercent =
    weeklyCap > 0 ? Math.min(100, Math.round((earnedThisWeek / weeklyCap) * 100)) : 0;
  const remainingThisWeek = weeklyCap > 0 ? Math.max(0, weeklyCap - earnedThisWeek) : 0;
  const bonusProgressLabel =
    weeklyCap > 0
      ? `Bonus points earned this week: ${formatNumber(earnedThisWeek)} of ${formatNumber(weeklyCap)} points.`
      : `Bonus points earned this week: ${formatNumber(earnedThisWeek)} points.`;
  const breakdownEntries = Array.isArray(bonusConfig.breakdown) ? bonusConfig.breakdown : [];
  const doublePointsTotal = breakdownEntries.reduce((sum, entry) => {
    if (!entry || entry.firstOfMonthDouble !== true) return sum;
    const value = Number(entry.points);
    return sum + (Number.isFinite(value) ? value : 0);
  }, 0);
  const boostPercentOfTrackRaw =
    weeklyCap > 0 ? Math.round((doublePointsTotal / weeklyCap) * 100) : 0;
  const boostPercentOfTrack = Math.max(
    0,
    Math.min(progressPercent, boostPercentOfTrackRaw)
  );
  const boostActive = boostPercentOfTrack > 0;
  const boostDescription = boostActive
    ? `Double points segment: ${formatNumber(doublePointsTotal)} bonus points.`
    : "";
  const boostMarkup = boostActive
    ? `<span class="points-bonus__meter-boost" style="--bonus-boost:${boostPercentOfTrack}%;" aria-label="${escapeHtml(
        boostDescription
      )}">
        <span class="points-bonus__boost-label" aria-hidden="true">x2</span>
      </span>`
    : "";
  const bonusMeterLabel = boostActive
    ? `${bonusProgressLabel} Includes an orange x2 segment representing ${formatNumber(doublePointsTotal)} double points.`
    : bonusProgressLabel;
  let bonusSourcesCount = 0;
  const bonusBreakdownMarkup = (() => {
    const items = breakdownEntries
      .map((entry, index) => {
        if (!entry || typeof entry !== "object") return null;
        const label =
          typeof entry.label === "string" && entry.label.trim().length > 0 ? entry.label.trim() : "";
        if (!label) return null;
        const normalizedId =
          typeof entry.id === "string" && entry.id.trim().length > 0
            ? entry.id.trim()
            : `bonus-source-${index + 1}`;
        const description =
          typeof entry.description === "string" && entry.description.trim().length > 0
            ? entry.description.trim()
            : "";
        const pointsValue = Number(entry.points);
        const points = Number.isFinite(pointsValue) ? pointsValue : 0;
        const isDouble = entry.firstOfMonthDouble === true;
        const tooltipParts = [];
        if (description) tooltipParts.push(description);
        const pointsLabel = `+${formatNumber(points)} pts${isDouble ? " (double)" : ""}`;
        tooltipParts.push(pointsLabel);
        if (isDouble) {
          tooltipParts.push("First quest completion this month delivered double points.");
        }
        const tooltipText = tooltipParts.join(" · ");
        const sourceClasses = [
          "points-bonus__source",
          isDouble ? "points-bonus__source--boost" : ""
        ]
          .filter(Boolean)
          .join(" ");
        const boostBadge = isDouble
          ? `<span class="points-bonus__source-boost" aria-hidden="true">x2</span>`
          : "";
        return `
          <span
            class="${sourceClasses}"
            role="listitem"
            tabindex="0"
            data-source="${escapeHtml(normalizedId)}"
            data-tooltip="${escapeHtml(tooltipText)}"
            title="${escapeHtml(tooltipText)}"
            aria-label="${escapeHtml(tooltipText)}">
            <span class="points-bonus__source-label">${escapeHtml(label)}</span>
            ${boostBadge}
            <span class="points-bonus__source-points">+${formatNumber(points)} pts</span>
          </span>
        `;
      })
      .filter(Boolean);
    bonusSourcesCount = items.length;
    if (items.length === 0) {
      return `<p class="points-bonus__empty">Activate quests and behaviour nudges to unlock bonus point sources.</p>`;
    }
    return `<div class="points-bonus__sources" role="list">${items.join("")}</div>`;
  })();
  const bonusHoverNote =
    bonusSourcesCount > 0
      ? `<p class="points-bonus__note">Hover or focus a source to see this week's bonus story.</p>`
      : "";
  const remainingLabelMarkup =
    weeklyCap > 0
      ? remainingThisWeek === 0
        ? `<span class="points-bonus__meter-remaining points-bonus__meter-remaining--met">Cap reached</span>`
        : `<span class="points-bonus__meter-remaining">${formatNumber(remainingThisWeek)} pts left</span>`
      : `<span class="points-bonus__meter-remaining">No cap set</span>`;
  const bonusCapLabel = weeklyCap > 0 ? `${formatNumber(weeklyCap)} pt cap` : "No cap set";
  const bonusScaleHtml = `
      <div class="points-bonus" role="region" aria-label="Weekly bonus points">
        <div class="points-bonus__header">
          <h3>Weekly bonus points</h3>
          <span class="points-bonus__cap">${escapeHtml(bonusCapLabel)}</span>
        </div>
        <p class="points-bonus__summary">
          Earn extra points from quests and team boosts. Reporting suspicious emails always awards your core points outside this cap.
        </p>
        <div class="points-bonus__meter" role="img" aria-label="${escapeHtml(bonusMeterLabel)}">
          <div class="points-bonus__meter-track">
            <span class="points-bonus__meter-fill" style="--bonus-progress:${progressPercent}%;"></span>
            ${boostMarkup}
          </div>
          <div class="points-bonus__meter-labels">
            <span class="points-bonus__meter-value">+${formatNumber(earnedThisWeek)} pts</span>
            ${remainingLabelMarkup}
          </div>
        </div>
        ${bonusBreakdownMarkup}
        ${bonusHoverNote}
      </div>
    `;

  const recognitionEntries = getRecognitions()
    .slice()
    .sort(
      (a, b) =>
        new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime()
    );
  const lowerCustomerEmail =
    typeof state.customer?.email === "string"
      ? state.customer.email.trim().toLowerCase()
      : "";
  const recognitionReceived = lowerCustomerEmail
    ? recognitionEntries.filter(entry => {
        const email =
          typeof entry.recipientEmail === "string"
            ? entry.recipientEmail.trim().toLowerCase()
            : "";
        return email === lowerCustomerEmail;
      })
    : [];
  const recognitionGiven = lowerCustomerEmail
    ? recognitionEntries.filter(entry => {
        const email =
          typeof entry.senderEmail === "string"
            ? entry.senderEmail.trim().toLowerCase()
            : "";
        return email === lowerCustomerEmail;
      })
    : [];
  const recognitionPointsTotal = recognitionReceived.reduce(
    (sum, entry) => sum + (Number(entry.points) || 0),
    0
  );
  const recognitionGivenPoints = recognitionGiven.reduce(
    (sum, entry) => sum + (Number(entry.points) || 0),
    0
  );
  const recognitionPeerCount = (() => {
    const peers = new Set();
    recognitionReceived.forEach(entry => {
      const email =
        typeof entry.senderEmail === "string"
          ? entry.senderEmail.trim().toLowerCase()
          : "";
      if (email) peers.add(email);
    });
    return peers.size;
  })();
  const validRecognitionFilters = ["received", "given", "all"];
  const storedFilter =
    typeof state.meta.recognitionFilter === "string"
      ? state.meta.recognitionFilter.trim().toLowerCase()
      : "";
  const activeRecognitionFilter = validRecognitionFilters.includes(storedFilter)
    ? storedFilter
    : "received";
  const recognitionFeedSource =
    activeRecognitionFilter === "received"
      ? recognitionReceived
      : activeRecognitionFilter === "given"
      ? recognitionGiven
      : recognitionEntries;
  const recognitionFeedEntries = recognitionFeedSource.slice(0, 4);
  const recognitionEmptyCopy =
    activeRecognitionFilter === "given"
      ? "Share a recognition note to spotlight a teammate's vigilance, award bonus points, and trigger a x2 quest boost for you both."
      : activeRecognitionFilter === "received"
      ? "No teammate recognition yet. Highlight a story to invite recognition from the wider team and unlock that x2 quest boost."
      : "Recognition moments will appear here as teams swap kudos and line up double quest points.";
  const recognitionFeedMarkup = recognitionFeedEntries.length
    ? recognitionFeedEntries
        .map(entry => renderRecognitionCard(entry, state.customer.email))
        .join("")
    : `<div class="recognition-empty"><p>${escapeHtml(recognitionEmptyCopy)}</p></div>`;
  const recognitionFilterButtons = [
    { id: "received", label: "Got" },
    { id: "given", label: "Gave" },
    { id: "all", label: "All" }
  ]
    .map(filter => {
      const isActive = activeRecognitionFilter === filter.id;
      return `<button type="button" class="recognition-filter${isActive ? " recognition-filter--active" : ""}" data-recognition-filter="${filter.id}">${escapeHtml(filter.label)}</button>`;
    })
    .join("");
  const recognitionControlsMarkup = `
    <div class="recognition-feed__controls" role="toolbar" aria-label="Filter recognition stories">
      ${recognitionFilterButtons}
    </div>
  `;
  const latestRecognition = recognitionReceived[0] || null;
  const latestSnippet = (() => {
    if (!latestRecognition) {
      return `<div class="recognition-summary__recent recognition-summary__recent--placeholder"><p>Encourage peers to celebrate your catches and they'll appear here.</p></div>`;
    }
    const iso =
      typeof latestRecognition.createdAt === "string"
        ? latestRecognition.createdAt
        : "";
    const parsed = iso ? new Date(iso) : null;
    const hasValidDate = parsed && !Number.isNaN(parsed.getTime());
    const relativeLabel = hasValidDate ? relativeTime(iso) : "Just now";
    const message =
      typeof latestRecognition.message === "string"
        ? latestRecognition.message.trim()
        : "";
    const snippet =
      message.length > 120 ? `${message.slice(0, 117)}...` : message;
    const senderLabel =
      latestRecognition.senderName ||
      latestRecognition.senderEmail ||
      "Teammate";
    const focusLabel =
      typeof latestRecognition.focus === "string" &&
      latestRecognition.focus.trim().length > 0
        ? latestRecognition.focus.trim()
        : "";
    const focusMarkup = focusLabel ? ` - ${escapeHtml(focusLabel)}` : "";
    const snippetMarkup = snippet
      ? `<blockquote class="recognition-summary__quote">"${escapeHtml(
          snippet
        )}"</blockquote>`
      : "";
    return `
      <div class="recognition-summary__recent">
        <span class="recognition-summary__recent-label">Latest recognition</span>
        <p><strong>${escapeHtml(senderLabel)}</strong> ${escapeHtml(
          relativeLabel
        )}${focusMarkup}</p>
        ${snippetMarkup}
      </div>
    `;
  })();
  const recognitionSummaryHelper =
    recognitionGivenPoints > 0
      ? `You have passed on ${formatNumber(
          recognitionGivenPoints
        )} pts to your teammates and lined up a x2 quest boost for both sides.`
      : "Share recognition when someone stops a threat to award bonus points and unlock a x2 quest boost for you and them.";
  const recognitionSummaryHtml = `
    <article class="recognition-summary">
      <span class="recognition-summary__eyebrow">Teammate recognition</span>
      <h3 class="recognition-summary__title">Vigilance kudos</h3>
      <div class="recognition-summary__metric">
        <span class="recognition-summary__metric-value">+${formatNumber(
          recognitionPointsTotal
        )}</span>
        <span class="recognition-summary__metric-label">pts awarded to you</span>
      </div>
      <ul class="recognition-summary__stats">
        <li><strong>${formatNumber(
          recognitionReceived.length
        )}</strong><span>Got</span></li>
        <li><strong>${formatNumber(
          recognitionGiven.length
        )}</strong><span>Gave</span></li>
        <li><strong>${formatNumber(
          recognitionPeerCount
        )}</strong><span>Boost</span></li>
      </ul>
      <p class="recognition-summary__helper">${escapeHtml(
        recognitionSummaryHelper
      )}</p>
      ${latestSnippet}
    </article>
  `;
  const recognitionBoardMarkup = `
    <section class="customer-section customer-section--recognition">
      <div class="section-header">
        <h2>Recognition highlights</h2>
        <p>Celebrate vigilance stories so every teammate knows what suspicious activity looks like.</p>
      </div>
      <div class="recognition-board__note" role="note" aria-label="Recognition quest boost reminder">
        <div class="recognition-board__note-header">
          <span class="recognition-board__note-title">Share recognition</span>
          <button type="button" class="button-pill button-pill--primary recognition-board__note-button" aria-haspopup="dialog">
            Share now
          </button>
        </div>
        <span class="recognition-board__note-badge"><span>x2 quest boost</span></span>
        <p>Give or receive kudos and your next quest pays double points for both teammates.</p>
      </div>
      <div class="recognition-board">
        <div class="recognition-board__insight">
          ${recognitionSummaryHtml}
        </div>
        <div class="recognition-board__feed">
          ${recognitionControlsMarkup}
          <div class="recognition-feed">
            ${recognitionFeedMarkup}
          </div>
        </div>
      </div>
    </section>
  `;

  const rewardsHtml = publishedRewards
    .map(reward => {
      const remainingLabel = rewardRemainingLabel(reward);
      const pointsCost = Number(reward.pointsCost) || 0;
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
          <span>${remainingLabel} left</span>
        </div>
        <div class="reward-card__actions">
          <span class="reward-card__chip reward-card__chip--points">
            <strong class="reward-card__points-value">${formatNumber(pointsCost)}</strong>
            <span class="reward-card__points-unit">pts</span>
          </span>
          <button type="button" class="reward-card__cta button-pill button-pill--primary">Redeem reward</button>
        </div>
      </article>
    `;
    })
    .join("");

  const questsHtml = publishedQuests
    .map(quest => {
      const questId = escapeHtml(String(quest.id));
      const focusTags = Array.isArray(quest.focus)
        ? quest.focus.slice(0, 2).map(item => `<span>${escapeHtml(item)}</span>`).join("")
        : "";
      const focusBlock = focusTags ? `<div class="quest-card__focus quest-card__focus--compact">${focusTags}</div>` : "";
      const difficultyChip = quest.difficulty
        ? `<span class="quest-card__chip quest-card__chip--difficulty" data-difficulty="${escapeHtml(
            quest.difficulty
          )}">${escapeHtml(quest.difficulty)}</span>`
        : "";
      const difficultyRow = difficultyChip ? `<div class="quest-card__header-top">${difficultyChip}</div>` : "";
      const headerTags = [];
      if (quest.category) headerTags.push(`<span class="quest-card__chip">${escapeHtml(quest.category)}</span>`);
      const chipGroup = headerTags.length ? `<div class="quest-card__chip-group">${headerTags.join("")}</div>` : "";
      const questLabel = quest.title ? escapeHtml(quest.title) : "quest";
      const configButton = `<button type="button" class="quest-card__config" data-quest="${questId}" title="Configure ${questLabel}" aria-label="Configure ${questLabel}"><span class="quest-card__config-cog" aria-hidden="true">⚙</span></button>`;
      return `
      <article class="quest-card quest-card--hub" data-quest="${questId}">
        ${configButton}
        <header class="quest-card__header quest-card__header--hub">
          ${difficultyRow}
          ${chipGroup}
        </header>
        <h4 class="quest-card__title">${escapeHtml(quest.title)}</h4>
        <p class="quest-card__description">${escapeHtml(quest.description)}</p>
        <ul class="quest-card__details quest-card__details--compact">
          <li><span>Duration</span><strong>${escapeHtml(String(quest.duration))} min</strong></li>
          <li><span>Questions</span><strong>${escapeHtml(String(quest.questions))}</strong></li>
          <li><span>Format</span><strong>${escapeHtml(quest.format || "")}</strong></li>
        </ul>
        ${focusBlock}
        <div class="quest-card__footer quest-card__footer--hub">
          <span class="quest-card__points">
            <strong class="quest-card__points-value">${formatNumber(quest.points || 0)}</strong>
            <span class="quest-card__points-unit">pts</span>
          </span>
          <button type="button" class="button-pill button-pill--primary quest-card__cta" data-quest="${questId}">
            Take Quiz
          </button>
        </div>
      </article>
    `;
    })
    .join("");

  const rarityOrder = ["Legendary", "Expert", "Skilled", "Rising", "Starter"];
  const demoBadgeAchievements = [
    { id: "resilience-ranger", achievedAt: "2025-03-14T10:45:00Z" },
    { id: "zero-day-zeal", achievedAt: "2025-03-02T09:10:00Z" },
    { id: "automation-ally", achievedAt: "2025-02-21T16:30:00Z" },
    { id: "bullseye-breaker", achievedAt: "2025-02-12T08:15:00Z" },
    { id: "hub-hopper", achievedAt: "2025-03-18T12:05:00Z", highlight: "recent" }
  ];
  const demoBadges = demoBadgeAchievements
    .map(entry => {
      const badge = publishedBadges.find(item => item.id === entry.id);
      if (!badge) return null;
      return { ...badge, achievedAt: entry.achievedAt, highlight: entry.highlight || null };
    })
    .filter(Boolean);
  const recentBadge =
    demoBadges.find(item => item.highlight === "recent") ||
    demoBadges
      .slice()
      .sort((a, b) => {
        const timeA = new Date(a.achievedAt || 0).getTime();
        const timeB = new Date(b.achievedAt || 0).getTime();
        return timeB - timeA;
      })[0];
  const getRarityRank = badge => {
    const difficulty = typeof badge.difficulty === "string" ? badge.difficulty : "";
    const index = rarityOrder.indexOf(difficulty);
    return index === -1 ? rarityOrder.length : index;
  };
  const topRarityBadges = demoBadges
    .filter(badge => !recentBadge || badge.id !== recentBadge.id)
    .sort((a, b) => {
      const rarityDiff = getRarityRank(a) - getRarityRank(b);
      if (rarityDiff !== 0) return rarityDiff;
      const pointsDiff = (Number(b.points) || 0) - (Number(a.points) || 0);
      if (pointsDiff !== 0) return pointsDiff;
      const timeA = new Date(a.achievedAt || 0).getTime();
      const timeB = new Date(b.achievedAt || 0).getTime();
      return timeB - timeA;
    })
    .slice(0, 3);
  const fallbackTopBadges = recentBadge
    ? publishedBadges.filter(badge => badge.id !== recentBadge.id)
    : publishedBadges.slice();
  const displayTopBadges = topRarityBadges.length > 0 ? topRarityBadges : fallbackTopBadges.slice(0, 3);
  const renderBadgeShowcaseItem = (badge, extraClass = "") => {
    const achievedDate = badge?.achievedAt ? new Date(badge.achievedAt) : null;
    const metaMarkup =
      achievedDate && !Number.isNaN(achievedDate.getTime())
        ? `<span class="badge-showcase__meta">Unlocked ${escapeHtml(formatDateTime(badge.achievedAt))}</span>`
        : "";
    return `
      <div class="badge-showcase__item${extraClass ? ` ${extraClass}` : ""}" role="listitem">
        ${renderHubBadgeCard(badge)}
        ${metaMarkup}
      </div>
    `;
  };
  const topBadgesMarkup = displayTopBadges.length
    ? `
      <div class="badge-showcase__list" role="list" aria-label="Top badges by rarity">
        ${displayTopBadges.map(badge => renderBadgeShowcaseItem(badge)).join("")}
      </div>
    `
    : "";
  const recentBadgeMarkup = recentBadge
    ? `
      <div class="badge-showcase__list badge-showcase__list--recent" role="list" aria-label="Most recent badge">
        ${renderBadgeShowcaseItem(recentBadge, "badge-showcase__item--recent")}
      </div>
    `
    : "";
  const hasAnyBadges = displayTopBadges.length > 0 || Boolean(recentBadge);
  const badgesHtml = hasAnyBadges
    ? `
      <div class="badge-showcase${recentBadge ? " badge-showcase--inline" : ""}">
        ${topBadgesMarkup}
        ${
          recentBadge
            ? `<div class="badge-showcase__divider" role="separator" aria-hidden="true"></div>${recentBadgeMarkup}`
            : ""
        }
      </div>
    `
    : `<div class="badge-empty"><p>No badges are currently published. Switch to the organisation catalogue to curate them.</p></div>`;

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
      ${bonusScaleHtml}
    </section>
    <section class="customer-section customer-section--badges">
      <div class="section-header">
        <h2>Your badges</h2>
        <p>Preview the badges your organisation curates. Published badges appear here and inside the add-in spotlight.</p>
      </div>
      ${badgesHtml}
      <div class="badge-showcase__cta">
        <button type="button" class="button-pill button-pill--ghost badge-showcase__cta-button" data-route="customer-badges" data-role="customer">
          Show full badge catalogue
        </button>
      </div>
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
    ${recognitionBoardMarkup}
  `;
}

function renderCustomerBadgesPage() {
  const publishedBadges = getBadges().filter(badge => badge.published);
  const badgeCount = publishedBadges.length;
  const badgeLabel = badgeCount === 1 ? "badge" : "badges";
  const badgeGrid = badgeCount
    ? `
      <div class="gem-badge-grid gem-badge-grid--hub customer-badge-grid" role="list" aria-label="All published badges">
        ${publishedBadges
          .map(
            badge => `
          <div class="customer-badge-grid__item" role="listitem">
            ${renderHubBadgeCard(badge)}
          </div>
        `
          )
          .join("")}
      </div>
    `
    : `<div class="customer-detail__empty">No badges are currently published. Return to the hub to curate or publish them.</div>`;

  const descriptionTail = badgeCount
    ? ` Currently showing ${escapeHtml(formatNumber(badgeCount))} ${badgeLabel}.`
    : "";

  return `
    <header class="customer-detail-header">
      <button type="button" class="button-pill button-pill--ghost customer-detail__back" data-action="back-to-hub">
        Back to hub
      </button>
      <span class="customer-detail__eyebrow">Badges</span>
      <h1>All available badges</h1>
      <p>Every badge your organisation has published to the reporter hub.${descriptionTail}</p>
    </header>
    <section class="customer-section customer-section--badges customer-section--badges-all">
      ${badgeGrid}
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
        .map(reason => `<span class="detail-chip">${escapeHtml(reason.label)}</span>`)
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
      value: clients.length ? formatNumber(totalActiveUsers) : "--",
      trend: clients.length
        ? { direction: "up", value: "+18", caption: "vs last quarter" }
        : { direction: "up", value: "Ready to demo", caption: "Add sample data" },
      tone: "indigo",
      icon: "rocket"
    },
    {
      label: "Average health",
      value: clients.length ? `${formatNumber(averageHealth)}%` : "--",
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

  const leaderboardEntries = Array.isArray(state.departmentLeaderboard)
    ? state.departmentLeaderboard
        .slice()
        .sort((a, b) => (Number(b?.points) || 0) - (Number(a?.points) || 0))
    : [];
  const publishedDepartments = leaderboardEntries.filter(entry => entry && entry.published);
  const leaderboardRows = leaderboardEntries.length
    ? leaderboardEntries
        .map((entry, index) => {
          if (!entry) return "";
          const fallbackId = `dept-${index}`;
          const entryId =
            typeof entry.id === "string" && entry.id.trim().length > 0 ? entry.id.trim() : fallbackId;
          const tone =
            typeof entry.tone === "string" && entry.tone.trim().length > 0
              ? entry.tone.trim().toLowerCase()
              : "indigo";
          const pointsValue = Number.isFinite(entry.points) ? formatNumber(entry.points) : "0";
          const momentumTag =
            typeof entry.momentumTag === "string" && entry.momentumTag.trim().length > 0
              ? entry.momentumTag.trim()
              : "Momentum story";
          const rawTrendDirection =
            typeof entry.trendDirection === "string" && entry.trendDirection.trim().length > 0
              ? entry.trendDirection.trim().toLowerCase()
              : "";
          const trendDirection =
            rawTrendDirection === "up" || rawTrendDirection === "down" ? rawTrendDirection : "steady";
          const trendValue =
            typeof entry.trendValue === "string" && entry.trendValue.trim().length > 0
              ? entry.trendValue.trim()
              : "--";
          const trendCaption =
            typeof entry.trendCaption === "string" && entry.trendCaption.trim().length > 0
              ? `<span class="detail-table__meta">${escapeHtml(entry.trendCaption)}</span>`
              : "";
          const participation = Number.isFinite(entry.participationRate)
            ? formatPercent(entry.participationRate)
            : "--";
          const streakWeeks = Number.isFinite(entry.streakWeeks)
            ? `${formatNumber(entry.streakWeeks)} wks`
            : "--";
          const badge = badgeById(entry.featuredBadgeId);
          const badgeLabel = badge ? `Badge: ${badge.title}` : null;
          const quest = Array.isArray(state.quests)
            ? state.quests.find(questItem => String(questItem.id) === String(entry.featuredQuestId))
            : null;
          const questLabel = quest ? `Quest: ${quest.title}` : null;
          const avgResponse =
            Number.isFinite(entry.avgResponseMinutes) && entry.avgResponseMinutes > 0
              ? `Avg triage ${formatNumber(entry.avgResponseMinutes)} mins`
              : null;
          const chips = [];
          if (badgeLabel) chips.push(`<span class="department-leaderboard__chip">${escapeHtml(badgeLabel)}</span>`);
          if (questLabel) chips.push(`<span class="department-leaderboard__chip">${escapeHtml(questLabel)}</span>`);
          if (avgResponse) chips.push(`<span class="department-leaderboard__chip">${escapeHtml(avgResponse)}</span>`);
          const chipsMarkup = chips.length
            ? `<div class="department-leaderboard__chips">${chips.join("")}</div>`
            : "";
          const focusNarrative =
            typeof entry.focusNarrative === "string" && entry.focusNarrative.trim().length > 0
              ? `<p class="department-leaderboard__focus">${escapeHtml(entry.focusNarrative)}</p>`
              : "";
          const action = entry.published ? "unpublish" : "publish";
          const actionLabel = entry.published ? "Unpublish" : "Publish";
          const actionTone = entry.published ? "button-pill--danger-light" : "button-pill--primary";
          const statusLabel = entry.published ? "Published" : "Draft";
          const statusClass = entry.published
            ? "department-leaderboard__state--published"
            : "department-leaderboard__state--draft";
          return `
            <tr class="department-leaderboard__row" data-tone="${escapeHtml(tone)}" data-department="${escapeHtml(entryId)}">
              <td class="department-leaderboard__rank-cell">
                <span class="department-leaderboard__rank" data-rank="${index + 1}">${formatNumber(index + 1)}</span>
              </td>
              <td>
                <div class="department-leaderboard__team">
                  <strong>${escapeHtml(entry.name || "Department")}</strong>
                  <span class="detail-table__meta">${escapeHtml(entry.department || "Organisation team")}</span>
                </div>
              </td>
              <td>
                <div class="department-leaderboard__metric">
                  <strong>${pointsValue}</strong>
                  <span class="detail-table__meta">${escapeHtml(momentumTag)}</span>
                </div>
              </td>
              <td>
                <div class="department-leaderboard__trend" data-direction="${trendDirection}">
                  <strong>${escapeHtml(trendValue)}</strong>
                  ${trendCaption}
                </div>
              </td>
              <td>
                <div class="department-leaderboard__metric">
                  <strong>${escapeHtml(participation)}</strong>
                  <span class="detail-table__meta">Participation</span>
                </div>
              </td>
              <td>
                <div class="department-leaderboard__metric">
                  <strong>${escapeHtml(streakWeeks)}</strong>
                  <span class="detail-table__meta">Streak</span>
                </div>
              </td>
              <td>
                ${chipsMarkup}${focusNarrative}
              </td>
              <td class="department-leaderboard__actions">
                <span class="department-leaderboard__state ${statusClass}">${statusLabel}</span>
                <div class="table-actions">
                  <button
                    type="button"
                    class="button-pill ${actionTone} department-publish-toggle"
                    data-department="${escapeHtml(entryId)}"
                    data-action="${action}">
                    ${actionLabel}
                  </button>
                </div>
              </td>
            </tr>
          `;
        })
        .join("")
    : `<tr><td colspan="8" class="department-leaderboard__empty">Add departments to highlight the leaderboard story.</td></tr>`;

  const leaderboardSummaryItems = [
    `${formatNumber(leaderboardEntries.length)} departments`,
    `${formatNumber(publishedDepartments.length)} published`
  ];
  const leaderboardSummaryCopy = leaderboardSummaryItems.join(" | ");
  const leaderboardMarkup = `
    <section class="department-leaderboard">
      <div class="section-header">
        <h2>Department leaderboard</h2>
        <p>Inspire friendly competition with streaks, spotlighted badges, and hub-ready publishing.</p>
      </div>
      <div class="department-leaderboard__controls">
        <p class="detail-table__meta">${escapeHtml(leaderboardSummaryCopy)}</p>
        <div class="department-leaderboard__bulk">
          <button type="button" class="button-pill button-pill--primary" data-bulk-department-action="publish">Publish all</button>
          <button type="button" class="button-pill button-pill--danger-light" data-bulk-department-action="unpublish">Unpublish all</button>
        </div>
      </div>
      <div class="detail-table-wrapper department-leaderboard__table-wrapper">
        <table class="detail-table department-leaderboard__table">
          <thead>
            <tr>
              <th>#</th>
              <th>Department</th>
              <th>Points</th>
              <th>Trend</th>
              <th>Participation</th>
              <th>Streak</th>
              <th>Spotlight</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>${leaderboardRows}</tbody>
        </table>
      </div>
    </section>
  `;

  const programs = Array.isArray(state.engagementPrograms) ? state.engagementPrograms.slice() : [];
  programs.sort((a, b) => {
    const aPublished = Boolean(a?.published);
    const bPublished = Boolean(b?.published);
    if (aPublished !== bPublished) {
      return aPublished ? -1 : 1;
    }
    const titleA = typeof a?.title === "string" ? a.title : "";
    const titleB = typeof b?.title === "string" ? b.title : "";
    return titleA.localeCompare(titleB, undefined, { sensitivity: "base" });
  });
  const publishedPrograms = programs.filter(program => program && program.published);
  const programCards = programs.length
    ? programs
        .map((program, index) => {
          if (!program) return "";
          const fallbackId = `program-${index}`;
          const programId =
            typeof program.id === "string" && program.id.trim().length > 0 ? program.id.trim() : fallbackId;
          const tone =
            typeof program.tone === "string" && program.tone.trim().length > 0
              ? program.tone.trim().toLowerCase()
              : "indigo";
          const statusLabel = program.published
            ? "Published"
            : program.status && String(program.status).trim().length > 0
            ? String(program.status).trim()
            : "Draft";
          const statusClass = program.published
            ? "engagement-card__status--published"
            : "engagement-card__status--draft";
          const action = program.published ? "unpublish" : "publish";
          const actionLabel = program.published ? "Unpublish" : "Publish";
          const actionTone = program.published ? "button-pill--danger-light" : "button-pill--primary";
          const metricValue =
            typeof program.metricValue === "string" && program.metricValue.trim().length > 0
              ? program.metricValue.trim()
              : "--";
          const metricCaption =
            typeof program.metricCaption === "string" && program.metricCaption.trim().length > 0
              ? program.metricCaption.trim()
              : "";
          const audience =
            typeof program.audience === "string" && program.audience.trim().length > 0
              ? program.audience.trim()
              : "";
          const owner =
            typeof program.owner === "string" && program.owner.trim().length > 0 ? program.owner.trim() : "";
          const successSignal =
            typeof program.successSignal === "string" && program.successSignal.trim().length > 0
              ? program.successSignal.trim()
              : "";
          const metaItems = [];
          if (audience) {
            metaItems.push(`<li><strong>Audience</strong><span>${escapeHtml(audience)}</span></li>`);
          }
          if (owner) {
            metaItems.push(`<li><strong>Owner</strong><span>${escapeHtml(owner)}</span></li>`);
          }
          const metaMarkup = metaItems.length
            ? `<ul class="engagement-card__meta">${metaItems.join("")}</ul>`
            : "";
          const successMarkup = successSignal
            ? `<p class="engagement-card__signal">${escapeHtml(successSignal)}</p>`
            : "";
          const category =
            typeof program.category === "string" && program.category.trim().length > 0
              ? program.category.trim()
              : "Programme";
          const description =
            typeof program.description === "string" && program.description.trim().length > 0
              ? program.description.trim()
              : "";
          return `
            <article
              class="engagement-card ${program.published ? "engagement-card--published" : "engagement-card--draft"}"
              data-program="${escapeHtml(programId)}"
              data-tone="${escapeHtml(tone)}">
              <header class="engagement-card__header">
                <span class="engagement-card__category">${escapeHtml(category)}</span>
                <span class="engagement-card__status ${statusClass}">${escapeHtml(statusLabel)}</span>
              </header>
              <h3 class="engagement-card__title">${escapeHtml(program.title || "Gamification boost")}</h3>
              <p class="engagement-card__description">${escapeHtml(description)}</p>
              <div class="engagement-card__metric">
                <span class="engagement-card__metric-value">${escapeHtml(metricValue)}</span>
                <span class="engagement-card__metric-caption">${escapeHtml(metricCaption)}</span>
              </div>
              ${metaMarkup}
              ${successMarkup}
              <footer class="engagement-card__footer">
                <span class="detail-table__meta">${escapeHtml(program.published ? "Visible in hub" : "Draft only")}</span>
                <button
                  type="button"
                  class="button-pill ${actionTone} program-publish-toggle"
                  data-program="${escapeHtml(programId)}"
                  data-action="${action}">
                  ${actionLabel}
                </button>
              </footer>
            </article>
          `;
        })
        .join("")
    : `<div class="engagement-empty"><p>No gamification boosts configured yet. Pair the leaderboard with a programme to make it shine.</p></div>`;

  const programSummaryItems = [
    `${formatNumber(programs.length)} programmes`,
    `${formatNumber(publishedPrograms.length)} published`
  ];
  const programSummaryCopy = programSummaryItems.join(" | ");
  const programsMarkup = `
    <section class="engagement-programs">
      <div class="section-header">
        <h2>Gamification boosts</h2>
        <p>Bundle badge drops, double points windows, and quest playlists, then publish when the story is ready.</p>
      </div>
      <div class="engagement-programs__controls">
        <p class="detail-table__meta">${escapeHtml(programSummaryCopy)}</p>
        <div class="engagement-programs__bulk">
          <button type="button" class="button-pill button-pill--primary" data-bulk-program-action="publish">Publish all</button>
          <button type="button" class="button-pill button-pill--danger-light" data-bulk-program-action="unpublish">Unpublish all</button>
        </div>
      </div>
      <div class="engagement-programs__grid">
        ${programCards}
      </div>
    </section>
  `;

  return `
    <section class="client-catalogue__intro">
      <span class="client-catalogue__eyebrow">Organisation Hub</span>
      <h1>Track health and momentum in one glance.</h1>
      <p>Use this view to connect reporter energy, security follow-up, and the rewards in flight. Everything aligns to the questions prospects ask.</p>
    </section>
    <section class="metrics-grid">
      ${metricsMarkup}
    </section>
    ${leaderboardMarkup}
    ${programsMarkup}
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
        .map(reason => `<span class="detail-chip">${escapeHtml(reason.label)}</span>`)
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
  const statusFilter =
    typeof state.meta.rewardStatusFilter === "string" && state.meta.rewardStatusFilter.length > 0
      ? state.meta.rewardStatusFilter
      : null;

  const categoryFilteredRewards = activeFilter
    ? rewards.filter(reward => {
        const category = typeof reward.category === "string" ? reward.category.trim().toLowerCase() : "";
        return category === activeFilter;
      })
    : rewards;

  const filteredRewards =
    statusFilter === "published"
      ? categoryFilteredRewards.filter(reward => reward.published)
      : statusFilter === "unpublished"
      ? categoryFilteredRewards.filter(reward => !reward.published)
      : categoryFilteredRewards;

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
          const actionLabel = isPublished ? "Unpublish" : "Publish";
          const actionTone = isPublished ? "button-pill--danger-light" : "button-pill--primary";
          const remainingLabel = rewardRemainingLabel(reward);
          const remainingCopy =
            reward?.unlimited === true
              ? "Unlimited redemptions"
              : `${remainingLabel} remaining`;
          const pointsCost = Number(reward.pointsCost) || 0;
          const categoryLabel = formatCatalogueLabel(reward.category || "Reward");
          const providerLabel = reward.provider ? reward.provider : "WeldSecure";
          const rewardLabel = reward.name ? escapeHtml(reward.name) : "Reward";
          const configButton = `<button type="button" class="reward-card__config" data-reward="${id}" title="Configure ${rewardLabel}" aria-label="Configure ${rewardLabel}"><span class="reward-card__config-cog" aria-hidden="true">⚙</span></button>`;
          return `
            <article class="reward-card reward-card--catalogue ${isPublished ? "reward-card--published" : "reward-card--draft"}" data-reward="${id}">
              ${configButton}
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
                <span>${remainingCopy}</span>
              </div>
              <div class="reward-card__actions">
                <span class="catalogue-card__tag reward-card__chip reward-card__chip--points">
                  <strong class="reward-card__points-value">${formatNumber(pointsCost)}</strong>
                  <span class="reward-card__points-unit">pts</span>
                </span>
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

  const selectedCategoryLabel =
    activeFilter && categoryMap.has(activeFilter)
      ? formatCatalogueLabel(categoryMap.get(activeFilter))
      : null;

  const filterSummaryParts = [];
  if (statusFilter === "published") {
    filterSummaryParts.push("Published only");
  } else if (statusFilter === "unpublished") {
    filterSummaryParts.push("Unpublished only");
  }
  if (selectedCategoryLabel) {
    filterSummaryParts.push(`Category: ${selectedCategoryLabel}`);
  }

  const filterSummaryText = filterSummaryParts.length ? filterSummaryParts.join(" - ") : "";
  const resultsSummary =
    activeFilter || statusFilter
      ? `${formatNumber(filteredRewards.length)} of ${formatNumber(rewards.length)} rewards shown`
      : "";

  const actionsMeta =
    [resultsSummary, filterSummaryText, baseInventoryCopy].filter(Boolean).join(" | ") || baseInventoryCopy;

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

  const statusFilterMarkup = `
        <div class="badge-filter client-catalogue__status" role="toolbar" aria-label="Reward publication status">
          <button
            type="button"
            class="badge-filter__item${statusFilter ? "" : " badge-filter__item--active"}"
            data-reward-status=""
            aria-pressed="${statusFilter ? "false" : "true"}">
            All statuses
          </button>
          <button
            type="button"
            class="badge-filter__item${statusFilter === "published" ? " badge-filter__item--active" : ""}"
            data-reward-status="published"
            aria-pressed="${statusFilter === "published" ? "true" : "false"}">
            Published
          </button>
          <button
            type="button"
            class="badge-filter__item${statusFilter === "unpublished" ? " badge-filter__item--active" : ""}"
            data-reward-status="unpublished"
            aria-pressed="${statusFilter === "unpublished" ? "true" : "false"}">
            Unpublished
          </button>
        </div>
      `;

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

  const summaryMarkup = actionsMeta
    ? `<p class="detail-table__meta">${escapeHtml(actionsMeta)}</p>`
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
      <div class="client-catalogue__actions-row">
        <div class="client-rewards__bulk">
          <button type="button" class="button-pill button-pill--primary" data-bulk-reward-action="publish">Publish all rewards</button>
          <button type="button" class="button-pill button-pill--danger-light" data-bulk-reward-action="unpublish">Unpublish all rewards</button>
        </div>
        ${statusFilterMarkup}
      </div>
      ${filterMarkup}
      ${summaryMarkup}
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
  const statusFilter =
    typeof state.meta.questStatusFilter === "string" && state.meta.questStatusFilter.length > 0
      ? state.meta.questStatusFilter
      : null;

  const categoryFilteredQuests = activeFilter
    ? quests.filter(quest => {
        const category = typeof quest.category === "string" ? quest.category.trim().toLowerCase() : "";
        return category === activeFilter;
      })
    : quests;

  const filteredQuests =
    statusFilter === "published"
      ? categoryFilteredQuests.filter(quest => quest.published)
      : statusFilter === "unpublished"
      ? categoryFilteredQuests.filter(quest => !quest.published)
      : categoryFilteredQuests;

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
          const actionLabel = isPublished ? "Unpublish" : "Publish";
          const actionTone = isPublished ? "button-pill--danger-light" : "button-pill--primary";
          const difficultyChip = quest.difficulty
            ? `<span class="catalogue-card__tag quest-card__chip quest-card__chip--difficulty" data-difficulty="${escapeHtml(
                quest.difficulty
              )}">${escapeHtml(quest.difficulty)}</span>`
            : "";
          const difficultyRow = difficultyChip ? `<div class="quest-card__header-top">${difficultyChip}</div>` : "";
          const otherTags = [];
          if (quest.category) {
            otherTags.push(
              `<span class="catalogue-card__tag quest-card__chip">${escapeHtml(
                formatCatalogueLabel(quest.category)
              )}</span>`
            );
          }
          const tagMarkup = otherTags.length
            ? `<div class="quest-card__chip-group catalogue-card__tags">${otherTags.join("")}</div>`
            : "";
          const focusMarkup = Array.isArray(quest.focus) && quest.focus.length
            ? `<div class="quest-card__focus">${quest.focus
                .slice(0, 3)
                .map(item => `<span>${escapeHtml(item)}</span>`)
                .join("")}</div>`
            : "";
          const questLabel = quest.title ? escapeHtml(quest.title) : "Quest";
          const configButton = `<button type="button" class="quest-card__config" data-quest="${id}" title="Configure ${questLabel}" aria-label="Configure ${questLabel}"><span class="quest-card__config-cog" aria-hidden="true">⚙</span></button>`;
          return `
            <article class="quest-card ${isPublished ? "quest-card--published" : "quest-card--draft"}" data-quest="${id}">
              ${configButton}
              <header class="quest-card__header">
                ${difficultyRow}
                ${tagMarkup}
              </header>
              <h3 class="quest-card__title">${escapeHtml(quest.title || "Quest")}</h3>
              <p class="quest-card__description">${escapeHtml(quest.description || "")}</p>
              <ul class="quest-card__details">
                <li><span>Format</span><strong>${escapeHtml(quest.format || "Interactive")}</strong></li>
                <li><span>Duration</span><strong>${formatNumber(Number(quest.duration) || 0)} min</strong></li>
                <li><span>Questions</span><strong>${formatNumber(Number(quest.questions) || 0)}</strong></li>
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
                <span class="quest-card__points">
                  <strong class="quest-card__points-value">${formatNumber(Number(quest.points) || 0)}</strong>
                  <span class="quest-card__points-unit">pts</span>
                </span>
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

  const statusFilterMarkup = `
        <div class="badge-filter client-catalogue__status" role="toolbar" aria-label="Quest publication status">
          <button
            type="button"
            class="badge-filter__item${statusFilter ? "" : " badge-filter__item--active"}"
            data-quest-status=""
            aria-pressed="${statusFilter ? "false" : "true"}">
            All statuses
          </button>
          <button
            type="button"
            class="badge-filter__item${statusFilter === "published" ? " badge-filter__item--active" : ""}"
            data-quest-status="published"
            aria-pressed="${statusFilter === "published" ? "true" : "false"}">
            Published
          </button>
          <button
            type="button"
            class="badge-filter__item${statusFilter === "unpublished" ? " badge-filter__item--active" : ""}"
            data-quest-status="unpublished"
            aria-pressed="${statusFilter === "unpublished" ? "true" : "false"}">
            Unpublished
          </button>
        </div>
      `;

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

  const selectedCategoryLabel =
    activeFilter && categoryMap.has(activeFilter)
      ? formatCatalogueLabel(categoryMap.get(activeFilter))
      : null;

  const filterSummaryParts = [];
  if (statusFilter === "published") {
    filterSummaryParts.push("Published only");
  } else if (statusFilter === "unpublished") {
    filterSummaryParts.push("Unpublished only");
  }
  if (selectedCategoryLabel) {
    filterSummaryParts.push(`Category: ${selectedCategoryLabel}`);
  }

  const filterSummaryText = filterSummaryParts.length ? filterSummaryParts.join(" - ") : "";
  const resultsSummary =
    activeFilter || statusFilter
      ? `${formatNumber(filteredQuests.length)} of ${formatNumber(quests.length)} quests shown`
      : "";

  const actionsMeta = [resultsSummary, filterSummaryText].filter(Boolean).join(" | ");

  const summaryMarkup = actionsMeta
    ? `<p class="detail-table__meta">${escapeHtml(actionsMeta)}</p>`
    : "";

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
      <div class="client-catalogue__actions-row">
        <div class="client-quests__bulk">
          <button type="button" class="button-pill button-pill--primary" data-bulk-quest-action="publish">Publish all quests</button>
          <button type="button" class="button-pill button-pill--danger-light" data-bulk-quest-action="unpublish">Unpublish all quests</button>
        </div>
        ${statusFilterMarkup}
      </div>
      ${filterMarkup}
      ${summaryMarkup}
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
  const statusFilter =
    typeof state.meta.badgeStatusFilter === "string" && state.meta.badgeStatusFilter.length > 0
      ? state.meta.badgeStatusFilter
      : null;

  const categoryFilteredBadges = activeFilter
    ? badges.filter(badge => {
        const category = typeof badge.category === "string" ? badge.category.trim().toLowerCase() : "";
        return category === activeFilter;
      })
    : badges;

  const filteredBadges =
    statusFilter === "published"
      ? categoryFilteredBadges.filter(badge => badge.published)
      : statusFilter === "unpublished"
      ? categoryFilteredBadges.filter(badge => !badge.published)
      : categoryFilteredBadges;

  const selectedCategoryLabel =
    activeFilter && categoryMap.has(activeFilter)
      ? formatCatalogueLabel(categoryMap.get(activeFilter))
      : null;

  const summaryParts = [];
  if (activeFilter || statusFilter) {
    summaryParts.push(`${formatNumber(filteredBadges.length)} of ${formatNumber(badges.length)} badges shown`);
  }
  if (statusFilter === "published") {
    summaryParts.push("Published only");
  } else if (statusFilter === "unpublished") {
    summaryParts.push("Unpublished only");
  }
  if (selectedCategoryLabel) {
    summaryParts.push(`Category: ${selectedCategoryLabel}`);
  }

  const summaryMarkup = summaryParts.length
    ? `<p class="detail-table__meta">${escapeHtml(summaryParts.join(" | "))}</p>`
    : "";

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

  const statusFilterMarkup = `
      <div class="badge-filter client-catalogue__status" role="toolbar" aria-label="Badge publication status">
        <button
          type="button"
          class="badge-filter__item${statusFilter ? "" : " badge-filter__item--active"}"
          data-badge-status=""
          aria-pressed="${statusFilter ? "false" : "true"}">
          All statuses
        </button>
        <button
          type="button"
          class="badge-filter__item${statusFilter === "published" ? " badge-filter__item--active" : ""}"
          data-badge-status="published"
          aria-pressed="${statusFilter === "published" ? "true" : "false"}">
          Published
        </button>
        <button
          type="button"
          class="badge-filter__item${statusFilter === "unpublished" ? " badge-filter__item--active" : ""}"
          data-badge-status="unpublished"
          aria-pressed="${statusFilter === "unpublished" ? "true" : "false"}">
          Unpublished
        </button>
      </div>
      `;

  const filterMarkup = categories.length
    ? `
      <div class="badge-filter client-badges__filters" role="toolbar" aria-label="Badge categories">
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

  const renderBadgeCard = (badge, index) => {
    const rawId = String(badge.id ?? generateId("badge"));
    const sanitizedId = rawId.replace(/[^a-zA-Z0-9:_-]/g, "-");
    const id = escapeHtml(rawId);
    const cardId = escapeHtml(`badge-card-${index}-${sanitizedId || "detail"}`);
    const action = badge.published ? "unpublish" : "publish";
    const actionLabel = badge.published ? "Unpublish" : "Publish";
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
    const statusLabel = badge.published ? "Published" : "Draft";
    const statusClass = badge.published ? "gem-badge-card__status--published" : "gem-badge-card__status--draft";
    const ariaLabel = `${badge.title} badge, ${difficultyLabel} difficulty, worth ${formatNumber(pointsValue)} points.`;
    const tags = [];
    if (rawCategory && rawCategory.toLowerCase() !== "badge") {
      tags.push(
        `<span class="catalogue-card__tag gem-badge-card__tag">${escapeHtml(categoryLabel)}</span>`
      );
    }
    if (difficultyLabel) {
      tags.push(
        `<span class="catalogue-card__tag gem-badge-card__tag">${escapeHtml(difficultyLabel)}</span>`
      );
    }
    const tagsMarkup = tags.length
      ? `<div class="gem-badge-card__tags catalogue-card__tags">${tags.join("")}</div>`
      : "";
    const bonusMarkup =
      badge.bonus && badge.bonusDetail
        ? `<p class="gem-badge-card__bonus"><strong>${escapeHtml(badge.bonus)}</strong> ${escapeHtml(
            badge.bonusDetail
          )}</p>`
        : "";
    const toggleTitleParts = [];
    if (badge.published) toggleTitleParts.push("Published");
    if (difficultyLabel) toggleTitleParts.push(difficultyLabel);
    if (rawCategory && rawCategory.toLowerCase() !== "badge") toggleTitleParts.push(categoryLabel);
    if (badge.points) toggleTitleParts.push(`${formatNumber(pointsValue)} pts`);
    const toggleTitle = toggleTitleParts.join(" • ");

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
          aria-controls="${cardId}"
          title="${escapeHtml(toggleTitle)}">
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
            <h3 class="gem-badge-card__title">${escapeHtml(badge.title)}</h3>
            ${tagsMarkup}
            <p class="gem-badge-card__description">${escapeHtml(badge.description)}</p>
            ${bonusMarkup}
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
  };

  const difficultyRank = value => {
    const normalized = typeof value === "string" ? value.trim() : "";
    const rank = difficultyOrder.indexOf(normalized);
    return rank === -1 ? difficultyOrder.length : rank;
  };

  const getCategoryRank = label => {
    const normalized = typeof label === "string" ? label.trim().toLowerCase() : "";
    const index = BADGE_CATEGORY_ORDER.indexOf(normalized);
    return index === -1 ? BADGE_CATEGORY_ORDER.length : index;
  };

  const groupedBadges = (() => {
    if (!filteredBadges.length) return [];
    const map = new Map();
    filteredBadges.forEach(badge => {
      const rawCategory =
        typeof badge.category === "string" && badge.category.trim().length > 0
          ? badge.category.trim()
          : "Badge";
      const key = rawCategory.toLowerCase();
      if (!map.has(key)) {
        map.set(key, {
          key,
          rawLabel: rawCategory,
          badges: []
        });
      }
      map.get(key).badges.push(badge);
    });
    return Array.from(map.values())
      .sort((a, b) => {
        const rankA = getCategoryRank(a.rawLabel);
        const rankB = getCategoryRank(b.rawLabel);
        if (rankA !== rankB) return rankA - rankB;
        return a.rawLabel.localeCompare(b.rawLabel, undefined, { sensitivity: "base" });
      })
      .map(group => ({
        key: group.key,
        label: formatCatalogueLabel(group.rawLabel),
        badges: group.badges
          .slice()
          .sort((a, b) => {
            const rankA = difficultyRank(a.difficulty);
            const rankB = difficultyRank(b.difficulty);
            if (rankA !== rankB) return rankA - rankB;
            const pointsA = Number(a.points) || 0;
            const pointsB = Number(b.points) || 0;
            if (pointsA !== pointsB) return pointsB - pointsA;
            const titleA = typeof a.title === "string" ? a.title : "";
            const titleB = typeof b.title === "string" ? b.title : "";
            return titleA.localeCompare(titleB, undefined, { sensitivity: "base" });
          })
      }));
  })();

  let badgeIndex = 0;

  const gridMarkup = filteredBadges.length
    ? `
      <div class="client-badges__groups">
        ${groupedBadges
          .map(group => {
            const count = group.badges.length;
            const countLabel = `${formatNumber(count)} badge${count === 1 ? "" : "s"}`;
            return `
              <section class="gem-badge-group" data-badge-category="${escapeHtml(group.key)}">
                <header class="gem-badge-group__header">
                  <h3>${escapeHtml(group.label)}</h3>
                  <span class="detail-table__meta">${escapeHtml(countLabel)}</span>
                </header>
                <div class="gem-badge-grid gem-badge-group__grid client-badges__grid">
                  ${group.badges
                    .map(badge => {
                      const markup = renderBadgeCard(badge, badgeIndex);
                      badgeIndex += 1;
                      return markup;
                    })
                    .join("")}
                </div>
              </section>
            `;
          })
          .join("")}
      </div>
    `
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
        <article class="client-badges__metric">
          <h3>${escapeHtml(metric.label)}</h3>
          <strong>${escapeHtml(String(metric.value))}</strong>
          <span>${escapeHtml(metric.caption)}</span>
        </article>
      `
    )
    .join("");

  return `
    <section class="client-catalogue__intro">
      <span class="client-catalogue__eyebrow">Badge catalogue</span>
      <h1>Celebrate progress with curated badges.</h1>
      <p>Curate the badge tiers you want squads to chase. Publish just the stories you need and bring the sparkle into every hub and add-in moment.</p>
    </section>
    <section class="client-badges__metrics">
      ${metricsMarkup}
    </section>
    <div class="client-badges__actions">
      <div class="client-catalogue__actions-row">
        <div class="client-badges__bulk">
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
        ${statusFilterMarkup}
      </div>
      ${filterMarkup}
      ${summaryMarkup}
    </div>
    <section class="gem-badge-grid client-badges__grid">
      ${gridMarkup}
    </section>
  `;
}
function renderWeldLabs() {
  const labs = state.labs && typeof state.labs === "object" ? state.labs : {};
  const features = Array.isArray(labs.features) ? labs.features : [];
  const clients = Array.isArray(state.clients) ? state.clients : [];
  const totalFeatures = features.length;
  const activeFeatures = features.filter(
    feature => Array.isArray(feature?.enabledClientIds) && feature.enabledClientIds.length > 0
  ).length;
  const enabledSet = new Set();
  let totalAssignments = 0;
  features.forEach(feature => {
    if (!Array.isArray(feature?.enabledClientIds)) return;
    feature.enabledClientIds.forEach(id => {
      const key = labClientKey(id);
      if (!key) return;
      enabledSet.add(key);
      totalAssignments += 1;
    });
  });
  const coverage =
    clients.length > 0 ? Math.round((enabledSet.size / clients.length) * 100) : 0;

  const metricsConfig = [
    {
      label: "Experiments in labs",
      value: formatNumber(totalFeatures),
      caption: "Ready to showcase"
    },
    {
      label: "Active pilots",
      value: formatNumber(activeFeatures),
      caption: "Enabled for tenants"
    },
    {
      label: "Coverage",
      value: clients.length ? `${coverage}%` : "--",
      caption: `${formatNumber(enabledSet.size)} of ${formatNumber(clients.length)} organisations`
    }
  ];

  const metricsMarkup = metricsConfig
    .map(
      metric => `
        <article class="weld-labs__metric">
          <h3>${escapeHtml(metric.label)}</h3>
          <strong>${escapeHtml(metric.value)}</strong>
          <span>${escapeHtml(metric.caption)}</span>
        </article>
      `
    )
    .join("");

  const reviewMarkup = labs.lastReviewAt
    ? `
        <div class="weld-labs__review">
          <span>Last review</span>
          <strong>${escapeHtml(formatDateTime(labs.lastReviewAt))}</strong>
          <small>${escapeHtml(relativeTime(labs.lastReviewAt))}</small>
        </div>
      `
    : `
        <div class="weld-labs__review">
          <span>Last review</span>
          <strong>Not yet scheduled</strong>
        </div>
      `;

  const featureCards = features.length
    ? features
        .map((feature, index) => {
          const featureId = normalizeLabFeatureId(feature?.id) || `lab-${index + 1}`;
          const name = typeof feature?.name === "string" && feature.name.trim().length > 0 ? feature.name : "Experiment";
          const status =
            typeof feature?.status === "string" && feature.status.trim().length > 0
              ? feature.status
              : "Preview";
          const summary =
            typeof feature?.summary === "string" ? feature.summary : "";
          const benefit =
            typeof feature?.benefit === "string" ? feature.benefit : "";
          const owner =
            typeof feature?.owner === "string" && feature.owner.trim().length > 0
              ? feature.owner
              : "";
          const tags = Array.isArray(feature?.tags)
            ? feature.tags
                .map(tag => (typeof tag === "string" ? tag.trim() : ""))
                .filter(Boolean)
            : [];
          const enabledIds = Array.isArray(feature?.enabledClientIds)
            ? feature.enabledClientIds
            : [];
          const enabledKeys = new Set(enabledIds.map(labClientKey).filter(Boolean));
          const enabledCount = enabledKeys.size;
          const clientToggleMarkup = clients.length
            ? clients
                .map(client => {
                  const clientKey = labClientKey(client?.id);
                  const orgKey = labClientKey(client?.organizationId);
                  const isEnabled =
                    (clientKey && enabledKeys.has(clientKey)) ||
                    (orgKey && enabledKeys.has(orgKey));
                  const toneClass = isEnabled ? "button-pill--primary" : "button-pill--ghost";
                  const enabledAttr = isEnabled ? "true" : "false";
                  const clientName =
                    typeof client?.name === "string" ? client.name : `Org ${client?.id ?? ""}`;
                  const titleParts = [];
                  if (clientName) titleParts.push(clientName);
                  if (client?.organizationId) {
                    titleParts.push(`Org ID ${client.organizationId}`);
                  }
                  const toggleTitle = titleParts.join(" â€¢ ");
                  const actionLabel = isEnabled ? "Disable" : "Enable";
                  return `
                    <button
                      type="button"
                      class="button-pill ${toneClass} weld-labs__toggle"
                      data-lab-toggle
                      data-lab-feature="${escapeHtml(featureId)}"
                      data-client="${escapeHtml(String(client.id))}"
                      data-enabled="${enabledAttr}"
                      aria-pressed="${enabledAttr}"
                      aria-label="${escapeHtml(
                        `${actionLabel} ${clientName} for ${name}`
                      )}"
                      ${toggleTitle ? `title="${escapeHtml(toggleTitle)}"` : ""}
                    >
                      ${escapeHtml(clientName)}
                    </button>
                  `;
                })
                .join("")
            : "";
          const tagsMarkup = tags.length
            ? `<div class="weld-labs__tags">${tags
                .map(tag => `<span class="weld-labs__tag">${escapeHtml(tag)}</span>`)
                .join("")}</div>`
            : "";
          const toggleSection = clients.length
            ? `
              <div class="weld-labs__toggle-header">
                <h4>Organisations</h4>
                <span>${escapeHtml(
                  `${formatNumber(enabledCount)} of ${formatNumber(clients.length)} active`
                )}</span>
              </div>
              <div class="weld-labs__toggle-grid">
                ${clientToggleMarkup}
              </div>
              <div class="weld-labs__bulk">
                <button
                  type="button"
                  class="button-pill button-pill--ghost weld-labs__bulk-action"
                  data-lab-feature="${escapeHtml(featureId)}"
                  data-lab-bulk="enable"
                  aria-label="${escapeHtml(`Enable ${name} for all organisations`)}"
                >
                  Enable all
                </button>
                <button
                  type="button"
                  class="button-pill button-pill--ghost weld-labs__bulk-action"
                  data-lab-feature="${escapeHtml(featureId)}"
                  data-lab-bulk="disable"
                  aria-label="${escapeHtml(`Disable ${name} for all organisations`)}"
                >
                  Disable all
                </button>
              </div>
            `
            : `<p class="weld-labs__no-clients">Add organisation accounts to pilot this experiment.</p>`;
          return `
            <article class="weld-labs__feature" data-feature="${escapeHtml(featureId)}">
              <header class="weld-labs__feature-header">
                <span class="weld-labs__status">${escapeHtml(status)}</span>
                <h3>${escapeHtml(name)}</h3>
                ${tagsMarkup}
              </header>
              <p class="weld-labs__summary">${escapeHtml(summary)}</p>
              ${benefit ? `<p class="weld-labs__benefit">${escapeHtml(benefit)}</p>` : ""}
              <div class="weld-labs__meta">
                ${
                  owner
                    ? `<span class="weld-labs__owner">Owner: ${escapeHtml(owner)}</span>`
                    : ""
                }
                <span class="weld-labs__assignments">${escapeHtml(
                  `${formatNumber(enabledCount)} organisations enabled`
                )}</span>
              </div>
              <section class="weld-labs__toggle-panel" aria-label="Manage access for ${escapeHtml(
                name
              )}">
                ${toggleSection}
              </section>
            </article>
          `;
        })
        .join("")
    : `
        <div class="weld-labs__empty">
          <h3>Nothing in Labs yet</h3>
          <p>Use this workspace to curate early feature previews. Add experiments in the data model to toggle availability per organisation.</p>
        </div>
      `;

  return `
    <section class="weld-labs">
      <header class="weld-labs__hero">
        <div>
          <span class="weld-labs__eyebrow">Labs workspace</span>
          <h1>Weld Labs</h1>
          <p>Walk organisations through experimental capabilities, shape the story, and toggle access in real time.</p>
        </div>
        ${reviewMarkup}
      </header>
      <section class="weld-labs__metrics">
        ${metricsMarkup}
      </section>
      <section class="weld-labs__assignments-summary">
        <strong>${escapeHtml(formatNumber(totalAssignments))}</strong>
        <span>Total tenant toggles active</span>
      </section>
      <section class="weld-labs__list">
        ${featureCards}
      </section>
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

function formatPercent(value) {
  if (!Number.isFinite(value)) {
    return "--";
  }
  try {
    const options =
      value < 0.1
        ? { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1 }
        : { style: "percent", minimumFractionDigits: 0, maximumFractionDigits: 1 };
    return new Intl.NumberFormat(undefined, options).format(value);
  } catch {
    return `${Math.round(value * 100)}%`;
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
    const minVisibleMs = 8000;
    const cleanupMs = Number.isFinite(durationSeconds)
      ? Math.max(durationSeconds * 1000, absorbMs + 120, minVisibleMs)
      : Math.max(absorbMs + 120, minVisibleMs);

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

function renderBadgeSpotlight(badgeInput) {
  const badges = Array.isArray(badgeInput)
    ? badgeInput.filter(Boolean)
    : badgeInput
    ? [badgeInput]
    : [];
  if (badges.length === 0) return "";
  const EXTRA_DISPLAY_LIMIT = 3;
  const [primaryBadge, ...extraBadges] = badges;
  const displayedExtras = extraBadges.slice(0, EXTRA_DISPLAY_LIMIT);
  const hasMoreExtras = extraBadges.length > EXTRA_DISPLAY_LIMIT;

  const renderTile = badge => {
    if (!badge) return "";
    const safeId = escapeHtml(String(badge.id ?? ""));
    const iconBackdrop =
      BADGE_ICON_BACKDROPS[badge.tone]?.background ||
      BADGE_ICON_BACKDROPS.violet?.background ||
      "linear-gradient(135deg, #c7d2fe, #818cf8)";
    const iconShadow =
      BADGE_ICON_BACKDROPS[badge.tone]?.shadow ||
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
        aria-label="${escapeHtml(ariaLabel)}">
        <span class="badge-spotlight-tile__icon" style="background:${iconBackdrop}; box-shadow:0 22px 44px ${iconShadow};">
          ${renderIcon(badge.icon || "medal", "sm")}
        </span>
        <span class="badge-spotlight-tile__label">${escapeHtml(normalizedTitle)}</span>
        <span class="badge-spotlight-tile__points" aria-label="${escapeHtml(
          `${formatNumber(pointsValue)} points`
        )}">+${formatNumber(pointsValue)}</span>
      </div>
    `;
  };

  const extraCount = extraBadges.length;
  const extraPanelId = generateId("extra-badges");
  const extrasMarkup =
    extraCount > 0
      ? `
      <div class="badge-spotlight-extra" role="listitem">
        <button
          type="button"
          class="badge-spotlight-extra__trigger"
          aria-expanded="false"
          aria-controls="${extraPanelId}">
          +${formatNumber(extraCount)}
        </button>
        <div class="badge-spotlight-extra__panel" id="${extraPanelId}" role="group" aria-label="Additional badges earned">
          <ul class="badge-spotlight-extra__list">
            ${displayedExtras
              .map(badge => {
                const safeId = escapeHtml(String(badge.id ?? ""));
                const normalizedTitle =
                  typeof badge.title === "string" && badge.title.trim().length > 0
                    ? badge.title.trim()
                    : "Bonus badge";
                const rawPoints = Number(badge.points);
                const pointsValue = Number.isFinite(rawPoints) ? rawPoints : 0;
                return `
                  <li class="badge-spotlight-extra__item" data-badge="${safeId}">
                    <span class="badge-spotlight-extra__icon">${renderIcon(badge.icon || "medal", "xs")}</span>
                    <span class="badge-spotlight-extra__name">${escapeHtml(normalizedTitle)}</span>
                    <span class="badge-spotlight-extra__points" aria-label="${escapeHtml(
                      `${formatNumber(pointsValue)} points`
                    )}">+${formatNumber(pointsValue)}</span>
                  </li>
                `;
              })
              .join("")}
          </ul>
          ${
            hasMoreExtras
              ? `<button type="button" class="badge-spotlight-extra__more" data-route="client-badges">...more badges</button>`
              : ""
          }
        </div>
      </div>
    `
      : "";

  return `
    <div class="badge-spotlight-row" role="list" aria-label="Recently highlighted badges">
      ${renderTile(primaryBadge)}
      ${extrasMarkup}
    </div>
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

  const eligible = badges.filter(badge => badge && badge.icon);
  if (eligible.length === 0) {
    badgeContainer.innerHTML = "";
    return;
  }

  const storedBadgeIds = Array.isArray(state.meta.lastBadgeIds) ? state.meta.lastBadgeIds : [];
  let selections = storedBadgeIds.map(id => badgeById(id)).filter(Boolean);

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

  badgeContainer.innerHTML = renderBadgeSpotlight(selections);
  badgeContainer.dataset.badgeBound = "true";

  const extraWrapper = badgeContainer.querySelector(".badge-spotlight-extra");
  const extraToggle = extraWrapper?.querySelector(".badge-spotlight-extra__trigger");
  const panelId = extraToggle?.getAttribute("aria-controls") || "";
  const escapeCssValue = value => {
    if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
      return CSS.escape(value);
    }
    return String(value).replace(/([#;.?%&,+*~[\]:'"!^$()=>|\/@])/g, "\\$1");
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
        setRole("client", "client-badges");
      });
    }
  }
}

function renderAddIn() {
  const screen = state.meta.addinScreen;
  const reporterSettings = state?.settings?.reporter || {};
  const reasonPrompt =
    typeof reporterSettings.reasonPrompt === "string" &&
    reporterSettings.reasonPrompt.trim().length > 0
      ? reporterSettings.reasonPrompt.trim()
      : DEFAULT_REPORTER_PROMPT;
  const emergencyLabel =
    typeof reporterSettings.emergencyLabel === "string" &&
    reporterSettings.emergencyLabel.trim().length > 0
      ? reporterSettings.emergencyLabel.trim()
      : DEFAULT_EMERGENCY_LABEL;
  const reporterReasons =
    Array.isArray(reporterSettings.reasons) && reporterSettings.reasons.length > 0
      ? reporterSettings.reasons
      : DEFAULT_REPORTER_REASONS;
  const reasonsMarkup = reporterReasons
    .map(reason => {
      if (!reason) return "";
      const reasonId =
        typeof reason.id === "string" && reason.id.trim().length > 0
          ? reason.id.trim()
          : null;
      const label =
        typeof reason.label === "string" && reason.label.trim().length > 0
          ? reason.label.trim()
          : null;
      if (!reasonId || !label) return "";
      return `
        <label>
          <input type="checkbox" value="${escapeHtml(reasonId)}" />
          <span>${escapeHtml(label)}</span>
        </label>
      `;
    })
    .filter(Boolean)
    .join("");
  const reportForm = `
    <div class="addin-body">
      <fieldset class="addin-field">
        <legend>${escapeHtml(reasonPrompt)}</legend>
        <div class="addin-checkbox-list">
          ${reasonsMarkup}
        </div>
      </fieldset>
      <label class="addin-emergency">
        <input type="checkbox" value="clicked-link,opened-attachment,shared-credentials" />
        <span class="addin-emergency__text">${escapeHtml(emergencyLabel)}</span>
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
  const badgeBurstLabel =
    Array.isArray(state.meta.lastBadgeIds) && state.meta.lastBadgeIds.length > 1 ? "Badges" : "Badge";
  const burstsMarkup = renderPointsBursts([
    { value: reportAward, variant: "report", label: "Report" },
    { value: badgeAward, variant: "badge", label: badgeBurstLabel }
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

function resolveActiveSettingsCategory() {
  const categories = SETTINGS_CATEGORIES || [];
  if (categories.length === 0) return null;
  const storedId = state?.meta?.settingsCategory;
  const matched = categories.find(category => category.id === storedId && !category.disabled);
  if (matched) return matched;
  const fallback = categories.find(category => !category.disabled);
  return fallback || categories[0];
}

function reporterReasonRowTemplate(reason, index) {
  if (!reason) {
    reason = {};
  }
  const baseId =
    typeof reason.id === "string" && reason.id.trim().length > 0
      ? reason.id.trim()
      : `reason-${index + 1}`;
  const id = escapeHtml(baseId);
  const valueSource =
    typeof reason.label === "string"
      ? reason.label
      : typeof reason.description === "string"
      ? reason.description
      : "";
  const value = escapeHtml(valueSource);
  return `
    <div class="settings-reason" data-reason-row="${id}">
      <span class="settings-reason__index">${index + 1}</span>
      <input
        type="text"
        class="settings-reason__input"
        data-reason-input
        data-reason-id="${id}"
        value="${value}"
        placeholder="Add a reason reporters can select"
      />
      <button
        type="button"
        class="settings-reason__remove"
        data-action="remove-reason"
        data-reason-id="${id}"
        aria-label="Remove reason ${index + 1}"
      >
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  `;
}

function renderSettingsPlaceholder(category) {
  const label = escapeHtml(category?.label || "Settings");
  const description =
    typeof category?.description === "string" && category.description.trim().length > 0
      ? escapeHtml(category.description)
      : "Configuration options coming soon.";
  return `
    <section class="settings-panel__section settings-panel__section--placeholder">
      <h3>${label}</h3>
      <p>${description}</p>
      <span class="settings-panel__chip">Coming soon</span>
    </section>
  `;
}

function renderReporterSettingsContent() {
  const reporterSettings = state?.settings?.reporter || {};
  const reasonPrompt =
    typeof reporterSettings.reasonPrompt === "string" &&
    reporterSettings.reasonPrompt.trim().length > 0
      ? reporterSettings.reasonPrompt.trim()
      : DEFAULT_REPORTER_PROMPT;
  const emergencyLabel =
    typeof reporterSettings.emergencyLabel === "string" &&
    reporterSettings.emergencyLabel.trim().length > 0
      ? reporterSettings.emergencyLabel.trim()
      : DEFAULT_EMERGENCY_LABEL;
  const reasons =
    Array.isArray(reporterSettings.reasons) && reporterSettings.reasons.length > 0
      ? reporterSettings.reasons
      : DEFAULT_REPORTER_REASONS;
  const reasonsMarkup = reasons.map((reason, index) => reporterReasonRowTemplate(reason, index)).join("");
  return `
    <section class="settings-panel__section" aria-labelledby="reporter-settings-heading">
      <div class="settings-panel__section-header">
        <h3 id="reporter-settings-heading">Reporter experience</h3>
        <p>Control the prompts reporters see when escalating suspicious messages.</p>
      </div>
      <form id="reporter-settings-form" class="settings-form" autocomplete="off">
        <div class="settings-form__group">
          <label class="settings-form__label" for="reporter-reason-prompt">Reason prompt</label>
          <input
            type="text"
            id="reporter-reason-prompt"
            name="reasonPrompt"
            class="settings-form__input"
            value="${escapeHtml(reasonPrompt)}"
            placeholder="${escapeHtml(DEFAULT_REPORTER_PROMPT)}"
          />
        </div>
        <div class="settings-form__group">
          <label class="settings-form__label" for="reporter-emergency-label">Urgent checkbox label</label>
          <textarea
            id="reporter-emergency-label"
            class="settings-form__textarea"
            rows="2"
            data-autofocus
            placeholder="${escapeHtml(DEFAULT_EMERGENCY_LABEL)}"
          >${escapeHtml(emergencyLabel)}</textarea>
        </div>
        <div class="settings-form__group">
          <div class="settings-form__group-header">
            <span class="settings-form__label">Reasons reporters can choose</span>
            <p class="settings-form__hint">Reorder or rewrite the shortlist that appears in the add-in.</p>
          </div>
          <div class="settings-form__reasons" data-reasons-container>
            ${reasonsMarkup || ""}
          </div>
          <button type="button" class="button-pill button-pill--ghost settings-form__add" data-action="add-reason">
            Add reason
          </button>
        </div>
        <footer class="settings-panel__footer">
          <button type="button" class="button-pill button-pill--danger-light" data-action="reset-reporter-defaults">
            Reset to default
          </button>
          <button type="submit" class="button-pill button-pill--primary">Save changes</button>
        </footer>
      </form>
    </section>
  `;
}

function renderSettingsPanel() {
  const categories = SETTINGS_CATEGORIES || [];
  if (categories.length === 0) return "";
  const activeCategory = resolveActiveSettingsCategory();
  const categoryMarkup = categories
    .map(category => {
      const isActive = activeCategory && category.id === activeCategory.id;
      const classes = [
        "settings-nav__item",
        isActive ? "settings-nav__item--active" : "",
        category.disabled ? "settings-nav__item--disabled" : ""
      ]
        .filter(Boolean)
        .join(" ");
      const description =
        typeof category.description === "string" && category.description.trim().length > 0
          ? escapeHtml(category.description)
          : "";
      const disabledAttr = category.disabled ? " disabled" : "";
      const metaLabel = category.disabled ? '<span class="settings-nav__meta">Coming soon</span>' : "";
      return `
        <button
          type="button"
          class="${classes}"
          data-settings-category="${escapeHtml(category.id)}"
          ${disabledAttr}
        >
          <span class="settings-nav__label">${escapeHtml(category.label)}</span>
          ${description ? `<span class="settings-nav__description">${description}</span>` : ""}
          ${metaLabel}
        </button>
      `;
    })
    .join("");
  const contentMarkup =
    activeCategory && activeCategory.id === "reporter"
      ? renderReporterSettingsContent()
      : renderSettingsPlaceholder(activeCategory);
  return `
    <div class="settings-shell settings-shell--open" role="presentation">
      <div class="settings-shell__backdrop" data-settings-dismiss></div>
      <section class="settings-panel" role="dialog" aria-modal="true" aria-labelledby="settings-title" tabindex="-1">
        <header class="settings-panel__header">
          <div>
            <p class="settings-panel__eyebrow">Configuration</p>
            <h2 class="settings-panel__title" id="settings-title">Settings</h2>
          </div>
          <button type="button" class="settings-panel__close" id="settings-close" aria-label="Close settings">
            <span aria-hidden="true">&times;</span>
          </button>
        </header>
        <div class="settings-panel__body">
          <nav class="settings-panel__nav" aria-label="Settings categories">
            ${categoryMarkup}
          </nav>
          <div class="settings-panel__content">
            ${contentMarkup}
          </div>
        </div>
      </section>
    </div>
  `;
}

function renderHeader() {
  const role = state.meta.role;
  const navMarkup = renderGlobalNav(state.meta.route);
  return `
    ${navMarkup}
    <header class="header">
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
    case "customer-badges":
      return renderCustomerBadgesPage();
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
    case "weld-labs":
      return renderWeldLabs();
    default:
      return "";
  }
}

function attachBadgeEvents(container) {
  if (!container) return;

  container.addEventListener("click", event => {
    const statusButton = event.target.closest("[data-badge-status]");
    if (statusButton) {
      const rawValue = (statusButton.getAttribute("data-badge-status") || "").trim().toLowerCase();
      const nextStatus = rawValue === "published" || rawValue === "unpublished" ? rawValue : null;
      if (state.meta.badgeStatusFilter !== nextStatus) {
        state.meta.badgeStatusFilter = nextStatus;
        persist();
        renderApp();
      }
      return;
    }

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

  const resetButton = container.querySelector("#global-reset");
  if (resetButton && resetButton.dataset.resetBound !== "true") {
    resetButton.dataset.resetBound = "true";
    resetButton.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      closeGroups();
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

function openSettings(category) {
  if (typeof category === "string" && category.trim().length > 0) {
    state.meta.settingsCategory = category.trim();
  }
  if (state.meta.settingsOpen) return;
  state.meta.settingsOpen = true;
  renderApp();
}

function closeSettings() {
  if (!state.meta.settingsOpen) return;
  state.meta.settingsOpen = false;
  renderApp();
}

function bindSettingsToggle(container) {
  if (!container) return;
  const settingsButton = container.querySelector("#global-settings");
  if (settingsButton && settingsButton.dataset.settingsToggleBound !== "true") {
    settingsButton.dataset.settingsToggleBound = "true";
    settingsButton.addEventListener("click", event => {
      event.preventDefault();
      openSettings();
    });
  }
}

function ensureSettingsRoot() {
  let root = document.getElementById("settings-root");
  if (!root) {
    root = document.createElement("div");
    root.id = "settings-root";
    document.body.appendChild(root);
  }
  return root;
}

function ensureSettingsShortcuts() {
  if (window.__weldSettingsEscape__) return;
  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    if (!state.meta.settingsOpen) return;
    closeSettings();
  });
  window.__weldSettingsEscape__ = true;
}

function escapeSettingsSelector(value) {
  if (!value) return "";
  if (typeof CSS !== "undefined" && CSS && typeof CSS.escape === "function") {
    return CSS.escape(value);
  }
  return String(value).replace(/([ #;?%&,.+*~':"!^$[\]()=>|/@])/g, "\\$1");
}

function bindSettingsShellEvents(root) {
  if (!root) return;
  const closeButton = root.querySelector("#settings-close");
  if (closeButton) {
    closeButton.addEventListener("click", event => {
      event.preventDefault();
      closeSettings();
    });
  }
  root.querySelectorAll("[data-settings-dismiss]").forEach(element => {
    element.addEventListener("click", () => closeSettings());
  });

  const activeCategory = resolveActiveSettingsCategory();
  if (activeCategory && state.meta.settingsCategory !== activeCategory.id) {
    state.meta.settingsCategory = activeCategory.id;
    renderApp();
    return;
  }

  root.querySelectorAll("[data-settings-category]").forEach(button => {
    if (button.disabled) return;
    button.addEventListener("click", event => {
      event.preventDefault();
      const category = button.getAttribute("data-settings-category");
      if (!category || state.meta.settingsCategory === category) return;
      state.meta.settingsCategory = category;
      renderApp();
    });
  });

  const reporterForm = root.querySelector("#reporter-settings-form");
  if (reporterForm) {
    const reasonsContainer = reporterForm.querySelector("[data-reasons-container]");
    const promptField = reporterForm.querySelector("#reporter-reason-prompt");
    const emergencyField = reporterForm.querySelector("#reporter-emergency-label");

    const updateReasonIndices = () => {
      if (!reasonsContainer) return;
      Array.from(reasonsContainer.querySelectorAll(".settings-reason__index")).forEach((item, index) => {
        item.textContent = String(index + 1);
      });
    };

    reporterForm.addEventListener("click", event => {
      const addButton = event.target.closest("[data-action='add-reason']");
      if (addButton) {
        event.preventDefault();
        if (!reasonsContainer) return;
        const newId = generateId("reason");
        const rowMarkup = reporterReasonRowTemplate({ id: newId, label: "" }, reasonsContainer.children.length);
        reasonsContainer.insertAdjacentHTML("beforeend", rowMarkup);
        updateReasonIndices();
        const selector = `[data-reason-id="${escapeSettingsSelector(newId)}"]`;
        const newInput = reasonsContainer.querySelector(selector);
        if (newInput) newInput.focus();
        return;
      }
      const removeButton = event.target.closest("[data-action='remove-reason']");
      if (removeButton) {
        event.preventDefault();
        if (!reasonsContainer) return;
        const reasonId = removeButton.getAttribute("data-reason-id");
        if (!reasonId) return;
        const row = reasonsContainer.querySelector(
          `[data-reason-row="${escapeSettingsSelector(reasonId)}"]`
        );
        if (row) {
          row.remove();
          updateReasonIndices();
        }
      }
      const resetButton = event.target.closest("[data-action='reset-reporter-defaults']");
      if (resetButton) {
        event.preventDefault();
        openDialog({
          title: "Reset reporter settings?",
          description: "This restores the default prompt, urgent label, and standard reasons for reporters.",
          confirmLabel: "Reset settings",
          cancelLabel: "Cancel",
          tone: "danger",
          onConfirm: close => {
            close();
            state.settings = state.settings || {};
            state.settings.reporter = {
              reasonPrompt: DEFAULT_REPORTER_PROMPT,
              emergencyLabel: DEFAULT_EMERGENCY_LABEL,
              reasons: DEFAULT_REPORTER_REASONS.map(reason => ({ ...reason }))
            };
            if (Array.isArray(state.messages)) {
              const validIds = new Set(state.settings.reporter.reasons.map(reason => reason.id));
              state.messages.forEach(message => {
                if (!Array.isArray(message.reasons)) return;
                message.reasons = message.reasons.filter(id => validIds.has(id));
              });
            }
            persist();
            renderApp();
          }
        });
        return;
      }
    });

    reporterForm.addEventListener("submit", event => {
      event.preventDefault();
      const reasonInputs = reasonsContainer
        ? Array.from(reasonsContainer.querySelectorAll("[data-reason-input]"))
        : [];
      const reasons = [];
      const seenIds = new Set();
      reasonInputs.forEach(input => {
        const text = (input.value || "").trim();
        if (!text) return;
        const currentId = input.getAttribute("data-reason-id");
        let normalizedId = normalizeId(currentId, "reason");
        if (!normalizedId) {
          normalizedId = generateId("reason");
          input.setAttribute("data-reason-id", normalizedId);
        }
        while (seenIds.has(normalizedId)) {
          normalizedId = generateId("reason");
          input.setAttribute("data-reason-id", normalizedId);
        }
        seenIds.add(normalizedId);
        reasons.push({ id: normalizedId, label: text });
      });
      if (reasons.length === 0) {
        openDialog({
          title: "Add at least one reason",
          description: "Reporters need at least one selectable reason.",
          confirmLabel: "Close"
        });
        return;
      }
      const promptValue = promptField ? promptField.value.trim() : "";
      const emergencyValue = emergencyField ? emergencyField.value.trim() : "";
      if (!emergencyValue) {
        openDialog({
          title: "Add urgent label text",
          description: "Describe what happens when reporters tick the urgent box.",
          confirmLabel: "Close"
        });
        if (emergencyField) emergencyField.focus();
        return;
      }
      state.settings = state.settings || {};
      const existing = state.settings.reporter || {};
      const nextPrompt = promptValue.length > 0 ? promptValue : DEFAULT_REPORTER_PROMPT;
      state.settings.reporter = {
        ...existing,
        reasonPrompt: nextPrompt,
        emergencyLabel: emergencyValue,
        reasons
      };
      if (Array.isArray(state.messages)) {
        const validIds = new Set(reasons.map(reason => reason.id));
        state.messages.forEach(message => {
          if (!Array.isArray(message.reasons)) return;
          message.reasons = message.reasons.filter(id => validIds.has(id));
        });
      }
      persist();
      renderApp();
    });
  }
}

function syncSettingsShell() {
  const root = ensureSettingsRoot();
  if (!state.meta.settingsOpen) {
    root.innerHTML = "";
    return;
  }
  root.innerHTML = renderSettingsPanel();
  bindSettingsShellEvents(root);
  requestAnimationFrame(() => {
    const panel = root.querySelector(".settings-panel");
    if (!panel) return;
    const focusTarget =
      panel.querySelector("[data-autofocus]") || panel.querySelector("input, textarea, button, select");
    if (focusTarget) {
      focusTarget.focus();
    } else {
      panel.focus();
    }
  });
}

function initializeSettingsUI(container) {
  bindSettingsToggle(container);
  ensureSettingsShortcuts();
  syncSettingsShell();
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
  container.querySelectorAll(".quest-card__config").forEach(button => {
    button.addEventListener("click", event => {
      event.preventDefault();
      const questId = button.getAttribute("data-quest");
      if (questId) {
        openQuestConfig(questId);
      }
    });
  });
  const badgeCatalogueBtn = container.querySelector(".badge-showcase__cta-button");
  if (badgeCatalogueBtn) {
    badgeCatalogueBtn.addEventListener("click", () => {
      setRole("customer", "customer-badges");
    });
  }
  container.querySelectorAll("[data-recognition-filter]").forEach(button => {
    button.addEventListener("click", () => {
      const value = (button.getAttribute("data-recognition-filter") || "").trim().toLowerCase();
      const valid = ["received", "given", "all"];
      const nextFilter = valid.includes(value) ? value : "received";
      if (state.meta.recognitionFilter !== nextFilter) {
        state.meta.recognitionFilter = nextFilter;
        persist();
        renderApp();
      }
    });
  });
  const recognitionButton = container.querySelector(".recognition-board__note-button");
  if (recognitionButton) {
    recognitionButton.addEventListener("click", () => {
      openRecognitionFormDialog();
    });
  }
}

function attachCustomerBadgesEvents(container) {
  const back = container.querySelector("[data-action='back-to-hub']");
  if (back) {
    back.addEventListener("click", () => {
      setRole("customer", "customer");
    });
  }
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
    const bulkDepartment = event.target.closest("[data-bulk-department-action]");
    if (bulkDepartment) {
      const action = bulkDepartment.getAttribute("data-bulk-department-action");
      if (action === "publish") {
        setAllLeaderboardPublication(true);
      } else if (action === "unpublish") {
        setAllLeaderboardPublication(false);
      }
      return;
    }

    const departmentToggle = event.target.closest(".department-publish-toggle");
    if (departmentToggle) {
      const departmentId = departmentToggle.getAttribute("data-department");
      const action = departmentToggle.getAttribute("data-action");
      if (departmentId && action) {
        setLeaderboardEntryPublication(departmentId, action === "publish");
      }
      return;
    }

    const bulkProgram = event.target.closest("[data-bulk-program-action]");
    if (bulkProgram) {
      const action = bulkProgram.getAttribute("data-bulk-program-action");
      if (action === "publish") {
        setAllEngagementProgramsPublication(true);
      } else if (action === "unpublish") {
        setAllEngagementProgramsPublication(false);
      }
      return;
    }

    const programToggle = event.target.closest(".program-publish-toggle");
    if (programToggle) {
      const programId = programToggle.getAttribute("data-program");
      const action = programToggle.getAttribute("data-action");
      if (programId && action) {
        setEngagementProgramPublication(programId, action === "publish");
      }
      return;
    }

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
    const statusButton = event.target.closest("[data-reward-status]");
    if (statusButton) {
      const rawValue = (statusButton.getAttribute("data-reward-status") || "").trim().toLowerCase();
      const nextStatus = rawValue === "published" || rawValue === "unpublished" ? rawValue : null;
      if (state.meta.rewardStatusFilter !== nextStatus) {
        state.meta.rewardStatusFilter = nextStatus;
        persist();
        renderApp();
      }
      return;
    }

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

    const configButton = event.target.closest(".reward-card__config");
    if (configButton) {
      event.preventDefault();
      const idAttr = configButton.getAttribute("data-reward");
      if (!idAttr) return;
      const numericId = Number(idAttr);
      if (Number.isFinite(numericId)) {
        openRewardConfig(numericId);
      } else {
        openRewardConfig(idAttr);
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
    const statusButton = event.target.closest("[data-quest-status]");
    if (statusButton) {
      const rawValue = (statusButton.getAttribute("data-quest-status") || "").trim().toLowerCase();
      const nextStatus = rawValue === "published" || rawValue === "unpublished" ? rawValue : null;
      if (state.meta.questStatusFilter !== nextStatus) {
        state.meta.questStatusFilter = nextStatus;
        persist();
        renderApp();
      }
      return;
    }

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

    const configButton = event.target.closest(".quest-card__config");
    if (configButton) {
      const questId = configButton.getAttribute("data-quest");
      if (questId) {
        event.preventDefault();
        openQuestConfig(questId);
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

function attachWeldLabsEvents(container) {
  if (!container) return;
  container.addEventListener("click", event => {
    const toggle = event.target.closest("[data-lab-toggle]");
    if (toggle) {
      const featureId = (toggle.getAttribute("data-lab-feature") || "").trim();
      const clientIdRaw = (toggle.getAttribute("data-client") || "").trim();
      if (!featureId || !clientIdRaw) {
        return;
      }
      const numericClientId = Number(clientIdRaw);
      const clientIdValue =
        Number.isFinite(numericClientId) && clientIdRaw !== "" ? numericClientId : clientIdRaw;
      const currentEnabled = toggle.getAttribute("data-enabled") === "true";
      setLabFeatureAccess(featureId, clientIdValue, !currentEnabled);
      return;
    }
    const bulk = event.target.closest("[data-lab-bulk]");
    if (bulk) {
      const featureId = (bulk.getAttribute("data-lab-feature") || "").trim();
      const mode = (bulk.getAttribute("data-lab-bulk") || "").trim().toLowerCase();
      if (!featureId || !mode) return;
      if (mode === "enable") {
        setLabFeatureAccessForAll(featureId, true);
      } else if (mode === "disable") {
        setLabFeatureAccessForAll(featureId, false);
      }
    }
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
          .map(input => input.value)
          .map(value => (typeof value === "string" ? value.trim() : ""))
          .filter(Boolean);
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
          ? `Suspicious email: ${primaryReason.label}`
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
    initializeSettingsUI(app);
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
    initializeSettingsUI(app);
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
  initializeSettingsUI(app);
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
  initializeSettingsUI(app);

  const mainContent = app.querySelector("#main-content");
  if (!mainContent) return;
  if (route === "customer") attachCustomerEvents(mainContent);
  if (route === "customer-badges") attachCustomerBadgesEvents(mainContent);
  if (route === "customer-reports") attachCustomerReportsEvents(mainContent);
  if (route === "customer-redemptions") attachCustomerRedemptionsEvents(mainContent);
  if (route === "client-dashboard") attachClientDashboardEvents(mainContent);
  if (route === "client-reporting") attachReportingEvents(mainContent);
  if (route === "client-rewards") attachClientRewardsEvents(mainContent);
  if (route === "client-quests") attachClientQuestsEvents(mainContent);
  if (route === "weld-labs") attachWeldLabsEvents(mainContent);
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










