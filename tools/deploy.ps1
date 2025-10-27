# PowerShell script to build Vue SPA and copy distribution files to public/alpha-vue-SPA
# Usage: Run from repo root

# Update this path to your new Vue source directory
$sourceDir = "vue-src-alpha" # <-- change this to your actual new path

$targetDir = "public\alpha-vue-SPA"

$originalDir = Get-Location

Write-Host "Building Vue SPA from $sourceDir..."
Set-Location $sourceDir
npm install
npm run build
Set-Location $originalDir

Write-Host "Ensuring $targetDir exists..."
if (Test-Path $targetDir) {
    Remove-Item $targetDir -Recurse -Force
}
New-Item -ItemType Directory -Path $targetDir | Out-Null

Write-Host "Build complete. Distribution files are in $targetDir."

Write-Host "[DEBUG] Starting Netlify deploy from public/ directory..."

Write-Host "✅ deploy.ps1 script started"
Write-Host "⌛ Checking for Netlify CLI..."

if (-not (Get-Command netlify -ErrorAction SilentlyContinue)) {
    Write-Host "⚠ Netlify CLI not found. Install it with: npm install -g netlify-cli"
    exit 1
}

Write-Host "[DEBUG] Netlify CLI found. Starting deploy..."
$deployCmd = "netlify deploy --prod --dir=public"
Write-Host "[DEBUG] Running: $deployCmd"

try {
    $output = Invoke-Expression $deployCmd
    Write-Host "[DEBUG] Netlify CLI output:"
    Write-Host $output
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ [DEBUG] Netlify deploy succeeded."
    } else {
        Write-Host "❌ [DEBUG] Netlify deploy failed with exit code $LASTEXITCODE."
        exit $LASTEXITCODE
    }
} catch {
    Write-Host "❌ [DEBUG] Netlify deploy encountered an error: $_"
    exit 1
}

Write-Host "✅ [DEBUG] Deploy script finished."