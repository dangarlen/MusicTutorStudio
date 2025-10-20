// scripts/global.js

// Inject version from data/version.json
fetch('data/version.json')
  .then(res => res.json())
  .then(data => {
    const versionEl = document.getElementById('version-display');
    if (versionEl) {
      versionEl.textContent = `Version: ${data.version}`;
    }
  })
  .catch(err => {
    console.error("Version fetch failed:", err);
  });
