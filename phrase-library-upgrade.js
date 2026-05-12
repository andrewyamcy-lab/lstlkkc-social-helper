// /phrase-library-upgrade.js
// Full-width ASD-focused「社交技能書」upgrade.
// This file intentionally replaces only the old skill-book rendering; no new file is needed.

(function () {
  const FAV_KEY = 'asd_school_phrase_favourites_v1';
  const STATE_KEY = 'asd_school_phrase_library_state_v3';
  const PAGE_SIZE = 8;

  const CATEGORIES = [
    { id: 'all', label: '全部', icon: '📘' },
    { id: 'anxious', label: '我緊張', icon: '😟' },
    { id: 'angry', label: '我嬲', icon: '😠' },
    { id: 'join', label: '想加入', icon: '🗣️' },
    { id: 'refuse', label: '想拒絕', icon: '🙅' },
    { id: 'boundary', label: '要界線', icon: '🛡️' },
    { id: 'help', label: '想求助', icon: '🙋' },
    { id: 'favourites', label: '安全句', icon: '⭐' }
  ];

  const PHRASES = [
    { id:'j1', category:'join', icon:'🗣️', title:'想加入同學', text:'你好，我可以坐喺附近嗎？', short:'我可以坐附近嗎？', situation:'想加入同學附近位置時', why:'先問一問，對方會較容易接受。', next:'如果對方說不可以，就選另一個位置或找另一位同學。', unsafe:'我就係要坐呢度。', level:1 },
    { id:'j2', category:'join', icon:'🗣️', title:'開始對話', text:'你今日上邊一課呀？', short:'你上邊一課？', situation:'想自然開始聊天時', why:'問題簡單，對方容易回答。', next:'聽完答案後，可以講「哦，明白」。', unsafe:'喂，你講嘢啦。', level:1 },
    { id:'j3', category:'join', icon:'🗣️', title:'確認資料', text:'我想問下你啱啱老師講咗咩？', short:'老師講咗咩？', situation:'課堂後不清楚老師指示時', why:'清楚講出自己想知道的內容。', next:'如果同學也不知道，就問老師。', unsafe:'你快啲話我知。', level:2 },
    { id:'j4', category:'join', icon:'🗣️', title:'打招呼', text:'早晨，我想同你打個招呼。', short:'早晨。', situation:'早上見到同學時', why:'簡單打招呼能建立友善開始。', next:'對方有回應就微笑或點頭。', unsafe:'你點解唔應我？', level:1 },

    { id:'r1', category:'refuse', icon:'🙅', title:'禮貌拒絕', text:'多謝你邀請我，但我而家想休息一陣。', short:'我想休息一陣。', situation:'小息想休息，不想參加活動時', why:'有禮貌地拒絕，也說出自己的需要。', next:'如果對方再問，可以重複一次。', unsafe:'唔好煩我。', level:1 },
    { id:'r2', category:'refuse', icon:'🙅', title:'保留關係地拒絕', text:'我今日未必參加到，下次再一齊可以嗎？', short:'下次再一齊可以嗎？', situation:'被邀請但今天不想參加時', why:'拒絕同時保留下一次機會。', next:'下次想參加時可以主動問。', unsafe:'我唔想同你玩。', level:2 },
    { id:'r3', category:'refuse', icon:'🙅', title:'想安靜', text:'我而家想自己安靜一陣，多謝你明白。', short:'我想安靜一陣。', situation:'覺得聲音太多或想獨處時', why:'直接說出需要，語氣仍然禮貌。', next:'可以去較安靜的位置。', unsafe:'你哋全部唔好嘈。', level:2 },
    { id:'r4', category:'refuse', icon:'🙅', title:'避免別人誤會', text:'我唔係唔鍾意你哋，只係而家有少少攰。', short:'我有少少攰。', situation:'怕同學以為自己不喜歡他們時', why:'解釋原因，減少誤會。', next:'休息後可以再決定是否加入。', unsafe:'你哋唔明㗎啦。', level:3 },

    { id:'b1', category:'boundary', icon:'🛡️', title:'被取笑時', text:'你咁講我會唔舒服，請你唔好再講。', short:'請你唔好再講。', situation:'聽到令自己不舒服的說話時', why:'清楚講出感受和要求。', next:'如果對方繼續，離開並找老師協助。', unsafe:'你再講我就鬧你。', level:3 },
    { id:'b2', category:'boundary', icon:'🛡️', title:'保護物品', text:'我唔鍾意人未問我就攞我嘅嘢。', short:'請先問我。', situation:'同學未問就拿走自己的物品時', why:'讓對方知道規則：先問，再借。', next:'把物品收好，必要時找老師。', unsafe:'你偷我嘢。', level:2 },
    { id:'b3', category:'boundary', icon:'🛡️', title:'需要空間', text:'我需要少少空間，請你停一停。', short:'請停一停。', situation:'別人太近或持續打擾時', why:'短句清楚，容易在緊張時使用。', next:'向後退一步或去安全位置。', unsafe:'你走開啦。', level:2 },
    { id:'b4', category:'boundary', icon:'🛡️', title:'借東西規則', text:'如果你想借，可以先問我。', short:'可以先問我。', situation:'別人想借東西但沒有先問時', why:'不是直接拒絕，而是教對方正確方法。', next:'對方有禮貌問時，再決定借不借。', unsafe:'我一定唔借。', level:1 },

    { id:'h1', category:'help', icon:'🙋', title:'向老師求助', text:'老師，我想請你幫一幫我。', short:'老師，可以幫我嗎？', situation:'遇到困難但未能自己處理時', why:'簡單直接，老師容易明白你需要協助。', next:'簡單說出發生甚麼事。', unsafe:'老師你快啲嚟。', level:1 },
    { id:'h2', category:'help', icon:'🙋', title:'不知道怎樣做', text:'我而家有少少唔知點處理，可以同你講嗎？', short:'我唔知點處理。', situation:'情緒混亂或不知道下一步時', why:'先說出自己卡住了，不需要一次過解釋全部。', next:'找老師、社工或可信任成人。', unsafe:'算啦，冇人會幫我。', level:2 },
    { id:'h3', category:'help', icon:'🙋', title:'同學令我不舒服', text:'剛才有同學令我不舒服，我想請你協助。', short:'有同學令我不舒服。', situation:'與同學有衝突或被冒犯時', why:'說出事件和求助目的。', next:'講清楚時間、地點、對方做了甚麼。', unsafe:'我要投訴佢。', level:2 },
    { id:'h4', category:'anxious', icon:'😟', title:'快要爆發前', text:'我想冷靜一下，可以去安全位置嗎？', short:'我想冷靜一下。', situation:'情緒快要爆發前', why:'先離開刺激環境，有助減少衝突。', next:'去安全位置，深呼吸，等情緒下降。', unsafe:'我控制唔到啦。', level:3 },

    { id:'a1', category:'anxious', icon:'😟', title:'感到緊張', text:'我有少少緊張，可以慢慢講嗎？', short:'我有少少緊張。', situation:'被要求即時回答時', why:'讓對方知道你需要更多時間。', next:'慢慢講一句，不需要一次講完。', unsafe:'我唔講呀。', level:1 },
    { id:'a2', category:'anxious', icon:'😟', title:'需要時間', text:'我需要諗一諗，等一等可以嗎？', short:'等一等可以嗎？', situation:'未準備好回答時', why:'清楚要求等待時間。', next:'想好後再回答，或請老師重複問題。', unsafe:'你唔好催我。', level:1 },
    { id:'ang1', category:'angry', icon:'😠', title:'生氣時停一停', text:'我而家有啲嬲，我想先冷靜一下。', short:'我想先冷靜。', situation:'開始生氣但仍能控制時', why:'先處理情緒，避免講傷人的說話。', next:'離開刺激位置，等冷靜後再處理。', unsafe:'我真係好嬲你。', level:2 },
    { id:'ang2', category:'angry', icon:'😠', title:'衝突中', text:'我想停一停，之後再講。', short:'之後再講。', situation:'對話快要變成爭吵時', why:'暫停比繼續爭拗安全。', next:'找老師或社工協助再溝通。', unsafe:'你收聲啦。', level:2 }
  ];

  function safeJson(key) { try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch (e) { return {}; } }
  function saveJson(key, value) { try { localStorage.setItem(key, JSON.stringify(value || {})); } catch (e) {} }
  function esc(value) { return String(value || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;').replace(/'/g,'&#039;'); }
  function toast(message, type) { if (typeof window.showToast === 'function') window.showToast(message, type || 'success'); }

  function getState() {
    const state = safeJson(STATE_KEY);
    return {
      category: CATEGORIES.some((item) => item.id === state.category) ? state.category : 'all',
      query: String(state.query || ''),
      page: Math.max(0, Number(state.page || 0)),
      showShort: state.showShort !== false
    };
  }

  function setState(partial) { saveJson(STATE_KEY, Object.assign({}, getState(), partial || {})); }
  function favourites() { return safeJson(FAV_KEY).items || {}; }
  function saveFavourites(items) { saveJson(FAV_KEY, { items: items || {} }); }
  function levelStars(level) { const count = Math.max(1, Math.min(3, Number(level || 1))); return '⭐'.repeat(count) + '☆'.repeat(3 - count); }

  function filteredPhrases() {
    const state = getState();
    const fav = favourites();
    const q = state.query.trim().toLowerCase();
    return PHRASES.filter(function (item) {
      const matchCategory = state.category === 'all' || (state.category === 'favourites' ? fav[item.id] : item.category === state.category);
      const haystack = [item.text, item.short, item.title, item.situation, item.why, item.next, item.unsafe].join(' ').toLowerCase();
      return matchCategory && (!q || haystack.indexOf(q) >= 0);
    });
  }

  function pageData() {
    const items = filteredPhrases();
    const maxPage = Math.max(0, Math.ceil(items.length / PAGE_SIZE) - 1);
    const state = getState();
    const page = Math.min(state.page, maxPage);
    return { items, page, maxPage, visible: items.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE) };
  }

  function heroHtml() {
    const state = getState();
    return `
      <div class="phrase-hero-panel">
        <div>
          <div class="tag">ASD 社交技能書</div>
          <h2>我可以點講？</h2>
          <p>用「情境 → 可以講 → 為甚麼 → 下一步」幫學生選擇安全句。</p>
        </div>
        <button type="button" class="phrase-mode-btn" data-phrase-mode="short">${state.showShort ? '短句版：開' : '短句版：關'}</button>
      </div>`;
  }

  function controlsHtml() {
    const state = getState();
    return `
      <div class="phrase-control-panel">
        <label class="phrase-search-box">
          <span>搜尋情緒 / 情境 / 句子</span>
          <input id="phraseSearchInput" type="search" placeholder="緊張、嬲、借筆、老師、不舒服" value="${esc(state.query)}" />
        </label>
        <div class="phrase-tabs" role="tablist">
          ${CATEGORIES.map((cat) => `<button type="button" class="phrase-tab ${cat.id === state.category ? 'active' : ''}" data-phrase-category="${cat.id}">${cat.icon} ${cat.label}</button>`).join('')}
        </div>
      </div>`;
  }

  function phraseCardHtml(item) {
    const state = getState();
    const fav = favourites();
    const isFav = Boolean(fav[item.id]);
    const displayText = state.showShort ? item.short : item.text;
    return `
      <article class="phrase-card" data-phrase-id="${esc(item.id)}">
        <div class="phrase-card-top">
          <div class="phrase-card-badge">${item.icon} ${esc(item.title)}</div>
          <button type="button" class="phrase-fav-btn ${isFav ? 'active' : ''}" data-phrase-fav="${esc(item.id)}" title="加入安全句">${isFav ? '★' : '☆'}</button>
        </div>
        <div class="phrase-situation-line"><strong>情境：</strong>${esc(item.situation)}</div>
        <h3><span>我可以講：</span>${esc(displayText)}</h3>
        <div class="phrase-asd-grid">
          <div class="good"><span>✅ 為甚麼</span><strong>${esc(item.why)}</strong></div>
          <div class="next"><span>➡️ 下一步</span><strong>${esc(item.next)}</strong></div>
        </div>
        <div class="phrase-avoid"><span>🔴 不建議：</span>${esc(item.unsafe)}</div>
        <div class="phrase-card-actions">
          <button type="button" data-phrase-copy="${esc(item.id)}">複製</button>
          <button type="button" class="secondary" data-phrase-practice="${esc(item.id)}">步驟</button>
          <span class="level-pill">${levelStars(item.level)}</span>
        </div>
      </article>`;
  }

  function paginationHtml(data) {
    const start = data.items.length ? data.page * PAGE_SIZE + 1 : 0;
    const end = Math.min(data.items.length, data.page * PAGE_SIZE + PAGE_SIZE);
    return `<div class="phrase-pager"><button type="button" class="secondary" data-phrase-page="prev" ${data.page <= 0 ? 'disabled' : ''}>← 上一頁</button><span>${start}-${end} / ${data.items.length}</span><button type="button" class="secondary" data-phrase-page="next" ${data.page >= data.maxPage ? 'disabled' : ''}>下一頁 →</button></div>`;
  }

  function listHtml() {
    const data = pageData();
    if (!data.items.length) return '<div class="phrase-empty-card">暫時找不到。可試：緊張、嬲、借筆、老師、不舒服。</div>';
    return `<div class="phrase-card-grid">${data.visible.map(phraseCardHtml).join('')}</div>${paginationHtml(data)}`;
  }

  function actionsHtml() {
    return `<div class="welcome-actions phrase-actions"><button class="secondary" onclick="showCoverScreen && showCoverScreen()">返回開始頁</button><button onclick="showSituationScreen && showSituationScreen()">前往情境選擇</button><button class="secondary" onclick="window.showCharacterScreen && window.showCharacterScreen()">我的角色</button><button class="secondary" onclick="showSettingsScreen && showSettingsScreen()">我的設定</button></div>`;
  }

  function render() {
    injectStyles();
    document.body.classList.add('phrase-library-wide-mode');
    const screen = document.getElementById('phraseLibraryScreen');
    if (!screen) return;
    screen.innerHTML = `<div class="hero-card phrase-library-page phrase-compact-page animate-in">${heroHtml()}${controlsHtml()}${listHtml()}${actionsHtml()}</div>`;
    bindEvents();
  }

  function removeWideModeWhenAway() {
    const screen = document.getElementById('phraseLibraryScreen');
    if (!screen || !screen.classList.contains('active')) document.body.classList.remove('phrase-library-wide-mode');
  }

  function copyPhrase(id) {
    const item = PHRASES.find((phrase) => phrase.id === id);
    if (!item) return;
    const state = getState();
    const text = state.showShort ? item.short : item.text;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => toast('已複製安全句', 'success')).catch(() => window.prompt('複製以下句子：', text));
    } else window.prompt('複製以下句子：', text);
  }

  function showSteps(id) {
    const item = PHRASES.find((phrase) => phrase.id === id);
    if (!item) return;
    window.alert('ASD 社交步驟\n\n1. 停一停\n2. 深呼吸一次\n3. 望向對方或望附近\n4. 講：' + item.text + '\n5. 等對方回應\n6. 如果仍然不舒服：' + item.next);
  }

  function toggleFav(id) {
    const fav = favourites();
    if (fav[id]) { delete fav[id]; toast('已移除安全句', 'success'); }
    else { fav[id] = true; toast('已加入安全句', 'success'); }
    saveFavourites(fav); render();
  }

  function changePage(direction) {
    const data = pageData();
    const next = direction === 'next' ? Math.min(data.maxPage, data.page + 1) : Math.max(0, data.page - 1);
    setState({ page: next }); render();
  }

  function bindEvents() {
    const screen = document.getElementById('phraseLibraryScreen');
    if (!screen || screen.__phraseLibraryBound) return;
    screen.__phraseLibraryBound = true;
    screen.addEventListener('input', function (event) {
      if (event.target && event.target.id === 'phraseSearchInput') {
        setState({ query: event.target.value || '', page: 0 });
        render();
        const input = document.getElementById('phraseSearchInput');
        if (input) { input.focus(); try { input.setSelectionRange(input.value.length, input.value.length); } catch (e) {} }
      }
    });
    screen.addEventListener('click', function (event) {
      const categoryBtn = event.target.closest('[data-phrase-category]');
      const copyBtn = event.target.closest('[data-phrase-copy]');
      const favBtn = event.target.closest('[data-phrase-fav]');
      const practiceBtn = event.target.closest('[data-phrase-practice]');
      const pageBtn = event.target.closest('[data-phrase-page]');
      const modeBtn = event.target.closest('[data-phrase-mode]');
      if (categoryBtn) { setState({ category: categoryBtn.getAttribute('data-phrase-category') || 'all', page: 0 }); render(); return; }
      if (copyBtn) { copyPhrase(copyBtn.getAttribute('data-phrase-copy')); return; }
      if (favBtn) { toggleFav(favBtn.getAttribute('data-phrase-fav')); return; }
      if (practiceBtn) { showSteps(practiceBtn.getAttribute('data-phrase-practice')); return; }
      if (pageBtn) { changePage(pageBtn.getAttribute('data-phrase-page')); return; }
      if (modeBtn) { setState({ showShort: !getState().showShort }); render(); }
    });
  }

  function patchNavigation() {
    const fn = window.showPhraseLibraryScreen;
    if (typeof fn === 'function' && !fn.__phraseLibraryUpgradeWrapped) {
      window.showPhraseLibraryScreen = function () { const result = fn.apply(this, arguments); setTimeout(render, 0); setTimeout(render, 120); return result; };
      window.showPhraseLibraryScreen.__phraseLibraryUpgradeWrapped = true;
    }
    ['showCoverScreen','showBadgeScreen','showSettingsScreen','showSituationScreen','showCharacterScreen','openRpgMap'].forEach(function (name) {
      const nav = window[name];
      if (typeof nav !== 'function' || nav.__phraseWideModeCleanup) return;
      window[name] = function () { const result = nav.apply(this, arguments); setTimeout(removeWideModeWhenAway, 0); return result; };
      window[name].__phraseWideModeCleanup = true;
    });
  }

  function injectStyles() {
    let style = document.getElementById('phraseLibraryUpgradeStyle');
    if (!style) { style = document.createElement('style'); style.id = 'phraseLibraryUpgradeStyle'; document.head.appendChild(style); }
    style.textContent = `
      body.phrase-library-wide-mode .container { max-width: min(1760px, 98vw) !important; width: 98vw !important; margin-top: 18px !important; padding: 0 12px !important; }
      body.phrase-library-wide-mode .card { padding: 16px !important; }
      body.phrase-library-wide-mode #phraseLibraryScreen { text-align:left !important; padding:0 !important; }
      body.phrase-library-wide-mode footer { padding-top: 4px !important; }
      .phrase-library-page { text-align:left; }
      .phrase-compact-page { padding:16px !important; max-height:calc(100vh - 210px); overflow:hidden; border-radius:28px !important; }
      .phrase-hero-panel { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:13px 16px; border-radius:22px; background:radial-gradient(circle at 14% 12%, rgba(57,255,20,.18), transparent 28%), linear-gradient(145deg, rgba(255,255,255,.84), rgba(236,247,255,.62)); border:1px solid rgba(255,255,255,.82); box-shadow:var(--soft-shadow), inset 0 1px 0 rgba(255,255,255,.92); }
      .phrase-hero-panel .tag { margin-bottom:5px; padding:5px 10px; font-size:.76rem; }
      .phrase-hero-panel h2 { margin:0 0 2px; font-size:clamp(1.35rem,2vw,1.85rem); }
      .phrase-hero-panel p { margin:0; color:var(--muted); font-weight:800; line-height:1.3; font-size:.9rem; }
      .phrase-mode-btn { border:0; border-radius:999px; padding:9px 13px; white-space:nowrap; font-weight:950; color:#083b00; background:linear-gradient(180deg, rgba(57,255,20,.38), rgba(255,255,255,.78)); box-shadow:inset 0 1px 0 rgba(255,255,255,.92), 0 8px 18px rgba(57,255,20,.12); }
      .phrase-control-panel { margin-top:8px; padding:9px 11px; border-radius:20px; background:rgba(255,255,255,.58); border:1px solid rgba(255,255,255,.78); box-shadow:var(--soft-shadow), inset 0 1px 0 rgba(255,255,255,.88); }
      .phrase-search-box { display:grid; gap:3px; }
      .phrase-search-box span { color:var(--muted); font-size:.78rem; font-weight:900; }
      .phrase-search-box input { width:100%; border:1px solid rgba(0,122,255,.18); border-radius:14px; padding:8px 10px; font-size:.92rem; font-weight:850; background:rgba(255,255,255,.80); outline:none; }
      .phrase-tabs { display:flex; flex-wrap:wrap; gap:6px; margin-top:7px; }
      .phrase-tab { border:0; border-radius:999px; padding:6px 9px; font-size:.82rem; font-weight:950; color:var(--primary-dark); background:rgba(255,255,255,.70); box-shadow:inset 0 1px 0 rgba(255,255,255,.9), 0 5px 12px rgba(29,53,87,.06); cursor:pointer; }
      .phrase-tab.active { color:#083b00; background:linear-gradient(180deg, rgba(57,255,20,.42), rgba(255,255,255,.76)); box-shadow:0 0 0 3px rgba(57,255,20,.14), inset 0 1px 0 rgba(255,255,255,.92); }
      .phrase-card-grid { margin-top:9px; display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:10px; }
      .phrase-card,.phrase-empty-card { min-height:178px; border-radius:20px; padding:11px; background:rgba(255,255,255,.64); border:1px solid rgba(255,255,255,.80); box-shadow:var(--soft-shadow), inset 0 1px 0 rgba(255,255,255,.88); }
      .phrase-card-top { display:flex; align-items:center; justify-content:space-between; gap:7px; }
      .phrase-card-badge { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:78%; border-radius:999px; padding:4px 8px; font-weight:950; font-size:.7rem; color:#1f6f00; background:rgba(57,255,20,.15); }
      .phrase-fav-btn { border:0; width:32px; height:28px; border-radius:999px; font-weight:950; color:var(--primary-dark); background:rgba(255,255,255,.76); box-shadow:inset 0 1px 0 rgba(255,255,255,.92), 0 5px 10px rgba(29,53,87,.08); cursor:pointer; }
      .phrase-fav-btn.active { color:#8a5200; background:rgba(255,199,0,.22); }
      .phrase-situation-line { margin-top:7px; color:var(--muted); font-size:.78rem; font-weight:850; line-height:1.25; display:-webkit-box; -webkit-line-clamp:1; -webkit-box-orient:vertical; overflow:hidden; }
      .phrase-card h3 { margin:7px 0; min-height:42px; font-size:.96rem; line-height:1.38; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
      .phrase-card h3 span { display:block; color:#1f6f00; font-size:.76rem; font-weight:950; margin-bottom:1px; }
      .phrase-asd-grid { display:grid; grid-template-columns:1fr 1fr; gap:6px; }
      .phrase-asd-grid div { border-radius:13px; padding:6px 7px; background:rgba(255,255,255,.58); border:1px solid rgba(255,255,255,.72); min-height:48px; }
      .phrase-asd-grid span { display:block; color:var(--muted); font-size:.68rem; font-weight:950; margin-bottom:1px; }
      .phrase-asd-grid strong { display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; color:var(--text); font-size:.72rem; line-height:1.25; }
      .phrase-avoid { margin-top:6px; padding:5px 7px; border-radius:12px; color:#9b1c15; background:rgba(255,69,58,.08); font-size:.73rem; font-weight:850; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
      .phrase-avoid span { font-weight:950; }
      .phrase-card-actions { display:flex; align-items:center; flex-wrap:wrap; gap:6px; margin-top:7px; }
      .phrase-card-actions button { border:0; border-radius:999px; padding:6px 9px; font-size:.78rem; font-weight:950; cursor:pointer; color:#083b00; background:linear-gradient(180deg, rgba(57,255,20,.36), rgba(255,255,255,.76)); box-shadow:inset 0 1px 0 rgba(255,255,255,.92), 0 5px 12px rgba(57,255,20,.10); }
      .phrase-card-actions button.secondary { color:var(--primary-dark); background:rgba(255,255,255,.74); }
      .level-pill { margin-left:auto; font-size:.72rem; font-weight:900; color:var(--muted); }
      .phrase-pager { margin-top:7px; display:flex; align-items:center; justify-content:center; gap:10px; font-size:.84rem; font-weight:900; color:var(--muted); }
      .phrase-pager button { border:0; border-radius:999px; padding:6px 12px; font-weight:950; cursor:pointer; background:rgba(255,255,255,.72); color:var(--primary-dark); box-shadow:inset 0 1px 0 rgba(255,255,255,.92), 0 5px 12px rgba(29,53,87,.07); }
      .phrase-pager button:disabled { opacity:.42; cursor:not-allowed; }
      .phrase-actions { margin-top:7px; justify-content:flex-start; gap:8px; }
      .phrase-actions button { padding:8px 11px; font-size:.86rem; }
      @media (max-width:1300px){ .phrase-card-grid{grid-template-columns:repeat(3,minmax(0,1fr));} .phrase-compact-page{max-height:none; overflow:visible;} }
      @media (max-width:900px){ .phrase-card-grid{grid-template-columns:repeat(2,minmax(0,1fr));} .phrase-compact-page{max-height:none; overflow:visible;} }
      @media (max-width:640px){ body.phrase-library-wide-mode .container{width:auto!important;} .phrase-card-grid{grid-template-columns:1fr;} .phrase-asd-grid{grid-template-columns:1fr;} .phrase-hero-panel{align-items:flex-start; flex-direction:column;} .phrase-compact-page{max-height:none; overflow:visible;} }
    `;
  }

  function install() {
    injectStyles();
    patchNavigation();
    if (document.getElementById('phraseLibraryScreen') && document.getElementById('phraseLibraryScreen').classList.contains('active')) render();
    setTimeout(patchNavigation, 300);
    setTimeout(patchNavigation, 900);
  }

  window.renderPhraseLibraryUpgrade = render;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install);
  else install();
  window.addEventListener('load', install);
})();
