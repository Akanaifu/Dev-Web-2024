@echo off

:: Configuration
set DB_NAME=machine-a-sous
set MYSQL_USER=root
set MYSQL_PASSWORD=casino
set SQL_STRUCTURE=casino.sql
set SQL_DATA=data-casino.sql

:: Supprimer la base de données
echo Supprimer la base de données %DB_NAME%...
mysql -u %MYSQL_USER% -p%MYSQL_PASSWORD% -e "DROP DATABASE IF EXISTS %DB_NAME%;"

:: Recréer la base de données
echo Recréer la base de données %DB_NAME%...
mysql -u %MYSQL_USER% -p%MYSQL_PASSWORD% -e "CREATE DATABASE %DB_NAME%;"

:: Importer la structure
echo Importer la structure depuis %SQL_STRUCTURE%...
mysql -u %MYSQL_USER% -p%MYSQL_PASSWORD% %DB_NAME% < %SQL_STRUCTURE%

:: Importer les données
echo Importer les données depuis %SQL_DATA%...
mysql -u %MYSQL_USER% -p%MYSQL_PASSWORD% %DB_NAME% < %SQL_DATA%

echo Opération terminée.
pause