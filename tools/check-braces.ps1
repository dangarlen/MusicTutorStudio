$lines = Get-Content "C:\Dev\MusicTutorStudio\Code\tools\view-and-deploy-test.ps1"
$depth = 0
$tryStack = @()

for ($i = 0; $i -lt $lines.Count; $i++) {
    $lineNum = $i + 1
    $line = $lines[$i]
    
    if ($line -match '\btry\s*\{') {
        $tryStack += $lineNum
        Write-Host "$lineNum : TRY opened (depth=$depth, stack=$($tryStack -join ','))" -ForegroundColor Yellow
    }
    
    if ($line -match '\}\s*catch\s*\{') {
        if ($tryStack.Count -gt 0) {
            $tryLine = $tryStack[-1]
            $tryStack = $tryStack[0..($tryStack.Count-2)]
            Write-Host "$lineNum : CATCH for try at $tryLine (depth=$depth, stack=$($tryStack -join ','))" -ForegroundColor Green
        } else {
            Write-Host "$lineNum : CATCH without TRY!" -ForegroundColor Red
        }
    }
    
    if ($line -match '\}\s*finally\s*\{') {
        Write-Host "$lineNum : FINALLY (depth=$depth)" -ForegroundColor Cyan
    }
    
    $opens = ([regex]::Matches($line, '\{')).Count
    $closes = ([regex]::Matches($line, '\}')).Count
    $depth += $opens - $closes
    
    if ($depth -lt 0) {
        Write-Host "$lineNum : ERROR - Too many closing braces! Line: $line" -ForegroundColor Red
    }
}

Write-Host "`nFinal depth: $depth (should be 0)" -ForegroundColor $(if ($depth -eq 0) { "Green" } else { "Red" })
Write-Host "Unclosed try blocks: $($tryStack -join ',')" -ForegroundColor $(if ($tryStack.Count -eq 0) { "Green" } else { "Red" })
