from typing import List
from python.menteur.cards.M_CardsSet import M_CardsSet
from python.menteur.player.M_APlayer import M_APlayer
from python.EnterValue import EnterValue
from python.menteur.rules.M_Board import M_Board
from python.menteur.rules.M_Rules import M_Rules


class M_Player(M_APlayer):
    
    def __init__(self,id:int, pseudo: str, color: str,bet:int,solde:int,cardsSet:M_CardsSet) -> None:
        self.__id = id
        self.__pseudo = pseudo
        self.__color = color
        self.__bet = bet
        self.__cardsSet = cardsSet
        self.__cards_Chosen = M_CardsSet  
        self.__rules=M_Rules
        self.__enterValue=EnterValue
        self.__board=M_Board
        super().__init__(pseudo, color, bet,solde,cardsSet)
        
    def play_card(self)->M_CardsSet:
        # Je suis dans le jeu console
        
        if len(self.__cardsSet.get_cardsSet())>self.__rules.get_max_Cards_played():
            max=self.__rules.get_max_Cards_played()
        else:
            max=len(self.__cardsSet)
        i=self.__enterValue.EnterValue("Entrez le numéro de la carte que vous voulez jouer : ", 1, max)
        for k in range(i):
            card_position=self.__enterValue.EnterValue("Entrez la position de la carte en commençant par la gauche: ", 1, len(self.__cardsSet))
            card_Chose = self.__cardsSet.pop_card(card_position-1)
            self.__cards_Chosen.add_card(card_Chose)
        return self.__cards_Chosen
    
    def my_turn_to_play(self, player:M_APlayer) -> None:
        if len(player.get_cards_chosen()) > 0:
            chose=self.__enterValue.EnterValue("Dénoncez vous le joueur précédement? (1: Oui, 2: Non) : ", 1, 2)
        if chose==1: 
            #print les cartes et vérifier si la carte était celle demandé
            self.play_snitch(self,player)
        else:
            # Jouer play_card() si le joueur ne dénonce pas
            self.play_card()
    
