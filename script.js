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

function noteIndex(note) {
  return allNotes.indexOf(normalizeNote(note));
}

function updateTuningOptions() {
  const instrument = document.getElementById("instrumentSelect").value;
  const tuningSelect = document.getElementById("tuningSelect");
  tuningSelect.innerHTML = "";

  const options = tuningsByInstrument[instrument];
  for (const name in options) {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    tuningSelect.appendChild(opt);
  }

  drawFretboard();
  highlightPianoNotes();
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
  const tuning = tuningsByInstrument[instrument][tuningName];
  const stringCount = tuning.length;

  const fretStart = parseInt(document.getElementById("fretStart").value) || 0;
  const fretEnd = parseInt(document.getElementById("fretEnd").value) || 12;
  const invert = document.getElementById("invertFretboard")?.checked;
  const stringIndices = invert
    ? [...Array(stringCount).keys()].reverse()
    : [...Array(stringCount).keys()];

  const useShapeMode = document.getElementById("shapeMode")?.checked;

  // 🎯 Modo forma exacta
  if (useShapeMode && inputNotes.length > 0) {
    const rawInputText = document.getElementById("notesInput")?.value?.trim();
    const shapeData = typeof getChordShape === "function" ? getChordShape(rawInputText) : null;

    if (shapeData) {
      const shapeArray = new Array(tuning.length).fill(null);
      const notesArray = new Array(tuning.length).fill(null);

      shapeData.forEach(pos => {
        if (pos.string < tuning.length) {
          shapeArray[pos.string] = pos.fret;
          notesArray[pos.string] = pos.note || "";
        }
      });

      highlightShapeOnFretboard(shapeArray, notesArray, tuning.map(t => t + "2"));
      return;
    }

    // Si no hay forma exacta, usar cálculo
    const baseOctave = 2;
    const tuningWithOctave = tuning.map((note, i) => note + (2 + i));
    const targetNotes = tuning.map((_, i) => {
      const base = inputNotes[i % inputNotes.length];
      const octave = baseOctave + Math.floor(i / inputNotes.length);
      return base + octave;
    });

    const shape = shapeFromNotes(targetNotes, tuningWithOctave);
    highlightShapeOnFretboard(shape, targetNotes, tuningWithOctave);
    return;
  }

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
        openFret.appendChild(marker);
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
        fretDiv.appendChild(marker);
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
  showSuggestedScalesFromInput?.();
  suggestChordsFromInput?.();
  if (typeof highlightPianoNotes === "function") highlightPianoNotes();
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

