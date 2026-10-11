@echo off
chcp 65001 >nul
echo ===================================================
echo   AI CENTER STORE - ĐỒNG BỘ CODE LÊN GITHUB & VERCEL
echo ===================================================
echo.
git add -A
git commit -m "update: Dong bo tinh nang moi nhat len GitHub"
echo.
echo Dang day code len GitHub (https://github.com/RichardNguyen299/ai-center-store.git)...
git push origin main
echo.
if %errorlevel% equ 0 (
    echo ===================================================
    echo  [THANH CONG] Code da day len GitHub!
    echo  Vercel se tu dong deploy len:
    echo  https://ai-center-store-omega.vercel.app/
    echo ===================================================
) else (
    echo ===================================================
    echo  [CHU Y] Khong the day code tu dong.
    echo  Vui long kiem tra ket noi mang hoac dang nhap Git.
    echo ===================================================
)
echo.
pause
