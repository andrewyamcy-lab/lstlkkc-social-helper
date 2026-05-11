// auth-gate.js
// Separate loading/login gate from the main cover page.
// Flow: loading page -> login page if not signed in -> after allowed Google login -> final cover page.

(function () {
  let installed = false;
  let waitTimer = null;
  let authResolved = false;
  let coverReadyTimer = null;

  function injectStyles() {
    if (document.getElementById('authGateStyle')) return;

    const style = document.createElement('style');
    style.id = 'authGateStyle';
    style.textContent = `
      #authLoadingScreen,
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

      .auth-loading-spinner {
        width: 46px;
        height: 46px;
        margin: 18px auto 6px;
        border-radius: 50%;
        border: 5px solid rgba(0,122,255,.16);
        border-top-color: var(--primary);
        animation: authSpin .9s linear infinite;
      }

      .auth-loading-steps {
        display: grid;
        gap: 8px;
        max-width: 420px;
        margin: 18px auto 0;
        text-align: left;
      }

      .auth-loading-step {
        padding: 10px 12px;
        border-radius: 16px;
        background: rgba(255,255,255,.48);
        border: 1px solid rgba(255,255,255,.68);
        color: var(--muted);
        font-weight: 800;
        box-shadow: inset 0 1px 0 rgba(255,255,255,.78), 0 8px 18px rgba(29,53,87,.06);
      }

      @keyframes authSpin {
        to { transform: rotate(360deg); }
      }

      body.reduced-motion .auth-loading-spinner {
        animation: none !important;
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

  function getCardRoot() {
    return document.querySelector('.container .card');
  }

  function createScreen(id, html) {
    const card = getCardRoot();
    if (!card) return null;

    let screen = document.getElementById(id);
    if (screen) return screen;

    screen = document.createElement('div');
    screen.id = id;
    screen.className = 'screen welcome-screen';
    screen.innerHTML = html;

    const cover = document.getElementById('coverScreen');
    if (cover) card.insertBefore(screen, cover);
    else card.prepend(screen);

    return screen;
  }

  function ensureLoadingScreen() {
    return createScreen('authLoadingScreen', `
      <div class="hero-card animate-in auth-gate-card">
        <div class="auth-gate-badge">梁書學生版｜正在載入</div>
        <div class="auth-gate-avatar">⏳</div>
        <h2 class="auth-gate-title">正在準備你的練習紀錄</h2>
        <p class="auth-gate-text">系統正在檢查 Google 登入狀態，並載入雲端練習紀錄。請稍等片刻。</p>
        <div class="auth-loading-spinner" aria-label="Loading"></div>
        <div class="auth-loading-steps">
          <div class="auth-loading-step">✅ 準備校園社交練習介面</div>
          <div class="auth-loading-step">🔐 檢查 Google 登入狀態</div>
          <div class="auth-loading-step">☁️ 載入雲端任務紀錄</div>
        </div>
      </div>
    `);
  }

  function ensureAuthScreen() {
    return createScreen('authLoginScreen', `
      <div class="hero-card animate-in auth-gate-card">
        <div class="auth-gate-badge">梁書學生版｜Google 登入</div>
        <div class="auth-gate-avatar">🔐</div>
        <h2 class="auth-gate-title">登入後開始校園社交練習</h2>
        <p class="auth-gate-text">請先使用學校 Google 帳戶登入。登入後，系統會載入你的雲端紀錄，然後進入主頁。</p>
        <div id="authGateLoginSlot"></div>
      </div>
    `);
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

  function showLoadingPage() {
    injectStyles();
    ensureLoadingScreen();
    ensureAuthScreen();
    document.body.classList.add('auth-gate-active');
    setOnlyScreen('authLoadingScreen');
    if (window.appState) window.appState.currentScreen = 'authLoading';
    try { history.replaceState(null, '', '#loading'); } catch (error) {}
  }

  function showLoginPage() {
    authResolved = true;
    injectStyles();
    ensureLoadingScreen();
    ensureAuthScreen();
    moveLoginUiToAuthScreen();
    document.body.classList.add('auth-gate-active');
    setOnlyScreen('authLoginScreen');
    if (window.appState) window.appState.currentScreen = 'authLogin';
    try { history.replaceState(null, '', '#login'); } catch (error) {}
  }

  function isFinalCoverMenuReady() {
    const menu = document.querySelector('#coverScreen .menu-actions');
    const text = String(menu && menu.textContent || '');
    return text.includes('開始 RPG 冒險') && text.includes('社交技能書') && text.includes('登出');
  }

  function prepareFinalCoverMenu() {
    if (typeof window.applyFinalCoverMenu === 'function') {
      window.applyFinalCoverMenu();
    }
    return isFinalCoverMenuReady();
  }

  function showCoverPage() {
    authResolved = true;

    if (!prepareFinalCoverMenu()) {
      showLoadingPage();
      clearTimeout(coverReadyTimer);
      coverReadyTimer = setTimeout(showCoverPage, 120);
      return;
    }

    document.body.classList.remove('auth-gate-active');
    setOnlyScreen('coverScreen');
    if (window.appState) window.appState.currentScreen = 'cover';
    try { history.replaceState(null, '', '#cover'); } catch (error) {}

    [0, 100, 350, 900, 1600].forEach(function (delay) {
      setTimeout(function () {
        if (typeof window.applyFinalCoverMenu === 'function') window.applyFinalCoverMenu();
        setOnlyScreen('coverScreen');
      }, delay);
    });
  }

  function install() {
    injectStyles();
    ensureLoadingScreen();
    ensureAuthScreen();

    const moved = moveLoginUiToAuthScreen();
    if (!moved) {
      showLoadingPage();
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

    if (!authResolved) showLoadingPage();
  }

  window.showAuthLoadingScreen = showLoadingPage;
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
