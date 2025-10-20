#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function writeJson(p, obj) {
  fs.writeFileSync(p, JSON.stringify(obj, null, 2), "utf8");
}

function convertSpn(raw) {
  if (typeof raw !== "string") return raw;
  raw = raw.trim();
  // Match forms like C/4 or C4 or C#4 or C#/4 or Bb3
  const m = raw.match(/^([A-Ga-g][#b]?)(?:\/?)(\d+)$/);
  if (!m) {
    // if it already contains a slash in a weird place, try to normalize
    const fallback = raw.replace(/\s+/g, "");
    const m2 = fallback.match(/^([A-Ga-g][#b]?)(?:\/?)(\d+)$/);
    if (m2) return `${m2[1].toUpperCase()}/${m2[2]}`;
    // give up and return original
    return raw;
  }
  const note = m[1].toUpperCase();
  const octave = m[2];
  return `${note}/${octave}`;
}

function migrateInstrumentEntry(entry) {
  const out = Object.assign({}, entry);

  if (out.standardRange) {
    if (out.standardRange.start)
      out.standardRange.start = convertSpn(out.standardRange.start);
    if (out.standardRange.end)
      out.standardRange.end = convertSpn(out.standardRange.end);
  }
  if (out.defaultStartingOctave)
    out.defaultStartingOctave = convertSpn(out.defaultStartingOctave);

  if (out.fingering && typeof out.fingering === "object") {
    const newF = {};
    Object.keys(out.fingering).forEach((k) => {
      const nk = convertSpn(k);
      newF[nk] = out.fingering[k];
    });
    out.fingering = newF;
  }

  return out;
}

function backupFile(p) {
  const dir = path.dirname(p);
  const base = path.basename(p);
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const dest = path.join(dir, `${base}.bak.${stamp}`);
  fs.copyFileSync(p, dest);
  return dest;
}

function main() {
  const repoRoot = path.resolve(__dirname, "..");
  const src =
    process.argv[2] ||
    path.join(repoRoot, "public", "data", "instruments (NO slashes).json");
  const dest =
    process.argv[3] ||
    path.join(repoRoot, "public", "data", "instruments.json");

  if (!fs.existsSync(src)) {
    console.error(`Source file not found: ${src}`);
    process.exit(2);
  }
  if (!fs.existsSync(dest)) {
    console.warn(`Destination file not found; will create: ${dest}`);
  } else {
    const bak = backupFile(dest);
    console.log(`Backed up existing destination to ${bak}`);
  }

  const data = readJson(src);
  if (!Array.isArray(data)) {
    console.error("Source JSON must be an array of instrument entries");
    process.exit(3);
  }

  const out = data.map(migrateInstrumentEntry);
  writeJson(dest, out);

  // report
  let keyCount = 0;
  out.forEach((e) => {
    keyCount += Object.keys(e.fingering || {}).length;
  });
  console.log(
    `Migrated ${out.length} instruments and ${keyCount} fingering keys to ${dest}`
  );
}

if (require.main === module) main();
