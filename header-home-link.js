// /header-home-link.js
// Makes the site header clickable so users can return to the home page.

(function () {
  function goHome() {
    if (typeof showCoverScreen === 'function') {
      showCoverScreen();
      return;
    }

    if (typeof setActiveScreen === 'function') {
      setActiveScreen('coverScreen', 'cover');
      return;
    }

    const screenIds = ['coverScreen', 'badgeScreen', 'settingsScreen', 'phraseLibraryScreen', 'situationScreen', 'gameScreen'];
    screenIds.forEach(function (id) {
      const screen = document.getElementById(id);
      if (screen) screen.classList.toggle('active', id === 'coverScreen');
    });

    window.scrollTo({ top: 0, behavior: document.body.classList.contains('reduced-motion') ? 'auto' : 'smooth' });
  }

  function initHeaderHomeLink() {
    const header = document.querySelector('header');
    if (!header || header.__homeLinkReady) return;

    header.__homeLinkReady = true;
    header.setAttribute('role', 'button');
    header.setAttribute('tabindex', '0');
    header.setAttribute('aria-label', '返回首頁');
    header.title = '返回首頁';
    header.style.cursor = 'pointer';
    header.style.userSelect = 'none';

    header.addEventListener('click', function () {
      goHome();
    });

    header.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        goHome();
      }
    });
  }

  window.goHomeFromHeader = goHome;
  window.initHeaderHomeLink = initHeaderHomeLink;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeaderHomeLink);
  } else {
    initHeaderHomeLink();
  }
})();
