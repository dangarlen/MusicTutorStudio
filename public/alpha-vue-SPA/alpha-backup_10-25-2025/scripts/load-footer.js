document.addEventListener("DOMContentLoaded", () => {
  const footerContainer = document.getElementById("footer-container");
  if (!footerContainer) return;
  fetch("fragments/footer.html")
    .then((res) => res.text())
    .then((html) => {
      footerContainer.innerHTML = html;
    })
    .catch((err) => {
      console.error("Footer injection failed:", err);
    });
});
// load-footer.js
fetch("fragments/footer.html")
  .then((res) => res.text())
  .then((html) => {
    document.getElementById("footer-container").innerHTML = html;
  })
  .catch((err) => {
    console.error("Failed to load footer:", err);
  });
