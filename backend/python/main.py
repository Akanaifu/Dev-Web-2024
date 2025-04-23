import subprocess
print("Quel jeu veux-tu lancer ?")
print("1. Menteur")
print("2. Pendu")

# choice = input("Ton choix : ")

# if choice == "1":
subprocess.run(["python", "backend/python/menteur/M_LaunchGames.py"])
# else:
#     print("Choix invalide.")