(function () {
  const AppData = window.AppData || (window.AppData = {});
  if (!Array.isArray(AppData.QUEST_DIFFICULTY_ORDER) || AppData.QUEST_DIFFICULTY_ORDER.length === 0) {
    AppData.QUEST_DIFFICULTY_ORDER = ["starter", "intermediate", "advanced"];
  }
  const questConfig = {
    QUEST_DIFFICULTY_ORDER: AppData.QUEST_DIFFICULTY_ORDER
  };
  window.WeldQuestConfig = questConfig;
  const modules = window.WeldModules;
  if (modules && (!modules.has || !modules.has("data/quests/config"))) {
    modules.define("data/quests/config", () => window.WeldQuestConfig || questConfig);
  }
})();

