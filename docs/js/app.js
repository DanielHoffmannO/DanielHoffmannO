'use strict';

initLayout();
initTheme();
initI18n();
initDynamicYears();
initMenu();
initReveal();
initRepos();
initContactLinks();

function initContactLinks() {
  const linkedin = document.getElementById('ciLinkedin');
  const github = document.getElementById('ciGithub');

  if (linkedin) linkedin.href = CONFIG.social.linkedin;
  if (github) github.href = `https://github.com/${CONFIG.github.username}`;
}

function initDynamicYears() {
  const now = new Date().getFullYear();
  document.querySelectorAll('[data-year-from]').forEach((el) => {
    const from = parseInt(el.getAttribute('data-year-from'));
    el.textContent = now - from;
  });
}
