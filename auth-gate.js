// auth-gate.js
// Separate login gate from the main cover page.
// Flow: login page first -> after allowed Google login -> cover page.

(function () {
  let installed = false;
  let waitTimer = null;

  function injectStyles() {
    if (document.getElementById('authGateStyle')) return;

    const style = document.createElement('style');
    style.id = 'authGateStyle';
    style.textContent = `
      #authLoginScreen {
        min-height: 68vh;
      }

      .auth-gate-card {
        max-width: 620px;
        margin: 0 auto;
        text-align: center;
      }

      .auth-gate-title {
        margin: 12px 0 10px;
        font-size: clamp(1.7rem, 3vw, 2.4rem);
        font-weight: 900;
        letter-spacing: -0.04em;
      }

      .auth-gate-text {
        max-width: 520px;
        margin: 0 auto 18px;
        color: var(--muted);
        font-weight: 700;
        line-height: 1.8;
      }

      .auth-gate-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 7px 13px;
        border-radius: 999px;
        color: #7a4a00;
        background: linear-gradient(180deg, rgba(255, 214, 10, 0.34), rgba(255, 176, 0, 0.18));
        border: 1px solid rgba(255, 176, 0, 0.36);
        font-weight: 900;
      }

      .auth-gate-avatar {
        width: 92px;
        height: 92px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        margin: 14px auto 8px;
        font-size: 2.4rem;
        background: rgba(255,255,255,.54);
        border: 1px solid rgba(255,255,255,.78);
        box-shadow: inset 0 1px 0 rgba(255,255,255,.84), 0 18px 34px rgba(29, 53, 87, 0.13);
      }

      #authLoginScreen #firebaseLoginUiWrap {
        margin-top: 18px;
      }

      #authLoginScreen .login-box {
        margin-top: 0;
      }

      body.auth-gate-active #coverScreen,
      body.auth-gate-active #badgeScreen,
      body.auth-gate-active #settingsScreen,
      body.auth-gate-active #phraseLibraryScreen,
      body.auth-gate-active #situationScreen,
      body.auth-gate-active #gameScreen,
      body.auth-gate-active #characterScreen,
      body.auth-gate-active #missionResultHistoryScreen,
      body.auth-gate-active #rpgMapScreen {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  function ensureAuthScreen() {
    const card = document.querySelector('.container .card');
    if (!card) return null;

    let screen = document.getElementById('authLoginScreen');
    if (screen) return screen;

    screen = document.createElement('div');
    screen.id = 'authLoginScreen';
    screen.className = 'screen welcome-screen active';
    screen.innerHTML = `
      <div class="hero-card animate-in auth-gate-card">
        <div class="auth-gate-badge">梁書學生版｜Google 登入</div>
        <div class="auth-gate-avatar">🔐</div>
        <h2 class="auth-gate-title">登入後開始校園社交練習</h2>
        <p class="auth-gate-text">請先使用學校 Google 帳戶登入。登入後，系統會載入你的雲端紀錄，然後進入主頁。</p>
        <div id="authGateLoginSlot"></div>
      </div>
    `;

    const cover = document.getElementById('coverScreen');
    if (cover) card.insertBefore(screen, cover);
    else card.prepend(screen);

    return screen;
  }

  function moveLoginUiToAuthScreen() {
    const screen = ensureAuthScreen();
    if (!screen) return false;

    const slot = document.getElementById('authGateLoginSlot');
    const loginWrap = document.getElementById('firebaseLoginUiWrap');

    if (!slot || !loginWrap) return false;
    if (loginWrap.parentElement !== slot) slot.appendChild(loginWrap);
    return true;
  }

  function setOnlyScreen(screenId) {
    document.querySelectorAll('.screen').forEach(function (screen) {
      screen.classList.toggle('active', screen.id === screenId);
    });
  }

  function showLoginPage() {
    injectStyles();
    ensureAuthScreen();
    moveLoginUiToAuthScreen();
    document.body.classList.add('auth-gate-active');
    setOnlyScreen('authLoginScreen');
    if (window.appState) window.appState.currentScreen = 'authLogin';
    try { history.replaceState(null, '', '#login'); } catch (error) {}
  }

  function showCoverPage() {
    document.body.classList.remove('auth-gate-active');
    setOnlyScreen('coverScreen');
    if (window.appState) window.appState.currentScreen = 'cover';
    try { history.replaceState(null, '', '#cover'); } catch (error) {}
    setTimeout(function () {
      if (typeof window.showCoverScreen === 'function') window.showCoverScreen();
    }, 80);
  }

  function hasAllowedFirebaseUser() {
    return Boolean(window.LSTFirebase && window.LSTFirebase.user);
  }

  function install() {
    injectStyles();
    ensureAuthScreen();

    const moved = moveLoginUiToAuthScreen();
    if (!moved) {
      clearTimeout(waitTimer);
      waitTimer = setTimeout(install, 120);
      return;
    }

    if (!installed) {
      installed = true;
      window.addEventListener('lstAuthReady', function (event) {
        if (event.detail && event.detail.user) showCoverPage();
        else showLoginPage();
      });
    }

    if (hasAllowedFirebaseUser()) showCoverPage();
    else showLoginPage();
  }

  window.showAuthLoginScreen = showLoginPage;
  window.showAuthenticatedCoverScreen = showCoverPage;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install);
  } else {
    install();
  }

  window.addEventListener('load', function () {
    install();
    setTimeout(install, 600);
  });
})();
