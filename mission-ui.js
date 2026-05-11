// /mission-ui.js
// Mission UI loader.
// This file replaces the 9 mission-related <script> tags in index.html.
// It loads the mission UI scripts in the same order as before, so behaviour stays the same.
// Keep the original files in the repo until all testing is complete.

(function () {
  const VERSION = '20260511-1';

  const missionScripts = [
    'mission-completion-fix.js',
    'mission-status-panel-fix.js',
    'mission-page-compact-layout.js',
    'mission-page-align-fix.js',
    'mission-character-button-fix.js',
    'mission-question-layout.js',
    'mission-question-final-fix.js',
    'mission-ui-cleanup.js',
    'mission-result-review-fix.js'
  ];

  function loadScriptSequentially(index) {
    if (index >= missionScripts.length) {
      window.dispatchEvent(new CustomEvent('missionUiLoaded', {
        detail: { files: missionScripts.slice() }
      }));
      return;
    }

    const src = missionScripts[index] + '?v=' + VERSION;
    const script = document.createElement('script');
    script.src = src;
    script.async = false;

    script.onload = function () {
      loadScriptSequentially(index + 1);
    };

    script.onerror = function () {
      console.error('Failed to load mission UI file:', src);
      loadScriptSequentially(index + 1);
    };

    document.body.appendChild(script);
  }

  if (window.__missionUiLoaderStarted) return;
  window.__missionUiLoaderStarted = true;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      loadScriptSequentially(0);
    });
  } else {
    loadScriptSequentially(0);
  }
})();
