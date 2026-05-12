// /character-name-edit.js
// Upgrade for「我的角色」: allow each user/device to edit the displayed character name.

(function () {
  const SELECTED_KEY = 'asd_school_selected_character_v1';
  const NAME_KEY = 'asd_school_character_custom_names_v1';

  const DEFAULTS = {
    girl: { name: '心心', icon: '👧🏻' },
    boy: { name: '謙謙', icon: '👦🏻' }
  };

  function safeJson(key) {
    try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch (e) { return {}; }
  }

  function saveJson(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value || {})); } catch (e) {}
  }

  function selectedId() {
    const id = localStorage.getItem(SELECTED_KEY);
    return DEFAULTS[id] ? id : 'girl';
  }

  function cleanName(value) {
    return String(value || '').replace(/\s+/g, ' ').trim().slice(0, 12);
  }

  function getName(id) {
    const names = safeJson(NAME_KEY);
    return cleanName(names[id]) || DEFAULTS[id].name;
  }

  function setName(id, name) {
    if (!DEFAULTS[id]) return;
    const names = safeJson(NAME_KEY);
    const cleaned = cleanName(name);
    if (!cleaned) delete names[id];
    else names[id] = cleaned;
    saveJson(NAME_KEY, names);
  }

  function toast(message, type) {
    if (typeof window.showToast === 'function') window.showToast(message, type || 'success');
  }

  function rerender() {
    if (typeof window.renderSimsCharacterScreen === 'function') window.renderSimsCharacterScreen();
    else if (typeof window.renderCharacterScreen === 'function') window.renderCharacterScreen();
    setTimeout(decorate, 40);
    setTimeout(decorate, 160);
  }

  function editCurrentName() {
    const id = selectedId();
    const oldName = getName(id);
    const next = window.prompt('請輸入新的角色名稱（最多 12 個字）', oldName);
    if (next === null) return;
    const cleaned = cleanName(next);
    if (!cleaned) {
      toast('角色名稱不可留空', 'error');
      return;
    }
    setName(id, cleaned);
    toast('已更新角色名稱', 'success');
    rerender();
  }

  function resetCurrentName() {
    const id = selectedId();
    setName(id, '');
    toast('已重設為預設名稱', 'success');
    rerender();
  }

  function decorateSwitchButtons() {
    document.querySelectorAll('.sims-switch-btn').forEach(function (btn) {
      const action = String(btn.getAttribute('onclick') || '');
      const id = action.indexOf("'boy'") >= 0 || action.indexOf('"boy"') >= 0 ? 'boy' : 'girl';
      btn.textContent = DEFAULTS[id].icon + ' ' + getName(id);
    });
  }

  function decorateProfileName() {
    const screen = document.getElementById('characterScreen');
    if (!screen) return;
    const row = screen.querySelector('.sims-name-row');
    if (!row) return;
    const id = selectedId();
    const title = row.querySelector('h3');
    if (title) title.textContent = getName(id);

    const firstBox = row.querySelector('div');
    if (!firstBox || firstBox.querySelector('.sims-name-edit-tools')) return;

    const tools = document.createElement('div');
    tools.className = 'sims-name-edit-tools';
    tools.innerHTML = '<button type="button" class="sims-name-edit-btn" onclick="window.editSimsCharacterName && window.editSimsCharacterName()">✏️ 編輯名稱</button><button type="button" class="sims-name-reset-btn" onclick="window.resetSimsCharacterName && window.resetSimsCharacterName()">重設</button>';
    firstBox.appendChild(tools);
  }

  function injectStyles() {
    if (document.getElementById('characterNameEditStyle')) return;
    const style = document.createElement('style');
    style.id = 'characterNameEditStyle';
    style.textContent = `
      .sims-name-edit-tools { display:flex; flex-wrap:wrap; gap:8px; margin-top:8px; }
      .sims-name-edit-btn,
      .sims-name-reset-btn { border:0; border-radius:999px; padding:8px 12px; font-size:.86rem; font-weight:950; cursor:pointer; }
      .sims-name-edit-btn { color:#083b00; background:linear-gradient(180deg, rgba(57,255,20,.38), rgba(255,255,255,.76)); box-shadow:inset 0 1px 0 rgba(255,255,255,.9), 0 8px 18px rgba(57,255,20,.12); }
      .sims-name-reset-btn { color:var(--primary-dark); background:rgba(255,255,255,.66); box-shadow:inset 0 1px 0 rgba(255,255,255,.9), 0 8px 18px rgba(29,53,87,.08); }
    `;
    document.head.appendChild(style);
  }

  function decorate() {
    injectStyles();
    decorateSwitchButtons();
    decorateProfileName();
  }

  function wrapRenderers() {
    ['renderCharacterScreen', 'renderSimsCharacterScreen', 'showCharacterScreen', 'setSimsCharacter'].forEach(function (name) {
      const fn = window[name];
      if (typeof fn !== 'function' || fn.__characterNameEditWrapped) return;
      window[name] = function () {
        const result = fn.apply(this, arguments);
        setTimeout(decorate, 50);
        setTimeout(decorate, 180);
        return result;
      };
      window[name].__characterNameEditWrapped = true;
    });
  }

  function install() {
    injectStyles();
    wrapRenderers();
    decorate();
    setTimeout(function () { wrapRenderers(); decorate(); }, 300);
    setTimeout(function () { wrapRenderers(); decorate(); }, 1000);
  }

  window.getSimsCharacterName = getName;
  window.editSimsCharacterName = editCurrentName;
  window.resetSimsCharacterName = resetCurrentName;
  window.refreshSimsCharacterName = decorate;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install);
  else install();
  window.addEventListener('load', install);
})();
