const { test, expect } = require('@playwright/test');
const path = require('path');

// Base URL for the local static server (prefer Vite dev server during development)
const BASE = process.env.BASE_URL || 'http://localhost:5175';

test('SPA import: upload MusicXML to Create Exercise and verify rests and chord simplification', async ({ page }) => {
  // Pipe page console and errors to test runner output for debugging
  page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', (err) => console.log('PAGE ERROR:', err && err.message));
  // Try HTTP first, fallback to local file index with hash route if necessary
  await page.goto(`${BASE}/#/create-exercises`);
  let content = await page.content();
  if (!content.includes('Create Exercise')) {
    // fallback to file:// index.html with hash route
  const idx = path.join(process.cwd(), 'public', 'index.html');
  const fileUrl = 'file:///' + idx.replace(/\\\\/g, '/') + '#/create-exercises';
    await page.goto(fileUrl);
  }

  // Wait for the Create Exercise file input to appear
  // Expand the MusicXML collapse panel so the file input becomes visible
  const musicXmlPanel = page.locator('div.collapse:has-text("MusicXML")');
  // The collapse uses a hidden checkbox (peer); click the checkbox to toggle
  await musicXmlPanel.locator('input[type="checkbox"]').click();

  const fileInput = page.locator('input[type="file"]');
  await fileInput.waitFor({ timeout: 15000 });

  // Prefer a targeted test file that includes a rest and chord; fall back to the larger sample
  let sample = path.join(process.cwd(), 'public', 'tools', 'sample-musicxml-test-rests-chords.xml');
  const fallback = path.join(process.cwd(), 'public', 'tools', 'sample-musicxml.xml');
  // If the targeted test file is missing, use the fallback
  const fs = require('fs');
  if (!fs.existsSync(sample)) {
    sample = fallback;
  }
  await fileInput.setInputFiles(sample);

  // Debug: read the selected file content from the browser context and log a short preview
  const filePreview = await page.evaluate(async () => {
    const f = document.querySelector('input[type="file"]')?.files?.[0];
    if (!f) return null;
    try {
      const text = await f.text();
      return text.slice(0, 1024);
    } catch (e) {
      return 'ERROR:' + String(e.message || e);
    }
  });
  console.log('FILE PREVIEW:', filePreview ? filePreview.slice(0, 500) : '<no file>');

  // Wait for the import to process — the preview shows 'Imported note count'
  // Wait a short moment and then check for any import error messages
  await page.waitForTimeout(1000);
  const importErrors = await page.locator('.text-error').allInnerTexts();
  console.log('IMPORT ERRORS:', importErrors);
  if (importErrors && importErrors.length) {
    // Try to reproduce DOMParser error in-page for diagnostics
    const parserErr = await page.evaluate(async () => {
      try {
        const f = document.querySelector('input[type="file"]')?.files?.[0];
        if (!f) return null;
        const t = await f.text();
        const d = new DOMParser().parseFromString(t, 'application/xml');
        const pe = d.getElementsByTagName('parsererror')[0];
        return pe ? (pe.textContent || pe.innerHTML || String(pe)) : null;
      } catch (e) {
        return 'EVAL_ERR:' + String(e.message || e);
      }
    });
    console.log('DOMParser parsererror content:', parserErr);
    throw new Error('Import failed with error: ' + importErrors.join(' | '));
  }
  await page.waitForSelector('text=Imported note count', { timeout: 30000 });

  // Open the "Behind the Curtain" panel to read the JSON snapshot
  const behind = page.locator('div.collapse:has-text("Behind the Curtain: practiceUnitStore")');
  // Toggle the collapse open by clicking its checkbox (peer) to avoid pointer interception
  await behind.locator('input[type="checkbox"]').click();

  // Read the JSON pre inside the collapse content
  const pre = behind.locator('.collapse-content pre');
  await pre.waitFor({ timeout: 5000 });
  const jsonText = await pre.innerText();

  let parsed = null;
  try {
    parsed = JSON.parse(jsonText);
  } catch (e) {
    throw new Error('Failed to parse JSON from Behind the Curtain: ' + e.message);
  }

  expect(parsed).toBeTruthy();
  expect(Array.isArray(parsed.noteArray)).toBeTruthy();
  expect(parsed.noteArray.length).toBeGreaterThan(0);

  // Assert at least one rest token (duration ending with 'r') exists
  const hasRest = parsed.noteArray.some((n) => typeof n.duration === 'string' && n.duration.endsWith('r'));
  expect(hasRest).toBeTruthy();

  // Assert at least one simplified chord note (noteColor === 'orange') exists
  const hasOrange = parsed.noteArray.some((n) => (n.noteColor || '').toLowerCase() === 'orange');
  expect(hasOrange).toBeTruthy();
});
