// /route-hash-fix.js
// Keep the browser URL hash in sync with the current single-page-app screen.
// Extra safety: if there is no Firebase user, never leave the app on a blank #cover page.
// Also loads small UI upgrade modules that are safe to run after the main app scripts.

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

  function setRoute(hash) {
    if (!hash || window.location.hash === hash) return;
    try {
      history.replaceState(null, '', hash);
    } catch (error) {
      window.location.hash = hash;
    }
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
    loadScriptOnce('phrase-library-upgrade.js?v=20260512-5', 'phraseLibraryUpgradeScript');
  }

  function hasFirebaseUser() {
    return Boolean(window.LSTFirebase && window.LSTFirebase.user);
  }

  function firebaseHasAnswered() {
    return Boolean(window.LSTFirebase && window.LSTFirebase.ready);
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

  function getActiveScreenId() {
    const rpg = document.getElementById('rpgMapScreen');
    if (rpg && rpg.classList.contains('active')) return 'rpgMapScreen';

    const active = document.querySelector('.screen.active');
    return active ? active.id : '';
  }

  function syncRouteFromActiveScreen() {
    if (shouldForceLogin()) {
      showLoginFallback();
      return;
    }

    const id = getActiveScreenId();
    if (id && ROUTES[id]) setRoute(ROUTES[id]);
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

  function install() {
    loadUiUpgradeScripts();
    patchKnownNavigationFunctions();
    observeScreenChanges();
    startAuthWatchdog();
    setTimeout(loadUiUpgradeScripts, 100);
    setTimeout(patchKnownNavigationFunctions, 200);
    setTimeout(patchKnownNavigationFunctions, 700);
    setTimeout(patchKnownNavigationFunctions, 1500);
    setTimeout(syncRouteFromActiveScreen, 50);
    setTimeout(syncRouteFromActiveScreen, 500);
    setTimeout(enforceAuthRoute, 900);
  }

  window.setAppRouteHash = setRoute;
  window.syncRouteFromActiveScreen = syncRouteFromActiveScreen;
  window.enforceAuthRoute = enforceAuthRoute;
  window.loadUiUpgradeScripts = loadUiUpgradeScripts;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install);
  } else {
    install();
  }

  window.addEventListener('load', install);
  window.addEventListener('click', function () {
    setTimeout(syncRouteFromActiveScreen, 80);
  }, true);
})();
