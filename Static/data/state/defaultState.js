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
    "addinShellHeight": 760,
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
  "rewards": [
    {
      "id": 1,
      "name": "Fortnum & Mason Afternoon Tea",
      "description": "Premium afternoon tea experience for two, delivered to your door.",
      "pointsCost": 400,
      "icon": "gift",
      "category": "experience",
      "provider": "Fortnum & Mason",
      "image": "linear-gradient(135deg, #9457ff 0%, #4e0dff 100%)",
      "remaining": 6,
      "published": true
    },
    {
      "id": 2,
      "name": "Selfridges Gift Card",
      "description": "Digital gift card redeemable online or in-store.",
      "pointsCost": 280,
      "icon": "gift",
      "category": "voucher",
      "provider": "Selfridges & Co",
      "image": "linear-gradient(135deg, #ff8a80 0%, #ff416c 100%)",
      "remaining": 12,
      "published": false
    },
    {
      "id": 3,
      "name": "Margot & Montanez Chocolate Hamper",
      "description": "Limited edition artisan chocolate selection to celebrate vigilance.",
      "pointsCost": 120,
      "icon": "gift",
      "category": "merchandise",
      "provider": "Margot & Montanez",
      "image": "linear-gradient(135deg, #ffbe0b 0%, #fb5607 100%)",
      "remaining": 20,
      "published": false
    },
    {
      "id": 4,
      "name": "Weld Champion Hoodie",
      "description": "Exclusive Weld hoodie for team members leading the risk scoreboard.",
      "pointsCost": 260,
      "icon": "gift",
      "category": "merchandise",
      "provider": "Weld Apparel",
      "image": "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)",
      "remaining": 15,
      "published": false
    },
    {
      "id": 5,
      "name": "Amazon Gift Card",
      "description": "Digital code redeemable across Amazon.co.uk for everyday essentials or treats.",
      "pointsCost": 220,
      "icon": "gift",
      "category": "voucher",
      "provider": "Amazon UK",
      "image": "linear-gradient(135deg, #f97316 0%, #facc15 100%)",
      "remaining": 18,
      "published": true
    },
    {
      "id": 6,
      "name": "Plant a Tree",
      "description": "Fund the planting of a tree through our sustainability partner.",
      "pointsCost": 150,
      "icon": "gift",
      "category": "sustainability",
      "provider": "Green Earth Collective",
      "image": "linear-gradient(135deg, #22c55e 0%, #0ea5e9 100%)",
      "remaining": 40,
      "published": true
    },
    {
      "id": 7,
      "name": "Extra Day of Annual Leave",
      "description": "Enjoy an additional day of paid leave approved by your manager.",
      "pointsCost": 480,
      "icon": "gift",
      "category": "benefit",
      "provider": "People Team",
      "image": "linear-gradient(135deg, #818cf8 0%, #312e81 100%)",
      "remaining": 5,
      "published": false
    },
    {
      "id": 8,
      "name": "Donate to Charity",
      "description": "Direct a WeldSecure-supported donation to a charitable partner of your choice.",
      "pointsCost": 180,
      "icon": "gift",
      "category": "charity",
      "provider": "WeldSecure Giving",
      "image": "linear-gradient(135deg, #f472b6 0%, #ec4899 100%)",
      "remaining": null,
      "unlimited": true,
      "published": true
    },
    {
      "id": 9,
      "name": "Contribute to Work Social Event",
      "description": "Add funds to enhance the next team social experience.",
      "pointsCost": 140,
      "icon": "gift",
      "category": "culture",
      "provider": "Employee Engagement",
      "image": "linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)",
      "remaining": 25,
      "published": false
    }
  ],
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
  window.WeldInitialState = payload;
})();






