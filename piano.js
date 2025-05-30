let synth;

document.addEventListener("click", async () => {
  await Tone.start();
  if (!synth) {
    synth = new Tone.Synth().toDestination();
  }
}, { once: true });

const pianoNotes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const pianoStartOctave = 3;
const pianoOctaves = 2;

function noteToFrequency(note) {
  const midi = noteToMidi(note);
  return midi ? 440 * Math.pow(2, (midi - 69) / 12) : 0;
}

function drawPiano() {
  const piano = document.getElementById("piano");
  piano.innerHTML = "";

  const whiteNotes = ["C", "D", "E", "F", "G", "A", "B"];
  const blackMap = {
    "C": "C#",
    "D": "D#",
    "F": "F#",
    "G": "G#",
    "A": "A#"
  };

  for (let o = 0; o < pianoOctaves; o++) {
    whiteNotes.forEach((note, i) => {
      const fullNote = `${note}${pianoStartOctave + o}`;
      const whiteKey = document.createElement("div");
      whiteKey.className = "key white";
      whiteKey.dataset.note = note;
      whiteKey.title = fullNote;

      whiteKey.onclick = () => playNote(fullNote);

      const marker = document.createElement("div");
      marker.className = "note-marker";
      marker.textContent = note;
      marker.style.display = "none";
      marker.style.bottom = "4px";
      marker.style.left = "50%";
      marker.style.transform = "translateX(-50%)";
      marker.style.position = "absolute";
      marker.style.backgroundColor = noteColors[note] || "#555";
      whiteKey.appendChild(marker);

      const keyGroup = document.createElement("div");
      keyGroup.className = "key-group";
      keyGroup.appendChild(whiteKey);

      const blackNote = blackMap[note];
      if (blackNote) {
        const fullBlack = `${blackNote}${pianoStartOctave + o}`;
        const blackKey = document.createElement("div");
        blackKey.className = "key black";
        blackKey.dataset.note = blackNote;
        blackKey.title = fullBlack;

        blackKey.onclick = () => playNote(fullBlack);

        const blackMarker = document.createElement("div");
        blackMarker.className = "note-marker";
        blackMarker.textContent = blackNote;
        blackMarker.style.display = "none";
        blackMarker.style.bottom = "4px";
        blackMarker.style.left = "50%";
        blackMarker.style.transform = "translateX(-50%)";
        blackMarker.style.position = "absolute";
        blackMarker.style.backgroundColor = noteColors[blackNote.replace("#", "")] || "#555";
        blackKey.appendChild(blackMarker);

        keyGroup.appendChild(blackKey);
      }

      piano.appendChild(keyGroup);
    });
  }

  highlightPianoKeys();
}

function playNote(note) {
  if (!synth) return;
  synth.triggerAttackRelease(note, "8n");
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

function highlightPianoNotes() {
  const inputNotes = getExpandedNotesFromInput();
  const keys = document.querySelectorAll(".key");

  keys.forEach(key => {
    const marker = key.querySelector(".note-marker");
    const note = key.dataset.note;

    if (inputNotes.includes(note)) {
      marker.style.display = "block";
      marker.textContent = note;
    } else {
      marker.style.display = "none";
    }
  });
}

window.addEventListener("DOMContentLoaded", () => {
  drawPiano();
  document.getElementById("notesInput")?.addEventListener("input", highlightPianoKeys);
});
