// API Configuration — edit these URLs to point to your endpoints
var API_CONFIG = {
  // API 1: Budget costs (bar chart data)
    budgetCosts: 'https://data.gov.il/api/3/action/datastore_search?resource_id=f888f077-c85b-471c-b2de-794e446f8813&distinct=true',
  // API 2: Office budget summary (line chart, KPI)
    officeBudget: 'https://data.gov.il/api/3/action/datastore_search?resource_id=6a98ea6b-3731-4a93-b5b2-bb251fb6c859&distinct=true',
  // API 3: Human capital breakdown
    humanCapital: 'https://data.gov.il/api/3/action/datastore_search?resource_id=b7a8a0d7-8453-4e77-8bc5-d78a259c84f5&distinct=true',
};

// https://data.gov.il/api/3/action/datastore_search?resource_id=f888f077-c85b-471c-b2de-794e446f8813&distinct=true
// https://data.gov.il/api/3/action/datastore_search?resource_id=6a98ea6b-3731-4a93-b5b2-bb251fb6c859&distinct=true
// https://data.gov.il/api/3/action/datastore_search?resource_id=b7a8a0d7-8453-4e77-8bc5-d78a259c84f5&distinct=true