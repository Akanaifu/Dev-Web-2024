# version avec décodeur, joystick et écran LCD pour le PCB
from machine import Pin, Timer, I2C, ADC
from pico_i2c_lcd import I2cLcd  # Assurez-vous d'avoir installé cette bibliothèque
import random
import time, sys

########## Configuration matérielle ##########
# Activation des composants
Pin(28, Pin.OUT).value(1)  # Allumer décodeur
Pin(8, Pin.OUT).value(1)  # Allumer écran LCD
Pin(9, Pin.OUT).value(1)  # Allumer joystick


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

NOMBRES_A_GENERER = 15  # Nombres à générer
COMPTEUR_GENERES = 0  # Compteur pour suivre combien de chiffres ont été générés
TIMER_ALEATOIRE = Timer()  # Timer pour générer les chiffres successivement
AFFICHEUR_ACTUEL = 0
NOMBRE_DE_CHIFFRES = 3
chiffres = [1, 2, 3]
SCORE = 0  # Variable pour stocker le SCORE
MISE = 10  # Somme initiale pariée
FREQUENCE_AFFICHEUR = NOMBRE_DE_CHIFFRES * 100
CODE_EN_COURS = False
BOUTON_APPUYE = False

########## Fonctions utilitaires ##########


def convertir_en_binaire(valeur):
    """
    Convertit une valeur (0-9) en sa représentation binaire sous forme de liste de bits.
    """
    return [(valeur >> i) & 1 for i in range(4)][::-1]


def envoyer_binaire_au_decodeur(valeur):
    """
    Envoie une représentation binaire de la valeur (0-9) au décodeur via les broches 3, 4, 5, 6.
    """
    print(f"Sending value to decoder: {valeur}")  # Debug
    representation_binaire = convertir_en_binaire(valeur)
    print(f"Sending to decoder: {representation_binaire}")  # Debug
    for i, broche in enumerate(broches_gpio):
        broche.value(representation_binaire[i])


def selectionner_afficheur(valeur):
    """
    Active l'afficheur approprié en définissant les broches des transistors correspondants.
    """
    print(f"Selecting display: {valeur}")  # Debug
    for i in range(NOMBRE_DE_CHIFFRES):
        broches_selection_afficheur[i].value((valeur >> i) & 1)


def convertir_nombre_en_chiffres(nombre):
    """
    Convertit un nombre en un tableau de ses chiffres.
    """
    return [int(chiffre) for chiffre in str(nombre)]


########## Fonctions principales ##########


def ecrire_sur_afficheurs(timer):
    """
    Met à jour les afficheurs en envoyant le chiffre actuel au décodeur et en activant l'afficheur correspondant.
    """
    global AFFICHEUR_ACTUEL, chiffres

    selectionner_afficheur(0)  # Désactiver tous les afficheurs
    envoyer_binaire_au_decodeur(chiffres[AFFICHEUR_ACTUEL])  # Envoyer le chiffre actuel
    selectionner_afficheur(1 << AFFICHEUR_ACTUEL)  # Activer l'afficheur actuel

    AFFICHEUR_ACTUEL = (
        AFFICHEUR_ACTUEL + 1
    ) % NOMBRE_DE_CHIFFRES  # Passer au chiffre suivant


def generer_aleatoire(timer):
    """
    Fonction appelée par le timer pour générer un chiffre aléatoire.
    """
    global chiffres, COMPTEUR_GENERES

    if COMPTEUR_GENERES < NOMBRES_A_GENERER:
        nombre_aleatoire = random.randrange(
            10 ** (NOMBRE_DE_CHIFFRES - 1), 10**NOMBRE_DE_CHIFFRES
        )
        chiffres = convertir_nombre_en_chiffres(nombre_aleatoire)
        COMPTEUR_GENERES += 1
        print(f"Generated number: {nombre_aleatoire}")  # Debug
    else:
        TIMER_ALEATOIRE.deinit()
        ecran_lcd.clear()


def calculer_gain(rouleaux: list[int], mise: int) -> int:
    """
    Calcule le gain en fonction du tirage et du montant misé.
    """
    r2, r1, r3 = rouleaux
    multiplicateur = 0
    presence_evenement = False

    if r1 == r2 == r3:
        return 100 if r1 == 7 else 10  # (Méga) Jackpot ou Jackpot
    if (r1 + 1 == r3 and r2 + 1 == r1) or (r1 - 1 == r3 and r2 - 1 == r1):
        multiplicateur = 5  # Suite
        presence_evenement = True
    elif r1 == r3 and r1 != r2:
        multiplicateur = 2  # Sandwich
        presence_evenement = True
    if r1 % 2 == r2 % 2 == r3 % 2:
        multiplicateur = 1.5  # Pair/Impair
        presence_evenement = True

    compte_7 = rouleaux.count(7)
    multiplicateur += compte_7 * 0.5
    if not presence_evenement:
        if compte_7 == 1:
            multiplicateur = 0.5  # Perdre 50% de sa somme
        elif compte_7 == 2:
            multiplicateur = 1  # Récupérer sa mise

    return int(mise * multiplicateur)


def mettre_a_jour_mise():
    """
    Met à jour la somme pariée en fonction de la position du joystick.
    """
    global MISE, ecran_lcd

    # Suppression de la logique liée aux axes X et Y
    ecran_lcd.clear()
    ecran_lcd.putstr(f"Mise: {MISE} EUR")


def bouton_callback(broche):
    """
    Fonction de rappel déclenchée lorsque le bouton est pressé.
    """
    global BOUTON_APPUYE
    BOUTON_APPUYE = True


########## Configuration des interruptions et timers ##########

broche_bouton.irq(trigger=Pin.IRQ_FALLING, handler=bouton_callback)

timer_afficheur = Timer()
timer_afficheur.init(
    freq=FREQUENCE_AFFICHEUR, mode=Timer.PERIODIC, callback=ecrire_sur_afficheurs
)

########## Boucle principale ##########

# Afficher un message de bienvenue au lancement
ecran_lcd.clear()
ecran_lcd.putstr("Bienvenue!")
time.sleep(2)
ecran_lcd.clear()

while True:
    try:
        if not CODE_EN_COURS:
            mettre_a_jour_mise()
        if BOUTON_APPUYE:
            CODE_EN_COURS = True
            BOUTON_APPUYE = False
            COMPTEUR_GENERES = 0
            NOMBRES_A_GENERER = random.randint(5, 15)
            ecran_lcd.clear()
            ecran_lcd.putstr("Generation...")
            TIMER_ALEATOIRE.init(
                period=250, mode=Timer.PERIODIC, callback=generer_aleatoire
            )
        time.sleep(0.1)
    except KeyboardInterrupt:
        print("Au revoir")
        ecran_lcd.clear()
        ecran_lcd.putstr("Au revoir")
        time.sleep(0.01)
        timer_afficheur.deinit()
        TIMER_ALEATOIRE.deinit()
        sys.exit()
