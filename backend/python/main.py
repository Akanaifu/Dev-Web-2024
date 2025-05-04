from menteur import M_LaunchGames
from common_imports import *

print("Quel jeu veux-tu lancer ?")
# print("1. Menteur")
# print("2. Pendu")

def run()->None:
    game = M_LaunchGames.M_LaunchGames()
    game.prepare(game)
    game.loby(game)
    game.play(game)
if __name__ == "__main__":
    run()