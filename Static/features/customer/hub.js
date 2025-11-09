(function () {
  const modules = window.WeldModules;
  if (!modules || typeof modules.define !== "function") return;
  if (modules.has && modules.has("features/customer/hub")) return;

  modules.define("features/customer/hub", function () {
    let shared;
    try {
      shared = modules.use("features/customer/shared");
    } catch (error) {
      console.warn("Customer hub module could not load shared utilities:", error);
      return null;
    }
    if (!shared) {
      console.warn("Customer hub module missing shared utilities.");
      return null;
    }

    const { MessageStatus, WeldUtil, formatNumber, formatDateTime, relativeTime, getState } = shared;
    const HUB_REWARD_PREVIEW_LIMIT = 3;
    const HUB_QUEST_PREVIEW_LIMIT = 3;
    const QUEST_PREVIEW_DIFFICULTY_ORDER = ["starter", "intermediate", "advanced"];

    function getPublishedRewards(state) {
      const rewards = Array.isArray(state?.rewards) ? state.rewards : [];
      return rewards.filter(reward => reward && reward.published);
    }

    function getPublishedQuests(state) {
      const quests = Array.isArray(state?.quests) ? state.quests : [];
      return quests
        .filter(quest => quest && quest.published)
        .sort(WeldUtil.compareQuestsByDifficulty);
    }

    function selectQuestPreview(quests, limit = HUB_QUEST_PREVIEW_LIMIT) {
      if (!Array.isArray(quests) || quests.length === 0) return [];
      const normalized = quests.slice();
      const selected = [];
      const usedIds = new Set();

      QUEST_PREVIEW_DIFFICULTY_ORDER.forEach(level => {
        if (selected.length >= limit) return;
        const quest = normalized.find(item => {
          if (!item || usedIds.has(item.id)) return false;
          const diff = typeof item.difficulty === "string" ? item.difficulty.trim().toLowerCase() : "";
          return diff === level;
        });
        if (quest) {
          selected.push(quest);
          usedIds.add(quest.id);
        }
      });

      if (selected.length < limit) {
        normalized.forEach(quest => {
          if (selected.length >= limit) return;
          if (!quest || usedIds.has(quest.id)) return;
          selected.push(quest);
          usedIds.add(quest.id);
        });
      }

      return selected.slice(0, limit);
    }

    function renderRewardCard(reward) {
      if (!reward) return "";
      const remainingLabel = rewardRemainingLabel(reward);
      const pointsCost = Number(reward.pointsCost) || 0;
      const rewardId = WeldUtil.escapeHtml(String(reward.id));
      const artwork = reward.image || "";
      const iconMarkup = WeldUtil.renderIcon(reward.icon || "gift", "lg");
      const rewardName = reward.name || "Reward";
      const description = reward.description || "";
      const category = reward.category || "Reward";
      const provider = reward.provider || "WeldSecure";
      return `
        <article class="reward-card reward-card--catalogue reward-card--hub" data-reward="${rewardId}">
          <div class="reward-card__artwork" style="background:${artwork};">
            ${iconMarkup}
          </div>
          <div class="reward-card__meta">
            <span class="reward-card__chip reward-card__chip--category">${WeldUtil.escapeHtml(category)}</span>
            <span class="reward-card__chip reward-card__chip--provider">${WeldUtil.escapeHtml(provider)}</span>
          </div>
          <h4 class="reward-card__title">${WeldUtil.escapeHtml(rewardName)}</h4>
          <p class="reward-card__desc">${WeldUtil.escapeHtml(description)}</p>
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
    }

    function renderQuestCard(quest) {
      if (!quest) return "";
      const questId = WeldUtil.escapeHtml(String(quest.id));
      const questDifficulty = quest.difficulty ? String(quest.difficulty) : "Starter";
      const questDifficultyAttr = WeldUtil.escapeHtml(questDifficulty);
      const focusTags = Array.isArray(quest.focus)
        ? quest.focus.slice(0, 2).map(item => `<span>${WeldUtil.escapeHtml(item)}</span>`).join("")
        : "";
      const focusBlock = focusTags
        ? `<div class="quest-card__focus quest-card__focus--compact">${focusTags}</div>`
        : "";
      const difficultyChip = quest.difficulty
        ? `<span class="quest-card__chip quest-card__chip--difficulty" data-difficulty="${WeldUtil.escapeHtml(
            quest.difficulty
          )}">${WeldUtil.escapeHtml(quest.difficulty)}</span>`
        : "";
      const difficultyRow = difficultyChip ? `<div class="quest-card__header-top">${difficultyChip}</div>` : "";
      const headerTags = [];
      if (quest.category) {
        headerTags.push(`<span class="quest-card__chip">${WeldUtil.escapeHtml(quest.category)}</span>`);
      }
      const chipGroup = headerTags.length ? `<div class="quest-card__chip-group">${headerTags.join("")}</div>` : "";
      const duration = quest.duration !== undefined ? String(quest.duration) : "";
      const questions = quest.questions !== undefined ? String(quest.questions) : "";
      const formatLabel = quest.format || "";
      const pointsValue = formatNumber(quest.points || 0);

      return `
        <article class="quest-card quest-card--hub" data-quest="${questId}" data-difficulty="${questDifficultyAttr}">
          <header class="quest-card__header quest-card__header--hub">
            ${difficultyRow}
            ${chipGroup}
          </header>
          <h4 class="quest-card__title">${WeldUtil.escapeHtml(quest.title || "Quest")}</h4>
          <p class="quest-card__description">${WeldUtil.escapeHtml(quest.description || "")}</p>
          <ul class="quest-card__details quest-card__details--compact">
            <li><span>Duration</span><strong>${WeldUtil.escapeHtml(duration)} min</strong></li>
            <li><span>Questions</span><strong>${WeldUtil.escapeHtml(questions)}</strong></li>
            <li><span>Format</span><strong>${WeldUtil.escapeHtml(formatLabel)}</strong></li>
          </ul>
          ${focusBlock}
          <div class="quest-card__footer quest-card__footer--hub">
            <span class="quest-card__points">
              <strong class="quest-card__points-value">${pointsValue}</strong>
              <span class="quest-card__points-unit">pts</span>
            </span>
            <button type="button" class="button-pill button-pill--primary quest-card__cta" data-quest="${questId}">
              Take Quiz
            </button>
          </div>
        </article>
      `;
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
  const rawFeatureToggles =
    state?.meta && typeof state.meta === "object" && state.meta.featureToggles && typeof state.meta.featureToggles === "object"
      ? state.meta.featureToggles
      : {};
  const showBadges = rawFeatureToggles.badges !== false;
  const showLeaderboards = rawFeatureToggles.leaderboards !== false;
  const showQuests = rawFeatureToggles.quests !== false;
  const showRewards = rawFeatureToggles.rewards !== false;
  const customerMessages = state.messages.filter(messageBelongsToCustomer);
  const pendingMessages = customerMessages.filter(message => message.status === MessageStatus.PENDING);
  const pendingApprovalPoints = pendingMessages.reduce((sum, message) => sum + (message.pointsOnApproval || 0), 0);
  const publishedRewards = getPublishedRewards(state);
  const publishedQuests = getPublishedQuests(state);
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
        const tooltipText = tooltipParts.join(" | ");
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
  const hasBonusSources = bonusSourcesCount > 0;
  const bonusHoverNote = hasBonusSources
    ? `<p class="points-bonus__note">Hover or focus the points bar to see this week's bonus story.</p>`
    : "";
  const remainingLabelMarkup =
    weeklyCap > 0
      ? remainingThisWeek === 0
        ? `<span class="points-bonus__meter-remaining points-bonus__meter-remaining--met">Cap reached</span>`
        : `<span class="points-bonus__meter-remaining">${formatNumber(remainingThisWeek)} pts left</span>`
      : `<span class="points-bonus__meter-remaining">No cap set</span>`;
  const bonusCapLabel = weeklyCap > 0 ? `${formatNumber(weeklyCap)} pt cap` : "No cap set";
  const meterFocusAttributes = hasBonusSources ? ' tabindex="0" data-bonus-meter="reveal"' : "";
  const meterGroupAttributes = hasBonusSources ? ' data-has-sources="true"' : "";
  const bonusMeterGroupMarkup = `
        <div class="points-bonus__meter-group"${meterGroupAttributes}>
          <div class="points-bonus__meter"${meterFocusAttributes} role="img" aria-label="${WeldUtil.escapeHtml(
            bonusMeterLabel
          )}">
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
        </div>
  `;
  const bonusScaleHtml = `
      <div class="points-bonus" role="region" aria-label="Weekly bonus points">
        <div class="points-bonus__header">
          <h3>Weekly bonus points</h3>
          <span class="points-bonus__cap">${WeldUtil.escapeHtml(bonusCapLabel)}</span>
        </div>
        <p class="points-bonus__summary">
          Earn extra points from quests and team boosts. Reporting suspicious emails always awards your core points outside this cap.
        </p>
        ${bonusMeterGroupMarkup}
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
    .slice(0, HUB_REWARD_PREVIEW_LIMIT)
    .map(renderRewardCard)
    .join("");

  const questPreview = selectQuestPreview(publishedQuests);
  const questsHtml = questPreview
    .map(renderQuestCard)
    .join("");

  const rarityOrder = ["Legendary", "Expert", "Skilled", "Rising", "Starter"];
  const demoBadgeAchievements = [
    { id: "resilience-ranger", achievedAt: "2025-03-14T10:45:00Z" },
    { id: "zero-day-zeal", achievedAt: "2025-03-02T09:10:00Z" },
    { id: "automation-ally", achievedAt: "2025-02-21T16:30:00Z" },
    { id: "bullseye-breaker", achievedAt: "2025-02-12T08:15:00Z" },
    { id: "golden-signal", achievedAt: "2025-02-28T08:40:00Z" },
    { id: "signal-sculptor", achievedAt: "2025-02-05T13:20:00Z" },
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
    .slice(0, 5);
  const fallbackTopBadges = recentBadge
    ? publishedBadges.filter(badge => badge.id !== recentBadge.id)
    : publishedBadges.slice();
  const displayTopBadges = topRarityBadges.length > 0 ? topRarityBadges : fallbackTopBadges.slice(0, 5);
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
  const sortedLeaderboardEntries = Array.isArray(state.departmentLeaderboard)
    ? state.departmentLeaderboard
        .slice()
        .sort((a, b) => (Number(b?.points) || 0) - (Number(a?.points) || 0))
    : [];
  const publishedLeaderboardEntries = sortedLeaderboardEntries.filter(entry => entry && entry.published);
  const snapshotSource =
    publishedLeaderboardEntries.length > 0 ? publishedLeaderboardEntries : sortedLeaderboardEntries;
  const topSnapshotEntry = snapshotSource.length > 0 ? snapshotSource[0] : null;
  const leaderboardSnapshotEntries = snapshotSource.slice(1, 4);
  const leaderboardSnapshotList = leaderboardSnapshotEntries
    .map((entry, index) => {
      if (!entry) return "";
      const rank = index + 2;
      const departmentLabel =
        typeof entry.department === "string" && entry.department.trim().length > 0
          ? entry.department.trim()
          : "Organisation team";
      const displayName =
        typeof entry.name === "string" && entry.name.trim().length > 0
          ? entry.name.trim()
          : `Department ${rank}`;
      const pointsValue = Number.isFinite(entry.points) ? formatNumber(entry.points) : "0";
      const momentumTag =
        typeof entry.momentumTag === "string" && entry.momentumTag.trim().length > 0
          ? entry.momentumTag.trim()
          : null;
      const momentumChip = momentumTag
        ? `<span class="leaderboard-snapshot__chip">${WeldUtil.escapeHtml(momentumTag)}</span>`
        : "";
      const momentumChipMarkup = momentumChip
        ? `<div class="leaderboard-snapshot__chips">${momentumChip}</div>`
        : "";
      return `
        <li class="leaderboard-snapshot__item">
          <span class="leaderboard-snapshot__rank" aria-hidden="true">${formatNumber(rank)}</span>
          <div class="leaderboard-snapshot__meta">
            <strong>${WeldUtil.escapeHtml(displayName)}</strong>
            <span class="leaderboard-snapshot__detail">${WeldUtil.escapeHtml(departmentLabel)}</span>
          </div>
          <div class="leaderboard-snapshot__score">
            <span class="leaderboard-snapshot__points">${WeldUtil.escapeHtml(pointsValue)}</span>
            <span class="leaderboard-snapshot__points-unit">pts</span>
          </div>
          ${momentumChipMarkup}
        </li>
      `;
    })
    .join("");
  const leaderboardListMarkup = leaderboardSnapshotEntries.length
    ? `
        <div class="leaderboard-snapshot__list-wrapper">
          <span class="leaderboard-snapshot__list-label">Chasing the crown</span>
          <ol class="leaderboard-snapshot__list">${leaderboardSnapshotList}</ol>
        </div>
      `
    : `<p class="leaderboard-snapshot__empty">No leaderboard stories published yet. Toggle them on inside the organisation hub.</p>`;
  const topDepartmentName =
    topSnapshotEntry && typeof topSnapshotEntry.name === "string" && topSnapshotEntry.name.trim().length > 0
      ? topSnapshotEntry.name.trim()
      : topSnapshotEntry
      ? "Leaderboard leader"
      : "Leaderboard pulse";
  const topPointsDisplay =
    topSnapshotEntry && Number.isFinite(topSnapshotEntry.points) ? formatNumber(topSnapshotEntry.points) : null;
  const topMomentum =
    topSnapshotEntry &&
    typeof topSnapshotEntry.momentumTag === "string" &&
    topSnapshotEntry.momentumTag.trim().length > 0
      ? topSnapshotEntry.momentumTag.trim()
      : null;
  const topTrendValue =
    topSnapshotEntry &&
    typeof topSnapshotEntry.trendValue === "string" &&
    topSnapshotEntry.trendValue.trim().length > 0
      ? topSnapshotEntry.trendValue.trim()
      : null;
  const topTrendDirection =
    topSnapshotEntry &&
    typeof topSnapshotEntry.trendDirection === "string" &&
    topSnapshotEntry.trendDirection.trim().length > 0
      ? topSnapshotEntry.trendDirection.trim().toLowerCase()
      : "";
  const highlightDetails = [];
  if (topTrendValue && topTrendValue !== "--") {
    const trendLabel =
      topTrendDirection === "down" ? "trend dip" : topTrendDirection === "up" ? "trend surge" : "trend";
    highlightDetails.push(`${topTrendValue} ${trendLabel}`);
  }
  const highlightSubtitle =
    highlightDetails.length > 0
      ? highlightDetails.join(" | ")
      : topPointsDisplay
      ? `${topPointsDisplay} pts on the board`
      : topSnapshotEntry
      ? "All eyes on your defenders"
      : "Highlight your leaderboard heroes";
  const highlightChipsMarkup = topMomentum
    ? `<div class="leaderboard-snapshot__chips leaderboard-snapshot__chips--banner">
        <span class="leaderboard-snapshot__chip leaderboard-snapshot__chip--glow">${WeldUtil.escapeHtml(topMomentum)}</span>
      </div>`
    : "";
  const leaderboardHighlightMarkup = topSnapshotEntry
    ? `
        <div class="leaderboard-snapshot__banner">
          <span class="leaderboard-snapshot__icon">${WeldUtil.renderIcon("trophy", "md")}</span>
          <div class="leaderboard-snapshot__copy">
            <span class="leaderboard-snapshot__eyebrow">Leaderboard pulse</span>
            <h2 class="leaderboard-snapshot__title">${WeldUtil.escapeHtml(topDepartmentName)}</h2>
            <p class="leaderboard-snapshot__subtitle">${WeldUtil.escapeHtml(highlightSubtitle)}</p>
            ${highlightChipsMarkup}
          </div>
          ${
            topPointsDisplay
              ? `<div class="leaderboard-snapshot__score leaderboard-snapshot__score--highlight">
                  <span class="leaderboard-snapshot__points">${WeldUtil.escapeHtml(topPointsDisplay)}</span>
                  <span class="leaderboard-snapshot__points-unit">pts</span>
                </div>`
              : ""
          }
        </div>
      `
    : `
        <div class="leaderboard-snapshot__banner leaderboard-snapshot__banner--empty">
          <span class="leaderboard-snapshot__icon">${WeldUtil.renderIcon("trophy", "md")}</span>
          <div class="leaderboard-snapshot__copy">
            <span class="leaderboard-snapshot__eyebrow">Leaderboard pulse</span>
            <h2 class="leaderboard-snapshot__title">Ready when you are</h2>
            <p class="leaderboard-snapshot__subtitle">Publish departments to light up the leaderboard spotlight.</p>
          </div>
        </div>
      `;
  const leaderboardSnapshotCard = showLeaderboards
    ? `
    <div class="customer-hero-actions__panel customer-hero-actions__panel--snapshot">
      <div class="leaderboard-snapshot">
        <span class="leaderboard-snapshot__spark" aria-hidden="true"></span>
        ${leaderboardHighlightMarkup}
        ${leaderboardListMarkup}
        <div class="leaderboard-snapshot__cta-row">
          <button
            type="button"
            class="button-pill button-pill--ghost leaderboard-snapshot__cta"
            data-route="customer-leaderboards"
            data-role="customer">
            View leaderboards
          </button>
        </div>
      </div>
    </div>
  `
    : "";

  const pointsStripMarkup = `
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
  `;

  return `
    <header class="customer-hero">
      <h1>Good day, ${WeldUtil.escapeHtml(state.customer.name)}</h1>
      <p>Your vigilance is fuelling a safer inbox for everyone at Evergreen Capital.</p>
    </header>
    ${pointsStripMarkup}
    <div class="customer-hero-actions">
      ${leaderboardSnapshotCard}
      <div class="customer-hero-actions__panel customer-hero-actions__panel--report">
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
    ${
      showBadges
        ? `<section class="customer-section customer-section--badges">
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
    </section>`
        : ""
    }
    ${
      showRewards
        ? `<section id="customer-rewards" class="customer-section customer-section--rewards">
      <div class="section-header section-header--with-action">
        <div class="section-header__copy">
          <h2>Your rewards</h2>
          <p>Select a reward to demonstrate the instant redemption flow. Only rewards published by your organisation appear here.</p>
        </div>
        <button
          type="button"
          class="button-pill button-pill--primary section-header__action"
          data-route="customer-hub-rewards"
          data-role="customer">
          All rewards
        </button>
      </div>
      ${
        rewardsHtml
          ? `<div class="reward-grid reward-grid--catalogue reward-grid--hub">${rewardsHtml}</div>`
          : `<div class="reward-empty"><p>No rewards are currently published. Check back soon!</p></div>`
      }
    </section>`
        : ""
    }
    ${
      showQuests
        ? `<section class="customer-section customer-section--quests">
      <div class="section-header section-header--with-action">
        <div class="section-header__copy">
          <h2>Your quests</h2>
          <p>Introduce squads to the latest WeldSecure quests. Only published quests from your organisation appear here.</p>
        </div>
        <button
          type="button"
          class="button-pill button-pill--primary section-header__action"
          data-route="customer-hub-quests"
          data-role="customer">
          All quests
        </button>
      </div>
      ${
        questsHtml
          ? `<div class="quest-grid quest-grid--catalogue quest-grid--hub">${questsHtml}</div>`
          : `<div class="reward-empty"><p>No quests are currently published. Check back soon!</p></div>`
      }
    </section>`
        : ""
    }
    ${recognitionBoardMarkup}
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
  const leaderboardSnapshotCta = container.querySelector(".leaderboard-snapshot__cta");
  if (leaderboardSnapshotCta) {
    leaderboardSnapshotCta.addEventListener("click", () => {
      setRole("customer", "customer-leaderboards");
    });
  }
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

  function renderRewardsCatalogueView(state) {
    const publishedRewards = getPublishedRewards(state);
    const rewardsMarkup = publishedRewards.length
      ? `<div class="reward-grid reward-grid--catalogue reward-grid--hub">${publishedRewards.map(renderRewardCard).join("")}</div>`
      : `<div class="reward-empty"><p>No rewards are currently published. Check back soon!</p></div>`;
    return `
      <header class="customer-detail-header">
        <button type="button" class="customer-detail__back" data-action="back-to-hub">
          Back to hub
        </button>
        <span class="customer-detail__eyebrow">Rewards</span>
        <h1>All published rewards</h1>
        <p>Show every reward currently live in this hub and drill into the redemption flow from each tile.</p>
      </header>
      ${rewardsMarkup}
    `;
  }

  function renderQuestsCatalogueView(state) {
    const publishedQuests = getPublishedQuests(state);
    const questsMarkup = publishedQuests.length
      ? `<div class="quest-grid quest-grid--catalogue quest-grid--hub">${publishedQuests.map(renderQuestCard).join("")}</div>`
      : `<div class="reward-empty"><p>No quests are currently published. Check back soon!</p></div>`;
    return `
      <header class="customer-detail-header">
        <button type="button" class="customer-detail__back" data-action="back-to-hub">
          Back to hub
        </button>
        <span class="customer-detail__eyebrow">Quests</span>
        <h1>All published quests</h1>
        <p>Preview every quest that is currently published to this reporter hub.</p>
      </header>
      ${questsMarkup}
    `;
  }

  function attachCatalogueNavigation(container) {
    if (!container) return;
    const backButton = container.querySelector("[data-action='back-to-hub']");
    if (backButton) {
      backButton.addEventListener("click", () => {
        setRole("customer", "customer");
      });
    }
  }

  function attachCatalogueView(container, state) {
    if (!container) return;
    attachCatalogueNavigation(container);
    attachCustomerHubEvents(container, state);
  }


    function templateHub(appState) {
      const state = getState(appState);
      return renderCustomerHub(state);
    }

    function renderHub(container, appState) {
      if (!container) return;
      const state = getState(appState);
      container.innerHTML = renderCustomerHub(state);
      attachCustomerHubEvents(container, state);
      if (typeof window.setupBadgeShowcase === "function") {
        window.setupBadgeShowcase(container);
      }
    }

    function attachHub(container, appState) {
      if (!container) return;
      const state = getState(appState);
      attachCustomerHubEvents(container, state);
      if (typeof window.setupBadgeShowcase === "function") {
        window.setupBadgeShowcase(container);
      }
    }

    function templateRewards(appState) {
      const state = getState(appState);
      return renderRewardsCatalogueView(state);
    }

    function renderRewards(container, appState) {
      if (!container) return;
      const state = getState(appState);
      container.innerHTML = renderRewardsCatalogueView(state);
      attachCatalogueView(container, state);
    }

    function attachRewards(container, appState) {
      if (!container) return;
      const state = getState(appState);
      attachCatalogueView(container, state);
    }

    function templateQuests(appState) {
      const state = getState(appState);
      return renderQuestsCatalogueView(state);
    }

    function renderQuests(container, appState) {
      if (!container) return;
      const state = getState(appState);
      container.innerHTML = renderQuestsCatalogueView(state);
      attachCatalogueView(container, state);
    }

    function attachQuests(container, appState) {
      if (!container) return;
      const state = getState(appState);
      attachCatalogueView(container, state);
    }

    return {
      template: templateHub,
      render: renderHub,
      attach: attachHub,
      templateRewards: templateRewards,
      renderRewards: renderRewards,
      attachRewards: attachRewards,
      templateQuests: templateQuests,
      renderQuests: renderQuests,
      attachQuests: attachQuests
    };
  });
})();








