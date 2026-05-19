// /mission-ui-cleanup.js
// Cleans old temporary mission UI elements when switching between intro, question and result screens.
// Also provides a stable saved Mission Record History screen.

(function () {
  const SESSION_KEY = 'asd_school_mission_review_session_v1';
  const HISTORY_KEY = 'asd_school_mission_result_history_v1';
  const TOTAL_QUESTIONS = 5;
  const THREE_STAR_SCORE = 8;

  let installed = false;
  let scheduled = false;
  let lastSavedHistoryKey = '';

  function removeNode(selector) {
    document.querySelectorAll(selector).forEach(function (node) {
      if (node && node.parentNode) node.parentNode.removeChild(node);
    });
  }

  function readJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function saveJson(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (error) {}
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
    if (value >= THREE_STAR_SCORE) return 3;
    if (value >= 5) return 2;
    if (value > 0) return 1;
    return 0;
  }

  function renderStars(stars) {
    let out = '';
    for (let i = 1; i <= 3; i += 1) out += i <= Number(stars || 0) ? '★' : '☆';
    return out;
  }

  function missionTitle(key) {
    try {
      if (window.asdGames && window.asdGames[key] && window.asdGames[key].title) return window.asdGames[key].title;
      // eslint-disable-next-line no-undef
      if (typeof asdGames !== 'undefined' && asdGames[key] && asdGames[key].title) return asdGames[key].title;
    } catch (error) {}
    return key || '未知任務';
  }

  function cleanMissionUiState() {
    const screen = document.getElementById('gameScreen');
    if (!screen) return;

    const isIntroMode = screen.classList.contains('active') && screen.classList.contains('mission-intro-mode');
    const isFinishMode = screen.classList.contains('active') && screen.classList.contains('mission-finish-mode');

    if (isIntroMode) {
      removeNode('#gameScenarioImageBox');
      removeNode('#missionQuestionText');
      removeNode('#virtueChangeBox');
      removeNode('#missionResultReviewBox');
      return;
    }

    if (isFinishMode) {
      removeNode('#gameScenarioImageBox');
      removeNode('#missionQuestionText');
    }
  }

  function scheduleClean() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(function () {
      scheduled = false;
      cleanMissionUiState();
    });
  }

  function saveLatestResultToHistory() {
    const session = readJson(SESSION_KEY, null);
    if (!session || !session.missionKey || !Array.isArray(session.items)) return;
    if (session.items.length < TOTAL_QUESTIONS) return;

    const score = Number(session.score || session.items.reduce(function (sum, item) {
      return sum + Number(item.score || 0);
    }, 0));
    const stars = scoreToStars(score);
    const saveKey = session.missionKey + ':' + score + ':' + session.items.length + ':' + (session.savedAt || '');
    if (saveKey === lastSavedHistoryKey) return;
    lastSavedHistoryKey = saveKey;

    const history = readJson(HISTORY_KEY, { records: {} });
    if (!history.records) history.records = {};

    const old = history.records[session.missionKey] || null;
    const oldScore = old ? Number(old.score || 0) : -1;

    if (!old || score >= oldScore) {
      history.records[session.missionKey] = {
        missionKey: session.missionKey,
        title: missionTitle(session.missionKey),
        score: score,
        stars: stars,
        items: session.items,
        updatedAt: Date.now()
      };
      saveJson(HISTORY_KEY, history);
      refreshHistoryScreenIfOpen();
    }
  }

  function labelForScore(score) {
    const n = Number(score || 0);
    if (n >= 2) return { text: '做得好', icon: '✅', className: 'good' };
    if (n === 1) return { text: '可以更好', icon: '🔶', className: 'ok' };
    return { text: '需要留意', icon: '⚠️', className: 'bad' };
  }

  function formatDate(timestamp) {
    if (!timestamp) return '';
    try {
      return new Date(timestamp).toLocaleString('zh-HK', {
        month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
      });
    } catch (error) {
      return '';
    }
  }

  function ensureHistoryScreen() {
    let screen = document.getElementById('missionResultHistoryScreen');
    if (screen) return screen;

    const card = document.querySelector('.card');
    if (!card) return null;

    screen = document.createElement('div');
    screen.id = 'missionResultHistoryScreen';
    screen.className = 'screen welcome-screen';
    screen.innerHTML = '<div class="hero-card animate-in"><div class="tag">任務紀錄</div><div class="hero-avatar">📊</div><h2>我的任務紀錄</h2><p>這裡會保存每個任務的最佳紀錄，包括星數、分數和逐題回饋。</p><div id="missionResultHistoryContent"></div><div class="welcome-actions"><button class="secondary" onclick="showCoverScreen && showCoverScreen()">返回開始頁</button><button onclick="showSituationScreen && showSituationScreen()">繼續任務</button><button class="secondary" onclick="window.clearMissionResultHistory && window.clearMissionResultHistory()">清除任務紀錄</button></div></div>';
    card.appendChild(screen);
    return screen;
  }

  function renderHistoryContent() {
    ensureHistoryStyles();
    ensureHistoryScreen();
    const target = document.getElementById('missionResultHistoryContent');
    if (!target) return;

    const history = readJson(HISTORY_KEY, { records: {} });
    const records = Object.keys(history.records || {}).map(function (key) {
      return history.records[key];
    }).sort(function (a, b) {
      return Number(b.updatedAt || 0) - Number(a.updatedAt || 0);
    });

    if (!records.length) {
      target.innerHTML = '<div class="history-empty-card">未有任務紀錄。完成一個任務後，這裡會自動保存紀錄。</div>';
      return;
    }

    target.innerHTML = '<div class="history-result-grid">' + records.map(function (record) {
      const items = Array.isArray(record.items) ? record.items : [];
      const itemHtml = items.map(function (item) {
        const label = labelForScore(item.score);
        const best = item.score >= 2 || !item.bestAnswer ? '' : '<div class="history-best"><strong>建議：</strong>' + esc(item.bestAnswer) + '</div>';
        return '<details class="history-question ' + label.className + '"><summary><strong>第 ' + esc(item.questionNumber) + ' 題｜' + label.icon + ' ' + esc(label.text) + '</strong><span>' + esc(item.score) + '/2</span></summary><div class="history-question-detail"><div><strong>你選：</strong>' + esc(item.selectedText) + '</div><div><strong>回饋：</strong>' + esc(item.note) + '</div>' + best + '</div></details>';
      }).join('');

      return '<div class="history-result-card">' +
        '<div class="history-result-head"><div><h3>' + esc(record.title || missionTitle(record.missionKey)) + '</h3><span>' + esc(formatDate(record.updatedAt)) + '</span></div><strong class="history-stars">' + renderStars(record.stars) + '</strong></div>' +
        '<div class="history-score">最高分：<strong>' + esc(record.score) + ' / 10</strong></div>' +
        '<div class="history-question-list">' + itemHtml + '</div>' +
      '</div>';
    }).join('') + '</div>';
  }

  function showMissionResultHistory() {
    saveLatestResultToHistory();
    renderHistoryContent();
    document.querySelectorAll('.screen').forEach(function (screen) {
      screen.classList.toggle('active', screen.id === 'missionResultHistoryScreen');
    });
    const rpgScreen = document.getElementById('rpgMapScreen');
    if (rpgScreen) rpgScreen.classList.remove('active');
    window.scrollTo({ top: 0, behavior: document.body.classList.contains('reduced-motion') ? 'auto' : 'smooth' });
  }

  function refreshHistoryScreenIfOpen() {
    const screen = document.getElementById('missionResultHistoryScreen');
    if (screen && screen.classList.contains('active')) renderHistoryContent();
  }

  function clearMissionResultHistory() {
    saveJson(HISTORY_KEY, { records: {} });
    renderHistoryContent();
    if (typeof showToast === 'function') showToast('已清除任務紀錄', 'success');
  }

  function addHomeHistoryButtonOnce() {
    const coverMenu = document.querySelector('#coverScreen .menu-actions');
    if (!coverMenu || document.getElementById('homeMissionResultHistoryButton')) return;

    const hasMissionRecordButton = Array.from(coverMenu.querySelectorAll('button')).some(function (button) {
      const text = String(button.textContent || '').trim();
      return text === '我的任務紀錄' || text === '我的任務結果';
    });
    if (hasMissionRecordButton) return;

    const btn = document.createElement('button');
    btn.id = 'homeMissionResultHistoryButton';
    btn.type = 'button';
    btn.className = 'secondary';
    btn.textContent = '我的任務紀錄';
    btn.addEventListener('click', showMissionResultHistory);

    const settings = Array.from(coverMenu.querySelectorAll('button')).find(function (button) {
      return (button.textContent || '').includes('設定');
    });
    if (settings) settings.insertAdjacentElement('beforebegin', btn);
    else coverMenu.appendChild(btn);
  }

  function patchScreenSwitch() {
    if (window.setActiveScreen && !window.setActiveScreen.__historyPatched) {
      const original = window.setActiveScreen;
      window.setActiveScreen = function (screenId, stateName) {
        const result = original.apply(this, arguments);
        if (screenId !== 'missionResultHistoryScreen') {
          const historyScreen = document.getElementById('missionResultHistoryScreen');
          if (historyScreen) historyScreen.classList.remove('active');
        }
        return result;
      };
      window.setActiveScreen.__historyPatched = true;
    }
  }

  function ensureHistoryStyles() {
    if (document.getElementById('missionResultHistoryStyle')) return;
    const style = document.createElement('style');
    style.id = 'missionResultHistoryStyle';
    style.textContent = `
      .history-empty-card,
      .history-result-card {
        margin-top: 14px;
        padding: 16px 18px;
        border-radius: 22px;
        background: linear-gradient(180deg, rgba(255,255,255,.94), rgba(239,248,255,.82));
        border: 1px solid rgba(255,255,255,.9);
        box-shadow: 0 12px 26px rgba(29,53,87,.09), inset 0 1px 0 rgba(255,255,255,.96);
      }
      .history-result-grid { display: grid; gap: 14px; margin-top: 12px; }
      .history-result-head { display: flex; align-items: start; justify-content: space-between; gap: 12px; }
      .history-result-head h3 { margin: 0 0 4px; color: var(--text); }
      .history-result-head span { color: var(--muted); font-weight: 800; font-size: .86rem; }
      .history-stars { color: #ffb000; font-size: 1.35rem; text-shadow: 0 3px 10px rgba(255,176,0,.22); white-space: nowrap; }
      .history-score { margin: 8px 0 10px; color: var(--primary-dark); font-weight: 900; }
      .history-question-list { display: grid; gap: 8px; }
      .history-question { border-radius: 16px; background: rgba(255,255,255,.74); border: 1px solid rgba(255,255,255,.86); overflow: hidden; }
      .history-question summary { list-style: none; cursor: pointer; display: flex; justify-content: space-between; gap: 10px; padding: 11px 12px; align-items: center; }
      .history-question summary::-webkit-details-marker { display: none; }
      .history-question summary span { padding: 3px 7px; border-radius: 999px; background: rgba(255,255,255,.9); color: var(--primary-dark); font-weight: 950; }
      .history-question-detail { display: grid; gap: 6px; padding: 0 12px 12px; color: var(--muted); font-weight: 760; line-height: 1.45; text-align: left; }
      .history-question.good { box-shadow: inset 4px 0 0 rgba(52,199,89,.78); }
      .history-question.ok { box-shadow: inset 4px 0 0 rgba(255,176,0,.78); }
      .history-question.bad { box-shadow: inset 4px 0 0 rgba(255,59,48,.70); }
      .history-best { padding: 7px 9px; border-radius: 12px; background: rgba(52,199,89,.10); color: #137300; }
    `;
    document.head.appendChild(style);
  }

  function install() {
    if (installed) return;
    installed = true;

    cleanMissionUiState();
    ensureHistoryScreen();
    ensureHistoryStyles();
    addHomeHistoryButtonOnce();
    saveLatestResultToHistory();

    const screen = document.getElementById('gameScreen');
    if (screen) {
      const observer = new MutationObserver(function () {
        scheduleClean();
        saveLatestResultToHistory();
      });
      observer.observe(screen, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class']
      });
    }

    document.addEventListener('click', function () {
      setTimeout(scheduleClean, 0);
      setTimeout(scheduleClean, 280);
      setTimeout(saveLatestResultToHistory, 950);
    }, true);

    window.showMissionResultHistory = showMissionResultHistory;
    window.clearMissionResultHistory = clearMissionResultHistory;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install);
  } else {
    install();
  }

  window.addEventListener('load', function () {
    install();
    setTimeout(scheduleClean, 500);
    setTimeout(saveLatestResultToHistory, 900);
    setTimeout(addHomeHistoryButtonOnce, 1000);
    setTimeout(patchScreenSwitch, 1200);
    setTimeout(patchScreenSwitch, 2200);
  });
})();
