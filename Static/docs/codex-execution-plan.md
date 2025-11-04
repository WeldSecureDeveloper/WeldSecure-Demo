# Codex Execution Plan — App Shell Hardening Follow-up

> **Usage:** Codex updates this plan as work progresses. After completing a step, change the unchecked box `- [ ]` to `- [x]` and add brief context (e.g., PR links, commit hashes, test results). Leave pending tasks unchecked so the plan remains resumable.

## Overview

Goal: finish the modularisation work paused in Stage 9 by deleting stray monolith fallbacks, fixing documentation encoding, and establishing a minimal validation harness so AI-only iterations stay safe.

## Prerequisites

- [ ] Confirm `Static/index.html` still opens without build tooling (double-click smoke test).
- [ ] Capture current console state (no `WeldModules` errors) before modifications.

## Workstream 1 — App Shell Delegation

### 1.1 Remove Legacy Duplicates

- [ ] Delete or refactor the legacy implementations of:
  - `renderBadgeSpotlight`, `setupBadgeShowcase`, `teardownBadgeShowcase`
  - `renderHeader`, `attachHeaderEvents`, `renderGlobalNav`, `attachGlobalNav`, `initializeSettingsUI`
- [ ] Ensure the module-based implementations in `Static/components/appShell.js` provide all required behaviour.
- [ ] Re-run `Static/index.html` locally; confirm global navigation, header chip updates, settings overlay, and badge showcase still work.

**Validation:** Document verification steps in the plan entry (e.g., “manual nav smoke on landing→client dashboard”, screenshot optional).

### 1.2 Harden Service Calls

- [ ] Inspect `Static/app.js` for any direct state mutations/bypass of `WeldServices`. Replace with service calls where feasible.
- [ ] Add guard rails or TODO comments if a legacy mutation cannot yet move.
- [ ] Manually test persona routes touched during refactor; note any regressions observed/fixed.

**Validation:** Record which routes were exercised and whether console remained clean.

## Workstream 2 — Documentation Encoding

- [ ] Re-save `Static/docs/regression-checklist.md` and `Static/docs/app-shell-hardening.md` as UTF-8 (no stray replacement glyphs).
- [ ] Diff to confirm only encoding artifacts changed.
- [ ] Ask Codex to spot-check critical bullets (Reset demo data, labs toggles) for legibility.

**Validation:** Include a short excerpt from each doc showing the corrected characters.

## Workstream 3 — Lightweight Validation Harness

### 3.1 Choose Strategy

- [ ] Decide on the minimal automated safety net that respects “no build tooling” (e.g., add a Powershell smoke script, JS lint via ESLint CDN, or DOM probe tests).
- [ ] Document the choice in this plan with rationale and tool entry-point (command/script path).

### 3.2 Implement & Wire

- [ ] Add script/test files; keep them runnable via native browser or `node` if already available.
- [ ] Update documentation (`Static/README.md` or new section) with usage instructions.
- [ ] Run the harness locally and capture output in the plan (pass/fail, logs).

**Validation:** Ensure the script is idempotent and doesn’t require external installs; record verification output.

## Final Validation & Hand-off

- [ ] Perform full regression sweep using `Static/docs/regression-checklist.md`; tick items off in the checklist file if appropriate.
- [ ] Update `MIGRATION_PLAN.md` Stage 9 progress to reflect completed items.
- [ ] Summarise remaining risks or follow-up ideas at the bottom of this plan, then leave the file checked in for future Codex sessions.

---

_When pausing work:_ leave a short “Status” blurb at the end noting which step is next and any blockers encountered so the next Codex run can resume confidently.
