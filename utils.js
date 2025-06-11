function drawFretboardOnly(shape, targetNotes, tuning) {
  const container = document.getElementById("fretboard");
  container.innerHTML = "";

  const stringCount = tuning.length;
  const fretStart = parseInt(document.getElementById("fretStart").value) || 0;
  const fretEnd = parseInt(document.getElementById("fretEnd").value) || 12;
  const invert = document.getElementById("invertFretboard")?.checked;

  // Determina el orden de las cuerdas (normal o invertido)
  const stringIndices = invert
    ? [...Array(stringCount).keys()].reverse()
    : [...Array(stringCount).keys()];

  container.style.gridTemplateRows = `repeat(${stringCount}, 40px)`;

  // 🔁 Por cada cuerda (de grave a aguda o invertido)
  for (const i of stringIndices) {
    const string = document.createElement("div");
    string.className = "string";

    // Etiqueta con la nota al aire y número de cuerda
    const label = document.createElement("div");
    label.className = "fret-label";
    label.textContent = `${tuning[i]} (${stringCount - i})`;
    string.appendChild(label);

    const totalFrets = fretEnd - (fretStart === 0 ? 1 : fretStart) + 1;
    const openNutCols = fretStart === 0 ? '40px 40px ' : '';
    string.style.gridTemplateColumns = `60px ${openNutCols}${'40px '.repeat(totalFrets)}`;

    // 🎸 Si incluye traste al aire
    if (fretStart === 0) {
      const openFret = document.createElement("div");
      openFret.className = "fret open";

      // Marca el traste al aire si es parte del shape
      if (shape[i] === 0) {
        openFret.classList.add("highlight", "root");

        const marker = document.createElement("div");
        marker.className = "note-marker";
        const baseNote = targetNotes[i]?.replace(/[0-9]/g, "") || "";
        marker.textContent = baseNote;
        marker.style.backgroundColor = noteColors[baseNote] || "#999";
        openFret.appendChild(marker);
      }

      string.appendChild(openFret);

      // Cejuela (nut)
      const nut = document.createElement("div");
      nut.className = "fret nut";
      nut.textContent = "║";
      string.appendChild(nut);
    }

    // 🔁 Recorre todos los trastes visibles (del rango seleccionado)
    for (let fret = fretStart === 0 ? 1 : fretStart; fret <= fretEnd; fret++) {
      const fretDiv = document.createElement("div");
      fretDiv.className = "fret";

      // 🎯 Puntos de referencia en la cuerda central
      if (i === Math.floor(stringCount / 2)) {
        if (fret === 12) {
          fretDiv.classList.add("double-dot");
        } else if (fretMarkers.includes(fret)) {
          const dot = document.createElement("div");
          dot.className = "dot";
          fretDiv.appendChild(dot);
        }
      }

      // 🎵 Si el shape tiene nota en este traste, la pinta
      if (shape[i] === fret) {
        fretDiv.classList.add("highlight", "root");

        const marker = document.createElement("div");
        marker.className = "note-marker";

        const baseNote = targetNotes[i]?.replace(/[0-9]/g, "") || "";
        marker.textContent = baseNote;
        marker.style.backgroundColor = noteColors[baseNote] || "#999";

        fretDiv.appendChild(marker);
      }

      string.appendChild(fretDiv);
    }

    // Agrega toda la fila de cuerda al mástil
    container.appendChild(string);
  }

  // 🎼 Genera la tablatura correspondiente
  const tabLines = [];
  for (let i = stringCount - 1; i >= 0; i--) {
    const open = tuning[i][0].toLowerCase();
    const fret = shape[i];
    let line = open + "|";

    // 🔁 Recorre los trastes y marca donde haya nota
    for (let f = fretStart; f <= fretEnd; f++) {
      line += (f === fret)
        ? (f < 10 ? `-${f}-` : `${f}-`)
        : "---";
    }

    tabLines.push(line);
  }

  // Muestra la tablatura debajo
  document.getElementById("tablature").textContent = tabLines.join("\n");
}


function refreshFretboard() {
  const useShapeMode = document.getElementById("shapeMode")?.checked;
  if (useShapeMode) {
    runShapeMode();  // ⬅️ usará drawFretboardOnly directamente
  } else {
    drawFretboard(); // modo normal
  }
}

function runShapeMode() {
  const rawInputText = document.getElementById("notesInput")?.value?.trim();
  const instrument = document.getElementById("instrumentSelect").value;
  const tuningName = document.getElementById("tuningSelect").value;
    const tuningMap = tuningsByInstrument[instrument];
const tuning = tuningMap ? tuningMap[tuningName] : null;

if (!tuning) {
  console.warn("⚠️ No se encontró la afinación (shape mode):", tuningName, "para", instrument);
  return;
}


  const shapeData = getChordShape(rawInputText);

  if (shapeData) {
    const shapeArray = new Array(tuning.length).fill(null);
    const notesArray = new Array(tuning.length).fill(null);

    shapeData.forEach(pos => {
      if (pos.string < tuning.length) {
        shapeArray[pos.string] = pos.fret;
        notesArray[pos.string] = pos.note || "";
      }
    });

    const tuningWithOctave = tuning.map((t, i) => t + (2 + i));
    drawFretboardOnly(shapeArray, notesArray, tuningWithOctave);
    return;
  }

  // Si no hay forma exacta definida, intenta calcularla
  const inputNotes = getExpandedNotesFromInput();
  if (inputNotes.length === 0) return;

  const baseOctave = 2;
  const tuningWithOctave = tuning.map((note, i) => note + (2 + i));
  const targetNotes = tuning.map((_, i) => {
    const base = inputNotes[i % inputNotes.length];
    const octave = baseOctave + Math.floor(i / inputNotes.length);
    return base + octave;
  });

  const shape = shapeFromNotes(targetNotes, tuningWithOctave);
  drawFretboardOnly(shape, targetNotes, tuningWithOctave);
}
