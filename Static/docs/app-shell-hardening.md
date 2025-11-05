# App Shell Hardening Plan

> Goal: Reduce Codex token pressure and future maintenance overhead while keeping the “double-click `Static/index.html`” experience completely offline and dependency free.

## Guardrails
- No build tooling, dependency managers, or network fetches (Chrome/Edge block `fetch()` on `file://`).
- All assets must be readable by the browser when the repo is opened locally.
- Preserve existing public API surface (`window.Weld*` globals, `renderIcon`, etc.) to avoid cascading feature rewrites.
- Regression checks: launch `Static/index.html`, walk every persona, and run `Reset demo data` before/after changes.

## Workstream 1 – Icon Asset Extraction
1. **Inventory**  
   - Enumerate keys in `Static/data.js:AppData.ICON_PATHS`.
   - Note which icons are used outside `WeldUtil.renderIcon` (search for `` `medal` `` style references).
2. **Create asset directory**  
   - Add `Static/svg/` with one file per icon (e.g. `Static/svg/medal.svg`).  
   - Strip template literal wrappers; ensure SVGs have explicit `width`/`height` or rely on CSS sizing.
3. **Expose icon paths**  
   - Replace the legacy `AppData.ICONS` blob with a lightweight manifest, e.g. `AppData.ICON_PATHS = { medal: "svg/medal.svg" }`.  
   - Keep a temporary compatibility flag while the refactor is rolling out.
4. **Update render helpers**  
   - Refactor `WeldUtil.renderIcon` to return an `<img>` (or `<object>`) pointing at the path, preserving `icon-token` classes.  
   - Update CSS selectors from `.icon-token svg` → `.icon-token img` and adjust fill/size styles accordingly.  
   - Retain accessible labelling (`aria-hidden`, `alt=""`).
5. **Purge inline SVG references**  
   - Remove string literals from `data.js` once consumers read from the manifest.
6. **Validation**  
   - Open `Static/index.html` directly in Edge + Chrome. Confirm badges, nav icons, add-in glyphs render and inherit CSS sizing.  
   - Exercise dark backgrounds to ensure transparent SVG backgrounds behave identically.

## Workstream 2 – Separate Demo Payload From Logic
1. **Split datasets**  
   - Move large objects from `Static/state.js` (team members, recognitions, rewards, quests, etc.) into `Static/data/state/defaultState.js` that assigns `window.WeldInitialState = { … }`.
2. **Script plumbing**  
   - Load `data/state/defaultState.js` from `Static/index.html` immediately after `data.js` so consumers remain synchronous and file:// compatible.  
   - Document the global in the file header (`/* global window */`) and expose a `version` property for quick regression checks.
3. **Loader shim**  
   - Replace literal data in `Static/state.js` with a loader that clones from `window.WeldInitialState`.  
   - Keep a defensive fallback to maintain behaviour if the payload script fails to load.
4. **Services alignment**  
   - Ensure `services/stateServices.js` still clones the initial state from the new source.  
   - Run the localStorage persistence path to confirm serialization stays unchanged.
5. **Validation**  
   - Clear site storage, reload, and verify default data appears.  
   - Trigger `Reset demo data` to confirm rehydration uses the new payload.

## Workstream 3 – Shared Report Table Renderer
1. **Identify duplication**  
   - Compare `Static/features/dashboard.js` and `Static/features/customer/reports.js` table markup (reason chips, points blocks).
2. **Extract shared utility**  
   - Build `WeldReportTable.prepareRows(messages, options)` as a shared helper.  
   - Parameterise persona-specific options (action buttons vs. static status, activity metadata).
3. **Refactor feature modules**  
   - Replace inline template literals with calls to the shared helper.  
   - Keep existing DOM wiring (`attachDashboardEvents`, etc.) intact by returning hooks alongside markup.
4. **Validation**  
   - Walk through Reporter → Reports, Client → Security Dashboard, and confirm sorting, chips, and buttons behave identically.  
   - Confirm no regression in event listeners (approve/reject buttons still wired).

## Workstream 4 – CSS Token Consolidation
1. **Audit gradients & colors**  
   - Search `Static/styles.css` for repeated linear gradients and color literals used in buttons/nav/badges.
2. **Define custom properties**  
   - Extend `:root` with semantic tokens (`--btn-gradient-primary`, `--surface-gradient-accent`, `--badge-points-gradient`, `--celebration-bubble-gradient`, etc.).  
   - Document tokens inline to guide future updates.
3. **Replace usages**  
   - Swap repeated literals with the new variables (e.g. nav hover gradients now use `--surface-gradient-accent`).  
   - Verify derived components (hover, focus, dark overlays) still meet contrast guidelines.
4. **Validation**  
   - Cross-check in UI: primary CTA, nav hover, badge tiles, celebration animations.  
   - Confirm no visual regression screenshots in QA notes (`Static/docs/fix-log.md`).

## Test & Rollout Checklist
- [ ] Smoke test every persona journey plus Labs toggles.
- [ ] Confirm all icons load without console errors when run from `file://`.
- [ ] Run `pwsh ./Static/tools/sanity-check.ps1`.
- [ ] Update `Static/docs/fix-log.md` with verification notes once workstreams land.
