// /mission-record-detail.js
// Makes「我的角色 → 冒險紀錄」mission rows expandable.
// Click a completed mission name to view the saved full result and 逐題回饋.

(function () {
  const RPG_KEY = 'asd_school_rpg_progress_v1';
  const HISTORY_KEY = 'asd_school_mission_result_history_v1';
  let renderTimer = null;

  function readJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function esc(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function getGames() {
    try {
      if (window.asdGames) return window.asdGames;
      // eslint-disable-next-line no-undef
      if (typeof asdGames !== 'undefined') return asdGames;
    } catch (error) {}
    return {};
  }

  function missionTitle(key) {
    const history = readJson(HISTORY_KEY, { records: {} });
    const record = history.records && history.records[key];
    if (record && record.title) return record.title;

    const games = getGames();
    return games[key] && games[key].title ? games[key].title : key;
  }

  function renderStars(stars) {
    const n = Math.max(0, Math.min(3, Number(stars || 0)));
    let out = '';
    for (let i = 1; i <= 3; i += 1) out += i <= n ? '★' : '☆';
    return out;
  }

  function labelForScore(score) {
    const n = Number(score || 0);
    if (n >= 2) return { icon: '✅', text: '做得好', className: 'good' };
    if (n === 1) return { icon: '🔶', text: '可以更好', className: 'ok' };
    return { icon: '⚠️', text: '需要留意', className: 'bad' };
  }

  function completedKeys() {
    const p = readJson(RPG_KEY, {});
    const completed = p.completed || {};
    return Object.keys(completed).filter(function (key) {
      return completed[key];
    }).slice(-8).reverse();
  }

  function renderQuestionDetails(items) {
    if (!Array.isArray(items) || !items.length) {
      return '<div class="mission-record-empty-detail">未有逐題回饋紀錄。完成一次新任務後，這裡會自動保存完整結果。</div>';
    }

    return '<div class="mission-record-question-grid">' + items.map(function (item) {
      const label = labelForScore(item.score);
      const best = item.score >= 2 || !item.bestAnswer ? '' :
        '<div class="mission-record-best"><strong>建議：</strong>' + esc(item.bestAnswer) + '</div>';

      return '<div class="mission-record-question ' + label.className + '">' +
        '<div class="mission-record-question-head"><strong>第 ' + esc(item.questionNumber) + ' 題｜' + label.icon + ' ' + esc(label.text) + '</strong><span>' + esc(item.score) + '/2</span></div>' +
        '<div><strong>你選：</strong>' + esc(item.selectedText) + '</div>' +
        '<div><strong>回饋：</strong>' + esc(item.note) + '</div>' +
        best +
      '</div>';
    }).join('') + '</div>';
  }

  function renderRecordDetail(key, stars) {
    const history = readJson(HISTORY_KEY, { records: {} });
    const record = history.records && history.records[key];

    if (!record) {
      return '<div class="mission-record-detail-box"><div class="mission-record-empty-detail">這個任務已完成，但未有完整逐題結果紀錄。請重新挑戰一次，系統便會保存完整結果。</div></div>';
    }

    return '<div class="mission-record-detail-box">' +
      '<div class="mission-record-summary">' +
        '<span>最高分：<strong>' + esc(record.score) + ' / 10</strong></span>' +
        '<span>星數：<strong>' + esc(renderStars(record.stars || stars)) + '</strong></span>' +
      '</div>' +
      renderQuestionDetails(record.items) +
    '</div>';
  }

  function renderAdventureRecordDetails() {
    const screen = document.getElementById('characterScreen');
    if (!screen || !screen.classList.contains('active')) return;

    const recordsPanel = screen.querySelector('.sims-tab-panel');
    if (!recordsPanel || !recordsPanel.textContent.includes('最近完成任務')) return;

    const list = recordsPanel.querySelector('.sims-mission-list');
    if (!list || list.dataset.recordDetailReady === '1') return;

    const keys = completedKeys();
    if (!keys.length) return;

    const progress = readJson(RPG_KEY, {});
    const starsState = progress.stars || {};

    list.dataset.recordDetailReady = '1';
    list.innerHTML = keys.map(function (key) {
      const stars = Number(starsState[key] || 0);
      return '<details class="mission-record-detail-item">' +
        '<summary class="sims-mission-item mission-record-summary-row">' +
          '<span>' + esc(missionTitle(key)) + '</span>' +
          '<strong>' + esc(renderStars(stars)) + '</strong>' +
        '</summary>' +
        renderRecordDetail(key, stars) +
      '</details>';
    }).join('');
  }

  function scheduleRender() {
    if (renderTimer) clearTimeout(renderTimer);
    renderTimer = setTimeout(function () {
      renderTimer = null;
      renderAdventureRecordDetails();
    }, 120);
  }

  function injectStyles() {
    if (document.getElementById('missionRecordDetailStyle')) return;
    const style = document.createElement('style');
    style.id = 'missionRecordDetailStyle';
    style.textContent = `
      .mission-record-detail-item {
        border-radius: 18px;
        overflow: hidden;
      }

      .mission-record-detail-item summary {
        list-style: none;
        cursor: pointer;
      }

      .mission-record-detail-item summary::-webkit-details-marker {
        display: none;
      }

      .mission-record-summary-row {
        transition: transform .18s ease, box-shadow .18s ease;
      }

      .mission-record-summary-row:hover {
        transform: translateY(-1px);
        box-shadow: 0 14px 28px rgba(29,53,87,.12), inset 0 1px 0 rgba(255,255,255,.9);
      }

      .mission-record-detail-box {
        margin: -2px 0 8px;
        padding: 12px;
        border-radius: 0 0 18px 18px;
        background: rgba(255,255,255,.52);
        border: 1px solid rgba(255,255,255,.72);
        border-top: 0;
        display: grid;
        gap: 10px;
      }

      .mission-record-summary {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
        padding: 8px 10px;
        border-radius: 14px;
        background: rgba(0,122,255,.08);
        color: var(--muted);
        font-weight: 850;
      }

      .mission-record-summary strong {
        color: var(--primary-dark);
      }

      .mission-record-question-grid {
        display: grid;
        gap: 8px;
      }

      .mission-record-question {
        display: grid;
        gap: 6px;
        padding: 10px 11px;
        border-radius: 15px;
        background: rgba(255,255,255,.72);
        border: 1px solid rgba(255,255,255,.82);
        color: var(--muted);
        font-size: .86rem;
        font-weight: 760;
        line-height: 1.45;
      }

      .mission-record-question-head {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        align-items: center;
        color: var(--text);
      }

      .mission-record-question-head span {
        flex: 0 0 auto;
        padding: 3px 7px;
        border-radius: 999px;
        color: var(--primary-dark);
        background: rgba(255,255,255,.9);
        font-weight: 950;
      }

      .mission-record-question.good { box-shadow: inset 4px 0 0 rgba(52,199,89,.78); }
      .mission-record-question.ok { box-shadow: inset 4px 0 0 rgba(255,176,0,.78); }
      .mission-record-question.bad { box-shadow: inset 4px 0 0 rgba(255,59,48,.70); }

      .mission-record-best,
      .mission-record-empty-detail {
        padding: 8px 10px;
        border-radius: 12px;
        background: rgba(52,199,89,.10);
        color: #137300;
        font-weight: 850;
        line-height: 1.45;
      }

      @media (max-width: 640px) {
        .mission-record-summary,
        .mission-record-question-head {
          align-items: flex-start;
          flex-direction: column;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function observeCharacterScreen() {
    const screen = document.getElementById('characterScreen');
    if (!screen || screen.__missionRecordDetailObserver) return;

    const observer = new MutationObserver(scheduleRender);
    observer.observe(screen, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    screen.__missionRecordDetailObserver = observer;
  }

  function install() {
    injectStyles();
    observeCharacterScreen();
    scheduleRender();
    setTimeout(scheduleRender, 500);
    setTimeout(scheduleRender, 1200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install);
  } else {
    install();
  }

  window.addEventListener('load', function () {
    install();
    setTimeout(install, 1000);
  });
})();
