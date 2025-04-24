from python.shared_games_cards.shared_cards.ACard import ACard
from typing import List

#cette classe est une liste de carte
# elle est utilisée pour les cartes qui sont dans la main du joueur
# elle est utilisée pour les cartes qui sont dans le jeu
class CardsSet():
    def __init__(self,cards: List[ACard]):
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