// /scenario-cleanup.js
// Removes scenarios that overlap too much with stronger existing scenarios.
// Also fixes browser Back button behaviour for this single-page app.

(function () {
  const REMOVED_SCENARIOS = [
    { key: 'lunchSeat', title: '午飯座位：想加入但怕尷尬' },
    { key: 'borrowedNoReturn', title: '借物品未還：清楚提醒' },
    { key: 'groupRole', title: '小組分工：不清楚自己做甚麼' },
    { key: 'jokeConfusion', title: '分不清玩笑：先確認' }
  ];

  const SCREEN_MAP = {
    cover: 'coverScreen',
    badge: 'badgeScreen',
    settings: 'settingsScreen',
    phraseLibrary: 'phraseLibraryScreen',
    situation: 'situationScreen',
    game: 'gameScreen'
  };

  let isHandlingPopState = false;
  let historyPatchInstalled = false;

  function deleteKeyFromKnownObjects(key) {
    try { if (typeof asdGames !== 'undefined' && asdGames && key in asdGames) delete asdGames[key]; } catch (error) {}
    try { if (typeof badgeMeta !== 'undefined' && badgeMeta && key in badgeMeta) delete badgeMeta[key]; } catch (error) {}
    try { if (typeof badgeState !== 'undefined' && badgeState && key in badgeState) delete badgeState[key]; } catch (error) {}
    try { if (typeof extraSituations !== 'undefined' && extraSituations && key in extraSituations) delete extraSituations[key]; } catch (error) {}

    try { if (window.asdGames && key in window.asdGames) delete window.asdGames[key]; } catch (error) {}
    try { if (window.badgeMeta && key in window.badgeMeta) delete window.badgeMeta[key]; } catch (error) {}
    try { if (window.badgeState && key in window.badgeState) delete window.badgeState[key]; } catch (error) {}
    try { if (window.extraSituations && key in window.extraSituations) delete window.extraSituations[key]; } catch (error) {}
  }

  function removeScenarioCard(item) {
    const byId = document.getElementById('scenarioCard-' + item.key);
    if (byId) byId.remove();

    document.querySelectorAll('.scenario-card').forEach(function (card) {
      const text = card.textContent || '';
      const button = card.querySelector('button[onclick*="startAsdGame"]');
      const onclickText = button ? (button.getAttribute('onclick') || '') : '';

      if (text.includes(item.title) || onclickText.includes("'" + item.key + "'") || onclickText.includes('"' + item.key + '"')) {
        card.remove();
      }
    });
  }

  function removeScenarioImageMapping(key) {
    // scenarioImageMap is private inside scenario-images-light.js, so we cannot delete it directly here.
    // Removing the card and asdGames entry is enough to stop the scenario from being shown or started.
  }

  function getScenarioTotal() {
    try {
      if (typeof asdGames !== 'undefined' && asdGames) {
        return Object.keys(asdGames).filter(function (key) {
          return asdGames[key] && Array.isArray(asdGames[key].steps);
        }).length;
      }
    } catch (error) {}

    const buttons = document.querySelectorAll('button[onclick*="startAsdGame"]');
    const keys = new Set();
    buttons.forEach(function (button) {
      const onclickText = button.getAttribute('onclick') || '';
      const match = onclickText.match(/startAsdGame\(['"]([^'"]+)['"]\)/);
      if (match && match[1]) keys.add(match[1]);
    });
    return keys.size;
  }

  function updateTotalText() {
    const total = getScenarioTotal();
    const status = document.getElementById('gameStatusText');
    if (!status || !total) return;

    status.textContent = status.textContent.replace(/已完成情境：\s*(\d+)\s*\/\s*\d+/, '已完成情境：$1 / ' + total);
  }

  function removeOverlappingScenarios() {
    REMOVED_SCENARIOS.forEach(function (item) {
      deleteKeyFromKnownObjects(item.key);
      removeScenarioCard(item);
      removeScenarioImageMapping(item.key);
    });

    updateTotalText();

    if (typeof renderBadges === 'function') {
      renderBadges();
    }
  }

  function getCurrentScreenName() {
    const active = document.querySelector('.screen.active');
    if (!active) return 'cover';

    const idToName = {
      coverScreen: 'cover',
      badgeScreen: 'badge',
      settingsScreen: 'settings',
      phraseLibraryScreen: 'phraseLibrary',
      situationScreen: 'situation',
      gameScreen: 'game'
    };

    return idToName[active.id] || 'cover';
  }

  function showScreenWithoutHistory(screenName) {
    const screenId = SCREEN_MAP[screenName] || 'coverScreen';
    const screenIds = Object.keys(SCREEN_MAP).map(function (key) { return SCREEN_MAP[key]; });

    screenIds.forEach(function (id) {
      const screen = document.getElementById(id);
      if (screen) screen.classList.toggle('active', id === screenId);
    });

    try {
      if (typeof appState !== 'undefined' && appState) appState.currentScreen = screenName;
    } catch (error) {}

    if (screenName === 'badge' && typeof renderBadges === 'function') renderBadges();
    if (screenName === 'situation') {
      if (typeof initScenarioImagesLight === 'function') setTimeout(initScenarioImagesLight, 80);
      if (typeof removeOverlappingScenarios === 'function') setTimeout(removeOverlappingScenarios, 120);
    }

    window.scrollTo({ top: 0, behavior: document.body.classList.contains('reduced-motion') ? 'auto' : 'smooth' });
  }

  function pushAppHistory(screenName) {
    if (isHandlingPopState) return;
    if (!history || !history.pushState) return;

    const currentState = history.state || {};
    if (currentState.appScreen === screenName) return;

    history.pushState({ appScreen: screenName }, '', '#' + screenName);
  }

  function patchScreenFunction(functionName, screenName) {
    if (typeof window[functionName] !== 'function') return;
    if (window[functionName].__historyPatched) return;

    const original = window[functionName];
    window[functionName] = function () {
      const result = original.apply(this, arguments);
      pushAppHistory(screenName);
      return result;
    };
    window[functionName].__historyPatched = true;
  }

  function patchStartAsdGameHistory() {
    if (typeof window.startAsdGame !== 'function') return;
    if (window.startAsdGame.__historyPatched) return;

    const originalStart = window.startAsdGame;
    window.startAsdGame = function () {
      const result = originalStart.apply(this, arguments);
      pushAppHistory('game');
      return result;
    };
    window.startAsdGame.__historyPatched = true;
  }

  function installBackButtonFix() {
    if (historyPatchInstalled) return;
    historyPatchInstalled = true;

    try {
      if (!history.state || !history.state.appScreen) {
        history.replaceState({ appScreen: getCurrentScreenName() }, '', '#cover');
      }
    } catch (error) {}

    patchScreenFunction('showCoverScreen', 'cover');
    patchScreenFunction('showBadgeScreen', 'badge');
    patchScreenFunction('showSettingsScreen', 'settings');
    patchScreenFunction('showPhraseLibraryScreen', 'phraseLibrary');
    patchScreenFunction('showSituationScreen', 'situation');
    patchStartAsdGameHistory();

    window.addEventListener('popstate', function (event) {
      const screenName = (event.state && event.state.appScreen) || 'cover';
      isHandlingPopState = true;
      showScreenWithoutHistory(screenName);
      isHandlingPopState = false;
    });
  }

  window.removeOverlappingScenarios = removeOverlappingScenarios;
  window.installBackButtonFix = installBackButtonFix;

  function initCleanupAndHistory() {
    removeOverlappingScenarios();
    installBackButtonFix();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCleanupAndHistory);
  } else {
    initCleanupAndHistory();
  }

  setTimeout(initCleanupAndHistory, 100);
  setTimeout(removeOverlappingScenarios, 300);
  setTimeout(removeOverlappingScenarios, 800);
  setTimeout(removeOverlappingScenarios, 1600);
  setTimeout(removeOverlappingScenarios, 3000);
})();
