(function(){
  var D=document;

  /* Command bar (home only) */
  function setupCmdBar(){
    var term=D.querySelector('.term');if(!term)return;
    var bar=D.createElement('div');bar.id='cmdBar';
    bar.innerHTML='<div class="sep-line"><span style="color:var(--muted)">─────────────────────────────────────────────</span></div><div class="term-line"><span style="color:var(--muted)"># comandos disponiveis: whoami, help, clear</span></div><div class="cmd-output" id="cmdO"></div><div class="cmd-input-line"><span style="color:var(--green);font-weight:700">user</span><span style="color:var(--muted)">@portfolio:</span><span style="color:var(--cyan)">~</span><span style="color:var(--muted)">$</span> <input type="text" id="cmdI" autocomplete="off" spellcheck="false" placeholder="comando..."><span class="cursor"></span></div>';
    term.appendChild(bar);

    var inp=D.getElementById('cmdI'),out=D.getElementById('cmdO');if(!inp||!out)return;

    var CMDS={help:function(){return'Comandos disponiveis:\n  whoami  — exibe o usuario atual\n  help    — mostra esta mensagem\n  clear   — limpa a saida'},whoami:function(){return'user'},clear:function(){out.textContent='';return null}};

    inp.addEventListener('keydown',function(e){
      if(e.key!=='Enter')return;e.preventDefault();
      var c=inp.value.trim().toLowerCase();inp.value='';if(!c)return;
      var line='<span class="cmd-line"><span style="color:var(--green);font-weight:700">user</span><span style="color:var(--muted)">@portfolio:</span><span style="color:var(--cyan)">~</span><span style="color:var(--muted)">$</span> '+c+'</span>';
      var h=CMDS[c]||null;
      var o=h?h():'comando nao encontrado: "'+c+'"\nDigite "help" para ver os comandos.';
      out.innerHTML+=(o!==null?line+'\n'+esc(o)+'\n\n':line+'\n');
      out.scrollTop=out.scrollHeight;
    });
  }

  function esc(t){var d=D.createElement('div');d.appendChild(D.createTextNode(t));return d.innerHTML}

  function render(r,i,f){
    var d=r.description||'',la=r.language||'',st=r.stargazers_count||0,fk=r.forks_count||0;
    return '<div class="project-item'+(f?' featured':'')+' reveal r'+Math.min(i,5)+'"><div class="project-header"><div><span class="perms">'+(r.private?'d--------- ':'drwxr-xr ')+'</span><span class="owner">'+CONFIG.githubUsername+'</span><span class="repo-name">'+r.name+'</span></div><span class="repo-links">'+(r.html_url?'<a href="'+r.html_url+'" target="_blank" rel="noopener">[repo]</a>':'')+(r.homepage?' <a href="'+r.homepage+'" target="_blank" rel="noopener">[site]</a>':'')+'</span></div>'+(d?'<p class="project-desc">'+d+'</p>':'')+'<div class="project-meta">'+(la?'<span><span class="lang-dot" style="background:'+(LC[la]||'#0f1')+'"></span>'+la+'</span>':'')+(st?'<span>\u2605 '+st+'</span>':'')+(fk?'<span>\u2442 '+fk+'</span>':'')+'<span>updated: '+r.pushed_at.split('-').reverse().join('/')+'</span></div></div>';
  }

  var LC={'C#':'#239120','Python':'#3572A5','JavaScript':'#f1e05a','TypeScript':'#2b7489','Go':'#00ADD8','C':'#555','C++':'#f34b7d','HTML':'#e34c26','CSS':'#563d7c','Shell':'#89e051','Rust':'#dea584','Java':'#b07219','Lua':'#000080','Dart':'#00B4AB','Ruby':'#701516','PHP':'#4F5D95','Kotlin':'#A97BFF','Swift':'#F05138','Haskell':'#5e5086','Elixir':'#6e4a7e','Vue':'#41b883'};

  var ld=D.getElementById('loadingRepos'),er=D.getElementById('errorRepos'),rl=D.getElementById('repoList');
  if(rl&&typeof CONFIG!=='undefined'&&CONFIG.githubUsername){
    var u=CONFIG.githubUsername;
    if(ld)ld.innerHTML='fetching repos from <span style="color:var(--green)">'+u+'</span> ...';
    fetch('https://api.github.com/users/'+u+'/repos?per_page=100&sort=pushed')
    .then(function(r){if(!r.ok)throw new Error(r.status===403?'rate limit exceeded':'HTTP '+r.status);return r.json()})
    .then(function(repos){
      if(ld)ld.style.display='none';
      if(!repos||!repos.length){if(er){er.style.display='block';er.innerHTML='Nenhum repositorio encontrado para <code>'+u+'</code>'}return}
      var ft=(CONFIG.featuredRepos||[]).map(function(f){return f.toLowerCase()}),fmap={};ft.forEach(function(f){fmap[f]=1});
      repos.sort(function(a,b){var af=fmap[a.name.toLowerCase()]?1:0,bf=fmap[b.name.toLowerCase()]?1:0;if(af!==bf)return bf-af;return new Date(b.pushed_at)-new Date(a.pushed_at)});
      var h='';for(var i=0;i<repos.length;i++)h+=render(repos[i],i,fmap[repos[i].name.toLowerCase()]);
      rl.innerHTML=h;
    })
    .catch(function(e){
      if(ld)ld.style.display='none';
      if(er){er.style.display='block';er.innerHTML=e.message==='rate limit exceeded'?'[ERR] GitHub API rate limit exceeded. Tente novamente em alguns minutos.<br><span style="color:var(--muted);font-size:12px">Ou acesse diretamente: <a href="https://github.com/'+u+'" target="_blank">'+u+'</a></span>':'[ERR] Falha ao comunicar com GitHub API. <br><span style="color:var(--muted)">Verifique sua conexão com a internet.</span>'}
    });
  }

  /* Menu (mobile) */
  var mb=D.getElementById('menuBtn'),sv=D.getElementById('sideNav');
  if(mb&&sv)mb.addEventListener('click',function(){sv.classList.toggle('open');mb.textContent=sv.classList.contains('open')?'close':'menu'});

  setupCmdBar();
})();
