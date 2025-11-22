# cleanup.ps1
# Safely remove unneeded legacy directories and files

$targets = @(
    "archive_DELETE_ME",
    "prototype_DELETE_ME",
    "alpha-vue-SPA_DELETE_ME",
    "public\vendor_DELETE_ME",
    "public\assets_DELETE_ME",
    "dist",
    "build",
    "coverage",
    "playwright-report",
    "test-results",
    ".cache",
    "logs",
    "tmp",
    ".DS_Store",
    "Thumbs.db",
    ".vscode"
)

foreach ($t in $targets) {
    if (Test-Path $t) {
        Write-Host "Removing $t ..."
        Remove-Item -Recurse -Force $t
    } else {
        Write-Host "Skipping $t (not found)"
    }
}

# Optional: remove swap files (*.swp)
Get-ChildItem -Path . -Recurse -Include *.swp -ErrorAction SilentlyContinue | ForEach-Object {
    Write-Host "Removing swap file $($_.FullName)"
    Remove-Item -Force $_.FullName
}

Write-Host "Cleanup complete."
