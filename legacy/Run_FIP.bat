@echo off
setlocal
cd /d "%~dp0"

py -m fip.app
if %errorlevel% neq 0 (
    python -m fip.app
)

pause
