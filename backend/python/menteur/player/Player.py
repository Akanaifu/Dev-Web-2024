from typing import List
from backend.python.shared_games_cards.shared_players.APlayer import APlayer
from backend.python.EnterValue import EnterValue


class Player(APlayer):
    def play_card(self):
        cards_Chosen = []
        if self.__launch==False:
            # Je suis dans le jeu console
            enter=EnterValue
            i=enter.EnterValue("Entrez le numéro de la carte que vous voulez jouer : ", 1, len(self.__cardsSet))
            for k in range(i-1):
                card_position=enter.EnterValue("Entrez la position de la carte en commençant par la gauche: ", 1, len(self.__cardsSet))
                card_Chose = self.__cardsSet.pop(card_position-1)
                cards_Chosen.append(card_Chose)
            return cards_Chosen
        else:
            # Je suis dans le jeu GUI
            # Je dois faire une fonction qui va me permettre de choisir les cartes à jouer
            pass