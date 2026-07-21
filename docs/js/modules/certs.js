'use strict';

function initCerts() {
  const list = document.getElementById('certList');
  if (!list) return;

  const countEl = document.getElementById('certCount');
  let activeFilter = 'all';

  function render(filter) {
    const filtered = filter === 'all' ? CERTS_DATA : CERTS_DATA.filter((c) => c.category === filter);
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

  render(activeFilter);
}
