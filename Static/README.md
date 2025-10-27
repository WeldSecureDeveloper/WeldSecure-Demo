# WeldSecure (Static Edition)

This repository contains a dependency-free walkthrough of the WeldSecure SaaS experience. Everything runs on vanilla HTML, CSS, and JavaScript -- open `index.html` in a browser and you are ready to demo. No package installation, build tooling, or Node runtime is required.

## Features
- Journey picker & navigation for switching between the Reporter Journey, Hub, Organisation Hub, Security Team Dashboard, and Badges experiences.
- Reporter rewards view showing live point balances, redemption flow, recent reports, and reward history with instant redemption feedback.
- Organisation Hub highlighting weekly momentum, dominant threat signals, and top reporters, plus a CSV-export cue.
- Security team dashboard workspace where approving or rejecting submissions immediately updates reporter points and open cases.
- Weld admin workspace summarising multi-tenant health, open cases, active users, and recommended playbooks with contextual dialogs.
- Reporter journey rendered inside a pixel-aligned task pane, demonstrating the report submission flow that feeds the reporter profile.
- Badge gallery with category filters, contextual totals, and persistent theme selection.
- Reset demo controls and modals on every route to return to the initial story.

All state is stored in-memory (with a small `localStorage` bridge so a refresh keeps context). Refreshing with `Shift+Reload` or pressing "Reset demo data" returns everything to the starting position.

## Usage
1. Clone or download this directory.
2. Open `index.html` in Microsoft Edge, Chrome, or any modern browser.
3. Explore the journeys:
   - Use the landing page cards or the top navigation to jump between personas.
   - Switch tabs within the interface via the left-hand navigation where available.
   - Click "Reset demo data" in the header whenever you want to rewind.

That's it -- no additional tooling required.

## Repository structure
```
Static/
|-- index.html   # Entry point and markup shell
|-- styles.css   # On-brand styling (Rubik font, gradients, layout, responsiveness)
|-- app.js       # Demo state, routing, rendering logic, dialogs, and interactions
`-- README.md    # This guide
```

Feel free to customise branding, content, or data by editing `app.js`. Rendering helpers are organised by journey to make modifications straightforward.
