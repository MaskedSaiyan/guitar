// tab-editor.js

function parseNoteGroups(input) {
  const tokens = input.trim().split(/\s+/);
  const result = [];
  tokens.forEach(token => {
    if (/^\d\([A-G#b\s]+\)$/.test(token)) {
      const stringNum = parseInt(token[0]);
      const innerNotes = token.slice(2, -1).split(/\s+/);
      innerNotes.forEach(note => result.push({ note: normalizeNote(note), string: stringNum }));
    } else if (/^\d[A-G#b]$/.test(token)) {
      result.push({ note: normalizeNote(token.slice(1)), string: parseInt(token[0]) });
    } else {
      result.push({ note: normalizeNote(token), string: null });
    }
  });
  return result;
}

function drawTabEditor() {
  const input = document.getElementById("tabEditorInput").value;
  const parsed = parseNoteGroups(input);
  const instrument = document.getElementById("instrumentSelect").value;
  const tuningName = document.getElementById("tuningSelect").value;
  const tuning = tuningsByInstrument[instrument][tuningName];
  const fretEnd = parseInt(document.getElementById("fretEnd").value) || 12;

  const tabLines = Array(tuning.length).fill("").map((_, i) => tuning[i].toLowerCase() + "|");

  parsed.forEach(({ note, string }) => {
    let stringsToTry;
    if (string && string >= 1 && string <= tuning.length) {
      const idx = tuning.length - string;
      stringsToTry = [idx];
    } else {
      stringsToTry = [...Array(tuning.length).keys()].reverse();
    }

    let placed = false;
    for (const stringIndex of stringsToTry) {
      const openNote = tuning[stringIndex];
      for (let fret = 0; fret <= fretEnd; fret++) {
        const noteAtFret = allNotes[(noteIndex(openNote) + fret) % 12];
        if (normalizeNote(noteAtFret) === note) {
          for (let i = 0; i < tuning.length; i++) {
            tabLines[i] += i === stringIndex
              ? (fret < 10 ? `-${fret}-` : `${fret}-`)
              : "---";
          }
          placed = true;
          break;
        }
      }
      if (placed) break;
    }

    if (!placed) {
      for (let i = 0; i < tuning.length; i++) tabLines[i] += " ? ";
    }
  });

  document.getElementById("tabEditorOutput").textContent = tabLines.join("\n");
}

function saveRiff() {
  const name = document.getElementById("riffName").value.trim();
  const content = document.getElementById("tabEditorInput").value.trim();
  if (!name || !content) return alert("Falta nombre o contenido del riff");

  const li = document.createElement("li");
  li.textContent = `${name}: ${content}`;
  document.getElementById("savedRiffs").appendChild(li);
}
