(function () {
  const AppData = window.AppData || (window.AppData = {});
  Object.assign(AppData, {
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
  });
  const modules = window.WeldModules;
  if (modules && (!modules.has || !modules.has("data/quests/engagement"))) {
    modules.define("data/quests/engagement", () => AppData.ENGAGEMENT_PROGRAMS || []);
  }
})();
