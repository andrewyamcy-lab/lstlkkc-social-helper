// /virtue-ability-system.js
// 能力值 system based on 6大美德 + 24性格強項.
// Visible wording uses「能力值」, not「六大美德」.
// Important: the temporary horizontal 能力值 bars have been removed.
// The 能力值 tab now shows only a loading panel until virtue-radar-style.js replaces it with the RPG radar chart.

(function () {
  const VIRTUE_KEY = 'asd_school_virtue_stats_v1';
  const TAB_KEY = 'asd_school_character_tab_v1';
  const SELECTED_KEY = 'asd_school_selected_character_v1';
  const RPG_KEY = 'asd_school_rpg_progress_v1';
  const BADGE_KEY = 'asd_school_badges_v2';
  const TOTAL_MISSIONS = 20;

  const DEFAULT_STATS = { wisdom: 50, courage: 50, humanity: 50, justice: 50, temperance: 50, transcendence: 50 };
  const VIRTUES = {
    wisdom: { icon: '🧠', name: '智慧', desc: '思考、判斷、學習和找出合適方法。', strengths: ['好奇心', '判斷力', '創造力', '愛學習', '洞察力'] },
    courage: { icon: '🦁', name: '勇氣', desc: '敢於開口、嘗試、求助和面對困難。', strengths: ['勇敢', '堅毅', '誠實', '熱情'] },
    humanity: { icon: '💛', name: '仁愛', desc: '關心別人、理解感受和友善回應。', strengths: ['愛', '善良', '社交智慧'] },
    justice: { icon: '⚖️', name: '公義', desc: '尊重公平、守規則、合作和照顧群體。', strengths: ['團隊合作', '公平', '領導力'] },
    temperance: { icon: '🌱', name: '節制', desc: '冷靜、自律、控制衝動和尊重界線。', strengths: ['寬恕', '謙遜', '謹慎', '自律'] },
    transcendence: { icon: '✨', name: '超越', desc: '保持希望、感恩、幽默和看見事情意義。', strengths: ['欣賞美', '感恩', '希望', '幽默', '意義感'] }
  };

  const MISSION_PROFILE = {
    start: ['courage', 'humanity', 'wisdom'], respond: ['humanity', 'wisdom', 'courage'], refuse: ['temperance', 'courage', 'humanity'], conflict: ['temperance', 'justice', 'courage'],
    groupwork: ['justice', 'humanity', 'temperance'], help: ['wisdom', 'courage', 'temperance'], lunch: ['humanity', 'courage', 'justice'], homework: ['wisdom', 'courage', 'temperance'],
    whatsappIgnored: ['temperance', 'humanity', 'wisdom'], academicOnly: ['wisdom', 'temperance', 'courage'], copyHomework: ['justice', 'courage', 'temperance'], quietSpace: ['temperance', 'courage', 'wisdom'],
    peGrouping: ['justice', 'courage', 'humanity'], disagree: ['justice', 'temperance', 'humanity'], teasing: ['temperance', 'courage', 'humanity'], bumped: ['temperance', 'justice', 'courage'],
    losingGame: ['temperance', 'justice', 'humanity'], teacherReminder: ['temperance', 'wisdom', 'courage'], queueJump: ['justice', 'temperance', 'courage'], lostItem: ['wisdom', 'courage', 'temperance']
  };

  const CHARACTERS = {
    girl: { name: '心心', label: '女學生', role: '社交練習生' },
    boy: { name: '謙謙', label: '男學生', role: '社交練習生' }
  };

  const LEVELS = [
    { level: 1, exp: 0, title: '新手冒險者' }, { level: 2, exp: 50, title: '初級溝通者' }, { level: 3, exp: 120, title: '校園探索者' }, { level: 4, exp: 210, title: '冷靜練習生' },
    { level: 5, exp: 320, title: '合作小隊員' }, { level: 6, exp: 460, title: '界線守護者' }, { level: 7, exp: 620, title: '解難行動派' }, { level: 8, exp: 800, title: '梁書社交勇者' },
    { level: 9, exp: 1000, title: '社交任務大師' }, { level: 10, exp: 1250, title: '梁書傳說級勇者' }
  ];

  let currentMissionKey = '';
  const answeredKeys = new Set();

  function getGames() {
    try {
      if (window.asdGames) return window.asdGames;
      // eslint-disable-next-line no-undef
      if (typeof asdGames !== 'undefined') return asdGames;
    } catch (error) {}
    return {};
  }

  function readJson(key, fallback) { try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch (e) { return fallback; } }
  function saveJson(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
  function clamp(value) { return Math.max(0, Math.min(100, Number(value || 0))); }
  function esc(value) { return String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;'); }

  function getVirtueStats() {
    const saved = readJson(VIRTUE_KEY, {});
    const stats = Object.assign({}, DEFAULT_STATS, saved || {});
    Object.keys(DEFAULT_STATS).forEach((key) => { stats[key] = clamp(stats[key]); });
    saveJson(VIRTUE_KEY, stats);
    return stats;
  }

  function saveVirtueStats(stats) {
    const next = Object.assign({}, DEFAULT_STATS, stats || {});
    Object.keys(DEFAULT_STATS).forEach((key) => { next[key] = clamp(next[key]); });
    saveJson(VIRTUE_KEY, next);
    return next;
  }

  function strengthStatus(value, index, total) {
    if (value >= 90) return '已完全解鎖';
    if (value >= 75 && index < Math.ceil(total * 0.75)) return '已解鎖';
    if (value >= 60 && index < Math.ceil(total * 0.45)) return '已解鎖';
    return '未解鎖';
  }

  function progress() { const p = readJson(RPG_KEY, {}); return { completed: p.completed || {}, stars: p.stars || {}, expAwards: p.expAwards || {} }; }
  function badges() { const b = readJson(BADGE_KEY, {}); const p = b.progress || {}; return { stars: Object.keys(p).reduce((s, k) => s + Math.min(3, Number(p[k] || 0)), 0), unlocked: Object.keys(p).filter((k) => Number(p[k] || 0) >= 3).length }; }
  function totalExp(p) { return Object.keys(p.expAwards || {}).reduce((s, k) => s + Number(p.expAwards[k] || 0), 0); }
  function levelInfo(exp) { let c = LEVELS[0], n = LEVELS[1]; LEVELS.forEach((item, i) => { if (exp >= item.exp) { c = item; n = LEVELS[i + 1] || null; } }); const base = c.exp; const nextExp = n ? n.exp : c.exp; const percent = n ? Math.min(100, Math.round(((exp - base) / Math.max(1, nextExp - base)) * 100)) : 100; return { level: c.level, title: c.title, totalExp: exp, nextExp, percent, isMax: !n }; }
  function completedCount(p) { return Object.keys(p.completed || {}).filter((k) => p.completed[k]).length; }
  function threeStarCount(p) { return Object.keys(p.stars || {}).filter((k) => Number(p.stars[k] || 0) >= 3).length; }
  function selectedCharacter() { const id = localStorage.getItem(SELECTED_KEY) || 'girl'; return CHARACTERS[id] || CHARACTERS.girl; }
  function missionTitle(key) { const games = getGames(); return games[key] && games[key].title ? games[key].title : key; }

  function expBar(info) { return `<div class="sims-exp-wrap"><div class="sims-exp-info"><strong>Lv. ${info.level}</strong><span>EXP ${info.totalExp}${info.isMax ? ' / MAX' : ' / ' + info.nextExp}</span></div><div class="sims-exp-bar"><div class="sims-exp-fill" style="width:${info.percent}%"></div></div></div>`; }

  function profilePanel() {
    const p = progress(), info = levelInfo(totalExp(p)), b = badges(), character = selectedCharacter();
    const completed = completedCount(p), threeStar = threeStarCount(p);
    const mood = threeStar >= 10 ? ['💪', '充滿自信', '你已經完成很多高質素任務，社交能力越來越穩定。'] : completed >= 8 ? ['😊', '準備好社交', '你已經熟習不少校園情境，可以挑戰更多任務。'] : info.level >= 3 ? ['🌱', '正在成長', '你正在慢慢累積經驗，保持練習就會更自然。'] : ['😐', '有少少緊張', '先由簡單任務開始，慢慢建立信心。'];
    return `<div class="sims-profile-card sims-tab-panel"><div class="sims-name-row"><div><span class="sims-label">角色名稱</span><h3>${character.name}</h3></div><div class="sims-level-badge">Lv. ${info.level}</div></div><div class="sims-info-grid"><div><span>角色</span><strong>${character.label}</strong></div><div><span>稱號</span><strong>${info.title}</strong></div><div><span>類型</span><strong>${character.role}</strong></div><div><span>徽章</span><strong>${b.unlocked} / 5</strong></div></div>${expBar(info)}<div class="sims-mood-card sims-inline-mood"><div class="sims-mood-icon">${mood[0]}</div><div><span class="sims-label">今日狀態</span><h3>${mood[1]}</h3><p>${mood[2]}</p></div></div><div class="sims-summary-grid"><div><strong>${completed} / ${TOTAL_MISSIONS}</strong><span>任務完成</span></div><div><strong>${threeStar} / ${TOTAL_MISSIONS}</strong><span>3 星任務</span></div><div><strong>${b.stars} / 15</strong><span>徽章星數</span></div></div></div>`;
  }

  function abilityPanel() {
    getVirtueStats();
    return `<div class="sims-panel sims-tab-panel virtue-tab-panel ability-radar-loading-panel"><div class="panel-badge">能力值</div><h3>能力值雷達圖</h3><p class="sims-panel-note">正在載入 RPG 能力值雷達圖……</p><div class="sims-loading-strip"><span></span></div></div>`;
  }

  function strengthPanel() {
    const stats = getVirtueStats();
    const groups = Object.keys(VIRTUES).map((key) => { const v = VIRTUES[key], value = stats[key]; const chips = v.strengths.map((s, i) => { const status = strengthStatus(value, i, v.strengths.length); const unlocked = status !== '未解鎖'; return `<span class="strength-chip ${unlocked ? 'unlocked' : 'locked'}">${unlocked ? '✅' : '🔒'} ${s}<small>${status}</small></span>`; }).join(''); return `<div class="strength-group"><div class="strength-heading"><span>${v.icon}</span><strong>${v.name}</strong><small>${value}/100</small></div><p>${v.desc}</p><div class="strength-chip-wrap">${chips}</div></div>`; }).join('');
    return `<div class="sims-panel sims-tab-panel strength-tab-panel"><div class="panel-badge">性格強項</div><h3>24 性格強項</h3><p class="sims-panel-note">能力值愈高，相關性格強項會逐步解鎖。</p><div class="strength-grid">${groups}</div></div>`;
  }

  function recordPanel() {
    const p = progress();
    const keys = Object.keys(p.completed || {}).filter((k) => p.completed[k]).slice(-8).reverse();
    const list = keys.length ? keys.map((key) => { const stars = Number(p.stars[key] || 0); let starText = ''; for (let i = 1; i <= 3; i += 1) starText += i <= stars ? '★' : '☆'; return `<div class="sims-mission-item"><span>${esc(missionTitle(key))}</span><strong>${starText}</strong></div>`; }).join('') : '<div class="sims-empty-note">未完成任務。開始第一個 RPG 任務後，這裡會顯示你的冒險紀錄。</div>';
    return `<div class="sims-panel sims-tab-panel"><div class="panel-badge">冒險紀錄</div><h3>最近完成任務</h3><p class="sims-panel-note">這裡記錄最近完成的 RPG 任務。</p><div class="sims-mission-list">${list}</div></div>`;
  }

  function buildPanel(tabId) { if (tabId === 'skills') return abilityPanel(); if (tabId === 'traits') return strengthPanel(); if (tabId === 'records') return recordPanel(); return profilePanel(); }

  function updateTabLabels() {
    document.querySelectorAll('#characterScreen .sims-tab-btn').forEach((btn) => {
      const onclick = btn.getAttribute('onclick') || '';
      if (onclick.includes("'skills'")) btn.innerHTML = '📊 能力值';
      if (onclick.includes("'traits'")) btn.innerHTML = '✨ 性格強項';
    });
  }

  function setCharacterTab(tabId) {
    if (!['profile', 'skills', 'traits', 'records'].includes(tabId)) return;
    localStorage.setItem(TAB_KEY, tabId);
    updateTabLabels();
    document.querySelectorAll('#characterScreen.active .sims-tab-btn').forEach((btn) => btn.classList.toggle('active', (btn.getAttribute('onclick') || '').includes(`'${tabId}'`)));
    const right = document.querySelector('#characterScreen.active .sims-tab-right');
    const old = right && right.querySelector('.sims-tab-panel');
    if (old) old.outerHTML = buildPanel(tabId);
    else if (right) { const actions = right.querySelector('.sims-tab-actions'); if (actions) actions.insertAdjacentHTML('beforebegin', buildPanel(tabId)); }

    if (tabId === 'skills') {
      setTimeout(function () {
        if (window.__radarSavedVirtueSetter && window.setSimsCharacterTab) return;
        const evt = new CustomEvent('virtueAbilityNeedsRadar');
        window.dispatchEvent(evt);
      }, 20);
    }
  }

  function forceCorrectOpenTab() {
    if (document.querySelector('#characterScreen.active')) {
      updateTabLabels();
      const tab = localStorage.getItem(TAB_KEY) || 'profile';
      setCharacterTab(tab);
    }
  }

  function getQuestionNumber() { const text = (document.getElementById('questionBadgeBig') || {}).textContent || ''; const m = text.match(/第\s*(\d+)/); return m ? Number(m[1]) : 1; }
  function normalize(value) { return String(value || '').replace(/\s+/g, '').replace(/^[A-D][\.．、]?/i, '').trim(); }

  function detectMission() {
    if (currentMissionKey) return currentMissionKey;
    const games = getGames();
    const asdText = (document.getElementById('asdBox') || {}).textContent || '';
    return Object.keys(games).find((key) => asdText.includes(games[key].intro || '') || asdText.includes(games[key].title || '')) || '';
  }

  function findOption(button, missionKey, questionNumber) {
    const games = getGames();
    const step = games[missionKey] && games[missionKey].steps && games[missionKey].steps[questionNumber - 1];
    if (!step || !Array.isArray(step.options)) return null;
    const btnText = normalize(button.textContent || button.innerText || '');
    return step.options.find((opt) => { const optText = normalize(opt.text); return btnText.includes(optText) || optText.includes(btnText); }) || null;
  }

  function effectsFromScore(score, missionKey) {
    const profile = MISSION_PROFILE[missionKey] || ['wisdom', 'courage', 'temperance'];
    if (Number(score) >= 2) return { [profile[0]]: 3, [profile[1]]: 2, [profile[2]]: 1 };
    if (Number(score) === 1) return { [profile[0]]: 1, [profile[1]]: 1 };
    return { [profile[0]]: -2, [profile[1]]: -1 };
  }

  function applyEffects(effects) { const stats = getVirtueStats(); Object.keys(effects).forEach((key) => { stats[key] = clamp(Number(stats[key] || 50) + Number(effects[key] || 0)); }); saveVirtueStats(stats); }

  function showEffects(effects) {
    setTimeout(() => {
      const old = document.getElementById('virtueChangeBox'); if (old) old.remove();
      const pills = Object.keys(effects).map((key) => { const v = VIRTUES[key]; const amount = Number(effects[key] || 0); return `<span class="virtue-change-pill ${amount >= 0 ? 'up' : 'down'}">${v.icon} ${v.name} ${amount > 0 ? '+' : ''}${amount}</span>`; }).join('');
      const html = `<div id="virtueChangeBox" class="virtue-change-box animate-in"><strong>能力值變化</strong><div class="virtue-change-list">${pills}</div></div>`;
      const target = document.getElementById('reviewBoxInline') && !document.getElementById('reviewBoxInline').classList.contains('hidden') ? document.getElementById('reviewBoxInline') : document.getElementById('asdBox');
      if (target) target.insertAdjacentHTML('afterend', html);
      if (document.querySelector('#characterScreen.active') && typeof window.setSimsCharacterTab === 'function') window.setSimsCharacterTab(localStorage.getItem(TAB_KEY) || 'skills');
    }, 120);
  }

  function handleChoiceClick(event) {
    const choices = document.getElementById('asdChoices'); if (!choices || !choices.contains(event.target)) return;
    const button = event.target.closest('button'); if (!button) return;
    const missionKey = detectMission(); if (!missionKey) return;
    const q = getQuestionNumber(); const key = `${missionKey}:${q}`; if (answeredKeys.has(key)) return;
    const option = findOption(button, missionKey, q); if (!option) return;
    answeredKeys.add(key);
    const effects = effectsFromScore(option.score, missionKey);
    applyEffects(effects); showEffects(effects);
  }

  function patchStartGame() {
    if (typeof window.startAsdGame === 'function' && !window.startAsdGame.__virtuePatched2) {
      const original = window.startAsdGame;
      window.startAsdGame = function (missionKey) { currentMissionKey = missionKey; answeredKeys.clear(); return original.apply(this, arguments); };
      window.startAsdGame.__virtuePatched2 = true;
    }
  }

  function injectStyles() {
    if (document.getElementById('virtueAbilityStyle')) return;
    const style = document.createElement('style');
    style.id = 'virtueAbilityStyle';
    style.textContent = `.ability-radar-loading-panel{min-height:520px!important;place-content:center!important;text-align:left!important}.sims-loading-strip{height:18px;border-radius:999px;overflow:hidden;background:rgba(169,205,242,.35);margin-top:14px}.sims-loading-strip span{display:block;height:100%;width:42%;border-radius:inherit;background:linear-gradient(90deg,#39ff14,#00c48c,#64d2ff);animation:simsLoadingMove 1.15s ease-in-out infinite alternate}@keyframes simsLoadingMove{from{transform:translateX(0)}to{transform:translateX(135%)}}.strength-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.strength-group{padding:11px;border-radius:18px;background:rgba(255,255,255,.62);border:1px solid rgba(255,255,255,.78)}.strength-heading{display:flex;align-items:center;gap:8px}.strength-heading small{margin-left:auto;color:var(--muted);font-weight:850}.strength-group p{color:var(--muted);margin:6px 0 8px;line-height:1.45;font-size:.86rem}.strength-chip-wrap{display:flex;flex-wrap:wrap;gap:6px}.strength-chip{display:inline-grid;gap:2px;padding:6px 8px;border-radius:999px;font-size:.82rem;font-weight:850;background:rgba(255,255,255,.76);border:1px solid rgba(255,255,255,.82)}.strength-chip small{font-size:.68rem;color:var(--muted)}.strength-chip.locked{opacity:.56;filter:grayscale(.6)}.virtue-change-box{margin:12px 0;padding:12px 14px;border-radius:18px;background:linear-gradient(180deg,rgba(255,255,255,.92),rgba(240,249,255,.78));border:1px solid rgba(255,255,255,.9);box-shadow:0 12px 26px rgba(29,53,87,.1),inset 0 1px 0 rgba(255,255,255,.96)}.virtue-change-box strong{display:block;margin-bottom:8px;color:var(--primary-dark)}.virtue-change-list{display:flex;flex-wrap:wrap;gap:8px}.virtue-change-pill{padding:7px 10px;border-radius:999px;font-weight:950;background:rgba(255,255,255,.78);border:1px solid rgba(255,255,255,.88)}.virtue-change-pill.up{color:#137300;box-shadow:0 0 0 3px rgba(57,255,20,.1)}.virtue-change-pill.down{color:#b42318;box-shadow:0 0 0 3px rgba(255,59,48,.08)}@media(max-width:760px){.strength-grid{grid-template-columns:1fr}}`;
    document.head.appendChild(style);
  }

  function install() {
    getVirtueStats(); injectStyles(); patchStartGame(); updateTabLabels();
    window.__virtueAbilitySystemReady = true;
    window.__virtueSetCharacterTab = setCharacterTab;
    window.setSimsCharacterTab = setCharacterTab;
    window.getVirtueStats = getVirtueStats;
    window.resetVirtueStats = function () { saveVirtueStats(DEFAULT_STATS); };
    forceCorrectOpenTab();
  }

  document.addEventListener('click', handleChoiceClick, true);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install); else install();
  window.addEventListener('load', function () { install(); setTimeout(install, 350); setTimeout(install, 900); setTimeout(install, 1800); setTimeout(forceCorrectOpenTab, 2400); });
})();
