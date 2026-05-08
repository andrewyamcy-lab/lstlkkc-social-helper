// /mission-status-panel-fix.js
// Shows clearly whether each RPG mission is finished.
// Adds completion status to the left mission information panel and refreshes map markers from localStorage.
// Completed mission icons turn grey and map stars are capped to 3 stars.
// Completed missions can be replayed, but the saved final result keeps the best score.

(function () {
  const STORAGE_KEY = 'asd_school_rpg_progress_v1';

  function readProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : { completed: {}, scores: {}, stars: {}, expAwards: {} };
    } catch (error) {
      return { completed: {}, scores: {}, stars: {}, expAwards: {} };
    }
  }

  function renderStars(stars) {
    const safeStars = Math.max(0, Math.min(3, Number(stars || 0)));
    let out = '';
    for (let i = 1; i <= 3; i += 1) out += i <= safeStars ? '★' : '☆';
    return out;
  }

  function statusForMission(key) {
    const progress = readProgress();
    const completed = !!(progress.completed || {})[key];
    const stars = Math.max(0, Math.min(3, Number((progress.stars || {})[key] || 0)));
    const score = Number((progress.scores || {})[key] || 0);
    const exp = Number((progress.expAwards || {})[key] || 0);

    if (stars >= 3) {
      return {
        completed,
        className: 'three-star',
        title: '已完成｜3 星滿分',
        detail: renderStars(stars) + '｜最高分：' + score + '｜EXP +' + exp,
        note: '你可以重新挑戰，但系統只會保留最高分作為最終成績。',
        buttonText: '重新挑戰'
      };
    }

    if (completed) {
      return {
        completed,
        className: 'completed',
        title: '已完成｜可重新挑戰',
        detail: renderStars(stars) + '｜最高分：' + score + '｜EXP +' + exp,
        note: '如果重玩分數更高，最高分會更新；如果較低，原本最高分不會被覆蓋。',
        buttonText: '重新挑戰'
      };
    }

    return {
      completed,
      className: 'not-completed',
      title: '未完成',
      detail: '完成 5 題後，這裡會顯示「已完成」。',
      note: '完成後圖示會變成灰色，你仍然可以重新挑戰。',
      buttonText: '開始任務'
    };
  }

  function injectStyle() {
    const old = document.getElementById('missionStatusPanelStyle');
    if (old) old.remove();

    const style = document.createElement('style');
    style.id = 'missionStatusPanelStyle';
    style.textContent = `
      .rpg-side-status {
        display: grid;
        gap: 6px;
        padding: 11px 12px;
        border-radius: 16px;
        border: 1px solid rgba(255,255,255,.82);
        background: rgba(255,255,255,.72);
        box-shadow: inset 0 1px 0 rgba(255,255,255,.96), 0 10px 22px rgba(29,53,87,.08);
      }

      .rpg-side-status-main {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 950;
        line-height: 1.2;
      }

      .rpg-side-status-dot {
        width: 12px;
        height: 12px;
        border-radius: 999px;
        flex: 0 0 auto;
        background: #a8b3c2;
        box-shadow: 0 0 0 4px rgba(168,179,194,.14);
      }

      .rpg-side-status-detail {
        color: var(--muted);
        font-size: .82rem;
        font-weight: 850;
        line-height: 1.35;
      }

      .rpg-side-status-note {
        padding: 8px 10px;
        border-radius: 13px;
        background: rgba(0,122,255,.08);
        color: var(--primary-dark);
        font-size: .78rem;
        font-weight: 850;
        line-height: 1.45;
      }

      .rpg-side-status.not-completed .rpg-side-status-main { color: #5f6b7a; }
      .rpg-side-status.completed .rpg-side-status-main { color: #137300; }
      .rpg-side-status.three-star .rpg-side-status-main { color: #9a5a00; }
      .rpg-side-status.completed .rpg-side-status-dot { background: #34c759; box-shadow: 0 0 0 4px rgba(52,199,89,.16); }
      .rpg-side-status.three-star .rpg-side-status-dot { background: #ffb000; box-shadow: 0 0 0 4px rgba(255,176,0,.20); }

      .rpg-side-empty-check-note {
        margin-top: 8px !important;
        padding: 10px 12px;
        border-radius: 16px;
        background: rgba(0,122,255,.08);
        color: var(--primary-dark) !important;
        font-weight: 850;
      }

      #rpgMapScreen.active .rpg-map-marker.is-completed,
      #rpgMapScreen.active .rpg-map-marker.is-three-star {
        background: linear-gradient(180deg, #f3f4f6 0%, #d7dce3 100%) !important;
        border-color: #a8b3c2 !important;
        color: #5f6b7a !important;
        box-shadow:
          0 8px 18px rgba(95,107,122,.22),
          0 0 0 5px rgba(168,179,194,.18),
          0 0 0 10px rgba(95,107,122,.10) !important;
        animation: none !important;
        filter: grayscale(1) saturate(.25) brightness(.96) !important;
      }

      #rpgMapScreen.active .rpg-map-marker.is-completed::before,
      #rpgMapScreen.active .rpg-map-marker.is-three-star::before {
        border-color: rgba(168,179,194,.55) !important;
        animation: none !important;
        opacity: .55 !important;
      }

      #rpgMapScreen.active .rpg-map-marker.is-completed .rpg-marker-text,
      #rpgMapScreen.active .rpg-map-marker.is-three-star .rpg-marker-text {
        display: block !important;
        min-width: 0 !important;
        width: auto !important;
        max-width: none !important;
        padding: 2px 5px !important;
        font-size: .78rem !important;
        line-height: 1.05 !important;
        letter-spacing: -0.08em !important;
        white-space: nowrap !important;
        overflow: visible !important;
        background: #6b7280 !important;
        color: #ffffff !important;
      }

      #rpgMapScreen.active .rpg-map-marker.is-completed .rpg-marker-text::after,
      #rpgMapScreen.active .rpg-map-marker.is-three-star .rpg-marker-text::after {
        content: none !important;
        display: none !important;
        font-size: 0 !important;
      }

      #rpgMapScreen.active .rpg-map-marker.is-completed .rpg-marker-mini-stars,
      #rpgMapScreen.active .rpg-map-marker.is-three-star .rpg-marker-mini-stars {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  function updateMapMarkers() {
    const progress = readProgress();
    document.querySelectorAll('.rpg-map-marker[data-rpg-scenario]').forEach(function (marker) {
      const key = marker.dataset.rpgScenario;
      const completed = !!(progress.completed || {})[key];
      const stars = Math.max(0, Math.min(3, Number((progress.stars || {})[key] || 0)));

      marker.classList.toggle('is-completed', completed && stars < 3);
      marker.classList.toggle('is-three-star', completed && stars >= 3);
      marker.dataset.stars = String(stars);
      marker.dataset.completed = completed ? 'true' : 'false';

      const label = marker.querySelector('.rpg-marker-text');
      if (label) label.textContent = completed ? renderStars(stars) : '任務';

      marker.querySelectorAll('.rpg-marker-mini-stars').forEach(function (mini) {
        mini.remove();
      });
    });
  }

  function addEmptyPanelNote() {
    const panel = document.getElementById('rpgSideMissionPanel');
    if (!panel || panel.querySelector('.rpg-side-card')) return;
    const empty = panel.querySelector('.rpg-side-empty');
    if (!empty || empty.querySelector('.rpg-side-empty-check-note')) return;
    empty.insertAdjacentHTML('beforeend', '<p class="rpg-side-empty-check-note">你可以從地圖圖示知道進度：顯示灰色圖示代表已完成；星星最多 3 粒，★★★ 代表滿分完成。完成後仍可重玩，系統會保留最高分。</p>');
  }

  function updateSidePanelStatus(key) {
    const panel = document.getElementById('rpgSideMissionPanel');
    if (!panel) return;

    const card = panel.querySelector('.rpg-side-card');
    if (!card) {
      addEmptyPanelNote();
      return;
    }

    const missionKey = key || (document.querySelector('.rpg-map-marker.is-selected[data-rpg-scenario]') || {}).dataset?.rpgScenario;
    if (!missionKey) return;

    const status = statusForMission(missionKey);
    const old = card.querySelector('.rpg-side-status');
    if (old) old.remove();

    const tagRow = card.querySelector('.rpg-side-tag-row');
    if (tagRow) {
      tagRow.insertAdjacentHTML('afterend',
        '<div class="rpg-side-status ' + status.className + '">' +
          '<div class="rpg-side-status-main"><span class="rpg-side-status-dot"></span><span>' + status.title + '</span></div>' +
          '<div class="rpg-side-status-detail">' + status.detail + '</div>' +
          '<div class="rpg-side-status-note">' + status.note + '</div>' +
        '</div>'
      );
    }

    const startButton = card.querySelector('[data-rpg-side-start]');
    if (startButton) startButton.textContent = status.buttonText;
  }

  function handleClick(event) {
    const marker = event.target.closest && event.target.closest('#rpgMapScreen.active .rpg-map-marker[data-rpg-scenario]');
    if (marker) {
      const key = marker.dataset.rpgScenario;
      setTimeout(function () { updateSidePanelStatus(key); updateMapMarkers(); }, 60);
      setTimeout(function () { updateSidePanelStatus(key); updateMapMarkers(); }, 250);
      setTimeout(updateMapMarkers, 700);
      return;
    }

    const start = event.target.closest && event.target.closest('[data-rpg-side-start]');
    if (start) {
      localStorage.setItem('asd_school_last_opened_mission_v1', start.getAttribute('data-rpg-side-start') || '');
    }
  }

  function run() {
    injectStyle();
    updateMapMarkers();
    addEmptyPanelNote();
  }

  document.addEventListener('click', handleClick, true);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }

  window.addEventListener('load', function () {
    run();
    setTimeout(run, 500);
    setTimeout(run, 1500);
    setTimeout(run, 3000);
  });
})();
