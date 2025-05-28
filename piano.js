const pianoNotes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const pianoStartOctave = 3;
const pianoOctaves = 2;
const synth = new Tone.Synth().toDestination();

function drawPiano() {
  const piano = document.getElementById("piano");
  piano.innerHTML = "";

  for (let o = 0; o < pianoOctaves; o++) {
    pianoNotes.forEach((note, i) => {
      const fullNote = `${note}${pianoStartOctave + o}`;
      const isSharp = note.includes("#");
      const baseNote = note.replace("#", "");
      const key = document.createElement("div");

      key.className = "key" + (isSharp ? " black" : " white");
      key.dataset.note = note;
      key.title = fullNote;

      if (!isSharp && noteColors[baseNote]) {
        key.style.backgroundColor = noteColors[baseNote];
      }

      key.onclick = () => {
        playNote(fullNote);
      };

      // Marker: solo visible si la nota está activa en input
      const marker = document.createElement("div");
      marker.className = "note-marker";
      marker.style.position = "absolute";
      marker.style.top = "10px";
      marker.style.left = "50%";
      marker.style.transform = "translateX(-50%)";
      marker.style.borderRadius = "50%";
      marker.style.width = "24px";
      marker.style.height = "24px";
      marker.style.fontSize = "12px";
      marker.style.fontWeight = "bold";
      marker.style.lineHeight = "24px";
      marker.style.color = "white";
      marker.style.display = "none";

      marker.textContent = note;
      marker.style.backgroundColor = noteColors[baseNote] || "#333";
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