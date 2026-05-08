// /reputation-system.js
// Campus Reputation system
// - Reputation starts at 50
// - Lowest 0, highest 100
// - Changes after completing each mission
// - Shows a bar under the EXP bar on 我的角色 page

(function () {
  const REPUTATION_KEY = 'asd_school_reputation_v1';
  const TOTAL_QUESTIONS = 5;

  let currentMissionKey = '';
  let currentScore = 0;
  let answeredKeys = new Set();
  let savedMissionRunKey = '';
  let renderTimer = null;

  function readJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function saveJson(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (error) {}
  }

  function clamp(value) {
    return Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
  }

  function esc(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function defaultReputation() {
    return { value: 50, history: [], version: 1 };
  }

  function loadReputation() {
    const raw = readJson(REPUTATION_KEY, null);
    if (!raw || typeof raw !== 'object') {
      const next = defaultReputation();
      saveJson(REPUTATION_KEY, next);
      return next;
    }
    const next = defaultReputation();
    next.value = clamp(typeof raw.value === 'undefined' ? 50 : raw.value);
    next.history = Array.isArray(raw.history) ? raw.history : [];
    next.version = 1;
    return next;
  }

  function saveReputation(state) {
    const next = {
      value: clamp(state.value),
      history: Array.isArray(state.history) ? state.history.slice(-80) : [],
      version: 1
    };
    saveJson(REPUTATION_KEY, next);
    return next;
  }

  function getGames() {
    try {
      if (window.asdGames) return window.asdGames;
      // eslint-disable-next-line no-undef
      if (typeof asdGames !== 'undefined') return asdGames;
    } catch (error) {}
    return {};
  }

  function normalize(value) {
    return String(value || '').replace(/\s+/g, '').replace(/^[A-D][\.．、]?/i, '').trim();
  }

  function getQuestionNumber() {
    const badge = document.getElementById('questionBadgeBig');
    const badgeText = badge ? badge.textContent || '' : '';
    const fromBadge = badgeText.match(/第\s*(\d+)/);
    if (fromBadge) return Number(fromBadge[1]);

    const box = document.getElementById('asdBox');
    const boxText = box ? box.textContent || '' : '';
    const fromBox = boxText.match(/第\s*(\d+)\s*題/);
    if (fromBox) return Number(fromBox[1]);

    return answeredKeys.size + 1;
  }

  function detectMission() {
    if (currentMissionKey) return currentMissionKey;
    const games = getGames();
    const text = [
      (document.getElementById('asdBox') || {}).textContent || '',
      (document.getElementById('questionTrackerTitle') || {}).textContent || '',
      (document.getElementById('asdProgressText') || {}).textContent || ''
    ].join(' ');

    return Object.keys(games).find(function (key) {
      const game = games[key] || {};
      return text.includes(game.title || '') || text.includes(game.intro || '') || text.includes(game.mission || '');
    }) || '';
  }

  function getOptionScore(missionKey, questionNumber, buttonText) {
    const games = getGames();
    const game = games[missionKey];
    const step = game && Array.isArray(game.steps) ? game.steps[questionNumber - 1] : null;
    if (!step || !Array.isArray(step.options)) return 0;

    const cleanButton = normalize(buttonText);
    const option = step.options.find(function (item) {
      const cleanOption = normalize(item.text);
      return cleanButton.includes(cleanOption) || cleanOption.includes(cleanButton);
    });
    return option ? Number(option.score || 0) : 0;
  }

  function missionTitle(key) {
    const games = getGames();
    return games[key] && games[key].title ? games[key].title : key;
  }

  function reputationChangeFromScore(score) {
    const s = Number(score || 0);
    if (s >= 9) return 5;
    if (s >= 7) return 3;
    if (s >= 5) return 1;
    if (s >= 3) return -2;
    return -5;
  }

  function reputationRank(value) {
    const v = clamp(value);
    if (v <= 9) return { title: '臭名遠播', mood: 'danger', desc: '要小心，這代表最近的社交選擇容易令別人不舒服。' };
    if (v <= 24) return { title: '惡名昭彰', mood: 'danger', desc: '需要重新建立別人對你的信任。' };
    if (v <= 39) return { title: '校園麻煩友', mood: 'warning', desc: '有些回應可能太衝動，建議先停一停再選擇。' };
    if (v <= 49) return { title: '有待觀察', mood: 'warning', desc: '你正在調整中，下一個任務可以嘗試更友善的回應。' };
    if (v <= 59) return { title: '普通學生', mood: 'neutral', desc: '聲譽保持平穩，繼續完成任務可以提升。' };
    if (v <= 69) return { title: '友善同伴', mood: 'good', desc: '你的回應開始更穩定、友善。' };
    if (v <= 79) return { title: '人緣不錯', mood: 'good', desc: '同學會較容易覺得你可靠和好相處。' };
    if (v <= 89) return { title: '聲名鵲起', mood: 'great', desc: '你在校園社交任務中的表現越來越成熟。' };
    if (v <= 99) return { title: '眾人信任', mood: 'great', desc: '你的選擇大多能照顧自己和別人的感受。' };
    return { title: '梁書傳奇', mood: 'legend', desc: '你已達到最高聲譽，是真正的社交任務傳奇。' };
  }

  function applyMissionReputation(missionKey, score) {
    if (!missionKey) return;
    const runKey = missionKey + ':' + score + ':' + answeredKeys.size;
    if (savedMissionRunKey === runKey) return;
    savedMissionRunKey = runKey;

    const state = loadReputation();
    const before = clamp(state.value);
    const change = reputationChangeFromScore(score);
    const after = clamp(before + change);

    state.value = after;
    state.history.push({
      missionKey: missionKey,
      missionTitle: missionTitle(missionKey),
      score: Number(score || 0),
      change: change,
      before: before,
      after: after,
      rank: reputationRank(after).title,
      time: new Date().toISOString()
    });

    saveReputation(state);
    window.dispatchEvent(new CustomEvent('reputationUpdated', { detail: { before, after, change, missionKey, score } }));
    scheduleRenderReputation();
  }

  function handleChoiceClick(event) {
    const button = event.target && event.target.closest ? event.target.closest('#asdChoices button') : null;
    if (!button) return;

    const screen = document.getElementById('gameScreen');
    if (!screen || !screen.classList.contains('mission-question-mode')) return;

    const missionKey = detectMission();
    if (!missionKey) return;
    if (!currentMissionKey) currentMissionKey = missionKey;

    const q = getQuestionNumber();
    if (q < 1 || q > TOTAL_QUESTIONS) return;

    const key = missionKey + ':' + q;
    if (answeredKeys.has(key)) return;

    const score = getOptionScore(missionKey, q, button.textContent || button.innerText || '');
    currentScore += Number(score || 0);
    answeredKeys.add(key);

    if (answeredKeys.size >= TOTAL_QUESTIONS) {
      setTimeout(function () { applyMissionReputation(missionKey, currentScore); }, 650);
    }
  }

  function resetMission(missionKey) {
    currentMissionKey = missionKey || '';
    currentScore = 0;
    answeredKeys = new Set();
    savedMissionRunKey = '';
  }

  function patchStartFunctions() {
    if (typeof window.startAsdGame === 'function' && !window.startAsdGame.__reputationPatched) {
      const originalStart = window.startAsdGame;
      window.startAsdGame = function (missionKey) {
        resetMission(missionKey);
        return originalStart.apply(this, arguments);
      };
      window.startAsdGame.__reputationPatched = true;
    }

    if (typeof window.startRpgMission === 'function' && !window.startRpgMission.__reputationPatched) {
      const originalRpg = window.startRpgMission;
      window.startRpgMission = function (missionKey) {
        resetMission(missionKey);
        return originalRpg.apply(this, arguments);
      };
      window.startRpgMission.__reputationPatched = true;
    }
  }

  function reputationPanelHtml() {
    const state = loadReputation();
    const value = clamp(state.value);
    const rank = reputationRank(value);
    const last = state.history && state.history.length ? state.history[state.history.length - 1] : null;
    const changeText = last ? (Number(last.change) >= 0 ? '+' + Number(last.change) : String(Number(last.change))) : '—';

    return '<div class="sims-reputation-wrap ' + esc(rank.mood) + '" id="simsReputationPanel">' +
      '<div class="sims-reputation-info">' +
        '<strong>校園聲譽</strong>' +
        '<span>目前稱號：<b>' + esc(rank.title) + '</b></span>' +
      '</div>' +
      '<div class="sims-reputation-bar" aria-label="校園聲譽"><div class="sims-reputation-fill" style="width:' + value + '%"></div></div>' +
      '<div class="sims-reputation-footer">' +
        '<span>臭名遠播</span>' +
        '<strong>本次變化：' + esc(changeText) + '</strong>' +
        '<span>梁書傳奇</span>' +
      '</div>' +
      '<p>' + esc(rank.desc) + '</p>' +
    '</div>';
  }

  function renderReputationPanel() {
    const characterScreen = document.getElementById('characterScreen');
    if (!characterScreen || !characterScreen.classList.contains('active')) return;

    const profilePanel = characterScreen.querySelector('.sims-profile-card');
    if (!profilePanel) return;

    const expWrap = profilePanel.querySelector('.sims-exp-wrap');
    if (!expWrap) return;

    const old = profilePanel.querySelector('#simsReputationPanel');
    if (old) old.remove();

    expWrap.insertAdjacentHTML('afterend', reputationPanelHtml());
  }

  function scheduleRenderReputation() {
    if (renderTimer) clearTimeout(renderTimer);
    renderTimer = setTimeout(function () {
      renderTimer = null;
      renderReputationPanel();
    }, 80);
  }

  function observeCharacterPage() {
    const screen = document.getElementById('characterScreen');
    if (!screen || screen.__reputationObserver) return;

    const observer = new MutationObserver(function () {
      scheduleRenderReputation();
    });
    observer.observe(screen, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    screen.__reputationObserver = observer;
  }

  function injectStyles() {
    if (document.getElementById('reputationSystemStyle')) return;
    const style = document.createElement('style');
    style.id = 'reputationSystemStyle';
    style.textContent = `
      .sims-reputation-wrap {
        margin-top: 10px;
        padding: 12px;
        border-radius: 20px;
        background: rgba(255,255,255,.62);
        border: 1px solid rgba(255,255,255,.76);
        box-shadow: inset 0 1px 0 rgba(255,255,255,.86), 0 10px 22px rgba(29,53,87,.08);
        display: grid;
        gap: 8px;
      }

      .sims-reputation-info,
      .sims-reputation-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }

      .sims-reputation-info strong {
        color: var(--text);
        font-weight: 950;
      }

      .sims-reputation-info span,
      .sims-reputation-footer span,
      .sims-reputation-wrap p {
        color: var(--muted);
        font-size: .82rem;
        font-weight: 850;
      }

      .sims-reputation-info b {
        color: var(--primary-dark);
      }

      .sims-reputation-bar {
        height: 22px;
        border-radius: 0;
        overflow: hidden;
        background: repeating-linear-gradient(90deg,#fff 0 3px,#f4f8ff 3px 18px,#dbe7f5 18px 21px);
        border: 3px solid #fff;
        box-shadow: 0 0 0 2px rgba(0,122,255,.14),0 5px 0 rgba(169,205,242,.46),inset 0 2px 0 rgba(255,255,255,.96),inset 0 -3px 0 rgba(169,205,242,.34);
      }

      .sims-reputation-fill {
        height: 100%;
        border-radius: 0;
        transition: width .45s ease;
        background: repeating-linear-gradient(90deg,#ff3b30 0 14px,#c9180d 14px 18px,#7a0d08 18px 21px);
        box-shadow: inset 0 4px 0 rgba(255,255,255,.32), inset 0 -5px 0 rgba(0,0,0,.20), 0 0 14px rgba(255,59,48,.25);
      }

      .sims-reputation-wrap.warning .sims-reputation-fill {
        background: repeating-linear-gradient(90deg,#ffb000 0 14px,#e28a00 14px 18px,#8a5200 18px 21px);
        box-shadow: inset 0 4px 0 rgba(255,255,255,.36), inset 0 -5px 0 rgba(0,0,0,.18), 0 0 14px rgba(255,176,0,.26);
      }

      .sims-reputation-wrap.neutral .sims-reputation-fill {
        background: repeating-linear-gradient(90deg,#64d2ff 0 14px,#2f8cff 14px 18px,#0057d9 18px 21px);
        box-shadow: inset 0 4px 0 rgba(255,255,255,.38), inset 0 -5px 0 rgba(0,0,0,.18), 0 0 14px rgba(47,140,255,.24);
      }

      .sims-reputation-wrap.good .sims-reputation-fill,
      .sims-reputation-wrap.great .sims-reputation-fill,
      .sims-reputation-wrap.legend .sims-reputation-fill {
        background: repeating-linear-gradient(90deg,#39ff14 0 14px,#22c70d 14px 18px,#116b08 18px 21px);
        box-shadow: inset 0 4px 0 rgba(255,255,255,.42), inset 0 -5px 0 rgba(0,0,0,.20), 0 0 14px rgba(57,255,20,.34);
      }

      .sims-reputation-wrap.legend .sims-reputation-info b {
        color: #9a5a00;
      }

      .sims-reputation-wrap.legend .sims-reputation-fill {
        background: repeating-linear-gradient(90deg,#fff5c2 0 12px,#ffb000 12px 18px,#9a5a00 18px 21px);
      }

      .sims-reputation-footer strong {
        color: var(--primary-dark);
        font-size: .82rem;
        white-space: nowrap;
      }

      .sims-reputation-wrap p {
        margin: 0;
        line-height: 1.45;
      }

      @media (max-width: 640px) {
        .sims-reputation-info,
        .sims-reputation-footer {
          align-items: flex-start;
          flex-direction: column;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function install() {
    loadReputation();
    injectStyles();
    patchStartFunctions();
    observeCharacterPage();
    scheduleRenderReputation();
    setTimeout(patchStartFunctions, 500);
    setTimeout(observeCharacterPage, 800);
    setTimeout(scheduleRenderReputation, 1000);
  }

  document.addEventListener('click', handleChoiceClick, true);
  window.addEventListener('reputationUpdated', scheduleRenderReputation);

  window.getCampusReputation = loadReputation;
  window.resetCampusReputation = function () {
    const next = defaultReputation();
    saveJson(REPUTATION_KEY, next);
    window.dispatchEvent(new CustomEvent('reputationUpdated', { detail: { before: null, after: 50, change: 0 } }));
    return next;
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install);
  } else {
    install();
  }

  window.addEventListener('load', function () {
    install();
    setTimeout(install, 900);
    setTimeout(scheduleRenderReputation, 1800);
  });
})();
