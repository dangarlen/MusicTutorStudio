// footer-fetch.js
// Dynamically renders the footer with phase, version, update date, and optional home button
// Usage: footerFetch(includeHomeButton = true)

function footerFetch(includeHomeButton = true) {
  fetch("fragments/footer.json")
    .then((r) => r.json())
    .then((data) => {
      const phase = data.phase
        ? "Phase: " + data.phase.charAt(0).toUpperCase() + data.phase.slice(1)
        : "";
      const version = data.version ? ` | Version: ${data.version}` : "";
      const lastUpdate = data.lastUpdate
        ? ` | Updated: ${data.lastUpdate}`
        : "";
      let homeButton = "";
      if (includeHomeButton) {
        // Use Vue Router navigation if available
        homeButton = `
        <a href="/" class="btn btn-circle btn-primary shadow" title="Home">
          <span class="material-symbols-outlined text-2xl">home</span>
        </a>`;
      }
      const html = `
<footer class="w-full py-4 bg-base-300 text-base-content text-center mt-auto">
  <div class="flex flex-col items-center gap-2">${homeButton}
    <span class="text-xs">${phase}${version}${lastUpdate}</span>
  </div>
</footer>`;
      const container = document.getElementById("footer-container");
      if (container) container.innerHTML = html;
    });
}

// If loaded as a script tag, auto-run with default
if (typeof window !== "undefined") {
  window.footerFetch = footerFetch;
}
