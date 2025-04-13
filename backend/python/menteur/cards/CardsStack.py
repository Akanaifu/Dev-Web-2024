from typing import List, Dict, Any
from backend.python.menteur.cards.ACard import ACards

#cette classe est une pile de carte, elle contient une liste de carte
# elle est utilisée pour les cartes qui sont posées sur la table
class CardsStack([ACards]):
    def __init__(self, color: str, game: str):
        super().__init__(color, game)
        self.__cards: List[ACards] = []

    def add_card(self, card: ACards) -> None:
        self.__cards.append(card)

    # def remove_card(self, card: ACards):
    #     self.__cards.remove(card)
        #je dois garder les deniers cards dans la pile

    def get_cardsSet(self) -> List[ACards]:
        return self.__cards

    