# Fix Log

> Lightweight record of outstanding fixes and recently verified resolutions.

## Open
- Align add-in celebration pop animation timing with badge showcase (pending visual QA).

## Recently Fixed
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
