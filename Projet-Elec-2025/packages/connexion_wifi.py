import network
import time

# Dictionnaire pour stocker les SSID et leurs mots de passe
SSID_PASSWORDS = {
    "iPhone de naifu": "akanaifu",
    "Moulin": "kotdessalopes",
    # Ajoutez d'autres SSID et mots de passe ici
}


def connect_to_wifi():
    """
    Connecte à un réseau Wi-Fi en vérifiant si le SSID est déjà connu.
    """
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)

    # Scanner les réseaux disponibles
    available_networks = wlan.scan()
    print("Réseaux disponibles :")
    for net in available_networks:
        ssid = net[0].decode("utf-8")
        print(f"- {ssid}")

        # Vérifier si le SSID est dans le dictionnaire
        if ssid in SSID_PASSWORDS:
            print(f"SSID connu : {ssid}")
            password = SSID_PASSWORDS[ssid]
        else:
            print(f"SSID inconnu : {ssid}")
            password = input(f"Entrez le mot de passe pour {ssid} : ")
            SSID_PASSWORDS[ssid] = password  # Ajouter au dictionnaire

        # Tenter de se connecter
        print(f"Connexion à {ssid}...")
        wlan.connect(ssid, password)

        # Attendre la connexion
        for _ in range(10):
            if wlan.isconnected():
                print(f"Connecté à {ssid} avec succès !")
                print("Adresse IP :", wlan.ifconfig()[0])
                return
            time.sleep(1)

        print(f"Impossible de se connecter à {ssid}.")
    print("Aucun réseau disponible ou connexion échouée.")


def scan_networks():
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    networks = wlan.scan()
    print("Réseaux disponibles :")
    for net in networks:
        print(f"SSID : {net[0].decode('utf-8')}, Signal : {net[3]}")


scan_networks()
