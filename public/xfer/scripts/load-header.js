document.addEventListener("DOMContentLoaded", () => {
  const headerContainer = document.getElementById("header-container");

  if (!headerContainer) return;

  // Inject header fragment
  fetch("fragments/header.html")
    .then(res => res.text())
    .then(html => {
      headerContainer.innerHTML = html;
      updateTimestamp();
      fetchVersion();
    })
    .catch(err => {
      console.error("Header injection failed:", err);
    });

  // Inject timestamp
  function updateTimestamp() {
    const now = new Date();
    const formatted = now.toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
    const stamp = document.getElementById("last-updated");
    if (stamp) stamp.textContent = `Last updated: ${formatted}`;
  }

  // Inject version from JSON
  function fetchVersion() {
    fetch("data/version.json")
      .then(res => res.json())
      .then(data => {
        const version = document.getElementById("version");
        if (version && data.version) {
          version.textContent = `Version: ${data.version}`;
        }
      })
      .catch(err => {
        console.warn("Version fetch failed:", err);
      });
  }
});
