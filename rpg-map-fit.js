// /rpg-map-fit.js
// Fit「RPG 校園任務地圖」into one desktop screen.
// This affects only #rpgMapScreen and keeps other pages unchanged.

(function () {
  function injectRpgMapFitStyle() {
    const old = document.getElementById('rpgMapFitStyle');
    if (old) old.remove();

    const style = document.createElement('style');
    style.id = 'rpgMapFitStyle';
    style.textContent = `
      @media (min-width: 1101px) {
        body:has(#rpgMapScreen.active) > header,
        body:has(#rpgMapScreen.active) > footer {
          display: none !important;
        }

        body:has(#rpgMapScreen.active) {
          overflow-x: hidden !important;
        }

        body:has(#rpgMapScreen.active) .container {
          width: min(98vw, 1560px) !important;
          max-width: 1560px !important;
          margin: 8px auto !important;
          padding-left: 8px !important;
          padding-right: 8px !important;
        }

        body:has(#rpgMapScreen.active) .card {
          padding: 8px !important;
          border-radius: 22px !important;
        }

        body:has(#rpgMapScreen.active) #rpgMapScreen.welcome-screen {
          padding: 0 !important;
          min-height: auto !important;
        }

        #rpgMapScreen.active .rpg-map-shell {
          width: 100% !important;
          max-width: none !important;
          min-height: calc(100vh - 32px) !important;
          padding: 14px !important;
          border-radius: 24px !important;
          display: grid !important;
          grid-template-rows: auto minmax(0, 1fr) auto !important;
          gap: 8px !important;
        }

        #rpgMapScreen.active .rpg-map-header {
          margin-bottom: 4px !important;
          display: grid !important;
          place-items: center !important;
          gap: 4px !important;
        }

        #rpgMapScreen.active .rpg-map-header .tag {
          padding: 5px 11px !important;
          font-size: 0.74rem !important;
        }

        #rpgMapScreen.active .rpg-map-header .hero-avatar {
          display: none !important;
        }

        #rpgMapScreen.active .rpg-map-header h2 {
          margin: 2px 0 0 !important;
          font-size: clamp(1.35rem, 1.8vw, 1.9rem) !important;
          line-height: 1.12 !important;
        }

        #rpgMapScreen.active .rpg-map-header p {
          margin: 2px 0 0 !important;
          font-size: 0.86rem !important;
          line-height: 1.35 !important;
        }

        #rpgMapScreen.active .rpg-map-board {
          min-height: 0 !important;
          height: 100% !important;
          padding: 10px !important;
          border-radius: 22px !important;
          display: grid !important;
          grid-template-rows: auto auto auto minmax(0, 1fr) !important;
          gap: 6px !important;
          overflow: hidden !important;
        }

        #rpgMapScreen.active .rpg-map-title-row {
          margin-bottom: 0 !important;
          gap: 8px !important;
        }

        #rpgMapScreen.active .rpg-map-title-row strong {
          font-size: 0.98rem !important;
        }

        #rpgMapScreen.active .rpg-mini-map-note {
          margin-top: 2px !important;
          font-size: 0.8rem !important;
          line-height: 1.25 !important;
        }

        #rpgMapScreen.active .rpg-map-title-row button {
          padding: 8px 12px !important;
          border-radius: 14px !important;
          font-size: 0.86rem !important;
        }

        #rpgMapScreen.active .rpg-map-instruction {
          margin: 0 !important;
          padding: 6px 10px !important;
          font-size: 0.82rem !important;
          width: fit-content !important;
        }

        #rpgMapScreen.active #rpgProgressPanel {
          margin: 0 !important;
          padding: 10px 12px !important;
          border-radius: 18px !important;
        }

        #rpgMapScreen.active #rpgProgressPanel .rpg-progress-head {
          margin-bottom: 5px !important;
          gap: 8px !important;
        }

        #rpgMapScreen.active #rpgProgressPanel .rpg-progress-head strong {
          font-size: 0.96rem !important;
        }

        #rpgMapScreen.active #rpgProgressPanel .rpg-progress-head p {
          display: none !important;
        }

        #rpgMapScreen.active #rpgProgressPanel .rpg-progress-percent {
          min-width: 52px !important;
          height: 36px !important;
          border-radius: 14px !important;
          font-size: 0.92rem !important;
        }

        #rpgMapScreen.active #rpgProgressPanel .rpg-map-level-mini {
          gap: 4px !important;
          margin-bottom: 5px !important;
          font-size: 0.8rem !important;
        }

        #rpgMapScreen.active #rpgProgressPanel .rpg-progress-bar-wrap {
          height: 13px !important;
        }

        #rpgMapScreen.active #rpgProgressPanel > .rpg-progress-bar-wrap[aria-label="任務完成進度"] {
          display: none !important;
        }

        #rpgMapScreen.active #rpgProgressPanel .rpg-progress-stats {
          grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
          gap: 6px !important;
          margin-top: 7px !important;
        }

        #rpgMapScreen.active #rpgProgressPanel .rpg-progress-stats span {
          padding: 6px 8px !important;
          border-radius: 12px !important;
          font-size: 0.78rem !important;
          white-space: nowrap !important;
        }

        #rpgMapScreen.active #rpgProgressPanel .rpg-progress-actions {
          display: none !important;
        }

        #rpgMapScreen.active .rpg-real-map-scroll {
          height: clamp(310px, calc(100vh - 360px), 560px) !important;
          min-height: 0 !important;
          overflow: hidden !important;
          border-radius: 18px !important;
        }

        #rpgMapScreen.active .rpg-real-map-wrap {
          width: 100% !important;
          min-width: 0 !important;
          height: 100% !important;
          line-height: 0 !important;
        }

        #rpgMapScreen.active .rpg-real-map-img {
          width: 100% !important;
          height: 100% !important;
          object-fit: contain !important;
          object-position: center center !important;
          border-radius: 18px !important;
        }

        #rpgMapScreen.active .rpg-map-marker {
          width: 42px !important;
          height: 42px !important;
          border-radius: 14px !important;
          border-width: 3px !important;
          box-shadow:
            0 8px 18px rgba(0, 87, 217, 0.26),
            0 0 0 4px rgba(255, 176, 0, 0.22),
            0 0 0 8px rgba(0, 122, 255, 0.12) !important;
        }

        #rpgMapScreen.active .rpg-map-marker::before {
          inset: -8px !important;
          border-radius: 18px !important;
          border-width: 2px !important;
        }

        #rpgMapScreen.active .rpg-marker-icon {
          font-size: 1.08rem !important;
        }

        #rpgMapScreen.active .rpg-marker-text {
          font-size: 0.48rem !important;
          padding: 1px 4px !important;
        }

        #rpgMapScreen.active .rpg-marker-mini-stars {
          font-size: 0.48rem !important;
        }

        #rpgMapScreen.active .rpg-floating-preview {
          width: 250px !important;
          max-width: 250px !important;
          padding: 10px !important;
          border-radius: 18px !important;
        }

        #rpgMapScreen.active .rpg-preview-body {
          grid-template-columns: 68px 1fr !important;
          gap: 8px !important;
        }

        #rpgMapScreen.active .rpg-preview-image {
          width: 68px !important;
          border-radius: 14px !important;
        }

        #rpgMapScreen.active .rpg-preview-content h3 {
          font-size: 0.9rem !important;
          margin-bottom: 3px !important;
        }

        #rpgMapScreen.active .rpg-preview-content p {
          font-size: 0.78rem !important;
          line-height: 1.35 !important;
        }

        #rpgMapScreen.active .rpg-preview-actions {
          margin-top: 8px !important;
        }

        #rpgMapScreen.active .rpg-preview-actions button {
          padding: 7px 10px !important;
          font-size: 0.78rem !important;
          border-radius: 12px !important;
        }

        #rpgMapScreen.active > .hero-card > .welcome-actions {
          margin-top: 0 !important;
          gap: 8px !important;
          justify-content: center !important;
        }

        #rpgMapScreen.active > .hero-card > .welcome-actions button {
          padding: 8px 12px !important;
          border-radius: 14px !important;
          font-size: 0.84rem !important;
        }
      }

      @media (min-width: 1500px) {
        #rpgMapScreen.active .rpg-real-map-scroll {
          height: clamp(340px, calc(100vh - 355px), 620px) !important;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function refreshMapFit() {
    injectRpgMapFitStyle();
    if (document.querySelector('#rpgMapScreen.active')) {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', refreshMapFit);
  } else {
    refreshMapFit();
  }

  window.addEventListener('load', function () {
    refreshMapFit();
    setTimeout(refreshMapFit, 400);
    setTimeout(refreshMapFit, 1000);
  });
})();
