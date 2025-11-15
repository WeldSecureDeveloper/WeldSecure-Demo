# Phase C – Badge & Quest Metadata Split

_Status: draft (2025-11-15). Applies to `Static/data/catalog/*`, `Static/data/quests/*`, `app.js`, `features/customer/*`._

## Goals

1. **Reduce prompt/token weight** – keep badge/quest metadata (tones, icon paths, difficulty ladders) in bite-sized modules so Codex never has to load a 600+ line file just to tweak colours or difficulty ordering.
2. **Single source of truth** – stop duplicating `BADGE_TONES`, `SETTINGS_CATEGORIES`, and `DEFAULT_REPORTER_*` across `data/catalog/badges.js`, `data/quests/meta.js`, and `data/app/__legacy__.js`.
3. **Safer feature development** – expose metadata through `WeldModules` so features can opt-in to the lighter APIs (e.g., customer hub only imports the tones it needs).

## Current Gaps

| File | Issue | Impact |
| --- | --- | --- |
| `data/catalog/badges.js` | Contains icon paths, badge tones, point-card SVGs, AND the entire badge catalogue. | Every badge tweak reloads a 600+ line blob; risk of drift with future modules. |
| `data/quests/meta.js` | Re-defines badge categories, drafts, settings categories, and reporter defaults even though those now live elsewhere. | Duplicated strings, risk of mismatched defaults, recurring merge conflicts. |
| `app.js` / `features/customer/hub.js` | Read all badge metadata via the global `AppData`, preventing lazy imports. | No way to memoize or tree-shake smaller slices. |

## Work Plan (Resumable)

1. **C.2.1 – Module Carve-out (current step)**  
   - Create `data/catalog/badgeMeta.js` for tones, icon paths, badge tiers, drafts, customer unlock history, and point-card SVG templates.  
   - Trim `data/catalog/badges.js` to only the catalogue array.  
   - Keep `data/quests/meta.js` focused on quest difficulty ordering (but still re-export badge metadata for backwards compatibility).  
   - Update `index.html` load order so `badgeMeta.js` executes before consumers.  
   - Smoke test `WeldState.initialState()` and the customer hub badge grid.

2. **C.2.2 – Consumer Updates**  
   - Update `app.js`, `features/customer/*`, and `components/globalNav.js` to pull tones/category order via `WeldModules.use("data/catalog/badgeMeta")` (with AppData fallbacks).  
   - Update runtime modules (achievements, badge showcase) to use the module as well.  
   - Remove badge-specific exports from `data/quests/meta.js`.

3. **C.2.3 – Quest-only Metadata**  
   - Move `QUEST_DIFFICULTY_ORDER`, quest filters, and engagement presets into a slim `data/quests/config.js`.  
   - Ensure `data/quests/meta.js` becomes a compatibility façade pointing to the new file, allowing eventual removal.

4. **C.2.4 – Cleanup & Validation**  
   - Delete the redundant badge metadata from `data/app/__legacy__.js`.  
   - Extend the upcoming data validation script to assert that badge IDs, tone keys, and icon references are consistent across the new modules.  
   - Log manual QA (customer hub badges, quest filters, badge toast) in `docs/fix-backlog.md`.

## QA Checklist per Sub-step

- `node Static/tools/state-vm-smoke.js`
- Customer hub → Badges tab (tones + icon shapes)
- Customer hub → Quests tab (difficulty filter + ordering)
- Badge toast (report message or manual trigger) to ensure tone gradients remain intact
- Reporter sandbox badge panel (point-card SVGs still render)

Keep this page updated as we progress so future sessions can resume immediately.
