@echo off
chcp 65001 > nul
title Biruh Tech HMS - Ultimate EXE Builder
color 0A

cd /d "%~dp0"

cls
echo ========================================================
echo        የኢንስተለር ፋይል ማዘጋጃ (Ultimate .EXE Builder)
echo ========================================================
echo.

:: 1. የፋይሎች መኖር ፍተሻ
set missing_file=0

if not exist "docker-compose.yml" ( echo [🛑 ስህተት] docker-compose.yml አልተገኘም! & set missing_file=1 )
if not exist ".env.production" ( echo [🛑 ስህተት] .env.production አልተገኘም! & set missing_file=1 )
if not exist "nginx.conf" ( echo [🛑 ስህተት] nginx.conf አልተገኘም! & set missing_file=1 )
if not exist "installer.bat" ( echo [🛑 ስህተት] installer.bat አልተገኘም! & set missing_file=1 )
if not exist "allowance-system-app.tar" ( echo [🛑 ስህተት] allowance-system-app.tar አልተገኘም! & set missing_file=1 )

if %missing_file% equ 1 (
    echo.
    echo [⚠️] እባክዎ ከላይ የጎደሉትን ፋይሎች በዚህ ፎልደር ውስጥ ያስገብተው በድጋሚ ይሞክሩ!
    pause
    exit
)

:: 2. የ WinRAR መገኛ ፓዝ ማረጋገጥ
set "WINRAR_PATH=C:\Program Files\WinRAR\WinRAR.exe"
if not exist "%WINRAR_PATH%" ( set "WINRAR_PATH=C:\Program Files\WinRAR\Rar.exe" )

if not exist "%WINRAR_PATH%" (
    echo [🛑 ስህተት] WinRAR በኮምፒውተርዎ ላይ አልተገኘም!
    pause
    exit
)

echo [+] ደረጃ 1: የ WinRAR SFX የቅንብር መመሪያዎችን በጀርባ በማዘጋጀት ላይ...
(
echo Path=%%TEMP%%\BiruhHMSInst
echo Setup=installer.bat
echo Silent=1
echo Overwrite=1
echo Title=Biruh Tech HMS Setup
) > sfx_config.txt

echo.
echo [+] ደረጃ 2: አምስቱንም ፋይሎች ወደ አንድ .EXE በመጠቅለል ላይ...
echo [ማሳሰቢያ] የ .tar ፋይሉ ትልቅ ስለሆነ ይህ ሂደት ከ1 እስከ 3 ደቂቃ ሊወስድ ይችላል።
echo --------------------------------------------------------

"%WINRAR_PATH%" a -sfx -m5 -s -zsfx_config.txt "Biruh_Tech_HMS_Setup.exe" "docker-compose.yml" ".env.production" "nginx.conf" "allowance-system-app.tar" "installer.bat"

if %errorlevel% equ 0 (
    echo --------------------------------------------------------
    echo [የተሳካ] 🎉 "Biruh_Tech_HMS_Setup.exe" በሰላም ተፈጥሯል!
) else (
    echo --------------------------------------------------------
    echo [🛑 ስህተት] ፋይሉን ወደ .EXE የመቀየር ሂደቱ አልተሳካም።
)

if exist sfx_config.txt del sfx_config.txt

echo.
pause