// /rpg-preview-bigger.js
// Make the RPG map mission information box about 2x larger.
// Also fixes edge popups such as 班群訊息：沒有人回覆 and 文件袋不見了.

(function () {
  function injectBiggerPreviewStyle() {
    const old = document.getElementById('rpgPreviewBiggerStyle');
    if (old) old.remove();

    const style = document.createElement('style');
    style.id = 'rpgPreviewBiggerStyle';
    style.textContent = `
      /* Bigger RPG information popup */
      #rpgRealMapWrap .rpg-floating-preview {
        width: 560px !important;
        max-width: 560px !important;
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
        grid-template-columns: 170px 1fr !important;
        gap: 18px !important;
        align-items: start !important;
      }

      #rpgRealMapWrap .rpg-preview-image {
        width: 170px !important;
        height: 140px !important;
        aspect-ratio: auto !important;
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

      /* Keep popup inside the visible map better on the far right / bottom. */
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

      /* Special fix: 📱 班群訊息：沒有人回覆 is moved to 新街校門 near the bottom-right edge. */
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

      /* Special fix: 🗂️ 文件袋不見了 is also close to the right edge after CSS repositioning.
         Open the big card to the left side, aligned around the marker, so it is not cut off. */
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

      @media (max-width: 900px) {
        #rpgRealMapWrap .rpg-floating-preview {
          width: 500px !important;
          max-width: 500px !important;
          padding: 20px !important;
        }

        #rpgRealMapWrap .rpg-preview-body {
          grid-template-columns: 150px 1fr !important;
        }

        #rpgRealMapWrap .rpg-preview-image {
          width: 150px !important;
          height: 124px !important;
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
          width: 430px !important;
          max-width: 430px !important;
          padding: 18px !important;
        }

        #rpgRealMapWrap .rpg-preview-body {
          grid-template-columns: 128px 1fr !important;
          gap: 14px !important;
        }

        #rpgRealMapWrap .rpg-preview-image {
          width: 128px !important;
          height: 108px !important;
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

  function init() {
    injectBiggerPreviewStyle();
    setTimeout(injectBiggerPreviewStyle, 300);
    setTimeout(injectBiggerPreviewStyle, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('load', init);
})();
