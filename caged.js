const cagedShapes = {
  "C": [8, 7, 5, 5, 5, 8],
  "A": [0, 0, 2, 2, 1, 0],
  "G": [3, 2, 0, 0, 0, 3],
  "E": [0, 2, 2, 1, 0, 0],
  "D": [null, null, 0, 2, 3, 2],
};

function showCagedChord(root = "C") {
  const shapeName = "C"; // 🔧 Cambiar dinámicamente en el futuro
  const shapeFrets = cagedShapes[shapeName];
  const notes = [];

  const baseFrets = {
    "E": ["E", "A", "D", "G", "B", "E"]
  };

  const tuning = baseFrets["E"];

  shapeFrets.forEach((fret, stringIndex) => {
    if (fret !== null) {
      const openNote = tuning[stringIndex];
      const idx = allNotes.indexOf(openNote);
      const note = allNotes[(idx + fret) % 12];
      notes.push(note);
    }
  });

  document.getElementById("notesInput").value = notes.join(" ");
  document.getElementById("instrumentSelect").value = "guitar6";
  document.getElementById("tuningSelect").value = "Standard (E A D G B E)";
  drawFretboard();
}

