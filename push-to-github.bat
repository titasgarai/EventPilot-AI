@echo off
setlocal
cd /d "%~dp0"
set "PATH=%~dp0.git-bin\cmd;%PATH%"
echo ===================================================
echo   Pushing EventPilot AI to GitHub (titasgarai)
echo ===================================================
echo Target: https://github.com/titasgarai/EventPilot-AI.git
echo.
git push -u origin main
echo.
pause

