const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const dataPath = path.join(repoRoot, "public", "data", "instruments.json");

function timestamp() {
  const d = new Date();
  return d.toISOString().replace(/[:.]/g, "-");
}

function convertSpnToken(s) {
  // Convert tokens like 'F/2', 'F#/2', 'BB/3', 'EB/1' -> 'F2', 'F#2', 'BB3', 'EB1'
  if (typeof s !== "string") return s;
  return s.replace(/([A-G](?:#|B){0,2})\/(\d+)/g, "$1$2");
}

function convertInstrument(instr) {
  const out = Object.assign({}, instr);

  if (out.standardRange) {
    if (out.standardRange.start)
      out.standardRange.start = convertSpnToken(out.standardRange.start);
    if (out.standardRange.end)
      out.standardRange.end = convertSpnToken(out.standardRange.end);
  }
  if (out.defaultStartingOctave)
    out.defaultStartingOctave = convertSpnToken(out.defaultStartingOctave);

  if (out.fingering && typeof out.fingering === "object") {
    const newF = {};
    let moved = 0;
    for (const [k, v] of Object.entries(out.fingering)) {
      const nk = convertSpnToken(k);
      if (nk in newF) {
        // If duplicate key occurs, merge arrays conservatively
        const existing = newF[nk];
        if (Array.isArray(existing) && Array.isArray(v)) {
          // merge unique
          newF[nk] = Array.from(new Set(existing.concat(v)));
        } else {
          newF[nk] = v;
        }
      } else {
        newF[nk] = v;
      }
      moved++;
    }
    out.fingering = newF;
    out._migratedFingeringCount = moved;
  }

  return out;
}

function run() {
  if (!fs.existsSync(dataPath)) {
    console.error("data file not found:", dataPath);
    process.exit(2);
  }

  const raw = fs.readFileSync(dataPath, "utf8");
  let arr;
  try {
    arr = JSON.parse(raw);
    if (!Array.isArray(arr)) throw new Error("expected array");
  } catch (err) {
    console.error("failed to parse JSON:", err.message);
    process.exit(2);
  }

  const backupPath = dataPath + ".bak." + timestamp();
  fs.copyFileSync(dataPath, backupPath);
  console.log("Backed up existing file to", backupPath);

  const out = arr.map(convertInstrument);
  fs.writeFileSync(dataPath, JSON.stringify(out, null, 2) + "\n", "utf8");

  const totalF = out.reduce((s, i) => s + (i._migratedFingeringCount || 0), 0);
  // remove helper keys before reporting
  out.forEach((i) => {
    if (i._migratedFingeringCount) delete i._migratedFingeringCount;
  });

  console.log(
    "Migrated",
    out.length,
    "instruments and",
    totalF,
    "fingering keys to",
    dataPath
  );
}

run();
