@echo off
title MuseumTour Dev Stopper
color 0C

echo ============================================
echo     MuseumTour - Stopping Dev Servers
echo ============================================
echo.

echo [1/2] Stopping Backend  (MuseumTour - Backend)...
taskkill /fi "WINDOWTITLE eq MuseumTour - Backend" /f /t >nul 2>&1
if %errorlevel% equ 0 (
    echo        Backend stopped.
) else (
    echo        Backend window not found ^(already closed?^).
)

echo [2/2] Stopping Frontend (MuseumTour - Frontend)...
taskkill /fi "WINDOWTITLE eq MuseumTour - Frontend" /f /t >nul 2>&1
if %errorlevel% equ 0 (
    echo        Frontend stopped.
) else (
    echo        Frontend window not found ^(already closed?^).
)

echo.
echo ============================================
echo  All servers stopped.
echo ============================================
echo.
pause
