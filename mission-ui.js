// /mission-ui.js
// Mission UI loader + RPG cinematic transitions.
// Existing file only: no new files are required.

(function () {
  const VERSION = '20260519-cinematic3';
  const missionScripts = [
    'mission-completion-fix.js',
    'mission-status-panel-fix.js',
    'mission-page-compact-layout.js',
    'mission-page-align-fix.js',
    'mission-character-button-fix.js',
    'mission-question-layout.js',
    'mission-question-final-fix.js',
    'mission-ui-cleanup.js',
    'mission-result-review-fix.js'
  ];

  function loadScriptSequentially(index) {
    if (index >= missionScripts.length) {
      window.dispatchEvent(new CustomEvent('missionUiLoaded', { detail: { files: missionScripts.slice() } }));
      return;
    }
    const script = document.createElement('script');
    script.src = missionScripts[index] + '?v=' + VERSION;
    script.async = false;
    script.onload = function () { loadScriptSequentially(index + 1); };
    script.onerror = function () {
      console.error('Failed to load mission UI file:', script.src);
      loadScriptSequentially(index + 1);
    };
    document.body.appendChild(script);
  }

  if (window.__missionUiLoaderStarted) return;
  window.__missionUiLoaderStarted = true;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { loadScriptSequentially(0); });
  else loadScriptSequentially(0);
})();

(function () {
  const SESSION_KEY = 'asd_school_mission_review_session_v1';
  let startWrapped = false;
  let mapWrapped = false;
  let screenWrapped = false;
  let lastCompleteKey = '';
  let lastBadgeCount = 0;
  let finishWatchTimer = null;
  let overlayLockedUntil = 0;
  let lastOverlayKind = '';
  let lastOverlayAt = 0;
  let badgeIntervalStarted = false;

  function now() { return Date.now(); }

  function readJson(key, fallback) {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch (error) { return fallback; }
  }

  function getGame(key) {
    try {
      if (window.asdGames && window.asdGames[key]) return window.asdGames[key];
      // eslint-disable-next-line no-undef
      if (typeof asdGames !== 'undefined' && asdGames[key]) return asdGames[key];
    } catch (error) {}
    return null;
  }

  function esc(value) {
    return String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function scoreToStars(score) {
    const value = Number(score || 0);
    if (value >= 8) return 3;
    if (value >= 5) return 2;
    if (value > 0) return 1;
    return 0;
  }

  function starsHtml(stars) {
    const n = Math.max(0, Math.min(3, Number(stars || 0)));
    let html = '';
    for (let i = 1; i <= 3; i += 1) html += '<span class="mission-cinematic-star ' + (i <= n ? 'on' : 'off') + '">★</span>';
    return html;
  }

  function injectStyles() {
    if (document.getElementById('missionTransitionAnimationStyle')) return;
    const style = document.createElement('style');
    style.id = 'missionTransitionAnimationStyle';
    style.textContent = `
      .mission-cinematic-overlay{position:fixed;inset:0;z-index:99999;display:grid;place-items:center;padding:24px;background:radial-gradient(circle at 50% 36%,rgba(255,255,255,.98),rgba(229,246,255,.92) 36%,rgba(0,81,190,.2) 100%),linear-gradient(135deg,rgba(0,122,255,.26),rgba(57,255,20,.12));backdrop-filter:blur(10px) saturate(1.12);opacity:0;pointer-events:none;animation:missionCinematicIn .24s ease forwards}.mission-cinematic-overlay.is-map{background:radial-gradient(circle at 50% 38%,rgba(255,255,255,.98),rgba(213,241,255,.9) 36%,rgba(0,87,217,.26) 100%),linear-gradient(135deg,rgba(0,122,255,.3),rgba(255,214,10,.16))}.mission-cinematic-overlay.is-badge{background:radial-gradient(circle at 50% 36%,rgba(255,255,255,.98),rgba(255,244,198,.94) 35%,rgba(255,176,0,.24) 100%),linear-gradient(135deg,rgba(255,214,10,.32),rgba(0,122,255,.14))}.mission-cinematic-overlay.is-leaving{animation:missionCinematicOut .26s ease forwards}.mission-cinematic-card{position:relative;width:min(620px,92vw);overflow:hidden;text-align:center;padding:28px 26px 26px;border-radius:32px;background:linear-gradient(180deg,rgba(255,255,255,.94),rgba(237,249,255,.86));border:1px solid rgba(255,255,255,.92);box-shadow:0 32px 90px rgba(0,67,145,.24),inset 0 1px 0 rgba(255,255,255,.98);transform:translateY(18px) scale(.96);animation:missionCinematicCardIn .34s cubic-bezier(.2,.9,.24,1.18) forwards}.mission-cinematic-card:before{content:"";position:absolute;inset:-40%;background:conic-gradient(from 0deg,transparent,rgba(255,214,10,.35),transparent,rgba(0,122,255,.24),transparent);animation:missionCinematicSpin 3.6s linear infinite;opacity:.9}.mission-cinematic-inner{position:relative;z-index:1;border-radius:24px;padding:22px 18px;background:rgba(255,255,255,.72);border:1px solid rgba(255,255,255,.88)}.mission-cinematic-kicker{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:7px 13px;border-radius:999px;background:rgba(255,214,10,.82);color:#654100;font-weight:950;box-shadow:0 10px 24px rgba(0,87,217,.1)}.mission-cinematic-title{margin:14px 0 8px;font-size:clamp(2rem,5vw,3.5rem);line-height:1.06;font-weight:1000;letter-spacing:-.06em;color:#0057d9;text-shadow:0 3px 0 rgba(255,255,255,.95),0 12px 28px rgba(0,87,217,.16)}.mission-cinematic-subtitle{margin:0 auto 10px;max-width:520px;color:#1d3557;font-weight:900;font-size:1.05rem;line-height:1.55}.mission-cinematic-meta{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-top:14px}.mission-cinematic-pill{padding:7px 11px;border-radius:999px;background:rgba(0,122,255,.1);color:#0057d9;font-weight:950;border:1px solid rgba(255,255,255,.82)}.mission-cinematic-stars{display:flex;justify-content:center;gap:10px;margin:14px 0 6px}.mission-cinematic-star{display:inline-grid;place-items:center;width:48px;height:48px;border-radius:16px;font-size:2.05rem;font-weight:1000;transform:scale(.6) rotate(-10deg);animation:missionStarPop .42s cubic-bezier(.18,.88,.22,1.24) forwards}.mission-cinematic-star:nth-child(2){animation-delay:.1s}.mission-cinematic-star:nth-child(3){animation-delay:.2s}.mission-cinematic-star.on{color:#fff;background:linear-gradient(180deg,#fff36b,#ffb000);box-shadow:0 12px 22px rgba(255,176,0,.28),inset 0 2px 0 rgba(255,255,255,.7);text-shadow:0 2px 0 rgba(190,102,0,.26)}.mission-cinematic-star.off{color:rgba(29,53,87,.28);background:rgba(255,255,255,.72);box-shadow:inset 0 1px 0 rgba(255,255,255,.8)}.mission-cinematic-reward{margin-top:12px;padding:10px 12px;border-radius:18px;color:#137300;background:rgba(52,199,89,.12);font-weight:950;line-height:1.5}.screen.screen-cinematic-enter{animation:screenCinematicEnter .34s ease both}@keyframes missionCinematicIn{to{opacity:1}}@keyframes missionCinematicOut{to{opacity:0}}@keyframes missionCinematicCardIn{to{transform:translateY(0) scale(1)}}@keyframes missionCinematicSpin{to{transform:rotate(360deg)}}@keyframes missionStarPop{to{transform:scale(1) rotate(0)}}@keyframes screenCinematicEnter{from{opacity:.24;transform:translateY(12px) scale(.985);filter:blur(4px)}to{opacity:1;transform:translateY(0) scale(1);filter:blur(0)}}body.reduced-motion .mission-cinematic-overlay,body.reduced-motion .mission-cinematic-card,body.reduced-motion .mission-cinematic-card:before,body.reduced-motion .mission-cinematic-star,body.reduced-motion .screen.screen-cinematic-enter{animation:none!important}`;
    document.head.appendChild(style);
  }

  function removeExistingOverlay() {
    document.querySelectorAll('.mission-cinematic-overlay').forEach(function (node) {
      if (node && node.parentNode) node.parentNode.removeChild(node);
    });
  }

  function canShowOverlay(kind, wait) {
    const t = now();
    if (document.querySelector('.mission-cinematic-overlay') && t < overlayLockedUntil) return false;
    if (kind === lastOverlayKind && (t - lastOverlayAt) < 900) return false;
    lastOverlayKind = kind;
    lastOverlayAt = t;
    overlayLockedUntil = t + Number(wait || 900) + 360;
    return true;
  }

  function showOverlay(kind, data, duration) {
    injectStyles();
    const reduced = document.body.classList.contains('reduced-motion');
    const wait = reduced ? 260 : Number(duration || 900);
    if (!canShowOverlay(kind, wait)) return;

    removeExistingOverlay();
    const overlay = document.createElement('div');
    overlay.className = 'mission-cinematic-overlay';
    if (kind === 'map') overlay.classList.add('is-map');
    if (kind === 'badge') overlay.classList.add('is-badge');

    if (kind === 'start') {
      overlay.innerHTML = '<div class="mission-cinematic-card"><div class="mission-cinematic-inner"><div class="mission-cinematic-kicker">🎮 任務開始</div><div class="mission-cinematic-title">QUEST START</div><div class="mission-cinematic-subtitle">' + esc(data.title || '校園社交任務') + '</div><div class="mission-cinematic-meta"><span class="mission-cinematic-pill">📍 ' + esc(data.location || '校園') + '</span><span class="mission-cinematic-pill">🎯 ' + esc(data.goal || '社交練習') + '</span></div></div></div>';
    } else if (kind === 'complete') {
      overlay.innerHTML = '<div class="mission-cinematic-card"><div class="mission-cinematic-inner"><div class="mission-cinematic-kicker">🏆 任務完成</div><div class="mission-cinematic-title">MISSION COMPLETE</div><div class="mission-cinematic-subtitle">' + esc(data.title || '校園社交任務') + '</div><div class="mission-cinematic-stars">' + starsHtml(data.stars) + '</div><div class="mission-cinematic-meta"><span class="mission-cinematic-pill">分數 ' + esc(data.score) + ' / 10</span><span class="mission-cinematic-pill">EXP +' + esc(data.exp) + '</span></div><div class="mission-cinematic-reward">你已完成一次社交任務練習，紀錄已保存到「我的任務紀錄」。</div></div></div>';
    } else if (kind === 'badge') {
      overlay.innerHTML = '<div class="mission-cinematic-card"><div class="mission-cinematic-inner"><div class="mission-cinematic-kicker">✨ 成就更新</div><div class="mission-cinematic-title">ACHIEVEMENT</div><div class="mission-cinematic-subtitle">徽章進度更新！</div><div class="mission-cinematic-stars">' + starsHtml(3) + '</div><div class="mission-cinematic-reward">已同步到「我的徽章」。</div></div></div>';
    } else {
      overlay.innerHTML = '<div class="mission-cinematic-card"><div class="mission-cinematic-inner"><div class="mission-cinematic-kicker">🗺️ 校園冒險</div><div class="mission-cinematic-title">ADVENTURE MAP</div><div class="mission-cinematic-subtitle">進入梁書 RPG 校園地圖...</div><div class="mission-cinematic-meta"><span class="mission-cinematic-pill">選擇地點</span><span class="mission-cinematic-pill">開始任務</span></div></div></div>';
    }

    document.body.appendChild(overlay);
    setTimeout(function () {
      overlay.classList.add('is-leaving');
      setTimeout(function () { if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay); }, reduced ? 30 : 280);
    }, wait);
  }

  function animateActiveScreen() {
    if (document.body.classList.contains('reduced-motion')) return;
    const active = document.querySelector('.screen.active');
    if (!active) return;
    active.classList.remove('screen-cinematic-enter');
    void active.offsetWidth;
    active.classList.add('screen-cinematic-enter');
    setTimeout(function () { active.classList.remove('screen-cinematic-enter'); }, 480);
  }

  function missionStartData(key) {
    const game = getGame(key) || {};
    return { title: game.title || '校園社交任務', location: game.location || game.role || '校園', goal: game.socialGoal || game.mission || '社交練習' };
  }

  function wrapStartAsdGame() {
    if (startWrapped || typeof window.startAsdGame !== 'function') return;
    const original = window.startAsdGame;
    if (original.__missionTransitionWrapped) return;
    window.startAsdGame = function (missionKey) {
      const args = arguments;
      const reduced = document.body.classList.contains('reduced-motion');
      showOverlay('start', missionStartData(missionKey), reduced ? 240 : 780);
      setTimeout(function () { original.apply(window, args); setTimeout(animateActiveScreen, 80); }, reduced ? 0 : 260);
    };
    window.startAsdGame.__missionTransitionWrapped = true;
    startWrapped = true;
  }

  function wrapMapOpeners() {
    if (mapWrapped) return;
    ['openFinalRpgMap'].forEach(function (name) {
      if (typeof window[name] !== 'function') return;
      const original = window[name];
      if (original.__cinematicMapWrapped) return;
      window[name] = function () {
        const args = arguments;
        const reduced = document.body.classList.contains('reduced-motion');
        showOverlay('map', {}, reduced ? 220 : 620);
        setTimeout(function () { original.apply(window, args); setTimeout(animateActiveScreen, 80); }, reduced ? 0 : 170);
      };
      window[name].__cinematicMapWrapped = true;
    });
    mapWrapped = true;
  }

  function wrapScreenSwitch() {
    if (screenWrapped || typeof window.setActiveScreen !== 'function') return;
    const original = window.setActiveScreen;
    if (original.__cinematicScreenWrapped) return;
    window.setActiveScreen = function () {
      const result = original.apply(window, arguments);
      setTimeout(animateActiveScreen, 40);
      return result;
    };
    window.setActiveScreen.__cinematicScreenWrapped = true;
    screenWrapped = true;
  }

  function checkMissionComplete() {
    const gameScreen = document.getElementById('gameScreen');
    if (!gameScreen || !gameScreen.classList.contains('active') || !gameScreen.classList.contains('mission-finish-mode')) return;
    const session = readJson(SESSION_KEY, null);
    if (!session || !session.missionKey) return;
    const score = Number(session.score || 0);
    const stars = Number(session.stars || scoreToStars(score));
    const itemsLength = session.items && session.items.length ? session.items.length : 0;
    const completeKey = session.missionKey + ':' + score + ':' + (session.savedAt || itemsLength || 'done');
    if (completeKey === lastCompleteKey) return;
    lastCompleteKey = completeKey;
    const game = getGame(session.missionKey) || {};
    const exp = stars >= 3 ? 20 : stars === 2 ? 10 : stars === 1 ? 5 : 0;
    setTimeout(function () { showOverlay('complete', { title: session.title || game.title || '校園社交任務', score: score, stars: stars, exp: exp }, 1450); }, 260);
  }

  function installFinishWatcher() {
    const gameScreen = document.getElementById('gameScreen');
    if (!gameScreen || gameScreen.__missionTransitionObserver) return;
    const observer = new MutationObserver(function () {
      clearTimeout(finishWatchTimer);
      finishWatchTimer = setTimeout(checkMissionComplete, 120);
    });
    observer.observe(gameScreen, { attributes: true, attributeFilter: ['class'], childList: true, subtree: true });
    gameScreen.__missionTransitionObserver = observer;
  }

  function checkBadgeProgress() {
    const badgeGrid = document.getElementById('badgeGrid');
    if (!badgeGrid) return;
    const count = badgeGrid.textContent ? badgeGrid.textContent.length : 0;
    if (!lastBadgeCount) { lastBadgeCount = count; return; }
    if (count > lastBadgeCount && document.getElementById('badgeScreen') && document.getElementById('badgeScreen').classList.contains('active')) showOverlay('badge', {}, 1000);
    lastBadgeCount = count;
  }

  function install() {
    injectStyles();
    wrapStartAsdGame();
    wrapMapOpeners();
    wrapScreenSwitch();
    installFinishWatcher();
    if (!badgeIntervalStarted) {
      badgeIntervalStarted = true;
      setInterval(checkBadgeProgress, 1800);
    }
    [300, 900, 1800, 3200].forEach(function (delay) {
      setTimeout(wrapStartAsdGame, delay);
      setTimeout(wrapMapOpeners, delay);
      setTimeout(wrapScreenSwitch, delay);
      setTimeout(installFinishWatcher, delay);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install);
  else install();
  window.addEventListener('load', install);
  window.addEventListener('missionUiLoaded', install);
})();
