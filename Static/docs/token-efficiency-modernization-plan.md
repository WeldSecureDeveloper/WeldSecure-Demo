# Token Efficiency & Architecture Modernisation Plan

_Last updated: 2025-11-14 · Status legend → `todo`, `in-progress`, `blocked`, `done`._

This plan captures every follow-up from the top-to-bottom review so Codex (as the sole contributor) can land the improvements in resumable phases. Each task calls out the affected files and the manual testing needed before moving to the next phase.

## Hotspots Identified During Review

- `Static/docs/architecture-overview.md:26-41` still contains mojibake (“enderApp()”, “egistry”) and never mentions `WeldModules`, lazy components, or how features now proxy through `features/customer.js`.
- `Static/data.js:1-900` mixes enums, badge catalogues, quests, nav metadata, and mock datasets in a single 1.1k‑line file. The same shapes are cloned again inside `state.js:1-220` and `services/stateServices.js:32-210`, inflating token use every time a contributor touches data or defaults.
- `Static/app.js:1-3400` is a monolith: service wrappers, theming, reset flows, achievement overlay logic, DOM alignment, and rendering orchestration live together. This makes diffs noisy and forces Codex to load the entire file to tweak a single helper.
- `Static/services/stateServices.js:32-210` duplicates phishing designer defaults and other helpers from `state.js`, so bug fixes must be patched in multiple places.
- `Static/features/customer/hub.js:1-1209` and `Static/features/reporterSandbox.js:1-992` are still far above the ~500 line target even after the first round of module splits. State selectors, render helpers, and attach logic are interleaved.
- `Static/styles/features/customer.css:1-1249` combines hub, rewards, quests, recognitions, and leaderboard styling in a single sheet, which bloats prompts and makes scoped regressions hard to reason about.
- Tooling gaps: `Static/tools/sanity-check.ps1:27-48` declares `$docPaths` but never populates it, so doc encoding isn’t actually checked anymore. `Static/tools/inspect-dashboard.js` isn’t referenced anywhere and drags in Node dependencies without documentation.
- Dead weight: `temp.txt` at repo root is empty and unused, but still shows up in every diff.

## Phase A – Documentation & Guardrails Refresh

**Goal:** Align documentation with the current structure (WeldModules, persona shells, lazy components) while keeping contributor prompts small.

| Task | Status | Notes |
| --- | --- | --- |
| Rewrite `Static/docs/architecture-overview.md` to fix the mojibake in §2, add a diagram of the module loader + registry flow, and call out how features like `features/customer.js` proxy to `WeldModules` (`todo`) |  | Include explicit example of `{ render, attach }` contract returning HTML instead of mutating DOM directly. |
| Expand `Static/README.md` with a “Runtime modules” section that lists the key entry points (`main.js`, `app.js`, `services/stateServices.js`, `moduleLoader.js`) and how to reference them in prompts (`todo`) |  | Keep it concise; link out to the architecture doc for detail so README stays scannable. |
| Create `Static/docs/manual-qa-checklist.md` detailing the persona-by-persona smoke suite (Landing, Customer hub, Reporter add-in, Sandbox, Client dashboards, Admin/Labs) including theme toggles and reset flow expectations (`todo`) |  | This will be referenced in every later phase. |
| Update `Static/docs/feature-backlog.md` and `Static/docs/fix-backlog.md` to include status, owner (Codex), and cross-links to the plan phases so future contributors can resume context quickly (`todo`) |  | Convert bullet list into a table with `Status/Notes` columns. |

**Manual verification before closing the phase**
- Open `Static/index.html` locally, toggle between personas, and ensure the updated documentation accurately matches the observed behaviour (especially guided tour toggles and settings shell).
- Run `rg -n "[^\\x00-\\x7F]" Static/docs` to confirm docs remain ASCII-clean after edits.
- Sanity-check that README links resolve to the refreshed docs.

## Phase B – Runtime Core Modularisation (`app.js`, `main.js`, `services`)

**Goal:** Split the 3.2k-line `app.js` monolith and the 1.5k-line `stateServices.js` so token-sized modules can be loaded independently.

| Task | Status | Notes |
| --- | --- | --- |
| Introduce `Static/runtime/` (or similar) and move `app.js` responsibilities into focused modules: `runtime/serviceWrappers.js` (lines 24-130), `runtime/theme.js` (lines 45-90), `runtime/achievements.js` (lines 110-330), `runtime/renderApp.js` (lines 3100-3460) (`todo`) |  | Each file should register itself through `WeldModules` so features can require only what they need. |
| Refactor `services/stateServices.js:32-210` to import shared defaults from `state.js` (or a new `state/defaults.js`) instead of duplicating designer form logic (`todo`) |  | Ensure the helper exports stay pure so they can be unit-tested in isolation. |
| Add explicit `WeldModules` definitions for the runtime helpers and expose tiny wrappers on `window` for backwards compatibility (`todo`) |  | e.g., `modules.define("runtime/appRender", () => ({ renderApp, renderAppPreservingScroll }));`. |
| Update `main.js` and any callers to pull from the new modules instead of the global `renderApp` and service wrapper functions (`todo`) |  | Keep the current bootstrapping behaviour and fall back to globals if modules fail, to avoid regressions. |

**Manual verification**
- Run the manual QA checklist focusing on: navigation via brand button, hash-change routing, theme toggle, reset flow, badge celebration overlay, and badge edge alignment after resizing.
- Use browser devtools to confirm no duplicate warnings (“WeldServices.* is unavailable”) appear in the console after the split.

## Phase C – Data & State Deduplication

**Goal:** Reduce duplicated literals across `data.js`, `state.js`, and `services/stateServices.js` by introducing shared data modules and JSON payloads.

| Task | Status | Notes |
| --- | --- | --- |
| Break `Static/data.js` into domain-specific files (e.g., `data/app/meta.js`, `data/app/badges.js`, `data/app/quests.js`, `data/app/nav.js`) that each attach to `window.AppData` (`todo`) |  | Update `index.html` script order to match (data files before `data.js` orchestrator). |
| Replace the hard-coded default payloads in `state.js:1-220` with imports from `data/state/defaultState.js` (or a generated JSON snapshot), exposing helpers like `cloneDefaultState()` for all consumers (`todo`) |  | Ensure `WeldState.initialState()` just clones the shared payload. |
| Refactor phishing designer defaults so `state.js` and `stateServices.js` both import from `data/phishingDesignerDefaults.js` (`todo`) |  | Avoid sprinkling `DEFAULT_DESIGNER_FORM` across multiple files. |
| Add a lightweight data validation script (e.g., `Static/tools/validate-data.js`) that checks the new modules for duplicate IDs and missing fields (`todo`) |  | Hook it into the QA checklist as a preflight step. |

**Manual verification**
- After refactors, clear `localStorage` and load `Static/index.html`. Confirm reporter sandbox, phishing designer, badge catalogue, and reset flow still boot with identical data.
- Run the new validation tool and fail the build if duplicate IDs are found.

## Phase D – Persona Feature Decomposition & File-System Restructuring

**Goal:** Keep persona modules under ~500 lines and group them by persona to improve discoverability.

| Task | Status | Notes |
| --- | --- | --- |
| Create `Static/personas/customer/` (or `features/customer/sections/`) and split `features/customer/hub.js:1-1209` into digestible modules (hero, recognition feed, quests, rewards, metrics). Wire them through `WeldModules` similar to the reporter sandbox (`todo`) |  | Update `features/customer.js` to hydrate the new modules. |
| Split `features/reporterSandbox.js:1-992` further: move achievement prompts, inbox filters, and telemetry helpers into `components/reporterSandbox/*` modules (`todo`) |  | Keep graceful fallbacks for the existing lazy-load logic. |
| Reorganise `features/` into persona folders (`features/client/*`, `features/admin/*`, `features/reporter/*`) so future additions don’t dump 20 scripts into the root (`todo`) |  | Update `index.html` script tags and `registry.js` imports accordingly. |
| Audit for unused persona files (e.g., confirm whether `features/badgeLabTheme.js` is still referenced; if not, remove it or document its purpose) (`todo`) |  | Use `rg` to find references before deletion. |

**Manual verification**
- Execute the manual QA checklist across every persona touched by the refactor (landing, customer hub tabs, client catalogue pages, reporter sandbox/add-in, admin and labs). Verify that event handlers still fire (e.g., completing quests, selecting badges, toggling layouts).
- Inspect console output for missing module warnings during navigation.

## Phase E – Styles, Tokens & Asset Hygiene

**Goal:** Ensure each persona has its own scoped stylesheet and that reusable tokens live in component layers.

| Task | Status | Notes |
| --- | --- | --- |
| Split `Static/styles/features/customer.css:1-1249` into `styles/features/customer/{hub,leaderboards,reports,rewards}.css` and adjust `styles.css` imports accordingly (`todo`) |  | Keep @layer declarations in every new file to preserve cascade ordering. |
| Extract shared reporter sandbox styles into `styles/components/reporterSandbox/*.css` so both the add-in and sandbox reuse the same tokens (`todo`) |  | Update the architecture doc to reflect the new CSS layout. |
| Add a script (or npmless PowerShell task) that asserts every CSS file contains `@layer` and that `styles.css` remains import-only (`todo`) |  | Integrate with the sanity script. |
| Optimise SVG assets under `Static/svg/` by removing unused icons and documenting the naming convention inside README (`todo`) |  | Run `rg "svg/" Static` to find live references before deleting. |

**Manual verification**
- Reload the app in both light and dark themes; smoke-test responsive states for customer hub grid, badge catalogue hover states, and reporter sandbox layout toggles.
- Run the CSS guard script to ensure every new file declares a layer and no stray selectors leak into `styles.css`.

## Phase F – Tooling, Testing & Cleanup

**Goal:** Ensure contributors can detect regressions quickly and keep the repo lean.

| Task | Status | Notes |
| --- | --- | --- |
| Expand `Static/tools/sanity-check.ps1` to: (a) verify `@layer` coverage, (b) assert docs remain ASCII, (c) check script order in `index.html`, and (d) confirm each `WeldModules` entry referenced in `features/*.js` exists (`todo`) |  | Reuse `rg` inside the script for speed. |
| Decide whether `Static/tools/inspect-dashboard.js` should be documented (with usage instructions) or removed. If kept, add it to README’s tooling section and convert it to ESM for easier execution (`todo`) |  | Include a sample command (`node ./Static/tools/inspect-dashboard.js`). |
| Delete `temp.txt` (root) after confirming it isn’t referenced anywhere (`todo`) |  | Mention the deletion in the fix backlog. |
| Add regression logging to `Static/docs/fix-backlog.md` whenever a phase lands so future contributors know which manual QA steps were run (`todo`) |  | Tie entries back to this plan (e.g., “Phase C verified – data dedup”). |

**Manual verification**
- Run the updated sanity script before and after each major change; it should exit non-zero if modules are missing or docs aren’t ASCII.
- Document the executed manual QA steps in `fix-backlog.md` to make the plan resumable.

---

### How to Resume Mid-Plan
1. Read the top `Hotspots` section and the completed entries in `fix-backlog.md` to understand which phases are already done.
2. Update the relevant task status to `in-progress` before editing files so future sessions know where to resume.
3. Always run the manual QA checklist (once Phase A’s doc exists) plus the sanity script before marking a task `done`.
4. Keep this plan updated—add notes, caveats, or new follow-up items as discoveries are made.

Following these phases will bring the project back in line with the repo’s guardrails, materially reduce the number of tokens Codex must load for any change, and leave a clear trail for whoever picks up the next session.

