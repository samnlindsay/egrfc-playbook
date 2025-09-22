// assets/js/auth.js
// Simple per-user login with logging to Google Sheets via Netlify Function

(async function () {
  // -------- CONFIG --------
  const USERS = {
    coach: "Effort",
    player: "Honesty",
    guest: "test123",
    // add more as needed
  };

  const LOGIN_KEY = "egrfc_user_simple";
  const SERVER_LOG_ENDPOINT = "/.netlify/functions/log-login"; // Netlify function

  // POST login attempt to server-side function
  async function sendServerLog(username, success) {
    try {
      await fetch(SERVER_LOG_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username,
          success: success,
          timestamp: new Date().toISOString(),
          page: window.location.pathname,
        }),
      });
    } catch (err) {
      console.warn("server log failed", err);
    }
  }

  // Login success handler
  function setLoggedIn(username) {
    localStorage.setItem(LOGIN_KEY, username);
    document.documentElement.classList.remove("site-locked");
    const modal = document.querySelector(".auth-modal");
    if (modal) modal.remove();

    sendServerLog(username, true);
  }

  // Already logged in?
  const existing = localStorage.getItem(LOGIN_KEY);
  if (existing) {
    document.documentElement.classList.remove("site-locked");
    return;
  }

  // Build login modal
  function buildModal() {
    if (document.querySelector(".auth-modal")) return;
    const modal = document.createElement("div");
    modal.className = "auth-modal";
    modal.innerHTML = `
      <div class="card" role="dialog" aria-modal="true">
        <h3>EGRFC Playbook — Members</h3>
        <label style="display:block;margin-top:0.5rem">Username</label>
        <input id="auth-user" type="text" autocomplete="username" />
        <label style="display:block;margin-top:0.5rem">Password</label>
        <input id="auth-pass" type="password" autocomplete="current-password" />
        <div style="margin-top:.6rem">
          <button id="auth-submit">Log in</button>
        </div>
        <div class="auth-error" style="color:#b00020;display:none;margin-top:.5rem">Invalid credentials</div>
      </div>`;
    document.body.appendChild(modal);

    const userEl = modal.querySelector("#auth-user");
    const passEl = modal.querySelector("#auth-pass");
    const btn = modal.querySelector("#auth-submit");
    const err = modal.querySelector(".auth-error");

    function attempt() {
      const username = (userEl.value || "").trim();
      const password = passEl.value || "";

      if (!username || !password) {
        err.textContent = "Enter both username and password";
        err.style.display = "block";
        return;
      }

      if (USERS[username] && USERS[username] === password) {
        setLoggedIn(username);
      } else {
        err.textContent = "Invalid credentials";
        err.style.display = "block";
        passEl.value = "";
        passEl.focus();
        sendServerLog(username || "(empty)", false);
      }
    }

    btn.addEventListener("click", attempt);
    passEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") attempt();
    });
    userEl.focus();
  }

  document.documentElement.classList.add("site-locked");
  buildModal();
})();
