from machine import Pin, Timer, I2C, ADC
import random
import time, sys
from pico_i2c_lcd import I2cLcd  # Assurez-vous d'avoir installé cette bibliothèque
import urequests
from connexion_wifi import connect_to_wifi

########## Configuration de l'écran LCD ##########
I2C_ADDR = (
    0x27  # Adresse I2C de l'écran LCD (vérifiez avec un scanner I2C si nécessaire)
)
i2c = I2C(
    0, scl=Pin(17), sda=Pin(16)
)  # Initialisation de l'I2C sur GPIO 16 (SCL) et GPIO 17 (SDA)
lcd = I2cLcd(i2c, I2C_ADDR, 2, 16)  # Écran LCD 2 lignes, 16 colonnes

########## Variables globales ##########
NUMBER_OF_DIGITS = 3  # Nombre de chiffres à afficher
NUMBER_TO_GENERATE = random.randint(5, 15)  # nombres à générer
GENERATED_COUNT = 0  # Compteur pour suivre combien de chiffres ont été générés
RANDOM_TIMER = Timer()  # Timer pour générer les chiffres successivement
SCORE = 0  # Variable pour stocker le SCORE
BET_AMOUNT = 10  # Somme initiale pariée
FREQ_AFFICHEUR = NUMBER_OF_DIGITS * 100
RUN_CODE = False
CURRENT_DIGIT = 0
NUMBER_OF_DIGITS = 3
digits = [7, 7, 7]

########## bouton pour lancer l'affichage ##########
button_pin = Pin(11, Pin.IN, Pin.PULL_UP)
BUTTON_PRESSED = False

pins = [3, 4, 5, 6, 7, 9, 8, 10]  # a, b, c, d, e, f, g, pt
segments_pins = [Pin(i, Pin.OUT) for i in pins]  # GPIO 3 à 10
display_select_pins = [Pin(i, Pin.OUT) for i in range(0, 3)]  # GPIO 0, 1, 2


###################### Configuration des axes X et Y du joystick ######################
x_axis = ADC(Pin(28))
y_axis = ADC(Pin(27))

###################### Firebase  ######################
PARTIE_COUNT = 0  # Compteur d’identifiants personnalisés
COMBINAISONS = []  # Liste de toutes les combinaisons générées
URL_FIREBASE = "https://machine-a-sous-default-rtdb.europe-west1.firebasedatabase.app"


def button_callback(pin):
    """
    Callback function triggered when the button is pressed.
    """
    global BUTTON_PRESSED
    BUTTON_PRESSED = True


def display_segments(value):
    global segments_pins
    value = value & 0xFF  # Mask to 8-bit
    for i in range(8):
        segments_pins[i].value((value >> i) & 1)


def select_display(value):
    global display_select_pins
    value = value & 0xFF  # Mask to 8-bit
    for i in range(NUMBER_OF_DIGITS):
        display_select_pins[i].value((value >> i) & 1)


SEGMENT_MAP = [
    0b0111111,
    0b0000110,
    0b1011011,
    0b1001111,
    0b1100110,
    0b1101101,
    0b1111101,
    0b0000111,
    0b1111111,
    0b1101111,
]


def number_to_7segment(digit):
    global SEGMENT_MAP
    return SEGMENT_MAP[digit]


def write_displays(timer):
    global CURRENT_DIGIT, digits

    select_display(0)
    display_segments(number_to_7segment(digits[CURRENT_DIGIT]))
    select_display(1 << CURRENT_DIGIT)
    CURRENT_DIGIT += 1
    if CURRENT_DIGIT == NUMBER_OF_DIGITS:
        CURRENT_DIGIT = 0


def number_to_digits(number):
    global digits
    digits = [int(digit) for digit in str(number)]
    return digits


def generate_random(timer):
    """
    Fonction appelée par le timer pour générer un chiffre aléatoire.
    """
    global digits, GENERATED_COUNT, RANDOM_TIMER, SCORE, RUN_CODE, COMBINAISONS

    if GENERATED_COUNT < NUMBER_TO_GENERATE:
        random_num = random.randrange(
            10 ** (NUMBER_OF_DIGITS - 1), 10**NUMBER_OF_DIGITS
        )
        digits = number_to_digits(random_num)
        print(f"Generated digits: {digits}")  # Affiche les chiffres générés
        COMBINAISONS.append(digits[:])  # copie pour éviter les effets de bord
        GENERATED_COUNT += 1

    else:
        RANDOM_TIMER.deinit()
        SCORE = calculer_gain(digits, BET_AMOUNT)
        updated_data = {
            "gain": SCORE,
            "combinaison": COMBINAISONS,
            "partieJouee": True,
            "timestamp": time.time(),
            "mise": BET_AMOUNT,
        }
        update_first_unplayed_game(updated_data)
        GENERATED_COUNT = 0
        COMBINAISONS.clear()  # Réinitialiser pour la prochaine partie
        RUN_CODE = False


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


def update_bet_amount():
    global BET_AMOUNT, lcd

    x = x_axis.read_u16()  # Lire la valeur analogique de l'axe X (416 - 65535)
    y = y_axis.read_u16()  # Lire la valeur analogique de l'axe Y (432 - 65535)

    # Calcul des seuils pour les positions gauche, droite, haut et bas
    x_neutral_min = 45000
    x_neutral_max = 48000
    y_neutral_min = 48000
    y_neutral_max = 50000
    threshold = 65535 / 4

    # Zone morte pour réduire la sensibilité du joystick
    if x_neutral_min < x < x_neutral_max and y_neutral_min < y < y_neutral_max:
        # Dans la zone morte, ne rien faire
        pass

    if x > x_neutral_max + threshold:  # position droite
        BET_AMOUNT += 10
    elif x < x_neutral_min - threshold:  # position gauche
        BET_AMOUNT -= 10
    if y > y_neutral_max + threshold * 0.5:  # position bas
        BET_AMOUNT -= 50
    elif y < y_neutral_min - threshold:  # position haut
        BET_AMOUNT += 50

    # Mettre à jour l'écran LCD
    lcd.clear()
    lcd.putstr(f"Bet: {BET_AMOUNT} EUR")


def update_first_unplayed_game(updated_data):
    """
    Met à jour le premier élément de la base de données Firebase où 'partieJouee' est False.
    """
    response = None
    try:
        # Récupérer toutes les données de Firebase
        response = urequests.get(URL_FIREBASE, timeout=10)  # Timeout de 10 secondes
        if response.status_code != 200:
            raise RuntimeError(f"Erreur HTTP : {response.status_code}")
        data = response.json()  # Convertit la réponse JSON en dictionnaire Python
        response.close()

        # Trouver la première partie où 'partieJouee' est False
        for key, value in data.items():
            if not value.get(
                "partieJouee", True
            ):  # Par défaut, considère True si la clé est absente
                # Construire l'URL pour mettre à jour cet élément spécifique
                firebase_url = f"{URL_FIREBASE}/{key}.json"
                # Envoyer les données mises à jour
                response = urequests.patch(firebase_url, json=updated_data)
                if response.status_code != 200:
                    raise RuntimeError(f"Erreur HTTP : {response.status_code}")
                print(f"Données mises à jour pour la partie {key} :", response.text)
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


# Attache l'interruption au bouton
button_pin.irq(trigger=Pin.IRQ_FALLING, handler=button_callback)
timer1 = Timer()
timer1.init(freq=FREQ_AFFICHEUR, mode=Timer.PERIODIC, callback=write_displays)
while 1:
    try:
        if not RUN_CODE:
            update_bet_amount()  # Met à jour la somme pariée avec le joystick
        if BUTTON_PRESSED:
            RUN_CODE = True  # bloque l'affichage de la mise
            BUTTON_PRESSED = False  # Réinitialise le flag
            GENERATED_COUNT = 0  # Réinitialise le compteur
            NUMBER_TO_GENERATE = random.randint(5, 15)
            print(NUMBER_TO_GENERATE)
            lcd.clear()
            lcd.putstr("Generating...")  # Affiche un message sur l'écran LCD
            RANDOM_TIMER.init(period=500, mode=Timer.PERIODIC, callback=generate_random)
        time.sleep(0.1)  # Petite pause pour éviter une utilisation excessive du CPU
    except KeyboardInterrupt:
        print("Goodbye")
        lcd.clear()
        lcd.putstr("Goodbye")  # Affiche un message d'adieu sur l'écran LCD
        time.sleep(0.01)
        timer1.deinit()
        RANDOM_TIMER.deinit()
        sys.exit()
