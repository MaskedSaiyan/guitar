function formatFret(fret) {
  if (fret === null) return "----";
  if (typeof fret === "string" && fret === "?") return " ?  ";
  const s = fret.toString();
  return s.length === 1 ? `-${s}--` : `${s}--`;
}

function parseNoteGroups(input) {
  const result = [];
  const tokens = input.match(/\d\([^\)]+\)|\d[A-G#b]|[A-G#b]/g) || [];

  tokens.forEach(token => {
    if (/^\d\([A-G#b\s]+\)$/.test(token)) {
      const stringNum = parseInt(token[0]);
      const innerNotes = token.slice(2, -1).trim().split(/\s+/);
      innerNotes.forEach(note => {
        if (note) result.push({ note: normalizeNote(note), string: stringNum });
      });
    } else if (/^\d[A-G#b]$/.test(token)) {
      result.push({ note: normalizeNote(token.slice(1)), string: parseInt(token[0]) });
    } else {
      result.push({ note: normalizeNote(token), string: null });
    }
  });

  return result;
}

function drawTabEditor() {
  const rawInput = document.getElementById("tabEditorInput").value;
  const instrument = document.getElementById("instrumentSelect").value;
  const tuningName = document.getElementById("tuningSelect").value;
  const tuning = tuningsByInstrument[instrument][tuningName];
  const fretEnd = parseInt(document.getElementById("fretEnd").value) || 12;

  const lines = rawInput.split("\n");
  const sections = {};
  let current = null;

  lines.forEach(line => {
    const trimmed = line.trim();
    if (/^\[.+\]$/.test(trimmed)) {
      current = trimmed.slice(1, -1).toUpperCase();
      sections[current] = [];
    } else if (current) {
      sections[current].push(trimmed);
    }
  });

  const sequence = sections["SONG"];
  if (!sequence) {
    document.getElementById("tabEditorOutput").textContent = "❌ Falta sección [Song]";
    return;
  }

  const outputBlocks = [];

  sequence.forEach(line => {
    const match = line.trim().match(/^([A-Za-z0-9_]+)(?:\s*x(\d+))?$/i);
    if (!match) return;

    const ref = match[1].toUpperCase();
    const times = parseInt(match[2] || "1");
    const block = sections[ref];
    if (!block) return;

    const parsed = parseNoteGroups(block.join(" "));
    const stepCount = parsed.length;
    const grid = Array(tuning.length).fill(0).map(() => Array(stepCount).fill("----"));

    parsed.forEach(({ note, string }, time) => {
      let placed = false;

      const stringIndexes = (string >= 1 && string <= tuning.length)
        ? [tuning.length - string]
        : [...Array(tuning.length).keys()].reverse();

      for (const s of stringIndexes) {
        const openNote = tuning[s];
        for (let fret = 0; fret <= fretEnd; fret++) {
          const noteAtFret = allNotes[(noteIndex(openNote) + fret) % 12];
          if (normalizeNote(noteAtFret) === note) {
            grid.forEach((line, i) => {
              line[time] = (i === s) ? formatFret(fret) : "----";
            });
            placed = true;
            break;
          }
        }
        if (placed) break;
      }

      if (!placed) {
        grid.forEach((line, i) => {
          line[time] = (string == null || i === tuning.length - string) ? " ?  " : "----";
        });
      }
    });

    const tabLines = grid
      .map((line, i) =>
        tuning[i].toLowerCase() + "|" + line.map(x => x || "----").join("")
      )
      .reverse();

    outputBlocks.push(
      `[${ref}${times > 1 ? ` x${times}` : ""}]\n` +
      tabLines.join("\n") + "\n"
    );
  });

  document.getElementById("tabEditorOutput").textContent = outputBlocks.join("\n");
}

function saveRiff() {
  const name = document.getElementById("riffName").value.trim();
  const content = document.getElementById("tabEditorInput").value.trim();
  if (!name || !content) return alert("Falta nombre o contenido del riff");

  const li = document.createElement("li");
  li.textContent = `${name}: ${content}`;
  document.getElementById("savedRiffs").appendChild(li);
}
