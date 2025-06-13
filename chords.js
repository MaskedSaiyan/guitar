// chords.js – Traduce nombres de acordes a notas individuales

const chordFormulas = {
  "": [0, 4, 7],            // Mayor
  "m": [0, 3, 7],           // Menor
  "5": [0, 7],              // Power chord
  "sus2": [0, 2, 7],
  "sus4": [0, 5, 7],
  "7": [0, 4, 7, 10],
  "m7": [0, 3, 7, 10],
  "maj7": [0, 4, 7, 11],
  "dim": [0, 3, 6],
  "aug": [0, 4, 8],
  "6": [0, 4, 7, 9],
  "m6": [0, 3, 7, 9],
  "9": [0, 4, 7, 10, 14],
  "m9": [0, 3, 7, 10, 14],
  "maj9": [0, 4, 7, 11, 14],
  "add9": [0, 4, 7, 14],
  "7sus4": [0, 5, 7, 10],
  "dim7": [0, 3, 6, 9],
  "m7b5": [0, 3, 6, 10]
};

const chromatic = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function normalizeNote(note) {
  const flats = {
    "Db": "C#",
    "Eb": "D#",
    "Gb": "F#",
    "Ab": "G#",
    "Bb": "A#"
  };
  return flats[note] || note;
}

function chordToNotes(chordName) {
  const match = chordName.match(/^([A-G]#?|[A-G]b)(.*)$/);
  if (!match) return [];

  const root = normalizeNote(match[1]);
  const type = match[2];
  const rootIndex = chromatic.indexOf(root);
  if (rootIndex === -1 || !chordFormulas[type]) return [];

  return chordFormulas[type].map(semitones => 
    chromatic[(rootIndex + semitones) % 12]
  );
}

window.chordShapes = {
  "C": [
    { string: 0, fret: -1, note: null },
    { string: 1, fret: 3, note: "C" },
    { string: 2, fret: 2, note: "E" },
    { string: 3, fret: 0, note: "G" },
    { string: 4, fret: 1, note: "C" },
    { string: 5, fret: 0, note: "E" }
  ],

  "Cm": [
    { string: 0, fret: -1, note: null },
    { string: 1, fret: 3, note: "C" },
    { string: 2, fret: 1, note: "D#" },
    { string: 3, fret: 0, note: "G" },
    { string: 4, fret: 1, note: "C" },
    { string: 5, fret: 3, note: "G" }
  ],
  "C7": [
    { string: 0, fret: -1, note: null },
    { string: 1, fret: 1, note: "C" },
    { string: 2, fret: 0, note: "E" },
    { string: 3, fret: 0, note: "G" },
    { string: 4, fret: 3, note: "A#" },
    { string: 5, fret: 1, note: "C" }
  ],
  "Cm7": [
    { string: 0, fret: -1, note: null },
    { string: 1, fret: 3, note: "C" },
    { string: 2, fret: 1, note: "D#" },
    { string: 3, fret: 3, note: "A#" },
    { string: 4, fret: 1, note: "C" },
    { string: 5, fret: 3, note: "G" }
  ],
  "Cmaj7": [
    { string: 0, fret: -1, note: null },
    { string: 1, fret: 0, note: "B" },
    { string: 2, fret: 0, note: "E" },
    { string: 3, fret: 0, note: "G" },
    { string: 4, fret: 2, note: "B" },
    { string: 5, fret: 3, note: "C" }
  ],
  "Cdim": [
    { string: 0, fret: -1, note: null },
    { string: 1, fret: 1, note: "C" },
    { string: 2, fret: 0, note: "D#" },
    { string: 3, fret: 1, note: "F#" },
    { string: 4, fret: 0, note: "A" },
    { string: 5, fret: -1, note: null }
  ],
  "Caug": [
    { string: 0, fret: -1, note: null },
    { string: 1, fret: 1, note: "C" },
    { string: 2, fret: 1, note: "E" },
    { string: 3, fret: 1, note: "G#" },
    { string: 4, fret: 3, note: "C" },
    { string: 5, fret: -1, note: null }
  ],
  "Csus2": [
    { string: 0, fret: -1, note: null },
    { string: 1, fret: 3, note: "C" },
    { string: 2, fret: 0, note: "D" },
    { string: 3, fret: 0, note: "G" },
    { string: 4, fret: 3, note: "C" },
    { string: 5, fret: 3, note: "G" }
  ],
  "Csus4": [
    { string: 0, fret: -1, note: null },
    { string: 1, fret: 1, note: "C" },
    { string: 2, fret: 1, note: "F" },
    { string: 3, fret: 0, note: "G" },
    { string: 4, fret: 3, note: "C" },
    { string: 5, fret: 1, note: "C" }
  ],
  "Cadd9": [
    { string: 0, fret: 3, note: "G" },
    { string: 1, fret: 3, note: "C" },
    { string: 2, fret: 0, note: "D" },
    { string: 3, fret: 0, note: "G" },
    { string: 4, fret: 2, note: "E" },
    { string: 5, fret: 3, note: "C" }
  ],

  "C5": [
    { string: 0, fret: -1, note: null },  // E6 apagada
    { string: 1, fret: 3, note: "C" },    // A5
    { string: 2, fret: 5, note: "G" },    // D4
    { string: 3, fret: -1, note: null },  // G3 apagada
    { string: 4, fret: -1, note: null },  // B2 apagada
    { string: 5, fret: -1, note: null }   // E1 apagada
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
  ],

     "Am": [
  { string: 0, fret: -1, note: null },
  { string: 1, fret: 0, note: "A" },
  { string: 2, fret: 2, note: "E" },
  { string: 3, fret: 2, note: "A" },
  { string: 4, fret: 1, note: "C" },
  { string: 5, fret: 0, note: "A" }
],
"Em": [
  { string: 0, fret: 0, note: "E" },
  { string: 1, fret: 2, note: "B" },
  { string: 2, fret: 2, note: "E" },
  { string: 3, fret: 0, note: "G" },
  { string: 4, fret: 0, note: "B" },
  { string: 5, fret: 0, note: "E" }
],
"Dm": [
  { string: 0, fret: -1, note: null },
  { string: 1, fret: -1, note: null },
  { string: 2, fret: 0, note: "D" },
  { string: 3, fret: 2, note: "A" },
  { string: 4, fret: 3, note: "D" },
  { string: 5, fret: 1, note: "F" }
],

};

