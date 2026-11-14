'use strict';

(function() {
  const API = CONFIG.chat.api;
  const msgs = document.getElementById('messages');
  const input = document.getElementById('input');
  const sendBtn = document.getElementById('send-btn');
  const sugg = document.getElementById('suggestions');
  let count = 0, MAX = 20;

  checkChatHealth()
    .then(() => {
      document.getElementById('chat-app').style.display = 'flex';
      if (!restore()) greet();
    })
    .catch(() => { document.querySelector('.page').innerHTML = '<p style="color:var(--color-muted);padding:40px;text-align:center">Serviço indisponível no momento.</p>'; });

  const KEY = 'chat-history';
  let history = [];
  function save() { try { sessionStorage.setItem(KEY, JSON.stringify({ history, count })); } catch (e) {} }
  function greet() { addMsg('bot', '> Assistente iniciado. Pergunte sobre experiência, projetos ou formação do Daniel.', true); }
  function restore() {
    try {
      const d = JSON.parse(sessionStorage.getItem(KEY) || 'null');
      if (!d || !d.history || !d.history.length) return false;
      count = d.count || 0;
      history = d.history.slice();
      history.forEach((m) => addMsg(m.type, m.text, false));
      if (count > 0) sugg.style.display = 'none';
      if (count >= MAX) { input.disabled = true; sendBtn.disabled = true; }
      return true;
    } catch (e) { return false; }
  }

  function addMsg(type, text, persist) {
    if (persist !== false) { history.push({ type, text }); save(); }
    const div = document.createElement('div');
    div.className = 'chat-msg ' + type;
    div.innerHTML = type === 'bot' ? fmt(text) : escapeHtml(text);
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    return div;
  }

  function fmt(t) {
    return escapeHtml(t).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>').replace(/^- (.+)/gm, '• $1').replace(/\n/g, '<br>');
  }

  function showTyping() {
    const div = document.createElement('div');
    div.className = 'chat-typing'; div.id = 'typing';
    div.innerHTML = '<span>.</span><span>.</span><span>.</span>';
    msgs.appendChild(div); msgs.scrollTop = msgs.scrollHeight;
  }

  function hideTyping() { const t = document.getElementById('typing'); if (t) t.remove(); }

  window.send = async function(text, isRetry) {
    if (count >= MAX) return;
    if (!isRetry) { count++; addMsg('user', text); }
    sugg.style.display = 'none';

    if (count === MAX - 2) addMsg('system', '// 2 perguntas restantes nesta sessão');
    if (count >= MAX) { addMsg('system', '// limite atingido — recarregue a página'); input.disabled = true; sendBtn.disabled = true; return; }

    showTyping(); input.disabled = true; sendBtn.disabled = true;
    try {
      const r = await fetch(API + 'api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: text }) });
      const data = await r.json();
      hideTyping();
      addMsg('bot', data.response || data.error || 'Erro ao obter resposta.');
    } catch {
      hideTyping();
      const el = addMsg('bot', '> erro: falha na conexão.', false);
      const b = document.createElement('button');
      b.className = 'retry-btn'; b.type = 'button'; b.textContent = 'tentar novamente';
      b.addEventListener('click', () => { el.remove(); send(text, true); });
      el.appendChild(b);
    }
    input.disabled = false; sendBtn.disabled = false; input.focus();
  };

  window.sendInput = function() { const t = input.value.trim(); if (t) { input.value = ''; input.style.height = 'auto'; send(t); } };
  input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); sendInput(); } });
  input.addEventListener('input', () => { input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 120) + 'px'; });
  document.getElementById('clear-btn').addEventListener('click', () => {
    history = []; count = 0; msgs.innerHTML = '';
    try { sessionStorage.removeItem(KEY); } catch (e) {}
    sugg.style.display = ''; input.disabled = false; sendBtn.disabled = false;
    greet(); input.focus();
  });
})();
