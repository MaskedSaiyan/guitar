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

function getExpandedNotesFromInput() {
  const input = document.getElementById("notesInput").value;
  return input.trim().toUpperCase().split(/\s+/).map(normalizeNote);
}


function updateFretWindow() {
  const start = parseInt(document.getElementById("fretStart").value);
  const end = parseInt(document.getElementById("fretEnd").value);
  document.getElementById("fretStartLabel").textContent = start;
  document.getElementById("fretEndLabel").textContent = end;
}
