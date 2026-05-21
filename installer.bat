@echo off
chcp 65001 > nul
title Biruh Tech HMS - Automated Installer
color 0A

:: የአስተዳዳሪ (Administrator) መብት ማረጋገጫ
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [!] እባክዎ ፋይሉን Right-Click አድርገው "Run as Administrator" ይበሉት!
    pause
    exit
)

:: ስክሪፕቱ የጀመረበትን ትክክለኛ የ WinRAR ጊዜያዊ ፎልደር ፓዝ ማስተካከል
set "EXTRACT_DIR=%~dp0"
cd /d "%EXTRACT_DIR%"

:login
cls
echo ========================================================
echo         ብሩህ ቴክ (BIRUH TECH) HMS - ደህንነቱ የተጠበቀ መጫኛ
echo ========================================================
echo.
set /p user="የተጠቃሚ ስም (Username): "
set /p pass="የይለፍ ቃል (Password): "

if "%user%"=="Biruhtech" (
    if "%pass%"=="Biruh@1234" ( goto install )
)
echo.
echo [!] ስህተት፦ የተጠቃሚ ስም ወይም የይለፍ ቃል አልተሳካም!
pause
goto login

:install
cls
echo ========================================================
echo    የሆስፒታል ማኔጅመንት ሲስተም አውቶማቲክ ጭነት (Offline Setup)
echo ========================================================
echo.

echo [+] ደረጃ 1/4: የዶከር ምስሎችን በመጫን ላይ (ከ2-4 ደቂቃ ሊወስድ ይችላል)...
echo --------------------------------------------------------
if exist "allowance-system-app.tar" (
    docker load -i "allowance-system-app.tar"
) else (
    echo [🛑 ስህተት] የ 'allowance-system-app.tar' ፋይል አልተገኘም!
    echo የአሁኑ ፎልደር ፓዝ፦ %cd%
    pause
    exit
)

echo.
echo [+] ደረጃ 2/4: የቆዩ ኮንቴይነሮችን በማጽዳት ላይ...
echo --------------------------------------------------------
if exist "docker-compose.yml" (
    docker compose down
) else (
    echo [🛑 ስህተት] docker-compose.yml ፋይል አልተገኘም!
    pause
    exit
)

echo.
echo [+] ደረጃ 3/4: አዲሱን ሲስተም ከመስመር ውጪ (Offline) በማስጀመር ላይ...
echo --------------------------------------------------------
docker compose up -d

echo.
echo [+] ደረጃ 4/4: የዳታቤዝ ሰንጠረዦችን በራስ-ሰር በማደራጀት ላይ...
echo [ማሳሰቢያ] ይህ ሂደት ዳታቤዙ ሙሉ በሙሉ ዝግጁ እስኪሆን 15 ሰከንድ ይወስዳል።
echo --------------------------------------------------------
timeout /t 15 /nobreak > nul

:: 🛑 ዋናው ማስተካከያ፦ የአካባቢ ተለዋዋጭን ሳይሆን ቀጥታ የ --url አማራጭን በመጠቀም ፕሪስማን ማስገደድ!
docker compose exec app npx prisma db push --url "postgresql://postgres:bruhtech123@db:5432/postgres?schema=public"

echo.
echo ========================================================
echo   🎉 SUCCESS! ሶፍትዌሩ በተሳካ ሁኔታ ተጭኖ በጀርባ እየሰራ ነው!
echo   እባክዎ በብሮውዘርዎ http://localhost ብለው ይክፈቱት።
echo ========================================================
echo.
pause