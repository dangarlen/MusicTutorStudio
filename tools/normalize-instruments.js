const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const files = [
  path.join(repoRoot, "public", "data", "instruments.json"),
  path.join(repoRoot, "public", "data", "instruments (NO slashes).json"),
];

const FLAT_TO_SHARP = {
  Bb: "A#",
  Eb: "D#",
  Ab: "G#",
  Db: "C#",
  Gb: "F#",
  Cb: "B",
  Fb: "E",
};

function ts() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function convertToken(token) {
  if (typeof token !== "string") return token;
  // remove any surrounding whitespace
  let s = token.trim();
  // remove slash if present
  s = s.replace("/", "");
  // match Note + optional accidental (# or b or B) + octave
  const m = s.match(/^([A-G])([#bB]?)(\d+)$/);
  if (!m) return token; // leave unchanged if unexpected
  const note = m[1];
  const acc = m[2];
  const oct = m[3];
  if (acc === "#") return `${note}#${oct}`;
  if (acc === "b" || acc === "B") {
    const key = note + "b";
    const mapped = FLAT_TO_SHARP[key];
    if (mapped) return `${mapped}${oct}`;
    // fallback: uppercase B notation -> convert to A# style for B-flat
    return `${note}b${oct}`;
  }
  // natural
  return `${note}${oct}`;
}

function normalizeInstrument(instr) {
  const out = JSON.parse(JSON.stringify(instr));
  if (out.standardRange) {
    if (out.standardRange.start)
      out.standardRange.start = convertToken(out.standardRange.start);
    if (out.standardRange.end)
      out.standardRange.end = convertToken(out.standardRange.end);
  }
  if (out.defaultStartingOctave)
    out.defaultStartingOctave = convertToken(out.defaultStartingOctave);

  if (out.fingering && typeof out.fingering === "object") {
    const newF = {};
    for (const [k, v] of Object.entries(out.fingering)) {
      const nk = convertToken(k);
      if (nk in newF) {
        // merge arrays uniquely
        const merged = Array.isArray(newF[nk]) ? newF[nk] : [];
        v.forEach((x) => {
          if (!merged.includes(x)) merged.push(x);
        });
        newF[nk] = merged;
      } else {
        newF[nk] = v;
      }
    }
    out.fingering = newF;
  }

  // remove any helper migration keys
  if (out._migratedFingeringCount) delete out._migratedFingeringCount;
  return out;
}

function processFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn("Skipping missing file", filePath);
    return;
  }
  const raw = fs.readFileSync(filePath, "utf8");
  let arr;
  try {
    arr = JSON.parse(raw);
    if (!Array.isArray(arr)) throw new Error("not array");
  } catch (err) {
    console.error("Failed parse", filePath, err.message);
    return;
  }

  const backup = filePath + ".bak." + ts();
  fs.copyFileSync(filePath, backup);
  console.log("Backed up", filePath, "->", backup);

  const out = arr.map(normalizeInstrument);
  fs.writeFileSync(filePath, JSON.stringify(out, null, 2) + "\n", "utf8");
  console.log("Normalized", filePath);
}

function run() {
  files.forEach(processFile);
}

run();
