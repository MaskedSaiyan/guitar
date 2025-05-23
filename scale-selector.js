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
}

document.addEventListener("DOMContentLoaded", () => {
  populateScaleSelector();
  document.getElementById("rootSelect").addEventListener("change", updateNotesDisplay);
  document.getElementById("scaleSelect").addEventListener("change", updateNotesDisplay);
});
