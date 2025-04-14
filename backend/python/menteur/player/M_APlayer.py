from abc import ABC, abstractmethod
import random
from backend.python.menteur.cards.M_CardsSet import M_CardsSet
from backend.python.shared_games_cards.shared_cards.ACard import ACard
from backend.python.shared_games_cards.shared_players.APlayer import APlayer

class M_APlayer(APlayer,ABC):
    def __init__(self, name: str, color: str,bet:int,solde:int,cardsSet:M_CardsSet, life=6):
        super().__init__(name, color, bet,solde,cardsSet)
        self.__name = name
        self.__color = color
        self.__bet = bet
        self.__cardsSet = cardsSet
        self.__life=life
        self.__score = 0       
        
    @abstractmethod
    def play_snitch(self,APlayer) -> None:
        pass
    
    # à finir par rapport à la regle du jeu et du nombre de cartes pour jouer
    def play_card(self, cardSet) ->[ACard]:
        pass
    
    def set_life(self) -> bool:
        random_1=random.randint(1,self.__life)
        random_2=random.randint(1,self.__life)
        if random_1==random_2:
            self.__life=0
            print(f"{self.__name} a perdu ")
            return True
        else:
            print(f"{self.__name} vous restez {self.__life} vies")
            self.__life-=1
            return False
        
    def get_life(self) -> int:
        return self.__life