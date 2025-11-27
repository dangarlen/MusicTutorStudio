<#
DRG / CoPilot Script
update-footer-build-deploy-and-view-vue.ps1

Combined PowerShell script that performs:
1. Update footer version and timestamp (upRevFooter.ps1)
2. Build, verify, and deploy to Netlify (build-verify-deploy.ps1)
3. Launch Vue dev server (dev-alpha-vue-spa.ps1)

Usage (from repo root):
  powershell -ExecutionPolicy Bypass -File tools\update-footer-build-deploy-and-view-vue.ps1
#>

$ErrorActionPreference = "Stop"

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "🕒🚀✈️ UPDATE FOOTER → BUILD & DEPLOY → VIEW VUE 🕒🚀✈️" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

# =====================================================
# STEP 1: UPDATE FOOTER VERSION AND TIMESTAMP
# =====================================================
Write-Host "STEP 1/3: Updating Footer Version & Timestamp..." -ForegroundColor Yellow
Write-Host "-----------------------------------------------------" -ForegroundColor Yellow
Write-Host ""

$repoRoot = Split-Path -Parent $PSScriptRoot
$footerJsonPath = Join-Path $repoRoot "src\data\footer.json"

if (-not (Test-Path $footerJsonPath)) {
    Write-Host "ERROR: footer.json not found at: $footerJsonPath" -ForegroundColor Red
    exit 1
}

Write-Host "Reading footer.json..." -ForegroundColor Gray
$footerContent = Get-Content $footerJsonPath -Raw | ConvertFrom-Json

Write-Host "Current version: $($footerContent.version)" -ForegroundColor Gray
Write-Host "Current lastUpdate: $($footerContent.lastUpdate)" -ForegroundColor Gray
Write-Host ""

# Increment version by 0.1
$currentVersion = [decimal]$footerContent.version
$newVersion = $currentVersion + 0.1
$footerContent.version = $newVersion.ToString("0.0")

# Update timestamp
$timestamp = Get-Date -Format "MM-dd-yyyy 'at' h:mm tt"
$footerContent.lastUpdate = $timestamp

# Write updated footer.json
$footerContent | ConvertTo-Json -Depth 10 | Set-Content $footerJsonPath -Encoding UTF8

Write-Host "✅ Footer updated successfully!" -ForegroundColor Green
Write-Host "New version: $($footerContent.version)" -ForegroundColor Green
Write-Host "New lastUpdate: $($footerContent.lastUpdate)" -ForegroundColor Green
Write-Host ""

# =====================================================
# STEP 2: BUILD, VERIFY, AND DEPLOY TO NETLIFY
# =====================================================
Write-Host "STEP 2/3: Building, Verifying, and Deploying to Netlify..." -ForegroundColor Yellow
Write-Host "-----------------------------------------------------" -ForegroundColor Yellow
Write-Host ""

function Fail($msg) {
    Write-Host "ERROR: $msg" -ForegroundColor Red
    exit 1
}

Write-Host "Checking for Netlify CLI..." -ForegroundColor Gray
$netlifyPath = & where.exe netlify 2>$null
if (-not $netlifyPath) {
    Write-Host "WARNING: Netlify CLI not found. Install it with: npm install -g netlify-cli" -ForegroundColor Yellow
}

if (-not (Test-Path $repoRoot)) { Fail "Repo root not found: $repoRoot" }

Push-Location $repoRoot
Write-Host "[BUILD] Running npm install in repo root..." -ForegroundColor Gray
npm install
Write-Host "[BUILD] Running npm run build..." -ForegroundColor Gray
npm run build
Pop-Location

# Verify build output
$outIndex = Join-Path $repoRoot "dist\index.html"
if (-not (Test-Path $outIndex)) { Fail "Build output missing: $outIndex" }

# Verify libs
$srcLibs = Join-Path $repoRoot "public\libs"
if (Test-Path $srcLibs) {
    Write-Host "[VERIFY] Libs verified in $srcLibs" -ForegroundColor Gray
} else {
    Write-Host "[WARN] Source libs folder not found: $srcLibs" -ForegroundColor Yellow
}

# Promote built index.html to public/index.html
$topIndex = Join-Path $repoRoot "public\index.html"
Write-Host "[PROMOTE] Promoting $outIndex -> $topIndex (adjusting base href)" -ForegroundColor Gray
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
    $backupTimestamp = Get-Date -Format "yyyyMMddHHmmss"
    $backupPath = "$topIndex.bak.$backupTimestamp"
    Copy-Item -Path $topIndex -Destination $backupPath -Force
    Write-Host "[BACKUP] Backed up existing public/index.html to $backupPath" -ForegroundColor Gray
}

# Copy assets into public/assets
$srcAssets = Join-Path $repoRoot "dist\assets"
$dstAssets = Join-Path $repoRoot "public\assets"
if (Test-Path $srcAssets) {
    Write-Host "[ASSETS] Copying SPA assets from $srcAssets -> $dstAssets" -ForegroundColor Gray
    New-Item -ItemType Directory -Force -Path $dstAssets | Out-Null
    Get-ChildItem -Path $srcAssets | Copy-Item -Destination $dstAssets -Recurse -Force
    $html = $html.Replace('/assets/', '/assets/')
    Write-Host "[ASSETS] Rewrote asset references in promoted index.html to /assets/" -ForegroundColor Gray
} else {
    Write-Host "[WARN] SPA assets folder not found at $srcAssets; skipping asset copy/rewrite" -ForegroundColor Yellow
}

# Copy JSON data files to public/data
$srcDataDir = Join-Path $repoRoot "data"
$dstDataDir = Join-Path $repoRoot "public\data"
if (Test-Path $srcDataDir) {
    New-Item -ItemType Directory -Force -Path $dstDataDir | Out-Null
    Get-ChildItem -Path $srcDataDir -Filter "*.json" | ForEach-Object {
        Copy-Item -Path $_.FullName -Destination (Join-Path $dstDataDir $_.Name) -Force
        Write-Host "[DATA] Copied $($_.Name) to public/data/" -ForegroundColor Gray
    }
} else {
    Write-Host "[WARN] data/ folder not found at $srcDataDir; JSON data will not be available in production" -ForegroundColor Yellow
}

# Copy footer.json to public/ for runtime access
$srcFooterJson = Join-Path $repoRoot "src\data\footer.json"
$dstFooterJson = Join-Path $repoRoot "public\footer.json"
if (Test-Path $srcFooterJson) {
    Copy-Item -Path $srcFooterJson -Destination $dstFooterJson -Force
    Write-Host "[DATA] Copied footer.json to public/ for runtime footer metadata" -ForegroundColor Gray
} else {
    Write-Host "[WARN] src/data/footer.json not found at $srcFooterJson" -ForegroundColor Yellow
}

Set-Content -Path $topIndex -Value $html -Encoding UTF8
Write-Host "[PROMOTE] Promoted index.html to top-level public/index.html" -ForegroundColor Gray
Write-Host ""

Write-Host "[VERIFY] public/assets (top 20):" -ForegroundColor Gray
Get-ChildItem $dstAssets -File -Recurse -Depth 1 | Select-Object -First 20 | ForEach-Object { Write-Host " - $($_.Name)" -ForegroundColor DarkGray }

Write-Host "[VERIFY] public/libs:" -ForegroundColor Gray
if (Test-Path $srcLibs) { Get-ChildItem $srcLibs -File | ForEach-Object { Write-Host " - $($_.Name)" -ForegroundColor DarkGray } } else { Write-Host " - (not found)" -ForegroundColor DarkGray }
Write-Host ""

if ($netlifyPath) {
    Write-Host "[DEPLOY] Starting Netlify deploy of public/..." -ForegroundColor Gray
    $deployCmd = "netlify deploy --prod --dir=public"
    Write-Host "[DEPLOY] Running: $deployCmd" -ForegroundColor Gray
    try {
        $output = Invoke-Expression $deployCmd
        Write-Host $output -ForegroundColor DarkGray
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Netlify deploy succeeded!" -ForegroundColor Green
            Write-Host ""
        } else {
            Write-Host "ERROR: Netlify deploy failed with exit code $LASTEXITCODE." -ForegroundColor Red
            exit $LASTEXITCODE
        }
    } catch {
        Write-Host "ERROR: Netlify deploy encountered an error: $_" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "⚠️  Netlify CLI not found; build/verify steps completed but deploy skipped." -ForegroundColor Yellow
    Write-Host ""
}

# =====================================================
# STEP 3: LAUNCH VUE DEV SERVER
# =====================================================
Write-Host "STEP 3/3: Launching Vue Dev Server..." -ForegroundColor Yellow
Write-Host "-----------------------------------------------------" -ForegroundColor Yellow
Write-Host ""

Push-Location $repoRoot
Write-Host "[DEV] Starting Vue dev server from repo root..." -ForegroundColor Gray
Write-Host "[DEV] Running npm install..." -ForegroundColor Gray
npm install
Write-Host ""
Write-Host "✅ Launching Vue dev server (npm run dev)..." -ForegroundColor Green
Write-Host "Browser should open automatically. Press Ctrl+C to stop the server." -ForegroundColor Cyan
Write-Host ""
npm run dev
Pop-Location
