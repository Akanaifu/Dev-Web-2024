import network
import time


def connect_to_wifi():
    """
    0 : Interface Wi-Fi désactivée.
    1 : Interface Wi-Fi activée, mais non connectée.
    2 : Connexion en cours.
    3 : Connecté avec succès.
    -1 ou -2 : Erreur (par exemple, mot de passe incorrect ou réseau introuvable).
    """
    # Informations du réseau Wi-Fi
    ssid = "iPhone de naifu"  # Remplacez par le nom de votre réseau Wi-Fi
    password = "akanaifu"  # Remplacez par le mot de passe de votre réseau Wi-Fi
    # Activer le WiFi
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)

    wlan.connect(ssid, password)

    max_wait = 10
    while max_wait > 0:
        status = wlan.status()
        if status < 0 or status >= 3:
            break
        max_wait -= 1
        print(f"En attente de connexion... (statut : {status})")
        time.sleep(1)

    # Vérifier le statut final
    if wlan.status() != 3:
        raise RuntimeError(
            f"Échec de la connexion au réseau (statut final : {wlan.status()})"
        )

    print("Connecté !")
    status = wlan.ifconfig()
    print("Adresse IP:", status[0])


def scan_networks():
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    networks = wlan.scan()
    print("Réseaux disponibles :")
    for net in networks:
        print(f"SSID : {net[0].decode('utf-8')}, Signal : {net[3]}")


scan_networks()
