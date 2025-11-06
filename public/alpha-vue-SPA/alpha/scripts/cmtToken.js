// cmtToken.js - Compact Music Token (CMT) utilities
// Implements CMT as defined in cmtDocs.html

/**
 * Validate a CMT token string
 * @param {string} token
 * @returns {boolean}
 */
export function isValidCmtToken(token) {
  // Regex for CMT: <Note><Accidental><Octave>:<DurationCode>[.articulation][@velocity][:"lyrics"]
  // Note: A-G, optional #/b, octave 0-8, duration w/h/q/e/s, optional dot, optional triplet, optional extensions
  const regex = /^(?:[A-G](?:#|b)?\d|rest):(?:t)?[whqes](\.)?(\.[a-z]+)?(@\w+)?(:"[^"]*")?$/;
  return regex.test(token);
}

/**
 * Parse a CMT token into its components
 * @param {string} token
 * @returns {object|null}
 */
export function parseCmtToken(token) {
  const regex = /^(?<pitch>[A-G](#|b)?\d|rest):(?<triplet>t)?(?<duration>[whqes])(?<dot>\.)?(?<articulation>\.[a-z]+)?(?<velocity>@\w+)?(?<lyrics>:"[^"]*")?$/;
  const match = regex.exec(token);
  if (!match || !match.groups) return null;
  return {
    pitch: match.groups.pitch,
    triplet: !!match.groups.triplet,
    duration: match.groups.duration,
    dot: !!match.groups.dot,
    articulation: match.groups.articulation ? match.groups.articulation.slice(1) : null,
    velocity: match.groups.velocity ? match.groups.velocity.slice(1) : null,
    lyrics: match.groups.lyrics ? match.groups.lyrics.slice(2, -1) : null,
  };
}

/**
 * Generate a CMT token from components
 * @param {object} opts
 * @returns {string}
 */
export function generateCmtToken({ pitch, duration, triplet, dot, articulation, velocity, lyrics }) {
  let token = '';
  token += pitch || 'rest';
  token += ':';
  if (triplet) token += 't';
  token += duration || 'q';
  if (dot) token += '.';
  if (articulation) token += '.' + articulation;
  if (velocity) token += '@' + velocity;
  if (lyrics) token += ':"' + lyrics + '"';
  return token;
}

/**
 * Parse an array of CMT tokens
 * @param {string[]} tokens
 * @returns {object[]}
 */
export function parseCmtTokenArray(tokens) {
  return tokens.map(parseCmtToken).filter(Boolean);
}

/**
 * Parse a JSON measure structure as defined in cmtDocs.html
 * @param {object[]} measures
 * @returns {object[]} Array of measures with parsed notes
 */
export function parseCmtMeasures(measures) {
  return measures.map(measure => ({
    measure: measure.measure,
    notes: parseCmtTokenArray(measure.notes)
  }));
}
