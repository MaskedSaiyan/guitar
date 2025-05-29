const pianoNotes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const pianoStartOctave = 3;
const pianoOctaves = 2;
const synth = new Tone.Synth().toDestination();

function drawPiano() {
  const piano = document.getElementById("piano");
  piano.innerHTML = "";

  for (let o = 0; o < pianoOctaves; o++) {
    const group = document.createElement("div");
    group.className = "piano-octave";
    pianoNotes.forEach((note, i) => {
      const fullNote = `${note}${pianoStartOctave + o}`;
      const isSharp = note.includes("#");
      const baseNote = note.replace("#", "");

      const key = document.createElement("div");
      key.className = "key" + (isSharp ? " black" : " white");
      key.dataset.note = note;
      key.title = fullNote;

      key.onclick = () => playNote(fullNote);

      const marker = document.createElement("div");
      marker.className = "note-marker";
      marker.textContent = note;
      marker.style.backgroundColor = noteColors[baseNote] || "#555";
      marker.style.bottom = "4px";
      marker.style.left = "50%";
      marker.style.transform = "translateX(-50%)";
      marker.style.position = "absolute";

      key.appendChild(marker);
      group.appendChild(key);
    });

    piano.appendChild(group);
  }

  highlightPianoKeys();
}

function highlightPianoKeys() {
  const keys = document.querySelectorAll("#piano .key");
  const activeNotes = getExpandedNotesFromInput();

  keys.forEach(key => {
    const note = key.dataset.note;
    const marker = key.querySelector(".note-marker");
    marker.style.display = activeNotes.includes(note) ? "block" : "none";
  });
}

function playNote(fullNote) {
  synth.triggerAttackRelease(fullNote, "8n");
}

window.addEventListener("DOMContentLoaded", () => {
  drawPiano();
  document.getElementById("notesInput")?.addEventListener("input", highlightPianoKeys);
});
