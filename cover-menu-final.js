// cover-menu-final.js
// Final cover menu order and labels.
// Keeps the logout button visible even if other scripts re-render the cover menu later.
// Adds an in-app Gemini coach page instead of opening a new browser tab.

(function () {
  let observerInstalled = false;
  let patchTimer = null;

  const GEMINI_COACH_URL = 'https://gemini.google.com/gem/1CZ8RkoFR82xLilnrtoimh6KsrlBLzBeO?usp=sharing';

  function injectStyles() {
    if (document.getElementById('coverMenuFinalStyle')) return;
    const style = document.createElement('style');
    style.id = 'coverMenuFinalStyle';
    style.textContent = `
      #coverScreen .menu-actions.final-cover-menu {
        max-width: 430px;
      }

      #coverScreen .menu-actions.final-cover-menu button {
        width: 100%;
      }

      #geminiCoachScreen .gemini-coach-card {
        width: min(1500px, 96vw);
        max-width: none;
        padding: 18px;
        text-align: left;
      }

      .gemini-coach-topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 12px;
        padding: 12px 14px;
        border-radius: 24px;
        background: rgba(255,255,255,.58);
        border: 1px solid rgba(255,255,255,.78);
        box-shadow: var(--soft-shadow), inset 0 1px 0 rgba(255,255,255,.86);
      }

      .gemini-coach-title-wrap { min-width: 0; }
      .gemini-coach-title-wrap .tag { margin-bottom: 6px; }
      .gemini-coach-title-wrap h2 { margin: 0 0 4px; font-size: clamp(1.35rem, 2.2vw, 1.9rem); }
      .gemini-coach-title-wrap p { margin: 0; color: var(--muted); font-weight: 800; line-height: 1.5; }

      .gemini-coach-actions {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;
        gap: 8px;
      }

      .gemini-coach-actions button,
      .gemini-coach-actions a {
        border: 0;
        border-radius: 999px;
        padding: 10px 14px;
        font-size: .9rem;
        font-weight: 950;
        text-decoration: none;
        cursor: pointer;
        color: var(--primary-dark);
        background: rgba(255,255,255,.72);
        box-shadow: inset 0 1px 0 rgba(255,255,255,.92), 0 8px 18px rgba(29,53,87,.07);
      }

      .gemini-coach-actions .primary-link {
        color: #083b00;
        background: linear-gradient(180deg, rgba(57,255,20,.36), rgba(255,255,255,.78));
      }

      .gemini-coach-frame-wrap {
        height: calc(100vh - 210px);
        min-height: 560px;
        border-radius: 28px;
        overflow: hidden;
        background: rgba(255,255,255,.62);
        border: 1px solid rgba(255,255,255,.78);
        box-shadow: var(--soft-shadow), inset 0 1px 0 rgba(255,255,255,.88);
      }

      .gemini-coach-frame {
        display: block;
        width: 100%;
        height: 100%;
        border: 0;
        background: white;
      }

      .gemini-coach-note {
        margin: 10px 2px 0;
        color: var(--muted);
        font-size: .86rem;
        font-weight: 800;
        line-height: 1.5;
      }

      @media (max-width: 760px) {
        #geminiCoachScreen .gemini-coach-card { width: auto; padding: 14px; }
        .gemini-coach-topbar { align-items: flex-start; flex-direction: column; }
        .gemini-coach-actions { justify-content: flex-start; }
        .gemini-coach-frame-wrap { height: 72vh; min-height: 480px; }
      }
    `;
    document.head.appendChild(style);
  }

  function finalMenuHtml() {
    return `
      <button type="button" onclick="window.openRpgMap ? window.openRpgMap() : (window.showRpgMapScreen && window.showRpgMapScreen())">開始 RPG 冒險</button>
      <button type="button" class="secondary" onclick="showPhraseLibraryScreen()">社交技能書</button>
      <button type="button" class="secondary" onclick="window.showCharacterScreen && window.showCharacterScreen()">我的角色</button>
      <button type="button" class="secondary" onclick="showBadgeScreen()">查看我的徽章</button>
      <button type="button" class="secondary" onclick="window.showGeminiCoachScreen && window.showGeminiCoachScreen()">梁書校園社交教練（謙謙）</button>
      <button type="button" class="secondary" onclick="showSettingsScreen()">我的設定</button>
      <button type="button" class="secondary" onclick="logoutGoogle()">登出</button>
    `;
  }

  function menuNeedsPatch(menu) {
    if (!menu) return false;
    const text = String(menu.textContent || '');
    return !text.includes('登出') || !text.includes('開始 RPG 冒險') || !text.includes('社交技能書') || !text.includes('梁書校園社交教練（謙謙）');
  }

  function getCardRoot() {
    return document.querySelector('.container .card');
  }

  function ensureGeminiCoachScreen() {
    injectStyles();
    const card = getCardRoot();
    if (!card) return null;

    let screen = document.getElementById('geminiCoachScreen');
    if (screen) return screen;

    screen = document.createElement('div');
    screen.id = 'geminiCoachScreen';
    screen.className = 'screen welcome-screen';
    screen.innerHTML = `
      <div class="hero-card animate-in gemini-coach-card">
        <div class="gemini-coach-topbar">
          <div class="gemini-coach-title-wrap">
            <div class="tag">梁書校園社交教練</div>
            <h2>梁書校園社交教練（謙謙）</h2>
            <p>你可以在這裡向謙謙查詢社交情境、練習句子或請它幫你拆解下一步。</p>
          </div>
          <div class="gemini-coach-actions">
            <button type="button" onclick="showCoverScreen && showCoverScreen()">返回開始頁</button>
            <a class="primary-link" href="${GEMINI_COACH_URL}" target="_blank" rel="noopener noreferrer">另開新分頁</a>
          </div>
        </div>
        <div class="gemini-coach-frame-wrap">
          <iframe class="gemini-coach-frame" src="${GEMINI_COACH_URL}" title="梁書校園社交教練（謙謙）" allow="clipboard-read; clipboard-write; microphone; camera"></iframe>
        </div>
        <p class="gemini-coach-note">如果畫面顯示空白或被 Google 阻止嵌入，請按「另開新分頁」。這是 Google / Gemini 的網站安全限制，不是你的程式錯誤。</p>
      </div>
    `;

    const cover = document.getElementById('coverScreen');
    if (cover) card.insertBefore(screen, cover.nextSibling);
    else card.appendChild(screen);

    return screen;
  }

  function replaceCoverMenu() {
    injectStyles();
    ensureGeminiCoachScreen();

    const cover = document.getElementById('coverScreen');
    if (!cover) return false;
    const menu = cover.querySelector('.menu-actions');
    if (!menu) return false;

    if (menu.dataset.finalCoverMenu === '1' && !menuNeedsPatch(menu)) return true;

    menu.dataset.finalCoverMenu = '1';
    menu.classList.add('final-cover-menu');
    menu.innerHTML = finalMenuHtml();
    return true;
  }

  function showGeminiCoachScreen() {
    ensureGeminiCoachScreen();

    document.querySelectorAll('.screen').forEach(function (screen) {
      screen.classList.toggle('active', screen.id === 'geminiCoachScreen');
    });

    const rpgScreen = document.getElementById('rpgMapScreen');
    if (rpgScreen) rpgScreen.classList.remove('active');

    if (window.appState) window.appState.currentScreen = 'geminiCoach';

    try { history.replaceState(null, '', '#gemini-coach'); }
    catch (error) { window.location.hash = '#gemini-coach'; }

    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function schedulePatch() {
    if (patchTimer) clearTimeout(patchTimer);
    patchTimer = setTimeout(function () {
      patchTimer = null;
      replaceCoverMenu();
    }, 80);
  }

  function installObserver() {
    if (observerInstalled) return;
    observerInstalled = true;

    const observer = new MutationObserver(function () {
      schedulePatch();
    });

    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  function install() {
    replaceCoverMenu();
    ensureGeminiCoachScreen();
    installObserver();
    [100, 300, 700, 1200, 2000, 3500].forEach(function (delay) {
      setTimeout(replaceCoverMenu, delay);
      setTimeout(ensureGeminiCoachScreen, delay + 30);
    });
  }

  window.applyFinalCoverMenu = replaceCoverMenu;
  window.showGeminiCoachScreen = showGeminiCoachScreen;

  window.addEventListener('lstAuthReady', function () {
    [0, 150, 500, 1000, 2000].forEach(function (delay) {
      setTimeout(replaceCoverMenu, delay);
      setTimeout(ensureGeminiCoachScreen, delay + 30);
    });
  });

  window.addEventListener('hashchange', function () {
    if (window.location.hash === '#gemini-coach') setTimeout(showGeminiCoachScreen, 80);
    else setTimeout(replaceCoverMenu, 120);
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install);
  else install();

  window.addEventListener('load', install);
})();
