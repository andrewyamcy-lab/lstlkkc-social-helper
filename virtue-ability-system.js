// /virtue-ability-system.js
// 能力值 system based on 6大美德 + 24性格強項.
// Student-facing wording uses「能力值」instead of「六大美德」.
// Default ability value: 50 / 100.

(function () {
  const VIRTUE_KEY = 'asd_school_virtue_stats_v1';
  const TAB_KEY = 'asd_school_character_tab_v1';
  const SELECTED_KEY = 'asd_school_selected_character_v1';
  const RPG_KEY = 'asd_school_rpg_progress_v1';
  const BADGE_KEY = 'asd_school_badges_v2';
  const TOTAL_MISSIONS = 20;

  const VIRTUES = {
    wisdom: {
      icon: '🧠', name: '智慧', color: 'wisdom',
      desc: '能夠思考、判斷、學習和找出合適方法。',
      strengths: ['好奇心', '判斷力', '創造力', '愛學習', '洞察力']
    },
    courage: {
      icon: '🦁', name: '勇氣', color: 'courage',
      desc: '敢於開口、嘗試、求助和面對困難。',
      strengths: ['勇敢', '堅毅', '誠實', '熱情']
    },
    humanity: {
      icon: '💛', name: '仁愛', color: 'humanity',
      desc: '能夠關心別人、理解感受和友善回應。',
      strengths: ['愛', '善良', '社交智慧']
    },
    justice: {
      icon: '⚖️', name: '公義', color: 'justice',
      desc: '尊重公平、守規則、合作和照顧群體。',
      strengths: ['團隊合作', '公平', '領導力']
    },
    temperance: {
      icon: '🌱', name: '節制', color: 'temperance',
      desc: '能夠冷靜、自律、控制衝動和尊重界線。',
      strengths: ['寬恕', '謙遜', '謹慎', '自律']
    },
    transcendence: {
      icon: '✨', name: '超越', color: 'transcendence',
      desc: '能夠保持希望、感恩、幽默和看見事情意義。',
      strengths: ['欣賞美', '感恩', '希望', '幽默', '意義感']
    }
  };

  const DEFAULT_STATS = {
    wisdom: 50,
    courage: 50,
    humanity: 50,
    justice: 50,
    temperance: 50,
    transcendence: 50
  };

  const MISSION_VIRTUE_PROFILE = {
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

  const CHARACTERS = {
    girl: { name: '心心', label: '女學生', role: '社交練習生' },
    boy: { name: '謙謙', label: '男學生', role: '社交練習生' }
  };

  const LEVELS = [
    { level: 1, exp: 0, title: '新手冒險者' },
    { level: 2, exp: 50, title: '初級溝通者' },
    { level: 3, exp: 120, title: '校園探索者' },
    { level: 4, exp: 210, title: '冷靜練習生' },
    { level: 5, exp: 320, title: '合作小隊員' },
    { level: 6, exp: 460, title: '界線守護者' },
    { level: 7, exp: 620, title: '解難行動派' },
    { level: 8, exp: 800, title: '梁書社交勇者' },
    { level: 9, exp: 1000, title: '社交任務大師' },
    { level: 10, exp: 1250, title: '梁書傳說級勇者' }
  ];

  let currentMissionKey = '';
  const answeredInCurrentView = new Set();

  function readJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function saveJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function clamp(value) {
    return Math.max(0, Math.min(100, Number(value || 0)));
  }

  function getVirtueStats() {
    const saved = readJson(VIRTUE_KEY, null);
    const stats = Object.assign({}, DEFAULT_STATS, saved || {});
    Object.keys(DEFAULT_STATS).forEach((key) => {
      stats[key] = clamp(stats[key]);
    });
    saveJson(VIRTUE_KEY, stats);
    return stats;
  }

  function saveVirtueStats(stats) {
    const next = Object.assign({}, DEFAULT_STATS, stats || {});
    Object.keys(DEFAULT_STATS).forEach((key) => {
      next[key] = clamp(next[key]);
    });
    saveJson(VIRTUE_KEY, next);
    return next;
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function getProgress() {
    const p = readJson(RPG_KEY, {});
    return { completed: p.completed || {}, stars: p.stars || {}, expAwards: p.expAwards || {} };
  }

  function getBadges() {
    const b = readJson(BADGE_KEY, {});
    const progress = b.progress || {};
    return {
      stars: Object.keys(progress).reduce((sum, key) => sum + Math.min(3, Number(progress[key] || 0)), 0),
      unlocked: Object.keys(progress).filter((key) => Number(progress[key] || 0) >= 3).length
    };
  }

  function getTotalExp(p) {
    return Object.keys(p.expAwards || {}).reduce((sum, key) => sum + Number(p.expAwards[key] || 0), 0);
  }

  function getLevelInfo(exp) {
    let current = LEVELS[0];
    let next = LEVELS[1];
    LEVELS.forEach((item, index) => {
      if (exp >= item.exp) {
        current = item;
        next = LEVELS[index + 1] || null;
      }
    });
    const base = current.exp;
    const nextExp = next ? next.exp : current.exp;
    const percent = next ? Math.min(100, Math.round(((exp - base) / Math.max(1, nextExp - base)) * 100)) : 100;
    return { level: current.level, title: current.title, totalExp: exp, nextExp, percent, isMax: !next };
  }

  function completedCount(p) {
    return Object.keys(p.completed || {}).filter((key) => p.completed[key]).length;
  }

  function threeStarCount(p) {
    return Object.keys(p.stars || {}).filter((key) => Number(p.stars[key] || 0) >= 3).length;
  }

  function selectedCharacter() {
    const id = localStorage.getItem(SELECTED_KEY) || 'girl';
    return CHARACTERS[id] || CHARACTERS.girl;
  }

  function mood(info, completed, threeStar) {
    if (threeStar >= 10) return { icon: '💪', title: '充滿自信', text: '你已經完成很多高質素任務，社交能力越來越穩定。' };
    if (completed >= 8) return { icon: '😊', title: '準備好社交', text: '你已經熟習不少校園情境，可以挑戰更多任務。' };
    if (info.level >= 3) return { icon: '🌱', title: '正在成長', text: '你正在慢慢累積經驗，保持練習就會更自然。' };
    return { icon: '😐', title: '有少少緊張', text: '先由簡單任務開始，慢慢建立信心。' };
  }

  function getAbilityLevelText(value) {
    if (value >= 80) return '能力強項';
    if (value >= 60) return '表現良好';
    if (value >= 40) return '基礎穩定';
    return '需要練習';
  }

  function getStrengthUnlockText(value, index, total) {
    if (value >= 90) return '已完全解鎖';
    if (value >= 75 && index < Math.ceil(total * 0.75)) return '已解鎖';
    if (value >= 60 && index < Math.ceil(total * 0.45)) return '已解鎖';
    return '未解鎖';
  }

  function expBar(info) {
    return `
      <div class="sims-exp-wrap">
        <div class="sims-exp-info"><strong>Lv. ${info.level}</strong><span>EXP ${info.totalExp}${info.isMax ? ' / MAX' : ' / ' + info.nextExp}</span></div>
        <div class="sims-exp-bar"><div class="sims-exp-fill" style="width:${info.percent}%"></div></div>
      </div>`;
  }

  function summaryGrid(completed, threeStar, badges) {
    return `
      <div class="sims-summary-grid">
        <div><strong>${completed} / ${TOTAL_MISSIONS}</strong><span>任務完成</span></div>
        <div><strong>${threeStar} / ${TOTAL_MISSIONS}</strong><span>3 星任務</span></div>
        <div><strong>${badges.stars} / 15</strong><span>徽章星數</span></div>
      </div>`;
  }

  function virtueRows() {
    const stats = getVirtueStats();
    return Object.keys(VIRTUES).map((key) => {
      const virtue = VIRTUES[key];
      const value = stats[key];
      return `
        <div class="virtue-row virtue-${virtue.color}">
          <div class="virtue-name"><span>${virtue.icon}</span><strong>${virtue.name}</strong></div>
          <div class="virtue-bar"><div class="virtue-fill" style="width:${value}%"></div></div>
          <div class="virtue-score"><strong>${value}</strong><small>${getAbilityLevelText(value)}</small></div>
        </div>`;
    }).join('');
  }

  function strengthsGrid() {
    const stats = getVirtueStats();
    return Object.keys(VIRTUES).map((key) => {
      const virtue = VIRTUES[key];
      const value = stats[key];
      const strengths = virtue.strengths.map((strength, index) => {
        const status = getStrengthUnlockText(value, index, virtue.strengths.length);
        const unlocked = status !== '未解鎖';
        return `
          <span class="strength-chip ${unlocked ? 'unlocked' : 'locked'}">
            ${unlocked ? '✅' : '🔒'} ${strength}<small>${status}</small>
          </span>`;
      }).join('');

      return `
        <div class="strength-group virtue-${virtue.color}">
          <div class="strength-heading"><span>${virtue.icon}</span><strong>${virtue.name}</strong><small>${value}/100</small></div>
          <p>${virtue.desc}</p>
          <div class="strength-chip-wrap">${strengths}</div>
        </div>`;
    }).join('');
  }

  function missionTitle(key) {
    try {
      return asdGames && asdGames[key] && asdGames[key].title ? asdGames[key].title : key;
    } catch (error) {
      return key;
    }
  }

  function recentRecords(p) {
    const keys = Object.keys(p.completed || {}).filter((key) => p.completed[key]).slice(-8).reverse();
    if (!keys.length) return '<div class="sims-empty-note">未完成任務。開始第一個 RPG 任務後，這裡會顯示你的冒險紀錄。</div>';
    return keys.map((key) => {
      const stars = Number(p.stars[key] || 0);
      let starText = '';
      for (let i = 1; i <= 3; i += 1) starText += i <= stars ? '★' : '☆';
      return `<div class="sims-mission-item"><span>${escapeHtml(missionTitle(key))}</span><strong>${starText}</strong></div>`;
    }).join('');
  }

  function profilePanel() {
    const p = getProgress();
    const info = getLevelInfo(getTotalExp(p));
    const completed = completedCount(p);
    const threeStar = threeStarCount(p);
    const badges = getBadges();
    const character = selectedCharacter();
    const moodNow = mood(info, completed, threeStar);

    return `
      <div class="sims-profile-card sims-tab-panel">
        <div class="sims-name-row"><div><span class="sims-label">角色名稱</span><h3>${character.name}</h3></div><div class="sims-level-badge">Lv. ${info.level}</div></div>
        <div class="sims-info-grid">
          <div><span>角色</span><strong>${character.label}</strong></div>
          <div><span>稱號</span><strong>${info.title}</strong></div>
          <div><span>類型</span><strong>${character.role}</strong></div>
          <div><span>徽章</span><strong>${badges.unlocked} / 5</strong></div>
        </div>
        ${expBar(info)}
        <div class="sims-mood-card sims-inline-mood">
          <div class="sims-mood-icon">${moodNow.icon}</div>
          <div><span class="sims-label">今日狀態</span><h3>${moodNow.title}</h3><p>${moodNow.text}</p></div>
        </div>
        ${summaryGrid(completed, threeStar, badges)}
      </div>`;
  }

  function abilityPanel() {
    return `
      <div class="sims-panel sims-tab-panel virtue-tab-panel">
        <div class="panel-badge">能力值</div><h3>能力值</h3>
        <p class="sims-panel-note">能力值以六個方向呈現，每項預設為 50。完成問題後會根據你的選擇上升或下降。</p>
        <div class="virtue-list">${virtueRows()}</div>
      </div>`;
  }

  function strengthPanel() {
    return `
      <div class="sims-panel sims-tab-panel strength-tab-panel">
        <div class="panel-badge">性格強項</div><h3>24 性格強項</h3>
        <p class="sims-panel-note">能力值愈高，相關性格強項會逐步解鎖。</p>
        <div class="strength-grid">${strengthsGrid()}</div>
      </div>`;
  }

  function recordPanel() {
    const p = getProgress();
    return `
      <div class="sims-panel sims-tab-panel">
        <div class="panel-badge">冒險紀錄</div><h3>最近完成任務</h3>
        <p class="sims-panel-note">這裡記錄最近完成的 RPG 任務。</p>
        <div class="sims-mission-list">${recentRecords(p)}</div>
      </div>`;
  }

  function buildPanel(tabId) {
    if (tabId === 'skills') return abilityPanel();
    if (tabId === 'traits') return strengthPanel();
    if (tabId === 'records') return recordPanel();
    return profilePanel();
  }

  function updateTabLabels() {
    const tabButtons = document.querySelectorAll('#characterScreen .sims-tab-btn');
    tabButtons.forEach((button) => {
      const onclick = button.getAttribute('onclick') || '';
      if (onclick.includes("'skills'")) button.innerHTML = '📊 能力值';
      if (onclick.includes("'traits'")) button.innerHTML = '✨ 性格強項';
    });
  }

  function setCharacterTab(tabId) {
    if (!['profile', 'skills', 'traits', 'records'].includes(tabId)) return;
    localStorage.setItem(TAB_KEY, tabId);

    updateTabLabels();

    const rightPanel = document.querySelector('#characterScreen.active .sims-tab-right');
    const oldPanel = rightPanel && rightPanel.querySelector('.sims-tab-panel');

    document.querySelectorAll('#characterScreen.active .sims-tab-btn').forEach((button) => {
      const isActive = (button.getAttribute('onclick') || '').includes(`'${tabId}'`);
      button.classList.toggle('active', Boolean(isActive));
    });

    if (oldPanel) {
      oldPanel.outerHTML = buildPanel(tabId);
    } else if (rightPanel) {
      const actions = rightPanel.querySelector('.sims-tab-actions');
      if (actions) actions.insertAdjacentHTML('beforebegin', buildPanel(tabId));
    }
  }

  function getCurrentQuestionNumber() {
    const badge = document.getElementById('questionBadgeBig');
    const text = badge ? badge.textContent || '' : '';
    const match = text.match(/第\s*(\d+)/);
    return match ? Number(match[1]) : 1;
  }

  function normalizeText(value) {
    return String(value || '').replace(/\s+/g, '').replace(/[A-D][\.．、]/g, '').trim();
  }

  function findOptionByButton(button, missionKey, questionNumber) {
    const game = window.asdGames && window.asdGames[missionKey];
    const step = game && game.steps && game.steps[questionNumber - 1];
    if (!step || !Array.isArray(step.options)) return null;

    const btnText = normalizeText(button.textContent || button.innerText || '');
    return step.options.find((option) => {
      const optionText = normalizeText(option.text);
      return btnText.includes(optionText) || optionText.includes(btnText);
    }) || null;
  }

  function scoreToEffects(score, missionKey) {
    const profile = MISSION_VIRTUE_PROFILE[missionKey] || ['wisdom', 'courage', 'temperance'];
    const main = profile[0];
    const second = profile[1];
    const third = profile[2];

    if (Number(score) >= 2) {
      return { [main]: 3, [second]: 2, [third]: 1 };
    }

    if (Number(score) === 1) {
      return { [main]: 1, [second]: 1 };
    }

    return { [main]: -2, [second]: -1 };
  }

  function applyVirtueEffects(effects) {
    const before = getVirtueStats();
    const after = Object.assign({}, before);
    Object.keys(effects || {}).forEach((key) => {
      after[key] = clamp(Number(after[key] || 50) + Number(effects[key] || 0));
    });
    saveVirtueStats(after);
    return { before, after };
  }

  function effectHtml(effects) {
    const items = Object.keys(effects || {}).map((key) => {
      const virtue = VIRTUES[key];
      if (!virtue) return '';
      const amount = Number(effects[key] || 0);
      const sign = amount > 0 ? '+' : '';
      return `<span class="virtue-change-pill ${amount >= 0 ? 'up' : 'down'}">${virtue.icon} ${virtue.name} ${sign}${amount}</span>`;
    }).join('');

    return `
      <div id="virtueChangeBox" class="virtue-change-box animate-in">
        <strong>能力值變化</strong>
        <div class="virtue-change-list">${items}</div>
      </div>`;
  }

  function showVirtueChange(effects) {
    setTimeout(() => {
      const old = document.getElementById('virtueChangeBox');
      if (old) old.remove();

      const review = document.getElementById('reviewBoxInline');
      const calm = document.getElementById('calmBox');
      const hint = document.getElementById('hintBox');
      const target = review && !review.classList.contains('hidden') ? review : (calm || hint || document.getElementById('asdBox'));
      if (target) target.insertAdjacentHTML('afterend', effectHtml(effects));

      if (typeof window.setSimsCharacterTab === 'function' && document.querySelector('#characterScreen.active')) {
        window.setSimsCharacterTab(localStorage.getItem(TAB_KEY) || 'skills');
      }
    }, 80);
  }

  function handleChoiceClick(event) {
    const choices = document.getElementById('asdChoices');
    if (!choices || !choices.contains(event.target)) return;

    const button = event.target.closest('button');
    if (!button) return;

    const missionKey = currentMissionKey || detectMissionFromScreen();
    if (!missionKey) return;

    const questionNumber = getCurrentQuestionNumber();
    const uniqueKey = `${missionKey}:${questionNumber}`;
    if (answeredInCurrentView.has(uniqueKey)) return;

    const option = findOptionByButton(button, missionKey, questionNumber);
    if (!option) return;

    answeredInCurrentView.add(uniqueKey);
    const effects = scoreToEffects(option.score, missionKey);
    applyVirtueEffects(effects);
    showVirtueChange(effects);
  }

  function detectMissionFromScreen() {
    const title = document.querySelector('#gameScreen h2') ? document.querySelector('#gameScreen h2').textContent : '';
    try {
      const keys = Object.keys(window.asdGames || {});
      const found = keys.find((key) => title && window.asdGames[key] && title.includes(window.asdGames[key].title));
      return found || currentMissionKey;
    } catch (error) {
      return currentMissionKey;
    }
  }

  function patchStartGame() {
    if (typeof window.startAsdGame === 'function' && !window.startAsdGame.__virtuePatched) {
      const original = window.startAsdGame;
      window.startAsdGame = function (missionKey) {
        currentMissionKey = missionKey;
        answeredInCurrentView.clear();
        return original.apply(this, arguments);
      };
      window.startAsdGame.__virtuePatched = true;
    }
  }

  function injectStyles() {
    if (document.getElementById('virtueAbilityStyle')) return;
    const style = document.createElement('style');
    style.id = 'virtueAbilityStyle';
    style.textContent = `
      .virtue-list { display: grid; gap: 10px; }
      .virtue-row { display: grid; grid-template-columns: 110px 1fr 92px; align-items: center; gap: 10px; padding: 11px 12px; border-radius: 18px; background: rgba(255,255,255,0.62); border: 1px solid rgba(255,255,255,0.78); box-shadow: inset 0 1px 0 rgba(255,255,255,0.86); }
      .virtue-name { display: flex; align-items: center; gap: 8px; font-weight: 950; }
      .virtue-bar { height: 15px; border-radius: 999px; overflow: hidden; background: rgba(169,205,242,0.40); box-shadow: inset 0 2px 5px rgba(29,53,87,0.10); }
      .virtue-fill { height: 100%; border-radius: inherit; background: linear-gradient(90deg, #39ff14, #00c48c, #64d2ff); box-shadow: inset 0 3px 0 rgba(255,255,255,0.38); }
      .virtue-score { display: grid; text-align: right; line-height: 1.15; }
      .virtue-score strong { font-size: 1rem; color: var(--primary-dark); }
      .virtue-score small { color: var(--muted); font-weight: 850; font-size: 0.74rem; }
      .strength-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
      .strength-group { padding: 11px; border-radius: 18px; background: rgba(255,255,255,0.62); border: 1px solid rgba(255,255,255,0.78); }
      .strength-heading { display: flex; align-items: center; gap: 8px; }
      .strength-heading small { margin-left: auto; color: var(--muted); font-weight: 850; }
      .strength-group p { color: var(--muted); margin: 6px 0 8px; line-height: 1.45; font-size: 0.86rem; }
      .strength-chip-wrap { display: flex; flex-wrap: wrap; gap: 6px; }
      .strength-chip { display: inline-grid; gap: 2px; padding: 6px 8px; border-radius: 999px; font-size: 0.82rem; font-weight: 850; background: rgba(255,255,255,0.76); border: 1px solid rgba(255,255,255,0.82); }
      .strength-chip small { font-size: 0.68rem; color: var(--muted); }
      .strength-chip.locked { opacity: 0.56; filter: grayscale(0.6); }
      .virtue-change-box { margin: 12px 0; padding: 12px 14px; border-radius: 18px; background: linear-gradient(180deg, rgba(255,255,255,0.92), rgba(240,249,255,0.78)); border: 1px solid rgba(255,255,255,0.90); box-shadow: 0 12px 26px rgba(29,53,87,0.10), inset 0 1px 0 rgba(255,255,255,0.96); }
      .virtue-change-box strong { display: block; margin-bottom: 8px; color: var(--primary-dark); }
      .virtue-change-list { display: flex; flex-wrap: wrap; gap: 8px; }
      .virtue-change-pill { padding: 7px 10px; border-radius: 999px; font-weight: 950; background: rgba(255,255,255,0.78); border: 1px solid rgba(255,255,255,0.88); }
      .virtue-change-pill.up { color: #137300; box-shadow: 0 0 0 3px rgba(57,255,20,0.10); }
      .virtue-change-pill.down { color: #b42318; box-shadow: 0 0 0 3px rgba(255,59,48,0.08); }
      @media (max-width: 760px) { .virtue-row { grid-template-columns: 1fr; } .virtue-score { text-align: left; } .strength-grid { grid-template-columns: 1fr; } }
    `;
    document.head.appendChild(style);
  }

  function install() {
    getVirtueStats();
    injectStyles();
    patchStartGame();
    updateTabLabels();
    window.setSimsCharacterTab = setCharacterTab;
    window.getVirtueStats = getVirtueStats;
    window.resetVirtueStats = function () { saveVirtueStats(DEFAULT_STATS); };
  }

  document.addEventListener('click', handleChoiceClick, true);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install);
  } else {
    install();
  }

  window.addEventListener('load', function () {
    install();
    setTimeout(install, 400);
    setTimeout(install, 1000);
    setTimeout(install, 1800);
  });
})();
