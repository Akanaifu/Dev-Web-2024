import sqlite3

# Chemin absolu de la base de données
DATABASE = "C:/Users/Arthur/Desktop/github/Dev-Web-2024/db/casino.db"

# Fonction pour se connecter à la base et exécuter une requête
def interroger_db():
    try:
        # Connexion à la base de données
        conn = sqlite3.connect(DATABASE)
        # Permet de récupérer les résultats sous forme de dictionnaires (optionnel)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        # Exemple de requête : récupérer toutes les lignes d'une table (à adapter)
        requete = "SELECT * FROM Utilisateurs"  # Remplacez 'votre_table' par le nom de votre table
        cursor.execute(requete)

        # Récupération des résultats
        resultats = cursor.fetchall()

        # Affichage des résultats
        for ligne in resultats:
            print(dict(ligne))  # Convertit chaque ligne en dictionnaire pour plus de clarté

    except sqlite3.Error as erreur:
        print(f"Erreur lors de l'interrogation de la DB : {erreur}")
    finally:
        # Fermeture de la connexion
        if conn:
            conn.close()

if __name__ == "__main__":
    interroger_db()
