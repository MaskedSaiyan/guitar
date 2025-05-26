
// Convierte una nota con octava (ej. C4, A#3) a su valor MIDI (0-127)
function noteToMidi(note) {
  const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const match = note.match(/^([A-G]#?)(\d)$/);
  if (!match) return null;
  const [_, pitch, octave] = match;
  const pitchIndex = notes.indexOf(pitch);
  return pitchIndex + 12 * (parseInt(octave) + 1);
}

// Calcula en qué traste de una cuerda está una nota deseada, basado en su nota al aire
function fretForNote(openNote, targetNote) {
  const openMidi = noteToMidi(openNote);
  const targetMidi = noteToMidi(targetNote);
  if (openMidi === null || targetMidi === null) return null;
  const fret = targetMidi - openMidi;
  return fret >= 0 && fret <= 24 ? fret : null;
}

// Genera los trastes correctos para una afinación y un arreglo de notas con octava
function shapeFromNotes(targetNotes, tuning) {
  return tuning.map((openNote, i) => {
    const target = targetNotes[i];
    if (target === null) return null;
    return fretForNote(openNote, target);
  });
}
