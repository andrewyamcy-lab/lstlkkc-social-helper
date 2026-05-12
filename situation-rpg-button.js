// /situation-rpg-button.js
// Add ONE RPG map button to the situation list page.
// Important: this file no longer rewrites the cover menu. The cover menu is controlled by index.html + cover-menu-final.js only.
// UI cleanup: keep only one visible progress bar on the RPG map panel.

(function () {
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

  window.goToRpgMap = goToRpgMap;
  window.openRpgMap = goToRpgMap;

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
        transform: translateY(0) !important;
        filter: brightness(1.04);
      }
    `;
    document.head.appendChild(style);
  }

  function injectProgressBarCleanupStyle() {
    if (document.getElementById('singleRpgProgressBarStyle')) return;

    const style = document.createElement('style');
    style.id = 'singleRpgProgressBarStyle';
    style.textContent = `
      #rpgProgressPanel > .rpg-progress-bar-wrap {
        display: none !important;
      }

      #rpgProgressPanel .rpg-map-level-mini {
        margin-bottom: 0 !important;
      }

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
    cleanupRpgProgressBars();
    setTimeout(addRpgButtonToSituationList, 150);
    setTimeout(addRpgButtonToSituationList, 500);
    setTimeout(addRpgButtonToSituationList, 1000);
    setTimeout(cleanupRpgProgressBars, 300);
    setTimeout(cleanupRpgProgressBars, 900);
    setTimeout(cleanupRpgProgressBars, 1600);
  }

  // Backward-compatible no-op: older files may call cleanupCoverMenu, but cover menu cleanup must not happen here anymore.
  function cleanupCoverMenu() {}

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
