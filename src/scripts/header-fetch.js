// header-fetch.js
// Dynamically loads and injects the header fragment into the page
// Usage: headerFetch([containerId])

function headerFetch(containerId = "header-container") {
  fetch("fragments/header.html")
    .then((r) => r.text())
    .then((html) => {
      const container = document.getElementById(containerId);
      if (container) container.innerHTML = html;
    });
}

if (typeof window !== "undefined") {
  window.headerFetch = headerFetch;
}
