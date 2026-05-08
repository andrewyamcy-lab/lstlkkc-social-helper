// /mission-page-compact-layout.js
// Redesign only the「任務進行頁」mission preview / background page.
// Required layout:
// - Left side: mission photo
// - Right side: 情境、地點、目標、小提醒、開始任務 button
// - Other navigation buttons stay at the bottom in one line
// - Avoid long scrolling before the student starts answering

(function () {
  function injectMissionPageIntroStyle() {
    const old = document.getElementById('missionPageCompactLayoutStyle');
    if (old) old.remove();

    const style = document.createElement('style');
    style.id = 'missionPageCompactLayoutStyle';
    style.textContent = `
      /* Only apply this redesign when the page is showing the background / mission preview. */
      #gameScreen.active.mission-intro-mode {
        padding: 18px !important;
      }

      #gameScreen.active.mission-intro-mode > .tag,
      #gameScreen.active.mission-intro-mode > h2,
      #gameScreen.active.mission-intro-mode > p,
      #gameScreen.active.mission-intro-mode .top-status,
      #gameScreen.active.mission-intro-mode #questionTracker,
      #gameScreen.active.mission-intro-mode #hintBox,
      #gameScreen.active.mission-intro-mode #calmBox,
      #gameScreen.active.mission-intro-mode #reviewBoxInline {
        display: none !important;
      }

      #gameScreen.active.mission-intro-mode .game-layout {
        max-width: 1080px !important;
        margin: 0 auto !important;
      }

      #gameScreen.active.mission-intro-mode .dialogue-area.center-column {
        max-width: none !important;
        display: grid !important;
        grid-template-columns: minmax(360px, 48%) minmax(360px, 1fr) !important;
        grid-template-areas:
          "photo info"
          "photo start" !important;
        gap: 18px !important;
        align-items: stretch !important;
      }

      /* Left side: photo only */
      #gameScreen.active.mission-intro-mode #asdBox {
        grid-area: photo !important;
        margin: 0 !important;
        padding: 14px !important;
        border-radius: 26px !important;
        min-height: 430px !important;
        height: min(56vh, 520px) !important;
        overflow: hidden !important;
        display: flex !important;
        align-items: stretch !important;
        justify-content: center !important;
      }

      #gameScreen.active.mission-intro-mode #asdBox .scene-badge,
      #gameScreen.active.mission-intro-mode #asdBox h3,
      #gameScreen.active.mission-intro-mode #asdBox p {
        display: none !important;
      }

      #gameScreen.active.mission-intro-mode #asdBox .game-scenario-image-wrap {
        display: block !important;
        width: 100% !important;
        height: 100% !important;
        margin: 0 !important;
      }

      #gameScreen.active.mission-intro-mode #asdBox .game-scenario-image-wrap img {
        width: 100% !important;
        height: 100% !important;
        max-height: none !important;
        object-fit: cover !important;
        object-position: center center !important;
        border-radius: 20px !important;
        display: block !important;
      }

      /* Right side: all mission information */
      #gameScreen.active.mission-intro-mode #sceneMeta {
        grid-area: info !important;
        display: grid !important;
        gap: 12px !important;
        margin: 0 !important;
        padding: 20px !important;
        border-radius: 26px !important;
        background: rgba(255,255,255,.72) !important;
        border: 1px solid rgba(255,255,255,.84) !important;
        box-shadow: 0 18px 42px rgba(29,53,87,.10), inset 0 1px 0 rgba(255,255,255,.95) !important;
        align-self: stretch !important;
      }

      #gameScreen.active.mission-intro-mode #sceneMeta .mission-intro-title-card,
      #gameScreen.active.mission-intro-mode #sceneMeta .meta-box {
        padding: 14px 16px !important;
        border-radius: 18px !important;
        background: rgba(255,255,255,.78) !important;
        border: 1px solid rgba(0,122,255,.10) !important;
        box-shadow: inset 0 1px 0 rgba(255,255,255,.92) !important;
        color: var(--text) !important;
        font-size: .98rem !important;
        line-height: 1.55 !important;
      }

      #gameScreen.active.mission-intro-mode #sceneMeta .mission-intro-title-card strong,
      #gameScreen.active.mission-intro-mode #sceneMeta .meta-box strong {
        display: inline-block !important;
        margin-bottom: 4px !important;
        color: var(--primary-dark) !important;
        font-size: .92rem !important;
        font-weight: 950 !important;
      }

      #gameScreen.active.mission-intro-mode #sceneMeta .mission-intro-title-card {
        background: linear-gradient(180deg, rgba(0,122,255,.12), rgba(255,255,255,.78)) !important;
      }

      #gameScreen.active.mission-intro-mode #sceneMeta .mission-intro-title-card .mission-intro-title-text {
        display: block !important;
        font-size: 1.35rem !important;
        line-height: 1.25 !important;
        font-weight: 950 !important;
        color: var(--text) !important;
      }

      /* Start button below the right information panel */
      #gameScreen.active.mission-intro-mode #asdChoices {
        grid-area: start !important;
        display: flex !important;
        align-items: stretch !important;
        justify-content: stretch !important;
        margin: 0 !important;
      }

      #gameScreen.active.mission-intro-mode #asdChoices .mission-start-challenge-btn {
        width: 100% !important;
        min-height: 72px !important;
        margin: 0 !important;
        border-radius: 22px !important;
        font-size: 1.18rem !important;
      }

      /* Other buttons at the bottom in one line */
      #gameScreen.active.mission-intro-mode > .welcome-actions {
        max-width: 1080px !important;
        margin: 16px auto 0 !important;
        padding: 10px !important;
        display: flex !important;
        flex-wrap: nowrap !important;
        gap: 10px !important;
        justify-content: center !important;
        align-items: center !important;
        border-radius: 22px !important;
        background: rgba(255,255,255,.66) !important;
        border: 1px solid rgba(255,255,255,.82) !important;
        box-shadow: 0 12px 28px rgba(29,53,87,.08), inset 0 1px 0 rgba(255,255,255,.92) !important;
      }

      #gameScreen.active.mission-intro-mode > .welcome-actions button {
        flex: 1 1 0 !important;
        max-width: 190px !important;
        padding: 11px 12px !important;
        border-radius: 16px !important;
        font-size: .92rem !important;
        white-space: nowrap !important;
      }

      @media (max-width: 980px) {
        #gameScreen.active.mission-intro-mode .dialogue-area.center-column {
          grid-template-columns: 1fr !important;
          grid-template-areas:
            "photo"
            "info"
            "start" !important;
        }

        #gameScreen.active.mission-intro-mode #asdBox {
          min-height: 260px !important;
          height: auto !important;
          max-height: none !important;
        }

        #gameScreen.active.mission-intro-mode #asdBox .game-scenario-image-wrap img {
          height: auto !important;
          object-fit: contain !important;
        }

        #gameScreen.active.mission-intro-mode > .welcome-actions {
          flex-wrap: wrap !important;
        }

        #gameScreen.active.mission-intro-mode > .welcome-actions button {
          max-width: none !important;
          flex: 1 1 160px !important;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function getMissionTitleFromBox() {
    const badge = document.querySelector('#gameScreen.active #asdBox .scene-badge');
    return badge ? badge.textContent.trim() : '';
  }

  function ensureIntroTitleCard() {
    const screen = document.getElementById('gameScreen');
    const sceneMeta = document.getElementById('sceneMeta');
    if (!screen || !screen.classList.contains('mission-intro-mode') || !sceneMeta) return;

    let titleCard = sceneMeta.querySelector('.mission-intro-title-card');
    const title = getMissionTitleFromBox() || '任務情境';

    if (!titleCard) {
      titleCard = document.createElement('div');
      titleCard.className = 'mission-intro-title-card';
      sceneMeta.insertBefore(titleCard, sceneMeta.firstChild);
    }

    titleCard.innerHTML = '<strong>情境：</strong><span class="mission-intro-title-text"></span>';
    const text = titleCard.querySelector('.mission-intro-title-text');
    if (text) text.textContent = title;
  }

  function updateMissionIntroMode() {
    const screen = document.getElementById('gameScreen');
    if (!screen) return;

    const isIntro = !!document.getElementById('startQuestionAfterBackgroundBtn') &&
      !!document.querySelector('#sceneMeta:not(.hidden)');

    screen.classList.toggle('mission-intro-mode', isIntro);
    if (isIntro) ensureIntroTitleCard();
  }

  function observeGameScreen() {
    const screen = document.getElementById('gameScreen');
    if (!screen || screen.dataset.missionIntroObserved) return;
    screen.dataset.missionIntroObserved = '1';

    const observer = new MutationObserver(function () {
      setTimeout(updateMissionIntroMode, 0);
      setTimeout(updateMissionIntroMode, 120);
    });

    observer.observe(screen, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  }

  function run() {
    injectMissionPageIntroStyle();
    observeGameScreen();
    updateMissionIntroMode();
  }

  document.addEventListener('click', function () {
    setTimeout(updateMissionIntroMode, 80);
    setTimeout(updateMissionIntroMode, 250);
  }, true);

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
