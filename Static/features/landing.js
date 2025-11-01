(function () {
  if (!window.Weld) return;

  const AppData = window.AppData || {};
  const WeldUtil = window.WeldUtil || {};
  const ROLE_LABELS = AppData.ROLE_LABELS || {};

  const features = window.Weld.features || (window.Weld.features = {});
  const landingFeature = features.landing || (features.landing = {});

  function getState(appState) {
    if (appState && typeof appState === "object") return appState;
    if (window.state && typeof window.state === "object") return window.state;
    if (window.Weld && typeof window.Weld.state === "object") return window.Weld.state;
    return {};
  }

  function renderLandingMarkup() {
    const journeyCards = [
      {
        title: "Reporter Journey",
        description:
          "Show how frontline reporters spot suspicious emails, earn points, and redeem curated rewards.",
        tone: "linear-gradient(135deg, #6f47ff, #3623de)",
        role: "customer",
        route: "addin"
      },
      {
        title: "Organisation Journey",
        description: "Demonstrate analytics, reporting cadence, and insights security leaders rely on.",
        tone: "linear-gradient(135deg, #ff8a80, #ff4d6d)",
        role: "client",
        route: "client-dashboard"
      },
      {
        title: "WeldSecure Journey",
        description:
          "Highlight how Weld curates multi-tenant success with organisation health signals and playbooks.",
        tone: "linear-gradient(135deg, #0ea5e9, #2563eb)",
        role: "admin",
        route: "weld-admin"
      }
    ]
      .map(card => {
        const roleMeta = card.role ? ROLE_LABELS[card.role] : null;
        const chipClass = card.chipClass || (roleMeta ? roleMeta.chip : "");
        const chipLabel = card.chipLabel || (roleMeta ? roleMeta.label : "");
        return `
        <button class="journey-card" style="--tone:${card.tone}" data-role="${card.role || ""}" data-route="${card.route}">
          ${
            chipLabel
              ? `<div class="chip ${chipClass}">
                  <span class="chip__dot"></span>${chipLabel}
                </div>`
              : ""
          }
          <h3>${card.title}</h3>
          <p>${card.description}</p>
          <span class="journey-card__action">${
            card.route === "client-badges"
              ? "Explore badges"
              : card.route === "addin"
              ? "Launch task pane"
              : "Launch journey"
          }</span>
        </button>
      `;
      })
      .join("");

    return `
    <div class="landing">
      <section class="landing__hero">
        <div class="landing__intro">
          <span class="landing__eyebrow">Product tour</span>
          <h1 class="landing__headline">Weld keeps human vigilance rewarding.<span>Walk through every journey in minutes.</span></h1>
          <p class="landing__lead">Select the experience you want to explore. Each journey mirrors the shipping SaaS surfaces with live-feeling interactions and updated metrics--no backend required.</p>
        </div>
        <div class="landing__visual">
          <div
            class="landing__badge-sample"
            role="button"
            tabindex="0"
            aria-label="Replay badge animation"
            data-landing-badge
          >
            <svg class="badge" xmlns="http://www.w3.org/2000/svg" height="440" width="440" viewBox="-40 -40 440 440">
              <circle class="outer" fill="#F9D535" stroke="#fff" stroke-width="8" stroke-linecap="round" cx="180" cy="180" r="157"></circle>
              <circle class="inner" fill="#DFB828" stroke="#fff" stroke-width="8" cx="180" cy="180" r="108.3"></circle>
              <path class="inline" d="M89.4 276.7c-26-24.2-42.2-58.8-42.2-97.1 0-22.6 5.6-43.8 15.5-62.4m234.7.1c9.9 18.6 15.4 39.7 15.4 62.2 0 38.3-16.2 72.8-42.1 97" stroke="#CAA61F" stroke-width="7" stroke-linecap="round" fill="none"></path>
              <g class="star">
                <path fill="#F9D535" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" d="M180 107.8l16.9 52.1h54.8l-44.3 32.2 16.9 52.1-44.3-32.2-44.3 32.2 16.9-52.1-44.3-32.2h54.8z"></path>
                <circle fill="#DFB828" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" cx="180" cy="107.8" r="4.4"></circle>
                <circle fill="#DFB828" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" cx="223.7" cy="244.2" r="4.4"></circle>
                <circle fill="#DFB828" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" cx="135.5" cy="244.2" r="4.4"></circle>
                <circle fill="#DFB828" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" cx="108.3" cy="160.4" r="4.4"></circle>
                <circle fill="#DFB828" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" cx="251.7" cy="160.4" r="4.4"></circle>
              </g>
            </svg>
          </div>
        </div>
      </section>
      <section class="landing__section landing__section--journeys">
        <header class="landing__section-header">
          <div>
            <span class="landing__section-eyebrow">Journeys</span>
            <h2>Explore WeldSecure from every stakeholder lens.</h2>
            <p>Select a view to tailor the narrative to reporters, organisation leaders, or Weld operators.</p>
          </div>
        </header>
        <div class="landing__tiles">
          ${journeyCards}
        </div>
      </section>
      <section class="landing__section landing__section--features">
        <header class="landing__section-header">
          <div>
            <span class="landing__section-eyebrow">Feature showcase</span>
            <h2>Jump straight to the demo moments that resonate.</h2>
            <p>Use these cards to spotlight the metrics, recognition, and automation flows that close deals.</p>
          </div>
        </header>
        <div class="landing__tiles landing__tiles--features">
          ${renderFeatureShowcase()}
        </div>
      </section>
    </div>
  `;
  }

  function renderFeatureShowcase() {
    const featureCards = [
      {
        title: "Reporter journey",
        description: "Launch the task pane to demonstrate reporting, instant recognition, and success animations.",
        icon: "outlook",
        action: { label: "Launch add-in", route: "addin" }
      },
      {
        title: "Badge gallery",
        description: "Browse all 30 WeldSecure badges with filters, points, and storytelling angles.",
        icon: "medal",
        action: { label: "View badges", route: "client-badges", role: "customer" }
      },
      {
        title: "Quest catalogue",
        description: "Show how organisations curate and publish quest experiences directly into employee hubs.",
        icon: "lightbulb",
        action: { label: "Open quest catalogue", route: "client-quests", role: "client" }
      },
      {
        title: "Recognition metrics",
        description: "Preview reporter points, pending approvals, and redemption data in one glance.",
        icon: "medal",
        action: { label: "Open reporter profile", route: "customer", role: "customer" }
      },
      {
        title: "Automation playbooks",
        description: "Explain how Weld orchestrates cross-tenant interventions during risk spikes.",
        icon: "gear",
        action: { label: "Show admin controls", route: "weld-admin", role: "admin" }
      },
      {
        title: "Reporting insights",
        description: "Dive into dashboards and exports that give security teams weekly confidence.",
        icon: "target",
        action: { label: "Open security dashboard", route: "client-reporting", role: "client" }
      }
    ];

    return featureCards
      .map(card => {
        const iconMarkup =
          WeldUtil && typeof WeldUtil.renderIcon === "function"
            ? WeldUtil.renderIcon(card.icon, "sm")
            : "";
        return `
        <article class="feature-card">
          <div class="feature-card__icon">${iconMarkup}</div>
          <div class="feature-card__body">
            <h3>${card.title}</h3>
            <p>${card.description}</p>
          </div>
          <button type="button" class="feature-card__action" data-route="${card.action.route}" data-role="${card.action.role || ""}">
            ${card.action.label}
          </button>
        </article>
      `;
      })
      .join("");
  }

  function attachLandingEvents(container, appState) {
    if (!container) return;
    const state = getState(appState);

    const handleRouteClick = element => {
      const route = element.getAttribute("data-route");
      const role = element.getAttribute("data-role");
      if (!route) return;
      if (state && state.meta && route === "addin") {
        state.meta.addinScreen = "report";
      }
      if (role) {
        if (typeof window.setRole === "function") {
          window.setRole(role, route);
        } else if (state && state.meta) {
          state.meta.role = role;
          state.meta.route = route;
          if (typeof window.renderApp === "function") {
            window.renderApp();
          }
        }
      } else if (typeof window.navigate === "function") {
        window.navigate(route);
      } else if (state && state.meta) {
        state.meta.route = route;
        if (route === "landing") {
          state.meta.role = null;
        }
        if (typeof window.renderApp === "function") {
          window.renderApp();
        }
      }
    };

    container.querySelectorAll(".journey-card[data-route]").forEach(button => {
      button.addEventListener("click", () => handleRouteClick(button));
    });

    container.querySelectorAll(".feature-card__action[data-route]").forEach(button => {
      button.addEventListener("click", () => handleRouteClick(button));
    });

    const landingBadge = container.querySelector("[data-landing-badge]");
    if (landingBadge) {
      const restartAnimation = () => {
        const svg = landingBadge.querySelector("svg");
        if (!svg) return;
        const clone = svg.cloneNode(true);
        svg.replaceWith(clone);
      };
      landingBadge.addEventListener("click", () => {
        restartAnimation();
      });
      landingBadge.addEventListener("keydown", event => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        restartAnimation();
      });
    }
  }

  landingFeature.template = function template(appState) {
    return renderLandingMarkup(getState(appState));
  };

  landingFeature.render = function render(container, appState) {
    if (!container) return;
    const state = getState(appState);
    container.innerHTML = renderLandingMarkup(state);
    attachLandingEvents(container, state);
  };

  landingFeature.attach = function attach(container, appState) {
    if (!container) return;
    attachLandingEvents(container, appState);
  };
})();
