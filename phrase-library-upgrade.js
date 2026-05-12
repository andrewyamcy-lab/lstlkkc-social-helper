// /phrase-library-upgrade.js
// Compact one-page upgrade for「社交技能書」: search, tabs, favourites, copy, pagination.

(function () {
  const FAV_KEY = 'asd_school_phrase_favourites_v1';
  const STATE_KEY = 'asd_school_phrase_library_state_v2';
  const PAGE_SIZE = 6;

  const CATEGORIES = [
    { id: 'all', label: '全部', icon: '📘' },
    { id: 'greeting', label: '打招呼', icon: '🗣️' },
    { id: 'refuse', label: '拒絕', icon: '🙅' },
    { id: 'boundary', label: '界線', icon: '🛡️' },
    { id: 'help', label: '求助', icon: '🙋' },
    { id: 'teamwork', label: '合作', icon: '🤝' },
    { id: 'repair', label: '道歉', icon: '🌱' },
    { id: 'favourites', label: '收藏', icon: '⭐' }
  ];

  const PHRASES = [
    { id: 'g1', category: 'greeting', icon: '🗣️', title: '打招呼 / 開始對話', text: '早晨，我想同你打個招呼。', level: 1, situation: '早上見到同學時', skill: '主動開始對話' },
    { id: 'g2', category: 'greeting', icon: '🗣️', title: '打招呼 / 開始對話', text: '你好，我可以坐喺附近嗎？', level: 1, situation: '想加入同學附近位置時', skill: '禮貌加入' },
    { id: 'g3', category: 'greeting', icon: '🗣️', title: '打招呼 / 開始對話', text: '你今日上邊一課呀？', level: 1, situation: '想自然開始聊天時', skill: '找共同話題' },
    { id: 'g4', category: 'greeting', icon: '🗣️', title: '打招呼 / 開始對話', text: '我想問下你啱啱老師講咗咩？', level: 2, situation: '課堂後想確認資訊時', skill: '清楚提問' },
    { id: 'r1', category: 'refuse', icon: '🙅', title: '禮貌拒絕', text: '多謝你邀請我，但我而家想休息一陣。', level: 1, situation: '小息想休息時', skill: '溫和拒絕' },
    { id: 'r2', category: 'refuse', icon: '🙅', title: '禮貌拒絕', text: '我今日未必參加到，下次再一齊可以嗎？', level: 2, situation: '被邀請但不想參加時', skill: '保留關係地拒絕' },
    { id: 'r3', category: 'refuse', icon: '🙅', title: '禮貌拒絕', text: '我而家想自己安靜一陣，多謝你明白。', level: 2, situation: '想獨處或冷靜時', skill: '表達需要' },
    { id: 'r4', category: 'refuse', icon: '🙅', title: '禮貌拒絕', text: '我唔係唔鍾意你哋，只係而家有少少攰。', level: 3, situation: '怕別人誤會自己時', skill: '解釋原因' },
    { id: 'b1', category: 'boundary', icon: '🛡️', title: '表達不舒服 / 設立界線', text: '你咁講我會唔舒服，請你唔好再講。', level: 3, situation: '被取笑或聽到不舒服說話時', skill: '清楚設立界線' },
    { id: 'b2', category: 'boundary', icon: '🛡️', title: '表達不舒服 / 設立界線', text: '我唔鍾意人未問我就攞我嘅嘢。', level: 2, situation: '同學未問就拿走物品時', skill: '表達物品界線' },
    { id: 'b3', category: 'boundary', icon: '🛡️', title: '表達不舒服 / 設立界線', text: '我需要少少空間，請你停一停。', level: 2, situation: '別人太近或持續打擾時', skill: '提出空間需要' },
    { id: 'b4', category: 'boundary', icon: '🛡️', title: '表達不舒服 / 設立界線', text: '如果你想借，可以先問我。', level: 1, situation: '別人想借東西時', skill: '提醒正確做法' },
    { id: 'h1', category: 'help', icon: '🙋', title: '向老師 / 社工求助', text: '老師，我想請你幫一幫我。', level: 1, situation: '遇到困難但未能自己處理時', skill: '主動求助' },
    { id: 'h2', category: 'help', icon: '🙋', title: '向老師 / 社工求助', text: '我而家有少少唔知點處理，可以同你講嗎？', level: 2, situation: '情緒混亂或不知道怎樣做時', skill: '表達困難' },
    { id: 'h3', category: 'help', icon: '🙋', title: '向老師 / 社工求助', text: '剛才有同學令我不舒服，我想請你協助。', level: 2, situation: '與同學有衝突時', skill: '說明事件' },
    { id: 'h4', category: 'help', icon: '🙋', title: '向老師 / 社工求助', text: '我想冷靜一下，可以去安全位置嗎？', level: 3, situation: '情緒快要爆發前', skill: '安全冷靜' },
    { id: 't1', category: 'teamwork', icon: '🤝', title: '小組合作 / 接受不同意見', text: '我有一個簡單想法，想分享一下。', level: 1, situation: '小組討論想發言時', skill: '主動分享' },
    { id: 't2', category: 'teamwork', icon: '🤝', title: '小組合作 / 接受不同意見', text: '我明白你嘅意思，我哋可唔可以比較兩個方法？', level: 3, situation: '同學意見不同時', skill: '協商解難' },
    { id: 't3', category: 'teamwork', icon: '🤝', title: '小組合作 / 接受不同意見', text: '你覺得邊一部分需要改？', level: 2, situation: '想聽同學意見時', skill: '邀請回饋' },
    { id: 't4', category: 'teamwork', icon: '🤝', title: '小組合作 / 接受不同意見', text: '咁我負責呢部分，可以嗎？', level: 1, situation: '分工合作時', skill: '承擔角色' },
    { id: 'p1', category: 'repair', icon: '🌱', title: '道歉 / 修補關係', text: '對不起，我剛才語氣太急。', level: 1, situation: '自己語氣不好時', skill: '承認語氣問題' },
    { id: 'p2', category: 'repair', icon: '🌱', title: '道歉 / 修補關係', text: '我頭先太緊張，所以講得唔清楚。', level: 2, situation: '剛才表達混亂時', skill: '解釋狀態' },
    { id: 'p3', category: 'repair', icon: '🌱', title: '道歉 / 修補關係', text: '我想重新講一次，可以嗎？', level: 2, situation: '想修正剛才的表達時', skill: '重新溝通' },
    { id: 'p4', category: 'repair', icon: '🌱', title: '道歉 / 修補關係', text: '多謝你提醒我，我下次會留意。', level: 2, situation: '別人給提醒時', skill: '接受提醒' }
  ];

  function safeJson(key) {
    try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch (e) { return {}; }
  }

  function saveJson(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value || {})); } catch (e) {}
  }

  function esc(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function toast(message, type) {
    if (typeof window.showToast === 'function') window.showToast(message, type || 'success');
  }

  function getState() {
    const state = safeJson(STATE_KEY);
    return {
      category: CATEGORIES.some((item) => item.id === state.category) ? state.category : 'all',
      query: String(state.query || ''),
      page: Math.max(0, Number(state.page || 0))
    };
  }

  function setState(partial) {
    const current = getState();
    saveJson(STATE_KEY, Object.assign({}, current, partial || {}));
  }

  function favourites() {
    const fav = safeJson(FAV_KEY);
    return fav.items || {};
  }

  function saveFavourites(items) {
    saveJson(FAV_KEY, { items: items || {} });
  }

  function levelStars(level) {
    const count = Math.max(1, Math.min(3, Number(level || 1)));
    return '⭐'.repeat(count) + '☆'.repeat(3 - count);
  }

  function levelText(level) {
    if (Number(level) >= 3) return '高階';
    if (Number(level) >= 2) return '進階';
    return '簡單';
  }

  function filteredPhrases() {
    const state = getState();
    const fav = favourites();
    const q = state.query.trim().toLowerCase();
    return PHRASES.filter(function (item) {
      const matchCategory = state.category === 'all' || (state.category === 'favourites' ? fav[item.id] : item.category === state.category);
      const haystack = [item.text, item.title, item.situation, item.skill].join(' ').toLowerCase();
      return matchCategory && (!q || haystack.indexOf(q) >= 0);
    });
  }

  function pageData() {
    const items = filteredPhrases();
    const maxPage = Math.max(0, Math.ceil(items.length / PAGE_SIZE) - 1);
    const state = getState();
    const page = Math.min(state.page, maxPage);
    if (page !== state.page) setState({ page: page });
    return {
      items: items,
      page: page,
      maxPage: maxPage,
      visible: items.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)
    };
  }

  function heroHtml() {
    return `
      <div class="phrase-hero-panel">
        <div>
          <div class="tag">社交技能書</div>
          <h2>梁書社交技能書</h2>
          <p>每頁 6 張技能卡，搜尋或分類後可用上一頁 / 下一頁切換。</p>
        </div>
        <div class="phrase-hero-icon">📘</div>
      </div>`;
  }

  function controlsHtml() {
    const state = getState();
    return `
      <div class="phrase-control-panel">
        <label class="phrase-search-box">
          <span>搜尋</span>
          <input id="phraseSearchInput" type="search" placeholder="拒絕、老師、唔舒服、幫忙" value="${esc(state.query)}" />
        </label>
        <div class="phrase-tabs" role="tablist">
          ${CATEGORIES.map(function (cat) {
            return `<button type="button" class="phrase-tab ${cat.id === state.category ? 'active' : ''}" data-phrase-category="${cat.id}">${cat.icon} ${cat.label}</button>`;
          }).join('')}
        </div>
      </div>`;
  }

  function phraseCardHtml(item) {
    const fav = favourites();
    const isFav = Boolean(fav[item.id]);
    return `
      <article class="phrase-card" data-phrase-id="${esc(item.id)}">
        <div class="phrase-card-top">
          <div class="phrase-card-badge">${item.icon} ${esc(item.title)}</div>
          <button type="button" class="phrase-fav-btn ${isFav ? 'active' : ''}" data-phrase-fav="${esc(item.id)}" title="收藏">${isFav ? '★' : '☆'}</button>
        </div>
        <h3>${esc(item.text)}</h3>
        <div class="phrase-quick-meta"><span>${levelStars(item.level)} ${levelText(item.level)}</span><span>${esc(item.skill)}</span></div>
        <p class="phrase-situation">${esc(item.situation)}</p>
        <div class="phrase-card-actions">
          <button type="button" data-phrase-copy="${esc(item.id)}">複製</button>
          <button type="button" class="secondary" data-phrase-practice="${esc(item.id)}">用法</button>
        </div>
      </article>`;
  }

  function listHtml() {
    const data = pageData();
    if (!data.items.length) {
      return '<div class="phrase-empty-card">暫時找不到相關句子。試下搜尋「老師」、「拒絕」、「唔舒服」或按「全部」。</div>';
    }
    return `
      <div class="phrase-card-grid">${data.visible.map(phraseCardHtml).join('')}</div>
      ${paginationHtml(data)}`;
  }

  function paginationHtml(data) {
    const start = data.items.length ? data.page * PAGE_SIZE + 1 : 0;
    const end = Math.min(data.items.length, data.page * PAGE_SIZE + PAGE_SIZE);
    return `
      <div class="phrase-pager">
        <button type="button" class="secondary" data-phrase-page="prev" ${data.page <= 0 ? 'disabled' : ''}>← 上一頁</button>
        <span>顯示 ${start}-${end} / ${data.items.length}｜第 ${data.page + 1} / ${data.maxPage + 1} 頁</span>
        <button type="button" class="secondary" data-phrase-page="next" ${data.page >= data.maxPage ? 'disabled' : ''}>下一頁 →</button>
      </div>`;
  }

  function actionsHtml() {
    return `
      <div class="welcome-actions phrase-actions">
        <button class="secondary" onclick="showCoverScreen && showCoverScreen()">返回開始頁</button>
        <button onclick="showSituationScreen && showSituationScreen()">前往情境選擇</button>
        <button class="secondary" onclick="window.showCharacterScreen && window.showCharacterScreen()">我的角色</button>
        <button class="secondary" onclick="showSettingsScreen && showSettingsScreen()">我的設定</button>
      </div>`;
  }

  function render() {
    injectStyles();
    const screen = document.getElementById('phraseLibraryScreen');
    if (!screen) return;
    screen.innerHTML = `
      <div class="hero-card phrase-library-page phrase-compact-page animate-in">
        ${heroHtml()}
        ${controlsHtml()}
        ${listHtml()}
        ${actionsHtml()}
      </div>`;
    bindEvents();
  }

  function copyPhrase(id) {
    const item = PHRASES.find((phrase) => phrase.id === id);
    if (!item) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(item.text).then(function () {
        toast('已複製句子', 'success');
      }).catch(function () {
        window.prompt('複製以下句子：', item.text);
      });
    } else {
      window.prompt('複製以下句子：', item.text);
    }
  }

  function showUsage(id) {
    const item = PHRASES.find((phrase) => phrase.id === id);
    if (!item) return;
    window.alert('使用方法：\n\n' + item.text + '\n\n適合情境：' + item.situation + '\n練習技能：' + item.skill + '\n\n提示：先用平靜語氣講出句子；如果對方仍然繼續，可以重複一次，或向老師 / 社工求助。');
  }

  function toggleFav(id) {
    const fav = favourites();
    if (fav[id]) {
      delete fav[id];
      toast('已取消收藏', 'success');
    } else {
      fav[id] = true;
      toast('已加入收藏', 'success');
    }
    saveFavourites(fav);
    render();
  }

  function changePage(direction) {
    const data = pageData();
    const next = direction === 'next' ? Math.min(data.maxPage, data.page + 1) : Math.max(0, data.page - 1);
    setState({ page: next });
    render();
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
        if (input) {
          input.focus();
          const end = input.value.length;
          try { input.setSelectionRange(end, end); } catch (e) {}
        }
      }
    });

    screen.addEventListener('click', function (event) {
      const categoryBtn = event.target.closest('[data-phrase-category]');
      const copyBtn = event.target.closest('[data-phrase-copy]');
      const favBtn = event.target.closest('[data-phrase-fav]');
      const practiceBtn = event.target.closest('[data-phrase-practice]');
      const pageBtn = event.target.closest('[data-phrase-page]');

      if (categoryBtn) {
        setState({ category: categoryBtn.getAttribute('data-phrase-category') || 'all', page: 0 });
        render();
        return;
      }
      if (copyBtn) {
        copyPhrase(copyBtn.getAttribute('data-phrase-copy'));
        return;
      }
      if (favBtn) {
        toggleFav(favBtn.getAttribute('data-phrase-fav'));
        return;
      }
      if (practiceBtn) {
        showUsage(practiceBtn.getAttribute('data-phrase-practice'));
        return;
      }
      if (pageBtn) {
        changePage(pageBtn.getAttribute('data-phrase-page'));
      }
    });
  }

  function patchNavigation() {
    const fn = window.showPhraseLibraryScreen;
    if (typeof fn !== 'function' || fn.__phraseLibraryUpgradeWrapped) return;
    window.showPhraseLibraryScreen = function () {
      const result = fn.apply(this, arguments);
      setTimeout(render, 0);
      setTimeout(render, 120);
      return result;
    };
    window.showPhraseLibraryScreen.__phraseLibraryUpgradeWrapped = true;
  }

  function injectStyles() {
    let style = document.getElementById('phraseLibraryUpgradeStyle');
    if (!style) {
      style = document.createElement('style');
      style.id = 'phraseLibraryUpgradeStyle';
      document.head.appendChild(style);
    }
    style.textContent = `
      .phrase-library-page { text-align:left; }
      .phrase-compact-page { padding:18px !important; max-height:calc(100vh - 300px); overflow:hidden; }
      .phrase-hero-panel { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:14px 16px; border-radius:24px; background:radial-gradient(circle at 14% 12%, rgba(57,255,20,.18), transparent 28%), linear-gradient(145deg, rgba(255,255,255,.82), rgba(236,247,255,.62)); border:1px solid rgba(255,255,255,.82); box-shadow:var(--soft-shadow), inset 0 1px 0 rgba(255,255,255,.92); }
      .phrase-hero-panel h2 { margin:3px 0 3px; font-size:clamp(1.35rem,2.2vw,1.85rem); }
      .phrase-hero-panel p { margin:0; color:var(--muted); font-weight:750; line-height:1.35; font-size:.9rem; }
      .phrase-hero-icon { width:52px; height:52px; border-radius:18px; display:grid; place-items:center; font-size:1.7rem; background:rgba(255,255,255,.68); box-shadow:inset 0 1px 0 rgba(255,255,255,.92), 0 10px 20px rgba(29,53,87,.09); }
      .phrase-control-panel { margin-top:10px; padding:10px 12px; border-radius:22px; background:rgba(255,255,255,.56); border:1px solid rgba(255,255,255,.78); box-shadow:var(--soft-shadow), inset 0 1px 0 rgba(255,255,255,.88); }
      .phrase-search-box { display:grid; gap:4px; }
      .phrase-search-box span { color:var(--muted); font-size:.8rem; font-weight:900; }
      .phrase-search-box input { width:100%; border:1px solid rgba(0,122,255,.18); border-radius:15px; padding:9px 11px; font-size:.94rem; font-weight:800; background:rgba(255,255,255,.78); outline:none; }
      .phrase-tabs { display:flex; flex-wrap:wrap; gap:6px; margin-top:8px; }
      .phrase-tab { border:0; border-radius:999px; padding:7px 10px; font-size:.86rem; font-weight:950; color:var(--primary-dark); background:rgba(255,255,255,.68); box-shadow:inset 0 1px 0 rgba(255,255,255,.9), 0 6px 14px rgba(29,53,87,.07); cursor:pointer; }
      .phrase-tab.active { color:#083b00; background:linear-gradient(180deg, rgba(57,255,20,.42), rgba(255,255,255,.76)); box-shadow:0 0 0 3px rgba(57,255,20,.14), inset 0 1px 0 rgba(255,255,255,.92); }
      .phrase-card-grid { margin-top:10px; display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:10px; }
      .phrase-card,.phrase-empty-card { min-height:150px; border-radius:22px; padding:12px; background:rgba(255,255,255,.62); border:1px solid rgba(255,255,255,.78); box-shadow:var(--soft-shadow), inset 0 1px 0 rgba(255,255,255,.88); }
      .phrase-card-top { display:flex; align-items:center; justify-content:space-between; gap:8px; }
      .phrase-card-badge { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; border-radius:999px; padding:5px 8px; max-width:75%; font-weight:950; font-size:.72rem; color:#1f6f00; background:rgba(57,255,20,.14); }
      .phrase-card h3 { margin:8px 0 7px; min-height:42px; font-size:.98rem; line-height:1.45; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
      .phrase-fav-btn { border:0; width:34px; height:30px; border-radius:999px; font-weight:950; color:var(--primary-dark); background:rgba(255,255,255,.74); box-shadow:inset 0 1px 0 rgba(255,255,255,.92), 0 6px 12px rgba(29,53,87,.08); cursor:pointer; }
      .phrase-fav-btn.active { color:#8a5200; background:rgba(255,199,0,.20); }
      .phrase-quick-meta { display:flex; gap:6px; flex-wrap:wrap; align-items:center; }
      .phrase-quick-meta span { border-radius:999px; padding:4px 7px; font-size:.76rem; font-weight:900; color:var(--muted); background:rgba(255,255,255,.64); }
      .phrase-situation { margin:7px 0 0; color:var(--muted); font-size:.82rem; font-weight:750; line-height:1.35; display:-webkit-box; -webkit-line-clamp:1; -webkit-box-orient:vertical; overflow:hidden; }
      .phrase-card-actions { display:flex; flex-wrap:wrap; gap:6px; margin-top:9px; }
      .phrase-card-actions button { border:0; border-radius:999px; padding:7px 10px; font-size:.82rem; font-weight:950; cursor:pointer; color:#083b00; background:linear-gradient(180deg, rgba(57,255,20,.36), rgba(255,255,255,.76)); box-shadow:inset 0 1px 0 rgba(255,255,255,.92), 0 6px 14px rgba(57,255,20,.10); }
      .phrase-card-actions button.secondary { color:var(--primary-dark); background:rgba(255,255,255,.72); }
      .phrase-pager { margin-top:8px; display:flex; align-items:center; justify-content:center; gap:10px; font-size:.88rem; font-weight:900; color:var(--muted); }
      .phrase-pager button { border:0; border-radius:999px; padding:7px 12px; font-weight:950; cursor:pointer; background:rgba(255,255,255,.72); color:var(--primary-dark); box-shadow:inset 0 1px 0 rgba(255,255,255,.92), 0 6px 14px rgba(29,53,87,.07); }
      .phrase-pager button:disabled { opacity:.42; cursor:not-allowed; }
      .phrase-empty-card { margin-top:10px; color:var(--muted); line-height:1.7; font-weight:850; }
      .phrase-actions { margin-top:8px; justify-content:flex-start; gap:8px; }
      .phrase-actions button { padding:9px 12px; font-size:.9rem; }
      @media (max-width:1100px){ .phrase-card-grid{grid-template-columns:repeat(2,minmax(0,1fr));} .phrase-compact-page{max-height:none; overflow:visible;} }
      @media (max-width:760px){ .phrase-card-grid{grid-template-columns:1fr;} .phrase-hero-icon{display:none;} .phrase-compact-page{max-height:none; overflow:visible;} }
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
