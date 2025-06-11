// shape-generator.js

// 🎯 POWER CHORDS DEFINIDOS
const chordShapes = {
  "C": [
    { string: 0, fret: -1, note: null },
    { string: 1, fret: 3, note: "C" },
    { string: 2, fret: 2, note: "E" },
    { string: 3, fret: 0, note: "G" },
    { string: 4, fret: 1, note: "C" },
    { string: 5, fret: 0, note: "E" }
  ],

"D": [
  { string: 0, fret: -1, note: null },  // E (6) apagada
  { string: 1, fret: -1, note: null },  // A (5) apagada
  { string: 2, fret: 0, note: "D" },    // D (4)
  { string: 3, fret: 2, note: "A" },    // G (3)
  { string: 4, fret: 3, note: "D" },    // B (2)
  { string: 5, fret: 2, note: "F#" }    // E (1)
  ],
  "E": [
    { string: 0, fret: 0, note: "E" },
    { string: 1, fret: 2, note: "B" },
    { string: 2, fret: 2, note: "E" },
    { string: 3, fret: 1, note: "G#" },
    { string: 4, fret: 0, note: "B" },
    { string: 5, fret: 0, note: "E" }
  ],
  "G": [
    { string: 0, fret: 3, note: "G" },
    { string: 1, fret: 2, note: "B" },
    { string: 2, fret: 0, note: "D" },
    { string: 3, fret: 0, note: "G" },
    { string: 4, fret: 0, note: "B" },
    { string: 5, fret: 3, note: "G" }
  ],
  "A": [
    { string: 0, fret: -1, note: null },
    { string: 1, fret: 0, note: "A" },
    { string: 2, fret: 2, note: "E" },
    { string: 3, fret: 2, note: "A" },
    { string: 4, fret: 2, note: "C#" },
    { string: 5, fret: 0, note: "A" }
  ],
  "F": [
    { string: 0, fret: 1, note: "F" },
    { string: 1, fret: 3, note: "C" },
    { string: 2, fret: 3, note: "F" },
    { string: 3, fret: 2, note: "A" },
    { string: 4, fret: 1, note: "C" },
    { string: 5, fret: 1, note: "F" }
  ],
  "B": [
    { string: 0, fret: -1, note: null },
    { string: 1, fret: 2, note: "B" },
    { string: 2, fret: 4, note: "F#" },
    { string: 3, fret: 4, note: "B" },
    { string: 4, fret: 4, note: "D#" },
    { string: 5, fret: 2, note: "B" }
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




function findAllPowerChordShapes(rootNote, tuning, maxFret = 12) {
  const shapes = [];
  const chromatic = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const rootIndex = chromatic.indexOf(rootNote);

  if (rootIndex === -1) return [];

  const fifthNote = chromatic[(rootIndex + 7) % 12];

  for (let string = 0; string < tuning.length - 1; string++) {
    const openRoot = tuning[string];
    const openFifth = tuning[string + 1];

    const isGBpair = openRoot === "G" && openFifth === "B";
    const fretOffset = isGBpair ? 3 : 2;

    for (let fret = 0; fret <= maxFret - fretOffset; fret++) {
      const root = chromatic[(noteIndex(openRoot) + fret) % 12];
      const fifth = chromatic[(noteIndex(openFifth) + fret + fretOffset) % 12];

      if (root === rootNote && fifth === fifthNote) {
        shapes.push([
          { string, fret, note: root },
          { string: string + 1, fret: fret + fretOffset, note: fifth }
        ]);
      }
    }
  }

  return shapes;
}

