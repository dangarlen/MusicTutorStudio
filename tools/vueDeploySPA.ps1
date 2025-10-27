# PowerShell script to build Vue SPA and copy distribution files to public/alpha-vue-SPA
# Usage: Run from repo root

$sourceDir = "vue-src-alpha"
$targetDir = "public\alpha-vue-SPA"
$expectedDistDir = Join-Path $PSScriptRoot "..\public\alpha-vue-SPA"

Write-Host "[DEBUG] sourceDir: $sourceDir"
Write-Host "[DEBUG] targetDir: $targetDir"
Write-Host "[DEBUG] expectedDistDir: $expectedDistDir"

Write-Host "[DEBUG] Checking for build script in $sourceDir\package.json..."
$packageJsonPath = "$sourceDir\package.json"
if (-not (Test-Path $packageJsonPath)) {
    Write-Error "[DEBUG] package.json not found in $sourceDir. Make sure your Vue project is set up correctly."
    exit 1
}
$packageJson = Get-Content $packageJsonPath | Out-String | ConvertFrom-Json
Write-Host "[DEBUG] packageJson.scripts: $($packageJson.scripts | Out-String)"
if (-not $packageJson.scripts.build) {
    Write-Error "[DEBUG] No 'build' script found in $sourceDir\package.json. Aborting."
    Write-Host "[DEBUG] To fix: Add a 'build' script to your package.json, e.g.:"
    Write-Host '[DEBUG]   "scripts": { "build": "vite build" }'
    exit 1
}

Write-Host "[DEBUG] Building Vue SPA from $sourceDir..."
Set-Location $sourceDir
npm install
npm run build -- --emptyOutDir
Set-Location $PSScriptRoot

Write-Host "[DEBUG] Checking for build output: $expectedDistDir\index.html"
if (-not (Test-Path "$expectedDistDir\index.html")) {
    Write-Error "[DEBUG] Build failed or expected output folder missing: $expectedDistDir"
    exit 1
}

Write-Host "[DEBUG] Ensuring $targetDir exists and is up to date..."
if (Test-Path $targetDir) {
    Write-Host "[DEBUG] Removing existing $targetDir"
    Remove-Item $targetDir -Recurse -Force
}
Write-Host "[DEBUG] Creating $targetDir"
New-Item -ItemType Directory -Path $targetDir | Out-Null
Write-Host "[DEBUG] Copying files from $expectedDistDir to $targetDir"
Copy-Item "$expectedDistDir\*" $targetDir -Recurse

Write-Host "[DEBUG] SPA files copied. You can now serve public/ for static testing."
Write-Host "[DEBUG] NOTE: This script does NOT deploy to Netlify."
Write-Host "[DEBUG] To deploy, run: tools/deploy.ps1 or use the VS Code '🚀 Push & Deploy to Netlify' task."
