/**
 * Copilot-assisted Playwright Bug Triage Workflow
 * 1. Runs Playwright tests with JSON reporter
 * 2. Consumes the JSON report
 * 3. Categorizes errors into: fix, ignore, investigate
 * 4. Steps you through the triage process interactively
 * 5. Exports results into bug-log.md for audit-safe tracking
 * 6. Supports repo-specific categorization rules
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const BUG_LOG_PATH = path.resolve(__dirname, 'bug-log.md');

// Step 1: Run Playwright tests and generate JSON report
function runPlaywrightTests() {
  console.log('▶ Running Playwright tests with JSON reporter...');
  const reportPath = path.resolve(__dirname, 'playwright-report.json');
  execSync(`npx playwright test --reporter=json > ${reportPath}`, { stdio: 'inherit' });
  return reportPath;
}

// Step 2: Load and parse the JSON report
function loadReport(reportPath) {
  const raw = fs.readFileSync(reportPath, 'utf-8');
  return JSON.parse(raw);
}

// Step 3: Categorization rules (extendable)
function categorizeError(errorMessage, testTitle) {
  if (!errorMessage) return 'ignore';

  // Repo-specific rule: ignore collapsed canvas visibility errors
  if (testTitle.includes('create-scales') && errorMessage.includes('toBeVisible')) {
    return 'ignore';
  }

  if (errorMessage.includes('Timeout')) return 'investigate';
  if (errorMessage.includes('locator not found')) return 'fix';
  if (errorMessage.includes('toBeVisible')) return 'investigate';
  return 'ignore';
}

// Step 4: Process results
function triageReport(report) {
  const results = [];
  for (const suite of report.suites || []) {
    for (const spec of suite.specs || []) {
      for (const test of spec.tests || []) {
        const status = test.status;
        const error = test.error ? test.error.message : null;
        const category = status === 'failed' ? categorizeError(error, spec.title) : 'pass';
        results.push({
          test: spec.title,
          status,
          error,
          category,
        });
      }
    }
  }
  return results;
}

// Step 5: Interactive walkthrough
async function walkthrough(results) {
  console.log('\n=== Copilot Bug Triage Walkthrough ===');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  for (const r of results) {
    console.log(`\nTest: ${r.test}`);
    console.log(`Status: ${r.status}`);
    if (r.error) console.log(`Error: ${r.error}`);
    console.log(`Suggested Category: ${r.category}`);

    await new Promise(resolve => {
      rl.question('Do you accept this categorization (y/n)? ', answer => {
        if (answer.toLowerCase() === 'n') {
          rl.question('Enter your category (fix/investigate/ignore): ', custom => {
            r.category = custom;
            console.log(`→ Updated category: ${r.category}`);
            resolve();
          });
        } else {
          console.log(`→ Confirmed category: ${r.category}`);
          resolve();
        }
      });
    });
  }

  rl.close();

  // Step 6: Export results into bug-log.md
  const logLines = ['# Bug Triage Log\n'];
  results.forEach(r => {
    logLines.push(`- **${r.test}** → ${r.status} → ${r.category}`);
    if (r.error) logLines.push(`  - Error: ${r.error}`);
  });
  fs.writeFileSync(BUG_LOG_PATH, logLines.join('\n'), 'utf-8');
  console.log(`\n✅ Final triage summary exported to ${BUG_LOG_PATH}`);

  // Step 7: Suggest trace viewer for failed tests
  const failed = results.filter(r => r.status === 'failed');
  if (failed.length > 0) {
    console.log('\n🔍 To replay failures step-by-step, run:');
    console.log('   npx playwright show-trace trace.zip');
  }
}

// Main workflow
(async () => {
  try {
    const reportPath = runPlaywrightTests();
    const report = loadReport(reportPath);
    const results = triageReport(report);
    await walkthrough(results);
  } catch (err) {
    console.error('Error running triage workflow:', err);
  }
})();
