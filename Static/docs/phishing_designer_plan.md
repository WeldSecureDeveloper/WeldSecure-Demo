# Org Phishing Simulation Designer â€“ Implementation Plan

Blueprint for adding an organisation-facing feature that lets admins design phishing simulations, pick red flags reporters must spot, and push them into the existing simulation launcher. Keep scope browser-only and aligned with the layered architecture.

---

## 1. Goal & Persona
- **Persona:** Admin / security lead working from the WeldSecure view.
- **Objective:** Rapidly assemble multi-channel phishing simulations with configurable â€œsignalsâ€ (lookalike domain, mismatched link, QR lure, etc.) and send them to selected departments or segments.
- **Success criteria:** Designer outputs feed `AppData.phishingSimulations`, queue launches through `WeldServices.queuePhishingLaunch`, and expose metadata consumed by the reporter sandbox feature.

---

## 2. Experience Outline
1. **Template board:** Grid of saved simulations (draft + published) with status pills and launch metrics.
2. **Builder workspace:** Split form showing message preview on the right and configurable blocks on the left:
   - Envelope (channel, sender display, subject, icon).
   - Body copy with inline token hints.
   - Signal checklist (features that recipients must identify).
   - Targeting (departments/segments) + scheduling.
3. **Validation & send drawer:** Summarises required fields, highlights outstanding configuration, and exposes â€œLaunch nowâ€ or â€œStage in queueâ€.

---

## 3. Files & Modules to Touch
| Area | Updates |
| --- | --- |
| `Static/features/phishingDesigner.js` | New feature module mirroring other admin routes (`render`, `attach`, `destroy`). Lives under the WeldSecure nav. |
| `Static/styles/features/phishingDesigner.css` | Scoped styles (form layout, preview, signal chips). Import via `styles.css`. |
| `Static/data/phishingBlueprints.js` | Immutable seed data describing available signals, channels, starter templates. |
| `Static/data.js` | Extend `AppData.ROUTES` + `NAV_GROUPS` (admin cluster) with `phishing-designer`, expose enums (channels, signal categories). |
| `Static/index.html` | Load the new data + feature script. |
| `Static/registry.js` | Register `phishing-designer` route via `featureRoute`. |
| `Static/state.js` | Add `phishingDesigner` slice (activeTemplateId, draftForm, validation errors). |
| `Static/services/stateServices.js` | Mutators such as `createPhishingDraft`, `updatePhishingDraft`, `publishPhishingDraft`. Ensure cloning + persistence. |
| `Static/components/appShell.js` | Nav button (WeldSecure group) linking to the designer route. |

---

## 4. Data & State Model
```js
window.AppData.phishingBlueprints = {
  signals: [
    { id: "lookalike-domain", label: "Lookalike domain", severity: "high" },
    { id: "mismatched-link", label: "Mismatched link text", severity: "medium" },
    ...
  ],
  channels: ["email", "sms", "teams", "slack", "qr"],
  templates: [
    {
      id: "tpl-wire-escalation",
      name: "Wire escalation",
      defaultChannel: "email",
      defaultSignals: ["lookalike-domain", "urgent-tone"]
    }
  ]
};
```

`state.phishingDesigner` shape:
```js
{
  activeTemplateId: null,
  drafts: [{ id, name, channel, payload, signalIds, targets, status }],
  form: {
    id: null,
    name: "",
    channel: "email",
    sender: { displayName: "", address: "" },
    subject: "",
    body: "",
    signalIds: [],
    targetIds: [],
    schedule: null
  },
  validation: {}
}
```
- Drafts list powers the template board.
- `form.signalIds` drive reporter sandbox hints later.
- Persist drafts in local state; seeding from AppData optional for demo.

---

## 5. Services & Business Logic
- `createPhishingDraft(payload)` â€“ clones builder form, assigns ID (use `WeldUtil.generateId`), pushes to `state.phishingDesigner.drafts`.
- `updatePhishingDraft(id, patch)` â€“ merges changes and runs validation.
- `publishPhishingDraft(id)` â€“ converts draft into `AppData.phishingSimulations` entry by:
  1. Generating campaign ID + metadata (launchDate, owner from admin persona).
  2. Appending to `window.AppData.phishingSimulations.campaigns` in-memory (demo-only) and pushing `signalIds` for reporter sandbox consumption.
  3. Calling `queuePhishingLaunch(id, { targets: ... })` to stage the campaign.
- Keep mutations declarative; render layer only calls services.

---

## 6. UI / Interaction Plan
### Template Board
- Reuse `card` styles; add filters for status (draft vs staged).
- Actions: `Edit`, `Duplicate`, `Launch now`.

### Builder Form
- Left column: collapsible sections (Envelope, Body, Signals, Targeting).
- Right column: preview with highlight overlays for selected signals.
- Provide â€œInsert tokenâ€ buttons (`{{FIRST_NAME}}`, etc.) for rapid copy tweaks.

### Validation
- Display inline errors per section + summary at top.
- Disable Launch until required fields + at least one signal + one target selected.

---

## 7. Integration Points
- **Phishing simulations module:** track new campaigns + queue state automatically once a draft is published.
- **Reporter sandbox (future feature):** store `signalIds` + template metadata in a shared data structure (e.g., `AppData.phishingSimulations.signalsByCampaign`).
- **Org directory:** target pickers pull from `DirectoryData.departments` and `teams`.

---

## 8. Implementation Phases
1. **Scaffold route & nav** â€“ add data file, route registration, blank feature & CSS.
2. **State/services** â€“ extend `state.js` + `stateServices.js` with designer slice.
3. **Template board UI** â€“ list drafts, actions, wiring to state.
4. **Builder form** â€“ sections, validation, preview.
5. **Publish flow** â€“ convert drafts to campaigns, queue launches.
6. **QA + docs** â€“ update `phishing_simulation_module.md` with new flow, smoke-test across admin persona.

---

## 9. Reporter Sandbox Execution
1. **Basic email playback:** When the designer publishes an email-channel draft, clone the envelope + body payload into `AppData.phishingSimulations.sandboxMessages` so the sandbox inbox can display the exact email copy admins composed.
2. **Reporter add-in dock:** Selecting a sandbox email should automatically call `Weld.features.reporter.openWithSandboxContext(...)` and dock the Reporter add-in on the right (~360px). The preview stays on the left so reporters read the email and submit findings side-by-side.
3. **Telemetry hook:** Include metadata (`sandboxMessageId`, optional summary copy) so WeldSecure can correlate submissions with the authored campaign without surfacing signals inside the sandbox UI.
4. **Submission cycle:** When the Reporter add-in submission fires, invoke `recordSandboxSubmission` to capture a success/follow-up flag plus timestamp so the inbox can reflect the latest status.

---

## 10. Open Questions
- Do drafts need version history or only â€œlatest editâ€?
- Should signals be globally defined (data file) or per draft?
- Is scheduling (future date) required or can we simulate immediate launch for now?
