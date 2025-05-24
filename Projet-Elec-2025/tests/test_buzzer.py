from unittest.mock import MagicMock, patch


"""
Nouveaux tests effectués :

1. test_victory_fanfare_player_sequence

Vérifie que la séquence VictoryFanfarePlayer avance correctement lors de l'appel à tick 
et que l'état actif est bien géré.
Critères de réussite :
- L'index de la séquence augmente après plusieurs ticks.
- La méthode stop désactive correctement le player.

2. test_slot_machine_sound_player_sequence

Vérifie que la séquence SlotMachineSoundPlayer avance correctement lors de l'appel à tick et q
ue l'état actif est bien géré.
Critères de réussite :
- L'index de la séquence augmente après plusieurs ticks.
- La méthode stop désactive correctement le player.
"""


def test_victory_fanfare_player_sequence():
    """
    Vérifie que la séquence VictoryFanfarePlayer avance correctement.
    """
    from packages.buzzer import VictoryFanfarePlayer

    player = VictoryFanfarePlayer()
    player.pwms = [MagicMock(), MagicMock()]
    player.start()
    # On simule quelques ticks
    for _ in range(5):
        player.tick(ms_step=120)
    assert player.index > 0
    player.stop()
    assert not player.active


def test_slot_machine_sound_player_sequence():
    """
    Vérifie que la séquence SlotMachineSoundPlayer avance correctement.
    """
    from packages.buzzer import SlotMachineSoundPlayer

    player = SlotMachineSoundPlayer()
    player.pwms = [MagicMock(), MagicMock()]
    player.start()
    for _ in range(5):
        player.tick(ms_step=120)
    assert player.index > 0
    player.stop()
    assert not player.active
