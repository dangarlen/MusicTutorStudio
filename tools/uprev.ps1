param(
  [Parameter(Mandatory=$true)][string]$Version,
  [Parameter(Mandatory=$false)][string]$Note = "",
  [Parameter(Mandatory=$false)][string]$RepoRoot = "$PSScriptRoot\.."
)

function Timestamp { (Get-Date).ToString('yyyy-MM-ddTHH:mm:sszzz') }

$RepoRoot = (Resolve-Path $RepoRoot).ProviderPath
Write-Output "Repo root: $RepoRoot"

$versionFile = Join-Path $RepoRoot 'public\data\version.json'
$projectNotes = Join-Path $RepoRoot '.notes\PROJECT_NOTES.md'
$changeLog = Join-Path $RepoRoot 'public\data\change-log.json'

if (-not (Test-Path $versionFile)) { Write-Error "version.json not found at $versionFile"; exit 2 }
if (-not (Test-Path $projectNotes)) { Write-Error "PROJECT_NOTES.md not found at $projectNotes"; exit 2 }

# Backup
$bakSuffix = (Get-Date).ToString('yyyyMMddHHmmss')
Copy-Item $versionFile "$versionFile.bak.$bakSuffix" -Force
Copy-Item $projectNotes "$projectNotes.bak.$bakSuffix" -Force
Write-Output "Backed up version and PROJECT_NOTES.md"

# Update version.json
$json = Get-Content -Raw $versionFile | ConvertFrom-Json
$json.version = $Version
$json.build = (Get-Date).ToString('yyyy-MM-dd')
if ($Note -ne '') { $json.notes = $Note }

# Write JSON with 2-space indentation
$jsonText = $json | ConvertTo-Json -Depth 10
[System.IO.File]::WriteAllText($versionFile, $jsonText + "`n")
Write-Output "Wrote $versionFile -> version $Version"

# Append to PROJECT_NOTES.md
$ts = Timestamp
$entryHeader = "## Uprev $Version - $ts`n"
$entryBody = $Note + "`n`n"
[System.IO.File]::AppendAllText($projectNotes, "`n" + $entryHeader + $entryBody)
Write-Output "Appended uprev note to $projectNotes"

# Optionally add change-log entry
if (Test-Path $changeLog) {
  try {
    $cl = Get-Content -Raw $changeLog | ConvertFrom-Json
    $cl.changes += @{ timestamp = $ts; file = 'public/data/version.json'; change = "Uprev to $Version - $Note" }
    $clText = $cl | ConvertTo-Json -Depth 10
    [System.IO.File]::WriteAllText($changeLog, $clText + "`n")
    Write-Output "Updated change-log.json"
  } catch {
    Write-Warning "Failed to update change-log.json: $_"
  }
}

Write-Output "Uprev complete."
