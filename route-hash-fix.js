// /route-hash-fix.js
// Route hash sync + auth safety + UI upgrade loader.
// Also connects 情境選擇 completion badges to the same RPG progress used by the RPG map.

(function () {
  const ROUTES = {
    coverScreen: '#cover',
    authLoadingScreen: '#loading',
    authLoginScreen: '#login',
    badgeScreen: '#badges',
    settingsScreen: '#settings',
    phraseLibraryScreen: '#skills',
    situationScreen: '#situations',
    gameScreen: '#mission',
    characterScreen: '#character',
    missionResultHistoryScreen: '#mission-history',
    rpgMapScreen: '#rpg-map'
  };

  const RPG_PROGRESS_KEY = 'asd_school_rpg_progress_v1';

  const SCENARIO_LABELS = {
    start: '課室：發起對話',
    refuse: '小息：禮貌拒絕',
    conflict: '借文具：處理衝突',
    respond: '放學前：作出回應',
    groupwork: '小組：加入合作',
    help: '課堂中：向老師求助',
    lunch: '午飯時間：加入同學',
    homework: '放學後：確認功課'
  };

  const SCENARIO_BADGES = {
    start: '🗣️ 開口勇士',
    refuse: '🙅 禮貌拒絕者',
    conflict: '🧩 冷靜調解員',
    respond: '💬 暖心回應者',
    groupwork: '🤝 合作參與者',
    help: '🙋 主動求助者',
    lunch: '🍱 午飯同伴',
    homework: '📚 確認達人'
  };

  function safeJsonParse(value, fallback) {
    try { return JSON.parse(value || ''); } catch (error) { return fallback; }
  }

  function readLocalJson(key) {
    return safeJsonParse(localStorage.getItem(key), null);
  }

  function getRpgProgress() {
    const main = readLocalJson(RPG_PROGRESS_KEY);
    if (main && typeof main === 'object') return main;

    const oldKeys = [
      'asd_school_rpg_v5',
      'asd_school_rpg_v4',
      'asd_school_rpg_v3',
      'asd_school_rpg_v2',
      'asd_school_rpg'
    ];

    for (const key of oldKeys) {
      const value = readLocalJson(key);
      if (value && typeof value === 'object') return value;
    }

    return {};
  }

  function hasFirebaseUser() {
    return Boolean(window.LSTFirebase && window.LSTFirebase.user);
  }

  function firebaseHasAnswered() {
    return Boolean(window.LSTFirebase && window.LSTFirebase.ready);
  }

  function setRoute(hash) {
    if (!hash || window.location.hash === hash) return;
    try { history.replaceState(null, '', hash); } catch (error) { window.location.hash = hash; }
  }

  function loadScriptOnce(src, id) {
    if (!src || !id || document.getElementById(id)) return;
    const script = document.createElement('script');
    script.id = id;
    script.src = src;
    script.defer = true;
    document.body.appendChild(script);
  }

  function loadUiUpgradeScripts() {
    loadScriptOnce('character-name-edit.js?v=20260512-5', 'characterNameEditScript');
    loadScriptOnce('phrase-library-upgrade.js?v=20260512-9', 'phraseLibraryUpgradeScript');
  }

  function showLoginFallback() {
    if (typeof window.showAuthLoginScreen === 'function') {
      window.showAuthLoginScreen();
    } else {
      document.body.classList.add('auth-gate-active');
      document.body.classList.remove('auth-cover-ready');
      document.querySelectorAll('.screen').forEach(function (screen) {
        screen.classList.toggle('active', screen.id === 'authLoginScreen');
      });
    }
    setRoute('#login');
  }

  function getActiveScreenId() {
    const rpg = document.getElementById('rpgMapScreen');
    if (rpg && rpg.classList.contains('active')) return 'rpgMapScreen';
    const active = document.querySelector('.screen.active');
    return active ? active.id : '';
  }

  function shouldForceLogin() {
    if (hasFirebaseUser()) return false;
    const hash = window.location.hash || '';
    const active = getActiveScreenId();
    if (hash === '#cover' || active === 'coverScreen' || !active) return true;
    if (firebaseHasAnswered() && active !== 'authLoginScreen' && active !== 'authLoadingScreen') return true;
    return false;
  }

  function enforceAuthRoute() {
    if (shouldForceLogin()) showLoginFallback();
  }

  function syncRouteFromActiveScreen() {
    if (shouldForceLogin()) {
      showLoginFallback();
      return;
    }

    const id = getActiveScreenId();
    if (id && ROUTES[id]) setRoute(ROUTES[id]);
    if (id === 'situationScreen') setTimeout(updateSituationCompletionBadges, 30);
  }

  function patchFunction(name, routeHash) {
    const fn = window[name];
    if (typeof fn !== 'function') return false;
    if (fn.__routeHashPatched) return true;

    window[name] = function () {
      const result = fn.apply(this, arguments);
      setTimeout(function () {
        if (routeHash === '#cover' && !hasFirebaseUser()) {
          showLoginFallback();
          return;
        }
        setRoute(routeHash);
        syncRouteFromActiveScreen();
        if (routeHash === '#situations') {
          setTimeout(updateSituationCompletionBadges, 80);
          setTimeout(updateSituationCompletionBadges, 250);
          setTimeout(updateSituationCompletionBadges, 700);
        }
      }, 0);
      return result;
    };

    window[name].__routeHashPatched = true;
    return true;
  }

  function patchKnownNavigationFunctions() {
    patchFunction('showCoverScreen', '#cover');
    patchFunction('showBadgeScreen', '#badges');
    patchFunction('showSettingsScreen', '#settings');
    patchFunction('showPhraseLibraryScreen', '#skills');
    patchFunction('showSituationScreen', '#situations');
    patchFunction('showCharacterScreen', '#character');
    patchFunction('showMissionResultHistory', '#mission-history');
    patchFunction('showRpgMapScreen', '#rpg-map');
    patchFunction('openRpgMap', '#rpg-map');
    patchFunction('goToRpgMap', '#rpg-map');
  }

  function observeScreenChanges() {
    if (window.__routeHashObserverInstalled) return;
    window.__routeHashObserverInstalled = true;

    const observer = new MutationObserver(function () {
      setTimeout(syncRouteFromActiveScreen, 0);
    });

    observer.observe(document.documentElement, {
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });
  }

  function startAuthWatchdog() {
    if (window.__authRouteWatchdogStarted) return;
    window.__authRouteWatchdogStarted = true;
    [100, 500, 1200, 2500, 5000, 8000].forEach(function (delay) {
      setTimeout(enforceAuthRoute, delay);
    });
    setInterval(enforceAuthRoute, 1500);
  }

  function normaliseStars(value, record) {
    let stars = Number(value);

    if (!stars || Number.isNaN(stars)) {
      const score = Number(record && (record.score ?? record.totalScore ?? record.finalScore ?? record.points ?? record.correctScore));
      if (score || score === 0) {
        const max = Number(record && (record.maxScore || record.totalPossible || record.fullScore || 10));
        const ratio = max ? score / max : score / 10;
        if (ratio >= 0.8) stars = 3;
        else if (ratio >= 0.5) stars = 2;
        else if (score > 0) stars = 1;
      }
    }

    stars = Math.round(Number(stars || 0));
    if (stars >= 3) return 3;
    if (stars === 2) return 2;
    if (stars === 1) return 1;
    return 0;
  }

  function collectStarsFromRecord(record, map) {
    if (!record || typeof record !== 'object') return;
    const id = record.scenarioId || record.gameId || record.missionId || record.id || record.type || record.key;
    if (!id || !SCENARIO_LABELS[id]) return;
    const stars = normaliseStars(record.stars ?? record.starCount ?? record.rating ?? record.resultStars ?? record.earnedStars ?? record.badgeStars, record);
    if (stars) map[id] = Math.max(Number(map[id] || 0), stars);
  }

  function getScenarioStarMap() {
    const map = {};
    const progress = getRpgProgress();

    try {
      const rpgStars = progress.stars || {};
      Object.keys(rpgStars).forEach(function (id) {
        if (SCENARIO_LABELS[id]) {
          const stars = normaliseStars(rpgStars[id], null);
          if (stars) map[id] = Math.max(Number(map[id] || 0), stars);
        }
      });
    } catch (error) {}

    try {
      const rpgScores = progress.scores || {};
      Object.keys(rpgScores).forEach(function (id) {
        if (SCENARIO_LABELS[id] && !map[id]) {
          const stars = normaliseStars(null, { score: rpgScores[id], maxScore: 10 });
          if (stars) map[id] = stars;
        }
      });
    } catch (error) {}

    try {
      const savedAppState = progress.appState || progress.state || progress;
      const history = Array.isArray(savedAppState.reviewHistory) ? savedAppState.reviewHistory : [];
      history.forEach(function (record) { collectStarsFromRecord(record, map); });
      const missionResults = Array.isArray(savedAppState.missionResults) ? savedAppState.missionResults : [];
      missionResults.forEach(function (record) { collectStarsFromRecord(record, map); });
    } catch (error) {}

    try {
      const history = window.appState && Array.isArray(window.appState.reviewHistory) ? window.appState.reviewHistory : [];
      history.forEach(function (record) { collectStarsFromRecord(record, map); });
    } catch (error) {}

    return map;
  }

  function getCompletedScenarioIds() {
    const completed = new Set();
    const progress = getRpgProgress();

    try {
      const rpgCompleted = progress.completed || {};
      Object.keys(rpgCompleted).forEach(function (id) {
        if (rpgCompleted[id] && SCENARIO_LABELS[id]) completed.add(id);
      });
    } catch (error) {}

    try {
      const rpgStars = progress.stars || {};
      Object.keys(rpgStars).forEach(function (id) {
        if (Number(rpgStars[id] || 0) > 0 && SCENARIO_LABELS[id]) completed.add(id);
      });
    } catch (error) {}

    try {
      const rpgScores = progress.scores || {};
      Object.keys(rpgScores).forEach(function (id) {
        if ((Number(rpgScores[id] || 0) > 0 || progress.completed?.[id]) && SCENARIO_LABELS[id]) completed.add(id);
      });
    } catch (error) {}

    try {
      const savedBadges = progress.badgeState || progress.badges || window.badgeState || {};
      Object.keys(savedBadges).forEach(function (id) {
        if (savedBadges[id] && SCENARIO_LABELS[id]) completed.add(id);
      });
    } catch (error) {}

    try {
      const savedAppState = progress.appState || progress.state || progress;
      const history = Array.isArray(savedAppState.reviewHistory) ? savedAppState.reviewHistory : [];
      history.forEach(function (record) {
        const id = record.scenarioId || record.gameId || record.missionId || record.id || record.type || record.key;
        if (id && SCENARIO_LABELS[id]) completed.add(id);
      });
    } catch (error) {}

    try {
      const history = window.appState && Array.isArray(window.appState.reviewHistory) ? window.appState.reviewHistory : [];
      history.forEach(function (record) {
        const id = record.scenarioId || record.gameId || record.missionId || record.id || record.type || record.key;
        if (id && SCENARIO_LABELS[id]) completed.add(id);
      });
    } catch (error) {}

    return completed;
  }

  function starText(stars) {
    const count = Math.max(1, Math.min(3, Number(stars || 1)));
    return '⭐'.repeat(count) + '☆'.repeat(3 - count);
  }

  function starClass(stars) {
    if (Number(stars) >= 3) return 'stars-3';
    if (Number(stars) === 2) return 'stars-2';
    return 'stars-1';
  }

  function updateSituationCompletionBadges() {
    const screen = document.getElementById('situationScreen');
    if (!screen) return;

    injectSituationCompletionStyles();
    const completed = getCompletedScenarioIds();
    const starMap = getScenarioStarMap();

    screen.querySelectorAll('.scenario-card').forEach(function (card) {
      const button = card.querySelector('button[onclick*="startAsdGame"]');
      if (!button) return;

      const onclick = button.getAttribute('onclick') || '';
      const match = onclick.match(/startAsdGame\(['\"]([^'\"]+)['\"]\)/);
      if (!match) return;

      const scenarioId = match[1];
      const isDone = completed.has(scenarioId);
      const stars = starMap[scenarioId] || 3;
      const colourClass = starClass(stars);

      card.classList.toggle('scenario-card-completed', isDone);
      card.classList.remove('scenario-stars-1', 'scenario-stars-2', 'scenario-stars-3');
      if (isDone) card.classList.add('scenario-' + colourClass);

      let badge = card.querySelector('.scenario-completion-badge');
      if (!badge) {
        badge = document.createElement('div');
        badge.className = 'scenario-completion-badge';
        card.insertBefore(badge, button);
      }

      badge.classList.remove('stars-1', 'stars-2', 'stars-3');

      if (isDone) {
        badge.classList.add(colourClass);
        badge.innerHTML = '<span class="completion-main">✅ 已完成｜' + starText(stars) + '</span><span class="completion-sub">' + (SCENARIO_BADGES[scenarioId] || '已取得徽章') + '</span>';
        button.textContent = '再練習一次';
      } else {
        badge.innerHTML = '<span class="completion-main">⭕ 未完成</span><span class="completion-sub">完成後會在這裡顯示</span>';
        button.textContent = '開始這個情境';
      }
    });
  }

  function injectSituationCompletionStyles() {
    let style = document.getElementById('situationCompletionStyle');
    if (!style) {
      style = document.createElement('style');
      style.id = 'situationCompletionStyle';
      document.head.appendChild(style);
    }

    style.textContent = `
      .scenario-completion-badge { display:grid; gap:2px; width:fit-content; max-width:100%; margin:8px 0 6px; padding:7px 11px; border-radius:999px; color:#6b7280; background:rgba(255,255,255,.70); border:1px solid rgba(255,255,255,.74); box-shadow:inset 0 1px 0 rgba(255,255,255,.92), 0 6px 14px rgba(29,53,87,.06); }
      .scenario-completion-badge .completion-main { font-size:.84rem; font-weight:950; line-height:1.1; }
      .scenario-completion-badge .completion-sub { font-size:.72rem; font-weight:850; color:var(--muted); line-height:1.15; }
      .scenario-card-completed.scenario-stars-3 { background:linear-gradient(145deg, rgba(57,255,20,.16), rgba(255,255,255,.58)) !important; border-color:rgba(57,255,20,.32) !important; box-shadow:0 0 0 3px rgba(57,255,20,.08), var(--soft-shadow), inset 0 1px 0 rgba(255,255,255,.82) !important; }
      .scenario-card-completed.scenario-stars-2 { background:linear-gradient(145deg, rgba(255,214,10,.20), rgba(255,255,255,.58)) !important; border-color:rgba(255,214,10,.45) !important; box-shadow:0 0 0 3px rgba(255,214,10,.12), var(--soft-shadow), inset 0 1px 0 rgba(255,255,255,.82) !important; }
      .scenario-card-completed.scenario-stars-1 { background:linear-gradient(145deg, rgba(255,69,58,.15), rgba(255,255,255,.58)) !important; border-color:rgba(255,69,58,.36) !important; box-shadow:0 0 0 3px rgba(255,69,58,.10), var(--soft-shadow), inset 0 1px 0 rgba(255,255,255,.82) !important; }
      .scenario-completion-badge.stars-3 { color:#083b00; background:linear-gradient(180deg, rgba(57,255,20,.34), rgba(255,255,255,.82)); box-shadow:0 0 0 3px rgba(57,255,20,.12), inset 0 1px 0 rgba(255,255,255,.92); }
      .scenario-completion-badge.stars-2 { color:#6b4300; background:linear-gradient(180deg, rgba(255,214,10,.40), rgba(255,255,255,.84)); box-shadow:0 0 0 3px rgba(255,214,10,.14), inset 0 1px 0 rgba(255,255,255,.92); }
      .scenario-completion-badge.stars-1 { color:#7a1212; background:linear-gradient(180deg, rgba(255,69,58,.22), rgba(255,255,255,.84)); box-shadow:0 0 0 3px rgba(255,69,58,.12), inset 0 1px 0 rgba(255,255,255,.92); }
      .scenario-completion-badge.stars-3 .completion-sub { color:#1f6f00; }
      .scenario-completion-badge.stars-2 .completion-sub { color:#8a6500; }
      .scenario-completion-badge.stars-1 .completion-sub { color:#9b1c15; }
    `;
  }

  function install() {
    loadUiUpgradeScripts();
    patchKnownNavigationFunctions();
    observeScreenChanges();
    startAuthWatchdog();
    injectSituationCompletionStyles();
    setTimeout(loadUiUpgradeScripts, 100);
    setTimeout(patchKnownNavigationFunctions, 200);
    setTimeout(patchKnownNavigationFunctions, 700);
    setTimeout(patchKnownNavigationFunctions, 1500);
    setTimeout(syncRouteFromActiveScreen, 50);
    setTimeout(syncRouteFromActiveScreen, 500);
    setTimeout(enforceAuthRoute, 900);
    setTimeout(updateSituationCompletionBadges, 700);
  }

  window.setAppRouteHash = setRoute;
  window.syncRouteFromActiveScreen = syncRouteFromActiveScreen;
  window.enforceAuthRoute = enforceAuthRoute;
  window.loadUiUpgradeScripts = loadUiUpgradeScripts;
  window.updateSituationCompletionBadges = updateSituationCompletionBadges;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install);
  else install();

  window.addEventListener('load', install);
  window.addEventListener('storage', updateSituationCompletionBadges);
  window.addEventListener('click', function () {
    setTimeout(syncRouteFromActiveScreen, 80);
    setTimeout(updateSituationCompletionBadges, 220);
  }, true);
})();
