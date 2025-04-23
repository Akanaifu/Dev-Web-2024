from abc import ABC, abstractmethod
import random
from python.shared_games_cards.shared_cards.CardsSet import CardsSet

class APlayer(ABC):
#    """Classe abstraite représentant un joueur dans le jeu de cartes."""
# Game représente le nom du jeu de cartes
# launch = False ==> jeux console
# launch = True ==> jeux GUI
    def __init__(self,id:int, pseudo: str, color: str, bet:int,solde:int,cardsSet: CardsSet):
        self.__color = color
        self.__pseudo = pseudo
        self.__solde = solde
        self.__score_round = 0
        self.__score_game = 0
        self.__bet = bet
        self.__cardsSet = cardsSet
        self._cardsPlayed=CardsSet
        

    def get_pseudo(self) -> str:
        return self.__pseudo
    
    @abstractmethod
    def play_card(self, cardSet: CardsSet) -> None:
        pass
    
    def get_score_round(self) -> int:
        return self.__solde
    
    def set_score_round(self,bet)-> None:
        self.__score_round += bet
    
    def set_solde(self, solde: int) -> None:
        self.__solde += self.__bet
        
    def get_cardsSet(self) -> CardsSet:
        return self.__cardsSet
    
    def set_cardsSet(self, cardsSet: CardsSet) -> None:
        self.__cardsSet = cardsSet
    
    def get_id(self) -> int:
        return self.__id
         
    def get_bet(self) -> int:
        return self.__bet
    
    def set_bet(self, bet: int) -> None:
        self.__solde=self.__solde-bet
        self.__bet += bet