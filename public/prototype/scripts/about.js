// about.js

console.log("about.js loaded and executing");

let isExpanded = true; // Changed to true to start expanded
function togglePipeline() {
  const content = document.getElementById("pipeline-content");
  const header = document.querySelector("#feature-pipeline h2");
  isExpanded = !isExpanded;
  content.classList.toggle("hidden", !isExpanded);
  header.textContent = isExpanded
    ? "▼ Feature Pipeline / Wish List"
    : "▶ Feature Pipeline / Wish List";
}

fetch("data/feature-pipeline.json")
  .then((res) => res.json())
  .then((data) => {
    const list = document.getElementById("feature-list");
    data.features.forEach((feature) => {
      const item = document.createElement("li");
      const isActive = feature.status === "Active";
      const statusText = isActive ? `[Active]` : `[${feature.status}]`;

      if (isActive) {
        item.style.backgroundColor = "#fef3c7"; // Light yellow background
        item.style.border = "2px solid #f59e0b"; // Orange border
        item.style.padding = "8px";
        item.style.borderRadius = "4px";
        item.style.marginBottom = "4px";
      }

      item.innerHTML = `<strong>${feature.title}</strong>: ${
        feature.description
      } <em style="${
        isActive ? "color: #b45309; font-weight: bold;" : ""
      }">${statusText}</em>`;
      list.appendChild(item);
    });
  })
  .catch((err) => {
    document.getElementById("feature-list").innerText =
      "Unable to load feature pipeline.";
    console.error(err);
  });

let logExpanded = false;
function toggleChangeLog() {
  const content = document.getElementById("change-log-content");
  const header = document.querySelector("#change-log h2");
  logExpanded = !logExpanded;
  content.classList.toggle("hidden", !logExpanded);
  header.textContent = logExpanded ? "▼ Change Log" : "▶ Change Log";
}

fetch("data/change-log.json")
  .then((res) => res.json())
  .then((data) => {
    const list = document.getElementById("change-list");
    data.changes.forEach((entry) => {
      const item = document.createElement("li");
      item.innerHTML = `<strong>${entry.file}</strong>: ${
        entry.change
      } <em>[${new Date(entry.timestamp).toLocaleString()}]</em>`;
      list.appendChild(item);
    });
  })
  .catch((err) => {
    document.getElementById("change-list").innerText =
      "Unable to load change log.";
    console.error(err);
  });

let ackExpanded = true; // Changed to true to start expanded
function toggleAcknowledgements() {
  const content = document.getElementById("acknowledgements-content");
  const header = document.querySelector("#acknowledgements h2");
  ackExpanded = !ackExpanded;
  content.classList.toggle("hidden", !ackExpanded);
  header.textContent = ackExpanded
    ? "▼ Acknowledgements"
    : "▶ Acknowledgements";
}

fetch("data/ack.json")
  .then((res) => res.json())
  .then((data) => {
    const list = document.getElementById("ack-list");
    data.tools.forEach((tool) => {
      const item = document.createElement("li");
      const extraLinks = tool.links.filter((link) => link !== tool.homepage);
      let linkHTML = "";
      if (extraLinks.length === 1) {
        linkHTML = `<a href="${extraLinks[0]}" target="_blank" class="text-blue-600 hover:underline">${extraLinks[0]}</a>`;
      } else if (extraLinks.length > 1) {
        const bullets = extraLinks
          .map(
            (link) =>
              `<li><a href="${link}" target="_blank" class="text-blue-600 hover:underline">${link}</a></li>`
          )
          .join("");
        linkHTML = `<ul class="list-disc pl-5 mt-1">${bullets}</ul>`;
      }

      const nameLink = tool.homepage
        ? `<a href="${tool.homepage}" target="_blank" class="text-blue-700 font-semibold hover:underline">${tool.name}</a>`
        : `<strong>${tool.name}</strong>`;

      item.innerHTML = `${nameLink} by <em>${tool.publisher}</em>: ${
        tool.description
      }${linkHTML ? "<br/>" + linkHTML : ""}`;
      list.appendChild(item);
    });
  })
  .catch((err) => {
    document.getElementById("ack-list").innerText =
      "Unable to load acknowledgements.";
    console.error(err);
  });
