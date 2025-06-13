let selectedChordRoot = "C";

function getChordDescription(chord) {
  const suffix = chord.replace(/^[A-G]#?/, "");
  const descriptions = {
    "":      "Mayor – estable, feliz",
    "m":     "Menor – suave, introspectivo",
    "5":     "Powerchord – favorito metal",
    "7":     "7ma – dominante, con fuerza",
    "maj7":  "Mayor 7ma – elegante, jazz",
    "dim":   "Disminuido – tenso, inestable",
    "aug":   "Aumentado – dramático, expansivo",
    "sus2":  "Susp 2da – aireado, moderno",
    "sus4":  "Susp 4ta – tensión sin resolver",
    "add9":  "Add9 – decorativo, pop",
  };
  return descriptions[suffix] || "Acorde";
}

function getVisualLabel(noteSharp) {
  const match = [...document.querySelectorAll("#circleOfFifths text")]
    .find(el => normalizeToSharp(el.textContent) === noteSharp);
  return match?.textContent || noteSharp;
}

function renderChordCircle(root = "C") {
  // Lista de sufijos de acordes que vamos a mostrar
  const suffixes = ["", "m", "7", "maj7", "dim", "aug", "sus2", "sus4", "add9", "5", "m7"];

  // Colores personalizados por tipo de acorde
  const chordColors = {
    "": "#00bcd4", "m": "#e91e63", "7": "#ff9800", "maj7": "#3f51b5",
    "dim": "#9c27b0", "aug": "#ff5722", "sus2": "#4caf50",
    "sus4": "#8bc34a", "add9": "#795548", "5": "#000", "m7": "#666"
  };

  // Limpiamos el contenedor de acordes
  const container = document.getElementById("chordCircle");
  container.innerHTML = "";

  // 🎛 Creamos el dropdown de notas raíz
  const dropdown = document.createElement("select");
  dropdown.id = "circleChordRoot";
  dropdown.style.fontSize = "14px";

  // Rellenamos el dropdown con notas
  const allNotes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  allNotes.forEach(note => {
    const opt = document.createElement("option");
    opt.value = note;
    opt.textContent = note;
    dropdown.appendChild(opt);
  });
  dropdown.value = root;

  // 🧱 Layout horizontal: dropdown + botones de acordes
  const chordRow = document.createElement("div");
  chordRow.style.display = "flex";
  chordRow.style.flexWrap = "nowrap";              // ❌ NO se rompen en otra línea
  chordRow.style.gap = "0.5em";
  chordRow.style.alignItems = "center";
  chordRow.style.overflowX = "auto";               // ✅ Scroll si no caben
  chordRow.style.padding = "0.5em 0";
  chordRow.style.width = "fit-content";            // 🔄 Para poder centrarlo
  chordRow.style.margin = "0 auto";                // ✅ Centramos el bloque completo

  container.appendChild(chordRow);
  chordRow.appendChild(dropdown);

  // 📦 Aquí van los botones de acordes en línea
  const chordLine = document.createElement("div");
  chordLine.style.display = "flex";
  chordLine.style.flexWrap = "nowrap";
  chordLine.style.overflowX = "auto";
  chordLine.style.overflowY = "hidden";
  chordLine.style.gap = "0.5em";
  chordLine.style.maxWidth = "100%";
  chordLine.style.alignItems = "center";
  chordLine.style.scrollBehavior = "smooth";
  chordLine.style.webkitOverflowScrolling = "touch";

  chordRow.appendChild(chordLine);

  // 🎵 Texto con acorde seleccionado (lo ponemos debajo)
  let chordDisplay = document.getElementById("selectedChordDisplay");
  if (!chordDisplay) {
    chordDisplay = document.createElement("div");
    chordDisplay.id = "selectedChordDisplay";
    chordDisplay.style.fontSize = "14px";
    chordDisplay.style.color = "#444";
    chordDisplay.style.textAlign = "center";
    chordDisplay.style.marginTop = "1em";
  }
  container.appendChild(chordDisplay); // ✅ Fuera del chordRow

  // 🔁 Creamos los botones de acordes uno por uno
  suffixes.forEach(suffix => {
    const chord = root + suffix;
    const chordNotes = chordToNotes?.(chord) || [];

    const el = document.createElement("span");
    el.textContent = chord;
    el.style.cursor = "pointer";
    el.style.fontWeight = "bold";
    el.style.color = chordColors[suffix] || "#333";
    el.style.padding = "0.2em 0.5em";
    el.style.borderRadius = "4px";
    el.style.border = "1px solid #ccc";
    el.style.userSelect = "none";
    el.style.flex = "0 0 auto"; // 🛑 No se expande

    el.addEventListener("click", () => {
      const inputEl = document.getElementById("notesInput");
      const noteOutput = document.getElementById("noteOutput");
      const shapeCheckbox = document.getElementById("shapeMode");

      // ✍️ Actualizamos el input con el acorde seleccionado
      inputEl.oninput = null;
      inputEl.value = chord;
      inputEl.oninput = drawFretboard;

      // 🎯 Mostramos notas del acorde y activamos modo acorde
      if (noteOutput) noteOutput.textContent = chordNotes.join(" ");
      if (chordDisplay) chordDisplay.textContent = `🎵 Acorde: ${chord} (${chordNotes.join(" ")})`;
      if (shapeCheckbox) shapeCheckbox.checked = true;

      // 💡 Marcar visualmente el acorde activo
      chordLine.querySelectorAll("span").forEach(btn => btn.style.outline = "none");
      el.style.outline = "2px solid black";

      // 🎸 Refrescar vistas
      refreshFretboard?.();
      highlightPianoNotes?.();

      debugGroup(`🎸 Click en acorde ${chord}`, () => {
        debug("→ Notas:", chordNotes);
      });
    });

    chordLine.appendChild(el);
  });

  // 🔁 Cuando cambias el dropdown, volvemos a renderizar
  dropdown.addEventListener("change", () => {
    renderChordCircle(dropdown.value);
  });

  // 🚀 Mostrar acorde inicial al cargar
  const inputEl = document.getElementById("notesInput");
  const noteOutput = document.getElementById("noteOutput");
  const shapeCheckbox = document.getElementById("shapeMode");
  const chordNotes = chordToNotes?.(root) || [];

  inputEl.oninput = null;
  inputEl.value = root;
  inputEl.oninput = drawFretboard;

  if (noteOutput) noteOutput.textContent = chordNotes.join(" ");
  if (chordDisplay) chordDisplay.textContent = `🎵 Acorde: ${root} (${chordNotes.join(" ")})`;
  if (shapeCheckbox) shapeCheckbox.checked = true;

  refreshFretboard?.();
  highlightPianoNotes?.();
}

