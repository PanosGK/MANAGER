@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Start-WebBackup.ps1" %*
if errorlevel 1 (
    echo.
    pause
)
