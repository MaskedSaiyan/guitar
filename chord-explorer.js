// Diccionario de acordes con notas absolutas (nota + octava) por cuerda 6→1
const chordAbsoluteShapes = {
  "E":  ["E2", "B2", "E3", "G#3", "B3", "E4"],
  "Em": ["E2", "B2", "E3", "G3",  "B3", "E4"],
  "Am": [null, "A2", "E3", "A3", "C4", "E4"],
  "A":  [null, "A2", "E3", "A3", "C#4", "E4"],
  "D":  [null, null, "D3", "A3", "D4", "F#4"],
  "Dm": [null, null, "D3", "A3", "D4", "F4"],
  "C":  [null, "C3", "E3", "G3", "C4", "E4"],
  "G":  ["G2", "B2", "D3", "G3", "B3", "G4"]
  // Puedes agregar más aquí
};

function renderChordExplorer() {
  const root = document.getElementById("chordRootSelect").value;
  const container = document.getElementById("chordExplorer");
  container.innerHTML = "";

  const suffixes = ["", "m"]; // puedes agregar más: "7", "maj7", etc.

  suffixes.forEach(suffix => {
    const chord = root + suffix;
    const btn = document.createElement("button");
    btn.textContent = chord;
    btn.className = "chord-button";
    btn.onclick = () => {
      if (!chordAbsoluteShapes[chord]) {
        alert("Shape no definido para: " + chord);
        return;
      }

      const tuning = getCurrentTuning(); // debe obtener la afinación actual con octavas
      const frets = shapeFromNotes(chordAbsoluteShapes[chord], tuning);
      applyShapeToFretboard(frets, chord);
    };
    container.appendChild(btn);
  });
}

// Simula afinación estándar (deberías conectar esto con tu UI)
function getCurrentTuning() {
  return ["E2", "A2", "D3", "G3", "B3", "E4"];
}

// Pinta solo los trastes del shape en el mástil
function applyShapeToFretboard(fretArray, label) {
  const fretboard = document.getElementById("fretboard");
  if (!fretboard) return;

  fretboard.querySelectorAll(".fret").forEach(f => {
    f.innerHTML = "";
    f.classList.remove("active");
  });

  const strings = fretboard.querySelectorAll(".string");
  fretArray.forEach((fret, i) => {
    if (fret === null) return;
    const string = strings[i];
    if (!string) return;
    const frets = string.querySelectorAll(".fret");
    if (frets[fret]) {
      const marker = document.createElement("div");
      marker.className = "note-marker";
      marker.textContent = label[0]; // muestra "A", "E", etc.
      frets[fret].appendChild(marker);
    }
  });

  // Opcional: limpia la tablatura y notasInput
  document.getElementById("notesInput").value = label;
  document.getElementById("tablature").textContent = "";
}
