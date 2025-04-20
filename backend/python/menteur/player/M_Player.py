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
    
    def play_card(self)->M_CardsSet:
        # Je suis dans le jeu console
        enter=EnterValue
        if len(self.__cardsSet.get_cardsSet())>self.__rules.get_max_Cards_per_played(self.__rules):
            max=self.__rules.get_max_Cards_per_played(self.__rules)
        else:
            max=len(self.__cardsSet)
        i=enter.EnterValue("Entrez le numéro de la carte que vous voulez jouer : ", 1, max)
        for k in range(i-1):
            card_position=enter.EnterValue("Entrez la position de la carte en commençant par la gauche: ", 1, len(self.__cardsSet))
            card_Chose = self.__cardsSet.pop_card(card_position-1)
            self.__cards_Chosen.add_card(card_Chose)
        return self.__cards_Chosen
    
    def play_snitch(self,player:M_APlayer)->None:
        # Je suis dans le jeu console
        print(f"Le joueur {player.get_name(player)} avez choisi de dénoncer ")
        k=0
        while k < len(player.get_cards_chosen(player)):
            if self.__rules.check_master_cards(player.get_cards_chosen(player)[k])==False:
                print(f"Le joueur {player.get_name(player)} avez choisi la carte {player.get_cards_chosen(player)[k].get_rank()}")
                player.set_life(player)
                break
            k+=1
        else :
            self.set_life(self)
            #print les cartes et vérifier si la carte était celle demandé
        
    