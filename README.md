# 🐳 Panel Docker

Panel web para administrar perfiles en la PC compartida del proyecto (alumno / maestro / admin). Esta carpeta es **solo el frontend** — el backend (que crea los perfiles reales y las imágenes) ya corre por separado en esa misma PC, en el **puerto 8000**.

---

## ✨ Vistas

- 🔐 `index.html` — acceso al panel
- 📦 `dashboard.html` — lista los perfiles existentes
- 🧑‍💻 `build.html` — formulario para crear un perfil nuevo
- 📜 `logs.html` — registro de actividad
- ⚙️ `settings.html` — tema, notificaciones y token de administrador

---

## 🧱 Tecnologías

HTML5, CSS3 (variables CSS) y JavaScript vanilla. Sin frameworks, sin build step — son archivos estáticos.

---

## 📂 Estructura

```
├── index.html
├── dashboard.html
├── build.html
├── logs.html
├── settings.html
├── app-config.js      # ⚠️ URL del backend — lo único que normalmente hay que tocar
├── auth.js             # Sesión del panel (login/logout)
├── app-data.js          # Utilidades compartidas
└── *.css
```

---

## 🚀 Cómo correrlo

Son archivos estáticos, cualquier servidor sirve. Desde esta carpeta:

```bash
python3 -m http.server 8080
```

Abre `http://localhost:8080/index.html`.

(También puedes abrir `index.html` directo con doble clic si no necesitas probar las llamadas al backend desde otra máquina.)

---

## 🔌 Conexión con el backend (puerto 8000)

Toda la comunicación con el backend pasa por un solo archivo:

**`app-config.js`**
```js
const API_BASE = 'http://localhost:8000';
```

- Si abres el panel **en la misma PC** donde corre el backend → déjalo así.
- Si lo abres **desde otra PC** de la red → cambia `localhost` por la IP real de esa máquina.

### ⚠️ Pendiente: ajustar las rutas exactas

El frontend llama a estos endpoints como **ejemplo/plantilla** — hay que confirmarlos contra el backend real del proyecto y ajustarlos si los nombres, métodos o campos son distintos:

| Vista | Dónde está en el código | Llamada actual (ejemplo) | Qué se espera que haga |
|---|---|---|---|
| `dashboard.html` | dentro del `<script>`, función `loadProfiles()` | `GET ${API_BASE}/api/profiles` | Devolver la lista de perfiles. El código espera algo como: `{ "ok": true, "profiles": [{ "username": "...", "role": "...", "status": "...", "homeSize": "..." }] }` |
| `build.html` | dentro del `<script>`, evento del botón `buildBtn` | `POST ${API_BASE}/api/profiles`<br>body: `{ "username": "...", "role": "..." }`<br>header: `X-Admin-Token: <token>` | Crear un perfil y devolver algo como: `{ "ok": true, "username": "...", "tempPassword": "...", "role": "..." }` |
| `logs.html` | dentro del `<script>`, función `loadLogs()` | `GET ${API_BASE}/api/logs` | Devolver el historial: `{ "ok": true, "logs": [{ "time": "ISO-8601", "text": "...", "type": "ok" \| "warn" \| null }] }` |

**Cómo ajustarlo**: si el backend real usa, por ejemplo, `GET /perfiles` en vez de `GET /api/profiles`, o devuelve el JSON con otros nombres de campos (`nombre` en vez de `username`), solo hay que:

1. Cambiar la URL dentro del `fetch(...)` en el `<script>` de esa vista.
2. Ajustar qué propiedades del JSON de respuesta se leen (por ejemplo `data.profiles` → `data.perfiles`).

Todo eso vive en un solo bloque `<script>` por archivo, es fácil de ubicar buscando la palabra `fetch`.

### Token de administrador

`build.html` manda un header `X-Admin-Token` al crear un perfil. Ese valor se escribe una vez en **Ajustes → Backend de perfiles** (o directo en el formulario de "Crear Perfil") y se guarda en `localStorage` de ese navegador. Si el backend real no usa un token así, se puede quitar ese header del `fetch` en `build.html`.

---

## 💾 Preferencias guardadas en el navegador (`localStorage`)

| Clave | Contenido |
|---|---|
| `dp_user` | Sesión del panel (login) |
| `dp_admin_token` | Token para crear/borrar perfiles |
| `dp_light_theme` | Tema claro/oscuro |
| `dp_notifications` | Notificaciones activas/inactivas |

---

## ⚠️ Notas

- Si `dashboard.html` o `logs.html` muestran "No se pudo conectar con el backend", revisa que el backend esté corriendo y que `API_BASE` en `app-config.js` apunte al puerto correcto.
- Si la respuesta llega pero la página no muestra nada, es señal de que los nombres de los campos del JSON no coinciden con lo que el código espera (ver tabla de arriba).

---

## 📄 Licencia

_Agregar aquí la licencia del proyecto (MIT, propietaria, etc.)._
