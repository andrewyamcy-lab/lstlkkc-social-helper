// /rpg-preview-bigger.js
// Make the RPG map mission information box larger.
// Updated: mission preview image keeps its original ratio instead of being cropped.
// Updated: RPG mission markers are larger and re-centred on the intended classrooms.
// Also fixes edge popups such as 班群訊息：沒有人回覆 and 文件袋不見了.
// Also auto-loads RPG progress system.

(function () {
  function injectBiggerPreviewStyle() {
    const old = document.getElementById('rpgPreviewBiggerStyle');
    if (old) old.remove();

    const style = document.createElement('style');
    style.id = 'rpgPreviewBiggerStyle';
    style.textContent = `
      /* Bigger RPG information popup */
      #rpgRealMapWrap .rpg-floating-preview {
        width: 640px !important;
        max-width: 640px !important;
        padding: 22px !important;
        border-radius: 34px !important;
        border-width: 4px !important;
        line-height: 1.7 !important;
        box-shadow:
          0 34px 82px rgba(29, 53, 87, 0.34),
          0 0 0 10px rgba(0,122,255,0.13),
          inset 0 1px 0 rgba(255,255,255,0.92) !important;
      }

      #rpgRealMapWrap .rpg-floating-preview::before {
        width: 34px !important;
        height: 34px !important;
        left: -21px !important;
        border-left-width: 4px !important;
        border-bottom-width: 4px !important;
      }

      #rpgRealMapWrap .rpg-floating-preview.left-side::before {
        left: auto !important;
        right: -21px !important;
        border-right-width: 4px !important;
        border-top-width: 4px !important;
      }

      #rpgRealMapWrap .rpg-preview-topline {
        gap: 14px !important;
        margin-bottom: 14px !important;
      }

      #rpgRealMapWrap .rpg-preview-tag {
        padding: 9px 15px !important;
        font-size: 1rem !important;
        border-radius: 999px !important;
      }

      #rpgRealMapWrap .rpg-preview-close {
        width: 44px !important;
        height: 44px !important;
        min-width: 44px !important;
        font-size: 1.35rem !important;
        font-weight: 950 !important;
      }

      #rpgRealMapWrap .rpg-preview-body {
        grid-template-columns: 230px 1fr !important;
        gap: 18px !important;
        align-items: start !important;
      }

      #rpgRealMapWrap .rpg-preview-image {
        width: 230px !important;
        height: auto !important;
        max-height: 180px !important;
        aspect-ratio: auto !important;
        object-fit: contain !important;
        display: block !important;
        border-radius: 24px !important;
        border-width: 3px !important;
      }

      #rpgRealMapWrap .rpg-preview-content h3 {
        margin: 0 0 10px !important;
        font-size: 1.48rem !important;
        line-height: 1.28 !important;
      }

      #rpgRealMapWrap .rpg-preview-content p {
        font-size: 1.08rem !important;
        line-height: 1.72 !important;
      }

      #rpgRealMapWrap .rpg-preview-content::after {
        margin-top: 12px !important;
        padding: 8px 13px !important;
        font-size: 1rem !important;
        border-radius: 999px !important;
      }

      #rpgRealMapWrap .rpg-preview-actions {
        gap: 12px !important;
        margin-top: 18px !important;
      }

      #rpgRealMapWrap .rpg-preview-actions button {
        padding: 13px 20px !important;
        border-radius: 18px !important;
        font-size: 1.05rem !important;
        font-weight: 950 !important;
      }

      #rpgRealMapWrap .rpg-floating-preview.left-side {
        transform: translate(calc(-100% - 38px), -50%) !important;
      }

      #rpgRealMapWrap .rpg-floating-preview.bottom-side {
        transform: translate(38px, -100%) !important;
      }

      #rpgRealMapWrap .rpg-floating-preview.left-side.bottom-side {
        transform: translate(calc(-100% - 38px), -100%) !important;
      }

      #rpgRealMapWrap .rpg-floating-preview.top-side {
        transform: translate(38px, 0) !important;
      }

      #rpgRealMapWrap .rpg-floating-preview.left-side.top-side {
        transform: translate(calc(-100% - 38px), 0) !important;
      }

      #rpgRealMapWrap:has(.rpg-map-marker[data-rpg-scenario="whatsappIgnored"].is-selected) #rpgMissionPreview {
        left: 73.5% !important;
        top: 84.5% !important;
        transform: translate(calc(-100% - 44px), -100%) !important;
      }

      #rpgRealMapWrap:has(.rpg-map-marker[data-rpg-scenario="whatsappIgnored"].is-selected) #rpgMissionPreview::before {
        left: auto !important;
        right: -21px !important;
        top: calc(100% - 38px) !important;
        transform: rotate(45deg) !important;
        border-left: 0 !important;
        border-bottom: 0 !important;
        border-right: 4px solid rgba(255,176,0,0.76) !important;
        border-top: 4px solid rgba(255,176,0,0.76) !important;
      }

      #rpgRealMapWrap:has(.rpg-map-marker[data-rpg-scenario="lostItem"].is-selected) #rpgMissionPreview {
        left: 60.5% !important;
        top: 30.5% !important;
        transform: translate(calc(-100% - 44px), -18%) !important;
      }

      #rpgRealMapWrap:has(.rpg-map-marker[data-rpg-scenario="lostItem"].is-selected) #rpgMissionPreview::before {
        left: auto !important;
        right: -21px !important;
        top: 36px !important;
        transform: rotate(45deg) !important;
        border-left: 0 !important;
        border-bottom: 0 !important;
        border-right: 4px solid rgba(255,176,0,0.76) !important;
        border-top: 4px solid rgba(255,176,0,0.76) !important;
      }

      /* Bigger mission markers, applied after rpg-map-fit.js so they stay readable on the full map. */
      #rpgMapScreen.active #rpgRealMapWrap .rpg-map-marker {
        width: 54px !important;
        height: 54px !important;
        border-radius: 18px !important;
        border-width: 4px !important;
        transform: translate(-50%, -50%) !important;
        box-shadow:
          0 12px 24px rgba(0,87,217,.32),
          0 0 0 5px rgba(255,176,0,.24),
          0 0 0 10px rgba(0,122,255,.12) !important;
      }

      #rpgMapScreen.active #rpgRealMapWrap .rpg-map-marker.is-selected,
      #rpgMapScreen.active #rpgRealMapWrap .rpg-map-marker:hover,
      #rpgMapScreen.active #rpgRealMapWrap .rpg-map-marker:focus-visible {
        transform: translate(-50%, -50%) scale(1.12) !important;
      }

      #rpgMapScreen.active #rpgRealMapWrap .rpg-map-marker::before {
        inset: -9px !important;
        border-radius: 24px !important;
        border-width: 3px !important;
      }

      #rpgMapScreen.active #rpgRealMapWrap .rpg-marker-icon {
        font-size: 1.42rem !important;
        line-height: 1 !important;
      }

      #rpgMapScreen.active #rpgRealMapWrap .rpg-marker-text,
      #rpgMapScreen.active #rpgRealMapWrap .rpg-marker-mini-stars {
        font-size: .58rem !important;
        line-height: 1.15 !important;
      }

      #rpgMapScreen.active #rpgRealMapWrap .rpg-map-marker .rpg-marker-text::after {
        font-size: .66rem !important;
      }

      /* Re-centre all mission markers on their intended rooms/locations. */
      #rpgMapScreen.active #rpgRealMapWrap .rpg-map-marker[data-rpg-scenario="start"] { --x: 20.7 !important; --y: 54.5 !important; }
      #rpgMapScreen.active #rpgRealMapWrap .rpg-map-marker[data-rpg-scenario="conflict"] { --x: 23.6 !important; --y: 54.5 !important; }
      #rpgMapScreen.active #rpgRealMapWrap .rpg-map-marker[data-rpg-scenario="respond"] { --x: 26.5 !important; --y: 54.5 !important; }
      #rpgMapScreen.active #rpgRealMapWrap .rpg-map-marker[data-rpg-scenario="teacherReminder"] { --x: 20.7 !important; --y: 46.0 !important; }
      #rpgMapScreen.active #rpgRealMapWrap .rpg-map-marker[data-rpg-scenario="help"] { --x: 23.6 !important; --y: 46.0 !important; }
      #rpgMapScreen.active #rpgRealMapWrap .rpg-map-marker[data-rpg-scenario="homework"] { --x: 20.7 !important; --y: 64.1 !important; }
      #rpgMapScreen.active #rpgRealMapWrap .rpg-map-marker[data-rpg-scenario="copyHomework"] { --x: 23.6 !important; --y: 64.1 !important; }
      #rpgMapScreen.active #rpgRealMapWrap .rpg-map-marker[data-rpg-scenario="groupwork"] { --x: 20.7 !important; --y: 29.2 !important; }
      #rpgMapScreen.active #rpgRealMapWrap .rpg-map-marker[data-rpg-scenario="teasing"] { --x: 23.6 !important; --y: 29.2 !important; }
      #rpgMapScreen.active #rpgRealMapWrap .rpg-map-marker[data-rpg-scenario="disagree"] { --x: 26.5 !important; --y: 29.2 !important; }
      #rpgMapScreen.active #rpgRealMapWrap .rpg-map-marker[data-rpg-scenario="quietSpace"] { --x: 29.4 !important; --y: 29.2 !important; }
      #rpgMapScreen.active #rpgRealMapWrap .rpg-map-marker[data-rpg-scenario="academicOnly"] { --x: 29.4 !important; --y: 22.2 !important; }
      #rpgMapScreen.active #rpgRealMapWrap .rpg-map-marker[data-rpg-scenario="lunch"] { --x: 77.0 !important; --y: 54.6 !important; }
      #rpgMapScreen.active #rpgRealMapWrap .rpg-map-marker[data-rpg-scenario="queueJump"] { --x: 79.2 !important; --y: 54.6 !important; }
      #rpgMapScreen.active #rpgRealMapWrap .rpg-map-marker[data-rpg-scenario="bumped"] { --x: 45.0 !important; --y: 46.0 !important; }
      #rpgMapScreen.active #rpgRealMapWrap .rpg-map-marker[data-rpg-scenario="lostItem"] { --x: 58.0 !important; --y: 14.1 !important; }
      #rpgMapScreen.active #rpgRealMapWrap .rpg-map-marker[data-rpg-scenario="whatsappIgnored"] { --x: 73.6 !important; --y: 85.0 !important; }
      #rpgMapScreen.active #rpgRealMapWrap .rpg-map-marker[data-rpg-scenario="peGrouping"] { --x: 55.0 !important; --y: 80.3 !important; }
      #rpgMapScreen.active #rpgRealMapWrap .rpg-map-marker[data-rpg-scenario="losingGame"] { --x: 94.8 !important; --y: 57.8 !important; }
      #rpgMapScreen.active #rpgRealMapWrap .rpg-map-marker[data-rpg-scenario="refuse"] { --x: 58.8 !important; --y: 64.2 !important; }

      @media (max-width: 900px) {
        #rpgRealMapWrap .rpg-floating-preview {
          width: 560px !important;
          max-width: 560px !important;
          padding: 20px !important;
        }

        #rpgRealMapWrap .rpg-preview-body {
          grid-template-columns: 200px 1fr !important;
        }

        #rpgRealMapWrap .rpg-preview-image {
          width: 200px !important;
          height: auto !important;
          max-height: 160px !important;
          object-fit: contain !important;
        }

        #rpgRealMapWrap .rpg-preview-content h3 {
          font-size: 1.32rem !important;
        }

        #rpgRealMapWrap .rpg-preview-content p {
          font-size: 1rem !important;
        }
      }

      @media (max-width: 640px) {
        #rpgRealMapWrap .rpg-floating-preview {
          width: 480px !important;
          max-width: 480px !important;
          padding: 18px !important;
        }

        #rpgRealMapWrap .rpg-preview-body {
          grid-template-columns: 170px 1fr !important;
          gap: 14px !important;
        }

        #rpgRealMapWrap .rpg-preview-image {
          width: 170px !important;
          height: auto !important;
          max-height: 135px !important;
          object-fit: contain !important;
        }

        #rpgRealMapWrap .rpg-preview-content h3 {
          font-size: 1.18rem !important;
        }

        #rpgRealMapWrap .rpg-preview-content p {
          font-size: 0.95rem !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function loadRpgProgressSystem() {
    if (document.getElementById('rpgProgressSystemScript')) return;
    const script = document.createElement('script');
    script.id = 'rpgProgressSystemScript';
    script.src = 'rpg-progress-system.js?v=20260504-1';
    document.body.appendChild(script);
  }

  function init() {
    injectBiggerPreviewStyle();
    loadRpgProgressSystem();
    setTimeout(injectBiggerPreviewStyle, 300);
    setTimeout(injectBiggerPreviewStyle, 1000);
    setTimeout(injectBiggerPreviewStyle, 1500);
    setTimeout(injectBiggerPreviewStyle, 2500);
    setTimeout(loadRpgProgressSystem, 300);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('load', init);
})();
