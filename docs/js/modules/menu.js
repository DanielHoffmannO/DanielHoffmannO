'use strict';

function initMenu() {
  const btn = document.getElementById('menuBtn');
  const nav = document.getElementById('sideNav');

  if (!btn || !nav) return;

  btn.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    btn.textContent = isOpen ? 'close' : 'menu';
    btn.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => closeMenu(btn, nav));
  });

  document.addEventListener('click', (e) => {
    if (!nav.classList.contains('open')) return;
    if (nav.contains(e.target) || btn.contains(e.target)) return;
    closeMenu(btn, nav);
  });
}

function closeMenu(btn, nav) {
  nav.classList.remove('open');
  btn.textContent = 'menu';
  btn.setAttribute('aria-expanded', 'false');
}
