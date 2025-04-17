from machine import Pin, Timer, I2C
from pico_i2c_lcd import I2cLcd  # Assurez-vous d'avoir installé cette bibliothèque
import random
import time, sys

########## Configuration matérielle ##########
# Activation des composants
Pin(28, Pin.OUT).value(1)  # Allumer décodeur
Pin(27, Pin.OUT).value(1)  # Allumer LT
Pin(26, Pin.OUT).value(1)  # Allumer BL
Pin(22, Pin.OUT).value(1)  # Allumer STR
Pin(8, Pin.OUT).value(1)  # Allumer écran LCD
Pin(9, Pin.OUT).value(1)  # Allumer joystick et ADS1115

# Configuration de l'écran LCD
ADRESSE_I2C = (
    0x27  # Adresse I2C de l'écran LCD (vérifiez avec un scanner I2C si nécessaire)
)
i2c = I2C(
    1, scl=Pin(7), sda=Pin(6)
)  # Initialisation de l'I2C sur GPIO 7 (SCL) et GPIO 6 (SDA)
ecran_lcd = I2cLcd(i2c, ADRESSE_I2C, 2, 16)  # Écran LCD 2 lignes, 16 colonnes

# Debug: Verify LCD initialization
try:
    ecran_lcd.clear()
    ecran_lcd.putstr("Test LCD")
    time.sleep(2)
    ecran_lcd.clear()
except Exception as e:
    print("LCD Initialization Error:", e)

# Broches pour la sortie binaire vers le décodeur (4, 1, 2, 3)
broches_binaires = [4, 1, 2, 3]
broches_gpio = [Pin(i, Pin.OUT) for i in broches_binaires]

# Broches pour la sélection des afficheurs (transistors)
broches_selection_afficheur = [
    Pin(i, Pin.OUT) for i in range(19, 22)
]  # GPIO 19, 20, 21

# Bouton pour lancer l'affichage
broche_bouton = Pin(10, Pin.IN, Pin.PULL_UP)

########## Variables globales ##########
current_digit = 0
NUMBER_OF_DIGITS = 3  # Seulement 3 afficheurs
digits = [1, 2, 3]  # Exemple de chiffres à afficher


########## Fonctions utilitaires ##########
def envoyer_binaire_au_decodeur(valeur):
    """
    Envoie une valeur binaire (0-9) au décodeur physique via les broches binaires.
    """
    for i in range(4):
        broches_gpio[i].value((valeur >> i) & 1)


def selectionner_afficheur(index):
    """
    Active un seul afficheur en utilisant les broches de sélection.
    """
    for i in range(len(broches_selection_afficheur)):
        broches_selection_afficheur[i].value(1 if i == index else 0)


########## Fonction principale ##########
def ecrire_sur_afficheurs(timer):
    """
    Met à jour les afficheurs en envoyant le chiffre actuel au décodeur
    et en activant l'afficheur correspondant.
    """
    global current_digit, digits

    # Désactiver tous les afficheurs
    for broche in broches_selection_afficheur:
        broche.value(0)

    # Envoyer le chiffre actuel au décodeur
    envoyer_binaire_au_decodeur(digits[current_digit])

    # Activer l'afficheur correspondant
    selectionner_afficheur(current_digit)

    # Passer au chiffre suivant
    current_digit = (current_digit + 1) % NUMBER_OF_DIGITS


########## Configuration du timer ##########
timer_afficheur = Timer()
timer_afficheur.init(freq=1000, mode=Timer.PERIODIC, callback=ecrire_sur_afficheurs)

########## Boucle principale ##########
while True:
    try:
        time.sleep(4)
        random_num = random.randrange(100, 1000)  # Générer un nombre à 3 chiffres
        print(f"Nombre généré : {random_num}")
        digits = [int(d) for d in str(random_num)]  # Convertir en liste de chiffres
    except KeyboardInterrupt:
        print("Goodbye")
        timer_afficheur.deinit()
        sys.exit()
