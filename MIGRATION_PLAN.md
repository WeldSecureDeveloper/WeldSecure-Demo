# WeldSecure Static Shell Migration Plan

Last updated: 2025-11-01  
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
| 6     | Customer persona pages                            | Pending | Next: split customer hub, reports, badges, and redemptions into features.                            |
| 7     | Client persona pages                              | Pending | Pending extraction of client dashboards, quests, and rewards.                                       |
| 8     | Admin & labs surfaces                             | Pending | Pending migration of admin/labs routes and removal of the final switch fallback.                    |
| 9     | Post-migration hardening                          | Pending | Final regression sweep, doc tidy-up, and removal of obsolete globals.                               |

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

### Stage 6 - Customer persona pages
**Goal:** Move customer hub, badges, reports, and redemptions into feature modules, trimming the switch.

**Tasks**
1. Extract `renderCustomer`, `renderCustomerBadgesPage`, `renderCustomerReportsPage`, and `renderCustomerRedemptionsPage`.
2. Move supporting event handlers (`attachCustomerEvents`, filters, redemption dialogs) into the feature.
3. ✅ Registered the customer routes via `WeldRegistry` and added `Static/features/customer.js` as temporary delegates.
4. Remove duplicated helpers from `app.js`; confirm `WeldServices` exposes any needed state mutations.
5. Smoke test the entire customer persona journey (report submission, filters, redemptions, bonus meters).

### Stage 7 - Client persona pages
**Goal:** Relocate client dashboards, reporting, quests, and rewards into feature modules.

**Tasks**
1. Extract client renderers (`renderClientDashboard`, `renderClientReporting`, `renderClientRewards`, `renderClientQuests`, etc.).
2. Port dialog/insight handlers and badge showcases into feature-level attach hooks.
3. Register client routes in the registry and remove the corresponding blocks from the switch.
4. Smoke test the client experiences: insights dialogs, badge toggles, quest management, rewards catalogue.

### Stage 8 - Admin & labs surfaces
**Goal:** Extract admin and labs flows, then delete the legacy switch entirely.

**Tasks**
1. Move `renderWeldAdmin`, `renderWeldLabs`, and their event bindings into dedicated features.
2. Register the remaining routes; ensure cross-cutting helpers live in utilities/services.
3. Remove the final fallback switch from `app.js`, leaving registry-driven rendering only.
4. Re-run the Stage 3 smoke checklist to confirm parity.

### Stage 9 - Post-migration hardening
**Goal:** Clean up leftovers and document the final architecture.

**Tasks**
1. Remove unused globals and helpers from `app.js` after the final extractions.
2. Refresh `Static/README.md` to reflect the feature-first, registry-driven design.
3. Perform a full manual regression across all personas, including settings persistence and "Reset demo data".
4. Optionally consider lightweight linting or formatting if it can run without build tooling.

---

## Working Agreements

* Keep stages incremental; avoid mixing unrelated refactors in a single step.
* Smoke-test the affected routes in a browser before proceeding to the next stage.
* Preserve the zero-build pipeline: no bundlers, no package installs, no network dependencies.
* Document new globals or helpers here (or in the README) as they appear.


