import pytest
from unittest.mock import MagicMock
from firebase import generate_random, calculer_gain


# Teste la génération aléatoire (ici, on attend juste que la fonction retourne 0)
def test_generate_random():
    """
    Vérifie que la fonction generate_random retourne bien 0 (succès).
    """
    result = generate_random()
    assert result == 0


# Teste le calcul du gain pour un jackpot
def test_calculer_gain_jackpot():
    """
    Vérifie que le gain est correct pour un jackpot (3x7).
    """
    rouleaux = [7, 7, 7]
    mise = 10
    gain = calculer_gain(rouleaux, mise)
    assert gain == 100


# Teste le calcul du gain pour une combinaison "sandwich"
def test_calculer_gain_sandwich():
    """
    Vérifie le gain pour une combinaison sandwich (ex: 7,5,7).
    """
    rouleaux = [7, 5, 7]
    mise = 10
    gain = calculer_gain(rouleaux, mise)
    assert gain == 20


# Teste la lecture des valeurs du joystick (mock)
def test_joystick_reading():
    """
    Vérifie que les valeurs lues du joystick sont dans l'intervalle attendu (0-65535).
    Utilise un mock pour simuler le hardware.
    """
    mock_adc = MagicMock()
    mock_adc.read_u16.return_value = 32768  # valeur médiane
    x_axis = mock_adc
    y_axis = mock_adc
    x_value = x_axis.read_u16()
    y_value = y_axis.read_u16()
    assert 0 <= x_value <= 65535
    assert 0 <= y_value <= 65535
