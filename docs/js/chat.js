'use strict';

(function() {
  const API = 'https://daniel-chat-api.vercel.app/';
  const msgs = document.getElementById('messages');
  const input = document.getElementById('input');
  const sendBtn = document.getElementById('send-btn');
  const sugg = document.getElementById('suggestions');
  let count = 0, MAX = 20;

  const ctrl = new AbortController();
  setTimeout(() => ctrl.abort(), 3000);
  fetch(API + 'api/health', { signal: ctrl.signal })
    .then(r => { if (r.ok) return r.json(); throw new Error(); })
    .then(() => {
      document.getElementById('chat-app').style.display = 'flex';
      addMsg('bot', '> Assistente iniciado. Pergunte sobre experiência, projetos ou formação do Daniel.');
    })
    .catch(() => { document.querySelector('.page').innerHTML = '<p style="color:var(--color-muted);padding:40px;text-align:center">Serviço indisponível no momento.</p>'; });

  function addMsg(type, text) {
    const div = document.createElement('div');
    div.className = 'chat-msg ' + type;
    div.innerHTML = type === 'bot' ? fmt(text) : esc(text);
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function fmt(t) {
    return esc(t).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>').replace(/^- (.+)/gm, '• $1').replace(/\n/g, '<br>');
  }

  function esc(t) { const d = document.createElement('div'); d.textContent = t; return d.innerHTML; }

  function showTyping() {
    const div = document.createElement('div');
    div.className = 'chat-typing'; div.id = 'typing';
    div.innerHTML = '<span>.</span><span>.</span><span>.</span>';
    msgs.appendChild(div); msgs.scrollTop = msgs.scrollHeight;
  }

  function hideTyping() { const t = document.getElementById('typing'); if (t) t.remove(); }

  window.send = async function(text) {
    if (count >= MAX) return;
    count++;
    sugg.style.display = 'none';
    addMsg('user', text);

    if (count === MAX - 2) addMsg('system', '// 2 perguntas restantes nesta sessão');
    if (count >= MAX) { addMsg('system', '// limite atingido — recarregue a página'); input.disabled = true; sendBtn.disabled = true; return; }

    showTyping(); input.disabled = true; sendBtn.disabled = true;
    try {
      const r = await fetch(API + 'api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: text }) });
      const data = await r.json();
      hideTyping();
      addMsg('bot', data.response || data.error || 'Erro ao obter resposta.');
    } catch { hideTyping(); addMsg('bot', '> erro: falha na conexão. tente novamente.'); }
    input.disabled = false; sendBtn.disabled = false; input.focus();
  };

  window.sendInput = function() { const t = input.value.trim(); if (t) { input.value = ''; send(t); } };
  input.addEventListener('keydown', e => { if (e.key === 'Enter') sendInput(); });
})();
