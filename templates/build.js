// Gera docs/*.html a partir de templates/pages.json + templates/pages/*.main.html.
// Rode `npm run build` (ou `node templates/build.js`) depois de editar qualquer
// arquivo em templates/ — o GitHub Pages serve docs/ como está, sem build próprio.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const pages = JSON.parse(fs.readFileSync(path.join(__dirname, 'pages.json'), 'utf8'));
const noscriptNav = fs.readFileSync(path.join(__dirname, 'partials/noscript-nav.html'), 'utf8').replace(/\n$/, '');

function renderHead(page) {
  const lines = [
    '  <meta charset="UTF-8">',
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
    `  <title>${page.title}</title>`,
    `  <meta name="description" content="${page.desc}">`,
    '  <meta name="theme-color" content="#0d1117">',
    '  <link rel="manifest" href="manifest.webmanifest">',
  ];
  if (page.noindex) lines.push('  <meta name="robots" content="noindex">');

  if (page.seo) {
    const ogDesc = page.ogDesc || page.desc;
    lines.push(
      '  <meta name="author" content="Daniel Hoffmann">',
      `  <link rel="canonical" href="${page.canonical}">`,
      `  <meta property="og:title" content="${page.title}">`,
      `  <meta property="og:description" content="${ogDesc}">`,
      '  <meta property="og:type" content="website">',
      `  <meta property="og:url" content="${page.canonical}">`,
    );
    if (page.ogLocale) lines.push('  <meta property="og:locale" content="pt_BR">');
    lines.push(
      '  <meta property="og:image" content="https://danielhoffmanno.github.io/DanielHoffmannO/assets/og-card.svg">',
      '  <meta name="twitter:card" content="summary_large_image">',
      `  <meta name="twitter:title" content="${page.title}">`,
      `  <meta name="twitter:description" content="${ogDesc}">`,
      '  <meta name="twitter:image" content="https://danielhoffmanno.github.io/DanielHoffmannO/assets/og-card.svg">',
    );
  }

  if (page.jsonLd) {
    lines.push('  <script type="application/ld+json">\n  ' + JSON.stringify(page.jsonLd, null, 2).replace(/\n/g, '\n  ') + '\n  </script>');
  }

  lines.push(
    "  <link rel=\"icon\" href=\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⟩</text></svg>\">",
    '  <link rel="preconnect" href="https://fonts.googleapis.com">',
    '  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
    '  <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap">',
    '  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">',
    '  <link rel="stylesheet" href="css/style.css">',
  );

  return lines.join('\n');
}

for (const page of pages) {
  const mainHtml = fs.readFileSync(path.join(__dirname, 'pages', page.file.replace('.html', '.main.html')), 'utf8')
    .replace(/\n$/, '')
    .replace('<main class="page">', '<main class="page" id="main" tabindex="-1">');
  const scripts = page.scripts.map((s) => `  <script src="${s}" defer></script>`).join('\n');

  const html = `<!DOCTYPE html>
<html lang="pt-br">
<head>
${renderHead(page)}
</head>
<body data-page="${page.dataPage}" data-path="${page.dataPath}">
  <a class="skip-link" href="#main">Pular para o conteúdo</a>
${noscriptNav}

${mainHtml}

${scripts}
  <script>if ('serviceWorker' in navigator && location.protocol === 'https:') window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });</script>
</body>
</html>
`;

  fs.writeFileSync(path.join(ROOT, 'docs', page.file), html);
  console.log('built', page.file);
}

// sitemap.xml com lastmod (data do build)
const today = new Date().toISOString().slice(0, 10);
const urls = pages.filter((p) => p.seo && !p.noindex);
const prio = { 'index.html': '1.0', 'sobre.html': '0.8', 'projetos.html': '0.8', 'certificados.html': '0.7', 'contato.html': '0.6' };
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((p) => `  <url>
    <loc>${p.canonical}</loc>
    <lastmod>${today}</lastmod>
    <priority>${prio[p.file] || '0.5'}</priority>
  </url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(ROOT, 'docs', 'sitemap.xml'), sitemap);
console.log('built sitemap.xml');
