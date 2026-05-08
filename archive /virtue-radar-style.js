// /virtue-radar-style.js
// RPG radar chart display for「我的角色 → 能力值」.
// This changes only the visual layout of the 能力值 tab.

(function () {
  const VIRTUE_KEY = 'asd_school_virtue_stats_v1';
  const TAB_KEY = 'asd_school_character_tab_v1';
  const DEFAULT_STATS = {
    wisdom: 50,
    courage: 50,
    humanity: 50,
    justice: 50,
    temperance: 50,
    transcendence: 50
  };

  const VIRTUES = [
    { key: 'wisdom', icon: '🧠', name: '智慧' },
    { key: 'courage', icon: '🦁', name: '勇氣' },
    { key: 'humanity', icon: '💛', name: '仁愛' },
    { key: 'justice', icon: '⚖️', name: '公義' },
    { key: 'temperance', icon: '🌱', name: '節制' },
    { key: 'transcendence', icon: '✨', name: '超越' }
  ];

  let originalSetTab = null;

  function readJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function clamp(value) {
    return Math.max(0, Math.min(100, Number(value || 0)));
  }

  function getStats() {
    const saved = readJson(VIRTUE_KEY, {});
    const stats = Object.assign({}, DEFAULT_STATS, saved || {});
    Object.keys(DEFAULT_STATS).forEach((key) => {
      stats[key] = clamp(stats[key]);
    });
    return stats;
  }

  function levelText(value) {
    if (value >= 80) return '能力強項';
    if (value >= 60) return '表現良好';
    if (value >= 40) return '基礎穩定';
    return '需要練習';
  }

  function pointFor(index, radius, valueScale) {
    const angle = -90 + index * 60;
    const rad = angle * Math.PI / 180;
    const r = radius * valueScale;
    const cx = 220;
    const cy = 220;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad)
    };
  }

  function polygonPoints(values, radius) {
    return values.map((value, index) => {
      const p = pointFor(index, radius, value / 100);
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    }).join(' ');
  }

  function ringPoints(scale) {
    return VIRTUES.map((_, index) => {
      const p = pointFor(index, 155, scale);
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    }).join(' ');
  }

  function axisLines() {
    return VIRTUES.map((_, index) => {
      const p = pointFor(index, 155, 1);
      return `<line x1="220" y1="220" x2="${p.x.toFixed(1)}" y2="${p.y.toFixed(1)}" class="radar-axis" />`;
    }).join('');
  }

  function labels(stats) {
    return VIRTUES.map((virtue, index) => {
      const p = pointFor(index, 186, 1);
      const anchor = Math.abs(p.x - 220) < 8 ? 'middle' : (p.x > 220 ? 'start' : 'end');
      const value = stats[virtue.key];
      return `
        <text x="${p.x.toFixed(1)}" y="${p.y.toFixed(1)}" text-anchor="${anchor}" class="radar-label-main">${virtue.icon} ${virtue.name}</text>
        <text x="${p.x.toFixed(1)}" y="${(p.y + 18).toFixed(1)}" text-anchor="${anchor}" class="radar-label-score">${value}</text>`;
    }).join('');
  }

  function statCards(stats) {
    return VIRTUES.map((virtue) => {
      const value = stats[virtue.key];
      return `
        <div class="radar-stat-card">
          <div><strong>${virtue.icon} ${virtue.name}</strong><small>${levelText(value)}</small></div>
          <span>${value}</span>
        </div>`;
    }).join('');
  }

  function average(stats) {
    const total = VIRTUES.reduce((sum, virtue) => sum + Number(stats[virtue.key] || 0), 0);
    return Math.round(total / VIRTUES.length);
  }

  function radarPanel() {
    const stats = getStats();
    const values = VIRTUES.map((virtue) => stats[virtue.key]);
    const avg = average(stats);
    const dataPoints = polygonPoints(values, 155);

    return `
      <div class="sims-panel sims-tab-panel virtue-tab-panel radar-tab-panel">
        <div class="panel-badge">能力值</div>
        <div class="radar-panel-head">
          <div>
            <h3>能力值雷達圖</h3>
            <p class="sims-panel-note">六個能力方向會根據任務回答改變。越接近外圈，代表該能力越成熟。</p>
          </div>
          <div class="radar-overall"><strong>${avg}</strong><span>平均能力</span></div>
        </div>

        <div class="radar-layout">
          <div class="radar-chart-card">
            <svg class="ability-radar" viewBox="0 0 440 440" role="img" aria-label="能力值雷達圖">
              <defs>
                <linearGradient id="radarFillGradient" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0%" stop-color="#39ff14" stop-opacity="0.62" />
                  <stop offset="55%" stop-color="#00c48c" stop-opacity="0.46" />
                  <stop offset="100%" stop-color="#64d2ff" stop-opacity="0.58" />
                </linearGradient>
                <filter id="radarGlow" x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <polygon points="${ringPoints(1)}" class="radar-ring outer" />
              <polygon points="${ringPoints(0.8)}" class="radar-ring" />
              <polygon points="${ringPoints(0.6)}" class="radar-ring" />
              <polygon points="${ringPoints(0.4)}" class="radar-ring" />
              <polygon points="${ringPoints(0.2)}" class="radar-ring" />
              ${axisLines()}
              <polygon points="${dataPoints}" class="radar-data-fill" filter="url(#radarGlow)" />
              <polygon points="${dataPoints}" class="radar-data-line" />
              ${VIRTUES.map((virtue, index) => {
                const p = pointFor(index, 155, stats[virtue.key] / 100);
                return `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="5.5" class="radar-dot" />`;
              }).join('')}
              ${labels(stats)}
              <circle cx="220" cy="220" r="4" class="radar-center" />
            </svg>
          </div>

          <div class="radar-stat-list">
            ${statCards(stats)}
          </div>
        </div>
      </div>`;
  }

  function setActiveButton(tabId) {
    document.querySelectorAll('#characterScreen.active .sims-tab-btn').forEach((button) => {
      const active = (button.getAttribute('onclick') || '').includes(`'${tabId}'`);
      button.classList.toggle('active', active);
    });
  }

  function setTab(tabId) {
    if (tabId !== 'skills') {
      if (typeof originalSetTab === 'function') originalSetTab(tabId);
      return;
    }

    localStorage.setItem(TAB_KEY, tabId);
    setActiveButton(tabId);

    const right = document.querySelector('#characterScreen.active .sims-tab-right');
    const oldPanel = right && right.querySelector('.sims-tab-panel');
    if (oldPanel) oldPanel.outerHTML = radarPanel();
    else if (right) {
      const actions = right.querySelector('.sims-tab-actions');
      if (actions) actions.insertAdjacentHTML('beforebegin', radarPanel());
    }
  }

  function installRadarOverride() {
    if (window.setSimsCharacterTab && window.setSimsCharacterTab !== setTab) {
      originalSetTab = window.setSimsCharacterTab;
    }

    window.setSimsCharacterTab = setTab;

    if (window.__virtueSetCharacterTab && window.__virtueSetCharacterTab !== setTab && !window.__radarSavedVirtueSetter) {
      window.__radarSavedVirtueSetter = window.__virtueSetCharacterTab;
      originalSetTab = window.__virtueSetCharacterTab;
    }

    if (window.__radarSavedVirtueSetter) originalSetTab = window.__radarSavedVirtueSetter;
    window.__virtueSetCharacterTab = setTab;

    if (document.querySelector('#characterScreen.active') && (localStorage.getItem(TAB_KEY) || '') === 'skills') {
      setTab('skills');
    }
  }

  function injectStyles() {
    if (document.getElementById('virtueRadarStyle')) return;
    const style = document.createElement('style');
    style.id = 'virtueRadarStyle';
    style.textContent = `
      #characterScreen.active .radar-tab-panel {
        min-height: 520px !important;
      }

      .radar-panel-head {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 14px;
        margin-bottom: 12px;
      }

      .radar-panel-head h3 {
        margin-bottom: 4px !important;
      }

      .radar-overall {
        min-width: 92px;
        padding: 10px 12px;
        border-radius: 18px;
        text-align: center;
        background: linear-gradient(180deg, rgba(57,255,20,.22), rgba(255,255,255,.78));
        border: 1px solid rgba(255,255,255,.86);
        box-shadow: inset 0 1px 0 rgba(255,255,255,.92), 0 10px 22px rgba(57,255,20,.10);
      }

      .radar-overall strong {
        display: block;
        font-size: 1.55rem;
        color: #137300;
        line-height: 1;
      }

      .radar-overall span {
        display: block;
        margin-top: 4px;
        color: var(--muted);
        font-size: .78rem;
        font-weight: 850;
      }

      .radar-layout {
        display: grid;
        grid-template-columns: minmax(380px, 1fr) minmax(210px, .58fr);
        gap: 14px;
        align-items: stretch;
      }

      .radar-chart-card {
        min-height: 420px;
        border-radius: 24px;
        background:
          radial-gradient(circle at 50% 50%, rgba(57,255,20,.13), transparent 26%),
          radial-gradient(circle at 50% 50%, rgba(100,210,255,.16), transparent 52%),
          rgba(255,255,255,.56);
        border: 1px solid rgba(255,255,255,.82);
        box-shadow: inset 0 1px 0 rgba(255,255,255,.9), 0 14px 34px rgba(29,53,87,.08);
        display: grid;
        place-items: center;
        overflow: hidden;
      }

      .ability-radar {
        width: min(100%, 500px);
        height: auto;
        display: block;
      }

      .radar-ring {
        fill: none;
        stroke: rgba(0, 87, 217, .16);
        stroke-width: 1.3;
      }

      .radar-ring.outer {
        stroke: rgba(0, 87, 217, .25);
        stroke-width: 2;
      }

      .radar-axis {
        stroke: rgba(0, 87, 217, .14);
        stroke-width: 1.2;
      }

      .radar-data-fill {
        fill: url(#radarFillGradient);
        stroke: none;
      }

      .radar-data-line {
        fill: none;
        stroke: rgba(19, 115, 0, .82);
        stroke-width: 3.5;
        stroke-linejoin: round;
      }

      .radar-dot {
        fill: #ffffff;
        stroke: #22c70d;
        stroke-width: 3;
        filter: drop-shadow(0 3px 6px rgba(34,199,13,.24));
      }

      .radar-center {
        fill: rgba(0,87,217,.42);
      }

      .radar-label-main {
        font-size: 14px;
        font-weight: 950;
        fill: #13294b;
      }

      .radar-label-score {
        font-size: 13px;
        font-weight: 950;
        fill: #0057d9;
      }

      .radar-stat-list {
        display: grid;
        gap: 8px;
        align-content: center;
      }

      .radar-stat-card {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 11px 12px;
        border-radius: 18px;
        background: rgba(255,255,255,.62);
        border: 1px solid rgba(255,255,255,.80);
        box-shadow: inset 0 1px 0 rgba(255,255,255,.9);
      }

      .radar-stat-card strong,
      .radar-stat-card small {
        display: block;
      }

      .radar-stat-card small {
        margin-top: 2px;
        color: var(--muted);
        font-weight: 850;
        font-size: .75rem;
      }

      .radar-stat-card span {
        font-size: 1.18rem;
        font-weight: 950;
        color: #0057d9;
      }

      @media (max-width: 1100px) {
        .radar-layout {
          grid-template-columns: 1fr;
        }

        .radar-chart-card {
          min-height: 360px;
        }

        .ability-radar {
          width: min(100%, 430px);
        }
      }

      @media (max-width: 640px) {
        .radar-panel-head {
          flex-direction: column;
        }

        .radar-overall {
          width: 100%;
        }

        .radar-chart-card {
          min-height: 320px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function install() {
    injectStyles();
    installRadarOverride();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install);
  } else {
    install();
  }

  window.addEventListener('load', function () {
    install();
    setTimeout(install, 500);
    setTimeout(install, 1200);
    setTimeout(install, 2200);
    setTimeout(install, 3200);
  });
})();
