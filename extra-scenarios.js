// /extra-scenarios.js
// 額外校園社交情境集中管理：index.html 只負責畫面，新增情境放在本檔案。

(function () {
  const EXTRA_TOTAL = 13;

  const extraSituations = {
          teasing: {
            card: { icon: '🛡️', title: '被同學取笑：保持冷靜', desc: '被同學取笑或改花名時，學習保護自己和尋求協助。' },
            badge: { icon: '🛡️', name: '冷靜保護者' },
            game: {
              title: '被同學取笑：保持冷靜',
              intro: '情境：小息時，有同學取笑你的說話方式，還有其他同學在旁邊笑。你覺得不舒服，但又不知道應該怎樣回應。',
              avatar: '🛡️', role: '被取笑情境', mission: '保持安全，清楚表達感受，必要時向老師求助。',
              location: '小息／走廊', socialGoal: '保護自己 + 不升級衝突', supportTip: '可以用短句表達不舒服，再離開或求助。',
              hint: '不用用同樣方式取笑對方，先保護自己最重要。', calmPrompt: '先深呼吸，心裡說：「我可以冷靜處理，唔需要即刻反擊。」',
              steps: [
                { prompt: '第 1 題：聽到同學取笑你時，第一步怎樣比較安全？', options: [
                  { text: '先停一停，讓自己冷靜一下', score: 2, note: '先穩定情緒，可以避免衝突升級。' },
                  { text: '望向對方，平靜地準備回應', score: 2, note: '這樣能表達你有聽到，但沒有失控。' },
                  { text: '立即大聲罵回對方', score: 0, note: '這樣容易變成爭吵，甚至被老師處理。' },
                  { text: '推開對方或想打人', score: 0, note: '身體衝突很危險，也有機會違反校規。' }
                ]},
                { prompt: '第 2 題：你可以怎樣清楚表達感受？', options: [
                  { text: '你咁講我會唔舒服，請你唔好再講。', score: 2, note: '清楚、有界線，也沒有攻擊對方。' },
                  { text: '我不喜歡你這樣取笑我。', score: 2, note: '直接表達感受是好的做法。' },
                  { text: '你先最奇怪。', score: 0, note: '這是反擊，容易令情況更差。' },
                  { text: '一直忍住，什麼都不做', score: 1, note: '有時先忍耐可以保護自己，但長期被取笑要尋求協助。' }
                ]},
                { prompt: '第 3 題：如果對方繼續取笑，下一步最好是？', options: [
                  { text: '離開現場，去找老師或社工協助', score: 2, note: '知道何時求助，是成熟和安全的做法。' },
                  { text: '去到較安全的位置，例如老師附近', score: 2, note: '先讓自己離開壓力位置很重要。' },
                  { text: '跟對方鬥罵，看誰更大聲', score: 0, note: '這會令衝突升級，也可能違反課室／校園規則。' },
                  { text: '之後找機會報復', score: 0, note: '報復會令事情更嚴重。' }
                ]},
                { prompt: '第 4 題：向老師說明時，哪一句最清楚？', options: [
                  { text: '老師，剛才有同學取笑我，我覺得不舒服，想請你幫忙。', score: 2, note: '你說明了事情、感受和需要。' },
                  { text: '老師，我想冷靜一下，可以幫我處理嗎？', score: 2, note: '這句簡短又清楚。' },
                  { text: '老師，佢好衰！', score: 1, note: '老師知道你不開心，但最好說清楚發生什麼事。' },
                  { text: '不告訴任何人，自己一直生氣', score: 0, note: '長期收在心裡會令自己更辛苦。' }
                ]},
                { prompt: '第 5 題：事情處理後，你可以怎樣照顧自己？', options: [
                  { text: '做幾次深呼吸，再回到安全的活動', score: 2, note: '這有助情緒慢慢平復。' },
                  { text: '找可信任的人說出感受', score: 2, note: '分享感受可以減少壓力。' },
                  { text: '一直重想剛才的說話，令自己更生氣', score: 0, note: '這會令情緒更難平復。' },
                  { text: '在網上公開罵對方', score: 0, note: '這可能變成另一種衝突，也不安全。' }
                ]}
              ]
            }
          },
          bumped: {
            card: { icon: '🚶', title: '轉堂被撞：控制反應', desc: '轉課室或排隊時被撞到，練習不衝動反應。' },
            badge: { icon: '🚶', name: '冷靜通行者' },
            game: {
              title: '轉堂被撞：控制反應',
              intro: '情境：轉堂時走廊很多人，有同學不小心撞到你，你差點跌倒，心裡很不舒服。',
              avatar: '🚶', role: '走廊情境', mission: '分辨意外和故意，保持安全並用合適方式表達。',
              location: '走廊／樓梯', socialGoal: '情緒控制 + 安全表達', supportTip: '先確認自己是否安全，再用短句表達。',
              hint: '被撞到會不開心，但未必代表對方是故意的。', calmPrompt: '先站穩，吸一口氣，確認自己有沒有受傷。',
              steps: [
                { prompt: '第 1 題：被撞到後，第一步最應該做什麼？', options: [
                  { text: '先站穩，看看自己有沒有受傷', score: 2, note: '安全永遠是第一步。' },
                  { text: '先停一停，不立刻反擊', score: 2, note: '這能避免一時衝動。' },
                  { text: '立即推回對方', score: 0, note: '推人可能造成危險，也可能違反校規。' },
                  { text: '大聲鬧對方阻住晒', score: 0, note: '大聲責罵容易令衝突升級。' }
                ]},
                { prompt: '第 2 題：如果對方說「唔好意思」，你可以怎樣回應？', options: [
                  { text: '唔緊要，下次小心啲。', score: 2, note: '對方已道歉，這樣回應自然。' },
                  { text: '我差點跌倒，下次請小心。', score: 2, note: '清楚表達影響，也保持禮貌。' },
                  { text: '道歉有咩用？', score: 0, note: '這樣容易令對方防衛。' },
                  { text: '不理對方，但心裡一直生氣', score: 1, note: '沒有升級衝突，但情緒可能仍未處理。' }
                ]},
                { prompt: '第 3 題：如果你不確定對方是否故意，最好怎樣想？', options: [
                  { text: '先不要立刻判斷，看看情況', score: 2, note: '這有助你更客觀。' },
                  { text: '可能是人多不小心，我先冷靜', score: 2, note: '這是彈性思考。' },
                  { text: '他一定是故意針對我', score: 0, note: '太快下結論會令情緒更激動。' },
                  { text: '我之後一定要撞返佢', score: 0, note: '報復行為很危險，也可能被記缺點。' }
                ]},
                { prompt: '第 4 題：如果你真的受傷或很害怕，應該怎樣做？', options: [
                  { text: '告訴老師或當值老師', score: 2, note: '受傷或害怕時要找大人協助。' },
                  { text: '去安全位置，請同學幫忙通知老師', score: 2, note: '這樣能照顧安全。' },
                  { text: '忍住不說，繼續上課', score: 1, note: '如果只是很輕微可以，但受傷時應該說出來。' },
                  { text: '直接找對方算帳', score: 0, note: '這樣容易引起衝突。' }
                ]},
                { prompt: '第 5 題：之後轉堂時，怎樣可以減少類似情況？', options: [
                  { text: '靠邊慢慢行，留意前面和旁邊', score: 2, note: '這能提高安全。' },
                  { text: '跟住隊伍，不突然停下', score: 2, note: '這是良好的走廊規則。' },
                  { text: '故意走得很快，撞開別人', score: 0, note: '這樣不安全，也違反校園秩序。' },
                  { text: '因為怕被撞，以後完全不轉堂', score: 0, note: '逃避不能真正解決問題。' }
                ]}
              ]
            }
          },
          disagree: {
            card: { icon: '🧠', title: '意見不同：接受分歧', desc: '小組討論時別人不同意你，學習彈性和合作。' },
            badge: { icon: '🧠', name: '彈性思考者' },
            game: {
              title: '意見不同：接受分歧',
              intro: '情境：小組討論時，你提出了一個想法，但有同學說：「我覺得呢個方法未必得。」你覺得有點失望。',
              avatar: '🧠', role: '小組分歧情境', mission: '學習接受不同意見，並把討論帶回任務。',
              location: '課室／小組活動', socialGoal: '彈性思考 + 合作溝通', supportTip: '不同意不等於否定你這個人。',
              hint: '可以先表示明白，再問對方原因。', calmPrompt: '心裡提醒自己：「佢唔同意我個方法，唔代表佢唔鍾意我。」',
              steps: [
                { prompt: '第 1 題：聽到別人不同意時，第一個反應最好是？', options: [
                  { text: '先停一停，聽對方說原因', score: 2, note: '聆聽能幫助小組合作。' },
                  { text: '提醒自己不同意見是正常的', score: 2, note: '這是很好的彈性思考。' },
                  { text: '立即說「你唔識嘢」', score: 0, note: '否定別人會破壞合作。' },
                  { text: '馬上生氣，不再參與', score: 0, note: '這會令小組更難完成任務。' }
                ]},
                { prompt: '第 2 題：你可以怎樣回應對方？', options: [
                  { text: '我明白，你可唔可以講下原因？', score: 2, note: '這樣有禮貌，也能了解對方想法。' },
                  { text: '你覺得邊一部分需要改？', score: 2, note: '這能把討論拉回任務。' },
                  { text: '算啦，我唔講啦。', score: 1, note: '你避免爭吵，但也放棄了參與。' },
                  { text: '我一定啱，你哋要聽我講。', score: 0, note: '太堅持會令合作困難。' }
                ]},
                { prompt: '第 3 題：如果對方提出另一個方法，你可以怎樣做？', options: [
                  { text: '比較兩個方法的好處和限制', score: 2, note: '這是理性討論。' },
                  { text: '問大家可否把兩個方法合併', score: 2, note: '這是合作和彈性的做法。' },
                  { text: '表面答應，但心裡決定不合作', score: 0, note: '這會影響小組完成任務。' },
                  { text: '不停打斷對方說話', score: 0, note: '打斷別人會令討論不順。' }
                ]},
                { prompt: '第 4 題：如果最後小組沒有用你的方法，你可以怎樣想？', options: [
                  { text: '今次不用我的方法，不代表我的想法沒有價值', score: 2, note: '這是健康的想法。' },
                  { text: '我可以下次再提出其他想法', score: 2, note: '這能保持參與感。' },
                  { text: '他們一定是不喜歡我', score: 0, note: '這個想法未必有證據，會令自己更難受。' },
                  { text: '以後小組活動我都不做', score: 0, note: '這是逃避，不能提升合作能力。' }
                ]},
                { prompt: '第 5 題：討論結束前，你最好的行動是？', options: [
                  { text: '確認自己負責哪一部分', score: 2, note: '清楚分工有助完成任務。' },
                  { text: '說「咁我負責呢部分，可以嗎？」', score: 2, note: '主動參與是很好的表現。' },
                  { text: '因為不開心，所以什麼都不做', score: 0, note: '這會影響小組合作。' },
                  { text: '故意拖慢小組進度', score: 0, note: '這是破壞合作，也可能違反課堂規則。' }
                ]}
              ]
            }
          },
          teacherReminder: {
            card: { icon: '📋', title: '老師提醒：接受指正', desc: '被老師提醒違規或未守規則時，學習承認和修正。' },
            badge: { icon: '📋', name: '守規改進者' },
            game: {
              title: '老師提醒：接受指正',
              intro: '情境：上課時，你因為一直和同學說話，被老師提醒：「請你安靜，留心上課。」你覺得有點尷尬。',
              avatar: '📋', role: '課室規則情境', mission: '學習接受提醒，修正行為，避免後果升級。',
              location: '課室', socialGoal: '接受指正 + 遵守規則', supportTip: '老師提醒行為，不等於否定你這個人。',
              hint: '被提醒時，最重要是停止違規行為，簡短回應，再改正。', calmPrompt: '心裡說：「我可以改返，唔需要頂嘴。」',
              steps: [
                { prompt: '第 1 題：被老師提醒後，第一步最好是？', options: [
                  { text: '停止說話，望向老師或課本', score: 2, note: '你立即修正行為，這是最重要的。' },
                  { text: '小聲說「知道」然後安靜', score: 2, note: '簡短回應並改正，是合適做法。' },
                  { text: '大聲說「我冇呀！」', score: 0, note: '頂嘴可能令事情升級。' },
                  { text: '繼續和同學說話', score: 0, note: '繼續違規可能導致老師進一步處理。' }
                ]},
                { prompt: '第 2 題：如果你覺得尷尬，可以怎樣處理？', options: [
                  { text: '先深呼吸，提醒自己現在改正就可以', score: 2, note: '這有助你穩定情緒。' },
                  { text: '把注意力放回課堂任務', score: 2, note: '回到任務能減少尷尬感。' },
                  { text: '用說笑掩飾尷尬，繼續引同學笑', score: 0, note: '這可能再次破壞課堂秩序。' },
                  { text: '生氣地拍桌子', score: 0, note: '這是不安全和不合適的反應。' }
                ]},
                { prompt: '第 3 題：如果你不明白自己錯在哪裡，可以怎樣做？', options: [
                  { text: '下課後禮貌問老師：「我想知道剛才哪裡要改善？」', score: 2, note: '下課後問，時間較合適。' },
                  { text: '先完成課堂，之後再查問', score: 2, note: '這樣不會打斷課堂。' },
                  { text: '上課中一直爭論', score: 0, note: '課堂中爭論會影響自己和別人。' },
                  { text: '向旁邊同學抱怨老師', score: 0, note: '這可能再次違反課堂規則。' }
                ]},
                { prompt: '第 4 題：如果老師第二次提醒，你應該怎樣做？', options: [
                  { text: '立即停止，認真改正', score: 2, note: '第二次提醒時更需要馬上改正。' },
                  { text: '簡短道歉：「對不起，我會安靜。」', score: 2, note: '承認和修正能減少後果升級。' },
                  { text: '覺得老師針對自己，故意不聽', score: 0, note: '故意不聽可能導致訓輔跟進或記缺點。' },
                  { text: '叫其他同學一起不聽課', score: 0, note: '影響別人學習是嚴重問題。' }
                ]},
                { prompt: '第 5 題：課後最好的反思是？', options: [
                  { text: '下次想說話前，先看是不是上課時間', score: 2, note: '這是具體改善方法。' },
                  { text: '如果忍不住想說話，可以先寫低，等小息再講', score: 2, note: '這是很實用的自我管理方法。' },
                  { text: '覺得全部都是老師問題', score: 0, note: '這樣很難幫自己改善。' },
                  { text: '下次被提醒就立刻駁嘴', score: 0, note: '駁嘴可能令後果升級，包括被訓輔跟進。' }
                ]}
              ]
            }
          },

  emotionReminder: {
    card: { icon: '🌡️', title: '被提醒後情緒升高：先冷靜', desc: '被班長或同學提醒時，學習處理尷尬、生氣和想即刻理論的衝動。' },
    badge: { icon: '🌡️', name: '冷靜表達者' },
    game: {
      title: '被提醒後情緒升高：先冷靜',
      intro: '情境：早上集隊時，班長提醒一位同學要交周記，並提醒他上課時不要睡覺。這位同學聽後覺得很尷尬和生氣，情緒突然升高，說話聲音變大，樣子很憤怒。老師為了保護大家安全，先安排班長離開現場求助。之後，這位同學仍然很生氣，並堅持要去找班長理論。',
      avatar: '🌡️', role: '情緒升高情境', mission: '學習在被提醒後先冷靜下來，安全表達感受，避免衝突升級。',
      location: '早上操場／612 室', socialGoal: '情緒管理 + 安全表達 + 接受協助', supportTip: '被提醒後覺得尷尬或生氣是可以理解的，但情緒高漲時不適合即時找對方理論。',
      hint: '先停一停、離開刺激位置、找老師協助，比即刻衝去找對方更安全。', calmPrompt: '先深呼吸三次，心裡說：「我而家好嬲，但我可以先停一停，之後再講。」',
      steps: [
        { prompt: '第 1 題：被班長提醒交周記和上課不要睡覺時，你第一個反應怎樣比較安全？', options: [
          { text: '先停一停，留意自己是否開始生氣', score: 2, note: '很好。先察覺自己的情緒，可以避免一時衝動。' },
          { text: '深呼吸一下，先不要即刻大聲回應', score: 2, note: '這是安全做法。情緒升高時，先減慢反應很重要。' },
          { text: '立即大聲罵班長，表示自己很不滿', score: 0, note: '這樣容易令事情升級，也可能令其他同學感到害怕。' },
          { text: '衝向班長，要求他立刻解釋', score: 0, note: '情緒很高時衝向對方是不安全的，可能令對方受驚或受傷。' }
        ]},
        { prompt: '第 2 題：如果你覺得班長當眾提醒你，令你很尷尬，你可以怎樣表達？', options: [
          { text: '我知道你提醒我，但你咁樣講，我會覺得有啲尷尬。', score: 2, note: '很好。你說出了感受，也沒有攻擊對方。' },
          { text: '我而家有啲唔開心，我想先冷靜一下。', score: 2, note: '這句很清楚，能讓老師或同學知道你需要冷靜。' },
          { text: '你憑咩管我？', score: 0, note: '這句容易令對方防衛，衝突可能會升級。' },
          { text: '你再講我就對你唔客氣。', score: 0, note: '威脅式說話不安全，也可能引起訓輔跟進。' }
        ]},
        { prompt: '第 3 題：當你發現自己越來越憤怒，最合適的下一步是什麼？', options: [
          { text: '先去老師附近或安靜位置，讓自己冷靜', score: 2, note: '很好。離開刺激位置有助情緒降溫。' },
          { text: '向老師說：「我而家好嬲，可唔可以畀我冷靜一陣？」', score: 2, note: '這是成熟和安全的求助方式。' },
          { text: '即刻去操場找班長理論', score: 0, note: '情緒高漲時即時面對對方，容易令衝突升級。' },
          { text: '大聲叫其他同學評理', score: 0, note: '把更多人拉入事件，可能令場面更混亂。' }
        ]},
        { prompt: '第 4 題：如果老師暫時不讓你去找班長，你應該怎樣理解？', options: [
          { text: '老師可能是想先確保大家安全', score: 2, note: '正確。分開雙方通常是為了避免衝突升級。' },
          { text: '老師可能見到我情緒很高，所以想我先冷靜', score: 2, note: '很好。這是較客觀和安全的理解。' },
          { text: '老師一定偏幫班長', score: 0, note: '這個想法未必有證據，也會令自己更生氣。' },
          { text: '我應該堅持衝出去，因為我要即刻講清楚', score: 0, note: '即時衝出去不安全，也可能令事件更嚴重。' }
        ]},
        { prompt: '第 5 題：冷靜後，如果你仍然想表達自己的感受，哪一個方法最好？', options: [
          { text: '請老師安排一個合適時間，讓我平靜地說出感受', score: 2, note: '很好。有老師協助時，雙方會較安全和容易溝通。' },
          { text: '平靜地說：「下次可唔可以私下提醒我？我會較容易接受。」', score: 2, note: '這句很好。你提出了具體需要，也沒有攻擊對方。' },
          { text: '私下找班長大聲質問', score: 0, note: '大聲質問容易令對方害怕，也可能再次引起衝突。' },
          { text: '之後在其他同學面前講班長壞話', score: 0, note: '這樣不能解決問題，還可能傷害關係。' }
        ]}
      ]
    }
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

  function registerExtraScenarios() {
    try {
      Object.keys(extraSituations).forEach((key) => {
        const item = extraSituations[key];
        if (typeof badgeState !== 'undefined' && !(key in badgeState)) badgeState[key] = false;
        if (typeof badgeMeta !== 'undefined') badgeMeta[key] = item.badge;
        if (typeof asdGames !== 'undefined') asdGames[key] = item.game;
      });
    } catch (error) {
      console.warn('未能註冊額外情境：', error);
    }
  }

  function addExtraScenarioCards() {
    const grid = document.querySelector('.scenario-select-grid');
    if (!grid) return;

    Object.keys(extraSituations).forEach((key) => {
      if (document.getElementById(`scenarioCard-${key}`)) return;
      const card = extraSituations[key].card || {};
      grid.insertAdjacentHTML(
        'beforeend',
        `<div class="scenario-card" id="scenarioCard-${key}"><div class="emoji">${escapeHtml(card.icon || '🏫')}</div><strong>${escapeHtml(card.title || '校園情境')}</strong><div class="small">${escapeHtml(card.desc || '')}</div><button onclick="startAsdGame('${key}')">開始這個情境</button></div>`
      );
    });
  }

  function normalizeExtraTotalText() {
    const el = document.getElementById('gameStatusText');
    if (el) el.textContent = el.textContent.replace(/\/\s*(8|12|13)/g, `/ ${EXTRA_TOTAL}`);
  }

  function refreshExtraScenarioUI() {
    registerExtraScenarios();
    addExtraScenarioCards();
    normalizeExtraTotalText();
  }

  let originalStartAsdGame = null;
  let activeScenarioKey = null;
  let isCleaningQuestionBox = false;

  function showScreen(screenId, stateName) {
    if (typeof setActiveScreen === 'function') {
      setActiveScreen(screenId, stateName);
      return;
    }
    ['coverScreen', 'badgeScreen', 'settingsScreen', 'situationScreen', 'gameScreen'].forEach((id) => {
      const screen = document.getElementById(id);
      if (screen) screen.classList.toggle('active', id === screenId);
    });
    if (typeof appState !== 'undefined' && appState) appState.currentScreen = stateName;
  }

  function clearSupportBoxes() {
    ['hintBox', 'calmBox', 'reviewBoxInline'].forEach((id) => {
      const box = document.getElementById(id);
      if (box) {
        box.classList.add('hidden');
        box.innerHTML = '';
      }
    });
  }

  function updateTrackerForBackground() {
    const badge = document.getElementById('questionBadgeBig');
    const title = document.getElementById('questionTrackerTitle');
    const tracker = document.getElementById('questionTracker');
    if (badge) badge.textContent = '背景故事';
    if (title) title.textContent = '請先閱讀情境背景，然後才開始答題';
    if (tracker) tracker.classList.add('is-waiting');
    document.querySelectorAll('.question-pill').forEach((pill) => pill.classList.remove('active', 'done'));
  }

  function showBackgroundFirst(key) {
    const game = typeof asdGames !== 'undefined' ? asdGames[key] : null;
    if (!game || !game.intro || !Array.isArray(game.steps)) return false;

    activeScenarioKey = key;
    showScreen('gameScreen', 'game');
    clearSupportBoxes();
    updateTrackerForBackground();

    const box = document.getElementById('asdBox');
    const choices = document.getElementById('asdChoices');
    const sceneMeta = document.getElementById('sceneMeta');

    if (box) {
      box.innerHTML = `
        <div class="scene-badge">${escapeHtml(game.title || '情境背景')}</div>
        <h3 style="margin-bottom:10px;">請先閱讀背景故事</h3>
        <p style="font-size:1.04rem; line-height:1.9; margin-bottom:0;">${escapeHtml(game.intro)}</p>
      `;
    }

    if (sceneMeta) {
      sceneMeta.classList.remove('hidden');
      sceneMeta.innerHTML = `
        <div class="meta-box"><strong>地點：</strong><br>${escapeHtml(game.location || '')}</div>
        <div class="meta-box"><strong>目標：</strong><br>${escapeHtml(game.socialGoal || game.mission || '')}</div>
        <div class="meta-box"><strong>小提醒：</strong><br>${escapeHtml(game.supportTip || '')}</div>
      `;
    }

    if (choices) {
      choices.innerHTML = `
        <button class="choice-button" style="text-align:center; font-weight:800; background:#4f7cff; color:#fff;" onclick="window.startQuestionAfterBackground('${key}')">
          我已閱讀背景，開始答題
        </button>
      `;
    }
    return true;
  }

  window.startQuestionAfterBackground = function (key) {
    if (typeof originalStartAsdGame === 'function') {
      activeScenarioKey = key;
      originalStartAsdGame(key);
      setTimeout(stripBackgroundFromCurrentQuestion, 0);
      setTimeout(stripBackgroundFromCurrentQuestion, 80);
    }
  };

  function getCurrentQuestionIndex(game) {
    const badge = document.getElementById('questionBadgeBig');
    const text = badge ? badge.textContent : '';
    const match = text.match(/第\s*(\d+)/);
    if (match) return Math.max(0, Number(match[1]) - 1);

    const box = document.getElementById('asdBox');
    const boxText = box ? box.textContent : '';
    return game.steps.findIndex((step) => boxText.includes(step.prompt));
  }

  function stripBackgroundFromCurrentQuestion() {
    if (isCleaningQuestionBox || !activeScenarioKey || typeof asdGames === 'undefined') return;
    const game = asdGames[activeScenarioKey];
    const box = document.getElementById('asdBox');
    if (!game || !box || !Array.isArray(game.steps)) return;

    const boxText = box.textContent || '';
    const index = getCurrentQuestionIndex(game);
    if (index < 0 || !game.steps[index]) return;

    const prompt = game.steps[index].prompt;
    const hasBackground = game.intro && boxText.includes(game.intro.slice(0, 14));
    const hasPrompt = boxText.includes(prompt);
    const looksLikeQuestionPage = hasPrompt && boxText.includes('第') && boxText.includes('題');
    if (!hasBackground || !looksLikeQuestionPage) return;

    isCleaningQuestionBox = true;
    box.innerHTML = `
      <div class="scene-badge">${escapeHtml(game.title || '情境練習')}</div>
      <h3 style="font-size:1.2rem; line-height:1.7; margin:0;">${escapeHtml(prompt)}</h3>
    `;
    isCleaningQuestionBox = false;
  }

  function installQuestionCleaner() {
    const box = document.getElementById('asdBox');
    if (!box || box.__backgroundCleanerInstalled) return;
    const observer = new MutationObserver(() => setTimeout(stripBackgroundFromCurrentQuestion, 0));
    observer.observe(box, { childList: true, subtree: true, characterData: true });
    box.__backgroundCleanerInstalled = true;
  }

  function patchStartGameForBackground() {
    if (typeof window.startAsdGame !== 'function' || window.startAsdGame.__backgroundFirstPatched) return;
    originalStartAsdGame = window.startAsdGame;
    const patched = function (key) {
      refreshExtraScenarioUI();
      if (showBackgroundFirst(key)) return;
      return originalStartAsdGame.apply(this, arguments);
    };
    patched.__backgroundFirstPatched = true;
    window.startAsdGame = patched;
  }

  function initExtraScenarios() {
    refreshExtraScenarioUI();
    installQuestionCleaner();
    patchStartGameForBackground();
    setTimeout(() => {
      refreshExtraScenarioUI();
      installQuestionCleaner();
      patchStartGameForBackground();
    }, 100);
  }

  window.registerExtraScenarios = registerExtraScenarios;
  window.addExtraScenarioCards = addExtraScenarioCards;
  window.normalizeExtraTotalText = normalizeExtraTotalText;
  window.refreshExtraScenarioUI = refreshExtraScenarioUI;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initExtraScenarios);
  } else {
    initExtraScenarios();
  }
})();
