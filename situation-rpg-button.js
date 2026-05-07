// /situation-rpg-button.js
// Add ONE RPG map button to the situation list page.
// Also remove the duplicated RPG entrance from the cover page by restoring「開始練習」.

(function () {
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

  function restoreCoverStartButton() {
    const menu = document.querySelector('#coverScreen .menu-actions');
    if (!menu) return;

    const buttons = Array.from(menu.querySelectorAll('button'));
    const coverRpgButton = buttons.find(function (button) {
      const text = (button.textContent || '').trim();
      return text === '開始 RPG 冒險' || text.includes('開始 RPG 冒險');
    });

    if (!coverRpgButton || coverRpgButton.dataset.coverStartRestored === '1') return;

    const newButton = document.createElement('button');
    newButton.type = 'button';
    newButton.textContent = '開始練習';
    newButton.dataset.coverStartRestored = '1';
    newButton.addEventListener('click', function () {
      if (typeof showSituationScreen === 'function') showSituationScreen();
    });

    coverRpgButton.replaceWith(newButton);
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
    restoreCoverStartButton();

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
    restoreCoverStartButton();
    setTimeout(addRpgButtonToSituationList, 150);
    setTimeout(addRpgButtonToSituationList, 500);
    setTimeout(addRpgButtonToSituationList, 1000);
    setTimeout(restoreCoverStartButton, 1200);
    setTimeout(restoreCoverStartButton, 1800);
  }

  window.addRpgButtonToSituationList = addRpgButtonToSituationList;
  window.removeDuplicateRpgButtons = removeDuplicateRpgButtons;
  window.restoreCoverStartButton = restoreCoverStartButton;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSituationRpgButton);
  } else {
    initSituationRpgButton();
  }

  window.addEventListener('load', initSituationRpgButton);
})();
