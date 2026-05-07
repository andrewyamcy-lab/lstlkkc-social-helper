// /sims-character-page.js
// Life-simulation style「我的角色」page using MP4 videos.
// Required files:
//   videos/character-girl.mp4
//   videos/character-boy.mp4

(function () {
  const RPG_KEY = 'asd_school_rpg_progress_v1';
  const BADGE_KEY = 'asd_school_badges_v2';
  const SELECTED_KEY = 'asd_school_selected_character_v1';
  const TOTAL_MISSIONS = 20;

  const CHARACTERS = {
    girl: { name: '心心', label: '女學生', icon: '👧🏻', role: '社交練習生', video: 'videos/character-girl.mp4' },
    boy: { name: '謙謙', label: '男學生', icon: '👦🏻', role: '社交練習生', video: 'videos/character-boy.mp4' }
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
    return { level: current.level, title: current.title, totalExp: exp, nextExp, nextLevel: next && next.level, percent, isMax: !next };
  }

  function completedCount(p) {
    return Object.keys(p.completed).filter((key) => p.completed[key]).length;
  }

  function threeStarCount(p) {
    return Object.keys(p.stars).filter((key) => Number(p.stars[key] || 0) >= 3).length;
  }

  function badgeStats() {
    const b = safeJson(BADGE_KEY);
    const progress = b.progress || {};
    const stars = Object.keys(progress).reduce((sum, key) => sum + Math.min(3, Number(progress[key] || 0)), 0);
    const unlocked = Object.keys(progress).filter((key) => Number(progress[key] || 0) >= 3).length;
    return { stars, unlocked };
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
    try { return asdGames && asdGames[key] && asdGames[key].title ? asdGames[key].title : key; } catch (e) { return key; }
  }

  function selectedId() {
    return CHARACTERS[localStorage.getItem(SELECTED_KEY)] ? localStorage.getItem(SELECTED_KEY) : 'girl';
  }

  function setCharacter(id) {
    if (!CHARACTERS[id]) return;
    localStorage.setItem(SELECTED_KEY, id);
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
    if (threeStar >= 10) return { icon: '💪', title: '充滿自信', text: '你已經完成很多高質素任務，社交技能越來越穩定。' };
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

  function skillsHtml(scores) {
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

  function traitsHtml(scores) {
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

  function recentHtml(p) {
    const keys = Object.keys(p.completed).filter((key) => p.completed[key]).slice(-5).reverse();
    if (!keys.length) return '<div class="sims-empty-note">未完成任務。開始第一個 RPG 任務後，這裡會顯示你的冒險紀錄。</div>';
    return keys.map((key) => {
      const stars = Number(p.stars[key] || 0);
      let starText = '';
      for (let i = 1; i <= 3; i += 1) starText += i <= stars ? '★' : '☆';
      return `<div class="sims-mission-item"><span>${esc(missionTitle(key))}</span><strong>${starText}</strong></div>`;
    }).join('');
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
    const scores = statScores(p);
    const id = selectedId();
    const character = CHARACTERS[id];
    const moodNow = mood(info, completed, threeStar);
    const content = document.getElementById('characterScreenContent') || screen;

    content.innerHTML = `
      <div class="sims-character-page animate-in">
        <div class="sims-topbar">
          <div><div class="tag">我的角色</div><h2>梁書社交模擬人生</h2><p>完成校園任務，提升社交能力，解鎖更多性格特質。</p></div>
          <button type="button" class="secondary" onclick="showCoverScreen && showCoverScreen()">返回開始頁</button>
        </div>

        <div class="sims-main-grid">
          <div class="sims-left-panel">${videoHtml(id)}</div>
          <div class="sims-right-panel">
            <div class="sims-profile-card">
              <div class="sims-name-row"><div><span class="sims-label">角色名稱</span><h3>${character.name}</h3></div><div class="sims-level-badge">Lv. ${info.level}</div></div>
              <div class="sims-info-grid">
                <div><span>角色</span><strong>${character.label}</strong></div>
                <div><span>稱號</span><strong>${info.title}</strong></div>
                <div><span>類型</span><strong>${character.role}</strong></div>
                <div><span>徽章</span><strong>${badges.unlocked} / 5</strong></div>
              </div>
              ${expBar(info)}
            </div>

            <div class="sims-mood-card">
              <div class="sims-mood-icon">${moodNow.icon}</div>
              <div><span class="sims-label">今日狀態</span><h3>${moodNow.title}</h3><p>${moodNow.text}</p></div>
            </div>

            <div class="sims-summary-grid">
              <div><strong>${completed} / ${TOTAL_MISSIONS}</strong><span>任務完成</span></div>
              <div><strong>${threeStar} / ${TOTAL_MISSIONS}</strong><span>3 星任務</span></div>
              <div><strong>${badges.stars} / 15</strong><span>徽章星數</span></div>
            </div>
          </div>
        </div>

        <div class="sims-bottom-grid">
          <div class="sims-panel"><div class="panel-badge">能力值</div><h3>社交技能 Need Bars</h3><div class="sims-skill-list">${skillsHtml(scores)}</div></div>
          <div class="sims-panel"><div class="panel-badge">性格特質</div><h3>已解鎖 Traits</h3><div class="sims-trait-grid">${traitsHtml(scores)}</div></div>
          <div class="sims-panel"><div class="panel-badge">冒險紀錄</div><h3>最近完成任務</h3><div class="sims-mission-list">${recentHtml(p)}</div></div>
        </div>

        <div class="welcome-actions sims-actions">
          <button type="button" onclick="window.openRpgMap && window.openRpgMap()">開始 RPG 冒險</button>
          <button type="button" class="secondary" onclick="showSituationScreen && showSituationScreen()">任務列表</button>
          <button type="button" class="secondary" onclick="showBadgeScreen && showBadgeScreen()">徽章圖鑑</button>
          <button type="button" class="secondary" onclick="showPhraseLibraryScreen && showPhraseLibraryScreen()">社交技能書</button>
        </div>
      </div>`;
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
      .sims-main-grid { display:grid; grid-template-columns:minmax(320px,.95fr) minmax(320px,1.05fr); gap:20px; align-items:stretch; }
      .sims-left-panel,.sims-profile-card,.sims-mood-card,.sims-panel,.sims-summary-grid>div,.sims-trait,.sims-mission-item { backdrop-filter:blur(var(--glass-blur)) saturate(170%); -webkit-backdrop-filter:blur(var(--glass-blur)) saturate(170%); border:1px solid rgba(255,255,255,.78); background:rgba(255,255,255,.58); box-shadow:var(--soft-shadow), inset 0 1px 0 rgba(255,255,255,.86); }
      .sims-left-panel,.sims-profile-card,.sims-mood-card,.sims-panel { border-radius:28px; padding:18px; }
      .sims-left-panel { padding:16px; }
      .sims-right-panel { display:grid; gap:14px; }
      .sims-video-stage { position:relative; display:grid; gap:12px; }
      .sims-diamond { display:none !important; }
      .sims-video-frame { position:relative; min-height:540px; border-radius:30px; overflow:hidden; background:radial-gradient(circle at 50% 75%, rgba(57,255,20,.18), transparent 22%), linear-gradient(180deg, rgba(255,255,255,.72), rgba(226,242,255,.70)); border:1px solid rgba(255,255,255,.84); box-shadow:inset 0 1px 0 rgba(255,255,255,.92), 0 18px 42px rgba(29,53,87,.14); }
      .sims-character-video { width:100%; height:100%; min-height:540px; object-fit:contain; display:block; }
      .sims-video-missing-msg { display:none; position:absolute; inset:24px; border-radius:22px; place-items:center; text-align:center; color:var(--muted); background:rgba(255,255,255,.72); border:1px dashed rgba(0,122,255,.32); line-height:1.8; }
      .sims-video-frame.video-missing .sims-character-video { display:none; }
      .sims-video-frame.video-missing .sims-video-missing-msg { display:grid; }
      .sims-character-switch { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
      .sims-switch-btn { border-radius:20px; background:rgba(255,255,255,.56); color:var(--primary-dark); box-shadow:inset 0 1px 0 rgba(255,255,255,.82), 0 10px 24px rgba(29,53,87,.08); }
      .sims-switch-btn.selected { color:#083b00; background:linear-gradient(180deg, rgba(57,255,20,.42), rgba(255,255,255,.72)); box-shadow:0 0 0 4px rgba(57,255,20,.18), inset 0 1px 0 rgba(255,255,255,.92), 0 14px 30px rgba(57,255,20,.12); }
      .sims-name-row,.sims-exp-info,.sims-skill-row,.sims-mission-item { display:flex; align-items:center; justify-content:space-between; gap:12px; }
      .sims-label,.sims-info-grid span,.sims-summary-grid span,.sims-trait small { color:var(--muted); font-size:.84rem; font-weight:850; }
      .sims-name-row h3,.sims-mood-card h3 { margin:2px 0 0; font-size:1.42rem; }
      .sims-level-badge { min-width:72px; min-height:52px; border-radius:18px; display:grid; place-items:center; font-weight:950; color:#083b00; background:linear-gradient(180deg, rgba(57,255,20,.44), rgba(255,255,255,.76)); box-shadow:inset 0 1px 0 rgba(255,255,255,.92), 0 10px 22px rgba(57,255,20,.14); }
      .sims-info-grid,.sims-summary-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; margin-top:14px; }
      .sims-info-grid div,.sims-summary-grid div { display:grid; gap:4px; padding:12px; border-radius:18px; background:rgba(255,255,255,.62); border:1px solid rgba(255,255,255,.74); }
      .sims-exp-wrap { margin-top:14px; display:grid; gap:8px; }
      .sims-exp-info strong { color:#1f6f00; }
      .sims-exp-info span { color:var(--muted); font-weight:850; }
      .sims-exp-bar { height:22px; border-radius:0; overflow:hidden; background:repeating-linear-gradient(90deg,#fff 0 3px,#f4f8ff 3px 18px,#dbe7f5 18px 21px); border:3px solid #fff; box-shadow:0 0 0 2px rgba(0,122,255,.16),0 5px 0 rgba(169,205,242,.52),inset 0 2px 0 rgba(255,255,255,.96),inset 0 -3px 0 rgba(169,205,242,.38); }
      .sims-exp-fill { height:100%; background:repeating-linear-gradient(90deg,#39ff14 0 14px,#22c70d 14px 18px,#116b08 18px 21px); box-shadow:inset 0 4px 0 rgba(255,255,255,.42), inset 0 -5px 0 rgba(0,0,0,.20), 0 0 14px rgba(57,255,20,.34); }
      .sims-mood-card { display:grid; grid-template-columns:auto 1fr; gap:14px; align-items:center; }
      .sims-mood-icon { width:64px; height:64px; border-radius:22px; display:grid; place-items:center; font-size:2rem; background:rgba(255,255,255,.72); box-shadow:inset 0 1px 0 rgba(255,255,255,.92),0 12px 24px rgba(29,53,87,.10); }
      .sims-mood-card p { margin:4px 0 0; color:var(--muted); }
      .sims-bottom-grid { display:grid; grid-template-columns:1.15fr .9fr .95fr; gap:16px; margin-top:18px; }
      .sims-panel h3 { margin-bottom:10px; }
      .sims-skill-list,.sims-trait-grid,.sims-mission-list { display:grid; gap:10px; }
      .sims-skill-name { display:flex; align-items:center; gap:8px; min-width:106px; }
      .sims-skill-bar { flex:1; height:16px; border-radius:999px; background:rgba(169,205,242,.42); overflow:hidden; box-shadow:inset 0 2px 5px rgba(29,53,87,.10); }
      .sims-skill-fill { height:100%; border-radius:inherit; background:linear-gradient(90deg,#39ff14,#00c48c,#64d2ff); }
      .sims-skill-value { width:34px; text-align:right; font-weight:950; color:var(--primary-dark); }
      .sims-trait { display:grid; grid-template-columns:auto 1fr; gap:10px; align-items:center; padding:12px; border-radius:18px; }
      .sims-trait.locked { opacity:.56; filter:grayscale(.65); }
      .sims-trait-icon { width:42px; height:42px; border-radius:16px; display:grid; place-items:center; background:rgba(255,255,255,.70); box-shadow:inset 0 1px 0 rgba(255,255,255,.90); }
      .sims-trait strong,.sims-trait small { display:block; }
      .sims-mission-item { padding:12px; border-radius:18px; }
      .sims-mission-item strong { color:#ff9f0a; white-space:nowrap; }
      .sims-empty-note { color:var(--muted); line-height:1.7; }
      .sims-actions { margin-top:18px; }
      @media (max-width:1100px){ .sims-main-grid,.sims-bottom-grid{grid-template-columns:1fr;} .sims-video-frame,.sims-character-video{min-height:460px;} }
      @media (max-width:640px){ .sims-character-page{padding:16px;} .sims-topbar,.sims-name-row,.sims-exp-info{flex-direction:column;align-items:flex-start;} .sims-info-grid,.sims-summary-grid{grid-template-columns:1fr;} .sims-skill-row{align-items:stretch;flex-direction:column;} .sims-skill-name{min-width:0;} .sims-skill-value{width:auto;text-align:left;} .sims-character-switch{grid-template-columns:1fr;} .sims-video-frame,.sims-character-video{min-height:380px;} }
    `;
    document.head.appendChild(style);
  }

  function install() {
    injectStyles();
    ensureScreen();
    window.renderCharacterScreen = renderCharacterScreen;
    window.showCharacterScreen = showCharacterScreen;
    window.setSimsCharacter = setCharacter;
    window.renderSimsCharacterScreen = renderCharacterScreen;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install);
  else install();
  window.addEventListener('load', function () { install(); setTimeout(install, 300); setTimeout(install, 900); });
})();
