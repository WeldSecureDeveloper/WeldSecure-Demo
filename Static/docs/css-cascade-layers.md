# CSS Cascade Layers Rollout

We are ready to adopt `@layer base, components, features`. Use the checklist below so any future Codex conversation can resume the work mid-stream.

## Phase A - Setup
- [x] Add `@layer base, components, features;` at the very top of `Static/styles.css` (before the comment/imports).
- [x] Confirm browsers under test support cascade layers (Edge/Chrome ≥ 99, Firefox ≥ 97, Safari ≥ 15.4). *Status: ✅ modern browsers only.*

## Phase B - Base Files
For each file in `styles/base/`:
1. Wrap the entire contents in `@layer base { ... }` (retain internal comments/media queries).
2. Run a quick smoke test (load landing + customer hub) and note completion.

| File | Wrapped? | Smoke Test |
|------|----------|------------|
| `base/tokens.css` | [x] | [x] |
| `base/structure.css` | [x] | [x] |
| `base/layout.css` | [x] | [x] |

## Phase C - Component Files
Repeat for every file under `styles/components/`, wrapping with `@layer components { ... }`.
After each batch (e.g., nav/header + forms + analytics), run a quick UI sweep (global nav, cards, dialogs, timeline components).

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

(If new component files appear later, add rows as needed.)

## Phase D - Feature Files
Wrap each `styles/features/<name>.css` with `@layer features { ... }`. Group work by persona so it's easy to regression test.

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

## Phase E - Legacy / Badges
- [ ] Decide whether to split `styles/badges.css` into components/features before layering. Otherwise wrap the whole file with `@layer features { ... }`.
- [ ] After wrapping, smoke-test badge gallery + badge showcase in both themes.

## Phase F - Final QA
- [ ] Run `rg "@layer" Static/styles -g "*.css"` to ensure every file has the correct wrapper (and no typos).
- [ ] Load the app, toggle between personas, and check the console for any cascade warnings.
- [ ] Update `Static/docs/styles-css-refactor-plan.md` optional follow-up to "Completed".
- [ ] Add a short note in `Static/docs/fix-log.md` summarizing the layer rollout.

Keep this checklist updated as you progress. If a future Codex session resumes the work, it can read this file, see which boxes remain unchecked, and continue without re-reading the entire history.
