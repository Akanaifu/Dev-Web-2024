from unittest.mock import MagicMock, patch


@patch("network.WLAN")
def test_scan_networks(mock_wlan):
    """
    Nouveau test effectué :

    test_scan_networks

    Vérifie que la fonction scan_networks liste les réseaux Wi-Fi disponibles sans générer d'erreur.
    Critères de réussite :
    - La méthode scan est bien appelée sur l'instance WLAN.
    """
    from packages.connexion_wifi import scan_networks

    instance = mock_wlan.return_value
    instance.scan.return_value = [(b"TestSSID", None, None, -50)]
    instance.active.return_value = True
    scan_networks()
    instance.scan.assert_called_once()
