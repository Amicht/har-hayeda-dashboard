var Sanitize = (function() {
  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function setText(el, text) {
    if (el) el.textContent = text == null ? '' : String(text);
  }

  function formatNumber(num) {
    if (num == null || isNaN(num)) return 'N/A';
    return Number(num).toLocaleString('he-IL');
  }

  function formatLargeNumber(num) {
    if (num == null || isNaN(num)) return 'אין נתונים';
    var n = Number(num);
    if (Math.abs(n) >= 1e9) return (n / 1e9).toFixed(2) + 'B';
    if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return formatNumber(n);
  }

  return { escapeHtml: escapeHtml, setText: setText, formatNumber: formatNumber, formatLargeNumber: formatLargeNumber };
})();
