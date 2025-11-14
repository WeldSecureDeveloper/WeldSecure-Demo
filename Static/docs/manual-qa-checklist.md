# Manual QA Checklist

Use this list before merging any change. Run through every section in both **light** and **dark** theme, starting from a clean state (`localStorage.removeItem(window.AppData.STORAGE_KEY)`).

## Global Gates
- [ ] Load `Static/index.html` in an evergreen browser (Edge/Chrome). Confirm there are no console errors during boot.
- [ ] Toggle the global theme switch. Verify the entire shell (nav, cards, sandbox) swaps palettes without flashes.
- [ ] Use the "Reset demo data" button; confirm the dialog closes, state resets, and the landing route reloads.
- [ ] Navigate via the brand button (logo) back to the landing page from another persona.

## Landing Page
- [ ] Journey cards (Reporter/Organisation/WeldSecure) respond to hover and focus states.
- [ ] Clicking a card drives to the correct persona (Reporter -> add-in, Organisation -> client dashboard, etc.).

## Customer Hub (repeat for each tab)
- [ ] **Overview:** hero metrics, recognition feed, quest/reward previews render. Badge celebration overlay fires when expected.
- [ ] **Rewards:** filter chips update results and persist when switching tabs.
- [ ] **Quests:** "Take Quiz" buttons fire without console errors.
- [ ] **Reports / Redemptions / Leaderboards:** tables render data, action buttons highlight.
- [ ] **Customer badges:** hover states and badge tooltips function, edge-alignment script keeps popovers in view.

## Reporter Add-in & Sandbox
- [ ] Add-in renders with the default "Report" view, message preview updates when selecting a sample.
- [ ] Sandbox shows inbox list, reading pane, user picker, and layout toggle; each control updates state.
- [ ] Settings drawer opens/closes, preference changes persist after reload.
- [ ] Badge celebrations trigger when submitting a sandbox report (overlay animates, ticker increments).

## Client Personas
- [ ] Organisation hub/dashboard widgets render cards, charts, and filters without errors.
- [ ] Catalogue screens (badges/quests/rewards) allow filter switching and detail hover states.
- [ ] User configuration view loads directory data; selectors update dependent fields.

## Admin / Labs / Phishing
- [ ] Admin overview toggles respond and show state updates.
- [ ] Labs feature switches render, edits persist when navigating away/back.
- [ ] Phishing simulations/designer allow channel/template selections; designer form retains edits when switching tabs or routes.

## Regression Sweep
- [ ] Resize between 1280 px and 1600 px widths; ensure nav stays pinned, cards reflow, and no layout gaps appear.
- [ ] Scroll through long routes (client dashboards, labs). Nav hide/reveal logic behaves when scrolling down/up.
- [ ] Trigger at least one achievement toast (for example, customer hub welcome) and confirm the overlay auto-dismisses.
- [ ] Record browser + OS + theme results in `Static/docs/fix-backlog.md` under "Recent Verification."

