from typing import List
from backend.python.menteur.cards.M_CardsSet import M_CardsSet
from backend.python.menteur.player import M_APlayer
from backend.python.EnterValue import EnterValue


class M_Player(M_APlayer):
    def play_card(self)->M_CardsSet:
        cards_Chosen = M_CardsSet
        # Je suis dans le jeu console
        enter=EnterValue
        i=enter.EnterValue("Entrez le numéro de la carte que vous voulez jouer : ", 1, len(self.__cardsSet))
        for k in range(i-1):
            card_position=enter.EnterValue("Entrez la position de la carte en commençant par la gauche: ", 1, len(self.__cardsSet))
            card_Chose = self.__cardsSet.pop_card(card_position-1)
            cards_Chosen.append(card_Chose)
        return cards_Chosen
    
    def play_snitch(self,player:M_APlayer,cards_playing:M_CardsSet)->None:
        # Je suis dans le jeu console
        enter=EnterValue
        i=enter.EnterValue("Entrez le numéro de la carte que vous voulez jouer : ", 1, len(self.__cardsSet))
        card_position=enter.EnterValue("Dénoncez vous le joueur précédement? (1: Oui, 2: Non) : ", 1, 2)
        if card_position==1:
            #print les cartes et vérifier si la carte était celle demandé
        else:
            #jouer play_card()
            pass