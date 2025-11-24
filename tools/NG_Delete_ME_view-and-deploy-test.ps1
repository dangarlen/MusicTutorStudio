# view-and-deploy-test.ps1
# DRG / CoPilot Script - FIXED
# Purpose: Verify file structure integrity, run footer update, launch local Vue dev server,
# build & deploy to Netlify, capture logs, and verify local vs deployed output.

param(
    [string]$LogFile = "${PSScriptRoot}\view-and-deploy-test.log"
)

$ErrorActionPreference = "Continue"
$repoRoot = Split-Path -Parent $PSScriptRoot
$testsPassed = $true

function Log($msg, [string]$Color = "White") {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $line = "[$timestamp] $msg"
    Add-Content -Path $LogFile -Value $line -ErrorAction SilentlyContinue
    Write-Host $line -ForegroundColor $Color
}

function Test-RequiredFile($path, $description) {
    if (Test-Path $path) {
        Log "✓ $description exists: $path" "Green"
        return $true
    } else {
        Log "✗ MISSING: $description at: $path" "Red"
        $script:testsPassed = $false
        return $false
    }
}

Log "============================================" "Cyan"
Log "=== View and Deploy Test ===" "Cyan"
Log "============================================" "Cyan"
Log ""

try {
    # ========================================
    # STEP 1: Verify Required File Structure
    # ========================================
    Log "--- Step 1: Verifying Required File Structure ---" "Yellow"
    
    # Core configuration files
    Test-RequiredFile (Join-Path $repoRoot "vite.config.js") "Vite config"
    Test-RequiredFile (Join-Path $repoRoot "package.json") "Root package.json"
    Test-RequiredFile (Join-Path $repoRoot "tailwind.config.js") "Tailwind config"
    Test-RequiredFile (Join-Path $repoRoot "postcss.config.js") "PostCSS config"
    Test-RequiredFile (Join-Path $repoRoot "index.html") "Root index.html"
    
    # Source files
    Test-RequiredFile (Join-Path $repoRoot "src\main.js") "Vue entry point (main.js)"
    Test-RequiredFile (Join-Path $repoRoot "src\App.vue") "Root Vue component"
    Test-RequiredFile (Join-Path $repoRoot "src\router\index.js") "Vue Router config"
    Test-RequiredFile (Join-Path $repoRoot "src\styles\index.css") "Tailwind CSS entry"
    Test-RequiredFile (Join-Path $repoRoot "src\components\FooterBase.vue") "Footer component"
    
    # Data files
    Test-RequiredFile (Join-Path $repoRoot "data\footer.json") "Footer data JSON"
    Test-RequiredFile (Join-Path $repoRoot "data\instruments.json") "Instruments data"
    Test-RequiredFile (Join-Path $repoRoot "data\pitch-class.json") "Pitch class data"
    
    # Build/deploy scripts
    Test-RequiredFile (Join-Path $PSScriptRoot "upRevFooter.ps1") "Footer update script"
    Test-RequiredFile (Join-Path $PSScriptRoot "build-verify-deploy.ps1") "Build/deploy script"
    Test-RequiredFile (Join-Path $PSScriptRoot "dev-alpha-vue-spa.ps1") "Dev server script"
    
    # Public folder (deployment target)
    if (-not (Test-Path (Join-Path $repoRoot "public"))) {
        Log "Creating public/ directory..." "Yellow"
        New-Item -ItemType Directory -Path (Join-Path $repoRoot "public") -Force | Out-Null
    }
    Test-RequiredFile (Join-Path $repoRoot "public\libs") "Audio worklet libs"
    
    Log ""
    
    if (-not $testsPassed) {
        Log "FAIL: Required files are missing. Aborting test." "Red"
        Log "============================================" "Red"
        exit 1
    }
    
    Log "✓ All required files verified successfully!" "Green"
    Log ""
    
    # ========================================
    # STEP 2: Update Footer Version/Timestamp
    # ========================================
    Log "--- Step 2: Updating Footer Version/Timestamp ---" "Yellow"
    $upRevOutput = & "${PSScriptRoot}\upRevFooter.ps1" 2>&1
    $upRevOutput | ForEach-Object { Log $_ }
    
    if ($LASTEXITCODE -ne 0 -and $null -ne $LASTEXITCODE) {
        Log "ERROR: upRevFooter.ps1 failed with exit code $LASTEXITCODE" "Red"
        $testsPassed = $false
    }
    Log ""
    
    # ========================================
    # STEP 3: Launch Local Vite Dev Server
    # ========================================
    Log "--- Step 3: Launching Local Vue Dev Server ---" "Yellow"
    $devProcess = $null
    
    # Start dev server in background
    $devProcess = Start-Process powershell -ArgumentList @(
        "-NoProfile",
        "-ExecutionPolicy", "Bypass",
        "-Command",
        "cd '$repoRoot'; npm run dev 2>&1 | Tee-Object -FilePath '$PSScriptRoot\dev-server.log'"
    ) -PassThru -WindowStyle Minimized
    
    Log "Dev server started (PID: $($devProcess.Id)). Waiting for server to initialize..." "Cyan"
    
    # Wait up to 30 seconds for server to be ready
    $maxWait = 30
    $waited = 0
    $serverReady = $false
    
    while ($waited -lt $maxWait) {
        Start-Sleep -Seconds 2
        $waited += 2
        
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                $serverReady = $true
                Log "✓ Dev server ready after $waited seconds" "Green"
                break
            }
        } catch {
            # Server not ready yet, continue waiting
        }
    }
    
    if (-not $serverReady) {
        Log "WARNING: Dev server may not be ready after $maxWait seconds" "Yellow"
    }
    
    Log ""
    
    # ========================================
    # STEP 4: Build and Deploy to Netlify
    # ========================================
    Log "--- Step 4: Building and Deploying to Netlify ---" "Yellow"
    $buildOutput = & "${PSScriptRoot}\build-verify-deploy.ps1" 2>&1
    $buildOutput | ForEach-Object { Log $_ }
    
    if ($LASTEXITCODE -ne 0 -and $null -ne $LASTEXITCODE) {
        Log "ERROR: build-verify-deploy.ps1 failed with exit code $LASTEXITCODE" "Red"
        $testsPassed = $false
    }
    Log ""
    
    # ========================================
    # STEP 5: Compare Local vs Deployed
    # ========================================
    Log "--- Step 5: Comparing Local vs Deployed Output ---" "Yellow"
    
    $localUrl = "http://localhost:5173"
    $deployedUrl = "https://musictutor.studio"
    
    $comparisonPassed = $true
    
    Log "Fetching local HTML from $localUrl..."
    try {
        $localHtml = Invoke-WebRequest -Uri $localUrl -UseBasicParsing -TimeoutSec 10
        Log "✓ Local fetch successful (Status: $($localHtml.StatusCode))" "Green"
    } catch {
        Log "ERROR fetching local HTML: $($_.Exception.Message)" "Red"
        $comparisonPassed = $false
    }
    
    Log "Fetching deployed HTML from $deployedUrl..."
    try {
        $deployedHtml = Invoke-WebRequest -Uri $deployedUrl -UseBasicParsing -TimeoutSec 10
        Log "✓ Deployed fetch successful (Status: $($deployedHtml.StatusCode))" "Green"
    } catch {
        Log "ERROR fetching deployed HTML: $($_.Exception.Message)" "Red"
        $comparisonPassed = $false
    }
    
    if ($comparisonPassed -and $localHtml -and $deployedHtml) {
        # Compare key elements
        $checks = @(
            @{Name="Title tag"; Pattern='<title>(.*?)</title>'},
            @{Name="Vue app div"; Pattern='<div id="app">'},
            @{Name="Main.js script"; Pattern='src="/src/main.js"'},
            @{Name="Material Symbols font"; Pattern='Material\+Symbols'}
        )
        
        foreach ($check in $checks) {
            $localMatch = $localHtml.Content -match $check.Pattern
            $deployedMatch = $deployedHtml.Content -match $check.Pattern
            
            if ($localMatch -and $deployedMatch) {
                Log "  ✓ $($check.Name) present in both" "Green"
            } elseif (-not $localMatch -and -not $deployedMatch) {
                Log "  ⚠ $($check.Name) missing in both" "Yellow"
            } else {
                Log "  ✗ $($check.Name) mismatch (Local: $localMatch, Deployed: $deployedMatch)" "Red"
                $comparisonPassed = $false
            }
        }
        
        # Read footer.json to get expected version
        $footerJsonPath = Join-Path $repoRoot "data\footer.json"
        if (Test-Path $footerJsonPath) {
            $footerData = Get-Content $footerJsonPath -Raw | ConvertFrom-Json
            $expectedVersion = $footerData.version
            $expectedUpdate = $footerData.lastUpdate
            
            Log "Expected footer - Version: $expectedVersion, LastUpdate: $expectedUpdate" "Cyan"
            
            # Note: Vue SPA renders footer dynamically, so checking rendered HTML may not work
            # Instead, verify the JSON was updated and deployment succeeded
            Log "  ℹ Footer is rendered client-side by Vue; verify manually at $deployedUrl" "Cyan"
        }
    }
    
    if ($comparisonPassed) {
        Log "✓ Local and deployed sites match key elements" "Green"
    } else {
        Log "✗ Differences detected between local and deployed" "Red"
        $testsPassed = $false
    }
    Log ""
    
    # ========================================
    # FINAL RESULT
    # ========================================
    Log "============================================" "Cyan"
    if ($testsPassed) {
        Log "OVERALL RESULT: ✓ PASS" "Green"
        Log "All tests completed successfully!" "Green"
    } else {
        Log "OVERALL RESULT: ✗ FAIL" "Red"
        Log "One or more tests failed. Review log above." "Red"
    }
    Log "============================================" "Cyan"
    Log ""
    
} catch {
    Log "CRITICAL ERROR: $($_.Exception.Message)" "Red"
    Log "Stack Trace: $($_.ScriptStackTrace)" "Red"
    Log "OVERALL RESULT: ✗ FAIL" "Red"
    $testsPassed = $false
} finally {
    # ========================================
    # CLEANUP
    # ========================================
    Log "--- Cleanup: Stopping Dev Server ---" "Yellow"
    
    if ($null -ne $devProcess -and -not $devProcess.HasExited) {
        try {
            $devProcess.Kill()
            $devProcess.WaitForExit(5000)
            Log "✓ Dev server stopped (PID: $($devProcess.Id))" "Green"
        } catch {
            Log "WARNING: Could not cleanly stop dev server: $($_.Exception.Message)" "Yellow"
        }
    }
    
    # Also kill any lingering node processes from Vite
    Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object {
        $_.CommandLine -like "*vite*"
    } | ForEach-Object {
        try {
            Stop-Process -Id $_.Id -Force
            Log "Stopped lingering Vite process (PID: $($_.Id))" "Yellow"
        } catch {
            # Process may have already exited
        }
    }
    
    Log ""
    Log "Test log saved to: $LogFile" "Cyan"
    Log "Dev server log saved to: $PSScriptRoot\dev-server.log" "Cyan"
    Log ""
    
    # Return appropriate exit code
    if ($testsPassed) {
        exit 0
    } else {
        exit 1
    }
}