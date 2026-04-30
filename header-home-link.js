// /header-home-link.js
// Makes the site header clickable so users can return to the home page.
// Also adds an RPG 校園地圖 entry point and a clickable mission-map screen.

(function () {
  const RPG_MISSIONS = [
    { key: 'start', icon: '🗣️', floor: '3/F', room: '301 課室', title: '課室：發起對話', desc: '主動和同學打招呼，開始簡單對話。' },
    { key: 'refuse', icon: '🙅', floor: 'G/F', room: '操場', title: '小息：禮貌拒絕', desc: '被邀請玩遊戲時，清楚而友善地拒絕。' },
    { key: 'conflict', icon: '🧩', floor: '3/F', room: '302 課室', title: '借文具：處理衝突', desc: '同學未經同意拿了你的筆，學習表達界線。' },
    { key: 'respond', icon: '💬', floor: '3/F', room: '303 課室', title: '放學前：作出回應', desc: '同學分享開心事時，學習聆聽和回應。' },
    { key: 'groupwork', icon: '🤝', floor: '6/F', room: '小組教室', title: '小組：加入合作', desc: '在分組活動裡，找到時機加入和表達想法。' },
    { key: 'help', icon: '🙋', floor: '5/F', room: '教員室附近', title: '課堂中：向老師求助', desc: '聽不明白時，練習用清楚方式向老師求助。' },
    { key: 'lunch', icon: '🍱', floor: '3/F', room: '小食部', title: '午飯時間：加入同學', desc: '想加入同學一起吃飯時，學習自然地開口。' },
    { key: 'homework', icon: '📚', floor: '1/F', room: '101 課室', title: '放學後：確認功課', desc: '不確定功課內容時，學習向同學清楚確認。' },
    { key: 'teasing', icon: '🛡️', floor: '6/F', room: '走廊', title: '被同學取笑：保持冷靜', desc: '被取笑時，學習表達不舒服和求助。' },
    { key: 'bumped', icon: '🚶', floor: '4/F', room: '樓梯 / 走廊', title: '轉堂被撞：控制反應', desc: '被撞到時，分辨意外和故意。' },
    { key: 'disagree', icon: '🧠', floor: '6/F', room: '小組教室', title: '意見不同：接受分歧', desc: '小組討論被否定時，學習彈性思考。' },
    { key: 'teacherReminder', icon: '📋', floor: '4/F', room: '課室', title: '老師提醒：接受指正', desc: '被老師提醒時，學習修正行為。' },
    { key: 'queueJump', icon: '🧃', floor: '3/F', room: '小食部', title: '小賣部排隊：有人打尖', desc: '有人插隊時，學習平靜提醒。' },
    { key: 'peGrouping', icon: '🏀', floor: 'G/F', room: '操場', title: '體育堂分組：未被邀請', desc: '分組時未被邀請，練習主動加入和求助。' },
    { key: 'whatsappIgnored', icon: '📱', floor: '8/F', room: '電腦室', title: '班群訊息：沒有人回覆', desc: '問功課沒有人即時回覆，練習等待和清楚發問。' },
    { key: 'academicOnly', icon: '🎓', floor: '8/F', room: '圖書館', title: '學業問題：只想問功課', desc: '想集中學業問題時，學習清楚表達。' },
    { key: 'lostItem', icon: '🗂️', floor: 'G/F', room: '校務處 / 走廊', title: '文件袋不見了：冷靜處理', desc: '遺失物品時，學習回想、求助和跟進。' },
    { key: 'copyHomework', icon: '📝', floor: '1/F', room: '課室', title: '同學叫你借功課：拒絕抄襲', desc: '同學想抄你的功課時，學習堅定但有禮貌地拒絕。' },
    { key: 'quietSpace', icon: '🌿', floor: '2/F', room: '輔導室 / 社工室', title: '小息太嘈：需要安靜空間', desc: '環境太嘈時，學習表達需要和安全離開。' },
    { key: 'losingGame', icon: '🏆', floor: 'G/F', room: '操場', title: '比賽輸了：接受結果', desc: '輸了時，學習處理失望和保持風度。' }
  ];

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function goHome() {
    if (typeof showCoverScreen === 'function') {
      showCoverScreen();
      return;
    }

    if (typeof setActiveScreen === 'function') {
      setActiveScreen('coverScreen', 'cover');
      return;
    }

    const screenIds = ['coverScreen', 'badgeScreen', 'settingsScreen', 'phraseLibraryScreen', 'situationScreen', 'gameScreen', 'rpgMapScreen'];
    screenIds.forEach(function (id) {
      const screen = document.getElementById(id);
      if (screen) screen.classList.toggle('active', id === 'coverScreen');
    });

    window.scrollTo({ top: 0, behavior: document.body.classList.contains('reduced-motion') ? 'auto' : 'smooth' });
  }

  function injectRpgStyles() {
    if (document.getElementById('rpgMapStyle')) return;
    const style = document.createElement('style');
    style.id = 'rpgMapStyle';
    style.textContent = `
      .rpg-map-shell {
        text-align: left;
      }

      .rpg-map-header {
        text-align: center;
        margin-bottom: 18px;
      }

      .rpg-map-board {
        position: relative;
        overflow: hidden;
        border-radius: 30px;
        padding: 20px;
        background:
          radial-gradient(circle at 12% 18%, rgba(255, 214, 10, 0.22), transparent 24%),
          radial-gradient(circle at 86% 22%, rgba(0, 122, 255, 0.22), transparent 26%),
          linear-gradient(135deg, rgba(255,255,255,0.74), rgba(255,255,255,0.38));
        border: 1px solid rgba(255,255,255,0.68);
        box-shadow: var(--shadow), inset 0 1px 0 rgba(255,255,255,0.78);
      }

      .rpg-map-title-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
        margin-bottom: 14px;
      }

      .rpg-map-floor-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 14px;
      }

      .rpg-floor-card {
        min-height: 210px;
        padding: 15px;
        border-radius: 24px;
        background: rgba(255,255,255,0.48);
        border: 1px solid rgba(255,255,255,0.66);
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.76), 0 10px 24px rgba(29, 53, 87, 0.08);
      }

      .rpg-floor-title {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-weight: 950;
        color: var(--primary-dark);
        margin-bottom: 10px;
      }

      .rpg-room-list {
        display: grid;
        gap: 9px;
      }

      .rpg-room-btn {
        width: 100%;
        text-align: left;
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 8px 10px;
        align-items: start;
        background: rgba(255,255,255,0.62);
        color: var(--text);
        border-radius: 18px;
        padding: 11px 12px;
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.78), 0 8px 18px rgba(29,53,87,0.07);
      }

      .rpg-room-btn::before {
        display: none;
      }

      .rpg-room-btn:hover {
        background: rgba(255,255,255,0.84);
        transform: translateY(-2px) scale(1.01);
      }

      .rpg-room-icon {
        font-size: 1.35rem;
        line-height: 1.2;
      }

      .rpg-room-main strong {
        display: block;
        color: var(--primary-dark);
        font-size: 0.95rem;
      }

      .rpg-room-main span {
        display: block;
        color: var(--muted);
        font-size: 0.82rem;
        line-height: 1.45;
        margin-top: 2px;
      }

      .rpg-mission-preview {
        margin-top: 16px;
        padding: 16px;
        border-radius: 24px;
        background: rgba(255,255,255,0.62);
        border: 1px solid rgba(255,255,255,0.68);
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.76), 0 10px 24px rgba(29, 53, 87, 0.08);
      }

      .rpg-mission-preview.hidden {
        display: none !important;
      }

      .rpg-mini-map-note {
        margin-top: 10px;
        color: var(--muted);
        font-size: 0.92rem;
      }

      @media (max-width: 1060px) {
        .rpg-map-floor-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      @media (max-width: 640px) {
        .rpg-map-floor-grid {
          grid-template-columns: 1fr;
        }

        .rpg-map-board {
          padding: 14px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function getFloorOrder() {
    return ['8/F', '7/F', '6/F', '5/F', '4/F', '3/F', '2/F', '1/F', 'G/F'];
  }

  function buildRpgMapHtml() {
    const floors = {};
    RPG_MISSIONS.forEach(function (mission) {
      if (!floors[mission.floor]) floors[mission.floor] = [];
      floors[mission.floor].push(mission);
    });

    const floorHtml = getFloorOrder().filter(function (floor) {
      return floors[floor] && floors[floor].length;
    }).map(function (floor) {
      const missions = floors[floor].map(function (mission) {
        return '<button type="button" class="rpg-room-btn" data-rpg-scenario="' + escapeHtml(mission.key) + '">' +
          '<span class="rpg-room-icon">' + escapeHtml(mission.icon) + '</span>' +
          '<span class="rpg-room-main"><strong>' + escapeHtml(mission.room) + '</strong><span>' + escapeHtml(mission.title) + '</span></span>' +
        '</button>';
      }).join('');

      return '<div class="rpg-floor-card">' +
        '<div class="rpg-floor-title">🗺️ ' + escapeHtml(floor) + '</div>' +
        '<div class="rpg-room-list">' + missions + '</div>' +
      '</div>';
    }).join('');

    return '<div class="hero-card animate-in rpg-map-shell">' +
      '<div class="rpg-map-header">' +
        '<div class="tag">RPG 校園地圖</div>' +
        '<div class="hero-avatar">🗺️</div>' +
        '<h2>梁書 RPG 校園任務地圖</h2>' +
        '<p>請選擇一個地點開始任務。每個地點都對應一個校園社交情境。</p>' +
      '</div>' +
      '<div class="rpg-map-board">' +
        '<div class="rpg-map-title-row">' +
          '<div><strong>任務地圖</strong><div class="rpg-mini-map-note">根據梁書校園房間地圖設計：課室、小食部、操場、圖書館、輔導室、社工室等位置。</div></div>' +
          '<button class="secondary" type="button" onclick="showSituationScreen()">改用情境列表</button>' +
        '</div>' +
        '<div class="rpg-map-floor-grid">' + floorHtml + '</div>' +
        '<div class="rpg-mission-preview hidden" id="rpgMissionPreview"></div>' +
      '</div>' +
      '<div class="welcome-actions">' +
        '<button class="secondary" onclick="showCoverScreen()">返回開始頁</button>' +
        '<button class="secondary" onclick="showPhraseLibraryScreen()">社交句式庫</button>' +
        '<button class="secondary" onclick="showBadgeScreen()">查看我的徽章</button>' +
        '<button class="secondary" onclick="showSettingsScreen()">我的設定</button>' +
      '</div>' +
    '</div>';
  }

  function ensureRpgMapScreen() {
    injectRpgStyles();

    let screen = document.getElementById('rpgMapScreen');
    if (screen) return screen;

    const card = document.querySelector('.container .card');
    if (!card) return null;

    screen = document.createElement('div');
    screen.id = 'rpgMapScreen';
    screen.className = 'screen welcome-screen';
    screen.innerHTML = buildRpgMapHtml();
    card.appendChild(screen);

    screen.addEventListener('click', function (event) {
      const button = event.target.closest('[data-rpg-scenario]');
      if (!button) return;
      showRpgMissionPreview(button.dataset.rpgScenario);
    });

    return screen;
  }

  function showOnlyScreen(screenId) {
    document.querySelectorAll('.screen').forEach(function (screen) {
      screen.classList.toggle('active', screen.id === screenId);
    });

    try {
      if (typeof appState !== 'undefined' && appState) appState.currentScreen = screenId === 'rpgMapScreen' ? 'rpgMap' : appState.currentScreen;
    } catch (error) {}

    window.scrollTo({ top: 0, behavior: document.body.classList.contains('reduced-motion') ? 'auto' : 'smooth' });
  }

  function showRpgMapScreen() {
    const screen = ensureRpgMapScreen();
    if (!screen) return;
    showOnlyScreen('rpgMapScreen');
  }

  function getMissionByKey(key) {
    return RPG_MISSIONS.find(function (mission) { return mission.key === key; });
  }

  function showRpgMissionPreview(key) {
    const mission = getMissionByKey(key);
    const preview = document.getElementById('rpgMissionPreview');
    if (!mission || !preview) return;

    preview.classList.remove('hidden');
    preview.innerHTML =
      '<div class="tag">' + escapeHtml(mission.floor) + '｜' + escapeHtml(mission.room) + '</div>' +
      '<h3>' + escapeHtml(mission.icon + ' ' + mission.title) + '</h3>' +
      '<p>' + escapeHtml(mission.desc) + '</p>' +
      '<div class="welcome-actions" style="justify-content:flex-start; margin-top:12px;">' +
        '<button type="button" onclick="startRpgMission(\'' + escapeHtml(mission.key) + '\')">開始任務</button>' +
        '<button type="button" class="secondary" onclick="showRpgMapScreen()">返回地圖</button>' +
      '</div>';

    preview.scrollIntoView({ behavior: document.body.classList.contains('reduced-motion') ? 'auto' : 'smooth', block: 'nearest' });
  }

  function startRpgMission(key) {
    if (typeof registerNewAdd3Scenarios === 'function') registerNewAdd3Scenarios();
    if (typeof initBackgroundFlow === 'function') initBackgroundFlow();
    if (typeof startAsdGame === 'function') {
      startAsdGame(key);
      return;
    }
    showSituationScreen();
  }

  function addRpgMapButtonToCover() {
    const menu = document.querySelector('#coverScreen .menu-actions');
    if (!menu || document.getElementById('rpgMapCoverButton')) return;

    const startButton = menu.querySelector('button');
    const button = document.createElement('button');
    button.id = 'rpgMapCoverButton';
    button.className = 'secondary';
    button.type = 'button';
    button.textContent = 'RPG 校園地圖';
    button.addEventListener('click', showRpgMapScreen);

    if (startButton && startButton.nextSibling) {
      menu.insertBefore(button, startButton.nextSibling);
    } else {
      menu.appendChild(button);
    }
  }

  function patchScreenNavigationToHideRpg() {
    ['showCoverScreen', 'showBadgeScreen', 'showSettingsScreen', 'showPhraseLibraryScreen', 'showSituationScreen'].forEach(function (name) {
      if (typeof window[name] !== 'function') return;
      if (window[name].__rpgHidePatched) return;

      const original = window[name];
      window[name] = function () {
        const rpgScreen = document.getElementById('rpgMapScreen');
        if (rpgScreen) rpgScreen.classList.remove('active');
        return original.apply(this, arguments);
      };
      window[name].__rpgHidePatched = true;
    });
  }

  function initHeaderHomeLink() {
    const header = document.querySelector('header');
    if (header && !header.__homeLinkReady) {
      header.__homeLinkReady = true;
      header.setAttribute('role', 'button');
      header.setAttribute('tabindex', '0');
      header.setAttribute('aria-label', '返回首頁');
      header.title = '返回首頁';
      header.style.cursor = 'pointer';
      header.style.userSelect = 'none';

      header.addEventListener('click', function () {
        goHome();
      });

      header.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          goHome();
        }
      });
    }

    addRpgMapButtonToCover();
    ensureRpgMapScreen();
    patchScreenNavigationToHideRpg();
  }

  window.goHomeFromHeader = goHome;
  window.initHeaderHomeLink = initHeaderHomeLink;
  window.showRpgMapScreen = showRpgMapScreen;
  window.startRpgMission = startRpgMission;
  window.showRpgMissionPreview = showRpgMissionPreview;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeaderHomeLink);
  } else {
    initHeaderHomeLink();
  }

  window.addEventListener('load', function () {
    initHeaderHomeLink();
    setTimeout(initHeaderHomeLink, 300);
    setTimeout(patchScreenNavigationToHideRpg, 900);
  });
})();
