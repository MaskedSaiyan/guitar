const cagedPositions = {
  C: [
    // Forma C (C mayor) — traste 8 aprox.
    { string: 0, fret: 8, note: "C" },
    { string: 1, fret: 8, note: "E" },
    { string: 2, fret: 9, note: "G" },
    { string: 3, fret: 10, note: "C" },
    { string: 4, fret: 10, note: "E" },
    { string: 5, fret: 8, note: "C" }
  ]
};

// Esta función limpia y pinta solo los trastes indicados
function highlightExactFrets(positions) {
  const frets = document.querySelectorAll("#fretboard .fret");
  frets.forEach(fret => {
    fret.classList.remove("highlight", "root");
    fret.innerHTML = ""; // Limpia notas previas si hay
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

// Esta es la función que llamas desde tu botón en el tab CAGED
function showCagedChord() {
  // 🔒 Forzamos afinación estándar
  document.getElementById("instrumentSelect").value = "guitar6";
  updateTuningOptions();
  document.getElementById("tuningSelect").value = "Standard (E A D G B E)";

  // ⏳ Esperamos a que drawFretboard termine
  setTimeout(() => {
    drawFretboard(); // Asegura que esté dibujado completo
    highlightExactFrets(cagedPositions["C"]); // Solo pintamos C forma C
  }, 50);
}
