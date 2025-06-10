# Hola
const cagedPositions = {
  C: [
    // Forma C del acorde C mayor (posición típica alrededor del traste 8)
    { string: 0, fret: 8, note: "C" },
    { string: 1, fret: 8, note: "E" },
    { string: 2, fret: 9, note: "G" },
    { string: 3, fret: 10, note: "C" },
    { string: 4, fret: 10, note: "E" },
    { string: 5, fret: 8, note: "C" }
  ]
};

// 🔦 Resalta solo los trastes especificados y conserva puntos de posición
function highlightExactFrets(positions) {
  const frets = document.querySelectorAll("#fretboard .fret");
  frets.forEach(fret => {
    fret.classList.remove("highlight", "root");
    // Conserva los puntos de traste
    const dots = [...fret.querySelectorAll(".dot, .double-dot")];
    fret.innerHTML = "";
    dots.forEach(dot => fret.appendChild(dot));
  });

  positions.forEach(pos => {
    const stringRow = document.querySelectorAll("#fretboard .string")[pos.string];
    if (!stringRow) return;

    const fretDivs = stringRow.querySelectorAll(".fret");
    const fret = fretDivs[pos.fret];
    if (!fret) return;

    fret.classList.add("highlight");
    if (pos.note === "C") {
      fret.classList.add("root");
    }

    const marker = document.createElement("div");
    marker.className = "note-marker";
    marker.textContent = pos.note;
    marker.style.backgroundColor = noteColors[pos.note] || "#999";
    fret.appendChild(marker);
  });
}

// 🎸 Esta es la función que se llama al presionar el botón CAGED
function showCagedChord() {
  // Forzar afinación estándar
  document.getElementById("instrumentSelect").value = "guitar6";
  updateTuningOptions();
  document.getElementById("tuningSelect").value = "Standard (E A D G B E)";

  // Esperar a que drawFretboard termine y luego aplicar resaltado exacto
  setTimeout(() => {
    drawFretboard();
      highlightPianoNotes();
    highlightExactFrets(cagedPositions["C"]);
  }, 50);
}
