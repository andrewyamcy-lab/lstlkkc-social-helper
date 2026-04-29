// /scenario-cleanup.js
// Removes scenarios that overlap too much with stronger existing scenarios.
// Kept scenarios:
// - 午飯時間：加入同學 (kept)
// - 借文具：處理衝突 (kept)
// Removed scenarios:
// - 午飯座位：想加入但怕尷尬 (too similar to 午飯時間：加入同學)
// - 借物品未還：清楚提醒 (too similar to 借文具：處理衝突)
// - 小組分工：不清楚自己做甚麼 (too similar to 小組：加入合作)

(function () {
  const REMOVED_SCENARIO_KEYS = ['lunchSeat', 'borrowedNoReturn', 'groupRole'];

  function removeFromObject(objectName, key) {
    try {
      if (typeof window[objectName] !== 'undefined' && window[objectName] && key in window[objectName]) {
        delete window[objectName][key];
      }
    } catch (error) {}
  }

  function removeScenarioCard(key) {
    const card = document.getElementById('scenarioCard-' + key);
    if (card) card.remove();
  }

  function getScenarioTotal() {
    try {
      if (typeof asdGames !== 'undefined' && asdGames) {
        return Object.keys(asdGames).filter(function (key) {
          return asdGames[key] && Array.isArray(asdGames[key].steps);
        }).length;
      }
    } catch (error) {}

    const buttons = document.querySelectorAll('button[onclick*="startAsdGame"]');
    const keys = new Set();
    buttons.forEach(function (button) {
      const onclickText = button.getAttribute('onclick') || '';
      const match = onclickText.match(/startAsdGame\(['"]([^'"]+)['"]\)/);
      if (match && match[1]) keys.add(match[1]);
    });
    return keys.size;
  }

  function updateTotalText() {
    const total = getScenarioTotal();
    const status = document.getElementById('gameStatusText');
    if (!status || !total) return;

    status.textContent = status.textContent.replace(/已完成情境：\s*(\d+)\s*\/\s*\d+/, '已完成情境：$1 / ' + total);
  }

  function removeOverlappingScenarios() {
    REMOVED_SCENARIO_KEYS.forEach(function (key) {
      removeFromObject('asdGames', key);
      removeFromObject('badgeMeta', key);
      removeFromObject('badgeState', key);
      removeFromObject('extraSituations', key);
      removeScenarioCard(key);
    });

    updateTotalText();

    if (typeof renderBadges === 'function') {
      renderBadges();
    }

    if (typeof initScenarioImagesLight === 'function') {
      initScenarioImagesLight();
    }
  }

  window.removeOverlappingScenarios = removeOverlappingScenarios;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', removeOverlappingScenarios);
  } else {
    removeOverlappingScenarios();
  }

  setTimeout(removeOverlappingScenarios, 300);
  setTimeout(removeOverlappingScenarios, 1000);
})();
