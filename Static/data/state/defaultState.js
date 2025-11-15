// data/state/defaultState.js - baseline demo payload kept separate from logic
(function () {
  const AppData = window.AppData || {};
  const DirectoryData = window.DirectoryData || {};
  const defaults = AppData.DEFAULTS && typeof AppData.DEFAULTS === "object" ? AppData.DEFAULTS : {};
  const resolveStringDefault = (value, fallback) => {
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed.length > 0) return trimmed;
    }
    if (typeof fallback === "string") {
      const trimmedFallback = fallback.trim();
      if (trimmedFallback.length > 0) return trimmedFallback;
    }
    return "";
  };
  const cloneReasonArray = source =>
    Array.isArray(source) ? source.map(reason => (reason && typeof reason === "object" ? { ...reason } : reason)) : [];
  const cloneDirectoryObject = source => {
    if (!source || typeof source !== "object") return {};
    try {
      return JSON.parse(JSON.stringify(source));
    } catch {
      return { ...source };
    }
  };
  const cloneDirectoryList = key =>
    Array.isArray(DirectoryData[key]) ? DirectoryData[key].map(entry => ({ ...entry })) : [];
  const directorySnapshot = {
    integrations: cloneDirectoryObject(DirectoryData.integrations),
    departments: cloneDirectoryList("departments"),
    teams: cloneDirectoryList("teams"),
    users: cloneDirectoryList("users")
  };
  const tonePalette = ["violet", "teal", "amber", "blue", "rose", "emerald", "indigo", "cyan"];
  const buildTeamMembers = () => {
    if (!Array.isArray(directorySnapshot.users) || directorySnapshot.users.length === 0) {
      return [];
    }
    return directorySnapshot.users.map((user, index) => {
      const id = user.id || `member-${index}`;
      const displayNameParts = [user.givenName, user.surname].filter(
        part => typeof part === "string" && part.trim().length > 0
      );
      const name = user.displayName || displayNameParts.join(" ") || user.mail || `Member ${index + 1}`;
      return {
        id,
        name,
        email: user.mail || "",
        title: user.jobTitle || "",
        location: user.officeLocation || "Hybrid workplace",
        specialty: user.expertiseTag || user.jobTitle || "Security champion",
        avatarTone: tonePalette[index % tonePalette.length]
      };
    });
  };

  const defaultReporterPrompt = resolveStringDefault(
    AppData.DEFAULT_REPORTER_PROMPT,
    defaults.REPORTER_PROMPT
  );
  const defaultEmergencyLabel = resolveStringDefault(
    AppData.DEFAULT_EMERGENCY_LABEL,
    defaults.EMERGENCY_LABEL
  );
  const defaultReporterReasons = (() => {
    if (Array.isArray(AppData.DEFAULT_REPORTER_REASONS) && AppData.DEFAULT_REPORTER_REASONS.length > 0) {
      return cloneReasonArray(AppData.DEFAULT_REPORTER_REASONS);
    }
    if (Array.isArray(defaults.REPORTER_REASONS) && defaults.REPORTER_REASONS.length > 0) {
      return cloneReasonArray(defaults.REPORTER_REASONS);
    }
    return [];
  })();
  const payload = {
  "version": "2025-11-05",
  "meta": {
    "role": null,
    "route": "landing",
    "addinScreen": "report",
    "addinShellHeight": 900,
    "lastReportedSubject": null,
    "lastReportPoints": null,
    "lastBalanceBefore": null,
    "lastBalanceAfter": null,
    "lastBadgeId": null,
    "lastBadgeIds": [],
    "lastBadgePoints": null,
    "lastTotalAwarded": null,
    "lastMessageId": null,
    "lastClientSnapshot": null,
    "reportFilter": null,
    "rewardFilter": null,
    "rewardStatusFilter": null,
    "questFilter": null,
    "questStatusFilter": null,
    "badgeFilter": null,
    "badgeStatusFilter": null,
    "customerBadgeAvailabilityFilter": null,
    "settingsOpen": false,
    "settingsCategory": "reporter",
    "directorySelection": {
      "departmentId": null,
      "teamId": null
    },
    "achievementFlags": {}
  },
  "settings": {
    "reporter": {
      "reasonPrompt": defaultReporterPrompt,
      "emergencyLabel": defaultEmergencyLabel,
      "reasons": defaultReporterReasons
    }
  },
  "directory": directorySnapshot,
  "customer": {
    "id": 501,
    "name": "Rachel Summers",
    "email": "rachel.summers@weld.onmicrosoft.com",
    "currentPoints": 540,
    "redeemedPoints": 180,
    "clientId": 101,
    "bonusPoints": {
      "weeklyCap": 150,
      "earnedThisWeek": 110,
      "breakdown": [
        {
          "id": "quests",
          "label": "Quests completed",
          "description": "First quest this month triggered the double-points boost.",
          "points": 60,
          "firstOfMonthDouble": true
        },
        {
          "id": "boosters",
          "label": "Learning boosters",
          "description": "Inbox coaching nudges acknowledged within 24 hours.",
          "points": 30
        },
        {
          "id": "team",
          "label": "Team streak bonus",
          "description": "Squad hit its weekly response streak target.",
          "points": 20
        }
      ]
    },
    "questCompletions": []
  },
  "teamMembers": buildTeamMembers(),
  "recognitions": [
    {
      "id": "rec-1001",
      "senderEmail": "amelia.reed@weld.onmicrosoft.com",
      "senderName": "Amelia Reed",
      "senderTitle": "Director of Treasury Assurance",
      "recipientEmail": "rachel.summers@weld.onmicrosoft.com",
      "recipientName": "Rachel Summers",
      "recipientTitle": "Operations Lead",
      "points": 35,
      "focus": "Vendor payment spoof",
      "message": "Rachel spotted the spoofed supplier account change before finance processed it and kept GBP 32k in our accounts.",
      "channel": "Hub spotlight",
      "createdAt": "2025-10-08T09:55:00Z"
    },
    {
      "id": "rec-1002",
      "senderEmail": "george.collins@weld.onmicrosoft.com",
      "senderName": "George Collins",
      "senderTitle": "Accounts Payable Specialist",
      "recipientEmail": "amelia.reed@weld.onmicrosoft.com",
      "recipientName": "Amelia Reed",
      "recipientTitle": "Director of Treasury Assurance",
      "points": 20,
      "focus": "BEC attempt escalated",
      "message": "She caught the fake CFO approval trail and had treasury roll back the request before anything moved.",
      "channel": "Slack kudos",
      "createdAt": "2025-10-06T14:25:00Z"
    },
    {
      "id": "rec-1003",
      "senderEmail": "emily.chen@weld.onmicrosoft.com",
      "senderName": "Emily Chen",
      "senderTitle": "Director of People Experience",
      "recipientEmail": "nina.kowalski@weld.onmicrosoft.com",
      "recipientName": "Nina Kowalski",
      "recipientTitle": "Chief Security Enablement Officer",
      "points": 25,
      "focus": "Awareness champion",
      "message": "Nina's executive rundown on hybrid hygiene made it easy for HR to reinforce the right behaviours in every hub.",
      "channel": "Town hall shout-out",
      "createdAt": "2025-10-04T17:20:00Z"
    },
    {
      "id": "rec-1004",
      "senderEmail": "rachel.summers@weld.onmicrosoft.com",
      "senderName": "Rachel Summers",
      "senderTitle": "Operations Lead",
      "recipientEmail": "noah.sato@weld.onmicrosoft.com",
      "recipientName": "Noah Sato",
      "recipientTitle": "Business Continuity Manager",
      "points": 15,
      "focus": "Credential lure spotted",
      "message": "Noah reset credentials within minutes of the lure email and blocked the follow-up attempt from reaching the desk.",
      "channel": "Hub spotlight",
      "createdAt": "2025-10-05T11:02:00Z"
    }
  ],
  "rewards": [],
  "clients": [
    {
      "id": 101,
      "name": "Evergreen Capital",
      "organizationId": "e3a4-uk-lon",
      "pointsPerMessage": 20,
      "pointsOnApproval": 80,
      "activeUsers": 184,
      "healthScore": 92,
      "openCases": 3,
      "lastReportAt": "2025-10-07T08:45:00Z"
    },
    {
      "id": 102,
      "name": "Harper & Black",
      "organizationId": "hb-uk-lon",
      "pointsPerMessage": 20,
      "pointsOnApproval": 80,
      "activeUsers": 82,
      "healthScore": 86,
      "openCases": 5,
      "lastReportAt": "2025-10-06T15:20:00Z"
    },
    {
      "id": 103,
      "name": "Cobalt Manufacturing",
      "organizationId": "cobalt-emea",
      "pointsPerMessage": 20,
      "pointsOnApproval": 80,
      "activeUsers": 241,
      "healthScore": 74,
      "openCases": 9,
      "lastReportAt": "2025-10-05T10:15:00Z"
    }
  ],
  "rewardRedemptions": [
    {
      "id": 1,
      "rewardId": 3,
      "redeemedAt": "2025-09-12T09:30:00Z",
      "status": "fulfilled"
    }
  ],
  "messages": [
    {
      "id": 9001,
      "messageId": "AAMkAGU0Zjk5ZGMyLTQ4M2UtND",
      "subject": "Caller posing as IT support about device settings",
      "reporterName": "Rachel Summers",
      "reporterEmail": "rachel.summers@weld.onmicrosoft.com",
      "clientId": 101,
      "reportedAt": "2025-10-07T08:45:00Z",
      "status": "approved",
      "reasons": [
        "reason-urgent-tone",
        "reason-looks-like-phishing"
      ],
      "pointsOnMessage": 20,
      "pointsOnApproval": 80,
      "additionalNotes": "They phoned saying they were from IT and pushed me to disable MFA and read out a reset PIN."
    },
    {
      "id": 9002,
      "messageId": "AAMkAGRjYTgzZjAtOGQ0Mi00",
      "subject": "WhatsApp message pretending to be our CFO",
      "reporterName": "Rachel Summers",
      "reporterEmail": "rachel.summers@weld.onmicrosoft.com",
      "clientId": 101,
      "reportedAt": "2025-10-02T17:12:00Z",
      "status": "pending",
      "reasons": [
        "reason-spoofing-senior",
        "reason-urgent-tone"
      ],
      "pointsOnMessage": 20,
      "pointsOnApproval": 80,
      "additionalNotes": "Request came from an unknown number asking for an urgent gift card purchase and to keep it secret."
    },
    {
      "id": 9003,
      "messageId": "AAMkAGQxZTZlNDAtZWMxOS00",
      "subject": "Unfamiliar QR code posted at the car park entrance",
      "reporterName": "Rachel Summers",
      "reporterEmail": "rachel.summers@weld.onmicrosoft.com",
      "clientId": 101,
      "reportedAt": "2025-09-26T11:06:00Z",
      "status": "approved",
      "reasons": [
        "reason-unexpected-attachment",
        "reason-looks-like-phishing"
      ],
      "pointsOnMessage": 20,
      "pointsOnApproval": 80,
      "additionalNotes": "Sticker looked unofficial and led to a fake login page when scanned -- removed it and reported facilities."
    }
  ],
  "labs": {
    "lastReviewAt": "2025-10-18T08:30:00Z",
    "features": [
      {
        "id": "adaptive-detections",
        "name": "Adaptive detection tuning",
        "status": "Private beta",
        "summary": "Automatically recalibrates phishing heuristics per tenant using cross-network telemetry.",
        "benefit": "Cuts analyst investigation time by serving enriched verdicts back into the queue.",
        "tags": [
          "Detection",
          "Automation"
        ],
        "owner": "Product incubation",
        "enabledClientIds": [
          101,
          103
        ]
      },
      {
        "id": "just-in-time-nudges",
        "name": "Just-in-time nudges",
        "status": "Design partner",
        "summary": "Pushes contextual prompts to employees immediately after a risky action is detected.",
        "benefit": "Reduces repeat risky behaviour through targeted reinforcement moments.",
        "tags": [
          "Behaviour change",
          "Reporter experience"
        ],
        "owner": "Behaviour Lab",
        "enabledClientIds": [
          102
        ]
      },
      {
        "id": "tenant-signal-exchange",
        "name": "Tenant signal exchange",
        "status": "Private preview",
        "summary": "Shares anonymised threat fingerprints between tenants to accelerate pattern blocking.",
        "benefit": "Creates early warning signals ahead of spikes hitting the broader customer base.",
        "tags": [
          "Threat intel",
          "Network effects"
        ],
        "owner": "WeldSecure Labs",
        "enabledClientIds": []
      }
    ]
  }
};
  const rewardsSource = (() => {
    if (Array.isArray(AppData.REWARDS) && AppData.REWARDS.length > 0) {
      return AppData.REWARDS;
    }
    const modules = window.WeldModules;
    if (modules && typeof modules.has === "function" && modules.has("data/rewards/list")) {
      try {
        const moduleRewards = modules.use("data/rewards/list");
        if (Array.isArray(moduleRewards) && moduleRewards.length > 0) {
          return moduleRewards;
        }
      } catch (error) {
        console.warn("data/rewards/list module unavailable.", error);
      }
    }
    return [];
  })();
  payload.rewards = Array.isArray(rewardsSource) ? rewardsSource.map(reward => ({ ...reward })) : [];

  window.WeldInitialState = payload;
})();






