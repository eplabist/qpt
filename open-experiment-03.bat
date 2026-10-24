@echo off
setlocal
cd /d "%~dp0"

where py >nul 2>nul
if %errorlevel%==0 goto PYTHON_LAUNCHER
where python >nul 2>nul
if %errorlevel%==0 goto PYTHON

echo.
echo Python was not found on this computer.
echo Install Python from https://www.python.org/downloads/ and run this file again.
echo.
pause
exit /b 1

:PYTHON_LAUNCHER
start "Physics Lab Server" /b py -m http.server 8000 --bind 127.0.0.1
 goto OPEN

:PYTHON
start "Physics Lab Server" /b python -m http.server 8000 --bind 127.0.0.1

:OPEN
timeout /t 2 /nobreak >nul
start "" "http://127.0.0.1:8000/experiment-03.html#visual"
echo.
echo Physics Lab is running at http://127.0.0.1:8000/
echo Keep this window/process running while using the website.
pause
