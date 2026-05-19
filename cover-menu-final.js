// cover-menu-final.js
// Final cover menu order and labels.
// Safe version: no full-page MutationObserver, so it will not interfere with Firebase/auth loading.
// Uses the uploaded PNG logo from the existing images folder.
// Gemini/Gem pages cannot be embedded in an iframe, so the coach opens in a new tab.

(function () {
  const GEMINI_COACH_URL = 'https://gemini.google.com/gem/1CZ8RkoFR82xLilnrtoimh6KsrlBLzBeO?usp=sharing';
  const LOGO_URL = 'images/lkk-social-adventure-logo.png?v=20260519-1';

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

      #coverScreen.cover-logo-active .hero-avatar,
      #coverScreen.cover-logo-active .hero-card > h2 {
        display: none !important;
      }

      .cover-game-logo-wrap {
        width: min(820px, 96%);
        margin: 0 auto 14px;
        display: block;
      }

      .cover-game-logo-img {
        width: 100%;
        max-height: 250px;
        object-fit: contain;
        display: block;
        filter: drop-shadow(0 18px 28px rgba(0, 78, 180, 0.22));
      }

      #coverScreen.cover-logo-active .hero-card {
        padding-top: 28px;
      }

      #coverScreen.cover-logo-active .hero-card > p {
        max-width: 680px;
        margin-left: auto;
        margin-right: auto;
      }

      @media (max-width: 720px) {
        .cover-game-logo-wrap {
          width: 100%;
          margin-bottom: 10px;
        }

        .cover-game-logo-img {
          max-height: 180px;
        }

        #coverScreen.cover-logo-active .hero-card {
          padding-top: 22px;
        }
      }
    `;
  }

  function logoHtml() {
    return `
      <div class="cover-game-logo-wrap">
        <img
          class="cover-game-logo-img"
          src="${LOGO_URL}"
          alt="梁書校園社交大冒險｜LKK Campus Social Adventure"
          loading="eager"
          decoding="async"
          onerror="this.closest('.cover-game-logo-wrap').style.display='none';"
        />
      </div>
    `;
  }

  function ensureCoverLogo() {
    injectStyles();

    const cover = document.getElementById('coverScreen');
    if (!cover) return false;

    const hero = cover.querySelector('.hero-card');
    if (!hero) return false;

    cover.classList.add('cover-logo-active');

    const oldSvgLogo = hero.querySelector('.cover-game-logo-svg');
    if (oldSvgLogo) {
      const wrap = oldSvgLogo.closest('.cover-game-logo-wrap');
      if (wrap) wrap.remove();
    }

    let logo = hero.querySelector('.cover-game-logo-wrap');
    if (logo) return true;

    const tag = hero.querySelector('.tag');
    if (tag) {
      tag.insertAdjacentHTML('afterend', logoHtml());
    } else {
      hero.insertAdjacentHTML('afterbegin', logoHtml());
    }

    return true;
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
    ensureCoverLogo();
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
    window.ensureCoverLogo = ensureCoverLogo;

    [0, 120, 400, 900, 1800, 3200].forEach(function (delay) {
      setTimeout(replaceCoverMenu, delay);
      setTimeout(ensureCoverLogo, delay + 40);
    });
  }

  window.addEventListener('lstAuthReady', function () {
    [0, 150, 500, 1200].forEach(function (delay) {
      setTimeout(replaceCoverMenu, delay);
      setTimeout(ensureCoverLogo, delay + 40);
    });
  });

  window.addEventListener('hashchange', function () {
    setTimeout(replaceCoverMenu, 120);
    setTimeout(ensureCoverLogo, 180);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install);
  } else {
    install();
  }

  window.addEventListener('load', install);
})();
