// /character-tabs-no-flash.js
// Fix for「我的角色」tabs:
// Switch only the right-side tab panel instead of re-rendering the whole page.
// This prevents the white flash / zoom-out effect and keeps the MP4 video loaded.

(function () {
  const RPG_KEY = 'asd_school_rpg_progress_v1';
  const BADGE_KEY = 'asd_school_badges_v2';
  const SELECTED_KEY = 'asd_school_selected_character_v1';
  const TAB_KEY = 'asd_school_character_tab_v1';
  const TOTAL_MISSIONS = 20;

  const CHARACTERS = {
    girl: { name: '心心', label: '女學生', role: '社交練習生' },
    boy: { name: '謙謙', label: '男學生', role: '社交練習生' }
  };

  const TABS = [
    { id: 'profile', label: '角色', icon: '🪪' },
    { id: 'skills', label: '能力值', icon: '📊' },
    { id: 'traits', label: '性格特質', icon: '✨' },
    { id: 'records', label: '冒險紀錄', icon: '📜' }
  ];

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

  const STAT_META = {
    communication: { icon: '🗣️', name: '溝通力', trait: '主動開口' },
    calm: { icon: '🌱', name: '冷靜力', trait: '深呼吸護盾' },
    teamwork: { icon: '🤝', name: '合作力', trait: '合作參與' },
    boundary: { icon: '🛡️', name: '界線力', trait: '界線守護' },
    problem: { icon: '🔍', name: '解難力', trait: '求助達人' }
  };

  const MISSION_STAT = {
    start: 'communication', respond: 'communication', whatsappIgnored: 'communication', academicOnly: 'communication',
    refuse: 'boundary', conflict: 'boundary', copyHomework: 'boundary', quietSpace: 'boundary',
    groupwork: 'teamwork', lunch: 'teamwork', peGrouping: 'teamwork', disagree: 'teamwork',
    teasing: 'calm', bumped: 'calm', losingGame: 'calm', teacherReminder: 'calm',
    help: 'problem', homework: 'problem', queueJump: 'problem', lostItem: 'problem'
  };

  function readJson(key) {
    try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch (e) { return {}; }
  }

  function esc(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function getProgress() {
    const p = readJson(RPG_KEY);
    return { completed: p.completed || {}, stars: p.stars || {}, expAwards: p.expAwards || {} };
  }

  function getTotalExp(p) {
    return Object.keys(p.expAwards).reduce((sum, key) => sum + Number(p.expAwards[key] || 0), 0);
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
    return Object.keys(p.completed).filter((key) => p.completed[key]).length;
  }

  function threeStarCount(p) {
    return Object.keys(p.stars).filter((key) => Number(p.stars[key] || 0) >= 3).length;
  }

  function getBadges() {
    const b = readJson(BADGE_KEY);
    const progress = b.progress || {};
    return {
      stars: Object.keys(progress).reduce((sum, key) => sum + Math.min(3, Number(progress[key] || 0)), 0),
      unlocked: Object.keys(progress).filter((key) => Number(progress[key] || 0) >= 3).length
    };
  }

  function statScores(p) {
    const scores = { communication: 0, calm: 0, teamwork: 0, boundary: 0, problem: 0 };
    Object.keys(p.stars).forEach((key) => {
      const stat = MISSION_STAT[key] || 'problem';
      scores[stat] += Math.min(3, Number(p.stars[key] || 0));
    });
    return scores;
  }

  function missionTitle(key) {
    try {
      return asdGames && asdGames[key] && asdGames[key].title ? asdGames[key].title : key;
    } catch (e) {
      return key;
    }
  }

  function selectedCharacter() {
    const id = localStorage.getItem(SELECTED_KEY) || 'girl';
    return CHARACTERS[id] || CHARACTERS.girl;
  }

  function mood(info, completed, threeStar) {
    if (threeStar >= 10) return { icon: '💪', title: '充滿自信', text: '你已經完成很多高質素任務，社交技能越來越穩定。' };
    if (completed >= 8) return { icon: '😊', title: '準備好社交', text: '你已經熟習不少校園情境，可以挑戰更多任務。' };
    if (info.level >= 3) return { icon: '🌱', title: '正在成長', text: '你正在慢慢累積經驗，保持練習就會更自然。' };
    return { icon: '😐', title: '有少少緊張', text: '先由簡單任務開始，慢慢建立信心。' };
  }

  function expBar(info) {
    return `
      <div class="sims-exp-wrap">
        <div class="sims-exp-info"><strong>Lv. ${info.level}</strong><span>EXP ${info.totalExp}${info.isMax ? ' / MAX' : ' / ' + info.nextExp}</span></div>
        <div class="sims-exp-bar"><div class="sims-exp-fill" style="width:${info.percent}%"></div></div>
      </div>`;
  }

  function skillRows(scores) {
    return Object.keys(STAT_META).map((key) => {
      const meta = STAT_META[key];
      const value = Number(scores[key] || 0);
      const percent = Math.min(100, Math.round((Math.min(12, value) / 12) * 100));
      return `
        <div class="sims-skill-row">
          <div class="sims-skill-name"><span>${meta.icon}</span><strong>${meta.name}</strong></div>
          <div class="sims-skill-bar"><div class="sims-skill-fill" style="width:${percent}%"></div></div>
          <div class="sims-skill-value">${value}</div>
        </div>`;
    }).join('');
  }

  function traitCards(scores) {
    return Object.keys(STAT_META).map((key) => {
      const meta = STAT_META[key];
      const unlocked = Number(scores[key] || 0) >= 3;
      return `
        <div class="sims-trait ${unlocked ? 'unlocked' : 'locked'}">
          <span class="sims-trait-icon">${meta.icon}</span>
          <div><strong>${meta.trait}</strong><small>${unlocked ? '已解鎖' : '未解鎖｜需要更多練習'}</small></div>
        </div>`;
    }).join('');
  }

  function recentRecords(p) {
    const keys = Object.keys(p.completed).filter((key) => p.completed[key]).slice(-8).reverse();
    if (!keys.length) return '<div class="sims-empty-note">未完成任務。開始第一個 RPG 任務後，這裡會顯示你的冒險紀錄。</div>';
    return keys.map((key) => {
      const stars = Number(p.stars[key] || 0);
      let starText = '';
      for (let i = 1; i <= 3; i += 1) starText += i <= stars ? '★' : '☆';
      return `<div class="sims-mission-item"><span>${esc(missionTitle(key))}</span><strong>${starText}</strong></div>`;
    }).join('');
  }

  function summaryGrid(completed, threeStar, badges) {
    return `
      <div class="sims-summary-grid">
        <div><strong>${completed} / ${TOTAL_MISSIONS}</strong><span>任務完成</span></div>
        <div><strong>${threeStar} / ${TOTAL_MISSIONS}</strong><span>3 星任務</span></div>
        <div><strong>${badges.stars} / 15</strong><span>徽章星數</span></div>
      </div>`;
  }

  function buildPanel(tabId) {
    const p = getProgress();
    const info = getLevelInfo(getTotalExp(p));
    const completed = completedCount(p);
    const threeStar = threeStarCount(p);
    const badges = getBadges();
    const scores = statScores(p);
    const character = selectedCharacter();
    const moodNow = mood(info, completed, threeStar);

    if (tabId === 'skills') {
      return `
        <div class="sims-panel sims-tab-panel">
          <div class="panel-badge">能力值</div><h3>社交能力值</h3>
          <p class="sims-panel-note">完成不同任務會提升相應能力。</p>
          <div class="sims-skill-list">${skillRows(scores)}</div>
        </div>`;
    }

    if (tabId === 'traits') {
      return `
        <div class="sims-panel sims-tab-panel">
          <div class="panel-badge">性格特質</div><h3>已解鎖 Traits</h3>
          <p class="sims-panel-note">每項能力累積到 3 分後會解鎖一個特質。</p>
          <div class="sims-trait-grid">${traitCards(scores)}</div>
        </div>`;
    }

    if (tabId === 'records') {
      return `
        <div class="sims-panel sims-tab-panel">
          <div class="panel-badge">冒險紀錄</div><h3>最近完成任務</h3>
          <p class="sims-panel-note">這裡記錄最近完成的 RPG 任務。</p>
          <div class="sims-mission-list">${recentRecords(p)}</div>
        </div>`;
    }

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

  function setTabWithoutFlash(tabId) {
    if (!TABS.some((tab) => tab.id === tabId)) return;
    localStorage.setItem(TAB_KEY, tabId);

    const rightPanel = document.querySelector('#characterScreen.active .sims-tab-right');
    const oldPanel = rightPanel && rightPanel.querySelector('.sims-tab-panel');

    document.querySelectorAll('#characterScreen.active .sims-tab-btn').forEach((button) => {
      const isActive = button.getAttribute('onclick') && button.getAttribute('onclick').includes(`'${tabId}'`);
      button.classList.toggle('active', Boolean(isActive));
    });

    if (oldPanel) {
      oldPanel.outerHTML = buildPanel(tabId);
    } else if (rightPanel) {
      const actions = rightPanel.querySelector('.sims-tab-actions');
      if (actions) actions.insertAdjacentHTML('beforebegin', buildPanel(tabId));
    }
  }

  function installNoFlashTabs() {
    window.setSimsCharacterTab = setTabWithoutFlash;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installNoFlashTabs);
  } else {
    installNoFlashTabs();
  }

  window.addEventListener('load', function () {
    installNoFlashTabs();
    setTimeout(installNoFlashTabs, 400);
    setTimeout(installNoFlashTabs, 1000);
  });
})();
