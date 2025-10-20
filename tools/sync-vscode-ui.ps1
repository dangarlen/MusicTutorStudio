param(
  [string]$Dest = "C:\Users\dang\Dropbox\Code\ETA_v12B",
  [switch]$CopySnippets
)

function Info($m){ Write-Host "[INFO] $m" }
function Warn($m){ Write-Warning $m }

$userSettingsDir = Join-Path $env:APPDATA 'Code\User'
if (-not (Test-Path $userSettingsDir)) {
  Warn "VS Code user settings not found at $userSettingsDir. Is VS Code installed?"
  exit 2
}

$destVscode = Join-Path $Dest '.vscode'
if (-not (Test-Path $destVscode)) { New-Item -ItemType Directory -Path $destVscode | Out-Null }

# Files to copy
$files = @('settings.json','keybindings.json')
foreach ($f in $files) {
  $src = Join-Path $userSettingsDir $f
  if (Test-Path $src) {
    $dst = Join-Path $destVscode $f
    Copy-Item -Force -Path $src -Destination $dst
    Info "Copied $f -> $dst"
  } else {
    Warn "$f not found in user settings"
  }
}

if ($CopySnippets) {
  $srcSnip = Join-Path $userSettingsDir 'snippets'
  if (Test-Path $srcSnip) {
    $dstSnip = Join-Path $destVscode 'snippets'
    Copy-Item -Recurse -Force -Path $srcSnip -Destination $dstSnip
    Info "Copied snippets -> $dstSnip"
  } else {
    Warn "No snippets folder found to copy"
  }
}

Info "Sync complete. Open the cloned folder in VS Code (File → Open Folder) or use the existing VS Code command to open it." 
