# root-move-to-tbd.ps1
# Purpose: Create a .tbd directory and move optional + deletion candidates into it

# Ensure .tbd folder exists
if (-not (Test-Path ".\.tbd")) {
    New-Item -ItemType Directory -Path ".\.tbd" | Out-Null
    Write-Host "Created .tbd directory"
}

# Files to move (Candidates for Deletion + Optional)
$moveTargets = @(
    # Candidates for Deletion
    ".copilotrc",
    ".copilotrc.claude.json",
    "agent-config.json",
    "tmp_deploy_index.html",
    "tmp_page.html",
    "tmp_instruments.json",
    "Xfer.txt",

    # Optional
    "dir.txt",
    "scan.txt",
    "gitFix.txt",
    "vscode-extensions.txt",
    "ShortCuts.json",
    "cleanup.ps1",
    "root-cleanup.ps1",
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
        Write-Host "Moving $f to .tbd..."
        Move-Item -Path $f -Destination ".\.tbd\$f" -Force
    } else {
        Write-Host "Skipping $f (not found)"
    }
}

Write-Host "All optional and deletion candidate files moved to .tbd."
