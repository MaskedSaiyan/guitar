function getExpandedNotesFromInput() {
  const rawInput = document.getElementById("notesInput").value
    .trim()
    .split(/\s+/)
    .filter(n => n);

  let result = [];

  rawInput.forEach(token => {
    if (token.length === 1 || (token.length === 2 && /[#b]/.test(token[1]))) {
      result.push(normalizeNote(token));
    } else {
      const notes = chordToNotes(token);
      if (notes.length > 0) {
        result.push(...notes);
      } else {
        result.push(normalizeNote(token));
      }
    }
  });

  return result;
}

