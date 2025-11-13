# Reporter Sandbox Refactor Plan (Nov 2025)

Goal: split the oversized `Static/features/reporterSandbox.js` (~1,230 lines) into modular `WeldModules` components that mirror the rest of the architecture (badge showcase, global nav, settings shell). Each track below is resumable and lists verification checkpoints.

## Status Legend
- `todo` – not started
- `in-progress` – currently being implemented
- `blocked` – awaiting prerequisite
- `done` – merged & verified

---

## Track RS1 · Layout Renderer Extraction (`todo`)
**Scope:** Move `renderLayout` plus the Outlook-style HTML scaffolding into `components/reporterSandbox/layout.js`.

1. **Isolate pure render helpers**  
   - Functions: `renderLayout`, `renderRibbon`, `renderMessageColumn`, `renderReporterSidebar`, `renderSettingsDrawer`, etc.  
   - Ensure each helper only consumes explicit arguments (no hidden globals).  
   - _Verification:_ unit-style call (`modules.use("components/reporterSandbox/layout").render(state)`) returns the same markup as today.

2. **Create module + wrappers**  
   - `modules.define("components/reporterSandbox/layout", () => ({ render }))`.  
   - In `reporterSandbox.js`, lazy-load via `modules.use("components/reporterSandbox/layout")` and delegate `template`.

3. **Smoke-test layout**  
   - Render reporter sandbox via UI; confirm DOM structure (message list, reading pane, add-in sidebar, settings drawer placeholder) matches pre-refactor.

---

## Track RS2 · Message + Reading Pane Module (`todo`)
**Scope:** Extract message list + reading pane renderers (`renderMessageGroups`, `renderMessagePreview`, `renderReadingPane`, etc.) into `components/reporterSandbox/messages.js`.

1. **Move render helpers**  
   - Keep shared utilities (e.g., `formatFullDate`, `formatTime`, `isInternalSender`) close to the module or into a `utils.js` if reused elsewhere.  
   - Ensure no DOM mutations; module should only return strings.

2. **Wire layout module**  
   - Update `components/reporterSandbox/layout` to call the new message module instead of local helpers.

3. **Verification**  
   - Compare message list markup (group headers, message items, avatars) before/after using snapshot or manual DOM inspection.

---

## Track RS3 · Add-in Shell & Reporter Dock (`todo`)
**Scope:** Extract `clampAddinShellHeight`, `applyAddinVisibility`, `mountReporterDock`, guided-tour suppression, and add-in command button wiring into `components/reporterSandbox/addinShell.js`.

1. **Module API**  
   - Export `{ applyAddinVisibility(container, sandboxState, options), mountReporterDock(container, sandboxState, state) }`.  
   - Keep stateful concerns (addinVisible flag, height clamp) encapsulated; expose callbacks for `persistLayoutPreference`.

2. **Integrate with attach()**  
   - `reporterSandboxFeature.attach` imports the module once and delegates add-in toggles to it.

3. **Verification**  
   - Toggle the add-in command button and confirm:  
     - Sidebar visibility toggles  
     - Guided tour turns off when add-in appears  
     - Add-in shell height constraints remain intact.

---

## Track RS4 · User Picker Module (`todo`)
**Scope:** Move `renderUserPicker`, `openUserPicker`, `closeUserPicker`, `toggleUserPickerEmptyState`, and related event binding into `components/reporterSandbox/userPicker.js`.

1. **Module responsibilities**  
   - Rendering the picker markup  
   - Handling filter input, empty state, and click-to-select logic (calling `WeldServices.setSandboxUser`).  
   - Provide hooks: `renderUserPicker(state)`, `attachUserPicker(container, state)`.

2. **Layout integration**  
   - Layout render inserts the markup; attach phase calls the module to wire events.

3. **Verification**  
   - Open picker, filter users, select a persona → ensure state updates and picker closes just like today.

---

## Track RS5 · Settings Drawer Module (`todo`)
**Scope:** Extract settings drawer rendering + preference binding into `components/reporterSandbox/settingsDrawer.js`.

1. **Module API**  
   - `renderSettingsDrawer(sandboxState)` returning markup.  
   - `attachSettingsDrawer(container, state)` to wire `data-layout-pref` checkboxes and overlay close events.

2. **Hook up layout/attach**  
   - Layout module calls `renderSettingsDrawer`.  
   - `reporterSandboxFeature.attach` delegates wiring to the module.

3. **Verification**  
   - Open drawer, toggle layout preferences (compact view, snippets, highlighting), confirm `WeldServices.setSandboxLayoutPreference` fires.

---

## Track RS6 · Reporter Sandbox Core Orchestrator (`todo`)
**Scope:** Simplify `Static/features/reporterSandbox.js` after modules exist.

1. **Refactor template/attach**  
   - `template(state)` → `layoutModule.render(state)`.  
   - `attach(container, state)` → orchestrates add-in shell, picker, settings drawer, message selection events.  
   - Remove redundant helpers now hosted in modules.

2. **Documentation**  
   - Update `Static/docs/architecture-remediation-plan.md` (new sandbox track entry) + `Static/docs/fix-backlog.md` once tracks RS1–RS5 land.  
   - Note any residual debt (e.g., reporter-specific utils) for future work.

3. **Full smoke**  
   - Run through entire reporter sandbox flow: message list interactions, add-in, user picker, settings drawer, guided tour toggles.  
   - Capture any regressions before closing the track.

---

## Execution Notes
- Keep modules dependency-free (no direct DOM queries outside their container scope).  
- Follow existing lazy-load pattern (`modules.use(...)`) in the feature file to avoid loading overhead when reporter sandbox isn’t active.  
- After each track, record verification and status updates so Codex (or another contributor) can resume from any point.
