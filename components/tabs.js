var Tabs = (function() {

  var TAB_DEFINITIONS = [
    { id: 'budget-sources', label: 'מקורות תקציב' },
    { id: 'expense-type', label: 'סוג הוצאה' },
    { id: 'accounting', label: 'מבט חשבונאי' },
    { id: 'technology', label: 'מבט טכנולוגי' },
    { id: 'plan-vs-actual', label: 'תכנון מול ביצוע' },
  ];

  function create(container, opts) {
    var wrapper = document.createElement('div');
    wrapper.className = 'tabs-container';

    var list = document.createElement('div');
    list.className = 'tabs-list';
    list.setAttribute('role', 'tablist');
    list.setAttribute('aria-label', 'פילוח הוצאות IT');

    TAB_DEFINITIONS.forEach(function(tab, i) {
      var btn = document.createElement('button');
      btn.className = 'tab-item';
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      btn.setAttribute('tabindex', i === 0 ? '0' : '-1');
      btn.setAttribute('id', 'tab-' + tab.id);
      btn.dataset.tabId = tab.id;
      Sanitize.setText(btn, tab.label);

      btn.addEventListener('click', function() { activateTab(list, btn, opts.onTabChange); });
      btn.addEventListener('keydown', function(e) { handleTabKeyboard(e, list, opts.onTabChange); });
      list.appendChild(btn);
    });

    wrapper.appendChild(list);
    container.appendChild(wrapper);
  }

  function activateTab(list, btn, onTabChange) {
    list.querySelectorAll('[role="tab"]').forEach(function(t) {
      t.setAttribute('aria-selected', 'false');
      t.setAttribute('tabindex', '-1');
    });
    btn.setAttribute('aria-selected', 'true');
    btn.setAttribute('tabindex', '0');
    btn.focus();
    onTabChange(btn.dataset.tabId);
  }

  function handleTabKeyboard(e, list, onTabChange) {
    var tabs = Array.from(list.querySelectorAll('[role="tab"]'));
    var idx = tabs.indexOf(e.target);
    var newIdx = idx;

    if (e.key === 'ArrowRight') { e.preventDefault(); newIdx = idx > 0 ? idx - 1 : tabs.length - 1; }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); newIdx = idx < tabs.length - 1 ? idx + 1 : 0; }
    else if (e.key === 'Home') { e.preventDefault(); newIdx = 0; }
    else if (e.key === 'End') { e.preventDefault(); newIdx = tabs.length - 1; }
    else return;

    activateTab(list, tabs[newIdx], onTabChange);
  }

  return { create: create, TAB_DEFINITIONS: TAB_DEFINITIONS };
})();
