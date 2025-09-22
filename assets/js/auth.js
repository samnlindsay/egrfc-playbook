// assets/js/auth.js
// Per-user client auth + analytics
// NOTE: this is client-side auth; hashes are visible in source. Use only for low-security needs.

(async function () {
  // -------- CONFIG --------
  // Map of username => sha256(password)
  // Generate hashes offline and paste here (lowercase hex).
  const USERS = {
    coach: "4387e5d3966fc436532792769763cd1ab7cccd6464d4c01c2b91261894e96b77", // sha256('Effort')
    player: "8c15f1755ae9906da874d715609b4f6cba85f02970e6e72353bd8d5adbe9fb3f", // sha256('Honesty')
    // add more...
  };

  const LOGIN_KEY = "egrfc_user_v2"; // localStorage key
  const SERVER_LOG_ENDPOINT = "/.netlify/functions/log-login"; // Netlify function (optional)

  // Utility: SHA-256 hex
  async function sha256Hex(text) {
    const enc = new TextEncoder();
    const data = enc.encode(text);
    const buf = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  // Call GA via gtag if present
  function sendClientGAEvent(username) {
    try {
      if (typeof gtag === "function") {
        gtag("event", "login", {
          method: "site-login",
          username: username,
        });
      }
    } catch (err) {
      console.warn("gtag error", err);
    }
  }

  // POST to server-side logging function (optional)
  async function sendServerLog(username) {
    try {
      await fetch(SERVER_LOG_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username,
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
    // remove lock and modal (if any)
    document.documentElement.classList.remove("site-locked");
    const modal = document.querySelector(".auth-modal");
    if (modal) modal.remove();

    // analytics
    sendClientGAEvent(username);
    sendServerLog(username).catch(() => {});
  }

  // If already logged in, skip
  const existing = localStorage.getItem(LOGIN_KEY);
  if (existing) {
    document.documentElement.classList.remove("site-locked");
    return;
  }

  // Build a simple login modal (re-use or adapt from your earlier code)
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

    async function attempt() {
      const username = (userEl.value || "").trim();
      const password = passEl.value || "";
      if (!username || !password) {
        err.textContent = "Enter both username and password";
        err.style.display = "block";
        return;
      }
      const hash = await sha256Hex(password);
      if (USERS[username] && USERS[username] === hash) {
        setLoggedIn(username);
      } else {
        err.textContent = "Invalid credentials";
        err.style.display = "block";
        passEl.value = "";
        passEl.focus();
      }
    }

    btn.addEventListener("click", attempt);
    passEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") attempt();
    });
    userEl.focus();
  }

  // show modal and keep page locked (if you use the site-locked technique)
  document.documentElement.classList.add("site-locked");
  buildModal();
})();
