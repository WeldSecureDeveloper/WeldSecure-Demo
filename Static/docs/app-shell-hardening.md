# App Shell Hardening Plan

## Background
Stage 9 of the migration is meant to finish the breakup of the legacy `app.js`
monolith. A review surfaced several remaining pressure points that inflate token
usage, increase drift risk, and keep the shell harder to reason about than it
needs to be. This plan tracks the work required to finish the hardening pass.

## Goals
- Single source of truth for navigation and state mutations (`WeldServices`).
- One bootstrap surface (`main.js`) responsible for router wiring.
- Feature-first layout: shared UI extracted into focused modules.
- Registry defined from data rather than copy/pasted route blocks.
- Feature bundles sized so that persona flows load manageable context windows.

## Progress
- ✅ WeldServices now owns navigation, quest completion, redemption, and persistence logic; application glue wraps service calls only.
- ✅ `renderApp` consumes shared shell helpers from `components/appShell.js`, and duplicate DOM/bootstrap listeners were removed from `app.js`.
- ✅ `registry.js` now iterates a data-driven route map, eliminating the manual `registerRoute` repetition.
- ⏳ Customer persona logic now lives under `Static/features/customer/modules.js`, consumed via the loader, but route-level files (hub/badges/reports/redemptions) still need breaking out for finer-grained edits.

## Workstreams

### 1. Service Delegation Cleanup
- **Consolidate fallbacks**: remove duplicated implementations of navigation,
  quest completion, reward redemption, etc. from `Static/app.js` (lines 27, 148,
  716) and require the `WeldServices` versions (`Static/services/stateServices.js`
  lines 65-242) instead.
- **Guard rails**: keep lightweight error handling/shims so direct calls warn if
  `WeldServices` is absent during future refactors.
- **Outcome**: `app.js` retains only glue that dispatches into services and
  render helpers.

### 2. Router Bootstrap Simplification
- **Remove duplicate listeners**: drop the `DOMContentLoaded` + `hashchange`
  hooks at the bottom of `Static/app.js` (lines 3008-3063).
- **Centralise in `main.js`**: ensure `Static/main.js` (lines 1-63) exposes the
  single bootstrap entry point and handles hash routing/state sync in one place.
- **Regression checks**: confirm deep links and manual hash updates still work.

### 3. Shared UI Extraction
- **Global nav & header**: move `renderHeader`, `attachHeaderEvents`,
  `attachGlobalNav`, `initializeSettingsUI`, and badge helpers out of
  `Static/app.js` (approx. lines 229-2990) into a `Static/components/` folder.
- **Settings integration**: expose a tiny adapter that `app.js` calls so
  features/settings.js remains the owner of overlay logic.
- **Result**: `app.js` focuses on orchestrating render targets, not UI markup.

### 4. Registry Refactor
- **Route table**: define persona routes in a map (e.g. array of configs) and
  iterate to register them, replacing the copy/pasted `registerRoute` blocks in
  `Static/registry.js` (lines 1-305).
- **Shared helpers**: extract repeated `render/attach` lambdas into small utils
  (e.g. `featureTemplate("customer", "templateHub")`) to keep registry tiny.
- **Validation**: ensure new structure still loads before features register.

### 5. Feature Decomposition
- **Customer persona**: split `Static/features/customer.js` (~50 KB) into route-
  level modules (hub, badges, reports, redemptions) that export
  `template/attach` pairs, re-exported via an index for backwards compatibility.
- **Apply to other large features**: repeat pattern for any remaining multi-
  route files (client, badges, labs).
- **Token wins**: aim for <10 KB per module so AI tooling keeps tight focus.

### 6. Lightweight Module Loader
- **Design scope**: implement a minimal registry that exposes `define(name,
  factory)` / `use(name)` helpers, keeping modules out of the `window`
  namespace while respecting the no-build constraint.
- **Migration steps**: start with shared components extracted in Workstream 3,
  then progressively wrap features as they are decomposed.
- **Fallbacks**: keep a direct global export for critical entry points until the
  loader is proven across routes.
- **Benefits**: reduces global collisions, enables deferred initialisation, and
  makes future testing hooks cleaner.

## Open Questions
- Do we still need the old fallbacks for offline demos, or can we hard-fail if
  `WeldServices` is unavailable?
- No additional open questions at this time.

## Execution Sequence
1. Delegate all service calls to `WeldServices` (Workstream 1).
2. Remove duplicate router wiring and rely on `main.js` (Workstream 2).
3. Extract global UI components and re-wire `app.js` (Workstream 3).
4. Refactor the registry around a data-driven route table (Workstream 4).
5. Introduce a lightweight module registry/loader to scope global exposure (new
   Workstream 6).
6. Split large feature files into scoped modules (Workstream 5).
7. Run the Stage 9 regression sweep (`Static/docs/regression-checklist.md`).

## Validation & Sign-off
- Manual deep-link testing of representative routes (reporter, customer hub,
  client reporting, admin dashboards).
- Confirm hash navigation, state persistence, and settings overlay behaviour.
- Spot-check token counts (or file sizes) before/after to verify reduction.
- Update `Static/README.md` and `MIGRATION_PLAN.md` with final architecture
  notes once complete.
