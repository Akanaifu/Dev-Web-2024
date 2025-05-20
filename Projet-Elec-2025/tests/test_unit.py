from firebase import calculer_gain, number_to_DIGITS


def test_calculer_gain_jackpot():
    """
    Teste le calcul du gain pour un jackpot.
    """
    rouleaux = [7, 7, 7]
    mise = 10
    assert calculer_gain(rouleaux, mise) == 100, "Jackpot incorrect."


def test_calculer_gain_sandwich():
    """
    Teste le calcul du gain pour un sandwich.
    """
    rouleaux = [7, 5, 7]
    mise = 10
    assert calculer_gain(rouleaux, mise) == 20, "Sandwich incorrect."


def test_calculer_gain_suite():
    """
    Teste le calcul du gain pour une suite.
    """
    rouleaux = [1, 2, 3]
    mise = 10
    assert calculer_gain(rouleaux, mise) == 50, "Suite incorrecte."


def test_calculer_gain_pair_impair():
    """
    Teste le calcul du gain pour des nombres pairs ou impairs.
    """
    rouleaux = [2, 4, 6]
    mise = 10
    assert calculer_gain(rouleaux, mise) == 15, "Pair/Impair incorrect."


def test_number_to_DIGITS():
    """
    Teste la conversion d'un nombre en chiffres.
    """
    number = 123
    assert number_to_DIGITS(number) == [1, 2, 3], "Conversion incorrecte."


def test_number_to_DIGITS_single_digit():
    """
    Teste la conversion d'un nombre à un seul chiffre.
    """
    number = 7
    assert number_to_DIGITS(number) == [
        7
    ], "Conversion incorrecte pour un seul chiffre."


def test_number_to_DIGITS_large_number():
    """
    Teste la conversion d'un grand nombre.
    """
    number = 987654
    assert number_to_DIGITS(number) == [
        9,
        8,
        7,
        6,
        5,
        4,
    ], "Conversion incorrecte pour un grand nombre."
