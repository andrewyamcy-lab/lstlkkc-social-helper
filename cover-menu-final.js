// cover-menu-final.js
// Final cover menu order and labels.
// Keeps the logout button visible even if other scripts re-render the cover menu later.
// Gemini/Gem pages cannot be embedded in an iframe, so the coach opens in a new tab.

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
    `;
    document.head.appendChild(style);
  }

  function openGeminiCoach() {
    window.open(GEMINI_COACH_URL, '_blank', 'noopener,noreferrer');
  }

  function finalMenuHtml() {
    return `
      <button type="button" onclick="window.openRpgMap ? window.openRpgMap() : (window.showRpgMapScreen && window.showRpgMapScreen())">開始 RPG 冒險</button>
      <button type="button" class="secondary" onclick="showPhraseLibraryScreen()">社交技能書</button>
      <button type="button" class="secondary" onclick="window.showCharacterScreen && window.showCharacterScreen()">我的角色</button>
      <button type="button" class="secondary" onclick="showBadgeScreen()">查看我的徽章</button>
      <button type="button" class="secondary" onclick="window.openGeminiCoach && window.openGeminiCoach()">梁書校園社交教練（謙謙）</button>
      <button type="button" class="secondary" onclick="showSettingsScreen()">我的設定</button>
      <button type="button" class="secondary" onclick="logoutGoogle()">登出</button>
    `;
  }

  function menuNeedsPatch(menu) {
    if (!menu) return false;
    const text = String(menu.textContent || '');
    return !text.includes('登出') || !text.includes('開始 RPG 冒險') || !text.includes('社交技能書') || !text.includes('梁書校園社交教練（謙謙）');
  }

  function removeGeminiCoachScreen() {
    const screen = document.getElementById('geminiCoachScreen');
    if (screen && screen.parentNode) screen.parentNode.removeChild(screen);
  }

  function replaceCoverMenu() {
    injectStyles();
    removeGeminiCoachScreen();

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

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  function install() {
    replaceCoverMenu();
    installObserver();
    [100, 300, 700, 1200, 2000, 3500].forEach(function (delay) {
      setTimeout(replaceCoverMenu, delay);
    });
  }

  window.applyFinalCoverMenu = replaceCoverMenu;
  window.openGeminiCoach = openGeminiCoach;

  window.addEventListener('lstAuthReady', function () {
    [0, 150, 500, 1000, 2000].forEach(function (delay) {
      setTimeout(replaceCoverMenu, delay);
    });
  });

  window.addEventListener('hashchange', function () {
    setTimeout(replaceCoverMenu, 120);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install);
  } else {
    install();
  }

  window.addEventListener('load', install);
})();
