/* Tiny boot: skip FOUC hide on login / quickview; safety-reveal if suite never loads. */
(function () {
  try {
    var path = (location.pathname || '');
    var search = (location.search || '');
    if (path.indexOf('login.php') !== -1 || search.indexOf('tm_quickview=1') !== -1) {
      document.documentElement.classList.add('tm-mms-theme-ready');
      document.documentElement.classList.add('tm-mms-menu-ready');
      return;
    }
  } catch (e) { /* ignore */ }

  // If the userscript never marks the page ready (disabled / failed), don't leave a blank screen.
  setTimeout(function () {
    try {
      if (!document.documentElement.classList.contains('tm-mms-theme-ready')) {
        document.documentElement.classList.add('tm-mms-theme-ready');
        document.documentElement.classList.add('tm-mms-menu-ready');
      }
    } catch (e2) { /* ignore */ }
  }, 12000);
})();
