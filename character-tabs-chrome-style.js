// /character-tabs-chrome-style.js
// Make「我的角色」right-side tabs look attached to the information box,
// similar to Google Chrome tabs.
// This script keeps re-applying the style at the end of <head> so character-page-fit.js cannot override it.

(function () {
  function injectChromeTabStyle() {
    const oldStyle = document.getElementById('characterTabsChromeStyle');
    if (oldStyle) oldStyle.remove();

    const style = document.createElement('style');
    style.id = 'characterTabsChromeStyle';
    style.textContent = `
      /* Chrome-like attached tabs for 我的角色 */
      #characterScreen.active .sims-tab-right {
        display: grid !important;
        grid-template-rows: auto auto auto !important;
        gap: 0 !important;
        align-content: start !important;
      }

      #characterScreen.active .sims-tabs {
        display: flex !important;
        align-items: flex-end !important;
        gap: 3px !important;
        padding: 0 14px !important;
        margin: 0 0 -1px 0 !important;
        position: relative !important;
        z-index: 30 !important;
        overflow-x: auto !important;
        scrollbar-width: none !important;
        background: transparent !important;
        border: 0 !important;
        box-shadow: none !important;
      }

      #characterScreen.active .sims-tabs::-webkit-scrollbar {
        display: none !important;
      }

      #characterScreen.active .sims-tab-btn {
        position: relative !important;
        flex: 1 1 0 !important;
        min-width: 120px !important;
        height: 48px !important;
        padding: 11px 12px 9px !important;
        margin: 0 !important;
        border-radius: 18px 18px 0 0 !important;
        border: 1px solid rgba(215,232,247,0.96) !important;
        border-bottom: 0 !important;
        background: linear-gradient(180deg, rgba(236,248,255,0.82), rgba(223,239,255,0.64)) !important;
        color: rgba(0,87,217,0.86) !important;
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,0.90),
          0 -2px 8px rgba(29,53,87,0.05) !important;
        transform: translateY(6px) !important;
        font-size: 0.93rem !important;
        font-weight: 950 !important;
        white-space: nowrap !important;
      }

      #characterScreen.active .sims-tab-btn:hover,
      #characterScreen.active .sims-tab-btn:focus-visible {
        transform: translateY(3px) !important;
        background: linear-gradient(180deg, rgba(255,255,255,0.90), rgba(236,248,255,0.76)) !important;
      }

      #characterScreen.active .sims-tab-btn.active {
        z-index: 35 !important;
        color: #083b00 !important;
        background: linear-gradient(180deg, rgba(245,255,240,0.98), rgba(255,255,255,0.98)) !important;
        border-color: rgba(255,255,255,0.98) !important;
        transform: translateY(0) !important;
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,1),
          0 -5px 16px rgba(57,255,20,0.13) !important;
      }

      #characterScreen.active .sims-tab-btn.active::after {
        content: "" !important;
        position: absolute !important;
        left: 0 !important;
        right: 0 !important;
        bottom: -3px !important;
        height: 6px !important;
        background: rgba(255,255,255,0.98) !important;
        pointer-events: none !important;
      }

      #characterScreen.active .sims-tab-panel,
      #characterScreen.active .sims-profile-card.sims-tab-panel,
      #characterScreen.active .sims-panel.sims-tab-panel {
        margin-top: 0 !important;
        border-radius: 22px !important;
        border-top-left-radius: 18px !important;
        border-top-right-radius: 18px !important;
        border: 1px solid rgba(255,255,255,0.94) !important;
        background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(245,251,255,0.76)) !important;
        box-shadow:
          0 18px 42px rgba(29,53,87,0.10),
          inset 0 1px 0 rgba(255,255,255,1) !important;
        position: relative !important;
        z-index: 20 !important;
      }

      #characterScreen.active .sims-tab-actions {
        margin-top: 10px !important;
      }

      @media (max-width: 1100px) {
        #characterScreen.active .sims-tabs {
          display: grid !important;
          grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          padding: 0 8px !important;
          gap: 3px !important;
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

  window.addEventListener('load', function () {
    injectChromeTabStyle();
    setTimeout(injectChromeTabStyle, 300);
    setTimeout(injectChromeTabStyle, 900);
    setTimeout(injectChromeTabStyle, 1800);
  });
})();
