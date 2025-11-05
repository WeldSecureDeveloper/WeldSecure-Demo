// data.js - container for static demo data & enums (migrate in Phase 3)
window.AppData = window.AppData || {};
Object.assign(window.AppData, {
  STORAGE_KEY: "weldStaticDemoStateV1",
  ROLE_LABELS: {
  customer: { label: "Reporter", chip: "chip--customer" },
  client: { label: "Organisation", chip: "chip--client" },
  admin: { label: "WeldSecure", chip: "chip--admin" }
},
  ROUTES: {
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
},
  MessageStatus: {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected"
},
  NAV_GROUPS: [
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
],
  QUEST_DIFFICULTY_ORDER: ["starter", "intermediate", "advanced"],
  SETTINGS_CATEGORIES: [
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
],
  DEFAULT_REPORTER_PROMPT: "Why are you reporting this?",
  DEFAULT_EMERGENCY_LABEL: "I clicked a link, opened an attachment, or entered credentials",
  PREVIOUS_EMERGENCY_LABEL: "Recipient clicked a link, opened an attachment, or entered credentials",
  DEFAULT_REPORTER_REASONS: [
  { id: "reason-looks-like-phishing", label: "Looks like a phishing attempt" },
  { id: "reason-unexpected-attachment", label: "Unexpected attachment or link" },
  { id: "reason-urgent-tone", label: "Urgent language / suspicious tone" },
  { id: "reason-spoofing-senior", label: "Sender spoofing a senior colleague" }
],
  ICON_PATHS: {
    medal: "svg/medal.svg",
    outlook: "svg/outlook.svg",
    hourglass: "svg/hourglass.svg",
    gift: "svg/gift.svg",
    settings: "svg/settings.svg",
    target: "svg/target.svg",
    trophy: "svg/trophy.svg",
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
  BADGES: [
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
],
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
  DEFAULT_QUESTS: [
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
],
  DEPARTMENT_LEADERBOARD: [
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
],
  ENGAGEMENT_PROGRAMS: [
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
]
});

// Expose routes for legacy hash navigation helpers.
window.ROUTES = window.AppData.ROUTES;
