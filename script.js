const allNotes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const enharmonics = {
  "CB": "B", "DB": "C#", "EB": "D#", "FB": "E",
  "GB": "F#", "AB": "G#", "BB": "A#"
};

const tuningsByInstrument = {
  guitar6: {
    "Standard (E A D G B E)": ["E", "A", "D", "G", "B", "E"],
    "Drop D (D A D G B E)": ["D", "A", "D", "G", "B", "E"],
    "Eb Tuning (Eb Ab Db Gb Bb Eb)": ["D#", "G#", "C#", "F#", "A#", "D#"],
    "Drop C (C G C F A D)": ["C", "G", "C", "F", "A", "D"]
  },
  bass4: {
    "Standard (E A D G)": ["E", "A", "D", "G"],
    "Drop D (D A D G)": ["D", "A", "D", "G"]
  },
  guitar7: {
    "Standard (B E A D G B E)": ["B", "E", "A", "D", "G", "B", "E"],
    "Drop A (A E A D G B E)": ["A", "E", "A", "D", "G", "B", "E"]
  }
};

const fretMarkers = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24];

const noteColors = {
  "C": "#ff6b6b", "C#": "#ffa502", "D": "#feca57", "D#": "#1dd1a1",
  "E": "#54a0ff", "F": "#5f27cd", "F#": "#576574", "G": "#10ac84",
  "G#": "#00d2d3", "A": "#ff9ff3", "A#": "#c56cf0", "B": "#00cec9"
};

const noteLabels = {
  "C": "Do (C)",
  "C#": "Do# (C#)",
  "D": "Re (D)",
  "D#": "Re# (D#)",
  "E": "Mi (E)",
  "F": "Fa (F)",
  "F#": "Fa# (F#)",
  "G": "Sol (G)",
  "G#": "Sol# (G#)",
  "A": "La (A)",
  "A#": "La# (A#)",
  "B": "Si (B)"
};

function noteIndex(note) {
  return allNotes.indexOf(normalizeNote(note));
}

function populateVisualizationSelector() {
  const select = document.getElementById("visualNoteSelect");
  if (!select || select.options.length > 0) return;

  allNotes.forEach(note => {
    const option = document.createElement("option");
    option.value = note;
    option.textContent = noteLabels[note] || note;
    select.appendChild(option);
  });

  select.value = "C";
}

function showVisualizationNote() {
  const select = document.getElementById("visualNoteSelect");
  const input = document.getElementById("notesInput");
  const output = document.getElementById("noteOutput");
  if (!select || !input) return;

  const note = normalizeNote(select.value);
  input.value = note;

  if (output) {
    output.textContent = `Visualizando ${noteLabels[note] || note}`;
  }

  if (document.getElementById("shapeMode")?.checked) {
    document.getElementById("shapeMode").checked = false;
  }

  drawFretboard();
}

function isVisualizationModeActive() {
  return document.getElementById("visualizationTab")?.classList.contains("active");
}

function getOctaveLinkOffset(fromNote, toNote) {
  const delta = (noteIndex(toNote) - noteIndex(fromNote) + 12) % 12;
  return (12 - delta) % 12;
}

function getVisualizationRelationMap(positions, tuning, inputNotes) {
  const relationMap = new Map();
  if (!isVisualizationModeActive() || inputNotes.length !== 1) {
    return { relationMap, relationPairs: [] };
  }

  const positionKeys = new Set(positions.map(pos => `${pos.string}:${pos.fret}`));
  const relationPairs = [];

  const markRelation = (key, relation) => {
    if (!relationMap.has(key)) {
      relationMap.set(key, { start: false, target: false });
    }
    relationMap.get(key)[relation] = true;
  };

  positions.forEach(pos => {
    const currentKey = `${pos.string}:${pos.fret}`;
    const targetString = pos.string + 2;
    if (targetString >= tuning.length) return;

    const offset = getOctaveLinkOffset(tuning[pos.string], tuning[targetString]);
    const targetKey = `${targetString}:${pos.fret + offset}`;

    if (positionKeys.has(targetKey)) {
      markRelation(currentKey, "start");
      markRelation(targetKey, "target");
      relationPairs.push({ from: currentKey, to: targetKey });
    }
  });

  return { relationMap, relationPairs };
}

function clearVisualizationOverlay() {
  document.getElementById("visualizationOverlay")?.remove();
}

function drawVisualizationOverlay(elementMap, relationPairs) {
  clearVisualizationOverlay();

  if (!isVisualizationModeActive() || relationPairs.length === 0) {
    return;
  }

  const wrapper = document.getElementById("fretboard-wrapper");
  const board = document.getElementById("fretboard");
  if (!wrapper || !board) return;

  const svgNS = "http://www.w3.org/2000/svg";
  const wrapperRect = wrapper.getBoundingClientRect();
  const overlay = document.createElementNS(svgNS, "svg");
  overlay.setAttribute("id", "visualizationOverlay");
  overlay.setAttribute("class", "visualization-overlay");
  overlay.setAttribute("width", wrapper.scrollWidth);
  overlay.setAttribute("height", wrapper.scrollHeight);
  overlay.setAttribute("viewBox", `0 0 ${wrapper.scrollWidth} ${wrapper.scrollHeight}`);

  const defs = document.createElementNS(svgNS, "defs");
  const marker = document.createElementNS(svgNS, "marker");
  marker.setAttribute("id", "visualizationArrowhead");
  marker.setAttribute("markerWidth", "10");
  marker.setAttribute("markerHeight", "10");
  marker.setAttribute("refX", "8");
  marker.setAttribute("refY", "3");
  marker.setAttribute("orient", "auto");

  const arrowHead = document.createElementNS(svgNS, "path");
  arrowHead.setAttribute("d", "M0,0 L0,6 L9,3 z");
  arrowHead.setAttribute("fill", "#6d28d9");
  marker.appendChild(arrowHead);
  defs.appendChild(marker);
  overlay.appendChild(defs);

  relationPairs.forEach(pair => {
    const fromEl = elementMap.get(pair.from);
    const toEl = elementMap.get(pair.to);
    if (!fromEl || !toEl) return;

    const fromRect = fromEl.getBoundingClientRect();
    const toRect = toEl.getBoundingClientRect();

    const x1 = fromRect.left - wrapperRect.left + fromRect.width / 2 + wrapper.scrollLeft;
    const y1 = fromRect.top - wrapperRect.top + fromRect.height / 2 + wrapper.scrollTop;
    const x2 = toRect.left - wrapperRect.left + toRect.width / 2 + wrapper.scrollLeft;
    const y2 = toRect.top - wrapperRect.top + toRect.height / 2 + wrapper.scrollTop;
    const elbowX = x1 + Math.max(22, Math.abs(x2 - x1) * 0.45);
    const elbowY = y1;
    const preTargetX = elbowX;
    const preTargetY = y2;

    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", `M ${x1} ${y1} L ${elbowX} ${elbowY} L ${preTargetX} ${preTargetY} L ${x2} ${y2}`);
    path.setAttribute("class", "visualization-arrow");
    path.setAttribute("marker-end", "url(#visualizationArrowhead)");
    overlay.appendChild(path);
  });

  wrapper.appendChild(overlay);
}

function updateTuningOptions() {
  const instrument = document.getElementById("instrumentSelect").value;
  const tuningSelect = document.getElementById("tuningSelect");

  // Obtener afinaciones para el instrumento actual
  const options = tuningsByInstrument[instrument];
  if (!options) {
    console.warn("⚠️ No hay afinaciones definidas para", instrument);
    return;
  }

  // Limpiar el dropdown
  tuningSelect.innerHTML = "";

  // Rellenar con nuevas opciones
  const optionNames = Object.keys(options);
  optionNames.forEach(name => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    tuningSelect.appendChild(opt);
  });

  // ✅ Forzar a seleccionar la primera opción válida
  if (optionNames.length > 0) {
    tuningSelect.value = optionNames[0];
  }

  // ✅ Asegurarse de que el onchange esté conectado
  tuningSelect.onchange = refreshFretboard;

  // ✅ Redibujar el mástil con datos consistentes
  refreshFretboard();
}


function getExpandedNotesFromInput() {
  const rawInput = document.getElementById("notesInput").value
    .trim()
    .split(/\s+/)
    .filter(n => n);

  let result = [];

  rawInput.forEach(token => {
    const match = token.match(/^([A-G]#?|[A-G]b)(.*)$/);
    if (match) {
      const root = normalizeNote(match[1]);
      const type = match[2];

      if (type) {
        const notes = chordToNotes(root + type);
        if (notes.length > 0) {
          result.push(...notes);
          return;
        }
      }
    }

    result.push(normalizeNote(token));
  });

  return result;
}

function drawFretboard() {
  const container = document.getElementById("fretboard");
  container.innerHTML = "";

  const inputNotes = getExpandedNotesFromInput();
  const instrument = document.getElementById("instrumentSelect").value;
  const tuningName = document.getElementById("tuningSelect").value;
    const tuningMap = tuningsByInstrument[instrument];
const tuning = tuningMap ? tuningMap[tuningName] : null;

if (!tuning) {
  console.warn("⚠️ No se encontró la afinación:", tuningName, "para", instrument);
  return;
}

  const stringCount = tuning.length;
  const matchedPositions = [];
  const elementMap = new Map();

  const fretStart = parseInt(document.getElementById("fretStart").value) || 0;
  const fretEnd = parseInt(document.getElementById("fretEnd").value) || 12;
  const invert = document.getElementById("invertFretboard")?.checked;
  const stringIndices = invert
    ? [...Array(stringCount).keys()].reverse()
    : [...Array(stringCount).keys()];

  const useShapeMode = document.getElementById("shapeMode")?.checked;
  const visualizationMode = isVisualizationModeActive() && inputNotes.length === 1 && !useShapeMode;

  for (let i = 0; i < stringCount; i++) {
    const openNote = normalizeNote(tuning[i]);

    if (fretStart === 0 && inputNotes.includes(openNote)) {
      matchedPositions.push({ string: i, fret: 0, note: openNote });
    }

    for (let fret = fretStart === 0 ? 1 : fretStart; fret <= fretEnd; fret++) {
      const note = allNotes[(noteIndex(tuning[i]) + fret) % 12];
      if (inputNotes.includes(normalizeNote(note))) {
        matchedPositions.push({ string: i, fret, note: normalizeNote(note) });
      }
    }
  }

  const { relationMap, relationPairs } = getVisualizationRelationMap(matchedPositions, tuning, inputNotes);

  // 🔁 Modo normal: marcar todas las coincidencias
  container.style.gridTemplateRows = `repeat(${stringCount}, 40px)`;

  for (const i of stringIndices) {
    const openNote = tuning[i];
    const string = document.createElement("div");
    string.className = "string";

    const stringLabel = document.createElement("div");
    stringLabel.className = "fret-label";
    stringLabel.textContent = `${openNote} (${stringCount - i})`;
    string.appendChild(stringLabel);

    if (fretStart === 0) {
      const openFret = document.createElement("div");
      openFret.className = "fret open";
      const noteOpen = normalizeNote(openNote);

      if (inputNotes.includes(noteOpen)) {
        const marker = document.createElement("div");
        marker.className = "note-marker";
        marker.style.backgroundColor = noteColors[noteOpen] || "#999";
        marker.textContent = noteOpen;
        const relation = relationMap.get(`${i}:0`);
        if (relation?.start) {
          openFret.classList.add("relation-start");
          marker.classList.add("relation-start");
        }
        if (relation?.target) {
          openFret.classList.add("relation-target");
          marker.classList.add("relation-target");
        }
        openFret.appendChild(marker);
        elementMap.set(`${i}:0`, openFret);
      }

      string.appendChild(openFret);

      const nut = document.createElement("div");
      nut.className = "fret nut";
      nut.textContent = "║";
      string.appendChild(nut);
    }

    for (let fret = fretStart === 0 ? 1 : fretStart; fret <= fretEnd; fret++) {
      const note = allNotes[(noteIndex(openNote) + fret) % 12];
      const fretDiv = document.createElement("div");
      fretDiv.className = "fret";

      if (i === Math.floor(stringCount / 2)) {
        if (fret === 12) {
          fretDiv.classList.add("double-dot");
        } else if (fretMarkers.includes(fret)) {
          const dot = document.createElement("div");
          dot.className = "dot";
          fretDiv.appendChild(dot);
        }
      }

      if (inputNotes.includes(normalizeNote(note))) {
        const marker = document.createElement("div");
        marker.className = "note-marker";
        marker.style.backgroundColor = noteColors[note] || "#999";
        marker.textContent = note;
        const relation = relationMap.get(`${i}:${fret}`);
        if (relation?.start) {
          fretDiv.classList.add("relation-start");
          marker.classList.add("relation-start");
        }
        if (relation?.target) {
          fretDiv.classList.add("relation-target");
          marker.classList.add("relation-target");
        }
        fretDiv.appendChild(marker);
        elementMap.set(`${i}:${fret}`, fretDiv);
      }

      string.appendChild(fretDiv);
    }

    const totalFrets = fretEnd - (fretStart === 0 ? 1 : fretStart) + 1;
    const openNutCols = fretStart === 0 ? '40px 40px ' : '';
    string.style.gridTemplateColumns = `60px ${openNutCols}${'40px '.repeat(totalFrets)}`;

    container.appendChild(string);
  }

  // 🎼 Tablatura
  let tablatureLines = [];

  for (let i = stringCount - 1; i >= 0; i--) {
    const openNote = tuning[i];
    let line = openNote.toLowerCase() + "|";

    for (let fret = fretStart; fret <= fretEnd; fret++) {
      const note = allNotes[(noteIndex(openNote) + fret) % 12];
      if (inputNotes.includes(normalizeNote(note))) {
        line += fret < 10 ? `-${fret}-` : `${fret}-`;
      } else {
        line += "---";
      }
    }

    tablatureLines.push(line);
  }

  document.getElementById("tablature").textContent = tablatureLines.join("\n");
  document.getElementById("fretboard-wrapper").scrollLeft = 0;

  if (visualizationMode) {
    container.classList.add("visualization-mode");
    drawVisualizationOverlay(elementMap, relationPairs);
  } else {
    container.classList.remove("visualization-mode");
    clearVisualizationOverlay();
  }

  showSuggestedScalesFromInput?.();
  suggestChordsFromInput?.();
  if (typeof highlightPianoNotes === "function") highlightPianoNotes();
}

function copyCurrentTab() {
  const tabText = document.getElementById("tablature")?.textContent?.trim();

  if (!tabText) {
    alert("❌ No hay tablatura para copiar.");
    return;
  }

  navigator.clipboard.writeText(tabText)
    .then(() => alert("✅ Tablatura copiada al portapapeles"))
    .catch(err => alert("❌ Error al copiar: " + err));
}

function highlightShapeOnFretboard(shape, targetNotes, tuning) {
  const container = document.getElementById("fretboard");
  container.innerHTML = "";

  const stringCount = tuning.length;
  const fretStart = parseInt(document.getElementById("fretStart").value) || 0;
  const fretEnd = parseInt(document.getElementById("fretEnd").value) || 12;
  const invert = document.getElementById("invertFretboard")?.checked;
  const stringIndices = invert
    ? [...Array(stringCount).keys()].reverse()
    : [...Array(stringCount).keys()];

  container.style.gridTemplateRows = `repeat(${stringCount}, 40px)`;

  for (const i of stringIndices) {
    const string = document.createElement("div");
    string.className = "string";

    const label = document.createElement("div");
    label.className = "fret-label";
    label.textContent = `${tuning[i]} (${stringCount - i})`;
    string.appendChild(label);

    const totalFrets = fretEnd - (fretStart === 0 ? 1 : fretStart) + 1;
    const openNutCols = fretStart === 0 ? '40px 40px ' : '';
    string.style.gridTemplateColumns = `60px ${openNutCols}${'40px '.repeat(totalFrets)}`;

    // 🎯 Pintar cuerda al aire si aplica
    if (fretStart === 0) {
      const openFret = document.createElement("div");
      openFret.className = "fret open";

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

      const nut = document.createElement("div");
      nut.className = "fret nut";
      nut.textContent = "║";
      string.appendChild(nut);
    }

    for (let fret = fretStart === 0 ? 1 : fretStart; fret <= fretEnd; fret++) {
      const fretDiv = document.createElement("div");
      fretDiv.className = "fret";

      // puntos de referencia
      if (i === Math.floor(stringCount / 2)) {
        if (fret === 12) {
          fretDiv.classList.add("double-dot");
        } else if (fretMarkers.includes(fret)) {
          const dot = document.createElement("div");
          dot.className = "dot";
          fretDiv.appendChild(dot);
        }
      }

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

    container.appendChild(string);
  }

  // 🧾 Tablatura generada desde el shape
  const tabLines = [];
  for (let i = stringCount - 1; i >= 0; i--) {
    const open = tuning[i][0].toLowerCase();
    const fret = shape[i];
    let line = open + "|";

    for (let f = fretStart; f <= fretEnd; f++) {
      if (f === fret) {
        line += f < 10 ? `-${f}-` : `${f}-`;
      } else {
        line += "---";
      }
    }

    tabLines.push(line);
  }

  document.getElementById("tablature").textContent = tabLines.join("\n");
}
