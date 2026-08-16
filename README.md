# Panel Docker

Panel web para administrar perfiles en la PC compartida del proyecto (alumno, maestro, admin). Esta carpeta es solo el frontend. El backend que crea los perfiles reales y las imágenes ya corre por separado en esa misma PC, en el puerto 8000.

## Vistas

- index.html — acceso al panel
- perfiles.html — lista los perfiles existentes
- crear-perfil.html — formulario para dar de alta un perfil nuevo
- registros.html — bitácora de actividad
- ajustes.html — tema, notificaciones y token de administrador

## Tecnologías

HTML5, CSS3 (variables CSS) y JavaScript sin frameworks ni build step. Son archivos estáticos.

## Estructura

```
index.html
perfiles.html
perfiles.css
crear-perfil.html
crear-perfil.css
registros.html
registros.css
ajustes.html
ajustes.css
acceso.css          estilos exclusivos de la pantalla de acceso
base.css             estilos compartidos entre todas las vistas internas
configuracion.js      URL del backend, lo único que normalmente hay que tocar
sesion.js              sesión del panel (login, logout, tema, notificaciones)
utilidades.js           funciones pequeñas compartidas (por ejemplo escapeHtml)
```

## Cómo correrlo

Son archivos estáticos, cualquier servidor sirve. Desde esta carpeta:

```
python3 -m http.server 8080
```

Abre http://localhost:8080/index.html

También se puede abrir index.html directo con doble clic si no se necesita probar las llamadas al backend desde otra máquina.

## Conexión con el backend (puerto 8000)

Toda la comunicación con el backend pasa por un solo archivo: configuracion.js

```
const API_BASE = 'http://localhost:8000';
```

Si se abre el panel en la misma PC donde corre el backend, se deja así. Si se abre desde otra PC de la red, se cambia "localhost" por la IP real de esa máquina.

### Rutas del backend — pendientes de confirmar

El frontend llama a estos endpoints a manera de ejemplo. Hay que confirmarlos contra el backend real del proyecto y ajustarlos si los nombres, métodos o campos son distintos.

Vista: perfiles.html
Dónde: dentro del script, función loadProfiles
Llamada actual: GET API_BASE/api/profiles
Qué se espera: devolver la lista de perfiles, algo como
{ "ok": true, "profiles": [{ "username": "...", "role": "...", "status": "...", "homeSize": "..." }] }

Vista: crear-perfil.html
Dónde: dentro del script, evento del botón buildBtn
Llamada actual: POST API_BASE/api/profiles, con body { "username": "...", "role": "..." } y encabezado X-Admin-Token
Qué se espera: crear un perfil y devolver algo como
{ "ok": true, "username": "...", "tempPassword": "...", "role": "..." }

Vista: registros.html
Dónde: dentro del script, función loadLogs
Llamada actual: GET API_BASE/api/logs
Qué se espera: devolver el historial, algo como
{ "ok": true, "logs": [{ "time": "...", "text": "...", "type": "ok, warn o vacío" }] }

Cómo ajustarlo: si el backend real usa, por ejemplo, GET /perfiles en vez de GET /api/profiles, o devuelve el JSON con otros nombres de campos, solo hay que cambiar la URL dentro del fetch de esa vista y los nombres de propiedad que se leen de la respuesta. Todo eso vive en un solo bloque de script por archivo, se ubica fácil buscando la palabra fetch.

### Token de administrador

crear-perfil.html manda un encabezado X-Admin-Token al crear un perfil. Ese valor se escribe una vez en Ajustes, dentro de "Backend de perfiles" (o directo en el formulario de Crear Perfil), y se guarda en el navegador para no pedirlo cada vez. Si el backend real no usa un token así, se puede quitar ese encabezado del fetch en crear-perfil.html.

## Datos guardados en el navegador

dp_user — sesión del panel
dp_admin_token — token para crear o borrar perfiles
dp_light_theme — tema claro u oscuro
dp_notifications — notificaciones activas o inactivas

## Notas

Si perfiles.html o registros.html muestran que no se pudo conectar con el backend, revisar que el backend esté corriendo y que la dirección en configuracion.js apunte al puerto correcto.

Si la respuesta llega pero la página no muestra nada, es señal de que los nombres de los campos del JSON no coinciden con lo que el código espera.
