// /mission-question-layout.js
// Layout fix for the REAL mission question page (not the preview page).
// Goal:
// - wider layout
// - reduce scrolling on desktop
// - left side = 16:9 image
// - right side = question + answers
// - add A / B / C / D to answers

(function () {
  function injectMissionQuestionStyle() {
    const old = document.getElementById('missionQuestionLayoutStyle');
    if (old) old.remove();

    const style = document.createElement('style');
    style.id = 'missionQuestionLayoutStyle';
    style.textContent = `
      :root {
        --mission-question-wide: min(1380px, calc(100vw - 64px));
      }

      #gameScreen.active.mission-question-mode {
        width: var(--mission-question-wide) !important;
        max-width: var(--mission-question-wide) !important;
        margin-left: auto !important;
        margin-right: auto !important;
        padding: 16px 22px !important;
        overflow: visible !important;
      }

      #gameScreen.active.mission-question-mode > p,
      #gameScreen.active.mission-question-mode .top-status,
      #gameScreen.active.mission-question-mode #sceneMeta,
      #gameScreen.active.mission-question-mode #hintBox,
      #gameScreen.active.mission-question-mode #calmBox,
      #gameScreen.active.mission-question-mode #reviewBoxInline {
        display: none !important;
      }

      #gameScreen.active.mission-question-mode > .tag {
        margin-bottom: 6px !important;
      }

      #gameScreen.active.mission-question-mode > h2 {
        margin: 0 0 8px 0 !important;
        font-size: 1.85rem !important;
        line-height: 1.1 !important;
      }

      #gameScreen.active.mission-question-mode > .welcome-actions {
        margin-top: 0 !important;
        margin-bottom: 10px !important;
        display: flex !important;
        flex-wrap: nowrap !important;
        gap: 8px !important;
      }

      #gameScreen.active.mission-question-mode > .welcome-actions button {
        padding: 9px 12px !important;
        border-radius: 14px !important;
        font-size: .88rem !important;
        white-space: nowrap !important;
      }

      #gameScreen.active.mission-question-mode .game-layout {
        max-width: none !important;
        width: 100% !important;
        margin-left: auto !important;
        margin-right: auto !important;
      }

      #gameScreen.active.mission-question-mode .dialogue-area.center-column {
        width: 100% !important;
        max-width: 1240px !important;
        margin-left: auto !important;
        margin-right: auto !important;
        display: grid !important;
        grid-template-columns: minmax(500px, 52%) minmax(430px, 1fr) !important;
        grid-template-areas:
          "tracker tracker"
          "left question"
          "left choices"
          "left actions" !important;
        gap: 12px 18px !important;
        align-items: start !important;
      }

      #gameScreen.active.mission-question-mode #questionTracker {
        grid-area: tracker !important;
        margin: 0 !important;
        padding: 12px 15px !important;
        border-radius: 22px !important;
      }

      #gameScreen.active.mission-question-mode #questionTracker .question-tracker-main {
        gap: 12px !important;
      }

      #gameScreen.active.mission-question-mode #questionBadgeBig {
        padding: 8px 13px !important;
        font-size: .95rem !important;
      }

      #gameScreen.active.mission-question-mode #questionTrackerTitle {
        font-size: .95rem !important;
      }

      #gameScreen.active.mission-question-mode .question-pills {
        margin-top: 8px !important;
      }

      #gameScreen.active.mission-question-mode .question-pill {
        height: 30px !important;
        min-width: 30px !important;
      }

      #gameScreen.active.mission-question-mode #asdBox {
        grid-area: left !important;
        margin: 0 !important;
        padding: 14px !important;
        border-radius: 26px !important;
        min-height: 0 !important;
        height: auto !important;
        overflow: hidden !important;
      }

      #gameScreen.active.mission-question-mode #asdBox .scene-badge,
      #gameScreen.active.mission-question-mode #asdBox h3,
      #gameScreen.active.mission-question-mode #asdBox h4,
      #gameScreen.active.mission-question-mode #asdBox p,
      #gameScreen.active.mission-question-mode #asdBox .mission-question-source-hidden {
        display: none !important;
      }

      #gameScreen.active.mission-question-mode #asdBox .game-scenario-image-wrap {
        width: 100% !important;
        aspect-ratio: 16 / 9 !important;
        height: auto !important;
        overflow: hidden !important;
        border-radius: 20px !important;
        margin: 0 !important;
      }

      #gameScreen.active.mission-question-mode #asdBox .game-scenario-image-wrap img {
        width: 100% !important;
        height: 100% !important;
        aspect-ratio: 16 / 9 !important;
        object-fit: cover !important;
        object-position: center center !important;
        display: block !important;
        border-radius: 20px !important;
      }

      #missionQuestionText {
        grid-area: question !important;
        padding: 17px 18px !important;
        border-radius: 24px !important;
        background: rgba(255,255,255,.82) !important;
        border: 1px solid rgba(255,255,255,.90) !important;
        box-shadow: 0 16px 36px rgba(29,53,87,.08), inset 0 1px 0 rgba(255,255,255,.95) !important;
      }

      #missionQuestionText .mission-question-badge {
        display: inline-block !important;
        margin-bottom: 10px !important;
        padding: 7px 12px !important;
        border-radius: 999px !important;
        background: rgba(0,122,255,.08) !important;
        color: var(--primary-dark) !important;
        font-size: .86rem !important;
        font-weight: 900 !important;
      }

      #missionQuestionText .mission-question-title {
        margin: 0 !important;
        font-size: 1.42rem !important;
        line-height: 1.35 !important;
        font-weight: 950 !important;
        color: var(--text) !important;
      }

      #missionQuestionText .mission-question-body {
        margin-top: 10px !important;
        font-size: .96rem !important;
        line-height: 1.58 !important;
        color: var(--muted) !important;
      }

      #gameScreen.active.mission-question-mode #asdChoices {
        grid-area: choices !important;
        display: grid !important;
        grid-template-columns: 1fr 1fr !important;
        gap: 10px !important;
        margin: 0 !important;
      }

      #gameScreen.active.mission-question-mode #asdChoices button {
        min-height: 68px !important;
        display: flex !important;
        align-items: flex-start !important;
        gap: 11px !important;
        text-align: left !important;
        border-radius: 18px !important;
        padding: 13px 15px !important;
        font-size: .96rem !important;
        line-height: 1.42 !important;
      }

      #gameScreen.active.mission-question-mode #asdChoices .choice-letter {
        width: 30px !important;
        height: 30px !important;
        min-width: 30px !important;
        border-radius: 50% !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-weight: 950 !important;
        background: rgba(255,255,255,.30) !important;
        border: 1px solid rgba(255,255,255,.48) !important;
        box-shadow: inset 0 1px 0 rgba(255,255,255,.5) !important;
      }

      #gameScreen.active.mission-question-mode #asdChoices .choice-text {
        flex: 1 !important;
        display: block !important;
      }

      #gameScreen.active.mission-question-mode .action-row {
        grid-area: actions !important;
        display: grid !important;
        grid-template-columns: 1fr 1fr !important;
        gap: 10px !important;
        margin-top: 0 !important;
      }

      #gameScreen.active.mission-question-mode .action-row button {
        min-height: 48px !important;
        border-radius: 16px !important;
        padding: 11px 13px !important;
        font-size: .9rem !important;
      }

      @media (max-width: 980px) {
        :root {
          --mission-question-wide: min(100%, calc(100vw - 20px));
        }

        #gameScreen.active.mission-question-mode {
          padding: 14px !important;
        }

        #gameScreen.active.mission-question-mode > .welcome-actions {
          flex-wrap: wrap !important;
        }

        #gameScreen.active.mission-question-mode .dialogue-area.center-column {
          grid-template-columns: 1fr !important;
          grid-template-areas:
            "tracker"
            "left"
            "question"
            "choices"
            "actions" !important;
        }

        #gameScreen.active.mission-question-mode #asdChoices {
          grid-template-columns: 1fr !important;
        }

        #gameScreen.active.mission-question-mode .action-row {
          grid-template-columns: 1fr !important;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function escapeHtml(text) {
    return String(text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function getTextListFromAsdBox(asdBox) {
    if (!asdBox) return [];
    return [...asdBox.querySelectorAll('h3, h4, p')]
      .map(function (el) { return (el.textContent || '').trim(); })
      .filter(Boolean);
  }

  function ensureQuestionTextPanel() {
    const dialogueArea = document.querySelector('#gameScreen.active .dialogue-area.center-column');
    const asdBox = document.getElementById('asdBox');
    const asdChoices = document.getElementById('asdChoices');

    if (!dialogueArea || !asdBox || !asdChoices) return;

    let panel = document.getElementById('missionQuestionText');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'missionQuestionText';
      asdChoices.parentNode.insertBefore(panel, asdChoices);
    }

    const badgeText = (asdBox.querySelector('.scene-badge')?.textContent || '').trim() || '題目';
    const texts = getTextListFromAsdBox(asdBox);

    let title = texts[0] || '';
    let body = texts.length >= 2 ? texts.slice(1).join(' ') : '';

    if (!title) {
      const fallback = (asdBox.textContent || '').trim().replace(/\s+/g, ' ');
      title = fallback || '請選擇最合適的回應';
    }

    panel.innerHTML =
      '<div class="mission-question-badge">' + escapeHtml(badgeText) + '</div>' +
      '<h3 class="mission-question-title">' + escapeHtml(title) + '</h3>' +
      (body ? '<div class="mission-question-body">' + escapeHtml(body) + '</div>' : '');
  }

  function decorateAnswersABCD() {
    const choices = document.querySelectorAll('#gameScreen.active.mission-question-mode #asdChoices button');
    const letters = ['A', 'B', 'C', 'D'];

    choices.forEach(function (btn, index) {
      const baseText = btn.dataset.baseText || btn.textContent.trim();
      btn.dataset.baseText = baseText;

      btn.innerHTML =
        '<span class="choice-letter">' + (letters[index] || '') + '</span>' +
        '<span class="choice-text">' + escapeHtml(baseText) + '</span>';
    });
  }

  function isMissionQuestionMode() {
    const screen = document.getElementById('gameScreen');
    if (!screen || !screen.classList.contains('active')) return false;
    if (screen.classList.contains('mission-intro-mode')) return false;

    const asdChoices = document.getElementById('asdChoices');
    if (!asdChoices) return false;

    const buttons = asdChoices.querySelectorAll('button');
    if (!buttons.length) return false;

    const hasStartButton = !!document.getElementById('startQuestionAfterBackgroundBtn') ||
      !!asdChoices.querySelector('.mission-start-challenge-btn');

    return !hasStartButton;
  }

  function updateMissionQuestionMode() {
    const screen = document.getElementById('gameScreen');
    if (!screen) return;

    const active = isMissionQuestionMode();
    screen.classList.toggle('mission-question-mode', active);

    const panel = document.getElementById('missionQuestionText');
    if (!active && panel) panel.remove();

    if (active) {
      ensureQuestionTextPanel();
      decorateAnswersABCD();
    }
  }

  function observeGameScreen() {
    const screen = document.getElementById('gameScreen');
    if (!screen || screen.dataset.missionQuestionObserved) return;
    screen.dataset.missionQuestionObserved = '1';

    const observer = new MutationObserver(function () {
      setTimeout(updateMissionQuestionMode, 0);
      setTimeout(updateMissionQuestionMode, 120);
      setTimeout(updateMissionQuestionMode, 260);
    });

    observer.observe(screen, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });
  }

  function run() {
    injectMissionQuestionStyle();
    observeGameScreen();
    updateMissionQuestionMode();
  }

  document.addEventListener('click', function () {
    setTimeout(updateMissionQuestionMode, 60);
    setTimeout(updateMissionQuestionMode, 180);
    setTimeout(updateMissionQuestionMode, 360);
  }, true);

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
