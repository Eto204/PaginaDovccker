/* ============================================
   auth.js — sesión local + login/registro/Google mock
   Demo sin backend real. Guarda usuarios y sesión
   en localStorage para que el panel se vea funcional.
   ============================================ */

const AUTH_KEY = 'dp_user';
const USERS_KEY = 'dp_users';
const NOTIF_KEY = 'dp_notifications';

function getUser() {
  const raw = localStorage.getItem(AUTH_KEY);
  return raw ? JSON.parse(raw) : null;
}

function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function cleanEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function getInitial(nameOrEmail) {
  const value = String(nameOrEmail || 'U').trim();
  return value.charAt(0).toUpperCase();
}

function createSession(user, redirectPage) {
  localStorage.setItem(AUTH_KEY, JSON.stringify({
    name: user.name,
    initial: getInitial(user.name || user.email),
    email: cleanEmail(user.email),
    provider: user.provider || 'Correo'
  }));

  if (redirectPage) window.location.href = redirectPage;
}

function registerUser({ name, email, password }) {
  const cleanName = String(name || '').trim();
  const cleanMail = cleanEmail(email);
  const pass = String(password || '');

  if (cleanName.length < 2) return { ok: false, message: 'Escribe tu nombre completo.' };
  if (!cleanMail.includes('@')) return { ok: false, message: 'Escribe un correo válido.' };
  if (pass.length < 6) return { ok: false, message: 'La contraseña debe tener mínimo 6 caracteres.' };

  const users = getUsers();
  if (users.some(u => cleanEmail(u.email) === cleanMail)) {
    return { ok: false, message: 'Ese correo ya está registrado. Inicia sesión.' };
  }

  const user = { name: cleanName, email: cleanMail, password: pass, provider: 'Correo' };
  users.push(user);
  saveUsers(users);
  createSession(user);
  return { ok: true, user };
}

function loginWithCredentials(email, password) {
  const cleanMail = cleanEmail(email);
  const pass = String(password || '');
  const user = getUsers().find(u => cleanEmail(u.email) === cleanMail && u.password === pass);

  if (!user) {
    return { ok: false, message: 'Correo o contraseña incorrectos. Si no tienes cuenta, regístrate.' };
  }

  createSession(user);
  return { ok: true, user };
}

// Simula Google: pregunta datos para que sí cambie el nombre en el panel.
// En un backend real aquí iría OAuth y Google regresaría name/email.
function fakeGoogleLogin(redirectPage) {
  const name = prompt('Nombre de tu cuenta de Google:', 'Alejandro Estrada') || 'Usuario Google';
  const email = prompt('Correo de Google:', 'alejandro@gmail.com') || 'usuario@gmail.com';
  const user = {
    name: name.trim(),
    email: cleanEmail(email),
    provider: 'Google'
  };

  const users = getUsers();
  const exists = users.find(u => cleanEmail(u.email) === user.email);
  if (!exists) {
    users.push({ ...user, password: null });
    saveUsers(users);
  }

  createSession(user, redirectPage);
}

function requireAuth(loginPage) {
  if (!getUser()) window.location.href = loginPage;
}

function logout(loginPage) {
  localStorage.removeItem(AUTH_KEY);
  window.location.href = loginPage;
}

function paintUserInTopbar() {
  const user = getUser();
  if (!user) return;

  document.querySelectorAll('.user-name').forEach(el => {
    el.textContent = `Hola, ${user.name.split(' ')[0]}`;
  });

  document.querySelectorAll('.avatar').forEach(el => {
    el.textContent = user.initial;
  });

  document.querySelectorAll('.profile-name').forEach(el => {
    el.textContent = user.name;
  });
}

function wireLogout(loginPage) {
  document.querySelectorAll('[data-logout]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      logout(loginPage);
    });
  });
}

/* ---- Notificaciones ---- */
function notificationsEnabled() {
  const raw = localStorage.getItem(NOTIF_KEY);
  return raw === null ? true : raw === 'true';
}

function setNotificationsEnabled(value) {
  localStorage.setItem(NOTIF_KEY, value ? 'true' : 'false');
}

function notify(message, type = 'info') {
  if (!notificationsEnabled()) return;

  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast${type === 'ok' ? ' toast-ok' : ''}${type === 'warn' ? ' toast-warn' : ''}`;
  toast.textContent = message;
  container.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('show'));

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2600);
}

/* ---- Tema oscuro/claro ---- */
const THEME_KEY = 'dp_light_theme';

function applyStoredTheme() {
  const light = localStorage.getItem(THEME_KEY) === 'true';
  document.body.classList.toggle('light-theme', light);
  return light;
}

function setLightTheme(value) {
  localStorage.setItem(THEME_KEY, value ? 'true' : 'false');
  document.body.classList.toggle('light-theme', value);
}
