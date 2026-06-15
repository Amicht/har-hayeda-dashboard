var LineChart = (function() {

  function render(container, opts) {
    var title = opts.title;
    var series = opts.series;
    var years = opts.years;
    var legendItems = opts.legendItems;

    var wrapper = document.createElement('div');
    wrapper.className = 'line-chart-wrapper';

    var titleEl = document.createElement('h3');
    titleEl.className = 'line-chart-wrapper__title';
    titleEl.textContent = title;
    wrapper.appendChild(titleEl);

    if (!series || series.length === 0 || years.length === 0) {
      var msg = document.createElement('div');
      msg.className = 'loading';
      msg.textContent = 'אין נתונים להצגה';
      wrapper.appendChild(msg);
      container.appendChild(wrapper);
      return;
    }

    var padding = { top: 20, right: 60, bottom: 40, left: 50 };
    var width = 700;
    var height = 300;
    var plotW = width - padding.left - padding.right;
    var plotH = height - padding.top - padding.bottom;

    var allValues = [];
    series.forEach(function(s) { allValues = allValues.concat(s.data); });
    var maxVal = niceMax(Math.max.apply(null, allValues.concat([1])));

    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', buildAriaLabel(title, series, years));
    svg.style.width = '100%';
    svg.style.height = 'auto';

    // Y gridlines
    var ySteps = 5;
    for (var i = 0; i <= ySteps; i++) {
      var val = (maxVal / ySteps) * i;
      var y = padding.top + plotH - (val / maxVal) * plotH;
      svg.appendChild(createSvgEl('line', {
        x1: padding.left, y1: y, x2: width - padding.right, y2: y,
        stroke: '#E0E0E0', 'stroke-width': 1
      }));
      var text = createSvgEl('text', {
        x: padding.left - 8, y: y + 4, 'text-anchor': 'end', fill: '#757575', 'font-size': '11'
      });
      text.textContent = Sanitize.formatNumber(Math.round(val));
      svg.appendChild(text);
    }

    // X labels
    years.forEach(function(year, i) {
      var x = padding.left + (i / (years.length - 1)) * plotW;
      var text = createSvgEl('text', {
        x: x, y: height - 10, 'text-anchor': 'middle', fill: '#757575', 'font-size': '12'
      });
      text.textContent = year === 2026 ? '2026 תכנון' : String(year);
      svg.appendChild(text);
    });

    // Lines and dots
    var lineColors = ['#1565C0', '#64B5F6'];
    var fillStyles = [true, false];

    series.forEach(function(s, sIdx) {
      var points = s.data.map(function(val, i) {
        var x = padding.left + (i / (years.length - 1)) * plotW;
        var y = padding.top + plotH - (val / maxVal) * plotH;
        return { x: x, y: y, val: val };
      });

      var pathD = points.map(function(p, i) { return (i === 0 ? 'M' : 'L') + ' ' + p.x + ' ' + p.y; }).join(' ');
      svg.appendChild(createSvgEl('path', {
        d: pathD, fill: 'none', stroke: lineColors[sIdx] || '#1565C0',
        'stroke-width': 2, 'stroke-linejoin': 'round'
      }));

      points.forEach(function(p) {
        var circle = createSvgEl('circle', {
          cx: p.x, cy: p.y, r: 5,
          fill: fillStyles[sIdx] ? (lineColors[sIdx] || '#1565C0') : '#FFFFFF',
          stroke: lineColors[sIdx] || '#1565C0', 'stroke-width': 2
        });
        var t = createSvgEl('title', {});
        t.textContent = Sanitize.formatNumber(p.val);
        circle.appendChild(t);
        svg.appendChild(circle);
      });
    });

    wrapper.appendChild(svg);

    // Legend
    if (legendItems && legendItems.length > 1) {
      var legend = document.createElement('div');
      legend.className = 'chart-legend';
      legend.setAttribute('aria-label', 'מקרא');
      legendItems.forEach(function(item, i) {
        var el = document.createElement('span');
        el.className = 'chart-legend__item';
        var dot = document.createElement('span');
        dot.className = 'chart-legend__dot';
        dot.style.backgroundColor = lineColors[i] || '#1565C0';
        if (!fillStyles[i]) { dot.style.backgroundColor = '#FFF'; dot.style.border = '2px solid ' + lineColors[i]; }
        el.appendChild(dot);
        var lbl = document.createElement('span');
        lbl.textContent = item;
        el.appendChild(lbl);
        legend.appendChild(el);
      });
      wrapper.appendChild(legend);
    }

    container.appendChild(wrapper);
  }

  function niceMax(val) {
    if (val <= 0) return 100;
    var mag = Math.pow(10, Math.floor(Math.log10(val)));
    return Math.ceil(val / mag) * mag;
  }

  function buildAriaLabel(title, series, years) {
    var desc = title + ' ';
    series.forEach(function(s, i) {
      desc += (s.name || 'סדרה ' + (i + 1)) + ': ';
      desc += s.data.map(function(v, j) { return years[j] + ': ' + Sanitize.formatNumber(v); }).join(', ') + '. ';
    });
    return desc;
  }

  function createSvgEl(tag, attrs) {
    var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.keys(attrs).forEach(function(k) { el.setAttribute(k, attrs[k]); });
    return el;
  }

  function prepareExpenseTrend(officeBudgetRecords, selectedOffice) {
    var filtered = officeBudgetRecords.filter(function(r) {
      return selectedOffice === 'כל המשרדים' || r.Office === selectedOffice;
    });
    var byYear = {};
    filtered.forEach(function(r) {
      byYear[r.Year] = (byYear[r.Year] || 0) + (Number(r['Operational budget']) || 0);
    });
    var years = Object.keys(byYear).map(Number).sort(function(a, b) { return a - b; });
    var data = years.map(function(y) { return byYear[y]; });
    return { years: years, series: [{ name: 'סה"כ הוצאות', data: data }] };
  }

  function prepareCapexOpex(budgetCostRecords, selectedOffice) {
    var filtered = budgetCostRecords.filter(function(r) {
      return selectedOffice === 'כל המשרדים' || r.Office === selectedOffice;
    });
    var capexByYear = {};
    var opexByYear = {};
    filtered.forEach(function(r) {
      var y = r.Year;
      capexByYear[y] = (capexByYear[y] || 0) + (Number(r['Capex planned']) || 0);
      opexByYear[y] = (opexByYear[y] || 0) + (Number(r['Opex planned']) || 0);
    });
    var allYears = Object.keys(capexByYear).concat(Object.keys(opexByYear));
    var years = Array.from(new Set(allYears)).map(Number).sort(function(a, b) { return a - b; });
    return {
      years: years,
      series: [
        { name: 'השקעה', data: years.map(function(y) { return capexByYear[y] || 0; }) },
        { name: 'הוצאה שוטפת', data: years.map(function(y) { return opexByYear[y] || 0; }) }
      ]
    };
  }

  return { render: render, prepareExpenseTrend: prepareExpenseTrend, prepareCapexOpex: prepareCapexOpex };
})();
