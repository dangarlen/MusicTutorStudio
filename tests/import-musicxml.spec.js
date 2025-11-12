const { test, expect } = require('@playwright/test');

// Adjust baseURL if your server is running on a different port
const path = require('path');
const BASE = process.env.BASE_URL || 'http://localhost:8000';

test('parse sample MusicXML via test page', async ({ page }) => {
  // Try HTTP first, fallback to file:// if the server returns the SPA index
  await page.goto(`${BASE}/tools/test-musicxml-import.html`);
  let content = await page.content();
  if (!content.includes('MusicXML Import Test')) {
    // fallback to local file (use absolute path to public/tools/test-musicxml-import.html)
    const filePath = path.join(process.cwd(), 'public', 'tools', 'test-musicxml-import.html');
    const fileUrl = 'file:///' + filePath.replace(/\\/g, '/');
    await page.goto(fileUrl);
  }
  // wait for the page to render parsed output (content should include 'noteArray')
  await page.waitForSelector('#out:has-text("noteArray")', { timeout: 15000 });
  const resultText = await page.locator('#result').innerText();
  const outJson = await page.locator('#out').innerText();

  // Ensure parser ran (out contains noteArray)
  expect(outJson).toContain('noteArray');

  // Make sure it didn't bail with No playable notes
  expect(resultText).not.toContain('No playable notes');

  // Optionally parse JSON and assert noteArray length > 0
  let parsed = null;
  try {
    parsed = JSON.parse(outJson);
  } catch (e) {
    // if parse fails, fail the test
    throw e;
  }
  expect(Array.isArray(parsed.noteArray)).toBeTruthy();
  expect(parsed.noteArray.length).toBeGreaterThan(0);

  // At minimum we expect some parsed tokens (rests or chord-simplified notes are optional)
});
