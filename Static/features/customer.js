(function () {
  if (!window.Weld) return;

  const AppData = window.AppData || {};
  const MessageStatus = AppData.MessageStatus || {};
  const features = window.Weld.features || (window.Weld.features = {});
  const customerFeature = features.customer || (features.customer = {});
  const WeldUtil = window.WeldUtil || {};
  const formatNumber = typeof window.formatNumber === 'function' ? window.formatNumber : value => Number(value) || 0;
  const formatDateTime = typeof window.formatDateTime === 'function' ? window.formatDateTime : value => value || '';
  const relativeTime = typeof window.relativeTime === 'function' ? window.relativeTime : value => value || '';
  const CONFIG_ICON =
    (AppData.ICONS && AppData.ICONS.settings) ||
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true" focusable="false">
      <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.427-1.756 3.002-1.756 3.429 0a1.724 1.724 0 002.586 1.066c1.544-.89 3.31.876 2.42 2.42a1.724 1.724 0 001.065 2.572c1.756.426 1.756 3.002 0 3.429a1.724 1.724 0 00-1.066 2.586c.89 1.544-.876 3.31-2.42 2.42a1.724 1.724 0 00-2.586 1.065c-.426 1.756-3.002 1.756-3.429 0a1.724 1.724 0 00-2.586-1.066c-1.544.89-3.31-.876-2.42-2.42a1.724 1.724 0 00-1.065-2.586c-1.756-.426-1.756-3.002 0-3.429a1.724 1.724 0 001.066-2.586c-.89-1.544.876-3.31 2.42-2.42a1.724 1.724 0 002.586-1.065z"/>
      <circle cx="12" cy="12" r="3" />
    </svg>`;

  function getState(appState) {
    if (appState && typeof appState === 'object') return appState;
    if (window.Weld && typeof window.Weld.state === 'object') return window.Weld.state;
    if (typeof window.state === 'object') return window.state;
    return {};
  }

function renderRecognitionCard(entry, currentEmail) {
  if (!entry) return "";
  const currentKey = typeof currentEmail === "string" ? currentEmail.trim().toLowerCase() : "";
  const recipientEmail =
    typeof entry.recipientEmail === "string" ? entry.recipientEmail.trim() : "";
  const senderName = entry.senderName || entry.senderEmail || "Teammate";
  const recipientName = entry.recipientName || recipientEmail || "Teammate";
  const isForCurrentUser =
    currentKey && recipientEmail && recipientEmail.toLowerCase() === currentKey;
  const pointsValue = Number(entry.points) || 0;
  const pointsMarkup =
    pointsValue > 0
      ? `<span class="recognition-card__points">+${formatNumber(pointsValue)} pts</span>`
      : "";
  const focusLabel =
    typeof entry.focus === "string" && entry.focus.trim().length > 0
      ? entry.focus.trim()
      : "Recognition spotlight";
  const channelLabel =
    typeof entry.channel === "string" && entry.channel.trim().length > 0
      ? entry.channel.trim()
      : null;
  const contextLabel = isForCurrentUser ? "For you" : `For ${recipientName}`;
  const createdAt = typeof entry.createdAt === "string" ? entry.createdAt : "";
  const parsedDate = createdAt ? new Date(createdAt) : null;
  const hasValidDate = parsedDate && !Number.isNaN(parsedDate.getTime());
  const relativeLabel = hasValidDate ? relativeTime(createdAt) : "Just now";
  const absoluteLabel = hasValidDate ? formatDateTime(createdAt) : "";
  const timeMarkup = hasValidDate
    ? `<time datetime="${WeldUtil.escapeHtml(createdAt)}" title="${WeldUtil.escapeHtml(absoluteLabel)}">${WeldUtil.escapeHtml(
        relativeLabel
      )}</time>`
    : `<span class="recognition-card__time">Just now</span>`;
  const tagMarkup = channelLabel
    ? `<span class="recognition-card__tag">${WeldUtil.escapeHtml(channelLabel)}</span>`
    : "";
  const entryId =
    entry?.id !== undefined && entry?.id !== null
      ? WeldUtil.escapeHtml(String(entry.id))
      : WeldUtil.escapeHtml(WeldUtil.generateId("recognition"));

  return `
    <article class="recognition-card${isForCurrentUser ? " recognition-card--highlight" : ""}" data-recognition="${entryId}">
      <header class="recognition-card__header">
        <span class="recognition-card__eyebrow">${WeldUtil.escapeHtml(contextLabel)}</span>
        ${tagMarkup}
        ${pointsMarkup}
      </header>
      <div class="recognition-card__body">
        <h4 class="recognition-card__title">${WeldUtil.escapeHtml(focusLabel)}</h4>
        <p class="recognition-card__message">${WeldUtil.escapeHtml(entry.message || "")}</p>
      </div>
      <footer class="recognition-card__footer">
        <div class="recognition-card__actors">
          <span>${WeldUtil.escapeHtml(senderName)}</span>
          <span aria-hidden="true">&rarr;</span>
          <span>${WeldUtil.escapeHtml(recipientName)}</span>
        </div>
        ${timeMarkup}
      </footer>
    </article>
  `;
}


function renderCustomerHub(state) {
  const customerMessages = state.messages.filter(messageBelongsToCustomer);
  const pendingMessages = customerMessages.filter(message => message.status === MessageStatus.PENDING);
  const pendingApprovalPoints = pendingMessages.reduce((sum, message) => sum + (message.pointsOnApproval || 0), 0);
  const publishedRewards = state.rewards.filter(reward => reward.published);
  const publishedQuests = Array.isArray(state.quests)
    ? state.quests.filter(quest => quest.published).sort(WeldUtil.compareQuestsByDifficulty)
    : [];
  const publishedBadges = getBadges().filter(badge => badge.published);
  const bonusConfig = state.customer?.bonusPoints || {};
  const rawCap = Number(bonusConfig.weeklyCap);
  const weeklyCap = Math.max(0, Number.isFinite(rawCap) ? rawCap : 0);
  const earnedRaw = Number(
    bonusConfig.earnedThisWeek ?? bonusConfig.earned ?? bonusConfig.current ?? 0
  );
  const earnedThisWeek = Math.max(0, Number.isFinite(earnedRaw) ? earnedRaw : 0);
  const progressPercent =
    weeklyCap > 0 ? Math.min(100, Math.round((earnedThisWeek / weeklyCap) * 100)) : 0;
  const remainingThisWeek = weeklyCap > 0 ? Math.max(0, weeklyCap - earnedThisWeek) : 0;
  const bonusProgressLabel =
    weeklyCap > 0
      ? `Bonus points earned this week: ${formatNumber(earnedThisWeek)} of ${formatNumber(weeklyCap)} points.`
      : `Bonus points earned this week: ${formatNumber(earnedThisWeek)} points.`;
  const breakdownEntries = Array.isArray(bonusConfig.breakdown) ? bonusConfig.breakdown : [];
  const doublePointsTotal = breakdownEntries.reduce((sum, entry) => {
    if (!entry || entry.firstOfMonthDouble !== true) return sum;
    const value = Number(entry.points);
    return sum + (Number.isFinite(value) ? value : 0);
  }, 0);
  const boostPercentOfTrackRaw =
    weeklyCap > 0 ? Math.round((doublePointsTotal / weeklyCap) * 100) : 0;
  const boostPercentOfTrack = Math.max(
    0,
    Math.min(progressPercent, boostPercentOfTrackRaw)
  );
  const boostActive = boostPercentOfTrack > 0;
  const boostDescription = boostActive
    ? `Double points segment: ${formatNumber(doublePointsTotal)} bonus points.`
    : "";
  const boostMarkup = boostActive
    ? `<span class="points-bonus__meter-boost" style="--bonus-boost:${boostPercentOfTrack}%;" aria-label="${WeldUtil.escapeHtml(
        boostDescription
      )}">
        <span class="points-bonus__boost-label" aria-hidden="true">x2</span>
      </span>`
    : "";
  const bonusMeterLabel = boostActive
    ? `${bonusProgressLabel} Includes an orange x2 segment representing ${formatNumber(doublePointsTotal)} double points.`
    : bonusProgressLabel;
  let bonusSourcesCount = 0;
  const bonusBreakdownMarkup = (() => {
    const items = breakdownEntries
      .map((entry, index) => {
        if (!entry || typeof entry !== "object") return null;
        const label =
          typeof entry.label === "string" && entry.label.trim().length > 0 ? entry.label.trim() : "";
        if (!label) return null;
        const normalizedId =
          typeof entry.id === "string" && entry.id.trim().length > 0
            ? entry.id.trim()
            : `bonus-source-${index + 1}`;
        const description =
          typeof entry.description === "string" && entry.description.trim().length > 0
            ? entry.description.trim()
            : "";
        const pointsValue = Number(entry.points);
        const points = Number.isFinite(pointsValue) ? pointsValue : 0;
        const isDouble = entry.firstOfMonthDouble === true;
        const tooltipParts = [];
        if (description) tooltipParts.push(description);
        const pointsLabel = `+${formatNumber(points)} pts${isDouble ? " (double)" : ""}`;
        tooltipParts.push(pointsLabel);
        if (isDouble) {
          tooltipParts.push("First quest completion this month delivered double points.");
        }
        const tooltipText = tooltipParts.join(" � ");
        const sourceClasses = [
          "points-bonus__source",
          isDouble ? "points-bonus__source--boost" : ""
        ]
          .filter(Boolean)
          .join(" ");
        const boostBadge = isDouble
          ? `<span class="points-bonus__source-boost" aria-hidden="true">x2</span>`
          : "";
        return `
          <span
            class="${sourceClasses}"
            role="listitem"
            tabindex="0"
            data-source="${WeldUtil.escapeHtml(normalizedId)}"
            data-tooltip="${WeldUtil.escapeHtml(tooltipText)}"
            title="${WeldUtil.escapeHtml(tooltipText)}"
            aria-label="${WeldUtil.escapeHtml(tooltipText)}">
            <span class="points-bonus__source-label">${WeldUtil.escapeHtml(label)}</span>
            ${boostBadge}
            <span class="points-bonus__source-points">+${formatNumber(points)} pts</span>
          </span>
        `;
      })
      .filter(Boolean);
    bonusSourcesCount = items.length;
    if (items.length === 0) {
      return `<p class="points-bonus__empty">Activate quests and behaviour nudges to unlock bonus point sources.</p>`;
    }
    return `<div class="points-bonus__sources" role="list">${items.join("")}</div>`;
  })();
  const bonusHoverNote =
    bonusSourcesCount > 0
      ? `<p class="points-bonus__note">Hover or focus a source to see this week's bonus story.</p>`
      : "";
  const remainingLabelMarkup =
    weeklyCap > 0
      ? remainingThisWeek === 0
        ? `<span class="points-bonus__meter-remaining points-bonus__meter-remaining--met">Cap reached</span>`
        : `<span class="points-bonus__meter-remaining">${formatNumber(remainingThisWeek)} pts left</span>`
      : `<span class="points-bonus__meter-remaining">No cap set</span>`;
  const bonusCapLabel = weeklyCap > 0 ? `${formatNumber(weeklyCap)} pt cap` : "No cap set";
  const bonusScaleHtml = `
      <div class="points-bonus" role="region" aria-label="Weekly bonus points">
        <div class="points-bonus__header">
          <h3>Weekly bonus points</h3>
          <span class="points-bonus__cap">${WeldUtil.escapeHtml(bonusCapLabel)}</span>
        </div>
        <p class="points-bonus__summary">
          Earn extra points from quests and team boosts. Reporting suspicious emails always awards your core points outside this cap.
        </p>
        <div class="points-bonus__meter" role="img" aria-label="${WeldUtil.escapeHtml(bonusMeterLabel)}">
          <div class="points-bonus__meter-track">
            <span class="points-bonus__meter-fill" style="--bonus-progress:${progressPercent}%;"></span>
            ${boostMarkup}
          </div>
          <div class="points-bonus__meter-labels">
            <span class="points-bonus__meter-value">+${formatNumber(earnedThisWeek)} pts</span>
            ${remainingLabelMarkup}
          </div>
        </div>
        ${bonusBreakdownMarkup}
        ${bonusHoverNote}
      </div>
    `;

  const recognitionEntries = getRecognitions()
    .slice()
    .sort(
      (a, b) =>
        new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime()
    );
  const lowerCustomerEmail =
    typeof state.customer?.email === "string"
      ? state.customer.email.trim().toLowerCase()
      : "";
  const recognitionReceived = lowerCustomerEmail
    ? recognitionEntries.filter(entry => {
        const email =
          typeof entry.recipientEmail === "string"
            ? entry.recipientEmail.trim().toLowerCase()
            : "";
        return email === lowerCustomerEmail;
      })
    : [];
  const recognitionGiven = lowerCustomerEmail
    ? recognitionEntries.filter(entry => {
        const email =
          typeof entry.senderEmail === "string"
            ? entry.senderEmail.trim().toLowerCase()
            : "";
        return email === lowerCustomerEmail;
      })
    : [];
  const recognitionPointsTotal = recognitionReceived.reduce(
    (sum, entry) => sum + (Number(entry.points) || 0),
    0
  );
  const recognitionGivenPoints = recognitionGiven.reduce(
    (sum, entry) => sum + (Number(entry.points) || 0),
    0
  );
  const recognitionPeerCount = (() => {
    const peers = new Set();
    recognitionReceived.forEach(entry => {
      const email =
        typeof entry.senderEmail === "string"
          ? entry.senderEmail.trim().toLowerCase()
          : "";
      if (email) peers.add(email);
    });
    return peers.size;
  })();
  const validRecognitionFilters = ["received", "given", "all"];
  const storedFilter =
    typeof state.meta.recognitionFilter === "string"
      ? state.meta.recognitionFilter.trim().toLowerCase()
      : "";
  const activeRecognitionFilter = validRecognitionFilters.includes(storedFilter)
    ? storedFilter
    : "received";
  const recognitionFeedSource =
    activeRecognitionFilter === "received"
      ? recognitionReceived
      : activeRecognitionFilter === "given"
      ? recognitionGiven
      : recognitionEntries;
  const recognitionFeedEntries = recognitionFeedSource.slice(0, 4);
  const recognitionEmptyCopy =
    activeRecognitionFilter === "given"
      ? "Share a recognition note to spotlight a teammate's vigilance, award bonus points, and trigger a x2 quest boost for you both."
      : activeRecognitionFilter === "received"
      ? "No teammate recognition yet. Highlight a story to invite recognition from the wider team and unlock that x2 quest boost."
      : "Recognition moments will appear here as teams swap kudos and line up double quest points.";
  const recognitionFeedMarkup = recognitionFeedEntries.length
    ? recognitionFeedEntries
        .map(entry => renderRecognitionCard(entry, state.customer.email))
        .join("")
    : `<div class="recognition-empty"><p>${WeldUtil.escapeHtml(recognitionEmptyCopy)}</p></div>`;
  const recognitionFilterButtons = [
    { id: "received", label: "Got" },
    { id: "given", label: "Gave" },
    { id: "all", label: "All" }
  ]
    .map(filter => {
      const isActive = activeRecognitionFilter === filter.id;
      return `<button type="button" class="recognition-filter${isActive ? " recognition-filter--active" : ""}" data-recognition-filter="${filter.id}">${WeldUtil.escapeHtml(filter.label)}</button>`;
    })
    .join("");
  const recognitionControlsMarkup = `
    <div class="recognition-feed__controls" role="toolbar" aria-label="Filter recognition stories">
      ${recognitionFilterButtons}
    </div>
  `;
  const latestRecognition = recognitionReceived[0] || null;
  const latestSnippet = (() => {
    if (!latestRecognition) {
      return `<div class="recognition-summary__recent recognition-summary__recent--placeholder"><p>Encourage peers to celebrate your catches and they'll appear here.</p></div>`;
    }
    const iso =
      typeof latestRecognition.createdAt === "string"
        ? latestRecognition.createdAt
        : "";
    const parsed = iso ? new Date(iso) : null;
    const hasValidDate = parsed && !Number.isNaN(parsed.getTime());
    const relativeLabel = hasValidDate ? relativeTime(iso) : "Just now";
    const message =
      typeof latestRecognition.message === "string"
        ? latestRecognition.message.trim()
        : "";
    const snippet =
      message.length > 120 ? `${message.slice(0, 117)}...` : message;
    const senderLabel =
      latestRecognition.senderName ||
      latestRecognition.senderEmail ||
      "Teammate";
    const focusLabel =
      typeof latestRecognition.focus === "string" &&
      latestRecognition.focus.trim().length > 0
        ? latestRecognition.focus.trim()
        : "";
    const focusMarkup = focusLabel ? ` - ${WeldUtil.escapeHtml(focusLabel)}` : "";
    const snippetMarkup = snippet
      ? `<blockquote class="recognition-summary__quote">"${WeldUtil.escapeHtml(
          snippet
        )}"</blockquote>`
      : "";
    return `
      <div class="recognition-summary__recent">
        <span class="recognition-summary__recent-label">Latest recognition</span>
        <p><strong>${WeldUtil.escapeHtml(senderLabel)}</strong> ${WeldUtil.escapeHtml(
          relativeLabel
        )}${focusMarkup}</p>
        ${snippetMarkup}
      </div>
    `;
  })();
  const recognitionSummaryHelper =
    recognitionGivenPoints > 0
      ? `You have passed on ${formatNumber(
          recognitionGivenPoints
        )} pts to your teammates and lined up a x2 quest boost for both sides.`
      : "Share recognition when someone stops a threat to award bonus points and unlock a x2 quest boost for you and them.";
  const recognitionSummaryHtml = `
    <article class="recognition-summary">
      <span class="recognition-summary__eyebrow">Teammate recognition</span>
      <h3 class="recognition-summary__title">Vigilance kudos</h3>
      <div class="recognition-summary__metric">
        <span class="recognition-summary__metric-value">+${formatNumber(
          recognitionPointsTotal
        )}</span>
        <span class="recognition-summary__metric-label">pts awarded to you</span>
      </div>
      <ul class="recognition-summary__stats">
        <li><strong>${formatNumber(
          recognitionReceived.length
        )}</strong><span>Got</span></li>
        <li><strong>${formatNumber(
          recognitionGiven.length
        )}</strong><span>Gave</span></li>
        <li><strong>${formatNumber(
          recognitionPeerCount
        )}</strong><span>Boost</span></li>
      </ul>
      <p class="recognition-summary__helper">${WeldUtil.escapeHtml(
        recognitionSummaryHelper
      )}</p>
      ${latestSnippet}
    </article>
  `;
  const recognitionBoardMarkup = `
    <section class="customer-section customer-section--recognition">
      <div class="section-header">
        <h2>Recognition highlights</h2>
        <p>Celebrate vigilance stories so every teammate knows what suspicious activity looks like.</p>
      </div>
      <div class="recognition-board__note" role="note" aria-label="Recognition quest boost reminder">
        <div class="recognition-board__note-header">
          <span class="recognition-board__note-title">Share recognition</span>
          <button type="button" class="button-pill button-pill--primary recognition-board__note-button" aria-haspopup="dialog">
            <span class="recognition-board__note-button-label">Give kudos</span>
            <span class="recognition-board__note-button-subtext">x2 quest boost</span>
          </button>
        </div>
        <p>Give or receive kudos and your next quest pays double points for both teammates.</p>
      </div>
      <div class="recognition-board">
        <div class="recognition-board__insight">
          ${recognitionSummaryHtml}
        </div>
        <div class="recognition-board__feed">
          ${recognitionControlsMarkup}
          <div class="recognition-feed">
            ${recognitionFeedMarkup}
          </div>
        </div>
      </div>
    </section>
  `;

  const rewardsHtml = publishedRewards
    .map(reward => {
      const remainingLabel = rewardRemainingLabel(reward);
      const pointsCost = Number(reward.pointsCost) || 0;
      return `
      <article class="reward-card reward-card--catalogue reward-card--hub" data-reward="${WeldUtil.escapeHtml(String(reward.id))}">
        <div class="reward-card__artwork" style="background:${reward.image};">
          ${WeldUtil.renderIcon(reward.icon || "gift", "lg")}
        </div>
        <div class="reward-card__meta">
          <span class="reward-card__chip reward-card__chip--category">${WeldUtil.escapeHtml(reward.category || "Reward")}</span>
          <span class="reward-card__chip reward-card__chip--provider">${WeldUtil.escapeHtml(reward.provider || "WeldSecure")}</span>
        </div>
        <h4 class="reward-card__title">${WeldUtil.escapeHtml(reward.name || "Reward")}</h4>
        <p class="reward-card__desc">${WeldUtil.escapeHtml(reward.description || "")}</p>
        <div class="reward-card__footer">
          <span>${remainingLabel} left</span>
        </div>
        <div class="reward-card__actions">
          <span class="reward-card__chip reward-card__chip--points">
            <strong class="reward-card__points-value">${formatNumber(pointsCost)}</strong>
            <span class="reward-card__points-unit">pts</span>
          </span>
          <button type="button" class="reward-card__cta button-pill button-pill--primary">Redeem reward</button>
        </div>
      </article>
    `;
    })
    .join("");

  const questsHtml = publishedQuests
    .map(quest => {
      const questId = WeldUtil.escapeHtml(String(quest.id));
      const focusTags = Array.isArray(quest.focus)
        ? quest.focus.slice(0, 2).map(item => `<span>${WeldUtil.escapeHtml(item)}</span>`).join("")
        : "";
      const focusBlock = focusTags ? `<div class="quest-card__focus quest-card__focus--compact">${focusTags}</div>` : "";
      const difficultyChip = quest.difficulty
        ? `<span class="quest-card__chip quest-card__chip--difficulty" data-difficulty="${WeldUtil.escapeHtml(
            quest.difficulty
          )}">${WeldUtil.escapeHtml(quest.difficulty)}</span>`
        : "";
      const difficultyRow = difficultyChip ? `<div class="quest-card__header-top">${difficultyChip}</div>` : "";
      const headerTags = [];
      if (quest.category) headerTags.push(`<span class="quest-card__chip">${WeldUtil.escapeHtml(quest.category)}</span>`);
      const chipGroup = headerTags.length ? `<div class="quest-card__chip-group">${headerTags.join("")}</div>` : "";
      const questLabel = quest.title ? WeldUtil.escapeHtml(quest.title) : "quest";
      const configButton = `<button type="button" class="quest-card__config" data-quest="${questId}" title="Configure ${questLabel}" aria-label="Configure ${questLabel}"><span class="quest-card__config-cog" aria-hidden="true">${CONFIG_ICON}</span></button>`;
      return `
      <article class="quest-card quest-card--hub" data-quest="${questId}">
        ${configButton}
        <header class="quest-card__header quest-card__header--hub">
          ${difficultyRow}
          ${chipGroup}
        </header>
        <h4 class="quest-card__title">${WeldUtil.escapeHtml(quest.title)}</h4>
        <p class="quest-card__description">${WeldUtil.escapeHtml(quest.description)}</p>
        <ul class="quest-card__details quest-card__details--compact">
          <li><span>Duration</span><strong>${WeldUtil.escapeHtml(String(quest.duration))} min</strong></li>
          <li><span>Questions</span><strong>${WeldUtil.escapeHtml(String(quest.questions))}</strong></li>
          <li><span>Format</span><strong>${WeldUtil.escapeHtml(quest.format || "")}</strong></li>
        </ul>
        ${focusBlock}
        <div class="quest-card__footer quest-card__footer--hub">
          <span class="quest-card__points">
            <strong class="quest-card__points-value">${formatNumber(quest.points || 0)}</strong>
            <span class="quest-card__points-unit">pts</span>
          </span>
          <button type="button" class="button-pill button-pill--primary quest-card__cta" data-quest="${questId}">
            Take Quiz
          </button>
        </div>
      </article>
    `;
    })
    .join("");

  const rarityOrder = ["Legendary", "Expert", "Skilled", "Rising", "Starter"];
  const demoBadgeAchievements = [
    { id: "resilience-ranger", achievedAt: "2025-03-14T10:45:00Z" },
    { id: "zero-day-zeal", achievedAt: "2025-03-02T09:10:00Z" },
    { id: "automation-ally", achievedAt: "2025-02-21T16:30:00Z" },
    { id: "bullseye-breaker", achievedAt: "2025-02-12T08:15:00Z" },
    { id: "hub-hopper", achievedAt: "2025-03-18T12:05:00Z", highlight: "recent" }
  ];
  const demoBadges = demoBadgeAchievements
    .map(entry => {
      const badge = publishedBadges.find(item => item.id === entry.id);
      if (!badge) return null;
      return { ...badge, achievedAt: entry.achievedAt, highlight: entry.highlight || null };
    })
    .filter(Boolean);
  const recentBadge =
    demoBadges.find(item => item.highlight === "recent") ||
    demoBadges
      .slice()
      .sort((a, b) => {
        const timeA = new Date(a.achievedAt || 0).getTime();
        const timeB = new Date(b.achievedAt || 0).getTime();
        return timeB - timeA;
      })[0];
  const getRarityRank = badge => {
    const difficulty = typeof badge.difficulty === "string" ? badge.difficulty : "";
    const index = rarityOrder.indexOf(difficulty);
    return index === -1 ? rarityOrder.length : index;
  };
  const topRarityBadges = demoBadges
    .filter(badge => !recentBadge || badge.id !== recentBadge.id)
    .sort((a, b) => {
      const rarityDiff = getRarityRank(a) - getRarityRank(b);
      if (rarityDiff !== 0) return rarityDiff;
      const pointsDiff = (Number(b.points) || 0) - (Number(a.points) || 0);
      if (pointsDiff !== 0) return pointsDiff;
      const timeA = new Date(a.achievedAt || 0).getTime();
      const timeB = new Date(b.achievedAt || 0).getTime();
      return timeB - timeA;
    })
    .slice(0, 3);
  const fallbackTopBadges = recentBadge
    ? publishedBadges.filter(badge => badge.id !== recentBadge.id)
    : publishedBadges.slice();
  const displayTopBadges = topRarityBadges.length > 0 ? topRarityBadges : fallbackTopBadges.slice(0, 3);
  const renderBadgeShowcaseItem = (badge, extraClass = "") => {
    const achievedDate = badge?.achievedAt ? new Date(badge.achievedAt) : null;
    const metaMarkup =
      achievedDate && !Number.isNaN(achievedDate.getTime())
        ? `<span class="badge-showcase__meta">Unlocked ${WeldUtil.escapeHtml(formatDateTime(badge.achievedAt))}</span>`
        : "";
    return `
      <div class="badge-showcase__item${extraClass ? ` ${extraClass}` : ""}" role="listitem">
        ${renderHubBadgeCard(badge)}
        ${metaMarkup}
      </div>
    `;
  };
  const topBadgesMarkup = displayTopBadges.length
    ? `
      <div class="badge-showcase__group" role="group" aria-label="Badge showcase">
        <p class="badge-showcase__label">Badge showcase</p>
        <div class="badge-showcase__list" role="list" aria-label="Top badges by rarity">
          ${displayTopBadges.map(badge => renderBadgeShowcaseItem(badge)).join("")}
        </div>
      </div>
    `
    : "";
  const recentBadgeMarkup = recentBadge
    ? `
      <div class="badge-showcase__group badge-showcase__group--recent" role="group" aria-label="Most recent badge">
        <p class="badge-showcase__label">Most recent</p>
        <div class="badge-showcase__list badge-showcase__list--recent" role="list" aria-label="Most recent badge">
          ${renderBadgeShowcaseItem(recentBadge, "badge-showcase__item--recent")}
        </div>
      </div>
    `
    : "";
  const hasAnyBadges = displayTopBadges.length > 0 || Boolean(recentBadge);
  const badgesHtml = hasAnyBadges
    ? `
      <div class="badge-showcase${recentBadge ? " badge-showcase--inline" : ""}">
        ${topBadgesMarkup}
        ${
          recentBadge
            ? `<div class="badge-showcase__divider" role="separator" aria-hidden="true"></div>${recentBadgeMarkup}`
            : ""
        }
      </div>
    `
    : `<div class="badge-empty"><p>No badges are currently published. Switch to the organisation catalogue to curate them.</p></div>`;

  return `
    <header class="customer-hero">
      <h1>Good day, ${WeldUtil.escapeHtml(state.customer.name)}</h1>
      <p>Your vigilance is fuelling a safer inbox for everyone at Evergreen Capital.</p>
    </header>
    <div class="customer-hero-actions">
      <div class="customer-hero-actions__panel">
        <div class="customer-hero-actions__main">
          <button class="button-pill button-pill--primary customer-hero-actions__button" id="customer-report-button">Report other suspicious activity</button>
          <p class="customer-hero-actions__description">Log smishing, quishing, or any other suspicious behaviour you come across so the security team can jump on it.</p>
        </div>
        <div class="customer-hero-actions__meta">
          <button
            type="button"
            class="button-pill customer-hero-actions__history"
            id="customer-report-history-button"
            data-route="customer-reports"
            data-report-filter="other"
          >
            Other report history
          </button>
          <p class="customer-hero-actions__history-note">Each submission grants +20 pts immediately. Use Other report history to track how non-email incidents progress and when bonus points land.</p>
        </div>
      </div>
    </div>
    <section class="customer-section customer-section--points points-strip">
      <article class="points-card" style="background: linear-gradient(135deg, #6d28d9, #4338ca);">
        <div class="points-card__chip points-card__chip--interactive">
          <span>Available to spend</span>
          <button type="button" class="points-card__chip-action" data-scroll="#customer-rewards">Browse rewards</button>
        </div>
        <div class="points-card__content">
          <span class="points-icon" style="background: linear-gradient(135deg, #ede9fe, #c7d2fe);">
            ${WeldUtil.renderIcon("medal", "sm")}
          </span>
          <div class="points-card__metrics">
            <span class="points-card__value">${formatNumber(state.customer.currentPoints)}</span>
            <span class="points-card__unit">PTS</span>
          </div>
        </div>
      </article>
      <article class="points-card" style="background: linear-gradient(135deg, #f97316, #facc15);">
        <div class="points-card__chip points-card__chip--interactive">
          <span>Pending approval</span>
          <button type="button" class="points-card__chip-action" data-route="customer-reports" data-report-filter="all">Recent reports</button>
        </div>
        <div class="points-card__content">
          <span class="points-icon" style="background: linear-gradient(135deg, #fff7ed, #ffedd5);">
            ${WeldUtil.renderIcon("hourglass", "sm")}
          </span>
          <div class="points-card__metrics">
            <span class="points-card__value">${formatNumber(pendingApprovalPoints)}</span>
            <span class="points-card__unit">PTS</span>
          </div>
        </div>
      </article>
      <article class="points-card" style="background: linear-gradient(135deg, #0ea5e9, #6366f1);">
        <div class="points-card__chip points-card__chip--interactive">
          <span>Reward history</span>
          <button type="button" class="points-card__chip-action" data-route="customer-redemptions">View history</button>
        </div>
        <div class="points-card__content">
          <span class="points-icon" style="background: linear-gradient(135deg, #dbeafe, #bfdbfe);">
            ${WeldUtil.renderIcon("gift", "sm")}
          </span>
          <div class="points-card__metrics">
            <span class="points-card__value">${formatNumber(state.customer.redeemedPoints)}</span>
            <span class="points-card__unit">PTS</span>
          </div>
        </div>
      </article>
      ${bonusScaleHtml}
    </section>
    <section class="customer-section customer-section--badges">
      <div class="section-header section-header--with-action">
        <div class="section-header__copy">
          <h2>Your badges</h2>
          <p>Preview the badges your organisation curates. Published badges appear here and inside the add-in spotlight.</p>
        </div>
        <button type="button" class="button-pill button-pill--primary section-header__action" data-route="customer-badges" data-role="customer">
          All badges
        </button>
      </div>
      ${badgesHtml}
    </section>
    <section id="customer-rewards" class="customer-section customer-section--rewards">
      <div class="section-header">
        <h2>Your rewards</h2>
        <p>Select a reward to demonstrate the instant redemption flow. Only rewards published by your organisation appear here.</p>
      </div>
      ${
        rewardsHtml
          ? `<div class="reward-grid reward-grid--catalogue reward-grid--hub">${rewardsHtml}</div>`
          : `<div class="reward-empty"><p>No rewards are currently published. Check back soon!</p></div>`
      }
    </section>
    <section class="customer-section customer-section--quests">
      <div class="section-header">
        <h2>Your quests</h2>
        <p>Introduce squads to the latest WeldSecure quests. Only published quests from your organisation appear here.</p>
      </div>
      ${
        questsHtml
          ? `<div class="quest-grid quest-grid--hub">${questsHtml}</div>`
          : `<div class="reward-empty"><p>No quests are currently published. Check back soon!</p></div>`
      }
    </section>
    ${recognitionBoardMarkup}
  `;
}


function renderCustomerBadgesView(state) {
  const publishedBadges = getBadges().filter(badge => badge.published);
  const badgeCount = publishedBadges.length;
  const badgeLabel = badgeCount === 1 ? "badge" : "badges";
  const badgeGrid = badgeCount
    ? `
      <div class="gem-badge-grid gem-badge-grid--hub customer-badge-grid" role="list" aria-label="All published badges">
        ${publishedBadges
          .map(
            badge => `
          <div class="customer-badge-grid__item" role="listitem">
            ${renderHubBadgeCard(badge)}
          </div>
        `
          )
          .join("")}
      </div>
    `
    : `<div class="customer-detail__empty">No badges are currently published. Return to the hub to curate or publish them.</div>`;

  const descriptionTail = badgeCount
    ? ` Currently showing ${WeldUtil.escapeHtml(formatNumber(badgeCount))} ${badgeLabel}.`
    : "";

  return `
    <header class="customer-detail-header">
      <button type="button" class="customer-detail__back" data-action="back-to-hub">
        Back to hub
      </button>
      <span class="customer-detail__eyebrow">Badges</span>
      <h1>All available badges</h1>
      <p>Every badge your organisation has published to the reporter hub.${descriptionTail}</p>
    </header>
    <section class="customer-section customer-section--badges customer-section--badges-all">
      ${badgeGrid}
    </section>
  `;
}


function renderCustomerReportsView(state) {
  const customerMessages = state.messages
    .filter(messageBelongsToCustomer)
    .slice()
    .sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime());

  const reportFilter = state.meta?.reportFilter === "other" ? "other" : "all";
  const filteredMessages = customerMessages.filter(message => {
    if (reportFilter === "other") {
      return Boolean(message?.activityType);
    }
    return true;
  });

  const rowsMarkup = filteredMessages
    .map(message => {
      const reasons = Array.isArray(message.reasons) ? message.reasons.map(reasonById).filter(Boolean) : [];
      const reasonChips = reasons
        .map(reason => `<span class="detail-chip">${WeldUtil.escapeHtml(reason.label)}</span>`)
        .join("");
      const approvedPoints = message.status === MessageStatus.APPROVED ? message.pointsOnApproval || 0 : 0;
      const totalPoints = (message.pointsOnMessage || 0) + approvedPoints;
      const activityLabel = describeActivityType(message?.activityType);
      const hasLocation =
        typeof message?.incidentLocation === "string" && message.incidentLocation.trim().length > 0;
      const activityMeta = activityLabel
        ? `<span class="detail-table__meta">${WeldUtil.escapeHtml(activityLabel)}${
            hasLocation ? ` � ${WeldUtil.escapeHtml(message.incidentLocation.trim())}` : ""
          }</span>`
        : hasLocation
        ? `<span class="detail-table__meta">Location: ${WeldUtil.escapeHtml(message.incidentLocation.trim())}</span>`
        : "";
      return `
        <tr>
          <td>${formatDateTime(message.reportedAt)}</td>
          <td>
            <strong>${WeldUtil.escapeHtml(message.subject || "Suspicious message")}</strong>
            ${activityMeta}
            ${reasonChips ? `<div class="detail-table__chips">${reasonChips}</div>` : ""}
          </td>
          <td><span class="badge" data-state="${WeldUtil.escapeHtml(message.status)}">${WeldUtil.escapeHtml(message.status)}</span></td>
          <td>
            <div class="detail-table__points">
              <span>+${formatNumber(message.pointsOnMessage || 0)}</span>
              ${
                message.status === MessageStatus.APPROVED
                  ? `<span>+${formatNumber(approvedPoints)}</span>`
                  : ""
              }
              <strong>= ${formatNumber(totalPoints)}</strong>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");

  const emptyCopy =
    reportFilter === "other"
      ? "No other suspicious activity reports yet. Log calls, texts, or QR finds to see them here."
      : "No reports recorded yet. Use the hub to submit your first suspicious email.";

  const tableMarkup = filteredMessages.length
    ? `
      <div class="detail-table-wrapper">
        <table class="detail-table detail-table--reports">
          <thead>
            <tr>
              <th>Reported</th>
              <th>Subject &amp; reasons</th>
              <th>Status</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>${rowsMarkup}</tbody>
        </table>
      </div>
    `
    : `<div class="customer-detail__empty">${WeldUtil.escapeHtml(emptyCopy)}</div>`;

  const filterNote =
    reportFilter === "other"
      ? `<p class="customer-detail__filter-note">Showing other suspicious activity (calls, texts, QR codes, and similar).</p>`
      : "";

  return `
    <header class="customer-detail-header">
      <button type="button" class="customer-detail__back" data-action="back-to-hub">
        Back to hub
      </button>
      <span class="customer-detail__eyebrow">Reports</span>
      <h1>Your reported messages</h1>
      <p>Review everything you've flagged and track approvals from the security team.</p>
      ${filterNote}
    </header>
    ${tableMarkup}
  `;
}


function renderCustomerRedemptionsView(state) {
  const redemptions = Array.isArray(state.rewardRedemptions)
    ? state.rewardRedemptions.slice().sort((a, b) => new Date(b.redeemedAt).getTime() - new Date(a.redeemedAt).getTime())
    : [];

  const rowsMarkup = redemptions
    .map(entry => {
      const reward = rewardById(entry.rewardId);
      const rewardName = reward ? reward.name : "Reward";
      const provider = reward?.provider ? `<span class="detail-table__meta">${WeldUtil.escapeHtml(reward.provider)}</span>` : "";
      return `
        <tr>
          <td>${formatDateTime(entry.redeemedAt)}</td>
          <td>
            <strong>${WeldUtil.escapeHtml(rewardName)}</strong>
            ${provider}
          </td>
          <td>${formatNumber(reward?.pointsCost || 0)} pts</td>
          <td>
            <span class="badge" data-state="${WeldUtil.escapeHtml(entry.status || "pending")}">
              ${WeldUtil.escapeHtml(entry.status || "pending")}
            </span>
          </td>
        </tr>
      `;
    })
    .join("");

  const tableMarkup = redemptions.length
    ? `
      <div class="detail-table-wrapper">
        <table class="detail-table detail-table--reports">
          <thead>
            <tr>
              <th>Redeemed</th>
              <th>Reward</th>
              <th>Points</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>${rowsMarkup}</tbody>
        </table>
      </div>
    `
    : `<div class="customer-detail__empty">No rewards redeemed yet. Redeem from the hub to see history appear here.</div>`;

  return `
    <header class="customer-detail-header">
      <button type="button" class="customer-detail__back" data-action="back-to-hub">
        Back to hub
      </button>
      <span class="customer-detail__eyebrow">Rewards</span>
      <h1>Your redemption history</h1>
      <p>Show stakeholders how Weld provides instant recognition and celebration moments.</p>
    </header>
    ${tableMarkup}
  `;
}


function attachCustomerHubEvents(container, state) {
  const reportBtn = container.querySelector("#customer-report-button");
  if (reportBtn) {
    reportBtn.addEventListener("click", () => {
      openSuspiciousActivityForm();
    });
  }
  const historyBtn = container.querySelector("#customer-report-history-button");
  if (historyBtn) {
    historyBtn.addEventListener("click", () => {
      state.meta.reportFilter = "other";
      setRole("customer", "customer-reports");
    });
  }
  container.querySelectorAll(".reward-card__cta").forEach(button => {
    button.addEventListener("click", () => {
      const card = button.closest(".reward-card");
      if (!card) return;
      const rewardId = Number(card.getAttribute("data-reward"));
      const reward = rewardById(rewardId);
      if (!reward) return;

      const dialogContent = document.createElement("div");
      const nameElement = document.createElement("strong");
      nameElement.textContent = reward.name || "Reward";
      dialogContent.appendChild(nameElement);
      if (reward.description) {
        const descriptionElement = document.createElement("p");
        descriptionElement.textContent = reward.description;
        dialogContent.appendChild(descriptionElement);
      }
      if (reward.provider) {
        const providerElement = document.createElement("span");
        providerElement.textContent = reward.provider;
        dialogContent.appendChild(providerElement);
      }

      openDialog({
        title: "Redeem this reward?",
        description: `This will use ${reward.pointsCost} of your available points.`,
        content: dialogContent,
        confirmLabel: "Confirm redemption",
        cancelLabel: "Cancel",
        onConfirm: close => {
          const result = redeemReward(rewardId);
          close();
          if (result.success) {
            openDialog({
              title: "Reward queued for fulfilment",
              description: `${reward.name} has been added to your rewards queue.`,
              confirmLabel: "Back to rewards",
              onConfirm: closeDialog
            });
          } else {
            openDialog({
              title: "Unable to redeem",
              description: result.reason || "Please try again.",
              confirmLabel: "Close"
            });
          }
        }
      });
    });
  });
  container.querySelectorAll(".points-card__chip-action").forEach(button => {
    button.addEventListener("click", () => {
      const scrollTarget = button.getAttribute("data-scroll");
      if (scrollTarget) {
        const target = document.querySelector(scrollTarget);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
      const targetRoute = button.getAttribute("data-route");
      if (targetRoute) {
        const filter = button.getAttribute("data-report-filter");
        if (filter) {
          state.meta.reportFilter = filter === "other" ? "other" : null;
        } else if (targetRoute === "customer-reports") {
          state.meta.reportFilter = null;
        }
        setRole("customer", targetRoute);
      }
    });
  });
  container.querySelectorAll(".quest-card__cta").forEach(button => {
    button.addEventListener("click", () => {
      setRole("client", "client-quests");
    });
  });
  container.querySelectorAll(".quest-card__config").forEach(button => {
    button.addEventListener("click", event => {
      event.preventDefault();
      const questId = button.getAttribute("data-quest");
      if (questId) {
        openQuestConfig(questId);
      }
    });
  });
  container.querySelectorAll(".section-header__action[data-route]").forEach(button => {
    button.addEventListener("click", () => {
      const targetRoute = button.getAttribute("data-route");
      const targetRole = button.getAttribute("data-role") || state.meta.role || "customer";
      if (targetRoute) {
        setRole(targetRole, targetRoute);
      }
    });
  });
  container.querySelectorAll("[data-recognition-filter]").forEach(button => {
    button.addEventListener("click", () => {
      const value = (button.getAttribute("data-recognition-filter") || "").trim().toLowerCase();
      const valid = ["received", "given", "all"];
      const nextFilter = valid.includes(value) ? value : "received";
      if (state.meta.recognitionFilter !== nextFilter) {
        state.meta.recognitionFilter = nextFilter;
        persist();
        renderApp();
      }
    });
  });
  const recognitionButton = container.querySelector(".recognition-board__note-button");
  if (recognitionButton) {
    recognitionButton.addEventListener("click", () => {
      openRecognitionFormDialog();
    });
  }
}


function attachCustomerBadgesEvents(container) {
  const back = container.querySelector("[data-action='back-to-hub']");
  if (back) {
    back.addEventListener("click", () => {
      setRole("customer", "customer");
    });
  }
}


function attachCustomerReportsEvents(container) {
  const back = container.querySelector("[data-action='back-to-hub']");
  if (back) {
    back.addEventListener("click", () => {
      setRole("customer", "customer");
    });
  }
}


function attachCustomerRedemptionsEvents(container) {
  const back = container.querySelector("[data-action='back-to-hub']");
  if (back) {
    back.addEventListener("click", () => {
      setRole("customer", "customer");
    });
  }
}

function attachClientDashboardEvents(container) {
  if (!container) return;
  container.addEventListener("click", event => {
    const bulkDepartment = event.target.closest("[data-bulk-department-action]");
    if (bulkDepartment) {
      const action = bulkDepartment.getAttribute("data-bulk-department-action");
      if (action === "publish") {
        setAllLeaderboardPublication(true);
      } else if (action === "unpublish") {
        setAllLeaderboardPublication(false);
      }
      return;
    }

    const departmentToggle = event.target.closest(".department-publish-toggle");
    if (departmentToggle) {
      const departmentId = departmentToggle.getAttribute("data-department");
      const action = departmentToggle.getAttribute("data-action");
      if (departmentId && action) {
        setLeaderboardEntryPublication(departmentId, action === "publish");
      }
      return;
    }

    const bulkProgram = event.target.closest("[data-bulk-program-action]");
    if (bulkProgram) {
      const action = bulkProgram.getAttribute("data-bulk-program-action");
      if (action === "publish") {
        setAllEngagementProgramsPublication(true);
      } else if (action === "unpublish") {
        setAllEngagementProgramsPublication(false);
      }
      return;
    }

    const programToggle = event.target.closest(".program-publish-toggle");
    if (programToggle) {
      const programId = programToggle.getAttribute("data-program");
      const action = programToggle.getAttribute("data-action");
      if (programId && action) {
        setEngagementProgramPublication(programId, action === "publish");
      }
      return;
    }

    const button = event.target.closest(".client-card .table-actions [data-route]");
    if (!button) return;
    event.preventDefault();
    const route = button.getAttribute("data-route");
    const role = button.getAttribute("data-role");
    if (role) {
      setRole(role, route || role);
    } else if (route) {
      navigate(route);
    }
  });
}

function attachReportingEvents(container) {
  const csvBtn = container.querySelector("#download-csv-button");
  if (csvBtn) {
    csvBtn.addEventListener("click", () => {
      openDialog({
        title: "CSV export ready",
        description: "In the real product this downloads a CSV. For the demo, use this cue to talk through the audit trail.",
        confirmLabel: "Got it"
      });
    });
  }
  container.querySelectorAll(".table-actions button").forEach(button => {
    button.addEventListener("click", () => {
      const action = button.getAttribute("data-action");
      const messageId = Number(button.getAttribute("data-message"));
      updateMessageStatus(messageId, action === "approve" ? MessageStatus.APPROVED : MessageStatus.REJECTED);
    });
  });
}


  customerFeature.templateHub = function templateHub(appState) {
    const state = getState(appState);
    return renderCustomerHub(state);
  };

  customerFeature.renderHub = function renderHub(container, appState) {
    if (!container) return;
    const state = getState(appState);
    container.innerHTML = renderCustomerHub(state);
    attachCustomerHubEvents(container, state);
    if (typeof window.setupBadgeShowcase === "function") {
      window.setupBadgeShowcase(container);
    }
  };

  customerFeature.attachHub = function attachHub(container, appState) {
    if (!container) return;
    const state = getState(appState);
    attachCustomerHubEvents(container, state);
    if (typeof window.setupBadgeShowcase === "function") {
      window.setupBadgeShowcase(container);
    }
  };

  customerFeature.templateBadges = function templateBadges(appState) {
    const state = getState(appState);
    return renderCustomerBadgesView(state);
  };

  customerFeature.renderBadges = function renderBadges(container, appState) {
    if (!container) return;
    const state = getState(appState);
    container.innerHTML = renderCustomerBadgesView(state);
    attachCustomerBadgesEvents(container);
  };

  customerFeature.attachBadges = function attachBadges(container, appState) {
    if (!container) return;
    attachCustomerBadgesEvents(container);
  };

  customerFeature.templateReports = function templateReports(appState) {
    const state = getState(appState);
    return renderCustomerReportsView(state);
  };

  customerFeature.renderReports = function renderReports(container, appState) {
    if (!container) return;
    const state = getState(appState);
    container.innerHTML = renderCustomerReportsView(state);
    attachCustomerReportsEvents(container);
  };

  customerFeature.attachReports = function attachReports(container, appState) {
    if (!container) return;
    attachCustomerReportsEvents(container);
  };

  customerFeature.templateRedemptions = function templateRedemptions(appState) {
    const state = getState(appState);
    return renderCustomerRedemptionsView(state);
  };

  customerFeature.renderRedemptions = function renderRedemptions(container, appState) {
    if (!container) return;
    const state = getState(appState);
    container.innerHTML = renderCustomerRedemptionsView(state);
    attachCustomerRedemptionsEvents(container);
  };

  customerFeature.attachRedemptions = function attachRedemptions(container, appState) {
    if (!container) return;
    attachCustomerRedemptionsEvents(container);
  };
})();
