// /extra-scenarios.js
// 額外校園社交情境
// 目的：把新增情境從 index.html 分離，方便日後維護。

(function () {
  const EXTRA_TOTAL = 13;
  const EMOTION_KEY = 'emotionReminder';

  const emotionReminderScenario = {
    badge: { icon: '🌡️', name: '冷靜表達者' },
    card: {
      icon: '🌡️',
      title: '被提醒後情緒升高：先冷靜',
      desc: '被班長或同學提醒時，學習處理尷尬、生氣和想即刻理論的衝動。'
    },
    game: {
      title: '被提醒後情緒升高：先冷靜',
      intro: '情境：早上集隊時，班長提醒一位同學要交周記，並提醒他上課時不要睡覺。這位同學聽後覺得很尷尬和生氣，情緒突然升高，說話聲音變大，樣子很憤怒。老師為了保護大家安全，先安排班長離開現場求助。之後，這位同學仍然很生氣，並堅持要去找班長理論。',
      avatar: '🌡️',
      role: '情緒升高情境',
      mission: '學習在被提醒後先冷靜下來，安全表達感受，避免衝突升級。',
      location: '早上操場／612 室',
      socialGoal: '情緒管理 + 安全表達 + 接受協助',
      supportTip: '被提醒後覺得尷尬或生氣是可以理解的，但情緒高漲時不適合即時找對方理論。',
      hint: '先停一停、離開刺激位置、找老師協助，比即刻衝去找對方更安全。',
      calmPrompt: '先深呼吸三次，心裡說：「我而家好嬲，但我可以先停一停，之後再講。」',
      steps: [
        {
          prompt: '第 1 題：被班長提醒交周記和上課不要睡覺時，你第一個反應怎樣比較安全？',
          options: [
            { text: '先停一停，留意自己是否開始生氣', score: 2, note: '很好。先察覺自己的情緒，可以避免一時衝動。' },
            { text: '深呼吸一下，先不要即刻大聲回應', score: 2, note: '這是安全做法。情緒升高時，先減慢反應很重要。' },
            { text: '立即大聲罵班長，表示自己很不滿', score: 0, note: '這樣容易令事情升級，也可能令其他同學感到害怕。' },
            { text: '衝向班長，要求他立刻解釋', score: 0, note: '情緒很高時衝向對方是不安全的，可能令對方受驚或受傷。' }
          ]
        },
        {
          prompt: '第 2 題：如果你覺得班長當眾提醒你，令你很尷尬，你可以怎樣表達？',
          options: [
            { text: '我知道你提醒我，但你咁樣講，我會覺得有啲尷尬。', score: 2, note: '很好。你說出了感受，也沒有攻擊對方。' },
            { text: '我而家有啲唔開心，我想先冷靜一下。', score: 2, note: '這句很清楚，能讓老師或同學知道你需要冷靜。' },
            { text: '你憑咩管我？', score: 0, note: '這句容易令對方防衛，衝突可能會升級。' },
            { text: '你再講我就對你唔客氣。', score: 0, note: '威脅式說話不安全，也可能引起訓輔跟進。' }
          ]
        },
        {
          prompt: '第 3 題：當你發現自己越來越憤怒，最合適的下一步是什麼？',
          options: [
            { text: '先去老師附近或安靜位置，讓自己冷靜', score: 2, note: '很好。離開刺激位置有助情緒降溫。' },
            { text: '向老師說：「我而家好嬲，可唔可以畀我冷靜一陣？」', score: 2, note: '這是成熟和安全的求助方式。' },
            { text: '即刻去操場找班長理論', score: 0, note: '情緒高漲時即時面對對方，容易令衝突升級。' },
            { text: '大聲叫其他同學評理', score: 0, note: '把更多人拉入事件，可能令場面更混亂。' }
          ]
        },
        {
          prompt: '第 4 題：如果老師暫時不讓你去找班長，你應該怎樣理解？',
          options: [
            { text: '老師可能是想先確保大家安全', score: 2, note: '正確。分開雙方通常是為了避免衝突升級。' },
            { text: '老師可能見到我情緒很高，所以想我先冷靜', score: 2, note: '很好。這是較客觀和安全的理解。' },
            { text: '老師一定偏幫班長', score: 0, note: '這個想法未必有證據，也會令自己更生氣。' },
            { text: '我應該堅持衝出去，因為我要即刻講清楚', score: 0, note: '即時衝出去不安全，也可能令事件更嚴重。' }
          ]
        },
        {
          prompt: '第 5 題：冷靜後，如果你仍然想表達自己的感受，哪一個方法最好？',
          options: [
            { text: '請老師安排一個合適時間，讓我平靜地說出感受', score: 2, note: '很好。有老師協助時，雙方會較安全和容易溝通。' },
            { text: '平靜地說：「下次可唔可以私下提醒我？我會較容易接受。」', score: 2, note: '這句很好。你提出了具體需要，也沒有攻擊對方。' },
            { text: '私下找班長大聲質問', score: 0, note: '大聲質問容易令對方害怕，也可能再次引起衝突。' },
            { text: '之後在其他同學面前講班長壞話', score: 0, note: '這樣不能解決問題，還可能傷害關係。' }
          ]
        }
      ]
    }
  };

  function registerEmotionReminderScenario() {
    try {
      if (typeof badgeState !== 'undefined' && !(EMOTION_KEY in badgeState)) {
        badgeState[EMOTION_KEY] = false;
      }
      if (typeof badgeMeta !== 'undefined') {
        badgeMeta[EMOTION_KEY] = emotionReminderScenario.badge;
      }
      if (typeof asdGames !== 'undefined') {
        asdGames[EMOTION_KEY] = emotionReminderScenario.game;
      }
    } catch (error) {
      console.warn('未能註冊額外情境：', error);
    }
  }

  function addEmotionReminderCard() {
    const grid = document.querySelector('.scenario-select-grid');
    if (!grid || document.getElementById('scenarioCard-emotionReminder')) return;

    const { icon, title, desc } = emotionReminderScenario.card;
    grid.insertAdjacentHTML(
      'beforeend',
      `<div class="scenario-card" id="scenarioCard-emotionReminder"><div class="emoji">${icon}</div><strong>${title}</strong><div class="small">${desc}</div><button onclick="startAsdGame('${EMOTION_KEY}')">開始這個情境</button></div>`
    );
  }

  function normalizeExtraTotalText() {
    const el = document.getElementById('gameStatusText');
    if (el) {
      el.textContent = el.textContent.replace(/\/\s*(8|12|13)/g, `/ ${EXTRA_TOTAL}`);
    }
  }

  function refreshExtraScenarioUI() {
    registerEmotionReminderScenario();
    addEmotionReminderCard();
    normalizeExtraTotalText();
  }

  function patchNavigationFunction(functionName) {
    const original = window[functionName];
    if (typeof original !== 'function' || original.__extraScenarioPatched) return;

    const patched = function (...args) {
      const result = original.apply(this, args);
      setTimeout(refreshExtraScenarioUI, 0);
      return result;
    };

    patched.__extraScenarioPatched = true;
    window[functionName] = patched;
  }

  function initExtraScenarios() {
    refreshExtraScenarioUI();
    ['showSituationScreen', 'showBadgeScreen', 'showCoverScreen', 'showSettingsScreen', 'startAsdGame'].forEach(patchNavigationFunction);
    setTimeout(refreshExtraScenarioUI, 100);
  }

  window.registerEmotionReminderScenario = registerEmotionReminderScenario;
  window.addEmotionReminderCard = addEmotionReminderCard;
  window.refreshExtraScenarioUI = refreshExtraScenarioUI;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initExtraScenarios);
  } else {
    initExtraScenarios();
  }
})();
