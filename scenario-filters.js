// /scenario-filters.js
// Lightweight category filters for scenario cards.
// No MutationObserver. No repeated interval. Safe for GitHub Pages.

(function () {
  const CATEGORY_LABELS = {
    all: '全部',
    emotion: '情緒控制',
    classmates: '同學相處',
    group: '小組合作',
    teacher: '向老師求助',
    online: '網上溝通',
    responsibility: '責任與規則'
  };

  const SCENARIO_CATEGORY_MAP = {
    start: ['classmates'],
    refuse: ['classmates', 'emotion'],
    conflict: ['classmates', 'emotion'],
    respond: ['classmates'],
    groupwork: ['group', 'classmates'],
    help: ['teacher'],
    lunch: ['classmates'],
    homework: ['online', 'responsibility'],

    teasing: ['emotion', 'classmates'],
    bumped: ['emotion', 'classmates'],
    disagree: ['group', 'emotion'],
    teacherReminder: ['teacher', 'responsibility', 'emotion'],
    queueJump: ['emotion', 'classmates', 'responsibility'],
    peGrouping: ['group', 'classmates'],
    whatsappIgnored: ['online', 'emotion'],
    academicOnly: ['responsibility', 'teacher'],
    lostItem: ['responsibility', 'emotion']
  };

  let activeCategory = 'all';

  function getScenarioKeyFromCard(card) {
    const button = card.querySelector('button[onclick*="startAsdGame"]');
    if (!button) return '';
    const onclickText = button.getAttribute('onclick') || '';
    const match = onclickText.match(/startAsdGame\(['"]([^'"]+)['"]\)/);
    return match && match[1] ? match[1] : '';
  }

  function getCardCategories(card) {
    const key = getScenarioKeyFromCard(card);
    return SCENARIO_CATEGORY_MAP[key] || ['classmates'];
  }

  function injectFilterStyles() {
    if (document.getElementById('scenarioFilterStyle')) return;
    const style = document.createElement('style');
    style.id = 'scenarioFilterStyle';
    style.textContent = `
      .scenario-filter-wrap {
        margin: 20px auto 18px;
        padding: 14px;
        border-radius: 24px;
        background: rgba(255, 255, 255, 0.42);
        border: 1px solid rgba(255, 255, 255, 0.62);
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.76), 0 12px 30px rgba(29, 53, 87, 0.08);
        backdrop-filter: blur(22px) saturate(170%);
        -webkit-backdrop-filter: blur(22px) saturate(170%);
        text-align: left;
      }

      .scenario-filter-title {
        font-weight: 900;
        color: var(--text, #142033);
        margin-bottom: 10px;
        letter-spacing: -0.02em;
      }

      .scenario-filter-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 9px;
      }

      .scenario-filter-btn {
        border-radius: 999px;
        padding: 9px 13px;
        font-size: 0.9rem;
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.72), 0 8px 18px rgba(29,53,87,0.06);
        background: rgba(255,255,255,0.48);
        color: var(--primary-dark, #0057d9);
        border: 1px solid rgba(255,255,255,0.64);
      }

      .scenario-filter-btn::before {
        display: none;
      }

      .scenario-filter-btn.active {
        background: linear-gradient(180deg, rgba(0,122,255,0.96), rgba(0,87,217,0.96));
        color: #ffffff;
        box-shadow: 0 14px 28px rgba(0,122,255,0.22), inset 0 1px 0 rgba(255,255,255,0.36);
      }

      .scenario-count-note {
        margin-top: 10px;
        color: var(--muted, #627083);
        font-size: 0.9rem;
      }

      .scenario-card.filtered-out {
        display: none !important;
      }

      @media (max-width: 640px) {
        .scenario-filter-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
        }

        .scenario-filter-btn {
          width: 100%;
          text-align: center;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function ensureFilterUI() {
    const grid = document.querySelector('.scenario-select-grid');
    if (!grid) return null;

    let wrap = document.getElementById('scenarioFilterWrap');
    if (wrap) return wrap;

    wrap = document.createElement('div');
    wrap.id = 'scenarioFilterWrap';
    wrap.className = 'scenario-filter-wrap';
    wrap.innerHTML = `
      <div class="scenario-filter-title">按類別選擇情境</div>
      <div class="scenario-filter-buttons" id="scenarioFilterButtons"></div>
      <div class="scenario-count-note" id="scenarioCountNote">正在載入情境...</div>
    `;

    grid.parentNode.insertBefore(wrap, grid);

    const buttonBox = wrap.querySelector('#scenarioFilterButtons');
    Object.keys(CATEGORY_LABELS).forEach(function (category) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'scenario-filter-btn secondary';
      button.dataset.category = category;
      button.textContent = CATEGORY_LABELS[category];
      button.addEventListener('click', function () {
        applyScenarioFilter(category);
      });
      buttonBox.appendChild(button);
    });

    return wrap;
  }

  function updateActiveButton() {
    document.querySelectorAll('.scenario-filter-btn').forEach(function (button) {
      button.classList.toggle('active', button.dataset.category === activeCategory);
    });
  }

  function updateCountNote(visible, total) {
    const note = document.getElementById('scenarioCountNote');
    if (!note) return;

    if (activeCategory === 'all') {
      note.textContent = '顯示全部情境：' + visible + ' / ' + total;
    } else {
      note.textContent = '正在顯示「' + CATEGORY_LABELS[activeCategory] + '」：' + visible + ' / ' + total;
    }
  }

  function applyScenarioFilter(category) {
    activeCategory = category || 'all';
    const cards = Array.from(document.querySelectorAll('.scenario-card'));
    let visible = 0;

    cards.forEach(function (card) {
      const categories = getCardCategories(card);
      const shouldShow = activeCategory === 'all' || categories.includes(activeCategory);
      card.classList.toggle('filtered-out', !shouldShow);
      if (shouldShow) visible += 1;
    });

    updateActiveButton();
    updateCountNote(visible, cards.length);
  }

  function initScenarioFilters() {
    injectFilterStyles();
    ensureFilterUI();
    applyScenarioFilter(activeCategory);
  }

  window.initScenarioFilters = initScenarioFilters;
  window.applyScenarioFilter = applyScenarioFilter;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScenarioFilters);
  } else {
    initScenarioFilters();
  }

  // Delayed passes because extra scenarios and cleanup may update cards shortly after load.
  setTimeout(initScenarioFilters, 250);
  setTimeout(initScenarioFilters, 900);
  setTimeout(initScenarioFilters, 1700);
})();
