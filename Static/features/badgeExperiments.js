(function () {
  if (!window.Weld) return;

  const features = window.Weld.features || (window.Weld.features = {});
  const baseBadgesFeature = () => window.Weld?.features?.badges || null;
  const { WeldUtil } = window;

  const tierConfig = [
    { id: "diamond", label: "Diamond", tier: 10, summary: "Powered users who unlocked every storyline", tone: "diamond" },
    { id: "platinum", label: "Platinum", tier: 9, summary: "For squads that sustain perfect detection habits", tone: "platinum" },
    { id: "gold", label: "Gold", tier: 8, summary: "Champions who keep phishing losses at zero", tone: "gold" },
    { id: "silver", label: "Silver", tier: 7, summary: "Managers with 100% enablement completion", tone: "silver" },
    { id: "bronze", label: "Bronze", tier: 6, summary: "Squads building early streak momentum", tone: "bronze" },
    { id: "ruby", label: "Ruby", tier: 5, summary: "Change-makers who run quarterly playbooks", tone: "ruby" },
    { id: "sapphire", label: "Sapphire", tier: 4, summary: "Specialists curating industry-specific threats", tone: "sapphire" },
    { id: "emerald", label: "Emerald", tier: 3, summary: "Teams closing reports within hours", tone: "emerald" },
    { id: "amethyst", label: "Amethyst", tier: 2, summary: "Creators experimenting with badge iconography", tone: "amethyst" },
    { id: "obsidian", label: "Obsidian", tier: 1, summary: "Fresh squads exploring starter templates", tone: "obsidian" }
  ];

  features.badgeExperiments = {
    render(container, appState) {
      if (!container) return;
      const stateRef = appState || window.state || {};
      container.innerHTML = `
        <section class="badge-experiments">
          ${renderLabHero()}
          ${renderTierGrid()}
          <div class="badge-experiments__catalogue" aria-label="Current badge catalogue"></div>
        </section>
      `;

      initAnimatedTierBadges(container);

      const catalogueTarget = container.querySelector(".badge-experiments__catalogue");
      const baseFeature = baseBadgesFeature();
      if (catalogueTarget && baseFeature && typeof baseFeature.render === "function") {
        baseFeature.render(catalogueTarget, stateRef);
      } else if (catalogueTarget) {
        catalogueTarget.innerHTML = `
          <div class="badge-experiments__fallback">
            <p>Unable to load the badge catalogue preview right now.</p>
          </div>
        `;
      }
    }
  };

  function renderLabHero() {
    return `
      <header class="badge-experiments__hero">
        <div class="badge-experiments__intro">
          <span class="badge-experiments__eyebrow">Badge Lab</span>
          <h1>Experiment with cinematic badge animations.</h1>
          <p>We're prototyping an animated ten-tier system that pairs gradients, motion and particles with the existing catalogue data. Explore the motion system below and keep the classic list handy right underneath.</p>
        </div>
        <div class="badge-experiments__stats">
          <article>
            <strong>10</strong>
            <span>Tiers</span>
          </article>
          <article>
            <strong>4</strong>
            <span>Micro-interactions</span>
          </article>
          <article>
            <strong>2x</strong>
            <span>Engagement lift target</span>
          </article>
        </div>
      </header>
    `;
  }

  function renderTierGrid() {
    return `
      <section class="badge-experiments__grid" aria-label="Animated tier prototypes">
        ${tierConfig.map(renderTierCard).join("")}
      </section>
    `;
  }

  function renderTierCard(tier) {
    const toneClass = `badge-tier badge-tier--${tier.tone}`;
    const safeLabel = WeldUtil?.escapeHtml ? WeldUtil.escapeHtml(tier.label) : tier.label;
    const safeSummary = WeldUtil?.escapeHtml ? WeldUtil.escapeHtml(tier.summary) : tier.summary;
    const safeTier = WeldUtil?.escapeHtml ? WeldUtil.escapeHtml(String(tier.tier)) : tier.tier;
    return `
      <article class="badge-experiments__card">
        <div class="${toneClass}" data-tier="${tier.id}">
          <span class="badge-tier__shine" aria-hidden="true"></span>
          <span class="badge-tier__particles" aria-hidden="true"></span>
          ${renderBadgeIcon()}
          <span class="badge-tier__label">${safeLabel.toUpperCase()}</span>
        </div>
        <footer>
          <strong>${safeLabel}</strong>
          <span class="badge-experiments__tier-label">Level ${safeTier}</span>
          <p>${safeSummary}</p>
        </footer>
      </article>
    `;
  }

  function renderBadgeIcon() {
    return `
      <span class="badge-tier__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
        </svg>
      </span>
    `;
  }

  function initAnimatedTierBadges(root) {
    if (!root) return;
    const badges = root.querySelectorAll(".badge-tier");
    badges.forEach(badge => {
      const particleHost = badge.querySelector(".badge-tier__particles");
      if (!particleHost) return;
      particleHost.innerHTML = "";
      for (let i = 0; i < 12; i += 1) {
        const particle = document.createElement("span");
        particle.className = "badge-tier__particle";
        const size = Math.random() * 3 + 3;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 2}s`;
        particleHost.appendChild(particle);
      }

      badge.addEventListener("mouseenter", () => {
        const particles = particleHost.querySelectorAll(".badge-tier__particle");
        particles.forEach((particle, index) => {
          particle.style.animationDelay = `${index * 0.1}s`;
        });
      });
    });
  }
})();
