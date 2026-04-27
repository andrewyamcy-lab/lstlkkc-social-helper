// /scenarios/scenario-register.js
// 負責把額外情境註冊到遊戲、徽章和情境選擇頁。

(function () {
  const EXTRA_TOTAL = window.EXTRA_SCENARIO_TOTAL || 13;

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function getExtraSituations() {
    return window.extraSituations || {};
  }

  function registerExtraScenarios() {
    const extraSituations = getExtraSituations();

    try {
      Object.keys(extraSituations).forEach((key) => {
        const item = extraSituations[key];
        if (!item) return;

        if (typeof badgeState !== 'undefined' && !(key in badgeState)) {
          badgeState[key] = false;
        }

        if (typeof badgeMeta !== 'undefined' && item.badge) {
          badgeMeta[key] = item.badge;
        }

        if (typeof asdGames !== 'undefined' && item.game) {
          asdGames[key] = item.game;
        }
      });
    } catch (error) {
      console.warn('未能註冊額外情境：', error);
    }
  }

  function addExtraScenarioCards() {
    const grid = document.querySelector('.scenario-select-grid');
    if (!grid) return;

    const extraSituations = getExtraSituations();

    Object.keys(extraSituations).forEach((key) => {
      if (document.getElementById(`scenarioCard-${key}`)) return;

      const card = extraSituations[key].card || {};
      grid.insertAdjacentHTML(
        'beforeend',
        `<div class="scenario-card" id="scenarioCard-${key}"><div class="emoji">${escapeHtml(card.icon || '🏫')}</div><strong>${escapeHtml(card.title || '校園情境')}</strong><div class="small">${escapeHtml(card.desc || '')}</div><button onclick="startAsdGame('${key}')">開始這個情境</button></div>`
      );
    });
  }

  function normalizeExtraTotalText() {
    const el = document.getElementById('gameStatusText');
    if (el) el.textContent = el.textContent.replace(/\/\s*(8|12|13)/g, `/ ${EXTRA_TOTAL}`);
  }

  function refreshExtraScenarioUI() {
    registerExtraScenarios();
    if (typeof applyScenarioVisuals === 'function') applyScenarioVisuals();
    addExtraScenarioCards();
    normalizeExtraTotalText();
  }

  function patchNavigationFunction(functionName) {
    const original = window[functionName];
    if (typeof original !== 'function') return;
    if (original.__extraScenarioRegisterPatched) return;

    const patched = function (...args) {
      const result = original.apply(this, args);
      setTimeout(refreshExtraScenarioUI, 0);
      return result;
    };

    patched.__extraScenarioRegisterPatched = true;
    window[functionName] = patched;
  }

  function initScenarioRegister() {
    refreshExtraScenarioUI();
    ['showSituationScreen', 'showBadgeScreen', 'showCoverScreen', 'showSettingsScreen'].forEach(patchNavigationFunction);
    setTimeout(refreshExtraScenarioUI, 100);
    setTimeout(refreshExtraScenarioUI, 500);
  }

  window.registerExtraScenarios = registerExtraScenarios;
  window.addExtraScenarioCards = addExtraScenarioCards;
  window.normalizeExtraTotalText = normalizeExtraTotalText;
  window.refreshExtraScenarioUI = refreshExtraScenarioUI;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScenarioRegister);
  } else {
    initScenarioRegister();
  }
})();
