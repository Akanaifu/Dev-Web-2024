"""
Module pour gérer les interactions avec Firebase.
Il inclut des fonctions pour générer des nombres aléatoires, calculer les gains
mettre à jour la base de données Firebase et récupérer les données.
"""

import time
import random
import urequests
from connexion_wifi import connect_to_wifi

NUMBER_TO_GENERATE = 15  # nombres à générer
DIGITS = [1, 2, 3]
PARTIE_COUNT = 0  # Compteur d’identifiants personnalisés
COMBINAISONS = {}  # Liste de toutes les combinaisons générées
NUMBER_OF_DIGITS = 3
BET_AMOUNT = 10
URL_FIREBASE = "https://machine-a-sous-default-rtdb.europe-west1.firebasedatabase.app"


def update_first_unplayed_game(updated_data):
    """
    Met à jour le premier élément de la base de données Firebase où 'partieJouee' est False.
    """
    response = None
    try:
        # Récupérer toutes les données de Firebase
        data = fetch_from_firebase()
        print("Données récupérées depuis Firebase :", data)
        key_data = sorted(data.keys(), key=lambda key: int(key.replace("MA", "")))
        if data is None:
            print("Aucune donnée récupérée depuis Firebase.")
            return
        # Trouver la première partie où 'partieJouee' est False
        for key in key_data:
            value = data[key]
            if not value.get(
                "partieJouee", True
            ):  # Par défaut, considère True si la clé est absente
                # Construire l'URL pour mettre à jour cet élément spécifique
                firebase_url = f"{URL_FIREBASE}/{key}.json"
                # Envoyer les données mises à jour
                response = urequests.patch(firebase_url, json=updated_data)

                # Vérifier manuellement le code de statut HTTP
                if response.status_code != 200:
                    raise RuntimeError(f"Erreur HTTP : {response.status_code}")

                print(f"Données mises à jour pour la partie {key}")
                response.close()
                return  # Arrêter après avoir mis à jour le premier élément

        print("Aucune partie non jouée trouvée.")
    except OSError as e:
        print("Erreur réseau ou problème de connexion :", e)
    except ValueError as e:
        print("Erreur lors de la conversion JSON :", e)
    except RuntimeError as e:
        print("Erreur HTTP :", e)
    finally:
        if response:
            try:
                response.close()
            except AttributeError:
                pass


def calculer_gain(rouleaux: list[int], mise: int) -> int:
    """Calcule le gain en fonction du tirage et du MONTANT misé."""
    r2, r1, r3 = rouleaux
    multiplicateur = 0
    presence_event = False

    if r1 == r2 == r3:
        return 100 if r1 == 7 else 10  # (Méga) Jackpot ou Jackpot
    if (r1 + 1 == r3 and r2 + 1 == r1) or (r1 - 1 == r3 and r2 - 1 == r1):
        multiplicateur = 5  # Suite
        presence_event = True
    elif r1 == r3 and r1 != r2:
        multiplicateur = 2  # Sandwich
        presence_event = True
    if r1 % 2 == r2 % 2 == r3 % 2:
        multiplicateur = 1.5  # Pair/Impair
        presence_event = True

    count_7 = rouleaux.count(7)
    multiplicateur += count_7 * 0.5
    if not presence_event:
        if count_7 == 1:
            multiplicateur = 0.5  # Perdre 50% de sa somme
        elif count_7 == 2:
            multiplicateur = 1  # Récupérer sa mise

    gain = int(mise * multiplicateur)
    return gain


def number_to_digits(number):
    """
    Convertit un nombre en tableau de ses chiffres.
    """
    # Convert number to string, extract DIGITS and convert back to integers
    list_digits = [int(digit) for digit in str(number)]
    # Return the array of DIGITS (as integers)
    return list_digits


def generate_random():
    """
    Fonction appelée par le timer pour générer un chiffre aléatoire.
    """
    global DIGITS, SCORE, RUN_CODE, COMBINAISONS
    for generated_count in range(NUMBER_TO_GENERATE):
        random_num = random.randrange(
            10 ** (NUMBER_OF_DIGITS - 1), 10**NUMBER_OF_DIGITS
        )
        DIGITS = number_to_digits(random_num)

        # Mettre à jour COMBINAISONS avec le bon format
        COMBINAISONS[generated_count] = {i: DIGITS[i] for i in range(len(DIGITS))}

        generated_count += 1

    SCORE = calculer_gain(DIGITS, BET_AMOUNT)

    updated_data = {
        "gain": SCORE,
        "combinaison": COMBINAISONS,
        "partieJouee": True,
        "timestamp": time.time(),
        "mise": BET_AMOUNT,
        "partieAffichee": False,
    }
    update_first_unplayed_game(updated_data)
    generated_count = 0
    COMBINAISONS.clear()  # Réinitialiser pour la prochaine partie
    RUN_CODE = False
    return 0  # Indiquer que la fonction s'est terminée avec succès


def fetch_from_firebase():
    """
    Récupère les données de la base de données Firebase.
    """
    response = None
    try:
        headers = {"Content-Type": "application/json", "Accept": "application/json"}
        response = urequests.get(f"{URL_FIREBASE}/.json", headers=headers, timeout=5)
        if response.status_code != 200:
            raise RuntimeError(f"Erreur HTTP : {response.status_code}")
        print(response)
        data = response.json()
        print("Données récupérées depuis Firebase")
        return data
    except OSError as e:
        print("Erreur réseau ou problème de connexion :", e)
    except ValueError as e:
        print("Erreur lors de la conversion JSON :", e)
    except RuntimeError as e:
        print("Erreur HTTP :", e)
    finally:
        if response:
            try:
                response.close()
            except AttributeError:
                pass
    return None


def get_balance_from_firebase(fetch_from_firebase_func, user_balance):
    try:
        data = fetch_from_firebase_func()
        print("Données récupérées de Firebase:", data)
        if data:
            last_key = max(data, key=lambda k: int(k.replace("MA", "")))
            game = data[last_key]
            if "solde" in game and not game["partieJouee"]:
                user_balance = float(game["solde"])
            else:
                user_balance = -1
        else:
            user_balance = -1
    except Exception as e:
        print("Erreur lors de la récupération du solde:", e)
        user_balance = -1
    return user_balance


if __name__ == "__main__":
    # Exemple d'utilisation
    connect_to_wifi()
    # generate_random()
    # fetch_from_firebase()  # Uncomment to fetch data from Firebase
