from unittest.mock import MagicMock, patch


@patch("machine.Pin")
def test_number_to_7segment(mock_pin):
    """
    Vérifie que la conversion d'un chiffre en segments retourne la bonne valeur binaire.
    """
    from packages.seven_segment import SevenSegmentDisplay

    display = SevenSegmentDisplay([0, 1, 2, 3, 4, 5, 6, 7], [8, 9, 10])
    assert display.number_to_7segment(0) == 0b0111111
    assert display.number_to_7segment(7) == 0b0000111


@patch("machine.Pin")
def test_number_to_digits(mock_pin):
    """
    Vérifie la conversion d'un nombre en liste de chiffres.
    """
    from packages.seven_segment import SevenSegmentDisplay

    display = SevenSegmentDisplay([0, 1, 2, 3, 4, 5, 6, 7], [8, 9, 10])
    assert display.number_to_digits(123) == [1, 2, 3]


"""
Nouveaux tests effectués :

1. test_number_to_7segment

Vérifie que la conversion d'un chiffre en segments retourne la bonne valeur binaire pour l'afficheur 7 segments.
Critères de réussite :
- Les valeurs binaires retournées correspondent aux chiffres attendus.

2. test_number_to_digits

Vérifie la conversion d'un nombre en liste de chiffres via la classe SevenSegmentDisplay.
Critères de réussite :
- La liste retournée correspond bien aux chiffres du nombre.
"""
