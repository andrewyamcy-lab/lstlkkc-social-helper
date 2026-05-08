// /character-tabs-chrome-style.js
// Make「我的角色」right-side tabs look attached to the information box,
// similar to Google Chrome tabs.

(function () {
  function injectChromeTabStyle() {
    if (document.getElementById('characterTabsChromeStyle')) return;

    const style = document.createElement('style');
    style.id = 'characterTabsChromeStyle';
    style.textContent = `
      #characterScreen.active .sims-tab-right {
        gap: 0 !important;
        align-content: start !important;
      }

      #characterScreen.active .sims-tabs {
        display: flex !important;
        align-items: flex-end !important;
        gap: 4px !important;
        padding: 0 12px !important;
        margin: 0 0 -1px 0 !important;
        position: relative !important;
        z-index: 5 !important;
        overflow-x: auto !important;
        scrollbar-width: none !important;
      }

      #characterScreen.active .sims-tabs::-webkit-scrollbar {
        display: none !important;
      }

      #characterScreen.active .sims-tab-btn {
        position: relative !important;
        flex: 1 1 0 !important;
        min-width: 120px !important;
        padding: 11px 12px 10px !important;
        border-radius: 18px 18px 0 0 !important;
        border: 1px solid rgba(255,255,255,0.72) !important;
        border-bottom: 0 !important;
        background: linear-gradient(180deg, rgba(238,248,255,0.72), rgba(224,239,255,0.58)) !important;
        color: rgba(0,87,217,0.82) !important;
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,0.82),
          0 -2px 8px rgba(29,53,87,0.05) !important;
        transform: translateY(3px) !important;
        font-size: 0.93rem !important;
        white-space: nowrap !important;
      }

      #characterScreen.active .sims-tab-btn:hover,
      #characterScreen.active .sims-tab-btn:focus-visible {
        transform: translateY(1px) !important;
        background: linear-gradient(180deg, rgba(255,255,255,0.84), rgba(235,248,255,0.70)) !important;
      }

      #characterScreen.active .sims-tab-btn.active {
        z-index: 7 !important;
        color: #083b00 !important;
        background: linear-gradient(180deg, rgba(245,255,240,0.96), rgba(255,255,255,0.92)) !important;
        border-color: rgba(255,255,255,0.92) !important;
        transform: translateY(0) !important;
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,0.98),
          0 -4px 16px rgba(57,255,20,0.12) !important;
      }

      #characterScreen.active .sims-tab-btn.active::after {
        content: "" !important;
        position: absolute !important;
        left: 0 !important;
        right: 0 !important;
        bottom: -2px !important;
        height: 4px !important;
        background: rgba(255,255,255,0.94) !important;
        pointer-events: none !important;
      }

      #characterScreen.active .sims-tab-panel {
        margin-top: 0 !important;
        border-radius: 22px !important;
        border-top-left-radius: 18px !important;
        border: 1px solid rgba(255,255,255,0.88) !important;
        background: linear-gradient(180deg, rgba(255,255,255,0.92), rgba(245,251,255,0.70)) !important;
        box-shadow:
          0 18px 42px rgba(29,53,87,0.10),
          inset 0 1px 0 rgba(255,255,255,0.96) !important;
        position: relative !important;
        z-index: 4 !important;
      }

      #characterScreen.active .sims-tab-actions {
        margin-top: 10px !important;
      }

      @media (max-width: 1100px) {
        #characterScreen.active .sims-tabs {
          display: grid !important;
          grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          padding: 0 8px !important;
          gap: 4px !important;
        }

        #characterScreen.active .sims-tab-btn {
          min-width: 0 !important;
        }
      }

      @media (max-width: 640px) {
        #characterScreen.active .sims-tabs {
          grid-template-columns: 1fr 1fr !important;
        }
      }
    `;

    document.head.appendChild(style);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectChromeTabStyle);
  } else {
    injectChromeTabStyle();
  }

  window.addEventListener('load', injectChromeTabStyle);
})();
