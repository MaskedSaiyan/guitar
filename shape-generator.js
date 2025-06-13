// shape-generator.js

const chordShapes = window.chordShapes;


// 🎯 Busca forma exacta si está definida
function getChordShape(chordName) {
  const cleanName = chordName.trim();
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

