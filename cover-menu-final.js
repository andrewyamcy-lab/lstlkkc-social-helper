// cover-menu-final.js
// Final cover menu order and labels.
// Safe version: no full-page MutationObserver, so it will not interfere with Firebase/auth loading.
// Gemini/Gem pages cannot be embedded in an iframe, so the coach opens in a new tab.

(function () {
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

  function openFinalRpgMap() {
    if (typeof window.goToRpgMap === 'function') {
      window.goToRpgMap();
      return;
    }
    if (typeof window.showRpgMapScreen === 'function') {
      window.showRpgMapScreen();
      return;
    }
    if (typeof window.openRpgMap === 'function' && window.openRpgMap !== openFinalRpgMap) {
      window.openRpgMap();
    }
  }

  function safeCall(name) {
    if (typeof window[name] === 'function') window[name]();
  }

  function makeButton(text, className, handler) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = text;
    if (className) button.className = className;
    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      if (typeof handler === 'function') handler();
    });
    return button;
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
    injectStyles();
    removeGeminiCoachScreen();

    const cover = document.getElementById('coverScreen');
    if (!cover) return false;

    const menu = cover.querySelector('.menu-actions');
    if (!menu) return false;

    if (menu.dataset.finalCoverMenu === '1' && menuIsExact(menu)) return true;

    menu.dataset.finalCoverMenu = '1';
    menu.classList.add('final-cover-menu');
    menu.innerHTML = '';

    menu.appendChild(makeButton('RPG 校園地圖', '', openFinalRpgMap));
    menu.appendChild(makeButton('社交技能書', 'secondary', function () { safeCall('showPhraseLibraryScreen'); }));
    menu.appendChild(makeButton('我的角色', 'secondary', function () { safeCall('showCharacterScreen'); }));
    menu.appendChild(makeButton('查看我的徽章', 'secondary', function () { safeCall('showBadgeScreen'); }));
    menu.appendChild(makeButton('梁書校園社交教練（謙謙）', 'secondary', openGeminiCoach));
    menu.appendChild(makeButton('我的設定', 'secondary', function () { safeCall('showSettingsScreen'); }));
    menu.appendChild(makeButton('登出', 'secondary', function () { safeCall('logoutGoogle'); }));

    return true;
  }

  function install() {
    window.openGeminiCoach = openGeminiCoach;
    window.openFinalRpgMap = openFinalRpgMap;
    window.applyFinalCoverMenu = replaceCoverMenu;

    [0, 120, 400, 900, 1800, 3200].forEach(function (delay) {
      setTimeout(replaceCoverMenu, delay);
    });
  }

  window.addEventListener('lstAuthReady', function () {
    [0, 150, 500, 1200].forEach(function (delay) {
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
