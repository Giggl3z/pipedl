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
  Write-Host ''
}

function Assert-Command($name, $hint) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    throw "$name is not installed or not on PATH. $hint"
  }
}

function Invoke-Step($label, [scriptblock]$action) {
  Write-Host "→ $label" -ForegroundColor Yellow
  & $action
}

Show-PipeDLBanner
Write-Host 'Tip: Run this script in PowerShell as Administrator for best results.' -ForegroundColor DarkYellow
Write-Host ''

Assert-Command 'python' 'Install Python 3.10+ from https://python.org and enable "Add python.exe to PATH".'

$guiPath = Join-Path $PSScriptRoot 'yt-dlp-gui'
if (-not (Test-Path $guiPath)) {
  throw "yt-dlp-gui folder not found at: $guiPath"
}

Set-Location $guiPath

Invoke-Step 'Upgrading pip' { python -m pip install --upgrade pip }
Invoke-Step 'Installing dependencies from requirements.txt' { python -m pip install -r requirements.txt }

Write-Host ''
Write-Host '✅ Setup complete!' -ForegroundColor Green
Write-Host ''

$startupChoice = ''
do {
  $startupChoice = (Read-Host 'Auto-start pipedl-server on login? (Y/N)').Trim().ToLowerInvariant()
} while ($startupChoice -notin @('y', 'yes', 'n', 'no'))

if ($startupChoice -in @('y', 'yes')) {
  try {
    & (Join-Path $PSScriptRoot 'install-tray-autostart.ps1')
  }
  catch {
    Write-Host "⚠ Could not install startup task automatically: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host 'You can run it later: .\install-tray-autostart.ps1' -ForegroundColor Yellow
  }
} else {
  Write-Host 'Skipping auto-start setup.' -ForegroundColor DarkYellow
}

Write-Host ''
Write-Host 'Next steps:' -ForegroundColor Green
Write-Host '  1) Start server app (tray default): powershell -ExecutionPolicy Bypass -File .\run.ps1'
Write-Host '  2) Terminal mode (optional):      powershell -ExecutionPolicy Bypass -File .\run.ps1 -Terminal'
Write-Host '  3) Load extension: brave://extensions -> Developer mode -> Load unpacked -> yt-dlp-brave-extension'
