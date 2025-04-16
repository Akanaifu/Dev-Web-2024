from abc import ABC, abstractmethod
import random
from backend.python.EnterValue import EnterValue
from backend.python.menteur.cards.M_CardsSet import M_CardsSet
from backend.python.shared_games_cards.shared_cards.ACard import ACard
from backend.python.shared_games_cards.shared_players.APlayer import APlayer

class M_APlayer(APlayer,ABC):
    def __init__(self, name: str, color: str,bet:int,solde:int,cardsSet:M_CardsSet):
        super().__init__(name, color, bet,solde,cardsSet)
        self.__name = name
        self.__color = color
        self.__bet = bet
        self.__cardsSet = cardsSet
        self.__life=6
        self.__score = 0       
        cardsStack=M_CardsSet
        
       
    def my_turn_to_play(self) -> None:
        enter=EnterValue
        chose=enter.EnterValue("Dénoncez vous le joueur précédement? (1: Oui, 2: Non) : ", 1, 2)
        if chose==1 and cardsStack.get_size() > 0:
            #problème de l'instance de la classe M_CardsSet soit je mets dans le constructeur ou je fais une méthode pour l'initialiser ou je trouve un autre moyen
            #print les cartes et vérifier si la carte était celle demandé
            self.play_snitch()
        else:
            # Jouer play_card() si le joueur ne dénonce pas
            self.play_card()
        
     
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