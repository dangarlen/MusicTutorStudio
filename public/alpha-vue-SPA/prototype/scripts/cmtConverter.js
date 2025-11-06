// cmtConverter.js - Simple CMT (Compact Music Token) converter
// Converts practice passage JSON to formatted CMT display

console.log("cmtConverter.js loaded");

/**
 * Converts a practice passage JSON to CMT sequence string
 * @param {Object} passageData - Practice passage JSON object
 * @param {Object} options - Display options
 * @param {boolean} options.includeMeasureMarkers - Include measure markers (default: false)
 * @param {number} options.tokensPerLine - Number of tokens per line (default: 8)
 * @returns {string} Formatted CMT sequence
 */
function convertPassageToCMT(passageData, options = {}) {
  const { includeMeasureMarkers = false, tokensPerLine = 8 } = options;

  console.log("Converting passage to CMT:", passageData.title);

  let cmtTokens = [];

  // Process each measure
  if (passageData.measures && Array.isArray(passageData.measures)) {
    passageData.measures.forEach((measure) => {
      // Add measure marker if requested
      if (includeMeasureMarkers && measure.measure) {
        cmtTokens.push(`[M${measure.measure}]`);
      }

      // Add notes from this measure (they're already in CMT format)
      if (measure.notes && Array.isArray(measure.notes)) {
        cmtTokens.push(...measure.notes);
      }
    });
  }

  // Format for display with line breaks
  let formattedLines = [];
  let currentLine = [];

  cmtTokens.forEach((token, index) => {
    currentLine.push(token);

    // Break line when we reach tokensPerLine or at measure markers
    if (
      currentLine.length >= tokensPerLine ||
      (token.startsWith("[M") && currentLine.length > 1)
    ) {
      // If we hit a measure marker, put it at the start of next line
      if (token.startsWith("[M") && currentLine.length > 1) {
        // Remove the measure marker from current line
        const measureMarker = currentLine.pop();
        // Add current line to formatted lines
        if (currentLine.length > 0) {
          formattedLines.push(currentLine.join(" "));
        }
        // Start new line with measure marker
        currentLine = [measureMarker];
      } else {
        // Normal line break
        formattedLines.push(currentLine.join(" "));
        currentLine = [];
      }
    }
  });

  // Add any remaining tokens
  if (currentLine.length > 0) {
    formattedLines.push(currentLine.join(" "));
  }

  return formattedLines.join("\n");
}

/**
 * Gets just the pitch sequence (no durations) from a passage
 * @param {Object} passageData - Practice passage JSON object
 * @returns {Array} Array of unique pitches
 */
function getUniquePitches(passageData) {
  const pitches = new Set();

  if (passageData.measures && Array.isArray(passageData.measures)) {
    passageData.measures.forEach((measure) => {
      if (measure.notes && Array.isArray(measure.notes)) {
        measure.notes.forEach((note) => {
          // Extract pitch part from CMT token (before the colon)
          if (note.includes(":") && !note.startsWith("rest:")) {
            const pitch = note.split(":")[0];
            pitches.add(pitch);
          }
        });
      }
    });
  }

  return Array.from(pitches).sort();
}

/**
 * Formats passage header information (title, composer, key, time signature)
 * @param {Object} passageData - Practice passage JSON object
 * @returns {string} Formatted header string
 */
function formatPassageHeader(passageData) {
  let header = "";
  if (passageData.title) {
    header += `Title: ${passageData.title}\n`;
  }
  if (passageData.composer) {
    header += `Composer: ${passageData.composer}\n`;
  }
  if (passageData.keySignature) {
    header += `Key: ${passageData.keySignature}\n`;
  }
  if (passageData.timeSignature) {
    header += `Time: ${passageData.timeSignature}`;
  }
  return header;
}

// Export functions to window for global access
window.convertPassageToCMT = convertPassageToCMT;
window.getUniquePitches = getUniquePitches;
window.formatPassageHeader = formatPassageHeader;

console.log("✅ CMT Converter functions exported to window:", {
  convertPassageToCMT: typeof window.convertPassageToCMT,
  getUniquePitches: typeof window.getUniquePitches,
  formatPassageHeader: typeof window.formatPassageHeader,
});
