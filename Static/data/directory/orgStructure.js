(function () {
  const DirectoryData = (window.DirectoryData = window.DirectoryData || {});

  DirectoryData.integrations = {
    entraId: {
      status: "connected",
      tenant: "weld.onmicrosoft.com",
      syncScope: "Users & security groups",
      provisioning: "Automatic (SCIM)",
      lastSync: "2025-10-31T08:45:00Z",
      notes: "Attribute mappings cover UPN, mail, mailNickname, and department."
    },
    activeDirectory: {
      status: "connected",
      forest: "weldsecure.local",
      connectorServer: "ADSYNC01",
      syncScope: "User and group objects",
      hybridMode: "Password hash sync",
      lastSync: "2025-10-31T08:30:00Z",
      notes: "sAMAccountName stays aligned with on-premises objects."
    },
    exchangeOnline: {
      status: "connected",
      tenant: "WeldSecure Demo",
      addressPolicy: "HybridDefault",
      lastSync: "2025-10-31T09:05:00Z",
      notes: "Primary SMTP addresses follow alias@weld.onmicrosoft.com."
    },
    exchangeOnPremises: {
      status: "connected",
      organization: "WeldSecureHQ",
      routingDomain: "weldsecure.local",
      lastSync: "2025-10-31T09:00:00Z",
      notes: "Hybrid mailboxes sync via Azure AD Connect."
    }
  };

  DirectoryData.departments = [
    {
      id: "finance-assurance",
      name: "Finance Assurance",
      description: "Owns treasury controls, invoice validation, and executive approvals.",
      entraGroupId: "group-finance-assurance",
      mailNickname: "finassurance",
      exchangeAddress: "finassurance@weld.onmicrosoft.com",
      syncType: "Hybrid",
      ownerId: "amelia-reed",
      teamIds: ["team-finance-assurance"]
    },
    {
      id: "people-experience",
      name: "People Experience",
      description: "Drives onboarding, rewards, and wellbeing programmes.",
      entraGroupId: "group-people-experience",
      mailNickname: "peoplexp",
      exchangeAddress: "peoplexp@weld.onmicrosoft.com",
      syncType: "Cloud",
      ownerId: "emily-chen",
      teamIds: ["team-people-experience"]
    },
    {
      id: "engineering-delivery",
      name: "Engineering Delivery",
      description: "Builds customer features with a secure SDLC and release checkpoints.",
      entraGroupId: "group-engineering-delivery",
      mailNickname: "engdelivery",
      exchangeAddress: "engdelivery@weld.onmicrosoft.com",
      syncType: "Hybrid",
      ownerId: "oliver-braun",
      teamIds: ["team-engineering-delivery"]
    },
    {
      id: "operations-resilience",
      name: "Operations Resilience",
      description: "Keeps facilities, logistics, and business continuity in sync.",
      entraGroupId: "group-operations-resilience",
      mailNickname: "opsres",
      exchangeAddress: "opsres@weld.onmicrosoft.com",
      syncType: "Hybrid",
      ownerId: "grace-muller",
      teamIds: ["team-operations-resilience"]
    },
    {
      id: "security-enablement",
      name: "Security Enablement",
      description: "Shapes incident readiness, executive reporting, and hybrid collaboration.",
      entraGroupId: "group-security-enablement",
      mailNickname: "secenable",
      exchangeAddress: "secenable@weld.onmicrosoft.com",
      syncType: "Cloud",
      ownerId: "nina-kowalski",
      teamIds: ["team-security-enablement"]
    }
  ];

  DirectoryData.teams = [
    {
      id: "team-finance-assurance",
      name: "Finance Assurance Squad",
      departmentId: "finance-assurance",
      type: "Operational team",
      entraGroupId: "team-finance-assurance",
      mailNickname: "finassurancesquad",
      exchangeAlias: "finassurancesquad@weld.onmicrosoft.com",
      syncTarget: "Hybrid",
      purpose: "Triage vendor risk, AP exceptions, and treasury sign-offs.",
      ownerId: "amelia-reed",
      memberIds: ["amelia-reed", "daniel-harper", "priya-nair", "george-collins", "sofia-marques"]
    },
    {
      id: "team-people-experience",
      name: "People Experience Collective",
      departmentId: "people-experience",
      type: "Engagement cohort",
      entraGroupId: "team-people-experience",
      mailNickname: "peoplecollective",
      exchangeAlias: "peoplecollective@weld.onmicrosoft.com",
      syncTarget: "Cloud",
      purpose: "Coordinate onboarding nudges, recognition drops, and wellbeing boosts.",
      ownerId: "emily-chen",
      memberIds: ["emily-chen", "mateo-alvarez", "hannah-oneill", "lucas-weber", "zara-mahmood"]
    },
    {
      id: "team-engineering-delivery",
      name: "Engineering Delivery Guild",
      departmentId: "engineering-delivery",
      type: "Practice guild",
      entraGroupId: "team-engineering-delivery",
      mailNickname: "engdeliveryguild",
      exchangeAlias: "engdeliveryguild@weld.onmicrosoft.com",
      syncTarget: "Hybrid",
      purpose: "Embed secure build pipelines and ship features with confidence.",
      ownerId: "oliver-braun",
      memberIds: ["oliver-braun", "maya-singh", "ethan-brooks", "lina-petrovic", "jack-turner"]
    },
    {
      id: "team-operations-resilience",
      name: "Operations Resilience Pod",
      departmentId: "operations-resilience",
      type: "Response pod",
      entraGroupId: "team-operations-resilience",
      mailNickname: "opsresilience",
      exchangeAlias: "opsresilience@weld.onmicrosoft.com",
      syncTarget: "Hybrid",
      purpose: "Keep facilities resilient, logistics on track, and continuity rehearsed.",
      ownerId: "grace-muller",
      memberIds: ["grace-muller", "noah-sato", "rachel-summers", "felix-laurent", "aisha-bello"]
    },
    {
      id: "team-security-enablement",
      name: "Security Enablement Network",
      departmentId: "security-enablement",
      type: "Community of practice",
      entraGroupId: "team-security-enablement",
      mailNickname: "secenablenetwork",
      exchangeAlias: "secenablenetwork@weld.onmicrosoft.com",
      syncTarget: "Cloud",
      purpose: "Align incident readiness, exec comms, and hybrid collaboration hygiene.",
      ownerId: "nina-kowalski",
      memberIds: ["nina-kowalski", "marcus-adeyemi", "isabelle-fournier", "liam-gallagher", "chloe-romano"]
    }
  ];
})();
