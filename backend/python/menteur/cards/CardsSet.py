from backend.python.menteur.cards.ACard import ACards
from typing import List, Dict, Any

#cette classe est une liste de carte
# elle est utilisée pour les cartes qui sont dans la main du joueur
# elle est utilisée pour les cartes qui sont dans le jeu
class CardsSet([ACards]):
    def __init__(self, color: str, game: str,cards: List[ACards]):
        super().__init__(color, game)
        self.__cards = cards

    def add_card(self, card: ACards) -> None:
        self.__cards.append(card)

    def remove_card(self, card: ACards)-> None:
        self.__cards.remove(card)

    def get_cardsSet(self) -> List[ACards]:
        return self.__cards
    
    def set_cards(self, cards: List[ACards]) -> None:
        self.__cards = cards