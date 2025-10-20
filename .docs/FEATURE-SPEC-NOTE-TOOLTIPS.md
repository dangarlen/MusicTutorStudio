# Note Tooltip Feature Specification

## Feature Overview

Add note tooltips that display Practice Overlays information when hovering over notes in the musical staff display.

## User Story

As a musician practicing with the ETA app, I want to see additional practice information (overlays) when I hover over notes on the staff, so I can get contextual help without cluttering the main display.

## Feature Components

### 1. Practice Overlays Checkbox Control

- **Location**: In the Display Settings fieldset of show-scales.html
- **Purpose**: Enable/disable the tooltip functionality
- **Behavior**:
  - Default: Unchecked (tooltips disabled)
  - When checked: Tooltips become active on note hover
  - When unchecked: No tooltips appear
  - State persisted in cookies like other display options

### 2. Note Tooltip Display

- **Trigger**: Mouse hover over notes in the VexFlow staff notation
- **Content**: Practice overlay information such as:
  - Note name (e.g., "C4")
  - Scientific Pitch Notation
  - MIDI number
  - Fingering information for selected instrument
  - Scale degree (e.g., "1st degree", "3rd degree")
  - Any custom note annotations (future feature)

### 3. Tooltip Styling

- **Appearance**: Small popup box with dark background, white text
- **Position**: Above the note, centered
- **Animation**: Smooth fade-in/fade-out
- **Responsive**: Adjusts position if near screen edges

## Technical Implementation Plan

### HTML Changes (show-scales.html)

```html
<!-- Add to Display Settings fieldset -->
<label class="flex items-center gap-2">
  <input type="checkbox" id="practice-overlays" />
  Practice Overlays (Tooltips)
  <span class="text-blue-600 cursor-help" title="Show note information on hover"
    >ℹ️</span
  >
</label>
```

### CSS Requirements

```css
.note-tooltip {
  position: absolute;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  pointer-events: none;
  z-index: 1000;
  transition: opacity 0.2s ease;
}

.note-tooltip::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: rgba(0, 0, 0, 0.9);
}
```

### JavaScript Functions Needed

1. **initializeNoteTooltips()** - Set up event listeners on VexFlow notes
2. **showNoteTooltip(noteElement, noteData)** - Display tooltip with note info
3. **hideNoteTooltip()** - Remove tooltip from display
4. **getNoteOverlayData(spn, instrument)** - Gather all overlay information for a note
5. **toggleTooltipMode()** - Enable/disable tooltip functionality based on checkbox

### Integration Points

- **VexFlow Integration**: Hook into existing note rendering in render-scale.js
- **Instrument Data**: Use existing fingering lookup from instruments.json
- **Scale Context**: Access current scale and root note for degree calculations
- **Cookie Persistence**: Save tooltip preference like other display options

### Data Requirements

- Access to current scale notes and their positions
- Current instrument fingering data
- Note name, SPN, and MIDI number for each note
- Scale degree information relative to current root

## UX Considerations

- **Performance**: Only attach listeners when tooltips are enabled
- **Mobile**: Consider touch interaction for mobile devices
- **Accessibility**: Ensure tooltip content is accessible to screen readers
- **Visual Clutter**: Keep tooltip content concise and well-formatted

## Testing Scenarios

1. Enable/disable tooltip checkbox
2. Hover over different notes in various scales
3. Change instruments and verify fingering data updates
4. Test with different display options (note names, SPN, etc.)
5. Verify tooltip positioning near screen edges
6. Test cookie persistence across page reloads

## Future Enhancements

- **Custom Annotations**: Allow users to add personal notes to specific pitches
- **Practice Statistics**: Show how often a note has been practiced
- **Difficulty Indicators**: Color-code notes by difficulty for the selected instrument
- **Audio Preview**: Click tooltip to play the note

## Status

- **Current**: Planned (in feature-pipeline.json)
- **Priority**: Active development
- **Dependencies**: Existing VexFlow integration, instrument data system
- **Estimated Complexity**: Medium (requires VexFlow DOM manipulation and tooltip system)

---

_This specification document serves as a planning reference for implementing the note tooltip feature in the ETA music education application._
