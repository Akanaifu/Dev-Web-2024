"""
Module de gestion de la connexion Wi-Fi pour microcontrôleur.
Permet de scanner les réseaux disponibles et de se connecter automatiquement à un réseau connu.
"""

import time
import network

# Dictionnaire pour stocker les SSID et leurs mots de passe
SSID_PASSWORDS = {
    "iPhone de naifu": "akanaifu",
    "Moulin": "kotdessalopes",
    "WIFI_LEMAIRE": "025124940",
    # Ajoutez d'autres SSID et mots de passe ici
}


def connect_to_wifi():
    """
    Connecte à un réseau Wi-Fi en vérifiant si le SSID est déjà connu.
    Si le SSID n'est pas connu, demande le mot de passe à l'utilisateur.
    Affiche les réseaux disponibles et tente de se connecter à chacun.
    """
    try:
        wlan = network.WLAN(network.STA_IF)
        wlan.active(True)
        available_networks = wlan.scan()
    except OSError as e:
        print(f"Erreur Wi-Fi : {e}")
        return

    def try_connect(ssid, password):
        wlan.connect(ssid, password)
        print(f"Tentative de connexion à {ssid} ...")
        for _ in range(10):
            if wlan.isconnected():
                print(f"Connecté à {ssid} ! Adresse IP : {wlan.ifconfig()[0]}")
                return True
            time.sleep(1)
        print(f"Impossible de se connecter à {ssid}.")
        return False

    ssids_available = []
    for net in available_networks:
        try:
            ssids_available.append(net[0].decode("utf-8"))
        except (OSError, UnicodeDecodeError) as e:
            print(f"Erreur lors de l'ajout d'un SSID : {e}")
            continue

    for ssid in ssids_available:
        password = SSID_PASSWORDS.get(ssid)
        if password and try_connect(ssid, password):
            return

    print("Aucun réseau connu trouvé. Réseaux disponibles :")
    for ssid in ssids_available:
        print(f"- {ssid}")
        password = input(f"Entrez le mot de passe pour {ssid} : ")
        SSID_PASSWORDS[ssid] = password
        if try_connect(ssid, password):
            return

    print("Aucun réseau disponible ou connexion échouée.")


def scan_networks():
    """
    Scanne et affiche les réseaux Wi-Fi disponibles avec leur force de signal.
    """
    try:
        wlan = network.WLAN(network.STA_IF)
        wlan.active(True)
        networks = wlan.scan()
        print("Réseaux disponibles :")
        for net in networks:
            try:
                print(f"SSID : {net[0].decode('utf-8')}, Signal : {net[3]}")
            except (OSError, UnicodeDecodeError) as e:
                print(f"Erreur lors de l'affichage d'un réseau : {e}")
    except OSError as e:
        print(f"Erreur lors du scan des réseaux : {e}")
