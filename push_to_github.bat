@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ===================================================
echo   AI CENTER STORE - DONG BO CODE LEN GITHUB VA VERCEL
echo ===================================================
echo.

set "GIT_CMD=git"
where git >nul 2>nul
if %errorlevel% neq 0 (
    if exist "C:\Program Files\Git\cmd\git.exe" (
        set "GIT_CMD=C:\Program Files\Git\cmd\git.exe"
    ) else if exist "%LOCALAPPDATA%\Programs\Git\cmd\git.exe" (
        set "GIT_CMD=%LOCALAPPDATA%\Programs\Git\cmd\git.exe"
    ) else (
        echo [LOI] Khong tim thay Git tren may tinh!
        echo Vui long cai dat Git hoac them Git vao bien moi truong PATH.
        echo.
        pause
        exit /b 1
    )
)

echo Thu muc du an: %CD%
echo.

echo [1/2] Dang them tat ca file thay doi...
"%GIT_CMD%" add -A

"%GIT_CMD%" diff-index --quiet HEAD -- 2>nul
if %errorlevel% neq 0 (
    echo [1/2] Dang commit cac thay doi moi nhat...
    "%GIT_CMD%" commit -m "update: Dong bo tinh nang moi nhat len GitHub"
) else (
    echo [1/2] Khong co tap tin moi can commit. Dang tiep tuc day code...
)

echo.
echo [2/2] Dang day code len GitHub (origin main)...
"%GIT_CMD%" push origin main

if %errorlevel% equ 0 (
    echo.
    echo ===================================================
    echo  [THANH CONG] Code da day len GitHub thanh cong!
    echo  Vercel se tu dong deploy len:
    echo  https://ai-center-store-omega.vercel.app/
    echo ===================================================
) else (
    echo.
    echo ===================================================
    echo  [CHU Y] Khong the day code len GitHub.
    echo  Cac nguyen nhan thuong gap:
    echo   1. Chua dang nhap Git tren may tinh.
    echo   2. Mat ket noi mang Internet.
    echo   3. Xung dot code tren nhanh main can pull truoc.
    echo ===================================================
)

echo.
pause