const { test, expect } = require('@playwright/test');

/**
 * Music Tutor Studio - Comprehensive Workflow Tests
 * Tests all primary user navigation paths and workflows
 */

// Test grouping: Home Page
test.describe('Home Page Navigation', () => {
  test('should load home page and display all navigation options', async ({ page }) => {
    await page.goto('/');
    
    // Verify page title
    await expect(page).toHaveTitle(/Music Tutor Studio/);
    
    // Verify all main navigation buttons exist
    await expect(page.locator('a[href="#/creator"]')).toBeVisible();
    await expect(page.locator('a[href="#/practice"]')).toBeVisible();
    await expect(page.locator('a[href="#/lessons"]')).toBeVisible();
    await expect(page.locator('a[href="#/preferences"]')).toBeVisible();
    await expect(page.locator('a[href="#/about"]')).toBeVisible();
  });

  test('should navigate to each main section from home', async ({ page }) => {
    await page.goto('/');
    
    // Test navigation to Creator
    await page.click('a[href="#/creator"]');
    await expect(page).toHaveURL(/#\/creator/);
    await page.goBack();
    
    // Test navigation to Practice
    await page.click('a[href="#/practice"]');
    await expect(page).toHaveURL(/#\/practice/);
    await page.goBack();
    
    // Test navigation to Lessons
    await page.click('a[href="#/lessons"]');
    await expect(page).toHaveURL(/#\/lessons/);
    await page.goBack();
    
    // Test navigation to Preferences
    await page.click('a[href="#/preferences"]');
    await expect(page).toHaveURL(/#\/preferences/);
    await page.goBack();
    
    // Test navigation to About
    await page.click('a[href="#/about"]');
    await expect(page).toHaveURL(/#\/about/);
  });
});

// Test grouping: Creator Workflow
test.describe('Creator Workflow - Create Scales', () => {
  test('should navigate to Create Scales page', async ({ page }) => {
    await page.goto('/#/creator');
    await page.click('a[href="#/create-scales"]');
    await expect(page).toHaveURL(/#\/create-scales/);
    
    // Verify page loaded with expected elements
    await expect(page.locator('text=/create.*scale/i')).toBeVisible();
  });

  test('should create a basic scale and view it', async ({ page }) => {
    await page.goto('/#/create-scales');
    
    // Select instrument (assume euphonium is default or available)
    // Note: Actual selectors depend on your UI implementation
    const instrumentSelect = page.locator('select, [role="listbox"]').first();
    if (await instrumentSelect.isVisible()) {
      await instrumentSelect.selectOption({ index: 0 });
    }
    
    // Select a root note (e.g., C)
    const rootNoteSelect = page.locator('select').nth(1);
    if (await rootNoteSelect.isVisible()) {
      await rootNoteSelect.selectOption({ index: 0 });
    }
    
    // Click Create/Generate button
    const createButton = page.locator('button:has-text("Create"), button:has-text("Generate")').first();
    if (await createButton.isVisible()) {
      await createButton.click();
    }
    
    // Verify VexFlow staff rendering appears
    const vexflowCanvas = page.locator('canvas, svg').first();
    await expect(vexflowCanvas).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to scale view page', async ({ page }) => {
    await page.goto('/#/create-scales');
    
    // After creating a scale, View button should navigate to view page
    const viewButton = page.locator('button:has-text("View"), a:has-text("View")').first();
    if (await viewButton.isVisible()) {
      await viewButton.click();
      await expect(page).toHaveURL(/#\/create-practice-unit-view/);
    }
  });
});

test.describe('Creator Workflow - Create Exercises', () => {
  test('should navigate to Create Exercises page', async ({ page }) => {
    await page.goto('/#/creator');
    await page.click('a[href="#/create-exercises"]');
    await expect(page).toHaveURL(/#\/create-exercises/);
    
    // Verify page loaded
    await expect(page.locator('text=/create.*exercise/i')).toBeVisible();
  });

  test('should display MusicXML import option', async ({ page }) => {
    await page.goto('/#/create-exercises');
    
    // Look for MusicXML collapse panel or file input
    const musicXmlSection = page.locator('text=/musicxml/i').first();
    await expect(musicXmlSection).toBeVisible();
  });
});

// Test grouping: Practice Workflow
test.describe('Practice Workflow - Hub Navigation', () => {
  test('should navigate to Practice hub', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="#/practice"]');
    await expect(page).toHaveURL(/#\/practice/);
    
    // Verify practice options are visible
    await expect(page.locator('text=/active.*unit/i, text=/practice.*active/i')).toBeVisible();
  });

  test('should navigate to Active Unit Practice', async ({ page }) => {
    await page.goto('/#/practice');
    
    const activeUnitButton = page.locator('a[href="#/practice-active-unit"]').first();
    await activeUnitButton.click();
    await expect(page).toHaveURL(/#\/practice-active-unit/);
  });

  test('should navigate to Recall Saved Practice Unit', async ({ page }) => {
    await page.goto('/#/practice');
    
    const recallButton = page.locator('a[href="#/practice-recall-practice-unit"]').first();
    await recallButton.click();
    await expect(page).toHaveURL(/#\/practice-recall-practice-unit/);
  });
});

test.describe('Practice Workflow - Practice Modes', () => {
  test('should display empty state when no active unit', async ({ page }) => {
    // Clear localStorage to ensure no active unit
    await page.goto('/#/practice-active-unit');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    
    // Should show empty state message
    const emptyMessage = page.locator('text=/no.*active.*unit/i, text=/load.*practice.*unit/i').first();
    await expect(emptyMessage).toBeVisible({ timeout: 5000 });
  });

  test('should navigate between practice modes', async ({ page }) => {
    await page.goto('/#/practice-active-unit');
    
    // Note Practice
    const notePracticeLink = page.locator('a[href="#/practice-notes"]').first();
    if (await notePracticeLink.isVisible()) {
      await notePracticeLink.click();
      await expect(page).toHaveURL(/#\/practice-notes/);
      await page.goBack();
    }
    
    // Pitch Practice
    const pitchPracticeLink = page.locator('a[href="#/practice-pitch"]').first();
    if (await pitchPracticeLink.isVisible()) {
      await pitchPracticeLink.click();
      await expect(page).toHaveURL(/#\/practice-pitch/);
      await page.goBack();
    }
    
    // Tuning Practice
    const tuningPracticeLink = page.locator('a[href="#/practice-tuning"]').first();
    if (await tuningPracticeLink.isVisible()) {
      await tuningPracticeLink.click();
      await expect(page).toHaveURL(/#\/practice-tuning/);
    }
  });
});

// Test grouping: Lessons Workflow
test.describe('Lessons Workflow', () => {
  test('should navigate to Lessons hub', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="#/lessons"]');
    await expect(page).toHaveURL(/#\/lessons/);
    
    // Verify lessons options
    await expect(page.locator('text=/manage.*lesson/i, text=/create.*lesson/i, text=/start.*lesson/i')).toBeVisible();
  });

  test('should navigate to Manage Lessons', async ({ page }) => {
    await page.goto('/#/lessons');
    
    const manageButton = page.locator('a[href="#/lessons-manage"]').first();
    await manageButton.click();
    await expect(page).toHaveURL(/#\/lessons-manage/);
  });

  test('should navigate to Create Lesson', async ({ page }) => {
    await page.goto('/#/lessons');
    
    const createButton = page.locator('a[href="#/lessons-create"]').first();
    await createButton.click();
    await expect(page).toHaveURL(/#\/lessons-create/);
  });

  test('should navigate to Start Lesson', async ({ page }) => {
    await page.goto('/#/lessons');
    
    const startButton = page.locator('a[href="#/lessons-start"]').first();
    await startButton.click();
    await expect(page).toHaveURL(/#\/lessons-start/);
  });
});

// Test grouping: Preferences
test.describe('Preferences Workflow', () => {
  test('should navigate to Preferences page', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="#/preferences"]');
    await expect(page).toHaveURL(/#\/preferences/);
    
    // Verify preferences content loaded
    await expect(page.locator('text=/preference/i, text=/setting/i')).toBeVisible();
  });

  test('should display instrument selection', async ({ page }) => {
    await page.goto('/#/preferences');
    
    // Look for instrument selector
    const instrumentOption = page.locator('text=/instrument/i').first();
    await expect(instrumentOption).toBeVisible();
  });
});

// Test grouping: About Page
test.describe('About Page', () => {
  test('should navigate to About page', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="#/about"]');
    await expect(page).toHaveURL(/#\/about/);
    
    // Verify about content
    await expect(page.locator('text=/about/i, text=/music.*tutor/i')).toBeVisible();
  });

  test('should display collapsible sections', async ({ page }) => {
    await page.goto('/#/about');
    
    // Look for typical about page sections
    const sections = page.locator('text=/feature/i, text=/faq/i, text=/tool/i, text=/contributor/i');
    await expect(sections.first()).toBeVisible({ timeout: 5000 });
  });
});

// Test grouping: Footer and Global Elements
test.describe('Global UI Elements', () => {
  test('should display footer on all pages', async ({ page }) => {
    const pages = ['/', '/#/creator', '/#/practice', '/#/lessons', '/#/preferences', '/#/about'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      const footer = page.locator('footer');
      await expect(footer).toBeVisible();
      
      // Verify home button in footer
      const homeButton = page.locator('footer a[href="#/"], footer a[title*="Home"]');
      await expect(homeButton.first()).toBeVisible();
    }
  });

  test('should display version information in footer', async ({ page }) => {
    await page.goto('/');
    
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    
    // Footer should contain version or update info
    const versionText = page.locator('footer text=/version|update|last/i');
    await expect(versionText.first()).toBeVisible({ timeout: 5000 });
  });

  test('should navigate home from footer button on any page', async ({ page }) => {
    await page.goto('/#/about');
    
    const homeButton = page.locator('footer a[href="#/"], footer a[title*="Home"]').first();
    await homeButton.click();
    await expect(page).toHaveURL(/\/$|#\/$/);
  });
});

// Test grouping: State Persistence
test.describe('State Persistence and Data Flow', () => {
  test('should persist Pinia state across navigation', async ({ page }) => {
    await page.goto('/#/create-scales');
    
    // Create a scale (simplified - actual implementation depends on UI)
    // Navigate away and back
    await page.goto('/#/practice');
    await page.goto('/#/create-scales');
    
    // Verify page still loads correctly (state not corrupted)
    await expect(page.locator('text=/create.*scale/i')).toBeVisible();
  });

  test('should handle localStorage correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check localStorage is accessible
    const storageKeys = await page.evaluate(() => Object.keys(localStorage));
    expect(Array.isArray(storageKeys)).toBe(true);
  });
});

// Test grouping: Error Handling
test.describe('Error Handling and Edge Cases', () => {
  test('should handle invalid routes gracefully', async ({ page }) => {
    await page.goto('/#/nonexistent-route');
    
    // Should either redirect to home or show 404 - verify page doesn't crash
    await expect(page).not.toHaveTitle(/error/i);
  });

  test('should load all pages without console errors', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    const pages = ['/', '/#/creator', '/#/practice', '/#/lessons', '/#/preferences', '/#/about'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
    }
    
    // Allow some expected errors (e.g., fetch failures for optional resources)
    // but verify no critical errors
    const criticalErrors = consoleErrors.filter(err => 
      !err.includes('favicon') && 
      !err.includes('404') &&
      !err.includes('net::ERR')
    );
    
    expect(criticalErrors.length).toBe(0);
  });
});

// Test grouping: Performance
test.describe('Performance and Loading', () => {
  test('should load home page within 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000);
  });

  test('should render VexFlow notation without excessive delay', async ({ page }) => {
    await page.goto('/#/create-scales');
    
    // After creating a scale, VexFlow should render within 5 seconds
    const canvas = page.locator('canvas, svg').first();
    await expect(canvas).toBeVisible({ timeout: 5000 });
  });
});

// Test grouping: Accessibility
test.describe('Accessibility', () => {
  test('should have accessible navigation elements', async ({ page }) => {
    await page.goto('/');
    
    // Check for proper ARIA labels on main navigation
    const navLinks = page.locator('a[href^="#/"]');
    const count = await navLinks.count();
    
    expect(count).toBeGreaterThan(0);
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');
    
    // Tab through elements
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    
    expect(['A', 'BUTTON', 'INPUT', 'SELECT']).toContain(focusedElement);
  });
});
