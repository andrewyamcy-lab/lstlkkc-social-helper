// /phrase-library-upgrade.js
// Upgrade for「社交技能書」: search, categories, favourites, copy buttons, difficulty levels.

(function () {
  const FAV_KEY = 'asd_school_phrase_favourites_v1';
  const STATE_KEY = 'asd_school_phrase_library_state_v1';

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
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function toast(message, type) {
    if (typeof window.showToast === 'function') window.showToast(message, type || 'success');
  }

  function getState() {
    const state = safeJson(STATE_KEY);
    return {
      category: CATEGORIES.some((item) => item.id === state.category) ? state.category : 'all',
      query: String(state.query || '')
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
      const matchQuery = !q || haystack.indexOf(q) >= 0;
      return matchCategory && matchQuery;
    });
  }

  function heroHtml() {
    return `
      <div class="phrase-hero-panel">
        <div>
          <div class="tag">社交技能書</div>
          <h2>梁書社交技能書</h2>
          <p>搜尋合適句子，收藏常用技能，並在校園 RPG 任務中練習使用。</p>
        </div>
        <div class="phrase-hero-icon">📘</div>
      </div>`;
  }

  function controlsHtml() {
    const state = getState();
    return `
      <div class="phrase-control-panel">
        <label class="phrase-search-box">
          <span>搜尋句子 / 情境 / 技能</span>
          <input id="phraseSearchInput" type="search" placeholder="例如：拒絕、老師、唔舒服、幫忙" value="${esc(state.query)}" />
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
          <div><div class="phrase-card-badge">${item.icon} ${esc(item.title)}</div><h3>${esc(item.text)}</h3></div>
          <button type="button" class="phrase-fav-btn ${isFav ? 'active' : ''}" data-phrase-fav="${esc(item.id)}">${isFav ? '★ 已收藏' : '☆ 收藏'}</button>
        </div>
        <div class="phrase-meta-grid">
          <div><span>難度</span><strong>${levelStars(item.level)} ${levelText(item.level)}</strong></div>
          <div><span>適合情境</span><strong>${esc(item.situation)}</strong></div>
          <div><span>練習技能</span><strong>${esc(item.skill)}</strong></div>
        </div>
        <div class="phrase-card-actions">
          <button type="button" data-phrase-copy="${esc(item.id)}">複製句子</button>
          <button type="button" class="secondary" data-phrase-practice="${esc(item.id)}">點樣用？</button>
        </div>
        <div class="phrase-practice-box hidden" id="phrasePractice-${esc(item.id)}">
          <strong>使用方法：</strong>先望向對方，用平靜語氣講出句子；如果對方仍然繼續，可以重複一次，或向老師 / 社工求助。
        </div>
      </article>`;
  }

  function listHtml() {
    const items = filteredPhrases();
    if (!items.length) {
      return '<div class="phrase-empty-card">暫時找不到相關句子。可以試下搜尋「老師」、「拒絕」、「唔舒服」或按「全部」。</div>';
    }
    return `<div class="phrase-card-grid">${items.map(phraseCardHtml).join('')}</div>`;
  }

  function actionsHtml() {
    return `
      <div class="welcome-actions phrase-actions">
        <button class="secondary" onclick="showCoverScreen && showCoverScreen()">返回開始頁</button>
        <button onclick="showSituationScreen && showSituationScreen()">前往情境選擇</button>
        <button class="secondary" onclick="window.showCharacterScreen && window.showCharacterScreen()">我的角色</button>
        <button class="secondary" onclick="window.showMissionResultHistory && window.showMissionResultHistory()">我的任務結果</button>
        <button class="secondary" onclick="showSettingsScreen && showSettingsScreen()">我的設定</button>
      </div>`;
  }

  function render() {
    injectStyles();
    const screen = document.getElementById('phraseLibraryScreen');
    if (!screen) return;
    screen.innerHTML = `
      <div class="hero-card phrase-library-page animate-in">
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

  function togglePractice(id) {
    const box = document.getElementById('phrasePractice-' + id);
    if (box) box.classList.toggle('hidden');
  }

  function bindEvents() {
    const screen = document.getElementById('phraseLibraryScreen');
    if (!screen || screen.__phraseLibraryBound) return;
    screen.__phraseLibraryBound = true;

    screen.addEventListener('input', function (event) {
      if (event.target && event.target.id === 'phraseSearchInput') {
        setState({ query: event.target.value || '' });
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

      if (categoryBtn) {
        setState({ category: categoryBtn.getAttribute('data-phrase-category') || 'all' });
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
        togglePractice(practiceBtn.getAttribute('data-phrase-practice'));
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
    if (document.getElementById('phraseLibraryUpgradeStyle')) return;
    const style = document.createElement('style');
    style.id = 'phraseLibraryUpgradeStyle';
    style.textContent = `
      .phrase-library-page { text-align:left; }
      .phrase-hero-panel { display:flex; align-items:center; justify-content:space-between; gap:16px; padding:18px; border-radius:28px; background:radial-gradient(circle at 14% 12%, rgba(57,255,20,.18), transparent 28%), linear-gradient(145deg, rgba(255,255,255,.82), rgba(236,247,255,.62)); border:1px solid rgba(255,255,255,.82); box-shadow:var(--soft-shadow), inset 0 1px 0 rgba(255,255,255,.92); }
      .phrase-hero-panel h2 { margin:4px 0 6px; font-size:clamp(1.55rem,3vw,2.35rem); }
      .phrase-hero-panel p { margin:0; color:var(--muted); font-weight:750; line-height:1.6; }
      .phrase-hero-icon { width:72px; height:72px; border-radius:24px; display:grid; place-items:center; font-size:2.25rem; background:rgba(255,255,255,.68); box-shadow:inset 0 1px 0 rgba(255,255,255,.92), 0 12px 26px rgba(29,53,87,.10); }
      .phrase-control-panel { margin-top:16px; padding:16px; border-radius:26px; background:rgba(255,255,255,.56); border:1px solid rgba(255,255,255,.78); box-shadow:var(--soft-shadow), inset 0 1px 0 rgba(255,255,255,.88); }
      .phrase-search-box { display:grid; gap:8px; }
      .phrase-search-box span { color:var(--muted); font-size:.9rem; font-weight:900; }
      .phrase-search-box input { width:100%; border:1px solid rgba(0,122,255,.18); border-radius:18px; padding:13px 14px; font-size:1rem; font-weight:800; background:rgba(255,255,255,.78); box-shadow:inset 0 1px 0 rgba(255,255,255,.92); outline:none; }
      .phrase-search-box input:focus { box-shadow:0 0 0 4px rgba(57,255,20,.16), inset 0 1px 0 rgba(255,255,255,.92); }
      .phrase-tabs { display:flex; flex-wrap:wrap; gap:8px; margin-top:12px; }
      .phrase-tab { border:0; border-radius:999px; padding:9px 12px; font-weight:950; color:var(--primary-dark); background:rgba(255,255,255,.68); box-shadow:inset 0 1px 0 rgba(255,255,255,.9), 0 8px 18px rgba(29,53,87,.08); cursor:pointer; }
      .phrase-tab.active { color:#083b00; background:linear-gradient(180deg, rgba(57,255,20,.42), rgba(255,255,255,.76)); box-shadow:0 0 0 4px rgba(57,255,20,.14), inset 0 1px 0 rgba(255,255,255,.92); }
      .phrase-card-grid { margin-top:16px; display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:14px; }
      .phrase-card,.phrase-empty-card { border-radius:26px; padding:16px; background:rgba(255,255,255,.62); border:1px solid rgba(255,255,255,.78); box-shadow:var(--soft-shadow), inset 0 1px 0 rgba(255,255,255,.88); }
      .phrase-card-top { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; }
      .phrase-card-badge { display:inline-flex; align-items:center; gap:6px; border-radius:999px; padding:6px 10px; font-weight:950; font-size:.82rem; color:#1f6f00; background:rgba(57,255,20,.14); }
      .phrase-card h3 { margin:10px 0 0; font-size:1.08rem; line-height:1.55; }
      .phrase-fav-btn { border:0; border-radius:999px; padding:8px 10px; white-space:nowrap; font-weight:950; color:var(--primary-dark); background:rgba(255,255,255,.74); box-shadow:inset 0 1px 0 rgba(255,255,255,.92), 0 8px 16px rgba(29,53,87,.08); cursor:pointer; }
      .phrase-fav-btn.active { color:#8a5200; background:rgba(255,199,0,.20); }
      .phrase-meta-grid { margin-top:12px; display:grid; grid-template-columns:1fr; gap:8px; }
      .phrase-meta-grid div { display:grid; gap:3px; padding:10px; border-radius:16px; background:rgba(255,255,255,.58); border:1px solid rgba(255,255,255,.72); }
      .phrase-meta-grid span { color:var(--muted); font-weight:850; font-size:.82rem; }
      .phrase-meta-grid strong { color:var(--text); line-height:1.45; }
      .phrase-card-actions { display:flex; flex-wrap:wrap; gap:8px; margin-top:12px; }
      .phrase-card-actions button { border:0; border-radius:999px; padding:9px 12px; font-weight:950; cursor:pointer; color:#083b00; background:linear-gradient(180deg, rgba(57,255,20,.36), rgba(255,255,255,.76)); box-shadow:inset 0 1px 0 rgba(255,255,255,.92), 0 8px 18px rgba(57,255,20,.10); }
      .phrase-card-actions button.secondary { color:var(--primary-dark); background:rgba(255,255,255,.72); box-shadow:inset 0 1px 0 rgba(255,255,255,.92), 0 8px 18px rgba(29,53,87,.08); }
      .phrase-practice-box { margin-top:10px; padding:12px; border-radius:18px; line-height:1.65; color:var(--muted); background:rgba(57,255,20,.10); border:1px solid rgba(57,255,20,.20); }
      .phrase-practice-box.hidden { display:none; }
      .phrase-empty-card { margin-top:16px; color:var(--muted); line-height:1.7; font-weight:850; }
      .phrase-actions { margin-top:18px; justify-content:flex-start; }
      @media (max-width:840px){ .phrase-card-grid{grid-template-columns:1fr;} .phrase-hero-panel{align-items:flex-start;} .phrase-hero-icon{display:none;} }
    `;
    document.head.appendChild(style);
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
