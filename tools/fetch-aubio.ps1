$libs = 'C:\Dev\MusicTutorStudio\Code\public\alpha-vue-SPA\libs'
if (-Not (Test-Path $libs)) { New-Item -ItemType Directory -Path $libs | Out-Null }
$outJs = Join-Path $libs 'aubio.js'
$outWasm = Join-Path $libs 'aubio.wasm'
$candidates = @(
  'https://cdn.jsdelivr.net/npm/aubiojs@0.3.3/dist/',
  'https://unpkg.com/aubiojs@0.3.3/dist/',
  'https://cdn.jsdelivr.net/npm/aubiojs@0.3.2/dist/',
  'https://unpkg.com/aubiojs@0.3.2/dist/',
  'https://cdn.jsdelivr.net/gh/aubio/aubio.js@master/dist/',
  'https://raw.githubusercontent.com/aubio/aubiojs/master/dist/',
  'https://cdn.jsdelivr.net/npm/aubiojs/dist/',
  'https://unpkg.com/aubiojs/dist/'
)
$success = $false
foreach ($base in $candidates) {
  $jsUrl = $base + 'aubio.js'
  $wasmUrl = $base + 'aubio.wasm'
  try {
    Write-Host "Trying $jsUrl"
    Invoke-WebRequest -Uri $jsUrl -OutFile $outJs -UseBasicParsing -TimeoutSec 30 -ErrorAction Stop
    Write-Host "Got aubio.js from $jsUrl"
    Write-Host "Trying $wasmUrl"
    Invoke-WebRequest -Uri $wasmUrl -OutFile $outWasm -UseBasicParsing -TimeoutSec 30 -ErrorAction Stop
    Write-Host "Got aubio.wasm from $wasmUrl"
    $success = $true
    break
  } catch {
    Write-Host ('Failed for base ' + $base + ': ' + $_.Exception.Message)
  }
}
if (-Not $success) {
  Write-Host 'No candidate succeeded. Please provide a direct URL or local files.'
  exit 2
} else {
  Write-Host 'Aubio files saved to libs folder.'
}
