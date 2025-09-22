// assets/js/auth.js
// Client-side password gate (uses SHA-256 comparison). Not strongly secure.

(function () {
  // ---------- CONFIG ----------
  // Replace this with the SHA-256 hex of your password (lowercase)
  const SITE_PASSWORD_HASH =
    "8c15f1755ae9906da874d715609b4f6cba85f02970e6e72353bd8d5adbe9fb3f";

  // localStorage key to remember login
  const LOGIN_KEY = 'egrfc_playbook_auth_v1';

  // allow logout via ?logout=1
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('logout') === '1') {
    localStorage.removeItem(LOGIN_KEY);
    // re-lock the page
    document.documentElement.classList.add('site-locked');
  }

  // ---------- helpers ----------
  async function sha256Hex(text) {
    const enc = new TextEncoder();
    const data = enc.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function setLoggedIn() {
    localStorage.setItem(LOGIN_KEY, '1');
    document.documentElement.classList.remove('site-locked');
    const modal = document.querySelector('.auth-modal');
    if (modal) modal.remove();
  }

  function buildModal() {
    // do not add twice
    if (document.querySelector('.auth-modal')) return;

    const modal = document.createElement('div');
    modal.className = 'auth-modal';
    modal.innerHTML = `
      <div class="card" role="dialog" aria-modal="true" aria-label="Site login">
        <h3 style="margin:0 0 0.5rem 0;">EGRFC Playbook — Members</h3>
        <div>Please enter the access password to continue.</div>
        <input id="auth-password" type="password" placeholder="Password" aria-label="Password" />
        <button id="auth-submit" type="button">Unlock</button>
        <div class="auth-error" id="auth-error">Incorrect password</div>
        <div style="font-size:0.85rem;color:#666;margin-top:.6rem">
          If you do not have access, contact the site administrator.
        </div>
      </div>
    `;
    // append to body so not hidden by visibility rule (the CSS excludes .auth-modal)
    document.body.appendChild(modal);

    const submitBtn = document.getElementById('auth-submit');
    const pwInput = document.getElementById('auth-password');
    const err = document.getElementById('auth-error');

    async function attempt() {
      const pw = pwInput.value || '';
      const h = await sha256Hex(pw);
      if (h === SITE_PASSWORD_HASH) {
        setLoggedIn();
      } else {
        err.style.display = 'block';
        pwInput.value = '';
        pwInput.focus();
      }
    }

    submitBtn.addEventListener('click', attempt);
    pwInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') attempt();
    });

    // focus
    pwInput.focus();
  }

  // ---------- main ----------
  (async function init() {
    try {
      // if already logged in, unlock and return
      if (localStorage.getItem(LOGIN_KEY) === '1') {
        document.documentElement.classList.remove('site-locked');
        return;
      }

      // Not logged in -> show modal
      buildModal();
    } catch (err) {
      // on error, remove lock so you don't accidentally lock yourself out
      console.error('Auth error', err);
      document.documentElement.classList.remove('site-locked');
    }
  })();
})();
