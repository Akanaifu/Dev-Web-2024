from abc import ABC, abstractmethod
import random
from backend.python.shared_games_cards.shared_cards.CardsSet import CardsSet

class APlayer(ABC):
#    """Classe abstraite représentant un joueur dans le jeu de cartes."""
# Game représente le nom du jeu de cartes
# launch = False ==> jeux console
# launch = True ==> jeux GUI
    def __init__(self, name: str, color: str, bet:int,solde:int,cardsSet: CardsSet):
        self.__color = color
        self.__name = name
        self.__solde = solde
        self.__score = 0
        self.__bet = bet
        self.__cardsSet = cardsSet
        self._cardsPlayed=CardsSet
        

    def get_name(self) -> str:
        return self.__name
    
    @abstractmethod
    def play_card(self, cardSet: CardsSet) -> None:
        pass
    
    def get_solde(self) -> int:
        return self.__solde
    
    def set_solde(self, solde: int) -> None:
        self.__solde += self.__bet
        
        
    def get_bet(self) -> int:
        return self.__bet
    
    def set_bet(self, bet: int) -> None:
        self.__solde=self.__solde-bet
        self.__bet += bet