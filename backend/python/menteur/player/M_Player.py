from typing import List
from backend.python.menteur.cards.M_CardsSet import M_CardsSet
from backend.python.menteur.player import M_APlayer
from backend.python.EnterValue import EnterValue
from backend.python.menteur.rules import M_Rules


class M_Player(M_APlayer):
    
    def __init__(self, name: str, color: str,bet:int,solde:int,cardsSet:M_CardsSet) -> None:
        super().__init__(name, color, bet,solde,cardsSet)
        self.__name = name
        self.__color = color
        self.__bet = bet
        self.__cardsSet = cardsSet
        self.__life=6
        self.__score = 0
        self.__cards_Chosen = M_CardsSet  
        self.__rules=M_Rules("menteur")
        self.__enterValue=EnterValue
    
    def play_card(self)->M_CardsSet:
        # Je suis dans le jeu console
        
        if len(self.__cardsSet.get_cardsSet())>self.__rules.get_max_Cards_per_played(self.__rules):
            max=self.__rules.get_max_Cards_per_played(self.__rules)
        else:
            max=len(self.__cardsSet)
        i=self.__enterValue.EnterValue("Entrez le numéro de la carte que vous voulez jouer : ", 1, max)
        for k in range(i-1):
            card_position=self.__enterValue.EnterValue("Entrez la position de la carte en commençant par la gauche: ", 1, len(self.__cardsSet))
            card_Chose = self.__cardsSet.pop_card(card_position-1)
            self.__cards_Chosen.add_card(card_Chose)
            return self.__cards_Chosen
    
        def my_turn_to_play(self, player:M_APlayer) -> None:
            if len(self.__cards_Chosen()) > 0:
                chose=self.__enterValue.EnterValue("Dénoncez vous le joueur précédement? (1: Oui, 2: Non) : ", 1, 2)
            if chose==1: 
                #problème de l'instance de la classe M_CardsSet soit je mets dans le constructeur ou je fais une méthode pour l'initialiser ou je trouve un autre moyen
                #print les cartes et vérifier si la carte était celle demandé
                self.play_snitch(player)  
            else:
                # Jouer play_card() si le joueur ne dénonce pas
                self.play_card()
        
    