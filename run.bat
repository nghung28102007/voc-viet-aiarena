@echo off
chcp 65001 >nul 2>&1
title Sac Viet - Co-Mix Studio (AI Arena)
color 0F

echo ============================================================
echo   SAC VIET (CO-MIX STUDIO) - AI ARENA VNU x GOOGLE
echo ============================================================
echo.

REM Kiem tra Node.js
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [LOI] Khong tim thay Node.js tren may tinh!
    echo Vui long cai dat Node.js tu: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Di chuyen vao thu muc du an sac-viet
cd /d "%~dp0"
if exist "%~dp0sac-viet\package.json" (
    cd /d "%~dp0sac-viet"
)

if not exist "package.json" (
    echo [LOI] Khong tim thay thu muc sac-viet chua file package.json!
    echo Thu muc hien tai: %CD%
    echo.
    pause
    exit /b 1
)

echo [1/2] Tu dong mo trinh duyet tai: http://localhost:3000 sau 3 giay...
start /min cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:3000"

echo [2/2] Dang khoi chay Next.js Dev Server...
echo.
echo ------------------------------------------------------------
echo Server dang khoi chay! Cua so nay giup server hoat dong.
echo Khong dong cua so nay khi dang trai nghiem ung dung.
echo Nhan Ctrl + C de dung server.
echo ------------------------------------------------------------
echo.

call npm run dev

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [THONG BAO] Server da dung hoac gap su co (Ma loi: %ERRORLEVEL%).
)

echo.
pause