// /situation-rpg-button.js
// Add ONE RPG map button to the situation list page.
// Cover page cleanup: keep only
// 開始 RPG 冒險 / 社交技能書 / 我的角色 / 查看我的徽章 / 我的設定
// UI cleanup: keep only one visible progress bar on the RPG map panel.
// EXP bar style: Minecraft-inspired white pixel segmented green bar.

(function () {
  let coverObserver = null;

  function goToRpgMap() {
    if (typeof showRpgMapScreen === 'function') {
      showRpgMapScreen();
      return;
    }

    if (typeof ensureRpgMapScreen === 'function') ensureRpgMapScreen();

    document.querySelectorAll('.screen').forEach(function (screen) {
      screen.classList.toggle('active', screen.id === 'rpgMapScreen');
    });

    const rpgScreen = document.getElementById('rpgMapScreen');
    if (rpgScreen) rpgScreen.classList.add('active');

    if (typeof updateRpgMapProgressUI === 'function') {
      setTimeout(updateRpgMapProgressUI, 80);
      setTimeout(cleanupRpgProgressBars, 120);
    }

    window.scrollTo({
      top: 0,
      behavior: document.body.classList.contains('reduced-motion') ? 'auto' : 'smooth'
    });
  }

  function makeCoverButton(text, className, onClick) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = text;
    if (className) button.className = className;
    button.addEventListener('click', onClick);
    return button;
  }

  function cleanupCoverMenu() {
    const menu = document.querySelector('#coverScreen .menu-actions');
    if (!menu) return;

    menu.innerHTML = '';
    menu.appendChild(makeCoverButton('開始 RPG 冒險', '', goToRpgMap));
    menu.appendChild(makeCoverButton('社交技能書', 'secondary', function () {
      if (typeof showPhraseLibraryScreen === 'function') showPhraseLibraryScreen();
    }));
    menu.appendChild(makeCoverButton('我的角色', 'secondary', function () {
      if (typeof showCharacterScreen === 'function') showCharacterScreen();
    }));
    menu.appendChild(makeCoverButton('查看我的徽章', 'secondary', function () {
      if (typeof showBadgeScreen === 'function') showBadgeScreen();
    }));
    menu.appendChild(makeCoverButton('我的設定', 'secondary', function () {
      if (typeof showSettingsScreen === 'function') showSettingsScreen();
    }));
  }

  function watchCoverMenu() {
    const menu = document.querySelector('#coverScreen .menu-actions');
    if (!menu || coverObserver) return;

    coverObserver = new MutationObserver(function () {
      const texts = Array.from(menu.querySelectorAll('button')).map(function (button) {
        return (button.textContent || '').trim();
      });
      const expected = ['開始 RPG 冒險', '社交技能書', '我的角色', '查看我的徽章', '我的設定'];
      const hasWrongButton = texts.some(function (text) {
        return text.includes('RPG 校園地圖') || text.includes('RPG 冒險地圖');
      });
      const wrongOrderOrCount = texts.length !== expected.length || expected.some(function (text, index) {
        return texts[index] !== text;
      });

      if (hasWrongButton || wrongOrderOrCount) {
        coverObserver.disconnect();
        coverObserver = null;
        cleanupCoverMenu();
        setTimeout(watchCoverMenu, 0);
      }
    });

    coverObserver.observe(menu, { childList: true, subtree: true, characterData: true });
  }

  function injectButtonStyle() {
    if (document.getElementById('situationRpgButtonStyle')) return;

    const style = document.createElement('style');
    style.id = 'situationRpgButtonStyle';
    style.textContent = `
      .situation-rpg-switch {
        display: flex;
        justify-content: center;
        margin: 18px 0 20px;
      }

      .situation-rpg-switch button {
        min-width: 240px;
        border-radius: 18px;
        background: linear-gradient(180deg, #2f8cff, #006be8) !important;
        color: #ffffff;
        font-weight: 950;
        box-shadow:
          0 8px 0 rgba(169, 205, 242, 0.86),
          0 16px 32px rgba(0, 87, 217, 0.18),
          inset 0 1px 0 rgba(255,255,255,0.64);
      }

      .situation-rpg-switch button::before,
      .situation-rpg-switch button::after {
        display: none !important;
        content: none !important;
      }

      .situation-rpg-switch button:hover,
      .situation-rpg-switch button:focus-visible {
        transform: translateY(-4px);
        box-shadow:
          0 11px 0 rgba(169, 205, 242, 0.90),
          0 22px 42px rgba(0, 87, 217, 0.22),
          0 0 0 5px rgba(255, 214, 10, 0.14),
          inset 0 1px 0 rgba(255,255,255,0.74);
      }
    `;
    document.head.appendChild(style);
  }

  function injectProgressBarCleanupStyle() {
    if (document.getElementById('singleRpgProgressBarStyle')) return;

    const style = document.createElement('style');
    style.id = 'singleRpgProgressBarStyle';
    style.textContent = `
      /* Hide the second RPG map progress bar. The visible bar is now only EXP / level progress. */
      #rpgProgressPanel > .rpg-progress-bar-wrap {
        display: none !important;
      }

      #rpgProgressPanel .rpg-map-level-mini {
        margin-bottom: 0 !important;
      }

      /* Minecraft-inspired EXP bar with WHITE pixel track */
      #rpgProgressPanel .rpg-map-level-mini > .rpg-progress-bar-wrap,
      #characterScreen .rpg-exp-panel .rpg-progress-bar-wrap {
        position: relative !important;
        height: 22px !important;
        border-radius: 0 !important;
        overflow: hidden !important;
        background:
          repeating-linear-gradient(
            90deg,
            #ffffff 0 3px,
            #f4f8ff 3px 18px,
            #dbe7f5 18px 21px
          ) !important;
        border: 3px solid #ffffff !important;
        box-shadow:
          0 0 0 2px rgba(0, 122, 255, 0.16),
          0 5px 0 rgba(169, 205, 242, 0.52),
          inset 0 2px 0 rgba(255,255,255,0.96),
          inset 0 -3px 0 rgba(169,205,242,0.38) !important;
      }

      #rpgProgressPanel .rpg-map-level-mini > .rpg-progress-bar-wrap::before,
      #characterScreen .rpg-exp-panel .rpg-progress-bar-wrap::before {
        content: "";
        position: absolute;
        inset: 3px;
        background:
          repeating-linear-gradient(
            90deg,
            rgba(0,122,255,0.10) 0 1px,
            transparent 1px 19px
          );
        pointer-events: none;
        z-index: 2;
      }

      #rpgProgressPanel .rpg-map-level-mini > .rpg-progress-bar-wrap::after,
      #characterScreen .rpg-exp-panel .rpg-progress-bar-wrap::after {
        content: "";
        position: absolute;
        inset: 0;
        box-shadow:
          inset 0 3px 0 rgba(255,255,255,0.92),
          inset 0 -4px 0 rgba(169,205,242,0.30);
        pointer-events: none;
        z-index: 3;
      }

      #rpgProgressPanel .rpg-map-level-mini > .rpg-progress-bar-wrap .rpg-progress-bar-fill,
      #characterScreen .rpg-exp-panel .rpg-progress-bar-wrap .rpg-progress-bar-fill {
        height: 100% !important;
        border-radius: 0 !important;
        background:
          repeating-linear-gradient(
            90deg,
            #39ff14 0 14px,
            #22c70d 14px 18px,
            #116b08 18px 21px
          ) !important;
        box-shadow:
          inset 0 4px 0 rgba(255,255,255,0.42),
          inset 0 -5px 0 rgba(0,0,0,0.20),
          0 0 14px rgba(57,255,20,0.34) !important;
      }

      #rpgProgressPanel .rpg-map-level-mini > span,
      #characterScreen .rpg-exp-head strong {
        color: #1f6f00 !important;
        font-weight: 950 !important;
        text-shadow: 0 1px 0 rgba(255,255,255,0.92) !important;
      }
    `;
    document.head.appendChild(style);
  }

  function cleanupRpgProgressBars() {
    injectProgressBarCleanupStyle();
    const panel = document.getElementById('rpgProgressPanel');
    if (!panel) return;

    const missionBar = panel.querySelector(':scope > .rpg-progress-bar-wrap');
    if (missionBar) missionBar.setAttribute('aria-hidden', 'true');
  }

  function removeDuplicateRpgButtons() {
    const situationScreen = document.getElementById('situationScreen');
    if (!situationScreen) return;

    const switches = Array.from(situationScreen.querySelectorAll('.situation-rpg-switch, #situationRpgSwitch'));
    switches.forEach(function (item, index) {
      if (index > 0) item.remove();
    });

    const rpgButtons = Array.from(situationScreen.querySelectorAll('button')).filter(function (button) {
      return (button.textContent || '').trim().includes('RPG 校園地圖');
    });

    rpgButtons.forEach(function (button, index) {
      if (index > 0) {
        const parentSwitch = button.closest('.situation-rpg-switch, #situationRpgSwitch');
        if (parentSwitch) parentSwitch.remove();
        else button.remove();
      }
    });
  }

  function addRpgButtonToSituationList() {
    injectButtonStyle();
    injectProgressBarCleanupStyle();
    cleanupCoverMenu();
    watchCoverMenu();
    cleanupRpgProgressBars();

    const situationScreen = document.getElementById('situationScreen');
    if (!situationScreen) return;

    const scenarioGrid = situationScreen.querySelector('.scenario-select-grid');
    if (!scenarioGrid) return;

    removeDuplicateRpgButtons();

    let wrapper = document.getElementById('situationRpgSwitch');
    if (!wrapper || !situationScreen.contains(wrapper)) {
      wrapper = document.createElement('div');
      wrapper.id = 'situationRpgSwitch';
      wrapper.className = 'situation-rpg-switch';
      wrapper.innerHTML = '<button type="button" id="openRpgMapFromSituation">🗺️ RPG 校園地圖</button>';
      scenarioGrid.insertAdjacentElement('beforebegin', wrapper);
    }

    const button = wrapper.querySelector('button');
    if (button && !button.dataset.rpgClickBound) {
      button.dataset.rpgClickBound = '1';
      button.addEventListener('click', goToRpgMap);
    }

    removeDuplicateRpgButtons();
  }

  function initSituationRpgButton() {
    addRpgButtonToSituationList();
    cleanupCoverMenu();
    watchCoverMenu();
    cleanupRpgProgressBars();
    setTimeout(addRpgButtonToSituationList, 150);
    setTimeout(addRpgButtonToSituationList, 500);
    setTimeout(addRpgButtonToSituationList, 1000);
    setTimeout(cleanupCoverMenu, 1200);
    setTimeout(cleanupCoverMenu, 1800);
    setTimeout(cleanupCoverMenu, 2500);
    setTimeout(cleanupRpgProgressBars, 300);
    setTimeout(cleanupRpgProgressBars, 900);
    setTimeout(cleanupRpgProgressBars, 1600);
  }

  window.addRpgButtonToSituationList = addRpgButtonToSituationList;
  window.removeDuplicateRpgButtons = removeDuplicateRpgButtons;
  window.cleanupCoverMenu = cleanupCoverMenu;
  window.cleanupRpgProgressBars = cleanupRpgProgressBars;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSituationRpgButton);
  } else {
    initSituationRpgButton();
  }

  window.addEventListener('load', initSituationRpgButton);
})();
