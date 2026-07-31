@echo off
cd /d "%~dp0"
echo === Sanity checks ===
call npm run sanity
echo.
pause
