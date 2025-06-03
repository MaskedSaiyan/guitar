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
  const stepCount = parsed.length;
  const cellWidth = 4;

  // Inicializar matriz cuerda × tiempo
  const grid = Array(stringCount).fill(0).map(() => Array(stepCount).fill("--- "));

  parsed.forEach(({ note, string }, time) => {
    let done = false;
    const stringIndexes = string
      ? [stringCount - string]
      : [...Array(stringCount).keys()].reverse();

    for (const s of stringIndexes) {
      const open = tuning[s];
      for (let fret = 0; fret <= fretEnd; fret++) {
        const test = allNotes[(noteIndex(open) + fret) % 12];
        if (normalizeNote(test) === note) {
          grid.forEach((line, i) => {
            line[time] = (i === s)
              ? (fret < 10 ? `-${fret}-` : `${fret} `)
              : "--- ";
          });
          done = true;
          break;
        }
      }
      if (done) break;
    }

    if (!done) {
      grid.forEach(line => line[time] = " ?  ");
    }
  });

  // Convertir a texto
  const tabLines = grid.map((line, i) =>
    tuning[i].toLowerCase() + "|" + line.join("")
  );

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
