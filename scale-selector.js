const scales = {
  "Major (Ionian)":         [0, 2, 4, 5, 7, 9, 11],
  "Minor (Aeolian)":        [0, 2, 3, 5, 7, 8, 10],
  "Dorian":                 [0, 2, 3, 5, 7, 9, 10],
  "Phrygian":               [0, 1, 3, 5, 7, 8, 10],
  "Phrygian Dominant":      [0, 1, 4, 5, 7, 8, 10],
  "Lydian":                 [0, 2, 4, 6, 7, 9, 11],
  "Mixolydian":             [0, 2, 4, 5, 7, 9, 10],
  "Locrian":                [0, 1, 3, 5, 6, 8, 10],
  "Harmonic Minor":         [0, 2, 3, 5, 7, 8, 11],
  "Melodic Minor (Asc)":    [0, 2, 3, 5, 7, 9, 11]
};

function getScaleNotes(root, intervals) {
  const chromatic = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const rootIndex = chromatic.indexOf(root);
  return intervals.map(i => chromatic[(rootIndex + i) % 12]);
}

function populateScaleSelector() {
  const select = document.getElementById("scaleSelect");
  Object.keys(scales).forEach(name => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    select.appendChild(option);
  });
}

function updateNotesDisplay() {
  const root = document.getElementById("rootSelect").value;
  const scale = document.getElementById("scaleSelect").value;
  const intervals = scales[scale];
  const notes = getScaleNotes(root, intervals);

  document.getElementById("noteOutput").textContent = notes.join(" – ");
  document.getElementById("notesInput").value = notes.join(" ");

  if (typeof highlightFretboard === 'function') {
    highlightFretboard(notes, root);
  }

  if (typeof drawFretboard === 'function') {
    drawFretboard();
  }
}

function showSuggestedScalesFromInput() {
  const input = document.getElementById("notesInput").value
    .trim()
    .toUpperCase()
    .split(/\s+/)
    .map(normalizeNote)
    .filter(n => allNotes.includes(n));

  const suggestionList = document.getElementById("suggestionList");
  suggestionList.innerHTML = "";

  if (input.length === 0) return;

  const matches = [];

  Object.keys(scales).forEach(scaleName => {
    allNotes.forEach(root => {
      const scaleNotes = getScaleNotes(root, scales[scaleName]);
      const matchCount = input.filter(n => scaleNotes.includes(n)).length;

      if (matchCount > 0) {
        const matchPercent = Math.round((matchCount / scaleNotes.length) * 100);
        matches.push({ root, scaleName, matchCount, matchPercent });
      }
    });
  });

  matches
    .sort((a, b) => b.matchPercent - a.matchPercent || b.matchCount - a.matchCount)
    .slice(0, 5)
    .forEach(match => {
      const li = document.createElement("li");
      li.textContent = `${match.root} ${match.scaleName}`;

      const percentSpan = document.createElement("span");
      percentSpan.textContent = ` – ${match.matchPercent}% de coincidencia`;

      if (match.matchPercent >= 90) {
        percentSpan.style.color = "green";
      } else if (match.matchPercent >= 70) {
        percentSpan.style.color = "orange";
      } else {
        percentSpan.style.color = "red";
      }

      li.appendChild(percentSpan);
      suggestionList.appendChild(li);
    });
}

document.addEventListener("DOMContentLoaded", () => {
  populateScaleSelector();
  document.getElementById("rootSelect").addEventListener("change", updateNotesDisplay);
  document.getElementById("scaleSelect").addEventListener("change", updateNotesDisplay);
});

function suggestChordsFromInput() {
  const input = document.getElementById("notesInput").value
    .trim()
    .toUpperCase()
    .split(/\s+/)
    .map(normalizeNote)
    .filter(n => allNotes.includes(n));

  const chordList = document.getElementById("chordList");
  chordList.innerHTML = "";

  if (input.length < 2 || input.length > 4) return;

  const chords = [];

  allNotes.forEach(root => {
    const major = [0, 4, 7].map(i => allNotes[(noteIndex(root) + i) % 12]);
    const minor = [0, 3, 7].map(i => allNotes[(noteIndex(root) + i) % 12]);
    const power = [0, 7].map(i => allNotes[(noteIndex(root) + i) % 12]);

    const inputSet = new Set(input);

    const containsAll = notes => notes.every(n => inputSet.has(n));

    if (containsAll(major)) {
      chords.push(`${root} mayor`);
    }
    if (containsAll(minor)) {
      chords.push(`${root} menor`);
    }
    if (containsAll(power)) {
      chords.push(`${root}5 (power chord)`);
    }
  });

  if (chords.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Sin acordes claros, prueba con más notas";
    chordList.appendChild(li);
  } else {
    chords.slice(0, 5).forEach(chord => {
      const li = document.createElement("li");
      li.textContent = chord;
      chordList.appendChild(li);
    });
  }
}

