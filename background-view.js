// /background-view.js
// 查看背景按鈕：讓學生答題時可隨時重看情境背景。
// 同時自動載入情境圖片 CSS 與 modular scenario files。

(function () {
  function loadScenarioImageCss() {
    if (window.__scenarioImageCssLoaderAdded) return;
    window.__scenarioImageCssLoaderAdded = true;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'scenario-images.css';
    document.head.appendChild(link);
  }

  function loadScriptOnce(src, flagName, onload) {
    if (window[flagName]) {
      if (typeof onload === 'function') onload();
      return;
    }
    window[flagName] = true;

    const script = document.createElement('script');
    script.src = src;
    script.defer = true;
    script.onload = function () {
      if (typeof onload === 'function') onload();
    };
    document.head.appendChild(script);
  }

  function loadScenarioModules() {
    // Order matters: data → register → visuals → background flow.
    loadScriptOnce('scenarios/scenario-data.js', '__scenarioDataLoaderAdded', function () {
      loadScriptOnce('scenarios/scenario-register.js', '__scenarioRegisterLoaderAdded', function () {
        if (typeof refreshExtraScenarioUI === 'function') refreshExtraScenarioUI();
      });
    });

    loadScriptOnce('scenarios/scenario-visuals.js', '__scenarioVisualsLoaderAdded', function () {
      if (typeof applyScenarioVisuals === 'function') applyScenarioVisuals();
      if (typeof injectImageIntoBackgroundPage === 'function') injectImageIntoBackgroundPage();
    });

    loadScriptOnce('scenarios/background-flow.js', '__backgroundFlowLoaderAdded', function () {
      if (typeof refreshExtraScenarioUI === 'function') refreshExtraScenarioUI();
    });
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function getActiveGame() {
    try {
      if (typeof asdGames === 'undefined') return null;
      if (typeof appState !== 'undefined' && appState) {
        const key = appState.currentGame || appState.currentScenario || appState.selectedGame || appState.gameKey;
        if (key && asdGames[key]) return asdGames[key];
      }

      const box = document.getElementById('asdBox');
      const text = box ? box.innerText || '' : '';
      return Object.keys(asdGames).map((k) => asdGames[k]).find((game) => {
        return game && game.title && text.includes(game.title);
      }) || null;
    } catch (error) {
      return null;
    }
  }

  function ensureBackgroundBox() {
    let box = document.getElementById('backgroundReviewBox');
    if (box) return box;

    const choices = document.getElementById('asdChoices');
    box = document.createElement('div');
    box.id = 'backgroundReviewBox';
    box.className = 'hint-box hidden';
    box.style.marginTop = '12px';

    if (choices && choices.parentNode) {
      choices.parentNode.insertBefore(box, choices);
    }
    return box;
  }

  window.toggleScenarioBackground = function () {
    if (typeof refreshExtraScenarioUI === 'function') refreshExtraScenarioUI();
    if (typeof applyScenarioVisuals === 'function') applyScenarioVisuals();

    const game = getActiveGame();
    const box = ensureBackgroundBox();
    if (!box) return;

    if (!game || !game.intro) {
      box.classList.remove('hidden');
      box.innerHTML = '<strong>背景故事</strong><br>暫時未能讀取這個情境的背景。';
      return;
    }

    if (!box.classList.contains('hidden')) {
      box.classList.add('hidden');
      box.innerHTML = '';
      return;
    }

    const imageHtml = typeof buildScenarioImageHtml === 'function' ? buildScenarioImageHtml(game) : '';

    box.classList.remove('hidden');
    box.innerHTML = `
      ${imageHtml}
      <strong>📖 背景故事</strong><br>
      <div style="margin-top:8px; line-height:1.8;">${escapeHtml(game.intro)}</div>
      ${game.location ? `<div style="margin-top:10px;"><strong>地點：</strong>${escapeHtml(game.location)}</div>` : ''}
      ${game.socialGoal ? `<div style="margin-top:6px;"><strong>練習目標：</strong>${escapeHtml(game.socialGoal)}</div>` : ''}
      ${game.supportTip ? `<div style="margin-top:6px;"><strong>小提醒：</strong>${escapeHtml(game.supportTip)}</div>` : ''}
      <div style="margin-top:12px;"><button class="secondary" onclick="toggleScenarioBackground()">關閉背景</button></div>
    `;
  };

  function addBackgroundButton() {
    const actionRow = document.querySelector('#gameScreen .action-row');
    if (!actionRow || document.getElementById('viewBackgroundButton')) return;

    const button = document.createElement('button');
    button.id = 'viewBackgroundButton';
    button.className = 'secondary';
    button.type = 'button';
    button.textContent = '查看背景';
    button.onclick = window.toggleScenarioBackground;

    actionRow.insertBefore(button, actionRow.firstChild);
  }

  function observeGameScreen() {
    const gameScreen = document.getElementById('gameScreen');
    if (!gameScreen || gameScreen.__backgroundButtonObserverInstalled) return;

    const observer = new MutationObserver(() => {
      addBackgroundButton();
      if (typeof refreshExtraScenarioUI === 'function') refreshExtraScenarioUI();
      if (typeof injectImageIntoBackgroundPage === 'function') injectImageIntoBackgroundPage();
    });
    observer.observe(gameScreen, { childList: true, subtree: true });
    gameScreen.__backgroundButtonObserverInstalled = true;
  }

  function initBackgroundViewButton() {
    loadScenarioImageCss();
    loadScenarioModules();
    addBackgroundButton();
    observeGameScreen();
    setTimeout(addBackgroundButton, 100);
    setTimeout(addBackgroundButton, 500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBackgroundViewButton);
  } else {
    initBackgroundViewButton();
  }
})();
