@echo off
cd /d "%~dp0"
echo === Ghost full pipeline: apply + preview + sanity ===
echo.

echo [1/3] Apply ghost...
node scripts\svg-ghost.mjs
if errorlevel 1 goto fail

echo.
echo [2/3] Preview...
call npm run preview:mascots
if errorlevel 1 goto fail

echo.
echo [3/3] Sanity...
call npm run sanity
if errorlevel 1 goto fail

echo.
echo Opening mascot-preview.html (click Ghost)...
start "" "%~dp0mascot-preview.html"
echo.
echo DONE. If it looks good, release separately.
pause
exit /b 0

:fail
echo.
echo FAILED - fix errors above, then try again.
pause
exit /b 1
