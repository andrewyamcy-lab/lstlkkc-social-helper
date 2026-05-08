// /mission-answer-click-fix.js
// Safe cleanup helper.
// The old answer-click repair was removed because it interfered with the original answer logic.
// This file only cleans stale UI elements when leaving the question page.
// Important: it must NOT remove #virtueChangeBox during the question page,
// otherwise the ability-change message flashes and disappears too quickly.

(function () {
  let installed = false;
  let scheduled = false;

  function removeNode(selector) {
    document.querySelectorAll(selector).forEach(function (node) {
      if (node && node.parentNode) node.parentNode.removeChild(node);
    });
  }

  function cleanMissionUiState() {
    const screen = document.getElementById('gameScreen');
    if (!screen) return;

    const isIntroMode = screen.classList.contains('active') && screen.classList.contains('mission-intro-mode');
    const isFinishMode = screen.classList.contains('active') && screen.classList.contains('mission-finish-mode');

    if (isIntroMode) {
      removeNode('#gameScenarioImageBox');
      removeNode('#missionQuestionText');
      removeNode('#virtueChangeBox');
      return;
    }

    if (isFinishMode) {
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
