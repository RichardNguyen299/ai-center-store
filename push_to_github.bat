@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
cd /d "%~dp0" 2>nul

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

echo [1/3] Dang kiem tra va them cac file thay doi...
"%GIT_CMD%" add -A

"%GIT_CMD%" diff-index --quiet HEAD -- 2>nul
if %errorlevel% neq 0 (
    echo [1/3] Dang commit cac thay doi moi nhat...
    "%GIT_CMD%" commit -m "update: Dong bo tinh nang moi nhat len GitHub"
) else (
    echo [1/3] Khong co tap tin moi can commit.
)

echo.
echo [2/3] Dang kiem tra va dong bo code tu GitHub ve (git pull --rebase)...
"%GIT_CMD%" pull --rebase origin main

if %errorlevel% neq 0 (
    echo.
    echo [CANH BAO] Khong the tu dong gop code do co xung dot voi GitHub.
    echo Dang huy rebase de giu nguyen ven code tren may tinh cua ban...
    "%GIT_CMD%" rebase --abort 2>nul
    echo.
    echo Ban co muon DAY DE (FORCE PUSH) toan bo code tren may nay len GitHub khong?
    echo (Khuyen dung: Chon Y neu code tren may tinh la phien ban moi va chuan nhat)
    set /p "CHOICE=Nhap Y de day de, hoac N de huy [Y/N]: "
    if /i "!CHOICE!"=="Y" (
        echo.
        echo [3/3] Dang day de (Force Push) len GitHub...
        "%GIT_CMD%" push -f origin main
    ) else (
        echo.
        echo Da huy thao tac day code.
        goto :END
    )
) else (
    echo.
    echo [3/3] Dang day code len GitHub (origin main)...
    "%GIT_CMD%" push origin main
)

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
    echo   1. Chua dang nhap Git tren may tinh (Personal Access Token).
    echo   2. Mat ket noi mang Internet.
    echo   3. Xung dot code tren nhanh main.
    echo ===================================================
)

:END
echo.
pause