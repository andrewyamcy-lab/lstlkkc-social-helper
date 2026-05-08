// /character-tabs-no-flash.js
// Safe no-flash tab helper for「我的角色」.
// Important: this file no longer builds the old 5-skill 社交能力值 page.
// The real tab content is controlled by virtue-ability-system.js.

(function () {
  const TAB_KEY = 'asd_school_character_tab_v1';

  function safeSetTab(tabId) {
    localStorage.setItem(TAB_KEY, tabId);

    // If the new ability system is ready, use it.
    if (window.__virtueAbilitySystemReady && typeof window.__virtueSetCharacterTab === 'function') {
      window.__virtueSetCharacterTab(tabId);
      return;
    }

    // Temporary visual-only fallback before the new ability system finishes loading.
    document.querySelectorAll('#characterScreen.active .sims-tab-btn').forEach((button) => {
      const isActive = (button.getAttribute('onclick') || '').includes(`'${tabId}'`);
      button.classList.toggle('active', Boolean(isActive));
    });
  }

  function installNoFlashTabs() {
    // Do not overwrite the new ability system after it is ready.
    if (window.__virtueAbilitySystemReady && typeof window.__virtueSetCharacterTab === 'function') {
      window.setSimsCharacterTab = window.__virtueSetCharacterTab;
      return;
    }

    window.setSimsCharacterTab = safeSetTab;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installNoFlashTabs);
  } else {
    installNoFlashTabs();
  }

  window.addEventListener('load', function () {
    installNoFlashTabs();
    setTimeout(installNoFlashTabs, 400);
    setTimeout(installNoFlashTabs, 1000);
  });
})();
