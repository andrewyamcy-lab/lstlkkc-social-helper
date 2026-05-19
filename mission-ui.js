// /mission-ui.js
// Mission UI loader + reliable RPG cinematic transitions.
// Existing file only: no new files are required.

(function () {
  const VERSION = '20260519-cinematic5';
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
    script.onerror = function () { console.error('Failed to load mission UI file:', script.src); loadScriptSequentially(index + 1); };
    document.body.appendChild(script);
  }

  if (window.__missionUiLoaderStarted) return;
  window.__missionUiLoaderStarted = true;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { loadScriptSequentially(0); });
  else loadScriptSequentially(0);
})();

(function () {
  const SESSION_KEY = 'asd_school_mission_review_session_v1';
  let lastOverlayAt = 0;
  let lastOverlayKind = '';
  let lastCompleteKey = '';
  let finishWatchTimer = null;
  let clickListenerInstalled = false;
  let screenWrapped = false;

  function timeNow() { return Date.now(); }

  function readJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
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
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#039;');
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
    for (let i = 1; i <= 3; i += 1) {
      html += '<span class="mission-cinematic-star ' + (i <= n ? 'on' : 'off') + '">★</span>';
    }
    return html;
  }

  function injectStyles() {
    if (document.getElementById('missionTransitionAnimationStyle')) return;
    const style = document.createElement('style');
    style.id = 'missionTransitionAnimationStyle';
    style.textContent = `
      .mission-cinematic-overlay{position:fixed;inset:0;z-index:99999;display:grid;place-items:center;padding:24px;background:radial-gradient(circle at 50% 35%,rgba(255,255,255,.98),rgba(226,246,255,.94) 45%,rgba(0,87,217,.20));backdrop-filter:blur(8px);opacity:0;pointer-events:none;animation:missionCinematicIn .22s ease forwards}.mission-cinematic-overlay.is-map{background:radial-gradient(circle at 50% 36%,rgba(255,255,255,.98),rgba(218,242,255,.94) 45%,rgba(0,122,255,.22))}.mission-cinematic-overlay.is-badge{background:radial-gradient(circle at 50% 36%,rgba(255,255,255,.98),rgba(255,244,198,.95) 44%,rgba(255,176,0,.22))}.mission-cinematic-overlay.is-leaving{animation:missionCinematicOut .22s ease forwards}.mission-cinematic-card{width:min(620px,92vw);text-align:center;padding:26px;border-radius:30px;background:linear-gradient(180deg,rgba(255,255,255,.96),rgba(237,249,255,.90));border:1px solid rgba(255,255,255,.94);box-shadow:0 30px 80px rgba(0,67,145,.22),inset 0 1px 0 rgba(255,255,255,.98);transform:translateY(14px) scale(.97);animation:missionCinematicCardIn .30s ease forwards}.mission-cinematic-inner{border-radius:23px;padding:21px 17px;background:rgba(255,255,255,.70);border:1px solid rgba(255,255,255,.88)}.mission-cinematic-kicker{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:7px 13px;border-radius:999px;background:rgba(255,214,10,.84);color:#654100;font-weight:950}.mission-cinematic-title{margin:14px 0 8px;font-size:clamp(2rem,5vw,3.4rem);line-height:1.06;font-weight:1000;letter-spacing:-.06em;color:#0057d9;text-shadow:0 3px 0 rgba(255,255,255,.92),0 10px 24px rgba(0,87,217,.15)}.mission-cinematic-subtitle{margin:0 auto 10px;max-width:520px;color:#1d3557;font-weight:900;font-size:1.05rem;line-height:1.55}.mission-cinematic-meta{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-top:14px}.mission-cinematic-pill{padding:7px 11px;border-radius:999px;background:rgba(0,122,255,.10);color:#0057d9;font-weight:950;border:1px solid rgba(255,255,255,.82)}.mission-cinematic-stars{display:flex;justify-content:center;gap:10px;margin:14px 0 6px}.mission-cinematic-star{display:inline-grid;place-items:center;width:48px;height:48px;border-radius:16px;font-size:2.05rem;font-weight:1000;transform:scale(.72);animation:missionStarPop .36s ease forwards}.mission-cinematic-star:nth-child(2){animation-delay:.08s}.mission-cinematic-star:nth-child(3){animation-delay:.16s}.mission-cinematic-star.on{color:#fff;background:linear-gradient(180deg,#fff36b,#ffb000);box-shadow:0 12px 22px rgba(255,176,0,.25),inset 0 2px 0 rgba(255,255,255,.7)}.mission-cinematic-star.off{color:rgba(29,53,87,.28);background:rgba(255,255,255,.72)}.mission-cinematic-reward{margin-top:12px;padding:10px 12px;border-radius:18px;color:#137300;background:rgba(52,199,89,.12);font-weight:950;line-height:1.5}.screen.screen-cinematic-enter{animation:screenCinematicEnter .32s ease both}@keyframes missionCinematicIn{to{opacity:1}}@keyframes missionCinematicOut{to{opacity:0}}@keyframes missionCinematicCardIn{to{transform:translateY(0) scale(1)}}@keyframes missionStarPop{to{transform:scale(1)}}@keyframes screenCinematicEnter{from{opacity:.35;transform:translateY(10px) scale(.988);filter:blur(3px)}to{opacity:1;transform:translateY(0) scale(1);filter:blur(0)}}body.reduced-motion .mission-cinematic-overlay,body.reduced-motion .mission-cinematic-card,body.reduced-motion .mission-cinematic-star,body.reduced-motion .screen.screen-cinematic-enter{animation:none!important}`;
    document.head.appendChild(style);
  }

  function removeOverlay() {
    document.querySelectorAll('.mission-cinematic-overlay').forEach(function (node) {
      if (node && node.parentNode) node.parentNode.removeChild(node);
    });
  }

  function canShow(kind) {
    const t = timeNow();
    if (document.querySelector('.mission-cinematic-overlay')) return false;
    if (kind === lastOverlayKind && t - lastOverlayAt < 900) return false;
    lastOverlayKind = kind;
    lastOverlayAt = t;
    return true;
  }

  function overlayHtml(kind, data) {
    if (kind === 'map') {
      return '<div class="mission-cinematic-card"><div class="mission-cinematic-inner"><div class="mission-cinematic-kicker">🗺️ 校園冒險</div><div class="mission-cinematic-title">ADVENTURE MAP</div><div class="mission-cinematic-subtitle">進入梁書 RPG 校園地圖...</div><div class="mission-cinematic-meta"><span class="mission-cinematic-pill">選擇地點</span><span class="mission-cinematic-pill">開始任務</span></div></div></div>';
    }
    if (kind === 'complete') {
      return '<div class="mission-cinematic-card"><div class="mission-cinematic-inner"><div class="mission-cinematic-kicker">🏆 任務完成</div><div class="mission-cinematic-title">MISSION COMPLETE</div><div class="mission-cinematic-subtitle">' + esc(data.title || '校園社交任務') + '</div><div class="mission-cinematic-stars">' + starsHtml(data.stars) + '</div><div class="mission-cinematic-meta"><span class="mission-cinematic-pill">分數 ' + esc(data.score) + ' / 10</span><span class="mission-cinematic-pill">EXP +' + esc(data.exp) + '</span></div><div class="mission-cinematic-reward">你已完成一次社交任務練習，紀錄已保存到「我的任務紀錄」。</div></div></div>';
    }
    if (kind === 'badge') {
      return '<div class="mission-cinematic-card"><div class="mission-cinematic-inner"><div class="mission-cinematic-kicker">✨ 成就更新</div><div class="mission-cinematic-title">ACHIEVEMENT</div><div class="mission-cinematic-subtitle">徽章進度更新！</div><div class="mission-cinematic-stars">' + starsHtml(3) + '</div><div class="mission-cinematic-reward">已同步到「我的徽章」。</div></div></div>';
    }
    return '<div class="mission-cinematic-card"><div class="mission-cinematic-inner"><div class="mission-cinematic-kicker">🎮 任務開始</div><div class="mission-cinematic-title">QUEST START</div><div class="mission-cinematic-subtitle">' + esc(data.title || '校園社交任務') + '</div><div class="mission-cinematic-meta"><span class="mission-cinematic-pill">📍 ' + esc(data.location || '校園') + '</span><span class="mission-cinematic-pill">🎯 ' + esc(data.goal || '社交練習') + '</span></div></div></div>';
  }

  function showOverlay(kind, data, duration) {
    injectStyles();
    if (!canShow(kind)) return;
    const reduced = document.body.classList.contains('reduced-motion');
    const wait = reduced ? 260 : Number(duration || 900);
    removeOverlay();
    const overlay = document.createElement('div');
    overlay.className = 'mission-cinematic-overlay';
    if (kind === 'map') overlay.classList.add('is-map');
    if (kind === 'badge') overlay.classList.add('is-badge');
    overlay.innerHTML = overlayHtml(kind, data || {});
    document.body.appendChild(overlay);
    setTimeout(function () {
      overlay.classList.add('is-leaving');
      setTimeout(function () { if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay); }, reduced ? 40 : 240);
    }, wait);
  }

  function missionStartData(key) {
    const game = getGame(key) || {};
    return {
      title: game.title || '校園社交任務',
      location: game.location || game.role || '校園',
      goal: game.socialGoal || game.mission || '社交練習'
    };
  }

  function animateActiveScreen() {
    if (document.body.classList.contains('reduced-motion')) return;
    const active = document.querySelector('.screen.active');
    if (!active) return;
    active.classList.remove('screen-cinematic-enter');
    void active.offsetWidth;
    active.classList.add('screen-cinematic-enter');
    setTimeout(function () { active.classList.remove('screen-cinematic-enter'); }, 460);
  }

  function getMissionKeyFromButton(button) {
    const onclick = String(button.getAttribute('onclick') || '');
    const match = onclick.match(/startAsdGame\(['\"]([^'\"]+)['\"]\)/);
    return match ? match[1] : '';
  }

  function installClickListener() {
    if (clickListenerInstalled) return;
    clickListenerInstalled = true;
    document.addEventListener('click', function (event) {
      const button = event.target && event.target.closest ? event.target.closest('button') : null;
      if (!button) return;
      const text = String(button.textContent || '').trim();
      const onclick = String(button.getAttribute('onclick') || '');

      if (text.includes('RPG 校園地圖')) {
        showOverlay('map', {}, 620);
        setTimeout(animateActiveScreen, 220);
        return;
      }

      if (text.includes('開始這個情境') || onclick.includes('startAsdGame')) {
        const key = getMissionKeyFromButton(button);
        showOverlay('start', missionStartData(key), 780);
        setTimeout(animateActiveScreen, 320);
      }
    }, true);
  }

  function wrapStartAsdGame() {
    if (typeof window.startAsdGame !== 'function') return;
    const original = window.startAsdGame;
    if (original.__missionTransitionWrapped) return;
    window.startAsdGame = function (missionKey) {
      showOverlay('start', missionStartData(missionKey), 780);
      return original.apply(window, arguments);
    };
    window.startAsdGame.__missionTransitionWrapped = true;
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
    setTimeout(function () {
      showOverlay('complete', { title: session.title || game.title || '校園社交任務', score: score, stars: stars, exp: exp }, 1450);
    }, 260);
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

  function install() {
    injectStyles();
    installClickListener();
    wrapStartAsdGame();
    wrapScreenSwitch();
    installFinishWatcher();
    [300, 900, 1800, 3200].forEach(function (delay) {
      setTimeout(wrapStartAsdGame, delay);
      setTimeout(wrapScreenSwitch, delay);
      setTimeout(installFinishWatcher, delay);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install);
  else install();
  window.addEventListener('load', install);
  window.addEventListener('missionUiLoaded', install);
})();
