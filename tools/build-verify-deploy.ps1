<#
PowerShell helper to build the Vue SPA, verify outputs, copy libs, promote index.html,
and deploy the public/ folder to Netlify in one step.

Usage (from repo root):
  powershell -ExecutionPolicy Bypass -File tools\build-verify-deploy.ps1

This script performs the following:
- npm install in vue-src-alpha
- npm run build -- --emptyOutDir
- verify built index exists
- copy worklet/worker libs from public/libs -> public/alpha-vue-SPA/libs
- promote built index to public/index.html and rewrite asset paths to /assets/
- copy built assets into public/assets/
- verify files present (assets and libs)
- run `netlify deploy --prod --dir=public`

Notes:
- Netlify CLI must be installed and authenticated ahead of time (npm i -g netlify-cli)
- Designed for the repository layout used by MusicTutorStudio
#>

Write-Host "🔧 build-verify-deploy.ps1 started"

# Helper to fail with message
function Fail($msg) {
    Write-Host "❌ $msg"
    exit 1
}

# Ensure Netlify CLI exists
Write-Host "⌛ Checking for Netlify CLI..."
$netlifyPath = & where.exe netlify 2>$null
if (-not $netlifyPath) {
    Write-Host "⚠ Netlify CLI not found. Install it with: npm install -g netlify-cli"
    # Not failing immediately; user may want to build-only
}

$spaDir = Join-Path $PSScriptRoot "..\vue-src-alpha"
if (-not (Test-Path $spaDir)) { Fail "SPA source directory not found: $spaDir" }

Push-Location $spaDir
Write-Host "[DEBUG] Running npm install in $spaDir"
npm install
Write-Host "[DEBUG] Running npm run build"
npm run build -- --emptyOutDir
Pop-Location

# Verify build output
$outIndex = Join-Path $PSScriptRoot "..\public\alpha-vue-SPA\index.html"
if (-not (Test-Path $outIndex)) { Fail "Build output missing: $outIndex" }

# Ensure libs are copied into the built SPA folder
$srcLibs = Join-Path $PSScriptRoot "..\public\libs"
$dstLibs = Join-Path $PSScriptRoot "..\public\alpha-vue-SPA\libs"
if (Test-Path $srcLibs) {
    Write-Host "[DEBUG] Copying libs $srcLibs -> $dstLibs"
    New-Item -ItemType Directory -Force -Path $dstLibs | Out-Null
    Copy-Item -Path (Join-Path $srcLibs '*') -Destination $dstLibs -Recurse -Force
} else {
    Write-Host "[WARN] Source libs folder not found: $srcLibs"
}

# Promote SPA index.html to top-level public/index.html with adjusted base href
$topIndex = Join-Path $PSScriptRoot "..\public\index.html"
Write-Host "[DEBUG] Promoting $outIndex -> $topIndex (adjusting base href)"
$html = Get-Content $outIndex -Raw

if ($html -match '<base href=".*".*>') {
    $html = [regex]::Replace($html, '<base href="[^"]*"\s*/?>', '<base href="/">')
} else {
    $insert = "`n    <base href='/'>"
    $html = [regex]::Replace($html, '(?i)(<head[^>]*>)', '$1' + $insert)
}

# Backup existing top-level index.html if present
if (Test-Path $topIndex) {
    $timestamp = Get-Date -Format "yyyyMMddHHmmss"
    $backupPath = "$topIndex.bak.$timestamp"
    Copy-Item -Path $topIndex -Destination $backupPath -Force
    Write-Host "[DEBUG] Backed up existing public/index.html to $backupPath"
}

# Copy assets into public/assets and rewrite references
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
    Write-Host "[WARN] SPA assets folder not found at $srcAssets; skipping asset copy/rewrite"
}

Set-Content -Path $topIndex -Value $html -Encoding UTF8
Write-Host "[DEBUG] Promoted index.html to top-level public/index.html"

# Verification: list a few key files
Write-Host "[VERIFY] public/assets (top 20):"
Get-ChildItem $dstAssets -File -Recurse -Depth 1 | Select-Object -First 20 | ForEach-Object { Write-Host " - $($_.Name)" }

Write-Host "[VERIFY] public/alpha-vue-SPA/libs:"
if (Test-Path $dstLibs) { Get-ChildItem $dstLibs -File | ForEach-Object { Write-Host " - $($_.Name)" } } else { Write-Host " - (not found)" }

# Deploy to Netlify
if ($netlifyPath) {
    Write-Host "[DEBUG] Starting Netlify deploy of public/"
    $deployCmd = "netlify deploy --prod --dir=public"
    Write-Host "[DEBUG] Running: $deployCmd"
    try {
        $output = Invoke-Expression $deployCmd
        Write-Host "[DEBUG] Netlify CLI output:"
        Write-Host $output
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Netlify deploy succeeded."
            exit 0
        } else {
            Write-Host "❌ Netlify deploy failed with exit code $LASTEXITCODE."
            exit $LASTEXITCODE
        }
    } catch {
        Write-Host "❌ Netlify deploy encountered an error: $_"
        exit 1
    }
} else {
    Write-Host "⚠ Netlify CLI not found; build/verify steps completed but deploy skipped. Install netlify-cli to enable deployment."
    exit 0
}
