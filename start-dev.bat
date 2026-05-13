@echo off
title MuseumTour Dev Launcher
color 0A

echo ============================================
echo     MuseumTour - Starting Dev Servers
echo ============================================
echo.

echo [1/2] Starting Backend  (nodemon)...
start "MuseumTour - Backend" cmd /k "color 0B && title MuseumTour - Backend && cd /d "f:\Studies\Project\3. React\MuseumTour\backend" && echo Backend starting... && npm run dev"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend (Vite)...
start "MuseumTour - Frontend" cmd /k "color 0D && title MuseumTour - Frontend && cd /d "f:\Studies\Project\3. React\MuseumTour\frontend\museum" && echo Frontend starting... && npm run arise"

echo.
echo ============================================
echo  Both servers are running in new windows.
echo  Run stop-dev.bat to shut everything down.
echo ============================================
echo.
pause
