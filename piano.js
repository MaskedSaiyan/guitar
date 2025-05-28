const pianoNotes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const pianoStartOctave = 3;
const pianoOctaves = 2;
const synth = new Tone.Synth().toDestination();

function drawPiano() {
  const piano = document.getElementById("piano");
  piano.innerHTML = "";

  for (let o = 0; o < pianoOctaves; o++) {
    pianoNotes.forEach(note => {
      const fullNote = `${note}${pianoStartOctave + o}`;
      const baseNote = note.replace("#", "");
      const isSharp = note.includes("#");
      const div = document.createElement("div");

      div.className = "key" + (isSharp ? " black" : "");
      div.dataset.note = note;
      div.title = fullNote;

      div.style.backgroundColor = isSharp ? "#222" : (noteColors[baseNote] || "#eee");

      div.onclick = () => {
        playNote(fullNote);
        togglePianoNote(note);
        highlightPianoKeys();
      };

      piano.appendChild(div);
    });
  }

  positionBlackKeys();
  highlightPianoKeys();
}

function positionBlackKeys() {
  const keys = document.querySelectorAll("#piano .key");
  keys.forEach((key, i) => {
    if (key.classList.contains("black")) {
      key.style.left = `${i * 40 - 12}px`;
      key.style.position = "absolute";
      key.style.zIndex = 2;
    } else {
      key.style.display = "inline-block";
      key.style.width = "40px";
      key.style.height = "150px";
      key.style.border = "1px solid #333";
    }
  });
}

function togglePianoNote(note) {
  const input = document.getElementById("notesInput");
  let notes = input.value.trim().split(/\s+/).filter(n => n);
  const exists = notes.includes(note);

  if (exists) {
    notes = notes.filter(n => n !== note);
  } else {
    notes.push(note);
  }

  input.value = notes.join(" ");
  drawFretboard?.();
}

function highlightPianoKeys() {
  const keys = document.querySelectorAll("#piano .key");
  const inputNotes = getExpandedNotesFromInput();

  keys.forEach(key => {
    const base = key.dataset.note;
    const isOn = inputNotes.includes(base);
    key.style.outline = isOn ? "3px solid red" : "none";
  });
}

function playNote(fullNote) {
  synth.triggerAttackRelease(fullNote, "8n");
}

window.addEventListener("DOMContentLoaded", drawPiano);