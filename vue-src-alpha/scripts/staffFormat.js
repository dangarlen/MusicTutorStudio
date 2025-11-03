// Reusable staff-format loader with in-memory cache
let _cachedFormat = null;

export async function getStaffFormat() {
  if (_cachedFormat) return _cachedFormat;
  try {
    const url = `${import.meta.env.BASE_URL}staff-format.json`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Failed to load ${url}`);
    _cachedFormat = await resp.json();
    return _cachedFormat;
  } catch (e) {
    console.warn("[staffFormat] Using fallback defaults:", e);
    _cachedFormat = {
      staff: {
        x: 10,
        y: 40,
        width: 560,
        height: 200,
        clef: "treble",
        backgroundColor: "#f3f4f6",
        containerPadding: 10,
        containerBorderRadius: 12,
        containerShadow: "0 2px 8px 0 rgba(0,0,0,0.07)",
        verticalCenter: false,
        enforceLedgerLimits: false,
        ledgerLines: { above: 3, below: 3 },
        noteSpacing: {
          mode: "default", // Locked to VexFlow default spacing; other fields removed
        },
      },
      noteColors: ["black", "blue", "orange", "green"],
    };
    return _cachedFormat;
  }
}
