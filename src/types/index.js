/**
 * @fileoverview Type definitions for Music Tutor Studio using JSDoc
 * Provides IntelliSense and type checking without TypeScript compilation
 */

/**
 * @typedef {Object} PracticeUnitHeader
 * @property {string} practiceName - Display name for the practice unit
 * @property {string} practiceUnitId - Unique identifier
 * @property {string} lastModified - ISO timestamp
 * @property {string} practiceUnitType - Type: "Scale" | "Exercise" | "Lesson"
 * @property {number} tempo - BPM tempo
 * @property {string} keySignature - Key signature (e.g., "C", "G", "F#")
 * @property {string} timeSignature - Time signature (e.g., "4/4", "3/4")
 * @property {Instrument|null} instrument - Selected instrument object
 * @property {StaffDisplayOptions} staffDisplayOptions - Staff rendering options
 * @property {string} sourceURL - Optional source URL
 * @property {Object<string, string>} noteColorDesignation - Color mappings
 * @property {string} User - User identifier
 * @property {boolean} shareMusic - Sharing permission
 * @property {string} contentType - Scale type for Scale units
 * @property {string} direction - Scale direction
 * @property {string} startingOctave - Starting octave
 * @property {number} numberOfOctaves - Number of octaves
 */

/**
 * @typedef {Object} NoteData
 * @property {string} pitch - Note pitch in SPN format
 * @property {string} duration - Note duration
 * @property {boolean} noteVisible - Visibility flag
 * @property {string} noteColor - Display color
 * @property {string} overlay - Overlay text
 * @property {Object} overlayObject - Overlay configuration
 * @property {string} rangeStatus - Range validation status
 */

/**
 * @typedef {Object} PracticeUnit
 * @property {PracticeUnitHeader} practiceUnitHeader - Header metadata
 * @property {NoteData[]} noteArray - Array of notes
 */

/**
 * @typedef {Object} Instrument
 * @property {string} instrument - Instrument name
 * @property {string} clef - Clef type
 * @property {Object} standardRange - Range definition
 * @property {string} standardRange.start - Starting note
 * @property {string} standardRange.end - Ending note
 * @property {Object<string, string[]>} fingering - Fingering mappings
 */

/**
 * @typedef {Object} ActiveUnitContext
 * @property {PracticeUnit|null} unit - Current active practice unit
 * @property {"quick"|"lesson"|"saved"|null} source - Source of the active unit
 * @property {string|null} sourceId - ID of source (lesson ID, etc.)
 * @property {string|null} sourceName - Display name of source
 * @property {boolean} hasUnsavedChanges - Whether unit has unsaved changes
 * @property {Date|null} lastModified - When unit was last modified
 */

/**
 * @typedef {"create"|"practice"|"save"|"manage"|null} WorkflowState
 */

/**
 * @typedef {Object} StaffDisplayOptions
 * @property {boolean} showAccidentals - Show accidentals
 * @property {boolean} showOverlays - Show overlays
 * @property {number} measuresPerLineMax - Maximum measures per line
 */

/**
 * Validation functions for type checking
 */

/**
 * Validates a practice unit object
 * @param {any} unit - Object to validate
 * @returns {boolean} True if valid practice unit
 */
export function validatePracticeUnit(unit) {
  if (!unit || typeof unit !== 'object') {
    console.warn('[Type Validation] Invalid practice unit: not an object', unit);
    return false;
  }

  if (!unit.practiceUnitHeader || typeof unit.practiceUnitHeader !== 'object') {
    console.warn('[Type Validation] Invalid practice unit: missing or invalid header', unit);
    return false;
  }

  const header = unit.practiceUnitHeader;
  if (typeof header.practiceName !== 'string') {
    console.warn('[Type Validation] Invalid practice unit header: practiceName must be string', header);
    return false;
  }

  if (!Array.isArray(unit.noteArray)) {
    console.warn('[Type Validation] Invalid practice unit: noteArray must be array', unit);
    return false;
  }

  return true;
}

/**
 * Validates an instrument object
 * @param {any} instrument - Object to validate
 * @returns {boolean} True if valid instrument
 */
export function validateInstrument(instrument) {
  if (!instrument || typeof instrument !== 'object') {
    console.warn('[Type Validation] Invalid instrument: not an object', instrument);
    return false;
  }

  if (typeof instrument.instrument !== 'string') {
    console.warn('[Type Validation] Invalid instrument: missing name', instrument);
    return false;
  }

  return true;
}

/**
 * Validates active unit context
 * @param {any} context - Context to validate
 * @returns {boolean} True if valid context
 */
export function validateActiveUnitContext(context) {
  if (!context || typeof context !== 'object') {
    console.warn('[Type Validation] Invalid active unit context: not an object', context);
    return false;
  }

  if (context.unit && !validatePracticeUnit(context.unit)) {
    return false;
  }

  const validSources = ['quick', 'lesson', 'saved', null];
  if (!validSources.includes(context.source)) {
    console.warn('[Type Validation] Invalid active unit context: invalid source', context.source);
    return false;
  }

  return true;
}

/**
 * Creates a default practice unit header
 * @returns {PracticeUnitHeader}
 */
export function createDefaultPracticeUnitHeader() {
  return {
    practiceName: "",
    practiceUnitId: "",
    lastModified: "",
    practiceUnitType: "Scale",
    tempo: 120,
    keySignature: "C",
    timeSignature: "4/4",
    instrument: null,
    staffDisplayOptions: {
      showAccidentals: true,
      showOverlays: true,
      measuresPerLineMax: 2,
    },
    sourceURL: "",
    noteColorDesignation: {},
    User: "",
    shareMusic: false,
    contentType: "major",
    direction: "ascending",
    startingOctave: "C4",
    numberOfOctaves: 1,
  };
}

/**
 * Creates a default active unit context
 * @returns {ActiveUnitContext}
 */
export function createDefaultActiveUnitContext() {
  return {
    unit: null,
    source: null,
    sourceId: null,
    sourceName: null,
    hasUnsavedChanges: false,
    lastModified: null,
  };
}
