'use strict';

function initLayout() {
  const page = document.body.dataset.page || '';
  const path = document.body.dataset.path || '~';
  const user = CONFIG.terminal.user;
  const host = CONFIG.terminal.host;

  const nav = [
    { href: 'index.html', label: 'home', id: 'home', i18n: 'nav.home' },
    { href: 'sobre.html', label: 'sobre', id: 'sobre', i18n: 'nav.sobre' },
    { href: 'projetos.html', label: 'projetos', id: 'projetos', i18n: 'nav.projetos' },
    { href: 'contato.html', label: 'contato', id: 'contato', i18n: 'nav.contato' },
  ];

  const navLinks = nav.map((n) => {
    const active = n.id === page;
    return `<a href="${n.href}" data-i18n="${n.i18n}"${active ? ' class="active" aria-current="page"' : ''}>${n.label}</a>`;
  }).join('\n      ');

  const header = document.createElement('header');
  header.className = 'top-bar';
  header.setAttribute('role', 'banner');
  header.innerHTML = `
    <div class="prompt-left" aria-hidden="true">
      <span class="user">${user}</span><span class="sep">@</span><span class="host">${host}</span><span class="sep">:</span><span class="path">${path}</span>
    </div>
    <nav class="top-bar-nav" aria-label="Navegação principal">
      ${navLinks}
    </nav>
    <div class="top-bar-actions">
      <button id="langBtn" class="action-btn" onclick="toggleLang()" aria-label="Trocar idioma">EN</button>
      <button id="themeBtn" class="action-btn" onclick="toggleTheme()" aria-label="Trocar tema">☀️</button>
      <button class="menu-btn" id="menuBtn" aria-expanded="false" aria-controls="sideNav" aria-label="Abrir menu">menu</button>
    </div>`;

  const sideNav = document.createElement('nav');
  sideNav.className = 'side-nav';
  sideNav.id = 'sideNav';
  sideNav.setAttribute('aria-label', 'Menu mobile');
  sideNav.innerHTML = navLinks;

  const footer = document.createElement('footer');
  footer.className = 'footer';
  footer.setAttribute('role', 'contentinfo');
  footer.innerHTML = `<p>&copy; ${new Date().getFullYear()} — Daniel Hoffmann</p>`;

  document.body.prepend(sideNav);
  document.body.prepend(header);
  document.body.appendChild(footer);
}
