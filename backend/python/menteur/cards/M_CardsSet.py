from python.shared_games_cards.shared_cards.ACard import ACard
from typing import List, Dict, Any

#cette classe est une liste de carte
# elle est utilisée pour les cartes qui sont dans la main du joueur
# elle est utilisée pour les cartes qui sont dans le jeu
class M_CardsSet():
    def __init__(self,cards: List[ACard]) -> None:
        self.__cards = cards
        

    def add_card(self, card: ACard) -> None:
        self.__cards.append(card)

    def remove_card(self, card: ACard)-> None:
        self.__cards.remove(card)

    def get_cardsSet(self) -> List[ACard]:
        return self.__cards
    
    def set_cards(self,position:int, new_card: ACard) -> None:
        self.__cards.pop(position)
        self.__cards.insert(position,new_card)
        
    def pop_card(self,position:int) -> None:
        return self.__cards.pop(position)
    
    def clear_cards(self)->None:
        self.__cards.clear()
        
    def copy_cardsSet(self)->None:
        return self.__cards.copy()
    
