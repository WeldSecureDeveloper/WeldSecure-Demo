(function () {
  const AppData = window.AppData || {};
  const WeldState = window.WeldState;
  const WeldUtil = window.WeldUtil;
  const WeldServices = window.WeldServices || (window.WeldServices = {});

  const ROUTES = AppData.ROUTES || {};
  const DEFAULT_REPORTER_PROMPT = AppData.DEFAULT_REPORTER_PROMPT || "";
  const DEFAULT_EMERGENCY_LABEL = AppData.DEFAULT_EMERGENCY_LABEL || "";
  const DEFAULT_REPORTER_REASONS = AppData.DEFAULT_REPORTER_REASONS || [];

  function resolveState(providedState) {
    if (providedState && typeof providedState === "object") return providedState;
    if (window.state && typeof window.state === "object") return window.state;
    if (window.Weld && typeof window.Weld.state === "object") return window.Weld.state;
    return null;
  }

  function syncGlobalState(state) {
    if (!state || typeof state !== "object") return state;
    window.state = state;
    if (window.Weld) {
      window.Weld.state = state;
    }
    return state;
  }

  function saveState(state) {
    if (WeldState && typeof WeldState.saveState === "function") {
      WeldState.saveState(state);
    }
  }

  function renderShell() {
    if (typeof window.renderApp === "function") {
      window.renderApp();
    } else if (window.Weld && typeof window.Weld.render === "function" && window.Weld.autorun) {
      window.Weld.render();
    }
  }

  WeldServices.navigate = function navigate(route, providedState) {
    const state = resolveState(providedState);
    if (!state || !state.meta) return;
    const nextRoute = ROUTES[route] ? route : "landing";
    state.meta.route = nextRoute;
    if (nextRoute === "landing") {
      state.meta.role = null;
    }
    if (nextRoute !== "customer-reports") {
      state.meta.reportFilter = null;
    }
    syncGlobalState(state);
    saveState(state);
    renderShell();
  };

  WeldServices.setRole = function setRole(role, route, providedState) {
    const state = resolveState(providedState);
    if (!state || !state.meta) return;
    state.meta.role = role || null;
    if (route) {
      if (route !== "customer-reports") {
        state.meta.reportFilter = null;
      }
      state.meta.route = ROUTES[route] ? route : "landing";
    }
    syncGlobalState(state);
    saveState(state);
    renderShell();
  };

  WeldServices.resetDemo = function resetDemo(providedState) {
    const state = resolveState(providedState);
    if (!state) return;
    if (!WeldUtil || typeof WeldUtil.clone !== "function") return;
    const defaultState =
      typeof WeldState.initialState === "function" ? WeldState.initialState() : {};
    state.meta = WeldUtil.clone(defaultState.meta);
    state.customer = WeldUtil.clone(defaultState.customer);
    state.rewards = WeldUtil.clone(defaultState.rewards);
    state.quests = WeldUtil.clone(defaultState.quests);
    state.badges = WeldUtil.clone(defaultState.badges);
    state.rewardRedemptions = WeldUtil.clone(defaultState.rewardRedemptions);
    state.settings = WeldUtil.clone(defaultState.settings);
    state.messages = WeldUtil.clone(defaultState.messages);
    state.clients = WeldUtil.clone(defaultState.clients);
    state.departmentLeaderboard = WeldUtil.clone(defaultState.departmentLeaderboard);
    state.engagementPrograms = WeldUtil.clone(defaultState.engagementPrograms);
    state.labs = WeldUtil.clone(defaultState.labs);

    if (window.location && window.location.hash) {
      if (window.history && typeof window.history.replaceState === "function") {
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      } else {
        window.location.hash = "";
      }
    }

    syncGlobalState(state);
    saveState(state);
    renderShell();
  };

  WeldServices.persist = function persist(providedState) {
    const state = resolveState(providedState);
    if (!state) return;
    syncGlobalState(state);
    saveState(state);
  };

  WeldServices.completeQuest = function completeQuest(questId, options = {}, providedState) {
    const state = resolveState(providedState);
    if (!state || !state.customer) {
      return { success: false, reason: "State missing." };
    }
    if (typeof window.questById !== "function") {
      return { success: false, reason: "Quest lookup unavailable." };
    }
    const quest = window.questById(questId);
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
      id:
        WeldUtil && typeof WeldUtil.generateId === "function"
          ? WeldUtil.generateId("quest-completion")
          : `quest-completion-${Date.now()}`,
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
      questSource.points = (Number.isFinite(existingPoints) ? existingPoints : 0) + awardedPoints;
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

    syncGlobalState(state);
    saveState(state);
    renderShell();

    return { success: true, awardedPoints, doubled, completedAt };
  };

  WeldServices.redeemReward = function redeemReward(rewardId, providedState) {
    const state = resolveState(providedState);
    if (!state || !state.customer) {
      return { success: false, reason: "State missing." };
    }
    if (typeof window.rewardById !== "function") {
      return { success: false, reason: "Reward lookup unavailable." };
    }
    const reward = window.rewardById(rewardId);
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

    if (!Array.isArray(state.rewardRedemptions)) {
      state.rewardRedemptions = [];
    }
    const redemption = {
      id:
        WeldUtil && typeof WeldUtil.generateId === "function"
          ? WeldUtil.generateId("redemption")
          : `redemption-${Date.now()}`,
      rewardId: reward.id,
      redeemedAt: new Date().toISOString(),
      status: "pending"
    };
    state.rewardRedemptions.unshift(redemption);

    syncGlobalState(state);
    saveState(state);
    renderShell();

    return { success: true, redemption };
  };

  WeldServices.openSettings = function openSettings(category, providedState) {
    const state = resolveState(providedState);
    if (!state || !state.meta) return;
    if (typeof category === "string" && category.trim().length > 0) {
      state.meta.settingsCategory = category.trim();
    }
    if (state.meta.settingsOpen) return;
    state.meta.settingsOpen = true;
    syncGlobalState(state);
    saveState(state);
    renderShell();
  };

  WeldServices.closeSettings = function closeSettings(providedState) {
    const state = resolveState(providedState);
    if (!state || !state.meta) return;
    if (!state.meta.settingsOpen) return;
    state.meta.settingsOpen = false;
    syncGlobalState(state);
    saveState(state);
    renderShell();
  };
})();
