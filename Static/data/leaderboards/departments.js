(function () {
  const AppData = window.AppData || (window.AppData = {});
  Object.assign(AppData, {
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
  });
  const modules = window.WeldModules;
  if (modules && (!modules.has || !modules.has(\"data/leaderboards/departments\"))) {
    modules.define(\"data/leaderboards/departments\", () => AppData.DEPARTMENT_LEADERBOARD || []);
  }
})();
