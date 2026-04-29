// /extra-scenarios-add3.js
// Adds 3 new non-overlapping 梁書校園社交練習 scenarios.
// Target active total: 20 scenarios after cleanup removes duplicate scenarios.
// No MutationObserver. No interval. Only a few safe delayed passes.

(function () {
  function step(prompt, rows) {
    return {
      prompt,
      options: rows.map(function (row) {
        return { text: row[0], score: row[1], note: row[2] };
      })
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

  const newScenarios = {
    copyHomework: {
      card: {
        icon: '📝',
        title: '同學叫你借功課：拒絕抄襲',
        desc: '同學想抄你的功課時，學習堅定但有禮貌地拒絕。'
      },
      badge: { icon: '📝', name: '誠實守規者' },
      game: {
        title: '同學叫你借功課：拒絕抄襲',
        intro: '情境：早上回到課室，有同學很急地說：「你可唔可以借功課俾我抄？我唔記得做。」你擔心拒絕會令對方不開心。',
        avatar: '📝',
        role: '功課與誠實情境',
        mission: '學習拒絕不合適要求，同時保留友善關係。',
        location: '課室／早上回校',
        socialGoal: '堅持界線 + 遵守規則',
        supportTip: '拒絕抄功課不是不幫人，可以改為幫對方理解題目。',
        hint: '可以說：「我唔可以俾你抄，但我可以講下點做。」',
        calmPrompt: '先提醒自己：「守規矩比怕尷尬更重要。」',
        steps: [
          step('第 1 題：同學叫你借功課給他抄，你第一步最好怎樣做？', [
            ['先冷靜，想清楚這是不合適的要求', 2, '先分辨要求是否合適，是很重要的一步。'],
            ['用平靜語氣準備拒絕', 2, '拒絕可以有禮貌，不一定要爭吵。'],
            ['馬上把功課交給他抄', 0, '這可能違反校規，也不是真正幫助對方。'],
            ['大聲罵他懶惰', 0, '這會令對方難堪，也容易破壞關係。']
          ]),
          step('第 2 題：哪一句拒絕最合適？', [
            ['我唔可以俾你抄，但我可以講下點做。', 2, '這句既守規矩，又提供合適幫助。'],
            ['我明白你很急，但抄功課唔合適。', 2, '先理解對方，再清楚說出界線。'],
            ['你自己死掂佢啦。', 0, '語氣太傷人。'],
            ['你唔好同我講嘢。', 0, '太絕對，容易令關係變差。']
          ]),
          step('第 3 題：如果同學說「你唔幫我就唔係朋友」，你可以怎樣想？', [
            ['真正幫朋友不一定等於答應所有要求', 2, '這是成熟的想法。'],
            ['我可以堅持界線，同時保持禮貌', 2, '界線和友善可以同時存在。'],
            ['我一定要答應，否則沒朋友', 0, '這是過度擔心，會令自己很大壓力。'],
            ['他這樣說，我就要報復', 0, '報復會令情況更差。']
          ]),
          step('第 4 題：你可以提供哪一種合適幫助？', [
            ['解釋其中一題的做法', 2, '這是幫助學習，不是抄襲。'],
            ['提醒他小息時問老師可否補交', 2, '這是負責任的建議。'],
            ['幫他改名交你的功課', 0, '這是不誠實的做法。'],
            ['叫其他同學一起給他抄', 0, '這會令更多人違反規則。']
          ]),
          step('第 5 題：如果對方仍然不斷要求，你下一步可以怎樣做？', [
            ['重複一次界線：「我唔可以俾你抄。」', 2, '重複界線可以清楚表達立場。'],
            ['必要時告訴老師或班主任', 2, '如果壓力持續，找成人協助是合適的。'],
            ['因為怕麻煩，最後還是給他抄', 0, '這會令自己承受不必要風險。'],
            ['把事情放上班群公開責罵他', 0, '公開羞辱會令事情變大。']
          ])
        ]
      }
    },

    quietSpace: {
      card: {
        icon: '🌿',
        title: '小息太嘈：需要安靜空間',
        desc: '小息環境太嘈時，學習表達需要和安全離開。'
      },
      badge: { icon: '🌿', name: '安靜調節者' },
      game: {
        title: '小息太嘈：需要安靜空間',
        intro: '情境：小息時課室很嘈，有同學在附近大聲說笑。你覺得耳朵和心情都很辛苦，想找一個安靜的位置冷靜一下。',
        avatar: '🌿',
        role: '感官調節情境',
        mission: '學習表達自己需要，並用安全方法調節情緒。',
        location: '課室／小息',
        socialGoal: '表達需要 + 自我調節',
        supportTip: '需要安靜不等於不合群，而是照顧自己的狀態。',
        hint: '可以說：「我而家有少少辛苦，想安靜一陣。」',
        calmPrompt: '先慢慢吸氣，再慢慢呼氣，提醒自己可以找安全位置。',
        steps: [
          step('第 1 題：你覺得環境太嘈，第一步最好怎樣做？', [
            ['先留意自己的身體感覺和情緒', 2, '知道自己開始不舒服，是自我管理的第一步。'],
            ['深呼吸，準備用簡短句子表達需要', 2, '先穩定自己再說話會更清楚。'],
            ['立即大叫叫大家收聲', 0, '大叫可能令氣氛更緊張。'],
            ['用力拍桌子發洩', 0, '這會嚇到別人，也不安全。']
          ]),
          step('第 2 題：你可以怎樣向附近同學表達？', [
            ['我而家有少少辛苦，想安靜一陣。', 2, '這句清楚表達自己的需要。'],
            ['我需要去安靜少少嘅地方冷靜一下。', 2, '這句具體說明你想怎樣做。'],
            ['你哋好嘈，全部停啦！', 0, '這句像命令，容易引起衝突。'],
            ['完全不說，突然衝出課室', 1, '離開可能有幫助，但最好用安全方式和告知老師。']
          ]),
          step('第 3 題：如果你想離開課室冷靜，最好怎樣做？', [
            ['先告訴老師或當值老師', 2, '讓老師知道你在哪裡，會更安全。'],
            ['去指定或安全的位置，例如老師附近', 2, '選擇安全位置很重要。'],
            ['跑去沒有人知道的地方', 0, '這樣老師可能擔心你的安全。'],
            ['直接離開學校', 0, '這是不安全，也違反校園規則。']
          ]),
          step('第 4 題：如果同學說「你咁都怕嘈？」你可以怎樣回應？', [
            ['我對聲音比較敏感，我休息一陣就可以。', 2, '簡單解釋自己的情況，不需要爭辯。'],
            ['我唔係怪你哋，只係我需要安靜一下。', 2, '這能減少誤會。'],
            ['你先有問題。', 0, '這是反擊，容易令衝突升級。'],
            ['之後完全不和他說話', 0, '太絕對，未必有助關係。']
          ]),
          step('第 5 題：冷靜後，你可以怎樣回到活動？', [
            ['等情緒穩定後，再慢慢回課室', 2, '按自己的狀態回去，是好的做法。'],
            ['如果仍然不舒服，告訴老師需要多一點時間', 2, '清楚告訴老師能得到合適支援。'],
            ['因為剛才不舒服，之後整天不理任何人', 0, '可以休息，但不需要完全隔絕所有人。'],
            ['責怪所有同學令你辛苦', 0, '責怪未必能解決問題。']
          ])
        ]
      }
    },

    losingGame: {
      card: {
        icon: '🏆',
        title: '比賽輸了：接受結果',
        desc: '體育或班際活動輸了時，練習處理失望和保持風度。'
      },
      badge: { icon: '🏆', name: '風度參與者' },
      game: {
        title: '比賽輸了：接受結果',
        intro: '情境：體育堂或班際活動中，你很努力參與，但最後你的小組輸了。你覺得很失望，也有點想怪責隊友。',
        avatar: '🏆',
        role: '輸贏與團隊情境',
        mission: '學習接受結果，表達失望，並保持合作關係。',
        location: '操場／體育堂／活動室',
        socialGoal: '情緒控制 + 團隊風度',
        supportTip: '輸了可以失望，但仍然可以用有風度的方式回應。',
        hint: '可以說：「我有少少失望，但大家都盡力了。」',
        calmPrompt: '先深呼吸，提醒自己：「輸贏不是評價我整個人。」',
        steps: [
          step('第 1 題：比賽輸了後，你第一步最好怎樣做？', [
            ['先停一停，讓自己冷靜一下', 2, '失望時先停一停，可以避免衝動說話。'],
            ['提醒自己大家都已經參與和努力', 2, '這能幫你用較公平的角度看事情。'],
            ['立即責怪隊友太差', 0, '責怪會傷害隊友，也破壞團隊關係。'],
            ['把器材丟在地上', 0, '這是不安全，也不合適。']
          ]),
          step('第 2 題：你可以怎樣表達失望？', [
            ['我有少少失望，不過大家都盡力了。', 2, '這句承認感受，也肯定大家努力。'],
            ['今次輸了，下次再試。', 2, '這是正面和有彈性的想法。'],
            ['全部都係你哋害我輸。', 0, '這會令隊友很受傷。'],
            ['我以後都唔玩。', 0, '這是過度反應，會令自己失去練習機會。']
          ]),
          step('第 3 題：如果隊友犯錯，你可以怎樣回應較好？', [
            ['下次我哋可以再夾好啲。', 2, '這句把焦點放在改善，而不是責怪。'],
            ['唔緊要，大家都會有失誤。', 2, '這能保持團隊氣氛。'],
            ['你點解咁都做錯？', 0, '這句容易令對方尷尬和不開心。'],
            ['之後故意不和他同組', 0, '逃避未必能改善合作。']
          ]),
          step('第 4 題：如果對方隊伍很開心慶祝，你可以怎樣做？', [
            ['接受對方開心，自己慢慢平復情緒', 2, '別人慶祝不一定是針對你。'],
            ['可以簡單說：「恭喜。」', 2, '這是有風度的表現。'],
            ['覺得對方一定是在串你', 0, '這個想法未必有證據。'],
            ['走過去罵對方', 0, '這會造成衝突。']
          ]),
          step('第 5 題：活動完結後，最好的反思是？', [
            ['想一件自己做得好的事和一件下次可改善的事', 2, '這是平衡和具體的反思。'],
            ['感謝隊友一起參與', 2, '這有助保持良好關係。'],
            ['只記住自己輸了，整天生氣', 0, '這會令情緒停留太久。'],
            ['把輸的責任全部推給別人', 0, '這不利於成長和合作。']
          ])
        ]
      }
    }
  };

  function registerNewScenariosOnce() {
    if (window.__add3ScenariosRegistered) return;
    window.__add3ScenariosRegistered = true;

    try {
      Object.keys(newScenarios).forEach(function (key) {
        const item = newScenarios[key];
        if (typeof badgeState !== 'undefined' && !(key in badgeState)) badgeState[key] = false;
        if (typeof badgeMeta !== 'undefined') badgeMeta[key] = item.badge;
        if (typeof asdGames !== 'undefined') asdGames[key] = item.game;
      });

      addScenarioCardsOnce();
      if (typeof renderBadges === 'function') renderBadges();
      if (typeof initScenarioImagesLight === 'function') setTimeout(initScenarioImagesLight, 80);
      if (typeof initScenarioFilters === 'function') setTimeout(initScenarioFilters, 120);
      if (typeof syncScenarioTotal === 'function') setTimeout(syncScenarioTotal, 160);
    } catch (error) {
      console.warn('extra-scenarios-add3 failed:', error);
    }
  }

  function addScenarioCardsOnce() {
    const grid = document.querySelector('.scenario-select-grid');
    if (!grid) return;

    Object.keys(newScenarios).forEach(function (key) {
      if (document.getElementById('scenarioCard-' + key)) return;
      const card = newScenarios[key].card;
      const html = '<div class="scenario-card" id="scenarioCard-' + escapeHtml(key) + '">' +
        '<div class="emoji">' + escapeHtml(card.icon) + '</div>' +
        '<strong>' + escapeHtml(card.title) + '</strong>' +
        '<div class="small">' + escapeHtml(card.desc) + '</div>' +
        '<button onclick="startAsdGame(\'' + escapeHtml(key) + '\')">開始這個情境</button>' +
        '</div>';
      grid.insertAdjacentHTML('beforeend', html);
    });
  }

  window.registerNewAdd3Scenarios = registerNewScenariosOnce;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', registerNewScenariosOnce);
  } else {
    registerNewScenariosOnce();
  }

  setTimeout(registerNewScenariosOnce, 250);
  setTimeout(registerNewScenariosOnce, 900);
})();
