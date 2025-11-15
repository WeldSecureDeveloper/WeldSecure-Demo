(function () {
  const AppData = window.AppData || (window.AppData = {});
  if (!Array.isArray(AppData.QUEST_DIFFICULTY_ORDER) || AppData.QUEST_DIFFICULTY_ORDER.length === 0) {
    AppData.QUEST_DIFFICULTY_ORDER = ["starter", "intermediate", "advanced"];
  }
  const modules = window.WeldModules;
  if (modules && (!modules.has || !modules.has("data/quests/meta"))) {
    modules.define("data/quests/meta", () => ({
      QUEST_DIFFICULTY_ORDER: AppData.QUEST_DIFFICULTY_ORDER,
      BADGE_CATEGORY_ORDER: AppData.BADGE_CATEGORY_ORDER,
      BADGE_DRAFTS: AppData.BADGE_DRAFTS,
      CUSTOMER_BADGE_UNLOCKS: AppData.CUSTOMER_BADGE_UNLOCKS
    }));
  }
})();

