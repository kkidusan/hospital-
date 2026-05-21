@echo off
chcp 65001 > nul
title Biruh Tech HMS - Automated Installer
color 0A

:login
cls
echo ========================================================
echo        ብሩህ ቴክ (BIRUH TECH) HMS - ደህንነቱ የተጠበቀ መጫኛ
echo ========================================================
echo.
set /p user="የተጠቃሚ ስም (Username): "
set /p pass="የይለፍ ቃል (Password): "

:: የይለፍ ቃል ማረጋገጫ
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
echo   የሆስፒታል ማኔጅመንት ሲስተም አውቶማቲክ ጭነት (Offline Setup)
echo ========================================================
echo.

echo [+] ደረጃ 1/4: የቅንብር ፋይሎችን በጀርባ በማዘጋጀት ላይ...
:: በ .exe ውስጥ የተካተቱትን ፋይሎች ለጊዜው ወደ ውጭ ማውጣት
copy /y "%MYFILES%\docker-compose.yml" . > nul
copy /y "%MYFILES%\.env.production" . > nul
copy /y "%MYFILES%\nginx.conf" . > nul

echo [+] ደረጃ 2/4: የዶከር ምስሎችን በመጫን ላይ (ከ2-4 ደቂቃ ሊወስድ ይችላል)...
echo --------------------------------------------------------
if exist "%MYFILES%\allowance-system-app.tar" (
    docker load -i "%MYFILES%\allowance-system-app.tar"
) else (
    echo [ስህተት] የ 'allowance-system-app.tar' ፋይል አልተገኘም!
    pause
    exit
)

echo.
echo [+] ደረጃ 3/4: የቆዩ ኮንቴይነሮችን በማጽዳት ላይ...
echo --------------------------------------------------------
docker compose down

echo.
echo [+] ደረጃ 4/4: አዲሱን ሲስተም ከመስመር ውጪ (Offline) በማስጀመር ላይ...
echo --------------------------------------------------------
docker compose up -d

echo.
echo ========================================================
echo   🎉 SUCCESS! ሶፍትዌሩ በተሳካ ሁኔታ ተጭኖ በጀርባ እየሰራ ነው!
echo   እባክዎ በብሮውዘርዎ http://localhost ብለው ይክፈቱት።
echo ========================================================
echo.
pause