/* ============================================
   app-data.js — "base de datos" compartida (mock)
   Guarda en localStorage: qué apps existen, si
   están encendidas/apagadas, y sus logs. Así el
   estado se mantiene igual sin importar en qué
   vista estés (dashboard, logs, build).
   ============================================ */

const APPS_KEY = 'dp_apps';
const STATES_KEY = 'dp_app_states';
const LOGS_KEY = 'dp_logs';

const DEFAULT_APPS = [
  { key: 'web', name: 'Mi Página Web', desc: 'Servidor web (nginx)' },
  { key: 'db',  name: 'Base de Datos', desc: 'PostgreSQL 16' },
  { key: 'bot', name: 'Bot de Telegram', desc: 'Aplicación Node.js' },
];
const DEFAULT_STATES = { web: 'on', db: 'off', bot: 'on' };
const DEFAULT_LOGS = {
  web: [
    { time: '10:32', text: 'Servidor iniciado en el puerto 80', type: null },
    { time: '10:33', text: 'Visita recibida desde 192.168.1.20', type: null },
    { time: '10:35', text: 'Archivo /index.html enviado', type: null },
    { time: '10:36', text: '✅ Todo funciona correctamente', type: 'ok' },
  ],
  db: [
    { time: '09:58', text: 'Contenedor detenido manualmente', type: null },
    { time: '09:58', text: '⚠️ No se guardaron cambios pendientes', type: 'warn' },
  ],
  bot: [
    { time: '11:02', text: 'Bot conectado a Telegram', type: null },
    { time: '11:05', text: 'Mensaje recibido de @usuario_ejemplo', type: null },
    { time: '11:06', text: '✅ Respuesta enviada correctamente', type: 'ok' },
  ],
};

function _init() {
  if (!localStorage.getItem(APPS_KEY)) localStorage.setItem(APPS_KEY, JSON.stringify(DEFAULT_APPS));
  if (!localStorage.getItem(STATES_KEY)) localStorage.setItem(STATES_KEY, JSON.stringify(DEFAULT_STATES));
  if (!localStorage.getItem(LOGS_KEY)) localStorage.setItem(LOGS_KEY, JSON.stringify(DEFAULT_LOGS));
}
_init();

function getApps() {
  return JSON.parse(localStorage.getItem(APPS_KEY) || '[]');
}
function getAppState(key) {
  const states = JSON.parse(localStorage.getItem(STATES_KEY) || '{}');
  return states[key];
}
function setAppState(key, state) {
  const states = JSON.parse(localStorage.getItem(STATES_KEY) || '{}');
  states[key] = state;
  localStorage.setItem(STATES_KEY, JSON.stringify(states));
}
function getLogs(key) {
  const logs = JSON.parse(localStorage.getItem(LOGS_KEY) || '{}');
  return logs[key] || [];
}
function addLog(key, text, type = null) {
  const logs = JSON.parse(localStorage.getItem(LOGS_KEY) || '{}');
  if (!logs[key]) logs[key] = [];
  const time = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  logs[key].push({ time, text, type });
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
}
function slugify(str) {
  return (str || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || ('app-' + Date.now());
}
function addApp(name, desc) {
  const apps = getApps();
  let key = slugify(name);
  if (apps.some(a => a.key === key)) key = key + '-' + Date.now().toString().slice(-4);
  apps.push({ key, name, desc });
  localStorage.setItem(APPS_KEY, JSON.stringify(apps));
  setAppState(key, 'on');
  addLog(key, `${name} construida y desplegada`, 'ok');
  return key;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* Dibuja los botones de una tarjeta según su estado y conecta las acciones */
function renderCardActions(card, state) {
  card.dataset.state = state;
  const key = card.dataset.app;
  const statusEl = card.querySelector('.status');
  const actionsEl = card.querySelector('.card-actions');

  if (state === 'on') {
    statusEl.textContent = '● Encendida';
    statusEl.className = 'status status-on';
    actionsEl.innerHTML = `
      <button class="btn btn-danger" data-action="stop">⏹ Detener</button>
      <button class="btn btn-secondary" data-action="restart">🔄 Reiniciar</button>
      <button class="btn btn-ghost" data-action="logs">📜 Ver logs</button>
    `;
  } else {
    statusEl.textContent = '● Apagada';
    statusEl.className = 'status status-off';
    actionsEl.innerHTML = `
      <button class="btn btn-primary" data-action="start">▶ Iniciar</button>
      <button class="btn btn-ghost" data-action="logs">📜 Ver logs</button>
    `;
  }

  actionsEl.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => handleCardAction(card, btn.dataset.action));
  });
}

function handleCardAction(card, action) {
  const key = card.dataset.app;
  const name = card.querySelector('h3').textContent;

  if (action === 'start') {
    setAppState(key, 'on');
    renderCardActions(card, 'on');
    addLog(key, `${name} iniciada`, 'ok');
    notify(`▶ ${name} iniciada`, 'ok');
  } else if (action === 'stop') {
    setAppState(key, 'off');
    renderCardActions(card, 'off');
    addLog(key, `${name} detenida manualmente`, 'warn');
    notify(`⏹ ${name} detenida`, 'warn');
  } else if (action === 'restart') {
    addLog(key, `Reiniciando ${name}…`, null);
    notify(`🔄 Reiniciando ${name}…`);
    setTimeout(() => {
      addLog(key, `${name} reiniciada correctamente`, 'ok');
      notify(`✅ ${name} reiniciada`, 'ok');
    }, 600);
  } else if (action === 'logs') {
    window.location.href = `logs.html?app=${encodeURIComponent(key)}`;
  }
}
