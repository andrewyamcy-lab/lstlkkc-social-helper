// /scenario-total-sync.js
// Reliable scenario total sync for the single-page app.
// Counts real available scenario cards after extra scenarios, cleanup, images, and filters have finished.
// Also adds difficulty badges to the situation list.
// No MutationObserver. No interval.

(function () {
  const DIFFICULTY_MAP = {
    start: { stars: '★', label: '易' },
    homework: { stars: '★', label: '易' },
    respond: { stars: '★', label: '易' },
    refuse: { stars: '★', label: '易' },
    academicOnly: { stars: '★', label: '易' },

    conflict: { stars: '★★', label: '中等' },
    help: { stars: '★★', label: '中等' },
    groupwork: { stars: '★★', label: '中等' },
    copyHomework: { stars: '★★', label: '中等' },
    whatsappIgnored: { stars: '★★', label: '中等' },
    lostItem: { stars: '★★', label: '中等' },
    peGrouping: { stars: '★★', label: '中等' },
    losingGame: { stars: '★★', label: '中等' },
    teacherReminder: { stars: '★★', label: '中等' },

    teasing: { stars: '★★★', label: '較難' },
    disagree: { stars: '★★★', label: '較難' },
    quietSpace: { stars: '★★★', label: '較難' },
    queueJump: { stars: '★★★', label: '較難' },
    bumped: { stars: '★★★', label: '較難' },
    lunch: { stars: '★★★', label: '較難' }
  };

  function getScenarioKeyFromButton(button) {
    if (!button) return '';
    const onclickText = button.getAttribute('onclick') || '';
    const match = onclickText.match(/startAsdGame\(['"]([^'"]+)['"]\)/);
    return match && match[1] ? match[1] : '';
  }

  function getDifficulty(key) {
    return DIFFICULTY_MAP[key] || { stars: '★', label: '易' };
  }

  function injectDifficultyStyles() {
    if (document.getElementById('scenarioDifficultyStyle')) return;

    const style = document.createElement('style');
    style.id = 'scenarioDifficultyStyle';
    style.textContent = `
      .scenario-difficulty-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        width: fit-content;
        margin: 8px 0 10px;
        padding: 6px 10px;
        border-radius: 999px;
        background: linear-gradient(180deg, rgba(255, 214, 10, 0.26), rgba(255, 176, 0, 0.14));
        border: 1px solid rgba(255, 176, 0, 0.36);
        color: #7a4a00;
        font-size: 0.82rem;
        font-weight: 950;
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.70), 0 8px 18px rgba(255,176,0,0.10);
      }

      .scenario-difficulty-pill .difficulty-stars {
        color: #0057d9;
        letter-spacing: -0.04em;
        font-weight: 950;
      }

      .scenario-difficulty-pill.easy {
        background: linear-gradient(180deg, rgba(52, 199, 89, 0.18), rgba(52, 199, 89, 0.08));
        border-color: rgba(52, 199, 89, 0.28);
        color: #166534;
      }

      .scenario-difficulty-pill.medium {
        background: linear-gradient(180deg, rgba(255, 214, 10, 0.26), rgba(255, 176, 0, 0.14));
        border-color: rgba(255, 176, 0, 0.36);
        color: #7a4a00;
      }

      .scenario-difficulty-pill.hard {
        background: linear-gradient(180deg, rgba(255, 107, 0, 0.20), rgba(255, 59, 48, 0.10));
        border-color: rgba(255, 107, 0, 0.34);
        color: #9a3412;
      }

      .situation-rpg-button-wrap {
        display: flex;
        justify-content: center;
        margin: 18px 0 8px;
      }

      .situation-rpg-button-wrap button {
        min-width: min(420px, 100%);
        justify-content: center;
      }
    `;
    document.head.appendChild(style);
  }

  function getDifficultyClass(stars) {
    if (stars === '★★★') return 'hard';
    if (stars === '★★') return 'medium';
    return 'easy';
  }

  function applyScenarioDifficultyBadges() {
    injectDifficultyStyles();

    document.querySelectorAll('.scenario-card').forEach(function (card) {
      const button = card.querySelector('button[onclick*="startAsdGame"]');
      const key = getScenarioKeyFromButton(button);
      if (!key) return;

      const difficulty = getDifficulty(key);
      const difficultyClass = getDifficultyClass(difficulty.stars);
      let badge = card.querySelector('.scenario-difficulty-pill');

      if (!badge) {
        badge = document.createElement('div');
        badge.className = 'scenario-difficulty-pill';
        const small = card.querySelector('.small');
        if (small && small.nextSibling) {
          card.insertBefore(badge, small.nextSibling);
        } else if (button) {
          card.insertBefore(badge, button);
        } else {
          card.appendChild(badge);
        }
      }

      badge.className = 'scenario-difficulty-pill ' + difficultyClass;
      badge.innerHTML = '<span class="difficulty-stars">' + difficulty.stars + '</span><span>難度：' + difficulty.label + '</span>';
    });
  }

  function addRpgButtonToSituationList() {
    injectDifficultyStyles();

    const situationScreen = document.getElementById('situationScreen');
    if (!situationScreen || document.getElementById('situationRpgMapButton')) return;

    const grid = situationScreen.querySelector('.scenario-select-grid');
    if (!grid) return;

    const wrap = document.createElement('div');
    wrap.className = 'situation-rpg-button-wrap';
    wrap.id = 'situationRpgMapButton';
    wrap.innerHTML = '<button type="button" onclick="showRpgMapScreen()">🗺️ RPG 校園地圖</button>';
    grid.insertAdjacentElement('beforebegin', wrap);
  }

  function getAvailableScenarioKeys() {
    const keys = new Set();

    document.querySelectorAll('.scenario-card').forEach(function (card) {
      if (!card || card.offsetParent === null && card.classList.contains('filtered-out')) {
        // Skip only actively filtered cards when counting visible filter result elsewhere.
        // For total scenario count, filtered cards should still count, so do not return here.
      }

      const button = card.querySelector('button[onclick*="startAsdGame"]');
      const key = getScenarioKeyFromButton(button);
      if (!key) return;

      // Removed scenarios should not count even if old cached cards are still present briefly.
      const removed = ['lunchSeat', 'borrowedNoReturn', 'groupRole', 'jokeConfusion'];
      if (removed.includes(key)) return;

      keys.add(key);
    });

    return Array.from(keys);
  }

  function getCompletedCount() {
    let completed = 0;

    try {
      if (typeof badgeState !== 'undefined' && badgeState) {
        Object.keys(badgeState).forEach(function (key) {
          if (badgeState[key]) completed += 1;
        });
      }
    } catch (error) {}

    const total = getAvailableScenarioKeys().length;
    if (completed > total) completed = total;
    return completed;
  }

  function syncScenarioTotal() {
    addRpgButtonToSituationList();
    applyScenarioDifficultyBadges();

    const total = getAvailableScenarioKeys().length;
    const status = document.getElementById('gameStatusText');
    if (!status || !total) return;

    const completed = getCompletedCount();
    const text = status.textContent || '';

    let hintCount = '0';
    let calmCount = '0';

    const hintMatch = text.match(/使用提示：\s*(\d+)\s*次/);
    const calmMatch = text.match(/使用冷靜模式：\s*(\d+)\s*次/);
    if (hintMatch && hintMatch[1]) hintCount = hintMatch[1];
    if (calmMatch && calmMatch[1]) calmCount = calmMatch[1];

    status.textContent = '已完成情境：' + completed + ' / ' + total + '｜使用提示：' + hintCount + ' 次｜使用冷靜模式：' + calmCount + ' 次';
  }

  function initScenarioTotalSync() {
    syncScenarioTotal();
  }

  window.syncScenarioTotal = syncScenarioTotal;
  window.initScenarioTotalSync = initScenarioTotalSync;
  window.applyScenarioDifficultyBadges = applyScenarioDifficultyBadges;
  window.addRpgButtonToSituationList = addRpgButtonToSituationList;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScenarioTotalSync);
  } else {
    initScenarioTotalSync();
  }

  // Delayed one-off passes because scenario scripts add/remove cards shortly after page load.
  setTimeout(syncScenarioTotal, 150);
  setTimeout(syncScenarioTotal, 450);
  setTimeout(syncScenarioTotal, 1000);
  setTimeout(syncScenarioTotal, 1800);
  setTimeout(syncScenarioTotal, 3200);
})();
