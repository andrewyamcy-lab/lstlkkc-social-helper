// /social-performance-fix.js
// Performance hotfix: stops the social upgrade layer from doing heavy DOM work every second.
// This file is intentionally small and safe. It does not remove any features.

(function () {
  let lastUpgradeRun = 0;
  let lastScenarioRefresh = 0;
  let originalInit = null;
  let originalRefresh = null;
  let patchTries = 0;

  function now() {
    return Date.now();
  }

  function patchPerformance() {
    patchTries += 1;

    if (typeof window.initSocialUpgrades === 'function' && !window.initSocialUpgrades.__performancePatched) {
      originalInit = window.initSocialUpgrades;

      window.initSocialUpgrades = function () {
        const time = now();
        const activeScreen = document.querySelector('.screen.active');
        const activeId = activeScreen ? activeScreen.id : '';

        // Allow immediate setup on first run, then throttle repeated calls.
        // The old index watcher calls this every second; rebuilding UI that often causes lag.
        if (lastUpgradeRun && time - lastUpgradeRun < 5000) {
          return;
        }

        lastUpgradeRun = time;

        // When students are answering questions, avoid unnecessary full UI rebuilding.
        if (activeId === 'gameScreen') {
          try {
            const choices = document.getElementById('asdChoices');
            const hasChoices = choices && choices.children.length > 0;
            if (hasChoices && time - lastUpgradeRun < 8000) return;
          } catch (error) {}
        }

        return originalInit.apply(this, arguments);
      };

      window.initSocialUpgrades.__performancePatched = true;
    }

    if (typeof window.refreshExtraScenarioUI === 'function' && !window.refreshExtraScenarioUI.__performancePatched) {
      originalRefresh = window.refreshExtraScenarioUI;

      window.refreshExtraScenarioUI = function () {
        const time = now();

        // This function can be triggered by mutation observers many times.
        // Refreshing scenario cards every moment is unnecessary.
        if (lastScenarioRefresh && time - lastScenarioRefresh < 3000) {
          return;
        }

        lastScenarioRefresh = time;
        return originalRefresh.apply(this, arguments);
      };

      window.refreshExtraScenarioUI.__performancePatched = true;
    }

    if (patchTries < 20 && (!window.initSocialUpgrades || !window.refreshExtraScenarioUI)) {
      setTimeout(patchPerformance, 250);
    }
  }

  function removeDuplicateScenarioCards() {
    const seen = new Set();
    document.querySelectorAll('.scenario-card[id^="scenarioCard-"]').forEach((card) => {
      if (seen.has(card.id)) {
        card.remove();
      } else {
        seen.add(card.id);
      }
    });
  }

  function lightCleanupLoop() {
    removeDuplicateScenarioCards();
    setTimeout(lightCleanupLoop, 8000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', patchPerformance);
  } else {
    patchPerformance();
  }

  setTimeout(patchPerformance, 500);
  setTimeout(patchPerformance, 1200);
  setTimeout(lightCleanupLoop, 3000);
})();
