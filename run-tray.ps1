param(
  [switch]$NoBanner
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

if (-not $NoBanner) {
  Show-PipeDLBanner
}
Assert-Command 'python' 'Install Python 3.10+ from https://python.org and enable PATH option.'
Write-Host '🧩 Starting pipedl-server...' -ForegroundColor Cyan

$guiPath = Join-Path $PSScriptRoot 'yt-dlp-gui'
if (-not (Test-Path $guiPath)) {
  throw "yt-dlp-gui folder not found at: $guiPath"
}

Set-Location $guiPath
python tray_app.py
