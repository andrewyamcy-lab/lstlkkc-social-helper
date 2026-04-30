// /answer-randomizer.js
// Randomizes answer option order each time a scenario starts.
// Scores and feedback notes stay attached to the correct option.
// No MutationObserver. No interval. Lightweight and safe.

(function () {
  const originalStepCache = {};

  function cloneOption(option) {
    return {
      text: option.text,
      score: option.score,
      note: option.note
    };
  }

  function cloneStep(step) {
    return {
      prompt: step.prompt,
      options: Array.isArray(step.options) ? step.options.map(cloneOption) : []
    };
  }

  function getOriginalSteps(gameKey) {
    if (!gameKey) return [];

    try {
      if (originalStepCache[gameKey]) {
        return originalStepCache[gameKey].map(cloneStep);
      }

      if (typeof asdGames === 'undefined' || !asdGames || !asdGames[gameKey] || !Array.isArray(asdGames[gameKey].steps)) {
        return [];
      }

      originalStepCache[gameKey] = asdGames[gameKey].steps.map(cloneStep);
      return originalStepCache[gameKey].map(cloneStep);
    } catch (error) {
      console.warn('Cannot read original steps for answer randomizer:', error);
      return [];
    }
  }

  function shuffleArray(array) {
    const shuffled = array.slice();
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = temp;
    }
    return shuffled;
  }

  function avoidSameFirstBestOption(originalOptions, shuffledOptions) {
    // If the original first option was a best answer and the shuffled first option is the same text,
    // rotate once to reduce the old pattern of "first answer is usually best".
    if (!originalOptions || !shuffledOptions || originalOptions.length < 2 || shuffledOptions.length < 2) return shuffledOptions;

    const highestScore = Math.max.apply(null, originalOptions.map(function (option) { return Number(option.score) || 0; }));
    const originalFirst = originalOptions[0];
    const shuffledFirst = shuffledOptions[0];

    if (originalFirst && shuffledFirst && originalFirst.text === shuffledFirst.text && Number(originalFirst.score) === highestScore) {
      const rotated = shuffledOptions.slice();
      rotated.push(rotated.shift());
      return rotated;
    }

    return shuffledOptions;
  }

  function randomizeGameAnswers(gameKey) {
    try {
      if (typeof asdGames === 'undefined' || !asdGames || !asdGames[gameKey]) return;

      const originalSteps = getOriginalSteps(gameKey);
      if (!originalSteps.length) return;

      asdGames[gameKey].steps = originalSteps.map(function (step) {
        const originalOptions = step.options.map(cloneOption);
        let shuffledOptions = shuffleArray(originalOptions);
        shuffledOptions = avoidSameFirstBestOption(originalOptions, shuffledOptions);

        return {
          prompt: step.prompt,
          options: shuffledOptions
        };
      });
    } catch (error) {
      console.warn('Answer randomizer failed:', error);
    }
  }

  function patchStartAsdGame() {
    if (typeof window.startAsdGame !== 'function') return false;
    if (window.startAsdGame.__answerRandomizerPatched) return true;

    const originalStartAsdGame = window.startAsdGame;

    window.startAsdGame = function (gameKey) {
      randomizeGameAnswers(gameKey);
      return originalStartAsdGame.apply(this, arguments);
    };

    window.startAsdGame.__answerRandomizerPatched = true;
    return true;
  }

  function initAnswerRandomizer() {
    patchStartAsdGame();
  }

  window.initAnswerRandomizer = initAnswerRandomizer;
  window.randomizeGameAnswers = randomizeGameAnswers;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnswerRandomizer);
  } else {
    initAnswerRandomizer();
  }

  // One-off delayed patches because other lightweight scripts also wrap startAsdGame.
  setTimeout(initAnswerRandomizer, 200);
  setTimeout(initAnswerRandomizer, 900);
})();
