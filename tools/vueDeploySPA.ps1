<#
  Build the Vue SPA and output directly into public/alpha-vue-SPA (as configured in vite.config.js).
  IMPORTANT: Do NOT delete or copy public/alpha-vue-SPA onto itself (prevents wiping hashed assets).
  Usage: Run from repo root.
#>

$sourceDir = "vue-src-alpha"
$outDir = Join-Path $PSScriptRoot "..\public\alpha-vue-SPA"

Write-Host "[DEBUG] sourceDir: $sourceDir"
Write-Host "[DEBUG] outDir (vite): $outDir"

Write-Host "[DEBUG] Checking for build script in $sourceDir\package.json..."
$packageJsonPath = "$sourceDir\package.json"
if (-not (Test-Path $packageJsonPath)) {
    Write-Error "[DEBUG] package.json not found in $sourceDir. Make sure your Vue project is set up correctly."
    exit 1
}
$packageJson = Get-Content $packageJsonPath | Out-String | ConvertFrom-Json
if (-not $packageJson.scripts.build) {
    Write-Error "[DEBUG] No 'build' script found in $sourceDir\package.json. Add one (e.g., vite build)."
    exit 1
}

Write-Host "[DEBUG] Building Vue SPA from $sourceDir..."
Push-Location $sourceDir
npm install
npm run build -- --emptyOutDir
Pop-Location

Write-Host "[DEBUG] Verifying build output: $outDir\index.html"
if (-not (Test-Path "$outDir\index.html")) {
    Write-Error "[DEBUG] Build failed or output missing: $outDir"
    exit 1
}

Write-Host "✅ Build complete. Files are in $outDir."
Write-Host "Next: deploy 'public' to Netlify (tools/deploy.ps1 or VS Code task)."
