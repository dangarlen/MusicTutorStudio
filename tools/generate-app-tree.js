/**
 * generate-app-tree.js
 * Generates a directory tree of the MusicTutorStudio application for documentation purposes.
 * Output is saved to .docs/directory-tree-current.txt
 */

const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const outputFile = path.join(repoRoot, ".docs", "directory-tree-current.txt");

// Directories to exclude from the tree
const excludeDirs = new Set([
  "node_modules",
  ".git",
  "dist",
  ".netlify",
  ".notes",
]);

// Files to exclude from the tree
const excludeFiles = new Set([
  ".DS_Store",
  "Thumbs.db",
]);

/**
 * Gets directory items with cached stat information, sorted and filtered.
 * @param {string} dirPath - Path to the directory
 * @returns {Array<{name: string, path: string, isDir: boolean}>} Sorted and filtered items
 */
function getDirectoryItems(dirPath) {
  const items = fs.readdirSync(dirPath).map((name) => {
    const itemPath = path.join(dirPath, name);
    const stats = fs.statSync(itemPath);
    return {
      name,
      path: itemPath,
      isDir: stats.isDirectory(),
    };
  });

  // Filter excluded items
  const filtered = items.filter((item) => {
    if (item.isDir) {
      return !excludeDirs.has(item.name);
    }
    return !excludeFiles.has(item.name);
  });

  // Sort: directories first, then alphabetically
  return filtered.sort((a, b) => {
    if (a.isDir && !b.isDir) return -1;
    if (!a.isDir && b.isDir) return 1;
    return a.name.localeCompare(b.name);
  });
}

/**
 * Recursively generates tree output for a directory's contents.
 * @param {string} dirPath - Path to the directory
 * @param {string} prefix - Prefix for indentation
 * @returns {string} Tree structure as string
 */
function generateTreeContents(dirPath, prefix) {
  const items = getDirectoryItems(dirPath);
  let output = "";

  items.forEach((item, index) => {
    const isLastItem = index === items.length - 1;
    const connector = isLastItem ? "└── " : "├── ";
    const extension = isLastItem ? "    " : "│   ";

    if (item.isDir) {
      output += `${prefix}${connector}${item.name}/\n`;
      output += generateTreeContents(item.path, prefix + extension);
    } else {
      output += `${prefix}${connector}${item.name}\n`;
    }
  });

  return output;
}

/**
 * Generates the full directory tree starting from the root.
 * @param {string} dirPath - Root directory path
 * @returns {string} Complete tree structure as string
 */
function generateTree(dirPath) {
  const baseName = path.basename(dirPath);
  let output = `${baseName}/\n`;
  output += generateTreeContents(dirPath, "");
  return output;
}

function run() {
  console.log("Generating directory tree for MusicTutorStudio...");
  console.log(`Repository root: ${repoRoot}`);

  const timestamp = new Date().toISOString();
  let tree = `MusicTutorStudio Directory Tree\n`;
  tree += `Generated: ${timestamp}\n`;
  tree += `${"=".repeat(50)}\n\n`;
  tree += generateTree(repoRoot);

  // Ensure output directory exists
  const outputDir = path.dirname(outputFile);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputFile, tree, "utf8");
  console.log(`Directory tree saved to: ${outputFile}`);
  console.log("Done!");
}

run();
