// /mission-question-final-fix.js
// Final visual fix for the REAL mission answering page.
// Performance update:
// - Do NOT remove/recreate the large CSS <style> on every click.
// - Do NOT run several delayed full layout passes after every answer click.
// - Only ensure the image exists when the question page changes.

(function () {
  const IMAGE_VERSION = '2026-04-29-v4';
  let styleInjected = false;
  let observed = false;
  let scheduled = false;

  const scenarioImageMap = {
    start: 'images/start-conversation.jpg',
    refuse: 'images/polite-refusal.jpg',
    conflict: 'images/stationery-conflict.jpg',
    respond: 'images/respond-friend.jpg',
    groupwork: 'images/groupwork.jpg',
    help: 'images/ask-teacher-help.jpg',
    lunch: 'images/lunch-join.jpg',
    homework: 'images/homework-check.jpg',
    teasing: 'images/teasing.jpg',
    bumped: 'images/bumped.jpg',
    disagree: 'images/disagree.jpg',
    teacherReminder: 'images/teacher-reminder.jpg',
    queueJump: 'images/queue-jump.jpg',
    peGrouping: 'images/pe-grouping.jpg',
    whatsappIgnored: 'images/whatsapp-ignored.jpg',
    borrowedNoReturn: 'images/borrowed-no-return.jpg',
    lunchSeat: 'images/lunch-seat.jpg',
    jokeConfusion: 'images/joke-confusion.jpg',
    academicOnly: 'images/academic-only.jpg',
    lostItem: 'images/lost-item.jpg',
    groupRole: 'images/group-role.jpg',
    copyHomework: 'images/copy-homework.jpg',
    quietSpace: 'images/quiet-space.jpg',
    losingGame: 'images/losing-game.jpg'
  };

  function withVersion(src) {
    return src + '?v=' + encodeURIComponent(IMAGE_VERSION);
  }

  function injectStyleOnce() {
    if (styleInjected || document.getElementById('missionQuestionFinalFixStyle')) {
      styleInjected = true;
      return;
    }

    const style = document.createElement('style');
    style.id = 'missionQuestionFinalFixStyle';
    style.textContent = `
      @media (min-width: 981px) {
        body:has(#gameScreen.active.mission-question-mode) .container,
        body:has(#gameScreen.active.mission-question-mode) .card {
          width: min(1380px, calc(100vw - 64px)) !important;
          max-width: min(1380px, calc(100vw - 64px)) !important;
          margin-left: auto !important;
          margin-right: auto !important;
          overflow: visible !important;
        }

        #gameScreen.active.mission-question-mode {
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
          padding: 18px 30px 28px !important;
          overflow: visible !important;
        }

        #gameScreen.active.mission-question-mode .game-layout {
          width: 100% !important;
          max-width: none !important;
          margin: 0 auto !important;
          overflow: visible !important;
        }

        #gameScreen.active.mission-question-mode .dialogue-area.center-column {
          width: 100% !important;
          max-width: 1220px !important;
          margin: 0 auto !important;
          display: grid !important;
          grid-template-columns: minmax(0, 560px) minmax(0, 560px) !important;
          grid-template-areas:
            "tracker tracker"
            "image question"
            "image choices"
            "image feedback"
            "image actions" !important;
          gap: 12px 18px !important;
          justify-content: center !important;
          align-items: start !important;
          overflow: visible !important;
        }
      }

      #gameScreen.active.mission-question-mode #gameScenarioImageBox {
        grid-area: image !important;
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        width: 100% !important;
        box-sizing: border-box !important;
        margin: 0 !important;
        padding: 14px !important;
        border-radius: 26px !important;
        background: rgba(255,255,255,.80) !important;
        border: 1px solid rgba(255,255,255,.88) !important;
        box-shadow: 0 16px 36px rgba(29,53,87,.08), inset 0 1px 0 rgba(255,255,255,.95) !important;
        overflow: hidden !important;
      }

      #gameScreen.active.mission-question-mode #gameScenarioImageBox.hidden {
        display: block !important;
      }

      #gameScreen.active.mission-question-mode #gameScenarioImageBox img {
        display: block !important;
        width: 100% !important;
        height: auto !important;
        aspect-ratio: 16 / 9 !important;
        object-fit: cover !important;
        object-position: center center !important;
        border-radius: 20px !important;
        background: #eef6ff !important;
      }

      #gameScreen.active.mission-question-mode #gameScenarioImageBox .game-scenario-image-caption {
        display: none !important;
      }

      #gameScreen.active.mission-question-mode #asdBox {
        display: none !important;
      }

      #gameScreen.active.mission-question-mode #questionTracker {
        grid-area: tracker !important;
        width: 100% !important;
        box-sizing: border-box !important;
        margin: 0 !important;
      }

      #gameScreen.active.mission-question-mode #missionQuestionText {
        grid-area: question !important;
        width: 100% !important;
        box-sizing: border-box !important;
        margin: 0 !important;
      }

      #gameScreen.active.mission-question-mode #asdChoices {
        grid-area: choices !important;
        width: 100% !important;
        box-sizing: border-box !important;
        margin: 0 !important;
      }

      #gameScreen.active.mission-question-mode #hintBox:not(.hidden),
      #gameScreen.active.mission-question-mode #calmBox:not(.hidden),
      #gameScreen.active.mission-question-mode #reviewBoxInline:not(.hidden) {
        grid-area: feedback !important;
        display: block !important;
        width: 100% !important;
        box-sizing: border-box !important;
        margin: 0 !important;
        padding: 13px 15px !important;
        border-radius: 18px !important;
        background: rgba(255,255,255,.84) !important;
        border: 1px solid rgba(0,122,255,.16) !important;
        box-shadow: 0 12px 28px rgba(29,53,87,.07), inset 0 1px 0 rgba(255,255,255,.92) !important;
        color: var(--text) !important;
        font-size: .92rem !important;
        line-height: 1.5 !important;
      }

      #gameScreen.active.mission-question-mode #hintBox.hidden,
      #gameScreen.active.mission-question-mode #calmBox.hidden,
      #gameScreen.active.mission-question-mode #reviewBoxInline.hidden {
        display: none !important;
      }

      #gameScreen.active.mission-question-mode .action-row {
        grid-area: actions !important;
        width: 100% !important;
        box-sizing: border-box !important;
        display: grid !important;
        grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
        gap: 8px !important;
        margin: 0 !important;
      }

      #gameScreen.active.mission-question-mode .action-row button {
        min-height: 44px !important;
        padding: 8px 8px !important;
        border-radius: 15px !important;
        font-size: .78rem !important;
        line-height: 1.15 !important;
        white-space: normal !important;
      }

      @media (max-width: 980px) {
        #gameScreen.active.mission-question-mode .dialogue-area.center-column {
          display: grid !important;
          grid-template-columns: 1fr !important;
          grid-template-areas:
            "tracker"
            "image"
            "question"
            "choices"
            "feedback"
            "actions" !important;
        }

        #gameScreen.active.mission-question-mode .action-row {
          grid-template-columns: 1fr 1fr !important;
        }
      }
    `;

    document.head.appendChild(style);
    styleInjected = true;
  }

  function getCurrentScenarioKey() {
    const asdBox = document.getElementById('asdBox');
    const badge = (asdBox && asdBox.querySelector('.scene-badge') ? asdBox.querySelector('.scene-badge').textContent : '').trim();
    const allText = (asdBox ? asdBox.textContent : '').trim();

    try {
      if (typeof asdGames !== 'undefined' && asdGames) {
        const keys = Object.keys(asdGames);
        const exact = keys.find(function (key) {
          return asdGames[key] && asdGames[key].title && badge.includes(asdGames[key].title);
        });
        if (exact) return exact;

        const byText = keys.find(function (key) {
          return asdGames[key] && asdGames[key].title && allText.includes(asdGames[key].title);
        });
        if (byText) return byText;
      }
    } catch (error) {}

    return '';
  }

  function ensureQuestionImage() {
    const screen = document.getElementById('gameScreen');
    const dialogueArea = document.querySelector('#gameScreen.active .dialogue-area.center-column');
    const asdBox = document.getElementById('asdBox');

    if (!screen || !screen.classList.contains('mission-question-mode') || !dialogueArea || !asdBox) return;

    let box = document.getElementById('gameScenarioImageBox');
    if (!box) {
      box = document.createElement('div');
      box.id = 'gameScenarioImageBox';
      box.className = 'game-scenario-image-wrap';
      dialogueArea.insertBefore(box, asdBox);
    }

    box.classList.remove('hidden');

    let img = box.querySelector('img');
    if (img && img.getAttribute('src')) return;

    const key = getCurrentScenarioKey();
    const src = scenarioImageMap[key];
    if (!src) return;

    box.innerHTML = '<img src="' + withVersion(src) + '" alt="校園社交練習情境圖" loading="lazy">';
  }

  function scheduleEnsureImage() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(function () {
      scheduled = false;
      ensureQuestionImage();
    });
  }

  function observeGameScreen() {
    const screen = document.getElementById('gameScreen');
    if (!screen || observed) return;
    observed = true;

    const observer = new MutationObserver(function (mutations) {
      const shouldCheck = mutations.some(function (mutation) {
        return mutation.type === 'childList' || mutation.attributeName === 'class';
      });
      if (shouldCheck) scheduleEnsureImage();
    });

    observer.observe(screen, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });
  }

  function run() {
    injectStyleOnce();
    observeGameScreen();
    ensureQuestionImage();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }

  window.addEventListener('load', function () {
    run();
    setTimeout(ensureQuestionImage, 500);
  });
})();
