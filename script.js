// /script.js
const STORAGE_KEY = 'asd_school_rpg_v5';

const badgeState = {
  start: false,
  refuse: false,
  conflict: false,
  respond: false,
  groupwork: false,
  help: false,
  lunch: false,
  homework: false
};

const badgeMeta = {
  start: { icon: '🗣️', name: '開口勇士' },
  refuse: { icon: '🙅', name: '禮貌拒絕者' },
  conflict: { icon: '🧩', name: '冷靜調解員' },
  respond: { icon: '💬', name: '暖心回應者' },
  groupwork: { icon: '🤝', name: '合作參與者' },
  help: { icon: '🙋', name: '主動求助者' },
  lunch: { icon: '🍱', name: '午飯同伴' },
  homework: { icon: '📚', name: '確認達人' }
};

const appState = {
  speechEnabled: false,
  highContrast: false,
  reducedMotion: false,
  fontModeIndex: 0,
  completedCount: 0,
  hintCount: 0,
  calmCount: 0,
  reviewHistory: [],
  lastJournal: '',
  currentScreen: 'cover'
};

const fontScales = [1, 1.08, 1.16];

const asdGames = {
  start: {
    title: '課室：發起對話',
    intro: '情境：早上回到課室，你看到一位平時較少接觸的同學坐在座位上整理課本。老師還未開始上課，你想試試主動打招呼。',
    avatar: '🗣️',
    role: '課室情境',
    mission: '主動打招呼，開始一段簡單而自然的對話。',
    location: '課室',
    socialGoal: '主動開口 + 延續對話',
    supportTip: '可以先由很簡單的問候或課堂內容開始。',
    hint: '如果你不知道說什麼，可以先說「早晨」或「你好」。',
    calmPrompt: '先吸一口氣，心裡默念一句固定句子，例如：「你好，我想同你打個招呼。」',
    steps: [
      {
        prompt: '第 1 題：你走到座位附近，第一個行動怎樣比較自然？',
        options: [
          { text: '先行近一點，再輕聲說「早晨」', score: 2, note: '這樣自然又有禮貌，是很好的開始。' },
          { text: '先向對方點頭，然後停一停', score: 1, note: '這是安全的開始，但如果再加一句問候會更完整。' },
          { text: '突然大聲叫對方名字', score: 0, note: '這樣可能太突然，容易令對方嚇到。' },
          { text: '直接坐下，一句都不說', score: 0, note: '這樣對方未必知道你想開始交流。' }
        ]
      },
      {
        prompt: '第 2 題：對方看向你了，你第一句可以說什麼？',
        options: [
          { text: '你好，我係阿明，我哋同班。', score: 2, note: '清楚、簡單，對方容易回應。' },
          { text: '你好。', score: 1, note: '這樣不錯，如果再加上介紹會更自然。' },
          { text: '你平時點解咁靜？', score: 0, note: '這句太直接，可能令對方不舒服。' },
          { text: '一直看著對方，等他先說話', score: 0, note: '這樣容易令對話停住。' }
        ]
      },
      {
        prompt: '第 3 題：對方微笑點頭，你可以怎樣延續？',
        options: [
          { text: '你今日上邊一課呀？', score: 2, note: '這是和學校生活有關的簡單問題。' },
          { text: '你今日帶咗咩課本返嚟？', score: 2, note: '內容貼近課室情境，容易繼續。' },
          { text: '我最鍾意講我自己嘅興趣。', score: 1, note: '你想分享自己是好的，但最好先和對方互動。' },
          { text: '立刻不停說自己的事，不停下來', score: 0, note: '這樣可能忽略了雙向交流。' }
        ]
      },
      {
        prompt: '第 4 題：對方簡單回答後，最好怎樣回應？',
        options: [
          { text: '原來係咁，多謝你同我講。', score: 2, note: '這表示你有在聽。' },
          { text: '我明白。', score: 1, note: '這是可以的，但再加一句會更自然。' },
          { text: '哦。', score: 1, note: '有回應，但比較短。' },
          { text: '不再理對方，馬上轉身做自己的事', score: 0, note: '這樣可能讓對方覺得你不想再談。' }
        ]
      },
      {
        prompt: '第 5 題：快要上課了，最自然的結尾是？',
        options: [
          { text: '等陣小息再傾，好高興認識你。', score: 2, note: '有禮貌，也留下下次再談的機會。' },
          { text: '我要上課了，之後再聊。', score: 2, note: '這樣清楚又自然。' },
          { text: '我講完啦。', score: 0, note: '這樣聽起來有點生硬。' },
          { text: '直接低頭，不再回應', score: 0, note: '結尾也需要照顧別人的感受。' }
        ]
      }
    ]
  },

  refuse: {
    title: '小息：禮貌拒絕',
    intro: '情境：小息時，同學邀請你一起玩遊戲，但你現在很累，只想先休息一下。',
    avatar: '🙅',
    role: '小息情境',
    mission: '清楚表達你現在不想加入，同時保持友善。',
    location: '操場／小息時間',
    socialGoal: '拒絕 + 保持關係',
    supportTip: '可以先感謝對方，再說出自己的需要。',
    hint: '重點不是一定要答應，而是平靜、清楚地表達。',
    calmPrompt: '先在心裡想一句固定句子：「多謝你邀請我，但我而家想休息一下。」',
    steps: [
      {
        prompt: '第 1 題：同學來邀請你時，第一個反應應該是？',
        options: [
          { text: '先望向對方，聽清楚他在說什麼', score: 2, note: '先接收對方的信息，是很好的開始。' },
          { text: '先停一停，再回應', score: 1, note: '這樣有助你冷靜表達。' },
          { text: '一聽到就很大聲說「唔玩！」', score: 0, note: '語氣太硬，容易讓對方不舒服。' },
          { text: '立刻走開，不回應', score: 0, note: '對方可能會感到很突然。' }
        ]
      },
      {
        prompt: '第 2 題：最合適的拒絕方式是？',
        options: [
          { text: '多謝你哋邀請我，但我而家想休息一陣。', score: 2, note: '又清楚又有禮貌。' },
          { text: '我而家想自己安靜一陣。', score: 1, note: '你有表達需要，如果加一句感謝會更完整。' },
          { text: '我唔想同你哋玩。', score: 0, note: '這樣像是在拒絕對方這個人。' },
          { text: '完全不出聲', score: 0, note: '對方未必知道你的真正意思。' }
        ]
      },
      {
        prompt: '第 3 題：如果你想令氣氛不那麼僵，可以補充哪一句？',
        options: [
          { text: '如果你哋下次再玩，我可能可以一齊。', score: 2, note: '這樣能保留關係。' },
          { text: '等我休息完再看看。', score: 2, note: '這樣有彈性，也比較自然。' },
          { text: '我今日冇心情。', score: 1, note: '有表達，但不夠具體。' },
          { text: '唔好再搵我。', score: 0, note: '這樣容易傷害關係。' }
        ]
      },
      {
        prompt: '第 4 題：其中一位同學有點失望，你應該怎樣做？',
        options: [
          { text: '保持平靜語氣，再禮貌講一次', score: 2, note: '穩定地重複自己的意思是好的做法。' },
          { text: '用相同意思但更簡單的句子再說一次', score: 2, note: '簡單清楚，有助對方理解。' },
          { text: '假裝聽不到', score: 0, note: '這樣會讓對方覺得被忽視。' },
          { text: '開始不耐煩，語氣變差', score: 0, note: '這樣容易讓情況變僵。' }
        ]
      },
      {
        prompt: '第 5 題：這段對話怎樣結束最好？',
        options: [
          { text: '多謝你哋明白，祝你哋玩得開心。', score: 2, note: '這樣結尾自然又友善。' },
          { text: '講完後向對方點頭', score: 1, note: '這樣可以，但如果加一句結尾會更完整。' },
          { text: '講完就立即走開', score: 0, note: '這樣較急，少了禮貌感。' },
          { text: '最後補一句「真係好煩」', score: 0, note: '這樣會令對方難受。' }
        ]
      }
    ]
  },

  conflict: {
    title: '借文具：處理衝突',
    intro: '情境：上課前，你發現旁邊同學沒有先問你，就拿了你的筆來用，你心裡有點不舒服。',
    avatar: '🧩',
    role: '借文具情境',
    mission: '先控制情緒，再清楚表達界線。',
    location: '上課前',
    socialGoal: '表達界線 + 不升級衝突',
    supportTip: '先說事實，再說需要。',
    hint: '生氣是可以的，但最好先講清楚，而不是立刻搶回來。',
    calmPrompt: '先把手放好，吸一口氣，再說第一句。',
    steps: [
      {
        prompt: '第 1 題：發現筆被拿走時，第一個反應最理想是？',
        options: [
          { text: '先深呼吸一下，再開口', score: 2, note: '這能幫你穩住情緒。' },
          { text: '先看清楚情況，再平靜說話', score: 2, note: '這是很穩定的開始方式。' },
          { text: '立刻很大聲質問對方', score: 0, note: '這樣容易讓事情升級。' },
          { text: '立刻伸手搶回來', score: 0, note: '這樣容易造成更大衝突。' }
        ]
      },
      {
        prompt: '第 2 題：你可以怎樣說比較清楚？',
        options: [
          { text: '呢支筆係我嘅，可唔可以先還返俾我？', score: 2, note: '清楚又有禮貌。' },
          { text: '這支筆是我的，我現在要用。', score: 2, note: '你清楚表達了需要。' },
          { text: '你做咩偷我嘢？', score: 0, note: '這樣容易令對方立刻防衛。' },
          { text: '不說話，只一直看著對方', score: 0, note: '對方未必知道你想怎樣。' }
        ]
      },
      {
        prompt: '第 3 題：如果對方說「我借一陣啫」，你可以怎樣補充？',
        options: [
          { text: '如果你想借，可以先問我，我會舒服啲。', score: 2, note: '你表達了自己的感受。' },
          { text: '我不喜歡別人沒有問我就拿我的東西。', score: 2, note: '這是很清楚的界線表達。' },
          { text: '算啦，但心裡一直很生氣', score: 1, note: '表面停了，但感受沒有處理。' },
          { text: '你再唔還我就同你翻臉。', score: 0, note: '威脅會令情況更難收拾。' }
        ]
      },
      {
        prompt: '第 4 題：如果對方仍然不合作，下一步最好是？',
        options: [
          { text: '請老師幫忙處理', score: 2, note: '知道何時找大人幫忙，是成熟的做法。' },
          { text: '先停止爭論，再向老師求助', score: 2, note: '這樣安全又清楚。' },
          { text: '不停和對方爭辯', score: 0, note: '這樣會讓情況更亂。' },
          { text: '下課後再報復對方', score: 0, note: '這樣會把事情變得更大。' }
        ]
      },
      {
        prompt: '第 5 題：事情解決後，怎樣讓自己回到上課狀態？',
        options: [
          { text: '整理情緒，準備好書本，專心上課', score: 2, note: '這樣能幫你回到現在的任務。' },
          { text: '深呼吸一下，再把注意力放回課堂', score: 2, note: '這是很好的轉換技巧。' },
          { text: '整堂課都一直想著這件事', score: 0, note: '這樣會影響你接下來的學習。' },
          { text: '不停和其他同學說對方壞話', score: 0, note: '這只會延長負面情緒。' }
        ]
      }
    ]
  },

  respond: {
    title: '放學前：作出回應',
    intro: '情境：放學前收拾書包時，同學很開心地走過來說：「我今日默書拎到好高分！」',
    avatar: '💬',
    role: '放學前情境',
    mission: '用友善和自然的方式回應對方。',
    location: '放學前',
    socialGoal: '聆聽 + 支持回應',
    supportTip: '先回應對方的開心，再加一條簡單追問。',
    hint: '對方最想感受到的是：你有在聽，而且替他高興。',
    calmPrompt: '如果你不知道說什麼，可以先說：「真係呀？太好啦！」',
    steps: [
      {
        prompt: '第 1 題：你第一個行動應該是？',
        options: [
          { text: '望向對方，表示你有在聽', score: 2, note: '先讓對方感受到你有留意他。' },
          { text: '停下手上的事，看著對方幾秒', score: 2, note: '這是很好的聆聽開始。' },
          { text: '繼續收拾書包，不理會對方', score: 0, note: '這樣對方會覺得被忽略。' },
          { text: '立刻打斷對方，說自己的事', score: 0, note: '這樣會讓對方感到不被重視。' }
        ]
      },
      {
        prompt: '第 2 題：第一句回應可以是？',
        options: [
          { text: '真係呀？好勁喎！', score: 2, note: '自然、正面，容易繼續談。' },
          { text: '嘩，真好啊！', score: 2, note: '這樣有支持感。' },
          { text: '哦。', score: 1, note: '有回應，但支持感較弱。' },
          { text: '咁又點？', score: 0, note: '這樣會讓對方覺得你不在乎。' }
        ]
      },
      {
        prompt: '第 3 題：如果你想延續對話，最適合怎樣問？',
        options: [
          { text: '你今次溫咗幾耐呀？', score: 2, note: '這是和對方分享內容有關的追問。' },
          { text: '你是不是準備了很久？', score: 2, note: '這樣能自然延續對話。' },
          { text: '其實我今日都好忙。', score: 0, note: '這樣太快把焦點轉到自己身上。' },
          { text: '你講完未？', score: 0, note: '這樣很容易傷害對方。' }
        ]
      },
      {
        prompt: '第 4 題：對方分享完後，你可以怎樣表示支持？',
        options: [
          { text: '太好啦，你一定好開心。', score: 2, note: '你有回應對方的感受。' },
          { text: '你今日一定很有成功感。', score: 2, note: '這樣很有支持感。' },
          { text: '嗯，知道。', score: 1, note: '有回應，但較平淡。' },
          { text: '有咩咁值得講？', score: 0, note: '這樣會讓對方以後不想再分享。' }
        ]
      },
      {
        prompt: '第 5 題：最自然的結尾是？',
        options: [
          { text: '恭喜你呀，聽日見！', score: 2, note: '這樣簡單又完整。' },
          { text: '恭喜你，下次都可以同我分享。', score: 2, note: '這樣能建立關係。' },
          { text: '我走先。', score: 1, note: '可以，但少了一點溫度。' },
          { text: '轉身就走，不再回應', score: 0, note: '結尾也要顧及對方感受。' }
        ]
      }
    ]
  },

  groupwork: {
    title: '小組：加入合作',
    intro: '情境：分組活動時，其他同學已經開始討論，你不知道什麼時候插話，也擔心自己說錯。',
    avatar: '🤝',
    role: '小組合作情境',
    mission: '找到合適時機加入，表達自己的想法，也能回應別人。',
    location: '分組活動',
    socialGoal: '加入對話 + 合作參與',
    supportTip: '先聽一會兒，再用簡單句子加入。',
    hint: '如果你不知道何時說，可以先等一個小空位，再用固定句子開口。',
    calmPrompt: '先在心裡準備一句：「我有一個簡單想法。」',
    steps: [
      {
        prompt: '第 1 題：其他同學正在講，你最好的開始方式是？',
        options: [
          { text: '先聽幾秒，等一個空位再加入', score: 2, note: '先觀察節奏，是很好的技巧。' },
          { text: '先聽一下大家在說什麼，再決定何時開口', score: 2, note: '這能幫你更自然加入。' },
          { text: '突然大聲插入自己的想法', score: 0, note: '這樣可能會打斷別人。' },
          { text: '完全不說話，只等別人安排你', score: 0, note: '這樣你可能會被忽略。' }
        ]
      },
      {
        prompt: '第 2 題：你準備加入討論，哪一句最自然？',
        options: [
          { text: '我有一個想法，係咪可以試下……？', score: 2, note: '有禮貌，也很清楚。' },
          { text: '我有一個簡單想法，想分享一下。', score: 2, note: '這是很好的加入方式。' },
          { text: '你哋講得唔啱。', score: 0, note: '太快否定別人，容易令氣氛變差。' },
          { text: '我唔識，你哋自己決定。', score: 0, note: '這樣會讓自己更難參與。' }
        ]
      },
      {
        prompt: '第 3 題：其中一位組員說「都可以」，你接下來最好怎樣做？',
        options: [
          { text: '簡單講清楚自己想法的內容', score: 2, note: '現在就是把意思講清楚的時候。' },
          { text: '把自己的想法分兩句慢慢講出來', score: 2, note: '慢慢說清楚，更容易讓別人明白。' },
          { text: '只說「冇嘢」然後停住', score: 0, note: '這樣會浪費了剛才得到的機會。' },
          { text: '突然轉去講自己喜歡的別的題目', score: 0, note: '這樣會偏離小組任務。' }
        ]
      },
      {
        prompt: '第 4 題：另一位同學提出不同意見，你可以怎樣回應？',
        options: [
          { text: '我明白，你嗰個方法都可以，我哋可唔可以比較下？', score: 2, note: '這樣能表達不同意，又不會太衝。' },
          { text: '我明白你的想法，我也想補充一點。', score: 2, note: '這樣很有尊重，也能表達自己。' },
          { text: '算啦，乜都得。', score: 1, note: '這樣避開衝突了，但也少了真正參與。' },
          { text: '唔好改，我覺得我嗰個一定最好。', score: 0, note: '太堅持自己會令合作變難。' }
        ]
      },
      {
        prompt: '第 5 題：老師說還有 5 分鐘完成，你在小組裡最好的做法是？',
        options: [
          { text: '主動接一個清楚任務，例如寫標題或整理資料', score: 2, note: '這樣能清楚參與。' },
          { text: '主動問：我可以幫忙做哪一部分？', score: 2, note: '這樣很適合不確定時使用。' },
          { text: '坐著等別人叫你做事', score: 0, note: '這樣比較被動。' },
          { text: '因為緊張而完全退出討論', score: 0, note: '這樣會失去練習合作的機會。' }
        ]
      }
    ]
  },

  help: {
    title: '課堂中：向老師求助',
    intro: '情境：上課時你聽不明白老師剛才說的內容，但你不太確定應不應該舉手問。',
    avatar: '🙋',
    role: '課堂求助情境',
    mission: '在合適的時候，清楚表達你需要幫助。',
    location: '課堂中',
    socialGoal: '表達需要 + 合適求助',
    supportTip: '可以用簡單句子直接表達自己不明白的地方。',
    hint: '求助不是麻煩別人，而是幫助自己理解。',
    calmPrompt: '先心裡準備一句：「老師，我有一個地方不明白。」',
    steps: [
      {
        prompt: '第 1 題：你發現自己不明白時，第一步最好是？',
        options: [
          { text: '先停一停，確認自己哪裡不明白', score: 2, note: '這樣能幫你更清楚地求助。' },
          { text: '先看一下課本或筆記再確認', score: 2, note: '這是一個很好的整理方法。' },
          { text: '直接放棄，不再理會', score: 0, note: '這樣會令自己更難跟上課堂。' },
          { text: '開始焦急，但不說出來', score: 0, note: '情緒會累積，問題也不會解決。' }
        ]
      },
      {
        prompt: '第 2 題：如果你想求助，最合適的開始方式是？',
        options: [
          { text: '舉手，等老師有空再問', score: 2, note: '這是課堂中很合適的方式。' },
          { text: '小聲對老師說：我有一個地方不明白', score: 2, note: '清楚又直接。' },
          { text: '突然大聲打斷老師', score: 0, note: '這樣容易影響全班。' },
          { text: '一直不舉手，只希望老師自己發現', score: 0, note: '老師未必知道你需要幫助。' }
        ]
      },
      {
        prompt: '第 3 題：你可以怎樣講得更清楚？',
        options: [
          { text: '老師，我不明白這一題怎樣開始。', score: 2, note: '這樣很清楚。' },
          { text: '老師，我可唔可以再聽一次剛才嗰部分？', score: 2, note: '這樣有禮又具體。' },
          { text: '我唔識。', score: 1, note: '有表達，但不夠具體。' },
          { text: '算啦，唔問啦。', score: 0, note: '這樣問題仍然留在那裡。' }
        ]
      },
      {
        prompt: '第 4 題：老師回應你後，你最好怎樣做？',
        options: [
          { text: '專心聽，看看自己是否明白了', score: 2, note: '這樣能幫你真正解決問題。' },
          { text: '如果仍然不明白，再說一次自己不明白的地方', score: 2, note: '重複求助是可以的。' },
          { text: '立刻說「算啦」', score: 0, note: '這樣可能放棄得太快。' },
          { text: '完全不再理會老師的回答', score: 0, note: '這樣就失去求助的作用。' }
        ]
      },
      {
        prompt: '第 5 題：最後怎樣結束最好？',
        options: [
          { text: '多謝老師，我再試下。', score: 2, note: '有禮貌，也很自然。' },
          { text: '我明白多一點了，多謝。', score: 2, note: '這樣能讓老師知道你有收穫。' },
          { text: '不說話就坐下', score: 0, note: '這樣少了基本回應。' },
          { text: '一臉不耐煩地轉身', score: 0, note: '這樣會令人誤會你的意思。' }
        ]
      }
    ]
  },

  lunch: {
    title: '午飯時間：加入同學',
    intro: '情境：午飯時間，你看到幾位同學坐在一起吃飯，你想靠近他們，但又不確定怎樣加入比較自然。',
    avatar: '🍱',
    role: '午飯情境',
    mission: '用簡單而有禮貌的方式加入同學。',
    location: '飯堂／午飯時間',
    socialGoal: '加入群體 + 基本互動',
    supportTip: '先問可不可以坐下，是很好的開始。',
    hint: '不用一開始講很多，只要先有禮貌地加入就可以。',
    calmPrompt: '先默念一句：「你好，我可唔可以坐呢度？」',
    steps: [
      {
        prompt: '第 1 題：你走近同學時，第一步最好是？',
        options: [
          { text: '先停在附近，看看他們是不是方便', score: 2, note: '先觀察很有幫助。' },
          { text: '先看一下有沒有空位', score: 2, note: '這是很自然的做法。' },
          { text: '直接坐下，不問一句', score: 0, note: '這樣可能太突然。' },
          { text: '遠遠看著，但不再行近', score: 0, note: '這樣很難真正加入。' }
        ]
      },
      {
        prompt: '第 2 題：最自然的開口方式是？',
        options: [
          { text: '你好，我可唔可以坐呢度？', score: 2, note: '這樣有禮又清楚。' },
          { text: '呢度有人坐嗎？', score: 2, note: '這是很自然的問法。' },
          { text: '我要坐呢度。', score: 0, note: '這樣聽起來太直接。' },
          { text: '一直站著，不講話', score: 0, note: '同學未必知道你想加入。' }
        ]
      },
      {
        prompt: '第 3 題：同學說可以，你接下來最好怎樣做？',
        options: [
          { text: '坐下後說一聲「多謝」', score: 2, note: '這樣很自然。' },
          { text: '坐下後輕輕點頭，再開始吃飯', score: 1, note: '這樣可以，但如果說一句感謝會更完整。' },
          { text: '立刻插入他們正在說的話題', score: 0, note: '最好先聽一下再加入。' },
          { text: '完全不理會他們', score: 0, note: '這樣很難建立交流。' }
        ]
      },
      {
        prompt: '第 4 題：如果你想加入聊天，可以怎樣做？',
        options: [
          { text: '先聽一下，再用簡單句子回應', score: 2, note: '這樣比較自然。' },
          { text: '等一個空位，再說一句相關的話', score: 2, note: '這是很好的群體對話技巧。' },
          { text: '突然把話題轉去自己最喜歡的東西', score: 0, note: '這樣可能和大家原本的對話無關。' },
          { text: '一直沉默，但心裡很想加入', score: 0, note: '這樣會讓自己更難參與。' }
        ]
      },
      {
        prompt: '第 5 題：午飯完結時，最自然的結尾是？',
        options: [
          { text: '多謝你哋，我返課室先。', score: 2, note: '這樣有禮貌又自然。' },
          { text: '我先走啦，拜拜。', score: 2, note: '這樣簡單清楚。' },
          { text: '站起來就走，不說話', score: 0, note: '這樣少了基本結尾。' },
          { text: '突然走開，連東西也不收好', score: 0, note: '這樣會讓場面變得很急。' }
        ]
      }
    ]
  },

  homework: {
    title: '放學後：和同學確認功課',
    intro: '情境：放學前你不太確定今天的功課內容，但又擔心問同學會不會麻煩到對方。',
    avatar: '📚',
    role: '功課確認情境',
    mission: '用簡單、清楚的方式確認功課。',
    location: '放學前／課室',
    socialGoal: '求證資訊 + 基本禮貌',
    supportTip: '先簡單說自己不確定，再問一條清楚的問題。',
    hint: '確認功課是一件正常的事，不是麻煩別人。',
    calmPrompt: '先默念一句：「你好，我想確認一下今日功課。」',
    steps: [
      {
        prompt: '第 1 題：你發現自己不確定功課時，第一步最好是？',
        options: [
          { text: '先看看手冊或黑板', score: 2, note: '先自己確認是很好的做法。' },
          { text: '先想清楚自己不明白哪一科', score: 2, note: '這樣能幫你問得更清楚。' },
          { text: '直接放棄，不理功課', score: 0, note: '這樣之後會更混亂。' },
          { text: '一直焦急，但不問任何人', score: 0, note: '這樣問題不會解決。' }
        ]
      },
      {
        prompt: '第 2 題：你想問同學時，最自然的開口方式是？',
        options: [
          { text: '你好，我想確認一下今日中文功課。', score: 2, note: '清楚又有禮。' },
          { text: '今日中文功課係咩呀？', score: 2, note: '簡單直接，也可以。' },
          { text: '喂，你快啲話我知。', score: 0, note: '這樣語氣太急。' },
          { text: '把手冊直接推給對方，不說話', score: 0, note: '對方未必知道你想問什麼。' }
        ]
      },
      {
        prompt: '第 3 題：同學回答你後，你最好怎樣做？',
        options: [
          { text: '立即記下來', score: 2, note: '這樣能幫你確保沒有忘記。' },
          { text: '再重複一次確認：係唔係要做第 5 題？', score: 2, note: '這樣可以確認自己聽對了。' },
          { text: '只說「哦」但不記低', score: 0, note: '這樣可能很快又忘記。' },
          { text: '不聽完就轉身走', score: 0, note: '這樣資訊可能不完整。' }
        ]
      },
      {
        prompt: '第 4 題：如果你還是不太清楚，最好怎樣做？',
        options: [
          { text: '再問一次自己不明白的地方', score: 2, note: '再確認一次是可以的。' },
          { text: '請同學指一指手冊或黑板上的位置', score: 2, note: '這樣很具體。' },
          { text: '假裝明白，其實不明白', score: 0, note: '這樣回家後會更難處理。' },
          { text: '覺得尷尬，所以完全不再問', score: 0, note: '這樣會把問題留到之後。' }
        ]
      },
      {
        prompt: '第 5 題：最後怎樣結束最好？',
        options: [
          { text: '多謝你，我記低咗啦。', score: 2, note: '這樣有禮貌，也很自然。' },
          { text: '多謝，我而家明白了。', score: 2, note: '這是很好的結尾。' },
          { text: '什麼都不說就走', score: 0, note: '少了基本回應。' },
          { text: '說「你本來就應該幫我」', score: 0, note: '這樣容易影響關係。' }
        ]
      }
    ]
  }
};

let currentAsdGame = null;
let currentAsdStep = 0;
let currentAsdScore = 0;
let currentAsdStrengths = [];
let currentAsdImprovements = [];
let currentChoiceNotes = [];
let currentSpeechUtterance = null;

function addAnimateIn(el) {
  if (!el || document.body.classList.contains('reduced-motion')) return;
  el.classList.remove('animate-in');
  void el.offsetWidth;
  el.classList.add('animate-in');
}

function showToast(message, type = 'success') {
  const wrap = document.getElementById('toastWrap');
  const div = document.createElement('div');
  div.className = `toast ${type === 'success' ? 'success-toast' : 'warning-toast'} animate-in`;
  div.textContent = message;
  wrap.appendChild(div);
  setTimeout(() => div.remove(), 2500);
}

function renderBadges() {
  const grid = document.getElementById('badgeGrid');
  if (!grid) return;

  grid.innerHTML = '';

  Object.keys(badgeMeta).forEach((key) => {
    const meta = badgeMeta[key];
    const unlocked = badgeState[key];
    const div = document.createElement('div');
    div.className = `badge ${unlocked ? 'unlocked' : ''}`;
    div.innerHTML = `
      <span class="badge-icon">${meta.icon}</span>
      <span class="badge-name">${meta.name}</span>
      <span>${unlocked ? '已得到' : '未得到'}</span>
    `;
    grid.appendChild(div);
  });
}

function updateAchievementRow() {
  const row = document.getElementById('achievementRow');
  if (!row) return;

  const unlocked = Object.values(badgeState).filter(Boolean).length;
  const pills = ['<div class="achievement-pill">我的練習模式</div>'];

  if (unlocked >= 1) pills.push('<div class="achievement-pill">得到第一枚徽章</div>');
  if (unlocked >= 4) pills.push('<div class="achievement-pill">持續練習中</div>');
  if (unlocked === 8) pills.push('<div class="achievement-pill">完成所有情境</div>');

  row.innerHTML = pills.join('');
}

function updateGameStatusText() {
  const completed = Object.values(badgeState).filter(Boolean).length;
  appState.completedCount = completed;

  const el = document.getElementById('gameStatusText');
  if (el) {
    el.textContent =
      `已完成情境：${completed} / 8｜使用提示：${appState.hintCount} 次｜使用冷靜模式：${appState.calmCount} 次`;
  }

  updateAchievementRow();
}

function setScreen(screen) {
  appState.currentScreen = screen;

  const screens = ['coverScreen', 'settingsScreen', 'situationScreen', 'gameScreen'];
  screens.forEach((id) => {
    const node = document.getElementById(id);
    if (node) node.classList.remove('active');
  });

  const mapping = {
    cover: 'coverScreen',
    settings: 'settingsScreen',
    situation: 'situationScreen',
    game: 'gameScreen'
  };

  const target = document.getElementById(mapping[screen]);
  if (target) target.classList.add('active');

  saveProgress();
}

function showCoverScreen() {
  setScreen('cover');
}

function showSettingsScreen() {
  setScreen('settings');
  syncSettingControls();
}

function showSituationScreen() {
  setScreen('situation');
}

function showGameScreen() {
  setScreen('game');
  renderBadges();
  updateGameStatusText();
}

function getStars(score, maxScore) {
  const ratio = maxScore === 0 ? 0 : score / maxScore;
  if (ratio >= 0.8) return 3;
  if (ratio >= 0.5) return 2;
  if (ratio > 0) return 1;
  return 0;
}

function renderStars(count) {
  let html = '';
  for (let i = 1; i <= 3; i += 1) {
    html += i <= count ? '<span class="star-filled">★</span>' : '<span class="star-empty">★</span>';
  }
  return html;
}

function renderSceneMeta(game) {
  const el = document.getElementById('sceneMeta');
  if (!el) return;

  if (!game) {
    el.classList.add('hidden');
    el.innerHTML = '';
    return;
  }

  el.classList.remove('hidden');
  el.innerHTML = `
    <div class="meta-box"><strong>地點：</strong><br>${game.location}</div>
    <div class="meta-box"><strong>目標：</strong><br>${game.socialGoal}</div>
    <div class="meta-box"><strong>小提醒：</strong><br>${game.supportTip}</div>
  `;
}

function updateReviewList() {
  const list = document.getElementById('reviewList');
  if (!list) return;

  if (appState.reviewHistory.length === 0) {
    list.innerHTML = '<div class="review-item">你還未開始練習。</div>';
    return;
  }

  list.innerHTML = appState.reviewHistory
    .slice(-5)
    .reverse()
    .map((item) => `
      <div class="review-item">
        <strong>${item.title}</strong><br>
        第 ${item.step} 題：${item.choice}
      </div>
    `)
    .join('');
}

function pushReview(title, step, choice) {
  appState.reviewHistory.push({ title, step, choice });
  if (appState.reviewHistory.length > 20) {
    appState.reviewHistory = appState.reviewHistory.slice(-20);
  }
  updateReviewList();
  saveProgress();
}

function updateQuickNotes(customNotes = []) {
  const notes = [
    '先聽清楚別人說什麼，再回答。',
    '如果不想做某件事，可以清楚又有禮貌地說出來。',
    '緊張時，可以先停一停、慢慢呼吸。',
    '說感受時，可以用「我覺得……」開頭。'
  ];

  const merged = [...customNotes, ...notes].slice(0, 4);
  const list = document.getElementById('quickNotesList');
  if (!list) return;

  list.innerHTML = merged.map((item) => `<div class="quick-note">${item}</div>`).join('');
}

function updateProgressBar() {
  const game = asdGames[currentAsdGame];
  const bar = document.getElementById('asdProgressBar');
  if (!bar) return;

  if (!game) {
    bar.style.width = '0%';
    return;
  }

  const percent = (currentAsdStep / game.steps.length) * 100;
  bar.style.width = `${percent}%`;
}

function startAsdGame(type) {
  if (!asdGames[type]) return;

  currentAsdGame = type;
  currentAsdStep = 0;
  currentAsdScore = 0;
  currentAsdStrengths = [];
  currentAsdImprovements = [];
  currentChoiceNotes = [];

  const game = asdGames[type];
  const avatar = document.getElementById('characterAvatar');
  const name = document.getElementById('characterName');
  const role = document.getElementById('characterRole');
  const info = document.getElementById('characterInfo');

  if (avatar) avatar.textContent = game.avatar;
  if (name) name.textContent = '我';
  if (role) role.textContent = '學生';
  if (info) info.innerHTML = `<strong>現在要做的事：</strong><br>${game.mission}`;

  hideHint();
  hideCalmMode();
  hideInlineReview();
  renderSceneMeta(game);
  updateQuickNotes([game.supportTip, `在 ${game.location} 這個情境中，留意語氣和時機。`]);
  showGameScreen();
  renderAsdStep();
  showToast(`已開始練習：${game.title}`, 'success');
  saveProgress();
}

function renderAsdStep() {
  const game = asdGames[currentAsdGame];
  if (!game) return;

  const progress = document.getElementById('asdProgressText');
  const box = document.getElementById('asdBox');
  const choices = document.getElementById('asdChoices');
  const step = game.steps[currentAsdStep];

  if (!step || !box || !choices) return;

  if (progress) {
    progress.textContent = `情境：${game.title}｜第 ${currentAsdStep + 1} / ${game.steps.length} 題`;
  }

  box.innerHTML = `
    <div class="scene-badge">${game.title}</div>
    <strong>${game.intro}</strong><br><br>
    ${step.prompt}
  `;

  choices.innerHTML = '';
  step.options.forEach((option) => {
    const btn = document.createElement('button');
    btn.className = 'choice-button';
    btn.textContent = option.text;
    btn.onclick = () => chooseAsdOption(option);
    choices.appendChild(btn);
  });

  updateProgressBar();
  addAnimateIn(box);
  addAnimateIn(choices);
  maybeSpeak(box.innerText);
  saveProgress();
}

function chooseAsdOption(option) {
  const game = asdGames[currentAsdGame];
  if (!game) return;

  currentAsdScore += option.score;
  currentChoiceNotes.push(option.note);

  if (option.score === 2) {
    currentAsdStrengths.push(option.text);
  } else {
    currentAsdImprovements.push(option.text);
  }

  pushReview(game.title, currentAsdStep + 1, option.text);
  showInlineReview(option.note);
  currentAsdStep += 1;

  if (currentAsdStep >= game.steps.length) {
    showAsdResult();
  } else {
    renderAsdStep();
  }
}

function showAsdResult() {
  const game = asdGames[currentAsdGame];
  if (!game) return;

  const maxScore = game.steps.length * 2;
  const starCount = getStars(currentAsdScore, maxScore);
  const box = document.getElementById('asdBox');
  const choices = document.getElementById('asdChoices');
  const progress = document.getElementById('asdProgressText');
  const info = document.getElementById('characterInfo');
  const bar = document.getElementById('asdProgressBar');

  if (!box || !choices) return;

  let level = '';
  let overall = '';

  if (currentAsdScore >= 8) {
    level = '表現很好';
    overall = '你能夠用比較合適、平靜和有禮貌的方法處理這個情境。';
  } else if (currentAsdScore >= 5) {
    level = '有進步';
    overall = '你已掌握部分社交技巧，但有些地方可以再更自然、更清楚。';
  } else {
    level = '再練習一下';
    overall = '你願意完成全部題目已經很好，下一次可以多留意語氣、禮貌和結尾方式。';
  }

  const strengths = currentAsdStrengths.length
    ? `<ul>${currentAsdStrengths.slice(0, 4).map((item) => `<li>${item}</li>`).join('')}</ul>`
    : '<p>你有完成整個情境，這已經是一個好開始。</p>';

function escapeHtml(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getBetterSocialAdvice(item) {
  const text = String(item || '');

  if (text.includes('算啦') || text.includes('唔問')) {
    return '如果不明白，可以主動問清楚，例如：「我不太明白，可以再說一次嗎？」';
  }

  if (text.includes('完全不再理會老師') || text.includes('不理會老師')) {
    return '如果仍然不明白老師的回答，可以有禮貌地再問一次，例如：「多謝老師，我會再試一次。如果仍然不明白，我再請教你。」';
  }

  if (text.includes('不耐煩') || text.includes('轉身')) {
    return '如果覺得需要時間消化，可以先用平靜語氣表達，例如：「多謝你告訴我，我需要一點時間想一想。」';
  }

  if (text.includes('完全不出聲') || text.includes('不說話') || text.includes('一句都不說')) {
    return '如果一時不知道怎樣回答，可以先講出自己的狀態，例如：「我而家有少少緊張，可以俾我諗一諗先嗎？」';
  }

  if (text.includes('突然大聲') || text.includes('大聲') || text.includes('質問')) {
    return '如果感到不滿，可以先降低聲量，再清楚說出需要，例如：「我想講一講這件事，可以嗎？」';
  }

  if (text.includes('偷我') || text.includes('搶回來') || text.includes('拿我的東西')) {
    return '如果別人未問就用了你的物品，可以清楚表達界線，例如：「這支筆是我的，可以先還給我嗎？」';
  }

  if (text.includes('報復') || text.includes('翻臉') || text.includes('威脅')) {
    return '如果衝突未能解決，可以尋求老師協助，例如：「我現在有點不開心，我想請老師幫忙處理。」';
  }

  if (text.includes('唔玩') || text.includes('唔好再搵') || text.includes('好煩')) {
    return '如果想拒絕同學邀請，可以先感謝，再說出需要，例如：「多謝你邀請我，但我現在想休息一下。」';
  }

  if (text.includes('咁又點') || text.includes('講完未') || text.includes('有咩咁值得講')) {
    return '如果同學分享開心的事，可以先回應對方感受，例如：「真係呀？聽起來你很開心，恭喜你。」';
  }

  if (text.includes('乜都得') || text.includes('你哋自己決定')) {
    return '如果在小組討論中不知道怎樣加入，可以用簡單句子參與，例如：「我有一個簡單想法，可以分享一下嗎？」';
  }

  if (text.includes('我唔識')) {
    return '如果暫時未想到答案，可以先表達需要時間，例如：「我暫時未諗到答案，可以先聽聽你哋的想法嗎？」';
  }

  if (text.includes('直接走開') || text.includes('不回應') || text.includes('不再回應')) {
    return '如果想離開，可以先簡單交代，例如：「我先離開一下，等陣再同你講。」';
  }

  return '下次遇到類似情況時，可以先停一停，再用清楚和有禮貌的方式表達自己的想法。';
}

const improvements = currentAsdImprovements.length
  ? `<ul>${currentAsdImprovements
      .slice(0, 4)
      .map((item) => `<li>${escapeHtml(getBetterSocialAdvice(item))}</li>`)
      .join('')}</ul>`
  : '<p>你今次每一步都做得不錯，可以挑戰更難情境。</p>';

  const noteSummary = currentChoiceNotes.length
    ? `
      <div class="summary-box">
        <strong>這次練習中，你的選擇提醒：</strong>
        <div class="timeline-list">
          ${currentChoiceNotes.slice(0, 5).map((note) => `<div class="timeline-item">${note}</div>`).join('')}
        </div>
      </div>
    `
    : '';

  badgeState[currentAsdGame] = true;
  renderBadges();
  updateGameStatusText();

  if (progress) progress.textContent = `完成：${game.title}`;
  if (bar) bar.style.width = '100%';
  if (info) {
    info.innerHTML = `<strong>完成的練習：</strong><br>你已完成「${game.title}」，並得到一枚徽章。`;
  }

  box.innerHTML = `
    <div class="scene-badge">練習結果</div>
    <strong>${game.title} 結果：${level}</strong>
    <div class="stars">${renderStars(starCount)}</div>
    <div class="summary-box"><strong>整體表現：</strong> ${overall}</div>
    ${noteSummary}
    <div class="result-good"><strong>你做得好的地方：</strong>${strengths}</div>
    <div class="result-improve"><strong>下次可以進步的地方：</strong>${improvements}</div>
  `;

  choices.innerHTML = `
    <div class="action-row">
      <button onclick="startAsdGame('${currentAsdGame}')">再練習一次</button>
      <button class="secondary" onclick="showSituationScreen()">選擇其他情境</button>
      <button class="secondary" onclick="copyResultSummary()">複製我的結果</button>
    </div>
  `;

  showToast(`已得到徽章：${badgeMeta[currentAsdGame].name}`, 'success');
  maybeSpeak(`${game.title} 完成。${level}。${overall}`);
  addAnimateIn(box);
  addAnimateIn(choices);
  saveProgress();
}

function showHint() {
  const game = asdGames[currentAsdGame];
  const box = document.getElementById('hintBox');

  if (!game || !box) {
    showToast('請先選擇一個情境。', 'warning');
    return;
  }

  appState.hintCount += 1;
  box.classList.remove('hidden');
  box.innerHTML = `<strong>小提示：</strong><br>${game.hint}`;
  updateGameStatusText();
  saveProgress();
}

function hideHint() {
  const box = document.getElementById('hintBox');
  if (!box) return;
  box.classList.add('hidden');
  box.innerHTML = '';
}

function showCalmMode() {
  const game = asdGames[currentAsdGame];
  const box = document.getElementById('calmBox');
  if (!box) return;

  appState.calmCount += 1;
  box.classList.remove('hidden');
  box.innerHTML = game
    ? `<strong>先冷靜一下：</strong><br>${game.calmPrompt}<br><br><strong>呼吸練習：</strong>吸氣 4 秒 → 停 2 秒 → 呼氣 4 秒。`
    : `<strong>先冷靜一下：</strong><br>吸氣 4 秒、停 2 秒、呼氣 4 秒。等自己準備好，再開始一個情境。`;

  updateGameStatusText();
  saveProgress();
}

function hideCalmMode() {
  const box = document.getElementById('calmBox');
  if (!box) return;
  box.classList.add('hidden');
  box.innerHTML = '';
}

function showInlineReview(text) {
  const box = document.getElementById('reviewBoxInline');
  if (!box) return;
  box.classList.remove('hidden');
  box.innerHTML = `<strong>即時提醒：</strong><br>${text}`;
}

function hideInlineReview() {
  const box = document.getElementById('reviewBoxInline');
  if (!box) return;
  box.classList.add('hidden');
  box.innerHTML = '';
}

function copyResultSummary() {
  const box = document.getElementById('asdBox');
  if (!box) return;

  const text = box.innerText.trim();
  if (!text) {
    showToast('目前沒有可複製的內容。', 'warning');
    return;
  }

  navigator.clipboard.writeText(text)
    .then(() => showToast('已複製我的結果', 'success'))
    .catch(() => showToast('複製失敗，請手動複製。', 'warning'));
}

function saveJournal() {
  const input = document.getElementById('journalInput');
  if (!input) return;

  appState.lastJournal = input.value.trim();
  saveProgress();

  if (!appState.lastJournal) {
    showToast('反思是空白，已保留空內容。', 'warning');
    return;
  }

  showToast('已儲存反思', 'success');
}

function loadJournalToBox() {
  const box = document.getElementById('asdBox');
  if (!box) return;

  if (!appState.lastJournal) {
    box.innerHTML = `
      <div class="scene-badge">我的反思</div>
      <div class="summary-box">你現在還沒有已儲存的反思。</div>
    `;
    return;
  }

  box.innerHTML = `
    <div class="scene-badge">我的反思</div>
    <div class="summary-box"><strong>最近的反思：</strong><br>${escapeHtml(appState.lastJournal).replace(/\n/g, '<br>')}</div>
  `;
  addAnimateIn(box);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function applyFontScale() {
  document.documentElement.style.setProperty('--font-scale', String(fontScales[appState.fontModeIndex]));
}

function cycleFontSize() {
  appState.fontModeIndex = (appState.fontModeIndex + 1) % fontScales.length;
  applyFontScale();
  saveProgress();
  showToast(`字體大小已切換為第 ${appState.fontModeIndex + 1} 段`, 'success');
}

function applyContrastMode() {
  document.body.classList.toggle('high-contrast', appState.highContrast);
}

function applyReducedMotion() {
  document.body.classList.toggle('reduced-motion', appState.reducedMotion);
}

function handleSpeechToggle() {
  const toggle = document.getElementById('speechToggle');
  if (!toggle) return;

  appState.speechEnabled = toggle.checked;
  saveProgress();
  showToast(appState.speechEnabled ? '已開啟朗讀' : '已關閉朗讀', 'success');
  if (!appState.speechEnabled) stopSpeech();
}

function handleContrastToggle() {
  const toggle = document.getElementById('contrastToggle');
  if (!toggle) return;

  appState.highContrast = toggle.checked;
  applyContrastMode();
  saveProgress();
  showToast(appState.highContrast ? '已開啟高對比畫面' : '已關閉高對比畫面', 'success');
}

function handleMotionToggle() {
  const toggle = document.getElementById('motionToggle');
  if (!toggle) return;

  appState.reducedMotion = toggle.checked;
  applyReducedMotion();
  saveProgress();
  showToast(appState.reducedMotion ? '已減少動畫' : '已恢復動畫', 'success');
}

function toggleSpeech() {
  appState.speechEnabled = !appState.speechEnabled;
  syncSettingControls();
  saveProgress();
  showToast(appState.speechEnabled ? '已開啟朗讀' : '已關閉朗讀', 'success');
  if (!appState.speechEnabled) stopSpeech();
}

function syncSettingControls() {
  const speechToggle = document.getElementById('speechToggle');
  const contrastToggle = document.getElementById('contrastToggle');
  const motionToggle = document.getElementById('motionToggle');

  if (speechToggle) speechToggle.checked = appState.speechEnabled;
  if (contrastToggle) contrastToggle.checked = appState.highContrast;
  if (motionToggle) motionToggle.checked = appState.reducedMotion;
}

function stopSpeech() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  currentSpeechUtterance = null;
}

function maybeSpeak(text) {
  if (!appState.speechEnabled || !('speechSynthesis' in window) || !text) return;

  stopSpeech();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-HK';
  utterance.rate = 1;
  currentSpeechUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

function repeatCurrentText() {
  const box = document.getElementById('asdBox');
  if (!box) return;

  const text = box.innerText.trim();
  if (!text) {
    showToast('目前沒有可朗讀的內容。', 'warning');
    return;
  }

  if (!appState.speechEnabled) {
    showToast('請先在設定中開啟朗讀。', 'warning');
    return;
  }

  maybeSpeak(text);
  showToast('正在重讀題目', 'success');
}

function saveProgress() {
  const payload = {
    badgeState,
    appState,
    currentAsdGame,
    currentAsdStep,
    currentAsdScore,
    currentAsdStrengths,
    currentAsdImprovements,
    currentChoiceNotes
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function loadProgress() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    renderBadges();
    updateGameStatusText();
    updateReviewList();
    updateQuickNotes();
    syncSettingControls();
    applyFontScale();
    applyContrastMode();
    applyReducedMotion();
    return;
  }

  try {
    const data = JSON.parse(raw);

    if (data.badgeState) {
      Object.keys(badgeState).forEach((key) => {
        badgeState[key] = Boolean(data.badgeState[key]);
      });
    }

    if (data.appState) {
      Object.assign(appState, data.appState);
    }

    currentAsdGame = data.currentAsdGame ?? null;
    currentAsdStep = Number.isInteger(data.currentAsdStep) ? data.currentAsdStep : 0;
    currentAsdScore = Number.isFinite(data.currentAsdScore) ? data.currentAsdScore : 0;
    currentAsdStrengths = Array.isArray(data.currentAsdStrengths) ? data.currentAsdStrengths : [];
    currentAsdImprovements = Array.isArray(data.currentAsdImprovements) ? data.currentAsdImprovements : [];
    currentChoiceNotes = Array.isArray(data.currentChoiceNotes) ? data.currentChoiceNotes : [];

    renderBadges();
    updateGameStatusText();
    updateReviewList();
    updateQuickNotes();
    syncSettingControls();
    applyFontScale();
    applyContrastMode();
    applyReducedMotion();

    const journal = document.getElementById('journalInput');
    if (appState.lastJournal && journal) {
      journal.value = appState.lastJournal;
    }

    if (appState.currentScreen === 'settings') showSettingsScreen();
    else if (appState.currentScreen === 'situation') showSituationScreen();
    else if (appState.currentScreen === 'game') showGameScreen();
    else showCoverScreen();

    if (currentAsdGame && asdGames[currentAsdGame]) {
      const game = asdGames[currentAsdGame];
      const avatar = document.getElementById('characterAvatar');
      const name = document.getElementById('characterName');
      const role = document.getElementById('characterRole');
      const info = document.getElementById('characterInfo');

      if (avatar) avatar.textContent = game.avatar;
      if (name) name.textContent = '我';
      if (role) role.textContent = '學生';

      if (currentAsdStep >= game.steps.length) {
        if (info) {
          info.innerHTML = `<strong>完成的練習：</strong><br>你已完成「${game.title}」，並得到一枚徽章。`;
        }
        renderSceneMeta(game);
        showAsdResult();
      } else {
        if (info) {
          info.innerHTML = `<strong>現在要做的事：</strong><br>${game.mission}`;
        }
        renderSceneMeta(game);
        if (appState.currentScreen === 'game') renderAsdStep();
      }
    }
  } catch (error) {
    console.error(error);
    localStorage.removeItem(STORAGE_KEY);
    showToast('讀取進度失敗，已重設本地資料。', 'warning');
  }
}

function resetAllData() {
  const confirmed = window.confirm('你確定要重新開始嗎？這會清除你的進度、徽章和反思。');
  if (!confirmed) return;

  localStorage.removeItem(STORAGE_KEY);

  Object.keys(badgeState).forEach((key) => {
    badgeState[key] = false;
  });

  appState.speechEnabled = false;
  appState.highContrast = false;
  appState.reducedMotion = false;
  appState.fontModeIndex = 0;
  appState.completedCount = 0;
  appState.hintCount = 0;
  appState.calmCount = 0;
  appState.reviewHistory = [];
  appState.lastJournal = '';
  appState.currentScreen = 'cover';

  currentAsdGame = null;
  currentAsdStep = 0;
  currentAsdScore = 0;
  currentAsdStrengths = [];
  currentAsdImprovements = [];
  currentChoiceNotes = [];

  const journal = document.getElementById('journalInput');
  const avatar = document.getElementById('characterAvatar');
  const name = document.getElementById('characterName');
  const role = document.getElementById('characterRole');
  const info = document.getElementById('characterInfo');
  const box = document.getElementById('asdBox');
  const choices = document.getElementById('asdChoices');
  const progress = document.getElementById('asdProgressText');
  const bar = document.getElementById('asdProgressBar');

  if (journal) journal.value = '';
  if (avatar) avatar.textContent = '🧑';
  if (name) name.textContent = '我';
  if (role) role.textContent = '學生';
  if (info) info.innerHTML = '<strong>現在要做的事：</strong><br>先從情境選擇頁開始你的社交練習。';
  if (box) box.innerHTML = '這裡會顯示情境故事、問題和結果。';
  if (choices) choices.innerHTML = '';
  if (progress) progress.textContent = '請先選擇一個情境開始練習。';
  if (bar) bar.style.width = '0%';

  hideHint();
  hideCalmMode();
  hideInlineReview();
  renderSceneMeta(null);
  updateQuickNotes();
  updateReviewList();
  renderBadges();
  updateGameStatusText();
  syncSettingControls();
  applyFontScale();
  applyContrastMode();
  applyReducedMotion();
  stopSpeech();
  showCoverScreen();
  showToast('已重新開始', 'success');
}

document.addEventListener('DOMContentLoaded', () => {
  loadProgress();
  renderBadges();
  updateGameStatusText();
  updateReviewList();
  updateQuickNotes();
  syncSettingControls();
  applyFontScale();
  applyContrastMode();
  applyReducedMotion();
});
