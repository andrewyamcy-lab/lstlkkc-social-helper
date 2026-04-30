// /scenarios/background-flow.js
// 管理「先讀背景 → 開始答題」流程。
// Stable version: background-flow owns the start wrapper and calls the real game only after the student clicks start.

(function () {
  let originalStartAsdGame = null;
  let activeScenarioKey = null;
  let isCleaningQuestionBox = false;
  let bypassBackgroundOnce = false;

  window.__backgroundFlowInstalled = true;

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function showScreen(screenId, stateName) {
    if (typeof setActiveScreen === 'function') {
      setActiveScreen(screenId, stateName);
      return;
    }

    ['coverScreen', 'badgeScreen', 'settingsScreen', 'phraseLibraryScreen', 'situationScreen', 'gameScreen'].forEach((id) => {
      const screen = document.getElementById(id);
      if (screen) screen.classList.toggle('active', id === screenId);
    });

    if (typeof appState !== 'undefined' && appState) appState.currentScreen = stateName;
  }

  function clearSupportBoxes() {
    ['hintBox', 'calmBox', 'reviewBoxInline', 'backgroundReviewBox'].forEach((id) => {
      const box = document.getElementById(id);
      if (box) {
        box.classList.add('hidden');
        box.innerHTML = '';
      }
    });
  }

  function updateTrackerForBackground() {
    const badge = document.getElementById('questionBadgeBig');
    const title = document.getElementById('questionTrackerTitle');
    const tracker = document.getElementById('questionTracker');

    if (badge) badge.textContent = '背景故事';
    if (title) title.textContent = '請先閱讀情境背景，然後才開始答題';
    if (tracker) tracker.classList.add('is-waiting');

    document.querySelectorAll('.question-pill').forEach((pill) => {
      pill.classList.remove('active', 'done');
    });
  }

  function buildImageHtml(game) {
    if (typeof buildScenarioImageHtml === 'function') return buildScenarioImageHtml(game);
    return '';
  }

  function showBackgroundFirst(key) {
    const game = typeof asdGames !== 'undefined' ? asdGames[key] : null;
    if (!game || !game.intro || !Array.isArray(game.steps)) return false;

    activeScenarioKey = key;
    showScreen('gameScreen', 'game');
    clearSupportBoxes();
    updateTrackerForBackground();

    const box = document.getElementById('asdBox');
    const choices = document.getElementById('asdChoices');
    const sceneMeta = document.getElementById('sceneMeta');

    if (box) {
      box.innerHTML = `
        <div class="scene-badge">${escapeHtml(game.title || '情境背景')}</div>
        ${buildImageHtml(game)}
        <h3 style="margin-bottom:10px;">請先閱讀背景故事</h3>
        <p style="font-size:1.04rem; line-height:1.9; margin-bottom:0;">${escapeHtml(game.intro)}</p>
      `;
    }

    if (sceneMeta) {
      sceneMeta.classList.remove('hidden');
      sceneMeta.innerHTML = `
        <div class="meta-box"><strong>地點：</strong><br>${escapeHtml(game.location || '')}</div>
        <div class="meta-box"><strong>目標：</strong><br>${escapeHtml(game.socialGoal || game.mission || '')}</div>
        <div class="meta-box"><strong>小提醒：</strong><br>${escapeHtml(game.supportTip || '')}</div>
      `;
    }

    if (choices) {
      choices.innerHTML = `
        <button class="choice-button start-question-button" onclick="window.startQuestionAfterBackground('${escapeHtml(key)}')">
          我已閱讀背景，開始答題
        </button>
      `;
    }

    return true;
  }

  function startRealQuestionFlow(key) {
    if (typeof originalStartAsdGame !== 'function') return;

    activeScenarioKey = key;
    bypassBackgroundOnce = true;

    // Randomize here directly, instead of relying on another wrapper around startAsdGame.
    if (typeof window.randomizeGameAnswers === 'function') {
      window.randomizeGameAnswers(key);
    }

    try {
      originalStartAsdGame(key);
    } finally {
      bypassBackgroundOnce = false;
    }

    const tracker = document.getElementById('questionTracker');
    if (tracker) tracker.classList.remove('is-waiting');

    setTimeout(stripBackgroundFromCurrentQuestion, 0);
    setTimeout(stripBackgroundFromCurrentQuestion, 80);
    setTimeout(stripBackgroundFromCurrentQuestion, 180);
    setTimeout(stripBackgroundFromCurrentQuestion, 350);
  }

  window.startQuestionAfterBackground = function (key) {
    startRealQuestionFlow(key);
  };

  function getCurrentQuestionIndex(game) {
    const badge = document.getElementById('questionBadgeBig');
    const text = badge ? badge.textContent : '';
    const match = text.match(/第\s*(\d+)/);
    if (match) return Math.max(0, Number(match[1]) - 1);

    const box = document.getElementById('asdBox');
    const boxText = box ? box.textContent : '';
    return game.steps.findIndex((step) => boxText.includes(step.prompt));
  }

  function stripBackgroundFromCurrentQuestion() {
    if (isCleaningQuestionBox || !activeScenarioKey || typeof asdGames === 'undefined') return;

    const game = asdGames[activeScenarioKey];
    const box = document.getElementById('asdBox');
    if (!game || !box || !Array.isArray(game.steps)) return;

    const boxText = box.textContent || '';
    const index = getCurrentQuestionIndex(game);
    if (index < 0 || !game.steps[index]) return;

    const prompt = game.steps[index].prompt;
    const hasBackground = game.intro && boxText.includes(game.intro.slice(0, 14));
    const hasPrompt = boxText.includes(prompt);
    const looksLikeQuestionPage = hasPrompt && boxText.includes('第') && boxText.includes('題');

    const tracker = document.getElementById('questionTracker');
    if (tracker) tracker.classList.remove('is-waiting');

    if (!hasBackground || !looksLikeQuestionPage) return;

    isCleaningQuestionBox = true;
    box.innerHTML = `
      <div class="scene-badge">${escapeHtml(game.title || '情境練習')}</div>
      <h3 style="font-size:1.2rem; line-height:1.7; margin:0;">${escapeHtml(prompt)}</h3>
    `;
    isCleaningQuestionBox = false;
  }

  function installQuestionCleaner() {
    const box = document.getElementById('asdBox');
    if (!box || box.__backgroundCleanerInstalled) return;

    const observer = new MutationObserver(() => {
      setTimeout(stripBackgroundFromCurrentQuestion, 0);
    });

    observer.observe(box, { childList: true, subtree: true, characterData: true });
    box.__backgroundCleanerInstalled = true;
  }

  function patchStartGameForBackground() {
    if (typeof window.startAsdGame !== 'function') return;
    if (window.startAsdGame.__backgroundFirstPatched || window.startAsdGame.__modularBackgroundPatched) return;

    originalStartAsdGame = window.startAsdGame;

    const patched = function (key) {
      if (bypassBackgroundOnce) {
        return originalStartAsdGame.apply(this, arguments);
      }

      if (typeof refreshExtraScenarioUI === 'function') refreshExtraScenarioUI();
      if (typeof applyScenarioVisuals === 'function') applyScenarioVisuals();
      if (showBackgroundFirst(key)) return;
      return originalStartAsdGame.apply(this, arguments);
    };

    patched.__backgroundFirstPatched = true;
    patched.__modularBackgroundPatched = true;
    window.startAsdGame = patched;
  }

  function initBackgroundFlow() {
    window.__backgroundFlowInstalled = true;
    installQuestionCleaner();
    patchStartGameForBackground();
    setTimeout(() => {
      installQuestionCleaner();
      patchStartGameForBackground();
    }, 100);
  }

  window.showBackgroundFirst = showBackgroundFirst;
  window.stripBackgroundFromCurrentQuestion = stripBackgroundFromCurrentQuestion;
  window.initBackgroundFlow = initBackgroundFlow;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBackgroundFlow);
  } else {
    initBackgroundFlow();
  }
})();
