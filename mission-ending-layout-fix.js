// /mission-ending-layout-fix.js
(function () {
  function injectStyle() {
    if (document.getElementById('missionEndingLayoutFixStyle')) return;
    const style = document.createElement('style');
    style.id = 'missionEndingLayoutFixStyle';
    style.textContent = `
      #gameScreen.active.mission-finish-mode #questionTracker,
      #gameScreen.active.mission-finish-mode .action-row,
      #gameScreen.active.mission-finish-mode #asdBox,
      #gameScreen.active.mission-finish-mode #sceneMeta,
      #gameScreen.active.mission-finish-mode #hintBox,
      #gameScreen.active.mission-finish-mode #calmBox,
      #gameScreen.active.mission-finish-mode #reviewBoxInline,
      #gameScreen.active.mission-finish-mode #gameScenarioImageBox,
      #gameScreen.active.mission-finish-mode .game-scenario-image-wrap {
        display: none !important;
      }

      #gameScreen.active.mission-finish-mode .game-layout,
      #gameScreen.active.mission-finish-mode .dialogue-area.center-column {
        width: 100% !important;
        max-width: 1040px !important;
        margin-left: auto !important;
        margin-right: auto !important;
      }

      #gameScreen.active.mission-finish-mode .dialogue-area.center-column {
        display: grid !important;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important;
        grid-template-areas: "ability result" "review review" "choices choices" !important;
        gap: 12px 14px !important;
        align-items: start !important;
      }

      #gameScreen.active.mission-finish-mode #virtueChangeBox {
        grid-area: ability !important;
        width: 100% !important;
        box-sizing: border-box !important;
        margin: 0 !important;
        min-height: 112px !important;
      }

      #gameScreen.active.mission-finish-mode #missionResultReviewBox {
        display: contents !important;
      }

      #gameScreen.active.mission-finish-mode #missionResultReviewBox .mission-result-summary-card {
        grid-area: result !important;
        width: 100% !important;
        box-sizing: border-box !important;
        min-height: 112px !important;
      }

      #gameScreen.active.mission-finish-mode #missionResultReviewBox .mission-result-review-card {
        grid-area: review !important;
        width: 100% !important;
        box-sizing: border-box !important;
        padding: 16px 18px !important;
      }

      #gameScreen.active.mission-finish-mode .mission-result-row-grid {
        grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
        gap: 10px !important;
      }

      #gameScreen.active.mission-finish-mode .mission-result-row {
        padding: 12px 12px !important;
        min-height: 170px !important;
      }

      #gameScreen.active.mission-finish-mode .mission-result-brief,
      #gameScreen.active.mission-finish-mode .mission-result-best {
        font-size: .82rem !important;
        line-height: 1.42 !important;
      }

      #gameScreen.active.mission-finish-mode #asdChoices {
        grid-area: choices !important;
        width: 100% !important;
        box-sizing: border-box !important;
      }

      @media (max-width: 980px) {
        #gameScreen.active.mission-finish-mode .dialogue-area.center-column {
          grid-template-columns: 1fr !important;
          grid-template-areas: "ability" "result" "review" "choices" !important;
        }
        #gameScreen.active.mission-finish-mode .mission-result-row-grid {
          grid-template-columns: 1fr !important;
        }
        #gameScreen.active.mission-finish-mode .mission-result-row {
          min-height: 0 !important;
        }
      }
    `;
    document.head.appendChild(style);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', injectStyle);
  else injectStyle();
  window.addEventListener('load', injectStyle);
})();
