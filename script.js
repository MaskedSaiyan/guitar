const standardTunings = {
  6: ["E", "A", "D", "G", "B", "E"],
  7: ["B", "E", "A", "D", "G", "B", "E"],
  4: ["E", "A", "D", "G"]
};

const allNotes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const fretMarkers = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24];

const noteColors = {
  "C": "#ff6b6b",
  "C#": "#ffa502",
  "D": "#feca57",
  "D#": "#1dd1a1",
  "E": "#54a0ff",
  "F": "#5f27cd",
  "F#": "#576574",
  "G": "#10ac84",
  "G#": "#00d2d3",
  "A": "#ff9ff3",
  "A#": "#c56cf0",
  "B": "#00cec9"
};

function noteIndex(note) {
  return allNotes.indexOf(note.toUpperCase());
}

function drawFretboard() {
  const container = document.getElementById("fretboard");
  container.innerHTML = "";

  const inputNotes = document.getElementById("notesInput").value.trim().toUpperCase().split(/\s+/);
  const stringCount = parseInt(document.getElementById("stringCount").value);
  const tuning = standardTunings[stringCount];

  container.style.gridTemplateRows = `repeat(${stringCount}, 40px)`;

  for (let i = 0; i < stringCount; i++) {
    const openNote = tuning[i];
    const string = document.createElement("div");
    string.className = "string";

    // Mostrar la nota abierta + número de cuerda
    const stringLabel = document.createElement("div");
    stringLabel.className = "fret-label";
    stringLabel.textContent = `${openNote} (${stringCount - i})`;
    string.appendChild(stringLabel);

    for (let fret = 0; fret <= 24; fret++) {
      const note = allNotes[(noteIndex(openNote) + fret) % 12];
      const fretDiv = document.createElement("div");
      fretDiv.className = "fret";

      if (fret === 0) {
        fretDiv.textContent = "0";
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

      if (inputNotes.includes(note)) {
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
}
