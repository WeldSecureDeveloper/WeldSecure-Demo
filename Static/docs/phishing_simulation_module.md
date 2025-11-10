# Phishing Simulation Module (WeldSecure Demo)

Reference blueprint for wiring a phishing simulation persona route into the static demo while honoring the layered architecture. Use this doc before implementing any code so the feature slots cleanly into the existing structure.

---

## 1. Scenario & Outcomes
- **Audience:** Admin persona reviewing simulation telemetry plus department readiness.
- **Narrative hook:** WeldSecure auto-targets org units from `Static/data/directory/orgStructure.js` and turns campaign insights into next steps (badges, reset scripts, service desk follow ups).
- **Key interactions:**
  1. Campaign list with status, launch date, delivery coverage, and completion percentages.
  2. Department drill-in panel showing click/report rates, template history, and follow up tasks.
  3. "Simulate now" CTA that stages a mock launch (no real side effects yet; future work will consume the queued entry).

---

## 2. Files & Contracts to Touch
| Layer | Action |
| --- | --- |
| `Static/features/phishingSimulation.js` | New feature exposing `{ render, attach, destroy }`. Scope selectors to `.phish-sim__*` utilities and read data/state from injected args only. |
| `Static/styles/features/phishingSimulation.css` | Route-scoped styles under `@layer features`. Import via the features block in `Static/styles.css` (after other feature sheets, before legacy fallbacks if any). |
| `Static/data/phishingSimulations.js` | Immutable dataset describing campaigns, templates, and derived insights. Export through `window.AppData.phishingSimulations`. |
| `Static/state.js` | Add default keys like `activeCampaignId`, `selectedDepartmentId`, `simLaunchQueue`, `lastSimFeedback`. |
| `Static/services/stateServices.js` | Add declarative mutators such as `selectPhishingCampaign`, `selectPhishingDepartment`, `queuePhishingLaunch`. Each should set state via the shared helpers. |
| `Static/components/appShell.js` | Register a nav link labeled "Phishing Sims" that routes via the registry entry. Follow existing nav data structure. |
| `Static/registry.js` | Register slug `phishing-sims` -> feature module. Optionally set as default route for specific demos when needed. |

Guardrails per `Static/docs/architecture-overview.md`: no direct state mutation, no inline data literals inside features, routing goes through the registry, CSS stays layered.

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
    {
      id: "sim-hr-benefits",
      name: "Benefits Renewal Alert",
      launchDate: "2025-11-06",
      templateId: "template-benefits-refresh",
      targets: ["people-experience"],
      delivery: { sent: 95, delivered: 94, failed: 1 },
      engagement: { reported: 70, clicked: 8, ignored: 16 },
      followUps: ["training-module:people-experience"]
    }
  ],
  templates: [
    { id: "template-wire-fraud", subject: "Treasury URGENT: Wire validation", vector: "email" },
    { id: "template-benefits-refresh", subject: "Action required: renew benefits", vector: "email" },
    { id: "template-vendor-portal", subject: "Vendor portal MFA refresh", vector: "sms" }
  ],
  historyByDepartment: {
    "finance-assurance": [{ campaignId: "sim-q4-finance", clicked: 5, reported: 42 }],
    "people-experience": [{ campaignId: "sim-hr-benefits", clicked: 8, reported: 70 }]
  }
};
```
- Department IDs align with `DirectoryData.departments`. Reuse that file for labels, owners, and sync metadata.
- Suggested state defaults in `state.js`:
  ```js
  phishingSimulation: {
    activeCampaignId: null,
    selectedDepartmentId: null,
    simLaunchQueue: [],
    lastSimFeedback: null
  }
  ```
- In the feature, derive computed objects on the fly (e.g., `const campaigns = AppData.phishingSimulations.campaigns; const active = campaigns.find(...)`).

---

## 4. UI Structure (Render Plan)
1. **Hero/status strip** - summarise active campaign count, average report rate, queued launches. Source numbers from AppData + current state.
2. **Campaign list** - table or stacked cards sorted by launch date with:
   - Launch meta (date, template, owner/department).
   - KPIs (delivered %, clicked %, reported %).
   - Actions: "View departments" (selects campaign) and "Simulate now" (queues launch).
3. **Department drill-in panel** - shows when both campaign and department are selected:
   - Department metadata (name, owner, sync type).
   - Latest template runs plus sparkline placeholder for future charts.
   - CTA to trigger `queuePhishingLaunch`.
4. **Insights drawer** - optional aside summarising follow up tasks from `followUps` plus placeholders for integration hooks (badges, reset scripts, service tickets).

Render via template literals only. Inject markup as one string in `render()` and rely on `attach()` for DOM wiring. Keep copy centralised in the dataset or small helper maps near the top of the feature file.

---

## 5. Event Wiring & Services
- `attach(container, state)` should:
  - Use event delegation on `.phish-sim__campaign` and `.phish-sim__department` elements.
  - Call the new services (`selectPhishingCampaign`, `selectPhishingDepartment`, `queuePhishingLaunch`) rather than mutating `window.Weld.state`.
  - Dispatch a custom event `phishSim:queued` after queueing a launch to keep future badge integrations simple.
- `destroy(container)` removes delegated listeners, matching the pattern used in other features.

Interaction plan:
1. Selecting a campaign -> `stateServices.selectPhishingCampaign(id)`.
2. Selecting a department row -> `stateServices.selectPhishingDepartment(id)`.
3. Clicking "Simulate now" -> `stateServices.queuePhishingLaunch(id)` and store a short explainer string in `lastSimFeedback` for any toast/banner component.

---

## 6. Copy & Visual Hooks
- Status pills should use color tokens from `styles/base/tokens.css` (success for reported, warning for clicked, neutral for ignored).
- Card shells can reuse `.card`, `.stat-pill`, and any shared grid helpers under `styles/components/`.
- Department rows should display owner IDs until a people dataset exists; keep helper ready to map owner IDs once `DirectoryData.people` ships.
- If tooltips or alerts are required, reuse existing utility components instead of creating new global styles.

---

## 7. Implementation Phases
1. **Scaffold (Docs -> Data)** - Create dataset + state defaults + service methods + registry/nav entries. Render placeholder markup to validate routing.
2. **Render loop** - Build campaign list, drill-in panel, and insights drawer using AppData/state only.
3. **Event plumbing** - Wire click handlers, service calls, and custom events. Update `lastSimFeedback` for toast placeholder.
4. **Visual polish** - Finalise CSS layer, tokens, and responsive tweaks across desktop/tablet breakpoints.
5. **Cross-feature hooks** - Once badge or quest APIs exist, consume `simLaunchQueue` to trigger rewards or notifications.

---

## 8. Phishing Designer Workspace
- **Route & Nav:** New WeldSecure route `phishing-designer` lives beside `phishing-sims`. The registry maps it to `features/phishingDesigner.js` and the global nav loads it under the WeldSecure cluster.
- **Blueprint data:** `Static/data/phishingBlueprints.js` seeds channel enums, signal definitions (severity + category), default tokens, and starter templates. `AppData.PHISHING_CHANNELS` / `PHISHING_SIGNAL_CATEGORIES` expose the enums to other layers.
- **State slice:** `state.phishingDesigner` tracks `drafts`, `form`, `activeTemplateId`, and `validation`. Defaults come from the blueprint file so the builder loads with sample content even before admins save anything locally.
- **Services:** New mutators in `stateServices.js` (`setPhishingDesignerForm`, `createPhishingDraft`, `updatePhishingDraft`, `duplicatePhishingDraft`, `applyPhishingTemplate`, `publishPhishingDraft`) keep the builder declarative. Publishing a draft appends a campaign + template into `AppData.phishingSimulations`, records `signalsByCampaign`, and immediately calls `queuePhishingLaunch` so telemetry stays in sync.
- **UI flow:** `features/phishingDesigner.js` renders three major zones:
  1. **Draft library** – cards for saved/staged drafts with Edit / Duplicate / Launch actions.
  2. **Builder form** – envelope settings, body copy + token helpers, signal checklist, targeting, and optional scheduling. Inputs call the update services so state stays persistent.
  3. **Live preview** – mirrors the envelope/body copy and highlights selected signals to show how reporters will experience the payload.
- **Publishing:** Launch CTA is disabled until validation passes (name, subject/body, sender, ≥1 signal, ≥1 target). Successful publishes mark the draft as `staged`, stamp metadata such as `lastCampaignId`, and enqueue the simulation so the existing phishing module immediately reflects the new campaign.

## 9. Open Questions / Assumptions
- Do we need historical trend charts (e.g., sparklines) on day one, or can we start with textual summaries?
- Should queued simulations appear on the Admin landing feature, or remain isolated until automation work lands?
- Are we reusing an existing toast/alert component for `lastSimFeedback`, or should this module ship an inline banner?

Capture answers here before coding so prompts stay scoped and implementation stays predictable.
