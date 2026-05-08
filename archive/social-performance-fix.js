// /social-upgrades.js
// Upgrade layer for the 梁書 ASD social helper.
// Adds: after-answer explanations, sentence library, difficulty levels, and more realistic school scenarios.

(function () {
  const UPGRADE_STORAGE_KEY = 'lstlkkc_social_upgrades_v1';

  const phraseGroups = [
    {
      title: '打招呼 / 開始對話',
      icon: '🗣️',
      phrases: [
        '早晨，我想同你打個招呼。',
        '你好，我可以坐喺附近嗎？',
        '你今日上邊一課呀？',
        '我想問下你啱啱老師講咗咩？'
      ]
    },
    {
      title: '禮貌拒絕',
      icon: '🙅',
      phrases: [
        '多謝你邀請我，但我而家想休息一陣。',
        '我今日未必參加到，下次再一齊可以嗎？',
        '我而家想自己安靜一陣，多謝你明白。',
        '我唔係唔鍾意你哋，只係而家有少少攰。'
      ]
    },
    {
      title: '表達不舒服 / 設立界線',
      icon: '🛡️',
      phrases: [
        '你咁講我會唔舒服，請你唔好再講。',
        '我唔鍾意人未問我就攞我嘅嘢。',
        '我需要少少空間，請你停一停。',
        '如果你想借，可以先問我。'
      ]
    },
    {
      title: '向老師 / 社工求助',
      icon: '🙋',
      phrases: [
        '老師，我想請你幫一幫我。',
        '我而家有少少唔知點處理，可以同你講嗎？',
        '剛才有同學令我不舒服，我想請你協助。',
        '我想冷靜一下，可以去安全位置嗎？'
      ]
    },
    {
      title: '小組合作 / 接受不同意見',
      icon: '🤝',
      phrases: [
        '我有一個簡單想法，想分享一下。',
        '我明白你嘅意思，我哋可唔可以比較兩個方法？',
        '你覺得邊一部分需要改？',
        '咁我負責呢部分，可以嗎？'
      ]
    },
    {
      title: '道歉 / 修補關係',
      icon: '🌱',
      phrases: [
        '對不起，我剛才語氣太急。',
        '我頭先太緊張，所以講得唔清楚。',
        '我想重新講一次，可以嗎？',
        '多謝你提醒我，我下次會留意。'
      ]
    }
  ];

  const extraRealisticSituations = {
    queueJump: {
      card: {
        icon: '🧃',
        title: '小賣部排隊：有人打尖',
        desc: '排隊買食物時有人插隊，學習平靜提醒和找老師協助。'
      },
      badge: { icon: '🧃', name: '排隊守禮者' },
      game: {
        title: '小賣部排隊：有人打尖',
        intro: '情境：小息時你在小賣部排隊買飲品，有同學突然插到你前面。你覺得不公平，但不想和對方吵架。',
        avatar: '🧃',
        role: '小賣部情境',
        mission: '用平靜語氣提醒對方，必要時請老師或職員協助。',
        location: '小賣部／小息',
        socialGoal: '表達公平 + 不升級衝突',
        supportTip: '先講事實，再講請求，避免用侮辱語氣。',
        hint: '可以用短句：「我哋排緊隊，可唔可以排返後面？」',
        calmPrompt: '先深呼吸，提醒自己：「我可以平靜講，不需要大聲鬧。」',
        steps: [
          makeStep('第 1 題：有人突然插到你前面，你第一步最好怎樣做？', [
            ['先停一停，確認對方是否真的插隊', 2, '先看清楚情況，可以避免誤會。'],
            ['用平靜語氣準備提醒對方', 2, '平靜提醒比大聲責罵更安全。'],
            ['立即大聲鬧對方', 0, '大聲責罵容易令衝突升級。'],
            ['用力推開對方', 0, '推人是不安全行為，也可能違反校規。']
          ]),
          makeStep('第 2 題：你可以怎樣提醒對方？', [
            ['我哋排緊隊，可唔可以排返後面？', 2, '這句清楚、有禮貌，也講出規則。'],
            ['不好意思，這裡要排隊。', 2, '簡短而清楚，是合適提醒。'],
            ['你有冇搞錯呀？', 0, '語氣太衝，對方容易防衛。'],
            ['完全不說，但一直很生氣', 1, '沒有衝突，但自己的感受未被處理。']
          ]),
          makeStep('第 3 題：如果對方說「我好趕時間」，你可以怎樣回應？', [
            ['我明白，但大家都排緊隊。', 2, '先表示理解，再堅持規則。'],
            ['如果你真的很急，可以問老師或職員。', 2, '把問題交給合適的大人處理。'],
            ['你趕時間關我咩事？', 0, '這樣容易引起爭吵。'],
            ['之後也跟住插隊', 0, '模仿不合適行為會破壞秩序。']
          ]),
          makeStep('第 4 題：如果對方仍然不理會，你下一步最好是？', [
            ['請當值老師或職員協助', 2, '這是安全而成熟的做法。'],
            ['停止爭論，保持距離', 2, '避免持續爭吵可以保護自己。'],
            ['叫其他同學一起圍住對方', 0, '這可能變成欺凌或群體衝突。'],
            ['一直追著對方罵', 0, '這會令事情更嚴重。']
          ]),
          makeStep('第 5 題：事情過後，你可以怎樣讓自己回復平靜？', [
            ['深呼吸，提醒自己已經用合適方法處理', 2, '這能幫你整理情緒。'],
            ['把注意力放回小息或下一堂課', 2, '把注意力轉回當下是好方法。'],
            ['整天都想著報復', 0, '報復會令情緒更難平復。'],
            ['在網上公開罵對方', 0, '網上辱罵可能造成更大問題。']
          ])
        ]
      }
    },
    peGrouping: {
      card: {
        icon: '🏀',
        title: '體育堂分組：未被邀請',
        desc: '體育堂分組時未被即時邀請，練習主動加入和求助。'
      },
      badge: { icon: '🏀', name: '主動加入者' },
      game: {
        title: '體育堂分組：未被邀請',
        intro: '情境：體育堂分組活動時，幾位同學已經組好隊，你暫時未被邀請。你有點尷尬，也擔心自己會被排除。',
        avatar: '🏀',
        role: '體育堂情境',
        mission: '練習主動加入、接受結果，以及向老師求助。',
        location: '操場／體育堂',
        socialGoal: '主動加入 + 處理尷尬',
        supportTip: '未被即時邀請不一定代表同學討厭你，可能只是大家太快分組。',
        hint: '可以先用簡單句：「我可唔可以加入你哋？」',
        calmPrompt: '提醒自己：「我可以試一次問，唔得就問老師。」',
        steps: [
          makeStep('第 1 題：看到同學已經組隊，你第一步可以怎樣做？', [
            ['先找一組人，用平靜語氣問可否加入', 2, '主動但有禮貌，是好的做法。'],
            ['先觀察哪一組人數未滿', 2, '先觀察能提高成功加入的機會。'],
            ['立即覺得所有人都討厭自己', 0, '這個想法未必有證據，會令自己更難受。'],
            ['生氣地走開不參與', 0, '這會影響課堂參與，也不能解決問題。']
          ]),
          makeStep('第 2 題：你可以怎樣開口？', [
            ['我可唔可以加入你哋呢組？', 2, '簡單、直接、清楚。'],
            ['你哋仲有冇位？我想一齊做活動。', 2, '有禮貌，也講出自己的想法。'],
            ['點解你哋唔預我？', 0, '這句容易令對方有壓力。'],
            ['一直站在旁邊不出聲', 1, '可以先觀察，但最後仍需要開口或求助。']
          ]),
          makeStep('第 3 題：如果對方說已經夠人，你可以怎樣回應？', [
            ['好，唔緊要，我再問另一組。', 2, '接受結果，再找其他方法，很成熟。'],
            ['明白，多謝你話我知。', 2, '這樣能保持關係。'],
            ['你哋一定係唔鍾意我。', 0, '太快下結論會令自己更受傷。'],
            ['用難聽說話罵對方', 0, '這會破壞關係，也可能被老師處理。']
          ]),
          makeStep('第 4 題：如果你問了幾組都未成功，最好怎樣做？', [
            ['向體育老師說：「老師，我仲未有組。」', 2, '清楚向老師求助是合適做法。'],
            ['請老師幫忙安排分組', 2, '老師可以公平處理分組問題。'],
            ['坐在地上不參與', 0, '這會影響課堂，也未能解決問題。'],
            ['故意破壞活動器材', 0, '這是不安全和不合適的行為。']
          ]),
          makeStep('第 5 題：成功加入後，怎樣開始合作？', [
            ['問組員：「我負責邊一部分？」', 2, '主動了解角色，有助合作。'],
            ['先聽組員安排，再投入活動', 2, '這樣能順利加入團隊。'],
            ['因為剛才尷尬，所以全程不合作', 0, '不合作會影響小組活動。'],
            ['一直抱怨剛才沒有人找你', 0, '這會令小組氣氛變差。']
          ])
        ]
      }
    },
    whatsappIgnored: {
      card: {
        icon: '📱',
        title: '班群訊息：沒有人回覆',
        desc: '在班群問功課沒有人即時回覆，練習等待和再次清楚發問。'
      },
      badge: { icon: '📱', name: '冷靜發問者' },
      game: {
        title: '班群訊息：沒有人回覆',
        intro: '情境：你在班群問明天要交甚麼功課，但過了幾分鐘仍然沒有人回覆。你開始擔心是不是大家不想理你。',
        avatar: '📱',
        role: '網上溝通情境',
        mission: '學習等待、清楚發問，以及避免過度解讀。',
        location: '放學後／班群',
        socialGoal: '網上禮貌 + 彈性思考',
        supportTip: '沒有人即時回覆，不一定代表別人不喜歡你。',
        hint: '可以等一等，再用更清楚的句子問一次。',
        calmPrompt: '提醒自己：「可能大家忙緊，唔一定係唔理我。」',
        steps: [
          makeStep('第 1 題：幾分鐘沒有人回覆，你最好先怎樣想？', [
            ['可能大家未睇電話，我可以等一等', 2, '這是彈性和合理的想法。'],
            ['先檢查自己問題是否問得清楚', 2, '清楚發問能增加別人回覆的機會。'],
            ['大家一定是不喜歡我', 0, '這個想法未必有證據。'],
            ['立即連續洗版問十次', 0, '洗版會令其他人有壓力。']
          ]),
          makeStep('第 2 題：如果要再問一次，哪一句最合適？', [
            ['不好意思，想確認一下，明天中文是否要交作業第 5 頁？', 2, '具體問題比較容易得到回覆。'],
            ['請問有沒有人知道明天要交哪份功課？', 2, '有禮貌，也很清楚。'],
            ['點解冇人答我？', 0, '這句容易令別人覺得被責怪。'],
            ['你哋全部都唔幫人。', 0, '這是批評，容易造成衝突。']
          ]),
          makeStep('第 3 題：如果仍然沒有人回覆，你可以怎樣做？', [
            ['查看手冊、Google Classroom 或老師通告', 2, '先用其他方法查資料很實用。'],
            ['私訊一位較熟的同學，禮貌詢問', 2, '私訊熟人可能更容易得到回覆。'],
            ['在群組發怒罵人', 0, '網上發怒會留下紀錄，也會影響關係。'],
            ['完全不做功課，怪同學沒有回覆', 0, '這樣會影響自己的學習責任。']
          ]),
          makeStep('第 4 題：同學之後回覆你，你可以怎樣回應？', [
            ['多謝你，我明白了。', 2, '簡單感謝能保持良好關係。'],
            ['謝謝你回覆，我會記低。', 2, '這樣有禮貌，也表示你收到資訊。'],
            ['你咁遲先覆。', 0, '這樣容易令對方下次不想幫忙。'],
            ['已讀不回，沒有表示感謝', 1, '有收到資訊，但加一句感謝會更好。']
          ]),
          makeStep('第 5 題：下次想減少不確定，可以怎樣做？', [
            ['放學前先在手冊寫清楚功課', 2, '這是很好的自我管理。'],
            ['不明白時即時問老師確認', 2, '即時確認可以減少放學後焦慮。'],
            ['每次都等別人提醒自己', 0, '太依賴別人會令自己更被動。'],
            ['因為怕問錯，以後都不問', 0, '不問會令問題累積。']
          ])
        ]
      }
    },
    borrowedNoReturn: {
      card: {
        icon: '✏️',
        title: '借物品未還：清楚提醒',
        desc: '同學借了文具或物品未還，學習用平靜方式提醒。'
      },
      badge: { icon: '✏️', name: '界線提醒者' },
      game: {
        title: '借物品未還：清楚提醒',
        intro: '情境：昨天同學向你借了一支筆，今天仍未還。你想取回物品，但又怕開口會尷尬。',
        avatar: '✏️',
        role: '借還物品情境',
        mission: '清楚提醒對方還物品，同時保持禮貌。',
        location: '課室／小息',
        socialGoal: '清楚請求 + 保持關係',
        supportTip: '提醒還物品不是不禮貌，重點是語氣平靜。',
        hint: '可以說：「你昨天借咗我支筆，今日可唔可以還返？」',
        calmPrompt: '心裡說：「我只是提醒，不是責罵。」',
        steps: [
          makeStep('第 1 題：你想取回筆，第一步最好是？', [
            ['找合適時間，平靜提醒對方', 2, '選擇合適時間能減少尷尬。'],
            ['先想好一句簡單句子再開口', 2, '預備句子能幫助表達更清楚。'],
            ['突然搶回對方手上的筆', 0, '搶東西容易造成衝突。'],
            ['一直忍住不說，但心裡很生氣', 1, '沒有衝突，但自己的需要沒有被表達。']
          ]),
          makeStep('第 2 題：哪一句提醒最合適？', [
            ['你昨天借咗我支筆，今日可唔可以還返俾我？', 2, '清楚講出事情和請求。'],
            ['我今日需要用返支筆，可以還返俾我嗎？', 2, '這句有禮貌，也說明需要。'],
            ['你係咪想偷我支筆？', 0, '未有證據就指責對方，容易引起衝突。'],
            ['算啦，我以後都唔理你', 0, '這樣沒有解決問題，也會傷害關係。']
          ]),
          makeStep('第 3 題：如果對方忘記帶回來，你可以怎樣回應？', [
            ['明白，咁你明天記得還俾我，可以嗎？', 2, '給對方機會，也清楚定下時間。'],
            ['不如你寫低提醒自己明天還？', 2, '這是具體解決方法。'],
            ['你成日都係咁，真係好煩。', 0, '這是批評，容易令對方不舒服。'],
            ['立刻向全班說他不還東西', 0, '公開羞辱會令事情變大。']
          ]),
          makeStep('第 4 題：如果同學多次不還，你可以怎樣做？', [
            ['告訴老師，請老師協助處理', 2, '多次不還時，找老師協助是合理的。'],
            ['下次借物品前先說清楚何時要還', 2, '預先定規則能保護自己。'],
            ['自己偷拿對方物品作補償', 0, '這是不合適和不誠實的做法。'],
            ['找朋友一起威脅對方', 0, '威脅會令事情更嚴重。']
          ]),
          makeStep('第 5 題：下次借物品給別人前，可以怎樣做？', [
            ['先想清楚自己是否願意借', 2, '你有權決定是否借出自己的物品。'],
            ['講清楚：「小息後請還返俾我。」', 2, '清楚規則能減少誤會。'],
            ['不管對方是誰都一定借', 0, '不懂拒絕可能令自己不舒服。'],
            ['以後任何人問都大聲拒絕', 0, '拒絕也可以有禮貌，不需要大聲。']
          ])
        ]
      }
    },
    academicQuestionOnly: {
      card: {
        icon: '📘',
        title: 'AI 學習助手：只問學業問題',
        desc: '使用校園學習助手時，練習把問題集中在學業和學校生活。'
      },
      badge: { icon: '📘', name: '學習提問者' },
      game: {
        title: 'AI 學習助手：只問學業問題',
        intro: '情境：你正在使用學校提供的學習助手。老師提醒大家，這個工具主要用來問學業、功課、溫習和校園社交練習，不應問無關或不合適內容。',
        avatar: '📘',
        role: '學習工具情境',
        mission: '學習分辨哪些問題適合在學校學習工具中提出。',
        location: '課室／電腦室',
        socialGoal: '遵守規則 + 清楚提問',
        supportTip: '好的問題通常和課業、學習方法、功課要求或校園情境有關。',
        hint: '可以先問自己：「呢個問題同學習有冇關？」',
        calmPrompt: '如果不肯定，可以先問老師：「呢個問題適合問嗎？」',
        steps: [
          makeStep('第 1 題：哪一類問題最適合問學習助手？', [
            ['英文作文怎樣改善開首句？', 2, '這是明確的學業問題。'],
            ['數學這題可以怎樣一步一步理解？', 2, '這能幫助學習，是合適問題。'],
            ['問同學私人的秘密', 0, '涉及別人私隱，不適合。'],
            ['要求助手取笑某位同學', 0, '這是不尊重和不合適的使用方式。']
          ]),
          makeStep('第 2 題：如果你想問校園社交問題，哪一句最合適？', [
            ['小組討論時，我可以怎樣禮貌加入？', 2, '這是有助改善校園社交的問題。'],
            ['被提醒時，我可以怎樣冷靜回應？', 2, '這和校園生活及情緒管理有關。'],
            ['怎樣令同學難堪？', 0, '這會傷害別人，不合適。'],
            ['幫我寫一句罵人的說話', 0, '這不符合學習和尊重他人的目的。']
          ]),
          makeStep('第 3 題：如果問題涉及同學個人資料，你應該怎樣做？', [
            ['避免寫出同學全名或私人資料', 2, '保護私隱是重要規則。'],
            ['用一般描述代替真實姓名', 2, '例如「有一位同學」會較安全。'],
            ['把同學電話和地址寫出來', 0, '這是嚴重私隱問題。'],
            ['要求 AI 幫忙公開同學資料', 0, '這是不安全和不尊重的做法。']
          ]),
          makeStep('第 4 題：如果 AI 回答和老師要求不同，你最好怎樣做？', [
            ['以老師課堂要求為準', 2, '學校功課應以老師指示為準。'],
            ['禮貌問老師確認', 2, '確認要求可以避免做錯方向。'],
            ['完全不理老師，只信 AI', 0, 'AI 可能有錯，不能代替老師指示。'],
            ['在班上說老師一定錯', 0, '這會造成不必要衝突。']
          ]),
          makeStep('第 5 題：怎樣問問題最清楚？', [
            ['說出科目、題目要求和自己不明白的地方', 2, '資料越清楚，回答越有用。'],
            ['請它一步一步解釋，而不是直接給答案', 2, '這樣更能幫助真正學習。'],
            ['只打「幫我」兩個字', 0, '太模糊，助手很難知道你需要甚麼。'],
            ['叫它直接幫你作弊', 0, '這不符合學習目的，也不誠實。']
          ])
        ]
      }
    }
  };

  function makeStep(prompt, optionRows) {
    return {
      prompt,
      options: optionRows.map(([text, score, note]) => ({ text, score, note }))
    };
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function getUpgradeState() {
    try {
      return JSON.parse(localStorage.getItem(UPGRADE_STORAGE_KEY)) || { difficulty: 'normal' };
    } catch (error) {
      return { difficulty: 'normal' };
    }
  }

  function saveUpgradeState(nextState) {
    const merged = Object.assign(getUpgradeState(), nextState || {});
    localStorage.setItem(UPGRADE_STORAGE_KEY, JSON.stringify(merged));
    return merged;
  }

  function getDifficultyLabel(value) {
    if (value === 'easy') return 'Level 1 簡單模式';
    if (value === 'challenge') return 'Level 3 挑戰模式';
    return 'Level 2 標準模式';
  }

  window.setSocialDifficulty = function (level) {
    const state = saveUpgradeState({ difficulty: level });
    applyDifficultyUI();
    showToastSafe('已切換至：' + getDifficultyLabel(state.difficulty), 'success');
  };

  function applyDifficultyUI() {
    const state = getUpgradeState();
    document.querySelectorAll('[data-difficulty-button]').forEach((button) => {
      button.classList.toggle('difficulty-active', button.dataset.difficultyButton === state.difficulty);
    });

    const label = document.getElementById('difficultyCurrentLabel');
    if (label) label.textContent = getDifficultyLabel(state.difficulty);

    const hintButton = Array.from(document.querySelectorAll('#gameScreen .action-row button')).find((button) => button.textContent.includes('看看提示'));
    if (hintButton) {
      hintButton.style.display = state.difficulty === 'challenge' ? 'none' : '';
    }
  }

  function injectDifficultySettings() {
    if (document.getElementById('difficultySettingsCard')) return;
    const grid = document.querySelector('#settingsScreen .settings-grid');
    if (!grid) return;

    grid.insertAdjacentHTML('beforeend', `
      <div class="settings-card" id="difficultySettingsCard">
        <h3>練習難度</h3>
        <p class="small">不同能力的學生可以用不同模式練習。</p>
        <div class="difficulty-status">目前：<strong id="difficultyCurrentLabel">Level 2 標準模式</strong></div>
        <div class="settings-buttons difficulty-buttons">
          <button class="secondary" data-difficulty-button="easy" onclick="setSocialDifficulty('easy')">Level 1 簡單</button>
          <button class="secondary" data-difficulty-button="normal" onclick="setSocialDifficulty('normal')">Level 2 標準</button>
          <button class="secondary" data-difficulty-button="challenge" onclick="setSocialDifficulty('challenge')">Level 3 挑戰</button>
        </div>
        <p class="small difficulty-help">簡單模式會給更多句式提示；挑戰模式會先隱藏提示按鈕，鼓勵學生自行判斷。</p>
      </div>
    `);
    applyDifficultyUI();
  }

  function injectSentenceLibraryScreen() {
    if (document.getElementById('sentenceLibraryScreen')) return;
    const card = document.querySelector('.card');
    if (!card) return;

    const groupsHtml = phraseGroups.map((group) => `
      <div class="phrase-card">
        <div class="phrase-title"><span>${escapeHtml(group.icon)}</span><strong>${escapeHtml(group.title)}</strong></div>
        <div class="phrase-list">
          ${group.phrases.map((phrase) => `
            <button type="button" class="phrase-chip" onclick="copySocialPhrase('${escapeHtml(phrase).replace(/'/g, '&#039;')}')">${escapeHtml(phrase)}</button>
          `).join('')}
        </div>
      </div>
    `).join('');

    card.insertAdjacentHTML('beforeend', `
      <div id="sentenceLibraryScreen" class="screen welcome-screen">
        <div class="hero-card animate-in">
          <div class="tag">社交句式庫</div>
          <div class="hero-avatar">💬</div>
          <h2>社交句式庫</h2>
          <p>這裡收集了學生可以在梁書校園生活中使用的安全、禮貌、清楚句式。按一句可以複製。</p>
          <div class="phrase-library-grid">${groupsHtml}</div>
          <div class="welcome-actions">
            <button class="secondary" onclick="showCoverScreen()">返回開始頁</button>
            <button onclick="showSituationScreen()">前往情境選擇</button>
            <button class="secondary" onclick="showSettingsScreen()">我的設定</button>
          </div>
        </div>
      </div>
    `);
  }

  window.copySocialPhrase = function (phrase) {
    const text = String(phrase || '').replace(/&#039;/g, "'");
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => showToastSafe('已複製句式', 'success'));
    } else {
      showToastSafe(text, 'success');
    }
  };

  window.showSentenceLibraryScreen = function () {
    injectSentenceLibraryScreen();
    document.querySelectorAll('.screen').forEach((screen) => screen.classList.remove('active'));
    const screen = document.getElementById('sentenceLibraryScreen');
    if (screen) screen.classList.add('active');
    if (typeof appState !== 'undefined' && appState) appState.currentScreen = 'sentenceLibrary';
    window.scrollTo({ top: 0, behavior: document.body.classList.contains('reduced-motion') ? 'auto' : 'smooth' });
  };

  function injectSentenceLibraryButtons() {
    const containers = [
      document.querySelector('#coverScreen .menu-actions'),
      document.querySelector('#situationScreen .welcome-actions'),
      document.querySelector('#badgeScreen .welcome-actions'),
      document.querySelector('#gameScreen .welcome-actions')
    ];

    containers.forEach((container) => {
      if (!container || container.querySelector('[data-sentence-library-button]')) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'secondary';
      button.dataset.sentenceLibraryButton = 'true';
      button.textContent = '社交句式庫';
      button.onclick = window.showSentenceLibraryScreen;
      container.appendChild(button);
    });
  }

  function registerMoreScenarios() {
    try {
      window.EXTRA_SCENARIO_TOTAL = 18;
      window.extraSituations = Object.assign({}, window.extraSituations || {}, extraRealisticSituations);

      Object.keys(extraRealisticSituations).forEach((key) => {
        const item = extraRealisticSituations[key];
        if (typeof badgeState !== 'undefined' && !(key in badgeState)) badgeState[key] = false;
        if (typeof badgeMeta !== 'undefined') badgeMeta[key] = item.badge;
        if (typeof asdGames !== 'undefined') asdGames[key] = item.game;
      });

      if (typeof refreshExtraScenarioUI === 'function') refreshExtraScenarioUI();
      const status = document.getElementById('gameStatusText');
      if (status) status.textContent = status.textContent.replace(/\/\s*13/g, '/ 18').replace(/\/\s*8/g, '/ 18');
    } catch (error) {
      console.warn('未能加入新增情境：', error);
    }
  }

  function getActiveGameByText() {
    try {
      const boxText = (document.getElementById('asdBox')?.innerText || '') + ' ' + (document.getElementById('questionTrackerTitle')?.innerText || '');
      const games = typeof asdGames !== 'undefined' ? asdGames : {};
      return Object.keys(games).map((key) => ({ key, game: games[key] })).find(({ game }) => {
        return game && (boxText.includes(game.title) || boxText.includes(game.intro) || boxText.includes(game.socialGoal));
      }) || null;
    } catch (error) {
      return null;
    }
  }

  function findOptionByText(choiceText) {
    const active = getActiveGameByText();
    const games = typeof asdGames !== 'undefined' ? asdGames : {};
    const searchGames = active ? [active] : Object.keys(games).map((key) => ({ key, game: games[key] }));
    const cleanChoice = String(choiceText || '').replace(/^[A-D][\.、\s]*/i, '').trim();

    for (const { key, game } of searchGames) {
      for (let stepIndex = 0; stepIndex < (game.steps || []).length; stepIndex++) {
        const step = game.steps[stepIndex];
        const option = (step.options || []).find((item) => cleanChoice.includes(item.text) || item.text.includes(cleanChoice));
        if (option) return { key, game, step, stepIndex, option };
      }
    }
    return null;
  }

  function buildAfterAnswerExplanation(match) {
    const option = match.option || {};
    const difficulty = getUpgradeState().difficulty;
    const quality = option.score >= 2 ? '這是一個安全而合適的選擇。' : option.score === 1 ? '這個選擇有部分合適，但仍可以更清楚或更有禮貌。' : '這個選擇可能令情況升級，需要改用更安全的做法。';
    const feeling = option.score >= 2 ? '對方通常會較容易理解你，也較不容易感到被攻擊。' : option.score === 1 ? '對方可能明白你的意思，但也可能覺得不夠清楚。' : '對方可能會覺得被責怪、被威脅或不被尊重。';
    const next = option.score >= 2 ? '下次可以繼續使用這類「清楚 + 平靜 + 有禮貌」的句式。' : '下次可以先停一停，再用「我感到……，我希望……」的句式表達。';
    const sentence = option.score >= 2 ? option.text : pickRepairSentence(match.game);
    const difficultyTip = difficulty === 'easy'
      ? '<div class="answer-explain-tip"><strong>簡單提示：</strong>記住三步：停一停 → 講感受 → 講需要。</div>'
      : difficulty === 'challenge'
        ? '<div class="answer-explain-tip"><strong>挑戰反思：</strong>你覺得這個選擇會令對方有甚麼感受？</div>'
        : '';

    return `
      <div class="answer-explain-card ${option.score >= 2 ? 'answer-good' : option.score === 1 ? 'answer-ok' : 'answer-risk'}">
        <strong>🧠 選項解釋</strong>
        <div><strong>為甚麼：</strong>${escapeHtml(quality)} ${escapeHtml(option.note || '')}</div>
        <div><strong>對方可能感受：</strong>${escapeHtml(feeling)}</div>
        <div><strong>下次可以：</strong>${escapeHtml(next)}</div>
        <div><strong>可背句式：</strong><span class="memory-sentence">${escapeHtml(sentence)}</span></div>
        ${difficultyTip}
      </div>
    `;
  }

  function pickRepairSentence(game) {
    const goal = (game && game.socialGoal ? game.socialGoal : '') + ' ' + (game && game.title ? game.title : '');
    if (/拒絕|邀請/.test(goal)) return '多謝你邀請我，但我而家想休息一陣。';
    if (/衝突|界線|取笑|借|還/.test(goal)) return '你咁做我會唔舒服，請你停一停。';
    if (/老師|求助|指正/.test(goal)) return '老師，我想請你幫一幫我。';
    if (/合作|小組|意見/.test(goal)) return '我明白你的想法，我也想補充一點。';
    return '我想冷靜一下，再慢慢講。';
  }

  function installAfterAnswerWatcher() {
    const choices = document.getElementById('asdChoices');
    if (!choices || choices.__afterAnswerWatcherInstalled) return;

    choices.addEventListener('click', function (event) {
      const button = event.target.closest('button');
      if (!button) return;
      const choiceText = button.innerText || button.textContent || '';
      const match = findOptionByText(choiceText);
      if (!match) return;

      setTimeout(() => {
        const box = document.getElementById('reviewBoxInline') || document.getElementById('asdBox');
        if (!box) return;
        box.classList.remove('hidden');
        const existing = box.querySelector('.answer-explain-card');
        if (existing) existing.remove();
        box.insertAdjacentHTML('beforeend', buildAfterAnswerExplanation(match));
      }, 180);
    }, true);

    choices.__afterAnswerWatcherInstalled = true;
  }

  function injectUpgradeStyles() {
    if (document.getElementById('socialUpgradeStyles')) return;
    const style = document.createElement('style');
    style.id = 'socialUpgradeStyles';
    style.textContent = `
      .phrase-library-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px;margin-top:18px;text-align:left}.phrase-card{background:var(--panel);border:1px solid var(--border);border-radius:18px;padding:16px}.phrase-title{display:flex;gap:8px;align-items:center;margin-bottom:10px}.phrase-list{display:grid;gap:8px}.phrase-chip{background:#fff;color:var(--text);border:1px solid var(--border);box-shadow:none;text-align:left;font-weight:500}.phrase-chip:hover{background:#f4f7ff;color:var(--text)}.difficulty-status{background:#f7faff;border:1px solid var(--border);border-radius:12px;padding:10px;margin:10px 0}.difficulty-buttons button.difficulty-active{background:var(--primary);color:#fff;border-color:var(--primary)}.answer-explain-card{margin-top:14px;border-radius:14px;padding:13px;display:grid;gap:7px;text-align:left;border:1px solid var(--border)}.answer-good{background:#effcf4;border-left:5px solid var(--success)}.answer-ok{background:#fff8ed;border-left:5px solid var(--warning)}.answer-risk{background:#fef2f2;border-left:5px solid var(--danger)}.memory-sentence{display:inline-block;margin-top:4px;background:#fff;border:1px solid var(--border);border-radius:999px;padding:4px 10px}.answer-explain-tip{background:rgba(255,255,255,.72);border-radius:10px;padding:8px;margin-top:4px}.scenario-card[id^="scenarioCard-queueJump"],.scenario-card[id^="scenarioCard-peGrouping"],.scenario-card[id^="scenarioCard-whatsappIgnored"],.scenario-card[id^="scenarioCard-borrowedNoReturn"],.scenario-card[id^="scenarioCard-academicQuestionOnly"]{border-color:#bfd3ff;background:linear-gradient(180deg,#fff,#f4f8ff)}
    `;
    document.head.appendChild(style);
  }

  function showToastSafe(message, type) {
    if (typeof showToast === 'function') {
      showToast(message, type || 'success');
    } else {
      console.log(message);
    }
  }

  function patchNavigationRefresh() {
    ['showCoverScreen', 'showSituationScreen', 'showSettingsScreen', 'showBadgeScreen'].forEach((name) => {
      const original = window[name];
      if (typeof original !== 'function' || original.__socialUpgradePatched) return;
      window[name] = function (...args) {
        const result = original.apply(this, args);
        setTimeout(initSocialUpgrades, 0);
        return result;
      };
      window[name].__socialUpgradePatched = true;
    });
  }

  function initSocialUpgrades() {
    injectUpgradeStyles();
    injectSentenceLibraryScreen();
    injectSentenceLibraryButtons();
    injectDifficultySettings();
    registerMoreScenarios();
    installAfterAnswerWatcher();
    applyDifficultyUI();
  }

  window.initSocialUpgrades = initSocialUpgrades;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSocialUpgrades);
  } else {
    initSocialUpgrades();
  }

  setTimeout(initSocialUpgrades, 300);
  setTimeout(initSocialUpgrades, 900);
  patchNavigationRefresh();
})();
