$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

$taskName = 'PipeDL Tray'
$runPath = Join-Path $PSScriptRoot 'run-tray.ps1'

if (-not (Test-Path $runPath)) {
  throw "run-tray.ps1 not found: $runPath"
}

$action = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$runPath`""
$trigger = New-ScheduledTaskTrigger -AtLogOn
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Force | Out-Null
Write-Host "✅ Installed startup task: $taskName" -ForegroundColor Green
