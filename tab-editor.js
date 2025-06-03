function formatFret(fret) {
  if (fret === null) return "----";
  if (typeof fret === "string" && fret === "?") return " ?  ";
  const s = fret.toString();
  return s.length === 1 ? `-${s}--` : `${s}--`;
}

function parseNoteGroups(input) {
  const result = [];
  const tokens = input.match(/\dH?\([^\)]+\)|\dH?[A-G#b]|[A-G#b]/g) || [];

  tokens.forEach(token => {
    const high = token.includes('H');
    const tokenClean = token.replace('H', '');

    if (/^\d\([A-G#b\s]+\)$/.test(tokenClean)) {
      const stringNum = parseInt(tokenClean[0]);
      const innerNotes = tokenClean.slice(2, -1).trim().split(/\s+/);
      innerNotes.forEach(note => {
        if (note) result.push({ note: normalizeNote(note), string: stringNum, high });
      });
    } else if (/^\d[A-G#b]$/.test(tokenClean)) {
      result.push({ note: normalizeNote(tokenClean.slice(1)), string: parseInt(tokenClean[0]), high });
    } else {
      result.push({ note: normalizeNote(token), string: null, high: false });
    }
  });

  return result;
}

function drawTabEditor() {
  const rawInput = document.getElementById("tabEditorInput").value;
  const songTitle = document.getElementById("riffName").value.trim() || "Sin título";
  const instrument = document.getElementById("instrumentSelect").value;
  const tuningName = document.getElementById("tuningSelect").value;
  const tuning = tuningsByInstrument[instrument][tuningName];
  const fretStart = parseInt(document.getElementById("fretStart").value) || 0;
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

  outputBlocks.push(
    `🎵 Canción: ${songTitle}\n` +
    `🎸 Afinación: ${tuningName} – ${tuning.join(" ")}\n`
  );

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

    parsed.forEach(({ note, string, high }, time) => {
      let placed = false;

      const stringIndexes = (string >= 1 && string <= tuning.length)
        ? [tuning.length - string]
        : [...Array(tuning.length).keys()].reverse();

      for (const s of stringIndexes) {
        const openNote = tuning[s];

        const fretRange = high
          ? [...Array(fretEnd - fretStart + 1).keys()].map(i => fretEnd - i)  // descendente
          : [...Array(fretEnd - fretStart + 1).keys()].map(i => fretStart + i);  // ascendente

        for (const fret of fretRange) {
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
  if (!name || !content) return alert("Falta nombre o contenido");

  const li = document.createElement("li");
  li.textContent = `${name}: ${content}`;
  document.getElementById("savedRiffs").appendChild(li);
}

function copyTabAndCode() {
  const code = document.getElementById("tabEditorInput").value.trim();
  const rendered = document.getElementById("tabEditorOutput").textContent.trim();

  if (!code && !rendered) {
    alert("❌ No hay nada para copiar.");
    return;
  }

  const combined = `🎼 TAB AS CODE 🎼\n\n===== CÓDIGO =====\n${code}\n\n===== TABLATURA =====\n${rendered}`;

  navigator.clipboard.writeText(combined)
    .then(() => alert("✅ Código y tablatura copiados al portapapeles"))
    .catch(err => alert("❌ Error al copiar: " + err));
}

function loadExampleTab() {
  const example = `
[Intro]
3H(A A A A A C C C C C G G G G G G A A A A A)

[Riff1]
6(A A A A A C C C C C G G G G G G A A A A A)

[Chorus]
6A 4A 6A 4A 6A 4C 6C 4C 6C 4C 6G 4G 6G 4G 6G 4G 6A 4A 6A 4A 6A

[Riff2]
6(A A A A A C C C C C G G G G G G A A A A A)

[Song]
Intro
Riff1 x2
Chorus
Riff2
Riff1 x2
`.trim();

  document.getElementById("tabEditorInput").value = example;
}
