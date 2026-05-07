// /rpg-progress-system.js
// RPG Progress System V2
// Adds:
// 1. Mission completion + 3-star status on RPG map markers.
// 2. RPG progress dashboard on the map.
// 3. Character page with Level, EXP and five social stats.
// 4. Homepage button: 我的角色.
// 5. RPG-style wording upgrades.

(function () {
  const STORAGE_KEY = 'asd_school_rpg_progress_v1';
  const TOTAL_MISSIONS = 20;
  const THREE_STAR_SCORE = 8;

  const BADGE_STORAGE_KEY = 'asd_school_badges_v2';

  const STAT_META = {
    communication: { icon: '🗣️', name: '溝通力', short: '溝通' },
    calm: { icon: '🌱', name: '冷靜力', short: '冷靜' },
    teamwork: { icon: '🤝', name: '合作力', short: '合作' },
    boundary: { icon: '🛡️', name: '界線力', short: '界線' },
    problem: { icon: '🔍', name: '解難力', short: '解難' }
  };

  const MISSION_STAT = {
    start: 'communication',
    respond: 'communication',
    whatsappIgnored: 'communication',
    academicOnly: 'communication',

    refuse: 'boundary',
    conflict: 'boundary',
    copyHomework: 'boundary',
    quietSpace: 'boundary',

    groupwork: 'teamwork',
    lunch: 'teamwork',
    peGrouping: 'teamwork',
    disagree: 'teamwork',

    teasing: 'calm',
    bumped: 'calm',
    losingGame: 'calm',
    teacherReminder: 'calm',

    help: 'problem',
    homework: 'problem',
    queueJump: 'problem',
    lostItem: 'problem'
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

  let activeMissionKey = '';
  let activeScore = 0;
  let answeredQuestions = new Set();
  let lastSavedResultKey = '';

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function getDefaultProgress() {
    return {
      completed: {},
      scores: {},
      stars: {},
      expAwards: {},
      version: 2
    };
  }

  function loadProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return getDefaultProgress();
      const parsed = JSON.parse(raw);
      const state = getDefaultProgress();
      Object.assign(state.completed, parsed.completed || {});
      Object.assign(state.scores, parsed.scores || {});
      Object.assign(state.stars, parsed.stars || {});
      Object.assign(state.expAwards, parsed.expAwards || {});
      return state;
    } catch (error) {
      return getDefaultProgress();
    }
  }

  function saveProgressState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function loadBadgeProgress() {
    try {
      const raw = localStorage.getItem(BADGE_STORAGE_KEY);
      if (!raw) return { progress: {}, unlocked: {} };
      return JSON.parse(raw);
    } catch (error) {
      return { progress: {}, unlocked: {} };
    }
  }

  function scoreToStars(score) {
    const value = Number(score || 0);
    if (value >= THREE_STAR_SCORE) return 3;
    if (value >= 5) return 2;
    if (value > 0) return 1;
    return 0;
  }

  function starsToExp(stars) {
    if (stars >= 3) return 50;
    if (stars === 2) return 35;
    if (stars === 1) return 25;
    return 10;
  }

  function getTotalExp(state) {
    return Object.keys(state.expAwards || {}).reduce(function (sum, key) {
      return sum + Number(state.expAwards[key] || 0);
    }, 0);
  }

  function getLevelInfo(totalExp) {
    let current = LEVELS[0];
    let next = LEVELS[1] || null;

    for (let i = 0; i < LEVELS.length; i += 1) {
      if (totalExp >= LEVELS[i].exp) {
        current = LEVELS[i];
        next = LEVELS[i + 1] || null;
      }
    }

    const currentExpBase = current.exp;
    const nextExp = next ? next.exp : current.exp;
    const inLevelExp = Math.max(0, totalExp - currentExpBase);
    const needed = next ? Math.max(1, nextExp - currentExpBase) : 1;
    const percent = next ? Math.min(100, Math.round((inLevelExp / needed) * 100)) : 100;

    return {
      level: current.level,
      title: current.title,
      totalExp: totalExp,
      nextLevel: next ? next.level : null,
      nextExp: nextExp,
      currentExpBase: currentExpBase,
      inLevelExp: inLevelExp,
      needed: needed,
      percent: percent,
      isMax: !next
    };
  }

  function getMissionTitle(missionKey) {
    try {
      if (typeof asdGames !== 'undefined' && asdGames[missionKey] && asdGames[missionKey].title) {
        return asdGames[missionKey].title;
      }
    } catch (error) {}
    return missionKey;
  }

  function countCompleted(state) {
    return Object.keys(state.completed || {}).filter(function (key) {
      return state.completed[key];
    }).length;
  }

  function countThreeStar(state) {
    return Object.keys(state.stars || {}).filter(function (key) {
      return Number(state.stars[key] || 0) >= 3;
    }).length;
  }

  function countUnlockedBadges(badgeState) {
    const progress = badgeState.progress || {};
    return Object.keys(progress).filter(function (key) {
      return Number(progress[key] || 0) >= 3;
    }).length;
  }

  function countBadgeStars(badgeState) {
    const progress = badgeState.progress || {};
    return Object.keys(progress).reduce(function (sum, key) {
      return sum + Math.min(3, Number(progress[key] || 0));
    }, 0);
  }

  function getStatScores(state) {
    const totals = {
      communication: 0,
      calm: 0,
      teamwork: 0,
      boundary: 0,
      problem: 0
    };

    Object.keys(state.stars || {}).forEach(function (missionKey) {
      const statKey = MISSION_STAT[missionKey] || 'problem';
      totals[statKey] += Math.min(3, Number(state.stars[missionKey] || 0));
    });

    return totals;
  }

  function statToFiveStars(value) {
    const numeric = Number(value || 0);
    if (numeric >= 10) return 5;
    if (numeric >= 7) return 4;
    if (numeric >= 4) return 3;
    if (numeric >= 2) return 2;
    if (numeric >= 1) return 1;
    return 0;
  }

  function renderStars(count, total) {
    let html = '';
    for (let i = 1; i <= total; i += 1) {
      html += '<span class="rpg-character-star ' + (i <= count ? 'filled' : '') + '">★</span>';
    }
    return html;
  }

  function renderSmallStars(stars) {
    let text = '';
    for (let i = 1; i <= 3; i += 1) text += i <= stars ? '★' : '☆';
    return text;
  }

  function getCurrentQuestionNumber() {
    const badge = document.getElementById('questionBadgeBig');
    const text = badge ? badge.textContent || '' : '';
    const match = text.match(/第\s*(\d+)\s*\/\s*\d+\s*題/);
    if (match && match[1]) return Number(match[1]);
    return answeredQuestions.size + 1;
  }

  function getOptionScore(missionKey, questionNumber, optionText) {
    try {
      const game = asdGames[missionKey];
      const step = game && game.steps ? game.steps[questionNumber - 1] : null;
      if (!step || !Array.isArray(step.options)) return 0;
      const cleanOptionText = String(optionText || '').trim();
      const option = step.options.find(function (item) {
        const itemText = String(item.text || '').trim();
        return cleanOptionText.includes(itemText) || itemText.includes(cleanOptionText);
      });
      return option ? Number(option.score || 0) : 0;
    } catch (error) {
      return 0;
    }
  }

  function resetMissionTracking(missionKey) {
    activeMissionKey = missionKey;
    activeScore = 0;
    answeredQuestions = new Set();
    lastSavedResultKey = '';
  }

  function saveMissionCompletion(missionKey, score) {
    if (!missionKey) return;

    const state = loadProgress();
    const newStars = scoreToStars(score);
    const oldStars = Number(state.stars[missionKey] || 0);
    const oldScore = Number(state.scores[missionKey] || 0);
    const newExp = starsToExp(newStars);
    const oldExp = Number(state.expAwards[missionKey] || 0);
    const expGain = Math.max(0, newExp - oldExp);

    state.completed[missionKey] = true;
    state.scores[missionKey] = Math.max(oldScore, Number(score || 0));
    state.stars[missionKey] = Math.max(oldStars, newStars);
    state.expAwards[missionKey] = Math.max(oldExp, newExp);

    saveProgressState(state);
    updateRpgMapProgressUI();
    renderCharacterScreen();

    if (typeof showToast === 'function') {
      if (expGain > 0) {
        showToast('✨ EXP +' + expGain + '｜' + getMissionTitle(missionKey), 'success');
      }
      if (newStars >= 3 && oldStars < 3) {
        showToast('⭐ RPG 地圖已記錄：3 星完成！', 'success');
      } else if (!oldStars) {
        showToast('✅ RPG 地圖已記錄：任務完成！', 'success');
      }
    }
  }

  function handleChoiceClick(event) {
    const button = event.target.closest('#asdChoices button');
    if (!button || !activeMissionKey) return;

    const qNum = getCurrentQuestionNumber();
    if (answeredQuestions.has(qNum)) return;

    const optionText = button.textContent || '';
    const score = getOptionScore(activeMissionKey, qNum, optionText);
    activeScore += score;
    answeredQuestions.add(qNum);

    if (answeredQuestions.size >= 5) {
      const resultKey = activeMissionKey + ':' + activeScore;
      if (resultKey !== lastSavedResultKey) {
        lastSavedResultKey = resultKey;
        setTimeout(function () {
          saveMissionCompletion(activeMissionKey, activeScore);
        }, 360);
      }
    }
  }

  function patchStartAsdGame() {
    if (typeof window.startAsdGame !== 'function') return false;
    if (window.startAsdGame.__rpgProgressPatched) return true;

    const originalStart = window.startAsdGame;
    window.startAsdGame = function (key) {
      resetMissionTracking(key);
      return originalStart.apply(this, arguments);
    };
    window.startAsdGame.__rpgProgressPatched = true;
    return true;
  }

  function openRpgMap() {
    if (typeof showRpgMapScreen === 'function') {
      showRpgMapScreen();
      setTimeout(updateRpgMapProgressUI, 120);
      return;
    }

    if (typeof ensureRpgMapScreen === 'function') ensureRpgMapScreen();

    const rpgScreen = document.getElementById('rpgMapScreen');
    if (rpgScreen) {
      document.querySelectorAll('.screen').forEach(function (screen) {
        screen.classList.toggle('active', screen.id === 'rpgMapScreen');
      });
      rpgScreen.classList.add('active');
      updateRpgMapProgressUI();
      window.scrollTo({ top: 0, behavior: document.body.classList.contains('reduced-motion') ? 'auto' : 'smooth' });
      return;
    }

    if (typeof showSituationScreen === 'function') showSituationScreen();
  }

  function hideAllScreensExcept(screenId) {
    document.querySelectorAll('.screen').forEach(function (screen) {
      screen.classList.toggle('active', screen.id === screenId);
    });

    const rpgScreen = document.getElementById('rpgMapScreen');
    if (rpgScreen && screenId !== 'rpgMapScreen') rpgScreen.classList.remove('active');

    try {
      if (typeof appState !== 'undefined' && appState) appState.currentScreen = screenId;
    } catch (error) {}
  }

  function ensureCharacterScreen() {
    let screen = document.getElementById('characterScreen');
    if (screen) return screen;

    const card = document.querySelector('.card');
    if (!card) return null;

    screen = document.createElement('div');
    screen.id = 'characterScreen';
    screen.className = 'screen welcome-screen';
    screen.innerHTML = '<div class="hero-card animate-in" id="characterScreenContent"></div>';
    card.appendChild(screen);
    return screen;
  }

  function renderCharacterScreen() {
    injectRpgProgressStyles();
    const screen = ensureCharacterScreen();
    if (!screen) return;

    const state = loadProgress();
    const badgeState = loadBadgeProgress();
    const totalExp = getTotalExp(state);
    const levelInfo = getLevelInfo(totalExp);
    const statScores = getStatScores(state);
    const completed = countCompleted(state);
    const threeStar = countThreeStar(state);
    const badgeUnlocked = countUnlockedBadges(badgeState);
    const badgeStars = countBadgeStars(badgeState);
    const content = document.getElementById('characterScreenContent');
    if (!content) return;

    const statHtml = Object.keys(STAT_META).map(function (key) {
      const meta = STAT_META[key];
      const raw = Number(statScores[key] || 0);
      const fiveStars = statToFiveStars(raw);
      return '<div class="rpg-stat-card">' +
        '<div class="rpg-stat-top"><span>' + meta.icon + ' ' + meta.name + '</span><strong>' + raw + '</strong></div>' +
        '<div class="rpg-character-stars" aria-label="' + fiveStars + ' / 5 星">' + renderStars(fiveStars, 5) + '</div>' +
      '</div>';
    }).join('');

    const recentMissions = Object.keys(state.completed || {})
      .filter(function (key) { return state.completed[key]; })
      .sort(function (a, b) { return String(b).localeCompare(String(a)); })
      .slice(0, 5)
      .map(function (key) {
        const stars = Number(state.stars[key] || 0);
        return '<div class="rpg-recent-item"><span>' + escapeHtml(getMissionTitle(key)) + '</span><strong>' + renderSmallStars(stars) + '</strong></div>';
      }).join('') || '<p class="small">未完成任務。開始第一個 RPG 任務後，這裡會顯示你的冒險紀錄。</p>';

    content.innerHTML =
      '<div class="tag">我的角色</div>' +
      '<div class="rpg-character-hero">' +
        '<div class="rpg-character-avatar">🧑‍🎓</div>' +
        '<div class="rpg-character-main">' +
          '<h2>梁書社交勇者</h2>' +
          '<p class="rpg-character-title">' + escapeHtml(levelInfo.title) + '</p>' +
          '<div class="rpg-level-pill">Lv. ' + levelInfo.level + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="rpg-exp-panel">' +
        '<div class="rpg-exp-head">' +
          '<strong>EXP：' + levelInfo.totalExp + (levelInfo.isMax ? ' / MAX' : ' / ' + levelInfo.nextExp) + '</strong>' +
          '<span>' + (levelInfo.isMax ? '已達最高等級' : '距離 Lv. ' + levelInfo.nextLevel + ' 還需要 ' + Math.max(0, levelInfo.nextExp - levelInfo.totalExp) + ' EXP') + '</span>' +
        '</div>' +
        '<div class="rpg-progress-bar-wrap"><div class="rpg-progress-bar-fill" style="width:' + levelInfo.percent + '%"></div></div>' +
      '</div>' +
      '<div class="rpg-character-summary-grid">' +
        '<div><strong>' + completed + ' / ' + TOTAL_MISSIONS + '</strong><span>任務完成</span></div>' +
        '<div><strong>' + threeStar + ' / ' + TOTAL_MISSIONS + '</strong><span>3 星任務</span></div>' +
        '<div><strong>' + badgeUnlocked + ' / 5</strong><span>徽章解鎖</span></div>' +
        '<div><strong>' + badgeStars + ' / 15</strong><span>徽章星數</span></div>' +
      '</div>' +
      '<div class="settings-grid rpg-character-grid">' +
        '<div class="settings-card" style="grid-column: 1 / -1;">' +
          '<div class="panel-badge">能力值</div>' +
          '<h3>我的社交能力</h3>' +
          '<p class="small">完成不同任務會提升對應能力。3 星完成可以令能力成長更快。</p>' +
          '<div class="rpg-stat-grid">' + statHtml + '</div>' +
        '</div>' +
        '<div class="settings-card" style="grid-column: 1 / -1;">' +
          '<div class="panel-badge">冒險紀錄</div>' +
          '<h3>最近完成任務</h3>' +
          '<div class="rpg-recent-list">' + recentMissions + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="welcome-actions">' +
        '<button type="button" onclick="window.openRpgMap && window.openRpgMap()">開始 RPG 冒險</button>' +
        '<button type="button" class="secondary" onclick="showSituationScreen && showSituationScreen()">任務列表</button>' +
        '<button type="button" class="secondary" onclick="showBadgeScreen && showBadgeScreen()">徽章圖鑑</button>' +
        '<button type="button" class="secondary" onclick="showCoverScreen && showCoverScreen()">返回開始頁</button>' +
      '</div>';
  }

  function showCharacterScreen() {
    renderCharacterScreen();
    hideAllScreensExcept('characterScreen');
    window.scrollTo({ top: 0, behavior: document.body.classList.contains('reduced-motion') ? 'auto' : 'smooth' });
  }

  function addCharacterButtonToHome() {
    const menu = document.querySelector('#coverScreen .menu-actions');
    if (!menu) return;

    const firstButton = menu.querySelector('button');
    if (firstButton && !firstButton.dataset.rpgAdventurePatched) {
      firstButton.textContent = '開始 RPG 冒險';
      firstButton.dataset.rpgAdventurePatched = '1';
      firstButton.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        openRpgMap();
      }, true);
    }

    if (!document.getElementById('homeCharacterButton')) {
      const characterBtn = document.createElement('button');
      characterBtn.id = 'homeCharacterButton';
      characterBtn.type = 'button';
      characterBtn.className = 'secondary';
      characterBtn.textContent = '我的角色';
      characterBtn.addEventListener('click', showCharacterScreen);

      const badgeButton = Array.from(menu.querySelectorAll('button')).find(function (button) {
        return (button.textContent || '').includes('徽章');
      });
      if (badgeButton) badgeButton.insertAdjacentElement('beforebegin', characterBtn);
      else menu.appendChild(characterBtn);
    }
  }

  function upgradeRpgButtonText() {
    const replacePairs = [
      ['開始挑戰', '接受任務'],
      ['看看提示', '使用技能：智慧提示'],
      ['先冷靜一下', '使用技能：深呼吸護盾'],
      ['再讀一次題目', '使用技能：時間回望'],
      ['儲存進度', '儲存冒險進度'],
      ['選擇其他情境', '返回任務列表'],
      ['前往社交句式庫', '打開社交技能書'],
      ['社交句式庫', '社交技能書']
    ];

    document.querySelectorAll('button').forEach(function (button) {
      const text = (button.textContent || '').trim();
      replacePairs.forEach(function (pair) {
        if (text === pair[0]) button.textContent = pair[1];
      });
    });
  }

  function ensureProgressPanel() {
    const board = document.querySelector('#rpgMapScreen .rpg-map-board');
    if (!board) return null;

    let panel = document.getElementById('rpgProgressPanel');
    if (panel && board.contains(panel)) return panel;

    panel = document.createElement('div');
    panel.id = 'rpgProgressPanel';
    panel.className = 'rpg-progress-panel';

    const instruction = board.querySelector('.rpg-map-instruction');
    if (instruction) instruction.insertAdjacentElement('afterend', panel);
    else board.insertAdjacentElement('afterbegin', panel);

    return panel;
  }

  function updateMarkers(state) {
    document.querySelectorAll('.rpg-map-marker[data-rpg-scenario]').forEach(function (marker) {
      const key = marker.dataset.rpgScenario;
      const completed = !!state.completed[key];
      const stars = Number(state.stars[key] || 0);

      marker.classList.toggle('is-completed', completed && stars < 3);
      marker.classList.toggle('is-three-star', stars >= 3);

      const text = marker.querySelector('.rpg-marker-text');
      if (text) {
        if (stars >= 3) text.textContent = '★★★';
        else if (completed) text.textContent = '完成';
        else text.textContent = '任務';
      }

      const oldMini = marker.querySelector('.rpg-marker-mini-stars');
      if (oldMini) oldMini.remove();
      if (completed) {
        const mini = document.createElement('span');
        mini.className = 'rpg-marker-mini-stars';
        mini.textContent = renderSmallStars(stars);
        marker.appendChild(mini);
      }
    });
  }

  function updateRpgMapProgressUI() {
    injectRpgProgressStyles();

    const state = loadProgress();
    const badgeState = loadBadgeProgress();
    const completed = countCompleted(state);
    const threeStar = countThreeStar(state);
    const badgeUnlocked = countUnlockedBadges(badgeState);
    const badgeStars = countBadgeStars(badgeState);
    const percent = Math.min(100, Math.round((completed / TOTAL_MISSIONS) * 100));
    const levelInfo = getLevelInfo(getTotalExp(state));

    updateMarkers(state);

    const panel = ensureProgressPanel();
    if (!panel) return;

    panel.innerHTML =
      '<div class="rpg-progress-head">' +
        '<div>' +
          '<strong>你的 RPG 進度｜Lv. ' + levelInfo.level + ' ' + escapeHtml(levelInfo.title) + '</strong>' +
          '<p>完成任務會得到 EXP；地圖綠色代表完成，金色代表 3 星完成。</p>' +
        '</div>' +
        '<div class="rpg-progress-percent">' + percent + '%</div>' +
      '</div>' +
      '<div class="rpg-map-level-mini">' +
        '<span>EXP：' + levelInfo.totalExp + (levelInfo.isMax ? ' / MAX' : ' / ' + levelInfo.nextExp) + '</span>' +
        '<div class="rpg-progress-bar-wrap" aria-label="角色等級進度">' +
          '<div class="rpg-progress-bar-fill" style="width:' + levelInfo.percent + '%"></div>' +
        '</div>' +
      '</div>' +
      '<div class="rpg-progress-bar-wrap" aria-label="任務完成進度">' +
        '<div class="rpg-progress-bar-fill mission-fill" style="width:' + percent + '%"></div>' +
      '</div>' +
      '<div class="rpg-progress-stats">' +
        '<span>✅ 任務完成：<strong>' + completed + ' / ' + TOTAL_MISSIONS + '</strong></span>' +
        '<span>⭐ 3 星任務：<strong>' + threeStar + ' / ' + TOTAL_MISSIONS + '</strong></span>' +
        '<span>🏅 徽章：<strong>' + badgeUnlocked + ' / 5</strong></span>' +
        '<span>🌟 徽章星數：<strong>' + badgeStars + ' / 15</strong></span>' +
      '</div>' +
      '<div class="rpg-progress-actions">' +
        '<button type="button" class="secondary" onclick="window.showCharacterScreen && window.showCharacterScreen()">查看我的角色</button>' +
      '</div>';
  }

  function injectRpgProgressStyles() {
    if (document.getElementById('rpgProgressSystemStyle')) return;

    const style = document.createElement('style');
    style.id = 'rpgProgressSystemStyle';
    style.textContent = `
      .rpg-progress-panel,
      .rpg-exp-panel,
      .rpg-stat-card,
      .rpg-character-summary-grid > div,
      .rpg-recent-item {
        backdrop-filter: blur(var(--glass-blur)) saturate(170%);
        -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(170%);
      }

      .rpg-progress-panel {
        margin: 12px 0 16px;
        padding: 16px 18px;
        border-radius: 24px;
        background: linear-gradient(180deg, rgba(255,255,255,0.88), rgba(235,246,255,0.74));
        border: 1px solid rgba(255,255,255,0.86);
        box-shadow: 0 16px 36px rgba(0,87,217,0.12), inset 0 1px 0 rgba(255,255,255,0.94);
      }

      .rpg-progress-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 14px;
        margin-bottom: 10px;
      }

      .rpg-progress-head strong {
        color: var(--text);
        font-size: 1.08rem;
      }

      .rpg-progress-head p {
        margin: 3px 0 0;
        color: var(--muted);
        font-size: 0.9rem;
      }

      .rpg-progress-percent,
      .rpg-level-pill {
        min-width: 62px;
        height: 46px;
        padding: 0 12px;
        border-radius: 18px;
        display: inline-grid;
        place-items: center;
        font-weight: 950;
        color: #0057d9;
        background: rgba(0,122,255,0.10);
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.92);
      }

      .rpg-progress-bar-wrap {
        height: 16px;
        overflow: hidden;
        border-radius: 999px;
        background: rgba(169,205,242,0.50);
        box-shadow: inset 0 2px 5px rgba(29,53,87,0.10);
      }

      .rpg-progress-bar-fill {
        height: 100%;
        border-radius: inherit;
        background: linear-gradient(90deg, #2f8cff, #00c48c, #ffb000);
        box-shadow: 0 8px 18px rgba(0,87,217,0.18);
        transition: width 0.45s ease;
      }

      .rpg-progress-bar-fill.mission-fill {
        background: linear-gradient(90deg, #2f8cff, #64d2ff);
      }

      .rpg-map-level-mini {
        display: grid;
        gap: 7px;
        margin-bottom: 10px;
        color: var(--muted);
        font-size: 0.9rem;
        font-weight: 800;
      }

      .rpg-progress-stats {
        display: grid;
        grid-template-columns: repeat(4, minmax(140px, 1fr));
        gap: 8px;
        margin-top: 12px;
      }

      .rpg-progress-stats span {
        padding: 9px 11px;
        border-radius: 16px;
        background: rgba(255,255,255,0.66);
        border: 1px solid rgba(255,255,255,0.72);
        color: var(--muted);
        font-size: 0.88rem;
      }

      .rpg-progress-stats strong { color: var(--text); }

      .rpg-progress-actions {
        margin-top: 12px;
        display: flex;
        justify-content: flex-end;
        gap: 10px;
      }

      .rpg-map-marker.is-completed {
        background: linear-gradient(180deg, #ecfff4 0%, #ffffff 48%, #d9ffed 100%) !important;
        border-color: #00c48c !important;
        box-shadow:
          0 14px 30px rgba(0, 196, 140, 0.34),
          0 0 0 6px rgba(0, 196, 140, 0.24),
          0 0 0 13px rgba(0, 122, 255, 0.12) !important;
      }

      .rpg-map-marker.is-three-star {
        background: linear-gradient(180deg, #fff6c7 0%, #ffffff 48%, #fff0a8 100%) !important;
        border-color: #ffb000 !important;
        box-shadow:
          0 18px 38px rgba(255, 176, 0, 0.42),
          0 0 0 8px rgba(255, 176, 0, 0.32),
          0 0 0 16px rgba(0, 122, 255, 0.14) !important;
      }

      .rpg-map-marker.is-completed .rpg-marker-text { background: #00a878 !important; }
      .rpg-map-marker.is-three-star .rpg-marker-text {
        background: #ff9f0a !important;
        color: #4d3300 !important;
      }

      .rpg-marker-mini-stars {
        position: absolute;
        bottom: -18px;
        left: 50%;
        transform: translateX(-50%);
        padding: 1px 6px;
        border-radius: 999px;
        background: rgba(255,255,255,0.92);
        color: #ff9f0a;
        font-size: 0.62rem;
        line-height: 1.25;
        font-weight: 950;
        white-space: nowrap;
        box-shadow: 0 5px 12px rgba(29,53,87,0.12);
      }

      .rpg-character-hero {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 18px;
        align-items: center;
        max-width: 680px;
        margin: 0 auto 18px;
        text-align: left;
      }

      .rpg-character-avatar {
        width: 118px;
        height: 118px;
        display: grid;
        place-items: center;
        border-radius: 34px;
        font-size: 3.3rem;
        background:
          linear-gradient(145deg, rgba(255,255,255,0.88), rgba(255,255,255,0.42)),
          radial-gradient(circle at 28% 20%, rgba(255,214,10,0.28), transparent 34%),
          linear-gradient(135deg, rgba(0,122,255,0.20), rgba(94,92,230,0.18));
        border: 1px solid rgba(255,255,255,0.86);
        box-shadow: 0 22px 48px rgba(29,53,87,0.16), inset 0 1px 0 rgba(255,255,255,0.92);
      }

      .rpg-character-main h2 {
        margin: 0 0 4px;
        font-size: clamp(1.7rem, 3vw, 2.5rem);
      }

      .rpg-character-title {
        margin: 0 0 12px;
        color: var(--muted);
        font-weight: 850;
      }

      .rpg-exp-panel {
        max-width: 760px;
        margin: 0 auto 18px;
        padding: 16px;
        border-radius: 24px;
        background: rgba(255,255,255,0.62);
        border: 1px solid rgba(255,255,255,0.76);
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.86), 0 12px 28px rgba(29,53,87,0.08);
      }

      .rpg-exp-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        margin-bottom: 10px;
        color: var(--muted);
      }

      .rpg-exp-head strong { color: var(--text); }

      .rpg-character-summary-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(120px, 1fr));
        gap: 12px;
        max-width: 860px;
        margin: 0 auto 18px;
      }

      .rpg-character-summary-grid > div {
        display: grid;
        gap: 4px;
        padding: 14px;
        border-radius: 22px;
        background: rgba(255,255,255,0.62);
        border: 1px solid rgba(255,255,255,0.76);
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.86), 0 12px 28px rgba(29,53,87,0.08);
      }

      .rpg-character-summary-grid strong {
        font-size: 1.22rem;
        color: var(--text);
      }

      .rpg-character-summary-grid span {
        color: var(--muted);
        font-size: 0.88rem;
        font-weight: 800;
      }

      .rpg-stat-grid {
        display: grid;
        grid-template-columns: repeat(5, minmax(140px, 1fr));
        gap: 12px;
        margin-top: 12px;
      }

      .rpg-stat-card {
        padding: 14px;
        border-radius: 20px;
        background: rgba(255,255,255,0.64);
        border: 1px solid rgba(255,255,255,0.76);
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.86), 0 10px 24px rgba(29,53,87,0.07);
      }

      .rpg-stat-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        font-weight: 900;
      }

      .rpg-stat-top strong { color: var(--primary-dark); }

      .rpg-character-stars {
        margin-top: 8px;
        font-size: 1.1rem;
        letter-spacing: 1px;
      }

      .rpg-character-star {
        color: rgba(125,145,170,0.30);
        text-shadow: 0 1px 0 rgba(255,255,255,0.9);
      }

      .rpg-character-star.filled {
        color: #ffb000;
        text-shadow: 0 4px 10px rgba(255,176,0,0.25);
      }

      .rpg-recent-list {
        display: grid;
        gap: 8px;
        margin-top: 10px;
      }

      .rpg-recent-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        padding: 11px 13px;
        border-radius: 16px;
        background: rgba(255,255,255,0.62);
        border: 1px solid rgba(255,255,255,0.72);
        text-align: left;
      }

      .rpg-recent-item strong {
        color: #ff9f0a;
        white-space: nowrap;
      }

      @media (max-width: 900px) {
        .rpg-progress-stats,
        .rpg-character-summary-grid {
          grid-template-columns: repeat(2, minmax(140px, 1fr));
        }

        .rpg-stat-grid {
          grid-template-columns: repeat(2, minmax(140px, 1fr));
        }
      }

      @media (max-width: 640px) {
        .rpg-progress-head,
        .rpg-exp-head {
          align-items: flex-start;
          flex-direction: column;
        }

        .rpg-progress-stats,
        .rpg-character-summary-grid,
        .rpg-stat-grid {
          grid-template-columns: 1fr;
        }

        .rpg-progress-actions {
          justify-content: stretch;
        }

        .rpg-progress-actions button {
          width: 100%;
        }

        .rpg-character-hero {
          grid-template-columns: 1fr;
          text-align: center;
          justify-items: center;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function init() {
    injectRpgProgressStyles();
    ensureCharacterScreen();
    addCharacterButtonToHome();
    upgradeRpgButtonText();
    patchStartAsdGame();
    document.removeEventListener('click', handleChoiceClick, true);
    document.addEventListener('click', handleChoiceClick, true);
    updateRpgMapProgressUI();
    renderCharacterScreen();

    setTimeout(patchStartAsdGame, 200);
    setTimeout(addCharacterButtonToHome, 250);
    setTimeout(upgradeRpgButtonText, 300);
    setTimeout(updateRpgMapProgressUI, 300);
    setTimeout(renderCharacterScreen, 500);
    setTimeout(updateRpgMapProgressUI, 900);
  }

  window.updateRpgMapProgressUI = updateRpgMapProgressUI;
  window.getRpgProgressState = loadProgress;
  window.showCharacterScreen = showCharacterScreen;
  window.renderCharacterScreen = renderCharacterScreen;
  window.openRpgMap = openRpgMap;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('load', init);
  document.addEventListener('click', function (event) {
    if (event.target.closest('[data-rpg-scenario]') || event.target.closest('#rpgMapScreen')) {
      setTimeout(updateRpgMapProgressUI, 80);
      setTimeout(updateRpgMapProgressUI, 300);
    }
    setTimeout(upgradeRpgButtonText, 80);
  }, true);
})();
