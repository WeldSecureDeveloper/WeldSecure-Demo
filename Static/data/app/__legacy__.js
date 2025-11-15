// data.js - container for static demo data & enums (migrate in Phase 3)
const AppData = window.AppData || (window.AppData = {});

const DEFAULT_REPORTER_PROMPT_BASE = "Why are you reporting this?";
const DEFAULT_EMERGENCY_LABEL_BASE = "I clicked a link, opened an attachment, or entered credentials";
const PREVIOUS_EMERGENCY_LABEL_BASE =
  "Recipient clicked a link, opened an attachment, or entered credentials";
const DEFAULT_REPORTER_REASONS_BASE = [
  { id: "reason-looks-like-phishing", label: "Looks like a phishing attempt" },
  { id: "reason-unexpected-attachment", label: "Unexpected attachment or link" },
  { id: "reason-urgent-tone", label: "Urgent language / suspicious tone" },
  { id: "reason-spoofing-senior", label: "Sender spoofing a senior colleague" }
];

const existingDefaults = AppData.DEFAULTS && typeof AppData.DEFAULTS === "object" ? AppData.DEFAULTS : {};
const reporterReasonDefaults =
  Array.isArray(existingDefaults.REPORTER_REASONS) && existingDefaults.REPORTER_REASONS.length > 0
    ? existingDefaults.REPORTER_REASONS
    : DEFAULT_REPORTER_REASONS_BASE;

AppData.DEFAULTS = {
  REPORTER_PROMPT: existingDefaults.REPORTER_PROMPT || DEFAULT_REPORTER_PROMPT_BASE,
  EMERGENCY_LABEL: existingDefaults.EMERGENCY_LABEL || DEFAULT_EMERGENCY_LABEL_BASE,
  PREVIOUS_EMERGENCY_LABEL: existingDefaults.PREVIOUS_EMERGENCY_LABEL || PREVIOUS_EMERGENCY_LABEL_BASE,
  REPORTER_REASONS: reporterReasonDefaults
};

const resolvedReporterReasons =
  Array.isArray(AppData.DEFAULT_REPORTER_REASONS) && AppData.DEFAULT_REPORTER_REASONS.length > 0
    ? AppData.DEFAULT_REPORTER_REASONS
    : reporterReasonDefaults;

const normalizedReporterReasons = Array.isArray(resolvedReporterReasons)
  ? resolvedReporterReasons.map(reason => (reason && typeof reason === "object" ? { ...reason } : reason))
  : [];

const blueprintConfig = AppData.phishingBlueprints || {};
const defaultPhishingChannels = ["email", "sms", "teams", "slack", "qr"];
const phishingChannelsEnum =
  Array.isArray(blueprintConfig.channels) && blueprintConfig.channels.length > 0
    ? blueprintConfig.channels.slice()
    : defaultPhishingChannels;
const defaultSignalCategories = {
  deception: "Identity deception",
  delivery: "Delivery channel oddities",
  persuasion: "Persuasion & urgency",
  payload: "Payload or attachment risk"
};
const phishingSignalCategories =
  blueprintConfig.signalCategories && typeof blueprintConfig.signalCategories === "object"
    ? { ...defaultSignalCategories, ...blueprintConfig.signalCategories }
    : { ...defaultSignalCategories };

Object.assign(AppData, {
  STORAGE_KEY: "weldStaticDemoStateV1",
  ROLE_LABELS: {
  customer: { label: "Reporter", chip: "chip--customer" },
  client: { label: "Organisation", chip: "chip--client" },
  admin: { label: "WeldSecure", chip: "chip--admin" }
},
  ROUTES: {
  landing: { requiresRole: false },
  customer: { requiresRole: "customer" },
  "customer-hub-rewards": { requiresRole: "customer" },
  "customer-hub-quests": { requiresRole: "customer" },
  "customer-reports": { requiresRole: "customer" },
  "customer-badges": { requiresRole: "customer" },
  "customer-redemptions": { requiresRole: "customer" },
  "customer-leaderboards": { requiresRole: "customer" },
  "reporter-sandbox": { requiresRole: "customer" },
  "client-dashboard": { requiresRole: "client" },
  "client-user-config": { requiresRole: "client" },
  "client-leaderboards": { requiresRole: "client" },
  "client-reporting": { requiresRole: "client" },
  "client-rewards": { requiresRole: "client" },
  "client-quests": { requiresRole: "client" },
  "weld-admin": { requiresRole: "admin" },
  "phishing-sims": { requiresRole: "admin" },
  "phishing-designer": { requiresRole: "admin" },
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
    role: "customer",
    items: [
      { label: "Reporter", route: "addin", role: "customer" },
      { label: "Hub", route: "customer", role: "customer" },
      { label: "Sandbox", route: "reporter-sandbox", role: "customer" }
    ]
  },
  {
    label: "Organisation",
    role: "client",
    items: [
      { label: "Organisation Hub", route: "client-dashboard", role: "client" },
      { label: "Security Team Dashboard", route: "client-reporting", role: "client" },
      { label: "Badge Catalogue", route: "client-badges", role: "client" },
      { label: "Quest Catalogue", route: "client-quests", role: "client" },
      { label: "Rewards Catalogue", route: "client-rewards", role: "client" },
      { label: "Leaderboards", route: "client-leaderboards", role: "client" },
      { label: "User configuration", route: "client-user-config", role: "client" },
      { label: "Phishing Designer", route: "phishing-designer", role: "admin" }
    ]
  },
  {
    label: "WeldSecure",
    role: "admin",
    items: [
      { label: "Weld Admin", route: "weld-admin", role: "admin" },
      { label: "Phishing Sims", route: "phishing-sims", role: "admin" },
      { label: "Weld Labs", route: "weld-labs", role: "admin" }
    ]
  }
],
  PHISHING_CHANNELS: phishingChannelsEnum,
  PHISHING_SIGNAL_CATEGORIES: phishingSignalCategories,
  QUEST_DIFFICULTY_ORDER: ["starter", "intermediate", "advanced"],
  SETTINGS_CATEGORIES: [
  {
    id: "reporter",
    label: "Reporter",
    description: "Configure the reporter add-in experience"
  },
  {
    id: "appearance",
    label: "Appearance",
    description: "Toggle between light and dark themes"
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
  DEFAULT_REPORTER_PROMPT: AppData.DEFAULT_REPORTER_PROMPT || AppData.DEFAULTS.REPORTER_PROMPT,
  DEFAULT_EMERGENCY_LABEL: AppData.DEFAULT_EMERGENCY_LABEL || AppData.DEFAULTS.EMERGENCY_LABEL,
  PREVIOUS_EMERGENCY_LABEL: AppData.PREVIOUS_EMERGENCY_LABEL || AppData.DEFAULTS.PREVIOUS_EMERGENCY_LABEL,
  DEFAULT_REPORTER_REASONS: normalizedReporterReasons,
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
          title: "Beat 1 � Pop-up coworking chaos",
          scenario: "Will squeezes into shared seating minutes before a customer renewal call.",
          prompt: "Quiz asks whether to continue on the open floor, hunt for a focus room, or drop to audio only.",
          idealAction: "Choose the focus room option and mention the in-quest reminder about badge access and privacy screens.",
          callout: "Emphasise that the side panel presents the remote work checklist the moment the answer is submitted."
        },
        {
          title: "Beat 2 � Shoulder surfing risk",
          scenario: "A passer-by glances at pipeline dashboards while screen share is still active.",
          prompt: "Learners decide between pausing the share, enabling blur, or continuing because the call is internal.",
          idealAction: "Select 'Pause share + trigger WeldSecure alert' to show how the quest nudges the escalation flow.",
          callout: "Point to the copy that reassures them a pre-filled Teams message is ready in the add-in."
        },
        {
          title: "Beat 3 � VPN drop mid-call",
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
    published: true,
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
    id: "finance-assurance",
    departmentId: "finance-assurance",
    name: "Finance Assurance",
    department: "Finance Assurance",
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
    id: "people-experience",
    departmentId: "people-experience",
    name: "People Experience",
    department: "People Experience",
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
    id: "engineering-delivery",
    departmentId: "engineering-delivery",
    name: "Engineering Delivery",
    department: "Engineering Delivery",
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
    id: "operations-resilience",
    departmentId: "operations-resilience",
    name: "Operations Resilience",
    department: "Operations Resilience",
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
  },
  {
    id: "security-enablement",
    departmentId: "security-enablement",
    name: "Security Enablement",
    department: "Security Enablement",
    points: 1490,
    trendDirection: "down",
    trendValue: "-3%",
    trendCaption: "exec briefing gap",
    participationRate: 0.76,
    streakWeeks: 4,
    avgResponseMinutes: 9,
    featuredBadgeId: "automation-ally",
    featuredQuestId: "incident-escalation-sprint",
    momentumTag: "Boardroom hygiene push",
    focusNarrative: "Enablement network refocused on exec comms drills and hybrid collaboration checkpoints.",
    tone: "slate",
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
],
  DIRECTORY_PRESETS: (() => {
    const directoryData = window.DirectoryData || {};
    const cloneList = source => (Array.isArray(source) ? source.map(entry => ({ ...entry })) : []);
    const cloneObject = source =>
      source && typeof source === "object" ? { ...source } : {};
    return {
      integrations: cloneObject(directoryData.integrations),
      departments: cloneList(directoryData.departments),
      teams: cloneList(directoryData.teams),
      users: cloneList(directoryData.users)
    };
  })()

});

// Expose routes for legacy hash navigation helpers.
window.ROUTES = window.AppData.ROUTES;

// Surface directory data for easier reuse across features.
window.AppData.DIRECTORY = window.AppData.DIRECTORY_PRESETS;

