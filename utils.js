function drawFretboardOnly(positions, options = {}) {
  console.log("🖌 drawFretboardOnly(): posiciones recibidas =", positions);
  const {
    stringCount = 6,
    fretStart = 0,
    fretEnd = 12,
    invert = false,
    showLabels = true,
    stringLabels = [],
    tuning = []
  } = options;

  const container = document.getElementById("fretboard");
  container.innerHTML = "";

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
    drawTab(positions, tuning, fretStart, fretEnd);
  }
}

function drawTab(positions, tuning, fretStart = 0, fretEnd = 12) {
  console.log("🎼 drawTab(): posiciones =", positions);
  console.log("🪕 drawTab(): tuning =", tuning);
  console.log("📏 drawTab(): rango de trastes =", fretStart, "-", fretEnd);

  const stringCount = tuning.length;
  const tabLines = [];

  for (let i = stringCount - 1; i >= 0; i--) {
    const openNote = tuning[i];
    const line = Array(fretEnd - fretStart + 1).fill("---");

    positions.forEach(pos => {
      if (pos.string === i && pos.fret >= fretStart && pos.fret <= fretEnd) {
        const idx = pos.fret - fretStart;
        let fretTxt = pos.fret.toString();
        if (fretTxt.length === 1) fretTxt = `-${fretTxt}-`;
        else if (fretTxt.length === 2) fretTxt = `${fretTxt}-`;
        line[idx] = fretTxt;
      }
    });

    tabLines.push(openNote.toLowerCase() + "|" + line.join(""));
  }

  document.getElementById("tablature").textContent = tabLines.join("\n");
}

function drawTab(positions, tuning, fretStart = 0, fretEnd = 12) {
  console.log("🎼 drawTab called with fret range:", fretStart, "to", fretEnd);

  const stringCount = tuning.length;
  const tabLines = [];

  for (let i = stringCount - 1; i >= 0; i--) {
    const openNote = tuning[i];
    const line = Array(fretEnd - fretStart + 1).fill("---");

    positions.forEach(pos => {
      if (pos.string === i && pos.fret >= fretStart && pos.fret <= fretEnd) {
        const idx = pos.fret - fretStart;
        let fretTxt = pos.fret.toString();
        if (fretTxt.length === 1) fretTxt = `-${fretTxt}-`;
        else if (fretTxt.length === 2) fretTxt = `${fretTxt}-`;
        line[idx] = fretTxt;
      }
    });

    tabLines.push(openNote.toLowerCase() + "|" + line.join(""));
  }

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
      tuning
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

