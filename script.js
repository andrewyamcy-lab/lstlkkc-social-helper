<!-- /script.js -->
const STORAGE_KEY = 'asd_school_rpg_v4';

const badgeState = {
  start: false,
  refuse: false,
  conflict: false,
  respond: false,
  groupwork: false
};

const badgeMeta = {
  start: { icon: '🗣️', name: '開口勇士' },
  refuse: { icon: '🙅', name: '禮貌拒絕者' },
  conflict: { icon: '🧩', name: '冷靜調解員' },
  respond: { icon: '💬', name: '暖心回應者' },
  groupwork: { icon: '🤝', name: '合作參與者' }
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
    title: '課室發起對話',
    intro: '情境：早上第一節課前，你進入課室，看到一位平時較少接觸的新同學一個人坐在後排整理書本。老師還未正式開始上課，你想嘗試主動打開話題。',
    avatar: '👦',
    role: '課室情境',
    mission: '在不打擾對方的情況下，主動打招呼，並自然地開始一段簡單對話。',
    location: '課室',
    socialGoal: '主動開口 + 延續兩句對話',
    supportTip: '由簡單問題開始，例如問書本、課堂或座位。',
    hint: '先想一想：如果對方未準備好長談，最安全的方法是先輕聲打招呼，再講一句很簡單的話。',
    calmPrompt: '如果你覺得主動開口很難，可以先在心裡默念一句固定句子，例如：「你好，我係阿明。」',
    steps: [
      {
        prompt: '第 1 步：你剛走到座位附近，第一個行動怎樣比較自然？',
        options: [
          { text: '先行近一點，再輕聲說「早晨」', score: 2, note: '這樣比較自然，也不會太突然。' },
          { text: '突然大聲叫「喂！」想吸引對方注意', score: 1, note: '你有嘗試開口，但語氣和音量可能令對方嚇到。' },
          { text: '直接坐低，一句都唔講', score: 0, note: '這很像很多 ASD 學生會因緊張而選的做法，但對方未必知道你想認識他。' }
        ]
      },
      {
        prompt: '第 2 步：對方望向你了，你第一句說話可以是？',
        options: [
          { text: '你好，我係阿明，我哋同班。', score: 2, note: '清楚、簡單，對方容易回應。' },
          { text: '你平時點解咁靜？', score: 1, note: '你有開話題，但內容太直接，可能令對方尷尬。' },
          { text: '一直望住對方，等佢先講', score: 0, note: '這種沉默等待很常見，但容易令對話停住。' }
        ]
      },
      {
        prompt: '第 3 步：對方微笑點頭，你可以怎樣延續？',
        options: [
          { text: '你今日帶咗邊本書返嚟？', score: 2, note: '跟課室情境有關，容易接下去。' },
          { text: '我而家坐你隔離，你唔介意啦。', score: 1, note: '你有想靠近對方，但好像沒有先問清楚。' },
          { text: '即刻開始只講自己嘅事', score: 0, note: '有些 ASD 學生會太快轉去自己熟悉的主題，忽略了雙向對話。' }
        ]
      },
      {
        prompt: '第 4 步：對方簡單回答後，最佳回應是？',
        options: [
          { text: '原來係咁，多謝你同我講。', score: 2, note: '這表示你有聽對方說話。' },
          { text: '哦。', score: 1, note: '有回應，但比較短，對話可能很快停。' },
          { text: '唔再理佢，轉身做自己嘢', score: 0, note: '這會令對方以為你不想再說話。' }
        ]
      },
      {
        prompt: '第 5 步：上堂鐘聲快響，最自然的結尾是？',
        options: [
          { text: '等陣小息再傾，好高興認識你。', score: 2, note: '簡單、有禮貌，還留下一個下次再談的機會。' },
          { text: '我講完啦。', score: 1, note: '雖然結束了，但聽起來比較生硬。' },
          { text: '冇回應，直接低頭', score: 0, note: '對話不是只靠開始，結尾也需要練習。' }
        ]
      }
    ]
  },
  refuse: {
    title: '小息禮貌拒絕',
    avatar: '🙋',
    role: '小息情境',
    mission: '在不傷害同學感受的情況下，清楚表達你現在不想加入，但仍然保持友善。',
    location: '操場／小息時間',
    socialGoal: '清楚拒絕 + 保持關係',
    supportTip: '拒絕時可以先感謝對方，再表達自己需要。',
    hint: '禮貌拒絕不代表一定要答應。重點是：說清楚、語氣平靜、不要傷人。',
    calmPrompt: '如果你怕自己一緊張就說得太直接，可以先用固定句型：「多謝你邀請我，但我而家想休息一下。」',
    intro: '情境：小息時，兩位同學正在操場旁邊玩拍卡遊戲，見到你之後邀請你一起加入。不過你剛剛上完課有點累，只想坐一會兒休息。',
    steps: [
      {
        prompt: '第 1 步：同學走過來邀請你時，第一個反應應該是？',
        options: [
          { text: '望向對方，先聽清楚他們說什麼', score: 2, note: '這表示你有接收對方的信息。' },
          { text: '一聽到就說「唔玩！」', score: 1, note: '你有直接表達，但語氣較硬。' },
          { text: '立即擰轉面走開', score: 0, note: '很多 ASD 學生在壓力下會逃開，但對方可能覺得被拒絕得很突然。' }
        ]
      },
      {
        prompt: '第 2 步：你想拒絕，最合適的說法是？',
        options: [
          { text: '多謝你哋邀請我，但我而家想休息一陣。', score: 2, note: '又清楚又有禮貌。' },
          { text: '我唔想同你哋玩。', score: 1, note: '內容是真實感受，但聽起來像拒絕對方這個人。' },
          { text: '完全唔出聲', score: 0, note: '沉默雖然常見，但對方未必知道你只是想休息。' }
        ]
      },
      {
        prompt: '第 3 步：如果你想令氣氛沒那麼僵，可以補充哪一句？',
        options: [
          { text: '如果你哋下次再玩，我可能可以一齊。', score: 2, note: '保留關係，對方會感覺較舒服。' },
          { text: '我今日冇心情。', score: 1, note: '有表達，但不夠具體，可能仍較冷淡。' },
          { text: '你哋自己玩啦，唔好再搵我。', score: 0, note: '這樣容易令同學覺得被推開。' }
        ]
      },
      {
        prompt: '第 4 步：其中一位同學有點失望，你應該怎樣做？',
        options: [
          { text: '保持平靜語氣，再禮貌講一次', score: 2, note: '重複一次也沒關係，最重要是語氣穩定。' },
          { text: '假裝聽唔到', score: 1, note: '你可能想避開尷尬，但對方仍然會覺得被忽視。' },
          { text: '開始覺得煩，語氣變差', score: 0, note: '情緒一轉強，整個對話就容易變僵。' }
        ]
      },
      {
        prompt: '第 5 步：這段對話最適合怎樣結束？',
        options: [
          { text: '多謝你哋明白，祝你哋玩得開心。', score: 2, note: '這樣結尾既自然又友善。' },
          { text: '講完就立即行開', score: 1, note: '還可以，但對話結尾較急。' },
          { text: '補一句「真係好煩」', score: 0, note: '最後一句往往最令人記住，這樣會傷害關係。' }
        ]
      }
    ]
  },
  conflict: {
    title: '借文具處理衝突',
    avatar: '😠',
    role: '借文具情境',
    mission: '先控制情緒，再清楚表達自己的界線，必要時尋求老師幫助。',
    location: '上課前',
    socialGoal: '表達界線 + 不升級衝突',
    supportTip: '你可以先說事實，再說需要，例如：「呢支筆係我嘅，可唔可以還返俾我？」',
    hint: '生氣是可以的，但最有效的做法不是搶回來，而是先講清楚。',
    calmPrompt: '如果你很想立刻搶回來，可以先把手放在桌上，吸一口氣，再開口說第一句。',
    intro: '情境：上數學堂前，你發現放在桌上的原子筆被旁邊同學拿了去用，對方沒有先問你。你心裡有點不舒服，但老師已經快要開始上課。',
    steps: [
      {
        prompt: '第 1 步：發現筆被拿走時，第一個反應最理想是？',
        options: [
          { text: '先深呼吸一下，再開口', score: 2, note: '先穩住情緒，後面更容易說清楚。' },
          { text: '馬上很大聲地質問對方', score: 1, note: '你有表達不滿，但容易令事情升級。' },
          { text: '立即伸手搶回來', score: 0, note: '衝動行為很常見，但會讓衝突變大。' }
        ]
      },
      {
        prompt: '第 2 步：你可以怎樣說比較清楚？',
        options: [
          { text: '呢支筆係我嘅，可唔可以先還返俾我？', score: 2, note: '清楚、有禮，也容易讓人合作。' },
          { text: '你做咩偷我嘢？', score: 1, note: '這句容易令對方馬上防衛。' },
          { text: '唔講嘢，只一直望住對方', score: 0, note: '對方可能根本不知道你想他怎樣做。' }
        ]
      },
      {
        prompt: '第 3 步：如果對方回應「我借一陣啫」，你可以怎樣補充？',
        options: [
          { text: '如果你想借，可以先問我，我會舒服啲。', score: 2, note: '你表達了自己的感受，也沒有罵人。' },
          { text: '算啦，但心裡一直好嬲', score: 1, note: '表面停了，但內心沒有真正處理。' },
          { text: '你再唔還我就同你翻臉。', score: 0, note: '威脅會令情況更難收拾。' }
        ]
      },
      {
        prompt: '第 4 步：如果對方仍然不合作，下一步最好是？',
        options: [
          { text: '請老師幫忙處理', score: 2, note: '知道何時找大人協助，是成熟的做法。' },
          { text: '不停和對方爭辯', score: 1, note: '有時愈爭愈亂，快要上課更難處理。' },
          { text: '下課後報復對方', score: 0, note: '這會令事情持續擴大。' }
        ]
      },
      {
        prompt: '第 5 步：事情解決後，你應該怎樣讓自己回到上課狀態？',
        options: [
          { text: '整理情緒，準備好書本，專心上課', score: 2, note: '能回到當下，是很重要的技巧。' },
          { text: '不停和前後同學講對方壞話', score: 1, note: '這只會延長負面情緒。' },
          { text: '整堂課都一直記住件事', score: 0, note: '事情雖過了，但情緒還在困住你。' }
        ]
      }
    ]
  },
  respond: {
    title: '放學前作出回應',
    avatar: '😊',
    role: '放學前情境',
    mission: '讓對方感受到你有在聆聽，並用友善、自然的方式作出回應。',
    location: '放學前',
    socialGoal: '表達你有聽 + 友善回應',
    supportTip: '回應別人喜悅時，可先表示興趣，再加一句支持。',
    hint: '對方最想感受到的，不是你立刻給意見，而是你有在聽、替他高興。',
    calmPrompt: '如果你不知說什麼，可以用固定句型：第一句「真係呀？」第二句「太好啦！」',
    intro: '情境：放學前收拾書包時，同學走過來對你說：「我今日中文默書拎到好高分！」對方看起來很開心，也很想找人分享。',
    steps: [
      {
        prompt: '第 1 步：你第一個行動應該是？',
        options: [
          { text: '望向對方，表示你有在聽', score: 2, note: '先讓對方知道你有留意他。' },
          { text: '立即打斷對方，講返自己嘢', score: 1, note: '太快轉主題，會令對方感覺不被重視。' },
          { text: '繼續執書包，完全唔理', score: 0, note: '對方分享時，如果被忽略會很失落。' }
        ]
      },
      {
        prompt: '第 2 步：第一句回應可以是？',
        options: [
          { text: '真係呀？好勁喎！', score: 2, note: '自然、正面，容易繼續談。' },
          { text: '哦。', score: 1, note: '雖然有回應，但情感支持不多。' },
          { text: '咁又點？', score: 0, note: '這句會讓對方覺得你不在乎。' }
        ]
      },
      {
        prompt: '第 3 步：如果你想延續對話，最適合怎樣問？',
        options: [
          { text: '你今次溫咗幾耐呀？', score: 2, note: '這是和對方分享內容有關的追問。' },
          { text: '其實我今日都幾忙。', score: 1, note: '這樣會把焦點太快轉去自己。' },
          { text: '你講完未？', score: 0, note: '這樣很容易傷害對方。' }
        ]
      },
      {
        prompt: '第 4 步：對方分享完後，你可以怎樣表示支持？',
        options: [
          { text: '太好啦，你一定好開心。', score: 2, note: '這表示你理解對方感受。' },
          { text: '嗯，知道。', score: 1, note: '有回應，但支持感較弱。' },
          { text: '有咩咁值得講？', score: 0, note: '這會令對方以後不想再跟你分享。' }
        ]
      },
      {
        prompt: '第 5 步：最自然的結尾是？',
        options: [
          { text: '恭喜你呀，聽日見！', score: 2, note: '短短一句已經很完整。' },
          { text: '我走先。', score: 1, note: '可以，但少了一點溫度。' },
          { text: '轉身就走，冇再回應', score: 0, note: '對話結尾也需要顧及別人感受。' }
        ]
      }
    ]
  },
  groupwork: {
    title: '小組討論加入合作',
    avatar: '🤝',
    role: '小組合作情境',
    mission: '在小組討論中找到合適時機加入，表達自己的想法，也回應別人的意見。',
    location: '分組活動',
    socialGoal: '加入對話 + 提出可行意見 + 接受分工',
    supportTip: '可以先觀察一小段，再用一句簡單句型加入，例如：「我有一個想法。」',
    hint: '很多 ASD 學生在小組討論不是沒有想法，而是不知道什麼時候說、怎樣說比較自然。',
    calmPrompt: '如果你覺得小組討論很亂，可以先在心裡準備一句固定開場白：「我有一個簡單想法。」',
    intro: '情境：通識／專題課上，老師要四人一組完成簡短海報。你被分到一個小組，但其他同學已經開始討論，你不知道什麼時候插話，也擔心自己說錯。',
    steps: [
      {
        prompt: '第 1 步：其他同學正在講，你最好的開始方式是？',
        options: [
          { text: '先聽幾秒，等一個空位再加入', score: 2, note: '先觀察節奏，容易找到合適時機。' },
          { text: '突然大聲插入自己的想法', score: 1, note: '你有參與，但方式可能打斷別人。' },
          { text: '完全唔講，等別人安排你', score: 0, note: '這很常見，但你可能被忽略。' }
        ]
      },
      {
        prompt: '第 2 步：你準備加入討論，哪一句最自然？',
        options: [
          { text: '我有一個想法，係咪可以試下……？', score: 2, note: '有禮貌，也清楚表示你想參與。' },
          { text: '我唔識，你哋決定啦。', score: 1, note: '表達了不安，但也讓自己更難參與。' },
          { text: '你哋講得唔啱。', score: 0, note: '太快否定別人，容易令氣氛變差。' }
        ]
      },
      {
        prompt: '第 3 步：其中一位組員說「都可以」，你接下來最好怎樣做？',
        options: [
          { text: '簡單講清楚自己想法的內容', score: 2, note: '別人已給你空間，現在要把話說完整。' },
          { text: '只說「冇嘢」然後停住', score: 1, note: '有時太緊張會突然收回想法。' },
          { text: '突然轉講別的自己有興趣的題目', score: 0, note: '這可能偏離任務。' }
        ]
      },
      {
        prompt: '第 4 步：另一位同學提出不同意見，你可以怎樣回應？',
        options: [
          { text: '我明白，你嗰個方法都可以，我哋可唔可以比較下？', score: 2, note: '這樣能表達不同意，又不會太衝。' },
          { text: '算啦，乜都得。', score: 1, note: '避免衝突了，但也失去真正參與。' },
          { text: '唔好改，我覺得我嗰個一定最好。', score: 0, note: '太堅持自己會令合作變難。' }
        ]
      },
      {
        prompt: '第 5 步：老師說還有 5 分鐘完成，你在小組裡最好的做法是？',
        options: [
          { text: '主動接一個清楚任務，例如寫標題或整理資料', score: 2, note: '有明確分工時，參與感會更強。' },
          { text: '坐著等別人叫你做事', score: 1, note: '仍然可以完成，但較被動。' },
          { text: '因為緊張而完全退出討論', score: 0, note: '這會讓你更難累積合作經驗。' }
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
  grid.innerHTML = '';

  Object.keys(badgeMeta).forEach((key) => {
    const meta = badgeMeta[key];
    const unlocked = badgeState[key];
    const div = document.createElement('div');
    div.className = `badge ${unlocked ? 'unlocked' : ''}`;
    div.innerHTML = `
      <span class="badge-icon">${meta.icon}</span>
      <span class="badge-name">${meta.name}</span>
      <span>${unlocked ? '已解鎖' : '未解鎖'}</span>
    `;
    grid.appendChild(div);
  });
}

function updateAchievementRow() {
  const row = document.getElementById('achievementRow');
  const unlocked = Object.values(badgeState).filter(Boolean).length;
  const pills = ['<div class="achievement-pill">校園任務模式</div>'];

  if (unlocked >= 1) pills.push('<div class="achievement-pill">已解鎖首枚徽章</div>');
  if (unlocked >= 3) pills.push('<div class="achievement-pill">穩定練習中</div>');
  if (unlocked === 5) pills.push('<div class="achievement-pill">全情境完成</div>');

  row.innerHTML = pills.join('');
}

function updateGameStatusText() {
  const completed = Object.values(badgeState).filter(Boolean).length;
  appState.completedCount = completed;
  document.getElementById('gameStatusText').textContent =
    `已完成情境：${completed} / 5｜提示使用：${appState.hintCount} 次｜冷靜模式：${appState.calmCount} 次`;
  updateAchievementRow();
}

function setScreen(screen) {
  appState.currentScreen = screen;

  document.getElementById('coverScreen').classList.remove('active');
  document.getElementById('settingsScreen').classList.remove('active');
  document.getElementById('situationScreen').classList.remove('active');
  document.getElementById('gameScreen').classList.remove('active');

  if (screen === 'cover') document.getElementById('coverScreen').classList.add('active');
  if (screen === 'settings') document.getElementById('settingsScreen').classList.add('active');
  if (screen === 'situation') document.getElementById('situationScreen').classList.add('active');
  if (screen === 'game') document.getElementById('gameScreen').classList.add('active');

  saveProgress();
}

function showCoverScreen() { setScreen('cover'); }
function showSettingsScreen() { setScreen('settings'); syncSettingControls(); }
function showSituationScreen() { setScreen('situation'); }
function showGameScreen() {
  setScreen('game');
  renderBadges();
  updateGameStatusText();
}

function getStars(score, maxScore) {
  const ratio = score / maxScore;
  if (ratio >= 0.8) return 3;
  if (ratio >= 0.5) return 2;
  if (ratio > 0) return 1;
  return 0;
}

function renderStars(count) {
  let html = '';
  for (let i = 1; i <= 3; i++) {
    html += i <= count
      ? '<span class="star-filled">★</span>'
      : '<span class="star-empty">★</span>';
  }
  return html;
}

function renderSceneMeta(game) {
  const el = document.getElementById('sceneMeta');
  if (!game) {
    el.classList.add('hidden');
    el.innerHTML = '';
    return;
  }

  el.classList.remove('hidden');
  el.innerHTML = `
    <div class="meta-box"><strong>地點：</strong><br>${game.location}</div>
    <div class="meta-box"><strong>目標：</strong><br>${game.socialGoal}</div>
    <div class="meta-box"><strong>小貼士：</strong><br>${game.supportTip}</div>
  `;
}

function updateReviewList() {
  const list = document.getElementById('reviewList');
  if (appState.reviewHistory.length === 0) {
    list.innerHTML = '<div class="review-item">尚未開始遊戲。</div>';
    return;
  }

  list.innerHTML = appState.reviewHistory
    .slice(-5)
    .reverse()
    .map((item) => `
      <div class="review-item">
        <strong>${item.title}</strong><br>
        第 ${item.step} 步：${item.choice}
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
    '先聽清楚別人說什麼，再回應。',
    '唔想做某件事，可以清楚而有禮貌咁講。',
    '緊張時可以先停一停，深呼吸。',
    '表達感受時，可用「我覺得……」開頭。'
  ];

  const merged = [...customNotes, ...notes].slice(0, 4);
  document.getElementById('quickNotesList').innerHTML =
    merged.map((item) => `<div class="quick-note">${item}</div>`).join('');
}

function updateProgressBar() {
  const game = asdGames[currentAsdGame];
  if (!game) {
    document.getElementById('asdProgressBar').style.width = '0%';
    return;
  }

  const percent = (currentAsdStep / game.steps.length) * 100;
  document.getElementById('asdProgressBar').style.width = `${percent}%`;
}

function startAsdGame(type) {
  currentAsdGame = type;
  currentAsdStep = 0;
  currentAsdScore = 0;
  currentAsdStrengths = [];
  currentAsdImprovements = [];
  currentChoiceNotes = [];

  const game = asdGames[type];
  document.getElementById('characterAvatar').textContent = game.avatar;
  document.getElementById('characterName').textContent = '學生';
  document.getElementById('characterRole').textContent = game.role;
  document.getElementById('characterInfo').innerHTML = `<strong>目前任務：</strong><br>${game.mission}`;

  hideHint();
  hideCalmMode();
  hideInlineReview();
  renderSceneMeta(game);
  updateQuickNotes([game.supportTip, `在 ${game.location} 這個情境中，留意語氣和時機。`]);
  showGameScreen();
  renderAsdStep();
  showToast(`已開始：${game.title}`, 'success');
  saveProgress();
}

function renderAsdStep() {
  const game = asdGames[currentAsdGame];
  if (!game) return;

  const progress = document.getElementById('asdProgressText');
  const box = document.getElementById('asdBox');
  const choices = document.getElementById('asdChoices');
  const step = game.steps[currentAsdStep];

  progress.textContent = `情境：${game.title}｜第 ${currentAsdStep + 1} / ${game.steps.length} 步`;
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

  currentAsdScore += option.score;
  currentChoiceNotes.push(option.note);

  if (option.score === 2) currentAsdStrengths.push(option.text);
  else currentAsdImprovements.push(option.text);

  pushReview(game.title, currentAsdStep + 1, option.text);
  showInlineReview(option.note);
  currentAsdStep += 1;

  if (currentAsdStep >= game.steps.length) showAsdResult();
  else renderAsdStep();
}

function showAsdResult() {
  const game = asdGames[currentAsdGame];
  const maxScore = game.steps.length * 2;
  const starCount = getStars(currentAsdScore, maxScore);
  const box = document.getElementById('asdBox');
  const choices = document.getElementById('asdChoices');
  const progress = document.getElementById('asdProgressText');

  let level = '';
  let overall = '';

  if (currentAsdScore >= 8) {
    level = '表現很好';
    overall = '你能夠用比較合適、平靜和有禮貌的方法處理這個校園情境。';
  } else if (currentAsdScore >= 5) {
    level = '有進步';
    overall = '你已掌握部分社交技巧，但有些地方可以再更自然、更清楚。';
  } else {
    level = '再練習一下';
    overall = '你願意完成全部步驟已經很好，下一次可以多留意語氣、禮貌和結尾方式。';
  }

  const strengths = currentAsdStrengths.length
    ? `<ul>${currentAsdStrengths.slice(0, 4).map((item) => `<li>${item}</li>`).join('')}</ul>`
    : '<p>你有完成整個情境，這已經是一個好開始。</p>';

  const improvements = currentAsdImprovements.length
    ? `<ul>${currentAsdImprovements.slice(0, 4).map((item) => `<li>下次遇到類似情況時，可以比「${item}」更平靜、清楚或有禮貌。</li>`).join('')}</ul>`
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
  progress.textContent = `完成：${game.title}`;
  document.getElementById('asdProgressBar').style.width = '100%';
  document.getElementById('characterInfo').innerHTML =
    `<strong>任務完成：</strong><br>你已完成「${game.title}」，並成功解鎖一枚徽章。`;

  box.innerHTML = `
    <div class="scene-badge">完成結果</div>
    <strong>${game.title} 遊戲結果：${level}</strong>
    <div class="stars">${renderStars(starCount)}</div>
    <div class="summary-box"><strong>整體評語：</strong> ${overall}</div>
    ${noteSummary}
    <div class="result-good"><strong>你做得好的地方：</strong>${strengths}</div>
    <div class="result-improve"><strong>你可以改進的地方：</strong>${improvements}</div>
  `;

  choices.innerHTML = `
    <div class="action-row">
      <button onclick="startAsdGame('${currentAsdGame}')">再玩一次這個情境</button>
      <button class="secondary" onclick="showSituationScreen()">返回情境選擇</button>
      <button class="secondary" onclick="copyResultSummary()">複製結果摘要</button>
    </div>
  `;

  showToast(`已解鎖徽章：${badgeMeta[currentAsdGame].name}`, 'success');
  maybeSpeak(`${game.title} 完成。${level}。${overall}`);
  addAnimateIn(box);
  addAnimateIn(choices);
  saveProgress();
}

function showHint() {
  const game = asdGames[currentAsdGame];
  const box = document.getElementById('hintBox');

  if (!game) {
    showToast('請先開始一個情境。', 'warning');
    return;
  }

  appState.hintCount += 1;
  box.classList.remove('hidden');
  box.innerHTML = `<strong>提示：</strong><br>${game.hint}`;
  updateGameStatusText();
  saveProgress();
}

function hideHint() {
  const box = document.getElementById('hintBox');
  box.classList.add('hidden');
  box.innerHTML = '';
}

function showCalmMode() {
  const game = asdGames[currentAsdGame];
  const box = document.getElementById('calmBox');

  appState.calmCount += 1;
  box.classList.remove('hidden');
  box.innerHTML = game
    ? `<strong>冷靜模式：</strong><br>${game.calmPrompt}<br><br><strong>呼吸提示：</strong>吸氣 4 秒 → 停 2 秒 → 呼氣 4 秒。`
    : `<strong>冷靜模式：</strong><br>吸氣 4 秒、停 2 秒、呼氣 4 秒。等自己穩定後，再開始一個情境。`;

  updateGameStatusText();
  saveProgress();
}

function hideCalmMode() {
  const box = document.getElementById('calmBox');
  box.classList.add('hidden');
  box.innerHTML = '';
}

function showInlineReview(text) {
  const box = document.getElementById('reviewBoxInline');
  box.classList.remove('hidden');
  box.innerHTML = `<strong>即時回顧：</strong><br>${text}`;
}

function hideInlineReview() {
  const box = document.getElementById('reviewBoxInline');
  box.classList.add('hidden');
  box.innerHTML = '';
}

function copyResultSummary() {
  const box = document.getElementById('asdBox');
  const text = box.innerText.trim();

  if (!text) {
    showToast('目前沒有可複製的內容。', 'warning');
    return;
  }

  navigator.clipboard.writeText(text)
    .then(() => showToast('已複製結果摘要', 'success'))
    .catch(() => showToast('複製失敗，請手動複製。', 'warning'));
}

function saveJournal() {
  const input = document.getElementById('journalInput');
  appState.lastJournal = input.value.trim();
  saveProgress();

  if (!appState.lastJournal) {
    showToast('日誌是空白，已保留空內容。', 'warning');
    return;
  }

  showToast('已儲存日誌', 'success');
}

function loadJournalToBox() {
  const box = document.getElementById('asdBox');

  if (!appState.lastJournal) {
    box.innerHTML = `
      <div class="scene-badge">反思日誌</div>
      <div class="summary-box">目前還沒有已儲存的日誌。</div>
    `;
    return;
  }

  box.innerHTML = `
    <div class="scene-badge">反思日誌</div>
    <div class="summary-box"><strong>最近日誌：</strong><br>${escapeHtml(appState.lastJournal).replace(/\n/g, '<br>')}</div>
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
  appState.speechEnabled = toggle.checked;
  saveProgress();
  showToast(appState.speechEnabled ? '已開啟語音朗讀' : '已關閉語音朗讀', 'success');
  if (!appState.speechEnabled) stopSpeech();
}

function handleContrastToggle() {
  const toggle = document.getElementById('contrastToggle');
  appState.highContrast = toggle.checked;
  applyContrastMode();
  saveProgress();
  showToast(appState.highContrast ? '已開啟高對比模式' : '已關閉高對比模式', 'success');
}

function handleMotionToggle() {
  const toggle = document.getElementById('motionToggle');
  appState.reducedMotion = toggle.checked;
  applyReducedMotion();
  saveProgress();
  showToast(appState.reducedMotion ? '已減少動畫' : '已恢復動畫', 'success');
}

function toggleSpeech() {
  appState.speechEnabled = !appState.speechEnabled;
  syncSettingControls();
  saveProgress();
  showToast(appState.speechEnabled ? '已開啟語音朗讀' : '已關閉語音朗讀', 'success');
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
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
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
  const text = box.innerText.trim();

  if (!text) {
    showToast('目前沒有可朗讀的內容。', 'warning');
    return;
  }

  if (!appState.speechEnabled) {
    showToast('請先在設定中開啟語音朗讀。', 'warning');
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

    if (data.appState) Object.assign(appState, data.appState);

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

    if (appState.lastJournal) {
      document.getElementById('journalInput').value = appState.lastJournal;
    }

    if (appState.currentScreen === 'settings') showSettingsScreen();
    else if (appState.currentScreen === 'situation') showSituationScreen();
    else if (appState.currentScreen === 'game') showGameScreen();
    else showCoverScreen();

    if (currentAsdGame && asdGames[currentAsdGame]) {
      const game = asdGames[currentAsdGame];
      document.getElementById('characterAvatar').textContent = game.avatar;
      document.getElementById('characterName').textContent = '學生';
      document.getElementById('characterRole').textContent = game.role;

      if (currentAsdStep >= game.steps.length) {
        document.getElementById('characterInfo').innerHTML =
          `<strong>任務完成：</strong><br>你已完成「${game.title}」，並成功解鎖一枚徽章。`;
        renderSceneMeta(game);
        showAsdResult();
      } else {
        document.getElementById('characterInfo').innerHTML =
          `<strong>目前任務：</strong><br>${game.mission}`;
        renderSceneMeta(game);
        if (appState.currentScreen === 'game') renderAsdStep();
      }
    }
  } catch (error) {
    console.error(error);
    localStorage.removeItem(STORAGE_KEY);
    showToast('讀取存檔失敗，已重設本地資料。', 'warning');
  }
}

function resetAllData() {
  const confirmed = window.confirm('你確定要清除所有資料嗎？這會刪除徽章、設定、進度和日誌。');
  if (!confirmed) return;

  localStorage.removeItem(STORAGE_KEY);

  Object.keys(badgeState).forEach((key) => { badgeState[key] = false; });

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

  document.getElementById('journalInput').value = '';
  document.getElementById('characterAvatar').textContent = '🧑';
  document.getElementById('characterName').textContent = '學生';
  document.getElementById('characterRole').textContent = '主角';
  document.getElementById('characterInfo').innerHTML =
    '<strong>目前任務：</strong><br>先從情境選擇頁開始你的校園社交挑戰。';
  document.getElementById('asdBox').innerHTML = '這裡會顯示故事背景、題目和最後結果。';
  document.getElementById('asdChoices').innerHTML = '';
  document.getElementById('asdProgressText').textContent = '請先從情境選擇頁開始一個情境。';
  document.getElementById('asdProgressBar').style.width = '0%';

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
  showToast('已清除所有資料', 'success');
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
