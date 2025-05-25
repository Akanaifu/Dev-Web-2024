from unittest.mock import MagicMock


"""
Nouveau test effectué :

test_update_bet_amount_increases_and_decreases

Vérifie que la fonction update_bet_amount modifie correctement la mise affichée en fonction des mouvements du joystick (augmentation/diminution).
Critères de réussite :
- La mise augmente si le joystick est poussé à droite.
- La mise diminue si le joystick est poussé à gauche.
"""


def test_update_bet_amount_increases_and_decreases():
    """
    Vérifie que la mise augmente/diminue selon la position du joystick.
    """
    from packages.joystick import update_bet_amount

    lcd = MagicMock()
    # Simule joystick à droite (x très grand)
    x_axis = MagicMock()
    y_axis = MagicMock()
    x_axis.read_u16.return_value = 60000
    y_axis.read_u16.return_value = 49000
    bet = update_bet_amount(x_axis, y_axis, lcd, 10, 100)
    assert bet > 10
    # Simule joystick à gauche (x très petit)
    x_axis.read_u16.return_value = 10000
    bet = update_bet_amount(x_axis, y_axis, lcd, 10, 100)
    assert bet < 10
