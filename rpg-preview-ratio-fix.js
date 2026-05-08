// /rpg-preview-ratio-fix.js
// Final override: keep the RPG mission preview image in its original image ratio.
// This file is loaded after rpg-map-fit.js, because rpg-map-fit.js previously forced fixed height + object-fit: cover.

(function () {
  function injectPreviewRatioFix() {
    const old = document.getElementById('rpgPreviewRatioFixStyle');
    if (old) old.remove();

    const style = document.createElement('style');
    style.id = 'rpgPreviewRatioFixStyle';
    style.textContent = `
      /* Desktop RPG popup: show image in original ratio, not cropped */
      html body #rpgMapScreen.active #rpgRealMapWrap #rpgMissionPreview.rpg-floating-preview {
        width: 700px !important;
        max-width: 700px !important;
      }

      html body #rpgMapScreen.active #rpgRealMapWrap #rpgMissionPreview.rpg-floating-preview .rpg-preview-body {
        grid-template-columns: 280px 1fr !important;
        align-items: center !important;
        gap: 20px !important;
      }

      html body #rpgMapScreen.active #rpgRealMapWrap #rpgMissionPreview.rpg-floating-preview img.rpg-preview-image {
        width: 280px !important;
        height: auto !important;
        min-height: 0 !important;
        max-height: none !important;
        aspect-ratio: auto !important;
        object-fit: contain !important;
        object-position: center center !important;
        display: block !important;
        border-radius: 20px !important;
      }

      @media (max-width: 900px) {
        html body #rpgMapScreen.active #rpgRealMapWrap #rpgMissionPreview.rpg-floating-preview {
          width: 600px !important;
          max-width: 600px !important;
        }

        html body #rpgMapScreen.active #rpgRealMapWrap #rpgMissionPreview.rpg-floating-preview .rpg-preview-body {
          grid-template-columns: 230px 1fr !important;
        }

        html body #rpgMapScreen.active #rpgRealMapWrap #rpgMissionPreview.rpg-floating-preview img.rpg-preview-image {
          width: 230px !important;
          height: auto !important;
          max-height: none !important;
          object-fit: contain !important;
        }
      }

      @media (max-width: 640px) {
        html body #rpgMapScreen.active #rpgRealMapWrap #rpgMissionPreview.rpg-floating-preview {
          width: 500px !important;
          max-width: 500px !important;
        }

        html body #rpgMapScreen.active #rpgRealMapWrap #rpgMissionPreview.rpg-floating-preview .rpg-preview-body {
          grid-template-columns: 190px 1fr !important;
        }

        html body #rpgMapScreen.active #rpgRealMapWrap #rpgMissionPreview.rpg-floating-preview img.rpg-preview-image {
          width: 190px !important;
          height: auto !important;
          max-height: none !important;
          object-fit: contain !important;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function forceCurrentPreviewImage() {
    const img = document.querySelector('#rpgMapScreen.active #rpgMissionPreview img.rpg-preview-image');
    if (!img) return;

    img.style.setProperty('width', '280px', 'important');
    img.style.setProperty('height', 'auto', 'important');
    img.style.setProperty('min-height', '0', 'important');
    img.style.setProperty('max-height', 'none', 'important');
    img.style.setProperty('aspect-ratio', 'auto', 'important');
    img.style.setProperty('object-fit', 'contain', 'important');
    img.style.setProperty('object-position', 'center center', 'important');
  }

  function runFix() {
    injectPreviewRatioFix();
    forceCurrentPreviewImage();
  }

  document.addEventListener('click', function () {
    setTimeout(runFix, 0);
    setTimeout(runFix, 80);
    setTimeout(runFix, 250);
  }, true);

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
