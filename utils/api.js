var Api = (function() {
  function isPlaceholder(url) {
    return !url || url.indexOf('example.com') !== -1;
  }

  function fetchApi(url) {
    if (isPlaceholder(url)) return Promise.resolve(null);
    return fetch(url)
      .then(function(res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function(data) {
        if (!data.success) throw new Error('API returned success=false');
        return data.result.records;
      })
      .catch(function(err) {
        console.warn('Failed to fetch ' + url + ':', err.message);
        return null;
      });
  }

  function fetchBudgetCosts() {
    return fetchApi(API_CONFIG.budgetCosts).then(function(records) {
      return records || MOCK_DATA.budgetCosts;
    });
  }

  function fetchOfficeBudget() {
    return fetchApi(API_CONFIG.officeBudget).then(function(records) {
      return records || MOCK_DATA.officeBudget;
    });
  }

  function fetchHumanCapital() {
    return fetchApi(API_CONFIG.humanCapital).then(function(records) {
      return records || MOCK_DATA.humanCapital;
    });
  }

  return { fetchBudgetCosts: fetchBudgetCosts, fetchOfficeBudget: fetchOfficeBudget, fetchHumanCapital: fetchHumanCapital };
})();
