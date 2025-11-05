# WeldSecure Refinement Execution Plan

> Goal: Resolve navigation bugs, remove duplicated helpers, and trim token-heavy redundancy while keeping the single-file demo workflow intact.

## Pre-flight Checklist
- Confirm you can open `Static/index.html` directly in a browser (Edge/Chrome).
- Have PowerShell available to run `.\Static\tools\sanity-check.ps1`.
- Optional but useful: enable a diff viewer to verify textual replacements in large JSON payloads.

## Task 1 · Restore `window.ROUTES`
1. Inspect `Static/data.js` and confirm `AppData.ROUTES` contains the authoritative definitions.
2. In a small bootstrap script (likely `Static/data.js` or `Static/state.js`), assign `window.ROUTES = window.AppData.ROUTES;`.
3. Update `Static/main.js` to reference the new global (or fall back to `AppData.ROUTES` if the assignment fails).
4. Manual check: load the app, switch personas via the landing cards, and use hash navigation (`#/client-dashboard`) to ensure routing no longer aborts.

## Task 2 · Normalize Encoding In `defaultState`
1. Audit `Static/data/state/defaultState.js` for garbled characters (e.g. the `Risk Champion` entry) using `Select-String -Pattern '�'`.
2. Replace the corrupted glyphs with plain ASCII (“Risk Champion – Finance” → “Risk Champion – Finance”, etc.) and re-save the file in UTF-8.
3. Reload `Static/index.html` and verify the affected persona tiles render correctly.

## Task 3 · Centralize Reporter Prompt Copy
1. Choose `AppData.DEFAULT_REPORTER_PROMPT` / `AppData.DEFAULT_EMERGENCY_LABEL` as the single source of truth in `Static/data.js`.
2. In `Static/state.js` and `Static/data/state/defaultState.js`, replace hard-coded duplicates with references to the AppData values (read them at runtime to avoid circular imports).
3. Ensure the fallback logic in `state.js` still works if AppData values are missing.
4. Run the reporter settings flow to confirm existing defaults appear in the UI and that persistence still works.

## Task 4 · Extract Shared Config Icon Helper
1. Add a `renderConfigIcon()` helper to `Static/util.js` that returns the inline SVG string (re-using `WeldUtil.renderIcon` if possible).
2. Replace duplicated `CONFIG_ICON` constants in:
   - `Static/features/hub.js`
   - `Static/features/client.js`
   - `Static/features/customer/shared.js`
3. Update call sites to use the helper and remove now-unused constants.
4. Smoke test quests, rewards, and customer hub views to ensure config buttons still render.

## Task 5 · Consolidate Shared Helpers
1. Extend `WeldUtil` with:
   - `getState(appState)`
   - `formatNumberSafe(value)`
   - `formatDateTimeSafe(value)`
   - Any other thin wrappers currently duplicated in modules.
2. Refactor modules that host local copies (e.g. `Static/features/client.js`, `Static/features/settings.js`, `Static/features/customer/shared.js`, `Static/features/reportTable.js`) to call the shared utilities.
3. Remove obsolete local helper definitions after refactoring.
4. Run `pwsh .\Static\tools\sanity-check.ps1` to guard against lint/script regressions.

## Task 6 · Slim `app.js` Delegations
1. Catalogue functions in `Static/app.js` that simply proxy to the app shell (e.g. `renderGlobalNav`, `attachHeaderEvents`).
2. Replace proxy bodies with direct calls that pass through arguments without additional logic, or rely on `components/appShell.js` APIs where the behaviour is identical.
3. Ensure any stateful caching (like `cachedAppShell`) persists if still needed; otherwise, simplify it.
4. Verify navigation, settings, and badge showcases still function after the cleanup.

## Regression Checklist
- Persona journeys: Landing ➜ Reporter ➜ Client ➜ Admin ➜ Labs.
- Reporter Settings dialog still opens, edits, and persists defaults.
- Rewards/quests config buttons render with the SVG helper.
- `Reset demo data` clears state without console errors.
- `pwsh .\Static\tools\sanity-check.ps1` completes successfully.

Complete every task before committing; each section is designed to be executed sequentially without additional dependencies.
