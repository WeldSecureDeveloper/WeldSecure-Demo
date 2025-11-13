(function () {
  const AppData = window.AppData || (window.AppData = {});
  if (AppData.phishingSimulations) return;

  const iso = value => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return new Date().toISOString();
    }
    return date.toISOString();
  };

  const relativeDate = (daysAgo = 0, hour = 9, minute = 0) => {
    const date = new Date();
    date.setHours(hour, minute, 0, 0);
    date.setDate(date.getDate() - daysAgo);
    return date;
  };

  AppData.phishingSimulations = {
    campaigns: [
      {
        id: "sim-q4-finance",
        name: "Q4 Finance Spoof",
        launchDate: iso("2025-10-28T09:00:00Z"),
        templateId: "template-wire-fraud",
        ownerId: "amelia-reed",
        targets: ["finance-assurance", "operations-resilience"],
        delivery: { sent: 280, delivered: 276, failed: 4 },
        engagement: { reported: 198, clicked: 22, ignored: 60 },
        followUps: [
          { id: "reward-badge:finance-assurance", label: "Badge drop: Treasury Guardians" },
          { id: "reset-script:opsres", label: "Reset script: Ops Resilience devices" }
        ]
      },
      {
        id: "sim-hr-benefits",
        name: "Benefits Renewal Alert",
        launchDate: iso("2025-11-06T15:30:00Z"),
        templateId: "template-benefits-refresh",
        ownerId: "emily-chen",
        targets: ["people-experience", "engineering-delivery"],
        delivery: { sent: 210, delivered: 207, failed: 3 },
        engagement: { reported: 156, clicked: 18, ignored: 36 },
        followUps: [
          { id: "training-module:people-experience", label: "Training: Benefits social engineering" }
        ]
      },
      {
        id: "sim-cxo-wire",
        name: "Executive Wire Escalation",
        launchDate: iso("2025-11-10T11:15:00Z"),
        templateId: "template-wire-fraud",
        ownerId: "nina-kowalski",
        targets: ["security-enablement"],
        delivery: { sent: 65, delivered: 65, failed: 0 },
        engagement: { reported: 54, clicked: 3, ignored: 8 },
        followUps: [
          { id: "reward-badge:security-enablement", label: "Badge: Vigilant Exec Desk" },
          { id: "exec-briefing", label: "Exec briefing: highlight lookalike domains" }
        ]
      },
      {
        id: "sim-ops-logistics",
        name: "Logistics Routing Update",
        launchDate: iso("2025-11-12T08:20:00Z"),
        templateId: "template-vendor-portal",
        ownerId: "grace-muller",
        targets: ["operations-resilience"],
        delivery: { sent: 140, delivered: 138, failed: 2 },
        engagement: { reported: 92, clicked: 11, ignored: 37 },
        followUps: [
          { id: "reset-script:opsres", label: "Reset script: Ops handheld devices" },
          { id: "badge-nudge:opsres", label: "Badge nudge: Logistics sentry" }
        ]
      }
    ],
    templates: [
      {
        id: "template-wire-fraud",
        subject: "Treasury URGENT: Wire validation",
        vector: "email",
        difficulty: "high",
        signals: ["LOOKALIKE_DOMAIN", "MISMATCHED_LINK", "SENDER_SPOOF"]
      },
      {
        id: "template-benefits-refresh",
        subject: "Action required: renew benefits window",
        vector: "email",
        difficulty: "medium",
        signals: ["LOOKALIKE_DOMAIN", "UNEXPECTED_FORM"]
      },
      {
        id: "template-vendor-portal",
        subject: "Vendor portal MFA refresh",
        vector: "sms",
        difficulty: "medium",
        signals: ["SHORT_URL", "SENSE_OF_URGENCY"]
      }
    ],
    historyByDepartment: {
      "finance-assurance": [
        { campaignId: "sim-q3-finance", templateId: "template-wire-fraud", reported: 180, clicked: 28 },
        { campaignId: "sim-q4-finance", templateId: "template-wire-fraud", reported: 198, clicked: 22 }
      ],
      "operations-resilience": [
        { campaignId: "sim-q4-finance", templateId: "template-wire-fraud", reported: 76, clicked: 11 },
        { campaignId: "sim-ops-logistics", templateId: "template-vendor-portal", reported: 92, clicked: 11 }
      ],
      "people-experience": [
        { campaignId: "sim-hr-benefits", templateId: "template-benefits-refresh", reported: 108, clicked: 14 }
      ],
      "engineering-delivery": [
        { campaignId: "sim-hr-benefits", templateId: "template-benefits-refresh", reported: 48, clicked: 4 }
      ],
      "security-enablement": [
        { campaignId: "sim-cxo-wire", templateId: "template-wire-fraud", reported: 54, clicked: 3 }
      ]
    },
    signalsByCampaign: {
      "sim-q4-finance": ["LOOKALIKE_DOMAIN", "MISMATCHED_LINK", "SENDER_SPOOF"],
      "sim-hr-benefits": ["LOOKALIKE_DOMAIN", "UNEXPECTED_FORM"],
      "sim-cxo-wire": ["LOOKALIKE_DOMAIN", "SENDER_SPOOF", "URGENT_TONE"],
      "sim-ops-logistics": ["SHORT_URL", "SENSE_OF_URGENCY"]
    },
    sandboxMessages: [
      {
        id: "sandbox-msg-wire-escalation",
        campaignId: "sim-q4-finance",
        channel: "email",
        createdAt: iso(relativeDate(0, 8, 0)),
        sender: {
          displayName: "Treasury Escalations",
          address: "alerts@everq4-treasury.com"
        },
        subject: "Wire validation required before 4pm",
        previewText: "Finance flagged a transfer request awaiting your approval.",
        body: `Hi ${"${{FIRST_NAME}}"},

[signal:lookalike-domain]I need you to verify the outbound wire queue before today's 4pm treasury window closes.[/signal]

Log in with the escalation link below and capture a screenshot once it's greenlit.

[signal:mismatched-link]Escalation queue: https://review-weldsecure.co/treasury[/signal]

[signal:urgent-tone]If we miss the slot, we'll trigger a late filing report. Reply once complete.[/signal]

Thanks,
Amelia`,
        signalIds: ["lookalike-domain", "mismatched-link", "urgent-tone"],
        attachments: [],
        metadata: {
          microLesson: "Hover to inspect domains before authenticating, especially on payment queues."
        }
      },
      {
        id: "sandbox-msg-benefits-renewal",
        campaignId: "sim-hr-benefits",
        channel: "email",
        createdAt: iso(relativeDate(1, 11, 45)),
        sender: {
          displayName: "Benefits Desk",
          address: "benefits@evergreen-benefits.com"
        },
        subject: "Final reminder: confirm your benefits selections",
        previewText: "Portal access closes this afternoon for anyone who has not confirmed coverage.",
        body: `Hey ${"${{FIRST_NAME}}"},

[signal:sender-spoof]We temporarily moved self-serve benefits over to our vendor portal while IT patches SSO.[/signal]

[signal:invoice-bait]Use the attached \"fast track\" form to lock choices in the interim.[/signal] You only need to provide your national ID and last pay cycle info for verification.

Ping me once you're throughâ€”HR is tracking completions hourly.[signal:urgent-tone][/signal]

Thanks!
Jess, Benefits`,
        signalIds: ["sender-spoof", "invoice-bait", "urgent-tone"],
        attachments: [
          {
            id: "att-fast-track-form",
            name: "Benefits_FastTrack_Form.xlsm",
            type: "xlsm"
          }
        ],
        metadata: {
          microLesson: "Unexpected portals and macro-enabled attachments should be escalated immediately.",
          linkPreview: "Vendor portal (override)"
        }
      },
      {
        id: "sandbox-msg-ledger-guardrails",
        campaignId: null,
        channel: "email",
        createdAt: iso(relativeDate(0, 10, 35)),
        sender: {
          displayName: "Daniel Harper",
          address: "daniel.harper@weld.onmicrosoft.com"
        },
        subject: "RE: Ledger guardrails checklist",
        previewText: "Looping Amelia + Priya so we can close the comments on today's workbook.",
        body: `Hi ${"${{FIRST_NAME}}"},

Cc: Amelia Reed; Priya Nair

Appreciate you jumping on the guardrails review this morning. Priya has already patched the spend trend tab, so the only open items on my end are:
- Add the Ops variance note for July
- Confirm Olivia's approvals folder is synced in OneDrive

If you can drop your commentary straight into the shared workbook I'll package it for Amelia before LT.

Thanks,
Daniel`,
        signalIds: [],
        attachments: [],
        metadata: {
          conversation: true,
          conversationReplies: 3,
          cc: ["amelia.reed@weld.onmicrosoft.com", "priya.nair@weld.onmicrosoft.com"],
          attachmentIndicator: true
        }
      },
      {
        id: "sandbox-msg-controls-huddle",
        campaignId: null,
        channel: "email",
        createdAt: iso(relativeDate(0, 14, 5)),
        sender: {
          displayName: "Priya Nair",
          address: "priya.nair@weld.onmicrosoft.com"
        },
        subject: "Controls huddle recap + checklist",
        previewText: "Sending the notes for tomorrow's walkthrough with Mateo and Ops.",
        body: `Hello ${"${{FIRST_NAME}}"},

Cc: Daniel Harper; Sofia Marques

Attached are the tidy notes from today's controls huddle. Nothing scary - just a few reminders we promised Ops:
- Track the open PO list for the robotics pilot
- Share the updated supplier attestation wording
- Confirm which queue Mateo wants highlighted in the deck

Can you skim the attachment and flag anything we missed before I post it in Teams?

Regards,
Priya`,
        signalIds: [],
        attachments: [
          {
            id: "att-controls-huddle-notes",
            name: "Controls_Huddle_Notes.docx",
            type: "docx"
          }
        ],
        metadata: {
          conversation: true,
          conversationReplies: 2,
          cc: ["daniel.harper@weld.onmicrosoft.com", "sofia.marques@weld.onmicrosoft.com"]
        }
      },
      {
        id: "sandbox-msg-recognition-draft",
        campaignId: null,
        channel: "email",
        createdAt: iso(relativeDate(1, 15, 20)),
        sender: {
          displayName: "Emily Chen",
          address: "emily.chen@weld.onmicrosoft.com"
        },
        subject: "Jumping on the recognition draft?",
        previewText: "Mateo and Hannah left comments in the deck - need your eyes before I publish.",
        body: `Hi ${"${{FIRST_NAME}}"},

Cc: Mateo Alvarez; Hannah O'Neill

Thanks for volunteering to polish the recognition draft. Mateo and Hannah have each left comments in the insights section, so we're basically down to formatting and the intro paragraph.

If you can give it one more pass tonight I'll ship it to LT first thing. Happy to jump on a quick call if anything feels fuzzy.

Cheers,
Emily`,
        signalIds: [],
        attachments: [],
        metadata: {
          conversation: true,
          conversationReplies: 4,
          cc: ["mateo.alvarez@weld.onmicrosoft.com", "hannah.oneill@weld.onmicrosoft.com"]
        }
      }
    ]
  };
})();

