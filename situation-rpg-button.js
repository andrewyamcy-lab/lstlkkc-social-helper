// /situation-rpg-button.js
// RPG map button cleanup.
// The RPG map is now opened from the homepage button「開始 RPG 冒險」.
// This file now removes the old duplicated「RPG 校園地圖」button from the situation list.

(function () {
  function removeSituationRpgButton() {
    const situationScreen = document.getElementById('situationScreen');
    if (!situationScreen) return;

    const wrappers = Array.from(situationScreen.querySelectorAll('.situation-rpg-switch, #situationRpgSwitch'));
    wrappers.forEach(function (wrapper) {
      wrapper.remove();
    });

    const rpgButtons = Array.from(situationScreen.querySelectorAll('button')).filter(function (button) {
      const text = (button.textContent || '').trim();
      return text.includes('RPG 校園地圖') || text.includes('RPG 冒險地圖');
    });

    rpgButtons.forEach(function (button) {
      const parentSwitch = button.closest('.situation-rpg-switch, #situationRpgSwitch');
      if (parentSwitch) parentSwitch.remove();
      else button.remove();
    });
  }

  function initSituationRpgButtonCleanup() {
    removeSituationRpgButton();
    setTimeout(removeSituationRpgButton, 100);
    setTimeout(removeSituationRpgButton, 300);
    setTimeout(removeSituationRpgButton, 700);
  }

  // Keep the old exported names so index.html can still call them safely.
  window.addRpgButtonToSituationList = removeSituationRpgButton;
  window.removeDuplicateRpgButtons = removeSituationRpgButton;
  window.removeSituationRpgButton = removeSituationRpgButton;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSituationRpgButtonCleanup);
  } else {
    initSituationRpgButtonCleanup();
  }

  window.addEventListener('load', initSituationRpgButtonCleanup);
})();
