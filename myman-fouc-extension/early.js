(function () {
  'use strict';
  try {
    var path = location.pathname || '';
    if (path.indexOf('login.php') !== -1) return;
    if (new URLSearchParams(location.search).get('tm_quickview') === '1') return;
    document.documentElement.classList.add('tm-mms-fouc-ext');
  } catch (e) { /* ignore */ }
})();
