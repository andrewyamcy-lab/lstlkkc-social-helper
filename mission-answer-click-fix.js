// /mission-answer-click-fix.js
// Safe cleanup helper.
// The old answer-click repair was removed because it interfered with the original answer logic.
// This file now only cleans stale UI elements left by the question layout when returning to the preview page.

(function () {
  let installed = false;
  let scheduled = false;

  function removeNode(selector) {
    document.querySelectorAll(selector).forEach(function (node) {
      if (node && node.parentNode) node.parentNode.removeChild(node);
    });
  }

  function isIntroMode() {
    const screen = document.getElementById('gameScreen');
    return !!screen && screen.classList.contains('active') && screen.classList.contains('mission-intro-mode');
  }

  function isQuestionMode() {
    const screen = document.getElementById('gameScreen');
    return !!screen && screen.classList.contains('active') && screen.classList.contains('mission-question-mode');
  }

  function cleanMissionUiState() {
    const screen = document.getElementById('gameScreen');
    if (!screen) return;

    if (isIntroMode()) {
      removeNode('#gameScenarioImageBox');
      removeNode('#missionQuestionText');
      removeNode('#virtueChangeBox');
      return;
    }

    if (isQuestionMode()) {
      const choices = document.getElementById('asdChoices');
      const oldVirtue = document.getElementById('virtueChangeBox');
      if (oldVirtue && choices && choices.querySelector('button:not([disabled])')) {
        oldVirtue.remove();
      }
    }

    if (screen.classList.contains('mission-finish-mode')) {
      removeNode('#gameScenarioImageBox');
      removeNode('#missionQuestionText');
    }
  }

  function scheduleClean() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(function () {
      scheduled = false;
      cleanMissionUiState();
    });
  }

  function install() {
    if (installed) return;
    installed = true;

    cleanMissionUiState();

    const screen = document.getElementById('gameScreen');
    if (screen) {
      const observer = new MutationObserver(scheduleClean);
      observer.observe(screen, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class']
      });
    }

    document.addEventListener('click', function () {
      setTimeout(scheduleClean, 0);
      setTimeout(scheduleClean, 280);
    }, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install);
  } else {
    install();
  }

  window.addEventListener('load', function () {
    install();
    setTimeout(scheduleClean, 500);
  });
})();
