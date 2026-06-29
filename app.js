/* ============================================================
   DOCKER CONTROL PANEL — app.js
   Lógica: preview de comandos, modal de confirmación,
   llamadas al backend (fetch) con output simulado.
   ============================================================ */

/* ── BACKEND URL ── */
const API_BASE = 'http://localhost:5000'; // Cambiar por tu endpoint real

/* ── Navegación entre secciones ── */
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.panel-section');
const sectionTitle = document.getElementById('section-title');

const SECTION_LABELS = {
  containers: 'Contenedores',
  build:      'Build',
  logs:       'Logs',
};

navItems.forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    const target = item.dataset.section;

    navItems.forEach(n => n.classList.remove('active'));
    sections.forEach(s => s.classList.remove('active'));

    item.classList.add('active');
    document.getElementById('section-' + target).classList.add('active');
    sectionTitle.textContent = SECTION_LABELS[target] || target;
  });
});

/* ── Utilidad: construir comando ── */
function buildContainerCmd() {
  const name   = document.getElementById('cnt-name').value.trim() || '<contenedor>';
  const action = document.getElementById('cnt-action').value;
  return `docker ${action} ${name}`;
}

function buildBuildCmd() {
  const tag    = document.getElementById('build-tag').value.trim()  || '<tag>';
  const ctx    = document.getElementById('build-ctx').value.trim()  || '<contexto>';
  const file   = document.getElementById('build-file').value.trim();
  const nocache = document.getElementById('build-nocache').checked;
  const pull    = document.getElementById('build-pull').checked;
  const rm      = document.getElementById('build-rm').checked;

  let cmd = 'docker build';
  if (rm)      cmd += ' --rm';
  if (nocache) cmd += ' --no-cache';
  if (pull)    cmd += ' --pull';
  if (file)    cmd += ` -f ${file}`;
  cmd += ` -t ${tag} ${ctx}`;
  return cmd;
}

function buildLogsCmd() {
  const name = document.getElementById('log-name').value.trim()   || '<contenedor>';
  const tail = document.getElementById('log-tail').value.trim();
  const since = document.getElementById('log-since').value.trim();
  const until = document.getElementById('log-until').value.trim();
  const ts    = document.getElementById('log-timestamps').checked;
  const follow = document.getElementById('log-follow').checked;

  let cmd = 'docker logs';
  if (ts)     cmd += ' -t';
  if (follow) cmd += ' -f';
  if (tail)   cmd += ` --tail ${tail}`;
  if (since)  cmd += ` --since ${since}`;
  if (until)  cmd += ` --until ${until}`;
  cmd += ` ${name}`;
  return cmd;
}

/* ── Preview en tiempo real ── */
function wirePreview(inputIds, builderFn, previewId) {
  const update = () => {
    document.getElementById(previewId).textContent = builderFn();
  };
  inputIds.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input',  update);
    el.addEventListener('change', update);
  });
}

wirePreview(
  ['cnt-name', 'cnt-action'],
  buildContainerCmd,
  'cnt-cmd-preview'
);

wirePreview(
  ['build-tag', 'build-ctx', 'build-file', 'build-nocache', 'build-pull', 'build-rm'],
  buildBuildCmd,
  'build-cmd-preview'
);

wirePreview(
  ['log-name', 'log-tail', 'log-since', 'log-until', 'log-timestamps', 'log-follow'],
  buildLogsCmd,
  'log-cmd-preview'
);

/* ── Modal de confirmación ── */
let pendingAction = null;

function showModal(cmd, actionFn) {
  document.getElementById('modal-cmd-text').textContent = cmd;
  document.getElementById('confirm-modal').style.display = 'flex';
  document.getElementById('modal-confirm-btn').onclick = () => {
    closeModal();
    actionFn();
  };
}

function closeModal() {
  document.getElementById('confirm-modal').style.display = 'none';
}

document.getElementById('confirm-modal').addEventListener('click', e => {
  if (e.target === document.getElementById('confirm-modal')) closeModal();
});

/* ── Mostrar output ── */
function showOutput(wrapId, textId, text, isError = false) {
  const wrap = document.getElementById(wrapId);
  const block = document.getElementById(textId);
  wrap.style.display = 'block';
  block.innerHTML = isError
    ? `<span class="out-error">${escapeHtml(text)}</span>`
    : colorizeOutput(text);
  block.scrollTop = block.scrollHeight;
}

function closeOutput(wrapId) {
  document.getElementById(wrapId).style.display = 'none';
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function colorizeOutput(raw) {
  return raw.split('\n').map(line => {
    const safe = escapeHtml(line);
    if (/error|ERROR|failed|FAILED/.test(line))  return `<span class="out-error">${safe}</span>`;
    if (/warning|WARN|warn/.test(line))           return `<span class="out-warn">${safe}</span>`;
    if (/Step \d+|---\s|Sending build|Successfully/.test(line)) return `<span class="out-step">${safe}</span>`;
    return safe;
  }).join('\n');
}

/* ── Llamada al backend ──
   El backend debe exponer:
     POST /run
     body: { command: "docker start mycontainer" }
     response: { stdout: "...", stderr: "...", exitCode: 0 }
   
   Mientras no haya backend, se simula el output. */
async function callBackend(command) {
  try {
    const res = await fetch(`${API_BASE}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    return {
      ok: data.exitCode === 0,
      text: data.stdout || data.stderr || '(sin output)',
    };
  } catch (err) {
    /* ── Modo demo: simular respuesta cuando no hay backend ── */
    return simulateOutput(command);
  }
}

function simulateOutput(cmd) {
  const now = new Date().toISOString();
  if (cmd.startsWith('docker start')) {
    const name = cmd.split(' ').pop();
    return { ok: true,  text: `${name}\n[DEMO] Contenedor iniciado correctamente.` };
  }
  if (cmd.startsWith('docker stop')) {
    const name = cmd.split(' ').pop();
    return { ok: true,  text: `${name}\n[DEMO] Contenedor detenido.` };
  }
  if (cmd.startsWith('docker restart')) {
    const name = cmd.split(' ').pop();
    return { ok: true,  text: `${name}\n[DEMO] Reiniciando contenedor...` };
  }
  if (cmd.startsWith('docker rm')) {
    const name = cmd.split(' ').pop();
    return { ok: true,  text: `[DEMO] Contenedor "${name}" eliminado.` };
  }
  if (cmd.startsWith('docker inspect')) {
    return { ok: true, text: `[DEMO] [\n  {\n    "Id": "abc123...",\n    "State": { "Status": "running" },\n    "NetworkSettings": { "IPAddress": "172.17.0.2" }\n  }\n]` };
  }
  if (cmd.startsWith('docker build')) {
    return { ok: true, text: `[DEMO] Sending build context to Docker daemon...\nStep 1/5 : FROM node:18-alpine\nStep 2/5 : WORKDIR /app\nStep 3/5 : COPY package*.json ./\nStep 4/5 : RUN npm install\nStep 5/5 : COPY . .\nSuccessfully built a1b2c3d4e5f6\nSuccessfully tagged miapp:latest` };
  }
  if (cmd.startsWith('docker logs')) {
    return { ok: true, text: `[DEMO] ${now} INFO  Server started on :3000\n${now} INFO  Connected to database\n${now} WARN  High memory usage detected\n${now} INFO  GET /api/health 200 12ms\n${now} INFO  GET /api/users  200 45ms` };
  }
  return { ok: true, text: `[DEMO] Comando ejecutado: ${cmd}` };
}

/* ── Acciones de cada sección ── */
function runContainer() {
  const cmd = buildContainerCmd();
  if (cmd.includes('<')) {
    alert('Completa los campos requeridos.');
    return;
  }
  showModal(cmd, async () => {
    const result = await callBackend(cmd);
    showOutput('cnt-output', 'cnt-output-text', result.text, !result.ok);
  });
}

function resetContainer() {
  document.getElementById('cnt-name').value = '';
  document.getElementById('cnt-action').value = 'start';
  document.getElementById('cnt-cmd-preview').textContent = buildContainerCmd();
  closeOutput('cnt-output');
}

function runBuild() {
  const cmd = buildBuildCmd();
  if (cmd.includes('<')) {
    alert('Completa tag y contexto.');
    return;
  }
  showModal(cmd, async () => {
    const result = await callBackend(cmd);
    showOutput('build-output', 'build-output-text', result.text, !result.ok);
  });
}

function resetBuild() {
  ['build-tag','build-ctx','build-file'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('build-nocache').checked = false;
  document.getElementById('build-pull').checked    = false;
  document.getElementById('build-rm').checked      = true;
  document.getElementById('build-cmd-preview').textContent = buildBuildCmd();
  closeOutput('build-output');
}

function runLogs() {
  const cmd = buildLogsCmd();
  if (cmd.includes('<')) {
    alert('Especifica el nombre del contenedor.');
    return;
  }
  showModal(cmd, async () => {
    const result = await callBackend(cmd);
    showOutput('log-output', 'log-output-text', result.text, !result.ok);
  });
}

function resetLogs() {
  ['log-name','log-tail','log-since','log-until'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('log-timestamps').checked = false;
  document.getElementById('log-follow').checked     = false;
  document.getElementById('log-cmd-preview').textContent = buildLogsCmd();
  closeOutput('log-output');
}
