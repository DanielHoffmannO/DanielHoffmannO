'use strict';

const CONFIG = Object.freeze({
  github: {
    username: 'DanielHoffmannO',
    featuredRepos: ['CofreSenhas', 'SaudeConectada', 'FilmesApi', 'PrevisaoCompras', 'GerenciamentoFinanceiro', 'TruCoNsole'],
  },
  social: {
    linkedin: 'https://www.linkedin.com/in/daniel-hoffmann-bonicio/',
    email: 'daniel2001hoffmann@outlook.com',
  },
  terminal: {
    user: 'daniel',
    host: 'portfolio',
  },
  chat: {
    api: 'https://daniel-chat-api.vercel.app/',
    healthTimeoutMs: 3000,
  },
});

const CHAT_HEALTH_CACHE_KEY = 'chat_health';
const CHAT_HEALTH_CACHE_TTL = 30000;

function checkChatHealth() {
  try {
    const cached = sessionStorage.getItem(CHAT_HEALTH_CACHE_KEY);
    if (cached) {
      const { ok, ts } = JSON.parse(cached);
      if (Date.now() - ts < CHAT_HEALTH_CACHE_TTL) {
        return ok ? Promise.resolve(true) : Promise.reject(new Error('unhealthy'));
      }
    }
  } catch (_) {}

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), CONFIG.chat.healthTimeoutMs);
  return fetch(CONFIG.chat.api + 'api/health', { signal: ctrl.signal })
    .then((r) => {
      if (!r.ok) throw new Error('unhealthy');
      cacheChatHealth(true);
      return true;
    })
    .catch((err) => {
      cacheChatHealth(false);
      throw err;
    })
    .finally(() => clearTimeout(timer));
}

function cacheChatHealth(ok) {
  try {
    sessionStorage.setItem(CHAT_HEALTH_CACHE_KEY, JSON.stringify({ ok, ts: Date.now() }));
  } catch (_) {}
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
}

const TRANSLATIONS = Object.freeze({
  pt: {
    'nav.home': 'home',
    'nav.sobre': 'sobre',
    'nav.projetos': 'projetos',
    'nav.certificados': 'certificados',
    'nav.contato': 'contato',
    'home.title': 'DANIEL HOFFMANN — Desenvolvedor Full Stack',
    'home.desc': 'Desenvolvedor Full Stack com histórico internacional em robótica.<br>Graduado em <strong class="text-amber">Análise e Desenvolvimento de Sistemas</strong>.<br>Desde os 11 anos transformando curiosidade em código.',
    'sobre.resumo': 'Desenvolvedor Back-end com <span class="highlight-green"><span data-year-from="2021"></span> anos de experiência</span> em C# e .NET atuando no sistema de crédito da Havan, que atende <span class="highlight-amber">150+ lojas</span> físicas. Especialista em análise de crédito, liberação de limite, cobrança, emissão de cartão e integração biométrica. Vivência em arquitetura de software com Clean Architecture, DDD, microsserviços, mensageria (RabbitMQ), containers (Docker, Rancher) e CI/CD. Trajetória de <span class="highlight-green"><span data-year-from="2013"></span> anos em robótica competitiva</span> com 3 títulos mundiais.',
    'sobre.formacao': 'Graduado em <strong>Análise e Desenvolvimento de Sistemas</strong>. <strong>Pós-graduado em Engenharia da Computação</strong>. Técnico em Eletromecânica pelo Senai.',
    'sobre.exp.title': '# ---- experiência profissional ----',
    'sobre.exp.cargo': 'Programador de Software - Havan',
    'sobre.exp.desc': 'Sistema de crédito para 150+ lojas físicas. Especialista em análise de crédito, liberação de limite, cobrança e emissão de cartões com integração biométrica.',
    'sobre.form.title': '# ---- formação ----',
    'sobre.stack.title': '# ---- stack técnica ----',
    'sobre.robo.title': '# ---- conquistas internacionais ----',
    'contato.cta': 'Tem uma proposta ou projeto em mente? Mande um e-mail.',
    'contato.cta.link': '>> enviar e-mail para daniel2001hoffmann@outlook.com',
    'repos.loading': 'buscando repos...',
    'repos.empty': 'Nenhum repositório encontrado',
    'repos.error.rate': '[ERR] GitHub API rate limit exceeded. Tente novamente em alguns minutos.',
    'repos.error.generic': '[ERR] Falha ao comunicar com GitHub API.',
  },
  en: {
    'nav.home': 'home',
    'nav.sobre': 'about',
    'nav.projetos': 'projects',
    'nav.certificados': 'certificates',
    'nav.contato': 'contact',
    'home.title': 'DANIEL HOFFMANN — Full Stack Developer',
    'home.desc': 'Full Stack Developer with international robotics background.<br>Graduated in <strong class="text-amber">Systems Analysis and Development</strong>.<br>Turning curiosity into code since age 11.',
    'sobre.resumo': 'Back-end Developer with <span class="highlight-green"><span data-year-from="2021"></span> years of experience</span> in C# and .NET working on Havan\'s credit system, serving <span class="highlight-amber">150+ physical stores</span>. Specialist in credit analysis, limit approval, billing, card issuance, and biometric integration. Experience in software architecture with Clean Architecture, DDD, microservices, messaging (RabbitMQ), containers (Docker, Rancher), and CI/CD. <span class="highlight-green"><span data-year-from="2013"></span> years in competitive robotics</span> with 3 international titles.',
    'sobre.formacao': 'Graduated in <strong>Systems Analysis and Development</strong>. <strong>Postgraduate in Computer Engineering</strong>. Electromechanics Technician from Senai.',
    'sobre.exp.title': '# ---- professional experience ----',
    'sobre.exp.cargo': 'Software Developer - Havan',
    'sobre.exp.desc': 'Credit system for 150+ physical stores. Specialist in credit analysis, limit approval, billing, and card issuance with biometric integration.',
    'sobre.form.title': '# ---- education ----',
    'sobre.stack.title': '# ---- tech stack ----',
    'sobre.robo.title': '# ---- international achievements ----',
    'contato.cta': 'Have a proposal or project in mind? Send an email.',
    'contato.cta.link': '>> send email to daniel2001hoffmann@outlook.com',
    'repos.loading': 'fetching repos...',
    'repos.empty': 'No repositories found',
    'repos.error.rate': '[ERR] GitHub API rate limit exceeded. Try again in a few minutes.',
    'repos.error.generic': '[ERR] Failed to communicate with GitHub API.',
  },
});

function initLayout() {
  const page = document.body.dataset.page || '';
  const path = document.body.dataset.path || '~';
  const user = CONFIG.terminal.user;
  const host = CONFIG.terminal.host;

  const nav = [
    { href: 'index.html', label: 'home', id: 'home', i18n: 'nav.home' },
    { href: 'sobre.html', label: 'sobre', id: 'sobre', i18n: 'nav.sobre' },
    { href: 'projetos.html', label: 'projetos', id: 'projetos', i18n: 'nav.projetos' },
    { href: 'certificados.html', label: 'certificados', id: 'certificados', i18n: 'nav.certificados' },
    { href: 'contato.html', label: 'contato', id: 'contato', i18n: 'nav.contato' },
  ];

  // Chat IA: só aparece se o serviço estiver online
  checkChatHealth()
    .then(() => addChatLink('chat.html'))
    .catch(() => {});

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

function addChatLink(url) {
  const link = document.createElement('a');
  link.href = url;
  link.textContent = 'chat-ia';

  const topNav = document.querySelector('.top-bar-nav');
  if (topNav) topNav.appendChild(link);

  const sideNav = document.getElementById('sideNav');
  if (sideNav) sideNav.appendChild(link.cloneNode(true));

  const homeLink = document.getElementById('chat-link');
  if (homeLink) homeLink.style.display = '';
}

function initTheme() {
  const saved = localStorage.getItem('theme') || 'dark';
  applyTheme(saved);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  localStorage.setItem('theme', next);
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const btn = document.getElementById('themeBtn');
  if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

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

function initReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  elements.forEach((el) => observer.observe(el));
}

initLayout();
initTheme();
initI18n();
initDynamicYears();
initMenu();
initReveal();
if (typeof initRepos === 'function') initRepos();
if (typeof initCerts === 'function') initCerts();
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
