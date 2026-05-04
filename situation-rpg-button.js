// /situation-rpg-button.js
// Add ONE RPG map button to the situation list page.
// Fix: remove duplicate RPG map buttons if scripts initialise more than once.

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
    setTimeout(addRpgButtonToSituationList, 150);
    setTimeout(addRpgButtonToSituationList, 500);
    setTimeout(addRpgButtonToSituationList, 1000);
  }

  window.addRpgButtonToSituationList = addRpgButtonToSituationList;
  window.removeDuplicateRpgButtons = removeDuplicateRpgButtons;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSituationRpgButton);
  } else {
    initSituationRpgButton();
  }

  window.addEventListener('load', initSituationRpgButton);
})();
