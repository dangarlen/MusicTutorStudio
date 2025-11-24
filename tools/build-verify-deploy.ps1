<#
DRG / CoPilot Script
dev-alpha-vue-spa.ps1

PowerShell helper to build the canonical Vite/Vue app, verify outputs, copy libs, promote index.html,
and deploy the public/ folder to Netlify in one step.

Usage (from repo root):
  powershell -ExecutionPolicy Bypass -File tools\build-verify-deploy.ps1

This script performs the following:
- npm install in src/
- npm run build -- --emptyOutDir
- verify built index exists
- copy worklet/worker libs from public/libs -> public/libs (canonical)
- promote built index to public/index.html and rewrite asset paths to /assets/
- copy built assets into public/assets/
- verify files present (assets and libs)
- run `netlify deploy --prod --dir=public`
#>

Write-Host "BUILD-VERIFY-DEPLOY script started"

function Fail($msg) {
    Write-Host "ERROR: $msg"
    exit 1
}

Write-Host "Checking for Netlify CLI..."
$netlifyPath = & where.exe netlify 2>$null
if (-not $netlifyPath) {
    Write-Host "WARNING: Netlify CLI not found. Install it with: npm install -g netlify-cli"
}

# Canonical SPA source directory (repo root)
$repoRoot = Join-Path $PSScriptRoot ".."
if (-not (Test-Path $repoRoot)) { Fail "Repo root not found: $repoRoot" }

Push-Location $repoRoot
Write-Host "[DEBUG] Running npm install in repo root"
npm install
Write-Host "[DEBUG] Running npm run build"
npm run build
Pop-Location

# Verify build output (Vite defaults to dist/)
$outIndex = Join-Path $repoRoot "dist\index.html"
if (-not (Test-Path $outIndex)) { Fail "Build output missing: $outIndex" }

# Copy libs (canonical: public/libs stays in place)
$srcLibs = Join-Path $PSScriptRoot "..\public\libs"
$dstLibs = $srcLibs
if (Test-Path $srcLibs) {
    Write-Host "[DEBUG] Verifying libs in $srcLibs"
} else {
    Write-Host "[WARN] Source libs folder not found: $srcLibs"
}

# Promote built index.html to top-level public/index.html
$topIndex = Join-Path $PSScriptRoot "..\public\index.html"
Write-Host "[DEBUG] Promoting $outIndex -> $topIndex (adjusting base href)"
$html = Get-Content $outIndex -Raw

$baseReplacement = '<base href="/" />'
$basePattern = [regex]::Escape('<base') + '.*?>'
if ($html -match $basePattern) {
    $html = $html -creplace $basePattern, $baseReplacement
} else {
    $headPattern = '(<head[^>]*>)'
    $headReplacement = '$1' + [Environment]::NewLine + '    ' + $baseReplacement
    $html = $html -creplace $headPattern, $headReplacement
}

if (Test-Path $topIndex) {
    $timestamp = Get-Date -Format "yyyyMMddHHmmss"
    $backupPath = "$topIndex.bak.$timestamp"
    Copy-Item -Path $topIndex -Destination $backupPath -Force
    Write-Host "[DEBUG] Backed up existing public/index.html to $backupPath"
}

# Copy assets into public/assets and rewrite references
$srcAssets = Join-Path $PSScriptRoot "..\dist\assets"
$dstAssets = Join-Path $PSScriptRoot "..\public\assets"
if (Test-Path $srcAssets) {
    Write-Host "[DEBUG] Copying SPA assets from $srcAssets -> $dstAssets"
    New-Item -ItemType Directory -Force -Path $dstAssets | Out-Null
    Get-ChildItem -Path $srcAssets | Copy-Item -Destination $dstAssets -Recurse -Force
    $html = $html.Replace('/assets/', '/assets/')
    Write-Host "[DEBUG] Rewrote asset references in promoted index.html to /assets/"
} else {
    Write-Host "[WARN] SPA assets folder not found at $srcAssets; skipping asset copy/rewrite"
}

# Ensure footer/version data is available in production (Netlify serves only public/)
$srcFooterData = Join-Path $PSScriptRoot "..\data\footer.json"
$dstDataDir = Join-Path $PSScriptRoot "..\public\data"
if (Test-Path $srcFooterData) {
    New-Item -ItemType Directory -Force -Path $dstDataDir | Out-Null
    Copy-Item -Path $srcFooterData -Destination (Join-Path $dstDataDir "footer.json") -Force
    Write-Host "[DEBUG] Copied footer.json into public/data for production footer version display"
} else {
    Write-Host "[WARN] footer.json not found at $srcFooterData; version info will not appear in deployed footer"
}

Set-Content -Path $topIndex -Value $html -Encoding UTF8
Write-Host "[DEBUG] Promoted index.html to top-level public/index.html"

Write-Host "VERIFY: public/assets (top 20):"
Get-ChildItem $dstAssets -File -Recurse -Depth 1 | Select-Object -First 20 | ForEach-Object { Write-Host " - $($_.Name)" }

Write-Host "VERIFY: public/libs:"
if (Test-Path $dstLibs) { Get-ChildItem $dstLibs -File | ForEach-Object { Write-Host " - $($_.Name)" } } else { Write-Host " - (not found)" }

if ($netlifyPath) {
    Write-Host "[DEBUG] Starting Netlify deploy of public/"
    $deployCmd = "netlify deploy --prod --dir=public"
    Write-Host "[DEBUG] Running: $deployCmd"
    try {
        $output = Invoke-Expression $deployCmd
        Write-Host "[DEBUG] Netlify CLI output:"
        Write-Host $output
        if ($LASTEXITCODE -eq 0) {
            Write-Host "SUCCESS: Netlify deploy succeeded."
            exit 0
        } else {
            Write-Host "ERROR: Netlify deploy failed with exit code $LASTEXITCODE."
            exit $LASTEXITCODE
        }
    } catch {
        Write-Host "ERROR: Netlify deploy encountered an error: $_"
        exit 1
    }
} else {
    Write-Host "WARNING: Netlify CLI not found; build/verify steps completed but deploy skipped."
    exit 0
}
