// Use chokidar to watch copilot.log
// Parse lines like: ccreq:<id>.copilotmd | success | <model> | <duration>ms
// Append results to copilot-routing.log
// Include timestamp, model, status, duration
// Handle errors gracefully and avoid duplicate entries

const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, 'copilot.log');
const outputFile = path.join(__dirname, 'copilot-routing.log');

const watcher = chokidar.watch(logFile, { persistent: true });

watcher.on('change', () => {
  const data = fs.readFileSync(logFile, 'utf8');
  const lines = data.split('\n').filter(line => line.includes('ccreq:'));
  const latest = lines[lines.length - 1];

  if (latest) {
    const match = latest.match(/ccreq:(\w+)\.copilotmd \| (\w+) \| ([\w\-]+) \| (\d+)ms/);
    if (match) {
      const [, id, status, model, duration] = match;
      const timestamp = new Date().toISOString();
      const logEntry = `[${timestamp}] Model: ${model} | Status: ${status} | Duration: ${duration}ms\n`;
      fs.appendFileSync(outputFile, logEntry);
    }
  }
});

