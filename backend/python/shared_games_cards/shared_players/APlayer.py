from abc import abstractmethod
import random
from backend.python.menteur.cards.M_CardsSet import CardsSet

class APlayer():
#    """Classe abstraite représentant un joueur dans le jeu de cartes."""
# Game représente le nom du jeu de cartes
# launch = False ==> jeux console
# launch = True ==> jeux GUI
    def __init__(self, name: str, color: str, game: str,bet:int,launch: bool,cardsSet: CardsSet,life=6):
        self.__color = color
        self.__game = game
        self.__name = name
        self.__score = 0
        self.__bet = bet
        self.__launch = launch
        self.__cardsSet = cardsSet
        self.__life=life

    def get_name(self) -> str:
        return self.__name
    
    @abstractmethod
    def play_card(self, cardSet: CardsSet) -> None:
        pass
    
    @abstractmethod
    def play_snitch(self,APlayer) -> None:
        pass
    
    def get_life(self) -> int:
        return self.__life
    
    def set_life(self) -> bool:
        random_1=random(1,self.__life)
        random_2=random(1,self.__life)
        if random_1==random_2:
            self.__life=0
            print(f"{self.__name} a perdu ")
            return True
        else:
            print(f"{self.__name} vous restez {self.__life} vies")
            self.__life-=1
            return False
    
    def get_bet(self) -> int:
        return self.__bet
    
    def set_bet(self, bet: int) -> None:
        self.__bet += bet