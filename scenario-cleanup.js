// /scenario-cleanup.js
// Removes scenarios that overlap too much with stronger existing scenarios.
// Kept scenarios:
// - 午飯時間：加入同學 (kept)
// - 借文具：處理衝突 (kept)
// - 小組：加入合作 (kept)
// Removed scenarios:
// - 午飯座位：想加入但怕尷尬 (too similar to 午飯時間：加入同學)
// - 借物品未還：清楚提醒 (too similar to 借文具：處理衝突)
// - 小組分工：不清楚自己做甚麼 (too similar to 小組：加入合作)
// - 分不清玩笑：先確認 (removed by request)

(function () {
  const REMOVED_SCENARIOS = [
    { key: 'lunchSeat', title: '午飯座位：想加入但怕尷尬' },
    { key: 'borrowedNoReturn', title: '借物品未還：清楚提醒' },
    { key: 'groupRole', title: '小組分工：不清楚自己做甚麼' },
    { key: 'jokeConfusion', title: '分不清玩笑：先確認' }
  ];

  function deleteKeyFromKnownObjects(key) {
    try { if (typeof asdGames !== 'undefined' && asdGames && key in asdGames) delete asdGames[key]; } catch (error) {}
    try { if (typeof badgeMeta !== 'undefined' && badgeMeta && key in badgeMeta) delete badgeMeta[key]; } catch (error) {}
    try { if (typeof badgeState !== 'undefined' && badgeState && key in badgeState) delete badgeState[key]; } catch (error) {}
    try { if (typeof extraSituations !== 'undefined' && extraSituations && key in extraSituations) delete extraSituations[key]; } catch (error) {}

    try { if (window.asdGames && key in window.asdGames) delete window.asdGames[key]; } catch (error) {}
    try { if (window.badgeMeta && key in window.badgeMeta) delete window.badgeMeta[key]; } catch (error) {}
    try { if (window.badgeState && key in window.badgeState) delete window.badgeState[key]; } catch (error) {}
    try { if (window.extraSituations && key in window.extraSituations) delete window.extraSituations[key]; } catch (error) {}
  }

  function removeScenarioCard(item) {
    const byId = document.getElementById('scenarioCard-' + item.key);
    if (byId) byId.remove();

    document.querySelectorAll('.scenario-card').forEach(function (card) {
      const text = card.textContent || '';
      const button = card.querySelector('button[onclick*="startAsdGame"]');
      const onclickText = button ? (button.getAttribute('onclick') || '') : '';

      if (text.includes(item.title) || onclickText.includes("'" + item.key + "'") || onclickText.includes('"' + item.key + '"')) {
        card.remove();
      }
    });
  }

  function removeScenarioImageMapping(key) {
    // scenarioImageMap is private inside scenario-images-light.js, so we cannot delete it directly here.
    // Removing the card and asdGames entry is enough to stop the scenario from being shown or started.
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
    REMOVED_SCENARIOS.forEach(function (item) {
      deleteKeyFromKnownObjects(item.key);
      removeScenarioCard(item);
      removeScenarioImageMapping(item.key);
    });

    updateTotalText();

    if (typeof renderBadges === 'function') {
      renderBadges();
    }
  }

  window.removeOverlappingScenarios = removeOverlappingScenarios;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', removeOverlappingScenarios);
  } else {
    removeOverlappingScenarios();
  }

  setTimeout(removeOverlappingScenarios, 100);
  setTimeout(removeOverlappingScenarios, 300);
  setTimeout(removeOverlappingScenarios, 800);
  setTimeout(removeOverlappingScenarios, 1600);
  setTimeout(removeOverlappingScenarios, 3000);
})();
