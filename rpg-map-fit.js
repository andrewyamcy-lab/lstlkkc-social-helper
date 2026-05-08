// /rpg-map-fit.js
// Light RPG map layout for「RPG 校園任務地圖」.
// Structure: connected left info panel + large right map + compact bottom actions.
// This affects only #rpgMapScreen.

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
          overflow: hidden !important;
        }

        body:has(#rpgMapScreen.active) .container {
          width: min(98vw, 1660px) !important;
          max-width: 1660px !important;
          margin: 8px auto !important;
          padding: 0 8px !important;
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
          height: calc(100vh - 28px) !important;
          min-height: 680px !important;
          padding: 14px !important;
          border-radius: 24px !important;
          display: grid !important;
          grid-template-columns: 330px minmax(0, 1fr) !important;
          grid-template-rows: minmax(0, 1fr) auto !important;
          gap: 12px !important;
          overflow: hidden !important;
          background:
            radial-gradient(circle at 14% 12%, rgba(255,255,255,.86), transparent 24%),
            radial-gradient(circle at 82% 20%, rgba(100,210,255,.20), transparent 28%),
            linear-gradient(145deg, rgba(245,251,255,.94), rgba(224,243,255,.74)) !important;
        }

        #rpgMapScreen.active .rpg-map-header {
          grid-column: 1 !important;
          grid-row: 1 !important;
          align-self: start !important;
          position: relative !important;
          left: auto !important;
          top: auto !important;
          z-index: 10 !important;
          width: auto !important;
          margin: 0 !important;
          padding: 16px 16px 14px !important;
          text-align: left !important;
          display: grid !important;
          gap: 9px !important;
          place-items: stretch !important;
          border-radius: 22px 22px 12px 12px !important;
          background: linear-gradient(180deg, rgba(255,255,255,.96), rgba(239,249,255,.86)) !important;
          border: 1px solid rgba(255,255,255,.90) !important;
          box-shadow: 0 12px 28px rgba(29,53,87,.11), inset 0 1px 0 rgba(255,255,255,.98) !important;
        }

        #rpgMapScreen.active .rpg-map-header .tag {
          width: fit-content !important;
          padding: 6px 12px !important;
          font-size: .74rem !important;
          background: rgba(0,122,255,.10) !important;
        }

        #rpgMapScreen.active .rpg-map-header .hero-avatar {
          display: none !important;
        }

        #rpgMapScreen.active .rpg-map-header h2 {
          margin: 0 !important;
          font-size: 1.3rem !important;
          line-height: 1.18 !important;
          color: var(--text) !important;
        }

        #rpgMapScreen.active .rpg-map-header p {
          margin: 0 !important;
          font-size: .82rem !important;
          line-height: 1.45 !important;
          color: var(--muted) !important;
        }

        #rpgMapScreen.active .rpg-map-board {
          grid-column: 1 / 3 !important;
          grid-row: 1 !important;
          min-height: 0 !important;
          height: 100% !important;
          padding: 12px !important;
          border-radius: 24px !important;
          display: grid !important;
          grid-template-columns: 330px minmax(0, 1fr) !important;
          grid-template-rows: auto auto minmax(0, 1fr) !important;
          gap: 10px 14px !important;
          overflow: hidden !important;
          background:
            linear-gradient(135deg, rgba(255,255,255,.72), rgba(236,248,255,.58)),
            radial-gradient(circle at 68% 50%, rgba(0,122,255,.10), transparent 38%) !important;
          border: 1px solid rgba(255,255,255,.82) !important;
          box-shadow: inset 0 1px 0 rgba(255,255,255,.92) !important;
        }

        #rpgMapScreen.active .rpg-map-title-row {
          grid-column: 1 !important;
          grid-row: 1 !important;
          margin: 154px 0 0 !important;
          padding: 13px !important;
          display: grid !important;
          gap: 8px !important;
          border-radius: 12px 12px 18px 18px !important;
          background: rgba(255,255,255,.66) !important;
          border: 1px solid rgba(255,255,255,.82) !important;
          box-shadow: inset 0 1px 0 rgba(255,255,255,.90) !important;
        }

        #rpgMapScreen.active .rpg-map-title-row strong {
          display: block !important;
          font-size: 1rem !important;
          color: var(--text) !important;
        }

        #rpgMapScreen.active .rpg-mini-map-note {
          margin-top: 4px !important;
          font-size: .78rem !important;
          line-height: 1.45 !important;
          color: var(--muted) !important;
        }

        #rpgMapScreen.active .rpg-map-title-row button {
          justify-self: start !important;
          padding: 8px 11px !important;
          border-radius: 13px !important;
          font-size: .82rem !important;
        }

        #rpgMapScreen.active .rpg-map-instruction {
          grid-column: 1 !important;
          grid-row: 2 !important;
          align-self: start !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 10px 12px !important;
          border-radius: 16px !important;
          font-size: .82rem !important;
          line-height: 1.35 !important;
          white-space: normal !important;
          background: linear-gradient(180deg, rgba(255,243,211,.94), rgba(255,255,255,.78)) !important;
          border: 1px solid rgba(255,176,0,.30) !important;
        }

        #rpgMapScreen.active #rpgProgressPanel {
          grid-column: 1 !important;
          grid-row: 3 !important;
          align-self: end !important;
          margin: 0 !important;
          padding: 12px !important;
          border-radius: 20px !important;
          max-height: 280px !important;
          overflow: hidden !important;
          background: linear-gradient(180deg, rgba(255,255,255,.90), rgba(239,249,255,.78)) !important;
          border: 1px solid rgba(255,255,255,.86) !important;
        }

        #rpgMapScreen.active #rpgProgressPanel .rpg-progress-head {
          display: grid !important;
          grid-template-columns: 1fr auto !important;
          align-items: start !important;
          gap: 8px !important;
          margin-bottom: 8px !important;
        }

        #rpgMapScreen.active #rpgProgressPanel .rpg-progress-head strong {
          font-size: .92rem !important;
          line-height: 1.3 !important;
        }

        #rpgMapScreen.active #rpgProgressPanel .rpg-progress-head p {
          display: none !important;
        }

        #rpgMapScreen.active #rpgProgressPanel .rpg-progress-percent {
          min-width: 48px !important;
          height: 34px !important;
          border-radius: 13px !important;
          font-size: .88rem !important;
        }

        #rpgMapScreen.active #rpgProgressPanel .rpg-map-level-mini {
          gap: 5px !important;
          margin-bottom: 7px !important;
          font-size: .78rem !important;
        }

        #rpgMapScreen.active #rpgProgressPanel .rpg-progress-bar-wrap {
          height: 12px !important;
        }

        #rpgMapScreen.active #rpgProgressPanel > .rpg-progress-bar-wrap[aria-label="任務完成進度"] {
          display: none !important;
        }

        #rpgMapScreen.active #rpgProgressPanel .rpg-progress-stats {
          display: grid !important;
          grid-template-columns: 1fr 1fr !important;
          gap: 6px !important;
          margin-top: 8px !important;
        }

        #rpgMapScreen.active #rpgProgressPanel .rpg-progress-stats span {
          padding: 7px 8px !important;
          border-radius: 13px !important;
          font-size: .74rem !important;
          line-height: 1.3 !important;
        }

        #rpgMapScreen.active #rpgProgressPanel .rpg-progress-actions {
          display: none !important;
        }

        #rpgMapScreen.active .rpg-real-map-scroll {
          grid-column: 2 !important;
          grid-row: 1 / 4 !important;
          height: 100% !important;
          min-height: 0 !important;
          overflow: hidden !important;
          border-radius: 22px !important;
          background:
            radial-gradient(circle at 50% 50%, rgba(255,255,255,.92), rgba(229,245,255,.78)),
            linear-gradient(135deg, rgba(255,255,255,.84), rgba(219,239,255,.70)) !important;
          border: 1px solid rgba(255,255,255,.88) !important;
          box-shadow: 0 14px 32px rgba(29,53,87,.10), inset 0 1px 0 rgba(255,255,255,.94) !important;
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
          border-radius: 20px !important;
          filter: saturate(1.03) contrast(1.02) brightness(1.02) !important;
        }

        #rpgMapScreen.active .rpg-map-marker {
          width: 40px !important;
          height: 40px !important;
          border-radius: 14px !important;
          border-width: 3px !important;
          box-shadow:
            0 8px 18px rgba(0,87,217,.25),
            0 0 0 4px rgba(255,176,0,.20),
            0 0 0 8px rgba(0,122,255,.10) !important;
        }

        #rpgMapScreen.active .rpg-map-marker::before {
          inset: -8px !important;
          border-radius: 18px !important;
          border-width: 2px !important;
        }

        #rpgMapScreen.active .rpg-marker-icon {
          font-size: 1.02rem !important;
        }

        #rpgMapScreen.active .rpg-marker-text,
        #rpgMapScreen.active .rpg-marker-mini-stars {
          font-size: .47rem !important;
        }

        #rpgMapScreen.active .rpg-floating-preview {
          width: 235px !important;
          max-width: 235px !important;
          padding: 9px !important;
          border-radius: 17px !important;
        }

        #rpgMapScreen.active .rpg-preview-body {
          grid-template-columns: 62px 1fr !important;
          gap: 8px !important;
        }

        #rpgMapScreen.active .rpg-preview-image {
          width: 62px !important;
          border-radius: 13px !important;
        }

        #rpgMapScreen.active .rpg-preview-content h3 {
          font-size: .86rem !important;
          margin-bottom: 3px !important;
        }

        #rpgMapScreen.active .rpg-preview-content p {
          font-size: .74rem !important;
          line-height: 1.32 !important;
        }

        #rpgMapScreen.active .rpg-preview-actions {
          margin-top: 7px !important;
        }

        #rpgMapScreen.active .rpg-preview-actions button {
          padding: 7px 9px !important;
          font-size: .76rem !important;
          border-radius: 12px !important;
        }

        #rpgMapScreen.active > .hero-card > .welcome-actions {
          grid-column: 1 / 3 !important;
          grid-row: 2 !important;
          margin-top: 0 !important;
          gap: 8px !important;
          justify-content: flex-end !important;
          align-items: center !important;
        }

        #rpgMapScreen.active > .hero-card > .welcome-actions button {
          padding: 8px 12px !important;
          border-radius: 14px !important;
          font-size: .84rem !important;
        }
      }

      @media (min-width: 1500px) {
        #rpgMapScreen.active .rpg-map-shell,
        #rpgMapScreen.active .rpg-map-board {
          grid-template-columns: 350px minmax(0, 1fr) !important;
        }

        #rpgMapScreen.active .rpg-map-header {
          width: auto !important;
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
