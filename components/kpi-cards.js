var KpiCards = (function() {

  function render(container, opts) {
    container.innerHTML = '';
    container.appendChild(createCard({
      title: 'סה"כ הוצאות IT',
      value: Sanitize.formatLargeNumber(opts.totalIT),
      change: calcChange(opts.totalIT, opts.totalITPrev),
      hasData: opts.totalIT != null && !isNaN(opts.totalIT)
    }));
    container.appendChild(createCard({
      title: 'שיעור הוצאות ה-IT מסך כל ההוצאות',
      value: (opts.itRatio != null && !isNaN(opts.itRatio)) ? opts.itRatio.toFixed(2) + '%' : 'אין נתונים',
      change: calcChange(opts.itRatio, opts.itRatioPrev),
      hasData: opts.itRatio != null && !isNaN(opts.itRatio)
    }));
  }

  function createCard(cfg) {
    var card = document.createElement('div');
    card.className = 'kpi-card';
    card.setAttribute('role', 'region');
    card.setAttribute('aria-label', cfg.title);

    var titleEl = document.createElement('div');
    titleEl.className = 'kpi-card__title';
    titleEl.textContent = cfg.title;

    var valueEl = document.createElement('div');
    valueEl.className = 'kpi-card__value';
    valueEl.textContent = cfg.value;

    card.appendChild(titleEl);
    card.appendChild(valueEl);

    if (cfg.hasData && cfg.change !== null) {
      var changeEl = document.createElement('div');
      changeEl.className = 'kpi-card__change';
      var sign = cfg.change > 0 ? '+' : '';
      var arrowSvg = cfg.change >= 0
        ? '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 14l5-5 5 5z"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>';
      changeEl.innerHTML = arrowSvg + '<span>' + Sanitize.escapeHtml(sign + cfg.change.toFixed(2) + '% ביחס לשנה קודמת') + '</span>';
      card.appendChild(changeEl);
    } else if (!cfg.hasData) {
      var noData = document.createElement('div');
      noData.className = 'kpi-card__change kpi-card__change--neutral';
      noData.textContent = 'N/A ביחס לשנה קודמת';
      card.appendChild(noData);
    }

    return card;
  }

  function calcChange(current, prev) {
    if (current == null || prev == null || isNaN(current) || isNaN(prev) || prev === 0) return null;
    return ((current - prev) / Math.abs(prev)) * 100;
  }

  function computeData(budgetCosts, officeBudget, selectedYear, selectedOffice) {
    var year = Number(selectedYear);
    var prevYear = year - 1;

    var filteredCurrent = budgetCosts.filter(function(r) {
      return r.Year === year && (selectedOffice === 'כל המשרדים' || r.Office === selectedOffice);
    });
    var filteredPrev = budgetCosts.filter(function(r) {
      return r.Year === prevYear && (selectedOffice === 'כל המשרדים' || r.Office === selectedOffice);
    });

    var totalIT = filteredCurrent.reduce(function(s, r) { return s + (Number(r['total planned']) || 0); }, 0);
    var totalITPrev = filteredPrev.reduce(function(s, r) { return s + (Number(r['total planned']) || 0); }, 0);

    var obCurrent = officeBudget.filter(function(r) {
      return r.Year === year && (selectedOffice === 'כל המשרדים' || r.Office === selectedOffice);
    });
    var obPrev = officeBudget.filter(function(r) {
      return r.Year === prevYear && (selectedOffice === 'כל המשרדים' || r.Office === selectedOffice);
    });

    var opBudget = obCurrent.reduce(function(s, r) { return s + (Number(r['Operational budget']) || 0); }, 0);
    var opBudgetPrev = obPrev.reduce(function(s, r) { return s + (Number(r['Operational budget']) || 0); }, 0);

    var itRatio = opBudget > 0 ? (totalIT / opBudget) * 100 : null;
    var itRatioPrev = opBudgetPrev > 0 ? (totalITPrev / opBudgetPrev) * 100 : null;

    return { totalIT: totalIT || null, totalITPrev: totalITPrev || null, itRatio: itRatio, itRatioPrev: itRatioPrev };
  }

  return { render: render, computeData: computeData };
})();
