// global-setup.js
// 🛡️ Fallback si debug.js no está presente

if (typeof debug !== "function") {
  console.warn("⚠️ debug.js no cargado. debug() desactivado.");
  window.debug = () => {};
  window.debugGroup = (_, fn) => fn();
}

