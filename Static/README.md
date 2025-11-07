# WeldSecure (Static Edition)

This demo ships as a **fully static experience** - double-click `Static/index.html` in any modern browser and the entire WeldSecure story runs locally. No package installs, build steps, or servers required.

## Highlights
- **Persona tours** - hop between Reporter, Customer, Organisation, Security, Admin, and Labs flows using the landing hero cards or the global navigation.
- **Themes** - switch between light and dark chromes from the global nav or Appearance settings; the choice persists per browser.
- **Reporter success loop** - walk through live point balances, badge showcases, redemption decisions, and the Outlook-style add-in.
- **Client storytelling** - show momentum dashboards, quest catalogues, badge governance, and rewards publishing with state changes reflected instantly.
- **Admin & Labs oversight** - surface multi-tenant health plus experimental feature toggles to illustrate rollout control.
- **Replay-friendly state** - demo data persists in `localStorage`; hit "Reset demo data" at any time to restore the baseline narrative.

## Getting started
1. Clone or download the repository.
2. Open `Static/index.html` in an evergreen browser such as Microsoft Edge or Chrome.
3. Navigate the journeys from the landing page or the global nav. Use "Reset demo data" whenever you want to rewind.

That's it - no additional tooling needed.

## Architecture overview
The legacy `app.js` switchboard has been replaced by feature-scoped modules coordinated through a lightweight registry.

```
Static/
|-- index.html              # Shell document; loads scripts in the required order
|-- styles.css              # Styling, layout primitives, and tokens
|-- data.js                 # window.AppData constants, enums, demo datasets
|-- state.js                # window.WeldState persistence helpers & initial state
|-- util.js                 # window.WeldUtil DOM + formatting utilities
|-- services/
|   `-- stateServices.js    # window.WeldServices facade over state mutations
|-- registry.js             # window.WeldRegistry route table for every persona
|-- main.js                 # window.Weld bootstrap + hash navigation shim
|-- features/
|   |-- landing.js          # Weld.features.landing      - hero journeys & CTAs
|   |-- customer.js         # Weld.features.customer     - customer hub, reports, badges, rewards
|   |-- client.js           # Weld.features.client       - rewards catalogue (organisation persona)
|   |-- badges.js           # Weld.features.badges       - badge governance workspace
|   |-- reporter.js         # Weld.features.reporter     - Outlook add-in and reporter loop
|   |-- hub.js              # Weld.features.hub          - quest catalogue for customers
|   |-- orgHub.js           # Weld.features.orgHub       - organisation momentum dashboard
|   |-- dashboard.js        # Weld.features.dashboard    - security approvals workspace
|   `-- settings.js         # window.Weld.settings       - settings overlay experience
|-- features/admin.js       # Weld.features.admin        - multi-tenant admin overview
|-- features/labs.js        # Weld.features.labs         - experimental feature toggles
`-- app.js                  # Shell glue: state bootstrap, registry-driven renderApp
```

`renderApp()` now looks up the active route inside `window.WeldRegistry`, renders via the registered feature, and hands back to the feature's `attach` hook for DOM wiring. Legacy helpers have been removed; new work should happen inside feature modules or reusable utilities.

## Customising the demo
- Update copy or data points in `data.js` (badge definitions, quests, clients, etc.).
- Adjust default state or persistence logic inside `state.js` or `services/stateServices.js`.
- Add helpers to `util.js` when you need reusable DOM/formatting helpers across features.
- Modify content or behaviour within `features/*.js`; each module is isolated to its journey.

Reload `Static/index.html` after changes to see the updates. Use "Reset demo data" in the header to snap back to the canonical story whenever needed.

## Validation helpers
- Run `pwsh ./Static/tools/sanity-check.ps1` to confirm shell delegates remain unique.
- Review `Static/docs/fix-backlog.md` for the latest verified fixes before sharing builds.

## Ongoing work
- Track enhancements in `Static/docs/feature-backlog.md`.
- Record fixes and follow-ups in `Static/docs/fix-backlog.md`.


