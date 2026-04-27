// /scenarios/scenario-visuals.js
// 管理每個情境的背景圖片與圖片顯示。

(function () {
  const scenarioVisuals = {
    start: {
      image: 'images/start-conversation.jpg',
      imageAlt: '課室內一位學生準備向同學打招呼'
    },
    refuse: {
      image: 'images/polite-refusal.jpg',
      imageAlt: '小息時一位學生禮貌拒絕同學邀請'
    },
    conflict: {
      image: 'images/stationery-conflict.jpg',
      imageAlt: '課室內一位學生發現同學拿了自己的文具'
    },
    respond: {
      image: 'images/respond-friend.jpg',
      imageAlt: '放學前一位同學開心分享事情，另一位同學正在聆聽'
    },
    groupwork: {
      image: 'images/groupwork.jpg',
      imageAlt: '課室內幾位學生正在小組合作'
    },
    help: {
      image: 'images/ask-teacher-help.jpg',
      imageAlt: '學生在課堂中向老師求助'
    },
    lunch: {
      image: 'images/lunch-join.jpg',
      imageAlt: '午飯時間學生想加入同學一起吃飯'
    },
    homework: {
      image: 'images/homework-check.jpg',
      imageAlt: '放學後學生向同學確認功課內容'
    },
    teasing: {
      image: 'images/teasing.jpg',
      imageAlt: '小息時一位學生被同學取笑，感到不舒服'
    },
    bumped: {
      image: 'images/bumped.jpg',
      imageAlt: '轉堂時走廊人多，一位學生被不小心撞到'
    },
    disagree: {
      image: 'images/disagree.jpg',
      imageAlt: '小組討論時學生之間出現不同意見'
    },
    teacherReminder: {
      image: 'images/teacher-reminder.jpg',
      imageAlt: '課室內老師提醒學生安靜和留心上課'
    },
    emotionReminder: {
      image: 'images/emotion-reminder.jpg',
      imageAlt: '早上操場上，一位學生被提醒後情緒升高，老師在旁協助'
    }
  };

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function applyScenarioVisuals() {
    if (typeof asdGames === 'undefined') return;

    Object.keys(scenarioVisuals).forEach((key) => {
      if (!asdGames[key]) return;
      asdGames[key].image = scenarioVisuals[key].image;
      asdGames[key].imageAlt = scenarioVisuals[key].imageAlt;
    });
  }

  function getCurrentGameFromPage() {
    if (typeof asdGames === 'undefined') return null;

    const possibleKeys = [];
    try {
      if (typeof appState !== 'undefined' && appState) {
        ['currentGame', 'currentScenario', 'selectedGame', 'gameKey'].forEach((field) => {
          if (appState[field]) possibleKeys.push(appState[field]);
        });
      }
    } catch (error) {}

    for (const key of possibleKeys) {
      if (asdGames[key]) return asdGames[key];
    }

    const box = document.getElementById('asdBox');
    const text = box ? box.innerText || '' : '';
    return Object.keys(asdGames)
      .map((key) => asdGames[key])
      .find((game) => game && game.title && text.includes(game.title)) || null;
  }

  function buildScenarioImageHtml(game) {
    if (!game) return '';

    if (game.image) {
      return `
        <div class="scenario-image-wrap">
          <img
            src="${escapeHtml(game.image)}"
            alt="${escapeHtml(game.imageAlt || game.title || '情境圖片')}"
            class="scenario-image"
            loading="lazy"
            onerror="this.style.display='none'; this.parentElement.classList.add('image-missing');"
          >
          <div class="scenario-image-placeholder">
            <div class="scenario-image-placeholder-icon">🏫</div>
            <div>情境圖片尚未上載</div>
            <small>請把圖片放入 images 資料夾</small>
          </div>
        </div>
      `;
    }

    return `
      <div class="scenario-image-wrap image-missing">
        <div class="scenario-image-placeholder">
          <div class="scenario-image-placeholder-icon">🏫</div>
          <div>這個情境暫時未有圖片</div>
          <small>你可以稍後加入圖片</small>
        </div>
      </div>
    `;
  }

  function injectImageIntoBackgroundPage() {
    const box = document.getElementById('asdBox');
    if (!box) return;

    const text = box.innerText || '';
    const isBackgroundPage = text.includes('請先閱讀背景故事') || text.includes('我已閱讀背景，開始答題');
    if (!isBackgroundPage || box.querySelector('.scenario-image-wrap')) return;

    const game = getCurrentGameFromPage();
    if (!game) return;

    const badge = box.querySelector('.scene-badge');
    const imageHtml = buildScenarioImageHtml(game);

    if (badge) {
      badge.insertAdjacentHTML('afterend', imageHtml);
    } else {
      box.insertAdjacentHTML('afterbegin', imageHtml);
    }
  }

  function enhanceBackgroundReviewBox() {
    const box = document.getElementById('backgroundReviewBox');
    if (!box || box.querySelector('.scenario-image-wrap')) return;

    const text = box.innerText || '';
    if (!text.includes('背景故事')) return;

    const game = getCurrentGameFromPage();
    if (!game) return;

    box.insertAdjacentHTML('afterbegin', buildScenarioImageHtml(game));
  }

  function installVisualObserver() {
    const gameScreen = document.getElementById('gameScreen');
    if (!gameScreen || gameScreen.__scenarioVisualObserverInstalled) return;

    const observer = new MutationObserver(() => {
      setTimeout(() => {
        applyScenarioVisuals();
        injectImageIntoBackgroundPage();
        enhanceBackgroundReviewBox();
      }, 60);
    });

    observer.observe(gameScreen, { childList: true, subtree: true, characterData: true });
    gameScreen.__scenarioVisualObserverInstalled = true;
  }

  function initScenarioVisuals() {
    applyScenarioVisuals();
    injectImageIntoBackgroundPage();
    enhanceBackgroundReviewBox();
    installVisualObserver();
    setTimeout(applyScenarioVisuals, 100);
    setTimeout(injectImageIntoBackgroundPage, 150);
    setTimeout(injectImageIntoBackgroundPage, 500);
  }

  window.scenarioVisuals = scenarioVisuals;
  window.applyScenarioVisuals = applyScenarioVisuals;
  window.injectImageIntoBackgroundPage = injectImageIntoBackgroundPage;
  window.buildScenarioImageHtml = buildScenarioImageHtml;
  window.getCurrentGameFromPage = getCurrentGameFromPage;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScenarioVisuals);
  } else {
    initScenarioVisuals();
  }
})();
