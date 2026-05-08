// /virtue-character-page.js
// Connects the 6大美德 system to「我的角色」tabs.
// Replaces 能力值 with 六大美德 and 性格特質 with 性格強項.

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

  function readJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
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

  function totalExp(p) {
    return Object.keys(p.expAwards).reduce((sum, key) => sum + Number(p.expAwards[key] || 0), 0);
  }

  function levelInfo(exp) {
    let current = LEVELS[0];
    let next = LEVELS[1];
    LEVELS.forEach((item, index) => {
      if (exp >= item.exp) { current = item; next = LEVELS[index + 1] || null; }
    });
    const base = current.exp;
    const nextExp = next ? next.exp : current.exp;
    const percent = next ? Math.min(100, Math.round(((exp - base) / Math.max(1, nextExp - base)) * 100)) : 100;
    return { level: current.level, title: current.title, totalExp: exp, nextExp, percent, isMax: !next };
  }

  function selectedCharacter() {
    const id = localStorage.getItem(SELECTED_KEY) || 'girl';
    return CHARACTERS[id] || CHARACTERS.girl;
  }

  function completedCount(p) {
    return Object.keys(p.completed).filter((key) => p.completed[key]).length;
  }

  function threeStarCount(p) {
    return Object.keys(p.stars).filter((key) => Number(p.stars[key] || 0) >= 3).length;
  }

  function averageVirtue(stats) {
    const keys = Object.keys(stats || {});
    if (!keys.length) return 50;
    return Math.round(keys.reduce((sum, key) => sum + Number(stats[key] || 0), 0) / keys.length);
  }

  function virtueStage(value) {
    const score = Number(value || 0);
    if (score >= 80) return '社交強項';
    if (score >= 60) return '表現良好';
    if (score >= 40) return '基礎穩定';
    return '需要練習';
  }

  function mood(info, completed, threeStar, virtueAverage) {
    if (virtueAverage >= 75 || threeStar >= 10) return { icon: '💪', title: '充滿自信', text: '你的美德能力正在穩定成長，能用更成熟的方法面對校園情境。' };
    if (completed >= 8 || virtueAverage >= 60) return { icon: '😊', title: '準備好社交', text: '你已經累積不少練習，能嘗試挑戰更多任務。' };
    if (info.level >= 3) return { icon: '🌱', title: '正在成長', text: '你正在慢慢累積經驗，保持練習就會更自然。' };
    return { icon: '😐', title: '有少少緊張', text: '先由簡單任務開始，慢慢建立信心。' };
  }

  function missionTitle(key) {
    try { return asdGames && asdGames[key] && asdGames[key].title ? asdGames[key].title : key; } catch (e) { return key; }
  }

  function expBar(info) {
    return `
      <div class="sims-exp-wrap">
        <div class="sims-exp-info"><strong>Lv. ${info.level}</strong><span>EXP ${info.totalExp}${info.isMax ? ' / MAX' : ' / ' + info.nextExp}</span></div>
        <div class="sims-exp-bar"><div class="sims-exp-fill" style="width:${info.percent}%"></div></div>
      </div>`;
  }

  function summaryGrid(completed, threeStar, badges, avg) {
    return `
      <div class="sims-summary-grid virtue-summary-grid">
        <div><strong>${completed} / ${TOTAL_MISSIONS}</strong><span>任務完成</span></div>
        <div><strong>${threeStar} / ${TOTAL_MISSIONS}</strong><span>3 星任務</span></div>
        <div><strong>${avg} / 100</strong><span>美德平均值</span></div>
      </div>`;
  }

  function virtueRows() {
    const meta = window.VIRTUES_META || {};
    const stats = typeof window.getVirtueStats === 'function' ? window.getVirtueStats() : {};
    return Object.keys(meta).map((key) => {
      const item = meta[key];
      const value = Number(stats[key] || 50);
      return `
        <div class="virtue-stat-row">
          <div class="virtue-stat-head">
            <div><strong>${item.icon} ${item.name}</strong><small>${esc(item.desc)}</small></div>
            <span>${value} / 100</span>
          </div>
          <div class="virtue-stat-bar"><div class="virtue-stat-fill" style="width:${value}%"></div></div>
          <div class="virtue-stat-stage">${virtueStage(value)}</div>
        </div>`;
    }).join('');
  }

  function unlockedStrengthsHtml() {
    const meta = window.VIRTUES_META || {};
    const strengthMap = window.VIRTUE_STRENGTHS || {};
    const stats = typeof window.getVirtueStats === 'function' ? window.getVirtueStats() : {};

    return Object.keys(meta).map((virtueKey) => {
      const virtue = meta[virtueKey];
      const score = Number(stats[virtueKey] || 50);
      const strengths = strengthMap[virtueKey] || [];
      const unlockCount = score >= 90 ? strengths.length : score >= 80 ? Math.min(strengths.length, 3) : score >= 70 ? Math.min(strengths.length, 2) : score >= 60 ? 1 : 0;
      const cards = strengths.map((name, index) => {
        const unlocked = index < unlockCount;
        return `<span class="strength-chip ${unlocked ? 'unlocked' : 'locked'}">${unlocked ? '✅' : '🔒'} ${esc(name)}</span>`;
      }).join('');
      return `
        <div class="strength-group">
          <div class="strength-group-title"><strong>${virtue.icon} ${virtue.name}</strong><span>${score} / 100</span></div>
          <div class="strength-chip-grid">${cards}</div>
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

  function buildPanel(tabId) {
    const p = getProgress();
    const info = levelInfo(totalExp(p));
    const completed = completedCount(p);
    const threeStar = threeStarCount(p);
    const badges = getBadges();
    const character = selectedCharacter();
    const stats = typeof window.getVirtueStats === 'function' ? window.getVirtueStats() : {};
    const avg = averageVirtue(stats);
    const moodNow = mood(info, completed, threeStar, avg);

    if (tabId === 'skills') {
      return `
        <div class="sims-panel sims-tab-panel virtue-tab-panel">
          <div class="panel-badge">六大美德</div><h3>六大美德能力值</h3>
          <p class="sims-panel-note">所有美德由 50 / 100 開始。每答一題，都會根據你的選擇即時提升或調整。</p>
          <div class="virtue-stat-list">${virtueRows()}</div>
        </div>`;
    }

    if (tabId === 'traits') {
      return `
        <div class="sims-panel sims-tab-panel virtue-tab-panel">
          <div class="panel-badge">24 性格強項</div><h3>已解鎖性格強項</h3>
          <p class="sims-panel-note">六大美德提升後，會逐步解鎖相關的性格強項。</p>
          <div class="strength-group-list">${unlockedStrengthsHtml()}</div>
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
          <div><span>美德平均</span><strong>${avg} / 100</strong></div>
        </div>
        ${expBar(info)}
        <div class="sims-mood-card sims-inline-mood">
          <div class="sims-mood-icon">${moodNow.icon}</div>
          <div><span class="sims-label">今日狀態</span><h3>${moodNow.title}</h3><p>${moodNow.text}</p></div>
        </div>
        ${summaryGrid(completed, threeStar, badges, avg)}
      </div>`;
  }

  function updateTabLabels() {
    document.querySelectorAll('#characterScreen.active .sims-tab-btn').forEach((button) => {
      const text = button.textContent || '';
      if (text.includes('能力值')) button.innerHTML = '🌟 六大美德';
      if (text.includes('性格特質')) button.innerHTML = '✨ 性格強項';
    });
  }

  function setVirtueTab(tabId) {
    const valid = ['profile', 'skills', 'traits', 'records'];
    if (!valid.includes(tabId)) return;
    localStorage.setItem(TAB_KEY, tabId);

    document.querySelectorAll('#characterScreen.active .sims-tab-btn').forEach((button) => {
      const onclick = button.getAttribute('onclick') || '';
      button.classList.toggle('active', onclick.includes(`'${tabId}'`));
    });
    updateTabLabels();

    const oldPanel = document.querySelector('#characterScreen.active .sims-tab-panel');
    if (oldPanel) oldPanel.outerHTML = buildPanel(tabId);
  }

  function refreshActiveCharacterPanel() {
    if (!document.querySelector('#characterScreen.active')) return;
    updateTabLabels();
    const active = localStorage.getItem(TAB_KEY) || 'profile';
    setVirtueTab(active);
  }

  function injectStyle() {
    if (document.getElementById('virtueCharacterPageStyle')) return;
    const style = document.createElement('style');
    style.id = 'virtueCharacterPageStyle';
    style.textContent = `
      .virtue-stat-list { display:grid; gap:10px; }
      .virtue-stat-row { padding:12px; border-radius:18px; background:rgba(255,255,255,0.62); border:1px solid rgba(255,255,255,0.76); }
      .virtue-stat-head { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; }
      .virtue-stat-head strong { display:block; font-size:1rem; }
      .virtue-stat-head small { display:block; color:var(--muted); font-weight:750; margin-top:3px; line-height:1.35; }
      .virtue-stat-head span { font-weight:950; color:var(--primary-dark); white-space:nowrap; }
      .virtue-stat-bar { height:14px; margin-top:9px; border-radius:999px; overflow:hidden; background:rgba(169,205,242,0.42); box-shadow:inset 0 2px 5px rgba(29,53,87,0.10); }
      .virtue-stat-fill { height:100%; border-radius:inherit; background:linear-gradient(90deg,#39ff14,#00c48c,#64d2ff); }
      .virtue-stat-stage { margin-top:6px; color:var(--muted); font-size:.82rem; font-weight:850; }
      .strength-group-list { display:grid; gap:10px; }
      .strength-group { padding:12px; border-radius:18px; background:rgba(255,255,255,0.62); border:1px solid rgba(255,255,255,0.76); }
      .strength-group-title { display:flex; justify-content:space-between; align-items:center; gap:10px; margin-bottom:8px; }
      .strength-group-title span { color:var(--muted); font-weight:900; }
      .strength-chip-grid { display:flex; flex-wrap:wrap; gap:7px; }
      .strength-chip { padding:7px 10px; border-radius:999px; background:rgba(255,255,255,.74); border:1px solid rgba(255,255,255,.82); font-weight:850; font-size:.86rem; }
      .strength-chip.locked { opacity:.52; filter:grayscale(.7); }
      .strength-chip.unlocked { color:#083b00; background:linear-gradient(180deg, rgba(57,255,20,.28), rgba(255,255,255,.78)); }
      @media (min-width:1101px){ .virtue-tab-panel { min-height:390px !important; } }
    `;
    document.head.appendChild(style);
  }

  function patchShowCharacterScreen() {
    if (typeof window.showCharacterScreen !== 'function' || window.showCharacterScreen.__virtuePagePatched) return;
    const original = window.showCharacterScreen;
    window.showCharacterScreen = function () {
      const result = original.apply(this, arguments);
      setTimeout(refreshActiveCharacterPanel, 30);
      setTimeout(refreshActiveCharacterPanel, 250);
      return result;
    };
    window.showCharacterScreen.__virtuePagePatched = true;
  }

  function installVirtueCharacterPage() {
    injectStyle();
    patchShowCharacterScreen();
    window.setSimsCharacterTab = setVirtueTab;
    window.refreshVirtueCharacterPanel = refreshActiveCharacterPanel;
    refreshActiveCharacterPanel();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installVirtueCharacterPage);
  } else {
    installVirtueCharacterPage();
  }

  window.addEventListener('load', function () {
    installVirtueCharacterPage();
    setTimeout(installVirtueCharacterPage, 600);
    setTimeout(refreshActiveCharacterPanel, 1200);
  });

  window.addEventListener('virtueStatsUpdated', function () {
    if (document.querySelector('#characterScreen.active')) refreshActiveCharacterPanel();
  });
})();
