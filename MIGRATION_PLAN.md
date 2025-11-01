# WeldSecure Static Shell Migration Plan

Last updated: 2025‑11‑01  
Maintainer: Codex CLI assistant (GPT‑5)

This document captures the staged plan for migrating the legacy `Static/app.js`
monolith into feature-scoped modules without disrupting the live demo
experience. Each stage should land in a small, verifiable change set, followed
by a manual smoke test using `Static/index.html`.

## At-a-glance Progress

| Stage | Focus                                             | Status        | Notes |
| :---- | :------------------------------------------------ | :------------ | :---- |
| 0     | Baseline audit & guardrails                       | ✅ Complete   | Repo cloned locally, no tooling introduced. |
| 1     | Persistence & service extraction                  | ✅ Complete   | `Static/services/stateServices.js` delegates state mutations. |
| 2     | Bootstrapping namespace + registry scaffolding    | ✅ Complete   | `Static/main.js` + `Static/registry.js` lay groundwork for features. |
| 3     | Feature-first extractions (badges, reporter, hub) | ✅ Complete   | `Static/features/*.js` house the major persona views. |
| 4     | Settings shell module                             | ✅ Complete   | `Static/features/settings.js` owns overlay + events; registry aware. |
| 5     | Landing page & hero journeys                      | 🔜 Next       | Extract landing content + CTA wiring into a dedicated feature. |
| 6     | Customer persona pages                            | ⏳ Pending    | Break out customer/reports/redemptions flows. |
| 7     | Client persona pages                              | ⏳ Pending    | Extract client dashboards/reporting/quests/redemptions. |
| 8     | Admin & labs surfaces                             | ⏳ Pending    | Final shell cleanup; retire legacy switch from `app.js`. |
| 9     | Post-migration hardening                          | ⏳ Pending    | Final regression sweep, doc updates, remove dead globals. |

## Stage Details

### Stage 0 – Baseline audit & guardrails *(done)*
* Confirmed the demo runs by double-clicking `Static/index.html`.
* Agreed on “no build tooling, no network install” constraint.
* Established manual smoke expectations after each stage.

### Stage 1 – Persistence & service extraction *(done)*
* Introduced `Static/services/stateServices.js` as a thin façade over
  `WeldState`, migrating navigation, role selection, quest completion,
  reward redemption, and settings open/close state mutations.
* Wired `Static/app.js` to call through `WeldServices`, keeping behaviour
  identical while allowing future module consumers to reuse the helpers.

### Stage 2 – Namespace + registry scaffolding *(done)*
* Added `Static/main.js` to bootstrap `window.Weld` and perform initial autorun.
* Created `Static/registry.js` to host feature registrations while the
  legacy switch statement remains as a fallback.
* Ensured script order in `Static/index.html` supports the new globals.

### Stage 3 – Feature-first extractions *(done)*
* Spun out badges, reporter add-in, customer hub, organisation hub, and
  security dashboard flows into `Static/features/*.js`.
* Each feature exposes `render`/`attach` and registers itself under
  `window.Weld.features` for progressive adoption.

### Stage 4 – Settings shell module *(done)*
* Relocated all settings overlay rendering/binding into
  `Static/features/settings.js`.
* `initializeSettingsUI` now proxies to the feature module; `renderApp`
  checks `WeldRegistry` before executing the fallback route switch.
* Removed redundant helpers (`renderSettingsPanel`, etc.) from `app.js`.
* Manual smoke: open/close settings from multiple routes, escape key, reporter reasons add/remove/save.

---

## Upcoming Work

### Stage 5 – Landing page & hero journeys *(next)*
**Goal:** Extract landing experience into `Static/features/landing.js`
and register it in the registry, leaving `app.js` to delegate via the new
feature.

**Tasks**
1. Copy landing-specific rendering (`renderLanding`, CTA handlers, badge animation) into the new feature file.
2. Ensure the feature exports `render`, `attach`, and optional `init` hooks.
3. Register the landing route via `WeldRegistry`; update `Weld.features` if needed for backwards compatibility.
4. Update `renderApp` fallback branch to rely on the feature; remove duplicate helpers from the monolith.
5. Smoke test: landing hero cards, badge animation restart, quick actions.

### Stage 6 – Customer persona pages
**Goal:** Move customer flows (hub, badges, reports, redemptions) into
feature modules, trimming corresponding branches from the legacy switch.

**Tasks**
1. Extract `renderCustomer`, `renderCustomerBadgesPage`, `renderCustomerReportsPage`, and `renderCustomerRedemptionsPage`.
2. Port event binding (`attachCustomerEvents`, filters, redemption dialogs) into feature controllers.
3. Register routes + attach hooks in the registry with shared layout helpers.
4. Remove dead helpers from `app.js`; ensure `stateServices` covers any state mutations used by the feature.
5. Smoke test persona journeys end-to-end (report submission, filter toggles, reward redemption).

### Stage 7 – Client persona pages
**Goal:** Relocate organisation/client dashboards and related flows to
feature modules.

**Tasks**
1. Extract `renderClientDashboard`, `renderClientReporting`, `renderClientRewards`, `renderClientQuests`, etc.
2. Move associated event wiring (insights dialogs, badge showcases, quest editor) into the new modules.
3. Update registry + `renderApp` fallback logic; ensure nav interactions continue to work.
4. Smoke test client journeys, including share dialogs and state updates.

### Stage 8 – Admin & labs surfaces
**Goal:** Finalise the shell by extracting admin and labs experiences,
retiring the monolithic route switch entirely.

**Tasks**
1. Move `renderWeldAdmin`, `renderWeldLabs`, and supporting helpers.
2. Confirm any cross-feature utilities are centralised in `WeldUtil` or a dedicated services file.
3. Delete the legacy switch once every route is feature-driven.
4. Run the full Stage 3 smoke checklist again to ensure parity.

### Stage 9 – Post-migration hardening
**Goal:** Clean up leftover globals and document the new structure.

**Tasks**
1. Remove unused functions/exports from `app.js`, leaving only shared helpers.
2. Update `Static/README.md` to reflect the feature-first architecture and registry flow.
3. Perform a final manual regression across all personas, including settings persistence and `Reset demo data`.
4. Consider lightweight automated linting (optional) if the no-build constraint allows.

---

## Working Agreements

* Keep each stage incremental—avoid mixing unrelated refactors.
* After finishing a stage, manually smoke the affected routes before moving on.
* Preserve the static hosting promise: no bundlers, no external dependencies.
* Document new globals or utilities in the plan/README as they appear.
