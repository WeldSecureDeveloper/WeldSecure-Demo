# WeldSecure Architecture & Contribution Guardrails

This document captures the key structural decisions for the static WeldSecure demo so we can keep the repo maintainable, token-efficient, and easy for Codex (and humans) to navigate. Treat it as the source of truth when adding new screens, wiring data, or touching shared utilities.

---

## 1. Layered Directory Structure

`
Static/
|-- index.html            # Shell document; script/style entry points only
|-- styles.css            # Imports-only CSS aggregator
|-- data/                 # Demo datasets + enums
|-- services/             # Thin facades over state mutations
|-- components/           # JS building blocks (e.g., appShell) + CSS components
|-- features/             # Persona/route-specific modules
|-- tools/                # Utility scripts (sanity checks, replay helpers)
-- docs/                 # Architecture notes, backlog, fix log, etc.
`

- **Never** drop new behaviour directly into root files (app.js, styles.css) unless it is orchestrating imports.
- Feature behaviour belongs in features/<name>.js; shared helpers live in util.js or purpose-built modules under components/ / services/.

---

## 2. Bootstrapping & Module Loader

1. `index.html` loads data, utilities, and `moduleLoader.js` before any route code. The loader defines `window.WeldModules` so every runtime/feature module can register itself lazily via `modules.define(id, factory)`.
2. `main.js` bootstraps `window.Weld`, hydrates/persists the state slice, and reads the current hash route. It calls `renderApp` once the DOM is ready and re-renders on `hashchange`.
3. `registry.js` maps each slug to a feature orchestrator by calling `window.WeldRegistry.register(route, config)` (and also exports the registry via `WeldModules.define("runtime/routes", ...)`). Each entry delegates to a specific `WeldModules` export (e.g., `features/customer/hub`) for render/attach methods, so runtime helpers (like `runtime/renderApp`) can pull route metadata without reaching for globals.
4. `app.js` hosts `renderApp()` and its helpers:
   - Look up the active route from the registry.
   - Ask the feature for HTML by calling `feature.template` or `feature.render`.
   - Inject the markup into `<div id="app">`, then run the feature's `attach()` hook for DOM wiring.
   - Invoke optional `destroy()` hooks before switching routes.

**Guardrails**
- Register new behaviour through the registry instead of branching in `app.js`.
- Whenever possible, wrap reusable runtime logic (service wrappers, achievements overlay, badge alignment) in dedicated `WeldModules` exports so features can depend on narrow APIs.

---

## 3. State & Data

- **Immutable demo data** lives in data/ (data.js and nested modules) and is exposed via window.AppData.
- **Mutable UI state** lives in state.js (defaults) plus services/stateServices.js (mutations). Features should call the service layer rather than mutating window.Weld.state directly.
- util.js exposes read helpers (formatting, DOM utilities) - avoid duplicating logic.

**Guardrails:**
- Add new datasets in data/ and export them through window.AppData instead of hard-coding arrays inside features.
- Extend stateServices when a new mutation is required. Keep method names declarative (awardPoints, toggleQuest, etc.).
- Route every UI mutation through a `WeldServices` helper (via the `window.<service>` wrappers) instead of mutating `window.Weld.state` or `state.meta` directly.
- Always persist through the window.Weld.state helpers so the "Reset demo data" button remains accurate.

---

## 4. Feature Modules

Each feature file should follow this shape (or define a similar API inside `WeldModules`):

`js
(function () {
  if (!window.Weld) return;

  const features = window.Weld.features || (window.Weld.features = {});
  const module = features.<name> || (features.<name> = {});

  module.render = function render(state) { /* return HTML string */ };
  module.attach = function attach(container, state) { /* bind events */ };
  module.destroy = function destroy(container) { /* optional cleanup */ };
})();
`

**Expectations:**
- Keep DOM selectors scoped to feature-specific prefixes (e.g., `.customer-`, `.landing__`). Shared widgets belong in `components/`.
- Read static copy/data from `window.AppData`; read mutable values from the `state` argument passed into `render/attach`.
- Use helpers (`WeldUtil`, `WeldServices`, `modules.use(...)`) instead of re-implementing utilities.
- Register your route in `registry.js` with the right page chrome (page class, container ID, template/attach method names).

---

## 5. CSS Strategy (Integrated Guardrails)

1. **Aggregator stays import-only** - Static/styles.css may contain @import lines and short comments documenting the order. Any selectors added here should be treated as debt and migrated immediately.
2. **Layered directories** - Tokens/resets go in styles/base/, reusable building blocks in styles/components/, and route-scoped selectors in styles/features/<name>.css. Keep styles/badges.css for badge-specific selectors until the legacy file is retired.
3. **Import order** - Google Fonts -> base -> components -> features -> legacy (badges.css). When adding a new file, insert its @import into the correct block; do not append to the end.
4. **Token-first styling** - Reference variables in styles/base/tokens.css for color, spacing, and shadows. Introduce new tokens there rather than sprinkling hard-coded values through feature files.
5. **Scoped naming** - Use predictable prefixes (.landing__, .customer-, .quest-card__) to keep selectors isolated. Utilities that affect multiple screens belong in base/component files, not features.
6. **Workflow for new styles** - Decide the layer, create/extend the appropriate file, add its import, delete temporary selectors from the aggregator, test the affected feature(s) (desktop plus at least one responsive breakpoint), and update docs/backlog entries if the structure changes. Always smoke-test the badge gallery and customer hub when badge styles move.

### 5.1 Cascade Layer Snapshot (Nov 2025)

- `@layer base, components, features;` lives at the top of `styles.css`, and **every** file under `styles/base`, `styles/components`, and `styles/features` is wrapped in the appropriate layer.
- Badge styles were split into `styles/components/badges/{tokens,cards,spotlight,grids}.css` and `styles/features/badges.css`, so the old `styles/badges.css` file is gone. When adding new badge UI, extend these files instead of creating another legacy sheet.
- Regression expectations:
  - **Phase BÔÇôE complete:** tokens/base/layout, reusable components, feature files, and badge gallery layers migrated and verified in both themes.
  - **Phase F outstanding:** whenever you touch layered CSS, load the key personas (landing, customer, client, admin, badges, reporter) and watch console output. Record any regressions in the fix backlog.
- To validate the stack quickly, run `rg "@layer" Static/styles -g "*.css"`; the command should report every CSS file once. If it misses a file, wrap it before committing.

---

## 6. Adding New Functionality

1. **Define the feature:**
   - Create `features/<name>.js` with `render/attach` or register a module via `WeldModules.define`.
   - Add any required datasets under data/ and state defaults in state.js.
2. **Update routing:**
   - Register the feature and label in `registry.js`.
   - Add navigation affordances in components/appShell.js if necessary.
3. **Style responsibly:**
   - Add base/component CSS if reusable; otherwise create styles/features/<name>.css.
   - Update styles.css imports in the correct order (fonts -> base -> components -> features -> badges).
4. **Wire services/utilities:**
   - Extend stateServices for mutations.
   - Add helpers to util.js if multiple features share logic.
5. **Document + test:**
   - Update relevant docs/backlog items (including the QA checklist once Phase A lands).
   - Manually QA the new route plus affected shared components (header, nav, filters, etc.) in both themes and document the run in `Static/docs/fix-backlog.md`.

---

## 7. Examples of Anti-Patterns to Avoid

- Adding route-specific conditions inside app.js instead of the registry.
- Duplicating literal data inside features (pull from window.AppData instead).
- Writing CSS directly in styles.css or mixing feature CSS into component files.
- Manipulating localStorage or window.Weld.state directly in features without the service layer.
- Creating anonymous globals (attach everything to window.Weld.* namespaces to stay discoverable).

---

## 8. Token & Context Efficiency (Codex Guidelines)

- Reference this file instead of pasting large snippets into prompts.
- When editing, name the specific file/section (e.g., features/customer.js:renderCustomerHub) so Codex loads only what is necessary.
- Keep files focused; if a feature grows beyond ~500 lines consider splitting into submodules or helper files to reduce context size.

---

## 9. Useful References

- Static/docs/fix-backlog.md + Static/docs/feature-backlog.md - track work in/out.
- Static/tools/ - scripts for sanity checks or data resets.

When in doubt, check this guide before coding. If you need to bend a rule, document it and plan a cleanup so the architecture stays predictable for the next contributor (and Codex).
