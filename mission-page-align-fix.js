// /mission-page-align-fix.js
// Final alignment fix for「任務進行頁」preview screen.
// Fixes:
// 1. 16:9 photo ratio
// 2. Background card covers the whole front layout
// 3. Front layout is centered inside the background card

(function () {
  function injectMissionPageAlignFix() {
    const old = document.getElementById('missionPageAlignFixStyle');
    if (old) old.remove();

    const style = document.createElement('style');
    style.id = 'missionPageAlignFixStyle';
    style.textContent = `
      @media (min-width: 981px) {
        body:has(#gameScreen.active.mission-intro-mode) .container,
        body:has(#gameScreen.active.mission-intro-mode) .card {
          width: min(1380px, calc(100vw - 64px)) !important;
          max-width: min(1380px, calc(100vw - 64px)) !important;
          margin-left: auto !important;
          margin-right: auto !important;
          overflow: visible !important;
        }

        #gameScreen.active.mission-intro-mode {
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
          padding: 28px 36px !important;
          overflow: visible !important;
          align-items: center !important;
        }

        #gameScreen.active.mission-intro-mode .game-layout {
          width: 100% !important;
          max-width: 1210px !important;
          margin-left: auto !important;
          margin-right: auto !important;
          overflow: visible !important;
        }

        #gameScreen.active.mission-intro-mode .dialogue-area.center-column {
          width: 100% !important;
          max-width: 1210px !important;
          margin-left: auto !important;
          margin-right: auto !important;
          display: grid !important;
          grid-template-columns: minmax(0, 580px) minmax(0, 560px) !important;
          grid-template-areas:
            "photo info"
            "photo start" !important;
          gap: 20px !important;
          justify-content: center !important;
          align-items: start !important;
          overflow: visible !important;
        }

        #gameScreen.active.mission-intro-mode #asdBox {
          width: 100% !important;
          box-sizing: border-box !important;
          padding: 14px !important;
          height: auto !important;
          min-height: 0 !important;
          overflow: hidden !important;
        }

        #gameScreen.active.mission-intro-mode #asdBox .game-scenario-image-wrap {
          width: 100% !important;
          height: auto !important;
          aspect-ratio: 16 / 9 !important;
          overflow: hidden !important;
          border-radius: 20px !important;
        }

        #gameScreen.active.mission-intro-mode #asdBox .game-scenario-image-wrap img {
          width: 100% !important;
          height: 100% !important;
          aspect-ratio: 16 / 9 !important;
          object-fit: cover !important;
          object-position: center center !important;
          display: block !important;
        }

        #gameScreen.active.mission-intro-mode #sceneMeta,
        #gameScreen.active.mission-intro-mode #asdChoices {
          width: 100% !important;
          box-sizing: border-box !important;
          margin-left: 0 !important;
          margin-right: 0 !important;
        }

        #gameScreen.active.mission-intro-mode > .welcome-actions {
          width: 100% !important;
          max-width: 1210px !important;
          margin-left: auto !important;
          margin-right: auto !important;
          box-sizing: border-box !important;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function run() {
    injectMissionPageAlignFix();
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
