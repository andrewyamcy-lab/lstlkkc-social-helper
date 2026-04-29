// /scenario-images-light.js
// Lightweight scenario image display.
// Uses /images/*.jpg files. No MutationObserver, no repeated interval, no extra module loader.
// Each scenario now has its own unique image filename.
// If an image has not been uploaded yet, it will simply be hidden until the file exists.

(function () {
  const scenarioImageMap = {
    start: 'images/start-conversation.jpg',
    refuse: 'images/polite-refusal.jpg',
    conflict: 'images/stationery-conflict.jpg',
    respond: 'images/respond-friend.jpg',
    groupwork: 'images/groupwork.jpg',
    help: 'images/ask-teacher-help.jpg',
    lunch: 'images/lunch-join.jpg',
    homework: 'images/homework-check.jpg',

    teasing: 'images/teasing.jpg',
    bumped: 'images/bumped.jpg',
    disagree: 'images/disagree.jpg',
    teacherReminder: 'images/teacher-reminder.jpg',

    queueJump: 'images/queue-jump.jpg',
    peGrouping: 'images/pe-grouping.jpg',
    whatsappIgnored: 'images/whatsapp-ignored.jpg',
    borrowedNoReturn: 'images/borrowed-no-return.jpg',
    lunchSeat: 'images/lunch-seat.jpg',
    jokeConfusion: 'images/joke-confusion.jpg',
    academicOnly: 'images/academic-only.jpg',
    lostItem: 'images/lost-item.jpg',
    groupRole: 'images/group-role.jpg'
  };

  const scenarioAltMap = {
    start: '學生在課室開始對話的情境圖',
    refuse: '學生在小息時禮貌拒絕的情境圖',
    conflict: '學生處理文具衝突的情境圖',
    respond: '學生回應朋友分享的情境圖',
    groupwork: '學生小組合作的情境圖',
    help: '學生向老師求助的情境圖',
    lunch: '學生午飯加入同學的情境圖',
    homework: '學生確認功課的情境圖',
    teasing: '學生被取笑時保持冷靜的情境圖',
    bumped: '學生在走廊被撞到的情境圖',
    disagree: '學生在小組中面對不同意見的情境圖',
    teacherReminder: '學生被老師提醒後修正行為的情境圖',
    queueJump: '學生在小賣部排隊時遇到插隊的情境圖',
    peGrouping: '學生在體育堂分組時嘗試加入同學的情境圖',
    whatsappIgnored: '學生在班群發訊息但沒有人回覆的情境圖',
    borrowedNoReturn: '學生提醒同學歸還文具的情境圖',
    lunchSeat: '學生午飯時嘗試加入同學座位的情境圖',
    jokeConfusion: '學生分辨玩笑和誤會的情境圖',
    academicOnly: '學生使用學習助手問學業問題的情境圖',
    lostItem: '學生冷靜處理遺失物品的情境圖',
    groupRole: '學生在小組中確認分工的情境圖'
  };

  let activeScenarioKey = '';

  function injectImageStyles() {
    if (document.getElementById('scenarioImagesLightStyle')) return;
    const style = document.createElement('style');
    style.id = 'scenarioImagesLightStyle';
    style.textContent = `
      .scenario-thumb {
        width: 100%;
        aspect-ratio: 16 / 9;
        object-fit: cover;
        border-radius: 14px;
        margin-bottom: 12px;
        border: 1px solid rgba(15, 23, 42, 0.10);
        display: block;
        background: #eef2ff;
      }

      .game-scenario-image-wrap {
        margin: 0 0 14px 0;
        border-radius: 18px;
        overflow: hidden;
        border: 1px solid rgba(15, 23, 42, 0.10);
        background: #f8fafc;
      }

      .game-scenario-image-wrap img {
        width: 100%;
        aspect-ratio: 16 / 9;
        object-fit: cover;
        display: block;
      }

      .game-scenario-image-caption {
        padding: 8px 12px;
        font-size: 0.92rem;
        color: var(--muted, #64748b);
        background: rgba(255,255,255,0.88);
      }
    `;
    document.head.appendChild(style);
  }

  function getImageForKey(key) {
    return scenarioImageMap[key] || '';
  }

  function getAltForKey(key) {
    return scenarioAltMap[key] || '梁書校園社交練習情境圖';
  }

  function addImagesToScenarioCards() {
    document.querySelectorAll('.scenario-card').forEach((card) => {
      if (card.dataset.imageAdded === 'true') return;
      const button = card.querySelector('button[onclick*="startAsdGame"]');
      if (!button) return;

      const onclickText = button.getAttribute('onclick') || '';
      const match = onclickText.match(/startAsdGame\(['"]([^'"]+)['"]\)/);
      if (!match || !match[1]) return;

      const key = match[1];
      const imageSrc = getImageForKey(key);
      if (!imageSrc) return;

      const img = document.createElement('img');
      img.className = 'scenario-thumb';
      img.src = imageSrc;
      img.alt = getAltForKey(key);
      img.loading = 'lazy';
      img.onerror = function () {
        img.style.display = 'none';
      };

      card.insertBefore(img, card.firstChild);
      card.dataset.imageAdded = 'true';
    });
  }

  function ensureGameImageBox() {
    let box = document.getElementById('gameScenarioImageBox');
    if (box) return box;

    const dialogueBox = document.getElementById('asdBox');
    if (!dialogueBox || !dialogueBox.parentNode) return null;

    box = document.createElement('div');
    box.id = 'gameScenarioImageBox';
    box.className = 'game-scenario-image-wrap hidden';
    dialogueBox.parentNode.insertBefore(box, dialogueBox);
    return box;
  }

  function showGameImage(key) {
    activeScenarioKey = key || activeScenarioKey;
    const imageSrc = getImageForKey(activeScenarioKey);
    const box = ensureGameImageBox();
    if (!box) return;

    if (!imageSrc) {
      box.classList.add('hidden');
      box.innerHTML = '';
      return;
    }

    let title = '';
    try {
      if (typeof asdGames !== 'undefined' && asdGames[activeScenarioKey]) {
        title = asdGames[activeScenarioKey].title || '';
      }
    } catch (error) {}

    box.classList.remove('hidden');
    box.innerHTML = `
      <img src="${imageSrc}" alt="${getAltForKey(activeScenarioKey)}" loading="lazy" onerror="this.parentElement.classList.add('hidden')">
      ${title ? `<div class="game-scenario-image-caption">${title}</div>` : ''}
    `;
  }

  function patchStartGame() {
    if (typeof window.startAsdGame !== 'function') return;
    if (window.startAsdGame.__imageLightPatched) return;

    const originalStartAsdGame = window.startAsdGame;
    window.startAsdGame = function (key) {
      const result = originalStartAsdGame.apply(this, arguments);
      setTimeout(function () {
        showGameImage(key);
      }, 60);
      return result;
    };
    window.startAsdGame.__imageLightPatched = true;
  }

  function initScenarioImagesLight() {
    injectImageStyles();
    addImagesToScenarioCards();
    patchStartGame();
  }

  window.initScenarioImagesLight = initScenarioImagesLight;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScenarioImagesLight);
  } else {
    initScenarioImagesLight();
  }

  // Run a few delayed passes because extra-scenarios-light.js adds cards after page load.
  setTimeout(initScenarioImagesLight, 200);
  setTimeout(initScenarioImagesLight, 800);
  setTimeout(initScenarioImagesLight, 1600);
})();
