let selectedChordRoot = "C";

function getChordDescription(chord) {
  const suffix = chord.replace(/^[A-G]#?/, "");
  const descriptions = {
    "":      "Mayor – estable, feliz",
    "m":     "Menor – suave, introspectivo",
    "7":     "7ma – dominante, con fuerza",
    "maj7":  "Mayor 7ma – elegante, jazz",
    "dim":   "Disminuido – tenso, inestable",
    "aug":   "Aumentado – dramático, expansivo",
    "sus2":  "Susp 2da – aireado, moderno",
    "sus4":  "Susp 4ta – tensión sin resolver",
    "add9":  "Add9 – decorativo, pop"
  };
  return descriptions[suffix] || "Acorde";
}

function getVisualLabel(noteSharp) {
  const match = [...document.querySelectorAll("#circleOfFifths text")]
    .find(el => normalizeToSharp(el.textContent) === noteSharp);
  return match?.textContent || noteSharp;
}

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

  dropdown.value = selectedChordRoot;

  dropdown.addEventListener("change", () => {
    selectedChordRoot = dropdown.value;
    renderChordCircle();
  });

  html.appendChild(dropdown);
  foreign.appendChild(html);
  svg.appendChild(foreign);

  const root = selectedChordRoot;

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

  const tooltip = document.getElementById("tooltip");

  suffixes.forEach((suffix, i) => {
    const angle = (i / suffixes.length) * (2 * Math.PI) - Math.PI / 2;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    const chord = root + suffix;
    const chordNotes = chordToNotes?.(chord) || [];
    const description = getChordDescription(chord);

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

    text.addEventListener("mouseover", e => {
      tooltip.textContent = `${chord}: ${description}`;
      tooltip.classList.add("visible");
    });

    text.addEventListener("mousemove", e => {
      tooltip.style.left = `${e.pageX + 10}px`;
      tooltip.style.top = `${e.pageY + 10}px`;
    });

    text.addEventListener("mouseout", () => {
      tooltip.classList.remove("visible");
    });

text.addEventListener("click", () => {
  const notesText = chordNotes.join(" ");
  const inputEl = document.getElementById("notesInput");
  inputEl.value = notesText;

  const noteOutput = document.getElementById("noteOutput");
  if (noteOutput) noteOutput.textContent = notesText;

  chordDisplay.textContent = `🎵 Acorde: ${chord}`;

  setTimeout(() => drawFretboard(), 0); // primer intento
  setTimeout(() => drawFretboard(), 50); // fallback tardío
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
