
function renderChordExplorer() {
  const root = document.getElementById("chordRootSelect").value;
  const container = document.getElementById("chordExplorer");
  container.innerHTML = "";

  const suffixes = ["", "m", "7", "maj7", "dim", "aug", "sus2", "sus4", "add9"];

  suffixes.forEach(suffix => {
    const chord = root + suffix;
    const btn = document.createElement("button");
    btn.textContent = chord;
    btn.className = "chord-button";
    btn.onclick = () => {
      document.getElementById("notesInput").value = chord;
      if (typeof drawFretboard === "function") drawFretboard();
    };
    container.appendChild(btn);
  });
}
