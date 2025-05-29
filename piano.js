let audioCtx;

document.addEventListener('click', () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}, { once: true });


const pianoNotes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const pianoStartOctave = 3;
const pianoOctaves = 2;
const synth = new Tone.Synth().toDestination();

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

      // Black key if applicable
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

function playNote(note) {
  if (!audioCtx) return;

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.value = noteToFrequency(note);
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 1);
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


