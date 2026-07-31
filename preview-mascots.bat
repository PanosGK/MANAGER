@echo off
cd /d "%~dp0"
echo === Regenerate mascot-preview.html ===
call npm run preview:mascots
if errorlevel 1 (
  echo FAILED.
  pause
  exit /b 1
)
echo.
echo Opening mascot-preview.html ...
start "" "%~dp0mascot-preview.html"
pause
