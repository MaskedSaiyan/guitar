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
