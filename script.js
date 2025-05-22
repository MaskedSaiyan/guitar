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

function normalizeNote(note) {
  const upper = note.toUpperCase();
  return enharmonics[upper] || upper;
}

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
}

function drawFretboard() {
  const container = document.getElementById("fretboard");
  container.innerHTML = "";

  const rawInput = document.getElementById("notesInput").value
    .trim()
    .toUpperCase()
    .split(/\s+/)
    .filter(n => n); // limpia vacíos

  const inputNotes = rawInput.map(normalizeNote);

  const instrument = document.getElementById("instrumentSelect").value;
  const tuningName = document.getElementById("tuningSelect").value;
  const tuning = tuningsByInstrument[instrument][tuningName];
  const stringCount = tuning.length;

  container.style.gridTemplateRows = `repeat(${stringCount}, 40px)`;

  for (let i = 0; i < stringCount; i++) {
    const openNote = tuning[i];
    const string = document.createElement("div");
    string.className = "string";

    const stringLabel = document.createElement("div");
    stringLabel.className = "fret-label";
    stringLabel.textContent = `${openNote} (${stringCount - i})`;
    string.appendChild(stringLabel);

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

    for (let fret = 1; fret <= 24; fret++) {
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

    container.appendChild(string);
  }

  // Tablatura
  let tablatureLines = [];

  for (let i = stringCount - 1; i >= 0; i--) {
    const openNote = tuning[i];
    let line = openNote.toLowerCase() + "|";

    for (let fret = 0; fret <= 24; fret++) {
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
}

window.onload = updateTuningOptions;
