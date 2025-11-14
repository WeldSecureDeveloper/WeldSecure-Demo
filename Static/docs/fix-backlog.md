# Fix Log

> Lightweight record of outstanding fixes and recently verified work. Tie entries back to `Static/docs/token-efficiency-modernization-plan.md`.

## Active Issues

| Item | Status | Owner | Phase Link | Notes |
| --- | --- | --- | --- | --- |
| Add-in celebration animation timing | blocked | Codex | Phase F - Tooling/Cleanup | Needs visual QA once the runtime split (Phase B) lands; ensure reporter sandbox celebrations align with badge showcase overlay timing. |
| Runtime modularization QA gap | done | Codex | Phase B - Runtime Core Modularization | Edge 119 / Windows 11 / light + dark: manual checklist passed (landing, nav, customer hub tabs, reporter sandbox, badge toast, reset). |
| Render module integration QA | done | Codex | Phase B - Runtime Core Modularization | Edge 119 / Windows 11 / light + dark: runtime/renderApp shim verified (nav, hub tabs, badge alignment, renderAppPreservingScroll). |
| Registry runtime module QA | done | Codex | Phase B - Runtime Core Modularization | Edge 119 / Windows 11 / light + dark: verified runtime/routes integration (nav, hub tabs, badge alignment, renderAppPreservingScroll). |

## Recent Verification

| Date | Item | Phase Link | Notes |
| --- | --- | --- | --- |
| 2025-11-14 | Runtime modularization smoke | Phase B - Runtime Core Modularization | Edge 119 on Windows 11; full checklist green (themes, nav, customer hub tabs, badge toast, reset, reporter sandbox). |
| 2025-11-14 | Render module integration | Phase B - Runtime Core Modularization | Edge 119 / Windows 11; verified renderApp + renderAppPreservingScroll via runtime module, badge alignment + focus states remain stable. |
| 2025-11-14 | Registry runtime module | Phase B - Runtime Core Modularization | Edge 119 / Windows 11; runtime/routes feed render shim + registry lookups, nav + hub attachments stable. |
| 2025-11-14 | State defaults integration | Phase B - Runtime Core Modularization | Edge 119 / Windows 11; user smoke confirmed no regressions after shared defaults refactor. |
| 2025-11-14 | State VM smoke | Phase B - Runtime Core Modularization | `node Static/tools/state-vm-smoke.js` ensures `WeldState.initialState()` works headlessly against shared defaults. |
| 2025-11-13 | Service helper refactors | Pre-plan reference | Added WeldServices helpers for filters/settings, ensuring centralized mutations. |
| 2025-11-13 | Reset flow coverage | Pre-plan reference | Reset demo now restores sandbox + designer slices; persisted in docs. |
| 2025-11-13 | Services decoupled from app.js | Pre-plan reference | Quest/reward helpers now resolve locally rather than relying on globals. |
| 2025-11-13 | App shell split | Pre-plan reference | Badge showcase, global nav, and settings shell now live in modules to keep `components/appShell.js` lean. |
| 2025-11-07 | CSS layering | Pre-plan reference | `styles.css` now import-only with base/components/features stacks verified in both themes. |

Log future manual QA runs (route coverage + theme) here before marking plan phases complete.
