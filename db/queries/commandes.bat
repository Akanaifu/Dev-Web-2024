@echo off

echo "⚠️  ATTENTION A NE PAS UTILISER EN PROD  ⚠️"
echo pour windows
echo ----------------------------------------

:: Configuration
set DB_NAME=dev3
set MYSQL_USER=root
set MYSQL_PASSWORD=c@sino
set SQL_STRUCTURE=casino.sql
set SQL_DATA=data-casino.sql

:: Supprimer la base de donnees
echo Supprimer la base de donnees %DB_NAME%...
mysql -u %MYSQL_USER% -p%MYSQL_PASSWORD% --port=3307 -e "DROP DATABASE IF EXISTS `%DB_NAME%`;"

:: Recreer la base de donnees
echo Recreer la base de donnees %DB_NAME%...
mysql -u %MYSQL_USER% -p%MYSQL_PASSWORD% --port=3307 -e "CREATE DATABASE `%DB_NAME%`;"

:: Importer la structure
echo Importer la structure depuis %SQL_STRUCTURE%...
mysql -u %MYSQL_USER% -p%MYSQL_PASSWORD% --port=3307 %DB_NAME% < %SQL_STRUCTURE%

:: Importer les donnees
echo Importer les donnees depuis %SQL_DATA%...
mysql -u %MYSQL_USER% -p%MYSQL_PASSWORD% --port=3307 %DB_NAME% < %SQL_DATA%

echo Operation terminee.
pause