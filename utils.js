function drawFretboardOnly(positions, options = {}) {
  const {
    stringCount = 6,
    fretStart = 0,
    fretEnd = 12,
    invert = false,
    showLabels = true,
    stringLabels = [],
    tuning = [],
    paintAsChord = false // ← nuevo flag
  } = options;

  const container = document.getElementById("fretboard");
  container.innerHTML = "";

  console.log("🖌 drawFretboardOnly(): posiciones recibidas =", positions);
  console.log("🧩 Opciones:", { stringCount, fretStart, fretEnd, invert, showLabels, stringLabels, tuning, paintAsChord });

  const stringIndices = invert
    ? [...Array(stringCount).keys()].reverse()
    : [...Array(stringCount).keys()];

  container.style.gridTemplateRows = `repeat(${stringCount}, 40px)`;

  for (const i of stringIndices) {
    const string = document.createElement("div");
    string.className = "string";

    if (showLabels) {
      const label = document.createElement("div");
      label.className = "fret-label";
      label.textContent = stringLabels[i] || `(${stringCount - i})`;
      string.appendChild(label);
    }

    if (fretStart === 0) {
      const openFret = document.createElement("div");
      openFret.className = "fret open";

      const pos = positions.find(p => p.string === i && p.fret === 0);
      if (pos) {
        openFret.classList.add("highlight");
        if (pos.isRoot) openFret.classList.add("root");

        const marker = document.createElement("div");
        marker.className = "note-marker";
        marker.textContent = pos.note;
        marker.style.backgroundColor = noteColors?.[pos.note] || "#999";
        openFret.appendChild(marker);
      }

      string.appendChild(openFret);

      const nut = document.createElement("div");
      nut.className = "fret nut";
      nut.textContent = "║";
      string.appendChild(nut);
    }

    for (let fret = fretStart === 0 ? 1 : fretStart; fret <= fretEnd; fret++) {
      const fretDiv = document.createElement("div");
      fretDiv.className = "fret";

      const pos = positions.find(p => p.string === i && p.fret === fret);
      if (pos) {
        fretDiv.classList.add("highlight");
        if (pos.isRoot) fretDiv.classList.add("root");

        const marker = document.createElement("div");
        marker.className = "note-marker";
        marker.textContent = pos.note;
        marker.style.backgroundColor = noteColors?.[pos.note] || "#999";
        fretDiv.appendChild(marker);
      }

      if (i === Math.floor(stringCount / 2)) {
        if (fret === 12) {
          fretDiv.classList.add("double-dot");
        } else if (fretMarkers.includes(fret)) {
          const dot = document.createElement("div");
          dot.className = "dot";
          fretDiv.appendChild(dot);
        }
      }

      string.appendChild(fretDiv);
    }

    const totalFrets = fretEnd - (fretStart === 0 ? 1 : fretStart) + 1;
    const openNutCols = fretStart === 0 ? '40px 40px ' : '';
    string.style.gridTemplateColumns = `60px ${openNutCols}${'40px '.repeat(totalFrets)}`;

    container.appendChild(string);
  }

  if (tuning.length === stringCount) {
    drawTab(positions, tuning, fretStart, fretEnd, paintAsChord);
  }
}


function drawTab(positions, tuning, fretStart = 0, fretEnd = 12, paintAsChord = false) {
  console.log("🎼 drawTab() called");
  console.log("→ Posiciones recibidas:", positions);
  console.log("→ Tuning:", tuning);
  console.log("→ Fret range:", fretStart, "to", fretEnd);
  console.log("→ Modo acorde activado:", paintAsChord);

  const stringCount = tuning.length;
  const tabLines = [];

  const cuerdas = new Map();
  positions.forEach(p => {
    const key = `Cuerda ${p.string}`;
    if (!cuerdas.has(key)) cuerdas.set(key, []);
    cuerdas.get(key).push(p.fret);
  });
  console.log("→ Frets por cuerda:", Object.fromEntries(cuerdas));

  if (paintAsChord) {
    console.log("🎯 Modo acorde activado: pintando en una sola línea");

    const lines = Array(stringCount).fill("----");

    positions.forEach(pos => {
      if (!pos || pos.string == null || pos.fret == null || pos.fret < 0) return;
      const s = pos.string;
      const f = pos.fret;
      lines[s] = f < 10 ? `-${f}-` : `${f}-`.slice(0, 4);
    });

    for (let i = stringCount - 1; i >= 0; i--) {
      tabLines.push(tuning[i].toLowerCase() + "|" + lines[i]);
    }

    console.log("→ Tablatura generada (modo acorde):\n" + tabLines.join("\n"));
    document.getElementById("tablature").textContent = tabLines.join("\n");
    return;
  }

  // 🔁 Modo normal
  const lineMap = Array(stringCount).fill(null).map(() => Array(fretEnd - fretStart + 1).fill("---"));

  positions.forEach(pos => {
    if (!pos || pos.string == null || pos.fret == null) return;
    const string = pos.string;
    const idx = pos.fret - fretStart;
    if (idx < 0 || idx >= (fretEnd - fretStart + 1)) return;

    const sFret = pos.fret < 10 ? `-${pos.fret}-` :
                  pos.fret < 100 ? `${pos.fret}-` :
                  `${pos.fret}`.slice(0, 4);

    lineMap[string][idx] = sFret;
  });

  for (let i = stringCount - 1; i >= 0; i--) {
    tabLines.push(tuning[i].toLowerCase() + "|" + lineMap[i].join(""));
  }

  console.log("→ Tablatura generada (modo secuencia):\n" + tabLines.join("\n"));
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

  const fretStart = parseInt(document.getElementById("fretStart").value) || 0;
  const fretEnd = parseInt(document.getElementById("fretEnd").value) || 12;
  const invert = document.getElementById("invertFretboard")?.checked;
  const stringCount = tuning.length;

const firstToken = rawInputText.split(/\s+/)[0];
const chordName = firstToken.trim(); // 👈 conserva mayúsculas/minúsculas

  const rootMatch = chordName.match(/^([A-G]#?|[A-G]b)/);
  const root = rootMatch ? normalizeNote(rootMatch[1]) : null;

  const shapeData = getChordShape(chordName);
  if (shapeData && root) {
    const positions = shapeData.map(pos => ({
      string: pos.string,
      fret: pos.fret,
      note: pos.note,
      isRoot: pos.note === root
    }));

    drawFretboardOnly(positions, {
      stringCount,
      fretStart,
      fretEnd,
      invert,
      showLabels: true,
      stringLabels: tuning,
      tuning,
      paintAsChord: true
    });

    console.log("🎯 Forma exacta encontrada:", chordName);
    console.log("🔍 Positions:", positions);

    return;
  }

  // Power chords tipo C5
  if (/^[A-G]#?5$/.test(chordName)) {
    const root = chordName.slice(0, -1);
    const shapes = findAllPowerChordShapes(root, tuning, fretEnd);

    const positions = shapes.flat().map(pos => ({
      string: pos.string,
      fret: pos.fret,
      note: pos.note,
      isRoot: pos.note === root
    }));

    drawFretboardOnly(positions, {
      stringCount,
      fretStart,
      fretEnd,
      invert,
      showLabels: true,
      stringLabels: tuning,
      tuning
    });

    console.log("🎯 Power chord:", root);
    return;
  }

  // Si no hay forma definida: usar notas sueltas
  const inputNotes = getExpandedNotesFromInput();
  if (inputNotes.length === 0) return;

  const baseOctave = 2;
  const tuningWithOctave = tuning.map((note, i) => note + (baseOctave + i));
  const targetNotes = tuning.map((_, i) => {
    const base = inputNotes[i % inputNotes.length];
    const octave = baseOctave + Math.floor(i / inputNotes.length);
    return base + octave;
  });

  const shape = shapeFromNotes(targetNotes, tuningWithOctave);

  const positions = shape.map((fret, i) => {
    if (fret == null) return null;
    const note = targetNotes[i].replace(/[0-9]/g, "");
    return { string: i, fret, note, isRoot: note === inputNotes[0] };
  }).filter(Boolean);

  drawFretboardOnly(positions, {
    stringCount,
    fretStart,
    fretEnd,
    invert,
    showLabels: true,
    stringLabels: tuning,
    tuning
  });
}

