from firebase import calculer_gain, number_to_digits


# Teste le gain pour un jackpot (3x7)
def test_calculer_gain_jackpot():
    """
    Gain pour jackpot (3x7).
    """
    rouleaux = [7, 7, 7]
    mise = 10
    assert calculer_gain(rouleaux, mise) == 100


# Teste le gain pour un sandwich (ex: 7,5,7)
def test_calculer_gain_sandwich():
    """
    Gain pour sandwich (1er et 3e identiques, 2e différent).
    """
    rouleaux = [7, 5, 7]
    mise = 10
    assert calculer_gain(rouleaux, mise) == 20


# Teste le gain pour une suite (ex: 1,2,3)
def test_calculer_gain_suite():
    """
    Gain pour une suite (ex: 1,2,3).
    """
    rouleaux = [1, 2, 3]
    mise = 10
    assert calculer_gain(rouleaux, mise) == 50


# Teste le gain pour tous pairs ou tous impairs
def test_calculer_gain_pair_impair():
    """
    Gain pour tous pairs (ou tous impairs).
    """
    rouleaux = [2, 4, 6]
    mise = 10
    assert calculer_gain(rouleaux, mise) == 15


# Teste la conversion d'un nombre en liste de chiffres
def test_number_to_digits():
    """
    Conversion d'un nombre en liste de chiffres.
    """
    number = 123
    assert number_to_digits(number) == [1, 2, 3]


def test_number_to_digits_single_digit():
    """
    Conversion d'un nombre à un seul chiffre.
    """
    number = 7
    assert number_to_digits(number) == [7]


def test_number_to_digits_large_number():
    """
    Conversion d'un grand nombre.
    """
    number = 987654
    assert number_to_digits(number) == [9, 8, 7, 6, 5, 4]
