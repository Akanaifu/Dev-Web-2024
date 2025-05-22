from machine import Pin, Timer, I2C, ADC
import random
import time, sys
from pico_i2c_lcd import I2cLcd
from connexion_wifi import connect_to_wifi
from led import start_led_blinking, stop_led_blinking
from firebase import (
    update_first_unplayed_game,
    fetch_from_firebase,
    get_balance_from_firebase,
    calculer_gain,
)
from sept_seg import SevenSegmentDisplay
from joystick import update_bet_amount
from buzzer import play_slot_machine_sound, SlotMachineSoundPlayer

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
NUMBER_GENERATED_COUNT = 0  # Compteur pour suivre combien de chiffres ont été générés
random_timer = Timer()  # Timer pour générer les chiffres successivement
SCORE = 0  # Variable pour stocker le SCORE
BET_AMOUNT = 10  # Somme initiale pariée
DISPLAY_FREQ = NUM_DIGITS * 100
RUN_CODE = False
CURRENT_DIGIT = 0
digits = [7, 7, 7]
USER_BALANCE = 0  # Solde du joueur, à récupérer depuis Firebase

########## Button to start display ##########
button_pin = Pin(11, Pin.IN, Pin.PULL_UP)
BUTTON_PRESSED = False

SEGMENTS_PINS = [3, 4, 5, 6, 7, 9, 8, 10]  # a, b, c, d, e, f, g, pt
DISPLAY_SELECT_PINS = [0, 1, 2]  # GPIO 0, 1, 2
seven_segment = SevenSegmentDisplay(SEGMENTS_PINS, DISPLAY_SELECT_PINS, NUM_DIGITS)

###################### Configuration des axes X et Y du joystick ######################
x_axis = ADC(Pin(28))
y_axis = ADC(Pin(27))

###################### Firebase  ######################
GAME_COUNT = 0  # Compteur d’identifiants personnalisés
combinations = []  # Liste de toutes les combinaisons générées
FIREBASE_URL = "https://machine-a-sous-default-rtdb.europe-west1.firebasedatabase.app"

buzzer_timer = Timer(-1)  # Timer dédié à la musique
slot_sound = SlotMachineSoundPlayer()  # Instanciation du SlotMachineSoundPlayer


def buzzer_timer_callback(timer):
    play_slot_machine_sound()


def button_callback(pin):
    """
    Fonction de rappel déclenchée lors de l'appui sur le bouton.
    """
    global BUTTON_PRESSED
    BUTTON_PRESSED = True


def write_displays(timer):
    """
    Affiche cycliquement chaque chiffre sur l'afficheur 7 segments.
    """
    seven_segment.write_displays(timer)


def generate_random(timer):
    """
    Fonction appelée par le timer pour générer un chiffre aléatoire.
    """
    global digits, NUMBER_GENERATED_COUNT, random_timer, SCORE, RUN_CODE, combinations, NUMBERS_TO_GENERATE, BET_AMOUNT, buzzer_timer, slot_sound

    if NUMBER_GENERATED_COUNT < NUMBERS_TO_GENERATE:
        random_num = random.randrange(10 ** (NUM_DIGITS - 1), 10**NUM_DIGITS)
        digits = seven_segment.number_to_digits(random_num)
        print(f"Generated digits: {digits}")  # Affiche les chiffres générés
        combinations.append(digits[:])  # copie pour éviter les effets de bord
        NUMBER_GENERATED_COUNT += 1

    else:
        random_timer.deinit()
        buzzer_timer.deinit()  # Arrête la musique
        slot_sound.stop()  # Arrête le son slot machine
        stop_led_blinking()  # Arrête le clignotement des LEDs
        SCORE = calculer_gain(digits, BET_AMOUNT)
        updated_data = {
            "gain": SCORE,
            "combinaison": combinations,
            "partieJouee": True,
            "timestamp": time.time(),
            "mise": BET_AMOUNT,
            "partieAffichee": False,
        }
        update_first_unplayed_game(updated_data)
        NUMBER_GENERATED_COUNT = 0
        combinations.clear()  # Réinitialiser pour la prochaine partie
        RUN_CODE = False


# Attache l'interruption au bouton
button_pin.irq(trigger=Pin.IRQ_FALLING, handler=button_callback)
timer1 = Timer()
timer1.init(freq=DISPLAY_FREQ, mode=Timer.PERIODIC, callback=write_displays)
connect_to_wifi()  # Connexion au Wi-Fi
USER_BALANCE = get_balance_from_firebase(
    fetch_from_firebase, USER_BALANCE
)  # Récupère le solde avant la boucle principale
while 1:
    try:
        if USER_BALANCE < 0:
            lcd.clear()
            lcd.putstr("No money or game")
            time.sleep(2)
            raise KeyboardInterrupt
        if not RUN_CODE:
            BET_AMOUNT = update_bet_amount(
                x_axis, y_axis, lcd, BET_AMOUNT, USER_BALANCE
            )  # Met à jour la somme pariée avec le joystick
        if BUTTON_PRESSED:
            RUN_CODE = True  # bloque l'affichage de la mise
            BUTTON_PRESSED = False  # Réinitialise le flag
            NUMBER_GENERATED_COUNT = 0  # Réinitialise le compteur
            NUMBERS_TO_GENERATE = random.randint(5, 15)
            print(NUMBERS_TO_GENERATE)
            lcd.clear()
            lcd.putstr("Generating...")  # Affiche un message sur l'écran LCD
            start_led_blinking()  # Démarre le clignotement des LEDs
            slot_sound.start()  # Lance la musique slot machine non bloquante
            random_timer.init(period=500, mode=Timer.PERIODIC, callback=generate_random)
            USER_BALANCE = get_balance_from_firebase(
                fetch_from_firebase, USER_BALANCE
            )  # Récupère le solde avant la boucle principale
        slot_sound.tick()  # Appelle tick à chaque boucle pour jouer la musique
        time.sleep(0.1)  # Petite pause pour éviter une utilisation excessive du CPU
    except KeyboardInterrupt:
        print("Goodbye")
        lcd.clear()
        lcd.putstr("Goodbye")  # Affiche un message d'adieu sur l'écran LCD
        time.sleep(0.01)
        timer1.deinit()
        random_timer.deinit()
        sys.exit()
