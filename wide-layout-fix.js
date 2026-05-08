// /wide-layout-fix.js
// Desktop layout improvement:
// 1. Use more screen width.
// 2. Reduce vertical scrolling.
// 3. Make 我的角色 and RPG map more compact on large screens.

(function () {
  function injectWideLayoutFix() {
    if (document.getElementById('wideLayoutFixStyle')) return;

    const style = document.createElement('style');
    style.id = 'wideLayoutFixStyle';
    style.textContent = `
      /* Use more desktop width */
      @media (min-width: 1200px) {
        header {
          padding: 14px 20px !important;
        }

        header h1 {
          font-size: clamp(1.2rem, 1.5vw, 1.65rem) !important;
        }

        header p {
          font-size: 0.92rem !important;
        }

        .container {
          width: min(96vw, 1680px) !important;
          max-width: 1680px !important;
          margin-top: 16px !important;
          margin-bottom: 24px !important;
          padding-left: 22px !important;
          padding-right: 22px !important;
        }

        .card {
          padding: 18px !important;
        }

        .hero-card {
          padding: 22px 28px !important;
        }

        .welcome-screen {
          padding-top: 0 !important;
          padding-bottom: 0 !important;
        }

        .hero-avatar {
          width: 76px !important;
          height: 76px !important;
          font-size: 2rem !important;
          margin-bottom: 8px !important;
        }

        .hero-card h2 {
          margin-bottom: 6px !important;
        }

        .hero-card p {
          margin-top: 4px !important;
          margin-bottom: 8px !important;
        }

        .welcome-actions,
        .menu-actions {
          margin-top: 14px !important;
        }
      }

      /* Scenario list: more cards per row = less scrolling */
      @media (min-width: 1200px) {
        .scenario-select-grid {
          grid-template-columns: repeat(4, minmax(230px, 1fr)) !important;
          gap: 12px !important;
          margin-top: 14px !important;
        }

        .scenario-card {
          min-height: 190px !important;
          padding: 14px !important;
          gap: 7px !important;
        }

        .scenario-card .emoji {
          font-size: 1.6rem !important;
        }
      }

      @media (min-width: 1500px) {
        .scenario-select-grid {
          grid-template-columns: repeat(5, minmax(220px, 1fr)) !important;
        }
      }

      /* 我的角色: compact Sims layout, less vertical height */
      @media (min-width: 1200px) {
        #characterScreen .sims-character-page {
          padding: 18px !important;
          width: 100% !important;
          max-width: none !important;
        }

        #characterScreen .sims-topbar {
          margin-bottom: 12px !important;
          align-items: center !important;
        }

        #characterScreen .sims-topbar h2 {
          font-size: clamp(1.45rem, 2vw, 2rem) !important;
          margin-bottom: 2px !important;
        }

        #characterScreen .sims-topbar p {
          font-size: 0.92rem !important;
        }

        #characterScreen .sims-main-grid {
          grid-template-columns: minmax(420px, 0.85fr) minmax(620px, 1.15fr) !important;
          gap: 16px !important;
        }

        #characterScreen .sims-left-panel,
        #characterScreen .sims-profile-card,
        #characterScreen .sims-mood-card,
        #characterScreen .sims-panel {
          padding: 14px !important;
          border-radius: 22px !important;
        }

        #characterScreen .sims-video-frame {
          min-height: 390px !important;
          height: 46vh !important;
          max-height: 500px !important;
          border-radius: 24px !important;
        }

        #characterScreen .sims-character-video {
          min-height: 390px !important;
          height: 46vh !important;
          max-height: 500px !important;
        }

        #characterScreen .sims-character-switch {
          gap: 8px !important;
        }

        #characterScreen .sims-profile-card,
        #characterScreen .sims-mood-card {
          min-height: auto !important;
        }

        #characterScreen .sims-info-grid,
        #characterScreen .sims-summary-grid {
          gap: 8px !important;
          margin-top: 10px !important;
        }

        #characterScreen .sims-info-grid div,
        #characterScreen .sims-summary-grid div {
          padding: 9px 11px !important;
          border-radius: 14px !important;
        }

        #characterScreen .sims-exp-wrap {
          margin-top: 10px !important;
        }

        #characterScreen .sims-mood-icon {
          width: 52px !important;
          height: 52px !important;
          font-size: 1.6rem !important;
          border-radius: 18px !important;
        }

        #characterScreen .sims-bottom-grid {
          grid-template-columns: 1.1fr 0.95fr 1fr !important;
          gap: 12px !important;
          margin-top: 12px !important;
        }

        #characterScreen .sims-panel h3 {
          margin-bottom: 6px !important;
        }

        #characterScreen .sims-skill-list,
        #characterScreen .sims-trait-grid,
        #characterScreen .sims-mission-list {
          gap: 7px !important;
        }

        #characterScreen .sims-skill-row,
        #characterScreen .sims-trait,
        #characterScreen .sims-mission-item {
          padding-top: 8px !important;
          padding-bottom: 8px !important;
        }

        #characterScreen .sims-actions {
          margin-top: 12px !important;
        }
      }

      @media (min-width: 1500px) {
        #characterScreen .sims-main-grid {
          grid-template-columns: minmax(460px, 0.75fr) minmax(760px, 1.25fr) !important;
        }

        #characterScreen .sims-video-frame,
        #characterScreen .sims-character-video {
          height: 48vh !important;
          max-height: 520px !important;
        }
      }

      /* RPG map: wider and more compact */
      @media (min-width: 1200px) {
        #rpgMapScreen,
        #rpgMapScreen .rpg-map-board,
        #rpgMapScreen .rpg-map-card,
        #rpgMapScreen .rpg-map-wrap {
          max-width: none !important;
          width: 100% !important;
        }

        #rpgProgressPanel {
          padding: 12px 14px !important;
          margin: 8px 0 12px !important;
        }

        #rpgProgressPanel .rpg-progress-stats {
          grid-template-columns: repeat(4, 1fr) !important;
          gap: 8px !important;
          margin-top: 8px !important;
        }

        #rpgProgressPanel .rpg-progress-stats span {
          padding: 7px 9px !important;
        }
      }

      /* Game page: make central practice card a bit wider */
      @media (min-width: 1200px) {
        #gameScreen .game-layout[style] {
          max-width: 980px !important;
        }

        #gameScreen .dialogue-box {
          min-height: 210px !important;
        }
      }

      footer {
        padding-bottom: 18px !important;
      }
    `;

    document.head.appendChild(style);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectWideLayoutFix);
  } else {
    injectWideLayoutFix();
  }

  window.addEventListener('load', injectWideLayoutFix);
})();
