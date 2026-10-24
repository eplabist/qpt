/* V57 pre-paint theme is applied inline in each experiment page. */
(function(){
  const KEY = 'qptlab-theme';
  const root = document.documentElement;
  const THEMES = { dark: 'dark', light: 'light' };

  function readQueryTheme(){
    try {
      const value = new URLSearchParams(window.location.search).get('theme');
      return (value === 'dark' || value === 'light') ? value : null;
    } catch(e) { return null; }
  }

  function readSavedTheme(){
    try {
      const saved = localStorage.getItem(KEY);
      if(saved === 'dark' || saved === 'light') return saved;
    } catch(e) {}
    return null;
  }

  function readCookieTheme(){
    try {
      const match = document.cookie.match(/(?:^|; )qptlab-theme=(dark|light)(?:;|$)/);
      return match ? match[1] : null;
    } catch(e) { return null; }
  }

  function getTheme(){
    return readQueryTheme() || readSavedTheme() || readCookieTheme() || 'light';
  }

  function saveTheme(theme){
    try { localStorage.setItem(KEY, theme); } catch(e) {}
    try { document.cookie = KEY + '=' + theme + '; path=/; max-age=31536000; SameSite=Lax'; } catch(e) {}
  }

  function applyTheme(theme){
    if(theme !== 'dark' && theme !== 'light') theme = 'light';
    root.setAttribute('data-theme', theme);
    document.body && document.body.setAttribute('data-theme', theme);

    document.querySelectorAll('.theme-toggle').forEach(function(btn){
      const dark = theme === 'dark';
      btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
      btn.setAttribute('title', dark ? 'Switch to light mode' : 'Switch to dark mode');
      const icon = btn.querySelector('.theme-icon');
      const label = btn.querySelector('.theme-label');
      if(icon) icon.textContent = dark ? '☀' : '☾';
      if(label) label.textContent = dark ? 'Light' : 'Dark';
    });
  }

  function currentTheme(){
    return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function addThemeToUrl(href){
    try {
      const url = new URL(href, window.location.href);
      if(url.origin !== window.location.origin) return href;
      if(!/\.html$/i.test(url.pathname) && url.pathname !== '/' && url.pathname !== '') return href;
      url.searchParams.set('theme', currentTheme());
      return url.href;
    } catch(e) { return href; }
  }

  function syncInternalLinks(){
    document.querySelectorAll('a[href]').forEach(function(a){
      const href = a.getAttribute('href');
      if(!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('javascript:')) return;
      if(a.target === '_blank') return;
      const updated = addThemeToUrl(href);
      if(updated !== href) a.setAttribute('href', updated);
    });
  }

  // Apply before the page becomes interactive. Query parameters make this
  // reliable even when HTML files are opened locally from file:// URLs.
  const initial = getTheme();
  saveTheme(initial);
  applyTheme(initial);

  document.addEventListener('DOMContentLoaded', function(){
    applyTheme(getTheme());
    syncInternalLinks();
  });

  document.addEventListener('click', function(e){
    const btn = e.target.closest && e.target.closest('.theme-toggle');
    if(btn){
      const next = currentTheme() === 'dark' ? 'light' : 'dark';
      saveTheme(next);
      applyTheme(next);
      syncInternalLinks();
      return;
    }

    const link = e.target.closest && e.target.closest('a[href]');
    if(link && link.target !== '_blank'){
      const href = link.getAttribute('href');
      if(href && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('javascript:')){
        const updated = addThemeToUrl(href);
        if(updated !== href) link.setAttribute('href', updated);
      }
    }
  }, true);

  window.addEventListener('storage', function(e){
    if(e.key === KEY && THEMES[e.newValue]){
      applyTheme(e.newValue);
      syncInternalLinks();
    }
  });
})();
