@echo off
title AI Center Store - Local Server
echo ==========================================================
echo   Dang khoi dong Local Web Server cho AI Center Store...
echo ==========================================================

:: Don dep cac tien trinh cu neu co de giai phong cong mang
powershell -ExecutionPolicy Bypass -NoProfile -Command "Get-Process powershell -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like '*server.ps1*' -and $_.Id -ne $PID } | Stop-Process -Force -ErrorAction SilentlyContinue" >nul 2>&1

:: Chay web server
powershell -ExecutionPolicy Bypass -NoProfile -File "%~dp0server.ps1" -OpenBrowser
pause
