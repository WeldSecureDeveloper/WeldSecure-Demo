# WeldSecure Static Demo - Regression Checklist

Use this guide during Stage 9 hardening to confirm the modular shell still mirrors the original behaviour. Work top-to-bottom; reset demo data between personas when helpful. Tick each item as you verify it.

## Preparation
- Launch `Static/index.html` in a modern desktop browser.
- Open DevTools console so you can spot JS errors while testing.
- Use the header "Reset demo data" control whenever you need to return to baseline.

## Landing Page
- Confirm hero cards for Reporter, Customer, Organisation, Admin, and Labs navigate to the correct routes.
- Trigger each "Start tour" CTA and ensure chip/role badges update accordingly.

## Reporter / Add-in
- From landing, launch the Reporter journey and verify the point ticker updates when submitting a report.
- In the add-in (route `addin`), submit a report with and without emergency flag; confirm dialogs and success loop messaging render.
- Validate the "Reset demo data" shortcut restores the initial report list and point balance.

## Customer Persona
- Navigate to Customer Hub (`customer`) and ensure badge carousel renders plus "Give recognition" CTA routes to badges.
- Review recognition filters, bonus meters, and quest completion; confirm dialogs appear when triggering celebrations.
- Visit `customer-badges`, `customer-reports`, and `customer-redemptions`, exercising sort/filter controls and redemption flow.

## Organisation / Client Persona
- Check `client-dashboard`, `client-reporting`, and `client-quests` for correct charts, filters, and quest publishing toggles.
- Visit `client-rewards` and verify category/status filters, publish/unpublish controls, and reward detail dialogs.
- Confirm state changes persist when navigating back to other client routes.

## Admin
- Open `weld-admin` and ensure metric cards, client list, and playbook dialog work.
- Use "View journey" and "Share insights" actions; confirm dialogs display contextual information.

## Labs
- Navigate to `weld-labs` and test per-client toggles plus "Enable all/Disable all" bulk actions.
- Verify counts update, coverage calculations look reasonable, and dialogs/state persist after navigation.

## Settings Overlay
- From any route, open Settings and step through available categories.
- Toggle a setting (e.g., reporter prompts) and confirm it reflects in relevant personas (Reporter or Customer flows).

## Reset & Persistence
- After completing the above, reload the page to ensure `localStorage` persisted recent changes.
- Use "Reset demo data" and confirm every persona returns to baseline content without console errors.

## Module Loader Sanity
- Hard refresh the page and ensure no `WeldModules` warnings/errors appear in the console.
- Navigate through customer hub/badges/reports/redemptions to confirm loader-proxied features render as expected.
- Toggle settings overlay and global navigation to verify shared shell initialises only once per load.

Document any regressions in `MIGRATION_PLAN.md` under Stage 9 before proceeding with optional linting or additional refactors.
