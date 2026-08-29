@echo off
color a
cd C:\Users\user\Desktop\mi_flash_files\platform-tools
:loop
adb devices
fastboot devices
timeout /t 1 /nobreak >nul
cls
goto :loop
