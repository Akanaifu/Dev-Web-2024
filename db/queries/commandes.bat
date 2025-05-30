@echo off

echo pour windows
echo ----------------------------------------

:: Configuration
set DB_NAME=dev3
set MYSQL_USER=root
set MYSQL_PASSWORD=casino
set SQL_STRUCTURE=casino.sql
set SQL_DATA=data-casino.sql

:: Supprimer la base de donnees
echo Supprimer la base de donnees %DB_NAME%...
mysql -u %MYSQL_USER% -p%MYSQL_PASSWORD% --port=3306 -e "DROP DATABASE IF EXISTS `%DB_NAME%`;"

:: Recreer la base de donnees
echo Recreer la base de donnees %DB_NAME%...
mysql -u %MYSQL_USER% -p%MYSQL_PASSWORD% --port=3306 -e "CREATE DATABASE `%DB_NAME%`;"

:: Importer la structure
echo Importer la structure depuis %SQL_STRUCTURE%...
mysql -u %MYSQL_USER% -p%MYSQL_PASSWORD% --port=3306 %DB_NAME% < %SQL_STRUCTURE%

:: Importer les donnees
echo Importer les donnees depuis %SQL_DATA%...
mysql -u %MYSQL_USER% -p%MYSQL_PASSWORD% --port=3306 %DB_NAME% < %SQL_DATA%

:: lancer le serveur
:: echo Lancer le serveur MySQL...
:: node ../../backend/server.js
pause
