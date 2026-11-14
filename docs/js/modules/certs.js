'use strict';

function initCerts() {
  const list = document.getElementById('certList');
  if (!list) return;

  const countEl = document.getElementById('certCount');
  let activeFilter = 'all';
  const searchEl = document.getElementById('certSearch');
  const issuerEl = document.getElementById('certIssuer');
  const sortEl = document.getElementById('certSort');
  if (issuerEl) {
    [...new Set(CERTS_DATA.map((c) => c.issuer))].sort().forEach((i) => {
      const o = document.createElement('option'); o.value = i; o.textContent = i; issuerEl.appendChild(o);
    });
  }

  function render(filter) {
    const q = searchEl ? searchEl.value.trim().toLowerCase() : '';
    const issuer = issuerEl ? issuerEl.value : 'all';
    const dir = sortEl && sortEl.value === 'asc' ? 1 : -1;
    const filtered = CERTS_DATA
      .filter((c) => (filter === 'all' || c.category === filter) && (issuer === 'all' || c.issuer === issuer) &&
        (!q || (c.title + ' ' + c.issuer).toLowerCase().includes(q)))
      .sort((a, b) => dir * String(a.date).localeCompare(String(b.date)));
    if (countEl) countEl.textContent = `# ${filtered.length} certificado${filtered.length !== 1 ? 's' : ''} encontrado${filtered.length !== 1 ? 's' : ''}`;
    list.innerHTML = filtered.map((cert, i) => `
      <article class="cert-item reveal visible" style="animation-delay:${i * 40}ms">
        <div class="cert-header">
          <span class="cert-title">${escapeHtml(cert.title)}</span>
          ${cert.url ? `<a href="${escapeHtml(cert.url)}" target="_blank" rel="noopener" class="cert-link">[ver]</a>` : ''}
        </div>
        <div class="cert-meta">
          <span class="cert-issuer">${escapeHtml(cert.issuer)}</span>
          <span class="cert-date">${escapeHtml(cert.date)}</span>
          <span class="cert-cat tag">${escapeHtml(cert.category)}</span>
        </div>
      </article>`).join('');
  }

  document.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      render(activeFilter);
    });
  });

  [searchEl, issuerEl, sortEl].forEach((el) => {
    if (el) el.addEventListener(el === searchEl ? 'input' : 'change', () => render(activeFilter));
  });

  render(activeFilter);
}
