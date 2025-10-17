# Weld Investor Demo (Static Edition)

This repository contains a dependency-free, static version of the Weld investor demo. Everything runs on vanilla HTML, CSS, and JavaScript—open `index.html` in a browser and you are ready to present. No package installation, build tooling, or Node runtime is required.

## Features

- **Journey picker** to launch the Customer, Client Admin, Weld Admin, or Outlook add-in experiences.
- **Customer rewards view** with live point balances, redemption flow, recent reports, and reward history.
- **Client admin dashboard** highlighting weekly momentum, dominant threat reasons, and top reporters.
- **Client admin reporting workspace** where approving/rejecting submissions instantly updates customer points.
- **Weld admin studio** summarising multi-tenant health, cases, and recommended playbooks.
- **Pixel-aligned Outlook add-in simulation** showing the report flow that feeds the customer journey.
- **Reset demo** button to return to the initial investor narrative at any time.

All state is stored in-memory (with a small `localStorage` bridge so a refresh keeps context). Refreshing with `Shift+Reload` or pressing “Reset demo” returns everything to the starting position.

## Usage

1. Clone or download this directory.
2. Open `index.html` in Microsoft Edge, Chrome, or any modern browser.
3. Present the journeys:
   - Use the landing page cards to jump between personas.
   - Switch tabs within the interface via the left-hand navigation.
   - Click “Reset demo data” in the header whenever you want to rewind.

That’s it—no additional tooling required.

## Repository structure

```
investor-demo-static/
├── index.html        # Entry point and markup shell
├── styles.css        # On-brand styling (Rubik font, gradients, layout)
├── app.js            # Demo state, routing, rendering logic, and interactions
└── README.md         # This guide
```

Feel free to customise branding, content, or data by editing `app.js`. The rendering helpers are organised by journey to make modifications straightforward.
