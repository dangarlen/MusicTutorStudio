# PowerShell script to run Vue dev server for local development
# Usage: Run from repo root

$sourceDir = "vue-src-alpha"

Write-Host "Starting Vue dev server in $sourceDir..."
Set-Location $sourceDir
npm install
npm run dev
