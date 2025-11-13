# Reporter Sandbox Refactor Plan (Nov 2025)

Goal: split the oversized `Static/features/reporterSandbox.js` (~1,230 lines) into modular `WeldModules` components that mirror the rest of the architecture (badge showcase, global nav, settings shell). Each track below is resumable and lists verification checkpoints.

## Status Legend
- `todo` – not started
- `in-progress` – currently being implemented
- `blocked` – awaiting prerequisite
- `done` – merged & verified

---

## Track RS1 · Layout Shell (Phase 1) (`todo`)
**Goal:** Extract a minimal layout module (render + template delegations) without moving subcomponents yet.

1. **Snapshot current layout** (todo)  
   - Capture DOM screenshot or save HTML snippet for reference.
2. **Introduce `components/reporterSandbox/layout`** (todo)  
   - Move `renderLayout`, `renderRibbon`, `renderReporterSidebar` into the module.  
   - Proxy `reporterSandboxFeature.template` to the module.  
   - _Verification:_ UI smoke focusing on layout structure (rail + message column + sidebar skeleton).
3. **Document progress** (todo)  
   - Update this plan (mark RS1 complete) before starting RS2.

---

## Track RS2 · Messages & Reading Pane (Phase 2) (`todo`)
**Goal:** Move message list + reading pane render helpers into a dedicated module.

1. **Split helpers** (todo)  
   - `components/reporterSandbox/messages` exports `{ renderMessageGroups, renderReadingPane }`.  
   - Shared utilities (`formatTime`, `formatFullDate`, `isInternalSender`, etc.) live alongside or in `utils.js`.
2. **Update layout module** (todo)  
   - Replace inline helpers with calls to the new module.
3. **Verification** (todo)  
   - Manual DOM diff (message list, reading pane) + smoke (select message, ensure preview updates).  
   - Update plan status.

---

## Track RS3 · Add-in Shell (Phase 3) (`todo`)
**Goal:** Modularize add-in shell logic (height clamp, visibility toggles, reporter dock).

1. **Create module** (todo)  
   - `components/reporterSandbox/addinShell` exports `{ applyAddinVisibility, mountReporterDock }`.
2. **Wire attach logic** (todo)  
   - Replace inline functions with module calls; keep callbacks for persistence + guided-tour toggle.
3. **Verification** (todo)  
   - Toggle add-in button + report action to ensure add-in opens/closes; confirm guided tour disabled on first open.

---

## Track RS4 · User Picker (Phase 4) (`todo`)
**Goal:** Extract user picker rendering + events.

1. **Module** (todo)  
   - `components/reporterSandbox/userPicker` exports `{ renderUserPicker, attachUserPicker }`.
2. **Integrate** (todo)  
   - Layout uses the render helper; attach delegates open/close/filter logic.
3. **Verification** (todo)  
   - Filter + select a user; ensure state updates and picker closes.  
   - Update plan status.

---

## Track RS5 · Settings Drawer (Phase 5) (`todo`)
**Goal:** Modularize the inbox settings drawer.

1. **Module** (todo)  
   - `components/reporterSandbox/settingsDrawer` exports `{ renderSettingsDrawer, attachSettingsDrawer }`.
2. **Integration** (todo)  
   - Layout renders via module; attach wires open/close + checkbox events.
3. **Verification** (todo)  
   - Open drawer, toggle prefs, confirm `setSandboxLayoutPreference` fires.

---

## Track RS6 · Orchestrator Cleanup & Final QA (`todo`)
**Goal:** Simplify the reporter sandbox feature file once modules exist.

1. **Refactor template/attach** (todo)  
   - `template` delegates to layout module.  
   - `attach` orchestrates the various modules + remaining event wiring.  
   - Remove obsolete helpers.

2. **Full regression smoke** (todo)  
   - Message selection, add-in actions, user picker, settings drawer, guided tour toggles.  
   - Fix backlog + this plan updated to mark RS6 complete.

---

## Execution Notes
- Keep modules dependency-free (no direct DOM queries outside their container scope).  
- Follow existing lazy-load pattern (`modules.use(...)`) in the feature file to avoid loading overhead when reporter sandbox isn’t active.  
- After each track, record verification and status updates so Codex (or another contributor) can resume from any point.
