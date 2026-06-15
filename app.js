(function() {
  // State
  var state = {
    selectedYear: 2026,
    selectedOffice: 'כל המשרדים',
    activeTab: 'budget-sources',
    showPercentages: false,
    budgetCosts: [],
    officeBudget: [],
    humanCapital: []
  };

  // DOM refs
  var filtersEl = document.getElementById('filters');
  var tabsEl = document.getElementById('tabs');
  var chartAreaEl = document.getElementById('chart-area');
  var kpiSidebarEl = document.getElementById('kpi-sidebar');
  var toggleAreaEl = document.getElementById('toggle-area');
  var lineChartsEl = document.getElementById('line-charts');
  var liveRegion = document.getElementById('live-region');

  function init() {
    chartAreaEl.innerHTML = '<div class="loading">טוען נתונים...</div>';

    Promise.all([
      Api.fetchBudgetCosts(),
      Api.fetchOfficeBudget(),
      Api.fetchHumanCapital()
    ]).then(function(results) {
      state.budgetCosts = results[0] || [];
      state.officeBudget = results[1] || [];
      state.humanCapital = results[2] || [];

      var yearsSet = {};
      state.budgetCosts.forEach(function(r) { yearsSet[r.Year] = true; });
      var years = Object.keys(yearsSet).map(Number).sort(function(a, b) { return b - a; });

      var officesSet = { 'כל המשרדים': true };
      state.budgetCosts.forEach(function(r) { if (r.Office) officesSet[r.Office] = true; });
      var offices = Object.keys(officesSet);

      Dropdowns.create(filtersEl, {
        years: years,
        offices: offices,
        onYearChange: function(val) { state.selectedYear = Number(val); update(); },
        onOfficeChange: function(val) { state.selectedOffice = val; update(); }
      });

      Tabs.create(tabsEl, {
        onTabChange: function(tabId) { state.activeTab = tabId; update(); }
      });

      Toggle.create(toggleAreaEl, {
        onChange: function(showPct) { state.showPercentages = showPct; update(); }
      });

      update();
    });
  }

  function update() {
    announce('מעדכן נתונים...');

    // Bar chart
    if (state.activeTab === 'plan-vs-actual' && state.selectedYear === 2026) {
      chartAreaEl.innerHTML = '';
      var placeholder = document.createElement('div');
      placeholder.className = 'placeholder-msg';
      var t1 = document.createElement('div');
      t1.className = 'placeholder-msg__title';
      t1.textContent = 'נתוני תכנון מול ביצוע טרם זמינים עבור השנה הנוכחית אנא בחר שנה אחרת';
      var t2 = document.createElement('div');
      t2.className = 'placeholder-msg__sub';
      t2.textContent = 'באפשרותכם לצפות בנתונים היסטוריים, באמצעות בחירה באחת השנים הקודמות';
      placeholder.appendChild(t1);
      placeholder.appendChild(t2);
      chartAreaEl.appendChild(placeholder);
    } else {
      var barData = BarChart.prepareData(state.budgetCosts, state.activeTab, state.selectedYear, state.selectedOffice);
      BarChart.render(chartAreaEl, { data: barData, showPercentages: state.showPercentages });
    }

    // KPI cards
    var kpi = KpiCards.computeData(state.budgetCosts, state.officeBudget, state.selectedYear, state.selectedOffice);
    KpiCards.render(kpiSidebarEl, kpi);

    // Line charts
    lineChartsEl.innerHTML = '';

    var trend = LineChart.prepareExpenseTrend(state.officeBudget, state.selectedOffice);
    if (trend.years.length > 0) {
      LineChart.render(lineChartsEl, {
        title: 'מגמת ההוצאות על פני השנים:',
        series: trend.series,
        years: trend.years,
        legendItems: null
      });
    }

    var capexOpex = LineChart.prepareCapexOpex(state.budgetCosts, state.selectedOffice);
    if (capexOpex.years.length > 0) {
      LineChart.render(lineChartsEl, {
        title: 'השקעות מול הוצאות שוטפות:',
        series: capexOpex.series,
        years: capexOpex.years,
        legendItems: ['השקעה', 'הוצאה שוטפת']
      });
    }

    announce('הנתונים עודכנו');
  }

  function announce(msg) {
    liveRegion.textContent = msg;
    setTimeout(function() { liveRegion.textContent = ''; }, 1000);
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
