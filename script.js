const standardTunings = {
  6: ["E", "A", "D", "G", "B", "E"],
  7: ["B", "E", "A", "D", "G", "B", "E"],
  4: ["E", "A", "D", "G"]
};

const allNotes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function noteIndex(note) {
  return allNotes.indexOf(note.toUpperCase());
}

function findNotes() {
  const input = document.getElementById("notesInput").value.trim().toUpperCase().split(/\s+/);
  const strings = parseInt(document.getElementById("stringCount").value);
  const tuning = standardTunings[strings];

  let result = "";

  tuning.forEach((openNote, stringIndex) => {
    result += `\nCuerda ${strings - stringIndex} (${openNote}):\n`;
    for (let fret = 0; fret <= 12; fret++) {
      const noteAtFret = allNotes[(noteIndex(openNote) + fret) % 12];
      if (input.includes(noteAtFret)) {
        result += ` traste ${fret}: ${noteAtFret}\n`;
      }
    }
  });

  document.getElementById("output").textContent = result;
}
