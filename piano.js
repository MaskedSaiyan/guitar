const pianoNotes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const pianoStartOctave = 3;
const pianoOctaves = 2;
const synth = new Tone.Synth().toDestination();

function drawPiano() {
  const piano = document.getElementById("piano");
  piano.innerHTML = "";

  let whiteIndex = 0;

  for (let o = 0; o < pianoOctaves; o++) {
    pianoNotes.forEach((note, i) => {
      const fullNote = `${note}${pianoStartOctave + o}`;
      const isSharp = note.includes("#");
      const baseNote = note.replace("#", "");
      const key = document.createElement("div");

      key.className = "key" + (isSharp ? " black" : " white");
      key.dataset.note = note;
      key.title = fullNote;

      key.onclick = () => {
        playNote(fullNote);
      };

      const marker = document.createElement("div");
      marker.className = "note-marker";
      marker.textContent = note;
      marker.style.backgroundColor = noteColors[baseNote] || "#555";
      key.appendChild(marker);

      if (isSharp) {
        // Posicionamiento calculado relativo al índice blanco
        key.style.position = "absolute";
        key.style.left = `${whiteIndex * 40 - 13}px`;
        key.style.zIndex = "2";
      } else {
        // Tecla blanca normal
        key.style.position = "relative";
        key.style.display = "inline-block";
        key.style.width = "40px";
        key.style.height = "150px";
        whiteIndex++;
      }

      piano.appendChild(key);
    });
  }

  highlightPianoKeys();
}


function highlightPianoKeys() {
  const keys = document.querySelectorAll("#piano .key");
  const activeNotes = getExpandedNotesFromInput();

  keys.forEach(key => {
    const note = key.dataset.note;
    const marker = key.querySelector(".note-marker");
    if (activeNotes.includes(note)) {
      marker.style.display = "block";
    } else {
      marker.style.display = "none";
    }
  });
}

function playNote(fullNote) {
  synth.triggerAttackRelease(fullNote, "8n");
}

window.addEventListener("DOMContentLoaded", () => {
  drawPiano();
  document.getElementById("notesInput")?.addEventListener("input", highlightPianoKeys);
});
