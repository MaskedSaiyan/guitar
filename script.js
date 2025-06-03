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
    highlightPianoNotes()
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

  // ⚠️ Solo expandir si tiene un tipo como "m", "7", etc.
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

  container.style.gridTemplateRows = `repeat(${stringCount}, 40px)`;
  const invert = document.getElementById("invertFretboard")?.checked;
const stringIndices = invert
  ? [...Array(stringCount).keys()].reverse()  // de grave a aguda
  : [...Array(stringCount).keys()];           // de aguda a grave

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
const openNutCols = fretStart === 0 ? '40px 40px ' : ''; // open + nut
string.style.gridTemplateColumns = `60px ${openNutCols}${'40px '.repeat(totalFrets)}`;



    container.appendChild(string);
  }

  // Tablatura corregida (solo rango visible)
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


function updateFretWindow() {
  const start = parseInt(document.getElementById("fretStart").value);
  const end = parseInt(document.getElementById("fretEnd").value);
  document.getElementById("fretStartLabel").textContent = start;
  document.getElementById("fretEndLabel").textContent = end;
}

function parseNoteGroups(input) {
  const tokens = input.trim().split(/\s+/);
  const result = [];
  tokens.forEach(token => {
    if (/^\d\([A-G#b\s]+\)$/.test(token)) {
      const stringNum = parseInt(token[0]);
      const innerNotes = token.slice(2, -1).split(/\s+/);
      innerNotes.forEach(note => result.push({ note: normalizeNote(note), string: stringNum }));
    } else if (/^\d[A-G#b]$/.test(token)) {
      result.push({ note: normalizeNote(token.slice(1)), string: parseInt(token[0]) });
    } else {
      result.push({ note: normalizeNote(token), string: null });
    }
  });
  return result;
}

function drawTabEditor() {
  const input = document.getElementById("tabEditorInput").value;
  const parsed = parseNoteGroups(input);
  const instrument = document.getElementById("instrumentSelect").value;
  const tuningName = document.getElementById("tuningSelect").value;
  const tuning = tuningsByInstrument[instrument][tuningName];
  const fretEnd = parseInt(document.getElementById("fretEnd").value) || 12;

  const tabLines = Array(tuning.length).fill("").map((_, i) => tuning[i].toLowerCase() + "|");

  parsed.forEach(({ note, string }) => {
    const stringsToTry = string != null
      ? [tuning.length - string]
      : [...Array(tuning.length).keys()].reverse();

    let placed = false;
    for (const stringIndex of stringsToTry) {
      const openNote = tuning[stringIndex];
      for (let fret = 0; fret <= fretEnd; fret++) {
        const noteAtFret = allNotes[(noteIndex(openNote) + fret) % 12];
        if (normalizeNote(noteAtFret) === note) {
          for (let i = 0; i < tuning.length; i++) {
            tabLines[i] += i === stringIndex
              ? (fret < 10 ? `-${fret}-` : `${fret}-`)
              : "---";
          }
          placed = true;
          break;
        }
      }
      if (placed) break;
    }

    if (!placed) {
      for (let i = 0; i < tuning.length; i++) tabLines[i] += " ? ";
    }
  });

  document.getElementById("tabEditorOutput").textContent = tabLines.join("\n");
}

function saveRiff() {
  const name = document.getElementById("riffName").value.trim();
  const content = document.getElementById("tabEditorInput").value.trim();
  if (!name || !content) return alert("Falta nombre o contenido del riff");

  const li = document.createElement("li");
  li.textContent = `${name}: ${content}`;
  document.getElementById("savedRiffs").appendChild(li);
}

