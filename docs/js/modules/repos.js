'use strict';

const LANG_COLORS = Object.freeze({
  'C#': '#239120', Python: '#3572A5', JavaScript: '#f1e05a',
  TypeScript: '#2b7489', Go: '#00ADD8', C: '#555', 'C++': '#f34b7d',
  HTML: '#e34c26', CSS: '#563d7c', Shell: '#89e051', Rust: '#dea584',
  Java: '#b07219', Lua: '#000080', Dart: '#00B4AB', Ruby: '#701516',
  PHP: '#4F5D95', Kotlin: '#A97BFF', Swift: '#F05138', Vue: '#41b883',
});

const CACHE_KEY = 'gh_repos_v2';
const CACHE_TTL = 10 * 60 * 1000;

function el(tag, props, children) {
  const n = document.createElement(tag);
  if (props) {
    Object.keys(props).forEach((k) => {
      if (k === 'text') n.textContent = props[k];
      else if (k === 'class') n.className = props[k];
      else n.setAttribute(k, props[k]);
    });
  }
  (children || []).forEach((c) => c && n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
  return n;
}

function safeUrl(u) {
  try {
    const p = new URL(u);
    return p.protocol === 'https:' || p.protocol === 'http:' ? p.href : '';
  } catch (_) { return ''; }
}

function initRepos() {
  const list = document.getElementById('repoList');
  if (!list) return;

  const username = CONFIG.github.username;
  const loading = document.getElementById('loadingRepos');
  const skeleton = document.getElementById('repoSkeleton');
  const error = document.getElementById('errorRepos');
  const filtersEl = document.getElementById('projectFilters');
  const topicsEl = document.getElementById('projectTopics');
  const countEl = document.getElementById('projectCount');
  const searchEl = document.getElementById('repoSearch');
  const sortEl = document.getElementById('repoSort');
  const featuredSet = new Set(CONFIG.github.featuredRepos.map((n) => n.toLowerCase()));

  let allRepos = [];
  let activeLang = 'all';
  let activeTopic = null;
  let query = '';
  let sortKey = 'featured';

  if (loading) {
    loading.textContent = '';
    loading.append('fetching repos from ', el('span', { class: 'text-green', text: username }), ' ...');
  }

  function buildButtons(container, values, current, attr, allLabel, onPick) {
    if (!container) return;
    container.replaceChildren();
    const items = allLabel ? ['all', ...values] : values;
    items.forEach((v) => {
      const b = el('button', { class: 'filter-btn' + (v === current ? ' active' : ''), type: 'button', 'aria-pressed': v === current ? 'true' : 'false' });
      b.dataset[attr] = v;
      b.textContent = v === 'all' ? allLabel : v;
      b.addEventListener('click', () => {
        onPick(v);
      });
      container.appendChild(b);
    });
  }

  function syncPressed(container, attr, current) {
    if (!container) return;
    container.querySelectorAll('.filter-btn').forEach((b) => {
      const on = b.dataset[attr] === current;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  function renderFilters(repos) {
    const langs = [...new Set(repos.map((r) => r.language).filter(Boolean))].sort();
    buildButtons(filtersEl, langs, activeLang, 'lang', 'todos', (v) => {
      activeLang = v;
      syncPressed(filtersEl, 'lang', v);
      renderList();
    });
    const counts = {};
    repos.forEach((r) => (r.topics || []).forEach((t) => { counts[t] = (counts[t] || 0) + 1; }));
    const topics = Object.keys(counts).sort((a, b) => counts[b] - counts[a] || a.localeCompare(b)).slice(0, 12);
    if (topicsEl) {
      topicsEl.hidden = !topics.length;
      buildButtons(topicsEl, topics, activeTopic, 'topic', null, (v) => {
        activeTopic = activeTopic === v ? null : v;
        syncPressed(topicsEl, 'topic', activeTopic);
        renderList();
      });
    }
  }

  function sorted(repos) {
    const arr = repos.slice();
    const byDate = (a, b) => new Date(b.pushed_at) - new Date(a.pushed_at);
    if (sortKey === 'stars') arr.sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0) || byDate(a, b));
    else if (sortKey === 'updated') arr.sort(byDate);
    else if (sortKey === 'name') arr.sort((a, b) => a.name.localeCompare(b.name));
    else {
      arr.sort((a, b) => {
        const af = featuredSet.has(a.name.toLowerCase()) ? 1 : 0;
        const bf = featuredSet.has(b.name.toLowerCase()) ? 1 : 0;
        return af !== bf ? bf - af : byDate(a, b);
      });
    }
    return arr;
  }

  function renderList() {
    const q = query.trim().toLowerCase();
    const filtered = sorted(allRepos.filter((r) => {
      if (activeLang !== 'all' && r.language !== activeLang) return false;
      if (activeTopic && !(r.topics || []).includes(activeTopic)) return false;
      if (!q) return true;
      return [r.name, r.description, r.language, ...(r.topics || [])].some((f) => f && String(f).toLowerCase().includes(q));
    }));
    if (countEl) countEl.textContent = `# ${filtered.length} repositório${filtered.length !== 1 ? 's' : ''}`;
    list.replaceChildren(...filtered.map((r) => renderRepo(r, featuredSet)));
    if (!filtered.length) list.appendChild(el('p', { class: 'text-muted', text: 'Nenhum repositório corresponde aos filtros.' }));
  }

  if (searchEl) {
    let t;
    searchEl.addEventListener('input', () => {
      clearTimeout(t);
      t = setTimeout(() => { query = searchEl.value; renderList(); }, 150);
    });
  }
  if (sortEl) sortEl.addEventListener('change', () => { sortKey = sortEl.value; renderList(); });

  function done() {
    if (loading) loading.style.display = 'none';
    if (skeleton) skeleton.style.display = 'none';
  }

  getRepos(username)
    .then(({ data, stale, err }) => {
      done();
      if (!data.length) {
        showError(error, [`Nenhum repositório encontrado para ${username}`]);
        return;
      }
      allRepos = data;
      renderFilters(data);
      renderList();
      if (stale) {
        const rate = err && err.message === 'rate-limit';
        showError(error, [rate ? 'Limite da API do GitHub atingido; exibindo dados em cache.' : 'Falha ao atualizar; exibindo dados em cache.']);
      }
    })
    .catch((err) => {
      done();
      const rate = err.message === 'rate-limit';
      const gh = safeUrl(`https://github.com/${encodeURIComponent(username)}`);
      showError(error, [
        rate ? '[ERR] GitHub API rate limit exceeded. Tente novamente em alguns minutos.' : '[ERR] Falha ao comunicar com GitHub API. Verifique sua conexão.',
        el('br'),
        el('span', { class: 'text-muted text-sm' }, ['Ou acesse: ', el('a', { href: gh, target: '_blank', rel: 'noopener', text: username })]),
      ]);
    });
}

function readCache() {
  try {
    const c = JSON.parse(localStorage.getItem(CACHE_KEY));
    if (c && Array.isArray(c.data)) return c;
  } catch (_) {}
  return null;
}

async function getRepos(username) {
  const cached = readCache();
  if (cached && Date.now() - cached.ts < CACHE_TTL) return { data: cached.data };

  try {
    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=pushed`);
    if (!res.ok) {
      const limited = res.status === 429 || res.status === 403;
      throw new Error(limited ? 'rate-limit' : `HTTP ${res.status}`);
    }
    const raw = await res.json();
    const data = raw.map((r) => ({
      name: r.name, description: r.description, language: r.language, topics: r.topics || [],
      html_url: r.html_url, homepage: r.homepage, private: r.private, pushed_at: r.pushed_at,
      stargazers_count: r.stargazers_count, forks_count: r.forks_count,
    }));
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() })); } catch (_) {}
    return { data };
  } catch (err) {
    if (cached) return { data: cached.data, stale: true, err };
    throw err;
  }
}

function renderRepo(repo, featuredSet) {
  const isFeatured = featuredSet.has(repo.name.toLowerCase());
  const lang = repo.language || '';
  const date = (repo.pushed_at || '').slice(0, 10).split('-').reverse().join('/');
  const perms = repo.private ? 'd--------- ' : 'drwxr-xr ';
  const repoUrl = safeUrl(repo.html_url);
  const siteUrl = safeUrl(repo.homepage);

  const links = el('span', { class: 'repo-links' }, [
    repoUrl && el('a', { href: repoUrl, target: '_blank', rel: 'noopener', 'aria-label': `Repositório ${repo.name}`, text: '[repo]' }),
    siteUrl && el('a', { href: siteUrl, target: '_blank', rel: 'noopener', 'aria-label': `Site ${repo.name}`, text: '[site]' }),
  ]);

  const dot = el('span', { class: 'lang-dot' });
  dot.style.background = LANG_COLORS[lang] || '#0f1';

  return el('article', { class: 'project-item' + (isFeatured ? ' featured' : '') }, [
    el('div', { class: 'project-header' }, [
      el('div', null, [
        el('span', { class: 'perms', text: perms }),
        el('span', { class: 'owner', text: CONFIG.github.username }),
        ' ',
        el('span', { class: 'repo-name', text: repo.name }),
      ]),
      links,
    ]),
    repo.description && el('p', { class: 'project-desc', text: repo.description }),
    el('div', { class: 'project-meta' }, [
      lang && el('span', null, [dot, lang]),
      repo.stargazers_count ? el('span', { text: `★ ${repo.stargazers_count}` }) : null,
      repo.forks_count ? el('span', { text: `⑂ ${repo.forks_count}` }) : null,
      el('span', { text: `updated: ${date}` }),
    ]),
  ]);
}

function showError(target, parts) {
  if (!target) return;
  target.style.display = 'block';
  target.replaceChildren(...parts.map((p) => (typeof p === 'string' ? document.createTextNode(p) : p)));
}
