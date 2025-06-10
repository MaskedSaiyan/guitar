// shape-generator.js

// 🎯 POWER CHORDS DEFINIDOS
const chordShapes = {
  "E5": [
    { string: 0, fret: 0, note: "E" },
    { string: 1, fret: 2, note: "B" },
    { string: 2, fret: 2, note: "E" }
  ],
  "A5": [
    { string: 1, fret: 0, note: "A" },
    { string: 2, fret: 2, note: "E" },
    { string: 3, fret: 2, note: "A" }
  ],
  "D5": [
    { string: 2, fret: 0, note: "D" },
    { string: 3, fret: 2, note: "A" },
    { string: 4, fret: 3, note: "D" }
  ],
  "C5": [
    { string: 1, fret: 3, note: "C" },
    { string: 2, fret: 5, note: "G" },
    { string: 3, fret: 5, note: "C" }
  ],
  "G5": [
    { string: 0, fret: 3, note: "G" },
    { string: 1, fret: 5, note: "D" },
    { string: 2, fret: 5, note: "G" }
  ],
  "F5": [
      { string: 0, fret: 1, note: "F" },
      { string: 1, fret: 3, note: "C" },
      { string: 2, fret: 3, note: "F" }
  ]
};

// 🎯 Busca forma exacta si está definida
function getChordShape(chordName) {
  const cleanName = chordName.trim().toUpperCase();
  return chordShapes[cleanName] || null;
}

// 🎼 Utilidades para generar shape desde notas
function noteToMidi(note) {
  const map = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const match = note.match(/^([A-G])([b#]?)(\d)$/);
  if (!match) return null;
  let [, letter, accidental, octave] = match;
  let value = map[letter] + (accidental === "#" ? 1 : accidental === "b" ? -1 : 0);
  return 12 * (parseInt(octave) + 1) + value;
}

function fretForNote(openNote, targetNote) {
  const openMidi = noteToMidi(openNote);
  const targetMidi = noteToMidi(targetNote);
  if (openMidi === null || targetMidi === null) return null;
  const fret = targetMidi - openMidi;
  return fret >= 0 && fret <= 24 ? fret : null;
}

function shapeFromNotes(targetNotes, tuning) {
  return tuning.map((openNote, stringIndex) => {
    const targetNote = targetNotes[stringIndex];
    return fretForNote(openNote, targetNote);
  });
}

// Exportación si es necesario
if (typeof window !== "undefined") {
  window.shapeFromNotes = shapeFromNotes;
  window.getChordShape = getChordShape;
}
