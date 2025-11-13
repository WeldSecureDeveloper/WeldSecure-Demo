# Fix Log

> Lightweight record of outstanding fixes and recently verified resolutions.

## Open
- Align add-in celebration pop animation timing with badge showcase (pending visual QA).

## Recently Fixed
- Added WeldServices helpers + feature refactors for reward/report filters, recognition feed, badge availability, and settings category to keep mutations centralized (2025-11-13).
- Reset demo now restores every state slice, including reporter sandbox and phishing designer payloads (2025-11-13).
- Badge catalogue now fully layered: badges split into component/feature CSS, grid tightened to 5 columns, and right-edge popovers flip inward (2025-11-07).
- Themes hub gains a persisted light/dark toggle, covering nav chrome and settings surfaces.
- Catalogue, quest, and reward cards plus dialog shells now adopt themed tokens so dark mode matches the light layout.
- Reporter hub quests no longer render the catalogue configuration cog; CTA keeps the walkthrough invitational.
- Landing page WeldSecure journey CTA inherits the green card tone for visual consistency.
- Global nav brand chip now routes back to the landing experience reliably after any navigation.
- Global nav sticks to the viewport and reappears whenever you scroll upward.
- Reset confirmation dialog now closes automatically after the demo is reset.
- Regression checklist completed after full browser QA (2025-11-04).
- Catalogue badges: consistent publish/unpublish footer alignment after layout flex adjustments.
- Reporter bursts: bubble animation without blur, matching new static award pill.
- Badge navigation chip: center-right positioning beside primary badge tile.
- Security dashboard/customer reports: shared renderer with consistent chips/points and reliable approve/reject actions.
- Global nav & settings: gradient hovers now sourced from `--surface-gradient-accent` token to simplify restyling.
- Badge points & celebrations now draw from shared gradient tokens (`--badge-points-gradient`, `--celebration-bubble-gradient`) for easier palette tweaks.
## CSS Split (2025-11-07)
- Completed styles.css refactor: aggregator now imports tokens/base/components/features/badges.
- Migrated shared widgets into component files and moved dark theme tokens to base.
- Verified key persona flows and dark mode post-split.
