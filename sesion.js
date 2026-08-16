/* ============================================
   sesion.js -- sesion local + login/registro/Google (simulado)
   ============================================
   Esto sigue siendo una demo, todavia no hay
   backend real para el login. Los usuarios y la
   sesion se guardan en localStorage nomas para
   que el panel se vea funcional mientras tanto.
   ============================================ */

const CLAVE_SESION = 'dp_user';
const CLAVE_USUARIOS = 'dp_users';
const CLAVE_NOTIF = 'dp_notifications';

function obtenerUsuario() {
  const datos = localStorage.getItem(CLAVE_SESION);
  return datos ? JSON.parse(datos) : null;
}

function obtenerUsuarios() {
  return JSON.parse(localStorage.getItem(CLAVE_USUARIOS) || '[]');
}

function guardarUsuarios(usuarios) {
  localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(usuarios));
}

function limpiarCorreo(correo) {
  return String(correo || '').trim().toLowerCase();
}

function obtenerInicial(nombreOCorreo) {
  const valor = String(nombreOCorreo || 'U').trim();
  return valor.charAt(0).toUpperCase();
}

function crearSesion(usuario, paginaRedirigir) {
  localStorage.setItem(CLAVE_SESION, JSON.stringify({
    nombre: usuario.nombre,
    inicial: obtenerInicial(usuario.nombre || usuario.correo),
    correo: limpiarCorreo(usuario.correo),
    proveedor: usuario.proveedor || 'Correo'
  }));

  if (paginaRedirigir) window.location.href = paginaRedirigir;
}

function registrarUsuario({ nombre, correo, contrasena }) {
  const nombreLimpio = String(nombre || '').trim();
  const correoLimpio = limpiarCorreo(correo);
  const pass = String(contrasena || '');

  if (nombreLimpio.length < 2) return { ok: false, mensaje: 'Escribe tu nombre completo.' };
  if (!correoLimpio.includes('@')) return { ok: false, mensaje: 'Escribe un correo valido.' };
  if (pass.length < 6) return { ok: false, mensaje: 'La contraseña debe tener minimo 6 caracteres.' };

  const usuarios = obtenerUsuarios();
  if (usuarios.some(u => limpiarCorreo(u.correo) === correoLimpio)) {
    return { ok: false, mensaje: 'Ese correo ya esta registrado. Inicia sesion.' };
  }

  // ojo: aqui se guarda la contraseña tal cual, es demo
  // nada mas, en un backend real esto va con hash
  const nuevoUsuario = { nombre: nombreLimpio, correo: correoLimpio, contrasena: pass, proveedor: 'Correo' };
  usuarios.push(nuevoUsuario);
  guardarUsuarios(usuarios);
  crearSesion(nuevoUsuario);
  return { ok: true, usuario: nuevoUsuario };
}

function iniciarSesion(correo, contrasena) {
  const correoLimpio = limpiarCorreo(correo);
  const pass = String(contrasena || '');
  const usuario = obtenerUsuarios().find(u => limpiarCorreo(u.correo) === correoLimpio && u.contrasena === pass);

  if (!usuario) {
    return { ok: false, mensaje: 'Correo o contraseña incorrectos. Si no tienes cuenta, registrate.' };
  }

  crearSesion(usuario);
  return { ok: true, usuario };
}

// Simula el login de Google nomas preguntando los
// datos, asi si cambia el nombre en el panel.
// En un backend real aqui iria OAuth de a de veras
// y Google nos regresaria el nombre y el correo.
function loginGoogleFalso(paginaRedirigir) {
  const nombre = prompt('Nombre de tu cuenta de Google:', 'Alejandro Estrada') || 'Usuario Google';
  const correo = prompt('Correo de Google:', 'alejandro@gmail.com') || 'usuario@gmail.com';
  const usuario = {
    nombre: nombre.trim(),
    correo: limpiarCorreo(correo),
    proveedor: 'Google'
  };

  const usuarios = obtenerUsuarios();
  const yaExiste = usuarios.find(u => limpiarCorreo(u.correo) === usuario.correo);
  if (!yaExiste) {
    usuarios.push({ ...usuario, contrasena: null });
    guardarUsuarios(usuarios);
  }

  crearSesion(usuario, paginaRedirigir);
}

function requiereSesion(paginaLogin) {
  if (!obtenerUsuario()) window.location.href = paginaLogin;
}

function cerrarSesion(paginaLogin) {
  localStorage.removeItem(CLAVE_SESION);
  window.location.href = paginaLogin;
}

function pintarUsuarioEnBarra() {
  const usuario = obtenerUsuario();
  if (!usuario) return;

  document.querySelectorAll('.nombre-usuario').forEach(el => {
    el.textContent = `Hola, ${usuario.nombre.split(' ')[0]}`;
  });

  document.querySelectorAll('.avatar').forEach(el => {
    el.textContent = usuario.inicial;
  });

  document.querySelectorAll('.nombre-perfil').forEach(el => {
    el.textContent = usuario.nombre;
  });
}

function activarBotonSalir(paginaLogin) {
  document.querySelectorAll('[data-salir]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      cerrarSesion(paginaLogin);
    });
  });
}

/* ---- Notificaciones ---- */
function notificacionesActivas() {
  const raw = localStorage.getItem(CLAVE_NOTIF);
  return raw === null ? true : raw === 'true';
}

function guardarNotificaciones(valor) {
  localStorage.setItem(CLAVE_NOTIF, valor ? 'true' : 'false');
}

function avisar(mensaje, tipo = 'info') {
  if (!notificacionesActivas()) return;

  let contenedor = document.getElementById('contenedorAvisos');
  if (!contenedor) {
    contenedor = document.createElement('div');
    contenedor.id = 'contenedorAvisos';
    document.body.appendChild(contenedor);
  }

  const aviso = document.createElement('div');
  aviso.className = `aviso${tipo === 'ok' ? ' aviso-ok' : ''}${tipo === 'warn' ? ' aviso-warn' : ''}`;
  aviso.textContent = mensaje;
  contenedor.appendChild(aviso);

  requestAnimationFrame(() => aviso.classList.add('show'));

  setTimeout(() => {
    aviso.classList.remove('show');
    setTimeout(() => aviso.remove(), 300);
  }, 2600);
}

/* ---- Tema oscuro/claro ---- */
const CLAVE_TEMA = 'dp_light_theme';

function aplicarTemaGuardado() {
  const esClaro = localStorage.getItem(CLAVE_TEMA) === 'true';
  document.body.classList.toggle('tema-claro', esClaro);
  return esClaro;
}

function ponerTemaClaro(valor) {
  localStorage.setItem(CLAVE_TEMA, valor ? 'true' : 'false');
  document.body.classList.toggle('tema-claro', valor);
}
