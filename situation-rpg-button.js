// /situation-rpg-button.js
// Add RPG map button to the situation list page.

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

  function addRpgButtonToSituationList() {
    injectButtonStyle();

    const situationScreen = document.getElementById('situationScreen');
    if (!situationScreen) return;

    if (document.getElementById('situationRpgSwitch')) return;

    const scenarioGrid = situationScreen.querySelector('.scenario-select-grid');
    if (!scenarioGrid) return;

    const wrapper = document.createElement('div');
    wrapper.id = 'situationRpgSwitch';
    wrapper.className = 'situation-rpg-switch';
    wrapper.innerHTML = '<button type="button" id="openRpgMapFromSituation">🗺️ RPG 校園地圖</button>';

    scenarioGrid.insertAdjacentElement('beforebegin', wrapper);

    const button = document.getElementById('openRpgMapFromSituation');
    if (button) button.addEventListener('click', goToRpgMap);
  }

  function initSituationRpgButton() {
    addRpgButtonToSituationList();
    setTimeout(addRpgButtonToSituationList, 150);
    setTimeout(addRpgButtonToSituationList, 500);
    setTimeout(addRpgButtonToSituationList, 1000);
  }

  window.addRpgButtonToSituationList = addRpgButtonToSituationList;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSituationRpgButton);
  } else {
    initSituationRpgButton();
  }

  window.addEventListener('load', initSituationRpgButton);
})();
