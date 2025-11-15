(function () {
  const modules = window.WeldModules;
  const resolveQuestConfig = () => {
    if (modules && typeof modules.has === "function" && modules.has("data/quests/config")) {
      try {
        return modules.use("data/quests/config");
      } catch (error) {
        console.warn("quests/meta: data/quests/config unavailable.", error);
      }
    }
    if (window.WeldQuestConfig) {
      return window.WeldQuestConfig;
    }
    return { QUEST_DIFFICULTY_ORDER: (window.AppData && window.AppData.QUEST_DIFFICULTY_ORDER) || [] };
  };
  const resolveBadgeMeta = () => {
    if (modules && typeof modules.has === "function" && modules.has("data/catalog/badgeMeta")) {
      try {
        return modules.use("data/catalog/badgeMeta");
      } catch (error) {
        console.warn("quests/meta: data/catalog/badgeMeta unavailable.", error);
      }
    }
    if (window.WeldBadgeMeta) {
      return window.WeldBadgeMeta;
    }
    return window.AppData || {};
  };
  const config = resolveQuestConfig();
  const badgeMeta = resolveBadgeMeta();
  const metaExports = {
    QUEST_DIFFICULTY_ORDER: config.QUEST_DIFFICULTY_ORDER || [],
    BADGE_CATEGORY_ORDER: badgeMeta.BADGE_CATEGORY_ORDER || (window.AppData && window.AppData.BADGE_CATEGORY_ORDER) || [],
    BADGE_DRAFTS: badgeMeta.BADGE_DRAFTS || (window.AppData && window.AppData.BADGE_DRAFTS) || [],
    CUSTOMER_BADGE_UNLOCKS:
      badgeMeta.CUSTOMER_BADGE_UNLOCKS || (window.AppData && window.AppData.CUSTOMER_BADGE_UNLOCKS) || []
  };
  window.WeldQuestMeta = metaExports;
  if (modules && (!modules.has || !modules.has("data/quests/meta"))) {
    modules.define("data/quests/meta", () => window.WeldQuestMeta || metaExports);
  }
})();
