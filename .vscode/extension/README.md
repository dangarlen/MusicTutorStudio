# Euphonium Commands (workspace-local extension)

This small extension adds two commands and a status-bar button to run workspace tasks:

- `Euphonium: Serve + Open Live Preview` — runs the compound task `Serve + Open Live Preview`.
- `Euphonium: Open Live Preview (browser)` — runs the `Open Live Preview (browser)` task.

## How to enable/run locally

1. Open the Command Palette and choose **Developer: Reload Window** to make VS Code load workspace extensions.
2. Open the Command Palette and run the command by name, or click the right-hand status bar button labeled "Live Preview".

## Notes

- This extension is intentionally minimal and calls the existing workspace tasks by their labels. If you rename tasks, update the labels in `extension.js`.
- Workspace extensions are only active for this workspace and won't be published.
