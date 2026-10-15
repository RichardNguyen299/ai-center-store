@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul

:: Chuyen thu muc lam viec ve dung thu muc chua file bat nay
cd /d "%~dp0"

echo ===================================================
echo   AI CENTER STORE - DONG BO CODE LEN GITHUB VA VERCEL
echo ===================================================
echo.

:: Tim kiem file thuc thi Git neu PATH chua co
set "GIT_CMD=git"
where git >nul 2>nul
if %errorlevel% neq 0 (
    if exist "C:\Program Files\Git\cmd\git.exe" (
        set "GIT_CMD=C:\Program Files\Git\cmd\git.exe"
    ) else if exist "%LOCALAPPDATA%\Programs\Git\cmd\git.exe" (
        set "GIT_CMD=%LOCALAPPDATA%\Programs\Git\cmd\git.exe"
    ) else (
        echo [LOI] Khong tim thay Git tren may tinh!
        echo Vui long cai dat Git tu https://git-scm.com hoac kiem tra lai duong dan.
        echo.
        pause
        exit /b 1
    )
)

echo Dang kiem tra trang thai thu muc: %CD%
echo.

:: Them tat ca thay doi
"%GIT_CMD%" add -A

:: Kiem tra neu co thay doi chua commit thi commit
"%GIT_CMD%" diff-index --quiet HEAD -- 2>nul
if %errorlevel% neq 0 (
    echo [1/2] Dang commit cac thay doi moi nhat...
    "%GIT_CMD%" commit -m "update: Dong bo tinh nang moi nhat len GitHub"
) else (
    echo [1/2] Khong co tap tin nao vua sua. San sang day cac commit da co...
)

echo.
echo [2/2] Dang day code len GitHub (origin main)...
"%GIT_CMD%" push origin main

if %errorlevel% equ 0 (
    echo.
    echo ===================================================
    echo  [THANH CONG] Code da duoc day len GitHub thanh cong!
    echo  Vercel se tu dong nhan commit va deploy len:
    echo  https://ai-center-store-omega.vercel.app/
    echo ===================================================
) else (
    echo.
    echo ===================================================
    echo  [CHU Y] Khong the day code tu dong.
    echo  Nguyen nhan thuong gap:
    echo   1. Chua dang nhap Git tren may tinh hoac Personal Access Token het han.
    echo   2. Mat ket noi mang Internet.
    echo   3. Xung dot code can pull truoc (git pull --rebase origin main).
    echo ===================================================
)

echo.
pause