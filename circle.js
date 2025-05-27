let circleInitialized = false;

// ✅ Versión local solo para circle.js
const enharmonicsCircle = {
  "Db": "C#",
  "Eb": "D#",
  "Gb": "F#",
  "Ab": "G#",
  "Bb": "A#"
};
const normalizeToSharp = n => enharmonicsCircle[n] || n;

const displayAsBemol = {
  "C#": "Db",
  "D#": "Eb",
  "F#": "Gb",
  "G#": "Ab",
  "A#": "Bb"
};
const toDisplay = n => displayAsBemol[n] || n;

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
      showCircleChords(note, "major");
    });

    svg.appendChild(text);
  });

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
      showCircleChords(note, "minor");
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

function showCircleChords(noteClicked, mode) {
  const allNotes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const note = normalizeToSharp(noteClicked);

  let majorRoot, minorRoot;
  if (mode === "major") {
    majorRoot = note;
    minorRoot = allNotes[(allNotes.indexOf(note) + 9) % 12];
  } else {
    minorRoot = note;
    majorRoot = allNotes[(allNotes.indexOf(note) + 3) % 12];
  }

  const rootIndex = allNotes.indexOf(majorRoot);
  const I = allNotes[rootIndex];
  const IV = allNotes[(rootIndex + 5) % 12];
  const V = allNotes[(rootIndex + 7) % 12];

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
    <strong>🎶 Progresión I – IV – V en ${toDisplay(I)} mayor:</strong><br>
    • I: ${toDisplay(I)} – Mayor<br>
    • IV: ${toDisplay(IV)} – Mayor<br>
    • V: ${toDisplay(V)} – Mayor<br>
    • Relativa menor: ${toDisplay(minorRoot)} menor
  `;

  // ✅ Mostrar en el input las mismas notas que en pantalla
    const boldNotes = [...document.querySelectorAll("#circleOfFifths text")]
  .filter(el => el.getAttribute("font-weight") === "bold")
  .map(el => el.textContent);

document.getElementById("notesInput").value = boldNotes.join(" ");


  if (typeof drawFretboard === 'function') drawFretboard();

  const textNodes = document.querySelectorAll("#circleOfFifths text");
  textNodes.forEach(el => {
    el.setAttribute("fill", el.classList.contains("outer") ? "#333" : "#666");
    el.setAttribute("font-weight", "normal");
  });

  textNodes.forEach(el => {
    const txt = el.textContent;
    const norm = normalizeToSharp(txt);

    if (el.classList.contains("outer")) {
      if (norm === I) el.setAttribute("fill", "#d4af37");
      if (norm === IV) el.setAttribute("fill", "#00aaff");
      if (norm === V) el.setAttribute("fill", "#00cc66");
      if ([I, IV, V].includes(norm)) el.setAttribute("font-weight", "bold");
    }

    if (el.classList.contains("inner") && norm === minorRoot) {
      el.setAttribute("fill", "#aa00ff");
      el.setAttribute("font-weight", "bold");
    }
  });
}

