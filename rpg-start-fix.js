// /rpg-start-fix.js
// Fix: when starting a mission from the RPG map, hide the map and show only the game page.

(function () {
  function hideRpgMapAndShowGame() {
    document.querySelectorAll('.screen').forEach(function (screen) {
      screen.classList.toggle('active', screen.id === 'gameScreen');
    });

    const rpgMap = document.getElementById('rpgMapScreen');
    if (rpgMap) rpgMap.classList.remove('active');

    const preview = document.getElementById('rpgMissionPreview');
    if (preview) preview.className = 'rpg-floating-preview hidden';

    document.querySelectorAll('.rpg-map-marker').forEach(function (marker) {
      marker.classList.remove('is-selected');
    });

    try {
      if (typeof appState !== 'undefined' && appState) appState.currentScreen = 'game';
    } catch (error) {}

    window.scrollTo({
      top: 0,
      behavior: document.body.classList.contains('reduced-motion') ? 'auto' : 'smooth'
    });
  }

  function patchStartRpgMission() {
    if (typeof window.startRpgMission !== 'function') return false;
    if (window.startRpgMission.__hideMapPatched) return true;

    const originalStartRpgMission = window.startRpgMission;

    window.startRpgMission = function (key) {
      hideRpgMapAndShowGame();
      const result = originalStartRpgMission.apply(this, arguments);
      setTimeout(hideRpgMapAndShowGame, 0);
      setTimeout(hideRpgMapAndShowGame, 80);
      return result;
    };

    window.startRpgMission.__hideMapPatched = true;
    return true;
  }

  function initRpgStartFix() {
    if (patchStartRpgMission()) return;
    setTimeout(patchStartRpgMission, 150);
    setTimeout(patchStartRpgMission, 450);
    setTimeout(patchStartRpgMission, 900);
    setTimeout(patchStartRpgMission, 1500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRpgStartFix);
  } else {
    initRpgStartFix();
  }

  window.addEventListener('load', initRpgStartFix);
})();
