# Token Efficiency & Architecture Modernization Plan

_Last updated: 2025-11-14 -- Status legend: `todo`, `in-progress`, `blocked`, `done`._

This plan captures every follow-up from the top-to-bottom review so Codex (operating as the only contributor) can land improvements in resumable phases. Each task calls out the affected files plus the manual testing required before moving to the next step.

## Hotspots Identified During Review

- `Static/docs/architecture-overview.md:26-41` still contains mojibake (renderApp, registry) and never mentions `WeldModules`, lazy components, or how features proxy through `features/customer.js`.
- `Static/data.js:1-900` mixes enums, badge catalogues, quests, nav metadata, and mock datasets in one 1.1k line file. The same shapes are cloned again inside `state.js` and `services/stateServices.js`, inflating token use any time defaults change.
- `Static/app.js:1-3400` is a monolith: service wrappers, theming, reset flows, achievement overlay logic, DOM alignment, and rendering orchestration all live together.
- `Static/services/stateServices.js:32-210` duplicates phishing designer defaults and helpers from `state.js`, so bug fixes must be patched in multiple places.
- `Static/features/customer/hub.js` and `Static/features/reporterSandbox.js` are well above the ~500 line target. State selectors, render helpers, and attach logic remain interleaved.
- `Static/styles/features/customer.css:1-1249` combines hub, rewards, quests, recognitions, and leaderboard styling in a single sheet, which bloats prompts and makes scoped regression fixes hard.
- Tooling gaps: `Static/tools/sanity-check.ps1` references `$docPaths` but never populates it, so doc encoding is never checked. `Static/tools/inspect-dashboard.js` is not referenced anywhere and drags in Node dependencies without documentation.
- Dead weight: `temp.txt` at repo root is empty and unused, but still shows up in every diff.

## Phase A - Documentation & Guardrails Refresh (`done`)

| Task | Status | Notes |
| --- | --- | --- |
| Update `Static/docs/architecture-overview.md` to fix mojibake, add a module-loader diagram, and call out how `features/customer.js` proxies to `WeldModules`. | done | Includes an explicit `{ render, attach }` example returning HTML instead of mutating the DOM. |
| Expand `Static/README.md` with a "Runtime modules" section that lists `main.js`, `app.js`, `services/stateServices.js`, and `moduleLoader.js`. | done | Links back to the architecture doc so the README stays scannable. |
| Add `Static/docs/manual-qa-checklist.md` detailing persona-by-persona smoke coverage. | done | Covers landing, customer hub, reporter add-in, sandbox, client dashboards, admin, labs. |
| Convert `Static/docs/feature-backlog.md` and `Static/docs/fix-backlog.md` into status tables that link back to this plan. | done | Tables now track Owner/Status/Notes for quick resumes. |

**Manual verification when closing the phase**
- Open `Static/index.html`, toggle between personas, and ensure docs match observed behaviour.
- Run `rg -n "[^\x00-\x7F]" Static/docs` to confirm docs remain ASCII.
- Sanity-check that README links resolve to the refreshed docs.

## Phase B - Runtime Core Modularization (`in-progress`)

**Goal:** Split the 3.2k line `app.js` and the 1.5k line `stateServices.js` into token-sized runtime modules without breaking behaviour. Execute in reversible increments with QA between each sub-phase.

### B.0 Baseline Snapshot (`done`)

- Preserve the current `Static/app.js` and `Static/index.html` as the authoritative baseline (no runtime modules yet).
- Record a clean manual QA run before modularization to make regressions easy to spot.

### B.1 Theme + Service Wrapper Extraction (`done`)

| Task | Status | Notes |
| --- | --- | --- |
| Extract `normalizeTheme/applyTheme` into `runtime/theme.js`, but keep `app.js` calling through a shim so `window.applyTheme` stays available immediately. | done | Module wired via `moduleLoader.js`; manual QA confirmed light/dark toggles via the runtime helper. |
| Extract `invokeService` plus wrapper bindings into `runtime/serviceWrappers.js` while keeping the `window.navigate` style exports in `app.js`. | done | App now delegates through `runtime/serviceWrappers.js` with `window.*` fallbacks; nav/hub/reset covered in the Edge 119 smoke run. |
| Add a sanity script step that compares `Static/app.js` against a baseline copy; warn if modularization changes >10% of the file before new modules are fully adopted. | done | `Static/tools/sanity-check.ps1` now diff-checks `Static/baselines/app-phase-b0.js` and fails if drift exceeds 10%. |

### B.2 Achievements Module (`in-progress`)

| Task | Status | Notes |
| --- | --- | --- |
| Move the achievement overlay helpers into `runtime/achievements.js`, but keep `app.js` exporting the legacy globals so existing features continue to work. | done | Badge toast + hub welcome routing now call the module (with fallbacks) and were covered in the latest checklist. |
| Split the achievement queue helpers from the DOM binding code so scripts can import the lighter API when they only need to trigger a toast. | todo | Target a `runtime/achievementsApi.js` helper or equivalent. |
| Document the achievements lifecycle (queue, blink, collapse, clean-up timers) inside the architecture doc after the runtime split stabilizes. | todo | Link back to this entry once published. |

### B.3 Render/App Shell Split (`in-progress`)

| Task | Status | Notes |
| --- | --- | --- |
| Extract render helpers (nav binding, shell caching, persona attachers) into `runtime/renderApp.js`. | done | Module created with shim + factory fallback; QA run logged after upgrading registry integration. |
| Update `moduleLoader.js` + `registry.js` so persona routes fetch shell helpers lazily. | in-progress | Registry now exposes a `runtime/routes` module and `runtime/renderApp` consumes it; finish wiring any remaining consumers (scripts/tools) before removing global fallbacks. |
| Verify navigation + hub flows after the split, paying close attention to anchor focus management. | todo | Capture results in `Static/docs/fix-backlog.md`. |

### B.4 State Services Dedup (`todo`)

| Task | Status | Notes |
| --- | --- | --- |
| Move phishing designer defaults and helpers into a shared module imported by both `state.js` and `services/stateServices.js`. | todo | Add a quick Node `vm` smoke to ensure `WeldState.initialState()` works without DOM globals. |
| Update the manual QA checklist with a "Phase B complete" entry once all sub-phases are green. | todo | Record browser/device data points for future regressions. |

**Manual verification (repeat after each sub-phase)**
- Run the full checklist: landing, all customer hub tabs, badge celebrations, reporter add-in/sandbox, client dashboards, admin, labs.
- Capture console output; no new `SyntaxError`, `WeldState` reference errors, or `WeldServices.*` warnings should appear.
- After Phase B.3, run a headless browser regression (Edge/Chrome or Puppeteer) to ensure no script emits unexpected tokens (protects against encoding regressions).

## Phase C - Data & State Deduplication (`todo`)

| Task | Status | Notes |
| --- | --- | --- |
| Break `Static/data.js` into domain-specific files (for example `data/app/meta.js`, `data/app/badges.js`, `data/app/quests.js`). | todo | Update `index.html` script order accordingly. |
| Replace the hard-coded default payloads in `state.js` with imports from `data/state/defaults.js`; expose helpers like `cloneDefaultState()`. | done | Shared defaults now live in `data/state/defaults.js`; both `state.js` and the render shim load them via `WeldModules`. |
| Refactor phishing designer defaults so both `state.js` and `services/stateServices.js` import from `data/state/defaults.js`. | done | `DEFAULT_PHISHING_FORM` / `DEFAULT_DESIGNER_FORM` now come from the shared module with fallbacks. |
| Add a lightweight data validation script (for example `Static/tools/validate-data.js`) that checks the new modules for duplicate IDs and missing fields. | todo | Hook it into the QA checklist as a preflight step (VM smoke harness already covers `WeldState.initialState()`). |

## Phase D - Persona Feature Decomposition (`todo`)

| Task | Status | Notes |
| --- | --- | --- |
| Split `features/customer/hub.js` into digestible modules (hero, recognition feed, quests, rewards, metrics) and load them via `WeldModules`. | todo | Update `features/customer.js` to hydrate the new modules. |
| Further split `features/reporterSandbox.js`: move achievement prompts, inbox filters, and telemetry helpers into `components/reporterSandbox/*`. | todo | Maintain graceful fallbacks for the existing lazy-load logic. |
| Reorganize `features/` into persona folders (`features/client/*`, `features/admin/*`, `features/reporter/*`) so future additions stop dumping everything into the root. | todo | Update `index.html` script tags and `registry.js` import paths accordingly. |
| Audit unused persona files (confirm whether `features/badgeLabTheme.js` is still referenced; if not, remove or document it). | todo | Use `rg` to find references before deleting. |

## Phase E - Styles, Tokens & Asset Hygiene (`todo`)

| Task | Status | Notes |
| --- | --- | --- |
| Split `Static/styles/features/customer.css` into `styles/features/customer/{hub,leaderboards,reports,rewards}.css` and adjust `styles.css` imports. | todo | Keep `@layer` declarations in every new file to preserve cascade ordering. |
| Extract shared reporter sandbox styles into `styles/components/reporterSandbox/*.css` so both the add-in and sandbox reuse the same tokens. | todo | Update the architecture doc to reflect the new CSS layout. |
| Add a script (or PowerShell task) that asserts every CSS file contains `@layer` and that `styles.css` remains import-only. | todo | Integrate with the sanity script. |
| Optimize SVG assets under `Static/svg/` by removing unused icons and documenting the naming convention inside README. | todo | Run `rg "svg/" Static` to find live references before deleting. |

## Phase F - Tooling, Testing & Cleanup (`todo`)

| Task | Status | Notes |
| --- | --- | --- |
| Expand `Static/tools/sanity-check.ps1` to verify `@layer` coverage, assert docs remain ASCII, check script order in `index.html`, and confirm each `WeldModules` entry referenced in `features/*.js` exists. | todo | Reuse `rg` inside the script for speed. |
| Decide whether `Static/tools/inspect-dashboard.js` should be documented (with usage instructions) or removed. If kept, add it to README's tooling section and convert it to ESM for easier execution. | todo | Include a sample command such as `node ./Static/tools/inspect-dashboard.js`. |
| Delete `temp.txt` (repo root) after confirming it is not referenced anywhere. | todo | Mention the deletion in `Static/docs/fix-backlog.md`. |
| Add regression logging to `Static/docs/fix-backlog.md` whenever a phase lands so future contributors know which manual QA steps were run. | todo | Tie entries back to this plan (for example, "Phase C verified - data dedup"). |

---

### How to Resume Mid-Plan
1. Read the "Hotspots" section plus the completed entries in `Static/docs/fix-backlog.md` to understand which phases are already finished.
2. Update the relevant task status to `in-progress` before editing files so later sessions know exactly where to resume.
3. Always run the manual QA checklist and the sanity script before marking a task `done`.
4. Keep this plan updated with new caveats or discoveries as they surface.

Following these phases will keep the repo aligned with the guardrails, reduce the number of tokens Codex must load for any change, and leave a clear trail for whoever picks up the next session.
