from abc import ABC, abstractmethod
import random
from python.EnterValue import EnterValue
from python.menteur.cards.M_CardsSet import M_CardsSet
from python.menteur.rules.M_Rules import M_Rules
from python.shared_games_cards.shared_cards.ACard import ACard
from python.shared_games_cards.shared_players.APlayer import APlayer

class M_APlayer(APlayer,ABC):
    def __init__(self,id:int, pseudo: str, color: str, bet:int,solde:int,cardsSet: M_CardsSet):
        self.__id = id
        self.__pseudo = pseudo
        self.__color = color
        self.__bet = bet
        self.__solde = solde
        self.__cardsSet = cardsSet
        self.__life=6
        self.__score_game = 0  
        self.__score_round = 0     
        self.__cards_Chosen = M_CardsSet  
        self.__rules=M_Rules
        super().__init__(id,pseudo,color,bet,solde,cardsSet)
        
    @abstractmethod
    def my_turn_to_play(self, player:'M_APlayer') -> None:
        pass
    
    def play_snitch(self,player:'M_APlayer')->None:
        # Je suis dans le jeu console
        print(f"Le joueur {player.get_pseudo(player)} a été de dénoncer par le joueur {self.__pseudo}")
        k=0
        while k < len(player.get_cards_chosen(player)):
            if self.__rules.check_master_cards(player.get_cards_chosen(player)[k])==False:
                print(f"Le joueur {player.get_pseudo(player)} avez choisi la carte {player.get_cards_chosen()}")
                player.set_life(player)
                break
            k+=1
        else :
            self.set_life(self)
            #print les cartes et vérifier si la carte était celle demandé
    
    # à finir par rapport à la regle du jeu et du nombre de cartes pour jouer
    def play_card(self, cardSet) ->[ACard]:
        pass
    
    def set_life(self) -> bool:
        random_1=random.randint(1,self.__life)
        random_2=random.randint(1,self.__life)
        if random_1==random_2:
            self.__life=0
            print(f"{self.__pseudo} a perdu ")
            return True
        else:
            print(f"{self.__pseudo} vous restez {self.__life} vies")
            self.__life-=1
            return False
        
    def get_life(self) -> int:
        return self.__life
    
    def get_cards_chosen(self) -> M_CardsSet:
        return self.__cards_Chosen
    
    
    def get_id(self) -> str:  
        return self.__id
    