param(
  [switch]$NoBrowser,
  [switch]$Terminal
)

$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

function Show-PipeDLBanner {
  $lines = @(
    '######  ###  ######  ####### ######  #      ',
    '#    #   #   #    #  #       #    #  #      ',
    '######   #   ######  #####   #    #  #      ',
    '#        #   #       #       #    #  #      ',
    '#       ###  #       ####### ######  #######',
    '                                          A  '
  )
  $colors = @('DarkMagenta','Magenta','DarkBlue','Blue','Cyan','White')
  for ($i = 0; $i -lt $lines.Count; $i++) {
    Write-Host $lines[$i] -ForegroundColor $colors[$i]
  }
  Write-Host '[ Style A | Gradient Banner ]' -ForegroundColor DarkCyan
}

function Assert-Command($name, $hint) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    throw "$name is not installed or not on PATH. $hint"
  }
}

Show-PipeDLBanner
Assert-Command 'python' 'Install Python 3.10+ from https://python.org and enable PATH option.'

if (-not $Terminal) {
  Write-Host '🧩 Starting pipedl-server tray app...' -ForegroundColor Cyan
  & (Join-Path $PSScriptRoot 'run-tray.ps1') -NoBanner
  exit $LASTEXITCODE
}

Write-Host '🚀 Starting PipeDL backend (terminal mode)...' -ForegroundColor Cyan

$guiPath = Join-Path $PSScriptRoot 'yt-dlp-gui'
if (-not (Test-Path $guiPath)) {
  throw "yt-dlp-gui folder not found at: $guiPath"
}

Set-Location $guiPath

if (-not $NoBrowser) {
  Start-Process 'http://localhost:5000' | Out-Null
}

python app.py
