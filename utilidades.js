/* ============================================
   utilidades.js — funciones pequeñas compartidas
   entre las distintas páginas del panel.
   ============================================ */

// Evita que un nombre de usuario con caracteres raros
// rompa el HTML al mostrarlo en pantalla.
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
