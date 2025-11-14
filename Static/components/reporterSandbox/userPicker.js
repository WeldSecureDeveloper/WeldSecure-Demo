(function () {
  const modules = window.WeldModules;
  if (!modules || modules.has("components/reporterSandbox/userPicker")) return;

  modules.define("components/reporterSandbox/userPicker", function () {
    function renderUserPicker(identity, sandbox, helpers = {}) {
      const escapeHtml = typeof helpers.escapeHtml === "function" ? helpers.escapeHtml : value => {
        if (value === null || value === undefined) return "";
        return String(value)
          .replace(/&/g, "&amp;")
          .replace(/"/g, "&quot;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
      };

      const directory = identity && identity.directory ? identity.directory : { users: [], departments: [] };
      const users = Array.isArray(directory.users) ? directory.users : [];
      const departments = Array.isArray(directory.departments) ? directory.departments : [];
      const selectedUserId = sandbox && sandbox.selectedUserId;
      const options = users
        .map(user => {
          if (!user) return "";
          const department = departments.find(dep => dep && dep.id === user.departmentId);
          const searchText = [user.displayName, user.jobTitle, department ? department.name : ""]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          const isActive = selectedUserId ? selectedUserId === user.id : users[0] && users[0].id === user.id;
          return `
          <button type="button" class="user-option${isActive ? " is-active" : ""}" data-user-id="${escapeHtml(
            user.id || ""
          )}" data-search-text="${escapeHtml(searchText)}">
            <strong>${escapeHtml(user.displayName || "Sandbox user")}</strong>
            <span>${escapeHtml(user.jobTitle || "Team member")}</span>
            <span>${escapeHtml(department ? department.name : "Cross-functional")}</span>
          </button>
        `;
        })
        .filter(Boolean)
        .join("");
      const emptyState = users.length
        ? ""
        : '<p class="user-picker__empty">Import demo users to populate this list.</p>';
      const showSearch =
        identity && identity.hasDirectoryUsers && users.length > 0
          ? `<input type="search" data-user-filter placeholder="Search by name, role, or department" />`
          : "";
      return `
      <div class="sandbox-modal" data-sandbox-user-picker hidden>
        <div class="sandbox-modal__dialog">
          <header>
            <h2>Choose a sandbox identity</h2>
            <button type="button" data-close-user-picker aria-label="Close">&times;</button>
          </header>
          <div class="sandbox-modal__body">
            ${showSearch}
            <div data-user-picker-list>
              ${options || emptyState}
            </div>
            <p class="user-picker__empty" data-user-empty hidden>No users found.</p>
          </div>
        </div>
      </div>
    `;
    }

    function attachUserPicker(options = {}) {
      const { container, onSelectUser } = options;
      if (!container) return;
      const picker = container.querySelector("[data-sandbox-user-picker]");
      if (!picker) return;
      const userChipButtons = container.querySelectorAll("[data-open='user-picker']");
      const closeButton = picker.querySelector("[data-close-user-picker]");
      const filterInput = picker.querySelector("[data-user-filter]");
      const list = picker.querySelector("[data-user-picker-list]");
      const empty = picker.querySelector("[data-user-empty]");

      const toggleEmptyState = () => {
        if (!list) return;
        const query = filterInput ? filterInput.value.trim().toLowerCase() : "";
        let visibleCount = 0;
        list.querySelectorAll("[data-user-id]").forEach(button => {
          const haystack = (button.getAttribute("data-search-text") || "").toLowerCase();
          const isMatch = !query || haystack.includes(query);
          button.hidden = !isMatch;
          if (isMatch) visibleCount += 1;
        });
        if (empty) {
          empty.hidden = visibleCount !== 0;
        }
      };

      const openPicker = () => {
        picker.hidden = false;
        picker.classList.add("is-visible");
        if (filterInput) {
          filterInput.value = "";
          filterInput.focus();
        }
        toggleEmptyState();
      };

      const closePicker = () => {
        picker.classList.remove("is-visible");
        picker.hidden = true;
      };

      userChipButtons.forEach(button => {
        button.addEventListener("click", event => {
          event.preventDefault();
          openPicker();
        });
      });

      if (closeButton) {
        closeButton.addEventListener("click", event => {
          event.preventDefault();
          closePicker();
        });
      }

      picker.addEventListener("click", event => {
        if (event.target === picker) {
          closePicker();
        }
      });

      if (filterInput) {
        filterInput.addEventListener("input", () => toggleEmptyState());
      }

      if (list) {
        list.addEventListener("click", event => {
          const button = event.target.closest("[data-user-id]");
          if (!button) return;
          const userId = button.getAttribute("data-user-id");
          if (userId && typeof onSelectUser === "function") {
            onSelectUser(userId);
          }
          closePicker();
        });
      }

      toggleEmptyState();

      return {
        open: openPicker,
        close: closePicker
      };
    }

    return {
      renderUserPicker,
      attachUserPicker
    };
  });
})();
