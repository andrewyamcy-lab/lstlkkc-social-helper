// /extra-scenarios-loader.js
// Loader only: loads the modular scenario system from /scenarios.
// This replaces the old extra-scenarios.js in index.html.

(function () {
  const MODULES = [
    { src: 'scenarios/scenario-data.js', flag: '__scenarioDataLoaderAdded' },
    { src: 'scenarios/scenario-register.js', flag: '__scenarioRegisterLoaderAdded' },
    { src: 'scenarios/scenario-visuals.js', flag: '__scenarioVisualsLoaderAdded' },
    { src: 'scenarios/background-flow.js', flag: '__backgroundFlowLoaderAdded' },
    { src: 'social-performance-fix.js', flag: '__socialPerformanceFixLoaderAdded' }
  ];

  function loadScriptOnce(src, flagName) {
    return new Promise((resolve) => {
      if (window[flagName]) {
        resolve();
        return;
      }

      window[flagName] = true;
      const script = document.createElement('script');
      script.src = src;
      script.defer = true;
      script.onload = resolve;
      script.onerror = function () {
        console.warn('未能載入模組：', src);
        resolve();
      };
      document.head.appendChild(script);
    });
  }

  async function loadScenarioModules() {
    for (const item of MODULES) {
      await loadScriptOnce(item.src, item.flag);
    }

    if (typeof refreshExtraScenarioUI === 'function') refreshExtraScenarioUI();
    if (typeof applyScenarioVisuals === 'function') applyScenarioVisuals();
    if (typeof injectImageIntoBackgroundPage === 'function') injectImageIntoBackgroundPage();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadScenarioModules);
  } else {
    loadScenarioModules();
  }
})();
