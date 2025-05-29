from firebase import generate_random, update_first_unplayed_game
from connexion_wifi import connect_to_wifi


"""
Nouveau test d'intégration :

test_generate_and_update

Vérifie que la génération de nombres aléatoires et la mise à jour des données dans Firebase fonctionnent ensemble sans erreur.
Critères de réussite :
- La fonction generate_random retourne 0.
- La fonction update_first_unplayed_game ne lève pas d'exception lors de la mise à jour.
"""


def test_generate_and_update():
    """
    Test d'intégration : vérifie que la génération aléatoire et la mise à jour Firebase fonctionnent ensemble.
    """
    connect_to_wifi()
    result = generate_random()
    assert result == 0, "La génération aléatoire a échoué."
    updated_data = {
        "gain": 50,
        "combinaison": {0: [1, 2, 3]},
        "partieJouee": True,
        "timestamp": 1234567890,
        "mise": 10,
    }
    update_first_unplayed_game(updated_data)
    # Pas d'assertion possible ici sans accès à la base, mais on vérifie l'absence d'exception
