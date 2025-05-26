function renderChordExplorer() {
  renderChordCircle();
}

function renderChordCircle() {
  const root = document.getElementById("circleChordRoot").value;
  const suffixes = ["", "m", "7", "maj7", "dim", "aug", "sus2", "sus4", "add9"];
  const radius = 150;
  const center = 200;

  const chordColors = {
    "": "#00bcd4",       // Mayor
    "m": "#e91e63",      // Menor
    "7": "#ff9800",      // Dominante
    "maj7": "#3f51b5",   // Mayor 7
    "dim": "#9c27b0",    // Disminuido
    "aug": "#ff5722",    // Aumentado
    "sus2": "#4caf50",   // Susp 2
    "sus4": "#8bc34a",   // Susp 4
    "add9": "#795548"    // Add9
  };

  const svgNS = "http://www.w3.org/2000/svg";
  const container = document.getElementById("chordCircle");
  container.innerHTML = "";

  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("width", 400);
  svg.setAttribute("height", 400);
  svg.style.border = "1px solid #ccc";
  container.appendChild(svg);

  suffixes.forEach((suffix, i) => {
    const angle = (i / suffixes.length) * (2 * Math.PI) - Math.PI / 2;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    const chord = root + suffix;

    // Tooltip con notas
    let tooltip = "";
    if (typeof chordToNotes === "function") {
      const notes = chordToNotes(chord);
      if (notes.length) tooltip = notes.join(" ");
    }

    const text = document.createElementNS(svgNS, "text");
    text.setAttribute("x", x);
    text.setAttribute("y", y);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "middle");
    text.setAttribute("font-size", "14");
    text.setAttribute("fill", chordColors[suffix] || "#333");
    text.setAttribute("title", tooltip); // para navegadores que lo soporten
    text.style.cursor = "pointer";
    text.textContent = chord;

    // También usa tooltip HTML clásico
    text.addEventListener("mouseenter", () => {
      text.setAttribute("title", tooltip);
    });

    text.addEventListener("click", () => {
      document.getElementById("notesInput").value = chord;
      if (typeof drawFretboard === "function") drawFretboard();
    });

    svg.appendChild(text);
  });

  const centerText = document.createElementNS(svgNS, "text");
  centerText.setAttribute("x", center);
  centerText.setAttribute("y", center);
  centerText.setAttribute("text-anchor", "middle");
  centerText.setAttribute("font-size", "12");
  centerText.setAttribute("fill", "#888");
  centerText.textContent = "Haz clic en un acorde";
  svg.appendChild(centerText);
}
