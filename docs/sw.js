// Service worker simples: cache do shell estático (stale-while-revalidate).
// Chamadas cross-origin (API, fontes) e não-GET passam direto pela rede.
const CACHE = 'portfolio-v1';
const SHELL = ['./', 'index.html', 'sobre.html', 'projetos.html', 'certificados.html', 'contato.html', 'chat.html', '404.html', 'css/style.css', 'js/main.js', 'assets/icon.svg'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => Promise.allSettled(SHELL.map((u) => c.add(u)))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(
    caches.open(CACHE).then(async (c) => {
      const hit = await c.match(req, { ignoreSearch: true });
      const net = fetch(req).then((r) => { if (r.ok) c.put(req, r.clone()); return r; }).catch(() => hit || c.match('404.html'));
      return hit || net;
    })
  );
});
