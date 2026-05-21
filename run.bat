@echo off
echo Hospital Management System ን በመጫን ላይ...
echo ----------------------------------------
docker compose down
docker compose up --build -d
echo ----------------------------------------
echo ሶፍትዌሩ በተሳካ ሁኔታ ተነስቷል!
echo እባክዎ በብሮውዘርዎ http://localhost መተግበሪያውን ይክፈቱ።
pause