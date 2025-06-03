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

  const stringCount = tuning.length;
  const tabLines = Array(stringCount).fill("").map((_, i) => tuning[i].toLowerCase() + "|");

  // Posición de tiempo (bloque horizontal)
  let time = 0;

  parsed.forEach(({ note, string }) => {
    let used = false;
    const targetStrings = string
      ? [stringCount - string]
      : [...Array(stringCount).keys()].reverse();

    for (const stringIndex of targetStrings) {
      const openNote = tuning[stringIndex];
      for (let fret = 0; fret <= fretEnd; fret++) {
        const noteAtFret = allNotes[(noteIndex(openNote) + fret) % 12];
        if (normalizeNote(noteAtFret) === note) {
          for (let i = 0; i < stringCount; i++) {
            while (tabLines[i].length < tabLines[0].length + 3) {
              tabLines[i] += "---";
            }
          }
          const marker = fret < 10 ? `-${fret}-` : `${fret}-`;
          for (let i = 0; i < stringCount; i++) {
            if (i === stringIndex) {
              tabLines[i] = tabLines[i].slice(0, time * 3 + 2) + marker + tabLines[i].slice((time + 1) * 3 + 2);
            }
          }
          used = true;
          break;
        }
      }
      if (used) break;
    }

    if (!used) {
      for (let i = 0; i < stringCount; i++) {
        tabLines[i] += " ? ";
      }
    }

    time++;
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
