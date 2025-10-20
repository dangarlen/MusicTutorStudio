@echo off
cd /d "%~dp0"
python scan-orphans.py .
echo Output saved to timestamped file in current directory.
pause
