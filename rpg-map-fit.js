// /rpg-map-fit.js
// Light RPG layout for「RPG 校園任務地圖」.
// Inspired by classic RPG map screens: left info panel + right large map + bottom buttons.
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
          width: min(98vw, 1640px) !important;
          max-width: 1640px !important;
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
          min-height: calc(100vh - 28px) !important;
          padding: 12px !important;
          border-radius: 24px !important;
          display: grid !important;
          grid-template-rows: minmax(0, 1fr) auto !important;
          gap: 8px !important;
          background:
            radial-gradient(circle at 16% 12%, rgba(255,255,255,.78), transparent 24%),
            radial-gradient(circle at 82% 18%, rgba(100,210,255,.18), transparent 28%),
            linear-gradient(145deg, rgba(245,251,255,.92), rgba(224,243,255,.72)) !important;
        }

        #rpgMapScreen.active .rpg-map-header {
          position: absolute !important;
          left: 30px !important;
          top: 28px !important;
          z-index: 12 !important;
          width: 270px !important;
          margin: 0 !important;
          text-align: left !important;
          display: grid !important;
          gap: 8px !important;
          place-items: stretch !important;
          padding: 14px 16px !important;
          border-radius: 20px !important;
          background: linear-gradient(180deg, rgba(255,255,255,.94), rgba(237,248,255,.82)) !important;
          border: 1px solid rgba(255,255,255,.88) !important;
          box-shadow: 0 18px 42px rgba(29,53,87,.14), inset 0 1px 0 rgba(255,255,255,.98) !important;
        }

        #rpgMapScreen.active .rpg-map-header .tag {
          width: fit-content !important;
          padding: 6px 12px !important;
          font-size: .75rem !important;
          background: rgba(0,122,255,.10) !important;
        }

        #rpgMapScreen.active .rpg-map-header .hero-avatar {
          display: none !important;
        }

        #rpgMapScreen.active .rpg-map-header h2 {
          margin: 0 !important;
          font-size: 1.28rem !important;
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
          min-height: 0 !important;
          height: 100% !important;
          padding: 12px !important;
          border-radius: 24px !important;
          display: grid !important;
          grid-template-columns: 300px minmax(0, 1fr) !important;
          grid-template-rows: auto auto minmax(0, 1fr) !important;
          gap: 10px 14px !important;
          overflow: hidden !important;
          background:
            linear-gradient(135deg, rgba(255,255,255,.72), rgba(236,248,255,.56)),
            radial-gradient(circle at 68% 50%, rgba(0,122,255,.10), transparent 38%) !important;
        }

        #rpgMapScreen.active .rpg-map-title-row {
          grid-column: 1 !important;
          grid-row: 2 !important;
          margin: 130px 0 0 !important;
          padding: 12px !important;
          display: grid !important;
          gap: 8px !important;
          border-radius: 18px !important;
          background: rgba(255,255,255,.68) !important;
          border: 1px solid rgba(255,255,255,.82) !important;
          box-shadow: inset 0 1px 0 rgba(255,255,255,.9) !important;
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
          grid-row: 3 !important;
          align-self: start !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 10px 12px !important;
          border-radius: 16px !important;
          font-size: .82rem !important;
          line-height: 1.35 !important;
          white-space: normal !important;
        }

        #rpgMapScreen.active #rpgProgressPanel {
          grid-column: 1 !important;
          grid-row: 3 !important;
          align-self: end !important;
          margin: 0 !important;
          padding: 12px !important;
          border-radius: 20px !important;
          max-height: 300px !important;
          overflow: hidden !important;
          background: linear-gradient(180deg, rgba(255,255,255,.88), rgba(239,249,255,.74)) !important;
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
          height: calc(100vh - 92px) !important;
          min-height: 520px !important;
          max-height: 820px !important;
          overflow: hidden !important;
          border-radius: 22px !important;
          background:
            radial-gradient(circle at 50% 50%, rgba(255,255,255,.86), rgba(229,245,255,.76)),
            linear-gradient(135deg, rgba(255,255,255,.82), rgba(219,239,255,.68)) !important;
          border: 1px solid rgba(255,255,255,.86) !important;
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
          width: 42px !important;
          height: 42px !important;
          border-radius: 14px !important;
          border-width: 3px !important;
          box-shadow:
            0 8px 18px rgba(0,87,217,.26),
            0 0 0 4px rgba(255,176,0,.22),
            0 0 0 8px rgba(0,122,255,.12) !important;
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
          font-size: .48rem !important;
          padding: 1px 4px !important;
        }

        #rpgMapScreen.active .rpg-marker-mini-stars {
          font-size: .48rem !important;
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
          font-size: .9rem !important;
          margin-bottom: 3px !important;
        }

        #rpgMapScreen.active .rpg-preview-content p {
          font-size: .78rem !important;
          line-height: 1.35 !important;
        }

        #rpgMapScreen.active .rpg-preview-actions {
          margin-top: 8px !important;
        }

        #rpgMapScreen.active .rpg-preview-actions button {
          padding: 7px 10px !important;
          font-size: .78rem !important;
          border-radius: 12px !important;
        }

        #rpgMapScreen.active > .hero-card > .welcome-actions {
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
        #rpgMapScreen.active .rpg-map-board {
          grid-template-columns: 330px minmax(0, 1fr) !important;
        }

        #rpgMapScreen.active .rpg-map-header {
          width: 300px !important;
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
