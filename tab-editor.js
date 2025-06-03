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

    if (/^\d\([^\)]+\)$/.test(tokenClean)) {
      const stringNum = parseInt(tokenClean[0]);
      const inner = tokenClean.slice(2, -1).trim().split(/\s+/);
      inner.forEach(note => {
        const match = note.match(/^([A-G]#?)([hptv~])?([A-G]#?)?$|^([A-G]#?)[\\/]{1}([A-G]#?)$/);
        if (match) {
          const [, from, effect, to, fromSlide, toSlide] = match;
          if (fromSlide && toSlide) {
            const idxFrom = noteIndex(fromSlide);
            const idxTo = noteIndex(toSlide);
            const slideEffect = idxTo > idxFrom ? "/" : "\\";
            result.push({ note: normalizeNote(fromSlide), string: stringNum, high });
            result.push({ note: normalizeNote(toSlide), string: stringNum, high, effect: slideEffect });
          } else if (effect && to) {
            result.push({ note: normalizeNote(from), string: stringNum, high });
            result.push({ note: normalizeNote(to), string: stringNum, effect, high });
          } else if (effect) {
            result.push({ note: normalizeNote(from), string: stringNum, effect, high });
          } else {
            result.push({ note: normalizeNote(from), string: stringNum, high });
          }
        } else {
          result.push({ note: normalizeNote(note), string: stringNum, high });
        }
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

    parsed.forEach((entry, time) => {
      const { note, string, high } = entry;
      let placed = false;

      const stringIndexes = (string >= 1 && string <= tuning.length)
        ? [tuning.length - string]
        : [...Array(tuning.length).keys()].reverse();

      for (const s of stringIndexes) {
        const openNote = tuning[s];

        const fretRange = high
          ? [...Array(fretEnd - fretStart + 1).keys()].map(i => fretEnd - i)
          : [...Array(fretEnd - fretStart + 1).keys()].map(i => fretStart + i);

        for (const fret of fretRange) {
          const noteAtFret = allNotes[(noteIndex(openNote) + fret) % 12];
          if (normalizeNote(noteAtFret) === note) {
            grid.forEach((line, i) => {
              if (i === s) {
                let sFret = fret.toString();

                if (entry.effect) {
                  if (entry.effect === "h") sFret = `${sFret}h`;
                  else if (entry.effect === "p") sFret = `${sFret}p`;
                  else if (entry.effect === "t") sFret = `${sFret}t`;
                  else if (entry.effect === "v" || entry.effect === "~") sFret = `${sFret}~`;
                  else if (entry.effect === "/") sFret = `${sFret}/`;
                  else if (entry.effect === "\\") sFret = `${sFret}\\`;
                }

                line[time] = sFret.length === 2 ? `-${sFret}-` : sFret.padEnd(4, "-");
              } else {
                line[time] = "----";
              }
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
6(E E) 5(B BhE EpF) 5(C\\D D/C) 3(Dv) 2(Gt A)

[Riff1]
3H(C D) 2(A A A)

[Bridge]
3(E D) 4(C B A G E F A/G B C G/A)

[Song]
Intro
Riff1
Bridge
`.trim();

  document.getElementById("tabEditorInput").value = example;
}
