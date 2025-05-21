import time
from machine import Pin, ADC
from firebase import generate_random, calculer_gain


def test_generate_random():
    """
    Teste si la fonction génère correctement des nombres aléatoires.
    """
    result = generate_random()
    assert result == 0, "La génération aléatoire a échoué."


def test_calculer_gain():
    """
    Teste si le calcul des gains est correct.
    """
    rouleaux = [7, 7, 7]
    mise = 10
    gain = calculer_gain(rouleaux, mise)
    assert gain == 100, "Le calcul du gain pour un jackpot est incorrect."


def test_joystick():
    """
    Teste si les valeurs du joystick sont lues correctement.
    """
    x_axis = ADC(Pin(28))
    y_axis = ADC(Pin(27))
    x_value = x_axis.read_u16()
    y_value = y_axis.read_u16()
    assert 0 <= x_value <= 65535, "Valeur X du joystick invalide."
    assert 0 <= y_value <= 65535, "Valeur Y du joystick invalide."
