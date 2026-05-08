// /mission-page-compact-layout.js
// Compact「任務進行頁」layout.
// Goal: reduce page height and make the mission page closer to one-screen use.
// Desktop layout: left side = story/image area, right side = question, choices and action buttons.

(function () {
  function injectCompactMissionPageStyle() {
    const old = document.getElementById('missionPageCompactLayoutStyle');
    if (old) old.remove();

    const style = document.createElement('style');
    style.id = 'missionPageCompactLayoutStyle';
    style.textContent = `
      /* Compact game / mission page */
      #gameScreen.active {
        padding: 18px !important;
      }

      #gameScreen.active > .tag {
        margin-bottom: 8px !important;
      }

      #gameScreen.active > h2 {
        margin: 0 0 6px !important;
        font-size: 1.7rem !important;
        line-height: 1.15 !important;
      }

      #gameScreen.active > p {
        display: none !important;
      }

      #gameScreen.active > .welcome-actions {
        position: sticky !important;
        top: 8px !important;
        z-index: 40 !important;
        display: flex !important;
        flex-wrap: wrap !important;
        gap: 8px !important;
        margin: 8px 0 10px !important;
        padding: 8px !important;
        border-radius: 20px !important;
        background: rgba(255,255,255,.72) !important;
        border: 1px solid rgba(255,255,255,.80) !important;
        box-shadow: 0 10px 24px rgba(29,53,87,.08), inset 0 1px 0 rgba(255,255,255,.92) !important;
        backdrop-filter: blur(14px) saturate(160%) !important;
        -webkit-backdrop-filter: blur(14px) saturate(160%) !important;
      }

      #gameScreen.active > .welcome-actions button {
        padding: 9px 13px !important;
        border-radius: 14px !important;
        font-size: .9rem !important;
      }

      #gameScreen.active .top-status {
        display: grid !important;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important;
        gap: 10px !important;
        margin-bottom: 10px !important;
      }

      #gameScreen.active .status-box {
        padding: 12px 14px !important;
        border-radius: 18px !important;
        min-height: 0 !important;
      }

      #gameScreen.active .status-title {
        font-size: .9rem !important;
        margin-bottom: 4px !important;
      }

      #gameScreen.active .status-box .small {
        font-size: .84rem !important;
        line-height: 1.35 !important;
      }

      #gameScreen.active .progress-wrap {
        height: 9px !important;
        margin-top: 6px !important;
      }

      #gameScreen.active .achievement-row {
        gap: 6px !important;
        margin-top: 6px !important;
      }

      #gameScreen.active .achievement-pill {
        padding: 6px 9px !important;
        font-size: .78rem !important;
      }

      #gameScreen.active .game-layout {
        max-width: 1120px !important;
        margin-left: auto !important;
        margin-right: auto !important;
      }

      #gameScreen.active .dialogue-area.center-column {
        max-width: none !important;
        display: grid !important;
        grid-template-columns: minmax(360px, 44%) minmax(0, 1fr) !important;
        grid-template-areas:
          "tracker tracker"
          "story choices"
          "story actions" !important;
        gap: 12px !important;
        align-items: start !important;
      }

      #gameScreen.active #questionTracker {
        grid-area: tracker !important;
        margin: 0 !important;
        padding: 12px 14px !important;
        border-radius: 20px !important;
      }

      #gameScreen.active .question-tracker-main {
        gap: 10px !important;
      }

      #gameScreen.active #questionBadgeBig {
        padding: 7px 12px !important;
        font-size: .92rem !important;
      }

      #gameScreen.active #questionTrackerTitle {
        font-size: .95rem !important;
      }

      #gameScreen.active .question-pills {
        margin-top: 8px !important;
      }

      #gameScreen.active .question-pill {
        height: 28px !important;
        min-width: 28px !important;
        font-size: .82rem !important;
      }

      #gameScreen.active #asdBox {
        grid-area: story !important;
        margin: 0 !important;
        padding: 16px !important;
        border-radius: 22px !important;
        max-height: calc(100vh - 330px) !important;
        min-height: 360px !important;
        overflow: auto !important;
      }

      #gameScreen.active #asdBox img,
      #gameScreen.active #asdBox .scenario-image,
      #gameScreen.active #asdBox .background-image,
      #gameScreen.active #asdBox [class*="image"] img {
        max-height: 300px !important;
        width: 100% !important;
        object-fit: cover !important;
        border-radius: 18px !important;
      }

      #gameScreen.active #sceneMeta,
      #gameScreen.active #hintBox,
      #gameScreen.active #calmBox,
      #gameScreen.active #reviewBoxInline {
        grid-column: 2 !important;
        margin: 0 !important;
      }

      #gameScreen.active #asdChoices {
        grid-area: choices !important;
        display: grid !important;
        gap: 10px !important;
        margin: 0 !important;
        align-self: start !important;
      }

      #gameScreen.active #asdChoices button,
      #gameScreen.active .choice-grid button {
        padding: 13px 15px !important;
        border-radius: 18px !important;
        font-size: .96rem !important;
        line-height: 1.45 !important;
        text-align: left !important;
      }

      #gameScreen.active .action-row {
        grid-area: actions !important;
        margin: 0 !important;
        display: grid !important;
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        gap: 9px !important;
        align-self: end !important;
      }

      #gameScreen.active .action-row button {
        padding: 11px 12px !important;
        border-radius: 16px !important;
        font-size: .9rem !important;
      }

      @media (max-width: 980px) {
        #gameScreen.active .dialogue-area.center-column {
          grid-template-columns: 1fr !important;
          grid-template-areas:
            "tracker"
            "story"
            "choices"
            "actions" !important;
        }

        #gameScreen.active #asdBox {
          min-height: 0 !important;
          max-height: none !important;
          overflow: visible !important;
        }

        #gameScreen.active #sceneMeta,
        #gameScreen.active #hintBox,
        #gameScreen.active #calmBox,
        #gameScreen.active #reviewBoxInline {
          grid-column: 1 !important;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function run() {
    injectCompactMissionPageStyle();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }

  window.addEventListener('load', function () {
    run();
    setTimeout(run, 500);
    setTimeout(run, 1500);
  });
})();
