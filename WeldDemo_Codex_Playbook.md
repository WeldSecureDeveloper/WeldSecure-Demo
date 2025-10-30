# Weld Demo — Monolith → Feature Modules (Codex Playbook)

> **Purpose**  
> Split `Static/app.js` into small, feature-scoped files to cut Codex token usage, while keeping the app **dependency-free** and runnable by **double-clicking `Static/index.html`**.  
> **Rules:** No bundlers. No servers. No ES modules. Use `<script>` tags + **globals on `window`** only. Each step is **resumable** and **behavior-neutral** until told otherwise.

---

## ✅ Progress Checklist (resumable)

- [ ] Phase 1: Add scaffolding files (no behavior change)
- [ ] Phase 2: Update `index.html` script order (still no behavior change)
- [ ] Phase 3: Move static constants/data → `data.js`
- [ ] Phase 4: Move state helpers → `state.js`
- [ ] Phase 5: Move tiny utilities → `util.js`
- [ ] Phase 6: Migrate features one-by-one → `features/<feature>.js`
- [ ] Phase 7 (optional): Enable `Weld` router in `main.js`
- [ ] Phase 8: Clean up `app.js` and old paths

You can **stop after any box** and the app will still work. Resume at the next unchecked box.

---

## Target Layout

```
Static/
  index.html
  styles.css
  app.js                 (existing monolith; will shrink)
  data.js                (NEW: constants/data)
  state.js               (NEW: state init + persistence)
  util.js                (NEW: tiny helpers)
  main.js                (NEW: global namespace + tiny router)
  features/              (NEW)
    badges.js            (NEW: feature files; migrate real code here)
    reporter.js
    hub.js
    orgHub.js
    dashboard.js
```

**Script load order** (top → bottom):
```
data.js  →  state.js  →  util.js  →  main.js  →  features/*.js  →  app.js
```

**Globals**
```
window.AppData     // constants + large demo arrays
window.WeldState   // initialState, loadState, saveState, storageAvailable, STORAGE_KEY
window.WeldUtil    // clone(), small DOM helpers, etc.
window.Weld        // { state, features, route, autorun, render(), navigate() }
```

---

## Phase 0 — Codex usage tips (save credits)

- Work on **one file at a time**. Close others.
- **Select only** the code to change before prompting Codex.
- Ask for **“full file outputs only (no commentary)”**.
- Use short prompts: “Extract/Move/Replace — **no behavior change**.”
- After each step: **reload `index.html`**, check console, and stop if anything breaks.  
- If Codex stops early: **don’t delete originals**. Resume later.

---

## Phase 1 — Add scaffolding (no behavior change)

Create these **plain `.js` files** (no `<script>` tags inside the files).

**`Static/data.js`**
```js
// data.js — container for static demo data & enums (migrate in Phase 3)
window.AppData = window.AppData || {};
```

**`Static/state.js`**
```js
// state.js — state init & persistence helpers (namespaced)
(function () {
  const STORAGE_KEY = 'WeldDemoState';

  function storageAvailable() {
    try { const x = '__test__'; localStorage.setItem(x, x); localStorage.removeItem(x); return true; }
    catch { return false; }
  }

  function loadState() {
    if (!storageAvailable()) return null;
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null; } catch { return null; }
  }

  function saveState(state) {
    if (!storageAvailable()) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }

  function initialState() {
    // Placeholder. After migration, mirror original structure reading from window.AppData.
    return { _placeholder: true };
  }

  window.WeldState = { STORAGE_KEY, storageAvailable, loadState, saveState, initialState };
})();
```

**`Static/util.js`**
```js
// util.js — tiny helpers; add more as you migrate
window.WeldUtil = window.WeldUtil || {
  clone(obj) { return JSON.parse(JSON.stringify(obj)); },
  el(tag, props = {}, children = []) {
    const e = document.createElement('tag');
    Object.assign(e, props);
    (Array.isArray(children) ? children : [children]).forEach(c => e.append(c));
    return e;
  },
};
```

**`Static/main.js`**
```js
// main.js — global namespace + minimal router; does NOT autorun
(function () {
  window.Weld = window.Weld || { state: null, features: {}, route: null, autorun: false };

  Weld.render = function () {
    if (!Weld.route || !Weld.features[Weld.route]) return;
    const root = document.getElementById('app') || document.body;
    root.innerHTML = '';
    Weld.features[Weld.route].render(root, Weld.state);
  };

  Weld.navigate = function (route) { Weld.route = route; Weld.render(); };

  // Later (Phase 7), after migration:
  // Weld.state = WeldState.loadState() ?? WeldState.initialState();
  // Weld.route = 'dashboard'; Weld.autorun = true; Weld.render();
})();
```

**Feature shells (placeholders now, real code later)**

**`Static/features/badges.js`**
```js
(function () {
  if (!window.Weld) return;
  Weld.features.badges = {
    render(container, state) {
      const wrap = document.createElement('div');
      wrap.innerHTML = '<h2>Badges (stub)</h2><p>Real Badges UI will be migrated here.</p>';
      container.appendChild(wrap);
    }
  };
})();
```

**`Static/features/reporter.js`**
```js
(function () {
  if (!window.Weld) return;
  Weld.features.reporter = {
    render(container, state) {
      const wrap = document.createElement('div');
      wrap.innerHTML = '<h2>Reporter (stub)</h2>';
      container.appendChild(wrap);
    }
  };
})();
```

**`Static/features/hub.js`**
```js
(function () {
  if (!window.Weld) return;
  Weld.features.hub = {
    render(container, state) {
      const wrap = document.createElement('div');
      wrap.innerHTML = '<h2>Hub (stub)</h2>';
      container.appendChild(wrap);
    }
  };
})();
```

**`Static/features/orgHub.js`**
```js
(function () {
  if (!window.Weld) return;
  Weld.features.orgHub = {
    render(container, state) {
      const wrap = document.createElement('div');
      wrap.innerHTML = '<h2>Org Hub (stub)</h2>';
      container.appendChild(wrap);
    }
  };
})();
```

**`Static/features/dashboard.js`**
```js
(function () {
  if (!window.Weld) return;
  Weld.features.dashboard = {
    render(container, state) {
      const wrap = document.createElement('div');
      wrap.innerHTML = '<h2>Dashboard (stub)</h2>';
      container.appendChild(wrap);
    }
  };
})();
```

**Acceptance (Phase 1):** No changes on screen; no console errors.

---

## Phase 2 — Update `index.html` script order (still neutral)

Find the monolith include:
```html
<script src="./app.js"></script>
```

**Replace with:**
```html
<!-- Split scaffolding (neutral; no behavior change yet) -->
<script src="./data.js"></script>
<script src="./state.js"></script>
<script src="./util.js"></script>
<script src="./main.js"></script>

<script src="./features/badges.js"></script>
<script src="./features/reporter.js"></script>
<script src="./features/hub.js"></script>
<script src="./features/orgHub.js"></script>
<script src="./features/dashboard.js"></script>

<!-- Keep monolith last so current behavior is unchanged -->
<script src="./app.js"></script>
```

**Acceptance (Phase 2):** App behaves exactly as before; console clean.

---

## Phase 3 — Move static constants/data → `data.js`

**Scope to select in `app.js`:**  
Enums (e.g., `MessageStatus`), big arrays (badges, default quests, report reasons, leaderboards, demo messages/clients), other literal constant maps.

**Codex prompt (with only those blocks selected):**
```
Extract the selected constants into Static/data.js under window.AppData,
preserving names (e.g., AppData.MessageStatus, AppData.DEFAULT_QUESTS, etc.).
Replace their definitions in app.js with references to window.AppData.<Name>.
NO BEHAVIOR CHANGES. Output full data.js and updated app.js (no commentary).
```

**Acceptance:**  
- `data.js` defines `window.AppData = { ... }` with the moved items.  
- `app.js` references `window.AppData.<Name>` where those lived.  
- Reload page; everything identical; console clean.

**If interrupted:** Keep originals; resume later with remaining constants.

---

## Phase 4 — Move state helpers → `state.js`

**Scope to select:**  
`initialState`, `loadState`, `saveState/persist`, `storageAvailable`, and any storage key constants.

**Codex prompt:**
```
Move the selected state helpers into Static/state.js.
Expose as window.WeldState = { initialState, loadState, saveState, storageAvailable, STORAGE_KEY }。
Adjust initialState to read constants from window.AppData exactly as before.
Update remaining references in app.js to call WeldState.<fn> or WeldState.STORAGE_KEY.
NO BEHAVIOR CHANGES. Output full state.js and updated app.js (no commentary).
```

**Acceptance:**  
- `state.js` exports `window.WeldState` with those functions/keys.  
- `app.js` calls `WeldState.*`.  
- Reload; state still loads/saves; console clean.

**If interrupted:** Keep both; finish remaining functions next time.

---

## Phase 5 — Move tiny utilities → `util.js`

**Scope to select:**  
`clone`, small DOM helpers, dialog helpers, pure formatting helpers.

**Codex prompt:**
```
Move these helpers into Static/util.js under window.WeldUtil (keep function names).
Replace usages in app.js accordingly (e.g., clone -> WeldUtil.clone).
NO BEHAVIOR CHANGES. Output full util.js and updated app.js (no commentary).
```

**Acceptance:** Reload; UI unchanged; console clean.

---

## Phase 6 — Migrate features one-by-one

Repeat per feature (`badges`, `reporter`, `hub`, `orgHub`, `dashboard`).

**Scope to select:**  
Rendering functions + event handlers for that feature. Keep shared helpers in `util.js`.

**Codex prompt (example for Badges):**
```
Move this feature’s rendering and event handlers into Static/features/badges.js
as an IIFE that registers:
  window.Weld.features.badges = { render(container, state) { ... } }

Inside render(), replicate the exact DOM and event wiring.
Update any entry/router call paths so when Badges is shown it uses:
  Weld.features.badges.render(container, state)

AFTER verifying parity in the browser, remove the original Badges code from app.js.
NO BEHAVIOR CHANGES. Output full features/badges.js and updated app.js (no commentary).
```

**Acceptance (per feature):**  
- Visiting the feature shows identical UI and behavior.  
- No console errors.  
- After verification, delete the old feature code from `app.js`.

**If interrupted mid-feature:** Keep original code; the app still works. Continue later.

---

## Phase 7 (optional) — Enable `Weld` router in `main.js`

After **all features** are migrated:

Append to `main.js`:
```js
Weld.state = WeldState.loadState() ?? WeldState.initialState();
Weld.route = 'dashboard';  // or your default
Weld.autorun = true;
Weld.render();
```

Remove/disable any legacy routing in `app.js` once verified.

**Acceptance:** App loads default route; navigation works.

---

## Phase 8 — Cleanup

- Remove dead code from `app.js`. If empty, delete file and its `<script>` tag.  
- Remove any leftover artifacts from earlier attempts.  
- Project-wide search for references to removed globals.

---

## Troubleshooting

- **`ReferenceError: X is not defined`**  
  Confirm value is on `window` and script order is correct (see top).  
- **Blank page after Phase 7**  
  `Weld.route` must match a registered feature; ensure `features/<feature>.js` runs and registers.  
- **localStorage issues**  
  Some browsers block localStorage for `file://` URLs in strict modes. Try a different browser or allow local file access.  
- **Duplicate UI**  
  Old and new code both render. Remove the old code only after verifying the migrated feature.

---

## Minimal Prompts (copy/paste)

- **Constants → `data.js`**
```
Extract the selected constants into Static/data.js under window.AppData (same names).
Replace in app.js with window.AppData.<Name>. NO BEHAVIOR CHANGES.
Output full data.js and updated app.js (no commentary).
```

- **State → `state.js`**
```
Move selected state helpers into Static/state.js.
Expose as window.WeldState = { initialState, loadState, saveState, storageAvailable, STORAGE_KEY }.
Update app.js calls to WeldState.* . Preserve behavior.
Output full state.js and updated app.js (no commentary).
```

- **Utils → `util.js`**
```
Move these helpers to Static/util.js under window.WeldUtil (same names).
Replace usages in app.js (e.g., clone -> WeldUtil.clone). No behavior changes.
Output full util.js and updated app.js (no commentary).
```

- **Feature → `features/<name>.js`**
```
Move this feature’s rendering + handlers into Static/features/<name>.js
as an IIFE registering window.Weld.features.<name> = { render(container, state) { ... } }.
Wire routing so the feature renders through Weld.features.<name>.render(...).
After verifying parity, remove old code from app.js.
Output full features/<name>.js and updated app.js (no commentary).
```
