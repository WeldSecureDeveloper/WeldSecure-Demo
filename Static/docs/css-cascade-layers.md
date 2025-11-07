# CSS Cascade Layers Rollout

We are ready to adopt `@layer base, components, features`. Use the checklist below so any future Codex conversation can resume the work mid-stream.

## Phase A - Setup
- [x] Add `@layer base, components, features;` at the very top of `Static/styles.css` (before the comment/imports).
- [x] Confirm browsers under test support cascade layers (Edge/Chrome ≥ 99, Firefox ≥ 97, Safari ≥ 15.4). *Status: ✅ modern browsers only.*

## Phase B – Base Files
For each file in `styles/base/`:
1. Wrap the entire contents in `@layer base { ... }` (retain internal comments/media queries).
2. Run a quick smoke test (load landing + customer hub) and note completion.

| File | Wrapped? | Smoke Test |
|------|----------|------------|
| `base/tokens.css` | [x] | [x] |
| `base/structure.css` | [x] | [x] |
| `base/layout.css` | [x] | [x] |

## Phase C – Component Files
Repeat for every file under `styles/components/`, wrapping with `@layer components { ... }`.
After each batch (e.g., nav/header + forms + analytics), run a quick UI sweep (global nav, cards, dialogs, timeline components).

| File | Wrapped? | Smoke Test Notes |
|------|----------|------------------|
| `components/chips.css` | [x] | |
| `components/cards.css` | [x] | |
| `components/tables.css` | [x] | |
| `components/nav.css` | [x] | |
| `components/header.css` | [x] | |
| `components/sections.css` | [x] | |
| `components/forms.css` | [x] | |
| `components/filters.css` | [x] | |
| `components/analytics.css` | [x] | |
| `components/icons.css` | [x] | |
| `components/dialog.css` | [x] | |
| `components/quests.css` | [x] | |

(If new component files appear later, add rows as needed.)

## Phase D – Feature Files
Wrap each `styles/features/<name>.css` with `@layer features { ... }`. Group work by persona so it’s easy to regression test.

| Feature CSS | Wrapped? | Persona Test |
|-------------|----------|--------------|
| `landing.css` | [ ] | Landing hero/cards |
| `customer.css` | [ ] | Customer hub, badges |
| `dashboard.css` | [ ] | Security dashboard |
| `reports.css` | [ ] | Reports module |
| `settings.css` | [ ] | Settings overlay |
| `hub.css` | [ ] | Quest catalogue |
| `orgHub.css` | [ ] | Org hub dashboard |
| `leaderboards.css` | [ ] | Leaderboards persona |
| `reporter.css` | [ ] | Reporter add-in |
| `labs.css` | [ ] | Labs surfaces |
| `userConfig.css` | [ ] | User config flows |
| `admin.css` | [ ] | Multi-tenant admin |
| `client.css` | [ ] | Client catalogue |

## Phase E – Legacy / Badges
- [ ] Decide whether to split `styles/badges.css` into components/features before layering. Otherwise wrap the whole file with `@layer features { ... }`.
- [ ] After wrapping, smoke-test badge gallery + badge showcase in both themes.

## Phase F – Final QA
- [ ] Run `rg "@layer" Static/styles -g "*.css"` to ensure every file has the correct wrapper (and no typos).
- [ ] Load the app, toggle between personas, and check the console for any cascade warnings.
- [ ] Update `Static/docs/styles-css-refactor-plan.md` optional follow-up to “Completed”.
- [ ] Add a short note in `Static/docs/fix-log.md` summarizing the layer rollout.

Keep this checklist updated as you progress. If a future Codex session resumes the work, it can read this file, see which boxes remain unchecked, and continue without re-reading the entire history.



