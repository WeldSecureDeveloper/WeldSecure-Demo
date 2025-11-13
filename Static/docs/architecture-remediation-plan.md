# WeldSecure Remediation Plan (Nov 2025)

Roadmap for resolving the issues surfaced in the latest code review. Each track is resumable, lists ownership placeholders, and highlights verification gates so we can pause or hand off without losing context.

## Status Legend
- `todo` – not started
- `in-progress` – currently being implemented
- `blocked` – awaiting prerequisite
- `done` – merged & verified

## Track A · Reset Flow Covers Every Mutable Slice (`todo`)
**Goal:** “Reset demo data” must restore every mutable slice (reporter sandbox, phishing designer, future modules) in line with `Static/docs/architecture-overview.md §3`.

1. **Audit default payloads**  
   - Compare `WeldState.initialState()` slices with `WeldServices.resetDemo` clones.  
   - Capture any missing keys (currently `reporterSandbox`, `phishingDesigner`).  
   - _Verification:_ checklist of slices; confirm with `console.table(Object.keys(defaultState))`.

2. **Patch `resetDemo`**  
   - Clone every slice, including future-proof guard (`Object.keys(defaultState)` loop or explicit additions).  
   - Keep operation token-light by reusing the existing `WeldUtil.clone`.  
   - _Verification:_ Run “Reset demo data” in the UI and inspect `localStorage[STORAGE_KEY]` for stale values.

3. **Doc update**  
   - Add note in this plan (Track A status) and, once complete, record in `Static/docs/fix-backlog.md` “Recently Fixed”.  
   - _Exit criteria:_ All slices reset + manual QA sign-off.

## Track B · Service-Only State Mutations (`todo`)
**Goal:** Features stop mutating `state.meta.*` (filters, settings, toggles) and instead call focused `WeldServices` helpers, preserving the architecture contract.

1. **Inventory direct mutations**  
   - Files: `features/client.js`, `features/customer/hub.js`, `features/customer/badges.js`, `features/settings.js`, plus any `rg "state.meta"` hits.  
   - Document each field + expected behavior in this plan for traceability.

2. **Add service helpers**  
   - Examples: `setRewardFilter`, `setRewardStatusFilter`, `setCustomerRecognitionFilter`, `setCustomerReportFilter`, `toggleSettings`, etc.  
   - Each helper: normalize input, mutate state, persist, render.

3. **Refactor features**  
   - Replace direct assignments with calls to the new helpers; remove redundant `persist()` / `renderApp()` calls.  
   - _Verification:_ Manual smoke on affected UIs (client catalogue filters, customer hub filters, settings drawer) + console check that no warnings fire.

4. **Docs**  
   - Update `Static/docs/architecture-overview.md §3` with a reminder that all state changes must route through `WeldServices`.  
   - Note completion in fix log.

## Track C · Decouple Services From `app.js` Helpers (`todo`)
**Goal:** `services/stateServices.js` should resolve quests/rewards directly from the provided state, enabling reuse without loading `app.js`.

1. **Extract lookup utilities**  
   - Implement lightweight `findRewardById(state, id)` / `findQuestById(state, id)` inside the service file (or import from a neutral helper).  
   - Ensure they operate purely on the supplied state.

2. **Update `completeQuest` & `redeemReward`**  
   - Replace `window.questById` / `window.rewardById` calls with the internal helpers.  
   - _Verification:_ Unit-style smoke by calling the services in a detached console (no `app.js`) + run the UI flows (quest completion, reward redemption).

3. **Documentation**  
   - Mention in this plan + fix log once merged.

## Track D · Documentation Encoding Cleanup (`todo`)
**Goal:** Remove mojibake/control characters from `Static/README.md` and `Static/docs/architecture-overview.md` to keep prompts token-efficient.

1. **Identify corrupted segments**  
   - Already observed around lines 22, 49-50, 60, 105, 137 (control characters in “app.js”, “features”, “fonts -> base”).  
   - Expand search via `rg "[\u0000-\u001f]"`.

2. **Normalize files**  
   - Re-type affected words in ASCII; ensure files saved as UTF-8 without BOM.  
   - _Verification:_ Re-run the control-character search (should return zero matches).

3. **Log the fix**  
   - Update fix backlog entry summarizing the clean-up for historical context.

## Track E · Split `components/appShell.js` (`todo`)
**Goal:** Bring the module under the ~500 line guideline and improve token targeting while retaining dependency-free execution.

1. **Scoping workshop**  
   - Identify logical seams (navigation render, badge showcase, theme + dialog wiring).  
   - Decide on new module names (e.g., `components/nav.js`, `components/badgeShowcase.js`).

2. **Introduce submodules via `WeldModules`**  
   - Move self-contained concerns into new files registered with `WeldModules`.  
   - Keep `components/appShell.js` as a thin orchestrator that composes the submodules.

3. **Update shell invocations**  
   - Ensure `app.js` `invokeShell` calls still resolve (may need to re-export functions).  
   - _Verification:_ `ls` module list via `WeldModules.entries()` + smoke-test nav/badge behaviors in both themes.

4. **Docs & backlog**  
   - Record the decomposition here and in the fix backlog once completed, noting any follow-up debt.

---

## Execution & Tracking
- Maintain this plan alongside implementation; update each track’s status (`todo` → `in-progress` → `done`) as work lands.
- After each track, add a verification note summarizing the tests performed.
- Keep PR descriptions concise by linking back to the relevant track/step identifiers (e.g., “Track B.2 – add `setRewardFilter` service”).
