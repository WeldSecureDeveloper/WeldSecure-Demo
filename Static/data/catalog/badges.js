(function () {
  const AppData = window.AppData || (window.AppData = {});
  if (!Array.isArray(AppData.BADGES) || AppData.BADGES.length === 0) {
    AppData.BADGES = [
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
  }
  const modules = window.WeldModules;
  if (modules && (!modules.has || !modules.has("data/catalog/badges"))) {
    modules.define("data/catalog/badges", () => AppData.BADGES || []);
  }
})();
