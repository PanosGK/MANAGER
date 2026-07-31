@echo off
cd /d "%~dp0"
echo === Apply ANY mascot generator (svg-{name}.mjs) ===
echo Examples: ghost  plant  slime  aether
set /p CHAR="Character id: "
if "%CHAR%"=="" (
  echo No name entered.
  pause
  exit /b 1
)
if not exist "scripts\svg-%CHAR%.mjs" (
  echo Missing scripts\svg-%CHAR%.mjs
  pause
  exit /b 1
)

echo.
echo [1/3] Apply %CHAR%...
node "scripts\svg-%CHAR%.mjs"
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
start "" "%~dp0mascot-preview.html"
echo DONE. Click the character button for: %CHAR%
pause
exit /b 0

:fail
echo FAILED.
pause
exit /b 1
