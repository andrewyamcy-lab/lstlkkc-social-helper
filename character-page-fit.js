// /character-page-fit.js
// Stronger layout fix for「我的角色」only.
// Goal: use monitor width better and reduce vertical scrolling.
// The MP4 portrait ratio is preserved with aspect-ratio + object-fit: contain.

(function () {
  function injectCharacterPageFitStyle() {
    if (document.getElementById('characterPageFitStyle')) return;

    const style = document.createElement('style');
    style.id = 'characterPageFitStyle';
    style.textContent = `
      /* Apply only when 我的角色 page is active */
      @media (min-width: 1101px) {
        body:has(#characterScreen.active) > header,
        body:has(#characterScreen.active) > footer {
          display: none !important;
        }

        body:has(#characterScreen.active) {
          overflow-x: hidden !important;
        }

        body:has(#characterScreen.active) .container {
          width: min(98vw, 1760px) !important;
          max-width: 1760px !important;
          margin: 10px auto !important;
          padding-left: 10px !important;
          padding-right: 10px !important;
        }

        body:has(#characterScreen.active) .card {
          padding: 12px !important;
        }

        body:has(#characterScreen.active) #characterScreen.welcome-screen {
          padding: 0 !important;
          min-height: auto !important;
        }

        #characterScreen.active .sims-character-page {
          width: 100% !important;
          max-width: none !important;
          min-height: calc(100vh - 44px) !important;
          padding: 14px !important;
          border-radius: 24px !important;
          display: grid !important;
          grid-template-rows: auto 1fr auto auto !important;
          gap: 10px !important;
        }

        #characterScreen.active .sims-topbar {
          margin-bottom: 0 !important;
          align-items: center !important;
        }

        #characterScreen.active .sims-topbar .tag {
          padding: 6px 12px !important;
          margin-bottom: 5px !important;
        }

        #characterScreen.active .sims-topbar h2 {
          font-size: clamp(1.35rem, 1.8vw, 1.85rem) !important;
          margin: 0 0 2px !important;
          line-height: 1.15 !important;
        }

        #characterScreen.active .sims-topbar p {
          font-size: 0.88rem !important;
          line-height: 1.35 !important;
          margin: 0 !important;
        }

        #characterScreen.active .sims-main-grid {
          grid-template-columns: minmax(460px, 0.82fr) minmax(680px, 1.18fr) !important;
          gap: 12px !important;
          align-items: stretch !important;
        }

        #characterScreen.active .sims-left-panel,
        #characterScreen.active .sims-profile-card,
        #characterScreen.active .sims-mood-card,
        #characterScreen.active .sims-panel {
          padding: 12px !important;
          border-radius: 20px !important;
        }

        #characterScreen.active .sims-right-panel {
          gap: 10px !important;
        }

        #characterScreen.active .sims-video-stage {
          gap: 8px !important;
        }

        #characterScreen.active .sims-video-frame {
          width: min(100%, 430px) !important;
          max-width: 430px !important;
          aspect-ratio: 9 / 16 !important;
          height: auto !important;
          min-height: 0 !important;
          max-height: min(68vh, 690px) !important;
          margin: 0 auto !important;
          border-radius: 22px !important;
        }

        #characterScreen.active .sims-character-video {
          width: 100% !important;
          height: 100% !important;
          min-height: 0 !important;
          max-height: none !important;
          object-fit: contain !important;
          object-position: center center !important;
        }

        #characterScreen.active .sims-character-switch {
          grid-template-columns: 1fr 1fr !important;
          gap: 8px !important;
          width: min(100%, 430px) !important;
          margin-left: auto !important;
          margin-right: auto !important;
        }

        #characterScreen.active .sims-switch-btn {
          padding: 9px 12px !important;
          min-height: 42px !important;
        }

        #characterScreen.active .sims-name-row h3,
        #characterScreen.active .sims-mood-card h3 {
          font-size: 1.12rem !important;
          margin: 1px 0 0 !important;
        }

        #characterScreen.active .sims-label,
        #characterScreen.active .sims-info-grid span,
        #characterScreen.active .sims-summary-grid span,
        #characterScreen.active .sims-trait small {
          font-size: 0.78rem !important;
        }

        #characterScreen.active .sims-level-badge {
          min-width: 58px !important;
          min-height: 40px !important;
          border-radius: 15px !important;
        }

        #characterScreen.active .sims-info-grid,
        #characterScreen.active .sims-summary-grid {
          gap: 7px !important;
          margin-top: 8px !important;
        }

        #characterScreen.active .sims-info-grid div,
        #characterScreen.active .sims-summary-grid div {
          padding: 7px 9px !important;
          border-radius: 13px !important;
        }

        #characterScreen.active .sims-exp-wrap {
          margin-top: 8px !important;
          gap: 6px !important;
        }

        #characterScreen.active .sims-exp-bar {
          height: 18px !important;
        }

        #characterScreen.active .sims-mood-card {
          grid-template-columns: auto 1fr !important;
          gap: 9px !important;
        }

        #characterScreen.active .sims-mood-icon {
          width: 44px !important;
          height: 44px !important;
          font-size: 1.35rem !important;
          border-radius: 15px !important;
        }

        #characterScreen.active .sims-mood-card p {
          font-size: 0.82rem !important;
          line-height: 1.35 !important;
          margin-top: 2px !important;
        }

        #characterScreen.active .sims-bottom-grid {
          grid-template-columns: 1.16fr 0.92fr 0.92fr !important;
          gap: 10px !important;
          margin-top: 0 !important;
        }

        #characterScreen.active .sims-panel h3 {
          font-size: 0.98rem !important;
          margin: 0 0 5px !important;
        }

        #characterScreen.active .panel-badge {
          padding: 4px 9px !important;
          margin-bottom: 5px !important;
          font-size: 0.72rem !important;
        }

        #characterScreen.active .sims-skill-list,
        #characterScreen.active .sims-trait-grid,
        #characterScreen.active .sims-mission-list {
          gap: 5px !important;
        }

        #characterScreen.active .sims-skill-row,
        #characterScreen.active .sims-trait,
        #characterScreen.active .sims-mission-item {
          padding: 6px 8px !important;
          border-radius: 14px !important;
        }

        #characterScreen.active .sims-skill-name {
          min-width: 92px !important;
          gap: 6px !important;
        }

        #characterScreen.active .sims-skill-bar {
          height: 12px !important;
        }

        #characterScreen.active .sims-skill-value {
          width: 26px !important;
          font-size: 0.84rem !important;
        }

        #characterScreen.active .sims-trait-icon {
          width: 34px !important;
          height: 34px !important;
          border-radius: 12px !important;
        }

        #characterScreen.active .sims-actions {
          margin-top: 0 !important;
          gap: 8px !important;
        }

        #characterScreen.active .sims-actions button {
          padding-top: 9px !important;
          padding-bottom: 9px !important;
        }
      }

      @media (min-width: 1500px) {
        #characterScreen.active .sims-main-grid {
          grid-template-columns: minmax(520px, 0.82fr) minmax(900px, 1.18fr) !important;
        }

        #characterScreen.active .sims-video-frame {
          width: min(100%, 500px) !important;
          max-width: 500px !important;
          max-height: min(72vh, 760px) !important;
        }

        #characterScreen.active .sims-character-switch {
          width: min(100%, 500px) !important;
        }
      }
    `;

    document.head.appendChild(style);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectCharacterPageFitStyle);
  } else {
    injectCharacterPageFitStyle();
  }

  window.addEventListener('load', injectCharacterPageFitStyle);
})();
