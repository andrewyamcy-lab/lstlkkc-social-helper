// /mission-answer-click-fix.js
// Fix answer buttons not responding after adding A/B/C/D visual labels.
// Cause: the layout script wrapped answer text with spans, so the original answer handler may read the wrong text/target.
// This file restores the real answer text before the original click handler runs.

(function () {
  let syntheticClickRunning = false;

  function restoreAnswerButton(button) {
    if (!button || !button.matches('#gameScreen.active.mission-question-mode #asdChoices button')) return;

    const textSpan = button.querySelector('.choice-text');
    const cleanText = button.dataset.baseText || (textSpan ? textSpan.textContent : button.textContent || '').trim();

    if (!cleanText) return;

    button.dataset.baseText = cleanText;
    button.textContent = cleanText;
  }

  function handleAnswerClick(event) {
    const button = event.target.closest && event.target.closest('#gameScreen.active.mission-question-mode #asdChoices button');
    if (!button) return;

    // If the user clicked the A/B/C/D span or answer span, the original handler may see the wrong target.
    // Stop this click, restore the clean button, then send one clean click to the button itself.
    if (!syntheticClickRunning && event.target !== button) {
      event.preventDefault();
      event.stopImmediatePropagation();
      restoreAnswerButton(button);

      syntheticClickRunning = true;
      button.click();
      syntheticClickRunning = false;
      return;
    }

    // If the user clicked directly on the button, just restore text before the app's answer logic reads it.
    restoreAnswerButton(button);
  }

  function run() {
    document.addEventListener('click', handleAnswerClick, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
