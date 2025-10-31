# WeldSecure (Static Edition)

This repository ships the WeldSecure SaaS demo as a **fully static experience**. Everything runs on vanilla HTML, CSS, and JavaScript—double‑click `Static/index.html` in any modern browser and start telling the story. No build tooling, package installs, or servers are required.

## Highlights
- **Persona landing & navigation** – jump between Reporter, Customer Hub, Organisation Hub, Security Dashboard, Admin, Badges, and Add-in journeys from the hero cards or global nav.
- **Reporter success loop** – demonstrate live point balances, Redemption flow, report history, badge showcase, and the Outlook-style add-in submission experience.
- **Client storytelling** – show momentum, leaderboards, engagement programs, badge catalogue management, quest curation, and reporting approvals with real-time point adjustments.
- **Admin & Labs views** – surface multi-tenant health, escalation queues, and experimental feature toggles to illustrate the breadth of the platform.
- **Replay-friendly state** – demo data persists through `localStorage` during a session, with “Reset demo data” wiring everything back to the default narrative instantly.

## Getting started
1. Clone or download the repository.
2. Open `Static/index.html` in Microsoft Edge, Chrome, or another evergreen browser.
3. Navigate the journeys using the landing page cards or the global navigation. Use “Reset demo data” whenever you want to rewind the story.

That’s it—no additional tooling or setup needed.

## Architecture overview
The original monolithic `app.js` has been decomposed into small, feature-scoped files to reduce token usage and make customisation simple. Script order is carefully curated so each module can attach its globals to `window` without a bundler.

```
Static/
├─ index.html        # Shell document; loads scripts in the required order
├─ styles.css        # Styling, gradients, layout primitives, and type
├─ data.js           # window.AppData – constants, enums, demo datasets
├─ state.js          # window.WeldState – persistence helpers & initial state
├─ util.js           # window.WeldUtil – DOM + formatting utilities
├─ main.js           # window.Weld – global namespace & lightweight router bootstrap
├─ features/
│  ├─ badges.js      # Weld.features.badges   – badge catalogue experience
│  ├─ reporter.js    # Weld.features.reporter – Outlook add-in success flow
│  ├─ hub.js         # Weld.features.hub      – customer hub & quest catalogue
│  ├─ orgHub.js      # Weld.features.orgHub   – organisation momentum dashboard
│  └─ dashboard.js   # Weld.features.dashboard – security approvals workspace
├─ app.js            # Legacy orchestration: state wiring, routing, UI glue
└─ README.md         # This guide
```

`app.js` still drives the full experience. Each feature module registers itself on `window.Weld.features`, and `renderApp()` delegates to those renderers based on the active route. This keeps behaviour identical while making future refactors easy.

## Customising the demo
- Update copy or data points inside `data.js` (for example, badge definitions or leaderboard entries).
- Adjust default state or persistence behaviour in `state.js`.
- Extend `WeldUtil` with additional helpers and use them across features.
- Replace layouts or interactions inside `features/*.js`; because each module is sandboxed, changes stay scoped to that journey.

When you’re done, reload `Static/index.html` to see the changes immediately. Press “Reset demo data” from the header if you need to snap back to the default story.
