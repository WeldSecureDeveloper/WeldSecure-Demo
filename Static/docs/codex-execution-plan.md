# Codex Execution Plan - App Shell Hardening Follow-up

> **Usage:** Codex updates this plan as work progresses. After completing a step, change the unchecked box `- [ ]` to `- [x]` and add brief context (e.g., PR links, commit hashes, test results). Leave pending tasks unchecked so the plan remains resumable.

## Overview

Goal: finish the modularisation work paused in Stage 9 by deleting stray monolith fallbacks, fixing documentation encoding, and establishing a minimal validation harness so AI-only iterations stay safe.

## Prerequisites

- [ ] Confirm `Static/index.html` still opens without build tooling (double-click smoke test).
- [ ] Capture current console state (no `WeldModules` errors) before modifications.

## Workstream 1 - App Shell Delegation

### 1.1 Remove Legacy Duplicates

- [x] Delete or refactor the legacy implementations of:
  - `renderBadgeSpotlight`, `setupBadgeShowcase`, `teardownBadgeShowcase`
  - `renderHeader`, `attachHeaderEvents`, `renderGlobalNav`, `attachGlobalNav`, `initializeSettingsUI`
  - _Notes_: removed the monolith versions in `Static/app.js`, reinstated shell delegates, and exported `window.getBadges` / `window.badgeById` so the module loader keeps parity. (`git diff Static/app.js`)
- [x] Ensure the module-based implementations in `Static/components/appShell.js` provide all required behaviour.
  - _Verification_: code audit confirmed the module already mirrors nav/header/reset logic; no additional stubs required after delegations.
- [ ] Re-run `Static/index.html` locally; confirm global navigation, header chip updates, settings overlay, and badge showcase still work.
  - _Blocked_: CLI environment lacks a GUI. Please reopen the static shell in a browser and report console output for continuity.

**Validation:** Document verification steps in the plan entry (e.g., manual nav smoke on landing -> client dashboard, screenshot optional).

### 1.2 Harden Service Calls

- [x] Inspect `Static/app.js` for any direct state mutations/bypass of `WeldServices`. Replace with service calls where feasible.
  - _Outcome_: no remaining nav/state routing outside `WeldServices`; recorded follow-up to migrate reporter mutations later.
- [x] Add guard rails or TODO comments if a legacy mutation cannot yet move.
  - _Notes_: module wiring now surfaces helpers via `window.*`; captured remaining service migration as a follow-up in this plan.
- [ ] Manually test persona routes touched during refactor; note any regressions observed/fixed.
  - _Blocked_: needs a browser pass; queue this after the encoding fix to ensure docs drive the sweep.

**Validation:** Record which routes were exercised and whether console remained clean.

## Workstream 2 - Documentation Encoding

- [x] Re-save `Static/docs/regression-checklist.md` and `Static/docs/app-shell-hardening.md` as UTF-8 (no stray replacement glyphs).
- [x] Diff to confirm only encoding artifacts changed.
- [x] Ask Codex to spot-check critical bullets (Reset demo data, labs toggles) for legibility.
  - _Excerpt_: `"Use the header \"Reset demo data\" control whenever you need to return to baseline."` (regression checklist)
  - _Excerpt_: `"Navigate to weld-labs and test per-client toggles plus \"Enable all/Disable all\" bulk actions."` (regression checklist, labs section)
  - _Excerpt_: `"Global nav & header: move renderHeader, attachHeaderEvents, attachGlobalNav, initializeSettingsUI, and badge helpers out of Static/app.js."` (app-shell hardening plan)

**Validation:** Include a short excerpt from each doc showing the corrected characters.

## Workstream 3 - Lightweight Validation Harness

### 3.1 Choose Strategy

- [x] Decide on the minimal automated safety net that respects "no build tooling" (e.g., add a PowerShell smoke script, JS lint via ESLint CDN, or DOM probe tests).
  - _Decision_: add a PowerShell sanity script that inspects shell delegates and documentation encoding without external dependencies.
- [x] Document the choice in this plan with rationale and tool entry-point (command/script path).
  - _Entry-point_: `pwsh ./Static/tools/sanity-check.ps1`

### 3.2 Implement & Wire

- [x] Add script/test files; keep them runnable via native browser or `node` if already available.
  - _Artifact_: `Static/tools/sanity-check.ps1` checks delegate duplication and ASCII hygiene.
- [x] Update documentation (`Static/README.md` or new section) with usage instructions.
  - _Notes_: README now includes a "Validation helpers" section pointing to the script.
- [x] Run the harness locally and capture output in the plan (pass/fail, logs).
  - _Output_: `Sanity check passed. Shell delegates are unique and docs are ASCII clean.`

**Validation:** Ensure the script is idempotent and does not require external installs; record verification output.

### 3.3 Optional Linting Exploration

- [ ] Assess lightweight linting/formatting that keeps the "no build tooling" promise (e.g., Prettier via `npx` without install, or a browser-based ESLint run).
  - _Idea_: leverage `npx --yes prettier --check "Static/**/*.{js,css,md}"` when network access is available; this respects the zero-install rule.
- [ ] Decide whether to add a wrapper script (PowerShell or batch) for repeatable execution.

## Final Validation & Hand-off

- [ ] Perform full regression sweep using `Static/docs/regression-checklist.md`; tick items off in the checklist file if appropriate.
  - _Blocked_: Requires a real browser to exercise flows. Run through the checklist locally, then mark results directly in the doc or report back here.
- [ ] Update `MIGRATION_PLAN.md` Stage 9 progress to reflect completed items.
- [ ] Summarise remaining risks or follow-up ideas at the bottom of this plan, then leave the file checked in for future Codex sessions.

---

_When pausing work:_ leave a short "Status" blurb at the end noting which step is next and any blockers encountered so the next Codex run can resume confidently.

**Status:** Manual regression sweep still pending (blocked on browser access). Optional linting remains unscheduled.
