import urequests
import time
from id_counter import increment_counter
import random

NUMBER_TO_GENERATE = 15  # nombres à générer
DIGITS = [1, 2, 3]
PARTIE_COUNT = 0  # Compteur d’identifiants personnalisés
COMBINAISONS = {}  # Liste de toutes les combinaisons générées
NUMBER_OF_DIGITS = 3
BET_AMOUNT = 10


def send_to_firebase(combinaisons, score, generation_id):
    firebase_url = "https://console.firebase.google.com/project/machine-a-sous/database/machine-a-sous-default-rtdb/data/~2F?hl=fr"
    data = {
        "id": generation_id,
        "timestamp": time.time(),
        "combinaisons": combinaisons,
        "score": score,
    }
    try:
        response = urequests.post(firebase_url, json=data)
        print("Envoyé à Firebase:", response.text)
        response.close()
    except Exception as e:
        print("Erreur Firebase:", e)
        raise


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


def number_to_DIGITS(number):
    """
    Convert a number to an array of its DIGITS.
    """
    # Convert number to string, extract DIGITS and convert back to integers
    DIGITS = [int(digit) for digit in str(number)]
    # Return the array of DIGITS (as integers)
    return DIGITS


def generate_random():
    """
    Fonction appelée par le timer pour générer un chiffre aléatoire.
    """
    global DIGITS, SCORE, RUN_CODE, COMBINAISONS
    for GENERATED_COUNT in range(NUMBER_TO_GENERATE):
        random_num = random.randrange(
            10 ** (NUMBER_OF_DIGITS - 1), 10**NUMBER_OF_DIGITS
        )
        DIGITS = number_to_DIGITS(random_num)

        # Mettre à jour COMBINAISONS avec le bon format
        COMBINAISONS[GENERATED_COUNT] = {i: DIGITS[i] for i in range(len(DIGITS))}

        GENERATED_COUNT += 1

    SCORE = calculer_gain(DIGITS, BET_AMOUNT)
    generation_id = (
        f"partie{increment_counter()}"  # Use increment_counter for unique ID
    )
    send_to_firebase(COMBINAISONS, SCORE, generation_id)
    GENERATED_COUNT = 0
    COMBINAISONS.clear()  # Réinitialiser pour la prochaine partie
    RUN_CODE = False
    return 0  # Indiquer que la fonction s'est terminée avec succès


generate_random()
