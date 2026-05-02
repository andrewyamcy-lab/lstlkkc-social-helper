// /badge-system-v2.js
// RPG Badge System V2
// 5 achievement badges. Each badge has 3 stars.
// Completing a related mission with a 3-star performance gives that badge +1 star.
// When a badge reaches 3 stars, it becomes unlocked.

(function () {
  const STORAGE_KEY = 'asd_school_badges_v2';
  const THREE_STAR_SCORE = 8; // out of 10, because each mission has 5 questions x max 2 marks

  const BADGES = {
    communication: {
      icon: '🗣️',
      name: '溝通勇者',
      short: '溝通',
      desc: '能主動開口、回應別人，並清楚表達自己的想法。',
      missions: ['start', 'respond', 'whatsappIgnored', 'academicOnly']
    },
    boundary: {
      icon: '🛡️',
      name: '界線守護者',
      short: '界線',
      desc: '能有禮貌地拒絕、表達不舒服，並保護自己的界線。',
      missions: ['refuse', 'conflict', 'copyHomework', 'quietSpace']
    },
    teamwork: {
      icon: '🤝',
      name: '合作冒險者',
      short: '合作',
      desc: '能加入小組、接受不同意見，並嘗試與同學合作。',
      missions: ['groupwork', 'lunch', 'peGrouping', 'disagree']
    },
    calm: {
      icon: '🌱',
      name: '冷靜修練者',
      short: '冷靜',
      desc: '能在被取笑、被提醒、被撞或比賽失敗時保持冷靜。',
      missions: ['teasing', 'bumped', 'losingGame', 'teacherReminder']
    },
    problem: {
      icon: '🔍',
      name: '解難探索者',
      short: '解難',
      desc: '能遇到問題時求助、確認資料，並一步一步處理。',
      missions: ['help', 'homework', 'queueJump', 'lostItem']
    }
  };

  const MISSION_TO_BADGE = Object.keys(BADGES).reduce(function (map, badgeKey) {
    BADGES[badgeKey].missions.forEach(function (missionKey) {
      map[missionKey] = badgeKey;
    });
    return map;
  }, {});

  let activeMissionKey = '';
  let activeScore = 0;
  let answeredQuestionNumbers = new Set();
  let lastResultAwardKey = '';

  function getDefaultState() {
    const progress = {};
    Object.keys(BADGES).forEach(function (key) {
      progress[key] = 0;
    });
    return {
      progress: progress,
      awardedMissions: {},
      unlocked: {},
      version: 2
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return getDefaultState();
      const parsed = JSON.parse(raw);
      const state = getDefaultState();
      Object.assign(state.progress, parsed.progress || {});
      Object.assign(state.awardedMissions, parsed.awardedMissions || {});
      Object.assign(state.unlocked, parsed.unlocked || {});
      return state;
    } catch (error) {
      return getDefaultState();
    }
  }

  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function getBadgeKeyForMission(missionKey) {
    return MISSION_TO_BADGE[missionKey] || 'problem';
  }

  function getMissionTitle(missionKey) {
    try {
      if (typeof asdGames !== 'undefined' && asdGames[missionKey] && asdGames[missionKey].title) {
        return asdGames[missionKey].title;
      }
    } catch (error) {}
    return missionKey;
  }

  function getCurrentQuestionNumber() {
    const badge = document.getElementById('questionBadgeBig');
    const text = badge ? badge.textContent || '' : '';
    const match = text.match(/第\s*(\d+)\s*\/\s*\d+\s*題/);
    if (match && match[1]) return Number(match[1]);
    return answeredQuestionNumbers.size + 1;
  }

  function getOptionScore(missionKey, questionNumber, optionText) {
    try {
      const game = asdGames[missionKey];
      const step = game && game.steps ? game.steps[questionNumber - 1] : null;
      if (!step || !Array.isArray(step.options)) return 0;
      const cleanOptionText = String(optionText || '').trim();
      const option = step.options.find(function (item) {
        return cleanOptionText.includes(String(item.text || '').trim()) || String(item.text || '').trim().includes(cleanOptionText);
      });
      return option ? Number(option.score || 0) : 0;
    } catch (error) {
      return 0;
    }
  }

  function resetMissionTracking(missionKey) {
    activeMissionKey = missionKey;
    activeScore = 0;
    answeredQuestionNumbers = new Set();
    lastResultAwardKey = '';
  }

  function awardBadgeStarForMission(missionKey, score) {
    if (!missionKey || score < THREE_STAR_SCORE) return false;

    const badgeKey = getBadgeKeyForMission(missionKey);
    const badge = BADGES[badgeKey];
    if (!badge) return false;

    const state = loadState();

    if (state.awardedMissions[missionKey]) {
      if (typeof showToast === 'function') {
        showToast('這個任務已經為徽章加過星，試下挑戰其他任務吧！', 'info');
      }
      return false;
    }

    const oldStars = Math.min(3, Number(state.progress[badgeKey] || 0));
    const newStars = Math.min(3, oldStars + 1);
    state.progress[badgeKey] = newStars;
    state.awardedMissions[missionKey] = true;

    const justUnlocked = oldStars < 3 && newStars >= 3;
    if (justUnlocked) state.unlocked[badgeKey] = true;

    saveState(state);
    renderBadgesV2();

    if (typeof showToast === 'function') {
      if (justUnlocked) {
        showToast('🏅 已解鎖徽章：' + badge.name + '！', 'success');
      } else {
        showToast('⭐ ' + badge.name + ' +1 星（' + newStars + ' / 3）', 'success');
      }
    }

    injectResultBadgeNotice(missionKey, badgeKey, newStars, justUnlocked);
    return true;
  }

  function injectResultBadgeNotice(missionKey, badgeKey, stars, unlocked) {
    const box = document.getElementById('reviewBoxInline') || document.getElementById('asdBox');
    const badge = BADGES[badgeKey];
    if (!box || !badge) return;

    const oldNotice = document.getElementById('badgeV2ResultNotice');
    if (oldNotice) oldNotice.remove();

    const notice = document.createElement('div');
    notice.id = 'badgeV2ResultNotice';
    notice.className = 'badge-v2-result-notice';
    notice.innerHTML =
      '<div class="badge-v2-result-icon">' + badge.icon + '</div>' +
      '<div>' +
        '<strong>' + (unlocked ? '徽章已解鎖！' : '徽章進度 +1 星') + '</strong>' +
        '<p>' + getMissionTitle(missionKey) + ' → ' + badge.name + '</p>' +
        '<div class="badge-v2-mini-stars">' + renderStars(stars) + '</div>' +
      '</div>';
    box.insertAdjacentElement('afterend', notice);
  }

  function renderStars(count) {
    let html = '';
    for (let i = 1; i <= 3; i += 1) {
      html += '<span class="badge-v2-star ' + (i <= count ? 'filled' : '') + '">★</span>';
    }
    return html;
  }

  function injectStyles() {
    if (document.getElementById('badgeV2Style')) return;
    const style = document.createElement('style');
    style.id = 'badgeV2Style';
    style.textContent = `
      .badge-v2-summary {
        margin: 0 0 16px;
        padding: 14px 16px;
        border-radius: 22px;
        background: linear-gradient(180deg, rgba(255,255,255,0.78), rgba(235,246,255,0.62));
        border: 1px solid rgba(255,255,255,0.78);
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.88), 0 12px 28px rgba(0,87,217,0.10);
        color: var(--muted);
        line-height: 1.65;
      }

      .badge-grid.badge-v2-grid {
        display: grid;
        grid-template-columns: repeat(5, minmax(150px, 1fr));
        gap: 14px;
      }

      .badge-v2-card {
        position: relative;
        min-height: 190px;
        padding: 18px 14px;
        border-radius: 24px;
        text-align: center;
        background: linear-gradient(180deg, rgba(255,255,255,0.88), rgba(235,246,255,0.72));
        border: 1px solid rgba(255,255,255,0.86);
        box-shadow: 0 16px 38px rgba(29,53,87,0.11), inset 0 1px 0 rgba(255,255,255,0.94);
      }

      .badge-v2-card.unlocked {
        background: linear-gradient(180deg, rgba(255,246,199,0.94), rgba(255,255,255,0.82));
        border-color: rgba(255,176,0,0.42);
        box-shadow: 0 20px 46px rgba(255,176,0,0.18), inset 0 1px 0 rgba(255,255,255,0.96);
      }

      .badge-v2-icon {
        width: 62px;
        height: 62px;
        margin: 0 auto 10px;
        display: grid;
        place-items: center;
        border-radius: 22px;
        font-size: 2rem;
        background: rgba(255,255,255,0.76);
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.9), 0 12px 24px rgba(0,87,217,0.12);
        filter: grayscale(1);
        opacity: 0.7;
      }

      .badge-v2-card.unlocked .badge-v2-icon,
      .badge-v2-card.has-stars .badge-v2-icon {
        filter: none;
        opacity: 1;
      }

      .badge-v2-name {
        margin: 0 0 6px;
        font-size: 1.02rem;
        color: var(--text);
        font-weight: 950;
      }

      .badge-v2-desc {
        margin: 0 0 10px;
        color: var(--muted);
        font-size: 0.84rem;
        line-height: 1.5;
      }

      .badge-v2-stars {
        display: flex;
        justify-content: center;
        gap: 4px;
        margin: 8px 0;
        font-size: 1.28rem;
      }

      .badge-v2-star {
        color: rgba(125,145,170,0.32);
        text-shadow: 0 1px 0 rgba(255,255,255,0.8);
      }

      .badge-v2-star.filled {
        color: #ffb000;
        text-shadow: 0 4px 10px rgba(255,176,0,0.28);
      }

      .badge-v2-status {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 5px 9px;
        border-radius: 999px;
        font-size: 0.76rem;
        font-weight: 950;
        color: #0057d9;
        background: rgba(0,122,255,0.10);
      }

      .badge-v2-card.unlocked .badge-v2-status {
        color: #7a4a00;
        background: rgba(255,176,0,0.18);
      }

      .badge-v2-result-notice {
        display: flex;
        gap: 12px;
        align-items: center;
        margin: 14px 0;
        padding: 14px 16px;
        border-radius: 22px;
        background: linear-gradient(180deg, rgba(255,246,199,0.92), rgba(255,255,255,0.82));
        border: 1px solid rgba(255,176,0,0.40);
        box-shadow: 0 16px 34px rgba(255,176,0,0.14), inset 0 1px 0 rgba(255,255,255,0.92);
        color: var(--text);
      }

      .badge-v2-result-icon {
        width: 48px;
        height: 48px;
        border-radius: 18px;
        display: grid;
        place-items: center;
        background: rgba(255,255,255,0.78);
        font-size: 1.55rem;
      }

      .badge-v2-result-notice p {
        margin: 2px 0 0;
        color: var(--muted);
      }

      .badge-v2-mini-stars {
        margin-top: 4px;
        font-size: 1rem;
      }

      @media (max-width: 900px) {
        .badge-grid.badge-v2-grid {
          grid-template-columns: repeat(2, minmax(150px, 1fr));
        }
      }

      @media (max-width: 560px) {
        .badge-grid.badge-v2-grid {
          grid-template-columns: 1fr;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function renderBadgesV2() {
    injectStyles();
    const grid = document.getElementById('badgeGrid');
    if (!grid) return;

    const state = loadState();
    const totalStars = Object.keys(BADGES).reduce(function (sum, key) {
      return sum + Math.min(3, Number(state.progress[key] || 0));
    }, 0);
    const unlockedCount = Object.keys(BADGES).filter(function (key) {
      return Number(state.progress[key] || 0) >= 3;
    }).length;

    grid.className = 'badge-grid badge-v2-grid';
    grid.innerHTML = Object.keys(BADGES).map(function (key) {
      const badge = BADGES[key];
      const stars = Math.min(3, Number(state.progress[key] || 0));
      const unlocked = stars >= 3;
      return '<div class="badge-v2-card ' + (stars > 0 ? 'has-stars ' : '') + (unlocked ? 'unlocked' : '') + '">' +
        '<div class="badge-v2-icon">' + badge.icon + '</div>' +
        '<h3 class="badge-v2-name">' + badge.name + '</h3>' +
        '<p class="badge-v2-desc">' + badge.desc + '</p>' +
        '<div class="badge-v2-stars" aria-label="' + stars + ' / 3 星">' + renderStars(stars) + '</div>' +
        '<div class="badge-v2-status">' + (unlocked ? '已解鎖' : stars + ' / 3 星') + '</div>' +
      '</div>';
    }).join('');

    const badgeScreen = document.getElementById('badgeScreen');
    if (badgeScreen) {
      const old = badgeScreen.querySelector('.badge-v2-summary');
      if (old) old.remove();
      const intro = document.createElement('div');
      intro.className = 'badge-v2-summary';
      intro.innerHTML = '徽章規則：完成相關任務並取得 <strong>3 星表現</strong>，對應徽章會增加 1 星。每個徽章累積到 <strong>3 / 3 星</strong> 就會解鎖。<br>目前進度：<strong>' + unlockedCount + ' / 5</strong> 個徽章已解鎖，總星數：<strong>' + totalStars + ' / 15</strong>。';
      const gridParent = grid.parentElement;
      if (gridParent) gridParent.insertBefore(intro, grid);
    }
  }

  function handleChoiceClick(event) {
    const button = event.target.closest('#asdChoices button');
    if (!button || !activeMissionKey) return;

    const qNum = getCurrentQuestionNumber();
    if (answeredQuestionNumbers.has(qNum)) return;

    const optionText = button.textContent || '';
    const score = getOptionScore(activeMissionKey, qNum, optionText);
    activeScore += score;
    answeredQuestionNumbers.add(qNum);

    if (answeredQuestionNumbers.size >= 5) {
      const resultKey = activeMissionKey + ':' + activeScore;
      if (resultKey !== lastResultAwardKey) {
        lastResultAwardKey = resultKey;
        setTimeout(function () {
          awardBadgeStarForMission(activeMissionKey, activeScore);
        }, 280);
      }
    }
  }

  function patchStartAsdGame() {
    if (typeof window.startAsdGame !== 'function') return false;
    if (window.startAsdGame.__badgeV2Patched) return true;

    const originalStart = window.startAsdGame;
    window.startAsdGame = function (key) {
      resetMissionTracking(key);
      return originalStart.apply(this, arguments);
    };
    window.startAsdGame.__badgeV2Patched = true;
    return true;
  }

  function patchRenderBadges() {
    window.renderBadges = renderBadgesV2;
  }

  function initBadgeSystemV2() {
    injectStyles();
    patchRenderBadges();
    patchStartAsdGame();
    document.removeEventListener('click', handleChoiceClick, true);
    document.addEventListener('click', handleChoiceClick, true);
    setTimeout(patchStartAsdGame, 150);
    setTimeout(patchStartAsdGame, 450);
    setTimeout(patchStartAsdGame, 900);
  }

  window.renderBadgesV2 = renderBadgesV2;
  window.awardBadgeStarForMission = awardBadgeStarForMission;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBadgeSystemV2);
  } else {
    initBadgeSystemV2();
  }

  window.addEventListener('load', initBadgeSystemV2);
})();
