// /situation-rpg-button.js
// Add ONE RPG map button to the situation list page.
// Cover page cleanup: keep only
// 開始 RPG 冒險 / 社交技能書 / 我的角色 / 查看我的徽章 / 我的設定

(function () {
  let coverObserver = null;

  function goToRpgMap() {
    if (typeof showRpgMapScreen === 'function') {
      showRpgMapScreen();
      return;
    }

    if (typeof ensureRpgMapScreen === 'function') {
      ensureRpgMapScreen();
    }

    document.querySelectorAll('.screen').forEach(function (screen) {
      screen.classList.toggle('active', screen.id === 'rpgMapScreen');
    });

    window.scrollTo({
      top: 0,
      behavior: document.body.classList.contains('reduced-motion') ? 'auto' : 'smooth'
    });
  }

  function goToSituationList() {
    if (typeof showSituationScreen === 'function') {
      showSituationScreen();
      return;
    }

    document.querySelectorAll('.screen').forEach(function (screen) {
      screen.classList.toggle('active', screen.id === 'situationScreen');
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

    // Rebuild the cover menu from scratch so late-loading scripts cannot leave
    // a duplicated「RPG 校園地圖」button on the cover page.
    menu.innerHTML = '';
    menu.appendChild(makeCoverButton('開始 RPG 冒險', '', goToSituationList));
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
      const hasWrongButton = Array.from(menu.querySelectorAll('button')).some(function (button) {
        const text = (button.textContent || '').trim();
        return text.includes('RPG 校園地圖') || text.includes('RPG 冒險地圖');
      });

      const buttonTexts = Array.from(menu.querySelectorAll('button')).map(function (button) {
        return (button.textContent || '').trim();
      });

      const expected = ['開始 RPG 冒險', '社交技能書', '我的角色', '查看我的徽章', '我的設定'];
      const wrongOrderOrCount = buttonTexts.length !== expected.length || expected.some(function (text, index) {
        return buttonTexts[index] !== text;
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
    cleanupCoverMenu();
    watchCoverMenu();

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
    setTimeout(addRpgButtonToSituationList, 150);
    setTimeout(addRpgButtonToSituationList, 500);
    setTimeout(addRpgButtonToSituationList, 1000);
    setTimeout(cleanupCoverMenu, 1200);
    setTimeout(cleanupCoverMenu, 1800);
    setTimeout(cleanupCoverMenu, 2500);
  }

  window.addRpgButtonToSituationList = addRpgButtonToSituationList;
  window.removeDuplicateRpgButtons = removeDuplicateRpgButtons;
  window.cleanupCoverMenu = cleanupCoverMenu;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSituationRpgButton);
  } else {
    initSituationRpgButton();
  }

  window.addEventListener('load', initSituationRpgButton);
})();
