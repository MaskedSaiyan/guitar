const scales = {
  "Mayor (Jónico)": [0, 2, 4, 5, 7, 9, 11],
  "Menor Natural (Eólica)": [0, 2, 3, 5, 7, 8, 10],
  "Dórica": [0, 2, 3, 5, 7, 9, 10],
  "Frigia": [0, 1, 3, 5, 7, 8, 10],
  "Frigia Dominante": [0, 1, 4, 5, 7, 8, 10],
  "Lidia": [0, 2, 4, 6, 7, 9, 11],
  "Mixolidia": [0, 2, 4, 5, 7, 9, 10],
  "Locria": [0, 1, 3, 5, 6, 8, 10],
  "Menor Armónica": [0, 2, 3, 5, 7, 8, 11],
  "Menor Melódica (Ascendente)": [0, 2, 3, 5, 7, 9, 11],
  "Pentatónica Mayor": [0, 2, 4, 7, 9],
  "Pentatónica Menor": [0, 3, 5, 7, 10],
  "Escala de Blues": [0, 3, 5, 6, 7, 10]
};


function getScaleNotes(root, intervals) {
  const chromatic = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const rootIndex = chromatic.indexOf(root);
  return intervals.map(i => chromatic[(rootIndex + i) % 12]);
}

function populateScaleSelector() {
  const select = document.getElementById("scaleSelect");
  Object.keys(scales).forEach(name => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    select.appendChild(option);
  });
}

function updateNotesDisplay() {
  // 🧩 Obtenemos la nota raíz y el nombre de la escala
  const root = document.getElementById("rootSelect").value;
  const scale = document.getElementById("scaleSelect").value;

  // 🧱 Buscamos los intervalos definidos para esa escala
  const intervals = scales[scale];

  // 🧠 Calculamos las notas a partir de la raíz + intervalos
  const notes = getScaleNotes(root, intervals);

  // 🖨️ Mostramos las notas en el texto visible (puede estar donde sea en el HTML)
  const noteOutput = document.getElementById("noteOutput");
  if (noteOutput) {
    noteOutput.textContent = notes.join(" – ");
  }

  // ✍️ También ponemos las notas en el input, para que se puedan editar si se quiere
  const notesInput = document.getElementById("notesInput");
  if (notesInput) {
    notesInput.value = notes.join(" ");
  }

  // 🎯 Resalta en el diapasón si existe esa función
  if (typeof highlightFretboard === 'function') {
    highlightFretboard(notes, root);
  }

  // 🎸 Redibuja el mástil con esas notas
  if (typeof drawFretboard === 'function') {
    drawFretboard();
  }

  // 🎹 También en el piano, si existe la función
  if (typeof highlightPianoNotes === 'function') {
    highlightPianoNotes();
  }
}


function showSuggestedScalesFromInput() {
  const input = getExpandedNotesFromInput().filter(n => allNotes.includes(n));
  const suggestionList = document.getElementById("suggestionList");
  suggestionList.innerHTML = "";

  if (input.length === 0) return;

  const matches = [];

  Object.keys(scales).forEach(scaleName => {
    allNotes.forEach(root => {
      const scaleNotes = getScaleNotes(root, scales[scaleName]);
      const matchCount = input.filter(n => scaleNotes.includes(n)).length;

      if (matchCount > 0) {
        const matchPercent = Math.round((matchCount / scaleNotes.length) * 100);
        matches.push({ root, scaleName, matchCount, matchPercent });
      }
    });
  });

  matches
    .sort((a, b) => b.matchPercent - a.matchPercent || b.matchCount - a.matchCount)
    .slice(0, 5)
    .forEach(match => {
      const li = document.createElement("li");
      li.textContent = `${match.root} ${match.scaleName}`;

      const percentSpan = document.createElement("span");
      percentSpan.textContent = ` – ${match.matchPercent}% de coincidencia`;

      if (match.matchPercent >= 90) {
        percentSpan.style.color = "green";
      } else if (match.matchPercent >= 70) {
        percentSpan.style.color = "orange";
      } else {
        percentSpan.style.color = "red";
      }

      li.appendChild(percentSpan);
      suggestionList.appendChild(li);
    });
}

function suggestChordsFromInput() {
  const input = document.getElementById("notesInput").value
    .trim()
    .toUpperCase()
    .split(/\s+/)
    .map(normalizeNote)
    .filter(n => allNotes.includes(n));

  const chordList = document.getElementById("chordList");
  chordList.innerHTML = "";

  if (input.length < 2) return;

  const detectedChords = [];

  allNotes.forEach(root => {
    const intervalMap = {
      major: [0, 4, 7], // 1 3 5
      minor: [0, 3, 7], // 1 b3 5
      power: [0, 7],    // 1 5
    };

    Object.entries(intervalMap).forEach(([type, steps]) => {
      const chordNotes = steps.map(i => allNotes[(noteIndex(root) + i) % 12]);
      const presentNotes = chordNotes.filter(n => input.includes(n));
      const missingNotes = chordNotes.filter(n => !input.includes(n));

      if (presentNotes.length === chordNotes.length) {
        // acorde completo
        let name = type === "power" ? `${root}5` : `${root}${type === "major" ? "" : "m"}`;
        detectedChords.push({ name, notes: chordNotes, type, root, missing: [] });
      } else if (presentNotes.length >= 2 && type !== "power") {
        // acorde incompleto útil (ej: Am sin E)
        let name = `${root}${type === "major" ? "" : "m"} (incompleto)`;
        detectedChords.push({ name, notes: presentNotes, type, root, missing: missingNotes });
      }
    });
  });

  if (detectedChords.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No se detectaron acordes.";
    chordList.appendChild(li);
    return;
  }

  // Mostrar acordes
  detectedChords.slice(0, 6).forEach(chord => {
    const li = document.createElement("li");
    let txt = `${chord.name} (${chord.notes.join(" ")})`;
    if (chord.missing.length > 0) {
      txt += ` – Falta: ${chord.missing.join(" ")}`;
    }
    li.textContent = txt;
    chordList.appendChild(li);
  });

  // Sugerir progresión y tonalidad
  const roots = detectedChords.map(c => c.root);
  const uniqueRoots = [...new Set(roots)];
  const possibleTonalities = {};

  Object.keys(scales).forEach(scaleName => {
    allNotes.forEach(root => {
      const scaleNotes = getScaleNotes(root, scales[scaleName]);
      const hits = uniqueRoots.filter(n => scaleNotes.includes(n));
      if (hits.length >= 2) {
        const key = `${root} ${scaleName}`;
        possibleTonalities[key] = hits.length;
      }
    });
  });

  const best = Object.entries(possibleTonalities).sort((a, b) => b[1] - a[1])[0];

  if (best) {
    const [key, matchCount] = best;
    const progression = detectedChords.map(c => c.name).join(" – ");

    const prog = document.createElement("li");
    prog.innerHTML = `<strong>🎶 Progresión sugerida:</strong> ${progression}`;
    chordList.appendChild(prog);

    const tone = document.createElement("li");
    tone.innerHTML = `<strong>🔑 Tonalidad probable:</strong> ${key}`;
    chordList.appendChild(tone);
  }
}



