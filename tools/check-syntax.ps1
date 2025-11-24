$scriptPath = "C:\Dev\MusicTutorStudio\Code\tools\view-and-deploy-test.ps1"
$ErrorActionPreference = "Stop"

try {
    $null = [System.Management.Automation.PSParser]::Tokenize((Get-Content $scriptPath -Raw), [ref]$null)
    Write-Host "✓ Script syntax is valid" -ForegroundColor Green
    exit 0
} catch {
    Write-Host "✗ Syntax error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
