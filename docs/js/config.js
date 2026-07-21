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

function checkChatHealth() {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), CONFIG.chat.healthTimeoutMs);
  return fetch(CONFIG.chat.api + 'api/health', { signal: ctrl.signal })
    .then((r) => {
      if (!r.ok) throw new Error('unhealthy');
      return true;
    })
    .finally(() => clearTimeout(timer));
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
}
