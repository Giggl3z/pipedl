$ErrorActionPreference = 'SilentlyContinue'
$taskName = 'PipeDL Tray'

if (Get-ScheduledTask -TaskName $taskName) {
  Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
  Write-Host "✅ Removed startup task: $taskName" -ForegroundColor Green
} else {
  Write-Host "ℹ️ Startup task not found: $taskName"
}
