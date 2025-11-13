# WeldSecure Remediation Plan (Nov 2025)

Roadmap for clearing the findings from the recent review. Each track is resumable, includes verification hooks, and ties back to the repo guardrails.

## Status Legend
- `todo` - not started
- `in-progress` - currently being implemented
- `blocked` - awaiting prerequisite
- `done` - merged & verified

## Track A - Reset Flow Covers Every Mutable Slice (`done`)
Goal: ensure "Reset demo data" restores every mutable slice (reporter sandbox, phishing designer, future modules).

1. **Audit default payloads** (done)  
   - Compared `WeldState.initialState()` slices with `WeldServices.resetDemo` clones to capture missing keys.  
   - Verification: checklist against `Object.keys(defaultState)`.
2. **Patch `resetDemo`** (done)  
   - Clone every slice via `Object.keys(defaultState)` using `WeldUtil.clone`.  
   - Verification: manual reset + `localStorage[STORAGE_KEY]` inspection confirmed sandbox/designer payloads reset.
3. **Doc update** (done)  
   - Logged completion here and in `Static/docs/fix-backlog.md`.

## Track B - Service-Only State Mutations (`done`)
Goal: features call `WeldServices` helpers instead of mutating `state.meta.*` directly.

1. **Inventory direct mutations** (done)  
   - Touched `features/client.js`, `features/customer/hub.js`, `features/customer/badges.js`, `features/settings.js`.
2. **Add service helpers** (done)  
   - Added `setRewardFilter`, `setRewardStatusFilter`, `setCustomerRecognitionFilter`, `setCustomerReportFilter`, `setCustomerBadgeAvailabilityFilter`, `setSettingsCategory`.  
   - Each helper normalizes input, persists, and re-renders.
3. **Refactor features** (done)  
   - Client catalogue, customer hub, badges, and settings now delegate to the helpers (with fallbacks if services are unavailable).  
   - Verification: manual smoke across those surfaces + console check for warnings.
4. **Docs** (done)  
   - Added a guardrail reminder in `Static/docs/architecture-overview.md` and recorded the fix in the backlog.

## Track C - Decouple Services From `app.js` Helpers (`done`)
Goal: `services/stateServices.js` resolves quests/rewards from the provided state without `app.js` globals.

1. **Extract lookup utilities** (done)  
   - Added `findQuestById` / `findRewardById` inside the service file.  
   - Verification: console calls with detached state objects.
2. **Update `completeQuest` & `redeemReward`** (done)  
   - Swapped `window.questById` / `window.rewardById` for the new helpers.  
   - Verification: quest completion + reward redemption flows exercised via UI smoke.
3. **Documentation** (done)  
   - Captured the decoupling in `Static/docs/fix-backlog.md`.

## Track D - Documentation Encoding Cleanup (`done`)
Goal: remove mojibake/control characters from `Static/README.md` and `Static/docs/architecture-overview.md` to keep prompts token-efficient.

1. **Identify corrupted segments** (done)  
   - README and architecture overview showed mojibake around the guardrail sections.
2. **Normalize files** (done)  
   - README and architecture overview re-saved as UTF-8 ASCII with control characters removed.  
   - Verification: `python ascii-check.py`-style check confirms no characters above 0x7F remain.
3. **Log the fix** (done)  
   - Added an entry to `Static/docs/fix-backlog.md`.

## Track E - Split `components/appShell.js` (`todo`)
Goal: keep shared shell logic under ~500 lines by extracting nav, badge showcase, and dialog/theme wiring into dedicated modules.

1. **Scoping workshop** (done)  
   - Badge showcase extracted into `components/badgeShowcase.js`; nav/settings splits still pending.
2. **Introduce submodules via `WeldModules`** (done)  
   - Badge showcase, global nav, and settings shell now live in dedicated modules; remaining shell hooks verified.
3. **Update shell invocations** (done)  
   - `app.js` now proxies to the badge/nav/settings modules and the browser smoke succeeds (logo → landing, reset/theme/guided toggles, settings drawer).
4. **Docs & backlog** (done)  
   - Logged the split in `Static/docs/fix-backlog.md`; plan complete.

---

Keep this plan close when making changes. After each track, record the verification you ran so future contributors can resume safely.
