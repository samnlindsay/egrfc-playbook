// assets/js/auth.js
// Simple per-user login with logging to Google Sheets via Netlify Function

(async function () {
  // -------- CONFIG --------
  const USERS = {
    coach: "Effort",
    player: "Honesty",
    aboczek: "ab1",
    amoffatt: "am2",
    aotto: "ao3",
    bgray: "bg4",
    bgreen: "bg5",
    bmarelli: "bm6",
    bpellett: "bp7",
    bslingsby: "bs8",
    btottman: "bt9",
    bwatkinson: "bw10",
    bdavis: "bd11",
    bmcmullan: "bm12",
    ctaylor: "ct13",
    cgeraghty: "cg14",
    cwilliams: "cw15",
    csullivan: "cs16",
    dhulst: "dh17",
    darnold: "da18",
    dmaynard: "dm19",
    dbowe: "db20",
    dhammocks: "dh21",
    droberts: "dr22",
    estrickley: "es23",
    egosling: "eg24",
    fmitchell: "fm25",
    garthur: "ga26",
    gbeet: "gb27",
    gjones: "gj28",
    gnaylor: "gn29",
    gbrack: "gb30",
    gcollins: "gc31",
    hberry: "hb32",
    hthompson: "ht33",
    hseal: "hs34",
    hweller: "hw35",
    ilawal: "il36",
    jbillin: "jb37",
    jradcliffe: "jr38",
    jfunnell: "jf39",
    jgriffiths: "jg40",
    jjacobs: "jj41",
    jjenkins: "jj42",
    jmitchell: "jm43",
    jpeaty: "jp44",
    jmartin: "jm45",
    jweaver: "jw46",
    jbrimecombe: "jb47",
    jlavendar: "jl48",
    jjardim: "jj49",
    koliveira: "ko50",
    lduvall: "ld51",
    lmaker: "lm52",
    lwaite: "lw53",
    mlewis: "ml54",
    moliver: "mo55",
    mkelly: "mk56",
    mcrawleymoore: "mc57",
    mpresland: "mp58",
    noliver: "no59",
    nabajo: "na60",
    nroberts: "nr61",
    ohodge: "oh62",
    ojohnston: "oj63",
    oshay: "os64",
    ostaples: "os65",
    pshepherd: "ps66",
    pthomson: "pt67",
    phutchinson: "ph68",
    pmorley: "pm69",
    rminter: "rm70",
    rharris: "rh71",
    rskinner: "rs72",
    rsalvi: "rs73",
    revans: "re74",
    sshimizu: "ss75",
    slindsaymccall: "sl76",
    smccarthy: "sm77",
    smorgan: "sm78",
    sogorman: "so79",
    thardisty: "th80",
    tbyron: "tb81",
    thalligey: "th82",
    tkennedy: "tk83",
    tmcmahon: "tm84",
    tnasta: "tn85",
    tmorris: "tm86",
    tmooney: "tm87",
    tsimpson: "ts88",
    wbramwell: "wb89",
    wlongstaff: "wl90",
    wroberts: "wr91",
    cleggat: "cl92",
    jandrews: "ja93",
    tfontaine: "tf94",
    oroberts: "or95",
    acarstens: "ac96",
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
        <h3>EGRFC Playbook</h3>
        <form>
        <div class="mb-3">
        <label for="auth-user" class="form-label">Username</label>
        <input id="auth-user" class="form-control" style="width: 100%;" autocomplete="username" />
        </div>
        <div class="mb-3">
        <label for="auth-pass" class="form-label">Password</label>
        <input id="auth-pass" type="password" class="form-control" autocomplete="current-password" />
        </div>
        <div style="margin-top:.6rem">
          <button id="auth-submit">Log in</button>
        </div>
        <div class="auth-error" style="color:#b00020;display:none;margin-top:.5rem">Invalid credentials</div>
        </form>

        <div class="mt-3" style="font-size: .9rem; color: #666;">
          If you require login details, please contact the coaching team.
        </div>
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
