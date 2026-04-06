/* =============================================================
   app.js — Terminal username + Menu + GitHub API + commands
   ============================================================= */

(function () {
  'use strict';

  /* ========================
     Terminal Username
     ======================== */
  var LS_KEY = 'terminal_username';
  var USERNAME = localStorage.getItem(LS_KEY) || null;

  function getUsername() {
    return USERNAME || 'user';
  }

  function setUsername(name) {
    var n = (name || '').trim() || 'user';
    USERNAME = n;
    localStorage.setItem(LS_KEY, n);
    updateAllPrompts();
  }

  function updateAllPrompts() {
    var name = getUsername();
    document.querySelectorAll('.prompt-user').forEach(function (el) {
      el.textContent = name;
    });
  }

  function promptForUsername() {
    // Only remove an existing overlay if present
    var existing = document.getElementById('usernameOverlay');
    if (existing) existing.remove();

    var overlay = document.createElement('div');
    overlay.id = 'usernameOverlay';
    overlay.setAttribute('role', 'dialog');

    overlay.innerHTML =
      '<div class="uname-prompt">' +
        '<div class="uname-prompt__cmd">' +
          '<span class="prompt-user" style="color:var(--green);">user</span>' +
          '<span style="color:var(--muted);">@portfolio</span>' +
          '<span style="color:var(--muted);">:</span>' +
          '<span style="color:var(--cyan);">~</span>' +
          '<span style="color:var(--muted);">$</span>' +
          '<span style="color:var(--white);">read username</span>' +
        '</div>' +
        '<p class="uname-prompt__text">Digite seu nome de usuario (ENTER para "user")</p>' +
        '<div class="uname-prompt__input-line">' +
          '<span style="color:var(--green);">$</span> ' +
          '<input type="text" id="unameInput" autocomplete="off" spellcheck="false">' +
          '<span class="cursor"></span>' +
        '</div>' +
      '</div>';

    document.body.appendChild(overlay);

    var input = document.getElementById('unameInput');
    input.focus();

    var onKey = function (e) {
      if (e.key === 'Enter') {
        setUsername(input.value);
        input.removeEventListener('keydown', onKey);
        overlay.remove();
      }
      if (e.key === 'Escape') {
        setUsername('user');
        input.removeEventListener('keydown', onKey);
        overlay.remove();
      }
    };
    input.addEventListener('keydown', onKey);
  }

  /* ========================
     Terminal Command Bar (Home only)
     ======================== */
  function buildCommandBar(term) {
    var bar = document.createElement('div');
    bar.id = 'cmdBar';
    bar.innerHTML =
      '<div class="sep-line"><span style="color:var(--muted);">─────────────────────────────────────────────</span></div>' +
      '<div class="term-line">' +
        '<span style="color:var(--muted);"># comandos disponiveis: whoami, mudar usuario, help, clear</span>' +
      '</div>' +
      '<div class="cmd-output" id="cmdOutput"></div>' +
      '<div class="cmd-input-line">' +
        '<span class="prompt-user">' + getUsername() + '</span>' +
        '<span style="color:var(--muted);">@portfolio:</span>' +
        '<span style="color:var(--cyan);">~</span>' +
        '<span style="color:var(--muted);">$</span> ' +
        '<input type="text" id="cmdInput" autocomplete="off" spellcheck="false" placeholder="comando...">' +
        '<span class="cursor"></span>' +
      '</div>';
    term.appendChild(bar);
  }

  function setupCommandBar() {
    var term = document.querySelector('.term');
    if (!term) return;

    buildCommandBar(term);

    var cmdInput = document.getElementById('cmdInput');
    var cmdOutput = document.getElementById('cmdOutput');
    if (!cmdInput || !cmdOutput) return;

    var COMMANDS = {
      help: function () {
        return (
          'Comandos disponiveis:\n' +
          '  whoami            — exibe o usuario atual\n' +
          '  mudar usuario     — altera o usuario do terminal\n' +
          '  help              — mostra esta mensagem\n' +
          '  clear             — limpa a saida'
        );
      },
      whoami: function () {
        return getUsername();
      },
      'mudar usuario': function () {
        var old = getUsername();
        promptForUsername();
        // After prompt resolves, update the command bar prompt too
        // We poll since setUsername is called from prompt callback
        var savedUsername = USERNAME;
        var check = setInterval(function () {
          if (USERNAME !== savedUsername) {
            clearInterval(check);
            // Update the command bar's prompt
            var pu = cmdInput.parentElement.querySelector('.prompt-user');
            if (pu) pu.textContent = getUsername();
            return getUsername() + ' (atualizado)';
          }
        }, 100);
        // Timeout fallback
        setTimeout(function () { clearInterval(check); }, 5000);
        return 'Alterando... (novo usuario sera aplicado)';
      },
      clear: function () {
        cmdOutput.textContent = '';
        return null;
      }
    };

    cmdInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        var cmd = cmdInput.value.trim().toLowerCase();
        cmdInput.value = '';

        if (!cmd) return;

        var line = '<span class="cmd-line">' +
          '<span class="prompt-user">' + getUsername() + '</span>' +
          '<span style="color:var(--muted);">@portfolio:</span>' +
          '<span style="color:var(--cyan);">~</span>' +
          '<span style="color:var(--muted);">$</span> ' +
          cmd +
          '</span>';

        var output = null;

        // Try exact match
        if (COMMANDS[cmd]) {
          output = COMMANDS[cmd]();
        } else {
          // Try partial match for "mudar usuario"
          if (cmd.indexOf('mudar') === 0) {
            output = COMMANDS['mudar usuario']();
          } else {
            output = 'comando nao encontrado: "' + cmd + '"\nDigite "help" para ver os comandos.';
          }
        }

        if (output !== null) {
          cmdOutput.innerHTML += line + '\n' + escapeHtml(output) + '\n\n';
        } else {
          cmdOutput.innerHTML += line + '\n';
        }

        // Update prompt user after whoami/change
        var pu = cmdInput.parentElement.querySelector('.prompt-user');
        if (pu) pu.textContent = getUsername();

        cmdOutput.scrollTop = cmdOutput.scrollHeight;
      }
    });
  }

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
  }

  /* ========================
     Init username on all pages
     ======================== */
  if (USERNAME) {
    updateAllPrompts();
  } else {
    promptForUsername();
    // Will be called after user submits (from inside promptForUsername)
  }

  /* ========================
     Menu (mobile)
     ======================== */
  var menuBtn = document.getElementById('menuBtn');
  var sideNav = document.getElementById('sideNav');

  if (menuBtn && sideNav) {
    menuBtn.addEventListener('click', function () {
      sideNav.classList.toggle('open');
      menuBtn.textContent = sideNav.classList.contains('open') ? 'close' : 'menu';
    });
  }

  /* ========================
     Language colors (GitHub)
     ======================== */
  var langColors = {
    'C#': '#239120',
    'Python': '#3572A5',
    'JavaScript': '#f1e05a',
    'TypeScript': '#2b7489',
    'Go': '#00ADD8',
    'C': '#555555',
    'C++': '#f34b7d',
    'HTML': '#e34c26',
    'CSS': '#563d7c',
    'Shell': '#89e051',
    'Rust': '#dea584',
    'Java': '#b07219',
    'Lua': '#000080',
    'Dart': '#00B4AB',
    'Ruby': '#701516',
    'PHP': '#4F5D95',
    'Kotlin': '#A97BFF',
    'Swift': '#F05138',
    'Haskell': '#5e5086',
    'Elixir': '#6e4a7e',
    'Vue': '#41b883'
  };

  function langColor(lang) {
    return langColors[lang] || '#00ff41';
  }

  /* ========================
     Helper: format date
     ======================== */
  function formatDate(dateStr) {
    var d = new Date(dateStr);
    var months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun',
                  'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    var day = d.getDate();
    var mon = months[d.getMonth()];
    var year = d.getFullYear();
    return day + ' ' + mon + ' ' + year;
  }

  /* ========================
     Helper: render project card
     ======================== */
  function renderRepo(repo, index, featured) {
    var desc = repo.description || '';
    var lang = repo.language || '';
    var stars = repo.stargazers_count || 0;
    var forks = repo.forks_count || 0;
    var updated = formatDate(repo.updated_at);
    var featuredClass = featured ? ' featured' : '';
    var langDotStyle = 'background:' + langColor(lang) + ';';
    var delay = 'r' + Math.min(index, 5);

    return (
      '<div class="project-item' + featuredClass + ' reveal ' + delay + '">' +
        '<div class="project-header">' +
          '<div>' +
            '<span class="perms">' + (repo.private ? 'd--------- ' : 'drwxr-xr ') + '</span>' +
            '<span class="owner">' + (CONFIG ? CONFIG.githubUsername : 'user') + '</span>' +
            '<span class="repo-name">' + repo.name + '</span>' +
          '</div>' +
          '<span class="repo-links">' +
            (repo.html_url ? '<a href="' + repo.html_url + '" target="_blank" rel="noopener">[repo]</a>' : '') +
            (repo.homepage ? ' <a href="' + repo.homepage + '" target="_blank" rel="noopener">[site]</a>' : '') +
          '</span>' +
        '</div>' +
        (desc ? '<p class="project-desc">' + desc + '</p>' : '') +
        '<div class="project-meta">' +
          (lang ? '<span><span class="lang-dot" style="' + langDotStyle + '"></span>' + lang + '</span>' : '') +
          (stars ? '<span>★ ' + stars + '</span>' : '') +
          (forks ? '<span>⑂ ' + forks + '</span>' : '') +
          '<span>updated: ' + updated + '</span>' +
        '</div>' +
      '</div>'
    );
  }

  /* ========================
     Fetch GitHub repos
     ======================== */
  var loadingEl = document.getElementById('loadingRepos');
  var errorEl = document.getElementById('errorRepos');
  var repoListEl = document.getElementById('repoList');

  if (repoListEl && typeof CONFIG !== 'undefined' && CONFIG.githubUsername) {
    var username = CONFIG.githubUsername;

    if (loadingEl) {
      loadingEl.innerHTML = 'fetching repos from <span style="color:var(--green);">' + username + '</span> ...';
    }

    fetch('https://api.github.com/users/' + CONFIG.githubUsername + '/repos?per_page=100&sort=pushed')
      .then(function (response) {
        if (!response.ok) {
          if (response.status === 403) {
            throw new Error('rate limit exceeded');
          }
          throw new Error('HTTP ' + response.status);
        }
        return response.json();
      })
      .then(function (repos) {
        if (loadingEl) loadingEl.style.display = 'none';

        if (!repos || repos.length === 0) {
          if (errorEl) {
            errorEl.style.display = 'block';
            errorEl.innerHTML = 'Nenhum repositorio encontrado para <code>' + CONFIG.githubUsername + '</code>';
          }
          return;
        }

        var featured = CONFIG.featuredRepos || [];
        var featuredLower = featured.map(function (f) { return f.toLowerCase(); });

        function isFeatured(name) {
          return featuredLower.indexOf(name.toLowerCase()) > -1;
        }

        repos.sort(function (a, b) {
          var af = isFeatured(a.name) ? 1 : 0;
          var bf = isFeatured(b.name) ? 1 : 0;
          if (af !== bf) return bf - af;
          return new Date(b.pushed_at) - new Date(a.pushed_at);
        });

        var html = '';
        for (var i = 0; i < repos.length; i++) {
          html += renderRepo(repos[i], i, isFeatured(repos[i].name));
        }
        repoListEl.innerHTML = html;
      })
      .catch(function (err) {
        if (loadingEl) loadingEl.style.display = 'none';
        if (errorEl) {
          errorEl.style.display = 'block';
          if (err.message === 'rate limit exceeded') {
            errorEl.innerHTML = '[ERR] GitHub API rate limit exceeded. Tente novamente em alguns minutos.' +
              '<br><span style="color:var(--muted);font-size:12px;">Ou acesse diretamente: <a href="https://github.com/' + username + '" target="_blank">' + username + '</a></span>';
          } else {
            errorEl.innerHTML = '[ERR] Falha ao comunicar com GitHub API. <br><span style="color:var(--muted);">Verifique sua conexão com a internet.</span>';
          }
        }
      });
  }

  /* ========================
     Setup command bar on Home
     ======================== */
  setupCommandBar();

})();
