from firebase import generate_random, update_first_unplayed_game
from connexion_wifi import connect_to_wifi


def test_generate_and_update():
    """
    Teste si la génération aléatoire et la mise à jour Firebase fonctionnent ensemble.
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
    print("Test d'intégration réussi.")
