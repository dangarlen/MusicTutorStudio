# root-cleanup.ps1
# Purpose: streamline repo root by moving optional files into /docs and deleting temp noise

# Ensure docs folder exists
if (-not (Test-Path ".\docs")) {
    New-Item -ItemType Directory -Path ".\docs" | Out-Null
}

# Files to move into docs for archival/reference
$moveTargets = @(
    "dir.txt",
    "scan.txt",
    "gitFix.txt",
    "vscode-extensions.txt",
    "ShortCuts.json",
    "cleanup.ps1",
    "deploy.ps1",
    "finder.bat",
    "finder.py",
    "orphans.bat",
    "scan-orphans.py",
    "practice-settings-review.js",
    "practice-units-enhancement-summary.js",
    "testing-results-final.js",
    "validation-summary.js",
    "workflow-fix-summary.js"
)

foreach ($f in $moveTargets) {
    if (Test-Path $f) {
        Write-Host "Moving $f to docs..."
        Move-Item -Path $f -Destination ".\docs\$f" -Force
    } else {
        Write-Host "Skipping $f (not found)"
    }
}

# Temp files to delete outright
$deleteTargets = @(
    "tmp_deploy_index.html",
    "tmp_page.html",
    "tmp_instruments.json",
    "Xfer.txt"
)

foreach ($f in $deleteTargets) {
    if (Test-Path $f) {
        Write-Host "Deleting $f ..."
        Remove-Item -Force $f
    } else {
        Write-Host "Skipping $f (not found)"
    }
}

Write-Host "Root cleanup complete. Only canonical configs and essential files remain."
