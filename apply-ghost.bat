@echo off
cd /d "%~dp0"
echo === Apply ghost SVG into myman_mascot.js ===
node scripts\svg-ghost.mjs
if errorlevel 1 (
  echo FAILED.
  pause
  exit /b 1
)
echo.
echo OK. Next: run preview-mascots.bat or apply-ghost-full.bat
pause
