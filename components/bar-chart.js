var BarChart = (function() {

  function render(container, opts) {
    container.innerHTML = '';
    var data = opts.data;
    var showPercentages = opts.showPercentages;

    if (!data || data.length === 0) {
      container.innerHTML = '<div class="loading">אין נתונים להצגה</div>';
      return;
    }

    var sorted = data.slice().sort(function(a, b) { return b.value - a.value; });
    var maxVal = Math.max.apply(null, sorted.map(function(d) { return d.value; }).concat([1]));
    var total = sorted.reduce(function(s, d) { return s + d.value; }, 0);

    var barHeight = 32;
    var gap = 8;
    var labelWidth = 180;
    var chartWidth = 600;
    var axisHeight = 30;
    var svgWidth = labelWidth + chartWidth + 20;
    var svgHeight = sorted.length * (barHeight + gap) + axisHeight + 10;

    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 ' + svgWidth + ' ' + svgHeight);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', buildAriaLabel(sorted, showPercentages, total));
    svg.style.width = '100%';
    svg.style.height = 'auto';

    var steps = 5;
    var maxDisplay = showPercentages ? 100 : niceMax(maxVal);
    for (var i = 0; i <= steps; i++) {
      var val = (maxDisplay / steps) * i;
      var x = labelWidth + (val / maxDisplay) * chartWidth;
      var y = svgHeight - axisHeight;

      svg.appendChild(createSvgEl('line', { x1: x, y1: 0, x2: x, y2: y, stroke: '#E0E0E0', 'stroke-width': 1 }));
      var text = createSvgEl('text', { x: x, y: svgHeight - 5, 'text-anchor': 'middle', fill: '#757575', 'font-size': '11' });
      text.textContent = showPercentages ? Math.round(val) + '%' : Sanitize.formatNumber(Math.round(val));
      svg.appendChild(text);
    }

    sorted.forEach(function(item, i) {
      var yPos = i * (barHeight + gap) + 4;
      var barVal = showPercentages ? (item.value / total) * 100 : item.value;
      var width = (barVal / maxDisplay) * chartWidth;

      var label = createSvgEl('text', {
        x: labelWidth - 10, y: yPos + barHeight / 2 + 4,
        'text-anchor': 'end', fill: '#212121', 'font-size': '12'
      });
      label.textContent = item.label;
      svg.appendChild(label);

      var rect = createSvgEl('rect', {
        x: labelWidth, y: yPos, width: Math.max(width, 2), height: barHeight,
        fill: item.color || '#1565C0', rx: 2
      });
      var titleEl = createSvgEl('title', {});
      titleEl.textContent = item.label + ': ' + (showPercentages ? ((item.value / total) * 100).toFixed(1) + '%' : Sanitize.formatNumber(item.value));
      rect.appendChild(titleEl);
      svg.appendChild(rect);
    });

    container.appendChild(svg);
  }

  function buildAriaLabel(data, showPercentages, total) {
    var items = data.map(function(d) {
      var val = showPercentages ? ((d.value / total) * 100).toFixed(1) + '%' : Sanitize.formatNumber(d.value);
      return d.label + ': ' + val;
    });
    return 'תרשים עמודות אופקי. ' + items.join(', ');
  }

  function niceMax(val) {
    if (val <= 0) return 100;
    var mag = Math.pow(10, Math.floor(Math.log10(val)));
    return Math.ceil(val / mag) * mag;
  }

  function createSvgEl(tag, attrs) {
    var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.keys(attrs).forEach(function(k) { el.setAttribute(k, attrs[k]); });
    return el;
  }

  function prepareData(records, tab, selectedYear, selectedOffice) {
    var filtered = records.filter(function(r) {
      var yearMatch = r.Year === Number(selectedYear);
      var officeMatch = selectedOffice === 'כל המשרדים' || r.Office === selectedOffice;
      return yearMatch && officeMatch;
    });

    var groupField, valueField;
    switch (tab) {
      case 'budget-sources': groupField = 'Source / Usage'; valueField = 'total planned'; break;
      case 'expense-type': groupField = 'Cost type'; valueField = 'total planned'; break;
      case 'accounting': groupField = 'Workplan'; valueField = 'total planned'; break;
      case 'technology': groupField = 'Workplan'; valueField = 'total planned'; break;
      default: groupField = 'Source / Usage'; valueField = 'total planned';
    }

    var grouped = {};
    filtered.forEach(function(r) {
      var key = r[groupField] || 'אחר';
      var val = Number(r[valueField]) || 0;
      grouped[key] = (grouped[key] || 0) + val;
    });

    var colors = tab === 'expense-type'
      ? { 'השקעה': '#90CAF9', 'הוצאה שוטפת': '#1565C0' }
      : {};

    return Object.keys(grouped).map(function(label) {
      return { label: label, value: grouped[label], color: colors[label] || '#1565C0' };
    });
  }

  return { render: render, prepareData: prepareData };
})();
