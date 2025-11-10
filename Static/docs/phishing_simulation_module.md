# Phishing Simulation Module (WeldSecure Demo)

Reference checklist for wiring a phishing simulation persona route into the static demo without violating the layered architecture rules. Treat this as the blueprint before writing any code.

---

## 1. Scenario & Outcomes
- **Audience:** Admin persona reviewing campaign telemetry plus department-level readiness.
- **Narrative hook:** Show how WeldSecure auto-targets departments (see `Static/data/directory/orgStructure.js`) and turns campaign insights into next actions (badge drops, reset scripts, service desk requests).
- **Desired interactions:**
  1. Campaign list with status, launch date, delivery coverage, and completion percentages.
  2. Department drill-in panel with recent phish templates, click rates, and follow-up tasks.
  3. "Simulate now" CTA that stages a mock launch (no real mutation yet; just queue state changes for the future implementation).

---

## 2. Files & Contracts to Touch
| Layer | Action |
| --- | --- |
| `Static/features/phishingSimulation.js` | New feature module exporting `{ render, attach, destroy }`, registered through `registry.js`. Keep DOM hooks scoped to `.phish-sim__*`. |
| `Static/styles/features/phishingSimulation.css` | Route-scoped selectors wrapped in `@layer features`. Import via the features block in `Static/styles.css`. |
| `Static/data/phishingSimulations.js` | Immutable dataset describing campaigns, templates, and department outcomes. Expose via `window.AppData.phishingSimulations`. |
| `Static/state.js` | Add defaults for `activeCampaignId`, `selectedDepartmentId`, `simLaunchQueue`, etc. |
| `Static/services/stateServices.js` | Mutators such as `selectPhishingCampaign`, `selectPhishingDepartment`, `queuePhishingLaunch`. |
| `Static/components/appShell.js` | Add route entry in nav (label: "Phishing Sims"). Respect existing nav patterns. |
| `Static/registry.js` | Register route slug `phishing-sims` -> module. Set default route if needed for demos. |

**Guardrails honored:** No direct state mutation, no data literals inside the feature, CSS kept in scoped file, and registry-based routing per `architecture-overview.md`.

---

## 3. Data & State Shape
```js
window.AppData.phishingSimulations = {
  campaigns: [
    {
      id: "sim-q4-finance",
      name: "Q4 Finance Spoof",
      launchDate: "2025-10-28",
      templateId: "template-wire-fraud",
      targets: ["finance-assurance", "operations-resilience"],
      delivery: { sent: 280, delivered: 276, failed: 4 },
      engagement: { reported: 198, clicked: 22, ignored: 60 },
      followUps: ["reward-badge:finance-assurance", "reset-script:opsres"]
    },
    ...
  ],
  templates: [
    { id: "template-wire-fraud", subject: "Treasury URGENT: Wire validation", vector: "email" },
    { id: "template-vendor-portal", subject: "Vendor portal MFA refresh", vector: "sms" }
  ]
};
```
- Departments referenced by `targets` should match IDs in `DirectoryData.departments`. Use that file for friendly names and owners.
- State defaults (all optional strings/arrays): `activeCampaignId`, `selectedDepartmentId`, `simLaunchQueue` (array of campaign IDs awaiting execution), `lastSimFeedback` (summary text shown after a mock launch).
- Derive computed view models inside the feature (no global caches). Example: `const activeCampaign = WeldUtil.lookupById(AppData.phishingSimulations.campaigns, state.activeCampaignId || campaigns[0].id);`

---

## 4. UI Structure (Render Plan)
1. **Hero/status strip** - summarise live campaign count, average report rate, queued launches. Static HTML sourced from AppData + state.
2. **Campaign list** - table or stacked cards sorted by launch date. Each entry exposes:
   - Launch meta (date, template, owner).
   - KPIs (delivered %, clicked %, reported %).
   - Action buttons: "View Departments", "Simulate Again".
3. **Department drill-in panel** - conditional block that renders when a campaign + department are both selected:
   - Pull department metadata from `DirectoryData.departments`.
   - Show template run history (AppData templates + synthetic history field).
   - CTA to trigger `queuePhishingLaunch`.
4. **Insights drawer** - optional aside summarising follow-up tasks (badge drops, reset requests) to align with badges/customer modules later.

**Rendering rules:** Build strings with template literals, no direct DOM manipulation besides container injection. Keep copy centralised near dataset constants so translations live in one place.

---

## 5. Event Wiring & Services
- `attach(container, state)` should:
  - Bind click handlers via delegation on `.phish-sim__campaign` & `.phish-sim__department` elements.
  - Call the new state services rather than mutating `window.Weld.state`.
  - Dispatch a custom event `phishSim:queued` when a simulation is staged; useful for future cross-feature badges.
- `destroy(container)` cleans up delegated listeners (store references on module scope to stay consistent with other features).

Future gesture plan:
1. Selecting a campaign -> `stateServices.selectPhishingCampaign(id)`.
2. Selecting a department row -> `stateServices.selectPhishingDepartment(id)`.
3. Clicking "Simulate now" -> `stateServices.queuePhishingLaunch(id)` + push a toast-style alert into `lastSimFeedback`.

---

## 6. Copy & Visual Hooks
- Use badge colour tokens for status pills: success (reported), warning (clicked), neutral (ignored). Tokens live in `styles/base/tokens.css`.
- Keep spacing consistent with `.card` component styles; reuse `.stat-pill` if available in `styles/components`.
- When referencing departments, show owner display name from Directory data (ownerId -> person lookup) once people dataset exists; for now, render owner IDs plainly.

---

## 7. Implementation Phases
1. **Scaffold (Docs -> Data)** - Create dataset + state defaults + services + registry entry. Validate route loads with placeholder markup.
2. **Render loop** - Build campaign list + drill-in UI, ensuring data flows only from AppData/state.
3. **Event plumbing** - Wire handlers, queue-state interactions, toast copy.
4. **Visual polish** - Finalise CSS layer, tokens, and responsive tweaks.
5. **Cross-feature touchpoints** - Hook queued simulations into future badge/quest logic once their APIs exist.

---

## 8. Open Questions / Assumptions
- Do we need historical trend graphs (sparklines) or is tabular data enough for the first iteration?
- Should queued simulations surface under the Admin persona landing page or stay isolated here until automation is built?
- Are we reusing the existing toast system from another feature, or do we need a lightweight inline alert component?

Document any answers here before implementing to keep Codex prompts scoped.
