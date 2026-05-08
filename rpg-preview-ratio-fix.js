// /rpg-preview-ratio-fix.js
// Updated: RPG mission information no longer appears as a floating box.
// Mission details now appear in a fixed information page on the left side.

(function () {
  const MISSIONS = {
    start: { key: 'start', icon: '🗣️', floor: '3/F', room: '301 課室', title: '課室：發起對話', desc: '主動和同學打招呼，開始簡單對話。', image: 'images/start-conversation.jpg', difficulty: '★ 易' },
    conflict: { key: 'conflict', icon: '🧩', floor: '3/F', room: '302 課室', title: '借文具：處理衝突', desc: '同學未經同意拿了你的筆，學習平靜表達界線。', image: 'images/stationery-conflict.jpg', difficulty: '★★ 中等' },
    respond: { key: 'respond', icon: '💬', floor: '3/F', room: '303 課室', title: '放學前：作出回應', desc: '同學開心分享事情時，學習聆聽和回應。', image: 'images/respond-friend.jpg', difficulty: '★ 易' },
    lunch: { key: 'lunch', icon: '🍱', floor: '3/F', room: '小食部', title: '午飯時間：加入同學', desc: '想加入同學一起吃飯時，學習自然地開口。', image: 'images/lunch-join.jpg', difficulty: '★★★ 較難' },
    queueJump: { key: 'queueJump', icon: '🧃', floor: '3/F', room: '小食部', title: '小賣部排隊：有人打尖', desc: '排隊買食物時有人插隊，學習平靜提醒。', image: 'images/queue-jump.jpg', difficulty: '★★★ 較難' },
    bumped: { key: 'bumped', icon: '🚶', floor: '4/F', room: '樓梯 / 走廊', title: '轉堂被撞：控制反應', desc: '走廊很多人時被撞到，練習分辨意外和故意。', image: 'images/bumped.jpg', difficulty: '★★★ 較難' },
    teacherReminder: { key: 'teacherReminder', icon: '📋', floor: '4/F', room: '401 課室', title: '老師提醒：接受指正', desc: '上課被老師提醒時，學習修正行為。', image: 'images/teacher-reminder.jpg', difficulty: '★★ 中等' },
    help: { key: 'help', icon: '🙋', floor: '4/F', room: '402 課室', title: '課堂中：向老師求助', desc: '聽不明白時，練習用清楚方式向老師求助。', image: 'images/ask-teacher-help.jpg', difficulty: '★★ 中等' },
    groupwork: { key: 'groupwork', icon: '🤝', floor: '6/F', room: '601 課室', title: '小組：加入合作', desc: '在分組活動裡，找到時機加入和表達想法。', image: 'images/groupwork.jpg', difficulty: '★★ 中等' },
    teasing: { key: 'teasing', icon: '🛡️', floor: '6/F', room: '602 課室', title: '被同學取笑：保持冷靜', desc: '被同學取笑說話方式時，學習表達不舒服和求助。', image: 'images/teasing.jpg', difficulty: '★★★ 較難' },
    disagree: { key: 'disagree', icon: '🧠', floor: '6/F', room: '603 課室', title: '意見不同：接受分歧', desc: '小組討論被否定時，學習彈性思考。', image: 'images/disagree.jpg', difficulty: '★★★ 較難' },
    quietSpace: { key: 'quietSpace', icon: '🌿', floor: '6/F', room: '604 課室', title: '小息太嘈：需要安靜空間', desc: '小息環境太嘈時，學習表達需要和安全離開。', image: 'images/quiet-space.jpg', difficulty: '★★★ 較難' },
    whatsappIgnored: { key: 'whatsappIgnored', icon: '📱', floor: 'G/F', room: '新街校門', title: '班群訊息：沒有人回覆', desc: '問功課沒有人即時回覆，練習等待和清楚發問。', image: 'images/whatsapp-ignored.jpg', difficulty: '★★ 中等' },
    academicOnly: { key: 'academicOnly', icon: '🎓', floor: '7/F', room: '704 課室', title: '學業問題：只想問功課', desc: '想集中學業問題時，學習清楚表達。', image: 'images/academic-only.jpg', difficulty: '★ 易' },
    homework: { key: 'homework', icon: '📚', floor: '2/F', room: '201 課室', title: '放學後：確認功課', desc: '不確定功課內容時，學習向同學清楚確認。', image: 'images/homework-check.jpg', difficulty: '★ 易' },
    copyHomework: { key: 'copyHomework', icon: '📝', floor: '2/F', room: '202 課室', title: '同學叫你借功課：拒絕抄襲', desc: '同學想抄你的功課時，學習堅定但有禮貌地拒絕。', image: 'images/copy-homework.jpg', difficulty: '★★ 中等' },
    refuse: { key: 'refuse', icon: '🙅', floor: '2/F', room: '209 課室', title: '小息：禮貌拒絕', desc: '被同學邀請玩遊戲時，清楚而友善地拒絕。', image: 'images/polite-refusal.jpg', difficulty: '★ 易' },
    peGrouping: { key: 'peGrouping', icon: '🏀', floor: 'G/F', room: 'G04 活動室', title: '體育堂分組：未被邀請', desc: '分組時未被邀請，練習主動加入和求助。', image: 'images/pe-grouping.jpg', difficulty: '★★ 中等' },
    lostItem: { key: 'lostItem', icon: '🗂️', floor: '8/F', room: '圖書館', title: '文件袋不見了：冷靜處理', desc: '遺失物品時，學習回想、求助和跟進。', image: 'images/lost-item.jpg', difficulty: '★★ 中等' },
    losingGame: { key: 'losingGame', icon: '🏆', floor: 'G/F', room: '操場', title: '比賽輸了：接受結果', desc: '體育或班際活動輸了時，練習處理失望和保持風度。', image: 'images/losing-game.jpg', difficulty: '★★ 中等' }
  };

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function injectSideInfoStyle() {
    const old = document.getElementById('rpgSideInfoStyle');
    if (old) old.remove();

    const style = document.createElement('style');
    style.id = 'rpgSideInfoStyle';
    style.textContent = `
      /* Disable the old floating mission box */
      #rpgMapScreen.active #rpgMissionPreview {
        display: none !important;
      }

      #rpgMapScreen.active #rpgProgressPanel {
        display: none !important;
      }

      #rpgMapScreen.active #rpgSideMissionPanel {
        grid-column: 1 !important;
        grid-row: 3 !important;
        align-self: stretch !important;
        min-height: 0 !important;
        overflow: auto !important;
        padding: 14px !important;
        border-radius: 22px !important;
        background: linear-gradient(180deg, rgba(255,255,255,.96), rgba(237,248,255,.86)) !important;
        border: 1px solid rgba(255,255,255,.92) !important;
        box-shadow: 0 14px 34px rgba(29,53,87,.12), inset 0 1px 0 rgba(255,255,255,.96) !important;
        line-height: 1.55 !important;
      }

      .rpg-side-empty {
        display: grid;
        gap: 10px;
        align-content: center;
        min-height: 240px;
        text-align: left;
      }

      .rpg-side-empty-icon {
        width: 58px;
        height: 58px;
        display: grid;
        place-items: center;
        border-radius: 20px;
        background: linear-gradient(180deg, #fff6c7, #e8f4ff);
        border: 3px solid rgba(255,176,0,.58);
        box-shadow: 0 10px 24px rgba(0,87,217,.14);
        font-size: 1.9rem;
      }

      .rpg-side-empty strong {
        font-size: 1.08rem;
        color: var(--text);
      }

      .rpg-side-empty p {
        margin: 0;
        color: var(--muted);
        font-size: .9rem;
      }

      .rpg-side-card {
        display: grid;
        gap: 12px;
      }

      .rpg-side-tag-row {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        align-items: center;
      }

      .rpg-side-location {
        width: fit-content;
        padding: 7px 12px;
        border-radius: 999px;
        background: #0057d9;
        color: white;
        font-weight: 950;
        font-size: .9rem;
      }

      .rpg-side-difficulty {
        width: fit-content;
        padding: 7px 12px;
        border-radius: 999px;
        background: rgba(255,176,0,.16);
        border: 1px solid rgba(255,176,0,.35);
        color: #7a4a00;
        font-weight: 950;
        font-size: .86rem;
      }

      .rpg-side-image {
        width: 100% !important;
        height: auto !important;
        max-height: none !important;
        object-fit: contain !important;
        border-radius: 20px;
        border: 3px solid rgba(255,176,0,.38);
        background: #eef6ff;
        box-shadow: 0 12px 28px rgba(29,53,87,.12);
      }

      .rpg-side-title {
        margin: 0;
        color: var(--text);
        font-size: 1.24rem;
        line-height: 1.28;
      }

      .rpg-side-desc {
        margin: 0;
        color: var(--muted);
        font-size: .96rem;
        line-height: 1.65;
      }

      .rpg-side-actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-top: 2px;
      }

      .rpg-side-actions button {
        padding: 11px 12px !important;
        border-radius: 15px !important;
        font-size: .9rem !important;
        font-weight: 950 !important;
      }

      .rpg-side-actions .secondary {
        background: rgba(255,255,255,.72) !important;
      }

      @media (max-width: 1100px) {
        #rpgMapScreen.active #rpgSideMissionPanel {
          margin: 12px 0 !important;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function ensureSidePanel() {
    const board = document.querySelector('#rpgMapScreen .rpg-map-board');
    if (!board) return null;

    let panel = document.getElementById('rpgSideMissionPanel');
    if (!panel) {
      panel = document.createElement('aside');
      panel.id = 'rpgSideMissionPanel';
      panel.setAttribute('aria-live', 'polite');
      const instruction = board.querySelector('.rpg-map-instruction');
      if (instruction && instruction.parentNode === board) {
        instruction.insertAdjacentElement('afterend', panel);
      } else {
        board.insertBefore(panel, board.firstChild);
      }
    }

    if (!panel.dataset.ready) {
      panel.dataset.ready = '1';
      renderEmptyPanel(panel);
    }

    return panel;
  }

  function renderEmptyPanel(panel) {
    panel.innerHTML =
      '<div class="rpg-side-empty">' +
        '<div class="rpg-side-empty-icon">🗺️</div>' +
        '<strong>任務資訊</strong>' +
        '<p>請點擊地圖上的任務圖示，任務內容會在這裡顯示，不會再彈出視窗。</p>' +
      '</div>';
  }

  function renderMissionPanel(key) {
    const mission = MISSIONS[key];
    const panel = ensureSidePanel();
    if (!mission || !panel) return;

    panel.innerHTML =
      '<div class="rpg-side-card">' +
        '<div class="rpg-side-tag-row">' +
          '<div class="rpg-side-location">' + escapeHtml(mission.floor) + '｜' + escapeHtml(mission.room) + '</div>' +
          '<div class="rpg-side-difficulty">難度：' + escapeHtml(mission.difficulty) + '</div>' +
        '</div>' +
        '<img class="rpg-side-image" src="' + escapeHtml(mission.image) + '?v=20260508-side" alt="' + escapeHtml(mission.title) + '" onerror="this.style.display=\'none\'">' +
        '<h3 class="rpg-side-title">' + escapeHtml(mission.icon + ' ' + mission.title) + '</h3>' +
        '<p class="rpg-side-desc">' + escapeHtml(mission.desc) + '</p>' +
        '<div class="rpg-side-actions">' +
          '<button type="button" data-rpg-side-start="' + escapeHtml(mission.key) + '">開始任務</button>' +
          '<button type="button" class="secondary" data-rpg-side-close>關閉</button>' +
        '</div>' +
      '</div>';
  }

  function selectMarker(key) {
    document.querySelectorAll('.rpg-map-marker').forEach(function (marker) {
      marker.classList.toggle('is-selected', marker.dataset.rpgScenario === key);
    });
  }

  function closeSideInfo() {
    const panel = ensureSidePanel();
    if (panel) renderEmptyPanel(panel);
    document.querySelectorAll('.rpg-map-marker').forEach(function (marker) {
      marker.classList.remove('is-selected');
    });
  }

  function handleMissionClick(event) {
    const marker = event.target.closest && event.target.closest('#rpgMapScreen.active [data-rpg-scenario]');
    if (!marker) return;

    event.preventDefault();
    event.stopPropagation();
    if (typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();

    const key = marker.dataset.rpgScenario;
    selectMarker(key);
    renderMissionPanel(key);

    const oldPreview = document.getElementById('rpgMissionPreview');
    if (oldPreview) oldPreview.classList.add('hidden');
  }

  function handleSidePanelButtons(event) {
    const startButton = event.target.closest && event.target.closest('[data-rpg-side-start]');
    if (startButton) {
      const key = startButton.getAttribute('data-rpg-side-start');
      if (typeof window.startRpgMission === 'function') {
        window.startRpgMission(key);
      } else if (typeof window.startAsdGame === 'function') {
        window.startAsdGame(key);
      }
      return;
    }

    const closeButton = event.target.closest && event.target.closest('[data-rpg-side-close]');
    if (closeButton) closeSideInfo();
  }

  function runFix() {
    injectSideInfoStyle();
    ensureSidePanel();
    const oldPreview = document.getElementById('rpgMissionPreview');
    if (oldPreview) oldPreview.classList.add('hidden');
  }

  document.addEventListener('click', handleMissionClick, true);
  document.addEventListener('click', handleSidePanelButtons, true);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runFix);
  } else {
    runFix();
  }

  window.addEventListener('load', function () {
    runFix();
    setTimeout(runFix, 400);
    setTimeout(runFix, 1200);
  });
})();
