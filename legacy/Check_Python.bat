@echo off
python --version
if errorlevel 1 (echo Python not found.) else (echo Python is available.)
pause
