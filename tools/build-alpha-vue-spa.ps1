# PowerShell script to deploy public/ to Netlify
# Usage: Run from repo root

Write-Host "✅ build-alpha-vue-spa.ps1 script started (deploy only)"
Write-Host "⌛ Checking for Netlify CLI..."

$netlifyPath = & where.exe netlify 2>$null
if (-not $netlifyPath) {
    Write-Host "⚠ Netlify CLI not found. Install it with: npm install -g netlify-cli"
    exit 1
}

Write-Host "[DEBUG] Netlify CLI found at $netlifyPath. Starting deploy..."
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

# This script only deploys public/ to Netlify.
# If you want to build the SPA before deploy, add:
#   cd ../vue-src-alpha
#   npm run build
#   cd ..
