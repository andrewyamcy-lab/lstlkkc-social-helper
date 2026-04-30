// /header-home-link.js
// Makes the site header clickable so users can return to the home page.
// Adds an RPG 校園地圖 entry point using the real school map image.

(function () {
  const SCHOOL_MAP_IMAGE = 'images/school-map.jpg?v=20260430-1';

  const RPG_MISSIONS = [
    { key: 'start', icon: '🗣️', floor: '3/F', room: '301 課室', x: 24.8, y: 54.4, title: '課室：發起對話', desc: '主動和同學打招呼，開始簡單對話。' },
    { key: 'conflict', icon: '🧩', floor: '3/F', room: '302 課室', x: 27.1, y: 54.4, title: '借文具：處理衝突', desc: '同學未經同意拿了你的筆，學習平靜表達界線。' },
    { key: 'respond', icon: '💬', floor: '3/F', room: '303 課室', x: 29.4, y: 54.4, title: '放學前：作出回應', desc: '同學開心分享事情時，學習聆聽和回應。' },
    { key: 'lunch', icon: '🍱', floor: '3/F', room: '小食部', x: 77.0, y: 55.5, title: '午飯時間：加入同學', desc: '想加入同學一起吃飯時，學習自然地開口。' },
    { key: 'queueJump', icon: '🧃', floor: '3/F', room: '小食部', x: 79.0, y: 55.5, title: '小賣部排隊：有人打尖', desc: '排隊買食物時有人插隊，學習平靜提醒。' },

    { key: 'bumped', icon: '🚶', floor: '4/F', room: '樓梯 / 走廊', x: 69.6, y: 47.4, title: '轉堂被撞：控制反應', desc: '走廊很多人時被撞到，練習分辨意外和故意。' },
    { key: 'teacherReminder', icon: '📋', floor: '4/F', room: '課室', x: 26.0, y: 47.2, title: '老師提醒：接受指正', desc: '上課被老師提醒時，學習修正行為。' },

    { key: 'help', icon: '🙋', floor: '5/F', room: '教員室附近', x: 34.8, y: 39.0, title: '課堂中：向老師求助', desc: '聽不明白時，練習用清楚方式向老師求助。' },

    { key: 'groupwork', icon: '🤝', floor: '6/F', room: '小組教室', x: 33.5, y: 32.0, title: '小組：加入合作', desc: '在分組活動裡，找到時機加入和表達想法。' },
    { key: 'teasing', icon: '🛡️', floor: '6/F', room: '走廊', x: 47.2, y: 31.8, title: '被同學取笑：保持冷靜', desc: '被同學取笑說話方式時，學習表達不舒服和求助。' },
    { key: 'disagree', icon: '🧠', floor: '6/F', room: '小組教室', x: 50.0, y: 32.0, title: '意見不同：接受分歧', desc: '小組討論被否定時，學習彈性思考。' },

    { key: 'whatsappIgnored', icon: '📱', floor: '8/F', room: '電腦室', x: 51.0, y: 14.5, title: '班群訊息：沒有人回覆', desc: '問功課沒有人即時回覆，練習等待和清楚發問。' },
    { key: 'academicOnly', icon: '🎓', floor: '8/F', room: '圖書館', x: 58.0, y: 14.0, title: '學業問題：只想問功課', desc: '想集中學業問題時，學習清楚表達。' },

    { key: 'homework', icon: '📚', floor: '1/F', room: '101 課室', x: 21.0, y: 72.0, title: '放學後：確認功課', desc: '不確定功課內容時，學習向同學清楚確認。' },
    { key: 'copyHomework', icon: '📝', floor: '1/F', room: '課室', x: 25.0, y: 72.0, title: '同學叫你借功課：拒絕抄襲', desc: '同學想抄你的功課時，學習堅定但有禮貌地拒絕。' },

    { key: 'quietSpace', icon: '🌿', floor: '2/F', room: '輔導室 / 社工室', x: 51.0, y: 63.5, title: '小息太嘈：需要安靜空間', desc: '小息環境太嘈時，學習表達需要和安全離開。' },

    { key: 'refuse', icon: '🙅', floor: 'G/F', room: '操場', x: 94.2, y: 54.6, title: '小息：禮貌拒絕', desc: '被同學邀請玩遊戲時，清楚而友善地拒絕。' },
    { key: 'peGrouping', icon: '🏀', floor: 'G/F', room: '操場', x: 96.0, y: 55.8, title: '體育堂分組：未被邀請', desc: '分組時未被邀請，練習主動加入和求助。' },
    { key: 'lostItem', icon: '🗂️', floor: 'G/F', room: '校務處 / 走廊', x: 34.7, y: 39.8, title: '文件袋不見了：冷靜處理', desc: '遺失物品時，學習回想、求助和跟進。' },
    { key: 'losingGame', icon: '🏆', floor: 'G/F', room: '操場', x: 95.0, y: 57.8, title: '比賽輸了：接受結果', desc: '體育或班際活動輸了時，練習處理失望和保持風度。' }
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
      .rpg-map-shell { text-align: left; }
      .rpg-map-header { text-align: center; margin-bottom: 18px; }
      .rpg-map-board {
        position: relative;
        overflow: hidden;
        border-radius: 30px;
        padding: 18px;
        background: linear-gradient(135deg, rgba(255,255,255,0.78), rgba(255,255,255,0.42));
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
      .rpg-mini-map-note { margin-top: 6px; color: var(--muted); font-size: 0.92rem; }
      .rpg-real-map-scroll {
        width: 100%;
        overflow: auto;
        border-radius: 24px;
        background: rgba(255,255,255,0.72);
        border: 1px solid rgba(255,255,255,0.70);
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.76), 0 14px 34px rgba(29,53,87,0.10);
      }
      .rpg-real-map-wrap {
        position: relative;
        min-width: 980px;
        line-height: 0;
      }
      .rpg-real-map-img {
        width: 100%;
        height: auto;
        display: block;
        border-radius: 22px;
      }
      .rpg-map-fallback {
        display: none;
        padding: 28px;
        text-align: center;
        line-height: 1.8;
        color: var(--muted);
      }
      .rpg-real-map-wrap.map-missing .rpg-real-map-img { display: none; }
      .rpg-real-map-wrap.map-missing .rpg-map-marker { display: none; }
      .rpg-real-map-wrap.map-missing .rpg-map-fallback { display: block; }
      .rpg-map-marker {
        position: absolute;
        left: calc(var(--x) * 1%);
        top: calc(var(--y) * 1%);
        transform: translate(-50%, -50%);
        width: 42px;
        height: 42px;
        border-radius: 999px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        font-size: 1.25rem;
        background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(230,242,255,0.96));
        color: var(--primary-dark);
        border: 3px solid rgba(0,122,255,0.78);
        box-shadow: 0 8px 22px rgba(0, 87, 217, 0.28), 0 0 0 6px rgba(0,122,255,0.15);
        z-index: 2;
      }
      .rpg-map-marker::before { display: none; }
      .rpg-map-marker:hover {
        transform: translate(-50%, -50%) scale(1.13);
        background: #ffffff;
        box-shadow: 0 12px 28px rgba(0, 87, 217, 0.34), 0 0 0 8px rgba(0,122,255,0.18);
      }
      .rpg-map-marker::after {
        content: attr(data-label);
        position: absolute;
        left: 50%;
        top: -36px;
        transform: translateX(-50%);
        white-space: nowrap;
        background: rgba(20, 32, 51, 0.92);
        color: white;
        font-size: 0.75rem;
        line-height: 1.2;
        padding: 6px 9px;
        border-radius: 999px;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.18s ease;
      }
      .rpg-map-marker:hover::after { opacity: 1; }
      .rpg-mission-preview {
        margin-top: 16px;
        padding: 16px;
        border-radius: 24px;
        background: rgba(255,255,255,0.72);
        border: 1px solid rgba(255,255,255,0.68);
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.76), 0 10px 24px rgba(29, 53, 87, 0.08);
        line-height: 1.65;
      }
      .rpg-mission-preview.hidden { display: none !important; }
      @media (max-width: 640px) {
        .rpg-map-board { padding: 12px; }
        .rpg-real-map-wrap { min-width: 900px; }
        .rpg-map-marker { width: 40px; height: 40px; font-size: 1.15rem; }
      }
    `;
    document.head.appendChild(style);
  }

  function buildMissionMarkersHtml() {
    return RPG_MISSIONS.map(function (mission) {
      return '<button type="button" class="rpg-map-marker" style="--x:' + mission.x + '; --y:' + mission.y + ';" data-rpg-scenario="' + escapeHtml(mission.key) + '" data-label="' + escapeHtml(mission.room) + '" aria-label="' + escapeHtml(mission.title) + '">' + escapeHtml(mission.icon) + '</button>';
    }).join('');
  }

  function buildRpgMapHtml() {
    return '<div class="hero-card animate-in rpg-map-shell">' +
      '<div class="rpg-map-header">' +
        '<div class="tag">RPG 校園地圖</div>' +
        '<div class="hero-avatar">🗺️</div>' +
        '<h2>梁書 RPG 校園任務地圖</h2>' +
        '<p>請在學校地圖上選擇一個任務標記。每個地點都對應一個校園社交情境。</p>' +
      '</div>' +
      '<div class="rpg-map-board">' +
        '<div class="rpg-map-title-row">' +
          '<div><strong>任務地圖</strong><div class="rpg-mini-map-note">使用真正學校房間地圖。按地圖上的 Emoji 任務點開始 RPG 任務。</div></div>' +
          '<button class="secondary" type="button" onclick="showSituationScreen()">改用情境列表</button>' +
        '</div>' +
        '<div class="rpg-real-map-scroll">' +
          '<div class="rpg-real-map-wrap" id="rpgRealMapWrap">' +
            '<img class="rpg-real-map-img" src="' + SCHOOL_MAP_IMAGE + '" alt="樂善堂梁銶琚書院學校房間地圖" onerror="document.getElementById(\'rpgRealMapWrap\').classList.add(\'map-missing\')">' +
            buildMissionMarkersHtml() +
            '<div class="rpg-map-fallback"><strong>暫時未找到學校地圖圖片。</strong><br>請把地圖圖片放入 GitHub repo 的 <code>images/school-map.jpg</code>。<br>放好之後重新整理頁面，這裡就會顯示真正學校地圖。</div>' +
          '</div>' +
        '</div>' +
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
