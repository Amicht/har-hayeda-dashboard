var Dropdowns = (function() {

  function create(container, opts) {
    var bar = document.createElement('div');
    bar.className = 'filters-bar';

    var yearDd = buildDropdown({
      id: 'year-filter',
      label: '2026 תכנון',
      options: opts.years.map(function(y) { return { value: y, label: y === 2026 ? '2026 תכנון' : String(y) }; }),
      selected: opts.years[0],
      onChange: opts.onYearChange
    });

    var officeDd = buildOfficeDropdown({
      id: 'office-filter',
      options: opts.offices,
      selected: 'כל המשרדים',
      onChange: opts.onOfficeChange
    });

    bar.appendChild(yearDd);
    bar.appendChild(officeDd);
    container.appendChild(bar);
  }

  function buildDropdown(cfg) {
    var wrapper = document.createElement('div');
    wrapper.className = 'dropdown-wrapper';

    var trigger = document.createElement('button');
    trigger.className = 'dropdown-trigger';
    trigger.id = cfg.id;
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    Sanitize.setText(trigger, cfg.label);

    var panel = document.createElement('div');
    panel.className = 'dropdown-panel';
    panel.setAttribute('role', 'listbox');
    panel.setAttribute('aria-labelledby', cfg.id);

    cfg.options.forEach(function(opt) {
      var item = document.createElement('div');
      item.className = 'dropdown-option';
      item.setAttribute('role', 'option');
      item.setAttribute('aria-selected', opt.value === cfg.selected ? 'true' : 'false');
      item.setAttribute('tabindex', '0');
      item.dataset.value = opt.value;
      Sanitize.setText(item, opt.label);
      item.addEventListener('click', function() { selectOption(item, trigger, panel, cfg.onChange); });
      item.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectOption(item, trigger, panel, cfg.onChange); }
        handleArrowKeys(e, panel);
      });
      panel.appendChild(item);
    });

    trigger.addEventListener('click', function() { togglePanel(trigger, panel); });
    trigger.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closePanel(trigger, panel);
      if (e.key === 'ArrowDown') { e.preventDefault(); openAndFocusFirst(trigger, panel); }
    });

    wrapper.appendChild(trigger);
    wrapper.appendChild(panel);
    document.addEventListener('click', function(e) { if (!wrapper.contains(e.target)) closePanel(trigger, panel); });
    return wrapper;
  }

  function buildOfficeDropdown(cfg) {
    var wrapper = document.createElement('div');
    wrapper.className = 'dropdown-wrapper';

    var trigger = document.createElement('button');
    trigger.className = 'dropdown-trigger';
    trigger.id = cfg.id;
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    Sanitize.setText(trigger, cfg.selected);

    var panel = document.createElement('div');
    panel.className = 'dropdown-panel dropdown-panel--offices';
    panel.setAttribute('role', 'listbox');
    panel.setAttribute('aria-labelledby', cfg.id);

    var search = document.createElement('input');
    search.className = 'search-input';
    search.type = 'search';
    search.placeholder = 'שם המשרד';
    search.setAttribute('aria-label', 'חיפוש משרד');
    panel.appendChild(search);

    var grid = document.createElement('div');
    grid.className = 'offices-grid';

    var currentSelected = cfg.selected;

    function renderOptions(filter) {
      grid.innerHTML = '';
      var filtered = filter ? cfg.options.filter(function(o) { return o.includes(filter); }) : cfg.options;
      filtered.forEach(function(office) {
        var item = document.createElement('div');
        item.className = 'dropdown-option';
        item.setAttribute('role', 'option');
        item.setAttribute('aria-selected', office === currentSelected ? 'true' : 'false');
        item.setAttribute('tabindex', '0');
        item.dataset.value = office;
        Sanitize.setText(item, office);
        item.addEventListener('click', function() {
          currentSelected = office;
          grid.querySelectorAll('.dropdown-option').forEach(function(o) { o.setAttribute('aria-selected', 'false'); });
          item.setAttribute('aria-selected', 'true');
          Sanitize.setText(trigger, office);
          closePanel(trigger, panel);
          cfg.onChange(office);
        });
        item.addEventListener('keydown', function(e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); item.click(); }
        });
        grid.appendChild(item);
      });
    }

    renderOptions();
    search.addEventListener('input', function() { renderOptions(search.value); });
    panel.appendChild(grid);

    trigger.addEventListener('click', function() { togglePanel(trigger, panel); });
    trigger.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closePanel(trigger, panel);
      if (e.key === 'ArrowDown') { e.preventDefault(); togglePanel(trigger, panel); search.focus(); }
    });

    wrapper.appendChild(trigger);
    wrapper.appendChild(panel);
    document.addEventListener('click', function(e) { if (!wrapper.contains(e.target)) closePanel(trigger, panel); });
    return wrapper;
  }

  function togglePanel(trigger, panel) {
    var open = panel.classList.toggle('open');
    trigger.setAttribute('aria-expanded', String(open));
  }

  function closePanel(trigger, panel) {
    panel.classList.remove('open');
    trigger.setAttribute('aria-expanded', 'false');
  }

  function openAndFocusFirst(trigger, panel) {
    panel.classList.add('open');
    trigger.setAttribute('aria-expanded', 'true');
    var first = panel.querySelector('.dropdown-option');
    if (first) first.focus();
  }

  function selectOption(item, trigger, panel, onChange) {
    var parent = item.closest('.dropdown-panel');
    parent.querySelectorAll('.dropdown-option').forEach(function(o) { o.setAttribute('aria-selected', 'false'); });
    item.setAttribute('aria-selected', 'true');
    Sanitize.setText(trigger, item.textContent);
    closePanel(trigger, panel);
    onChange(item.dataset.value);
  }

  function handleArrowKeys(e, panel) {
    var items = Array.from(panel.querySelectorAll('.dropdown-option'));
    var idx = items.indexOf(e.target);
    if (e.key === 'ArrowDown' && idx < items.length - 1) { e.preventDefault(); items[idx + 1].focus(); }
    if (e.key === 'ArrowUp' && idx > 0) { e.preventDefault(); items[idx - 1].focus(); }
    if (e.key === 'Escape') { panel.classList.remove('open'); }
  }

  return { create: create };
})();
