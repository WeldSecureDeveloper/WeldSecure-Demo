# Styles.css Refactor Plan

Goal: split the monolithic `Static/styles.css` (~7k lines) into focused, maintainable CSS files without introducing new tooling or dependencies.

## Phase 0 - Prep & Safety
- [ ] Snapshot current behaviour (load the app, capture a quick video/screenshot of key views).
- [x] Confirm `Static/index.html` still references only `./styles.css` (baseline before edits).
- [ ] Create a temporary working branch or note the start of this work in your VCS history.

## Phase 1 - Directory Scaffolding
- [x] Under `Static/styles/`, create subfolders:
  - `base/`
  - `components/`
  - `features/`
- [x] Add placeholder files (`base/tokens.css`, `base/structure.css`, etc.) with a header comment so imports resolve before moving content.
- [x] Update `Static/styles.css` to include ordered `@import` statements for the new placeholders (keep the Google Fonts import first).
- [x] Reload locally to ensure no 404s (placeholders can be empty; layout will be blank but confirm console is clean).

## Phase 2 - Extract Global Foundations
- [x] Move design tokens (`:root` variables) and resets (`*`, `body`, `.page`, `.page__inner`, etc., currently around lines 13-160) into `styles/base/tokens.css` and `styles/base/structure.css`.
- [x] Update `Static/styles.css` imports so `tokens.css` loads before `structure.css`.
- [ ] Diff visually: verify typography, spacing, and theme colors still render.

## Phase 3 - Extract Shared Layout & Utilities
- [x] Relocate grid/flex helpers, page wrappers, and layout utilities into `styles/base/layout.css`.
- [x] Keep related media queries bundled with their selectors to preserve responsive behaviour.
- [x] Sanity check in the browser: resize viewport; ensure layouts still respond correctly.

## Phase 4 - Extract Reusable Components
- [x] Identify reusable blocks (chips, cards, tables, nav, forms) and create files under `styles/components/` (e.g., `chips.css`, `cards.css`, `tables.css`, `nav.css`, `forms.css`).
- [x] Cut/paste each block from `styles.css` into its component file, keeping import order consistent with dependency needs (base -> components -> features).
- [ ] After each extraction, reload and perform a quick UI sweep on sections using that component.

## Phase 5 - Extract Feature-Specific Styling
- [x] For each feature module that has CSS (landing, customer hub, dashboards, reports, settings, etc.), create `styles/features/<name>.css`.
- [x] Move the corresponding block from `styles.css` (use class prefixes like `.landing__`, `.customer-`, `.client-`, etc. for grouping).
- [ ] Once a feature block is moved, test that screen manually (navigate via app routes or adjust route state).
- [x] Repeat until no feature-specific rules remain in the root file.

## Phase 6 - Badges & Remaining Special Cases
- [x] Leave the existing `styles/badges.css` in place; just make sure its import remains in the correct spot relative to the new files.
- [x] Find any remaining selectors in `styles.css` (run `rg "." Static/styles.css`) and relocate them to the appropriate file; aim for the aggregator to be imports-only plus optional comments.

## Phase 7 - Finalise Aggregator
- [x] Ensure `Static/styles.css` contains only ordered `@import` statements and documentation comments.
- [x] Double-check for accidental duplicate imports or unused placeholder files.
- [ ] Document the final import order within a short comment block for future maintainers.

## Phase 8 - Regression & Cleanup
- [ ] Run through critical flows (landing, customer, client, admin, settings) noting any styling regressions.
- [ ] Validate dark theme (if applicable) since tokens moved first.
- [ ] Remove any temporary comments or TODO markers added during extraction.
- [ ] Update `Static/docs/fix-log.md` or relevant documentation with a summary of the refactor.
- [ ] Commit the changes when satisfied.

## Optional Follow-Ups
- [ ] Introduce CSS cascade layers (`@layer base, components, features;`) once the split stabilises.
- [ ] Consider a lightweight concatenation script (PowerShell or npm) if bundle size or request count becomes an issue.
