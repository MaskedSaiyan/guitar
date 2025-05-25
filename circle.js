document.addEventListener("DOMContentLoaded", () => {
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
    text.style.cursor = "pointer";
    text.textContent = note;

    text.addEventListener("click", () => {
      document.getElementById("rootSelect").value = note.replace("b", "#") === "Db" ? "C#" : note;
      updateNotesDisplay();
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
    text.style.cursor = "pointer";
    text.textContent = note;

    text.addEventListener("click", () => {
      document.getElementById("rootSelect").value = note.replace("b", "#") === "Bb" ? "A#" : note;
      updateNotesDisplay();
    });

    svg.appendChild(text);
  });

  // título visual
  const centerText = document.createElementNS(svgNS, "text");
  centerText.setAttribute("x", center);
  centerText.setAttribute("y", center);
  centerText.setAttribute("text-anchor", "middle");
  centerText.setAttribute("font-size", "12");
  centerText.setAttribute("fill", "#aaa");
  centerText.textContent = "Mayor afuera, menor adentro";
  svg.appendChild(centerText);
});
