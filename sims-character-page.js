// /sims-character-page.js
// Life-simulation style「我的角色」page using MP4 videos.
// New layout: left video + right tabs.
// Important: old 社交能力值 / 5 ability fallback has been removed.
// Required files:
//   videos/character-girl.mp4
//   videos/character-boy.mp4

(function () {
  const RPG_KEY = 'asd_school_rpg_progress_v1';
  const BADGE_KEY = 'asd_school_badges_v2';
  const SELECTED_KEY = 'asd_school_selected_character_v1';
  const TAB_KEY = 'asd_school_character_tab_v1';
  const TOTAL_MISSIONS = 20;

  const CHARACTERS = {
    girl: { name: '心心', label: '女學生', icon: '👧🏻', role: '社交練習生', video: 'videos/character-girl.mp4' },
    boy: { name: '謙謙', label: '男學生', icon: '👦🏻', role: '社交練習生', video: 'videos/character-boy.mp4' }
  };

  const TABS = [
    { id: 'profile', label: '角色', icon: '🪪' },
    { id: 'skills', label: '能力值', icon: '📊' },
    { id: 'traits', label: '性格強項', icon: '✨' },
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

  function safeJson(key) {
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

  function progress() {
    const p = safeJson(RPG_KEY);
    return { completed: p.completed || {}, stars: p.stars || {}, expAwards: p.expAwards || {} };
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

  function completedCount(p) {
    return Object.keys(p.completed).filter((key) => p.completed[key]).length;
  }

  function threeStarCount(p) {
    return Object.keys(p.stars).filter((key) => Number(p.stars[key] || 0) >= 3).length;
  }

  function badgeStats() {
    const b = safeJson(BADGE_KEY);
    const badgeProgress = b.progress || {};
    const stars = Object.keys(badgeProgress).reduce((sum, key) => sum + Math.min(3, Number(badgeProgress[key] || 0)), 0);
    const unlocked = Object.keys(badgeProgress).filter((key) => Number(badgeProgress[key] || 0) >= 3).length;
    return { stars, unlocked };
  }

  function missionTitle(key) {
    try { return asdGames && asdGames[key] && asdGames[key].title ? asdGames[key].title : key; } catch (e) { return key; }
  }

  function selectedId() {
    return CHARACTERS[localStorage.getItem(SELECTED_KEY)] ? localStorage.getItem(SELECTED_KEY) : 'girl';
  }

  function selectedTab() {
    const tab = localStorage.getItem(TAB_KEY) || 'profile';
    return TABS.some((item) => item.id === tab) ? tab : 'profile';
  }

  function setCharacter(id) {
    if (!CHARACTERS[id]) return;
    localStorage.setItem(SELECTED_KEY, id);
    renderCharacterScreen();
    setTimeout(function () {
      if (typeof window.setSimsCharacterTab === 'function') window.setSimsCharacterTab(selectedTab());
    }, 80);
  }

  function setTab(tabId) {
    if (!TABS.some((item) => item.id === tabId)) return;
    localStorage.setItem(TAB_KEY, tabId);
    if (typeof window.setSimsCharacterTab === 'function' && window.setSimsCharacterTab !== setTab) {
      window.setSimsCharacterTab(tabId);
      return;
    }
    renderCharacterScreen();
  }

  function ensureScreen() {
    let screen = document.getElementById('characterScreen');
    if (screen) return screen;
    const card = document.querySelector('.card');
    if (!card) return null;
    screen = document.createElement('div');
    screen.id = 'characterScreen';
    screen.className = 'screen welcome-screen';
    screen.innerHTML = '<div id="characterScreenContent"></div>';
    card.appendChild(screen);
    return screen;
  }

  function showOnly(screenId) {
    document.querySelectorAll('.screen').forEach((screen) => screen.classList.toggle('active', screen.id === screenId));
    const map = document.getElementById('rpgMapScreen');
    if (map && screenId !== 'rpgMapScreen') map.classList.remove('active');
  }

  function mood(info, completed, threeStar) {
    if (threeStar >= 10) return { icon: '💪', title: '充滿自信', text: '你已經完成很多高質素任務，社交能力越來越穩定。' };
    if (completed >= 8) return { icon: '😊', title: '準備好社交', text: '你已經熟習不少校園情境，可以挑戰更多任務。' };
    if (info.level >= 3) return { icon: '🌱', title: '正在成長', text: '你正在慢慢累積經驗，保持練習就會更自然。' };
    return { icon: '😐', title: '有少少緊張', text: '先由簡單任務開始，慢慢建立信心。' };
  }

  function videoHtml(id) {
    const character = CHARACTERS[id];
    return `
      <div class="sims-video-stage">
        <div class="sims-video-frame">
          <video class="sims-character-video" src="${esc(character.video)}" autoplay muted loop playsinline preload="metadata" onerror="this.closest('.sims-video-frame').classList.add('video-missing')"></video>
          <div class="sims-video-missing-msg">請上傳影片：<br><code>${esc(character.video)}</code></div>
        </div>
        <div class="sims-character-switch">
          ${Object.keys(CHARACTERS).map((key) => `<button type="button" class="sims-switch-btn ${key === id ? 'selected' : ''}" onclick="window.setSimsCharacter('${key}')">${CHARACTERS[key].icon} ${CHARACTERS[key].name}</button>`).join('')}
        </div>
      </div>`;
  }

  function expBar(info) {
    return `
      <div class="sims-exp-wrap">
        <div class="sims-exp-info"><strong>Lv. ${info.level}</strong><span>EXP ${info.totalExp}${info.isMax ? ' / MAX' : ' / ' + info.nextExp}</span></div>
        <div class="sims-exp-bar"><div class="sims-exp-fill" style="width:${info.percent}%"></div></div>
      </div>`;
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

  function tabsHtml(activeTab) {
    return `<div class="sims-tabs">${TABS.map((tab) => `
      <button type="button" class="sims-tab-btn ${tab.id === activeTab ? 'active' : ''}" onclick="window.setSimsCharacterTab('${tab.id}')">${tab.icon} ${tab.label}</button>
    `).join('')}</div>`;
  }

  function profilePanelHtml(data) {
    const { character, info, moodNow, completed, threeStar, badges } = data;
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

  function loadingPanelHtml(type) {
    const title = type === 'traits' ? '性格強項' : '能力值';
    const text = type === 'traits' ? '正在載入 24 性格強項……' : '正在載入 RPG 能力值雷達圖……';
    return `
      <div class="sims-panel sims-tab-panel sims-loading-panel" data-loading-panel="${type}">
        <div class="panel-badge">${title}</div>
        <h3>${title}</h3>
        <p class="sims-panel-note">${text}</p>
        <div class="sims-loading-strip"><span></span></div>
      </div>`;
  }

  function recordsPanelHtml(p) {
    return `
      <div class="sims-panel sims-tab-panel">
        <div class="panel-badge">冒險紀錄</div><h3>最近完成任務</h3>
        <p class="sims-panel-note">這裡記錄最近完成的 RPG 任務。</p>
        <div class="sims-mission-list">${recentRecords(p)}</div>
      </div>`;
  }

  function tabPanelHtml(activeTab, data) {
    if (activeTab === 'skills') return loadingPanelHtml('skills');
    if (activeTab === 'traits') return loadingPanelHtml('traits');
    if (activeTab === 'records') return recordsPanelHtml(data.p);
    return profilePanelHtml(data);
  }

  function renderCharacterScreen() {
    injectStyles();
    const screen = ensureScreen();
    if (!screen) return;

    const p = progress();
    const exp = totalExp(p);
    const info = levelInfo(exp);
    const completed = completedCount(p);
    const threeStar = threeStarCount(p);
    const badges = badgeStats();
    const id = selectedId();
    const character = CHARACTERS[id];
    const moodNow = mood(info, completed, threeStar);
    const activeTab = selectedTab();
    const content = document.getElementById('characterScreenContent') || screen;

    content.innerHTML = `
      <div class="sims-character-page sims-character-tab-page animate-in">
        <div class="sims-topbar">
          <div><div class="tag">我的角色</div><h2>梁書社交模擬人生</h2><p>完成校園任務，提升社交能力，解鎖更多性格強項。</p></div>
          <button type="button" class="secondary" onclick="showCoverScreen && showCoverScreen()">返回開始頁</button>
        </div>

        <div class="sims-main-grid sims-tab-layout">
          <div class="sims-left-panel">${videoHtml(id)}</div>
          <div class="sims-right-panel sims-tab-right">
            ${tabsHtml(activeTab)}
            ${tabPanelHtml(activeTab, { character, info, moodNow, completed, threeStar, badges, p })}
            <div class="welcome-actions sims-actions sims-tab-actions">
              <button type="button" onclick="window.openRpgMap && window.openRpgMap()">開始 RPG 冒險</button>
              <button type="button" class="secondary" onclick="showSituationScreen && showSituationScreen()">任務列表</button>
              <button type="button" class="secondary" onclick="showBadgeScreen && showBadgeScreen()">徽章圖鑑</button>
              <button type="button" class="secondary" onclick="showPhraseLibraryScreen && showPhraseLibraryScreen()">社交技能書</button>
            </div>
          </div>
        </div>
      </div>`;

    setTimeout(function () {
      if (typeof window.setSimsCharacterTab === 'function') window.setSimsCharacterTab(activeTab);
    }, 60);
  }

  function showCharacterScreen() {
    renderCharacterScreen();
    showOnly('characterScreen');
    window.scrollTo({ top: 0, behavior: document.body.classList.contains('reduced-motion') ? 'auto' : 'smooth' });
  }

  function injectStyles() {
    if (document.getElementById('simsCharacterPageStyle')) return;
    const style = document.createElement('style');
    style.id = 'simsCharacterPageStyle';
    style.textContent = `
      .sims-character-page { text-align:left; border-radius:34px; padding:24px; background: radial-gradient(circle at 18% 12%, rgba(0,212,255,.22), transparent 28%), radial-gradient(circle at 88% 8%, rgba(57,255,20,.15), transparent 26%), linear-gradient(145deg, rgba(255,255,255,.82), rgba(236,247,255,.58)); border:1px solid rgba(255,255,255,.82); box-shadow:var(--shadow), inset 0 1px 0 rgba(255,255,255,.92); }
      .sims-topbar { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; margin-bottom:18px; }
      .sims-topbar h2 { margin:0 0 6px; font-size:clamp(1.7rem,3vw,2.45rem); }
      .sims-topbar p { margin:0; color:var(--muted); font-weight:700; }
      .sims-main-grid { display:grid; grid-template-columns:minmax(320px,.82fr) minmax(420px,1.18fr); gap:20px; align-items:stretch; }
      .sims-left-panel,.sims-profile-card,.sims-mood-card,.sims-panel,.sims-summary-grid>div,.sims-trait,.sims-mission-item { backdrop-filter:blur(var(--glass-blur)) saturate(170%); -webkit-backdrop-filter:blur(var(--glass-blur)) saturate(170%); border:1px solid rgba(255,255,255,.78); background:rgba(255,255,255,.58); box-shadow:var(--soft-shadow), inset 0 1px 0 rgba(255,255,255,.86); }
      .sims-left-panel,.sims-profile-card,.sims-mood-card,.sims-panel { border-radius:28px; padding:18px; }
      .sims-left-panel { padding:16px; }
      .sims-right-panel { display:grid; gap:14px; align-content:start; }
      .sims-video-stage { position:relative; display:grid; gap:12px; }
      .sims-diamond { display:none !important; }
      .sims-video-frame { position:relative; aspect-ratio:9/16; width:min(100%,420px); margin:0 auto; min-height:0; border-radius:30px; overflow:hidden; background:radial-gradient(circle at 50% 75%, rgba(57,255,20,.18), transparent 22%), linear-gradient(180deg, rgba(255,255,255,.72), rgba(226,242,255,.70)); border:1px solid rgba(255,255,255,.84); box-shadow:inset 0 1px 0 rgba(255,255,255,.92), 0 18px 42px rgba(29,53,87,.14); }
      .sims-character-video { width:100%; height:100%; min-height:0; object-fit:contain; object-position:center center; display:block; }
      .sims-video-missing-msg { display:none; position:absolute; inset:24px; border-radius:22px; place-items:center; text-align:center; color:var(--muted); background:rgba(255,255,255,.72); border:1px dashed rgba(0,122,255,.32); line-height:1.8; }
      .sims-video-frame.video-missing .sims-character-video { display:none; }
      .sims-video-frame.video-missing .sims-video-missing-msg { display:grid; }
      .sims-character-switch { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
      .sims-switch-btn { border-radius:20px; background:rgba(255,255,255,.56); color:var(--primary-dark); box-shadow:inset 0 1px 0 rgba(255,255,255,.82), 0 10px 24px rgba(29,53,87,.08); }
      .sims-switch-btn.selected { color:#083b00; background:linear-gradient(180deg, rgba(57,255,20,.42), rgba(255,255,255,.72)); box-shadow:0 0 0 4px rgba(57,255,20,.18), inset 0 1px 0 rgba(255,255,255,.92), 0 14px 30px rgba(57,255,20,.12); }
      .sims-tabs { display:grid; grid-template-columns:repeat(4, minmax(0,1fr)); gap:9px; }
      .sims-tab-btn { border-radius:18px; padding:11px 10px; font-weight:950; color:var(--primary-dark); background:rgba(255,255,255,.62); box-shadow:inset 0 1px 0 rgba(255,255,255,.88), 0 10px 22px rgba(29,53,87,.08); }
      .sims-tab-btn.active { color:#083b00; background:linear-gradient(180deg, rgba(57,255,20,.40), rgba(255,255,255,.76)); box-shadow:0 0 0 4px rgba(57,255,20,.16), inset 0 1px 0 rgba(255,255,255,.92), 0 14px 28px rgba(57,255,20,.11); }
      .sims-tab-panel { min-height:390px; display:grid; align-content:start; gap:10px; }
      .sims-loading-panel { min-height:390px; place-content:center; text-align:left; }
      .sims-loading-strip { height:18px; border-radius:999px; overflow:hidden; background:rgba(169,205,242,.35); margin-top:14px; }
      .sims-loading-strip span { display:block; height:100%; width:42%; border-radius:inherit; background:linear-gradient(90deg,#39ff14,#00c48c,#64d2ff); animation:simsLoadingMove 1.15s ease-in-out infinite alternate; }
      @keyframes simsLoadingMove { from { transform:translateX(0); } to { transform:translateX(135%); } }
      .sims-name-row,.sims-exp-info,.sims-mission-item { display:flex; align-items:center; justify-content:space-between; gap:12px; }
      .sims-label,.sims-info-grid span,.sims-summary-grid span,.sims-trait small { color:var(--muted); font-size:.84rem; font-weight:850; }
      .sims-name-row h3,.sims-mood-card h3 { margin:2px 0 0; font-size:1.42rem; }
      .sims-level-badge { min-width:72px; min-height:52px; border-radius:18px; display:grid; place-items:center; font-weight:950; color:#083b00; background:linear-gradient(180deg, rgba(57,255,20,.44), rgba(255,255,255,.76)); box-shadow:inset 0 1px 0 rgba(255,255,255,.92), 0 10px 22px rgba(57,255,20,.14); }
      .sims-info-grid,.sims-summary-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; margin-top:10px; }
      .sims-summary-grid { grid-template-columns:repeat(3,minmax(0,1fr)); }
      .sims-info-grid div,.sims-summary-grid div { display:grid; gap:4px; padding:12px; border-radius:18px; background:rgba(255,255,255,.62); border:1px solid rgba(255,255,255,.74); }
      .sims-exp-wrap { margin-top:10px; display:grid; gap:8px; }
      .sims-exp-info strong { color:#1f6f00; }
      .sims-exp-info span { color:var(--muted); font-weight:850; }
      .sims-exp-bar { height:22px; border-radius:0; overflow:hidden; background:repeating-linear-gradient(90deg,#fff 0 3px,#f4f8ff 3px 18px,#dbe7f5 18px 21px); border:3px solid #fff; box-shadow:0 0 0 2px rgba(0,122,255,.16),0 5px 0 rgba(169,205,242,.52),inset 0 2px 0 rgba(255,255,255,.96),inset 0 -3px 0 rgba(169,205,242,.38); }
      .sims-exp-fill { height:100%; background:repeating-linear-gradient(90deg,#39ff14 0 14px,#22c70d 14px 18px,#116b08 18px 21px); box-shadow:inset 0 4px 0 rgba(255,255,255,.42), inset 0 -5px 0 rgba(0,0,0,.20), 0 0 14px rgba(57,255,20,.34); }
      .sims-inline-mood { margin-top:10px; box-shadow:none; }
      .sims-mood-card { display:grid; grid-template-columns:auto 1fr; gap:14px; align-items:center; }
      .sims-mood-icon { width:58px; height:58px; border-radius:20px; display:grid; place-items:center; font-size:1.8rem; background:rgba(255,255,255,.72); box-shadow:inset 0 1px 0 rgba(255,255,255,.92),0 12px 24px rgba(29,53,87,.10); }
      .sims-mood-card p,.sims-panel-note { margin:4px 0 0; color:var(--muted); line-height:1.55; }
      .sims-mission-list { display:grid; gap:10px; }
      .sims-mission-item { padding:12px; border-radius:18px; }
      .sims-mission-item strong { color:#ff9f0a; white-space:nowrap; }
      .sims-empty-note { color:var(--muted); line-height:1.7; }
      .sims-actions { margin-top:0; }
      .sims-tab-actions { justify-content:flex-start; }
      @media (max-width:1100px){ .sims-main-grid{grid-template-columns:1fr;} .sims-video-frame{width:min(100%,360px);} .sims-tab-panel{min-height:auto;} .sims-tabs{grid-template-columns:repeat(2,minmax(0,1fr));} }
      @media (max-width:640px){ .sims-character-page{padding:16px;} .sims-topbar,.sims-name-row,.sims-exp-info{flex-direction:column;align-items:flex-start;} .sims-info-grid,.sims-summary-grid{grid-template-columns:1fr;} .sims-character-switch,.sims-tabs{grid-template-columns:1fr;} }
    `;
    document.head.appendChild(style);
  }

  function install() {
    injectStyles();
    ensureScreen();
    window.renderCharacterScreen = renderCharacterScreen;
    window.showCharacterScreen = showCharacterScreen;
    window.setSimsCharacter = setCharacter;
    if (!window.__virtueAbilitySystemReady) window.setSimsCharacterTab = setTab;
    window.renderSimsCharacterScreen = renderCharacterScreen;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install);
  else install();
  window.addEventListener('load', function () { install(); setTimeout(install, 300); setTimeout(install, 900); });
})();
