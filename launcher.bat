@echo off
title RHV Web App - Local
cd /d "%~dp0"

call venv\Scripts\activate.bat

set FLASK_ENV=development
set FLASK_DEBUG=1

echo.
echo  RHV Web App corriendo en http://localhost:5000
echo  Ctrl+C para detener
echo.

python server.py

pause
