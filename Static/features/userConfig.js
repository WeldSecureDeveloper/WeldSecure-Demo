(function () {
  if (!window.Weld) return;
  const features = window.Weld.features || (window.Weld.features = {});
  const WeldUtil = window.WeldUtil || {};
  const WeldState = window.WeldState || {};
  const AppData = window.AppData || {};
  const directoryPreset =
    AppData && typeof AppData.DIRECTORY_PRESETS === "object" ? AppData.DIRECTORY_PRESETS : null;
  const formatNumberSafe =
    typeof WeldUtil.formatNumberSafe === "function"
      ? WeldUtil.formatNumberSafe
      : value => {
          const numeric = Number(value);
          if (!Number.isFinite(numeric)) return "0";
          return numeric.toString();
        };

  const getState =
    typeof WeldUtil.getState === "function"
      ? WeldUtil.getState
      : appState => {
          if (appState && typeof appState === "object") return appState;
          if (window.Weld && typeof window.Weld.state === "object") return window.Weld.state;
          if (typeof window.state === "object") return window.state;
          return {};
        };

  const escapeHtml =
    typeof WeldUtil.escapeHtml === "function"
      ? WeldUtil.escapeHtml
      : value => {
          if (value === null || value === undefined) return "";
          return String(value);
        };

  let flashMessage = "";
  function setFlash(message) {
    flashMessage = typeof message === "string" ? message : "";
  }
  function consumeFlash() {
    const message = flashMessage;
    flashMessage = "";
    return message;
  }

  const clonePreset = value => {
    if (value === null || value === undefined) return value;
    try {
      return JSON.parse(JSON.stringify(value));
    } catch {
      return value;
    }
  };

  const isEntraConnected = directory => {
    if (!directory || !directory.integrations) return false;
    const status = directory.integrations.entraId?.status;
    return typeof status === "string" && status.trim().toLowerCase() === "connected";
  };

  function ensureDirectory(state) {
    if (!state || typeof state !== "object") {
      return { integrations: {}, departments: [], teams: [], users: [] };
    }
    if (!state.directory || typeof state.directory !== "object") {
      state.directory = { integrations: {}, departments: [], teams: [], users: [] };
    }
    const directory = state.directory;
    if (!directory.integrations || typeof directory.integrations !== "object") {
      directory.integrations = {};
    }
    if (!Array.isArray(directory.departments)) {
      directory.departments = [];
    }
    if (!Array.isArray(directory.teams)) {
      directory.teams = [];
    }
    if (!Array.isArray(directory.users)) {
      directory.users = [];
    }
    directory.departments = directory.departments.map(dept => {
      if (!dept || typeof dept !== "object") {
        return { id: null, name: "Department", teamIds: [] };
      }
      const teamIds = Array.isArray(dept.teamIds) ? dept.teamIds.filter(Boolean) : [];
      return { ...dept, teamIds };
    });
    directory.teams = directory.teams.map(team => {
      if (!team || typeof team !== "object") {
        return { id: null, name: "Team", memberIds: [] };
      }
      const memberIds = Array.isArray(team.memberIds) ? team.memberIds.filter(Boolean) : [];
      return { ...team, memberIds };
    });
    directory.users = directory.users
      .map(user => {
        if (!user || typeof user !== "object") return null;
        const teams = Array.isArray(user.teams) ? user.teams.filter(Boolean) : [];
        return { ...user, teams };
      })
      .filter(Boolean);
    return directory;
  }

  function ensureSelection(state) {
    const directory = ensureDirectory(state);
    const meta = state.meta && typeof state.meta === "object" ? state.meta : (state.meta = {});
    const selection =
      meta.directorySelection && typeof meta.directorySelection === "object"
        ? { ...meta.directorySelection }
        : { departmentId: null, teamId: null };
    let departmentId = selection.departmentId;
    if (!departmentId || !directory.departments.some(dept => dept.id === departmentId)) {
      departmentId = directory.departments.length > 0 ? directory.departments[0].id || null : null;
    }
    let teamId = selection.teamId;
    if (!teamId || !directory.teams.some(team => team.id === teamId)) {
      if (departmentId) {
        const dept = directory.departments.find(item => item.id === departmentId) || null;
        const fromTeams = directory.teams.find(team => team.departmentId === departmentId);
        const fromDeptList =
          dept && Array.isArray(dept.teamIds)
            ? directory.teams.find(team => dept.teamIds.includes(team.id))
            : null;
        teamId = (fromTeams || fromDeptList || directory.teams[0] || {}).id || null;
      } else {
        teamId = directory.teams.length > 0 ? directory.teams[0].id || null : null;
      }
    }
    meta.directorySelection = { departmentId: departmentId || null, teamId: teamId || null };
    return meta.directorySelection;
  }

  function simulateConnect(state) {
    if (!directoryPreset || !directoryPreset.integrations) return false;
    const directory = ensureDirectory(state);
    directory.integrations = clonePreset(directoryPreset.integrations) || {};
    state.directory = directory;
    if (WeldState && typeof WeldState.saveState === "function") {
      WeldState.saveState(state);
    }
    return true;
  }

  function simulateImport(state) {
    if (!directoryPreset) return null;
    const directory = ensureDirectory(state);
    if (!directory.integrations || Object.keys(directory.integrations).length === 0) {
      if (directoryPreset.integrations) {
        directory.integrations = clonePreset(directoryPreset.integrations) || {};
      }
    }
    directory.departments = clonePreset(directoryPreset.departments) || [];
    directory.teams = clonePreset(directoryPreset.teams) || [];
    directory.users = clonePreset(directoryPreset.users) || [];
    state.directory = directory;
    const selection = ensureSelection(state);
    if (WeldState && typeof WeldState.saveState === "function") {
      WeldState.saveState(state);
    }
    return {
      departments: Array.isArray(directory.departments) ? directory.departments.length : 0,
      teams: Array.isArray(directory.teams) ? directory.teams.length : 0,
      users: Array.isArray(directory.users) ? directory.users.length : 0,
      selection
    };
  }

  function setSelection(state, departmentId, teamId) {
    const selection = ensureSelection(state);
    const directory = ensureDirectory(state);
    if (departmentId && directory.departments.some(dept => dept.id === departmentId)) {
      selection.departmentId = departmentId;
      if (!teamId || !directory.teams.some(team => team.id === teamId)) {
        const firstTeam = directory.teams.find(team => team.departmentId === departmentId);
        const dept = directory.departments.find(item => item.id === departmentId) || null;
        const deptTeam = dept && Array.isArray(dept.teamIds)
          ? directory.teams.find(team => dept.teamIds.includes(team.id))
          : null;
        selection.teamId = (firstTeam || deptTeam || directory.teams[0] || {}).id || null;
      }
    }
    if (teamId && directory.teams.some(team => team.id === teamId)) {
      selection.teamId = teamId;
    }
    state.meta.directorySelection = { ...selection };
    if (WeldState && typeof WeldState.saveState === "function") {
      WeldState.saveState(state);
    }
  }

  function renderIntegrationsTable(integrations) {
    const config = [
      { key: "entraId", label: "Microsoft Entra ID", detailKey: "provisioning" },
      { key: "activeDirectory", label: "Active Directory", detailKey: "hybridMode" },
      { key: "exchangeOnline", label: "Exchange Online", detailKey: "addressPolicy" },
      { key: "exchangeOnPremises", label: "Exchange on-premises", detailKey: "organization" }
    ];
    const rows = config
      .map(item => {
        const entry = integrations && typeof integrations === "object" ? integrations[item.key] || {} : {};
        const status = entry.status || "disconnected";
        const syncScope = entry.syncScope || entry.syncTarget || entry.addressPolicy || "Not specified";
        const detail = entry[item.detailKey] || entry.notes || "";
        const detailValue = detail ? detail : "Not documented";
        const lastSync = entry.lastSync || "Sync pending";
        return `
      <tr>
        <th scope="row">${escapeHtml(item.label)}</th>
        <td>${escapeHtml(String(status).charAt(0).toUpperCase() + String(status).slice(1))}</td>
        <td>${escapeHtml(syncScope)}</td>
        <td>${escapeHtml(detailValue)}</td>
        <td>${escapeHtml(lastSync)}</td>
      </tr>`;
      })
      .join("");
    return `
    <table class="user-config__integrations-table">
      <thead>
        <tr>
          <th>Connector</th>
          <th>Status</th>
          <th>Scope / policy</th>
          <th>Notes</th>
          <th>Last sync</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>`;
  }

  function renderDepartmentOptions(departments, selectedId) {
    if (!Array.isArray(departments) || departments.length === 0) {
      return `<option value="">No departments available</option>`;
    }
    return departments
      .map(dept => {
        const selected = dept.id === selectedId ? "selected" : "";
        return `<option value="${escapeHtml(dept.id || "")}" ${selected}>${escapeHtml(dept.name || "Department")}</option>`;
      })
      .join("");
  }

  function renderTeamOptions(teams, departmentId, selectedId) {
    const filtered = Array.isArray(teams)
      ? teams.filter(team => team && (team.departmentId === departmentId || !departmentId))
      : [];
    if (filtered.length === 0) {
      return `<option value="">No teams available</option>`;
    }
    return filtered
      .map(team => {
        const selected = team.id === selectedId ? "selected" : "";
        return `<option value="${escapeHtml(team.id || "")}" ${selected}>${escapeHtml(team.name || "Team")}</option>`;
      })
      .join("");
  }

  function renderDepartmentForm(department) {
    if (!department) {
      return `
      <section class="user-config__panel">
        <header>
          <h2>Department settings</h2>
          <p>Select or import a department to adjust directories.</p>
        </header>
      </section>`;
    }
    return `
    <section class="user-config__panel">
      <header>
        <h2>Department settings</h2>
        <p>Update attributes shared across Entra ID and Exchange.</p>
      </header>
      <form data-form="department" data-department-id="${escapeHtml(department.id || "")}">
        <label class="user-config__field">
          <span>Name</span>
          <input type="text" name="departmentName" value="${escapeHtml(department.name || "")}" required />
        </label>
        <label class="user-config__field">
          <span>Mail alias</span>
          <input type="text" name="departmentAlias" value="${escapeHtml(department.mailNickname || "")}" />
        </label>
        <label class="user-config__field">
          <span>Primary SMTP address</span>
          <input type="email" name="departmentAddress" value="${escapeHtml(department.exchangeAddress || "")}" />
        </label>
        <label class="user-config__field">
          <span>Sync mode</span>
          <select name="departmentSync">
            ${["Cloud", "Hybrid", "On-premises"].map(option => {
              const selected = (department.syncType || "").toLowerCase() === option.toLowerCase() ? "selected" : "";
              return `<option value="${escapeHtml(option)}" ${selected}>${escapeHtml(option)}</option>`;
            }).join("")}
          </select>
        </label>
        <label class="user-config__field">
          <span>Description</span>
          <textarea name="departmentDescription" rows="2" placeholder="Where does this department plug into security operations?">${escapeHtml(department.description || "")}</textarea>
        </label>
        <p class="user-config__hint">Entra security group: ${escapeHtml(department.entraGroupId || "Not connected")}</p>
        <div class="user-config__actions">
          <button type="submit" class="button-pill button-pill--primary">Save department</button>
        </div>
      </form>
    </section>`;
  }

  function renderTeamForm(team, directory) {
    if (!team) {
      return `
      <section class="user-config__panel">
        <header>
          <h2>Team workspace</h2>
          <p>Select a team to rename it and adjust membership.</p>
        </header>
      </section>`;
    }
    const users = Array.isArray(directory.users) ? directory.users : [];
    const memberSet = new Set(Array.isArray(team.memberIds) ? team.memberIds : []);
    if (team.ownerId) memberSet.add(team.ownerId);
    const ownerOptions = users
      .map(user => {
        const selected = team.ownerId === user.id ? "selected" : "";
        return `<option value="${escapeHtml(user.id)}" ${selected}>${escapeHtml(user.displayName || user.mail || user.id)}</option>`;
      })
      .join("");
    const memberOptions = users
      .map(user => {
        const labelParts = [user.displayName || user.mail || user.id];
        if (user.jobTitle) labelParts.push(user.jobTitle);
        const departmentName =
          (directory.departments || []).find(dept => dept.id === user.departmentId)?.name || user.departmentId || "";
        if (departmentName) labelParts.push(departmentName);
        const identity = user.identitySource ? `Source: ${user.identitySource}` : "";
        if (identity) labelParts.push(identity);
        const label = labelParts.filter(Boolean).join(" — ");
        const selected = memberSet.has(user.id) ? "selected" : "";
        return `<option value="${escapeHtml(user.id)}" ${selected}>${escapeHtml(label)}</option>`;
      })
      .join("");
    return `
    <section class="user-config__panel">
      <header>
        <h2>Team workspace</h2>
        <p>Keep Teams, Entra groups, and Exchange distribution lists aligned.</p>
      </header>
      <form data-form="team" data-team-id="${escapeHtml(team.id || "")}">
        <label class="user-config__field">
          <span>Name</span>
          <input type="text" name="teamName" value="${escapeHtml(team.name || "")}" required />
        </label>
        <label class="user-config__field">
          <span>Mail alias</span>
          <input type="text" name="teamAlias" value="${escapeHtml(team.mailNickname || "")}" />
        </label>
        <label class="user-config__field">
          <span>Primary SMTP address</span>
          <input type="email" name="teamAddress" value="${escapeHtml(team.exchangeAlias || "")}" />
        </label>
        <label class="user-config__field">
          <span>Owner</span>
          <select name="teamOwner">
            <option value="">Select owner</option>
            ${ownerOptions}
          </select>
        </label>
        <label class="user-config__field">
          <span>Sync target</span>
          <select name="teamSync">
            ${["Cloud", "Hybrid", "On-premises"].map(option => {
              const selected = (team.syncTarget || "").toLowerCase() === option.toLowerCase() ? "selected" : "";
              return `<option value="${escapeHtml(option)}" ${selected}>${escapeHtml(option)}</option>`;
            }).join("")}
          </select>
        </label>
        <label class="user-config__field">
          <span>Purpose</span>
          <textarea name="teamPurpose" rows="2" placeholder="Incident pod, champions guild, comms bridge...">${escapeHtml(team.purpose || "")}</textarea>
        </label>
        <label class="user-config__field">
          <span>Members</span>
          <select name="teamMembers" multiple size="10" data-member-multiselect>
            ${memberOptions}
          </select>
        </label>
        <p class="user-config__hint">Entra group: ${escapeHtml(team.entraGroupId || "Not connected")}</p>
        <div class="user-config__actions">
          <button type="submit" class="button-pill button-pill--primary">Save team</button>
        </div>
      </form>
    </section>`;
  }

  function formatIdentityLabel(user) {
    const source = (user.identitySource || "").toLowerCase();
    if (source === "hybrid") return "Hybrid (Entra + AD)";
    if (source === "cloud") return "Cloud only";
    if (source === "on-premises") return "On-premises";
    return "Unknown source";
  }

  function renderUserList(directory) {
    const users = Array.isArray(directory.users) ? directory.users : [];
    if (users.length === 0) {
      return `
      <section class="user-config__panel user-config__panel--directory user-config__panel--empty">
        <header>
          <h2>Demo users</h2>
          <p>No demo users imported yet. Connect to Entra ID and run the import to populate five demo squads.</p>
        </header>
        <p class="user-config__muted">Import to review and edit 25 sample profiles before presenting the story.</p>
      </section>
    `;
    }
    const departments = new Map(
      (directory.departments || []).map(dept => [dept.id, dept.name || dept.id || "Department"])
    );
    const teams = new Map(
      (directory.teams || []).map(team => [team.id, team.name || team.id || "Team"])
    );
    const listItems = users
      .slice()
      .sort((a, b) => (a.displayName || "").localeCompare(b.displayName || "", undefined, { sensitivity: "base" }))
      .map(user => {
        const department = departments.get(user.departmentId) || "Unknown department";
        const teamLabels = Array.isArray(user.teams)
          ? user.teams
              .map(teamId => teams.get(teamId))
              .filter(Boolean)
              .join(", ")
          : "";
        const searchTokens = [
          user.displayName,
          user.mail,
          user.userPrincipalName,
          user.jobTitle,
          department,
          teamLabels,
          user.identitySource
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return `
      <li class="user-config__user-row" data-user-search="${escapeHtml(searchTokens)}">
        <strong>${escapeHtml(user.displayName || user.mail || user.id || "User")}</strong>
        <span>${escapeHtml(user.jobTitle || "Role not set")} · ${escapeHtml(department)}</span>
        <span>${escapeHtml(user.mail || "")}</span>
        <span>${escapeHtml(user.userPrincipalName || "")}</span>
        <span>${escapeHtml(formatIdentityLabel(user))}</span>
        <span>${escapeHtml(teamLabels || "No team membership")}</span>
      </li>`;
      })
      .join("");
    return `
    <section class="user-config__panel user-config__panel--directory">
      <header>
        <h2>Demo users (${users.length})</h2>
        <p>25 fictitious users with blended Entra, AD, and Exchange attributes.</p>
        <input type="search" placeholder="Filter users" data-user-filter />
      </header>
      <ul class="user-config__user-list" data-user-list>
        ${listItems}
      </ul>
    </section>`;
  }

  function renderUserConfigPage(state) {
    const directory = ensureDirectory(state);
    const selection = ensureSelection(state);
    const department =
      directory.departments.find(item => item && item.id === selection.departmentId) ||
      directory.departments[0] ||
      null;
    const team =
      directory.teams.find(item => item && item.id === selection.teamId) ||
      (department ? directory.teams.find(item => item && item.departmentId === department.id) : directory.teams[0]) ||
      null;
    const integrationsMarkup = renderIntegrationsTable(directory.integrations);
    const departmentOptions = renderDepartmentOptions(directory.departments, department?.id || null);
    const teamOptions = renderTeamOptions(directory.teams, department?.id || null, team?.id || null);
    const departmentForm = renderDepartmentForm(department);
    const teamForm = renderTeamForm(team, directory);
    const userList = renderUserList(directory);
    const feedback = consumeFlash();
    const feedbackMarkup = feedback
      ? `<p class="user-config__feedback user-config__feedback--visible">${escapeHtml(feedback)}</p>`
      : `<p class="user-config__feedback" data-feedback></p>`;
    const hasPreset =
      !!directoryPreset &&
      Array.isArray(directoryPreset.departments) &&
      directoryPreset.departments.length > 0;
    const connected = isEntraConnected(directory);
    const hasImported =
      Array.isArray(directory.departments) &&
      directory.departments.length > 0 &&
      Array.isArray(directory.users) &&
      directory.users.length > 0;
    const connectLabel = connected ? "Reconnect Entra ID" : "Connect to Entra ID";
    const connectTone = connected ? "button-pill--secondary" : "button-pill--primary";
    const connectDisabledAttr = hasPreset ? "" : ' disabled aria-disabled="true"';
    const importLabel = hasImported ? "Re-import demo users" : "Import demo users";
    const importDisabledAttr = !connected || !hasPreset ? ' disabled aria-disabled="true"' : "";
    const departmentSelectDisabledAttr =
      Array.isArray(directory.departments) && directory.departments.length > 0
        ? ""
        : ' disabled aria-disabled="true"';
    const teamSelectDisabledAttr =
      Array.isArray(directory.teams) && directory.teams.length > 0 ? "" : ' disabled aria-disabled="true"';

    return `
    <section class="user-config__intro">
      <span class="user-config__eyebrow">User configuration</span>
      <h1>Configure departments and teams for the demo tenant.</h1>
      <p>Everything is wired to mirror Entra ID security groups, Active Directory objects, and Exchange Online mail targets.</p>
      <div class="user-config__intro-actions">
        <button type="button" class="button-pill ${connectTone}" data-action="simulate-connect"${connectDisabledAttr}>
          ${escapeHtml(connectLabel)}
        </button>
        <button type="button" class="button-pill button-pill--primary" data-action="simulate-import"${importDisabledAttr}>
          ${escapeHtml(importLabel)}
        </button>
        <button type="button" class="button-pill button-pill--secondary" data-route="client-dashboard">
          Back to organisation hub
        </button>
      </div>
    </section>
    <section class="user-config__integrations-wrapper">
      <h2>Integration posture</h2>
      ${integrationsMarkup}
    </section>
    <section class="user-config__selectors">
      <div class="user-config__selector">
        <label>
          <span>Department</span>
          <select data-select-department${departmentSelectDisabledAttr}>
            ${departmentOptions}
          </select>
        </label>
      </div>
      <div class="user-config__selector">
        <label>
          <span>Team</span>
          <select data-select-team${teamSelectDisabledAttr}>
            ${teamOptions}
          </select>
        </label>
      </div>
    </section>
    ${feedbackMarkup}
    <div class="user-config__grid">
      <div class="user-config__column">
        ${departmentForm}
        ${teamForm}
      </div>
      <div class="user-config__column">
        ${userList}
      </div>
    </div>`;
  }

  function updateDepartment(state, departmentId, payload) {
    if (!departmentId) return false;
    const directory = ensureDirectory(state);
    const departments = Array.isArray(directory.departments) ? directory.departments : [];
    const index = departments.findIndex(dept => dept && dept.id === departmentId);
    if (index === -1) return false;
    const current = departments[index] || {};
    const next = { ...current, ...payload };
    const nextDepartments = departments.map(dept => (dept && dept.id === departmentId ? next : dept));
    state.directory = {
      ...directory,
      departments: nextDepartments,
      teams: directory.teams,
      users: directory.users
    };
    if (WeldState && typeof WeldState.saveState === "function") {
      WeldState.saveState(state);
    }
    return true;
  }

  function updateTeam(state, teamId, payload, memberIds) {
    if (!teamId) return false;
    const directory = ensureDirectory(state);
    const teams = Array.isArray(directory.teams) ? directory.teams : [];
    const index = teams.findIndex(team => team && team.id === teamId);
    if (index === -1) return false;
    const current = teams[index] || {};
    const normalizedMembers = Array.isArray(memberIds)
      ? Array.from(new Set(memberIds.filter(Boolean)))
      : Array.isArray(current.memberIds)
      ? current.memberIds.slice()
      : [];
    const nextTeam = { ...current, ...payload, memberIds: normalizedMembers };
    const nextTeams = teams.map(team => (team && team.id === teamId ? nextTeam : team));
    const nextUsers = (directory.users || []).map(user => {
      if (!user || !user.id) return user;
      const existing = Array.isArray(user.teams) ? user.teams.filter(Boolean) : [];
      const filtered = existing.filter(id => id !== teamId);
      if (normalizedMembers.includes(user.id)) {
        filtered.push(teamId);
      }
      filtered.sort();
      return { ...user, teams: filtered };
    });
    state.directory = {
      ...directory,
      departments: directory.departments,
      teams: nextTeams,
      users: nextUsers
    };
    if (WeldState && typeof WeldState.saveState === "function") {
      WeldState.saveState(state);
    }
    return true;
  }

  function handleDepartmentSubmit(form, state, container) {
    const departmentId = form.getAttribute("data-department-id");
    if (!departmentId) return;
    const payload = {
      name: form.departmentName ? form.departmentName.value.trim() : "",
      mailNickname: form.departmentAlias ? form.departmentAlias.value.trim() : "",
      exchangeAddress: form.departmentAddress ? form.departmentAddress.value.trim() : "",
      syncType: form.departmentSync ? form.departmentSync.value.trim() : "",
      description: form.departmentDescription ? form.departmentDescription.value.trim() : ""
    };
    if (updateDepartment(state, departmentId, payload)) {
      setFlash("Department settings saved.");
      features.userConfig.render(container, state);
    }
  }

  function handleTeamSubmit(form, state, container) {
    const teamId = form.getAttribute("data-team-id");
    if (!teamId) return;
    const ownerId = form.teamOwner ? form.teamOwner.value.trim() : "";
    const selectedMembers = form.teamMembers
      ? Array.from(form.teamMembers.options)
          .filter(option => option.selected)
          .map(option => option.value)
      : [];
    if (ownerId && !selectedMembers.includes(ownerId)) {
      selectedMembers.push(ownerId);
    }
    const payload = {
      name: form.teamName ? form.teamName.value.trim() : "",
      mailNickname: form.teamAlias ? form.teamAlias.value.trim() : "",
      exchangeAlias: form.teamAddress ? form.teamAddress.value.trim() : "",
      purpose: form.teamPurpose ? form.teamPurpose.value.trim() : "",
      syncTarget: form.teamSync ? form.teamSync.value.trim() : "",
      ownerId: ownerId || null
    };
    if (updateTeam(state, teamId, payload, selectedMembers)) {
      setFlash("Team details and membership saved.");
      features.userConfig.render(container, state);
    }
  }

  function applyUserFilter(list, query) {
    if (!list) return;
    const value = (query || "").trim().toLowerCase();
    const rows = list.querySelectorAll("[data-user-search]");
    rows.forEach(row => {
      const tokens = row.getAttribute("data-user-search") || "";
      row.style.display = !value || tokens.includes(value) ? "" : "none";
    });
  }

  function attachEvents(container, state) {
    if (!container) return;
    container.addEventListener("change", event => {
      const departmentSelect = event.target.closest("[data-select-department]");
      if (departmentSelect) {
        const value = departmentSelect.value || null;
        setSelection(state, value, null);
        features.userConfig.render(container, state);
        return;
      }
      const teamSelect = event.target.closest("[data-select-team]");
      if (teamSelect) {
        const selection = ensureSelection(state);
        const value = teamSelect.value || null;
        setSelection(state, selection.departmentId, value);
        features.userConfig.render(container, state);
        return;
      }
    });

    container.addEventListener("submit", event => {
      const form = event.target.closest("form[data-form]");
      if (!form) return;
      event.preventDefault();
      const formType = form.getAttribute("data-form");
      if (formType === "department") {
        handleDepartmentSubmit(form, state, container);
      } else if (formType === "team") {
        handleTeamSubmit(form, state, container);
      }
    });

    container.addEventListener("input", event => {
      const filter = event.target.closest("[data-user-filter]");
      if (filter) {
        const list = container.querySelector("[data-user-list]");
        applyUserFilter(list, filter.value);
      }
    });

    container.addEventListener("click", event => {
      const actionTrigger = event.target.closest("[data-action]");
      if (actionTrigger) {
        event.preventDefault();
        const action = actionTrigger.getAttribute("data-action");
        if (action === "simulate-connect") {
          const connected = simulateConnect(state);
          setFlash(
            connected
              ? "Entra ID connection simulated. Directory sync metadata is now populated."
              : "Unable to simulate connection. Preset data is unavailable."
          );
          features.userConfig.render(container, state);
          return;
        }
        if (action === "simulate-import") {
          if (!isEntraConnected(state.directory)) {
            simulateConnect(state);
          }
          const result = simulateImport(state);
          setFlash(
            result
              ? `Imported ${formatNumberSafe(result.departments)} departments and ${formatNumberSafe(
                  result.users
                )} users from Entra ID.`
              : "Import preset unavailable. Connect to Entra ID to try again."
          );
          features.userConfig.render(container, state);
          return;
        }
      }
      const routeTrigger = event.target.closest("[data-route]");
      if (routeTrigger) {
        const route = routeTrigger.getAttribute("data-route");
        if (route && typeof window.navigate === "function") {
          window.navigate(route);
        }
      }
    });
  }

  features.userConfig = {
    render(container, appState) {
      if (!container) return;
      const state = getState(appState);
      container.innerHTML = renderUserConfigPage(state);
      attachEvents(container, state);
    }
  };
})();
