import pytest
from unittest.mock import MagicMock, patch


# On patch Pin pour éviter d'accéder au hardware
@patch("machine.Pin")
def test_led_blinking_logic(mock_pin):
    """
    Vérifie que la fonction de clignotement active les LEDs dans l'ordre.
    """
    import packages.led as led

    led.SET_LED = [MagicMock() for _ in range(4)]
    led.LED_ACTIVE = 0
    led._blink_led(None)
    # Seule la première LED doit être allumée
    for i, l in enumerate(led.SET_LED):
        if i == 0:
            l.value.assert_called_with(1)
        else:
            l.value.assert_any_call(0)


@patch("machine.Pin")
def test_eteindre_led(mock_pin):
    """
    Vérifie que la fonction eteindre_led éteint toutes les LEDs.
    """
    import packages.led as led

    led.SET_LED = [MagicMock() for _ in range(4)]
    led.eteindre_led()
    for l in led.SET_LED:
        l.value.assert_called_with(0)


"""
Nouveaux tests effectués :

1. test_led_blinking_logic

Vérifie que la fonction de clignotement (_blink_led) active les LEDs dans l'ordre attendu.
Critères de réussite :
- Seule la LED active doit être allumée, les autres éteintes.

2. test_eteindre_led

Vérifie que la fonction eteindre_led éteint bien toutes les LEDs.
Critères de réussite :
- Toutes les LEDs sont éteintes après appel de la fonction.
"""
