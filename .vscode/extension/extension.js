const vscode = require("vscode");

/**
 * Activate extension
 */
function activate(context) {
  const serveAndOpen = vscode.commands.registerCommand(
    "euphonium.serveAndOpen",
    async () => {
      // Run the compound task by label via the runTask command
      await vscode.commands.executeCommand(
        "workbench.action.tasks.runTask",
        "Serve + Open Live Preview"
      );
    }
  );

  const openPreview = vscode.commands.registerCommand(
    "euphonium.openPreview",
    async () => {
      await vscode.commands.executeCommand(
        "workbench.action.tasks.runTask",
        "Open Live Preview (browser)"
      );
    }
  );

  context.subscriptions.push(serveAndOpen, openPreview);

  // Status bar button
  const statusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  statusBar.text = "$(play) Go Live";
  statusBar.tooltip = "Go Live — Serve + Open Live Preview";
  statusBar.command = "euphonium.serveAndOpen";
  statusBar.show();
  context.subscriptions.push(statusBar);
}

/**
 * Try to find a Task by name and convert to a TaskExecution by running the task command.
 * If not found, the caller should fallback to the runTask command.
 */
function findTaskByName(name) {
  // Placeholder kept for future improvements. Resolve immediately.
  return Promise.resolve({ source: "user", name });
}

function deactivate() {
  // graceful cleanup handled by VS Code
}

module.exports = {
  activate,
  deactivate,
};
