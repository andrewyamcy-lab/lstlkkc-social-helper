// /ability-change-fix.js
// Fixes 能力值變化:
// 1. Each question now uses a different ability-change pattern.
// 2. The mission summary shows the accumulated total changes, not the first question's numbers.
// This file intentionally runs after virtue-ability-system.js and corrects its original same-profile calculation.

(function () {
  const VIRTUE_KEY = 'asd_school_virtue_stats_v1';
  const SESSION_KEY = 'asd_school_virtue_session_fix_v1';

  const VIRTUES = {
    wisdom: { icon: '🧠', name: '智慧' },
    courage: { icon: '🦁', name: '勇氣' },
    humanity: { icon: '💛', name: '仁愛' },
    justice: { icon: '⚖️', name: '公義' },
    temperance: { icon: '🌱', name: '節制' },
    transcendence: { icon: '✨', name: '超越' }
  };

  const MISSION_PROFILE = {
    start: ['courage', 'humanity', 'wisdom'],
    respond: ['humanity', 'wisdom', 'courage'],
    refuse: ['temperance', 'courage', 'humanity'],
    conflict: ['temperance', 'justice', 'courage'],
    groupwork: ['justice', 'humanity', 'temperance'],
    help: ['wisdom', 'courage', 'temperance'],
    lunch: ['humanity', 'courage', 'justice'],
    homework: ['wisdom', 'courage', 'temperance'],
    whatsappIgnored: ['temperance', 'humanity', 'wisdom'],
    academicOnly: ['wisdom', 'temperance', 'courage'],
    copyHomework: ['justice', 'courage', 'temperance'],
    quietSpace: ['temperance', 'courage', 'wisdom'],
    peGrouping: ['justice', 'courage', 'humanity'],
    disagree: ['justice', 'temperance', 'humanity'],
    teasing: ['temperance', 'courage', 'humanity'],
    bumped: ['temperance', 'justice', 'courage'],
    losingGame: ['temperance', 'justice', 'humanity'],
    teacherReminder: ['temperance', 'wisdom', 'courage'],
    queueJump: ['justice', 'temperance', 'courage'],
    lostItem: ['wisdom', 'courage', 'temperance']
  };

  let currentMissionKey = '';
  const fixedAnswered = new Set();

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

  function clamp(value) {
    return Math.max(0, Math.min(100, Number(value || 0)));
  }

  function normalize(value) {
    return String(value || '').replace(/\s+/g, '').replace(/^[A-D][\.．、]?/i, '').trim();
  }

  function esc(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function getStats() {
    return Object.assign({ wisdom: 50, courage: 50, humanity: 50, justice: 50, temperance: 50, transcendence: 50 }, readJson(VIRTUE_KEY, {}));
  }

  function saveStats(stats) {
    Object.keys(VIRTUES).forEach(function (key) {
      stats[key] = clamp(stats[key]);
    });
    saveJson(VIRTUE_KEY, stats);
  }

  function addStats(delta) {
    const stats = getStats();
    Object.keys(delta).forEach(function (key) {
      stats[key] = clamp(Number(stats[key] || 50) + Number(delta[key] || 0));
    });
    saveStats(stats);
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
    const text = (document.getElementById('questionBadgeBig') || {}).textContent || '';
    const fromBadge = text.match(/第\s*(\d+)/);
    if (fromBadge) return Number(fromBadge[1]);

    const boxText = (document.getElementById('asdBox') || {}).textContent || '';
    const fromBox = boxText.match(/第\s*(\d+)\s*題/);
    return fromBox ? Number(fromBox[1]) : 1;
  }

  function detectMission() {
    if (currentMissionKey) return currentMissionKey;
    const games = getGames();
    const text = (document.getElementById('asdBox') || {}).textContent || '';
    return Object.keys(games).find(function (key) {
      return text.includes(games[key].intro || '') || text.includes(games[key].title || '') || text.includes((games[key].steps && games[key].steps[0] && games[key].steps[0].prompt) || '');
    }) || '';
  }

  function findOption(button, missionKey, q) {
    const games = getGames();
    const step = games[missionKey] && games[missionKey].steps && games[missionKey].steps[q - 1];
    if (!step || !Array.isArray(step.options)) return null;

    const btnText = normalize(button.textContent || button.innerText || '');
    return step.options.find(function (opt) {
      const optText = normalize(opt.text);
      return btnText.includes(optText) || optText.includes(btnText);
    }) || null;
  }

  function originalEffects(score, missionKey) {
    const profile = MISSION_PROFILE[missionKey] || ['wisdom', 'courage', 'temperance'];
    if (Number(score) >= 2) return { [profile[0]]: 3, [profile[1]]: 2, [profile[2]]: 1 };
    if (Number(score) === 1) return { [profile[0]]: 1, [profile[1]]: 1 };
    return { [profile[0]]: -2, [profile[1]]: -1 };
  }

  function questionProfile(missionKey, q) {
    const p = MISSION_PROFILE[missionKey] || ['wisdom', 'courage', 'temperance'];
    const patterns = [
      [p[0], p[1], p[2]],
      [p[1], p[2], p[0]],
      [p[2], p[0], p[1]],
      [p[0], p[2], p[1]],
      [p[1], p[0], p[2]]
    ];
    return patterns[Math.max(0, Math.min(4, Number(q || 1) - 1))];
  }

  function fixedEffects(score, missionKey, q) {
    const p = questionProfile(missionKey, q);
    const n = Number(score);

    if (n >= 2) {
      const patterns = [
        { [p[0]]: 3, [p[1]]: 2, [p[2]]: 1 },
        { [p[0]]: 2, [p[1]]: 3, [p[2]]: 1 },
        { [p[0]]: 2, [p[1]]: 1, [p[2]]: 3 },
        { [p[0]]: 2, [p[1]]: 2, [p[2]]: 2 },
        { [p[0]]: 4, [p[1]]: 2, [p[2]]: 1 }
      ];
      return patterns[Math.max(0, Math.min(4, Number(q || 1) - 1))];
    }

    if (n === 1) {
      const patterns = [
        { [p[0]]: 1, [p[1]]: 1 },
        { [p[0]]: 1, [p[2]]: 1 },
        { [p[1]]: 1, [p[2]]: 1 },
        { [p[0]]: 1 },
        { [p[1]]: 1, [p[2]]: 1 }
      ];
      return patterns[Math.max(0, Math.min(4, Number(q || 1) - 1))];
    }

    const badPatterns = [
      { [p[0]]: -2, [p[1]]: -1 },
      { [p[1]]: -2, [p[2]]: -1 },
      { [p[2]]: -2, [p[0]]: -1 },
      { [p[0]]: -1, [p[1]]: -1, [p[2]]: -1 },
      { [p[1]]: -2, [p[0]]: -1 }
    ];
    return badPatterns[Math.max(0, Math.min(4, Number(q || 1) - 1))];
  }

  function subtractEffects(a, b) {
    const out = {};
    Object.keys(Object.assign({}, a, b)).forEach(function (key) {
      const diff = Number(a[key] || 0) - Number(b[key] || 0);
      if (diff) out[key] = diff;
    });
    return out;
  }

  function addToSession(missionKey, q, effects) {
    const session = readJson(SESSION_KEY, { missionKey: '', answered: {}, totals: {} });
    if (session.missionKey !== missionKey) {
      session.missionKey = missionKey;
      session.answered = {};
      session.totals = {};
    }

    const qKey = String(q);
    if (session.answered[qKey]) return session;
    session.answered[qKey] = true;

    Object.keys(effects).forEach(function (key) {
      session.totals[key] = Number(session.totals[key] || 0) + Number(effects[key] || 0);
    });

    saveJson(SESSION_KEY, session);
    return session;
  }

  function renderEffectBox(effects, title) {
    setTimeout(function () {
      const old = document.getElementById('virtueChangeBox');
      if (old) old.remove();

      const pills = Object.keys(effects).filter(function (key) { return effects[key] !== 0; }).map(function (key) {
        const v = VIRTUES[key] || { icon: '✨', name: key };
        const amount = Number(effects[key] || 0);
        return '<span class="virtue-change-pill ' + (amount >= 0 ? 'up' : 'down') + '">' + esc(v.icon + ' ' + v.name + ' ' + (amount > 0 ? '+' : '') + amount) + '</span>';
      }).join('');

      const html = '<div id="virtueChangeBox" class="virtue-change-box animate-in">' +
        '<strong>' + esc(title || '能力值變化') + '</strong>' +
        '<div class="virtue-change-list">' + pills + '</div>' +
      '</div>';

      const review = document.getElementById('reviewBoxInline');
      const target = review && !review.classList.contains('hidden') ? review : document.getElementById('asdBox');
      if (target) target.insertAdjacentHTML('afterend', html);
    }, 180);
  }

  function renderMissionTotal(session) {
    if (!session || !session.totals) return;
    setTimeout(function () {
      renderEffectBox(session.totals, '本任務能力值總變化');
    }, 850);
  }

  function handleChoiceClick(event) {
    const choices = document.getElementById('asdChoices');
    if (!choices || !choices.contains(event.target)) return;

    const button = event.target.closest('button');
    if (!button) return;

    const missionKey = detectMission();
    if (!missionKey) return;

    const q = getQuestionNumber();
    const clickKey = missionKey + ':' + q;
    if (fixedAnswered.has(clickKey)) return;

    const option = findOption(button, missionKey, q);
    if (!option) return;

    fixedAnswered.add(clickKey);

    const oldEffects = originalEffects(option.score, missionKey);
    const newEffects = fixedEffects(option.score, missionKey, q);
    const correctionDelta = subtractEffects(newEffects, oldEffects);

    // virtue-ability-system.js has already applied the old effect in capture phase;
    // apply only the difference here so the saved stats become the corrected values.
    addStats(correctionDelta);

    const session = addToSession(missionKey, q, newEffects);
    renderEffectBox(newEffects, '第 ' + q + ' 題能力值變化');

    if (q >= 5) {
      renderMissionTotal(session);
    }
  }

  function patchStartGame() {
    if (typeof window.startAsdGame === 'function' && !window.startAsdGame.__abilityChangeFixPatched) {
      const original = window.startAsdGame;
      window.startAsdGame = function (missionKey) {
        currentMissionKey = missionKey;
        fixedAnswered.clear();
        saveJson(SESSION_KEY, { missionKey: missionKey, answered: {}, totals: {} });
        return original.apply(this, arguments);
      };
      window.startAsdGame.__abilityChangeFixPatched = true;
    }

    if (typeof window.startRpgMission === 'function' && !window.startRpgMission.__abilityChangeFixPatched) {
      const originalRpg = window.startRpgMission;
      window.startRpgMission = function (missionKey) {
        currentMissionKey = missionKey;
        fixedAnswered.clear();
        saveJson(SESSION_KEY, { missionKey: missionKey, answered: {}, totals: {} });
        return originalRpg.apply(this, arguments);
      };
      window.startRpgMission.__abilityChangeFixPatched = true;
    }
  }

  function install() {
    patchStartGame();
    setTimeout(patchStartGame, 300);
    setTimeout(patchStartGame, 1000);
  }

  document.addEventListener('click', handleChoiceClick, true);

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
