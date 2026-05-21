@echo off
title Biruh Tech HMS Installer
color 0A
:login
cls
echo ==========================================
echo    BIRUH TECH HMS - LOGIN SYSTEM
echo ==========================================
set /p user="Username: "
set /p pass="Password: "

if "%user%"=="Biruhtech" (
    if "%pass%"=="Biruh@1234" ( goto install )
)
echo [!] Wrong credentials!
pause
goto login

:install
echo [+] Loading software (This may take a minute)...
docker load -i biruh-hms-app.tar
echo [+] Starting service...
docker run -d -p 3000:3000 --name hms-service --restart always biruh-hms-app:v1
echo ==========================================
echo    SUCCESS! App ready at http://localhost:3000
echo ==========================================
pause