// /route-hash-fix.js
// Keep the browser URL hash in sync with the current single-page-app screen.
// Example: RPG map should show #rpg-map instead of staying on #cover.

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

  function getActiveScreenId() {
    const rpg = document.getElementById('rpgMapScreen');
    if (rpg && rpg.classList.contains('active')) return 'rpgMapScreen';

    const active = document.querySelector('.screen.active');
    return active ? active.id : '';
  }

  function syncRouteFromActiveScreen() {
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

  function install() {
    patchKnownNavigationFunctions();
    observeScreenChanges();
    setTimeout(patchKnownNavigationFunctions, 200);
    setTimeout(patchKnownNavigationFunctions, 700);
    setTimeout(patchKnownNavigationFunctions, 1500);
    setTimeout(syncRouteFromActiveScreen, 50);
    setTimeout(syncRouteFromActiveScreen, 500);
  }

  window.setAppRouteHash = setRoute;
  window.syncRouteFromActiveScreen = syncRouteFromActiveScreen;

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
