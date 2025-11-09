# PowerShell script to deploy public/ to Netlify
# Usage: Run from repo root

Write-Host "✅ build-alpha-vue-spa.ps1 script started"

# Ensure Netlify CLI exists
Write-Host "⌛ Checking for Netlify CLI..."
$netlifyPath = & where.exe netlify 2>$null
if (-not $netlifyPath) {
    Write-Host "⚠ Netlify CLI not found. Install it with: npm install -g netlify-cli"
    exit 1
}

Write-Host "[DEBUG] Netlify CLI found at $netlifyPath. Building SPA and preparing public/ for deploy..."

# Build the Vue SPA (vue-src-alpha) into public/alpha-vue-SPA (vite outDir)
$spaDir = Join-Path $PSScriptRoot "..\vue-src-alpha"
if (-not (Test-Path $spaDir)) {
    Write-Host "❌ SPA source directory not found: $spaDir"
    exit 1
}

Push-Location $spaDir
Write-Host "[DEBUG] Running npm install in $spaDir"
npm install
Write-Host "[DEBUG] Running npm run build"
npm run build -- --emptyOutDir
Pop-Location

# Verify build output
$outIndex = Join-Path $PSScriptRoot "..\public\alpha-vue-SPA\index.html"
if (-not (Test-Path $outIndex)) {
    Write-Host "❌ Build output missing: $outIndex"
    exit 1
}

# Promote SPA index.html to top-level public/index.html with adjusted base href
$topIndex = Join-Path $PSScriptRoot "..\public\index.html"
Write-Host "[DEBUG] Promoting $outIndex -> $topIndex (adjusting base href)"
$html = Get-Content $outIndex -Raw

# If the SPA was built with base '/alpha-vue-SPA/', adjust base to '/' for top-level
if ($html -match '<base href=".*".*>') {
    # Use .NET regex replace to avoid PowerShell string-escaping pitfalls
    $html = [regex]::Replace($html, '<base href="[^"]*"\s*/?>', '<base href="/">')
} else {
    # insert base into the head after the <head> tag using a replacement that preserves $1
    $html = [regex]::Replace($html, '(?i)(<head[^>]*>)', '$1' + "`n    <base href=\"/\">")
}

# Backup existing top-level index.html if present
if (Test-Path $topIndex) {
    $timestamp = Get-Date -Format "yyyyMMddHHmmss"
    $backupPath = "$topIndex.bak.$timestamp"
    Copy-Item -Path $topIndex -Destination $backupPath -Force
    Write-Host "[DEBUG] Backed up existing public/index.html to $backupPath"
}

# Optionally flatten asset paths: copy built assets to public/assets and rewrite references
$srcAssets = Join-Path $PSScriptRoot "..\public\alpha-vue-SPA\assets"
$dstAssets = Join-Path $PSScriptRoot "..\public\assets"
if (Test-Path $srcAssets) {
    Write-Host "[DEBUG] Copying SPA assets from $srcAssets -> $dstAssets"
    New-Item -ItemType Directory -Force -Path $dstAssets | Out-Null
    Copy-Item -Path (Join-Path $srcAssets '*') -Destination $dstAssets -Recurse -Force
    # Rewrite asset URL prefixes in HTML from /alpha-vue-SPA/assets/ to /assets/
    $html = $html -replace "/alpha-vue-SPA/assets/", "/assets/"
    Write-Host "[DEBUG] Rewrote asset references in promoted index.html to /assets/"
} else {
    Write-Host "[DEBUG] SPA assets folder not found at $srcAssets; skipping asset copy/rewrite"
}

Set-Content -Path $topIndex -Value $html -Encoding UTF8

Write-Host "[DEBUG] Promoted index.html to top-level public/index.html"

Write-Host "[DEBUG] Starting Netlify deploy of public/"
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

Write-Host "✅ [DEBUG] Build & deploy script finished."
