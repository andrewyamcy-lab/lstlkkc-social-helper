// /mission-question-layout.js
// Layout fix for the REAL mission question page (not the preview page).
// Updated: removed A/B/C/D labels because they caused lag.
// This file now only handles layout and the copied question panel.

(function () {
  let styleInjected = false;
  let observed = false;
  let scheduled = false;

  function injectMissionQuestionStyle() {
    if (styleInjected || document.getElementById('missionQuestionLayoutStyle')) {
      styleInjected = true;
      return;
    }

    const style = document.createElement('style');
    style.id = 'missionQuestionLayoutStyle';
    style.textContent = `
      :root {
        --mission-question-wide: min(1380px, calc(100vw - 64px));
      }

      @media (min-width: 981px) {
        body:has(#gameScreen.active.mission-question-mode) .container,
        body:has(#gameScreen.active.mission-question-mode) .card {
          width: var(--mission-question-wide) !important;
          max-width: var(--mission-question-wide) !important;
          margin-left: auto !important;
          margin-right: auto !important;
          overflow: visible !important;
        }
      }

      #gameScreen.active.mission-question-mode {
        width: 100% !important;
        max-width: 100% !important;
        box-sizing: border-box !important;
        margin-left: auto !important;
        margin-right: auto !important;
        padding: 18px 26px !important;
        overflow: visible !important;
      }

      #gameScreen.active.mission-question-mode > p,
      #gameScreen.active.mission-question-mode .top-status,
      #gameScreen.active.mission-question-mode #sceneMeta,
      #gameScreen.active.mission-question-mode #hintBox.hidden,
      #gameScreen.active.mission-question-mode #calmBox.hidden,
      #gameScreen.active.mission-question-mode #reviewBoxInline.hidden {
        display: none !important;
      }

      #gameScreen.active.mission-question-mode > .tag {
        margin-bottom: 5px !important;
      }

      #gameScreen.active.mission-question-mode > h2 {
        margin: 0 0 8px 0 !important;
        font-size: 1.65rem !important;
        line-height: 1.08 !important;
      }

      #gameScreen.active.mission-question-mode > .welcome-actions {
        margin: 0 0 10px 0 !important;
        display: flex !important;
        flex-wrap: nowrap !important;
        gap: 8px !important;
        justify-content: flex-start !important;
      }

      #gameScreen.active.mission-question-mode > .welcome-actions button {
        padding: 8px 12px !important;
        border-radius: 14px !important;
        font-size: .86rem !important;
        white-space: nowrap !important;
      }

      #gameScreen.active.mission-question-mode .game-layout {
        max-width: none !important;
        width: 100% !important;
        margin-left: auto !important;
        margin-right: auto !important;
        overflow: visible !important;
      }

      #gameScreen.active.mission-question-mode .dialogue-area.center-column {
        width: 100% !important;
        max-width: 1220px !important;
        margin-left: auto !important;
        margin-right: auto !important;
        display: grid !important;
        grid-template-columns: minmax(0, 560px) minmax(0, 560px) !important;
        grid-template-areas:
          "tracker tracker"
          "image question"
          "image choices"
          "image actions" !important;
        gap: 12px 18px !important;
        justify-content: center !important;
        align-items: start !important;
        overflow: visible !important;
      }

      #gameScreen.active.mission-question-mode #questionTracker {
        grid-area: tracker !important;
        width: 100% !important;
        box-sizing: border-box !important;
        margin: 0 !important;
        padding: 11px 14px !important;
        border-radius: 22px !important;
      }

      #gameScreen.active.mission-question-mode #questionTracker .question-tracker-main {
        gap: 12px !important;
      }

      #gameScreen.active.mission-question-mode #questionBadgeBig {
        padding: 7px 12px !important;
        font-size: .9rem !important;
      }

      #gameScreen.active.mission-question-mode #questionTrackerTitle {
        font-size: .92rem !important;
      }

      #gameScreen.active.mission-question-mode .question-pills {
        margin-top: 7px !important;
      }

      #gameScreen.active.mission-question-mode .question-pill {
        height: 28px !important;
        min-width: 28px !important;
      }

      #gameScreen.active.mission-question-mode #gameScenarioImageBox {
        grid-area: image !important;
        display: block !important;
        width: 100% !important;
        box-sizing: border-box !important;
        margin: 0 !important;
        padding: 14px !important;
        border-radius: 26px !important;
        background: rgba(255,255,255,.78) !important;
        border: 1px solid rgba(255,255,255,.86) !important;
        box-shadow: 0 16px 36px rgba(29,53,87,.08), inset 0 1px 0 rgba(255,255,255,.95) !important;
        overflow: hidden !important;
      }

      #gameScreen.active.mission-question-mode #gameScenarioImageBox.hidden {
        display: block !important;
      }

      #gameScreen.active.mission-question-mode #gameScenarioImageBox img {
        width: 100% !important;
        height: auto !important;
        aspect-ratio: 16 / 9 !important;
        object-fit: cover !important;
        object-position: center center !important;
        display: block !important;
        border-radius: 20px !important;
        background: #eef6ff !important;
      }

      #gameScreen.active.mission-question-mode #gameScenarioImageBox .game-scenario-image-caption {
        display: none !important;
      }

      #gameScreen.active.mission-question-mode #asdBox {
        display: none !important;
      }

      #missionQuestionText {
        grid-area: question !important;
        width: 100% !important;
        box-sizing: border-box !important;
        margin: 0 !important;
        padding: 17px 18px !important;
        border-radius: 24px !important;
        background: rgba(255,255,255,.84) !important;
        border: 1px solid rgba(255,255,255,.90) !important;
        box-shadow: 0 16px 36px rgba(29,53,87,.08), inset 0 1px 0 rgba(255,255,255,.95) !important;
      }

      #missionQuestionText .mission-question-badge {
        display: inline-block !important;
        margin-bottom: 9px !important;
        padding: 7px 12px !important;
        border-radius: 999px !important;
        background: rgba(0,122,255,.08) !important;
        color: var(--primary-dark) !important;
        font-size: .84rem !important;
        font-weight: 900 !important;
      }

      #missionQuestionText .mission-question-title {
        margin: 0 !important;
        font-size: 1.34rem !important;
        line-height: 1.35 !important;
        font-weight: 950 !important;
        color: var(--text) !important;
      }

      #missionQuestionText .mission-question-body {
        margin-top: 8px !important;
        font-size: .94rem !important;
        line-height: 1.5 !important;
        color: var(--muted) !important;
      }

      #gameScreen.active.mission-question-mode #asdChoices {
        grid-area: choices !important;
        display: grid !important;
        grid-template-columns: 1fr 1fr !important;
        gap: 10px !important;
        margin: 0 !important;
        width: 100% !important;
        box-sizing: border-box !important;
      }

      #gameScreen.active.mission-question-mode #asdChoices button {
        min-height: 64px !important;
        display: flex !important;
        align-items: center !important;
        text-align: left !important;
        border-radius: 18px !important;
        padding: 12px 14px !important;
        font-size: .92rem !important;
        line-height: 1.38 !important;
      }

      #gameScreen.active.mission-question-mode .action-row {
        grid-area: actions !important;
        display: grid !important;
        grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
        gap: 8px !important;
        margin-top: 0 !important;
        width: 100% !important;
        box-sizing: border-box !important;
      }

      #gameScreen.active.mission-question-mode .action-row button {
        min-height: 44px !important;
        border-radius: 15px !important;
        padding: 9px 10px !important;
        font-size: .82rem !important;
        line-height: 1.2 !important;
        white-space: normal !important;
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
            "image"
            "question"
            "choices"
            "actions" !important;
        }

        #gameScreen.active.mission-question-mode #asdChoices {
          grid-template-columns: 1fr !important;
        }

        #gameScreen.active.mission-question-mode .action-row {
          grid-template-columns: 1fr 1fr !important;
        }
      }
    `;

    document.head.appendChild(style);
    styleInjected = true;
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
    const asdBox = document.getElementById('asdBox');
    const asdChoices = document.getElementById('asdChoices');
    if (!asdBox || !asdChoices) return;

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

  function removeAnswerLetters() {
    document.querySelectorAll('#gameScreen.active.mission-question-mode #asdChoices button[data-choice-letter]').forEach(function (btn) {
      delete btn.dataset.choiceLetter;
      btn.removeAttribute('data-choice-letter');
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
      removeAnswerLetters();
    }
  }

  function scheduleUpdate() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(function () {
      scheduled = false;
      updateMissionQuestionMode();
    });
  }

  function observeGameScreen() {
    const screen = document.getElementById('gameScreen');
    if (!screen || observed) return;
    observed = true;

    const observer = new MutationObserver(scheduleUpdate);
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }

  window.addEventListener('load', function () {
    run();
    setTimeout(updateMissionQuestionMode, 500);
  });
})();
