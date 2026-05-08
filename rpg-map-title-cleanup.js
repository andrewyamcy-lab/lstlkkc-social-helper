// /rpg-map-title-cleanup.js
// Removes the extra「任務地圖」description section.
// Moves「改用情境列表」to the top-right corner of the map area.
// Also fixes the left-side overlap between the map intro card and mission info panel.

(function () {
  function injectMapTitleCleanupStyle() {
    const old = document.getElementById('rpgMapTitleCleanupStyle');
    if (old) old.remove();

    const style = document.createElement('style');
    style.id = 'rpgMapTitleCleanupStyle';
    style.textContent = `
      #rpgMapScreen.active .rpg-map-board {
        position: relative !important;
      }

      /* Remove the title/description text section */
      #rpgMapScreen.active .rpg-map-title-row {
        position: absolute !important;
        top: 24px !important;
        right: 24px !important;
        z-index: 120 !important;
        margin: 0 !important;
        padding: 0 !important;
        width: auto !important;
        display: block !important;
        background: transparent !important;
        border: 0 !important;
        box-shadow: none !important;
      }

      #rpgMapScreen.active .rpg-map-title-row > div {
        display: none !important;
      }

      /* Hide the yellow instruction pill to keep the left side clean. */
      #rpgMapScreen.active .rpg-map-instruction {
        display: none !important;
      }

      /* Keep only the button and make it float on the top-right of the map */
      #rpgMapScreen.active .rpg-map-title-row button {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        min-height: 42px !important;
        padding: 10px 16px !important;
        border-radius: 999px !important;
        font-size: .9rem !important;
        font-weight: 950 !important;
        background: rgba(255,255,255,.88) !important;
        color: var(--primary-dark) !important;
        border: 1px solid rgba(0,122,255,.22) !important;
        box-shadow: 0 12px 28px rgba(29,53,87,.16), inset 0 1px 0 rgba(255,255,255,.96) !important;
        backdrop-filter: blur(16px) saturate(170%) !important;
        -webkit-backdrop-filter: blur(16px) saturate(170%) !important;
      }

      #rpgMapScreen.active .rpg-map-title-row button:hover,
      #rpgMapScreen.active .rpg-map-title-row button:focus-visible {
        transform: translateY(-1px) !important;
        background: #ffffff !important;
        box-shadow: 0 16px 34px rgba(29,53,87,.20), inset 0 1px 0 rgba(255,255,255,.98) !important;
      }

      @media (min-width: 1101px) {
        #rpgMapScreen.active .rpg-map-title-row {
          grid-column: 2 !important;
          grid-row: 1 !important;
        }

        /* The map board sits behind the header in the same grid row.
           Push the side mission panel down so it starts below the intro card. */
        #rpgMapScreen.active #rpgSideMissionPanel {
          grid-column: 1 !important;
          grid-row: 1 / 4 !important;
          align-self: stretch !important;
          margin-top: 172px !important;
          height: calc(100% - 172px) !important;
          max-height: calc(100% - 172px) !important;
          overflow: auto !important;
          z-index: 30 !important;
        }

        #rpgMapScreen.active .rpg-real-map-scroll {
          grid-column: 2 !important;
          grid-row: 1 / 4 !important;
        }
      }

      @media (max-width: 640px) {
        #rpgMapScreen.active .rpg-map-title-row {
          top: 14px !important;
          right: 14px !important;
        }

        #rpgMapScreen.active .rpg-map-title-row button {
          min-height: 38px !important;
          padding: 8px 12px !important;
          font-size: .82rem !important;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function runFix() {
    injectMapTitleCleanupStyle();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runFix);
  } else {
    runFix();
  }

  window.addEventListener('load', function () {
    runFix();
    setTimeout(runFix, 400);
    setTimeout(runFix, 1200);
  });
})();
