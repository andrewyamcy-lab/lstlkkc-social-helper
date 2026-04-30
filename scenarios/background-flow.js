// /scenarios/background-flow.js
// Standalone stable flow:
// choose scenario → read background only → click start → answer questions.
// This file no longer calls the old wrapped startAsdGame after the background screen.

(function () {
  let activeScenarioKey = '';
  let activeGame = null;
  let activeSteps = [];
  let activeQuestionIndex = 0;
  let activeScore = 0;
  let answeredCurrentQuestion = false;

  window.__backgroundFlowInstalled = true;

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function cloneOption(option) {
    return {
      text: option && option.text ? option.text : '',
      score: Number(option && option.score) || 0,
      note: option && option.note ? option.note : ''
    };
  }

  function cloneStep(step) {
    return {
      prompt: step && step.prompt ? step.prompt : '',
      options: Array.isArray(step && step.options) ? step.options.map(cloneOption) : []
    };
  }

  function shuffleArray(array) {
    const copy = array.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = copy[i];
      copy[i] = copy[j];
      copy[j] = temp;
    }
    return copy;
  }

  function prepareSteps(game) {
    if (!game || !Array.isArray(game.steps)) return [];

    return game.steps.map(function (step) {
      const cloned = cloneStep(step);
      cloned.options = shuffleArray(cloned.options);
      return cloned;
    });
  }

  function showScreen(screenId, stateName) {
    const screenIds = ['coverScreen', 'badgeScreen', 'settingsScreen', 'phraseLibraryScreen', 'situationScreen', 'gameScreen'];
    screenIds.forEach(function (id) {
      const screen = document.getElementById(id);
      if (screen) screen.classList.toggle('active', id === screenId);
    });

    try {
      if (typeof appState !== 'undefined' && appState) appState.currentScreen = stateName;
    } catch (error) {}

    window.scrollTo({ top: 0, behavior: document.body.classList.contains('reduced-motion') ? 'auto' : 'smooth' });
  }

  function clearSupportBoxes() {
    ['hintBox', 'calmBox', 'reviewBoxInline', 'backgroundReviewBox'].forEach(function (id) {
      const box = document.getElementById(id);
      if (box) {
        box.classList.add('hidden');
        box.innerHTML = '';
      }
    });
  }

  function updateQuestionPills(mode) {
    document.querySelectorAll('.question-pill').forEach(function (pill, index) {
      pill.classList.remove('active', 'done');
      if (mode === 'question') {
        if (index < activeQuestionIndex) pill.classList.add('done');
        if (index === activeQuestionIndex) pill.classList.add('active');
      }
      if (mode === 'done') {
        pill.classList.add('done');
      }
    });
  }

  function setTrackerBackground() {
    const badge = document.getElementById('questionBadgeBig');
    const title = document.getElementById('questionTrackerTitle');
    const tracker = document.getElementById('questionTracker');
    const progress = document.getElementById('asdProgressText');
    const bar = document.getElementById('asdProgressBar');

    if (badge) badge.textContent = '背景故事';
    if (title) title.textContent = '請先閱讀情境背景，然後才開始答題';
    if (tracker) tracker.classList.add('is-waiting');
    if (progress) progress.textContent = '請先閱讀背景故事。';
    if (bar) bar.style.width = '0%';
    updateQuestionPills('background');
  }

  function setTrackerQuestion() {
    const badge = document.getElementById('questionBadgeBig');
    const title = document.getElementById('questionTrackerTitle');
    const tracker = document.getElementById('questionTracker');
    const progress = document.getElementById('asdProgressText');
    const bar = document.getElementById('asdProgressBar');
    const total = activeSteps.length || 5;
    const current = Math.min(activeQuestionIndex + 1, total);

    if (badge) badge.textContent = '第 ' + current + ' / ' + total + ' 題';
    if (title) title.textContent = '請閱讀題目，然後選擇最合適的回應';
    if (tracker) tracker.classList.remove('is-waiting');
    if (progress) progress.textContent = '正在完成「' + (activeGame && activeGame.title ? activeGame.title : '情境練習') + '」：第 ' + current + ' / ' + total + ' 題';
    if (bar) bar.style.width = Math.round(((activeQuestionIndex) / total) * 100) + '%';
    updateQuestionPills('question');
  }

  function setTrackerDone() {
    const badge = document.getElementById('questionBadgeBig');
    const title = document.getElementById('questionTrackerTitle');
    const progress = document.getElementById('asdProgressText');
    const bar = document.getElementById('asdProgressBar');

    if (badge) badge.textContent = '完成';
    if (title) title.textContent = '你已完成這個情境';
    if (progress) progress.textContent = '已完成「' + (activeGame && activeGame.title ? activeGame.title : '情境練習') + '」。';
    if (bar) bar.style.width = '100%';
    updateQuestionPills('done');
  }

  function buildImageHtml(key) {
    const srcMap = {
      start: 'images/start-conversation.jpg',
      refuse: 'images/polite-refusal.jpg',
      conflict: 'images/stationery-conflict.jpg',
      respond: 'images/respond-friend.jpg',
      groupwork: 'images/groupwork.jpg',
      help: 'images/ask-teacher-help.jpg',
      lunch: 'images/lunch-join.jpg',
      homework: 'images/homework-check.jpg',
      teasing: 'images/teasing.jpg',
      bumped: 'images/bumped.jpg',
      disagree: 'images/disagree.jpg',
      teacherReminder: 'images/teacher-reminder.jpg',
      queueJump: 'images/queue-jump.jpg',
      peGrouping: 'images/pe-grouping.jpg',
      whatsappIgnored: 'images/whatsapp-ignored.jpg',
      academicOnly: 'images/academic-only.jpg',
      lostItem: 'images/lost-item.jpg',
      copyHomework: 'images/copy-homework.jpg',
      quietSpace: 'images/quiet-space.jpg',
      losingGame: 'images/losing-game.jpg'
    };

    const src = srcMap[key];
    if (!src) return '';
    return '<div class="game-scenario-image-wrap"><img src="' + escapeHtml(src) + '?v=20260430-final" alt="情境圖" loading="lazy" onerror="this.parentElement.classList.add(\'hidden\')"></div>';
  }

  function showBackgroundFirst(key) {
    const game = typeof asdGames !== 'undefined' ? asdGames[key] : null;
    if (!game || !game.intro || !Array.isArray(game.steps)) return false;

    activeScenarioKey = key;
    activeGame = game;
    activeSteps = prepareSteps(game);
    activeQuestionIndex = 0;
    activeScore = 0;
    answeredCurrentQuestion = false;

    showScreen('gameScreen', 'game');
    clearSupportBoxes();
    setTrackerBackground();

    const box = document.getElementById('asdBox');
    const choices = document.getElementById('asdChoices');
    const sceneMeta = document.getElementById('sceneMeta');

    if (box) {
      box.innerHTML =
        '<div class="scene-badge">' + escapeHtml(game.title || '情境背景') + '</div>' +
        buildImageHtml(key) +
        '<h3 style="margin-bottom:10px;">請先閱讀背景故事</h3>' +
        '<p style="font-size:1.04rem; line-height:1.9; margin-bottom:0;">' + escapeHtml(game.intro) + '</p>';
    }

    if (sceneMeta) {
      sceneMeta.classList.remove('hidden');
      sceneMeta.innerHTML =
        '<div class="meta-box"><strong>地點：</strong><br>' + escapeHtml(game.location || '') + '</div>' +
        '<div class="meta-box"><strong>目標：</strong><br>' + escapeHtml(game.socialGoal || game.mission || '') + '</div>' +
        '<div class="meta-box"><strong>小提醒：</strong><br>' + escapeHtml(game.supportTip || '') + '</div>';
    }

    if (choices) {
      choices.innerHTML = '<button type="button" class="choice-button start-question-button" id="startQuestionAfterBackgroundBtn">我已閱讀背景，開始答題</button>';
      const button = document.getElementById('startQuestionAfterBackgroundBtn');
      if (button) {
        button.addEventListener('click', function () {
          renderQuestion(0);
        });
      }
    }

    return true;
  }

  function renderQuestion(index) {
    if (!activeGame || !activeSteps[index]) return;

    activeQuestionIndex = index;
    answeredCurrentQuestion = false;
    clearSupportBoxes();
    setTrackerQuestion();

    const step = activeSteps[index];
    const box = document.getElementById('asdBox');
    const choices = document.getElementById('asdChoices');
    const sceneMeta = document.getElementById('sceneMeta');

    if (sceneMeta) sceneMeta.classList.add('hidden');

    if (box) {
      box.innerHTML =
        '<div class="scene-badge">' + escapeHtml(activeGame.title || '情境練習') + '</div>' +
        '<h3 style="font-size:1.2rem; line-height:1.7; margin:0;">' + escapeHtml(step.prompt) + '</h3>';
    }

    if (choices) {
      choices.innerHTML = '';
      step.options.forEach(function (option, optionIndex) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'choice-button';
        button.textContent = option.text;
        button.addEventListener('click', function () {
          chooseOption(optionIndex);
        });
        choices.appendChild(button);
      });
    }
  }

  function chooseOption(optionIndex) {
    if (answeredCurrentQuestion) return;
    const step = activeSteps[activeQuestionIndex];
    if (!step || !step.options[optionIndex]) return;

    answeredCurrentQuestion = true;
    const option = step.options[optionIndex];
    activeScore += option.score;

    const choices = document.getElementById('asdChoices');
    if (!choices) return;

    const isGood = option.score >= 2;
    const isOkay = option.score === 1;
    const resultClass = isGood ? 'result-good' : 'result-improve';
    const resultTitle = isGood ? '做得好！' : (isOkay ? '可以更好' : '下次可以試另一個方法');

    Array.from(choices.querySelectorAll('button')).forEach(function (button) {
      button.disabled = true;
    });

    const feedback = document.createElement('div');
    feedback.className = resultClass;
    feedback.innerHTML = '<strong>' + escapeHtml(resultTitle) + '</strong><br>' + escapeHtml(option.note || '多想一想對方感受和合適界線。');
    choices.appendChild(feedback);

    const nextButton = document.createElement('button');
    nextButton.type = 'button';
    nextButton.className = 'choice-button start-question-button';
    nextButton.textContent = activeQuestionIndex >= activeSteps.length - 1 ? '查看完成結果' : '下一題';
    nextButton.addEventListener('click', function () {
      if (activeQuestionIndex >= activeSteps.length - 1) {
        renderFinish();
      } else {
        renderQuestion(activeQuestionIndex + 1);
      }
    });
    choices.appendChild(nextButton);
  }

  function renderFinish() {
    setTrackerDone();
    clearSupportBoxes();

    const maxScore = activeSteps.length * 2;
    const percent = maxScore ? Math.round((activeScore / maxScore) * 100) : 0;
    const box = document.getElementById('asdBox');
    const choices = document.getElementById('asdChoices');

    try {
      if (typeof badgeState !== 'undefined' && activeScenarioKey in badgeState) badgeState[activeScenarioKey] = true;
      if (typeof appState !== 'undefined' && appState) appState.completedCount = Object.keys(badgeState).filter(function (key) { return badgeState[key]; }).length;
      if (typeof renderBadges === 'function') renderBadges();
      if (typeof saveProgress === 'function') saveProgress();
      if (typeof syncScenarioTotal === 'function') syncScenarioTotal();
    } catch (error) {}

    if (box) {
      box.innerHTML =
        '<div class="scene-badge">完成情境</div>' +
        '<h3>你完成了「' + escapeHtml(activeGame && activeGame.title ? activeGame.title : '情境練習') + '」</h3>' +
        '<div class="summary-box">今次得分：<strong>' + activeScore + ' / ' + maxScore + '</strong><br>完成度：約 <strong>' + percent + '%</strong><br><br>記住：社交練習不是為了每次完美，而是慢慢學會更清楚、更平靜地表達自己。</div>';
    }

    if (choices) {
      choices.innerHTML =
        '<button type="button" class="choice-button" onclick="showSituationScreen()">選擇其他情境</button>' +
        '<button type="button" class="choice-button secondary" onclick="showPhraseLibraryScreen()">前往社交句式庫</button>';
    }
  }

  function showHintStandalone() {
    if (!activeGame) return;
    const box = document.getElementById('hintBox');
    if (!box) return;
    box.classList.remove('hidden');
    box.innerHTML = '<strong>提示：</strong>' + escapeHtml(activeGame.hint || activeGame.supportTip || '先停一停，想想對方感受和自己的界線。');
  }

  function showCalmStandalone() {
    if (!activeGame) return;
    const box = document.getElementById('calmBox');
    if (!box) return;
    box.classList.remove('hidden');
    box.innerHTML = '<strong>冷靜一下：</strong>' + escapeHtml(activeGame.calmPrompt || '先深呼吸，再用一句簡單句子表達。');
  }

  function patchStartGameForBackground() {
    window.startAsdGame = function (key) {
      if (showBackgroundFirst(key)) return;
      console.warn('找不到情境：', key);
    };
    window.startAsdGame.__backgroundStandalone = true;

    window.startQuestionAfterBackground = function () {
      renderQuestion(0);
    };

    window.showHint = showHintStandalone;
    window.showCalmMode = showCalmStandalone;
  }

  function initBackgroundFlow() {
    patchStartGameForBackground();
  }

  window.showBackgroundFirst = showBackgroundFirst;
  window.initBackgroundFlow = initBackgroundFlow;
  window.renderQuestionAfterBackground = renderQuestion;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBackgroundFlow);
  } else {
    initBackgroundFlow();
  }

  setTimeout(initBackgroundFlow, 100);
  setTimeout(initBackgroundFlow, 500);
})();
