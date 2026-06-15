var Toggle = (function() {

  function create(container, opts) {
    var wrapper = document.createElement('div');
    wrapper.className = 'toggle-container';

    var labelAmounts = document.createElement('span');
    labelAmounts.className = 'toggle-label';
    labelAmounts.textContent = 'סכומים במאות מיליוני ₪';
    labelAmounts.id = 'toggle-label-amounts';

    var btn = document.createElement('button');
    btn.className = 'toggle-switch';
    btn.setAttribute('role', 'switch');
    btn.setAttribute('aria-checked', 'true');
    btn.setAttribute('aria-label', 'מעבר בין סכומים לאחוזים');

    var labelPct = document.createElement('span');
    labelPct.className = 'toggle-label';
    labelPct.textContent = '% אחוזים';
    labelPct.id = 'toggle-label-pct';

    btn.addEventListener('click', function() {
      var checked = btn.getAttribute('aria-checked') === 'true';
      btn.setAttribute('aria-checked', String(!checked));
      opts.onChange(!checked);
    });

    btn.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); }
    });

    wrapper.appendChild(labelAmounts);
    wrapper.appendChild(btn);
    wrapper.appendChild(labelPct);
    container.appendChild(wrapper);
  }

  return { create: create };
})();
