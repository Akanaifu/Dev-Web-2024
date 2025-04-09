Table Users (Utilisateurs)

user_id (PK): Identifiant unique de l'utilisateur
username: Nom d'utilisateur
email: Email de contact
password_hash: Mot de passe hashé (jamais en clair)
first_name: Prénom
last_name: Nom
balance: Solde du compte
created_at: Date de création du compte
last_login: Dernière connexion
status: Actif, Suspendu, etc.
role: Utilisateur, Admin, etc.


Table Games (Jeux)

game_id (PK): Identifiant unique du jeu
name: Nom du jeu (Machine à sous, Poker menteur)
description: Description du jeu
min_bet: Mise minimale
max_bet: Mise maximale
rules: Règles du jeu (peut être stocké comme JSON)
status: Actif, Maintenance, etc.


Table Game_Sessions (Sessions de jeu)

session_id (PK): Identifiant unique de la session
user_id (FK): Référence vers Users
game_id (FK): Référence vers Games
start_time: Heure de début
end_time: Heure de fin
initial_balance: Solde de départ
final_balance: Solde final
status: En cours, Terminée, Interrompue


Table Game_Rounds (Tours de jeu)

round_id (PK): Identifiant unique du tour
session_id (FK): Référence vers Game_Sessions
timestamp: Horodatage
bet_amount: Montant misé
outcome: Résultat (gain/perte)
win_amount: Montant gagné (0 si perte)
game_state: État du jeu (peut être stocké comme JSON - utile pour le poker)


Table Transactions (Transactions)

transaction_id (PK): Identifiant unique de la transaction
user_id (FK): Référence vers Users
amount: Montant
type: Dépôt, Retrait, Gain de jeu, Perte de jeu
status: Traité, En attente, Échoué
timestamp: Horodatage
reference_id: Référence externe (optionnel, pour les paiements)
session_id (FK, nullable): Référence vers Game_Sessions si applicable


Table User_Stats (Statistiques)

stat_id (PK): Identifiant unique de la statistique
user_id (FK): Référence vers Users
game_id (FK): Référence vers Games
total_games: Nombre total de parties jouées
total_wins: Nombre total de victoires
total_losses: Nombre total de défaites
total_bet: Montant total misé
total_won: Montant total gagné
total_lost: Montant total perdu
highest_win: Plus gros gain
last_played: Dernière partie jouée


Table Login_History (Historique de connexion)

login_id (PK): Identifiant unique de connexion
user_id (FK): Référence vers Users
login_time: Heure de connexion
logout_time: Heure de déconnexion
ip_address: Adresse IP
device_info: Informations sur l'appareil



Cette structure permet de:

Gérer les utilisateurs et leurs soldes
Suivre les sessions de jeu
Enregistrer chaque tour de jeu avec les mises et résultats
Tracer toutes les transactions financières
Compiler des statistiques détaillées par jeu et par utilisateur
Sécuriser les connexions avec un historique