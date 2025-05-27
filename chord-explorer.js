// Variable global para recordar la nota raíz seleccionada
let selectedChordRoot = "C";

function renderChordCircle() {
  const suffixes = ["", "m", "7", "maj7", "dim", "aug", "sus2", "sus4", "add9"];
  const radius = 150;
  const center = 200;

  const chordColors = {
    "": "#00bcd4", "m": "#e91e63", "7": "#ff9800", "maj7": "#3f51b5",
    "dim": "#9c27b0", "aug": "#ff5722", "sus2": "#4caf50",
    "sus4": "#8bc34a", "add9": "#795548"
  };

  const svgNS = "http://www.w3.org/2000/svg";
  const container = document.getElementById("chordCircle");
  container.innerHTML = "";

  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("width", 400);
  svg.setAttribute("height", 450);
  svg.style.border = "1px solid #ccc";
  container.appendChild(svg);

  // 🎯 Dropdown dentro del SVG
  const foreign = document.createElementNS(svgNS, "foreignObject");
  foreign.setAttribute("x", center - 50);
  foreign.setAttribute("y", center - 25);
  foreign.setAttribute("width", 100);
  foreign.setAttribute("height", 50);

  const html = document.createElement("div");
  html.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
  html.style.textAlign = "center";

  const dropdown = document.createElement("select");
  dropdown.id = "circleChordRoot";
  dropdown.style.fontSize = "14px";

  const allNotes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  allNotes.forEach(note => {
    const option = document.createElement("option");
    option.value = note;
    option.textContent = note;
    dropdown.appendChild(option);
  });

  // 🔧 Esto actualiza visualmente el dropdown
  dropdown.value = selectedChordRoot;

  // 🔁 Al cambiar la nota raíz
  dropdown.addEventListener("change", () => {
    selectedChordRoot = dropdown.value;
    renderChordCircle(); // vuelve a dibujar el SVG con la nueva raíz
  });

  html.appendChild(dropdown);
  foreign.appendChild(html);
  svg.appendChild(foreign);

  const root = selectedChordRoot;

  // 🧹 Borrar display anterior si existe
  const existingDisplay = document.getElementById("selectedChordDisplay");
  if (existingDisplay) existingDisplay.remove();

  const chordDisplay = document.createElement("div");
  chordDisplay.id = "selectedChordDisplay";
  chordDisplay.style.marginTop = "1em";
  chordDisplay.style.fontSize = "14px";
  chordDisplay.style.color = "#444";
  chordDisplay.style.textAlign = "center";
  chordDisplay.textContent = "Haz clic en un acorde para verlo en el diapasón";
  container.appendChild(chordDisplay);

  // 🎵 Dibujar acordes alrededor
  suffixes.forEach((suffix, i) => {
    const angle = (i / suffixes.length) * (2 * Math.PI) - Math.PI / 2;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    const chord = root + suffix;
    const chordNotes = chordToNotes?.(chord) || [];

    const text = document.createElementNS(svgNS, "text");
    text.setAttribute("x", x);
    text.setAttribute("y", y);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "middle");
    text.setAttribute("font-size", "13");
    text.setAttribute("fill", chordColors[suffix] || "#333");
    text.textContent = chord;
    text.style.cursor = "pointer";
    text.setAttribute("title", chord);

    text.addEventListener("click", () => {
      const notesText = chordNotes.join(" ");
      document.getElementById("notesInput").value = notesText;

      const noteOutput = document.getElementById("noteOutput");
      if (noteOutput) noteOutput.textContent = notesText;

      chordDisplay.textContent = `🎵 Acorde: ${chord}`;
      if (typeof drawFretboard === "function") drawFretboard();
    });

    svg.appendChild(text);
  });

  const centerText = document.createElementNS(svgNS, "text");
  centerText.setAttribute("x", center);
  centerText.setAttribute("y", center + 35);
  centerText.setAttribute("text-anchor", "middle");
  centerText.setAttribute("font-size", "12");
  centerText.setAttribute("fill", "#888");
  centerText.textContent = "Haz clic en un acorde";
  svg.appendChild(centerText);
}
