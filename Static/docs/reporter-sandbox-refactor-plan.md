# Reporter Sandbox Refactor Plan (Nov 2025)

Goal: split the oversized `Static/features/reporterSandbox.js` into modular `WeldModules` components that mirror the rest of the architecture (badge showcase, global nav, settings shell). Each track is resumable and includes explicit verification checkpoints.

## Status Legend
- `todo` - not started
- `in-progress` - currently being implemented
- `blocked` - awaiting prerequisite
- `done` - merged & verified

---

## Track RS1 - Layout Shell (Phase 1) (`done`)
**Goal:** Extract a minimal layout module (render + template delegations) without moving subcomponents yet.

1. **Snapshot current layout** (done)  
   - Baseline captured prior to refactor.
2. **Introduce `components/reporterSandbox/layout`** (done)  
   - Module renders via helper injection; `reporterSandboxFeature.template` now delegates through `renderReporterSandboxLayout`.
3. **Verification** (`done`)  
   - Manual smoke completed (nav -> sandbox, frame render) and no regressions observed.

---

## Track RS2 - Messages & Reading Pane (Phase 2) (`done`)
**Goal:** Move message list + reading pane render helpers into a dedicated module.

1. **Split helpers** (done)  
   - `components/reporterSandbox/messages` exports `{ renderMessageGroups, renderReadingPane }` with shared helper injection.
2. **Update layout module** (done)  
   - Feature file lazy-loads the layout + messages modules and only falls back to the legacy renderers when `WeldModules` fails, keeping the file token-light.
3. **Verification** (`done`)  
   - Manual DOM/interaction check completed: selecting messages updates preview + submission summary.

---

## Track RS3 - Add-in Shell (Phase 3) (`done`)
**Goal:** Modularize add-in shell logic (height clamp, visibility toggles, reporter dock).

1. **Create module** (done)  
   - `components/reporterSandbox/addinShell` exports `{ applyAddinVisibility, mountReporterDock }` and mirrors the lazy-load pattern.
2. **Wire attach logic** (done)  
   - Feature attach uses the module (with fallbacks) for visibility, dock mounting, and shell height resolution (legacy fallback retained for safety).
3. **Verification** (`done`)  
   - Manual smoke completed: add-in toggle, "Report" CTA, guided-tour suppression, and layout preference persistence all validated.

---

## Track RS4 - User Picker (Phase 4) (`done`)
**Goal:** Extract user picker rendering + events.

1. **Module** (done)  
   - `components/reporterSandbox/userPicker` exports `{ renderUserPicker, attachUserPicker }` with helper injection + callback wiring.
2. **Integrate** (done)  
   - Layout/feature now lazy-load the module; wrappers fall back to legacy render/attach if the loader fails, keeping the route resilient.
3. **Verification** (`done`)  
   - Manual smoke completed: filter and select user, state updates and picker closes as expected.

---

## Track RS5 - Settings Drawer (Phase 5) (`done`)
**Goal:** Modularize the inbox settings drawer.

1. **Module** (done)  
   - `components/reporterSandbox/settingsDrawer` exports `{ renderSettingsDrawer, attachSettingsDrawer }` with injected helpers + callbacks.
2. **Integration** (done)  
   - Feature/layout delegate to the module with lazy-load fallbacks; attach wiring now lives in the module and calls `setSandboxLayoutPreference` via a callback.
3. **Verification** (`done`)  
   - Manual smoke completed: open drawer, toggle prefs, confirm `setSandboxLayoutPreference` fires.

---

## Track RS6 - Orchestrator Cleanup & Final QA (`done`)
**Goal:** Simplify the reporter sandbox feature file once modules exist.

1. **Refactor template/attach** (done)  
   - Template + attach now rely solely on the component modules; legacy render/attach helpers removed in favor of concise orchestration + fallback messaging.
2. **Full regression smoke** (done)  
   - Verified sandbox nav render, message selection, add-in visibility, user picker, settings drawer, and guided-tour toggles (including default-off sandbox behavior). No regressions observed.

---

## Execution Notes
- Keep modules dependency-free and adhere to existing lazy-load guards (`modules.use(...)`) so sandbox assets only load when needed.
- After each track, record verification + status updates here so the next contributor can resume mid-plan.
- Maintain token efficiency: helpers live once, modules consume them through injection, and fallback renderers should shrink over time as confidence increases.
