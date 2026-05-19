// cover-menu-final.js
// Final cover menu order and labels.
// Safe version: no full-page MutationObserver, so it will not interfere with Firebase/auth loading.
// No new logo file is needed: this script injects an inline SVG game logo into the existing cover page.
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

      #coverScreen.cover-logo-active .hero-avatar,
      #coverScreen.cover-logo-active .hero-card > h2 {
        display: none !important;
      }

      .cover-game-logo-wrap {
        width: min(820px, 96%);
        margin: 0 auto 14px;
        display: block;
      }

      .cover-game-logo-svg {
        width: 100%;
        height: auto;
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
        #coverScreen.cover-logo-active .hero-card {
          padding-top: 22px;
        }
      }
    `;
  }

  function logoSvgHtml() {
    return `
      <div class="cover-game-logo-wrap" aria-label="梁書校園社交大冒險 Logo">
        <svg class="cover-game-logo-svg" viewBox="0 0 1200 430" role="img" aria-labelledby="coverLogoTitle coverLogoDesc" xmlns="http://www.w3.org/2000/svg">
          <title id="coverLogoTitle">梁書校園社交大冒險</title>
          <desc id="coverLogoDesc">LKK Campus Social Adventure game title logo.</desc>
          <defs>
            <linearGradient id="coverBlue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#78f6ff"/>
              <stop offset="0.48" stop-color="#18a8ff"/>
              <stop offset="1" stop-color="#0066e7"/>
            </linearGradient>
            <linearGradient id="coverGreen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#f6ff55"/>
              <stop offset="0.52" stop-color="#65dc20"/>
              <stop offset="1" stop-color="#16892a"/>
            </linearGradient>
            <linearGradient id="coverGold" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#fff46e"/>
              <stop offset="0.55" stop-color="#ffc526"/>
              <stop offset="1" stop-color="#f28a00"/>
            </linearGradient>
            <filter id="coverShadow" x="-20%" y="-20%" width="140%" height="150%">
              <feDropShadow dx="0" dy="12" stdDeviation="10" flood-color="#003a80" flood-opacity="0.30"/>
              <feDropShadow dx="0" dy="3" stdDeviation="2" flood-color="#001d4a" flood-opacity="0.25"/>
            </filter>
            <filter id="coverTextShadow" x="-15%" y="-15%" width="130%" height="145%">
              <feDropShadow dx="0" dy="8" stdDeviation="5" flood-color="#002a72" flood-opacity="0.46"/>
              <feDropShadow dx="0" dy="2" stdDeviation="1" flood-color="#001b45" flood-opacity="0.45"/>
            </filter>
            <style>
              .coverLogoMain{font-family:'Arial Rounded MT Bold','Microsoft JhengHei','PingFang HK','Noto Sans TC',sans-serif;font-weight:900;letter-spacing:-8px;paint-order:stroke fill;stroke:#fff;stroke-width:18;stroke-linejoin:round;filter:url(#coverTextShadow)}
              .coverLogoSub{font-family:'Arial Rounded MT Bold','Trebuchet MS','Microsoft JhengHei',sans-serif;font-weight:900;letter-spacing:1px;fill:#fff;paint-order:stroke fill;stroke:#1557bd;stroke-width:8;stroke-linejoin:round}
            </style>
          </defs>

          <path d="M118 173 C100 97 161 54 244 74 C294 12 397 37 437 69 C492 30 598 31 650 69 C710 28 817 42 847 97 C926 57 1032 85 1039 166 C1110 182 1113 277 1045 299 C1039 364 947 383 884 347 C817 400 705 385 654 349 C592 393 488 389 433 346 C363 386 256 365 234 305 C162 314 110 252 118 173 Z" fill="rgba(255,255,255,.95)" stroke="#2a77ff" stroke-width="5" filter="url(#coverShadow)"/>

          <g transform="translate(84 88) rotate(-9)">
            <rect x="0" y="24" width="150" height="105" rx="18" fill="#fff7cf" stroke="#fff" stroke-width="7" filter="url(#coverShadow)"/>
            <path d="M18 48 L54 32 L91 49 L131 34 L131 108 L91 122 L54 104 L18 120 Z" fill="#f9e9a2"/>
            <path d="M54 32 L54 104 M91 49 L91 122" stroke="#e2c766" stroke-width="4"/>
            <path d="M26 96 C51 70 72 90 92 65 C110 45 124 58 134 46" stroke="#65c94c" stroke-width="14" fill="none" stroke-linecap="round"/>
            <path d="M45 85 C69 72 92 83 120 70" stroke="#50b6ff" stroke-width="12" fill="none" stroke-linecap="round"/>
            <path d="M79 21 C58 21 43 37 43 57 C43 86 79 119 79 119 C79 119 115 86 115 57 C115 37 99 21 79 21 Z" fill="#ff4a4a" stroke="#fff" stroke-width="8"/>
            <circle cx="79" cy="57" r="13" fill="#fff"/>
          </g>

          <g transform="translate(61 231)">
            <path d="M18 20 C18 4 34 -6 54 -6 L117 -6 C145 -6 164 11 164 38 C164 65 145 82 117 82 L67 82 L35 108 L42 79 C27 74 18 61 18 43 Z" fill="#1da8ff" stroke="#fff" stroke-width="8" filter="url(#coverShadow)"/>
            <circle cx="69" cy="39" r="9" fill="#fff" opacity=".95"/>
            <circle cx="96" cy="39" r="9" fill="#fff" opacity=".95"/>
            <circle cx="123" cy="39" r="9" fill="#fff" opacity=".95"/>
          </g>

          <g transform="translate(933 74) rotate(6)">
            <path d="M35 90 L100 33 L166 90 Z" fill="#1b95ff" stroke="#fff" stroke-width="7" filter="url(#coverShadow)"/>
            <rect x="48" y="86" width="105" height="106" rx="12" fill="#ffd178" stroke="#fff" stroke-width="7" filter="url(#coverShadow)"/>
            <rect x="83" y="128" width="35" height="64" rx="10" fill="#2578d8"/>
            <rect x="62" y="103" width="21" height="21" rx="4" fill="#fff"/>
            <rect x="119" y="103" width="21" height="21" rx="4" fill="#fff"/>
            <circle cx="100" cy="70" r="18" fill="#fff" stroke="#ff9a00" stroke-width="5"/>
            <path d="M100 59 L100 71 L110 75" stroke="#1b66c9" stroke-width="4" stroke-linecap="round"/>
          </g>

          <g transform="translate(1042 204)">
            <path d="M78 0 L99 50 L153 55 L112 91 L124 144 L78 116 L31 144 L43 91 L2 55 L56 50 Z" fill="url(#coverGold)" stroke="#fff" stroke-width="10" filter="url(#coverShadow)"/>
            <text x="78" y="93" text-anchor="middle" font-size="78" font-family="Arial Rounded MT Bold, sans-serif" font-weight="900" fill="#fff" stroke="#f28a00" stroke-width="5" paint-order="stroke fill">!</text>
          </g>

          <text x="600" y="168" text-anchor="middle" font-size="116" class="coverLogoMain" fill="url(#coverBlue)">梁書校園</text>
          <text x="600" y="278" text-anchor="middle" font-size="112" class="coverLogoMain" fill="url(#coverGreen)">社交大冒險</text>

          <path d="M276 95 C375 61 525 61 625 88 C494 82 379 92 278 126 Z" fill="#fff" opacity=".55"/>
          <path d="M374 198 C503 170 684 174 807 202 C645 196 514 205 381 231 Z" fill="#fff" opacity=".48"/>

          <g transform="translate(284 306)">
            <path d="M0 35 C135 0 495 0 632 35 L613 94 C484 65 145 65 20 94 Z" fill="#075fd8" stroke="#fff" stroke-width="8" filter="url(#coverShadow)"/>
            <path d="M22 39 C145 11 482 11 611 39" stroke="#27a8ff" stroke-width="8" fill="none" opacity=".75"/>
            <text x="316" y="66" text-anchor="middle" font-size="38" class="coverLogoSub">LKK Campus Social Adventure</text>
          </g>

          <g fill="url(#coverGold)" stroke="#fff" stroke-width="4" filter="url(#coverShadow)">
            <path d="M280 35 L291 66 L322 77 L291 88 L280 119 L269 88 L238 77 L269 66 Z"/>
            <path d="M454 24 L463 49 L488 58 L463 67 L454 92 L445 67 L420 58 L445 49 Z"/>
            <path d="M1005 267 L1014 292 L1039 301 L1014 310 L1005 335 L996 310 L971 301 L996 292 Z"/>
            <path d="M1103 102 L1110 124 L1132 131 L1110 138 L1103 160 L1096 138 L1074 131 L1096 124 Z"/>
          </g>
        </svg>
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

    let logo = hero.querySelector('.cover-game-logo-wrap');
    if (logo) return true;

    const tag = hero.querySelector('.tag');
    if (tag) {
      tag.insertAdjacentHTML('afterend', logoSvgHtml());
    } else {
      hero.insertAdjacentHTML('afterbegin', logoSvgHtml());
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
