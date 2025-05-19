from machine import Pin, Timer, I2C, ADC
import random
import time, sys
from pico_i2c_lcd import I2cLcd  # Make sure you have installed this library
import urequests
from connexion_wifi import connect_to_wifi
from led import start_led_blinking, stop_led_blinking
from firebase import update_first_unplayed_game, fetch_from_firebase

########## LCD SCREEN CONFIGURATION ##########
I2C_ADDR = (
    0x27  # Adresse I2C de l'écran LCD (vérifiez avec un scanner I2C si nécessaire)
)
i2c = I2C(
    0, scl=Pin(17), sda=Pin(16)
)  # Initialisation de l'I2C sur GPIO 16 (SCL) et GPIO 17 (SDA)
lcd = I2cLcd(i2c, I2C_ADDR, 2, 16)  # Écran LCD 2 lignes, 16 colonnes

########## Global variables ##########
NUM_DIGITS = 3  # Nombre de chiffres à afficher
NUMBERS_TO_GENERATE = random.randint(5, 15)  # Nombres à générer
numbers_generated_count = 0  # Compteur pour suivre combien de chiffres ont été générés
random_timer = Timer()  # Timer pour générer les chiffres successivement
score = 0  # Variable pour stocker le SCORE
bet_amount = 10  # Somme initiale pariée
DISPLAY_FREQ = NUM_DIGITS * 100
run_code = False
current_digit = 0
NUM_DIGITS = 3
digits = [7, 7, 7]
user_balance = 0  # Solde du joueur, à récupérer depuis Firebase

########## Button to start display ##########
button_pin = Pin(11, Pin.IN, Pin.PULL_UP)
button_pressed = False

pins = [3, 4, 5, 6, 7, 9, 8, 10]  # a, b, c, d, e, f, g, pt
segments_pins = [Pin(i, Pin.OUT) for i in pins]  # GPIO 3 à 10
display_select_pins = [Pin(i, Pin.OUT) for i in range(0, 3)]  # GPIO 0, 1, 2

###################### Configuration des axes X et Y du joystick ######################
x_axis = ADC(Pin(28))
y_axis = ADC(Pin(27))

###################### Firebase  ######################
game_count = 0  # Compteur d’identifiants personnalisés
combinations = []  # Liste de toutes les combinaisons générées
FIREBASE_URL = "https://machine-a-sous-default-rtdb.europe-west1.firebasedatabase.app"


def button_callback(pin):
    """
    Fonction de rappel déclenchée lors de l'appui sur le bouton.
    """
    global button_pressed
    button_pressed = True


def display_segments(value):
    """
    Affiche la valeur donnée sur les segments du 7 segments.
    """
    global segments_pins
    value = value & 0xFF  # Masque sur 8 bits
    for i in range(8):
        segments_pins[i].value((value >> i) & 1)


def select_display(value):
    """
    Sélectionne l'afficheur à activer selon la valeur donnée.
    """
    global display_select_pins
    value = value & 0xFF  # Masque sur 8 bits
    for i in range(NUM_DIGITS):
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
    """
    Retourne le code binaire du chiffre à afficher sur le 7 segments.
    """
    global SEGMENT_MAP
    return SEGMENT_MAP[digit]


def write_displays(timer):
    """
    Affiche cycliquement chaque chiffre sur l'afficheur 7 segments.
    """
    global current_digit, digits

    select_display(0)
    display_segments(number_to_7segment(digits[current_digit]))
    select_display(1 << current_digit)
    current_digit += 1
    if current_digit == NUM_DIGITS:
        current_digit = 0


def number_to_digits(number):
    """
    Convertit un nombre en liste de chiffres pour l'affichage.
    """
    global digits
    digits = [int(digit) for digit in str(number)]
    return digits


def generate_random(timer):
    """
    Fonction appelée par le timer pour générer un chiffre aléatoire.
    """
    global digits, numbers_generated_count, random_timer, score, run_code, combinations, NUMBERS_TO_GENERATE, bet_amount

    if numbers_generated_count < NUMBERS_TO_GENERATE:
        random_num = random.randrange(10 ** (NUM_DIGITS - 1), 10**NUM_DIGITS)
        digits = number_to_digits(random_num)
        print(f"Generated digits: {digits}")  # Affiche les chiffres générés
        combinations.append(digits[:])  # copie pour éviter les effets de bord
        numbers_generated_count += 1

    else:
        random_timer.deinit()
        stop_led_blinking()  # Arrête le clignotement des LEDs
        score = calculate_gain(digits, bet_amount)
        updated_data = {
            "gain": score,
            "combinaison": combinations,
            "partieJouee": True,
            "timestamp": time.time(),
            "mise": bet_amount,
            "partieAffichee": False,
        }
        update_first_unplayed_game(updated_data)
        numbers_generated_count = 0
        combinations.clear()  # Réinitialiser pour la prochaine partie
        run_code = False


def calculate_gain(reels: list[int], bet: int) -> int:
    """Calcule le gain en fonction du tirage et du montant misé."""
    r2, r1, r3 = reels
    multiplier = 0
    event_present = False

    if r1 == r2 == r3:
        return 100 if r1 == 7 else 10  # (Méga) Jackpot ou Jackpot
    if (r1 + 1 == r3 and r2 + 1 == r1) or (r1 - 1 == r3 and r2 - 1 == r1):
        multiplier = 5  # Suite
        event_present = True
    elif r1 == r3 and r1 != r2:
        multiplier = 2  # Sandwich
        event_present = True
    if r1 % 2 == r2 % 2 == r3 % 2:
        multiplier = 1.5  # Pair/Impair
        event_present = True

    count_7 = reels.count(7)
    multiplier += count_7 * 0.5
    if not event_present:
        if count_7 == 1:
            multiplier = 0.5  # Perdre 50% de sa somme
        elif count_7 == 2:
            multiplier = 1  # Récupérer sa mise

    gain = int(bet * multiplier)
    return gain


def get_balance_from_firebase():
    global user_balance
    try:
        data = fetch_from_firebase()
        print("Données récupérées de Firebase:", data)
        if data:
            # Chercher la partie avec le plus grand timestamp
            last_key = max(data, key=lambda k: data[k].get("timestamp", 0))
            game = data[last_key]
            if "solde" in game:
                user_balance = float(game["solde"])
            else:
                user_balance = 0
        else:
            user_balance = 0
    except Exception as e:
        print("Erreur lors de la récupération du solde:", e)
        user_balance = 0


def update_bet_amount():
    global bet_amount, lcd, user_balance

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
        bet_amount += 10
    elif x < x_neutral_min - threshold:  # position gauche
        bet_amount -= 10
    if y > y_neutral_max + threshold * 0.5:  # position bas
        bet_amount -= 50
    elif y < y_neutral_min - threshold:  # position haut
        bet_amount += 50

    # Limiter la mise au solde
    if bet_amount > user_balance:
        bet_amount = user_balance
    if bet_amount < 0:
        bet_amount = 0

    # Mettre à jour l'écran LCD
    lcd.clear()
    lcd.putstr(f"Bet: {bet_amount} EUR")


# Attache l'interruption au bouton
button_pin.irq(trigger=Pin.IRQ_FALLING, handler=button_callback)
timer1 = Timer()
timer1.init(freq=DISPLAY_FREQ, mode=Timer.PERIODIC, callback=write_displays)
connect_to_wifi()  # Connexion au Wi-Fi
get_balance_from_firebase()  # Récupère le solde avant la boucle principale
while 1:
    try:
        if not run_code:
            update_bet_amount()  # Met à jour la somme pariée avec le joystick
        if button_pressed:
            run_code = True  # bloque l'affichage de la mise
            button_pressed = False  # Réinitialise le flag
            numbers_generated_count = 0  # Réinitialise le compteur
            NUMBERS_TO_GENERATE = random.randint(5, 15)
            print(NUMBERS_TO_GENERATE)
            lcd.clear()
            lcd.putstr("Generating...")  # Affiche un message sur l'écran LCD
            start_led_blinking()  # Démarre le clignotement des LEDs
            random_timer.init(period=500, mode=Timer.PERIODIC, callback=generate_random)
        time.sleep(0.1)  # Petite pause pour éviter une utilisation excessive du CPU
    except KeyboardInterrupt:
        print("Goodbye")
        lcd.clear()
        lcd.putstr("Goodbye")  # Affiche un message d'adieu sur l'écran LCD
        time.sleep(0.01)
        timer1.deinit()
        random_timer.deinit()
        sys.exit()
