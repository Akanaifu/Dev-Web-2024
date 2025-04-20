#!/bin/bash

echo Pour linux

# Configuration
DB_NAME=casino
MYSQL_USER=root
MYSQL_PASSWORD=ben
SQL_STRUCTURE=casino.sql
SQL_DATA=dataCasino.sql

# Supprimer la base de données
echo Supprimer la base de données $DB_NAME...
mysql -u $MYSQL_USER -p$MYSQL_PASSWORD -e "DROP DATABASE IF EXISTS $DB_NAME;"

# Recréer la base de données
echo Recréer la base de données $DB_NAME...
mysql -u $MYSQL_USER -p$MYSQL_PASSWORD -e "CREATE DATABASE $DB_NAME;"

# Importer la structure
echo Importer la structure depuis $SQL_STRUCTURE...
mysql -u $MYSQL_USER -p$MYSQL_PASSWORD $DB_NAME < $SQL_STRUCTURE

# Importer les données
echo Importer les données depuis $SQL_DATA...
mysql -u $MYSQL_USER -p$MYSQL_PASSWORD $DB_NAME < $SQL_DATA

echo Opération terminée.
read -p "Appuyez sur Entrée pour continuer..."