// /mission-status-panel-fix.js
// Shows clearly whether each RPG mission is finished.
// Adds completion status to the left mission information panel and refreshes map markers from localStorage.

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
    let out = '';
    for (let i = 1; i <= 3; i += 1) out += i <= Number(stars || 0) ? '★' : '☆';
    return out;
  }

  function statusForMission(key) {
    const progress = readProgress();
    const completed = !!(progress.completed || {})[key];
    const stars = Number((progress.stars || {})[key] || 0);
    const score = Number((progress.scores || {})[key] || 0);
    const exp = Number((progress.expAwards || {})[key] || 0);

    if (stars >= 3) {
      return {
        completed,
        className: 'three-star',
        title: '已完成｜3 星',
        detail: renderStars(stars) + '｜最高分：' + score + '｜EXP +' + exp,
        buttonText: '重新挑戰'
      };
    }

    if (completed) {
      return {
        completed,
        className: 'completed',
        title: '已完成',
        detail: renderStars(stars) + '｜最高分：' + score + '｜EXP +' + exp,
        buttonText: '重新挑戰'
      };
    }

    return {
      completed,
      className: 'not-completed',
      title: '未完成',
      detail: '完成 5 題後，這裡會顯示「已完成」。',
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
        gap: 5px;
        padding: 10px 12px;
        border-radius: 16px;
        border: 1px solid rgba(255,255,255,.82);
        background: rgba(255,255,255,.70);
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
        font-weight: 800;
        line-height: 1.35;
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
    `;
    document.head.appendChild(style);
  }

  function updateMapMarkers() {
    const progress = readProgress();
    document.querySelectorAll('.rpg-map-marker[data-rpg-scenario]').forEach(function (marker) {
      const key = marker.dataset.rpgScenario;
      const completed = !!(progress.completed || {})[key];
      const stars = Number((progress.stars || {})[key] || 0);

      marker.classList.toggle('is-completed', completed && stars < 3);
      marker.classList.toggle('is-three-star', stars >= 3);

      const label = marker.querySelector('.rpg-marker-text');
      if (label) {
        if (stars >= 3) label.textContent = '★★★';
        else if (completed) label.textContent = '完成';
        else label.textContent = '任務';
      }
    });
  }

  function addEmptyPanelNote() {
    const panel = document.getElementById('rpgSideMissionPanel');
    if (!panel || panel.querySelector('.rpg-side-card')) return;
    const empty = panel.querySelector('.rpg-side-empty');
    if (!empty || empty.querySelector('.rpg-side-empty-check-note')) return;
    empty.insertAdjacentHTML('beforeend', '<p class="rpg-side-empty-check-note">你可以從地圖圖示知道進度：顯示「完成」代表已完成；顯示「★★★」代表 3 星完成。</p>');
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
  });
})();
