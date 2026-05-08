// /mission-result-review-fix.js
// Adds a clear final result panel after each mission:
// - star rating
// - score
// - per-question review: good / can improve / needs attention
// This file is intentionally loaded last so newer RPG UI scripts cannot hide the result review.

(function () {
  const SESSION_KEY = 'asd_school_mission_review_session_v1';
  const PROGRESS_KEY = 'asd_school_rpg_progress_v1';
  const TOTAL_QUESTIONS = 5;
  const THREE_STAR_SCORE = 8;

  let currentMissionKey = '';
  let currentScore = 0;
  let reviewItems = [];
  let answeredKeys = new Set();
  let renderScheduled = false;

  function esc(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function readJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function saveJson(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (error) {}
  }

  function getGames() {
    try {
      if (window.asdGames) return window.asdGames;
      // eslint-disable-next-line no-undef
      if (typeof asdGames !== 'undefined') return asdGames;
    } catch (error) {}
    return {};
  }

  function normalize(value) {
    return String(value || '').replace(/\s+/g, '').replace(/^[A-D][\.．、]?/i, '').trim();
  }

  function getQuestionNumber() {
    const badge = document.getElementById('questionBadgeBig');
    const badgeText = badge ? badge.textContent || '' : '';
    const fromBadge = badgeText.match(/第\s*(\d+)/);
    if (fromBadge) return Number(fromBadge[1]);

    const box = document.getElementById('asdBox');
    const boxText = box ? box.textContent || '' : '';
    const fromBox = boxText.match(/第\s*(\d+)\s*題/);
    if (fromBox) return Number(fromBox[1]);

    return reviewItems.length + 1;
  }

  function detectMission() {
    if (currentMissionKey) return currentMissionKey;

    const games = getGames();
    const text = [
      (document.getElementById('asdBox') || {}).textContent || '',
      (document.getElementById('questionTrackerTitle') || {}).textContent || '',
      (document.getElementById('asdProgressText') || {}).textContent || ''
    ].join(' ');

    return Object.keys(games).find(function (key) {
      const game = games[key] || {};
      return text.includes(game.title || '') || text.includes(game.intro || '') || text.includes(game.mission || '');
    }) || '';
  }

  function getStep(missionKey, q) {
    const games = getGames();
    const game = games[missionKey];
    return game && Array.isArray(game.steps) ? game.steps[q - 1] : null;
  }

  function findOption(step, buttonText) {
    if (!step || !Array.isArray(step.options)) return null;
    const cleanButton = normalize(buttonText);
    return step.options.find(function (option) {
      const cleanOption = normalize(option.text);
      return cleanButton.includes(cleanOption) || cleanOption.includes(cleanButton);
    }) || null;
  }

  function scoreToStars(score) {
    const value = Number(score || 0);
    if (value >= THREE_STAR_SCORE) return 3;
    if (value >= 5) return 2;
    if (value > 0) return 1;
    return 0;
  }

  function starHtml(stars) {
    let html = '<span class="mission-result-stars" aria-label="' + stars + ' 星">';
    for (let i = 1; i <= 3; i += 1) {
      html += '<span class="' + (i <= stars ? 'filled' : 'empty') + '">★</span>';
    }
    html += '</span>';
    return html;
  }

  function starMessage(stars) {
    if (stars >= 3) return '非常好！你大部分回應都清楚、平靜，而且有照顧到自己和別人的感受。';
    if (stars === 2) return '做得不錯！你已經掌握基本方向，下次可以再留意語氣、界線和回應的完整度。';
    return '你已完成任務，這是好的開始。可以重看逐題回饋，再試一次挑戰更高星數。';
  }

  function getBestAnswer(step) {
    if (!step || !Array.isArray(step.options)) return '';
    const best = step.options
      .filter(function (option) { return Number(option.score || 0) >= 2; })
      .map(function (option) { return option.text; });
    return best[0] || '';
  }

  function labelForScore(score) {
    const n = Number(score || 0);
    if (n >= 2) return { text: '做得好', className: 'good', icon: '✅' };
    if (n === 1) return { text: '可以更好', className: 'ok', icon: '🔶' };
    return { text: '需要留意', className: 'bad', icon: '⚠️' };
  }

  function saveSession() {
    saveJson(SESSION_KEY, {
      missionKey: currentMissionKey,
      score: currentScore,
      items: reviewItems,
      savedAt: Date.now()
    });
  }

  function loadSession() {
    const session = readJson(SESSION_KEY, null);
    if (!session || !session.missionKey || !Array.isArray(session.items)) return null;
    return session;
  }

  function resetSession(missionKey) {
    currentMissionKey = missionKey || '';
    currentScore = 0;
    reviewItems = [];
    answeredKeys = new Set();
    saveSession();
  }

  function recordAnswer(event) {
    const button = event.target && event.target.closest ? event.target.closest('#asdChoices button[data-option-index], #asdChoices button.choice-button') : null;
    if (!button) return;

    const choices = document.getElementById('asdChoices');
    if (!choices || !choices.contains(button)) return;

    // Ignore non-answer buttons on intro/final screens.
    const screen = document.getElementById('gameScreen');
    if (!screen || !screen.classList.contains('mission-question-mode')) return;

    const missionKey = detectMission();
    if (!missionKey) return;
    if (!currentMissionKey) currentMissionKey = missionKey;

    const q = getQuestionNumber();
    if (q < 1 || q > TOTAL_QUESTIONS) return;

    const key = missionKey + ':' + q;
    if (answeredKeys.has(key)) return;

    const step = getStep(missionKey, q);
    const option = findOption(step, button.textContent || button.innerText || '');
    if (!option) return;

    answeredKeys.add(key);
    const score = Number(option.score || 0);
    currentScore += score;

    reviewItems.push({
      questionNumber: q,
      prompt: step && step.prompt ? step.prompt : '第 ' + q + ' 題',
      selectedText: option.text || (button.textContent || ''),
      score: score,
      note: option.note || '可以再想想對方感受、語氣和界線。',
      bestAnswer: getBestAnswer(step)
    });

    saveSession();
    if (reviewItems.length >= TOTAL_QUESTIONS) scheduleRender();
  }

  function renderReviewRows(items) {
    return items.map(function (item) {
      const label = labelForScore(item.score);
      const best = item.score >= 2 || !item.bestAnswer ? '' :
        '<div class="mission-result-best"><strong>較理想做法：</strong>' + esc(item.bestAnswer) + '</div>';

      return '<div class="mission-result-row ' + label.className + '">' +
        '<div class="mission-result-row-head">' +
          '<strong>第 ' + esc(item.questionNumber) + ' 題｜' + label.icon + ' ' + esc(label.text) + '</strong>' +
          '<span>' + esc(item.score) + ' / 2</span>' +
        '</div>' +
        '<div class="mission-result-question">' + esc(item.prompt) + '</div>' +
        '<div><strong>你的選擇：</strong>' + esc(item.selectedText) + '</div>' +
        '<div><strong>回饋：</strong>' + esc(item.note) + '</div>' +
        best +
      '</div>';
    }).join('');
  }

  function renderPanel(session) {
    const screen = document.getElementById('gameScreen');
    if (!screen || !screen.classList.contains('mission-finish-mode')) return;

    const items = (session && session.items) || reviewItems;
    if (!items || !items.length) return;

    const score = Number((session && session.score) || currentScore || items.reduce(function (sum, item) { return sum + Number(item.score || 0); }, 0));
    const maxScore = TOTAL_QUESTIONS * 2;
    const stars = scoreToStars(score);

    const old = document.getElementById('missionResultReviewBox');
    if (old) old.remove();

    const panel = document.createElement('div');
    panel.id = 'missionResultReviewBox';
    panel.className = 'mission-result-review-box animate-in';
    panel.innerHTML =
      '<div class="mission-result-summary-card">' +
        '<div class="panel-badge">任務結果</div>' +
        '<h3>今次評級：' + starHtml(stars) + '</h3>' +
        '<div class="mission-result-score"><strong>總分：' + score + ' / ' + maxScore + '</strong><span>' + esc(starMessage(stars)) + '</span></div>' +
      '</div>' +
      '<div class="mission-result-review-card">' +
        '<h3>逐題回饋</h3>' +
        '<p>下面會顯示每一題你答得好或需要改善的地方。</p>' +
        renderReviewRows(items) +
      '</div>';

    const dialogueArea = document.querySelector('#gameScreen.active .dialogue-area.center-column') || document.querySelector('#gameScreen .dialogue-area.center-column');
    const choices = document.getElementById('asdChoices');
    const abilityBox = document.getElementById('virtueChangeBox');

    if (abilityBox && abilityBox.parentNode) {
      abilityBox.insertAdjacentElement('afterend', panel);
    } else if (choices && choices.parentNode) {
      choices.parentNode.insertBefore(panel, choices);
    } else if (dialogueArea) {
      dialogueArea.appendChild(panel);
    }
  }

  function scheduleRender() {
    if (renderScheduled) return;
    renderScheduled = true;
    setTimeout(function () {
      renderScheduled = false;
      renderPanel(loadSession());
    }, 950);
    setTimeout(function () { renderPanel(loadSession()); }, 1500);
    setTimeout(function () { renderPanel(loadSession()); }, 2400);
  }

  function injectStyles() {
    if (document.getElementById('missionResultReviewFixStyle')) return;
    const style = document.createElement('style');
    style.id = 'missionResultReviewFixStyle';
    style.textContent = `
      #gameScreen.active.mission-finish-mode .dialogue-area.center-column {
        max-width: 1180px !important;
      }

      .mission-result-review-box {
        width: 100%;
        box-sizing: border-box;
        display: grid;
        gap: 14px;
        margin: 12px 0 14px;
      }

      .mission-result-summary-card,
      .mission-result-review-card {
        padding: 16px 18px;
        border-radius: 24px;
        background: linear-gradient(180deg, rgba(255,255,255,.94), rgba(239,248,255,.82));
        border: 1px solid rgba(255,255,255,.9);
        box-shadow: 0 16px 34px rgba(29,53,87,.10), inset 0 1px 0 rgba(255,255,255,.96);
      }

      .mission-result-summary-card h3,
      .mission-result-review-card h3 {
        margin: 6px 0 8px;
        color: var(--text);
      }

      .mission-result-stars {
        display: inline-flex;
        gap: 3px;
        vertical-align: middle;
        margin-left: 6px;
        font-size: 1.45rem;
        letter-spacing: 1px;
      }

      .mission-result-stars .filled { color: #ffb000; text-shadow: 0 3px 10px rgba(255,176,0,.25); }
      .mission-result-stars .empty { color: #b8c3d1; }

      .mission-result-score {
        display: grid;
        gap: 5px;
        padding: 12px 14px;
        border-radius: 18px;
        background: rgba(0,122,255,.08);
        color: var(--primary-dark);
        font-weight: 850;
      }

      .mission-result-score span {
        color: var(--muted);
        font-size: .92rem;
        line-height: 1.45;
      }

      .mission-result-review-card > p {
        margin: 0 0 12px;
        color: var(--muted);
        font-weight: 800;
      }

      .mission-result-row {
        display: grid;
        gap: 6px;
        margin-top: 10px;
        padding: 12px 14px;
        border-radius: 18px;
        background: rgba(255,255,255,.72);
        border: 1px solid rgba(255,255,255,.86);
        line-height: 1.5;
        font-weight: 760;
      }

      .mission-result-row-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
      }

      .mission-result-row-head span {
        flex: 0 0 auto;
        padding: 4px 8px;
        border-radius: 999px;
        background: rgba(255,255,255,.9);
        color: var(--primary-dark);
        font-weight: 950;
      }

      .mission-result-question {
        color: var(--muted);
        font-size: .9rem;
      }

      .mission-result-row.good { box-shadow: inset 5px 0 0 rgba(52,199,89,.78); }
      .mission-result-row.ok { box-shadow: inset 5px 0 0 rgba(255,176,0,.78); }
      .mission-result-row.bad { box-shadow: inset 5px 0 0 rgba(255,59,48,.70); }

      .mission-result-best {
        padding: 8px 10px;
        border-radius: 14px;
        background: rgba(52,199,89,.10);
        color: #137300;
      }

      @media (min-width: 981px) {
        #gameScreen.active.mission-finish-mode .mission-result-review-box {
          grid-column: 2 / 3;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function patchStartFunctions() {
    if (typeof window.startAsdGame === 'function' && !window.startAsdGame.__missionResultReviewPatched) {
      const original = window.startAsdGame;
      window.startAsdGame = function (missionKey) {
        resetSession(missionKey);
        return original.apply(this, arguments);
      };
      window.startAsdGame.__missionResultReviewPatched = true;
    }

    if (typeof window.startRpgMission === 'function' && !window.startRpgMission.__missionResultReviewPatched) {
      const originalRpg = window.startRpgMission;
      window.startRpgMission = function (missionKey) {
        resetSession(missionKey);
        return originalRpg.apply(this, arguments);
      };
      window.startRpgMission.__missionResultReviewPatched = true;
    }
  }

  function watchFinishScreen() {
    const screen = document.getElementById('gameScreen');
    if (!screen || screen.__missionResultReviewObserver) return;

    const observer = new MutationObserver(function () {
      if (screen.classList.contains('active') && screen.classList.contains('mission-finish-mode')) {
        scheduleRender();
      }
    });

    observer.observe(screen, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    screen.__missionResultReviewObserver = observer;
  }

  function install() {
    injectStyles();
    patchStartFunctions();
    watchFinishScreen();
    if (document.getElementById('gameScreen') && document.getElementById('gameScreen').classList.contains('mission-finish-mode')) {
      scheduleRender();
    }
  }

  document.addEventListener('click', recordAnswer, true);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install);
  } else {
    install();
  }

  window.addEventListener('load', function () {
    install();
    setTimeout(install, 500);
    setTimeout(install, 1500);
  });
})();
