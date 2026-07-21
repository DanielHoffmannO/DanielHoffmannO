'use strict';

const LANG_COLORS = Object.freeze({
  'C#': '#239120', Python: '#3572A5', JavaScript: '#f1e05a',
  TypeScript: '#2b7489', Go: '#00ADD8', C: '#555', 'C++': '#f34b7d',
  HTML: '#e34c26', CSS: '#563d7c', Shell: '#89e051', Rust: '#dea584',
  Java: '#b07219', Lua: '#000080', Dart: '#00B4AB', Ruby: '#701516',
  PHP: '#4F5D95', Kotlin: '#A97BFF', Swift: '#F05138', Vue: '#41b883',
});

const CACHE_KEY = 'gh_repos';
const CACHE_TTL = 5 * 60 * 1000;

function initRepos() {
  const list = document.getElementById('repoList');
  if (!list) return;

  const username = CONFIG.github.username;
  const loading = document.getElementById('loadingRepos');
  const error = document.getElementById('errorRepos');
  const filtersEl = document.getElementById('projectFilters');
  const countEl = document.getElementById('projectCount');
  const featuredSet = new Set(CONFIG.github.featuredRepos.map((n) => n.toLowerCase()));

  let allRepos = [];
  let activeFilter = 'all';

  if (loading) {
    loading.innerHTML = `fetching repos from <span class="text-green">${username}</span> ...`;
  }

  function renderFilters(repos) {
    if (!filtersEl) return;
    const langs = [...new Set(repos.map((r) => r.language).filter(Boolean))].sort();
    const btns = langs.map((l) => `<button class="filter-btn" data-lang="${escapeHtml(l)}">${escapeHtml(l)}</button>`).join('');
    filtersEl.innerHTML = `<button class="filter-btn active" data-lang="all">todos</button>${btns}`;
    filtersEl.querySelectorAll('.filter-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        filtersEl.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.dataset.lang;
        renderList();
      });
    });
  }

  function renderList() {
    const filtered = activeFilter === 'all' ? allRepos : allRepos.filter((r) => r.language === activeFilter);
    if (countEl) countEl.textContent = `# ${filtered.length} repositório${filtered.length !== 1 ? 's' : ''}`;
    list.innerHTML = filtered.map((repo, i) => renderRepo(repo, i, featuredSet)).join('');
  }

  getRepos(username)
    .then((repos) => {
      if (loading) loading.style.display = 'none';
      if (!repos.length) {
        showError(error, `Nenhum repositório encontrado para <code>${username}</code>`);
        return;
      }
      repos.sort((a, b) => {
        const af = featuredSet.has(a.name.toLowerCase()) ? 1 : 0;
        const bf = featuredSet.has(b.name.toLowerCase()) ? 1 : 0;
        if (af !== bf) return bf - af;
        return new Date(b.pushed_at) - new Date(a.pushed_at);
      });
      allRepos = repos;
      renderFilters(repos);
      renderList();
    })
    .catch((err) => {
      if (loading) loading.style.display = 'none';
      const msg = err.message === 'rate-limit'
        ? `[ERR] GitHub API rate limit exceeded. Tente novamente em alguns minutos.<br><span class="text-muted text-sm">Ou acesse: <a href="https://github.com/${username}" target="_blank" rel="noopener">${username}</a></span>`
        : '[ERR] Falha ao comunicar com GitHub API.<br><span class="text-muted">Verifique sua conexão.</span>';
      showError(error, msg);
    });
}

async function getRepos(username) {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, ts } = JSON.parse(cached);
      if (Date.now() - ts < CACHE_TTL) return data;
    }
  } catch (_) {}

  const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`);
  if (!res.ok) throw new Error(res.status === 403 ? 'rate-limit' : `HTTP ${res.status}`);
  const data = await res.json();

  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
  } catch (_) {}

  return data;
}

function renderRepo(repo, index, featuredSet) {
  const isFeatured = featuredSet.has(repo.name.toLowerCase());
  const lang = repo.language || '';
  const langColor = LANG_COLORS[lang] || '#0f1';
  const date = repo.pushed_at.slice(0, 10).split('-').reverse().join('/');
  const perms = repo.private ? 'd--------- ' : 'drwxr-xr ';

  return `
    <article class="project-item${isFeatured ? ' featured' : ''}">
      <div class="project-header">
        <div>
          <span class="perms">${perms}</span>
          <span class="owner">${CONFIG.github.username}</span>
          <span class="repo-name">${escapeHtml(repo.name)}</span>
        </div>
        <span class="repo-links">
          ${repo.html_url ? `<a href="${repo.html_url}" target="_blank" rel="noopener" aria-label="Repositório ${repo.name}">[repo]</a>` : ''}
          ${repo.homepage ? `<a href="${repo.homepage}" target="_blank" rel="noopener" aria-label="Site ${repo.name}">[site]</a>` : ''}
        </span>
      </div>
      ${repo.description ? `<p class="project-desc">${escapeHtml(repo.description)}</p>` : ''}
      <div class="project-meta">
        ${lang ? `<span><span class="lang-dot" style="background:${langColor}"></span>${lang}</span>` : ''}
        ${repo.stargazers_count ? `<span>★ ${repo.stargazers_count}</span>` : ''}
        ${repo.forks_count ? `<span>⑂ ${repo.forks_count}</span>` : ''}
        <span>updated: ${date}</span>
      </div>
    </article>`;
}

function showError(el, html) {
  if (!el) return;
  el.style.display = 'block';
  el.innerHTML = html;
}
