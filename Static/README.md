# WeldSecure (Static Edition)

WeldSecure is a narrative-heavy security awareness demo that runs entirely from static assets. Double-click `Static/index.html` in any evergreen browser and you get fully wired persona flows, live state, and dark/light themes without any build chain or dependencies. The repo is optimised for AI contributors-files stay small, responsibilities are explicit, and the docs describe the rules that keep the experience token-friendly.

## Quick start
1. Clone or download the repository.
2. Open `Static/index.html` in Microsoft Edge or Chrome.
3. Use the landing hero or global nav to hop between personas (Reporter, Customer, Org, Security, Admin, Labs).
4. Use "Reset demo data" in the header to wipe `localStorage` and restore the canonical story.

## Repo layout & responsibilities
```
Static/
|-- index.html             # Shell document; loads scripts/styles in the strict order noted below
|-- styles.css             # Import-only aggregator; declares @layer base/components/features
|-- data.js                # window.AppData enums, datasets, nav/route metadata
|-- state.js               # window.WeldState defaults + persistence helpers
|-- util.js                # window.WeldUtil DOM + formatting helpers
|-- services/
|   `-- stateServices.js   # window.WeldServices - declarative state mutations
|-- components/            # Shared building blocks (app shell, cards, nav)
|-- features/              # Route-scoped modules (render + attach + destroy)
|-- styles/                # Layered CSS (base tokens, components, features)
|-- data/                  # Additional domain-specific datasets (directory, quests, etc.)
|-- tools/                 # Sanity scripts and replay helpers
|-- docs/                  # Architecture overview + active backlog
|-- registry.js            # Route definitions wired into renderApp
|-- main.js                # Bootstraps window.Weld + hash navigation
`-- app.js                 # renderApp orchestrator (registry lookup + feature lifecycle)
```

## Runtime modules & entry points
- `moduleLoader.js` – defines `window.WeldModules` (`modules.define/use/has`) so runtime helpers and persona chunks can register themselves lazily.
- `main.js` – hydrates `window.Weld`, bootstraps the hash router, and invokes `renderApp` when the DOM is ready.
- `registry.js` – registers each route slug with render/attach delegates (often referring to `WeldModules` exports such as `features/customer/hub`).
- `app.js` – orchestrates service wrappers, header rendering, navigation, and `renderApp`/`renderAppPreservingScroll`. When you split helpers out, define them via `WeldModules` and keep thin fallbacks here.
- `services/stateServices.js` – exposes `window.WeldServices` helpers that mutate state slices. Features only call these helpers (never mutate `window.Weld.state` directly).
- `components/` – houses reusable UI modules (global nav, badge showcase, reporter sandbox shells) that can be consumed through `modules.use(...)`.

Key guardrails (see `Static/docs/architecture-overview.md` for the full contract):
- **Rendering pipeline:** `main.js` reads the hash, `registry.js` maps it to a feature, `app.js` calls `feature.render(state)` to get markup, then `feature.attach(container, state)` wires DOM events. No feature should manipulate the DOM outside its container.
- **State flow:** Immutable datasets live under `data/` and are exposed via `window.AppData`. Mutable UI state sits in `state.js`; only functions in `services/stateServices.js` may mutate it. All features call those services instead of touching `window.Weld.state` directly.
- **Namespace hygiene:** Every route attaches to `window.Weld.features.<featureName>`. Shared helpers extend `window.WeldUtil`, `window.WeldServices`, or purpose-built modules inside `components/`.
- **Token discipline:** Hard-coded values go into `styles/base/tokens.css`. `styles.css` is import-only-add selectors inside layered files under `styles/`.

## Runtime model for contributors
- **Features:** Each file under `features/` is an IIFE that registers `render`, `attach`, and optional `destroy`. Keep files ~500 lines or split into helpers to stay prompt-friendly.
- **Routing:** All navigable experiences register in `registry.js` with a slug, label, and role metadata. `components/appShell.js` reads that metadata to render nav rails.
- **Personas delivered today:** landing, customer hub, client catalogue, badge governance, phishing simulations, phishing designer, reporter add-in + sandbox, admin overview, labs toggles, dashboards, org hub, leaderboards.
- **Async simulation:** The project is intentionally synchronous. When you need pseudo-async behaviour, fake it through state (e.g., queue arrays) rather than fetch calls.

## How to add or evolve a feature
1. **Data** - Create/extend a dataset under `Static/data/` and export via `window.AppData`. Reference by ID from features.
2. **State defaults** - Update `state.js` with a new slice and ensure it's persisted/reset correctly.
3. **Services** - Add declarative helpers in `services/stateServices.js`. Name them after intent (`queuePhishingLaunch`, `recordSandboxSubmission`) and never mutate `window.Weld.state` outside these helpers.
4. **Feature module** - Build a new `features/<name>.js` using the established render/attach pattern. Avoid branching inside `app.js`; register the route instead.
5. **Styles** - Decide whether selectors are base, component, or feature scoped. Create files under `styles/<layer>/` and import them through `styles.css` in the correct block (fonts -> base -> components -> features -> legacy fallbacks).
6. **Docs** - Update `Static/docs/feature-backlog.md` and `Static/docs/fix-backlog.md` whenever you add work or verify fixes. Architecture changes belong in `Static/docs/architecture-overview.md`.

## Styling strategy
- Every CSS file declares `@layer base|components|features`. Run `rg "@layer" Static/styles -g "*.css"` to confirm coverage.
- Reuse tokens from `styles/base/tokens.css`; introduce new tokens there before referencing them.
- Feature styles stay scoped with predictable prefixes (e.g., `.phish-sim__`, `.reporter-sandbox__`). Shared widgets belong in component styles.
- `styles.css` should only contain `@import` statements and short comments documenting order. If you must add a selector temporarily, treat it as debt and migrate ASAP.

## Validation & tooling
- `pwsh ./Static/tools/sanity-check.ps1` - validates script ordering, duplicate IDs, and other glue expectations.
- `node ./Static/tools/state-vm-smoke.js` - runs `WeldState.initialState()` inside a Node VM to ensure shared defaults stay browser-agnostic.
- Manual QA: follow `Static/docs/manual-qa-checklist.md` (landing, customer hub tabs, reporter add-in & sandbox, client dashboards, admin, labs) in both themes. Log results in `Static/docs/fix-backlog.md`.
- When touching layered CSS, verify key personas plus the badge gallery to catch cascade mistakes early.

## Living documentation
- `Static/docs/architecture-overview.md` - canonical guardrails for structure, rendering, state, CSS, and contributor expectations.
- `Static/docs/feature-backlog.md` - active enhancement ideas (newest first).
- `Static/docs/fix-backlog.md` - outstanding issues + recently verified fixes.
- `Static/docs/manual-qa-checklist.md` - smoke suite to run before merging.

AI (and human) contributors should reference these docs instead of re-deriving context inside prompts. Call out specific file paths and sections when requesting additional context so only the necessary files are loaded.
