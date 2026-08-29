@echo off
echo Stopping Android Backup web servers...
powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \"Name='powershell.exe'\" -ErrorAction SilentlyContinue | ForEach-Object { if ([string]$_.CommandLine -match 'Start-WebBackup|web\\server\.ps1') { Write-Host ('Stopping PID ' + $_.ProcessId); Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue } }"
echo Done.
pause
