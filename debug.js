// debug.js
// 🔧 Sistema de logs controlados para desarrollo

// Cambia a false para silenciar todos los logs de debug()
const DEBUG = true;

// Solo define si aún no existe
if (typeof window !== "undefined") {
  window.DEBUG ??= DEBUG;

  window.debug ??= (...args) => {
    if (window.DEBUG) console.log(...args);
  };

  window.debugGroup ??= (label, fn) => {
    if (!window.DEBUG) return;
    console.group(label);
    try {
      fn();
    } finally {
      console.groupEnd();
    }
  };
}

