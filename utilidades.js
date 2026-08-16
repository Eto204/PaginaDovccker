/* ============================================
   utilidades.js -- funciones chiquitas que se
   repiten entre las paginas del panel
   ============================================ */

// para que un nombre de usuario con caracteres raros
// no rompa el html cuando lo pintamos en pantalla
function escaparHtml(texto) {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}
