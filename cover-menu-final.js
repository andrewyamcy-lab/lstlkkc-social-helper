// cover-menu-final.js
// Final cover menu order and labels.

(function () {
  function injectStyles() {
    if (document.getElementById('coverMenuFinalStyle')) return;
    const style = document.createElement('style');
    style.id = 'coverMenuFinalStyle';
    style.textContent = `
      #coverScreen .menu-actions.final-cover-menu {
        max-width: 380px;
      }
    `;
    document.head.appendChild(style);
  }

  function replaceCoverMenu() {
    injectStyles();
    const cover = document.getElementById('coverScreen');
    if (!cover) return;
    const menu = cover.querySelector('.menu-actions');
    if (!menu || menu.dataset.finalCoverMenu === '1') return;

    menu.dataset.finalCoverMenu = '1';
    menu.classList.add('final-cover-menu');
    menu.innerHTML = `
      <button type="button" onclick="window.openRpgMap ? window.openRpgMap() : (window.showRpgMapScreen && window.showRpgMapScreen())">開始 RPG 冒險</button>
      <button type="button" class="secondary" onclick="showPhraseLibraryScreen()">社交技能書</button>
      <button type="button" class="secondary" onclick="window.showCharacterScreen && window.showCharacterScreen()">我的角色</button>
      <button type="button" class="secondary" onclick="showBadgeScreen()">查看我的徽章</button>
      <button type="button" class="secondary" onclick="showSettingsScreen()">我的設定</button>
      <button type="button" class="secondary" onclick="logoutGoogle()">登出</button>
    `;
  }

  function install() {
    replaceCoverMenu();
    setTimeout(replaceCoverMenu, 300);
    setTimeout(replaceCoverMenu, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install);
  } else {
    install();
  }

  window.addEventListener('load', install);
})();
