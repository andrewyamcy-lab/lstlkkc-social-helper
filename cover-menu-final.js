// cover-menu-final.js
// Final cover menu order and labels.
// This file is the ONLY final authority for the cover menu.
// It enforces the exact 7-button menu and removes duplicate/old buttons.
// Gemini/Gem pages cannot be embedded in an iframe, so the coach opens in a new tab.

(function () {
  let observerInstalled = false;
  let patchTimer = null;
  let isPatching = false;

  const GEMINI_COACH_URL = 'https://gemini.google.com/gem/1CZ8RkoFR82xLilnrtoimh6KsrlBLzBeO?usp=sharing';
  const EXPECTED_MENU = [
    'RPG 校園地圖',
    '社交技能書',
    '我的角色',
    '查看我的徽章',
    '梁書校園社交教練（謙謙）',
    '我的設定',
    '登出'
  ];

  function injectStyles() {
    let style = document.getElementById('coverMenuFinalStyle');
    if (!style) {
      style = document.createElement('style');
      style.id = 'coverMenuFinalStyle';
      document.head.appendChild(style);
    }

    style.textContent = `
      #coverScreen .menu-actions.final-cover-menu {
        max-width: 430px;
      }

      #coverScreen .menu-actions.final-cover-menu button {
        width: 100%;
      }
    `;
  }

  function openGeminiCoach() {
    window.open(GEMINI_COACH_URL, '_blank', 'noopener,noreferrer');
  }

  function openRpgMap() {
    if (typeof window.openRpgMap === 'function' && window.openRpgMap !== openRpgMap) {
      window.openRpgMap();
      return;
    }
    if (typeof window.goToRpgMap === 'function') {
      window.goToRpgMap();
      return;
    }
    if (typeof window.showRpgMapScreen === 'function') {
      window.showRpgMapScreen();
    }
  }

  function finalMenuHtml() {
    return `
      <button type="button" onclick="window.openFinalRpgMap && window.openFinalRpgMap()">RPG 校園地圖</button>
      <button type="button" class="secondary" onclick="showPhraseLibraryScreen && showPhraseLibraryScreen()">社交技能書</button>
      <button type="button" class="secondary" onclick="window.showCharacterScreen && window.showCharacterScreen()">我的角色</button>
      <button type="button" class="secondary" onclick="showBadgeScreen && showBadgeScreen()">查看我的徽章</button>
      <button type="button" class="secondary" onclick="window.openGeminiCoach && window.openGeminiCoach()">梁書校園社交教練（謙謙）</button>
      <button type="button" class="secondary" onclick="showSettingsScreen && showSettingsScreen()">我的設定</button>
      <button type="button" class="secondary" onclick="logoutGoogle && logoutGoogle()">登出</button>
    `;
  }

  function getMenuTexts(menu) {
    return Array.from(menu.querySelectorAll('button')).map(function (button) {
      return String(button.textContent || '').trim();
    });
  }

  function menuIsExact(menu) {
    if (!menu) return false;
    const texts = getMenuTexts(menu);
    if (texts.length !== EXPECTED_MENU.length) return false;
    return EXPECTED_MENU.every(function (text, index) {
      return texts[index] === text;
    });
  }

  function removeGeminiCoachScreen() {
    const screen = document.getElementById('geminiCoachScreen');
    if (screen && screen.parentNode) screen.parentNode.removeChild(screen);
  }

  function replaceCoverMenu() {
    if (isPatching) return true;
    injectStyles();
    removeGeminiCoachScreen();

    const cover = document.getElementById('coverScreen');
    if (!cover) return false;

    const menu = cover.querySelector('.menu-actions');
    if (!menu) return false;

    if (menu.dataset.finalCoverMenu === '1' && menuIsExact(menu)) return true;

    isPatching = true;
    menu.dataset.finalCoverMenu = '1';
    menu.classList.add('final-cover-menu');
    menu.innerHTML = finalMenuHtml();
    isPatching = false;
    return true;
  }

  function schedulePatch() {
    if (patchTimer) clearTimeout(patchTimer);
    patchTimer = setTimeout(function () {
      patchTimer = null;
      replaceCoverMenu();
    }, 20);
  }

  function installObserver() {
    if (observerInstalled) return;
    observerInstalled = true;

    const observer = new MutationObserver(function () {
      if (!isPatching) schedulePatch();
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  function install() {
    replaceCoverMenu();
    installObserver();
    [0, 50, 100, 200, 400, 800, 1200, 2000, 3500, 5000].forEach(function (delay) {
      setTimeout(replaceCoverMenu, delay);
    });
  }

  window.applyFinalCoverMenu = replaceCoverMenu;
  window.openGeminiCoach = openGeminiCoach;
  window.openFinalRpgMap = openRpgMap;

  window.addEventListener('lstAuthReady', function () {
    [0, 50, 150, 300, 600, 1000, 2000].forEach(function (delay) {
      setTimeout(replaceCoverMenu, delay);
    });
  });

  window.addEventListener('hashchange', function () {
    setTimeout(replaceCoverMenu, 50);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install);
  } else {
    install();
  }

  window.addEventListener('load', install);
})();
