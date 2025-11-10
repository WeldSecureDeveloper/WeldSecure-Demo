(function () {
  const AppData = window.AppData || (window.AppData = {});
  if (AppData.phishingBlueprints) return;

  const channels = ["email", "sms", "teams", "slack", "qr"];

  const signalCategories = {
    deception: "Identity deception",
    delivery: "Delivery channel oddities",
    persuasion: "Persuasion & urgency",
    payload: "Payload or attachment risk"
  };

  const signals = [
    {
      id: "lookalike-domain",
      label: "Lookalike domain",
      severity: "high",
      category: "deception",
      description: "Sender domain swaps characters to impersonate a trusted vendor."
    },
    {
      id: "mismatched-link",
      label: "Mismatched link text",
      severity: "medium",
      category: "delivery",
      description: "Visible link text differs from actual destination."
    },
    {
      id: "qr-lure",
      label: "QR code lure",
      severity: "medium",
      category: "payload",
      description: "Embedded QR sends reporters to a credential harvest page."
    },
    {
      id: "urgent-tone",
      label: "Urgent tone",
      severity: "medium",
      category: "persuasion",
      description: "Language pressures the recipient to act immediately."
    },
    {
      id: "sender-spoof",
      label: "Spoofed executive sender",
      severity: "high",
      category: "deception",
      description: "Display name matches an exec while routing through a free mailbox."
    },
    {
      id: "invoice-bait",
      label: "Invoice attachment bait",
      severity: "medium",
      category: "payload",
      description: "Attachment claims to contain billing paperwork that needs review."
    },
    {
      id: "short-link",
      label: "Shortened tracking link",
      severity: "low",
      category: "delivery",
      description: "Masking destination via URL shortener to hide risky host."
    }
  ];

  const templates = [
    {
      id: "tpl-wire-escalation",
      name: "Wire escalation",
      description: "Executive escalation requesting urgent supplier wire validation.",
      defaultChannel: "email",
      defaultSignals: ["lookalike-domain", "urgent-tone", "mismatched-link"],
      suggestedTargets: ["finance-assurance", "operations-resilience"],
      subject: "Wire validation needed within 30 minutes",
      body: [
        "Team {{DEPARTMENT}},",
        "",
        "Vendor routing has been blocked until treasury re-validates the beneficiary.",
        "Review the attached release form and confirm the wire before 14:00.",
        "",
        "— {{SENDER}}"
      ].join("\n")
    },
    {
      id: "tpl-benefits-sweep",
      name: "Benefits sweepstake",
      description: "Benefits provider spoof inviting colleagues to re-enrol via QR.",
      defaultChannel: "email",
      defaultSignals: ["qr-lure", "urgent-tone", "sender-spoof"],
      suggestedTargets: ["people-experience", "engineering-delivery"],
      subject: "Last call: unlock your refreshed benefits package",
      body: [
        "Hi {{FIRST_NAME}},",
        "",
        "We noticed you have not completed the refreshed benefits onboarding.",
        "Scan the QR to lock in your cover before plans reset tonight.",
        "",
        "Benefits Ops"
      ].join("\n")
    },
    {
      id: "tpl-mfa-reset",
      name: "Vendor MFA reset",
      description: "SMS/Teams message nudging staff to reset vendor MFA with a short link.",
      defaultChannel: "sms",
      defaultSignals: ["short-link", "mismatched-link"],
      suggestedTargets: ["operations-resilience"],
      subject: "Action required: reset vendor MFA",
      body: "Security alert: reset your vendor MFA to keep transport slots. Tap https://short.ly/mfa"
    }
  ];

  const defaultForm = {
    id: null,
    templateId: null,
    name: "",
    status: "draft",
    channel: "email",
    sender: {
      displayName: "Security Desk",
      address: "security@weldsecure.com"
    },
    subject: "",
    body: "",
    signalIds: [],
    targetIds: [],
    schedule: null,
    ownerId: "amelia-reed"
  };

  const tokens = ["{{FIRST_NAME}}", "{{DEPARTMENT}}", "{{SENDER}}", "{{APPROVER}}"];

  AppData.phishingBlueprints = {
    channels,
    signalCategories,
    signals,
    templates,
    defaultForm,
    tokens
  };
})();
