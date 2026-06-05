'use strict';

let currentLang = 'pt';

function initI18n() {
  const saved = localStorage.getItem('lang') || 'pt';
  applyLang(saved);
}

function toggleLang() {
  const next = currentLang === 'pt' ? 'en' : 'pt';
  applyLang(next);
  localStorage.setItem('lang', next);
}

function applyLang(lang) {
  currentLang = lang;
  document.documentElement.setAttribute('lang', lang === 'pt' ? 'pt-br' : 'en');

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    const text = TRANSLATIONS[lang][key];
    if (text) el.innerHTML = text;
  });

  if (typeof initDynamicYears === 'function') initDynamicYears();

  const btn = document.getElementById('langBtn');
  if (btn) btn.textContent = lang === 'pt' ? 'EN' : 'PT';
}

function t(key) {
  return TRANSLATIONS[currentLang][key] || key;
}
