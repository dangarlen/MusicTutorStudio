# PowerShell script to increment footer version and update timestamp
# Updates src/data/footer.json with new version (+0.1) and current timestamp

$ErrorActionPreference = "Stop"

# Paths
$repoRoot = Split-Path -Parent $PSScriptRoot
$footerJsonPath = Join-Path $repoRoot "src\data\footer.json"

Write-Host "=== Footer Version & Timestamp Updater ===" -ForegroundColor Cyan
Write-Host ""

# Verify footer.json exists
if (-not (Test-Path $footerJsonPath)) {
    Write-Host "ERROR: footer.json not found at: $footerJsonPath" -ForegroundColor Red
    exit 1
}

# Read current footer.json
Write-Host "Reading footer.json..." -ForegroundColor Yellow
$footerContent = Get-Content $footerJsonPath -Raw | ConvertFrom-Json

Write-Host "Current version: $($footerContent.version)" -ForegroundColor Gray
Write-Host "Current lastUpdate: $($footerContent.lastUpdate)" -ForegroundColor Gray
Write-Host ""

# Increment version by 0.1
$currentVersion = [decimal]$footerContent.version
$newVersion = $currentVersion + 0.1
$footerContent.version = $newVersion.ToString("0.0")

# Update timestamp to current date/time
$timestamp = Get-Date -Format "MM-dd-yyyy 'at' h:mm tt"
$footerContent.lastUpdate = $timestamp

# Write updated footer.json
Write-Host "Updating footer.json..." -ForegroundColor Yellow
$footerContent | ConvertTo-Json -Depth 10 | Set-Content $footerJsonPath -Encoding UTF8

Write-Host "✅ Footer updated successfully!" -ForegroundColor Green
Write-Host "New version: $($footerContent.version)" -ForegroundColor Green
Write-Host "New lastUpdate: $($footerContent.lastUpdate)" -ForegroundColor Green
Write-Host ""
Write-Host "Footer.json has been updated. FooterBase.vue will display the new values on next render." -ForegroundColor Cyan
