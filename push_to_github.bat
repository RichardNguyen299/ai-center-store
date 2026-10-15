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

echo [1/2] Dang kiem tra file thay doi...
"%GIT_CMD%" add -A

"%GIT_CMD%" diff-index --quiet HEAD -- 2>nul
if %errorlevel% neq 0 (
    echo [1/2] Dang commit cac thay doi moi...
    "%GIT_CMD%" commit -m "update: Dong bo tinh nang moi nhat len GitHub"
) else (
    echo [1/2] Tat ca thay doi da duoc commit.
)

echo.
echo [2/2] Dang day code len GitHub [origin main]...
"%GIT_CMD%" push origin main

if %errorlevel% neq 0 (
    echo.
    echo ===================================================
    echo  [THONG BAO] GitHub tu choi day binh thuong do co commit khac tren web.
    echo.
    echo  BAN CO MUON DONG BO DE [FORCE PUSH] CODE MOI NHAT LEN GITHUB KHONG?
    echo  [Dieu nay se lay toan bo code hien tai tren may tinh lam chuan va cap nhat len Vercel]
    echo ===================================================
    echo.
    set /p "CHOICE=Nhap Y de day de, hoac N de huy [Y/N]: "
    if /i "!CHOICE!"=="Y" (
        echo.
        echo Dang tien hanh Force Push len GitHub...
        "%GIT_CMD%" push -f origin main
    ) else (
        echo.
        echo Da huy thao tac.
        goto :END
    )
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
    echo  [CHU Y] Khong the day code.
    echo  Vui long kiem tra ket noi mang hoac dang nhap Git.
    echo ===================================================
)

:END
echo.
pause