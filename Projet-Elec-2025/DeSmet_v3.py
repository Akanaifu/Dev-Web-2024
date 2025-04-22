# version avec decodeur, joystick et lcd et firebase
from machine import Pin, Timer, I2C, ADC
import random
import time, sys
from pico_i2c_lcd import I2cLcd  # Assurez-vous d'avoir installé cette bibliothèque
import urequests  # Pour envoyer des requêtes HTTP à Firebase
from id_counter import increment_counter  # Import the counter function

# Configuration de l'écran LCD
I2C_ADDR = (
    0x27  # Adresse I2C de l'écran LCD (vérifiez avec un scanner I2C si nécessaire)
)
i2c = I2C(
    0, scl=Pin(17), sda=Pin(16)
)  # Initialisation de l'I2C sur GPIO 16 (SCL) et GPIO 17 (SDA)
lcd = I2cLcd(i2c, I2C_ADDR, 2, 16)  # Écran LCD 2 lignes, 16 colonnes

########## Variables globales ##########
NUMBER_TO_GENERATE = 15  # nombres à générer
GENERATED_COUNT = 0  # Compteur pour suivre combien de chiffres ont été générés
RANDOM_TIMER = Timer()  # Timer pour générer les chiffres successivement
CURRENT_DIGIT = 0
NUMBER_OF_DIGITS = 3
digits = [1, 2, 3]
SCORE = 0  # Variable pour stocker le SCORE
BET_AMOUNT = 10  # Somme initiale pariée
FREQ_AFFICHEUR = NUMBER_OF_DIGITS * 100
RUN_CODE = False

# Pins for binary output to the decoder (3, 4, 5, 6)
binary_pins = [3, 4, 5, 6]
gpio_pins = [Pin(i, Pin.OUT) for i in binary_pins]

# Pins for display selection (transistors)
display_select_pins = [Pin(i, Pin.OUT) for i in range(0, 3)]  # GPIO 0, 1, 2

# bouton pour lancer l'affichage
button_pin = Pin(11, Pin.IN, Pin.PULL_UP)
BUTTON_PRESSED = False

###################### Configuration des axes X et Y du joystick ######################
x_axis = ADC(Pin(28))
y_axis = ADC(Pin(27))


###################### Firebase  ######################
PARTIE_COUNT = 0  # Compteur d’identifiants personnalisés
COMBINAISONS = []  # Liste de toutes les combinaisons générées


########### Fonctions ##########


def digits_to_binary(value):
    """
    Convert a value (0-9) to its binary representation as a list of bits.
    """
    # Ensure value is within 4-bit range (0-15)
    value = value & 0xF  # Mask to 4-bit
    # Return the binary representation as a list of bits
    return [(value >> i) & 1 for i in range(4)][::-1]


def send_binary_to_decoder(value):
    """
    Send a binary representation of the value (0-9) to the decoder via pins 3, 4, 5, 6.
    """
    global gpio_pins
    # Get binary representation using digits_to_binary
    binary_representation = digits_to_binary(value)
    # Write each bit to the corresponding pin
    for i, pin in enumerate(gpio_pins):
        # Set the pin to the corresponding bit value (0 or 1)
        pin.value(binary_representation[i])


def select_display(value):
    """
    Activate the appropriate display by setting the corresponding transistor pins.
    """
    global display_select_pins
    # Ensure value is within 3-bit range
    value = value & 0xFF  # Mask to 3-bit
    # Write each bit to the corresponding pin
    for i in range(NUMBER_OF_DIGITS):
        display_select_pins[i].value((value >> i) & 1)


def write_displays(timer):
    """
    Update the displays by sending the current digit to the decoder and activating the corresponding display.
    """
    global CURRENT_DIGIT, CURRENT_DIGIT, digits, NUMBER_OF_DIGITS

    # Disable all displays first
    select_display(0)
    # Send the current digit to the decoder
    send_binary_to_decoder(digits[CURRENT_DIGIT])
    # Enable the current display
    select_display(1 << CURRENT_DIGIT)
    # Move to the next digit
    CURRENT_DIGIT += 1
    if CURRENT_DIGIT == NUMBER_OF_DIGITS:
        CURRENT_DIGIT = 0


def number_to_digits(number):
    """
    Convert a number to an array of its digits.
    """
    # Convert number to string, extract digits and convert back to integers
    digits = [int(digit) for digit in str(number)]
    # Return the array of digits (as integers)
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
        COMBINAISONS.append(digits[:])  # copie pour éviter les effets de bord
        GENERATED_COUNT += 1

    else:
        RANDOM_TIMER.deinit()
        SCORE = calculer_gain(digits, BET_AMOUNT)
        generation_id = (
            f"partie{increment_counter()}"  # Use increment_counter for unique ID
        )
        send_to_firebase(COMBINAISONS, SCORE, generation_id)
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


def button_callback(pin):
    """
    Callback function triggered when the button is pressed.
    """
    global BUTTON_PRESSED
    BUTTON_PRESSED = True


def send_to_firebase(combinaisons, score, generation_id):
    firebase_url = "https://machine-a-sous-default-rtdb.firebaseio.com/parties.json"
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
            RANDOM_TIMER.init(period=250, mode=Timer.PERIODIC, callback=generate_random)
        time.sleep(0.1)  # Petite pause pour éviter une utilisation excessive du CPU
    except KeyboardInterrupt:
        print("Goodbye")
        lcd.clear()
        lcd.putstr("Goodbye")  # Affiche un message d'adieu sur l'écran LCD
        time.sleep(0.01)
        timer1.deinit()
        RANDOM_TIMER.deinit()
        sys.exit()
