let circleInitialized = false;

function initCircleOfFifths() {
  if (circleInitialized) return;
  circleInitialized = true;

  const rootCircle = document.getElementById("circleOfFifths");
  const svgNS = "http://www.w3.org/2000/svg";
  const radius = 150;
  const center = 200;
  const notes = ["C", "G", "D", "A", "E", "B", "F#", "Db", "Ab", "Eb", "Bb", "F"];
  const minorNotes = ["A", "E", "B", "F#", "C#", "G#", "D#", "Bb", "F", "C", "G", "D"];

  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("width", 400);
  svg.setAttribute("height", 400);
  svg.style.border = "1px solid #ccc";
  rootCircle.appendChild(svg);

  // Notas mayores (afuera)
  notes.forEach((note, i) => {
    const angle = (i / 12) * (2 * Math.PI) - Math.PI / 2;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);

    const text = document.createElementNS(svgNS, "text");
    text.setAttribute("x", x);
    text.setAttribute("y", y);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "middle");
    text.setAttribute("font-size", "16");
    text.setAttribute("fill", "#333");
    text.setAttribute("class", "outer");
    text.style.cursor = "pointer";
    text.textContent = note;

    text.addEventListener("click", () => {
      document.getElementById("rootSelect").value = note.replace("b", "#") === "Db" ? "C#" : note;
      updateNotesDisplay();
      showCircleChords(note);
    });

    svg.appendChild(text);
  });

  // Notas menores (adentro)
  minorNotes.forEach((note, i) => {
    const angle = (i / 12) * (2 * Math.PI) - Math.PI / 2;
    const x = center + (radius - 40) * Math.cos(angle);
    const y = center + (radius - 40) * Math.sin(angle);

    const text = document.createElementNS(svgNS, "text");
    text.setAttribute("x", x);
    text.setAttribute("y", y);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "middle");
    text.setAttribute("font-size", "12");
    text.setAttribute("fill", "#666");
    text.setAttribute("class", "inner");
    text.style.cursor = "pointer";
    text.textContent = note;

    text.addEventListener("click", () => {
      const mapped = note === "Bb" ? "A#" : note;
      document.getElementById("rootSelect").value = mapped;
      updateNotesDisplay();
      showCircleChords(note);
    });

    svg.appendChild(text);
  });

  const centerText = document.createElementNS(svgNS, "text");
  centerText.setAttribute("x", center);
  centerText.setAttribute("y", center);
  centerText.setAttribute("text-anchor", "middle");
  centerText.setAttribute("font-size", "12");
  centerText.setAttribute("fill", "#aaa");
  centerText.textContent = "Mayor afuera, menor adentro";
  svg.appendChild(centerText);
}

function showCircleChords(rootNote) {
  const allNotes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const normalize = n => (n === "Db" ? "C#" : n === "Bb" ? "A#" : n);
  const rootIndex = allNotes.indexOf(normalize(rootNote));
  const I = allNotes[rootIndex];
  const IV = allNotes[(rootIndex + 5) % 12];
  const V = allNotes[(rootIndex + 7) % 12];
  const relativeMinor = allNotes[(rootIndex + 9) % 12]; // 6º grado de la mayor

  const box = document.getElementById("circleChords") || (() => {
    const div = document.createElement("div");
    div.id = "circleChords";
    div.style.marginTop = "1em";
    div.style.fontSize = "0.95em";
    div.style.color = "#333";
    document.getElementById("circleOfFifths").appendChild(div);
    return div;
  })();

  box.innerHTML = `
    <strong>🎶 Progresión I – IV – V en ${I} mayor:</strong><br>
    • I: ${I} – Mayor<br>
    • IV: ${IV} – Mayor<br>
    • V: ${V} – Mayor<br>
    • Relativa menor: ${relativeMinor} menor
  `;

  // Rellenar notesInput con la escala mayor
  const notesInScale = [0, 2, 4, 5, 7, 9, 11].map(
    i => allNotes[(rootIndex + i) % 12]
  );
  document.getElementById("notesInput").value = notesInScale.join(" ");
  if (typeof drawFretboard === 'function') drawFretboard();

  // 🎨 Resaltado visual (sólo en notas mayores y menores)
  const textNodes = document.querySelectorAll("#circleOfFifths text");
  textNodes.forEach(el => {
    el.setAttribute("fill", el.classList.contains("outer") ? "#333" : "#666");
    el.setAttribute("font-weight", "normal");
  });

  textNodes.forEach(el => {
    const txt = el.textContent;
    const norm = normalize(txt);
    if (el.classList.contains("outer")) {
      if (norm === I) {
        el.setAttribute("fill", "#d4af37"); // dorado
        el.setAttribute("font-weight", "bold");
      } else if (norm === IV) {
        el.setAttribute("fill", "#00aaff"); // azul
        el.setAttribute("font-weight", "bold");
      } else if (norm === V) {
        el.setAttribute("fill", "#00cc66"); // verde
        el.setAttribute("font-weight", "bold");
      }
    }
    if (el.classList.contains("inner") && norm === relativeMinor) {
      el.setAttribute("fill", "#aa00ff"); // púrpura
      el.setAttribute("font-weight", "bold");
    }
  });
}
