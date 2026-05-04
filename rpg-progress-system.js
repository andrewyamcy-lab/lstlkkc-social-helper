// /rpg-progress-system.js
// RPG map progress system:
// 1. Shows completed / 3-star status on RPG map markers.
// 2. Adds a progress bar dashboard to the RPG map.

(function () {
  const STORAGE_KEY = 'asd_school_rpg_progress_v1';
  const BADGE_STORAGE_KEY = 'asd_school_badges_v2';
  const TOTAL_MISSIONS = 20;
  const THREE_STAR_SCORE = 8;

  let activeMissionKey = '';
  let activeScore = 0;
  let answeredQuestions = new Set();
  let lastSavedResultKey = '';

  function getDefaultProgress() {
    return {
      completed: {},
      scores: {},
      stars: {},
      version: 1
    };
  }

  function loadProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return getDefaultProgress();
      const parsed = JSON.parse(raw);
      const state = getDefaultProgress();
      Object.assign(state.completed, parsed.completed || {});
      Object.assign(state.scores, parsed.scores || {});
      Object.assign(state.stars, parsed.stars || {});
      return state;
    } catch (error) {
      return getDefaultProgress();
    }
  }

  function saveProgressState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function loadBadgeProgress() {
    try {
      const raw = localStorage.getItem(BADGE_STORAGE_KEY);
      if (!raw) return { progress: {}, unlocked: {} };
      return JSON.parse(raw);
    } catch (error) {
      return { progress: {}, unlocked: {} };
    }
  }

  function scoreToStars(score) {
    const value = Number(score || 0);
    if (value >= THREE_STAR_SCORE) return 3;
    if (value >= 5) return 2;
    if (value > 0) return 1;
    return 0;
  }

  function getCurrentQuestionNumber() {
    const badge = document.getElementById('questionBadgeBig');
    const text = badge ? badge.textContent || '' : '';
    const match = text.match(/第\s*(\d+)\s*\/\s*\d+\s*題/);
    if (match && match[1]) return Number(match[1]);
    return answeredQuestions.size + 1;
  }

  function getOptionScore(missionKey, questionNumber, optionText) {
    try {
      const game = asdGames[missionKey];
      const step = game && game.steps ? game.steps[questionNumber - 1] : null;
      if (!step || !Array.isArray(step.options)) return 0;
      const cleanOptionText = String(optionText || '').trim();
      const option = step.options.find(function (item) {
        const itemText = String(item.text || '').trim();
        return cleanOptionText.includes(itemText) || itemText.includes(cleanOptionText);
      });
      return option ? Number(option.score || 0) : 0;
    } catch (error) {
      return 0;
    }
  }

  function resetMissionTracking(missionKey) {
    activeMissionKey = missionKey;
    activeScore = 0;
    answeredQuestions = new Set();
    lastSavedResultKey = '';
  }

  function saveMissionCompletion(missionKey, score) {
    if (!missionKey) return;

    const state = loadProgress();
    const newStars = scoreToStars(score);
    const oldStars = Number(state.stars[missionKey] || 0);
    const oldScore = Number(state.scores[missionKey] || 0);

    state.completed[missionKey] = true;
    state.scores[missionKey] = Math.max(oldScore, Number(score || 0));
    state.stars[missionKey] = Math.max(oldStars, newStars);

    saveProgressState(state);
    updateRpgMapProgressUI();

    if (typeof showToast === 'function') {
      if (newStars >= 3 && oldStars < 3) {
        showToast('⭐ RPG 地圖已記錄：3 星完成！', 'success');
      } else if (!oldStars) {
        showToast('✅ RPG 地圖已記錄：任務完成！', 'success');
      }
    }
  }

  function handleChoiceClick(event) {
    const button = event.target.closest('#asdChoices button');
    if (!button || !activeMissionKey) return;

    const qNum = getCurrentQuestionNumber();
    if (answeredQuestions.has(qNum)) return;

    const optionText = button.textContent || '';
    const score = getOptionScore(activeMissionKey, qNum, optionText);
    activeScore += score;
    answeredQuestions.add(qNum);

    if (answeredQuestions.size >= 5) {
      const resultKey = activeMissionKey + ':' + activeScore;
      if (resultKey !== lastSavedResultKey) {
        lastSavedResultKey = resultKey;
        setTimeout(function () {
          saveMissionCompletion(activeMissionKey, activeScore);
        }, 360);
      }
    }
  }

  function patchStartAsdGame() {
    if (typeof window.startAsdGame !== 'function') return false;
    if (window.startAsdGame.__rpgProgressPatched) return true;

    const originalStart = window.startAsdGame;
    window.startAsdGame = function (key) {
      resetMissionTracking(key);
      return originalStart.apply(this, arguments);
    };
    window.startAsdGame.__rpgProgressPatched = true;
    return true;
  }

  function countCompleted(state) {
    return Object.keys(state.completed || {}).filter(function (key) {
      return state.completed[key];
    }).length;
  }

  function countThreeStar(state) {
    return Object.keys(state.stars || {}).filter(function (key) {
      return Number(state.stars[key] || 0) >= 3;
    }).length;
  }

  function countUnlockedBadges(badgeState) {
    const progress = badgeState.progress || {};
    return Object.keys(progress).filter(function (key) {
      return Number(progress[key] || 0) >= 3;
    }).length;
  }

  function countBadgeStars(badgeState) {
    const progress = badgeState.progress || {};
    return Object.keys(progress).reduce(function (sum, key) {
      return sum + Math.min(3, Number(progress[key] || 0));
    }, 0);
  }

  function renderSmallStars(stars) {
    let text = '';
    for (let i = 1; i <= 3; i += 1) text += i <= stars ? '★' : '☆';
    return text;
  }

  function ensureProgressPanel() {
    const board = document.querySelector('#rpgMapScreen .rpg-map-board');
    if (!board) return null;

    let panel = document.getElementById('rpgProgressPanel');
    if (panel && board.contains(panel)) return panel;

    panel = document.createElement('div');
    panel.id = 'rpgProgressPanel';
    panel.className = 'rpg-progress-panel';

    const instruction = board.querySelector('.rpg-map-instruction');
    if (instruction) instruction.insertAdjacentElement('afterend', panel);
    else board.insertAdjacentElement('afterbegin', panel);

    return panel;
  }

  function updateMarkers(state) {
    document.querySelectorAll('.rpg-map-marker[data-rpg-scenario]').forEach(function (marker) {
      const key = marker.dataset.rpgScenario;
      const completed = !!state.completed[key];
      const stars = Number(state.stars[key] || 0);

      marker.classList.toggle('is-completed', completed && stars < 3);
      marker.classList.toggle('is-three-star', stars >= 3);

      const text = marker.querySelector('.rpg-marker-text');
      if (text) {
        if (stars >= 3) text.textContent = '★★★';
        else if (completed) text.textContent = '完成';
        else text.textContent = '任務';
      }

      const oldMini = marker.querySelector('.rpg-marker-mini-stars');
      if (oldMini) oldMini.remove();
      if (completed) {
        const mini = document.createElement('span');
        mini.className = 'rpg-marker-mini-stars';
        mini.textContent = renderSmallStars(stars);
        marker.appendChild(mini);
      }
    });
  }

  function updateRpgMapProgressUI() {
    injectRpgProgressStyles();

    const state = loadProgress();
    const badgeState = loadBadgeProgress();
    const completed = countCompleted(state);
    const threeStar = countThreeStar(state);
    const badgeUnlocked = countUnlockedBadges(badgeState);
    const badgeStars = countBadgeStars(badgeState);
    const percent = Math.min(100, Math.round((completed / TOTAL_MISSIONS) * 100));

    updateMarkers(state);

    const panel = ensureProgressPanel();
    if (!panel) return;

    panel.innerHTML =
      '<div class="rpg-progress-head">' +
        '<div>' +
          '<strong>你的 RPG 進度</strong>' +
          '<p>完成任務會在地圖上變成綠色；3 星完成會變成金色。</p>' +
        '</div>' +
        '<div class="rpg-progress-percent">' + percent + '%</div>' +
      '</div>' +
      '<div class="rpg-progress-bar-wrap" aria-label="任務完成進度">' +
        '<div class="rpg-progress-bar-fill" style="width:' + percent + '%"></div>' +
      '</div>' +
      '<div class="rpg-progress-stats">' +
        '<span>✅ 任務完成：<strong>' + completed + ' / ' + TOTAL_MISSIONS + '</strong></span>' +
        '<span>⭐ 3 星任務：<strong>' + threeStar + ' / ' + TOTAL_MISSIONS + '</strong></span>' +
        '<span>🏅 徽章：<strong>' + badgeUnlocked + ' / 5</strong></span>' +
        '<span>🌟 徽章星數：<strong>' + badgeStars + ' / 15</strong></span>' +
      '</div>';
  }

  function injectRpgProgressStyles() {
    if (document.getElementById('rpgProgressSystemStyle')) return;

    const style = document.createElement('style');
    style.id = 'rpgProgressSystemStyle';
    style.textContent = `
      .rpg-progress-panel {
        margin: 12px 0 16px;
        padding: 16px 18px;
        border-radius: 24px;
        background: linear-gradient(180deg, rgba(255,255,255,0.88), rgba(235,246,255,0.74));
        border: 1px solid rgba(255,255,255,0.86);
        box-shadow: 0 16px 36px rgba(0,87,217,0.12), inset 0 1px 0 rgba(255,255,255,0.94);
      }

      .rpg-progress-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 14px;
        margin-bottom: 10px;
      }

      .rpg-progress-head strong {
        color: var(--text);
        font-size: 1.08rem;
      }

      .rpg-progress-head p {
        margin: 3px 0 0;
        color: var(--muted);
        font-size: 0.9rem;
      }

      .rpg-progress-percent {
        min-width: 62px;
        height: 46px;
        padding: 0 12px;
        border-radius: 18px;
        display: grid;
        place-items: center;
        font-weight: 950;
        color: #0057d9;
        background: rgba(0,122,255,0.10);
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.92);
      }

      .rpg-progress-bar-wrap {
        height: 16px;
        overflow: hidden;
        border-radius: 999px;
        background: rgba(169,205,242,0.50);
        box-shadow: inset 0 2px 5px rgba(29,53,87,0.10);
      }

      .rpg-progress-bar-fill {
        height: 100%;
        border-radius: inherit;
        background: linear-gradient(90deg, #2f8cff, #00c48c, #ffb000);
        box-shadow: 0 8px 18px rgba(0,87,217,0.18);
        transition: width 0.45s ease;
      }

      .rpg-progress-stats {
        display: grid;
        grid-template-columns: repeat(4, minmax(140px, 1fr));
        gap: 8px;
        margin-top: 12px;
      }

      .rpg-progress-stats span {
        padding: 9px 11px;
        border-radius: 16px;
        background: rgba(255,255,255,0.66);
        border: 1px solid rgba(255,255,255,0.72);
        color: var(--muted);
        font-size: 0.88rem;
      }

      .rpg-progress-stats strong {
        color: var(--text);
      }

      .rpg-map-marker.is-completed {
        background: linear-gradient(180deg, #ecfff4 0%, #ffffff 48%, #d9ffed 100%) !important;
        border-color: #00c48c !important;
        box-shadow:
          0 14px 30px rgba(0, 196, 140, 0.34),
          0 0 0 6px rgba(0, 196, 140, 0.24),
          0 0 0 13px rgba(0, 122, 255, 0.12) !important;
      }

      .rpg-map-marker.is-three-star {
        background: linear-gradient(180deg, #fff6c7 0%, #ffffff 48%, #fff0a8 100%) !important;
        border-color: #ffb000 !important;
        box-shadow:
          0 18px 38px rgba(255, 176, 0, 0.42),
          0 0 0 8px rgba(255, 176, 0, 0.32),
          0 0 0 16px rgba(0, 122, 255, 0.14) !important;
      }

      .rpg-map-marker.is-completed .rpg-marker-text {
        background: #00a878 !important;
      }

      .rpg-map-marker.is-three-star .rpg-marker-text {
        background: #ff9f0a !important;
        color: #4d3300 !important;
      }

      .rpg-marker-mini-stars {
        position: absolute;
        bottom: -18px;
        left: 50%;
        transform: translateX(-50%);
        padding: 1px 6px;
        border-radius: 999px;
        background: rgba(255,255,255,0.92);
        color: #ff9f0a;
        font-size: 0.62rem;
        line-height: 1.25;
        font-weight: 950;
        white-space: nowrap;
        box-shadow: 0 5px 12px rgba(29,53,87,0.12);
      }

      @media (max-width: 900px) {
        .rpg-progress-stats {
          grid-template-columns: repeat(2, minmax(140px, 1fr));
        }
      }

      @media (max-width: 560px) {
        .rpg-progress-head {
          align-items: flex-start;
          flex-direction: column;
        }

        .rpg-progress-stats {
          grid-template-columns: 1fr;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function init() {
    injectRpgProgressStyles();
    patchStartAsdGame();
    document.removeEventListener('click', handleChoiceClick, true);
    document.addEventListener('click', handleChoiceClick, true);
    updateRpgMapProgressUI();
    setTimeout(patchStartAsdGame, 200);
    setTimeout(updateRpgMapProgressUI, 300);
    setTimeout(updateRpgMapProgressUI, 900);
  }

  window.updateRpgMapProgressUI = updateRpgMapProgressUI;
  window.getRpgProgressState = loadProgress;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('load', init);
  document.addEventListener('click', function (event) {
    if (event.target.closest('[data-rpg-scenario]') || event.target.closest('#rpgMapScreen')) {
      setTimeout(updateRpgMapProgressUI, 80);
      setTimeout(updateRpgMapProgressUI, 300);
    }
  }, true);
})();
