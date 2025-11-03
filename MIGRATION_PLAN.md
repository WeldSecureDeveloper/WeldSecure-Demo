# WeldSecure Static Shell Migration Plan

Last updated: 2025-11-02  
Maintainer: Codex CLI assistant (GPT-5)

This plan tracks the staged extraction of the legacy `Static/app.js`
monolith into feature-scoped modules while keeping the demo runnable by
double-clicking `Static/index.html`. After each stage, run a quick manual
smoke test in the browser to confirm parity.

## At-a-glance Progress

| Stage | Focus                                             | Status | Notes                                                                                                 |
| :---- | :------------------------------------------------ | :----- | :---------------------------------------------------------------------------------------------------- |
| 0     | Baseline audit & guardrails                       | Done   | Repo verified locally; no build tooling or network installs introduced.                              |
| 1     | Persistence & service extraction                  | Done   | `Static/services/stateServices.js` now handles state mutations consumed by the monolith.             |
| 2     | Namespace + registry scaffolding                  | Done   | `Static/main.js` bootstraps `window.Weld`; `Static/registry.js` collects route registrations.        |
| 3     | Feature-first extractions (badges, reporter, hub) | Done   | Major persona views live in `Static/features/*.js`, registered on `window.Weld.features`.            |
| 4     | Settings shell module                             | Done   | Settings overlay owns its markup/events in `Static/features/settings.js`; registry handles routing.  |
| 5     | Landing page & hero journeys                      | Done   | `Static/features/landing.js` + registry route replace the legacy branch in `app.js`.                 |
| 6     | Customer persona pages                            | Done   | Customer journeys extracted into `Static/features/customer.js`; parity verified via smoke tests.    |
| 7     | Client persona pages                              | Done   | Client dashboards/quests/rewards now feature-driven; smoke pass captured post-extraction.           |
| 8     | Admin & labs surfaces                             | Done   | Admin/labs routes run through new features; Stage 3 smoke checklist re-run with no regressions.     |
| 9     | Post-migration hardening                          | In progress | Loader in place, customer persona awaiting module split, regression sweep still pending.           |

## Stage Details

### Stage 0 - Baseline audit & guardrails *(done)*
* Confirmed the demo runs by opening `Static/index.html`.
* Locked in the "no build tooling, no package installs" constraint.
* Agreed to smoke-test affected routes after each stage.

### Stage 1 - Persistence & service extraction *(done)*
* Created `Static/services/stateServices.js` as a facade over `WeldState`.
* Shifted navigation, role selection, quest completion, redemption, and settings toggles to service calls.
* Monolith now delegates through `window.WeldServices`, preserving current behaviour.

### Stage 2 - Namespace + registry scaffolding *(done)*
* Added `Static/main.js` to initialise `window.Weld`, restore persisted state, and trigger `renderApp`.
* Introduced `Static/registry.js` so routes can self-register before we eliminate the legacy switch.
* Confirmed script order in `Static/index.html` supports the new globals.

### Stage 3 - Feature-first extractions *(done)*
* Moved reporter, badges, hub, org hub, and dashboard surfaces into `Static/features/*.js`.
* Each feature exposes `render`/`attach` hooks and registers under `window.Weld.features`.
* Legacy routes call into these modules without changing the user experience.

### Stage 4 - Settings shell module *(done)*
* Ported the settings overlay markup, state sync, and event handling into `Static/features/settings.js`.
* `initializeSettingsUI` now simply delegates to the feature.
* `renderApp` checks the registry before the switch, so new routes can short-circuit the legacy logic.

### Stage 5 - Landing page & hero journeys *(done)*
* Extracted `renderLanding` and the CTA/event bindings into `Static/features/landing.js`.
* Registered the landing route in `Static/registry.js` with the correct page/inner classes.
* Added the new feature script to `Static/index.html` and deleted the landing branch/helpers from `app.js`.
* **Manual smoke to run:** load the landing page, trigger badge animation replay, and test each CTA (role-based and neutral).

---

## Upcoming Work

### Stage 6 - Customer persona pages *(done)*
**Goal:** Move customer hub, badges, reports, and redemptions into feature modules, trimming the switch.

**Tasks**
- [x] Extract `renderCustomer`, `renderCustomerBadgesPage`, `renderCustomerReportsPage`, and `renderCustomerRedemptionsPage`.
- [x] Move supporting event handlers (`attachCustomerEvents`, filters, redemption dialogs) into the feature.
- [x] Register the customer routes via `WeldRegistry` and add `Static/features/customer.js`.
- [x] Remove duplicated helpers from `app.js`; confirm `WeldServices` exposes any needed state mutations.
- [x] Smoke test the entire customer persona journey (report submission, filters, redemptions, bonus meters).
### Stage 7 - Client persona pages *(done)*
**Goal:** Relocate client dashboards, reporting, quests, and rewards into feature modules.

**Tasks**
- [x] Route `client-dashboard`, `client-reporting`, and `client-quests` through `WeldRegistry` with existing feature renderers.
- [x] Extract the rewards catalogue (`renderClientRewards` + publish filters) into `Static/features/client.js`.
- [x] Remove legacy client branches/attach hooks from `app.js` and wire the new feature via `Static/registry.js`.
- [x] Smoke test the client journeys (dashboard, reporting, quest publishing, rewards filters/publish toggles).
### Stage 8 - Admin & labs surfaces *(done)*
**Goal:** Extract admin and labs flows, then delete the legacy switch entirely.

**Tasks**
- [x] Move `renderWeldAdmin`, `renderWeldLabs`, and their event bindings into dedicated features.
- [x] Register the remaining routes; ensure cross-cutting helpers live in utilities/services.
- [x] Remove the final fallback switch from `app.js`, leaving registry-driven rendering only.
- [x] Re-run the Stage 3 smoke checklist to confirm parity.

### Stage 9 - Post-migration hardening *(in progress)*
**Goal:** Clean up leftovers and document the final architecture.

**Tasks**
- [x] Remove unused globals and helpers from `app.js` after the final extractions.
- [x] Refresh `Static/README.md` to reflect the feature-first, registry-driven design.
- [ ] Perform a full manual regression across all personas (see `Static/docs/regression-checklist.md`), including settings persistence and "Reset demo data".
- [ ] Optionally consider lightweight linting or formatting if it can run without build tooling.
- [ ] Split `features/customer` into route-scoped loader modules (`hub`, `badges`, `reports`, `redemptions`) and update registry wiring.

---

## Working Agreements

* Keep stages incremental; avoid mixing unrelated refactors in a single step.
* Smoke-test the affected routes in a browser before proceeding to the next stage.
* Preserve the zero-build pipeline: no bundlers, no package installs, no network dependencies.
* Document new globals or helpers here (or in the README) as they appear.

