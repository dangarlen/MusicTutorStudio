const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const srcPath = path.join(
  repoRoot,
  "public",
  "data",
  "instruments (NO slashes).json"
);

const FLAT_TO_SHARP = {
  Bb: "A#",
  Eb: "D#",
  Ab: "G#",
  Db: "C#",
  Gb: "F#",
  Cb: "B",
  Fb: "E",
};

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function convertToken(token) {
  if (typeof token !== "string") return token;
  // Replace flats like 'Bb/3' -> 'A#/3'
  return token.replace(/([A-G])b\/(\d+)/g, (m, note, oct) => {
    const key = note + "b";
    const mapped = FLAT_TO_SHARP[key];
    return mapped ? `${mapped}/${oct}` : m;
  });
}

function convertInstrument(instr) {
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

  return out;
}

function run() {
  if (!fs.existsSync(srcPath)) {
    console.error("source file not found:", srcPath);
    process.exit(2);
  }

  const raw = fs.readFileSync(srcPath, "utf8");
  let arr;
  try {
    arr = JSON.parse(raw);
    if (!Array.isArray(arr)) throw new Error("expected array");
  } catch (err) {
    console.error("failed to parse JSON:", err.message);
    process.exit(2);
  }

  const backup = srcPath + ".bak." + timestamp();
  fs.copyFileSync(srcPath, backup);
  console.log("Backed up", srcPath, "->", backup);

  const out = arr.map(convertInstrument);
  fs.writeFileSync(srcPath, JSON.stringify(out, null, 2) + "\n", "utf8");
  console.log("Wrote", srcPath, "with flat->sharp conversions");
}

run();
