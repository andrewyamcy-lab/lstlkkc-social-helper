// /mission-character-button-fix.js
// Change the mission page bottom button from「我的設定」to「我的角色」.
// It also opens the character page instead of the settings page.

(function () {
  function patchMissionCharacterButton() {
    const gameScreen = document.getElementById('gameScreen');
    if (!gameScreen) return;

    const buttons = gameScreen.querySelectorAll('.welcome-actions button');
    buttons.forEach(function (button) {
      const text = (button.textContent || '').trim();
      const onclick = button.getAttribute('onclick') || '';

      if (text === '我的設定' || onclick.includes('showSettingsScreen')) {
        button.textContent = '我的角色';
        button.setAttribute('onclick', 'window.showCharacterScreen ? window.showCharacterScreen() : showSettingsScreen()');
      }
    });
  }

  function run() {
    patchMissionCharacterButton();
    setTimeout(patchMissionCharacterButton, 300);
    setTimeout(patchMissionCharacterButton, 900);
  }

  document.addEventListener('click', function () {
    setTimeout(patchMissionCharacterButton, 80);
    setTimeout(patchMissionCharacterButton, 250);
  }, true);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }

  window.addEventListener('load', function () {
    run();
    setTimeout(run, 1200);
  });
})();
