// /scenario-total-sync.js
// Reliable scenario total sync for the single-page app.
// Counts real available scenario cards after extra scenarios, cleanup, images, and filters have finished.
// No MutationObserver. No interval.

(function () {
  function getScenarioKeyFromButton(button) {
    if (!button) return '';
    const onclickText = button.getAttribute('onclick') || '';
    const match = onclickText.match(/startAsdGame\(['"]([^'"]+)['"]\)/);
    return match && match[1] ? match[1] : '';
  }

  function getAvailableScenarioKeys() {
    const keys = new Set();

    document.querySelectorAll('.scenario-card').forEach(function (card) {
      if (!card || card.offsetParent === null && card.classList.contains('filtered-out')) {
        // Skip only actively filtered cards when counting visible filter result elsewhere.
        // For total scenario count, filtered cards should still count, so do not return here.
      }

      const button = card.querySelector('button[onclick*="startAsdGame"]');
      const key = getScenarioKeyFromButton(button);
      if (!key) return;

      // Removed scenarios should not count even if old cached cards are still present briefly.
      const removed = ['lunchSeat', 'borrowedNoReturn', 'groupRole', 'jokeConfusion'];
      if (removed.includes(key)) return;

      keys.add(key);
    });

    return Array.from(keys);
  }

  function getCompletedCount() {
    let completed = 0;

    try {
      if (typeof badgeState !== 'undefined' && badgeState) {
        Object.keys(badgeState).forEach(function (key) {
          if (badgeState[key]) completed += 1;
        });
      }
    } catch (error) {}

    const total = getAvailableScenarioKeys().length;
    if (completed > total) completed = total;
    return completed;
  }

  function syncScenarioTotal() {
    const total = getAvailableScenarioKeys().length;
    const status = document.getElementById('gameStatusText');
    if (!status || !total) return;

    const completed = getCompletedCount();
    const text = status.textContent || '';

    let hintCount = '0';
    let calmCount = '0';

    const hintMatch = text.match(/使用提示：\s*(\d+)\s*次/);
    const calmMatch = text.match(/使用冷靜模式：\s*(\d+)\s*次/);
    if (hintMatch && hintMatch[1]) hintCount = hintMatch[1];
    if (calmMatch && calmMatch[1]) calmCount = calmMatch[1];

    status.textContent = '已完成情境：' + completed + ' / ' + total + '｜使用提示：' + hintCount + ' 次｜使用冷靜模式：' + calmCount + ' 次';
  }

  function initScenarioTotalSync() {
    syncScenarioTotal();
  }

  window.syncScenarioTotal = syncScenarioTotal;
  window.initScenarioTotalSync = initScenarioTotalSync;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScenarioTotalSync);
  } else {
    initScenarioTotalSync();
  }

  // Delayed one-off passes because scenario scripts add/remove cards shortly after page load.
  setTimeout(syncScenarioTotal, 150);
  setTimeout(syncScenarioTotal, 450);
  setTimeout(syncScenarioTotal, 1000);
  setTimeout(syncScenarioTotal, 1800);
  setTimeout(syncScenarioTotal, 3200);
})();
