param(
  [string]$Source = "C:\Users\dang\Dropbox\Code\ETA_v12A",
  [string]$Dest = "C:\Users\dang\Dropbox\Code\ETA_v12B"
)

Write-Output "Source: $Source"
Write-Output "Destination: $Dest"

if (Test-Path $Dest) {
  Write-Output "Destination exists; updating in-place: $Dest"
} else {
  Write-Output "Destination does not exist; creating: $Dest"
}

Write-Output "Copying..."
# Use Robocopy for robust copy (preserve timestamps/attributes)
# Avoid copying auditing info which requires special privileges; use /COPY:DAT
# /MIR will mirror the source into dest (creates or updates)
$rc = Start-Process -FilePath robocopy -ArgumentList @("$Source", "$Dest", "/MIR", "/COPY:DAT", "/R:1", "/W:1") -NoNewWindow -Wait -PassThru
if ($rc.ExitCode -ge 8) {
  Write-Error "robocopy failed with exit code $($rc.ExitCode)"
  exit $rc.ExitCode
}

Write-Output "Copy complete: $Dest"

# Ensure workspace .vscode exists in dest (robocopy should already copy it),
# but make sure it's present and copy any workspace-specific files if needed.
$srcVscode = Join-Path $Source '.vscode'
$dstVscode = Join-Path $Dest '.vscode'
if (Test-Path $srcVscode) {
  if (-not (Test-Path $dstVscode)) { New-Item -ItemType Directory -Path $dstVscode | Out-Null }
  # Copy workspace settings into destination .vscode
  Get-ChildItem -Path $srcVscode -File -Force | ForEach-Object {
    Copy-Item -Force -Path $_.FullName -Destination (Join-Path $dstVscode $_.Name)
  }
  Write-Output "Workspace .vscode synchronized"
}

# Run the user-UI sync to copy your user settings/keybindings/snippets into the cloned workspace
$syncScript = Join-Path $Source 'tools\sync-vscode-ui.ps1'
if (Test-Path $syncScript) {
  Write-Output "Applying user UI settings to $Dest"
  & powershell -NoProfile -ExecutionPolicy Bypass -File $syncScript -Dest $Dest -CopySnippets
} else {
  Write-Warning "sync-vscode-ui.ps1 not found; skipping user UI sync"
}

# Open the cloned folder in the same VS Code window (reuse existing window if possible)
try {
  Start-Process code -ArgumentList '-r', ("`"$Dest`"")
} catch {
  Write-Warning "Failed to open folder in VS Code via CLI; you can open it manually: $Dest"
}
