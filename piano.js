const pianoNotes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const pianoStartOctave = 3;
const pianoOctaves = 2;
const synth = new Tone.Synth().toDestination();

function drawPiano() {
  const piano = document.getElementById("piano");
  piano.innerHTML = "";

  for (let o = 0; o < pianoOctaves; o++) {
    pianoNotes.forEach((note) => {
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
      marker.style.display = "none";
      marker.style.position = "absolute";
      marker.style.left = "50%";
      marker.style.bottom = "8px"; // 👈 más abajo para que no se superponga
      marker.style.transform = "translateX(-50%)";
      marker.style.backgroundColor = noteColors[baseNote] || "#555";

      key.appendChild(marker);
      piano.appendChild(key);
    });
  }

  positionBlackKeys();
  highlightPianoKeys();
}

function positionBlackKeys() {
  const keys = document.querySelectorAll("#piano .key");
  let whiteIndex = 0;

  keys.forEach(key => {
    const note = key.dataset.note;
    const isSharp = note.includes("#");

    if (isSharp) {
      key.style.position = "absolute";
      key.style.left = `${whiteIndex * 40 - 12}px`;
      key.style.zIndex = "2";
      key.style.width = "28px";
      key.style.height = "100px";
    } else {
      key.style.position = "relative";
      key.style.display = "inline-block";
      key.style.width = "40px";
      key.style.height = "150px";
      whiteIndex++;
    }
  });
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
