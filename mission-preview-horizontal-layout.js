// /mission-preview-horizontal-layout.js
// Desktop RPG mission preview layout:
// photo on the left, all mission information + start button on the right.
// Designed to fit in one screen without scrolling.

(function () {
  function injectHorizontalMissionPreviewStyle() {
    const old = document.getElementById('missionPreviewHorizontalLayoutStyle');
    if (old) old.remove();

    const style = document.createElement('style');
    style.id = 'missionPreviewHorizontalLayoutStyle';
    style.textContent = `
      @media (min-width: 1101px) {
        /* Give the left information area enough width for photo + info side by side. */
        #rpgMapScreen.active .rpg-map-shell,
        #rpgMapScreen.active .rpg-map-board {
          grid-template-columns: 520px minmax(0, 1fr) !important;
        }

        #rpgMapScreen.active #rpgSideMissionPanel {
          grid-column: 1 !important;
          align-self: stretch !important;
          overflow: hidden !important;
          padding: 12px !important;
          min-height: 0 !important;
        }

        #rpgMapScreen.active #rpgSideMissionPanel .rpg-side-card {
          height: 100% !important;
          min-height: 0 !important;
          display: grid !important;
          grid-template-columns: 46% minmax(0, 1fr) !important;
          grid-template-areas:
            "photo meta"
            "photo status"
            "photo title"
            "photo desc"
            "photo actions" !important;
          gap: 10px 14px !important;
          align-content: start !important;
          align-items: start !important;
          overflow: hidden !important;
        }

        #rpgMapScreen.active #rpgSideMissionPanel .rpg-side-image {
          grid-area: photo !important;
          width: 100% !important;
          height: 100% !important;
          max-height: 300px !important;
          min-height: 220px !important;
          object-fit: cover !important;
          object-position: center center !important;
          border-radius: 18px !important;
        }

        #rpgMapScreen.active #rpgSideMissionPanel .rpg-side-tag-row {
          grid-area: meta !important;
          gap: 7px !important;
          align-self: start !important;
        }

        #rpgMapScreen.active #rpgSideMissionPanel .rpg-side-location,
        #rpgMapScreen.active #rpgSideMissionPanel .rpg-side-difficulty {
          padding: 7px 10px !important;
          font-size: .82rem !important;
          line-height: 1.2 !important;
        }

        #rpgMapScreen.active #rpgSideMissionPanel .rpg-side-status {
          grid-area: status !important;
          padding: 8px 10px !important;
          gap: 4px !important;
        }

        #rpgMapScreen.active #rpgSideMissionPanel .rpg-side-status-main {
          font-size: .86rem !important;
        }

        #rpgMapScreen.active #rpgSideMissionPanel .rpg-side-status-detail,
        #rpgMapScreen.active #rpgSideMissionPanel .rpg-side-status-note {
          font-size: .72rem !important;
          line-height: 1.35 !important;
        }

        #rpgMapScreen.active #rpgSideMissionPanel .rpg-side-title {
          grid-area: title !important;
          margin: 0 !important;
          font-size: 1.12rem !important;
          line-height: 1.25 !important;
        }

        #rpgMapScreen.active #rpgSideMissionPanel .rpg-side-desc {
          grid-area: desc !important;
          margin: 0 !important;
          font-size: .9rem !important;
          line-height: 1.5 !important;
        }

        #rpgMapScreen.active #rpgSideMissionPanel .rpg-side-actions {
          grid-area: actions !important;
          display: grid !important;
          grid-template-columns: 1fr 1fr !important;
          gap: 8px !important;
          margin-top: 4px !important;
          align-self: end !important;
        }

        #rpgMapScreen.active #rpgSideMissionPanel .rpg-side-actions button {
          padding: 10px 10px !important;
          border-radius: 14px !important;
          font-size: .86rem !important;
        }
      }

      @media (min-width: 1101px) and (max-height: 760px) {
        #rpgMapScreen.active #rpgSideMissionPanel .rpg-side-image {
          max-height: 250px !important;
          min-height: 190px !important;
        }

        #rpgMapScreen.active #rpgSideMissionPanel .rpg-side-card {
          gap: 8px 12px !important;
        }

        #rpgMapScreen.active #rpgSideMissionPanel .rpg-side-title {
          font-size: 1.02rem !important;
        }

        #rpgMapScreen.active #rpgSideMissionPanel .rpg-side-desc {
          font-size: .82rem !important;
          line-height: 1.42 !important;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function run() {
    injectHorizontalMissionPreviewStyle();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }

  window.addEventListener('load', function () {
    run();
    setTimeout(run, 400);
    setTimeout(run, 1200);
  });
})();
