
(function () {
  const AppData = window.AppData || (window.AppData = {});

  const DEFAULT_REPORTER_PROMPT_BASE = "Why are you reporting this?";
  const DEFAULT_EMERGENCY_LABEL_BASE = "I clicked a link, opened an attachment, or entered credentials";
  const PREVIOUS_EMERGENCY_LABEL_BASE =
    "Recipient clicked a link, opened an attachment, or entered credentials";
  const DEFAULT_REPORTER_REASONS_BASE = [
    { id: "reason-looks-like-phishing", label: "Looks like a phishing attempt" },
    { id: "reason-unexpected-attachment", label: "Unexpected attachment or link" },
    { id: "reason-urgent-tone", label: "Urgent language / suspicious tone" },
    { id: "reason-spoofing-senior", label: "Sender spoofing a senior colleague" }
  ];

  const existingDefaults =
    AppData.DEFAULTS && typeof AppData.DEFAULTS === "object" ? AppData.DEFAULTS : {};
  const reporterReasonDefaults =
    Array.isArray(existingDefaults.REPORTER_REASONS) && existingDefaults.REPORTER_REASONS.length > 0
      ? existingDefaults.REPORTER_REASONS
      : DEFAULT_REPORTER_REASONS_BASE;

  AppData.DEFAULTS = {
    REPORTER_PROMPT: existingDefaults.REPORTER_PROMPT || DEFAULT_REPORTER_PROMPT_BASE,
    EMERGENCY_LABEL: existingDefaults.EMERGENCY_LABEL || DEFAULT_EMERGENCY_LABEL_BASE,
    PREVIOUS_EMERGENCY_LABEL: existingDefaults.PREVIOUS_EMERGENCY_LABEL || PREVIOUS_EMERGENCY_LABEL_BASE,
    REPORTER_REASONS: reporterReasonDefaults
  };

  const resolvedReporterReasons =
    Array.isArray(AppData.DEFAULT_REPORTER_REASONS) && AppData.DEFAULT_REPORTER_REASONS.length > 0
      ? AppData.DEFAULT_REPORTER_REASONS
      : reporterReasonDefaults;

  AppData.DEFAULT_REPORTER_REASONS = resolvedReporterReasons.map(reason =>
    reason && typeof reason === "object" ? { ...reason } : reason
  );

  AppData.SETTINGS_CATEGORIES = AppData.SETTINGS_CATEGORIES || [
    {
      id: "reporter",
      label: "Reporter",
      description: "Configure the reporter add-in experience"
    },
    {
      id: "appearance",
      label: "Appearance",
      description: "Toggle between light and dark themes"
    },
    {
      id: "organisation",
      label: "Organisation",
      description: "Tailor organisation dashboards and engagement",
      disabled: true
    },
    {
      id: "weldsecure",
      label: "WeldSecure",
      description: "Shape WeldSecure playbooks and operations",
      disabled: true
    }
  ];
})();
