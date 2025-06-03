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

  // Inicializa líneas vacías para cada cuerda
  const tabLines = Array(tuning.length).fill("").map((_, i) => tuning[i].toLowerCase() + "|");

  let timeCursor = 0; // posición horizontal de tiempo

  parsed.forEach(({ note, string }) => {
    let targetStrings;

    if (string && string >= 1 && string <= tuning.length) {
      const idx = tuning.length - string;
      targetStrings = [idx];
    } else {
      targetStrings = [...Array(tuning.length).keys()].reverse(); // de aguda a grave
    }

    let placed = false;
    for (const stringIndex of targetStrings) {
      const openNote = tuning[stringIndex];
      for (let fret = 0; fret <= fretEnd; fret++) {
        const noteAtFret = allNotes[(noteIndex(openNote) + fret) % 12];
        if (normalizeNote(noteAtFret) === note) {
          // Rellena todas las cuerdas hasta alcanzar el cursor de tiempo actual
          for (let i = 0; i < tuning.length; i++) {
            while (tabLines[i].length < tabLines[0].length + 1) {
              tabLines[i] += "---";
            }
          }

          // Escribe la nota
          for (let i = 0; i < tuning.length; i++) {
            if (i === stringIndex) {
              const fretStr = fret < 10 ? `-${fret}-` : `${fret}-`;
              tabLines[i] += fretStr;
            } else {
              tabLines[i] += "---";
            }
          }

          timeCursor++;
          placed = true;
          break;
        }
      }
      if (placed) break;
    }

    if (!placed) {
      // Nota no encontrada, escribe " ? " en todas las cuerdas
      for (let i = 0; i < tuning.length; i++) {
        tabLines[i] += " ? ";
      }
      timeCursor++;
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
