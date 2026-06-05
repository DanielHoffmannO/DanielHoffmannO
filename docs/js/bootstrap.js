'use strict';

(function () {
  const scripts = [
    'js/config.js',
    'js/i18n-data.js',
    'js/modules/layout.js',
    'js/modules/theme.js',
    'js/modules/i18n.js',
    'js/modules/menu.js',
    'js/modules/reveal.js',
    'js/modules/repos.js',
    'js/app.js',
  ];

  let loaded = 0;

  function loadNext() {
    if (loaded >= scripts.length) return;
    const script = document.createElement('script');
    script.src = scripts[loaded];
    script.onload = () => { loaded++; loadNext(); };
    document.head.appendChild(script);
  }

  loadNext();
})();
