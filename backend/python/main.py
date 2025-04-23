from python.menteur.M_LaunchGames import M_LaunchGames
print("Quel jeu veux-tu lancer ?")
# print("1. Menteur")
# print("2. Pendu")

def run()->None:
    game = M_LaunchGames()
    game.prepare(game)
    game.loby(game)
    game.play(game)
# if __name__ == "__main__":
#     run()