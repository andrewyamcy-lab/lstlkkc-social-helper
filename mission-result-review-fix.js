// /mission-result-review-fix.js
// Stable compact final result panel after each mission.
// Shows: ability change + result summary on top, full-width 逐題回饋 below.

(function () {
  const SESSION_KEY = 'asd_school_mission_review_session_v1';
  const TOTAL_QUESTIONS = 5;
  const THREE_STAR_SCORE = 8;

  let currentMissionKey = '';
  let currentScore = 0;
  let reviewItems = [];
  let answeredKeys = new Set();
  let renderTimer = null;

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
    for (let i = 1; i <= 3; i += 1) html += '<span class="' + (i <= stars ? 'filled' : 'empty') + '">★</span>';
    return html + '</span>';
  }

  function starMessage(stars) {
    if (stars >= 3) return '表現很好，可以進入下一個任務。';
    if (stars === 2) return '做得不錯，重玩可挑戰 3 星。';
    return '已完成任務，可看看下面哪幾題需要留意。';
  }

  function getBestAnswer(step) {
    if (!step || !Array.isArray(step.options)) return '';
    const best = step.options.filter(function (option) { return Number(option.score || 0) >= 2; }).map(function (option) { return option.text; });
    return best[0] || '';
  }

  function labelForScore(score) {
    const n = Number(score || 0);
    if (n >= 2) return { text: '做得好', className: 'good', icon: '✅' };
    if (n === 1) return { text: '可以更好', className: 'ok', icon: '🔶' };
    return { text: '需要留意', className: 'bad', icon: '⚠️' };
  }

  function saveSession() {
    saveJson(SESSION_KEY, { missionKey: currentMissionKey, score: currentScore, items: reviewItems, savedAt: Date.now() });
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
    const old = document.getElementById('missionResultReviewBox');
    if (old) old.remove();
    saveSession();
  }

  function recordAnswer(event) {
    const button = event.target && event.target.closest ? event.target.closest('#asdChoices button[data-option-index], #asdChoices button.choice-button') : null;
    if (!button) return;

    const choices = document.getElementById('asdChoices');
    if (!choices || !choices.contains(button)) return;

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
      selectedText: option.text || (button.textContent || ''),
      score: score,
      note: option.note || '可以再想想對方感受、語氣和界線。',
      bestAnswer: getBestAnswer(step)
    });

    saveSession();
    if (reviewItems.length >= TOTAL_QUESTIONS) scheduleRender();
  }

  function shortenText(text, limit) {
    const value = String(text || '').trim();
    return value.length <= limit ? value : value.slice(0, limit) + '…';
  }

  function renderReviewRows(items) {
    return items.map(function (item) {
      const label = labelForScore(item.score);
      const best = item.score >= 2 || !item.bestAnswer ? '' : '<div class="mission-result-best"><strong>建議：</strong>' + esc(shortenText(item.bestAnswer, 38)) + '</div>';
      return '<div class="mission-result-row ' + label.className + '">' +
        '<div class="mission-result-row-head"><strong>第 ' + esc(item.questionNumber) + ' 題｜' + label.icon + ' ' + esc(label.text) + '</strong><span>' + esc(item.score) + '/2</span></div>' +
        '<div class="mission-result-brief"><strong>你選：</strong>' + esc(shortenText(item.selectedText, 46)) + '</div>' +
        '<div class="mission-result-brief"><strong>回饋：</strong>' + esc(shortenText(item.note, 56)) + '</div>' + best +
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
    const panelKey = String((session && session.missionKey) || currentMissionKey || '') + ':' + score + ':' + items.length;

    const old = document.getElementById('missionResultReviewBox');
    if (old && old.dataset.panelKey === panelKey) return;
    if (old) old.remove();

    const panel = document.createElement('div');
    panel.id = 'missionResultReviewBox';
    panel.dataset.panelKey = panelKey;
    panel.className = 'mission-result-review-box';
    panel.innerHTML =
      '<div class="mission-result-summary-card">' +
        '<div class="mission-result-summary-left"><div class="panel-badge">任務結果</div><h3>今次評級：' + starHtml(stars) + '</h3></div>' +
        '<div class="mission-result-score"><strong>' + score + ' / ' + maxScore + '</strong><span>' + esc(starMessage(stars)) + '</span></div>' +
      '</div>' +
      '<div class="mission-result-review-card">' +
        '<div class="mission-result-review-title"><h3>逐題回饋</h3><span>快速查看哪題做得好 / 要改善</span></div>' +
        '<div class="mission-result-row-grid">' + renderReviewRows(items) + '</div>' +
      '</div>';

    const choices = document.getElementById('asdChoices');
    if (choices && choices.parentNode) choices.parentNode.insertBefore(panel, choices);
  }

  function scheduleRender() {
    if (renderTimer) clearTimeout(renderTimer);
    renderTimer = setTimeout(function () {
      renderTimer = null;
      renderPanel(loadSession());
    }, 900);
  }

  function injectStyles() {
    if (document.getElementById('missionResultReviewFixStyle')) return;
    const style = document.createElement('style');
    style.id = 'missionResultReviewFixStyle';
    style.textContent = `
      #gameScreen.active.mission-finish-mode #questionTracker,
      #gameScreen.active.mission-finish-mode .action-row,
      #gameScreen.active.mission-finish-mode #asdBox,
      #gameScreen.active.mission-finish-mode #sceneMeta,
      #gameScreen.active.mission-finish-mode #hintBox,
      #gameScreen.active.mission-finish-mode #calmBox,
      #gameScreen.active.mission-finish-mode #reviewBoxInline,
      #gameScreen.active.mission-finish-mode #gameScenarioImageBox,
      #gameScreen.active.mission-finish-mode .game-scenario-image-wrap {
        display: none !important;
      }

      #gameScreen.active.mission-finish-mode .game-layout,
      #gameScreen.active.mission-finish-mode .dialogue-area.center-column {
        width: 100% !important;
        max-width: 1040px !important;
        margin-left: auto !important;
        margin-right: auto !important;
      }

      #gameScreen.active.mission-finish-mode .dialogue-area.center-column {
        display: grid !important;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important;
        grid-template-areas: "ability result" "review review" "choices choices" !important;
        gap: 12px 14px !important;
        align-items: start !important;
      }

      #gameScreen.active.mission-finish-mode #virtueChangeBox {
        grid-area: ability !important;
        width: 100% !important;
        box-sizing: border-box !important;
        margin: 0 !important;
        min-height: 112px !important;
      }

      #gameScreen.active.mission-finish-mode #missionResultReviewBox { display: contents !important; }

      #gameScreen.active.mission-finish-mode .mission-result-summary-card {
        grid-area: result !important;
        width: 100% !important;
        box-sizing: border-box !important;
        min-height: 112px !important;
        display: grid !important;
        grid-template-columns: minmax(0, 1fr) minmax(180px, 230px) !important;
        gap: 12px !important;
        align-items: center !important;
      }

      #gameScreen.active.mission-finish-mode .mission-result-review-card {
        grid-area: review !important;
        width: 100% !important;
        box-sizing: border-box !important;
        padding: 16px 18px !important;
      }

      .mission-result-summary-card,
      .mission-result-review-card {
        border-radius: 22px;
        background: linear-gradient(180deg, rgba(255,255,255,.94), rgba(239,248,255,.82));
        border: 1px solid rgba(255,255,255,.9);
        box-shadow: 0 12px 26px rgba(29,53,87,.09), inset 0 1px 0 rgba(255,255,255,.96);
      }

      .mission-result-summary-card { padding: 13px 15px; }
      .mission-result-summary-card h3, .mission-result-review-card h3 { margin: 5px 0 0; color: var(--text); }

      .mission-result-stars { display: inline-flex; gap: 2px; vertical-align: middle; margin-left: 4px; font-size: 1.25rem; letter-spacing: 1px; }
      .mission-result-stars .filled { color: #ffb000; text-shadow: 0 3px 10px rgba(255,176,0,.22); }
      .mission-result-stars .empty { color: #b8c3d1; }

      .mission-result-score {
        display: grid; gap: 3px; padding: 10px 12px; border-radius: 16px;
        background: rgba(0,122,255,.08); color: var(--primary-dark); font-weight: 850; text-align: center;
      }
      .mission-result-score strong { font-size: 1.12rem; }
      .mission-result-score span { color: var(--muted); font-size: .82rem; line-height: 1.3; }

      .mission-result-review-title { display: flex; align-items: end; justify-content: space-between; gap: 10px; margin-bottom: 8px; }
      .mission-result-review-title span { color: var(--muted); font-weight: 800; font-size: .82rem; }

      #gameScreen.active.mission-finish-mode .mission-result-row-grid {
        display: grid !important;
        grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
        gap: 10px !important;
      }

      .mission-result-row {
        display: grid; gap: 5px; padding: 12px 12px; min-height: 170px;
        border-radius: 16px; background: rgba(255,255,255,.74); border: 1px solid rgba(255,255,255,.86);
        line-height: 1.35; font-weight: 760; min-width: 0;
      }
      .mission-result-row-head { display: flex; justify-content: space-between; align-items: center; gap: 7px; }
      .mission-result-row-head strong { font-size: .82rem; }
      .mission-result-row-head span { flex: 0 0 auto; padding: 3px 6px; border-radius: 999px; background: rgba(255,255,255,.9); color: var(--primary-dark); font-size: .75rem; font-weight: 950; }
      .mission-result-brief, .mission-result-best { font-size: .82rem; color: var(--muted); overflow-wrap: anywhere; line-height: 1.42; }
      .mission-result-row.good { box-shadow: inset 4px 0 0 rgba(52,199,89,.78); }
      .mission-result-row.ok { box-shadow: inset 4px 0 0 rgba(255,176,0,.78); }
      .mission-result-row.bad { box-shadow: inset 4px 0 0 rgba(255,59,48,.70); }
      .mission-result-best { padding: 6px 8px; border-radius: 12px; background: rgba(52,199,89,.10); color: #137300; }

      #gameScreen.active.mission-finish-mode #asdChoices { grid-area: choices !important; width: 100% !important; box-sizing: border-box !important; }

      @media (max-width: 980px) {
        #gameScreen.active.mission-finish-mode .dialogue-area.center-column { grid-template-columns: 1fr !important; grid-template-areas: "ability" "result" "review" "choices" !important; }
        #gameScreen.active.mission-finish-mode .mission-result-summary-card { grid-template-columns: 1fr !important; }
        #gameScreen.active.mission-finish-mode .mission-result-row-grid { grid-template-columns: 1fr !important; }
        .mission-result-row { min-height: 0 !important; }
      }
    `;
    document.head.appendChild(style);
  }

  function patchStartFunctions() {
    if (typeof window.startAsdGame === 'function' && !window.startAsdGame.__missionResultReviewPatched) {
      const original = window.startAsdGame;
      window.startAsdGame = function (missionKey) { resetSession(missionKey); return original.apply(this, arguments); };
      window.startAsdGame.__missionResultReviewPatched = true;
    }
    if (typeof window.startRpgMission === 'function' && !window.startRpgMission.__missionResultReviewPatched) {
      const originalRpg = window.startRpgMission;
      window.startRpgMission = function (missionKey) { resetSession(missionKey); return originalRpg.apply(this, arguments); };
      window.startRpgMission.__missionResultReviewPatched = true;
    }
  }

  function watchFinishScreen() {
    const screen = document.getElementById('gameScreen');
    if (!screen || screen.__missionResultReviewObserver) return;
    const observer = new MutationObserver(function (mutations) {
      const becameFinish = mutations.some(function (mutation) { return mutation.type === 'attributes' && mutation.attributeName === 'class'; });
      if (becameFinish && screen.classList.contains('active') && screen.classList.contains('mission-finish-mode')) scheduleRender();
    });
    observer.observe(screen, { attributes: true, attributeFilter: ['class'] });
    screen.__missionResultReviewObserver = observer;
  }

  function install() {
    injectStyles();
    patchStartFunctions();
    watchFinishScreen();
    const screen = document.getElementById('gameScreen');
    if (screen && screen.classList.contains('mission-finish-mode')) scheduleRender();
  }

  document.addEventListener('click', recordAnswer, true);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install); else install();
  window.addEventListener('load', function () { install(); setTimeout(install, 500); });
})();
