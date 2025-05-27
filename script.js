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
  const instrument = document.getElementById("instrumentSelect").value;
  const tuningName = document.getElementById("tuningSelect").value;
  const tuning = tuningsByInstrument[instrument][tuningName];

  const notes = document.getElementById("notesInput").value
    .trim()
    .toUpperCase()
    .split(/\s+/)
    .map(normalizeNote);

  const fretStart = parseInt(document.getElementById("fretStart").value) || 0;
  const fretEnd = parseInt(document.getElementById("fretEnd").value) || 12;

  const strings = tuning.length;
  const frets = fretEnd - fretStart + 1;

  const wrapper = document.getElementById("fretboard-wrapper");
  const fretboard = document.getElementById("fretboard");
  fretboard.innerHTML = "";

  const table = document.createElement("table");

  for (let i = 0; i < strings; i++) {
    const row = document.createElement("tr");

    for (let f = fretStart; f <= fretEnd; f++) {
      const cell = document.createElement("td");
      const note = getNoteFromStringFret(tuning[i], f);
      cell.textContent = note;

      if (notes.includes(note)) {
        cell.classList.add("highlight");
      }

      if (f === fretStart) {
        cell.style.borderLeft = "2px solid black";
      }
      if (f === fretEnd) {
        cell.style.borderRight = "2px solid black";
      }

      row.appendChild(cell);
    }

    table.appendChild(row);
  }

  fretboard.appendChild(table);
}


function highlightFretboard(scaleNotes, rootNote) {
  const frets = document.querySelectorAll('.fret');
  frets.forEach(fret => {
    const noteEl = fret.querySelector('span');
    const note = noteEl ? noteEl.textContent : null;
    if (note && scaleNotes.includes(note)) {
      fret.classList.add('active');
      if (note === rootNote) {
        fret.classList.add('root');
      } else {
        fret.classList.remove('root');
      }
    } else {
      fret.classList.remove('active');
      fret.classList.remove('root');
    }
  });
}

