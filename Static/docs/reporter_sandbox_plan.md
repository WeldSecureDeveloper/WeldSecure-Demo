# Reporter Sandbox for Phishing Sims – Implementation Plan

Companion feature that lets reporters receive simulated phishing emails assembled by the designer, interact with them inside a sandbox inbox, and respond via the existing Reporter panel (addon experience). This plan keeps the experience client-only while reusing current components.

---

## 1. Goal & Persona
- **Persona:** Reporter / frontline employee exploring the Reporter journey (addin route).
- **Objective:** Provide a safe “inbox” that streams designer-created phishing simulations, lets users inspect content, and submit reports with reason selection.
- **Success criteria:** Sandbox reflects campaigns produced via the designer (copy, channel, targeting). Reporter submissions sync telemetry (timestamps, summary, reporter identity) that WeldSecure aggregates server-side for signal analytics.

---

## 2. Experience Outline
1. **Sandbox switcher:** New nav tab under Reporter group (e.g., “Sandbox Inbox”) reachable from landing and nav shell.
2. **Inbox canvas:** Two-column layout:
   - Left: message list showing campaign name, channel icon, and submission status chips.
   - Right: message viewer with metadata (sender, links, attachments) plus neutral body styling (no hint overlays).
3. **Reporter sidebar integration:** Existing Reporter panel opens docked on the right; submissions reference the sandbox message id so WeldSecure can map reports server-side.
4. **Feedback strip:** After submitting, show a lightweight confirmation (success/follow-up) with timestamp so reporters know the action synced.

---

## 3. Files & Modules to Touch
| Area | Updates |
| --- | --- |
| `Static/features/reporterSandbox.js` | New feature module (under Reporter persona) implementing the inbox experience. |
| `Static/styles/features/reporterSandbox.css` | Scoped layout/styles; import into `styles.css`. |
| `Static/data.js` | Add route (`reporter-sandbox`) to `AppData.ROUTES`, add nav entry in Reporter group. |
| `Static/index.html` | Load feature JS. |
| `Static/registry.js` | Register new route referencing feature module. |
| `Static/state.js` | Extend defaults with `reporterSandbox` slice (messages, activeMessageId, submission history). |
| `Static/services/stateServices.js` | Mutations for selecting sandbox messages and capturing submission summaries. |
| `Static/features/reporter.js` | Expose hook to accept sandbox context (messageId) when opening the panel. |
| `Static/components/appShell.js` | Nav button under Reporter group -> sandbox route (role: customer). |

---

## 4. Data & State Model
- Reuse designer output: when publishing a draft, push payload into `AppData.phishingSimulations.sandboxMessages`:
  ```js
  {
    id: "msg-sim-q4-finance",
    campaignId: "sim-q4-finance",
    channel: "email",
    sender: { displayName, address },
    subject,
    body,
    signalIds: ["lookalike-domain", "mismatched-link"], // retained for WeldSecure-side analytics
    attachments: [],
    metadata: { linkPreview, urgencyScore }
  }
  ```
- `state.reporterSandbox`:
  ```js
  {
    messages: [],          // hydrated from AppData at init
    activeMessageId: null,
    submissions: [
      { messageId, summary: "Report synced", success: true, submittedAt }
    ]
  }
```
- On load, copy from AppData once; subsequent submissions stay in state/localStorage.

---

## 5. Services & Hooks
- `setActiveSandboxMessage(id)` – sets `activeMessageId`.
- `recordSandboxSubmission({ messageId, summary?, notes?, success? })` – invoked after Reporter panel submit; stores a lightweight result that WeldSecure correlates with backend signal analytics.
- Reporter panel should accept contextual metadata:
  - `window.openReporterSandbox(messageId)` -> opens Reporter UI with read-only subject/body while WeldSecure tracks insights server-side.
  - When the reporter submits, call `recordSandboxSubmission` and optionally send toast via existing `lastSimFeedback`.

Implementation detail: expose a `window.WeldReporterHooks` object or extend `features/reporter.js` with `setSandboxContext`.

---

## 6. UI / Interaction Details
- **Message list:** highlight active message, show badges for unread/read and whether the user already submitted a report (success/follow-up).
- **Viewer:** show structured sections (Envelope + Body) with neutral copy—no inline hinting or signal overlays.
- **Call-to-action:** Primary button “Report via Reporter” triggers existing reporter feature (maybe open modal/drawer). Use `data-route="addin"` flow but ensure we stay inside sandbox layout (dock Reporter UI).
- **Feedback panel:** After submission, show confirmation text (success/follow-up) plus timestamp so the user knows WeldSecure captured the report.

---

## 7. Integration with Existing Components
- Reporter nav needs a dedicated **Sandbox Inbox** button: register `reporter-sandbox` in `AppData.ROUTES`, add it to `NAV_GROUPS[0]`, and surface the entry under the Reporter cluster inside `appShell` so frontline users launch the sandbox directly from the nav rail.
- Mirror the nav link on the reporter landing hero (same CTA text/icon) so both the hub landing screen and persistent nav point to the sandbox route.
- When `reporter-sandbox` route renders, ensure meta role is `customer`; re-use existing gating logic (if route requires role and meta.role mismatch, use `WeldServices.setRole` before navigate).
- Reporter component should expose a method to accept sandbox payload:
```js
window.Weld.features.reporter.openWithSandboxContext({
  subject,
  body,
  sandboxMessageId
});
```
- Ensure state resets when leaving route (call `destroy` hook to clear sandbox selection/history).

---

## 8. Implementation Phases
1. **Routing & scaffolding** – add route, nav entry, empty feature + CSS, ensure guardrails (role-required) work.
2. **State/services** – extend `state.js` defaults and `stateServices` helpers.
3. **Inbox UI** – message list + viewer + submission confirmation panel.
4. **Reporter hook** – integrate with Reporter panel, pass sandbox context, capture submissions.
5. **Feedback & history** – show success/miss metrics, wiring to admin telemetry (optionally update `phishing-sims` metrics).
6. **QA & documentation** – document flow in `phishing_designer_plan.md` / `phishing_simulation_module.md`.

---

## 9. Open Questions
- Should sandbox messages expire or rotate automatically (e.g., per day)?
- How much of the Reporter UI should be embedded vs launched as existing modal?
- Do we need scoring/leaderboard for reporters inside sandbox, or is per-message feedback enough?
