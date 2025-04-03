from random import randint
from machine import Pin, Timer, I2C, ADC
from lcd_api import LcdApi
from pico_i2c_lcd import I2cLcd
import utime


# Configuration GPIO
PINS_TRANSISTORS = [0, 1, 6]
PINS_DECODER = [4, 3, 2, 5]
###################### Configuration de l'I2C pour l'écran LCD ######################
I2C_ADDR = 0x27
I2C_NUM_ROWS = 2
I2C_NUM_COLS = 16
i2c = I2C(
    0, scl=Pin(17), sda=Pin(16), freq=400000
)  # se référer à la datasheet du µC pour connaitre les pin sda et scl != GPIO
lcd = I2cLcd(i2c, I2C_ADDR, I2C_NUM_ROWS, I2C_NUM_COLS)

###################### Configuration des axes X et Y du joystick ######################
x_axis = ADC(Pin(28))
y_axis = ADC(Pin(27))

###################### Configuration du bouton ######################
bouton = Pin(26, Pin.IN, Pin.PULL_UP)

###################### Variables globales ######################
MONTANT = 0


def dec_to_bin(dec: int) -> str:
    """Convertit un nombre décimal en binaire sans le préfixe '0b' et complète à 4 chiffres."""
    binary_str = bin(dec)[2:]  # Convertir en binaire et retirer '0b'
    return "0" * (4 - len(binary_str)) + binary_str  # Ajouter les zéros manquants


def random_number(min_val: int, max_val: int) -> int:
    """Génère un chiffre aléatoire entre [min_val, max_val]."""
    return randint(min_val, max_val)


def calculer_gain(rouleaux: list[int], mise: int) -> int:
    """Calcule le gain en fonction du tirage et du MONTANT misé."""
    r2, r1, r3 = rouleaux
    multiplicateur = 0
    presence_event = False

    if r1 == r2 == r3:
        multiplicateur = 100 if r1 == 7 else 10  # (Méga) Jackpot ou Jackpot
    elif (r1 + 1 == r3 and r2 + 1 == r1) or (r1 - 1 == r3 and r2 - 1 == r1):
        multiplicateur = 5  # Suite
        presence_event = True
    elif r1 == r3 and r1 != r2:
        multiplicateur = 2  # Sandwich
        presence_event = True
    elif r1 % 2 == r2 % 2 == r3 % 2:
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


def update_display(number: int, display_pins: list[int]):
    """
    Met à jour l'afficheur 7 segments avec le nombre donné.
    Entrée : number (int entre 0 et 9), display_pins (liste des GPIOs de l'afficheur)
    """
    binary_str = dec_to_bin(number)
    for i, gpio in enumerate(display_pins):
        Pin(gpio, Pin.OUT).value(int(binary_str[i]))


def debounce(pin):
    utime.sleep_ms(20)
    return pin.value() == 0


def get_joystick_position(somme):
    """Lit la position du joystick et met à jour le MONTANT en conséquence."""
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
        somme += 10
    elif x < x_neutral_min - threshold:  # position gauche
        somme -= 10
    if y > y_neutral_max + threshold * 0.5:  # position bas
        somme -= 50
    elif y < y_neutral_min - threshold:  # position haut
        somme += 50
    update_lcd_montant(somme)
    # Petit délai (0.5s) pour ralentir l'exécution de la boucle
    utime.sleep_ms(5)
    return somme


def update_lcd_montant(somme):
    """Met à jour l'affichage du MONTANT sur l'écran LCD."""
    lcd.clear()
    lcd.move_to(0, 0)
    lcd.putstr(f"somme: {somme}")


def simu_transistor(somme):
    selectionneur = 0
    nums = [0, 0, 0]
    for _ in range(5):  # x chiffres aléatoires
        nums = [random_number(0, 9), random_number(0, 9), random_number(0, 9)]
        for _ in range(25):

            # Activer l'afficheur sélectionné
            afficheur = Pin(PINS_TRANSISTORS[selectionneur], Pin.OUT)
            afficheur.value(1)

            # Mettre à jour l'afficheur avec le numéro correspondant
            update_display(nums[selectionneur], PINS_DECODER)
            utime.sleep_ms(25)

            # Désactiver l'afficheur après la mise à jour
            afficheur.value(0)

            # Passer à l'afficheur suivant
            selectionneur = (selectionneur + 1) % 3
    gain = calculer_gain(nums, somme)
    lcd.clear()
    lcd.move_to(0, 0)
    lcd.putstr(f"{nums[2]}-{nums[0]}-{nums[1]}")
    utime.sleep(2)  # Attendre 2 secondes avant d'afficher le gain
    lcd.putstr(f"\nGain: {gain}")
    while True:

        # Activer l'afficheur sélectionné
        afficheur = Pin(PINS_TRANSISTORS[selectionneur], Pin.OUT)
        afficheur.value(1)

        x = x_axis.read_u16()
        y = y_axis.read_u16()
        print(f"x = {x}, y = {y}")
        if x < 44500 or x > 48500 or y < 47500 or y > 50500:
            lcd.clear()
            lcd.move_to(0, 0)
            break
        # Mettre à jour l'afficheur avec le numéro correspondant
        update_display(nums[selectionneur], PINS_DECODER)
        utime.sleep_ms(5)

        # Désactiver l'afficheur après la mise à jour
        afficheur.value(0)

        # Passer à l'afficheur suivant
        selectionneur = (selectionneur + 1) % 3
    somme += gain
    return somme


def joue_partie(somme):
    # Choisir le MONTANT à parier via le joystick
    somme = get_joystick_position(somme)
    if debounce(bouton) and bouton.value() == 0 and somme > 0:
        somme = simu_transistor(somme)
    else:
        lcd.move_to(0, 1)
        lcd.putstr("Pas de mise")
        lcd.move_to(0, 0)
    return somme


if __name__ == "__main__":
    while True:
        MONTANT = joue_partie(MONTANT)
        utime.sleep_ms(50)
