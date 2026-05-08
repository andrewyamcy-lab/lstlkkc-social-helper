// /virtue-system.js
// 6大美德 ability system based on 24 character strengths.
// Default: each virtue starts at 50 / 100.
// Each answered question changes virtue values based on the selected answer score and mission type.

(function () {
  const STORAGE_KEY = 'asd_school_virtues_v1';
  const HISTORY_KEY = 'asd_school_virtue_history_v1';

  const VIRTUES = {
    wisdom: { icon: '🧠', name: '智慧', desc: '思考清楚、解決問題、從經驗中學習。' },
    courage: { icon: '🦁', name: '勇氣', desc: '敢於開口、嘗試、求助和面對困難。' },
    humanity: { icon: '💛', name: '仁愛', desc: '關心別人、表達善意和理解他人感受。' },
    justice: { icon: '⚖️', name: '公義', desc: '公平合作、尊重規則和照顧群體。' },
    temperance: { icon: '🌱', name: '節制', desc: '保持冷靜、控制衝動和尊重界線。' },
    transcendence: { icon: '✨', name: '超越', desc: '保持希望、感恩、幽默和正向意義。' }
  };

  const VIRTUE_STRENGTHS = {
    wisdom: ['創造力', '好奇心', '判斷力', '愛學習', '洞察力'],
    courage: ['勇敢', '堅毅', '誠實', '熱情'],
    humanity: ['愛', '善良', '社交智慧'],
    justice: ['團隊合作', '公平', '領導力'],
    temperance: ['寬恕', '謙遜', '謹慎', '自律'],
    transcendence: ['欣賞美', '感恩', '希望', '幽默', '意義感']
  };

  const MISSION_VIRTUES = {
    start: ['courage', 'humanity', 'wisdom'],
    refuse: ['temperance', 'courage', 'humanity'],
    conflict: ['temperance', 'justice', 'courage'],
    respond: ['humanity', 'wisdom', 'courage'],
    groupwork: ['justice', 'humanity', 'courage'],
    help: ['wisdom', 'courage', 'temperance'],
    lunch: ['humanity', 'courage', 'justice'],
    homework: ['wisdom', 'temperance', 'courage'],
    queueJump: ['justice', 'temperance', 'courage'],
    peGrouping: ['courage', 'justice', 'temperance'],
    whatsappIgnored: ['temperance', 'wisdom', 'humanity'],
    borrowedNoReturn: ['temperance', 'justice', 'courage'],
    academicQuestionOnly: ['wisdom', 'temperance', 'justice'],
    copyHomework: ['justice', 'courage', 'temperance'],
    quietSpace: ['temperance', 'courage', 'humanity'],
    disagree: ['justice', 'humanity', 'wisdom'],
    teasing: ['temperance', 'courage', 'humanity'],
    bumped: ['temperance', 'humanity', 'justice'],
    losingGame: ['temperance', 'justice', 'transcendence'],
    teacherReminder: ['temperance', 'wisdom', 'courage'],
    lostItem: ['wisdom', 'temperance', 'courage']
  };

  let currentMissionKey = '';
  let lastAppliedToken = '';

  function defaultStats() {
    return {
      wisdom: 50,
      courage: 50,
      humanity: 50,
      justice: 50,
      temperance: 50,
      transcendence: 50
    };
  }

  function readJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function clamp(value) {
    return Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
  }

  function getVirtueStats() {
    const stored = readJson(STORAGE_KEY, {});
    const stats = defaultStats();
    Object.keys(stats).forEach((key) => {
      if (typeof stored[key] !== 'undefined') stats[key] = clamp(stored[key]);
    });
    writeJson(STORAGE_KEY, stats);
    return stats;
  }

  function saveVirtueStats(stats) {
    const clean = defaultStats();
    Object.keys(clean).forEach((key) => {
      clean[key] = clamp(stats[key]);
    });
    writeJson(STORAGE_KEY, clean);
    return clean;
  }

  function resetVirtueStats() {
    const stats = defaultStats();
    writeJson(STORAGE_KEY, stats);
    writeJson(HISTORY_KEY, []);
    return stats;
  }

  function normalizeText(text) {
    return String(text || '').replace(/\s+/g, '').replace(/[A-D][\.．、]/g, '').trim();
  }

  function getQuestionIndexFromDom() {
    const badge = document.getElementById('questionBadgeBig');
    const text = badge ? badge.textContent || '' : '';
    const match = text.match(/第\s*(\d+)\s*\/\s*\d+\s*題/);
    if (match) return Math.max(0, Number(match[1]) - 1);

    const activePill = document.querySelector('.question-pill.active, .question-pill.current');
    if (activePill && activePill.dataset && activePill.dataset.q) {
      return Math.max(0, Number(activePill.dataset.q) - 1);
    }

    return 0;
  }

  function getMissionKey() {
    if (currentMissionKey) return currentMissionKey;
    try {
      const title = document.querySelector('#gameScreen h2, #asdBox')?.textContent || '';
      if (typeof asdGames !== 'undefined') {
        const found = Object.keys(asdGames).find((key) => title.includes(asdGames[key].title));
        if (found) return found;
      }
    } catch (error) {}
    return '';
  }

  function findSelectedOption(button) {
    const missionKey = getMissionKey();
    const questionIndex = getQuestionIndexFromDom();
    const clickedText = normalizeText(button ? button.textContent : '');

    try {
      if (typeof asdGames === 'undefined' || !asdGames[missionKey] || !asdGames[missionKey].steps) return null;
      const step = asdGames[missionKey].steps[questionIndex];
      if (!step || !Array.isArray(step.options)) return null;

      let option = step.options.find((item) => normalizeText(item.text) === clickedText);
      if (!option) {
        option = step.options.find((item) => clickedText.includes(normalizeText(item.text)) || normalizeText(item.text).includes(clickedText));
      }

      return option ? { missionKey, questionIndex, option } : null;
    } catch (error) {
      return null;
    }
  }

  function effectFromScore(missionKey, score) {
    const virtues = MISSION_VIRTUES[missionKey] || ['wisdom', 'courage', 'temperance'];
    const main = virtues[0];
    const second = virtues[1];
    const third = virtues[2];
    const effects = {};
    const numericScore = Number(score || 0);

    if (numericScore >= 2) {
      effects[main] = 3;
      if (second) effects[second] = 2;
      if (third) effects[third] = 1;
    } else if (numericScore === 1) {
      effects[main] = 1;
      if (second) effects[second] = 1;
    } else {
      effects[main] = -2;
      if (second) effects[second] = -1;
      if (third === 'courage') effects[third] = 1;
    }

    return effects;
  }

  function applyEffects(effects) {
    const before = getVirtueStats();
    const after = { ...before };
    Object.keys(effects).forEach((key) => {
      if (typeof after[key] !== 'undefined') {
        after[key] = clamp(after[key] + Number(effects[key] || 0));
      }
    });
    saveVirtueStats(after);
    return { before, after };
  }

  function saveHistory(entry) {
    const history = readJson(HISTORY_KEY, []);
    history.push({ ...entry, time: new Date().toISOString() });
    writeJson(HISTORY_KEY, history.slice(-120));
  }

  function effectLines(effects) {
    return Object.keys(effects).filter((key) => effects[key]).map((key) => {
      const meta = VIRTUES[key];
      const value = Number(effects[key]);
      return `<div class="virtue-change-line"><span>${meta.icon} ${meta.name}</span><strong class="${value >= 0 ? 'positive' : 'negative'}">${value >= 0 ? '+' : ''}${value}</strong></div>`;
    }).join('');
  }

  function showChangeBox(effects, score) {
    const existing = document.getElementById('virtueChangeBox');
    if (existing) existing.remove();

    const target = document.getElementById('reviewBoxInline') || document.getElementById('calmBox') || document.getElementById('hintBox') || document.getElementById('asdBox');
    if (!target || !target.parentElement) return;

    const qualityText = Number(score) >= 2 ? '你這次用了合適的社交方法。' : Number(score) === 1 ? '這個回應有可取之處，也有進步空間。' : '這個回應可能會令情況變得較困難。';
    const box = document.createElement('div');
    box.id = 'virtueChangeBox';
    box.className = 'virtue-change-box animate-in';
    box.innerHTML = `<div class="virtue-change-title">六大美德變化</div><p>${qualityText}</p><div class="virtue-change-list">${effectLines(effects)}</div>`;

    target.insertAdjacentElement('afterend', box);
  }

  function handleChoiceClick(event) {
    const button = event.target && event.target.closest ? event.target.closest('#asdChoices button') : null;
    if (!button) return;

    const selected = findSelectedOption(button);
    if (!selected) return;

    const optionText = normalizeText(selected.option.text);
    const token = `${selected.missionKey}:${selected.questionIndex}:${optionText}`;
    if (token === lastAppliedToken) return;
    lastAppliedToken = token;

    const effects = effectFromScore(selected.missionKey, selected.option.score);
    const result = applyEffects(effects);
    saveHistory({ missionKey: selected.missionKey, questionIndex: selected.questionIndex, optionText: selected.option.text, score: selected.option.score, effects, before: result.before, after: result.after });

    setTimeout(() => {
      showChangeBox(effects, selected.option.score);
      window.dispatchEvent(new CustomEvent('virtueStatsUpdated', { detail: { effects, stats: result.after } }));
    }, 120);
  }

  function patchStartGame() {
    if (typeof window.startAsdGame !== 'function' || window.startAsdGame.__virtuePatched) return;
    const original = window.startAsdGame;
    window.startAsdGame = function (gameKey) {
      currentMissionKey = gameKey;
      lastAppliedToken = '';
      return original.apply(this, arguments);
    };
    window.startAsdGame.__virtuePatched = true;
  }

  function injectStyle() {
    if (document.getElementById('virtueSystemStyle')) return;
    const style = document.createElement('style');
    style.id = 'virtueSystemStyle';
    style.textContent = `
      .virtue-change-box {
        margin: 12px 0;
        padding: 14px 16px;
        border-radius: 20px;
        background: linear-gradient(180deg, rgba(255,255,255,0.86), rgba(245,251,255,0.72));
        border: 1px solid rgba(255,255,255,0.84);
        box-shadow: 0 14px 30px rgba(29,53,87,0.10), inset 0 1px 0 rgba(255,255,255,0.95);
      }
      .virtue-change-title { font-weight: 950; color: var(--primary-dark); margin-bottom: 4px; }
      .virtue-change-box p { margin: 0 0 8px; color: var(--muted); font-weight: 750; }
      .virtue-change-list { display: grid; gap: 6px; }
      .virtue-change-line { display:flex; justify-content:space-between; align-items:center; gap:12px; padding:8px 10px; border-radius:14px; background:rgba(255,255,255,0.62); }
      .virtue-change-line strong.positive { color:#1f8a00; }
      .virtue-change-line strong.negative { color:#d92d20; }
    `;
    document.head.appendChild(style);
  }

  function installVirtueSystem() {
    getVirtueStats();
    injectStyle();
    patchStartGame();
    document.removeEventListener('click', handleChoiceClick, true);
    document.addEventListener('click', handleChoiceClick, true);
  }

  window.VIRTUES_META = VIRTUES;
  window.VIRTUE_STRENGTHS = VIRTUE_STRENGTHS;
  window.getVirtueStats = getVirtueStats;
  window.resetVirtueStats = resetVirtueStats;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installVirtueSystem);
  } else {
    installVirtueSystem();
  }

  window.addEventListener('load', function () {
    installVirtueSystem();
    setTimeout(installVirtueSystem, 500);
    setTimeout(installVirtueSystem, 1500);
  });
})();
