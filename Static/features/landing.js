(function () {
  if (!window.Weld) return;

  const AppData = window.AppData || {};
  const WeldUtil = window.WeldUtil || {};
  const ROLE_LABELS = AppData.ROLE_LABELS || {};

  const features = window.Weld.features || (window.Weld.features = {});
  const landingFeature = features.landing || (features.landing = {});

  const getState =
    typeof WeldUtil.getState === "function"
      ? WeldUtil.getState
      : appState => {
          if (appState && typeof appState === "object") return appState;
          if (window.state && typeof window.state === "object") return window.state;
          if (window.Weld && typeof window.Weld.state === "object") return window.Weld.state;
          return {};
        };

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
        tone: "linear-gradient(135deg, #22c55e, #15803d)",
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
          <span class="journey-card__action">Launch journey</span>
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
          <div class="landing__badge-sample">
            <img
              src="./WeldSecure_logo.svg"
              alt="WeldSecure logo"
              class="landing__logo"
              loading="lazy"
              decoding="async"
              data-landing-badge-media
            />
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
    </div>
  `;
  }

  function ensureGuidedTourMeta(state) {
    if (!state || typeof state !== "object") return null;
    if (!state.meta || typeof state.meta !== "object") {
      state.meta = {};
    }
    const guided = state.meta.guidedTour;
    if (!guided || typeof guided !== "object") {
      state.meta.guidedTour = { enabled: true, dismissedRoutes: {} };
      return state.meta.guidedTour;
    }
    if (!guided.dismissedRoutes || typeof guided.dismissedRoutes !== "object") {
      guided.dismissedRoutes = {};
    }
    return guided;
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
        if (element.classList && element.classList.contains("journey-card")) {
          const guidedMeta = ensureGuidedTourMeta(state);
          if (guidedMeta) {
            guidedMeta.enabled = true;
            if (guidedMeta.dismissedRoutes) {
              delete guidedMeta.dismissedRoutes.addin;
            }
          }
        }
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
