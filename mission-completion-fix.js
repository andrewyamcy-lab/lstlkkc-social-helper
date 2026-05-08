// /mission-completion-fix.js
// Robust mission completion fix.
// Problem fixed: after answering all 5 questions, the RPG map / character page sometimes did not record the mission as completed.
// This file runs after the other RPG scripts and saves completion directly to asd_school_rpg_progress_v1.

(function () {
  const STORAGE_KEY = 'asd_school_rpg_progress_v1';
  const TOTAL_QUESTIONS = 5;
  const THREE_STAR_SCORE = 8;

  let activeMissionKey = '';
  let activeScore = 0;
  let answered = new Set();
  let savedKey = '';

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

  function defaultProgress() {
    return { completed: {}, scores: {}, stars: {}, expAwards: {}, version: 2 };
  }

  function loadProgress() {
    const raw = readJson(STORAGE_KEY, {});
    const next = defaultProgress();
    Object.assign(next.completed, raw.completed || {});
    Object.assign(next.scores, raw.scores || {});
    Object.assign(next.stars, raw.stars || {});
    Object.assign(next.expAwards, raw.expAwards || {});
    return next;
  }

  function scoreToStars(score) {
    const value = Number(score || 0);
    if (value >= THREE_STAR_SCORE) return 3;
    if (value >= 5) return 2;
    if (value > 0) return 1;
    return 0;
  }

  function starsToExp(stars) {
    if (stars >= 3) return 50;
    if (stars === 2) return 35;
    if (stars === 1) return 25;
    return 10;
  }

  function normalize(value) {
    return String(value || '').replace(/\s+/g, '').replace(/^[A-D][\.．、]?/i, '').trim();
  }

  function getGames() {
    try {
      if (window.asdGames) return window.asdGames;
      // eslint-disable-next-line no-undef
      if (typeof asdGames !== 'undefined') return asdGames;
    } catch (error) {}
    return {};
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

    return answered.size + 1;
  }

  function detectMission() {
    if (activeMissionKey) return activeMissionKey;

    const games = getGames();
    const text = ((document.getElementById('asdBox') || {}).textContent || '') + ' ' + ((document.getElementById('questionTrackerTitle') || {}).textContent || '');
    return Object.keys(games).find(function (key) {
      const game = games[key] || {};
      return text.includes(game.title || '') || text.includes(game.intro || '') || text.includes(game.mission || '');
    }) || '';
  }

  function getOptionScore(missionKey, questionNumber, buttonText) {
    const games = getGames();
    const game = games[missionKey];
    const step = game && game.steps ? game.steps[questionNumber - 1] : null;
    if (!step || !Array.isArray(step.options)) return 0;

    const cleanButton = normalize(buttonText);
    const option = step.options.find(function (item) {
      const cleanOption = normalize(item.text);
      return cleanButton.includes(cleanOption) || cleanOption.includes(cleanButton);
    });

    return option ? Number(option.score || 0) : 0;
  }

  function renderSmallStars(stars) {
    let text = '';
    for (let i = 1; i <= 3; i += 1) text += i <= stars ? '★' : '☆';
    return text;
  }

  function updateMarkersNow(state) {
    document.querySelectorAll('.rpg-map-marker[data-rpg-scenario]').forEach(function (marker) {
      const key = marker.dataset.rpgScenario;
      const completed = !!(state.completed || {})[key];
      const stars = Number((state.stars || {})[key] || 0);

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

  function saveMissionCompletion(missionKey, score) {
    if (!missionKey) return;

    const state = loadProgress();
    const oldStars = Number(state.stars[missionKey] || 0);
    const oldScore = Number(state.scores[missionKey] || 0);
    const oldExp = Number(state.expAwards[missionKey] || 0);

    const newStars = scoreToStars(score);
    const newExp = starsToExp(newStars);

    state.completed[missionKey] = true;
    state.scores[missionKey] = Math.max(oldScore, Number(score || 0));
    state.stars[missionKey] = Math.max(oldStars, newStars);
    state.expAwards[missionKey] = Math.max(oldExp, newExp);
    state.version = 2;

    saveJson(STORAGE_KEY, state);
    updateMarkersNow(state);

    if (typeof window.renderBadges === 'function') {
      try { window.renderBadges(); } catch (error) {}
    }

    if (typeof window.showToast === 'function') {
      if (!oldStars) window.showToast('✅ 已記錄：任務完成！', 'success');
      if (newStars >= 3 && oldStars < 3) window.showToast('⭐ 已記錄：3 星完成！', 'success');
    }
  }

  function maybeSaveCompletion() {
    if (!activeMissionKey) return;
    if (answered.size < TOTAL_QUESTIONS) return;

    const key = activeMissionKey + ':' + activeScore;
    if (savedKey === key) return;
    savedKey = key;

    setTimeout(function () {
      saveMissionCompletion(activeMissionKey, activeScore);
    }, 450);
  }

  function handleChoiceClick(event) {
    const button = event.target.closest && event.target.closest('#asdChoices button');
    if (!button) return;

    const missionKey = detectMission();
    if (!missionKey) return;

    if (!activeMissionKey) activeMissionKey = missionKey;

    const q = getQuestionNumber();
    const answerKey = missionKey + ':' + q;
    if (answered.has(answerKey)) return;

    const score = getOptionScore(missionKey, q, button.textContent || button.innerText || '');
    activeScore += Number(score || 0);
    answered.add(answerKey);

    maybeSaveCompletion();
  }

  function resetTracking(missionKey) {
    activeMissionKey = missionKey || '';
    activeScore = 0;
    answered = new Set();
    savedKey = '';
  }

  function patchStartFunctions() {
    if (typeof window.startAsdGame === 'function' && !window.startAsdGame.__missionCompletionFixPatched) {
      const originalStartAsd = window.startAsdGame;
      window.startAsdGame = function (missionKey) {
        resetTracking(missionKey);
        return originalStartAsd.apply(this, arguments);
      };
      window.startAsdGame.__missionCompletionFixPatched = true;
    }

    if (typeof window.startRpgMission === 'function' && !window.startRpgMission.__missionCompletionFixPatched) {
      const originalStartRpg = window.startRpgMission;
      window.startRpgMission = function (missionKey) {
        resetTracking(missionKey);
        return originalStartRpg.apply(this, arguments);
      };
      window.startRpgMission.__missionCompletionFixPatched = true;
    }
  }

  function refreshExistingMarkers() {
    updateMarkersNow(loadProgress());
  }

  function install() {
    patchStartFunctions();
    refreshExistingMarkers();
    setTimeout(patchStartFunctions, 300);
    setTimeout(patchStartFunctions, 900);
    setTimeout(refreshExistingMarkers, 300);
    setTimeout(refreshExistingMarkers, 900);
  }

  document.addEventListener('click', handleChoiceClick, true);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install);
  } else {
    install();
  }

  window.addEventListener('load', function () {
    install();
    setTimeout(install, 700);
    setTimeout(install, 1600);
  });
})();
