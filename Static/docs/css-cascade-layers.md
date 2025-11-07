# CSS Cascade Layers Rollout

We are adopting `@layer base, components, features` so the cascade order is explicit even as we reorganise files. This checklist keeps the effort resumable for future Codex sessions.

## Phase A - Setup
- [x] Add `@layer base, components, features;` at the top of `Static/styles.css` (before the import comment).
- [x] Confirm browser support (Edge/Chrome ≥ 99, Firefox ≥ 97, Safari ≥ 15.4). *Status: ✅ modern browsers only.*

## Phase B - Base Files
Wrap every file in `styles/base/` with `@layer base { ... }`, then sanity check landing + customer flows.

| File | Wrapped? | Smoke Test |
|------|----------|------------|
| `base/tokens.css` | [x] | [x] |
| `base/structure.css` | [x] | [x] |
| `base/layout.css` | [x] | [x] |

## Phase C - Component Files
All component styles now live inside `@layer components { ... }`. Notes capture the smoke test scope.

| File | Wrapped? | Smoke Test Notes |
|------|----------|------------------|
| `components/chips.css` | [x] | ✅ nav/badge chips OK |
| `components/cards.css` | [x] | ✅ cards OK |
| `components/tables.css` | [x] | ✅ tables OK |
| `components/nav.css` | [x] | ✅ global nav OK |
| `components/header.css` | [x] | ✅ header OK |
| `components/sections.css` | [x] | ✅ section headers OK |
| `components/forms.css` | [x] | ✅ forms OK |
| `components/filters.css` | [x] | ✅ filters OK |
| `components/analytics.css` | [x] | ✅ timeline/bar chart OK |
| `components/icons.css` | [x] | ✅ icons OK |
| `components/dialog.css` | [x] | ✅ dialogs OK |
| `components/quests.css` | [x] | ✅ quest cards OK |

## Phase D - Feature Files
Every feature stylesheet is now wrapped with `@layer features { ... }`. Persona tests describe the area to smoke when changes land.

| Feature CSS | Wrapped? | Persona Test |
|-------------|----------|--------------|
| `landing.css` | [x] | Landing hero/cards |
| `customer.css` | [x] | Customer hub, badges |
| `dashboard.css` | [x] | Security dashboard |
| `reports.css` | [x] | Reports module |
| `settings.css` | [x] | Settings overlay |
| `hub.css` | [x] | Quest catalogue |
| `orgHub.css` | [x] | Org hub dashboard |
| `leaderboards.css` | [x] | Leaderboards persona |
| `reporter.css` | [x] | Reporter add-in |
| `labs.css` | [x] | Labs surfaces |
| `userConfig.css` | [x] | User config flows |
| `admin.css` | [x] | Multi-tenant admin |
| `client.css` | [x] | Client catalogue |

## Phase E - Legacy / Badges (Next Up)
- [x] Split `styles/badges.css` into component + feature files. *Done: `styles/components/badges/{tokens,cards,spotlight,grids}.css` + `styles/features/badges.css`.*
- [x] After the badges layer is applied, re-test badge gallery + badge showcase in both themes. *Manual check 2025-11-07 after spacing + popover fixes; both light/dark catalogue views verified.*

**Split plan (recommended)**
- [x] Extract reusable badge pieces (tokens, cards, spotlights, grids) into `styles/components/badges/*.css` with `@layer components { ... }`.
- [x] Create `styles/features/badges.css` for the gallery/showcase layouts under `@layer features { ... }`.
- [x] Update `Static/styles.css` imports accordingly; remove the old `styles/badges.css` import once empty.
- [x] After each extraction, smoke-test customer hub badges and the badge gallery (light + dark). *Latest pass covered 5-column layout + right-edge popover flip.*
- [x] Delete the legacy `styles/badges.css` once replaced.

## Phase F - Final QA
- [x] Run `rg "@layer" Static/styles -g "*.css"` to verify every file is layered and there are no typos. *Pass: all base/components/features files returned an `@layer` block.*
- [ ] Load all personas (landing, customer, client, admin, badges, reporter) and watch for console warnings.
- [ ] Update `Static/docs/styles-css-refactor-plan.md` optional follow-up to "Completed".
- [ ] Add an entry to `Static/docs/fix-log.md` describing the cascade-layer rollout.

Keep this document updated as you progress. If a future Codex session picks up the work, it can read this checklist and resume from the remaining unchecked boxes without replaying history.
