const standardTunings = {
  6: ["E", "A", "D", "G", "B", "E"],
  7: ["B", "E", "A", "D", "G", "B", "E"],
  4: ["E", "A", "D", "G"]
};

const allNotes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const fretMarkers = [3, 5, 7, 9, 12];

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

    for (let fret = 0; fret <= 12; fret++) {
      const note = allNotes[(noteIndex(openNote) + fret) % 12];
      const fretDiv = document.createElement("div");
      fretDiv.className = "fret";

      // Dots visuales del diapasón
      if (i === Math.floor(stringCount / 2) && fretMarkers.includes(fret)) {
        const dot = document.createElement("div");
        dot.className = "dot";
        fretDiv.appendChild(dot);
      }

      // Marcar nota buscada
      if (inputNotes.includes(note)) {
        const marker = document.createElement("div");
        marker.className = "note-marker";
        marker.textContent = note;
        fretDiv.appendChild(marker);
      }

      string.appendChild(fretDiv);
    }

    container.appendChild(string);
  }
}
