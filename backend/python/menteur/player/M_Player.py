from typing import List
from backend.python.menteur.cards.M_CardsSet import M_CardsSet
from backend.python.menteur.player import M_APlayer
from backend.python.EnterValue import EnterValue


class M_Player(M_APlayer):
    
    def __init__(self, name: str, color: str,bet:int,solde:int,cardsSet:M_CardsSet) -> None:
        super().__init__(name, color, bet,solde,cardsSet)
        self.__name = name
        self.__color = color
        self.__bet = bet
        self.__cardsSet = cardsSet
        self.__life=6
        self.__score = 0    
    
    def play_card(self)->M_CardsSet:
        cards_Chosen = M_CardsSet
        # Je suis dans le jeu console
        enter=EnterValue
        i=enter.EnterValue("Entrez le numéro de la carte que vous voulez jouer : ", 1, len(self.__cardsSet))
        for k in range(i-1):
            card_position=enter.EnterValue("Entrez la position de la carte en commençant par la gauche: ", 1, len(self.__cardsSet))
            card_Chose = self.__cardsSet.pop_card(card_position-1)
            cards_Chosen.add_card(card_Chose)
        return cards_Chosen
    
    def play_snitch(self,player:M_APlayer,cards_playing:M_CardsSet)->None:
        # Je suis dans le jeu console
        print(f"Le joueur {player.get_name()} avez choisi de dénoncer ")
  
            #print les cartes et vérifier si la carte était celle demandé
        
    