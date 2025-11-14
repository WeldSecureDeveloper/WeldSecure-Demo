(function () {
  const modules = window.WeldModules;
  if (!modules || modules.has("components/reporterSandbox/layout")) return;

  modules.define("components/reporterSandbox/layout", function () {
    function requireHelper(helpers, key) {
      if (!helpers || typeof helpers[key] !== "function") {
        throw new Error(`reporterSandbox/layout missing helper: ${key}`);
      }
      return helpers[key];
    }

    function renderLayout(state, helpers) {
      if (!state || !helpers) {
        return "";
      }

      const getSandbox = requireHelper(helpers, "getSandbox");
      const resolveIdentity = requireHelper(helpers, "resolveIdentity");
      const escapeHtml = requireHelper(helpers, "escapeHtml");
      const fluentIconImg = requireHelper(helpers, "fluentIconImg");
      const resolveAddinShellHeight = requireHelper(helpers, "resolveAddinShellHeight");
      const renderSidebar = requireHelper(helpers, "renderSidebar");
      const renderRibbon = requireHelper(helpers, "renderRibbon");
      const renderMessageGroups = requireHelper(helpers, "renderMessageGroups");
      const renderReadingPane = requireHelper(helpers, "renderReadingPane");
      const renderReporterSidebar = requireHelper(helpers, "renderReporterSidebar");
      const renderUserPicker = requireHelper(helpers, "renderUserPicker");
      const renderSettingsDrawer = requireHelper(helpers, "renderSettingsDrawer");

      const sandbox = getSandbox(state);
      const identity = resolveIdentity(state, sandbox);
      const navTabs = ["File", "Home", "View", "Help"];
      const rootClasses = ["sandbox-window"];
      if (sandbox.layout.compactRows) rootClasses.push("is-compact");
      if (!sandbox.layout.showSnippets) rootClasses.push("hide-snippets");
      if (sandbox.layout.highlightReading) rootClasses.push("highlight-reading");
      const addinVisible = sandbox.layout.showAddin === true;
      if (addinVisible) rootClasses.push("has-addin");
      const activeMessage = sandbox.messages.find(message => message.id === sandbox.activeMessageId) || null;
      const readingRegionClasses = ["reading-region"];
      const sandboxContentClasses = ["sandbox-content"];
      const stageClasses = ["sandbox-stage"];
      const addinShellHeight = resolveAddinShellHeight(state);
      if (addinVisible) {
        stageClasses.push("sandbox-stage--addin-visible");
      }

      return `
      <div class="${rootClasses.join(" ")}">
        <header class="sandbox-topbar">
          <div class="topbar-hero">
            <div class="topbar-left">
              <span class="topbar-wordmark" aria-label="Outlook">
                <span class="topbar-wordmark__glyph" aria-hidden="true">${fluentIconImg("waffle-grid-24.svg")}</span>
                <span class="topbar-wordmark__label">Outlook</span>
              </span>
            </div>
            <div class="topbar-right">
              <button type="button" class="topbar-icon topbar-icon--ghost" aria-label="Search mailbox">
                ${fluentIconImg("search-28-regular.svg")}
              </button>
              <button type="button" class="topbar-icon topbar-icon--ghost" aria-label="Open settings" data-open="settings">
                ${fluentIconImg("more-horizontal-24-regular.svg")}
              </button>
              <button type="button" class="topbar-avatar" aria-label="Choose sandbox user" data-open="user-picker">
                <span>${escapeHtml(identity.initials)}</span>
              </button>
            </div>
          </div>
          <div class="topbar-nav" role="navigation" aria-label="Mailbox navigation">
            <button type="button" class="topbar-hamburger" aria-label="Open app launcher">
              ${fluentIconImg("line-horizontal-3-24-regular.svg")}
            </button>
            <nav class="sandbox-tabs" role="tablist">
              ${navTabs
                .map(
                  (tab, index) => `
                    <button type="button" role="tab" class="sandbox-tab${index === 1 ? " is-active" : ""}">
                      <span>${escapeHtml(tab)}</span>
                    </button>
                  `
                )
                .join("")}
            </nav>
          </div>
        </header>
        <div class="sandbox-main">
          ${renderSidebar()}
          <div
            class="${stageClasses.join(" ")}"
            data-sandbox-stage
            data-addin-visible="${addinVisible ? "true" : "false"}"
            style="--sandbox-shell-height: ${addinShellHeight}px;"
          >
            <div class="${sandboxContentClasses.join(" ")}">
              <div class="sandbox-content__main">
                ${renderRibbon(addinVisible)}
                <div class="sandbox-content__body">
                  <section class="message-column">
                    <div class="message-toolbar" role="toolbar" aria-label="Mailbox view controls">
                      <div class="message-toolbar__title">
                        <span class="message-toolbar__folder">Inbox</span>
                        <button type="button" class="message-toolbar__favorite" aria-label="Toggle favorite">
                          ${fluentIconImg("star-16-filled.svg")}
                        </button>
                      </div>
                      <div class="message-toolbar__actions">
                        <button type="button" aria-label="Copy message">
                          ${fluentIconImg("copy-16-regular.svg")}
                        </button>
                        <button type="button" aria-label="Jump to folder">
                          ${fluentIconImg("arrow-turn-down-right-20-regular.svg")}
                        </button>
                        <button type="button" aria-label="Filter messages">
                          ${fluentIconImg("filter-24-regular.svg")}
                        </button>
                        <button type="button" aria-label="Sort order">
                          ${fluentIconImg("arrow-sort-24-regular.svg")}
                        </button>
                      </div>
                    </div>
                    <div class="message-list" data-sandbox-list>
                      ${renderMessageGroups(sandbox, state)}
                    </div>
                  </section>
                  <div class="${readingRegionClasses.join(" ")}" data-reading-region data-addin-visible="${addinVisible ? "true" : "false"}">
                    ${renderReadingPane(sandbox, activeMessage, identity, state)}
                  </div>
                </div>
              </div>
            </div>
            ${renderReporterSidebar(addinVisible)}
          </div>
        </div>
      </div>
      ${renderUserPicker(identity, sandbox)}
      ${renderSettingsDrawer(sandbox)}
    `;
    }

    return {
      renderLayout
    };
  });
})();
