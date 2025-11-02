// state.js - state init & persistence helpers (namespaced)
(function () {
  const appData = window.AppData || {};
  const STORAGE_KEY = appData.STORAGE_KEY || 'WeldDemoState';
  const DEFAULT_REPORTER_PROMPT = appData.DEFAULT_REPORTER_PROMPT;
  const DEFAULT_EMERGENCY_LABEL = appData.DEFAULT_EMERGENCY_LABEL;
  const PREVIOUS_EMERGENCY_LABEL = appData.PREVIOUS_EMERGENCY_LABEL;
  const DEFAULT_REPORTER_REASONS = appData.DEFAULT_REPORTER_REASONS || [];
  const BADGES = appData.BADGES || [];
  const rawBadgeDrafts = appData.BADGE_DRAFTS;
  const BADGE_DRAFTS = rawBadgeDrafts instanceof Set ? rawBadgeDrafts : new Set(rawBadgeDrafts || []);
  const DEFAULT_QUESTS = appData.DEFAULT_QUESTS || [];
  const DEPARTMENT_LEADERBOARD = appData.DEPARTMENT_LEADERBOARD || [];
  const ENGAGEMENT_PROGRAMS = appData.ENGAGEMENT_PROGRAMS || [];
  const MessageStatus = appData.MessageStatus || {};

  function storageAvailable() {
    try {
      const testKey = "__weldTest";
      localStorage.setItem(testKey, "1");
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  function initialState() {
    const reporterReasons = DEFAULT_REPORTER_REASONS.map(item => ({ ...item }));
  
    return {
      meta: {
        role: null,
        route: "landing",
        addinScreen: "report",
        addinShellHeight: 760,
        lastReportedSubject: null,
        lastReportPoints: null,
        lastBalanceBefore: null,
        lastBalanceAfter: null,
        lastBadgeId: null,
        lastBadgeIds: [],
        lastBadgePoints: null,
        lastTotalAwarded: null,
        lastMessageId: null,
        lastClientSnapshot: null,
        reportFilter: null,
        rewardFilter: null,
        rewardStatusFilter: null,
        questFilter: null,
        questStatusFilter: null,
        badgeFilter: null,
        badgeStatusFilter: null,
        settingsOpen: false,
        settingsCategory: "reporter"
      },
      settings: {
        reporter: {
          reasonPrompt: DEFAULT_REPORTER_PROMPT,
          emergencyLabel: DEFAULT_EMERGENCY_LABEL,
          reasons: reporterReasons
        }
      },
      customer: {
        id: 501,
        name: "Rachel Summers",
        email: "rachel.summers@example.com",
        currentPoints: 540,
        redeemedPoints: 180,
        clientId: 101,
        bonusPoints: {
          weeklyCap: 150,
          earnedThisWeek: 110,
          breakdown: [
            {
              id: "quests",
              label: "Quests completed",
              description: "First quest this month triggered the double-points boost.",
              points: 60,
              firstOfMonthDouble: true
            },
            {
              id: "boosters",
              label: "Learning boosters",
              description: "Inbox coaching nudges acknowledged within 24 hours.",
              points: 30
            },
            {
              id: "team",
              label: "Team streak bonus",
              description: "Squad hit its weekly response streak target.",
              points: 20
            }
          ]
        },
        questCompletions: []
      },
      teamMembers: [
        {
          id: "rachel-summers",
          name: "Rachel Summers",
          email: "rachel.summers@example.com",
          title: "Operations Lead",
          location: "London HQ",
          specialty: "Finance workflows",
          avatarTone: "violet"
        },
        {
          id: "priya-shah",
          name: "Priya Shah",
          email: "priya.shah@example.com",
          title: "Senior Security Analyst",
          location: "London SOC",
          specialty: "Payment diversion",
          avatarTone: "teal"
        },
        {
          id: "will-adams",
          name: "Will Adams",
          email: "will.adams@example.com",
          title: "Risk Champion — Finance",
          location: "Birmingham",
          specialty: "Executive impersonation",
          avatarTone: "amber"
        },
        {
          id: "daniel-cho",
          name: "Daniel Cho",
          email: "daniel.cho@example.com",
          title: "Trading Operations Associate",
          location: "London HQ",
          specialty: "Market alerts",
          avatarTone: "blue"
        },
        {
          id: "hannah-elliott",
          name: "Hannah Elliott",
          email: "hannah.elliott@example.com",
          title: "Employee Success Partner",
          location: "Manchester",
          specialty: "Awareness programmes",
          avatarTone: "rose"
        }
      ],
      recognitions: [
        {
          id: "rec-1001",
          senderEmail: "priya.shah@example.com",
          senderName: "Priya Shah",
          senderTitle: "Senior Security Analyst",
          recipientEmail: "rachel.summers@example.com",
          recipientName: "Rachel Summers",
          recipientTitle: "Operations Lead",
          points: 35,
          focus: "Vendor payment spoof",
          message:
            "Rachel spotted the spoofed supplier account change before finance processed it and kept GBP 32k in our accounts.",
          channel: "Hub spotlight",
          createdAt: "2025-10-08T09:55:00Z"
        },
        {
          id: "rec-1002",
          senderEmail: "will.adams@example.com",
          senderName: "Will Adams",
          senderTitle: "Risk Champion — Finance",
          recipientEmail: "rachel.summers@example.com",
          recipientName: "Rachel Summers",
          recipientTitle: "Operations Lead",
          points: 20,
          focus: "BEC attempt escalated",
          message:
            "Thanks for looping me in on the fake CEO request. Your context helped us warn the exec team before any funds moved.",
          channel: "Slack kudos",
          createdAt: "2025-10-06T14:25:00Z"
        },
        {
          id: "rec-1003",
          senderEmail: "hannah.elliott@example.com",
          senderName: "Hannah Elliott",
          senderTitle: "Employee Success Partner",
          recipientEmail: "rachel.summers@example.com",
          recipientName: "Rachel Summers",
          recipientTitle: "Operations Lead",
          points: 25,
          focus: "Awareness champion",
          message:
            "Rachel’s town hall walkthrough on spotting bogus invoices gave every squad a playbook to challenge risky requests.",
          channel: "Town hall shout-out",
          createdAt: "2025-10-04T17:20:00Z"
        },
        {
          id: "rec-1004",
          senderEmail: "rachel.summers@example.com",
          senderName: "Rachel Summers",
          senderTitle: "Operations Lead",
          recipientEmail: "daniel.cho@example.com",
          recipientName: "Daniel Cho",
          recipientTitle: "Trading Operations Associate",
          points: 15,
          focus: "Credential lure spotted",
          message:
            "Daniel reset credentials within minutes of the lure email and blocked the follow-up attempt from reaching the desk.",
          channel: "Hub spotlight",
          createdAt: "2025-10-05T11:02:00Z"
        }
      ],
      rewards: [
        {
          id: 1,
          name: "Fortnum & Mason Afternoon Tea",
          description: "Premium afternoon tea experience for two, delivered to your door.",
          pointsCost: 400,
          icon: "gift",
          category: "experience",
          provider: "Fortnum & Mason",
          image: "linear-gradient(135deg, #9457ff 0%, #4e0dff 100%)",
          remaining: 6,
          published: true
        },
        {
          id: 2,
          name: "Selfridges Gift Card",
          description: "Digital gift card redeemable online or in-store.",
          pointsCost: 280,
          icon: "gift",
          category: "voucher",
          provider: "Selfridges & Co",
          image: "linear-gradient(135deg, #ff8a80 0%, #ff416c 100%)",
          remaining: 12,
          published: true
        },
        {
          id: 3,
          name: "Margot & Montanez Chocolate Hamper",
          description: "Limited edition artisan chocolate selection to celebrate vigilance.",
          pointsCost: 120,
          icon: "gift",
          category: "merchandise",
          provider: "Margot & Montanez",
          image: "linear-gradient(135deg, #ffbe0b 0%, #fb5607 100%)",
          remaining: 20,
          published: false
        },
        {
          id: 4,
          name: "Weld Champion Hoodie",
          description: "Exclusive Weld hoodie for team members leading the risk scoreboard.",
          pointsCost: 260,
          icon: "gift",
          category: "merchandise",
          provider: "Weld Apparel",
          image: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)",
          remaining: 15,
          published: false
        },
        {
          id: 5,
          name: "Amazon Gift Card",
          description: "Digital code redeemable across Amazon.co.uk for everyday essentials or treats.",
          pointsCost: 220,
          icon: "gift",
          category: "voucher",
          provider: "Amazon UK",
          image: "linear-gradient(135deg, #f97316 0%, #facc15 100%)",
          remaining: 18,
          published: true
        },
        {
          id: 6,
          name: "Plant a Tree",
          description: "Fund the planting of a tree through our sustainability partner.",
          pointsCost: 150,
          icon: "gift",
          category: "sustainability",
          provider: "Green Earth Collective",
          image: "linear-gradient(135deg, #22c55e 0%, #0ea5e9 100%)",
          remaining: 40,
          published: true
        },
        {
          id: 7,
          name: "Extra Day of Annual Leave",
          description: "Enjoy an additional day of paid leave approved by your manager.",
          pointsCost: 480,
          icon: "gift",
          category: "benefit",
          provider: "People Team",
          image: "linear-gradient(135deg, #818cf8 0%, #312e81 100%)",
          remaining: 5,
          published: false
        },
        {
          id: 8,
          name: "Donate to Charity",
          description: "Direct a WeldSecure-supported donation to a charitable partner of your choice.",
          pointsCost: 180,
          icon: "gift",
          category: "charity",
          provider: "WeldSecure Giving",
          image: "linear-gradient(135deg, #f472b6 0%, #ec4899 100%)",
          remaining: null,
          unlimited: true,
          published: true
        },
        {
          id: 9,
          name: "Contribute to Work Social Event",
          description: "Add funds to enhance the next team social experience.",
          pointsCost: 140,
          icon: "gift",
          category: "culture",
          provider: "Employee Engagement",
          image: "linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)",
          remaining: 25,
          published: false
        }
      ],
      quests: DEFAULT_QUESTS.map(quest => ({
        ...quest,
        published: typeof quest.published === "boolean" ? quest.published : true
      })),
      badges: BADGES.map(badge => ({
        ...badge,
        published: !BADGE_DRAFTS.has(badge.id)
      })),
      departmentLeaderboard: DEPARTMENT_LEADERBOARD.map(entry => ({
        ...entry
      })),
      engagementPrograms: ENGAGEMENT_PROGRAMS.map(program => ({
        ...program
      })),
      labs: {
        lastReviewAt: "2025-10-18T08:30:00Z",
        features: [
          {
            id: "adaptive-detections",
            name: "Adaptive detection tuning",
            status: "Private beta",
            summary: "Automatically recalibrates phishing heuristics per tenant using cross-network telemetry.",
            benefit: "Cuts analyst investigation time by serving enriched verdicts back into the queue.",
            tags: ["Detection", "Automation"],
            owner: "Product incubation",
            enabledClientIds: [101, 103]
          },
          {
            id: "just-in-time-nudges",
            name: "Just-in-time nudges",
            status: "Design partner",
            summary: "Pushes contextual prompts to employees immediately after a risky action is detected.",
            benefit: "Reduces repeat risky behaviour through targeted reinforcement moments.",
            tags: ["Behaviour change", "Reporter experience"],
            owner: "Behaviour Lab",
            enabledClientIds: [102]
          },
          {
            id: "tenant-signal-exchange",
            name: "Tenant signal exchange",
            status: "Private preview",
            summary: "Shares anonymised threat fingerprints between tenants to accelerate pattern blocking.",
            benefit: "Creates early warning signals ahead of spikes hitting the broader customer base.",
            tags: ["Threat intel", "Network effects"],
            owner: "WeldSecure Labs",
            enabledClientIds: []
          }
        ]
      },
      rewardRedemptions: [
        { id: 1, rewardId: 3, redeemedAt: "2025-09-12T09:30:00Z", status: "fulfilled" }
      ],
      messages: [
        {
          id: 9001,
          messageId: "AAMkAGU0Zjk5ZGMyLTQ4M2UtND",
          subject: "Caller posing as IT support about device settings",
          reporterName: "Rachel Summers",
          reporterEmail: "rachel.summers@example.com",
          clientId: 101,
          reportedAt: "2025-10-07T08:45:00Z",
          status: MessageStatus.APPROVED,
          reasons: ["reason-urgent-tone", "reason-looks-like-phishing"],
          pointsOnMessage: 20,
          pointsOnApproval: 80,
          additionalNotes:
            "They phoned saying they were from IT and pushed me to disable MFA and read out a reset PIN."
        },
        {
          id: 9002,
          messageId: "AAMkAGRjYTgzZjAtOGQ0Mi00",
          subject: "WhatsApp message pretending to be our CFO",
          reporterName: "Rachel Summers",
          reporterEmail: "rachel.summers@example.com",
          clientId: 101,
          reportedAt: "2025-10-02T17:12:00Z",
          status: MessageStatus.PENDING,
          reasons: ["reason-spoofing-senior", "reason-urgent-tone"],
          pointsOnMessage: 20,
          pointsOnApproval: 80,
          additionalNotes:
            "Request came from an unknown number asking for an urgent gift card purchase and to keep it secret."
        },
        {
          id: 9003,
          messageId: "AAMkAGQxZTZlNDAtZWMxOS00",
          subject: "Unfamiliar QR code posted at the car park entrance",
          reporterName: "Rachel Summers",
          reporterEmail: "rachel.summers@example.com",
          clientId: 101,
          reportedAt: "2025-09-26T11:06:00Z",
          status: MessageStatus.APPROVED,
          reasons: ["reason-unexpected-attachment", "reason-looks-like-phishing"],
          pointsOnMessage: 20,
          pointsOnApproval: 80,
          additionalNotes:
            "Sticker looked unofficial and led to a fake login page when scanned — removed it and reported facilities."
        }
      ],
      clients: [
        {
          id: 101,
          name: "Evergreen Capital",
          organizationId: "e3a4-uk-lon",
          pointsPerMessage: 20,
          pointsOnApproval: 80,
          activeUsers: 184,
          healthScore: 92,
          openCases: 3,
          lastReportAt: "2025-10-07T08:45:00Z"
        },
        {
          id: 102,
          name: "Harper & Black",
          organizationId: "hb-uk-lon",
          pointsPerMessage: 20,
          pointsOnApproval: 80,
          activeUsers: 82,
          healthScore: 86,
          openCases: 5,
          lastReportAt: "2025-10-06T15:20:00Z"
        },
        {
          id: 103,
          name: "Cobalt Manufacturing",
          organizationId: "cobalt-emea",
          pointsPerMessage: 20,
          pointsOnApproval: 80,
          activeUsers: 241,
          healthScore: 74,
          openCases: 9,
          lastReportAt: "2025-10-05T10:15:00Z"
        }
      ]
    };
  }

  function loadState() {
    if (!storageAvailable()) {
      return initialState();
    }
  
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return initialState();
    }
  
    try {
      const parsed = JSON.parse(raw);
      const baseState = initialState();
      const {
        reportReasons: legacyReportReasons,
        settings: storedSettingsRaw,
        ...passthrough
      } = parsed;
      const parsedSettings =
        storedSettingsRaw && typeof storedSettingsRaw === "object" ? storedSettingsRaw : {};
      const normalizedQuests = Array.isArray(parsed.quests)
        ? parsed.quests.map(quest => {
            const baseQuest = baseState.quests.find(item => item.id === quest.id);
            return {
              ...baseQuest,
              ...quest,
              published:
                typeof quest.published === "boolean"
                  ? quest.published
                  : baseQuest?.published ?? true
            };
          })
        : baseState.quests;
      const normalizedRewards = Array.isArray(parsed.rewards)
        ? (() => {
            const mergedRewards = parsed.rewards.map(reward => {
              const baseReward =
                baseState.rewards.find(item => item.id === reward.id) || {};
              const unlimited = baseReward.unlimited === true || reward.unlimited === true;
              const hasFiniteRemaining = Number.isFinite(reward.remaining);
              const baseRemaining = Number.isFinite(baseReward.remaining)
                ? baseReward.remaining
                : 0;
              return {
                ...baseReward,
                ...reward,
                icon: "gift",
                unlimited,
                remaining: unlimited
                  ? null
                  : hasFiniteRemaining
                  ? reward.remaining
                  : baseRemaining,
                published:
                  typeof reward.published === "boolean"
                    ? reward.published
                    : baseReward.published ?? true
              };
            });
            const existingRewardIds = new Set(
              mergedRewards.map(reward => reward.id)
            );
            const newRewards = baseState.rewards
              .filter(reward => !existingRewardIds.has(reward.id))
              .map(reward => ({ ...reward }));
            return [...mergedRewards, ...newRewards];
          })()
        : baseState.rewards;
      const normalizedBadges = Array.isArray(parsed.badges)
        ? (() => {
            const overrides = new Map();
            parsed.badges.forEach(item => {
              if (!item) return;
              const key =
                typeof item.id === "string" && item.id.trim().length > 0
                  ? item.id.trim()
                  : null;
              if (key) {
                overrides.set(key, { ...item, id: key });
              } else {
                const fallbackId = WeldUtil.generateId("badge");
                overrides.set(fallbackId, { ...item, id: fallbackId });
              }
            });
            const merged = baseState.badges.map(baseBadge => {
              const override = overrides.get(baseBadge.id);
              if (!override) {
                return { ...baseBadge };
              }
              overrides.delete(baseBadge.id);
              return {
                ...baseBadge,
                ...override,
                id: baseBadge.id,
                published:
                  typeof override.published === "boolean"
                    ? override.published
                    : baseBadge.published
              };
            });
            const additional = Array.from(overrides.values()).map(item => ({
              ...item,
              published:
                typeof item.published === "boolean"
                  ? item.published
                  : !BADGE_DRAFTS.has(item.id)
            }));
            return [...merged, ...additional];
          })()
        : baseState.badges;
      const normalizedClients = Array.isArray(parsed.clients)
        ? parsed.clients.map(client => {
            const baseClient = baseState.clients.find(item => item.id === client.id);
            return {
              ...client,
              pointsPerMessage: baseClient ? baseClient.pointsPerMessage : 20,
              pointsOnApproval: baseClient ? baseClient.pointsOnApproval : 80
            };
          })
        : baseState.clients;
      const normalizedRewardRedemptions = Array.isArray(parsed.rewardRedemptions)
        ? parsed.rewardRedemptions.map(entry => ({
            ...entry,
            id: WeldUtil.normalizeId(entry.id, "redemption") ?? WeldUtil.generateId("redemption")
          }))
        : baseState.rewardRedemptions.map(entry => ({
            ...entry,
            id: WeldUtil.normalizeId(entry.id, "redemption") ?? WeldUtil.generateId("redemption")
          }));
      const baseTeamMembers = Array.isArray(baseState.teamMembers) ? baseState.teamMembers : [];
      const normalizedTeamMembers = Array.isArray(parsed.teamMembers)
        ? (() => {
            const seenEmails = new Set();
            const normalized = [];
            parsed.teamMembers.forEach(member => {
              if (!member) return;
              const email =
                typeof member.email === "string" && member.email.trim().length > 0
                  ? member.email.trim()
                  : null;
              if (!email) return;
              const emailKey = email.toLowerCase();
              if (seenEmails.has(emailKey)) return;
              seenEmails.add(emailKey);
              const candidateId = WeldUtil.normalizeId(member.id, "member") ?? WeldUtil.generateId("member");
              const baseMatch =
                baseTeamMembers.find(baseMember => {
                  if (!baseMember) return false;
                  if (baseMember.id && baseMember.id === candidateId) return true;
                  if (typeof baseMember.email !== "string") return false;
                  return baseMember.email.trim().toLowerCase() === emailKey;
                }) || null;
              normalized.push({
                ...(baseMatch ? { ...baseMatch } : {}),
                ...member,
                id: candidateId,
                email
              });
            });
            baseTeamMembers.forEach(baseMember => {
              if (!baseMember || typeof baseMember.email !== "string") return;
              const emailKey = baseMember.email.trim().toLowerCase();
              if (!emailKey || seenEmails.has(emailKey)) return;
              seenEmails.add(emailKey);
              normalized.push({ ...baseMember });
            });
            return normalized;
          })()
        : baseTeamMembers.map(member => ({ ...member }));
      const teamMemberLookup = new Map();
      normalizedTeamMembers.forEach(member => {
        if (!member || typeof member.email !== "string") return;
        const key = member.email.trim().toLowerCase();
        if (!key || teamMemberLookup.has(key)) return;
        teamMemberLookup.set(key, member);
      });
      const normalizedRecognitions = Array.isArray(parsed.recognitions)
        ? (() => {
            const seenIds = new Set();
            return parsed.recognitions
              .map(entry => {
                if (!entry) return null;
                const id = WeldUtil.normalizeId(entry.id, "recognition") ?? WeldUtil.generateId("recognition");
                if (seenIds.has(id)) return null;
                seenIds.add(id);
                const senderEmail =
                  typeof entry.senderEmail === "string" && entry.senderEmail.trim().length > 0
                    ? entry.senderEmail.trim()
                    : null;
                const recipientEmail =
                  typeof entry.recipientEmail === "string" && entry.recipientEmail.trim().length > 0
                    ? entry.recipientEmail.trim()
                    : null;
                if (!senderEmail || !recipientEmail) return null;
                const senderMember = teamMemberLookup.get(senderEmail.toLowerCase()) || null;
                const recipientMember = teamMemberLookup.get(recipientEmail.toLowerCase()) || null;
                const rawPoints = Number(entry.points);
                const normalizedPoints =
                  Number.isFinite(rawPoints) && rawPoints > 0 ? Math.round(rawPoints) : 0;
                const focusLabel =
                  typeof entry.focus === "string" && entry.focus.trim().length > 0
                    ? entry.focus.trim()
                    : "Recognition spotlight";
                const channelLabel =
                  typeof entry.channel === "string" && entry.channel.trim().length > 0
                    ? entry.channel.trim()
                    : "Hub spotlight";
                const message =
                  typeof entry.message === "string" && entry.message.trim().length > 0
                    ? entry.message.trim()
                    : null;
                if (!message) return null;
                const createdAt =
                  typeof entry.createdAt === "string" && entry.createdAt.trim().length > 0
                    ? entry.createdAt.trim()
                    : new Date().toISOString();
                return {
                  id,
                  senderEmail,
                  senderName: entry.senderName || senderMember?.name || senderEmail,
                  senderTitle: entry.senderTitle || senderMember?.title || "",
                  recipientEmail,
                  recipientName: entry.recipientName || recipientMember?.name || recipientEmail,
                  recipientTitle: entry.recipientTitle || recipientMember?.title || "",
                  points: normalizedPoints,
                  focus: focusLabel,
                  message,
                  channel: channelLabel,
                  createdAt
                };
              })
              .filter(Boolean);
          })()
        : (baseState.recognitions || []).map(entry => ({ ...entry }));
      const normalizedLeaderboard = Array.isArray(parsed.departmentLeaderboard)
        ? (() => {
            const baseMap = new Map(
              (baseState.departmentLeaderboard || []).map(entry => [entry.id, entry])
            );
            const seen = new Set();
            const merged = parsed.departmentLeaderboard
              .map(entry => {
                if (!entry) return null;
                const normalizedId = WeldUtil.normalizeId(entry.id, "dept") ?? WeldUtil.generateId("dept");
                const baseEntry = baseMap.get(normalizedId) || {};
                seen.add(normalizedId);
                return {
                  ...baseEntry,
                  ...entry,
                  id: normalizedId,
                  published:
                    typeof entry.published === "boolean"
                      ? entry.published
                      : baseEntry.published ?? true
                };
              })
              .filter(Boolean);
            const additions = (baseState.departmentLeaderboard || [])
              .filter(entry => entry && !seen.has(entry.id))
              .map(entry => ({ ...entry }));
            return [...merged, ...additions];
          })()
        : (baseState.departmentLeaderboard || []).map(entry => ({ ...entry }));
      const normalizedPrograms = Array.isArray(parsed.engagementPrograms)
        ? (() => {
            const baseMap = new Map((baseState.engagementPrograms || []).map(item => [item.id, item]));
            const seen = new Set();
            const merged = parsed.engagementPrograms
              .map(item => {
                if (!item) return null;
                const normalizedId = WeldUtil.normalizeId(item.id, "program") ?? WeldUtil.generateId("program");
                const baseItem = baseMap.get(normalizedId) || {};
                seen.add(normalizedId);
                return {
                  ...baseItem,
                  ...item,
                  id: normalizedId,
                  published:
                    typeof item.published === "boolean"
                      ? item.published
                      : baseItem.published ?? true
                };
              })
              .filter(Boolean);
            const additions = (baseState.engagementPrograms || [])
              .filter(item => item && !seen.has(item.id))
              .map(item => ({ ...item }));
            return [...merged, ...additions];
          })()
        : (baseState.engagementPrograms || []).map(item => ({ ...item }));
      const normalizedLabs = (() => {
        const baseLabs = baseState.labs && typeof baseState.labs === "object" ? baseState.labs : {};
        const parsedLabs = parsed.labs && typeof parsed.labs === "object" ? parsed.labs : {};
        const baseFeatures = Array.isArray(baseLabs.features) ? baseLabs.features : [];
        const parsedFeatures = Array.isArray(parsedLabs.features) ? parsedLabs.features : [];
        const overrides = new Map();
        parsedFeatures.forEach(item => {
          if (!item) return;
          const key =
            typeof item.id === "string" && item.id.trim().length > 0
              ? item.id.trim()
              : typeof item.id === "number" && Number.isFinite(item.id)
              ? String(item.id)
              : null;
          if (!key) return;
          overrides.set(key, { ...item, id: key });
        });
        const normalizeClientIds = source => {
          if (!Array.isArray(source)) return [];
          const seen = new Set();
          const normalized = [];
          source.forEach(value => {
            let candidate = null;
            if (Number.isFinite(value)) {
              candidate = Number(value);
            } else if (typeof value === "string") {
              const trimmed = value.trim();
              if (!trimmed) return;
              const numeric = Number(trimmed);
              candidate = Number.isFinite(numeric) ? numeric : trimmed;
            }
            if (candidate === null) return;
            const key = typeof candidate === "number" ? candidate : String(candidate);
            if (seen.has(key)) return;
            seen.add(key);
            normalized.push(candidate);
          });
          return normalized;
        };
        const mergedFeatures = baseFeatures.map(feature => {
          const id =
            typeof feature.id === "string" && feature.id.trim().length > 0
              ? feature.id.trim()
              : typeof feature.id === "number" && Number.isFinite(feature.id)
              ? String(feature.id)
              : WeldUtil.generateId("lab");
          const override = overrides.get(id);
          if (override) {
            overrides.delete(id);
          }
          const enabledSource = override?.enabledClientIds ?? feature.enabledClientIds ?? [];
          return {
            ...feature,
            ...(override ? { ...override } : {}),
            id,
            enabledClientIds: normalizeClientIds(enabledSource)
          };
        });
        overrides.forEach((override, id) => {
          mergedFeatures.push({
            ...override,
            id,
            enabledClientIds: normalizeClientIds(override.enabledClientIds)
          });
        });
        const lastReviewAt =
          typeof parsedLabs.lastReviewAt === "string" && parsedLabs.lastReviewAt.trim().length > 0
            ? parsedLabs.lastReviewAt.trim()
            : typeof baseLabs.lastReviewAt === "string" && baseLabs.lastReviewAt.trim().length > 0
            ? baseLabs.lastReviewAt.trim()
            : null;
        return {
          ...baseLabs,
          ...parsedLabs,
          lastReviewAt,
          features: mergedFeatures
        };
      })();
      const baseReporterSettings = baseState.settings?.reporter || {
        reasonPrompt: DEFAULT_REPORTER_PROMPT,
        emergencyLabel: DEFAULT_EMERGENCY_LABEL,
        reasons: []
      };
      const storedReporterSettings =
        parsedSettings && typeof parsedSettings.reporter === "object"
          ? parsedSettings.reporter
          : null;
      const reporterReasonsSource = Array.isArray(storedReporterSettings?.reasons)
        ? storedReporterSettings.reasons
        : Array.isArray(legacyReportReasons)
        ? legacyReportReasons
        : baseReporterSettings.reasons;
      const seenReasonIds = new Set();
      const reasonIdMap = new Map();
      const normalizedReporterReasons = [];
      reporterReasonsSource.forEach((reason, index) => {
        if (!reason) return;
        const labelSource =
          typeof reason === "string"
            ? reason
            : typeof reason.label === "string"
            ? reason.label
            : typeof reason.description === "string"
            ? reason.description
            : null;
        if (!labelSource) return;
        const label = labelSource.trim();
        if (!label) return;
        const idCandidate =
          typeof reason === "string" ? null : reason.id ?? reason.key ?? reason.value ?? null;
        let normalizedId = WeldUtil.normalizeId(idCandidate, "reason");
        const legacyKey = normalizedId;
        if (!normalizedId) {
          normalizedId = `reason-${index + 1}`;
        }
        while (seenReasonIds.has(normalizedId)) {
          normalizedId = `${normalizedId}-${index + 1}`;
        }
        seenReasonIds.add(normalizedId);
        if (legacyKey) {
          reasonIdMap.set(legacyKey, normalizedId);
        }
        reasonIdMap.set(String(index + 1), normalizedId);
        normalizedReporterReasons.push({ id: normalizedId, label });
      });
      const reporterReasons =
        normalizedReporterReasons.length > 0
          ? normalizedReporterReasons
          : baseReporterSettings.reasons.map(item => ({ ...item }));
      const normalizedReporterSettings = {
        reasonPrompt:
          typeof storedReporterSettings?.reasonPrompt === "string" &&
          storedReporterSettings.reasonPrompt.trim().length > 0
            ? storedReporterSettings.reasonPrompt.trim()
            : baseReporterSettings.reasonPrompt,
        emergencyLabel:
          typeof storedReporterSettings?.emergencyLabel === "string" &&
          storedReporterSettings.emergencyLabel.trim().length > 0
            ? storedReporterSettings.emergencyLabel.trim()
            : baseReporterSettings.emergencyLabel,
        reasons: reporterReasons
      };
      if (
        typeof normalizedReporterSettings.emergencyLabel === "string" &&
        normalizedReporterSettings.emergencyLabel.trim().toLowerCase() ===
          PREVIOUS_EMERGENCY_LABEL.toLowerCase()
      ) {
        normalizedReporterSettings.emergencyLabel = DEFAULT_EMERGENCY_LABEL;
      }
      const normalizedSettings = {
        ...baseState.settings,
        ...(parsedSettings && typeof parsedSettings === "object" ? parsedSettings : {}),
        reporter: normalizedReporterSettings
      };
      const normalizedMessages = Array.isArray(parsed.messages)
        ? parsed.messages.map(message => {
            const clientId = message.clientId ?? baseState.customer.clientId;
            const clientConfig =
              normalizedClients.find(client => client.id === clientId) ??
              baseState.clients.find(client => client.id === clientId);
            const normalizedMessageId = WeldUtil.normalizeId(message.id, "message") ?? WeldUtil.generateId("message");
            const externalMessageId =
              typeof message.messageId === "string" && message.messageId.trim().length > 0
                ? message.messageId.trim()
                : WeldUtil.generateId("MSG").toUpperCase();
            const rawReasons = Array.isArray(message.reasons) ? message.reasons : [];
            const normalizedReasonIds = [];
            rawReasons.forEach((reasonId, index) => {
              const normalizedKey = WeldUtil.normalizeId(reasonId, "reason");
              let mappedId = null;
              if (normalizedKey && reasonIdMap.has(normalizedKey)) {
                mappedId = reasonIdMap.get(normalizedKey);
              } else if (reasonIdMap.has(String(index + 1))) {
                mappedId = reasonIdMap.get(String(index + 1));
              } else if (normalizedKey) {
                mappedId = normalizedKey;
              }
              if (mappedId && !normalizedReasonIds.includes(mappedId)) {
                normalizedReasonIds.push(mappedId);
              }
            });
            return {
              ...message,
              id: normalizedMessageId,
              messageId: externalMessageId,
              clientId,
              pointsOnMessage: message.pointsOnMessage ?? clientConfig?.pointsPerMessage ?? 20,
              pointsOnApproval: message.pointsOnApproval ?? clientConfig?.pointsOnApproval ?? 80,
              reasons: normalizedReasonIds
            };
          })
        : baseState.messages.map(message => {
            const normalizedMessageId = WeldUtil.normalizeId(message.id, "message") ?? WeldUtil.generateId("message");
            const externalMessageId =
              typeof message.messageId === "string" && message.messageId.trim().length > 0
                ? message.messageId.trim()
                : WeldUtil.generateId("MSG").toUpperCase();
            const baseReasons = Array.isArray(message.reasons) ? message.reasons : [];
            const normalizedReasonIds = [];
            baseReasons.forEach((reasonId, index) => {
              const normalizedKey = WeldUtil.normalizeId(reasonId, "reason");
              let mappedId = null;
              if (normalizedKey && reasonIdMap.has(normalizedKey)) {
                mappedId = reasonIdMap.get(normalizedKey);
              } else if (reasonIdMap.has(String(index + 1))) {
                mappedId = reasonIdMap.get(String(index + 1));
              } else if (normalizedKey) {
                mappedId = normalizedKey;
              }
              if (mappedId && !normalizedReasonIds.includes(mappedId)) {
                normalizedReasonIds.push(mappedId);
              }
            });
            return {
              ...message,
              id: normalizedMessageId,
              messageId: externalMessageId,
              reasons: normalizedReasonIds
            };
          });
      const mergedMeta = {
        ...baseState.meta,
        ...parsed.meta
      };
      if (mergedMeta.lastMessageId === null || mergedMeta.lastMessageId === undefined) {
        mergedMeta.lastMessageId = null;
      } else if (typeof mergedMeta.lastMessageId === "string") {
        mergedMeta.lastMessageId = mergedMeta.lastMessageId.trim() || null;
      } else if (Number.isFinite(mergedMeta.lastMessageId)) {
        mergedMeta.lastMessageId = String(mergedMeta.lastMessageId);
      } else {
        mergedMeta.lastMessageId = null;
      }
      const normalizeFilter = value =>
        typeof value === "string" && value.trim().length > 0 ? value.trim().toLowerCase() : null;
      const normalizeStatusFilter = value => {
        const normalized = normalizeFilter(value);
        return normalized === "published" || normalized === "unpublished" ? normalized : null;
      };
      const normalizeReportFilter = value => {
        const normalized = normalizeFilter(value);
        return normalized === "other" ? "other" : null;
      };
      mergedMeta.reportFilter = normalizeReportFilter(mergedMeta.reportFilter);
      mergedMeta.rewardFilter = normalizeFilter(mergedMeta.rewardFilter);
      mergedMeta.rewardStatusFilter = normalizeStatusFilter(mergedMeta.rewardStatusFilter);
      mergedMeta.questFilter = normalizeFilter(mergedMeta.questFilter);
      mergedMeta.questStatusFilter = normalizeStatusFilter(mergedMeta.questStatusFilter);
      mergedMeta.badgeFilter = normalizeFilter(mergedMeta.badgeFilter);
      mergedMeta.badgeStatusFilter = normalizeStatusFilter(mergedMeta.badgeStatusFilter);
      if (Array.isArray(mergedMeta.lastBadgeIds)) {
        mergedMeta.lastBadgeIds = mergedMeta.lastBadgeIds
          .map(id => {
            if (typeof id === "string") {
              const trimmed = id.trim();
              return trimmed.length > 0 ? trimmed : null;
            }
            if (Number.isFinite(id)) {
              return String(id);
            }
            return null;
          })
          .filter(Boolean);
      } else {
        mergedMeta.lastBadgeIds = [];
      }
      mergedMeta.settingsOpen = false;
      if (
        mergedMeta.settingsCategory &&
        !SETTINGS_CATEGORIES.some(
          category => category.id === mergedMeta.settingsCategory && !category.disabled
        )
      ) {
        const fallbackCategory =
          SETTINGS_CATEGORIES.find(category => !category.disabled) || SETTINGS_CATEGORIES[0] || null;
        mergedMeta.settingsCategory = fallbackCategory ? fallbackCategory.id : null;
      }
      const { customer: storedCustomer, ...restPassthrough } = passthrough;
      const normalizeBonusPoints = (candidate, baseBonus) => {
        const fallback = baseBonus && typeof baseBonus === "object" ? baseBonus : {};
        const baseBreakdown = Array.isArray(fallback.breakdown) ? fallback.breakdown : [];
        const cloneBaseBreakdown = () => baseBreakdown.map(item => ({ ...item }));
        if (!candidate || typeof candidate !== "object") {
          const weeklyCapFallback = Number(fallback.weeklyCap);
          const earnedFallback = Number(fallback.earnedThisWeek);
          return {
            weeklyCap: Math.max(0, Number.isFinite(weeklyCapFallback) ? weeklyCapFallback : 0),
            earnedThisWeek: Math.max(0, Number.isFinite(earnedFallback) ? earnedFallback : 0),
            breakdown: cloneBaseBreakdown()
          };
        }
        const weeklyCapRaw = Number(candidate.weeklyCap);
        const earnedRaw = Number(
          candidate.earnedThisWeek ?? candidate.earned ?? candidate.current ?? fallback.earnedThisWeek
        );
        const weeklyCap = Math.max(
          0,
          Number.isFinite(weeklyCapRaw) ? weeklyCapRaw : Number(fallback.weeklyCap) || 0
        );
        const earnedThisWeek = Math.max(
          0,
          Number.isFinite(earnedRaw) ? earnedRaw : Number(fallback.earnedThisWeek) || 0
        );
        const sourceBreakdown = Array.isArray(candidate.breakdown) ? candidate.breakdown : [];
        const baseMap = new Map(
          baseBreakdown
            .map(entry => {
              if (!entry || typeof entry !== "object") return null;
              const key =
                typeof entry.id === "string" && entry.id.trim().length > 0 ? entry.id.trim() : null;
              return key ? [key, entry] : null;
            })
            .filter(Boolean)
        );
        const normalizedBreakdown = sourceBreakdown
          .map((entry, index) => {
            if (!entry || typeof entry !== "object") return null;
            const rawId =
              typeof entry.id === "string" && entry.id.trim().length > 0 ? entry.id.trim() : null;
            const baseEntry = (rawId && baseMap.get(rawId)) || baseBreakdown[index] || null;
            const labelCandidate =
              typeof entry.label === "string" && entry.label.trim().length > 0
                ? entry.label.trim()
                : typeof baseEntry?.label === "string"
                ? baseEntry.label
                : "";
            if (!labelCandidate) return null;
            const normalizedId =
              rawId ||
              (typeof baseEntry?.id === "string" && baseEntry.id.trim().length > 0
                ? baseEntry.id.trim()
                : WeldUtil.generateId(`bonus-${index + 1}`));
            const descriptionCandidate =
              typeof entry.description === "string" && entry.description.trim().length > 0
                ? entry.description.trim()
                : typeof baseEntry?.description === "string"
                ? baseEntry.description
                : "";
            const pointsCandidate = Number(entry.points);
            const basePointsCandidate = Number(baseEntry?.points);
            const points = Number.isFinite(pointsCandidate)
              ? pointsCandidate
              : Number.isFinite(basePointsCandidate)
              ? basePointsCandidate
              : 0;
            const firstOfMonthDouble =
              entry.firstOfMonthDouble === true ||
              (baseEntry && baseEntry.firstOfMonthDouble === true);
            return {
              id: normalizedId,
              label: labelCandidate,
              description: descriptionCandidate,
              points,
              firstOfMonthDouble
            };
          })
          .filter(Boolean);
        const breakdown =
          normalizedBreakdown.length > 0 ? normalizedBreakdown : cloneBaseBreakdown();
        return {
          weeklyCap,
          earnedThisWeek,
          breakdown
        };
      };
      const normalizeQuestCompletions = (source, baseHistory) => {
        const baseList = Array.isArray(baseHistory) ? baseHistory : [];
        const cloneBaseList = () => baseList.map(entry => ({ ...entry }));
        if (!Array.isArray(source)) {
          return cloneBaseList();
        }
        const normalized = source
          .map((entry, index) => {
            if (!entry || typeof entry !== "object") return null;
            const questIdSource =
              entry.questId !== undefined && entry.questId !== null ? String(entry.questId) : null;
            const questId = questIdSource ? questIdSource.trim() : "";
            if (!questId) return null;
            const rawCompleted =
              typeof entry.completedAt === "string" ? entry.completedAt.trim() : "";
            let completedAt = null;
            if (rawCompleted) {
              const parsed = new Date(rawCompleted);
              if (!Number.isNaN(parsed.getTime())) {
                completedAt = parsed.toISOString();
              }
            }
            if (!completedAt) {
              const baseEntry = baseList[index];
              if (baseEntry && typeof baseEntry.completedAt === "string") {
                const parsed = new Date(baseEntry.completedAt);
                if (!Number.isNaN(parsed.getTime())) {
                  completedAt = parsed.toISOString();
                }
              }
            }
            if (!completedAt) {
              completedAt = new Date().toISOString();
            }
            const rawAwarded = Number(entry.pointsAwarded);
            const rawBase = Number(entry.basePoints);
            const pointsAwarded = Number.isFinite(rawAwarded)
              ? rawAwarded
              : Number.isFinite(rawBase)
              ? rawBase
              : 0;
            const basePoints = Number.isFinite(rawBase) ? rawBase : null;
            const doubled = entry.doubled === true;
            const idSource =
              typeof entry.id === "string" && entry.id.trim().length > 0
                ? entry.id.trim()
                : null;
            const id = idSource || WeldUtil.generateId(`quest-completion-${index + 1}`);
            return {
              id,
              questId,
              completedAt,
              pointsAwarded,
              basePoints,
              doubled
            };
          })
          .filter(Boolean);
        if (normalized.length === 0) {
          return cloneBaseList();
        }
        const maxEntries = 50;
        return normalized.slice(0, maxEntries);
      };
      const baseCustomer =
        baseState.customer && typeof baseState.customer === "object" ? baseState.customer : {};
      const normalizedCustomer = (() => {
        if (!storedCustomer || typeof storedCustomer !== "object") {
          const baseBonus = baseCustomer.bonusPoints || {};
          return {
            ...baseCustomer,
            bonusPoints: normalizeBonusPoints(null, baseBonus),
            questCompletions: normalizeQuestCompletions(null, baseCustomer.questCompletions)
          };
        }
        const baseBonus = baseCustomer.bonusPoints || {};
        return {
          ...baseCustomer,
          ...storedCustomer,
          bonusPoints: normalizeBonusPoints(storedCustomer.bonusPoints, baseBonus),
          questCompletions: normalizeQuestCompletions(
            storedCustomer.questCompletions,
            baseCustomer.questCompletions
          )
        };
      })();
      return {
        ...baseState,
        ...restPassthrough,
        customer: normalizedCustomer,
        meta: mergedMeta,
        rewards: normalizedRewards,
        quests: normalizedQuests,
        badges: normalizedBadges,
        messages: normalizedMessages,
        clients: normalizedClients,
        rewardRedemptions: normalizedRewardRedemptions,
        teamMembers: normalizedTeamMembers,
        recognitions: normalizedRecognitions,
        departmentLeaderboard: normalizedLeaderboard,
        engagementPrograms: normalizedPrograms,
        labs: normalizedLabs,
        settings: normalizedSettings
      };
    } catch {
      return initialState();
    }
  }

  function saveState(nextState) {
    if (!storageAvailable()) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  }

  window.WeldState = { initialState, loadState, saveState, storageAvailable, STORAGE_KEY };
})();


